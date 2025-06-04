"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
class KirbyContentPasteProvider {
    async provideDocumentPasteEdits(document, ranges, dataTransfer) {
        const textData = dataTransfer.get('text/plain');
        const pastedText = textData?.value.trim();
        const range = ranges[0];
        // Nothing to work with
        if (!pastedText || !range || range.isEmpty)
            return;
        const selectedText = document.getText(range).trim();
        if (!selectedText)
            return;
        const config = vscode.workspace.getConfiguration('kirby-content');
        const useKirbytags = config.get('linkStyle') === 'kirbytags';
        // Check if it looks like a URL
        if (/^https?:\/\/\S+$/.test(pastedText)) {
            const linkText = useKirbytags
                ? `(link: ${pastedText} text: ${selectedText})`
                : `[${selectedText}](${pastedText})`;
            const title = useKirbytags ? 'Link Kirbytag' : 'Markdown Link';
            return [new vscode.DocumentPasteEdit(linkText, title, vscode.DocumentDropOrPasteEditKind.Empty.append('text', useKirbytags ? 'kirbytag' : 'markdown', 'link'))];
        }
        // Check if it's an email
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pastedText)) {
            const linkText = useKirbytags
                ? `(email: ${pastedText} text: ${selectedText})`
                : `[${selectedText}](mailto:${pastedText})`;
            const title = useKirbytags ? 'Email Kirbytag' : 'Email Link';
            return [new vscode.DocumentPasteEdit(linkText, title, vscode.DocumentDropOrPasteEditKind.Empty.append('text', useKirbytags ? 'kirbytag' : 'markdown', 'link'))];
        }
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