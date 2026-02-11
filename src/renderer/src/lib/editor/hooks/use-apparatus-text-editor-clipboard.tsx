import { writeClipboardItem } from "@/utils/clipboardUtils";
import { Editor } from "@tiptap/core";
import { useCallback } from "react";
import { canDeleteSelection, extractSelectionHTML, removeAllStyles, removeApparatusCustomElements, removeBreaks, removeCustomElements, removeLinks, removeParagraphAndHeadings, selectParagraphsOnly } from "../shared/utils";

interface UseApparatusTextEditorClipboardReturn {
    cut: (editor: Editor) => Promise<void>;
    copy: (editor: Editor) => Promise<void>;
    paste: (editor: Editor) => Promise<void>;
    pasteWithoutFormatting: (editor: Editor) => Promise<void>;
}

export function useApparatusTextEditorClipboard(): UseApparatusTextEditorClipboardReturn {

    const cut = useCallback(async (editor: Editor) => {
        const originalHTML = extractSelectionHTML(editor);
        const { from, to } = editor.state.selection;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        const lemmaNodes = tempDiv.querySelectorAll('lemma');
        lemmaNodes.forEach(node => node.parentNode?.removeChild(node));
        const filteredHTML = tempDiv.innerHTML;
        const originalText = editor.state.doc.textBetween(from, to, ' ');

        const canDelete = canDeleteSelection({ preventDeleteIfContains: ['lemma', 'button'] })({ state: editor.state })

        if (canDelete) {
            const wrappedHTML = `<apparatus-text-cut-div>${filteredHTML}</apparatus-text-cut-div>`;
            await writeClipboardItem(wrappedHTML, originalText);
            editor.commands.deleteSelection();
        } else {
            copy(editor);
        }
    }, []);

    const copy = useCallback(async (editor: Editor) => {
        const originalHTML = extractSelectionHTML(editor);
        const { from, to } = editor.state.selection;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        const lemmaNodes = tempDiv.querySelectorAll('lemma');
        lemmaNodes.forEach(node => node.parentNode?.removeChild(node));
        const filteredHTML = tempDiv.innerHTML;
        const originalText = editor.state.doc.textBetween(from, to, ' ');

        const wrappedHTML = `<apparatus-text-copy-div>${filteredHTML}</apparatus-text-copy-div>`;
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

        htmlContent = htmlContent?.replace(/<!--[\s\S]*?-->/g, '') || '';

        const parser = new window.DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const cuttedFromMainTextDiv = doc.querySelector('main-text-cut-div');
        const cuttedFromApparatusTextDiv = doc.querySelector('apparatus-text-cut-div');
        const copiedFromMainTextDiv = doc.querySelector('main-text-copy-div');
        const copiedFromApparatusTextDiv = doc.querySelector('apparatus-text-copy-div');

        if (cuttedFromMainTextDiv) {
            removeParagraphAndHeadings(cuttedFromMainTextDiv);
            removeLinks(cuttedFromMainTextDiv);
            removeBreaks(cuttedFromMainTextDiv);
            removeCustomElements(cuttedFromMainTextDiv);
            const content = cuttedFromMainTextDiv.innerHTML;
            editor.commands.insertContent(content);
            return;
        }

        if (copiedFromMainTextDiv) {
            removeParagraphAndHeadings(copiedFromMainTextDiv);
            removeLinks(copiedFromMainTextDiv);
            removeBreaks(copiedFromMainTextDiv);
            removeCustomElements(copiedFromMainTextDiv);
            const content = copiedFromMainTextDiv.innerHTML;
            editor.commands.insertContent(content);
            return;
        }

        if (copiedFromApparatusTextDiv) {
            removeLinks(copiedFromApparatusTextDiv);
            removeApparatusCustomElements(copiedFromApparatusTextDiv);
            selectParagraphsOnly(copiedFromApparatusTextDiv);
            removeParagraphAndHeadings(copiedFromApparatusTextDiv);
            const content = copiedFromApparatusTextDiv.innerHTML;
            editor.commands.insertContent(content);
            return;
        }

        if (cuttedFromApparatusTextDiv) {
            selectParagraphsOnly(cuttedFromApparatusTextDiv);
            removeParagraphAndHeadings(cuttedFromApparatusTextDiv);
            const content = cuttedFromApparatusTextDiv.innerHTML;
            editor.commands.insertContent(content)
            removeLinks(cuttedFromApparatusTextDiv);
            removeCustomElements(cuttedFromApparatusTextDiv);
            const innerHTML = doc.body.innerHTML
            writeClipboardItem(innerHTML, textContent || '')
            return
        }

        editor.commands.insertContent(textContent?.replace(/\r?\n/g, "") || htmlContent);
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

        htmlContent = htmlContent?.replace(/<!--[\s\S]*?-->/g, '') || '';

        const parser = new window.DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const cuttedFromMainTextDiv = doc.querySelector('main-text-cut-div');
        const cuttedFromApparatusTextDiv = doc.querySelector('apparatus-text-cut-div');
        const copiedFromMainTextDiv = doc.querySelector('main-text-copy-div');
        const copiedFromApparatusTextDiv = doc.querySelector('apparatus-text-copy-div');

        if (cuttedFromMainTextDiv) {
            removeParagraphAndHeadings(cuttedFromMainTextDiv);
            removeAllStyles(cuttedFromMainTextDiv);
            const cuttedContent = cuttedFromMainTextDiv.innerHTML;
            editor.commands.insertContent(cuttedContent);
            return;
        }

        if (copiedFromMainTextDiv) {
            removeParagraphAndHeadings(copiedFromMainTextDiv);
            removeAllStyles(copiedFromMainTextDiv);
            const copiedContent = copiedFromMainTextDiv.innerHTML;
            editor.commands.insertContent(copiedContent);
            return;
        }

        if (copiedFromApparatusTextDiv) {
            removeCustomElements(copiedFromApparatusTextDiv);
            selectParagraphsOnly(copiedFromApparatusTextDiv);
            removeParagraphAndHeadings(copiedFromApparatusTextDiv);
            removeAllStyles(copiedFromApparatusTextDiv);
            const cuttedContent = copiedFromApparatusTextDiv.innerHTML;
            editor.commands.insertContent(cuttedContent);
            return;
        }

        if (cuttedFromApparatusTextDiv) {
            removeCustomElements(cuttedFromApparatusTextDiv);
            selectParagraphsOnly(cuttedFromApparatusTextDiv);
            removeParagraphAndHeadings(cuttedFromApparatusTextDiv);
            removeAllStyles(cuttedFromApparatusTextDiv);
            const cuttedContent = cuttedFromApparatusTextDiv.innerHTML;
            editor.commands.insertContent(cuttedContent);
            return;
        }

        editor.commands.insertContent(textContent?.replace(/\r?\n/g, "") || "");
    }, []);

    return {
        cut,
        copy,
        paste,
        pasteWithoutFormatting,
    };
}