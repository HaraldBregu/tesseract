export interface EditorContentElement {
    type: () => "MAIN_TEXT" | "APPARATUSES";
    undo: () => void;
    redo: () => void;

    setFontFamily: (fontFamily: string) => void;
    setFontSize: (fontSize: string) => void;

    setSuperscript: (superscript: boolean) => void;
    setSubscript: (subscript: boolean) => void;

    setBold: (bold: boolean) => void;
    setItalic: (italic: boolean) => void;
    setUnderline: (underline: boolean) => void;
    setStrikeThrough: (strikeThrough: boolean) => void;

    setTextColor: (textColor: string) => void;
    setHighlightColor: (highlightColor: string) => void;

    setShowNonPrintingCharacters: (visible: boolean) => void;

    addComment: (color: string, categoryId?: string) => void;
    unsetCommentsWithIds: (ids: string[]) => void;

    addSiglum: (siglum: Siglum) => void;

    insertCharacter: (character: number) => void;

    cut: () => void;
    copy: () => void;
    copyStyle: () => void;
    paste: () => void;
    pasteStyle: () => void;
    pasteWithoutFormatting: () => void;

    selectAll: () => void;
    deselectAll: () => void;
    deleteSelection: () => void;
}

export type FileTemplate = {
  filename: string;
  template: Template;
}