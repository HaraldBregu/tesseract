import { useCallback } from 'react';
import { writeClipboardItem } from '@/utils/clipboardUtils';
import { Editor } from "@tiptap/core";
import { Node } from 'prosemirror-model';
import { extractSelectionHTML, removeAllStyles, removeCustomElements, removeLinks, removeMainTextCustomElements, removeTagsFromElement } from '../shared/utils';

interface UseMainTextEditorClipboardReturn {
    cut: (editor: Editor) => Promise<void>;
    copy: (editor: Editor) => Promise<void>;
    paste: (editor: Editor) => Promise<void>;
    pasteWithoutFormatting: (editor: Editor) => Promise<void>;
}

export function useMainTextEditorClipboard(): UseMainTextEditorClipboardReturn {

    const cut = useCallback(async (editor: Editor) => {
        const originalHTML = extractSelectionHTML(editor);
        const { state } = editor;
        const { tr, selection } = state;
        const { from, to } = selection;
        const originalText = state.doc.textBetween(from, to, ' ');
        const wrappedHTML = `<main-text-cut-div>${originalHTML}</main-text-cut-div>`;
        await writeClipboardItem(wrappedHTML, originalText);

        const deletions: { from: number, to: number }[] = [];
        state.doc.nodesBetween(from, to, (node: Node, pos: number) => {

            // Keep section dividers intact
            if (node.type.name === 'sectionDivider') {
                return false;
            }

            const nodeFrom = Math.max(pos, from);
            const nodeTo = Math.min(pos + node.nodeSize, to);

            if (nodeFrom < nodeTo) {
                if (node.type.name === 'paragraph' || (node.type.name === 'heading' && node.attrs?.level !== 1)) {

                    if (node.content && node.content.size > 0) {
                        // Calculate the start and end positions of the node content
                        const nodeContentStart = pos + 1;
                        const nodeContentEnd = pos + node.nodeSize - 1;

                        // Calculate intersection between selection and node content
                        const contentDeleteStart = Math.max(nodeContentStart, from);
                        const contentDeleteEnd = Math.min(nodeContentEnd, to);

                        if (contentDeleteStart < contentDeleteEnd) {
                            deletions.push({ from: contentDeleteStart, to: contentDeleteEnd });
                        }
                    }
                } else {
                    deletions.push({ from: nodeFrom, to: nodeTo });
                }
            }

            if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                return false;
            }

            return true;
        });

        deletions
            .toSorted((a, b) => b.from - a.from)
            .forEach((node) => {
                tr.delete(node.from, node.to);
            });

        if (tr.docChanged)
            editor.view.dispatch(tr);

    }, []);

    const copy = useCallback(async (editor: Editor) => {
        const originalHTML = extractSelectionHTML(editor);
        const { from, to } = editor.state.selection;
        const originalText = editor.state.doc.textBetween(from, to, ' ');
        const wrappedHTML = `<main-text-copy-div>${originalHTML}</main-text-copy-div>`;
        await writeClipboardItem(wrappedHTML, originalText);
    }, []);

    const paste = useCallback(async (editor: Editor) => {
        const clipboardItems = await navigator.clipboard.read();
        const textClipboardItem = clipboardItems.find(item => item.types.includes('text/plain'));
        const textType = await textClipboardItem?.getType('text/plain');
        const textContent = await textType?.text();
        const htmlClipboardItem = clipboardItems.find(item => item.types.includes('text/html'));
        const htmlType = await htmlClipboardItem?.getType('text/html');
        let htmlContent = await htmlType?.text();

        if (!textContent && !htmlContent)
            return;

        htmlContent = htmlContent?.replaceAll(/<!--[\s\S]*?-->/g, '') || '';

        const parser = new globalThis.DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        removeTagsFromElement(['section-divider', 'div', 'span'], doc.body);

        const cuttedFromMainTextDiv = doc.querySelector('main-text-cut-div');
        const cuttedFromApparatusTextDiv = doc.querySelector('apparatus-text-cut-div');
        const copiedFromMainTextDiv = doc.querySelector('main-text-copy-div');
        const copiedFromApparatusTextDiv = doc.querySelector('apparatus-text-copy-div');

        editor.commands.unsetBookmark()
        editor.commands.unsetComment()
        editor.commands.unsetTextNote()

        if (cuttedFromMainTextDiv) {
            const cuttedContent = cuttedFromMainTextDiv.innerHTML;
            editor.commands.insertContent(cuttedContent);
            removeLinks(cuttedFromMainTextDiv);
            removeCustomElements(cuttedFromMainTextDiv);
            const innerHTML = doc.body.innerHTML;
            await writeClipboardItem(innerHTML, textContent || '');
            return;
        }

        if (copiedFromMainTextDiv) {
            removeLinks(copiedFromMainTextDiv);
            removeMainTextCustomElements(copiedFromMainTextDiv);
            const copiedContent = copiedFromMainTextDiv.innerHTML;
            editor.commands.insertContent(copiedContent);
            return;
        }

        if (copiedFromApparatusTextDiv) {
            removeLinks(copiedFromApparatusTextDiv);
            removeCustomElements(copiedFromApparatusTextDiv);
            const content = copiedFromApparatusTextDiv.innerHTML;
            editor.commands.insertContent(content);
            return;
        }

        if (cuttedFromApparatusTextDiv) {
            removeLinks(cuttedFromApparatusTextDiv);
            removeCustomElements(cuttedFromApparatusTextDiv);
            const content = cuttedFromApparatusTextDiv.innerHTML;
            editor.commands.insertContent(content);
            return;
        }

        let cleanedTextContent = textContent?.replaceAll(/\r?\n/g, '');

        editor.commands.insertContent(cleanedTextContent || htmlContent);
    }, []);

    const pasteWithoutFormatting = useCallback(async (editor: Editor) => {
        const clipboardItems = await navigator.clipboard.read();
        const textClipboardItem = clipboardItems.find(item => item.types.includes('text/plain'));
        const textType = await textClipboardItem?.getType('text/plain');
        const textContent = await textType?.text();

        const htmlClipboardItem = clipboardItems.find(item => item.types.includes('text/html'));
        const htmlType = await htmlClipboardItem?.getType('text/html');
        let htmlContent = await htmlType?.text();

        if (!textContent && !htmlContent)
            return;

        htmlContent = htmlContent?.replaceAll(/<!--[\s\S]*?-->/g, '') || '';

        const parser = new globalThis.DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        removeTagsFromElement(['section-divider', 'div', 'span'], doc.body);

        const cuttedFromMainTextDiv = doc.querySelector('main-text-cut-div');
        const cuttedFromApparatusTextDiv = doc.querySelector('apparatus-text-cut-div');
        const copiedFromMainTextDiv = doc.querySelector('main-text-copy-div');
        const copiedFromApparatusTextDiv = doc.querySelector('apparatus-text-copy-div');

        if (cuttedFromMainTextDiv) {
            removeAllStyles(cuttedFromMainTextDiv);
            const cuttedContent = cuttedFromMainTextDiv.innerHTML;
            editor.commands.insertContent(cuttedContent);
            return;
        }

        if (copiedFromMainTextDiv) {
            removeAllStyles(copiedFromMainTextDiv);
            const copiedContent = copiedFromMainTextDiv.innerHTML;
            editor.commands.insertContent(copiedContent);
            return;
        }

        if (copiedFromApparatusTextDiv) {
            removeAllStyles(copiedFromApparatusTextDiv);
            const cuttedContent = copiedFromApparatusTextDiv.innerHTML;
            editor.commands.insertContent(cuttedContent);
            return;
        }

        if (cuttedFromApparatusTextDiv) {
            removeAllStyles(cuttedFromApparatusTextDiv);
            const cuttedContent = cuttedFromApparatusTextDiv.innerHTML;
            editor.commands.insertContent(cuttedContent);
            return;
        }

        editor.commands.insertContent(textContent?.replaceAll(/\r?\n/g, "") || htmlContent);
    }, []);

    return {
        cut,
        copy,
        paste,
        pasteWithoutFormatting,
    };
} 
