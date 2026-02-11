import { HTMLMainTextEditorElement } from "@/lib/editor/main-text-editor";
import { LigatureType } from "@/lib/tiptap/ligature-mark";
import { FocusPosition } from "@tiptap/core";
import { useCallback } from "react";

export interface UseContentEditorReturn {
    unsetNoteWithId: (id: string) => void;
    removeNoteWithIds: (ids: string[]) => void;
    scrollToNoteWithId: (id: string) => void;
    focus: (position?: FocusPosition) => void;
    undo: () => void;
    redo: () => void;
    cut: () => void;
    copy: () => void;
    paste: () => void;
    pasteWithoutFormatting: () => void;
    setHeading: (style: Style) => void;
    setBody: (style?: Style) => void;
    setCustomStyle: (style: any) => void;
    setTextAlignment: (alignment: Alignment) => void;
    setFontFamily: (fontFamily: string) => void;
    setFontSize: (fontSize: string) => void;
    setBold: (bold: boolean) => void;
    setItalic: (italic: boolean) => void;
    setUnderline: (underline: boolean) => void;
    setStrikeThrough: (strikeThrough: boolean) => void;
    setTextColor: (textColor: string) => void;
    setHighlightColor: (highlightColor: string) => void;
    setBlockquote: (blockquote: boolean) => void;
    setLineSpacing: (spacing: Spacing) => void;
    setListStyle: (style: ListStyle) => void;
    setListNumbering: (numbering: number) => void;
    getSuggestedStartNumber: () => { number: number; listType: OrderedListType } | null;
    setSuperscript: (superscript: boolean) => void;
    setSubscript: (subscript: boolean) => void;
    increaseIndent: () => void;
    decreaseIndent: () => void;
    continuePreviousNumbering: () => void;
    scrollToBookmark: (id: string) => void;
    unsetBookmarksWithIds: (ids: string[]) => void;
    scrollToComment: (comment: AppComment) => void;
    unsetCommentsWithIds: (ids: string[]) => void;
    getCommentsIds: () => string[];
    scrollToHeadingIndex: (index: number, sectionType?: string) => void;
    scrollToSection: (id?: string, position?: 'top' | 'bottom') => void;
    insertCharacter: (character: number) => void;
    setLink: (url: string) => void;
    removeLink: () => void;
    deleteSelection: () => void;
    selectAll: () => void;
    deselectAll: () => void;
    setCase: (caseType: CasingType) => void;
    insertCitation: (citationStyle: CITATION_STYLES, citation: BibReference, style: Style, isBibliographySection: boolean) => void;
    setLigature: (ligature: LigatureType) => void;
    unsetCharacterSpacing: () => void;
    increaseCharacterSpacing: () => void;
    decreaseCharacterSpacing: () => void;
}

export const useContentEditor = (editorRef: React.RefObject<HTMLMainTextEditorElement | null>): UseContentEditorReturn => {

    const focus = useCallback((position?: FocusPosition) => {
        editorRef.current?.focus(position);
    }, [editorRef.current])

    const undo = useCallback(() => {
        editorRef.current?.undo();
    }, [editorRef.current])

    const redo = useCallback(() => {
        editorRef.current?.redo();
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

    const setHeading = useCallback((style: Style) => {
        editorRef.current?.setHeading(style);
    }, [editorRef.current])

    const setBody = useCallback((style?: Style) => {
        editorRef.current?.setBody(style);
    }, [editorRef.current])

    const setCustomStyle = useCallback((style: any) => {
        editorRef.current?.setCustomStyle(style);
        setTimeout(() => {
            editorRef.current?.focus();
        }, 100);
    }, [editorRef.current]);

    const setTextAlignment = useCallback((alignment: Alignment) => {
        editorRef.current?.setTextAlignment(alignment);
    }, [editorRef.current])

    const setFontFamily = useCallback((fontFamily: string) => {
        editorRef.current?.setFontFamily(fontFamily);
    }, [editorRef.current])

    const setFontSize = useCallback((fontSize: string) => {
        editorRef.current?.setFontSize(fontSize);
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

    const setStrikeThrough = useCallback((strikeThrough: boolean) => {
        editorRef.current?.setStrikeThrough(strikeThrough);
    }, [editorRef.current])

    const setTextColor = useCallback((textColor: string) => {
        editorRef.current?.setTextColor(textColor);
    }, [editorRef.current])

    const setHighlightColor = useCallback((highlightColor: string) => {
        editorRef.current?.setHighlightColor(highlightColor);
    }, [editorRef.current])

    const setBlockquote = useCallback((blockquote: boolean) => {
        editorRef.current?.setBlockquote(blockquote);
    }, [editorRef.current])

    const setLineSpacing = useCallback((spacing: Spacing) => {
        editorRef.current?.setLineSpacing(spacing);
    }, [editorRef.current])

    const setListStyle = useCallback((style: ListStyle) => {
        editorRef.current?.setListStyle(style);
    }, [editorRef.current])

    const setListNumbering = useCallback((numbering: number) => {
        editorRef.current?.setListNumbering(numbering);
    }, [editorRef.current])

    const getSuggestedStartNumber = useCallback((): { number: number; listType: OrderedListType } | null => {
        return editorRef.current?.getSuggestedStartNumber() ?? null;
    }, [editorRef.current])

    const setSuperscript = useCallback((superscript: boolean) => {
        editorRef.current?.setSuperscript(superscript);
    }, [editorRef.current])

    const setSubscript = useCallback((subscript: boolean) => {
        editorRef.current?.setSubscript(subscript);
    }, [editorRef.current])

    const increaseIndent = useCallback(() => {
        editorRef.current?.increaseIndent();
    }, [editorRef.current])

    const decreaseIndent = useCallback(() => {
        editorRef.current?.decreaseIndent();
    }, [editorRef.current])

    const continuePreviousNumbering = useCallback(() => {
        editorRef.current?.continuePreviousNumbering();
    }, [editorRef.current])

    const scrollToBookmark = useCallback((id: string) => {
        editorRef?.current?.scrollToBookmark(id)
    }, [editorRef?.current])

    const unsetBookmarksWithIds = useCallback((ids: string[]) => {
        editorRef?.current?.unsetBookmarksWithIds(ids)
    }, [editorRef?.current])

    const scrollToComment = useCallback((comment: AppComment) => {
        editorRef?.current?.scrollToComment(comment.id)
    }, [editorRef?.current])

    const unsetCommentsWithIds = useCallback((ids: string[]) => {
        editorRef?.current?.unsetCommentsWithIds(ids)
    }, [editorRef?.current])

    const getCommentsIds = useCallback((): string[] => {
        return editorRef?.current?.getCommentsIds() ?? []
    }, [editorRef?.current])

    const scrollToHeadingIndex = useCallback((index: number, sectionType?: string) => {
        editorRef?.current?.scrollToHeadingIndex(index, sectionType)
    }, [editorRef?.current])

    const scrollToSection = useCallback((id?: string, position?: 'top' | 'bottom') => {
        if (!id) return
        editorRef?.current?.scrollToSection(id, position)
    }, [editorRef?.current])

    const insertCharacter = useCallback((character: number) => {
        editorRef?.current?.insertCharacter(character)
    }, [editorRef?.current])

    const setLink = useCallback((url: string) => {
        editorRef?.current?.setLink(url)
    }, [editorRef?.current])

    const removeLink = useCallback(() => {
        editorRef?.current?.removeLink()
    }, [editorRef?.current])

    const deleteSelection = useCallback(() => {
        editorRef?.current?.deleteSelection()
    }, [editorRef?.current])

    const selectAll = useCallback(() => {
        editorRef?.current?.selectAll()
    }, [editorRef?.current])

    const deselectAll = useCallback(() => {
        editorRef?.current?.deselectAll()
    }, [editorRef?.current])

    const setCase = useCallback((caseType: CasingType) => {
        editorRef?.current?.setCase(caseType)
    }, [editorRef?.current])

    const insertCitation = useCallback((
        citationStyle: CITATION_STYLES,
        citation: BibReference,
        style: Style,
        isBibliographySection: boolean
    ) => {
        editorRef?.current?.insertCitation(citationStyle, citation, style, isBibliographySection)
    }, [editorRef?.current])

    const setLigature = useCallback((ligature: LigatureType) => {
        editorRef?.current?.setLigature(ligature)
    }, [editorRef?.current])

    const unsetCharacterSpacing = useCallback(() => {
        editorRef?.current?.unsetCharacterSpacing()
    }, [editorRef?.current])

    const increaseCharacterSpacing = useCallback(() => {
        editorRef?.current?.increaseCharacterSpacing()
    }, [editorRef?.current])

    const decreaseCharacterSpacing = useCallback(() => {
        editorRef?.current?.decreaseCharacterSpacing()
    }, [editorRef?.current])

    const unsetNoteWithId = useCallback((id: string) => {
        editorRef?.current?.unsetNoteWithId(id)
    }, [editorRef?.current])

    const removeNoteWithIds = useCallback((ids: string[]) => {
        ids.forEach(id => {
            editorRef?.current?.unsetNoteWithId(id)
        })
    }, [editorRef?.current])

    const scrollToNoteWithId = useCallback((id: string) => {
        editorRef?.current?.scrollToNoteWithId(id)
    }, [editorRef?.current])

    return {
        unsetNoteWithId,
        removeNoteWithIds,
        scrollToNoteWithId,
        focus,
        undo,
        redo,
        cut,
        copy,
        paste,
        pasteWithoutFormatting,
        setHeading,
        setBody,
        setCustomStyle,
        setTextAlignment,
        setFontFamily,
        setFontSize,
        setBold,
        setItalic,
        setUnderline,
        setStrikeThrough,
        setTextColor,
        setHighlightColor,
        setBlockquote,
        setLineSpacing,
        setListStyle,
        setListNumbering,
        getSuggestedStartNumber,
        setSuperscript,
        setSubscript,
        increaseIndent,
        decreaseIndent,
        continuePreviousNumbering,
        scrollToBookmark,
        unsetBookmarksWithIds,
        scrollToComment,
        unsetCommentsWithIds,
        getCommentsIds,
        scrollToHeadingIndex,
        scrollToSection,
        insertCharacter,
        setLink,
        removeLink,
        deleteSelection,
        selectAll,
        deselectAll,
        setCase,
        insertCitation,
        setLigature,
        unsetCharacterSpacing,
        increaseCharacterSpacing,
        decreaseCharacterSpacing,
    }
}
