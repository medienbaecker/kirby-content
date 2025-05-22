# Kirby Content

This extension provides syntax highlighting for [Kirby](https://getkirby.com/) content files.

## How It Works

It automatically applies to all `.md` and `.txt` files within the `content` directory and highlights content files that look like this:

```
Title: My Page Title

----

Text: This is some **markdown** content.

----

Date: 2025-05-16
```

For now, I've added tokens for the field names, the values and the separators. Markdown highlighting is also included for the field values.

In the future, I might expand this extension to include things like [KirbyTags](https://getkirby.com/docs/reference/#kirbytags), but for now, I wanted to keep it simple.

## Customization

I tried to choose reasonable names for the scopes:

- `entity.name.tag.fieldname.kirby-content` for field names
- `markup.field.kirby-content` for the field values
- `punctuation.separator.kirby-content` for the `----` separators

This semantic naming already comes with some colours, depending on your theme.

If you want to change the colors, you can do so in your settings.json. I personally like to use a bold green for the field names and a grey for the separators:

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
