import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'yaml';

let presetData: any = {};

async function loadPresets() {
    const presetUris = await vscode.workspace.findFiles('**/presets.yaml');
    presetData = {};
    for (const uri of presetUris) {
        try {
            console.log('[EXT] Loading preset from:', uri.fsPath);
            const presetText = fs.readFileSync(uri.fsPath, 'utf-8');
            const data = yaml.parse(presetText);
            presetData = { ...presetData, ...data };
        } catch (err) {
            console.error('[EXT] Failed to load preset:', uri.fsPath, err);
        }
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

                await loadPresets();

                const lineText = document.lineAt(position).text;
                const cursorPos = position.character;
                const beforeCursor = lineText.substring(0, cursorPos);

                const match = beforeCursor.match(/\{\{\s*([a-zA-Z0-9_.-]*)$/);
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
                        typeof val === 'object' ? vscode.CompletionItemKind.Field : vscode.CompletionItemKind.Value,
                    );

                    let insertText = new vscode.SnippetString(`${key}`);
                    item.detail = `Path: ${['default', ...parts].join('.')}`;
                    if (typeof val !== 'object') {
                        item.detail = String(val);
                        insertText = new vscode.SnippetString(`${key} `);
                    } else {
                        insertText = new vscode.SnippetString(`${key}.`);
                        item.command = {
                            title: 'Trigger Suggest',
                            command: 'editor.action.triggerSuggest',
                        };
                    }
                    item.insertText = insertText;
                    return item;
                });

                console.log(
                    '[EXT] Suggestions:',
                    suggestions.map((s) => s.label),
                );
                return suggestions;
            },
        },
        '.',
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || event.document !== editor.document) return;

            const change = event.contentChanges[0];
            if (!change || change.text !== ' ') return;

            const position = change.range.end;
            const line = event.document.lineAt(position.line).text;
            const beforeCursor = line.slice(0, position.character);

            if (/\{\{\s*([a-zA-Z0-9_.-]*)$/.test(beforeCursor)) {
                vscode.commands.executeCommand('editor.action.triggerSuggest');
            }
        }),
    );

    context.subscriptions.push(provider);
}

export function deactivate() {
    console.log('[EXT] Extension deactivated');
}
