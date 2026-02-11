import { MotionGlobalConfig } from "framer-motion";
import { cn } from "@/lib/utils";
import { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
    addApparatusAtTop,
    expandApparatus,
    setApparatusCommentVisibility,
    setApparatusNoteVisibility,
    setToolbarEnabled,
    toggleVisibilityApparatus,
} from "./store/editor/editor.slice";
import { useTranslation } from "react-i18next";
import {
    setApparatusReplaceMode,
    setBookmarkEnabled,
    setCanInsertCitation,
    setCanInsertSymbol,
    setCharacters,
    setCitationInsertDialogVisible,
    setCommentEnabled,
    setDeleteApparatusDialogVisible,
    setDeleteApparatusEntryDialogVisible,
    setInsertReadingTypeDialogVisible,
    setLinkConfigVisible,
    setLinkEnabled,
    setReadingSeparatorEnabled,
    setReadingTypeEnabled,
    setSelectedSideviewTabIndex,
    setSiglumEnabled,
    setTotalApparatusMatches,
    setWords,
    toggleInsertSiglumDialogVisible,
    updateNotesEntryNodes,
} from "./provider";
import { useEditor } from "./hooks/use-editor";
import AppButton from "@/components/app/app-button";
import {
    AppDialog,
    AppDialogContent,
    AppDialogDescription,
    AppDialogFooter,
    AppDialogHeader,
    AppDialogTitle,
} from "@/components/app/app-dialog";
import List from "@/components/app/list";
import ApparatusNavBar from "@/pages/editor/components/apparatus-navbar";
import ApparatusesReorderGroup from "./components/apparatuses-reorder-group";
import ApparatusesReorderItem from "./components/apparatuses-reorder-item";
import ApparatusesTextEditorContainer from "./components/apparatuses-texteditor-container";
import ApparatusTextEditor, { HTMLApparatusTextEditorElement } from "@/lib/editor/apparatus-text-editor";
import { Editor } from "@tiptap/react";
import { useSidebar } from "@/components/ui/sidebar";
import { EditorContentElement } from "./shared/types";
import { ApparatusContainer, ApparatusesLayout } from "./components/apparatuses-content-layout";
import { apparatusTypeTranslationKey } from "@/utils/constants";
import { generateExcelBuffer } from "@/utils/excelUtils";
import { useApparatuses } from "./hooks/use-apparatuses";
import useComment from "./hooks/use-comment";
import { useApparatusEditor } from "./hooks/use-apparatus-editor";
import { useElectron } from "@/hooks/use-electron";
import { Node } from "prosemirror-model";
import { useMain } from "./hooks/use-main";
import { setToolbarStateFromApparatusTextStyle } from "./provider/actions/toolbar";
import { openChat } from "./provider/actions/chat";

export interface MainApparatusesElement extends EditorContentElement {
    replace: (replacement: string) => void;
    replaceAll: (replacement: string) => void;
    getCommentsIds: () => string[];
    scrollToCommentId: (id: string) => void;
    expandApparatusWithId: (apparatusId: string) => void;
    updateApparatusesEntries: (apparatusNotes: ApparatusNote[], newNoteId: string | null) => void;
    deleteApparatusesEntryWithIds: (ids: string[]) => void;
    addReadingTypeAdd: (readingType: ReadingTypeAdd) => void;
    addReadingTypeOm: (readingType: ReadingTypeOm) => void;
    addReadingTypeTr: (readingType: ReadingTypeTr) => void;
    addReadingTypeDel: (readingType: ReadingTypeDel) => void;
    addReadingTypeCustom: (readingType: string) => void;
    addReadingSeparator: () => void;
    scrollToApparatusId: (id: string) => void;
    setLink: (link: string) => void;
    insertCitation: (citationStyle: CITATION_STYLES, citation: BibReference, style: Style) => void;
    getInsertedBibliographyEntries: () => InsertBibliography[];
    updateReadingType: () => void;
    updateReadingSeparator: () => void;
    updateLemmaStyleAndSeparator: () => void;
    notesAndCommentsIdsForApparatusIds: (ids: string[]) => { notesIds: string[], commentsIds: string[] };
}

interface EditorApparatusProps {
    keyboardShortcuts: KeyboardShortcutCategory[];
    lemmaHighlightColor: string;
    readingTypeAndSeparatorHighlightColor: string;
    commentHighlightColor: string;
    siglaHighlightColor: string;
    onFocus: () => void
    onSelection?: (editor: Editor) => void;
    onUpdate?: () => void;
    onDeleteApparatusWithId?: (id: string) => void;
    onDeleteApparatusesWithIds?: (ids: string[]) => void;
    onClickLemmaWithId?: (id: string) => void;
    onCommentCreated?: (id: string, categoryId?: string) => void;
    onClickCommentWithId?: (id: string) => void;
    onCommentWithIdsDeleted?: (ids: string[]) => void;
}

export default forwardRef((props: EditorApparatusProps, ref: ForwardedRef<MainApparatusesElement>) => {
    const {
        keyboardShortcuts,
        lemmaHighlightColor,
        readingTypeAndSeparatorHighlightColor,
        commentHighlightColor,
        siglaHighlightColor,
        onFocus,
        onUpdate,
        onDeleteApparatusWithId,
        onDeleteApparatusesWithIds,
        onClickLemmaWithId,
        onCommentCreated,
        onClickCommentWithId,
        onCommentWithIdsDeleted,
    } = props;

    MotionGlobalConfig.skipAnimations = true;
    const editorRefs = useRef<{ [key: string]: HTMLApparatusTextEditorElement }>({});
    const isLoadingApparatusesRef = useRef(true);

    const { t } = useTranslation()
    const main = useMain()
    const comment = useComment()
    const electron = useElectron()
    const apparatus = useApparatuses()
    const dispatch = useDispatch()
    const [state, dispatchEditor] = useEditor();
    const sidebar = useSidebar()
    const editorRef = useRef<HTMLApparatusTextEditorElement | null>(null);
    const apparatusEditor = useApparatusEditor(editorRef);

    const [currentApparatus, setCurrentApparatus] = useState<Apparatus | null>(null)
    const [draggingDirection, setDraggingDirection] = useState<"y" | boolean>(false)
    const [selectedApparatusToDelete, setSelectedApparatusToDelete] = useState<Apparatus | null>(null)
    const [swapApparatus, setSwapApparatus] = useState<{ id: string, type: "INNER_MARGIN" | "OUTER_MARGIN" } | null>(null)

    const totalMatchesRef = useRef<Record<string, number>>({});
    const isReplacingRef = useRef<Record<string, boolean>>({});

    const searchCriteria = useMemo(() => state.searchCriteria, [state.searchCriteria]);
    const currentApparatusSearchIndex = useMemo(() => state.currentApparatusSearchIndex, [state.currentApparatusSearchIndex]);
    const currentSearchIndex = useMemo(() => state.currentSearchIndex, [state.currentSearchIndex]);

    useImperativeHandle(ref, () => ({
        type: () => "APPARATUSES",
        replace,
        replaceAll,
        addComment,
        unsetCommentsWithIds,
        getCommentsIds,
        scrollToCommentId,
        expandApparatusWithId,
        updateApparatusesEntries,
        deleteApparatusesEntryWithIds,
        addReadingSeparator,
        addReadingTypeAdd,
        addReadingTypeOm,
        addReadingTypeTr,
        addReadingTypeDel,
        addReadingTypeCustom,
        addSiglum,
        undo: apparatusEditor.undo,
        redo: apparatusEditor.redo,
        setFontFamily: apparatusEditor.setFontFamily,
        setFontSize: apparatusEditor.setFontSize,
        setSuperscript: apparatusEditor.setSuperscript,
        setSubscript: apparatusEditor.setSubscript,
        setBold: apparatusEditor.setBold,
        setItalic: apparatusEditor.setItalic,
        setUnderline: apparatusEditor.setUnderline,
        selectAll: apparatusEditor.selectAll,
        deselectAll: apparatusEditor.deselectAll,
        deleteSelection: apparatusEditor.deleteSelection,
        setStrikeThrough: apparatusEditor.setStrikeThrough,
        setTextColor: apparatusEditor.setTextColor,
        setHighlightColor: apparatusEditor.setHighlightColor,
        setLink: apparatusEditor.setLink,
        scrollToApparatusId,
        setShowNonPrintingCharacters,
        insertCitation,
        getInsertedBibliographyEntries,
        insertCharacter,
        updateReadingType,
        updateReadingSeparator,
        updateLemmaStyleAndSeparator,
        cut: apparatusEditor.cut,
        copy: apparatusEditor.copy,
        copyStyle: () => main.copyStyle(editorRef.current?.editor),
        paste: apparatusEditor.paste,
        pasteStyle: () => main.pasteStyle(editorRef.current?.editor),
        pasteWithoutFormatting: apparatusEditor.pasteWithoutFormatting,
        notesAndCommentsIdsForApparatusIds,
    }), [editorRef.current, apparatusEditor]);

    const replace = useCallback(async (replacement: string) => {
        if (!editorRefs.current || currentApparatusSearchIndex === null) return
        let partialApparatusSearchIndex = currentApparatusSearchIndex;
        for (const apparatus of main.apparatuses) {
            const editor = editorRefs.current[apparatus.id];
            const matches = totalMatchesRef.current[apparatus.id] ?? 0;
            if (editor && matches > 0 && partialApparatusSearchIndex < matches) {
                const totalMatchesAfterReplace = await editor?.replace(replacement, partialApparatusSearchIndex, searchCriteria);
                if (totalMatchesAfterReplace) {
                    totalMatchesRef.current[apparatus.id] = totalMatchesAfterReplace as number;
                }
                break;
            }
            partialApparatusSearchIndex -= matches;
        }
        handleActiveSearch();
    }, [editorRefs.current, main.apparatuses, currentSearchIndex, currentApparatusSearchIndex, searchCriteria]);

    const replaceAll = useCallback((replacement: string) => {
        if (!editorRefs.current) return
        for (const apparatus of main.apparatuses) {
            const editorRef = editorRefs.current[apparatus.id];
            editorRef?.replaceAll(replacement, searchCriteria.searchTerm);
        }
    }, [editorRefs.current, main.apparatuses, searchCriteria.searchTerm]);

    const addComment = useCallback((color: string, categoryId?: string) => {
        editorRef.current?.setCommentCategoryId(categoryId);
        editorRef.current?.setComment(color);
    }, [editorRef.current]);

    const unsetCommentsWithIds = useCallback((ids: string[]) => {
        for (const data of main.apparatuses) {
            const editor = editorRefs.current[data.id]
            editor.unsetCommentsWithIds(ids)
        }
    }, [editorRefs.current, main.apparatuses])

    const getCommentsIds = useCallback(() => {
        const commentsIds: string[] = []
        for (const data of main.apparatuses) {
            const editor = editorRefs.current[data.id]
            const apparatusCommentsIds = editor.getCommentsIds()
            commentsIds.push(...apparatusCommentsIds)
        }
        return commentsIds
    }, [editorRef.current, main.apparatuses])

    const scrollToCommentId = useCallback((id: string) => {
        main.apparatuses.forEach((data: Apparatus) => {
            const editor = editorRefs.current[data.id]
            const apparatusId = editor.getApparatusIdFromCommentId(id)
            if (!apparatusId)
                return

            dispatch(expandApparatus({ id: data.id }))
            setTimeout(() => {
                editor.scrollToApparatusId(apparatusId)
                editor.selectCommentId(id)
            }, 100)
        })
    }, [editorRef?.current, main.apparatuses]);

    const expandApparatusWithId = useCallback((apparatusId: string) => {
        dispatch(expandApparatus({ id: apparatusId }))
        electron.doc.updateApparatusExpanded(apparatusId, true)
    }, [dispatch, electron.doc])

    const updateApparatusesEntries = useCallback((apparatusNotes: ApparatusNote[], newNoteId: string | null) => {
        for (const [key, editor] of Object.entries(editorRefs.current)) {
            const _apparatus = main.visibleApparatuses.find(apparatus => apparatus.id === key)
            if (!_apparatus)
                continue;

            const entries = apparatusNotes
                .filter(note => note.apparatusId === key && note.visible)
                .map(note => ({
                    id: note.noteId,
                    type: _apparatus.type,
                    lemmaContent: note.noteContent,
                    lemmaStyle: main.lemmaStyle,
                    fromToSeparatorContent: main.fromToSeparatorReferenceFormat.value || '',
                    fromToSeparatorStyle: main.lemmaFromToSeparatorStyle,
                    separatorContent: main.lemmaSeparatorReferenceFormat.value || '',
                    separatorStyle: main.lemmaSeparatorStyle,
                    nodes: note.entryNodes,
                } satisfies ApparatusEntryContent))

            editor.updateApparatusEntries(entries);
        }
        if (newNoteId) {
            setTimeout(() => {
                focusToApparatusId(newNoteId);
            }, 500);
        }
    }, [editorRefs.current, main.visibleApparatuses, main.lemmaStyle, main.fromToSeparatorReferenceFormat, main.lemmaFromToSeparatorStyle])

    const deleteApparatusesEntryWithIds = useCallback((ids: string[]) => {
        for (const apparatus of main.apparatuses) {
            const editor = editorRefs.current[apparatus.id]
            if (!editor)
                return;

            const apparatusesIds = editor.getApparatusesIds()
            const idsToDelete = ids.filter(id => apparatusesIds.includes(id))
            editor.deleteApparatusesEntryWithIds(idsToDelete)
        }
    }, [editorRefs.current, main.apparatuses])

    const addReadingSeparator = useCallback(() => {
        if (!currentApparatus)
            return
        const editor = editorRefs.current[currentApparatus.id]
        if (!editor)
            return;
        editor.addReadingSeparator(main.readingSeparator)
    }, [currentApparatus, main.readingSeparator])

    const addReadingTypeAdd = useCallback((readingType: ReadingTypeAdd) => {
        if (!currentApparatus)
            return
        const editor = editorRefs.current[currentApparatus.id]
        if (!editor)
            return;

        editor.addReadingTypeAdd(readingType)
    }, [currentApparatus])

    const addReadingTypeOm = useCallback((readingType: ReadingTypeOm) => {
        if (!currentApparatus)
            return
        const editor = editorRefs.current[currentApparatus.id]
        if (!editor)
            return;
        editor.addReadingTypeOm(readingType)
    }, [currentApparatus])

    const addReadingTypeTr = useCallback((readingType: ReadingTypeTr) => {
        if (!currentApparatus)
            return
        const editor = editorRefs.current[currentApparatus.id]
        if (!editor)
            return;
        editor.addReadingTypeTr(readingType)
    }, [currentApparatus])

    const addReadingTypeDel = useCallback((readingType: ReadingTypeDel) => {
        if (!currentApparatus)
            return
        const editor = editorRefs.current[currentApparatus.id]
        if (!editor)
            return;
        editor.addReadingTypeDel(readingType)
    }, [currentApparatus])

    const addReadingTypeCustom = useCallback((readingType: string) => {
        if (!currentApparatus)
            return
        editorRefs.current[currentApparatus.id].addReadingTypeCustom(readingType, main.readingTypeCustomStyle)
    }, [currentApparatus, main.readingTypeCustomStyle])

    const addSiglum = useCallback((siglum: Siglum) => {
        if (!editorRefs.current || !currentApparatus || !main.siglumColorReferenceFormat) return
        editorRefs.current[currentApparatus.id].addSiglum(siglum, main.siglumColorReferenceFormat)
    }, [editorRefs.current, currentApparatus, main.siglumColorReferenceFormat])

    const scrollToApparatusId = useCallback((id: string) => {
        main.visibleApparatuses.forEach((data: Apparatus) => {
            const editor = editorRefs.current[data.id]
            if (editor.getApparatusesIds().includes(id)) {
                dispatch(expandApparatus({ id: data.id }))
                setTimeout(() => {
                    editor.scrollToApparatusId(id)
                }, 200)
            }
        })
    }, [editorRef.current, main.visibleApparatuses])

    const focusToApparatusId = useCallback((id: string) => {
        let editor: HTMLApparatusTextEditorElement | null = null
        let apparatusId
        for (const data of main.visibleApparatuses) {
            const foundEditor = editorRefs.current[data.id]
            const apparatusesIds = foundEditor.getApparatusesIds()
            const containId = apparatusesIds.includes(id)
            if (containId) {
                editor = foundEditor
                apparatusId = data.id
                break
            }
        }

        dispatch(expandApparatus({ id: apparatusId }))
        editor?.focusToApparatusId(id)
    }, [editorRef.current, main.visibleApparatuses])


    const setShowNonPrintingCharacters = useCallback((visible: boolean) => {
        main.apparatuses.forEach((data: Apparatus) => {
            const editor = editorRefs.current[data.id]
            editor?.setShowNonPrintingCharacters(visible);
        })
    }, [main.apparatuses, editorRefs.current])

    const insertCitation = useCallback((citationStyle: CITATION_STYLES, citation: BibReference, style: Style) => {
        editorRef?.current?.insertCitation(citationStyle, citation, style);
    }, [editorRef.current]);

    const getInsertedBibliographyEntries = useCallback(() => {
        if (!editorRefs.current)
            return [];
        return main.apparatuses.reduce((existingEntries: InsertBibliography[], apparatus: Apparatus) => {
            const editor = editorRefs.current[apparatus.id]
            if (!editor) return existingEntries;
            return editor.getInsertedBibliographyEntries(existingEntries);
        }, []);
    }, [editorRefs.current, main.apparatuses]);

    const insertCharacter = useCallback((character: number) => {
        editorRef?.current?.insertCharacter(character);
    }, [editorRef.current])

    const updateReadingType = useCallback(() => {
        main.apparatuses.forEach((apparatus: Apparatus) => {
            const editor = editorRefs.current[apparatus.id];
            if (!editor || !apparatus.visible)
                return

            editor.updateReadingType(main.readingTypeAdd, main.readingTypeOm, main.readingTypeTr, main.readingTypeDel);
        })
    }, [main.apparatuses, main.readingTypeAdd, main.readingTypeOm, main.readingTypeTr, main.readingTypeDel]);

    const updateReadingSeparator = useCallback(() => {
        main.apparatuses.forEach((apparatus: Apparatus) => {
            const editor = editorRefs.current[apparatus.id];
            if (!editor || !apparatus.visible)
                return

            editor.updateReadingSeparator(main.readingSeparator)
        })
    }, [main.apparatuses, main.readingSeparator])

    const updateLemmaStyleAndSeparator = useCallback(() => {
        main.apparatuses.forEach((apparatus: Apparatus) => {
            const editor = editorRefs.current[apparatus.id]
            if (!editor || !apparatus.visible)
                return

            editor.updateLemmaStyleAndSeparator(main.lemmaStyle, main.lemmaFromToSeparator, main.lemmaSeparator)
        })
    }, [main.apparatuses, main.lemmaStyle, main.lemmaFromToSeparator, main.lemmaSeparator])

    // #region Ipc events

    useEffect(() => {
        const remove = window.electron.ipcRenderer.on('add-apparatus', (_, data: DocumentApparatus) => {
            dispatch(addApparatusAtTop(data))
        });
        return () => remove();
    }, [dispatch])

    useEffect(() => {
        const remove = globalThis.electron.ipcRenderer.on('swap-margin', () => {
            const innerMarginApparatus = main.apparatuses.find((apparatus: Apparatus) => apparatus.type === "INNER_MARGIN")
            const outerMarginApparatus = main.apparatuses.find((apparatus: Apparatus) => apparatus.type === "OUTER_MARGIN")
            const style = state.styles.find((style: Style) => style.type === 'MARGIN_NOTES')

            if (!innerMarginApparatus || !outerMarginApparatus || !style)
                return

            const innerMarginEditor = editorRefs.current[innerMarginApparatus.id]
            const outerMarginEditor = editorRefs.current[outerMarginApparatus.id]
            const innerMarginNodes = innerMarginEditor.getApparatusesEntriesNodes()
            const outerMarginNodes = outerMarginEditor.getApparatusesEntriesNodes()

            innerMarginEditor.deleteAllApparatusesEntries()
            outerMarginEditor.deleteAllApparatusesEntries()
            outerMarginEditor.insertApparatusesEntriesFromNodes('OUTER_MARGIN', innerMarginNodes, style)
            innerMarginEditor.insertApparatusesEntriesFromNodes('INNER_MARGIN', outerMarginNodes, style)
        });
        return () => remove();
    }, [main.apparatuses, editorRefs.current, state.styles]);

    const toggleNoteVisibility = useCallback(async (item: Apparatus) => {
        const id = item.id
        const apparatus = await electron.doc.toggleApparatusNoteVisibility(id)
        if (!apparatus)
            return
        const notesVisible = apparatus.notesVisible
        dispatch(setApparatusNoteVisibility({ id, notesVisible }))
    }, [dispatch, main.apparatuses])

    const toggleCommentVisibility = useCallback(async (item: Apparatus) => {
        const id = item.id
        const apparatus = await electron.doc.toggleApparatusCommentVisibility(id)
        if (!apparatus)
            return
        const commentsVisible = apparatus.commentsVisible
        dispatch(setApparatusCommentVisibility({ id, commentsVisible }))
    }, [dispatch, main.apparatuses])

    const contentFromApparatus = useCallback((apparatusData: Apparatus) => {
        const result = main.documentApparatuses.find((documentData: DocumentApparatus) => documentData.id === apparatusData.id)

        const currentContent = result?.content
        if (!currentContent)
            return null

        const apparatusStyleForType = (type: TargetTypeStyle) =>
            state.styles.find((style: Style) => style.type === type)

        const criticalStyle = apparatusStyleForType("APP_VAR")
        const marginNotesStyle = apparatusStyleForType("MARGIN_NOTES")
        const pageNotesStyle = apparatusStyleForType("PAGE_NOTE")
        const sectionNotesStyle = apparatusStyleForType("SECTION_NOTE")

        const content = currentContent.content ?? []
        const styledContent = {
            ...currentContent,
            content: content.map(data => {
                switch (data.attrs.type) {
                    case "CRITICAL":
                        return {
                            ...data,
                            content: data.content.map(content => {
                                return {
                                    ...content,
                                    attrs: {
                                        ...content.attrs,
                                        color: criticalStyle?.color,
                                        fontFamily: criticalStyle?.fontFamily,
                                        fontSize: criticalStyle?.fontSize,
                                        fontStyle: "normal",
                                        fontWeight: "normal",
                                    },
                                }
                            })
                        }
                    case "INNER_MARGIN":
                    case "OUTER_MARGIN":
                        return {
                            ...data,
                            content: data.content.map(content => {
                                return {
                                    ...content,
                                    attrs: {
                                        ...content.attrs,
                                        color: marginNotesStyle?.color,
                                        fontFamily: marginNotesStyle?.fontFamily,
                                        fontSize: marginNotesStyle?.fontSize,
                                        fontStyle: "normal",
                                        fontWeight: "normal",
                                    },
                                }
                            })
                        }
                    case "PAGE_NOTES":
                        return {
                            ...data,
                            content: data.content.map(content => {
                                return {
                                    ...content,
                                    attrs: {
                                        ...content.attrs,
                                        color: pageNotesStyle?.color,
                                        fontFamily: pageNotesStyle?.fontFamily,
                                        fontSize: pageNotesStyle?.fontSize,
                                        fontStyle: "normal",
                                        fontWeight: "normal",
                                    },
                                }
                            })
                        }
                    case "SECTION_NOTES":
                        return {
                            ...data,
                            content: data.content.map(content => {
                                return {
                                    ...content,
                                    attrs: {
                                        ...content.attrs,
                                        color: sectionNotesStyle?.color,
                                        fontFamily: sectionNotesStyle?.fontFamily,
                                        fontSize: sectionNotesStyle?.fontSize,
                                        fontStyle: "normal",
                                        fontWeight: "normal",
                                    },
                                }
                            })
                        }
                }
                return data
            })
        }

        return styledContent
    }, [main, main.documentApparatuses, state.styles])

    useEffect(() => {
        if (isLoadingApparatusesRef.current) {
            setTimeout(() => {
                isLoadingApparatusesRef.current = false;
            }, 300);
        }
    }, [main.documentApparatuses])

    const handleDragEnd = useCallback((event) => {
        event.preventDefault()
        setDraggingDirection(false)
    }, [main.visibleApparatuses])

    const handleActiveSearch = useCallback(() => {
        if (!editorRefs.current) return
        let partialApparatusSearchIndex = currentApparatusSearchIndex;
        const _apparatuses = main.apparatuses
        for (const apparatus of _apparatuses) {
            const editor = editorRefs.current[apparatus.id];
            const matches = totalMatchesRef.current[apparatus.id] ?? 0;
            if (partialApparatusSearchIndex === null) {
                editor?.clearActiveSearch();
                continue;
            }
            if (editor && matches > 0 && partialApparatusSearchIndex < matches) {
                editor.setActiveSearch(partialApparatusSearchIndex);
            } else {
                editor?.clearActiveSearch();
            }
            partialApparatusSearchIndex -= matches;
            if (partialApparatusSearchIndex < 0) {
                partialApparatusSearchIndex = null;
            }
        }
    }, [editorRefs.current, main.apparatuses, currentApparatusSearchIndex]);

    useEffect(() => {
        handleActiveSearch();
    }, [handleActiveSearch]);

    useEffect(() => {
        totalMatchesRef.current = {};
        const _apparatuses = main.apparatuses
        for (const apparatus of _apparatuses) {
            const editor = editorRefs.current[apparatus.id];
            editor?.find(apparatus.id, searchCriteria);
        }
    }, [editorRefs.current, main.apparatuses, searchCriteria]);

    useEffect(() => {
        if (!swapApparatus)
            return

        const innerMarginApparatus = main.apparatuses.find((apparatus: Apparatus) => apparatus.type === "INNER_MARGIN")
        const outerMarginApparatus = main.apparatuses.find((apparatus: Apparatus) => apparatus.type === "OUTER_MARGIN")

        if (!editorRefs.current || !innerMarginApparatus || !outerMarginApparatus)
            return

        const innerMarginEditor = editorRefs.current[innerMarginApparatus.id]
        const innerMarginApparatusesEntryNodes = innerMarginEditor.getApparatusEntryNodesWithId(swapApparatus.id)

        const outerMarginEditor = editorRefs.current[outerMarginApparatus.id]
        const outerMarginApparatusesEntryNodes = outerMarginEditor.getApparatusEntryNodesWithId(swapApparatus.id)
        const style = state.styles.find((style: Style) => style.type === 'MARGIN_NOTES')
        if (!style)
            return

        switch (swapApparatus.type) {
            case "INNER_MARGIN":
                innerMarginEditor.deleteApparatusEntryWithId(swapApparatus.id)
                setTimeout(() => {
                    outerMarginEditor.insertApparatusEntryFromNodes('OUTER_MARGIN', innerMarginApparatusesEntryNodes, style)
                    setSwapApparatus(null)
                }, 150)
                break;
            case "OUTER_MARGIN":
                outerMarginEditor.deleteApparatusEntryWithId(swapApparatus.id)
                setTimeout(() => {
                    innerMarginEditor.insertApparatusEntryFromNodes('INNER_MARGIN', outerMarginApparatusesEntryNodes, style)
                    setSwapApparatus(null)
                }, 150)
                break;
        }
    }, [swapApparatus, main.apparatuses, editorRefs.current, state.styles])

    const [selectedApparatusIdToDelete, setSelectedApparatusIdToDelete] = useState<string | null>(null)

    // #region Component fn

    // @REFACTOR: Change the position of this useEffect
    useEffect(() => {
        window.menu.disableReferencesMenuItems(apparatus.disabledTypes)
    }, [window.menu, apparatus.disabledTypes])

    const onPointerEnter = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault()
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            await delay(10);
            setDraggingDirection("y")
        })();
    }, [])

    const onOpenChangeMoreMenu = useCallback((_, item: Apparatus) => {
        editorRef.current = editorRefs.current[item.id]
    }, [editorRefs.current])

    const onPointerDownMoreMenu = useCallback((event: React.PointerEvent<HTMLButtonElement>, item: Apparatus) => {
        event.stopPropagation()
        editorRef.current = editorRefs.current[item.id]
    }, [editorRefs.current])

    const onDeleteApparatus = useCallback((item: Apparatus) => {
        const characters = editorRefs.current[item.id]?.editor?.getText().length ?? 0
        if (characters === 0) {
            dispatch(expandApparatus({ id: item.id }))
            apparatus.removeApparatus(item)
            if (editorRefs.current[item.id])
                delete editorRefs.current[item.id];

            return
        }
        setSelectedApparatusToDelete(item)
        dispatchEditor(setDeleteApparatusDialogVisible(true))
    }, [editorRefs.current, dispatch])

    const onOpenChangeAddMenu = useCallback((_, item: Apparatus) => {
        editorRef.current = editorRefs.current[item.id]
    }, [editorRefs.current])

    const onPointerDownAddMenu = useCallback((event: React.PointerEvent<HTMLButtonElement>, item: Apparatus) => {
        event.stopPropagation()
        editorRef.current = editorRefs.current[item.id]
    }, [editorRefs.current])

    // @REFACTOR: Move this to a hook
    const onExportApparatus = useCallback((item: Apparatus) => {
        const apparatusType = t(apparatusTypeTranslationKey[item.type], { lng: 'en' })
        const fileName = `${t('apparatusesMenu.export', { lng: 'en' })}_${apparatusType}_${item.title}`;

        const apparatusExportHeaders: Record<string, string> = {
            apparatusType: 'export.apparatusType',
            apparatusTitle: 'export.apparatusTitle',
            lemma: 'export.lemma',
            apparatusEntry: 'export.apparatusEntry'
        }

        const headers = Object.values(apparatusExportHeaders).map(header => t(header, { lng: 'en' }));
        const headerKeys = Object.keys(apparatusExportHeaders);
        const { additionalHeaders, data } = editorRefs.current[item.id].getExportData(item.title, item.type === 'CRITICAL', t('export.reading', { lng: 'en' }));

        const finalData = data.map((d: any) => {
            return {
                ...headerKeys.reduce((prev, headerKey, index) => {
                    const value = d[headerKey];
                    delete d[headerKey];
                    return {
                        ...prev,
                        [headers[index]]: value
                    }
                }, {}),
                ...d
            }
        })

        const excelBuffer = generateExcelBuffer([
            ...headers,
            ...additionalHeaders
        ], finalData);

        window.doc.exportExcel(excelBuffer, fileName);
    }, [dispatch, t, apparatusTypeTranslationKey, editorRefs.current, window.doc]);

    const focus = useCallback((itemId: string, editor: Editor) => {
        dispatchEditor(setBookmarkEnabled(false))
        dispatchEditor(setCommentEnabled(false))
        globalThis.menu.setAddBookmarkMenuItemEnabled(false)
        globalThis.menu.setAddCommentMenuItemEnabled(false)

        const item: Apparatus = main.apparatuses.find(apparatus => apparatus.id === itemId) as Apparatus;
        editorRef.current = editorRefs.current[itemId];
        globalThis.menu.setMenuFeatureEnabled(true);
        globalThis.menu.setAddReadingsEnabled(true)

        // Disable Insert citation on certain sections
        const canInsertCitation = item.type === 'CRITICAL' || item.type === 'PAGE_NOTES' || item.type === 'SECTION_NOTES';
        globalThis.menu.setAddCitationMenuItemEnabled(canInsertCitation);
        globalThis.menu.setSymbolMenuItemEnabled(editorRef.current.editor.state.doc.content.size > 0);
        setCurrentApparatus(item)
        dispatch(setToolbarEnabled(true));
        dispatchEditor(setCanInsertCitation(canInsertCitation));
        dispatchEditor(setCanInsertSymbol(editorRef.current.editor.state.doc.content.size > 0));

        const state = editor.state
        const { doc } = state;

        let characterCount = 0;
        let wordCount = 0;
        doc.descendants((node) => {
            if (node.type.name === 'paragraph') {
                let paraText = '';
                node.descendants((child) => {
                    if (child.isText) {
                        paraText += child.text || '';
                    }
                    return true;
                });
                characterCount += paraText.length;
                wordCount += paraText.trim().length === 0 ? 0 : paraText.trim().split(/\s+/).length;
            }
            return true;
        });

        dispatchEditor(setReadingTypeEnabled((editor.getJSON().content?.length ?? 0) > 0))
        dispatchEditor(setReadingSeparatorEnabled((editor.getJSON().content?.length ?? 0) > 0))
        dispatchEditor(setCharacters(characterCount))
        dispatchEditor(setWords(wordCount))
        onFocus();
    }, [main.apparatuses, editorRefs.current])

    // Use it to replace isLoadingApparatusesRef
    const touchNextUpdateRef = useRef(false)
    const canUpdate = useCallback(() => {
        touchNextUpdateRef.current = true
    }, [])

    const update = useCallback((item: Apparatus) => (editor: Editor) => {
        const content = editor.getJSON()
        const shouldMarkAsTouched = !isLoadingApparatusesRef.current;
        electron.doc.updateApparatusIdWithContent(item.id, content, shouldMarkAsTouched)
        dispatchEditor(setCanInsertSymbol(editor.state.doc.content.size > 0));
        electron.menu.setSymbolMenuItemEnabled(editor.state.doc.content.size > 0);

        const state = editor.state
        const { doc } = state;

        let characterCount = 0;
        let wordCount = 0;
        doc.descendants((node) => {
            if (node.type.name === 'paragraph') {
                let paraText = '';
                node.descendants((child) => {
                    if (child.isText) {
                        paraText += child.text || '';
                    }
                    return true;
                });
                characterCount += paraText.length;
                wordCount += paraText.trim().length === 0 ? 0 : paraText.trim().split(/\s+/).length;
            }
            return true;
        });

        dispatchEditor(setCharacters(characterCount))
        dispatchEditor(setWords(wordCount))
        onUpdate?.();
    }, [main.apparatuses])

    const onSelectionUpdate = useCallback((editor: Editor) => {
        const state = editor.state
        const { selection } = state;
        const { from, to } = selection;
        const selectedContent = editor.state.doc.textBetween(from, to, ' ');
        const hasSelectedContent = editor.state.doc.content.size > 0 && selectedContent.length > 0
        const noSelection = selectedContent.length === 0
        const enableSiglum = noSelection;
        const enableCitation = noSelection;
        const enableReadingType = noSelection;
        const enableReadingSeparator = noSelection;

        globalThis.menu.setSiglumMenuItemEnabled(enableSiglum)
        globalThis.menu.setAddCommentMenuItemEnabled(hasSelectedContent)
        globalThis.menu.setLinkMenuItemEnabled(hasSelectedContent)
        globalThis.menu.setAddBookmarkMenuItemEnabled(false)
        globalThis.menu.setAddReadingsEnabled(enableReadingType)

        dispatchEditor(setSiglumEnabled(enableSiglum))
        dispatchEditor(setCanInsertCitation(enableCitation))
        dispatchEditor(setCommentEnabled(hasSelectedContent))
        dispatchEditor(setLinkEnabled(hasSelectedContent))
        dispatchEditor(setReadingTypeEnabled(enableReadingType))
        dispatchEditor(setReadingSeparatorEnabled(enableReadingSeparator))
    }, [dispatchEditor])

    const onDeleteApparatusWithIdHandler = useCallback((selectedApparatusIdToDelete: string) => {
        setSelectedApparatusIdToDelete(selectedApparatusIdToDelete)
        dispatchEditor(setDeleteApparatusEntryDialogVisible(true))
    }, [dispatchEditor, selectedApparatusIdToDelete])

    const onCommentCreatedHandler = useCallback(async (id: string, selectedText: string, categoryId: string | undefined) => {
        const userInfo = await window.system.getUserInfo() as unknown as UserInfo
        comment.createComment("APPARATUS_TEXT", id, selectedText, categoryId, userInfo.username)
        sidebar.setOpen(true)
        dispatchEditor(setSelectedSideviewTabIndex(0))
        setTimeout(() => {
            onCommentCreated?.(id, categoryId)
        }, 100)
    }, [window.system, comment, sidebar, dispatchEditor, onCommentCreated])

    const onUpdateTotalSearchCount = useCallback((itemId: string, count: number) => {
        totalMatchesRef.current[itemId] = count;
        const totalMatches = Object.values(totalMatchesRef.current).reduce((a, b) => a + b, 0);
        dispatchEditor(setTotalApparatusMatches(totalMatches));
    }, []);

    const onUpdateReplaceMode = useCallback((itemId: string, isReplacing: boolean) => {
        isReplacingRef.current[itemId] = isReplacing;
        const isReplacingAll = Object.values(isReplacingRef.current).reduce((a, b) => a || b, false) as boolean;
        dispatchEditor(setApparatusReplaceMode(isReplacingAll));
    }, []);

    // #region Dialog

    const deleteApparatusDialogVisible = useMemo(() => state.deleteApparatusDialogVisible, [state.deleteApparatusDialogVisible])
    const deleteApparatusEntryDialogVisible = useMemo(() => state.deleteApparatusEnytryDialogVisible, [state.deleteApparatusEnytryDialogVisible])

    const onOpenChangeApparatusDialogDelete = useCallback((value: boolean) => {
        dispatchEditor(setDeleteApparatusDialogVisible(value))
    }, [dispatchEditor])

    const notesAndCommentsIdsForApparatusIds = useCallback((ids: string[]): { notesIds: string[], commentsIds: string[] } => {
        let notesIds: string[] = [];
        let commentsIds: string[] = [];
        for (const apparatusId of ids) {
            const editor = editorRefs.current[apparatusId]
            if (editor) {
                notesIds.push(...editor.getApparatusesIds())
                commentsIds.push(...editor.getCommentsIds())
            }
        }
        return { notesIds, commentsIds }
    }, [main.apparatuses])

    const onDeleteApparatusFromDialog = useCallback(() => {
        dispatchEditor(setDeleteApparatusDialogVisible(false))
        const _apparatus = selectedApparatusToDelete
        if (!_apparatus)
            return

        apparatus.removeApparatus(_apparatus)

        const apparatusEditorRef = editorRefs.current[_apparatus.id]
        const apparatusesIds = apparatusEditorRef.getApparatusesIds()
        onDeleteApparatusesWithIds?.(apparatusesIds)

        const apparatusesCommentsIds = apparatusEditorRef.getCommentsIds()
        onCommentWithIdsDeleted?.(apparatusesCommentsIds)

        setCurrentApparatus(null)
        if (editorRefs.current[_apparatus.id]) {
            delete editorRefs.current[_apparatus.id];
        }
    }, [selectedApparatusToDelete, onDeleteApparatusesWithIds, onCommentWithIdsDeleted])

    const onOpenChangeApparatusEntryDialogDelete = useCallback((value: boolean) => () => {
        dispatchEditor(setDeleteApparatusEntryDialogVisible(value))
    }, [dispatchEditor])

    const onDeleteApparatusEntryWithId = useCallback(() => {
        if (!selectedApparatusIdToDelete)
            return
        onDeleteApparatusWithId?.(selectedApparatusIdToDelete)
        dispatchEditor(setDeleteApparatusEntryDialogVisible(false))
    }, [dispatchEditor, selectedApparatusIdToDelete])

    const onClickAddLink = useCallback(() => {
        dispatchEditor(setLinkConfigVisible(true));
    }, [dispatchEditor]);

    const hideApparatus = useCallback((item: Apparatus) => {
        const id = item.id
        const visible = !item.visible
        dispatch(expandApparatus({ id }))
        dispatch(toggleVisibilityApparatus({ id, visible }))
        electron.doc.hideApparatus(id)
    }, [])

    // #region Templates

    // @REFACTOR: Simplify this code ... WTF is this???
    const apparatusLayoutClassName = useMemo(() => cn(
        main.toolbarIsVisible && main.statusBarVisible
            ? "h-[calc(100vh-5.5rem)]" : main.statusBarVisible
                ? "h-[calc(100vh-2.5rem)]" : main.toolbarIsVisible
                    ? "h-[calc(100vh-3rem)]" : "h-[100vh]"), [main.toolbarIsVisible, main.statusBarVisible]);

    const apparatusGroupClassName = useMemo(() => {
        return cn(apparatus.expandedApparatuses.length > 0 ? "h-full" : "h-auto")
    }, [apparatus.expandedApparatuses]);

    const textStyleChanged = useCallback((style: ApparatusTextStyle) => {
        dispatchEditor(setToolbarStateFromApparatusTextStyle(style))
    }, [dispatchEditor])

    const apparatusEntryNodesChanged = useCallback((item: Apparatus) => (data: { noteId: string, nodes: Node[], style: ApparatusEntryStyle }[]) => {
        const content = data.map(entry => ({
            noteId: entry.noteId,
            apparatusId: item.id,
            entryNodes: entry.nodes,
            style: entry.style,
            emphasis: {
                bold: entry.style.fontWeight === 'bold',
                italic: entry.style.fontStyle === 'italic',
                underline: false,
            },
        }))
        dispatchEditor(updateNotesEntryNodes(content))
    }, [dispatchEditor])

    return (
        <>
            <ApparatusesLayout className={apparatusLayoutClassName}>
                <ApparatusesReorderGroup
                    className={apparatusGroupClassName}
                    apparatuses={apparatus.visibleApparatuses}
                    onReorder={apparatus.reorder}>
                    {main.documentApparatuses.length > 0 && <List
                        data={apparatus.visibleApparatuses}
                        renderItem={(item, index) => (
                            <ApparatusesReorderItem
                                key={item.id}
                                item={item}
                                visibleApparatuses={apparatus.visibleApparatuses}
                                expandedApparatuses={apparatus.expandedApparatuses}
                                drag={draggingDirection}
                                onDragEnd={handleDragEnd}>
                                {(dragControls) => (
                                    <ApparatusContainer>
                                        <ApparatusNavBar
                                            item={item}
                                            apparatuses={main.apparatuses}
                                            activeTypes={apparatus.activeTypes}
                                            disabledTypes={apparatus.disabledTypes}
                                            onPointerEnter={onPointerEnter}
                                            onClickExpand={apparatus.expand}
                                            onOpenChangeMoreMenu={onOpenChangeMoreMenu}
                                            onPointerDownMoreMenu={onPointerDownMoreMenu}
                                            disabledChangeType={
                                                // Disable change type if there is only one critical 
                                                // apparatus and the current apparatus is critical
                                                (apparatus.hasOneCriticalApparatus && item.type === 'CRITICAL')
                                                // Disable change type if the current apparatus text editor has text
                                                || Boolean(editorRefs.current[item.id]?.editor?.getText().length)
                                            }
                                            disabledChangeTypeToCritical={
                                                // Disable change type to critical 
                                                // if the current apparatus is critical
                                                (item.type === 'CRITICAL')
                                            }
                                            disabledChangeTypeToPageNotes={
                                                // Disable change type to page notes 
                                                // if the current apparatus is page notes
                                                (item.type === 'PAGE_NOTES')
                                                || apparatus.apparatusesTypes.includes('PAGE_NOTES')
                                            }
                                            disabledChangeTypeToSectionNotes={
                                                // Disable change type to section notes 
                                                // if the current apparatus is section notes
                                                (item.type === 'SECTION_NOTES')
                                                || apparatus.apparatusesTypes.includes('SECTION_NOTES')
                                            }
                                            disabledChangeTypeToInnerMargin={
                                                // Disable change type to inner margin 
                                                // if the current apparatus is inner margin
                                                (item.type === 'INNER_MARGIN')
                                                || apparatus.apparatusesTypes.includes('INNER_MARGIN')
                                            }
                                            disabledChangeTypeToOuterMargin={
                                                // Disable change type to outer margin 
                                                // if the current apparatus is outer margin
                                                (item.type === 'OUTER_MARGIN')
                                                || apparatus.apparatusesTypes.includes('OUTER_MARGIN')
                                            }
                                            activeNoteHighlights={item.notesVisible}
                                            activeCommentHighlights={item.commentsVisible}
                                            onChangeTypeToCritical={() => apparatus.changeTypeToCritical(item.id)}
                                            onChangeTypeToPageNotes={() => apparatus.changeTypeToPageNotes(item.id)}
                                            onChangeTypeToSectionNotes={() => apparatus.changeTypeToSectionNotes(item.id)}
                                            onChangeTypeToInnerMargin={() => apparatus.changeTypeToInnerMargin(item.id)}
                                            onChangeTypeToOuterMargin={() => apparatus.changeTypeToOuterMargin(item.id)}
                                            onHideApparatus={hideApparatus}
                                            disabledHideApparatus={false}
                                            disabledDeleteApparatus={
                                                main.apparatuses.length === 1
                                                || (apparatus.hasOneCriticalApparatus && item.type === 'CRITICAL')
                                            }
                                            onDeleteApparatus={onDeleteApparatus}
                                            onOpenChangeAddMenu={onOpenChangeAddMenu}
                                            onPointerDownAddMenu={onPointerDownAddMenu}
                                            onAddNewApparatus={apparatus.addNewApparatus(index)}
                                            onUpdateApparatus={apparatus.updateApparatus}
                                            onExportApparatus={onExportApparatus}
                                            onToggleNoteHighlights={toggleNoteVisibility}
                                            onToggleCommentHighlights={toggleCommentVisibility}
                                            dragControls={dragControls}
                                        />
                                        <ApparatusesTextEditorContainer
                                            expanded={item.expanded}>
                                            <ApparatusTextEditor
                                                ref={(el: HTMLApparatusTextEditorElement) => {
                                                    editorRefs.current[item.id] = el
                                                }}
                                                content={contentFromApparatus(item)}
                                                itemId={item.id}
                                                collapsed={!item.expanded}
                                                keyboardShortcuts={keyboardShortcuts}
                                                style={{ zoom: state.zoomRatio }}
                                                commentHighlightColor={commentHighlightColor}
                                                lemmaHighlightColor={lemmaHighlightColor}
                                                readingTypeAndSeparatorHighlightColor={readingTypeAndSeparatorHighlightColor}
                                                siglaHighlightColor={siglaHighlightColor}
                                                lemmaVisible={item.notesVisible}
                                                commentsVisible={item.commentsVisible}
                                                commentCategories={comment.commentCategories}
                                                readingSeparator={main.readingSeparator}
                                                emphasis={main.apparatusNoteEmphasis(item.type)}
                                                textStyle={main.apparatusNoteStyle(item.type)}
                                                onFocus={focus}
                                                onCanUpdate={canUpdate}
                                                onUpdate={update(item)}
                                                onSelectionUpdate={onSelectionUpdate}
                                                onTextStyleChange={textStyleChanged}
                                                onDeleteApparatusWithId={onDeleteApparatusWithIdHandler}
                                                onSwapMarginApparatusEntry={setSwapApparatus}
                                                onClickLemmaWithId={onClickLemmaWithId}
                                                onCommentCreated={onCommentCreatedHandler} // COMMENTS
                                                onClickCommentWithId={onClickCommentWithId}
                                                onCommentsChanged={comment.editApparatusTextCommentsContent}
                                                onCommentWithIdsDeleted={comment.hideApparatusTextCommentWithIds}
                                                onUpdateTotalSearchCount={onUpdateTotalSearchCount}
                                                onUpdateReplaceMode={onUpdateReplaceMode}
                                                onApparatusEntryNodesChanged={apparatusEntryNodesChanged(item)}
                                                onClickAddLink={onClickAddLink}
                                                onClickAddSiglum={() => {
                                                    dispatchEditor(toggleInsertSiglumDialogVisible())
                                                }}
                                                onClickAddCitation={() => {
                                                    dispatchEditor(setCitationInsertDialogVisible(true))
                                                }}
                                                onInsertReadingType={() => {
                                                    dispatchEditor(setInsertReadingTypeDialogVisible(true))
                                                }}
                                                onClickAddReferenceToChat={(text: string) => {
                                                    dispatchEditor(openChat(text))
                                                }}
                                            />
                                        </ApparatusesTextEditorContainer>
                                    </ApparatusContainer>
                                )}
                            </ApparatusesReorderItem>
                        )}
                    />}
                </ApparatusesReorderGroup>
            </ApparatusesLayout>

            <AppDialog
                open={deleteApparatusDialogVisible}
                onOpenChange={onOpenChangeApparatusDialogDelete}>
                <AppDialogContent>
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t('delete_apparatus_dialog.title')}
                        </AppDialogTitle>
                        <AppDialogDescription />
                    </AppDialogHeader>
                    <div className="p-4 space-y-4">
                        <p>{t('delete_apparatus_dialog.description')}</p>
                    </div>
                    <AppDialogFooter>
                        <AppButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onOpenChangeApparatusDialogDelete(false)}>
                            <span>{t('delete_apparatus_dialog.buttons.cancel')}</span>
                        </AppButton>
                        <AppButton
                            variant="destructive"
                            size="sm"
                            onClick={onDeleteApparatusFromDialog}>
                            <span>{t('delete_apparatus_dialog.buttons.delete')}</span>
                        </AppButton>
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>

            <AppDialog
                open={deleteApparatusEntryDialogVisible}
                onOpenChange={onOpenChangeApparatusEntryDialogDelete}>
                <AppDialogContent>
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t('delete_apparatus_entry_dialog.title')}
                        </AppDialogTitle>
                        <AppDialogDescription />
                    </AppDialogHeader>
                    <div className="p-4 space-y-4">
                        <p>{t('delete_apparatus_entry_dialog.description')}</p>
                    </div>
                    <AppDialogFooter>
                        <AppButton
                            variant="secondary"
                            size="sm"
                            onClick={onOpenChangeApparatusEntryDialogDelete(false)}>
                            <span>{t('delete_apparatus_entry_dialog.buttons.cancel')}</span>
                        </AppButton>
                        <AppButton
                            variant="destructive"
                            size="sm"
                            onClick={onDeleteApparatusEntryWithId}>
                            <span>{t('delete_apparatus_entry_dialog.buttons.delete')}</span>
                        </AppButton>
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>
        </>
    )
})