import { Content, Editor, HTMLContent, JSONContent } from "@tiptap/core";


export interface HTMLTextEditorElement {
    name: string,
    editor: Editor;
    setTextColor: (color: string) => void;
    setHighlightColor: (color: string) => void;

    undo: () => void;
    redo: () => void;

    cut: () => void;
    copy: () => void;
    paste: () => void;
    pasteWithoutFormatting: () => void;

    selectAll: () => void;
    deselectAll: () => void;
    deleteSelection: () => void;

    getJSON: (styles: Style[]) => JSONContent;
    getHTML: () => HTMLContent;
    setContent: (json: Content) => void;
}
