"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
class KirbyContentPasteProvider {
    async provideDocumentPasteEdits(document, ranges, dataTransfer) {
        const textData = dataTransfer.get('text/plain');
        const pastedText = textData?.value.trim();
        const range = ranges[0];
        if (!pastedText || !range || range.isEmpty)
            return;
        const isUrl = /^https?:\/\/\S+$/.test(pastedText);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pastedText);
        if (!isUrl && !isEmail)
            return;
        const line = document.lineAt(range.start.line);
        const lineText = line.text;
        const selectionStart = range.start.character;
        const selectionEnd = range.end.character;
        // Don't create nested links
        const markdownLinkMatch = this.findMarkdownLinkContext(lineText, selectionStart, selectionEnd);
        const kirbytagMatch = this.findKirbytagContext(lineText, selectionStart, selectionEnd);
        if (markdownLinkMatch || kirbytagMatch) {
            return undefined;
        }
        // Check if automatic links are enabled
        const config = vscode.workspace.getConfiguration('kirby-content');
        const linkMode = config.get('automaticLinks');
        if (linkMode === false) {
            return undefined;
        }
        // Create new link from selected text
        const selectedText = document.getText(range).trim();
        const useKirbytags = linkMode === 'kirbytags';
        if (isUrl) {
            const linkText = useKirbytags
                ? `(link: ${pastedText} text: ${selectedText})`
                : `[${selectedText}](${pastedText})`;
            const title = useKirbytags ? 'Link Kirbytag' : 'Markdown Link';
            return [new vscode.DocumentPasteEdit(linkText, title, vscode.DocumentDropOrPasteEditKind.Empty.append('text', useKirbytags ? 'kirbytag' : 'markdown', 'link'))];
        }
        if (isEmail) {
            const linkText = useKirbytags
                ? `(email: ${pastedText} text: ${selectedText})`
                : `[${selectedText}](mailto:${pastedText})`;
            const title = useKirbytags ? 'Email Kirbytag' : 'Email Link';
            return [new vscode.DocumentPasteEdit(linkText, title, vscode.DocumentDropOrPasteEditKind.Empty.append('text', useKirbytags ? 'kirbytag' : 'markdown', 'link'))];
        }
    }
    findMarkdownLinkContext(lineText, selStart, selEnd) {
        // Detect markdown links: [text](url)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        while ((match = linkRegex.exec(lineText)) !== null) {
            const linkStart = match.index;
            const linkEnd = match.index + match[0].length;
            if (selStart >= linkStart && selEnd <= linkEnd) {
                return {
                    start: linkStart,
                    end: linkEnd,
                    text: match[1],
                    url: match[2]
                };
            }
        }
        return null;
    }
    findKirbytagContext(lineText, selStart, selEnd) {
        // Detect any kirbytag: (tagname: content)
        const kirbytagRegex = /\(([a-zA-Z][a-zA-Z0-9]*):([^)]+)\)/g;
        let match;
        while ((match = kirbytagRegex.exec(lineText)) !== null) {
            const tagStart = match.index;
            const tagEnd = match.index + match[0].length;
            if (selStart >= tagStart && selEnd <= tagEnd) {
                return {
                    start: tagStart,
                    end: tagEnd,
                    tagName: match[1],
                    content: match[2].trim()
                };
            }
        }
        return null;
    }
}
function activate(context) {
    const provider = new KirbyContentPasteProvider();
    context.subscriptions.push(vscode.languages.registerDocumentPasteEditProvider({ language: 'kirby-content' }, provider, {
        providedPasteEditKinds: [
            vscode.DocumentDropOrPasteEditKind.Empty.append('text', 'markdown', 'link'),
            vscode.DocumentDropOrPasteEditKind.Empty.append('text', 'kirbytag', 'link')
        ],
        pasteMimeTypes: ['text/plain']
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map