import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

class KirbyContentPasteProvider implements vscode.DocumentPasteEditProvider {
    async provideDocumentPasteEdits(
        document: vscode.TextDocument,
        ranges: readonly vscode.Range[],
        dataTransfer: vscode.DataTransfer
    ): Promise<vscode.DocumentPasteEdit[] | undefined> {
        const textData = dataTransfer.get('text/plain');
        const pastedText = textData?.value.trim();
        const range = ranges[0];
        
        if (!pastedText || !range || range.isEmpty) return;

        const isUrl = /^https?:\/\/\S+$/.test(pastedText);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pastedText);
        
        if (!isUrl && !isEmail) return;

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
        const linkMode = config.get<string | boolean>('automaticLinks');
        
        if (linkMode === false) {
            return undefined;
        }

        // Create new link from selected text
        const selectedText = document.getText(range).trim();
        const useKirbytags = linkMode === 'kirbytags';

        if (isUrl) {
            if (selectedText && /^https?:\/\/\S+$/.test(selectedText)) {
                return [new vscode.DocumentPasteEdit(
                    pastedText,
                    'Replace URL',
                    vscode.DocumentDropOrPasteEditKind.Empty.append('text', 'plain')
                )];
            }
            
            const linkText = useKirbytags 
                ? `(link: ${pastedText} text: ${selectedText})`
                : `[${selectedText}](${pastedText})`;
            const title = useKirbytags ? 'Link Kirbytag' : 'Markdown Link';
            
            return [new vscode.DocumentPasteEdit(
                linkText,
                title,
                vscode.DocumentDropOrPasteEditKind.Empty.append('text', useKirbytags ? 'kirbytag' : 'markdown', 'link')
            )];
        }
        
        if (isEmail) {
            const linkText = useKirbytags
                ? `(email: ${pastedText} text: ${selectedText})`
                : `[${selectedText}](mailto:${pastedText})`;
            const title = useKirbytags ? 'Email Kirbytag' : 'Email Link';
            
            return [new vscode.DocumentPasteEdit(
                linkText,
                title,
                vscode.DocumentDropOrPasteEditKind.Empty.append('text', useKirbytags ? 'kirbytag' : 'markdown', 'link')
            )];
        }
    }

    private findMarkdownLinkContext(lineText: string, selStart: number, selEnd: number) {
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

    private findKirbytagContext(lineText: string, selStart: number, selEnd: number) {
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

export function activate(context: vscode.ExtensionContext) {
    const provider = new KirbyContentPasteProvider();
    
    context.subscriptions.push(
        vscode.languages.registerDocumentPasteEditProvider(
            { language: 'kirby-content' },
            provider,
            {
                providedPasteEditKinds: [
                    vscode.DocumentDropOrPasteEditKind.Empty.append('text', 'markdown', 'link'),
                    vscode.DocumentDropOrPasteEditKind.Empty.append('text', 'kirbytag', 'link')
                ],
                pasteMimeTypes: ['text/plain']
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('kirby-content.createMetadataFile', async (uri: vscode.Uri) => {
            if (!uri) {
                vscode.window.showErrorMessage('No file selected');
                return;
            }

            const filePath = uri.fsPath;
            const dir = path.dirname(filePath);
            const fileName = path.basename(filePath);
            const fileExtension = path.extname(filePath).toLowerCase().slice(1);
            
            const config = vscode.workspace.getConfiguration('kirby-content');
            const contentExtension = config.get<string>('contentFileExtension', 'txt');
            
            if (fileExtension === contentExtension) {
                vscode.window.showErrorMessage(`Cannot create meta data files for .${contentExtension} files`);
                return;
            }
            
            const metadataFileName = `${fileName}.${contentExtension}`;
            const metadataFilePath = path.join(dir, metadataFileName);
            
            if (fs.existsSync(metadataFilePath)) {
                const doc = await vscode.workspace.openTextDocument(metadataFilePath);
                await vscode.window.showTextDocument(doc);
                return;
            }
            
            try {
                fs.writeFileSync(metadataFilePath, '');
                
                const doc = await vscode.workspace.openTextDocument(metadataFilePath);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to create meta data file: ${error}`);
            }
        })
    );
}

export function deactivate() {}
