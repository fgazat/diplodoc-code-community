# Diplodoc community extension README

Плагин с поддержкой сниппетов [Diplodoc](https://diplodoc.com/ru/) и автокомплита
[переменных](https://diplodoc.com/docs/ru/syntax/vars) из `presets.yaml`.

## Сниппеты

| Префикс для триггера                    | Блок сниппета                                                      |
| --------------------------------------- | ------------------------------------------------------------------ |
| примечание, заметка, note, инфо         | `{% note info %}...`                                               |
| совет, подсказка, тип, tip              | `{% note tip %}...`                                                |
| важно, предупреждение, варнинг, warning | `{% note warning %}...`                                            |
| внимание, алерт, осторожно, alert       | `{% note alert %}...`                                              |
| заметка, кастомзаметка, своя, note      | `{% note info \"${1:Title}\" %}...`                                |
| кат, свернуть, скрыть, cut              | `{% cut "${1:Title}" %}...`                                        |
| таб, табы, вкладки, tabs                | `{% list tabs %}...`                                               |
| баттон, радио, радиобаттоны, radio      | `{% list tabs radio %}...`                                         |
| аккордеон, список, раскрыть, accordion  | `{% list tabs accordion %}...`                                     |
| ссылка, линк, url, link,                | `[${1:текст_ссылки}](${2:ссылка})`                                 |
| картинка, изображение, фото, image      | `![${1:alt-текст}](_images/${2:image.png} =100x)`                  |
| коммент, комментарий, заметка, comment  | `{% if comment == \"${1:Release}\" %}`                             |
| локаль, язык, блокЛокаль, locale        | `{% if locale == '${1:вставь_переменную}' %}`                      |
| переменная, вар, variable, var          | `{{ $1 }}`                                                         |
| def, popup, term, определение, попап    | `[${1:термин}](*${2:ключ термина})`                                |
| include, инклюд, вставка, подключить    | `{% include notitle [${1:описание}](${2:../}_includes/$3) %}`      |
| video, видео, ролик, vid                | `@[${1:название_видеохостинга}](${2:id_видео_или_ссылка_на_него})` |
| таблица, табличка, многострочная, table | `#\| ... \|#` — мультистрочная таблица                             |
| metadata, метаданные, мета, seo         | `---...--- ` — meta информация                                     |

Список всех сниппетов: [snippets](https://github.com/fgazat/diplodoc-code-community/blob/master/snippets/markdown.json)

## Требования

vscode 1.95.0 и выше

## Известные проблемы

- Если прервать выбор саджеста, повторный вызов автокомплита не показывает ничего.

## Release Notes

### 0.0.4

Обновлена инструкция.

### 0.0.1

Initial release of extension
