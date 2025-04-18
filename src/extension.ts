import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

let presetData: any = {};

async function loadPresets(workspaceRoot: string) {
    const cfgPath = path.join(workspaceRoot, 'cfg.yaml');
    if (!fs.existsSync(cfgPath)) {
        console.log('[EXT] cfg.yaml not found at:', cfgPath);
        return;
    }

    console.log('[EXT] Loading cfg.yaml from:', cfgPath);
    const cfgText = fs.readFileSync(cfgPath, 'utf-8');
    const cfg = yaml.parse(cfgText);
    const presetPaths: string[] = cfg?.var?.presets || [];

    console.log('[EXT] Found preset paths in cfg.yaml:', presetPaths);
    presetData = {};

    for (const presetRelPath of presetPaths) {
        const presetPath = path.resolve(workspaceRoot, presetRelPath);
        if (!fs.existsSync(presetPath)) {
            console.log('[EXT] Skipping missing preset:', presetPath);
            continue;
        }

        console.log('[EXT] Loading preset:', presetPath);
        const presetText = fs.readFileSync(presetPath, 'utf-8');
        const data = yaml.parse(presetText);

        presetData = { ...presetData, ...data };
    }

    console.log('[EXT] Final merged presetData:', JSON.stringify(presetData, null, 2));
}

function getNestedKeys(obj: any, pathParts: string[]): any {
    let current = obj;
    for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return null;
        }
    }
    return current;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('[EXT] Extension activated');

    const provider = vscode.languages.registerCompletionItemProvider(
        { language: 'markdown' },
        {
            async provideCompletionItems(document, position) {
                console.log('[EXT] provideCompletionItems triggered');

                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders) {
                    console.log('[EXT] No workspace folders found');
                    return [];
                }

                const root = workspaceFolders[0].uri.fsPath;
                await loadPresets(root);

                const lineText = document.lineAt(position).text;
                const cursorPos = position.character;
                const beforeCursor = lineText.substring(0, cursorPos);

                // Match something like {{ User.Interface. (or even incomplete)
                const match = beforeCursor.match(/\{\{\s*([\w.]*)$/);
                if (!match) {
                    console.log('[EXT] Not inside a {{...}} expression');
                    return [];
                }

                const input = match[1] || '';
                const parts = input.split('.').filter(Boolean);
                console.log('[EXT] Parsed input:', input);
                console.log('[EXT] Parts:', parts);

                const base = presetData['default'];
                const contextObj = getNestedKeys(base, parts);

                if (!contextObj || typeof contextObj !== 'object') {
                    console.log('[EXT] No context object found or it is not an object');
                    return [];
                }

                const suggestions = Object.entries(contextObj).map(([key, val]) => {
                    const item = new vscode.CompletionItem(
                        key,
                        typeof val === 'object'
                            ? vscode.CompletionItemKind.Field
                            : vscode.CompletionItemKind.Value
                    );
                    item.detail = `Path: ${['default', ...parts].join('.')}`;
                    if (typeof val !== 'object') {
                        item.documentation = String(val);
                    }
                    return item;
                });

                console.log('[EXT] Suggestions:', suggestions.map(s => s.label));
                return suggestions;
            }
        },
        '.' // Trigger completions after "."
    );

    context.subscriptions.push(provider);
}

export function deactivate() {
    console.log('[EXT] Extension deactivated');
}
