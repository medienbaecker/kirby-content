# Kirby Content

Syntax highlighting and link helpers for [Kirby](https://getkirby.com/) content files.

## Syntax Highlighting

It automatically applies to all `.md` and `.txt` files within the `content` directory and highlights content files that look like this:

```
Title: My Page Title

----

Text: This is some **markdown** content.

----

Date: 2025-05-16
```

For now, I've added tokens for the field names, the values and the separators. Markdown highlighting is also included for the field values.

### Theming

Want to customize colors? Here are the scopes:

- `entity.name.tag.fieldname.kirby-content` - field names
- `markup.field.kirby-content` - field content
- `punctuation.separator.kirby-content` - those `----` lines

Example:

```json
"editor.tokenColorCustomizations": {
  "textMateRules": [
    {
      "scope": "entity.name.tag.fieldname.kirby-content",
      "settings": {
        "foreground": "#a8d352",
        "fontStyle": "bold"
      }
    },
    {
      "scope": "punctuation.separator.kirby-content",
      "settings": {
        "foreground": "#808080"
      }
    }
  ]
}
```

## Smart link pasting

When you select some text and paste a URL or email address, it automatically converts the selected text into a link.

- **Markdown** (default): `[text](url)` or `[text](mailto:email)`
- **Kirbytags**: `(link: url text: text)` or `(email: email text: text)`

## Settings

Change the link format:

```json
{
  "kirby-content.linkStyle": "kirbytags" // default: "markdown"
}
```
