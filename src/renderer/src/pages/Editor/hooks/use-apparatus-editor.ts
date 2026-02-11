import { HTMLApparatusTextEditorElement } from "@/lib/editor/apparatus-text-editor";
import { useCallback } from "react";

export interface UseApparatusEditorReturn {
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
    selectAll: () => void;
    deselectAll: () => void;
    deleteSelection: () => void;
    setLink: (link: string) => void;
    cut: () => void;
    copy: () => void;
    paste: () => void;
    pasteWithoutFormatting: () => void;
}

export const useApparatusEditor = (editorRef: React.RefObject<HTMLApparatusTextEditorElement | null>): UseApparatusEditorReturn => {

    const setFontFamily = useCallback((fontFamily: string) => {
        editorRef.current?.setFontFamily(fontFamily);
    }, [editorRef.current])

    const setFontSize = useCallback((fontSize: string) => {
        editorRef.current?.setFontSize(fontSize);
    }, [editorRef.current])

    const setSuperscript = useCallback((superscript: boolean) => {
        editorRef.current?.setSuperscript(superscript);
    }, [editorRef.current])

    const setSubscript = useCallback((subscript: boolean) => {
        editorRef.current?.setSubscript(subscript);
    }, [editorRef.current])

    const setBold = useCallback((bold: boolean) => {
        editorRef.current?.setBold(bold);
    }, [editorRef.current])

    const setItalic = useCallback((italic: boolean) => {
        editorRef.current?.setItalic(italic);
    }, [editorRef.current])

    const setUnderline = useCallback((underline: boolean) => {
        editorRef.current?.setUnderline(underline);
    }, [editorRef.current])

    const setStrikeThrough = useCallback((value: boolean) => {
        editorRef.current?.setStrikeThrough(value);
    }, [editorRef.current])

    const setTextColor = useCallback((textColor: string) => {
        editorRef.current?.setTextColor(textColor);
    }, [editorRef.current])

    const setHighlightColor = useCallback((highlightColor: string) => {
        editorRef.current?.setHighlightColor(highlightColor);
    }, [editorRef.current])

    const undo = useCallback(() => {
        editorRef.current?.undo();
    }, [editorRef.current])

    const redo = useCallback(() => {
        editorRef.current?.redo();
    }, [editorRef.current])

    const selectAll = useCallback(() => {
        editorRef.current?.selectAll();
    }, [editorRef.current])

    const deselectAll = useCallback(() => {
        editorRef.current?.deselectAll();
    }, [editorRef.current])

    const deleteSelection = useCallback(() => {
        editorRef.current?.deleteSelection();
    }, [editorRef.current])

    const setLink = useCallback((url: string) => {
        editorRef.current?.setLink(url);
    }, [editorRef.current])

    const cut = useCallback(() => {
        editorRef.current?.cut();
    }, [editorRef.current])

    const copy = useCallback(() => {
        editorRef.current?.copy();
    }, [editorRef.current])

    const paste = useCallback(() => {
        editorRef.current?.paste();
    }, [editorRef.current])

    const pasteWithoutFormatting = useCallback(() => {
        editorRef.current?.pasteWithoutFormatting();
    }, [editorRef.current])

    return {
        undo,
        redo,
        setFontFamily,
        setFontSize,
        setSuperscript,
        setSubscript,
        setBold,
        setItalic,
        setUnderline,
        setStrikeThrough,
        setTextColor,
        setHighlightColor,
        selectAll,
        deselectAll,
        deleteSelection,
        setLink,
        cut,
        copy,
        paste,
        pasteWithoutFormatting,
    }
}