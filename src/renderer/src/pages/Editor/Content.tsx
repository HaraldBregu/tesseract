import {
    ForwardedRef,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectCanEdit,
} from "./store/editor/editor.selector";
import {
    setCanRedo,
    setCanUndo,
    setHeadingEnabled,
    setToolbarEnabled,
} from "./store/editor/editor.slice";
import MainTextEditor, { HTMLMainTextEditorElement } from "@/lib/editor/main-text-editor";
import {
    paragraphTemplate,
    paragraphTemplateWithParams,
    sectionDelimiter,
} from "@/lib/editor/shared/templates-mock";
import {
    createTocStructureSection,
    extractSectionsFromGlobalText,
} from "@/lib/toc-tree-mapper";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/ui/sidebar";
import { useEditor } from "./hooks/use-editor";
import {
    setBookmarkEnabled,
    setCanInsertCitation,
    setCitationInsertDialogVisible,
    setCommentEnabled,
    setCurrentSearchIndex,
    setDisableReplaceAction,
    setIsBibliographySection,
    setLinkConfigVisible,
    setCriticalReplaceMode,
    setSelectedSideviewTabIndex,
    setSiglumEnabled,
    setTotalCriticalMatches,
    toggleBookmarkHighlighted,
    toggleCommentHighlighted,
    toggleTextNoteHighlighted,
    setCanInsertSymbol,
    toggleInsertSiglumDialogVisible,
    setCharacters,
    setWords,
    setLinkEnabled,
} from "./provider";
import { cn } from "@/lib/utils";
import ContentNavBar from "./components/content-navbar";
import { Editor, FocusPosition, JSONContent } from "@tiptap/core";
import { EditorContentElement } from "./shared/types";
import { ContentLayout } from "./components/main-content-layout";
import useComment from "./hooks/use-comment";
import useBookmark from "./hooks/use-bookmark";
import { useElectron } from "@/hooks/use-electron";
import { bookmarkCategoriesSelector } from "./store/bookmark/bookmark.selector";
import { commentCategoriesSelector } from "./store/comment/comments.selector";
import { LigatureType } from "@/lib/tiptap/ligature-mark";
import { useMain } from "./hooks/use-main";
import { useContentEditor } from "./hooks/use-content-editor";
import { setToolbarStateFromMainTextStyle } from "./provider/actions/toolbar";
import { cssTocStyleForlevel, cssTocTitleStyle } from "@/utils/utils";
import { openChat } from "./provider/actions/chat";

export interface MainContentElement extends EditorContentElement {
    replace: (replacement: string) => void;
    replaceAll: (replacement: string) => void;
    setTextNoteToApparatusId: (apparatusId: string) => void;
    unsetNoteWithId: (id: string) => void;
    focus: (position?: FocusPosition) => void;
    setHeading: (style: Style) => void;
    setBody: (style?: Style) => void;
    setCustomStyle: (style: any) => void;
    setTextAlignment: (alignment: Alignment) => void;
    setBlockquote: (blockquote: boolean) => void;
    setLineSpacing: (spacing: Spacing) => void;
    setListStyle: (style: ListStyle) => void;
    setListNumbering: (numbering: number) => void;
    increaseIndent: () => void;
    decreaseIndent: () => void;
    continuePreviousNumbering: () => void;
    getSuggestedStartNumber: () => { number: number; listType: OrderedListType } | null;
    addBookmark: (color: string, categoryId?: string) => void;
    scrollToBookmark: (id: string) => void;
    unsetBookmarksWithIds: (ids: string[]) => void;
    scrollToComment: (comment: AppComment) => void;
    getCommentsIds: () => string[];
    scrollToHeadingIndex: (index: number, sectionType?: string) => void;
    scrollToSection: (id?: string, position?: 'top' | 'bottom') => void;
    setLink: (url: string) => void;
    removeLink: () => void;
    setPageBreak: () => void;
    scrollToNoteWithId: (id: string) => void;
    removeNoteWithIds: (ids: string[]) => void;
    setCase: (caseType: CasingType) => void;
    insertCitation: (citationStyle: CITATION_STYLES, citation: BibReference, style: Style, isBibliographySection: boolean) => void;
    insertBibliographies: (entries: InsertBibliography[]) => void;
    setLigature: (ligature: LigatureType) => void;
    unsetCharacterSpacing: () => void;
    increaseCharacterSpacing: () => void;
    decreaseCharacterSpacing: () => void;
    updateLayout: () => Promise<void>;
}

interface ContentProps {
    keyboardShortcuts: KeyboardShortcutCategory[];
    onFocus: (editor: Editor) => void;
    onUpdate?: () => void;
    onSelection?: (editor: Editor) => void;
    linkActive: boolean;
    zoom: number;
    onRegisterBookmark: (id: string, categoryId?: string) => void;
    scrollAndEditComment: (id: string, categoryId?: string) => void;
    onClickCommentWithId: (id: string) => void;
    onClickBookmarkWithId: (id: string) => void;
    onTextNoteCreated: (id: string, content: string, apparatusId: string) => void;
    onTextNotesChanged: (data: { noteId: string, noteContent: string }[]) => void;
    onTextNoteWithIdsDeleted: (ids: string[]) => void;
    onSelectText: (selectedText: string) => void;
    onClickNoteWithId: (ids: string) => void;
    onInsertBibliography: () => void;
    onContentUpdated: (content: JSONContent) => void;
    onCurrentSection: (section: string) => void;
}

export default forwardRef((contentProps: ContentProps, ref: ForwardedRef<MainContentElement>) => {
    const {
        keyboardShortcuts,
        onFocus,
        onUpdate,
        onSelection,
        linkActive,
        zoom,
        onRegisterBookmark,
        scrollAndEditComment,
        onClickCommentWithId,
        onClickBookmarkWithId,
        onTextNoteCreated,
        onTextNotesChanged,
        onTextNoteWithIdsDeleted,
        onSelectText,
        onClickNoteWithId,
        onInsertBibliography,
        onContentUpdated,
        onCurrentSection,
        ...props
    } = contentProps;

    const editorRef = useRef<HTMLMainTextEditorElement | null>(null);
    const { t } = useTranslation();
    const [state, dispatchEditor] = useEditor();
    const sidebar = useSidebar();
    const main = useMain()
    const comment = useComment();
    const bookmark = useBookmark();
    const electron = useElectron()
    const contentEditor = useContentEditor(editorRef);

    const commentCategories = useSelector(commentCategoriesSelector);
    const bookmarkCategories = useSelector(bookmarkCategoriesSelector);

    const canEditSelector = useSelector(selectCanEdit)
    const localStylesMemo = useMemo(() => state.styles, [state.styles])
    const paragraphStyle = state.styles.find((style) => style?.type?.toString() === "P");
    const zoomStyleMemo = useMemo(() => ({ zoom: state.zoomRatio }), [state.zoomRatio]);
    const dispatch = useDispatch();

    const tocVisible = useMemo(() => state.template?.layout.toc.visible, [state.template?.layout.toc.visible])
    const bookmarksColor = useMemo(() => state.referenceFormat?.bookmarks_color, [state.referenceFormat?.bookmarks_color])
    const textNoteHighlighted = useMemo(() => state.textNoteHighlighted, [state.textNoteHighlighted])
    const bookmarksHighlighted = useMemo(() => state.bookmarkHighlighted, [state.bookmarkHighlighted])
    const commentsHighlighted = useMemo(() => state.commentHighlighted, [state.commentHighlighted])
    const canInsertBibliography = useMemo(() => state.isBibliographySection, [state.isBibliographySection]);
    const searchCriteria = useMemo(() => state.searchCriteria, [state.searchCriteria]);
    const currentCriticalSearchIndex = useMemo(() => state.currentCriticalSearchIndex, [state.currentCriticalSearchIndex]);
    const currentSearchIndex = useMemo(() => state.currentSearchIndex, [state.currentSearchIndex]);
    const siglumColor = useMemo(() => state.referenceFormat.sigla_color, [state.referenceFormat.sigla_color])
    const commentColor = useMemo(() => state.referenceFormat.comments_color, [state.referenceFormat.comments_color]);
    const totalCriticalMatches = useMemo(() => state.totalCriticalMatches, [state.totalCriticalMatches]);

    const [introductionContent, setIntroductionContent] = useState<JSONContent[]>([]);
    const [bibliographyContent, setBibliographyContent] = useState<JSONContent[]>([]);

    useImperativeHandle(ref, () => ({
        type: () => "MAIN_TEXT",
        replace: handleReplace,
        replaceAll: handleReplaceAll,
        addSiglum: handleOnAddSiglum,
        setTextNoteToApparatusId,
        unsetNoteWithId: contentEditor.unsetNoteWithId,
        removeNoteWithIds: contentEditor.removeNoteWithIds,
        scrollToNoteWithId: contentEditor.scrollToNoteWithId,
        focus: contentEditor.focus,
        undo: contentEditor.undo,
        redo: contentEditor.redo,
        setHeading: contentEditor.setHeading,
        setBody: contentEditor.setBody,
        setCustomStyle: contentEditor.setCustomStyle,
        setTextAlignment: contentEditor.setTextAlignment,
        setFontFamily: contentEditor.setFontFamily,
        setFontSize: contentEditor.setFontSize,
        setBold: contentEditor.setBold,
        setItalic: contentEditor.setItalic,
        setUnderline: contentEditor.setUnderline,
        setStrikeThrough: contentEditor.setStrikeThrough,
        setTextColor: contentEditor.setTextColor,
        setHighlightColor: contentEditor.setHighlightColor,
        setBlockquote: contentEditor.setBlockquote,
        setLineSpacing: contentEditor.setLineSpacing,
        setListStyle: contentEditor.setListStyle,
        setSuperscript: contentEditor.setSuperscript,
        setSubscript: contentEditor.setSubscript,
        increaseIndent: contentEditor.increaseIndent,
        decreaseIndent: contentEditor.decreaseIndent,
        continuePreviousNumbering: contentEditor.continuePreviousNumbering,
        setListNumbering: contentEditor.setListNumbering,
        getSuggestedStartNumber: contentEditor.getSuggestedStartNumber,
        addBookmark,
        setShowNonPrintingCharacters: handleSetShowNonPrintingCharacters,
        scrollToBookmark: contentEditor.scrollToBookmark,
        unsetBookmarksWithIds: contentEditor.unsetBookmarksWithIds,
        addComment,
        scrollToComment: contentEditor.scrollToComment,
        unsetCommentsWithIds: contentEditor.unsetCommentsWithIds,
        getCommentsIds: contentEditor.getCommentsIds,
        scrollToHeadingIndex: contentEditor.scrollToHeadingIndex,
        scrollToSection: contentEditor.scrollToSection,
        insertCharacter: contentEditor.insertCharacter,
        setLink: contentEditor.setLink,
        removeLink: contentEditor.removeLink,
        setPageBreak,
        copy: contentEditor.copy,
        cut: contentEditor.cut,
        copyStyle: () => main.copyStyle(editorRef.current?.editor),
        paste: contentEditor.paste,
        pasteStyle: () => main.pasteStyle(editorRef.current?.editor),
        pasteWithoutFormatting: contentEditor.pasteWithoutFormatting,
        deleteSelection: contentEditor.deleteSelection,
        updateLayout,
        selectAll: contentEditor.selectAll,
        deselectAll: contentEditor.deselectAll,
        setCase: contentEditor.setCase,
        insertCitation: contentEditor.insertCitation,
        insertBibliographies: handleInsertBibliographies,
        setLigature: contentEditor.setLigature,
        unsetCharacterSpacing: contentEditor.unsetCharacterSpacing,
        increaseCharacterSpacing: contentEditor.increaseCharacterSpacing,
        decreaseCharacterSpacing: contentEditor.decreaseCharacterSpacing,
    }), [contentEditor, main]);

    const setPageBreak = useCallback(() => {
        editorRef?.current?.setPageBreak(paragraphStyle)
    }, [editorRef?.current, paragraphStyle])

    const setTextNoteToApparatusId = useCallback((apparatusId: string) => {
        editorRef.current?.setNote(main.lemmaColor, apparatusId)
    }, [editorRef.current, main.lemmaColor])

    const addComment = useCallback((color: string, categoryId?: string) => {
        editorRef?.current?.addComment(color, categoryId);
    }, [editorRef.current]);

    const addBookmark = useCallback((color: string, categoryId: string | undefined) => {
        editorRef?.current?.addBookmark(color, categoryId);
    }, [editorRef?.current]);

    const handleSetShowNonPrintingCharacters = useCallback((visible: boolean) => {
        editorRef?.current?.setShowNonPrintingCharacters(visible);
    }, [editorRef?.current]);

    const isLoadingContentRef = useRef(true);
    const initialUpdateReceivedRef = useRef(false);
    const initialLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadMainText = async () => {
            const editorText = editorRef.current
            const mainText = await window.doc.getMainText()
            if (!mainText) {
                isLoadingContentRef.current = false;
                return;
            }

            // Set content - this will trigger update events but we'll ignore them
            // The isLoadingContentRef flag will be set to false in the update callback
            // after the initial update is received, making this more reliable on slower PCs
            editorText?.setContent(mainText);
        }
        loadMainText()

        // Cleanup timeout on unmount
        return () => {
            if (initialLoadTimeoutRef.current) {
                clearTimeout(initialLoadTimeoutRef.current);
                initialLoadTimeoutRef.current = null;
            }
        };
    }, [])

    const updateLayout = useCallback(async () => {
        const editorElement = editorRef.current;
        if (!editorElement)
            return;

        const layout = await electron.doc.getLayout()
        const styles = await electron.doc.getStyles()
        const sort = await electron.doc.getSort()
        const tocSettings = await electron.doc.getTocSettings()

        let currentEditorJson = editorElement.getJSON(styles);

        const extractedMainTextData = extractSectionsFromGlobalText(currentEditorJson, "maintext");
        let extractedIntroData = extractSectionsFromGlobalText(currentEditorJson, "introduction");
        let extractedBibData = extractSectionsFromGlobalText(currentEditorJson, "bibliography");

        if (extractedIntroData.length === 0) {
            extractedIntroData = introductionContent;
        }

        if (extractedBibData.length === 0) {
            extractedBibData = bibliographyContent;
        }

        setIntroductionContent(extractedIntroData);
        setBibliographyContent(extractedBibData);

        const headingContentData = sort
            .filter(section => section !== 'toc')
            .map(section => {
                if (section === 'intro') return 'introduction';
                if (section === 'critical') return 'maintext';
                return section;
            })
            .map(data => {
                return extractSectionsFromGlobalText(currentEditorJson, data).map(item => ({ ...item, sectionType: data }));
            })
            .flatMap(sectionArr => Array.isArray(sectionArr) ? sectionArr : []);

        const formatTocText = (text: string): string =>
            text.split('\n')[0].replace(/^[\d\W_]+/, '');

        const currentTocData = createTocStructureSection(headingContentData, tocSettings)
            .map((item, index) => ({
                type: "tocParagraph",
                attrs: {
                    ...cssTocStyleForlevel(item.level, styles),
                    index,
                    spacingType: tocSettings.tabLeaderFormat,
                    tocNumber: tocSettings.showHeadingNumbers ? item.id : '',
                    text: formatTocText(item.text),
                    sectionType: item.sectionType,
                },
            }));

        const content = sort
            .filter(section => {
                if (section === 'toc' && layout[section].visible)
                    return tocSettings.show;

                return layout[section].visible;
            })
            .map(section => {
                if (section === 'intro') return 'introduction';
                if (section === 'critical') return 'maintext';
                return section;
            })
            .map(key => {

                // TOC
                const toc: JSONContent[] = [...sectionDelimiter(key, t("dividerSections.toc"))]
                if (currentTocData.length > 0) {
                    const titleParagraph = paragraphTemplateWithParams(tocSettings.title.toUpperCase(), cssTocTitleStyle(styles))
                    toc.push(
                        titleParagraph,
                        ...currentTocData,
                    )
                } else {
                    toc.push(paragraphTemplate(undefined))
                }

                // INTRODUCTION
                const intro: JSONContent[] = [...sectionDelimiter(key, t("dividerSections.introduction"))]
                const mappedIntroData = extractedIntroData
                    .filter(item => item.content && item.content.length > 0)
                    .map(item => item.content)
                if (mappedIntroData.length > 0) {
                    intro.push(...extractedIntroData)
                } else {
                    intro.push(paragraphTemplate(paragraphStyle))
                }

                // MAINTEXT
                const maintext: JSONContent[] = [...sectionDelimiter(key, t("dividerSections.mainText"))]
                const mappedMaintextData = extractedMainTextData
                    .filter(item => item.content && item.content.length > 0)
                    .map(item => item.content)
                if (mappedMaintextData.length > 0) {
                    maintext.push(...extractedMainTextData)
                } else {
                    maintext.push(paragraphTemplate(paragraphStyle))
                }

                // BIBLIOGRAPHY
                const bibliography: JSONContent[] = [...sectionDelimiter(key, t("dividerSections.bibliography"))]
                const mappedBibliographyData = extractedBibData
                    .filter(item => item.content && item.content.length > 0)
                    .map(item => item.content)
                if (mappedBibliographyData.length > 0) {
                    bibliography.push(...extractedBibData)
                } else {
                    bibliography.push(paragraphTemplate(paragraphStyle))
                }

                switch (key) {
                    case "toc": return toc;
                    case "introduction": return intro;
                    case "maintext": return maintext;
                    case "bibliography": return bibliography;
                    default: return [];
                }
            })
            .flatMap(sectionArr => Array.isArray(sectionArr) ? sectionArr : [])

        const editor = editorElement.editor;
        editor
            .chain()
            .setMeta('addToHistory', false)
            .setContent({ type: "doc", content }, true)
            .run();
        const position = layout.toc.visible ? 4 : 0;
        editor.commands.setTextSelection(position);
        editor.commands.focus();
    }, [editorRef, introductionContent, bibliographyContent, paragraphStyle]);

    const focus = useCallback((editor: Editor) => {
        dispatchEditor(setBookmarkEnabled(false))
        dispatchEditor(setCommentEnabled(false))
        globalThis.menu.setAddBookmarkMenuItemEnabled(false)
        globalThis.menu.setAddCommentMenuItemEnabled(false)

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

        onFocus(editor);
    }, [editorRef]);

    // Use it to replace isLoadingApparatusesRef
    const touchNextUpdateRef = useRef(false)
    const canUpdate = useCallback(() => {
        touchNextUpdateRef.current = true
    }, [])

    const update = useCallback(async (editor: Editor) => {
        const textEditorJson = editor.getJSON();
        if (!textEditorJson || textEditorJson.content?.length === 1)
            return;

        // CRITICAL: Skip setMainText calls during initial load
        // This prevents any "touched" state changes during document restoration
        // Using event-based approach instead of fixed timeout for reliability on slower PCs
        if (isLoadingContentRef.current) {
            // Mark that we've received the initial update from setContent
            if (!initialUpdateReceivedRef.current) {
                initialUpdateReceivedRef.current = true;
                // Use a small delay after the initial update to ignore any additional
                // initialization updates, then enable change tracking
                initialLoadTimeoutRef.current = setTimeout(() => {
                    isLoadingContentRef.current = false;
                    initialLoadTimeoutRef.current = null;
                }, 500);
            }
            return;
        }

        // Only mark as touched for real user edits after load is complete
        await window.doc.setMainText(textEditorJson, true);

        const state = editor.state
        const { selection, doc } = state;
        const { from, to } = selection;

        const selectedContent = doc.textBetween(from, to, ' ');
        window.menu.setAddNoteMenuItemEnabled(selectedContent.length > 0)

        let sections: string[] = [];
        doc.nodesBetween(0, from, (node, _) => {
            if (node.type.name === 'sectionDivider') {
                sections.push(node.attrs.sectionType);
                return false;
            }
            return true;
        });

        const currentSection = sections.at(-1);
        const isNotTocSection = currentSection !== 'toc'
        const commentEnabled = selectedContent.length > 0 && currentSection !== 'toc'
        const bookmarkEnabled = selectedContent.length > 0 && currentSection !== 'toc'
        const linkButtonEnabled = selectedContent.length > 0;
        const currentContentSelectionType = selection.$head.parent.type.name;
        const isHeadingSelection = currentContentSelectionType === 'heading';
        const isTocParagraph = currentContentSelectionType === 'tocParagraph';
        const enableSiglum = isNotTocSection && !isHeadingSelection && selectedContent.length === 0;
        const enableCitation = isNotTocSection && !isHeadingSelection && selectedContent.length === 0;
        const canInsertSymbol = isNotTocSection && !isHeadingSelection;

        globalThis.menu.setSiglumMenuItemEnabled(enableSiglum)
        globalThis.menu.setAddCitationMenuItemEnabled(enableCitation)
        globalThis.menu.setAddCommentMenuItemEnabled(commentEnabled)
        globalThis.menu.setAddBookmarkMenuItemEnabled(bookmarkEnabled)
        globalThis.menu.setLinkMenuItemEnabled(linkButtonEnabled)
        globalThis.menu.setSymbolMenuItemEnabled(canInsertSymbol);

        dispatchEditor(setSiglumEnabled(enableSiglum))
        dispatchEditor(setCanInsertCitation(enableCitation))
        dispatchEditor(setCommentEnabled(commentEnabled))
        dispatchEditor(setBookmarkEnabled(bookmarkEnabled))
        dispatchEditor(setLinkEnabled(linkButtonEnabled))
        dispatchEditor(setCanInsertSymbol(canInsertSymbol));

        if (isNotTocSection && !isTocParagraph) {
            globalThis.menu.setAddNoteMenuItemEnabled(!isHeadingSelection)
            globalThis.menu.setMenuFeatureEnabled(!isHeadingSelection);
        } else {
            globalThis.menu.setAddNoteMenuItemEnabled(false)
            globalThis.menu.setMenuFeatureEnabled(false);
        }

        onContentUpdated?.(textEditorJson);

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
    }, [])

    const handleOnEmphasisStateChange = useCallback((emphasisState: EmphasisState) => {
        dispatchEditor(setToolbarStateFromMainTextStyle({
            headingLevel: emphasisState.headingLevel,
            styleId: emphasisState.styleId,
            fontFamily: emphasisState.fontFamily,
            fontSize: emphasisState.fontSize,
            fontWeight: emphasisState.bold ? 'bold' : 'normal',
            fontStyle: emphasisState.italic ? 'italic' : 'normal',
            color: emphasisState.textColor,
            highlightColor: emphasisState.highlight,
            bold: emphasisState.bold,
            italic: emphasisState.italic,
            underline: emphasisState.underline,
            strikethrough: emphasisState.strikethrough,
            superscript: emphasisState.superscript,
            subscript: emphasisState.subscript,
            alignment: emphasisState.alignment,
            listStyle: emphasisState.listStyle,
            spacing: emphasisState.spacing,
            link: emphasisState.link,
        }))
    }, [dispatchEditor])

    const handleOnCanUndo = useCallback((value: boolean) => {
        dispatch(setCanUndo(value));
    }, [dispatch])

    const handleOnCanRedo = useCallback((value: boolean) => {
        dispatch(setCanRedo(value));
    }, [dispatch])

    const handleOnCurrentSection = useCallback((section) => {
        const isNotTocSection = section !== 'toc';
        const isBibliographySection = section === 'bibliography';

        dispatch(setHeadingEnabled(isNotTocSection))
        dispatch(setToolbarEnabled(isNotTocSection))

        dispatchEditor(setIsBibliographySection(isBibliographySection));
        dispatchEditor(setCanInsertCitation(isNotTocSection));
        dispatchEditor(setCanInsertSymbol(isNotTocSection));

        globalThis.menu.setMenuFeatureEnabled(isNotTocSection);
        globalThis.menu.setAddCitationMenuItemEnabled(isNotTocSection);
        globalThis.menu.setSymbolMenuItemEnabled(isNotTocSection);
        globalThis.menu.setCurrentSection(section);

        onCurrentSection(section);
    }, [])

    const handleOnToggleTextNoteHighlighted = useCallback(() => {
        dispatchEditor(toggleTextNoteHighlighted())
    }, [dispatchEditor])

    const handleOnToggleCommentHighlighted = useCallback(() => {
        dispatchEditor(toggleCommentHighlighted())
    }, [dispatchEditor])

    const handleOnToggleBookmarkHighlighted = useCallback(() => {
        dispatchEditor(toggleBookmarkHighlighted())
    }, [dispatchEditor])

    const handleInsertBibliographies = useCallback((entries: InsertBibliography[]) => {
        const bibStyle = localStylesMemo.find(style => style.type === "BIB");
        editorRef?.current?.insertBibliographies(bibStyle ? bibStyle : {} as Style, entries);
    }, [editorRef.current, localStylesMemo])

    const onClickAddLink = useCallback(() => {
        dispatchEditor(setLinkConfigVisible(true));
    }, [dispatchEditor]);

    useEffect(() => {
        if (!editorRef.current) return
        editorRef.current.find(searchCriteria);
    }, [editorRef, searchCriteria]);

    useEffect(() => {
        if (!editorRef.current || totalCriticalMatches === 0) return
        if (currentCriticalSearchIndex === null) {
            editorRef.current.clearActiveSearch();
        } else {
            editorRef.current.setActiveSearch(currentCriticalSearchIndex);
            dispatchEditor(setDisableReplaceAction(editorRef.current.disableReplace()));
        }
    }, [editorRef, currentCriticalSearchIndex, totalCriticalMatches]);

    const handleReplace = useCallback(async (replacement: string) => {
        if (!editorRef.current || currentCriticalSearchIndex === null) return
        const totalCriticalMatches = await editorRef?.current?.replace(replacement, currentCriticalSearchIndex, searchCriteria);
        if (totalCriticalMatches && +totalCriticalMatches > 0) {
            editorRef?.current?.setActiveSearch(currentCriticalSearchIndex);
        } else {
            dispatchEditor(setCurrentSearchIndex(currentSearchIndex));
        }
    }, [editorRef, currentCriticalSearchIndex, currentSearchIndex, searchCriteria, dispatchEditor]);

    const handleReplaceAll = useCallback((replacement: string) => {
        if (!editorRef.current) return
        editorRef?.current?.replaceAll(replacement, searchCriteria.searchTerm);
    }, [editorRef, searchCriteria.searchTerm]);

    const handleOnUpdateTotalSearchCount = useCallback((count: number) => {
        dispatchEditor(setTotalCriticalMatches(count));
    }, [dispatchEditor]);

    const handleOnUpdateReplaceMode = useCallback((isInReplaceMode: boolean) => {
        dispatchEditor(setCriticalReplaceMode(isInReplaceMode));
    }, [dispatchEditor]);

    const handleOnAddSiglum = useCallback((siglum: Siglum) => {
        if (!editorRef.current) return
        editorRef.current.addSiglum(siglum, siglumColor)
    }, [editorRef.current, siglumColor])

    const onSelectionUpdate = useCallback((editor: Editor) => {
        onSelection?.(editor)
        const state = editor.state
        const { selection } = state;
        const { from, to } = selection;
        const selectedContent = editor.state.doc.textBetween(from, to, ' ');

        let sections: string[] = [];
        editor.state.doc.nodesBetween(0, from, (node, _) => {
            if (node.type.name === 'sectionDivider') {
                sections.push(node.attrs.sectionType);
                return false;
            }
            return true;
        });

        const currentSection = sections.at(-1);
        const isNotTocSection = currentSection !== 'toc'
        const bookmarkEnabled = selectedContent.length > 0 && currentSection !== 'toc'
        const commentEnabled = selectedContent.length > 0 && currentSection !== 'toc'
        const linkButtonEnabled = selectedContent.length > 0;
        const currentContentSelectionType = selection.$head.parent.type.name;
        const isHeadingSelection = currentContentSelectionType === 'heading';
        const isTocParagraph = currentContentSelectionType === 'tocParagraph';
        const enableSiglum = isNotTocSection && !isHeadingSelection && selectedContent.length === 0;
        const enableCitation = isNotTocSection && !isHeadingSelection && selectedContent.length === 0;
        const canInsertSymbol = isNotTocSection && !isHeadingSelection;

        globalThis.menu.setAddNoteMenuItemEnabled(selectedContent.length > 0)
        globalThis.menu.setSiglumMenuItemEnabled(enableSiglum)
        globalThis.menu.setAddCitationMenuItemEnabled(enableCitation)
        globalThis.menu.setAddBookmarkMenuItemEnabled(bookmarkEnabled)
        globalThis.menu.setAddCommentMenuItemEnabled(commentEnabled)
        globalThis.menu.setLinkMenuItemEnabled(linkButtonEnabled)
        globalThis.menu.setSymbolMenuItemEnabled(canInsertSymbol);

        dispatchEditor(setSiglumEnabled(enableSiglum))
        dispatchEditor(setCanInsertCitation(enableCitation))
        dispatchEditor(setBookmarkEnabled(bookmarkEnabled))
        dispatchEditor(setCommentEnabled(commentEnabled))
        dispatchEditor(setLinkEnabled(linkButtonEnabled))
        dispatchEditor(setCanInsertSymbol(canInsertSymbol));

        if (isNotTocSection && !isTocParagraph) {
            globalThis.menu.setAddNoteMenuItemEnabled(!isHeadingSelection)
            globalThis.menu.setMenuFeatureEnabled(!isHeadingSelection);
        } else {
            globalThis.menu.setAddNoteMenuItemEnabled(false)
            globalThis.menu.setMenuFeatureEnabled(false);
        }
    }, [])

    const onCommentCreated = useCallback(async (id: string, content: string, categoryId: string | undefined) => {
        const userInfo = await window.system.getUserInfo() as unknown as UserInfo
        comment.createComment("MAIN_TEXT", id, content, categoryId, userInfo.username)
        sidebar.setOpen(true)
        dispatchEditor(setSelectedSideviewTabIndex(0))
        setTimeout(() => {
            scrollAndEditComment(id, categoryId)
        }, 100)
    }, [dispatchEditor])

    const onBookmarkCreated = useCallback(async (id: string, content: string, categoryId: string | undefined) => {
        const userInfo = await window.system.getUserInfo() as unknown as UserInfo
        bookmark.createBookmark(id, "Bookmark", content, categoryId, userInfo.username)
        sidebar.setOpen(true)
        dispatchEditor(setSelectedSideviewTabIndex(1))
        setTimeout(() => {
            onRegisterBookmark(id, categoryId)
        }, 100)
    }, [dispatchEditor])

    return (
        <ContentLayout
            {...props}
            className={cn(
                main.toolbarIsVisible && main.statusBarVisible
                    ? "h-[calc(100vh-5.5rem)]" : main.statusBarVisible
                        ? "h-[calc(100vh-2.5rem)]" : main.toolbarIsVisible
                            ? "h-[calc(100vh-3rem)]" : "h-[100vh]")
            }>
            <ContentNavBar
                disabledInsertBibliography={!canInsertBibliography}
                disabledUpdateTableOfContents={!tocVisible}
                textNoteHighlighted={textNoteHighlighted}
                commentHighlighted={commentsHighlighted}
                bookmarkHighlighted={bookmarksHighlighted}
                onInsertBibliography={onInsertBibliography}
                onUpdateTableOfContents={updateLayout}
                onToggleTextNoteHighlighted={handleOnToggleTextNoteHighlighted}
                onToggleCommentHighlighted={handleOnToggleCommentHighlighted}
                onToggleBookmarkHighlighted={handleOnToggleBookmarkHighlighted}
            />
            <MainTextEditor
                ref={editorRef}
                zoomStyle={zoomStyleMemo}
                className="flex-1 overflow-auto relative w-full"
                styles={localStylesMemo}
                editable={canEditSelector}
                keyboardShortcuts={keyboardShortcuts}
                lemmaHighlightColor={main.lemmaColor}
                siglaHighlightColor={siglumColor}
                apparatuses={main.visibleApparatuses}

                commentCategories={commentCategories}
                bookmarkCategories={bookmarkCategories}

                onFocus={focus}
                onCanUpdate={canUpdate}
                onUpdate={update}
                onCanUndo={handleOnCanUndo}
                onCanRedo={handleOnCanRedo}
                onSelectedContent={onSelectText}
                onSelectionUpdate={onSelectionUpdate}
                onCurrentSection={handleOnCurrentSection}
                onEmphasisStateChange={handleOnEmphasisStateChange} // TOOLBAR

                commentsVisible={commentsHighlighted} // COMMENTS
                commentHighlightColor={commentColor}
                onCommentCreated={onCommentCreated}
                onClickCommentWithId={onClickCommentWithId}
                onCommentsChanged={comment.editMainTextCommentsContent}
                onCommentWithIdsDeleted={comment.hideMainTextCommentWithIds}

                bookmarksVisible={bookmarksHighlighted} // BOOKMARKS
                bookmarkHighlightColor={bookmarksColor}
                onBookmarkCreated={onBookmarkCreated}
                onClickBookmarkWithId={onClickBookmarkWithId}
                onBookmarksChanged={bookmark.editBookmarksContent}
                onBookmarksWithIdsDeleted={bookmark.hideBookmarksWithIds}

                notesVisible={textNoteHighlighted} // TEXT NOTES
                onClickNoteWithId={onClickNoteWithId}
                onTextNoteCreated={onTextNoteCreated}
                onTextNotesChanged={onTextNotesChanged}
                onTextNoteWithIdsDeleted={onTextNoteWithIdsDeleted}
                onUpdateTotalSearchCount={handleOnUpdateTotalSearchCount} // SEARCH
                onUpdateReplaceMode={handleOnUpdateReplaceMode}
                onClickAddLink={onClickAddLink}
                onClickAddSiglum={() => {
                    dispatchEditor(toggleInsertSiglumDialogVisible())
                }}
                onClickAddCitation={() => {
                    dispatchEditor(setCitationInsertDialogVisible(true))
                }}
                onClickAddReferenceToChat={(text: string) => {
                    dispatchEditor(openChat(text))
                }}
            />
        </ContentLayout>
    );
});
