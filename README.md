# Kirby Content

Syntax highlighting, smart links, and meta data file creation for [Kirby](https://getkirby.com/) content files.

## Features

### Syntax Highlighting

Automatically highlights `.md` and `.txt` files within the `content` directory that look like this:

```
Title: My Page Title

----

Text: This is some **markdown** content.

----

Date: 2025-05-16
```

Field names, content, and separators (`----`) are highlighted with Markdown syntax support for field values.

### Smart Link Pasting

Select text and paste a URL or email to create links automatically:

- **URL pasting**: `(link: https://example.com text: selected text)`
- **Email pasting**: `(email: hello@example.com text: selected text)`

It's relatively intelligent, for example preventing nested links when pasting over existing links.

### Meta Data File Creation

Right-click any file in your content folder → "Create Meta Data File" to:

- Create an empty meta data file (`image.jpg.txt` or `document.pdf.md`)
- Open it immediately for editing
- Works with any file type (images, PDFs, videos, etc.)

You can find more information about meta data files in the [Kirby docs about "Managing files"](https://getkirby.com/docs/guide/files#adding-meta-data-to-your-files).

## Settings

```json
{
  "kirby-content.automaticLinks": "kirbytags",
  "kirby-content.contentFileExtension": "txt"
}
```

**Link Format**

- `"kirbytags"` (default): `(link: url text: text)`
- `"markdown"`: `[text](url)`
- `false`: Disable automatic links

**Content File Extension**

- `"txt"` (default): Create `.txt` meta data files
- `"md"`: Create `.md` meta data files
- Configure per workspace to match your Kirby site

## Theming

Customize colors with these scopes:

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

- `entity.name.tag.fieldname.kirby-content` - field names
- `markup.field.kirby-content` - field content
- `punctuation.separator.kirby-content` - separators (`----`)
