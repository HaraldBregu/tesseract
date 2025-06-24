import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Sideview from "./Sideview";
import Footer from "./Footer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Content } from "./Content";
import { useDispatch, useSelector } from "react-redux";
import {
    addApparatusAtTop,
    setBookmark,
    setComment,
    setEditorMode,
    setEmphasisState,
    toggleTocVisibility,
} from "./store/editor/editor.slice";
import {
    selectBookmarkActive,
    selectCanAddBookmark,
    selectCanAddComment,
    selectCanUndo,
    selectCommentActive,
    selectEditorMode,
    selectHeadingEnabled,
    selectHistory,
    selectToolbarEmphasisState,
    showTocChecked
} from "./store/editor/editor.selector";
import Toolbar from "./Toolbar";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Preview from "./Preview";
import { bookmarkCategoriesSelector } from "./store/bookmark/bookmark.selector";
import { commentCategoriesSelector } from "./store/comment/comments.selector";
import CustomizeToolbarModal from "./dialogs/CustomizeToolbar";
import { useReducer } from "react";
import { editorContext as EditorContext, reducer, initialState, setSiglumSetupDialogVisible, setFontFamilyList, setAddSymbolVisible, setReferenceFormatVisible, toggleInsertSiglumDialogVisible, setLineNumberSetupDialogVisible, setPageNumberSetupDialogVisible, setHeaderSetupDialogVisible, setFooterSetupDialogVisible, setPageSetupOptDialogVisible, setTocSetupDialogVisible, togglePrintPreviewVisible } from "./provider";
import Apparatuses from "./Apparatuses";
import { selectHeadingAndCustomStyles } from "./store/editor-styles/editor-styles.selector";
import { useEditor } from "./hooks/useEditor";
import AddSymbolDialog from "./dialogs/AddSymbol";
import SetupDialogs from "./dialogs/SetupDialogs";
import InsertDialogs from "./dialogs/InsertDialogs";


const EditorContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <EditorContext.Provider value={[state, dispatch]}>
            {children}
        </EditorContext.Provider>
    )
}

export const Editor = () => {
    return (
        <EditorContextProvider>
            <ELayout />
        </EditorContextProvider>
    )
}

const ELayout = () => {
    const [state, dispatchEditor] = useEditor()

    const sidebarRef = useRef<any>();
    const editorTextRef = useRef<any>();
    const editorApparatusesRef = useRef<any>();

    const [editorContainerRef, setEditorContainerRef] = useState<any>();
    const [isCustomizeToolbarOpen, setIsCustomizeToolbarOpen] = useState(false);
    const [toolbarAdditionalItems, setToolbarAdditionalItems] = useState<string[]>([]);
    const [showToolbar, setShowToolbar] = useState(true);

    const headingEnabled = useSelector(selectHeadingEnabled);
    const showToc = useSelector(showTocChecked);
    const dispatch = useDispatch();
    const canUndo = useSelector(selectCanUndo);
    const styles = useSelector(selectHeadingAndCustomStyles);
    const emphasisState = useSelector(selectToolbarEmphasisState)
    const history = useSelector(selectHistory)
    const editorMode = useSelector(selectEditorMode)
    const bookmarkCategories = useSelector(bookmarkCategoriesSelector)
    const bookmarkActive = useSelector(selectBookmarkActive)
    const canAddBookmark = useSelector(selectCanAddBookmark)
    const commentCategories = useSelector(commentCategoriesSelector)
    const commentActive = useSelector(selectCommentActive)
    const canAddComment = useSelector(selectCanAddComment)

    useIpcRenderer((ipc) => {

        ipc.on('toggle-toolbar', (_, showToolbar) => {
            setShowToolbar(showToolbar);
        });

        ipc.on("page-number-settings", () => {
            dispatchEditor(setPageNumberSetupDialogVisible(true))
        });

        ipc.on("line-numbers-settings", () => {
            dispatchEditor(setLineNumberSetupDialogVisible(true))
        });

        ipc.on("header-settings", () => {
            dispatchEditor(setHeaderSetupDialogVisible(true))
        });

        ipc.on("footer-settings", () => {
            dispatchEditor(setFooterSetupDialogVisible(true))
        });

        ipc.on("toc-settings", () => {
            dispatchEditor(setTocSetupDialogVisible(true))
        });

        ipc.on('add-apparatus', (_, type: "CRITICAL" | "PAGE_NOTES" | "SECTION_NOTES" | "INNER_MARGIN" | "OUTER_MARGIN") => {
            dispatch(addApparatusAtTop(type))
        });

        ipc.on('toggle-print-preview', (_) => {
            dispatchEditor(togglePrintPreviewVisible())
        });

        ipc.on("customize-toolbar", () => {
            setIsCustomizeToolbarOpen(true);
        });

        ipc.on("page-setup", () => {
            dispatchEditor(setPageSetupOptDialogVisible(true))
        });

        ipc.on('toolbar-additional-items', (_, items: string[]) => {
            setToolbarAdditionalItems(items);
        });

        ipc.on('toggle-toc-visibility', () => {
            dispatch(toggleTocVisibility());
        });

        ipc.on('CmdOrCtrl+Alt+T', () => {
            dispatch(toggleTocVisibility());
        });

        ipc.on('add-siglum', () => {
            dispatchEditor(toggleInsertSiglumDialogVisible())
        });

        ipc.on('sigla-setup', () => {
            dispatchEditor(setSiglumSetupDialogVisible(true))
        });

        ipc.on('references-format', () => {
            dispatchEditor(setReferenceFormatVisible(true));
        });

        ipc.send('request-system-fonts');
        ipc.on('receive-system-fonts', (_: any, fonts: string[]) => {
            dispatchEditor(setFontFamilyList(fonts))
        });

        return () => {
            ipc.off('receive-system-fonts');
            ipc.cleanup()
        }
    }, [window.electron.ipcRenderer]);

    // @REFACTOR: check again this solution, only when user change the toc visibility using the button
    useEffect(() => {
        window.menu.setTocVisibility(showToc);
    }, [showToc]);

    useEffect(() => {
        window.application.toolbarIsVisible().then(setShowToolbar);
    }, [window.application.toolbarIsVisible]);

    useEffect(() => {
        window.application.toolbarAdditionalItems().then(setToolbarAdditionalItems);
    }, [window.application.toolbarAdditionalItems]);

    // @REFACTOR: check again this solution
    const handleSaveToolbarOptions = useCallback((items: string[]) => {
        window.electron.ipcRenderer.send('application:updateToolbarAdditionalItems', items);
        setIsCustomizeToolbarOpen(false);
    }, [])

    const handleAddSymbol = useCallback((character: number) => {
        editorContainerRef?.current.insertCharacter(character);
    }, [])

    const siglumList = useMemo(() => state.siglumList, [state.siglumList]);

    const onEmphasisStateChange = useCallback((emphasisState: EmphasisState) => {
        dispatch(setEmphasisState(emphasisState))
        editorContainerRef.current?.focus()
    }, [editorContainerRef])

    // TOOLBAR

    const handleOnSelectSiglum = useCallback((siglum: Siglum) => {
        editorApparatusesRef.current?.insertSiglum(siglum)
    }, [editorApparatusesRef.current])

    const handleOnShowSiglumSetup = useCallback(() => {
        dispatchEditor(setSiglumSetupDialogVisible(true))
    }, [])

    const handleOnToggleNonPrintingCharacters = useCallback(() => {
        editorContainerRef.current?.toggleNonPrintingCharacters()
    }, [editorContainerRef])

    const handleOnHeadingLevelChange = useCallback((headingLevel: number) => {
        editorContainerRef.current?.setHeadingLevel(headingLevel)
    }, [editorContainerRef])

    const handleOnSetBody = useCallback((style?: Style) => {
        editorContainerRef.current?.setBody(style)
    }, [editorContainerRef])

    const handleOnFontFamilyChange = useCallback((fontFamily: string) => {
        editorContainerRef.current?.setFontFamily(fontFamily)
    }, [editorContainerRef])

    const handleOnFontSizeChange = useCallback((fontSize: string) => {
        editorContainerRef.current?.setFontSize(fontSize)
    }, [editorContainerRef])

    const handleOnBoldChange = useCallback((bold: boolean) => {
        editorContainerRef.current?.setBold(bold)
    }, [editorContainerRef])

    const handleOnItalicChange = useCallback((italic: boolean) => {
        editorContainerRef.current?.setItalic(italic)
    }, [editorContainerRef])

    const handleOnUnderlineChange = useCallback((underline: boolean) => {
        editorContainerRef.current?.setUnderline(underline)
    }, [editorContainerRef])

    const handleOnTextColorChange = useCallback((textColor: string) => {
        editorContainerRef.current?.setTextColor(textColor)
    }, [editorContainerRef])

    const handleOnHighlightColorChange = useCallback((highlightColor: string) => {
        editorContainerRef.current?.setHighlightColor(highlightColor)
    }, [editorContainerRef])

    const handleOnSetBlockquote = useCallback((blockquote: boolean) => {
        editorContainerRef.current?.setBlockquote(blockquote)
    }, [editorContainerRef])

    const handleOnSetTextAlignment = useCallback((alignment: string) => {
        editorContainerRef.current?.setTextAlignment(alignment)
    }, [editorContainerRef])

    const handleOnSetLineSpacing = useCallback((spacing: Spacing) => {
        editorContainerRef.current?.setLineSpacing(spacing)
    }, [editorContainerRef])

    const handleOnSetListStyle = useCallback((style: BulletStyle) => {
        editorContainerRef.current?.setListStyle(style)
    }, [editorContainerRef])

    const handleOnSetSuperscript = useCallback((superscript: boolean) => {
        editorContainerRef.current?.setSuperscript(superscript)
    }, [editorContainerRef])

    const handleOnSetSubscript = useCallback((subscript: boolean) => {
        editorContainerRef.current?.setSubscript(subscript)
    }, [editorContainerRef])

    const handleOnIncreaseIndent = useCallback(() => {
        editorContainerRef.current?.increaseIndent();
    }, [editorContainerRef])

    const handleOnDecreaseIndent = useCallback(() => {
        editorContainerRef.current?.decreaseIndent();
    }, [editorContainerRef])

    const handleOnShowCustomSpacing = useCallback(() => {
        editorContainerRef.current?.showCustomSpacing();
    }, [editorContainerRef])

    const handleOnShowResumeNumbering = useCallback(() => {
        editorContainerRef.current?.showResumeNumbering()
    }, [editorContainerRef])

    const handleOnContinuePreviousNumbering = useCallback(() => {
        editorContainerRef.current?.continuePreviousNumbering()
    }, [editorContainerRef])

    const handleOnUndo = useCallback((action?: HistoryAction) => {
        editorContainerRef.current?.undo(action)
    }, [editorContainerRef])

    const handleOnRedo = useCallback(() => {
        editorContainerRef.current?.redo()
    }, [editorContainerRef])

    const handleOnSetEditorMode = useCallback((mode: 'editing' | 'review') => {
        dispatch(setEditorMode(mode))
    }, [])

    const handleOnClickAddBookmark = useCallback((categoryId?: string) => {
        editorContainerRef.current?.addBookmark(categoryId)
    }, [editorContainerRef])

    const handleOnUnsetBookmark = useCallback(() => {
        dispatch(setBookmark(false))
        editorContainerRef.current?.unsetBookmark()
    }, [editorContainerRef])

    const handleOnClickAddComment = useCallback((categoryId?: string) => {
        editorContainerRef.current?.addComment(categoryId)
    }, [editorContainerRef])

    const handleOnUnsetComment = useCallback(() => {
        dispatch(setComment(false))
        editorContainerRef.current?.unsetComment()
    }, [editorContainerRef])

    const handleOnShowCustomizeToolbar = useCallback(() => {
        setIsCustomizeToolbarOpen(true);
    }, [])

    const handleOnShowAddSymbol = useCallback(() => {
        dispatchEditor(setAddSymbolVisible(true));
    }, [])

    const handleOnClickBookmark = useCallback((bookmark: Bookmark) => {
        editorTextRef.current?.scrollToBookmark(bookmark.id)
    }, [editorTextRef.current])

    const handleOnClickHeadingIndex = useCallback((index: number) => {
        editorTextRef.current?.scrollToHeadingIndex(index)
    }, [editorTextRef.current])

    const handleOnDeleteBookmarks = useCallback((bookmarks?: Bookmark[]) => {
        editorTextRef.current?.deleteBookmarks(bookmarks)
    }, [editorTextRef.current])

    const handleOnDeleteComments = useCallback((comments?: AppComment[]) => {
        editorTextRef.current?.deleteComments(comments)
    }, [editorTextRef.current])

    const handleOnClickComment = useCallback((comment: AppComment) => {
        editorTextRef.current?.scrollToComment(comment)
    }, [editorTextRef.current])

    const handleOnFocusContentEditor = useCallback(() => {
        setEditorContainerRef(editorTextRef)
    }, [editorTextRef.current])

    const handleOnRegisterBookmark = useCallback((id: string, categoryId?: string) => {
        sidebarRef.current?.registerBookmark(id, categoryId)
    }, [sidebarRef.current])

    const handleOnRegisterComment = useCallback((id: string, categoryId?: string) => {
        sidebarRef.current?.registerComment(id, categoryId)
    }, [sidebarRef.current])

    const handleOnFocusApparatusEditor = useCallback(() => {
        setEditorContainerRef(editorApparatusesRef)
    }, [editorApparatusesRef.current])

    return (
        <>
            <SidebarProvider defaultOpen={false}>
                <Sideview
                    ref={sidebarRef}
                    onClickBookmark={handleOnClickBookmark}
                    onClickHeadingIndex={handleOnClickHeadingIndex}
                    onDeleteBookmarks={handleOnDeleteBookmarks}
                    onDeleteComments={handleOnDeleteComments}
                    onClickComment={handleOnClickComment}
                />
                <SidebarInset className="overflow-hidden">
                    <Toolbar
                        styles={styles}
                        viewToolbar={showToolbar}
                        editorIsFocused={state.isFocused}
                        includeOptionals={toolbarAdditionalItems}
                        siglumList={siglumList}
                        onSelectSiglum={handleOnSelectSiglum}
                        onShowSiglumSetup={handleOnShowSiglumSetup}
                        toggleNonPrintingCharacters={handleOnToggleNonPrintingCharacters}
                        emphasisState={emphasisState}
                        onEmphasisStateChange={onEmphasisStateChange}
                        onHeadingLevelChange={handleOnHeadingLevelChange}
                        onSetBody={handleOnSetBody}
                        onFontFamilyChange={handleOnFontFamilyChange}
                        onFontSizeChange={handleOnFontSizeChange}
                        onBoldChange={handleOnBoldChange}
                        onItalicChange={handleOnItalicChange}
                        onUnderlineChange={handleOnUnderlineChange}
                        onTextColorChange={handleOnTextColorChange}
                        onHighlightColorChange={handleOnHighlightColorChange}
                        onSetBlockquote={handleOnSetBlockquote}
                        onSetTextAlignment={handleOnSetTextAlignment}
                        onSetLineSpacing={handleOnSetLineSpacing}
                        onSetListStyle={handleOnSetListStyle}
                        onSetSuperscript={handleOnSetSuperscript}
                        onSetSubscript={handleOnSetSubscript}
                        onIncreaseIndent={handleOnIncreaseIndent}
                        onDecreaseIndent={handleOnDecreaseIndent}
                        onShowCustomSpacing={handleOnShowCustomSpacing}
                        onShowResumeNumbering={handleOnShowResumeNumbering}
                        continuePreviousNumbering={handleOnContinuePreviousNumbering}
                        headingEnabled={headingEnabled}
                        history={history}
                        canUndo={canUndo}
                        onUndo={handleOnUndo}
                        onRedo={handleOnRedo}
                        editorMode={editorMode}
                        setEditorMode={handleOnSetEditorMode}
                        bookmarksCategories={bookmarkCategories}
                        bookmarkActive={bookmarkActive}
                        canAddBookmark={canAddBookmark}
                        onClickAddBookmark={handleOnClickAddBookmark}
                        onUnsetBookmark={handleOnUnsetBookmark}
                        commentCategories={commentCategories}
                        commentActive={commentActive}
                        canAddComment={canAddComment}
                        onClickAddComment={handleOnClickAddComment}
                        onUnsetComment={handleOnUnsetComment}
                        showCustomizeToolbar={handleOnShowCustomizeToolbar}
                        showAddSymbol={handleOnShowAddSymbol}
                    />
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel minSize={35} defaultSize={40}>
                            <Content
                                ref={editorTextRef}
                                onFocusEditor={handleOnFocusContentEditor}
                                showToolbar={showToolbar}
                                onRegisterBookmark={handleOnRegisterBookmark}
                                onRegisterComment={handleOnRegisterComment}
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel minSize={30} defaultSize={40}>
                            <Apparatuses
                                ref={editorApparatusesRef}
                                onFocusEditor={handleOnFocusApparatusEditor}
                                onRegisterComment={handleOnRegisterComment}
                            />
                        </ResizablePanel>
                        {state.printPreviewVisible &&
                            <>
                                <ResizableHandle withHandle />
                                <ResizablePanel minSize={15} maxSize={20} collapsible={true}>
                                    <Preview />
                                </ResizablePanel>
                            </>
                        }
                    </ResizablePanelGroup>

                    {/* @REFACTOR: move this modal from this position, its a simple modal */}
                    <CustomizeToolbarModal
                        existingToolbarItems={toolbarAdditionalItems} // Replace with actual existing toolbar items
                        isOpen={isCustomizeToolbarOpen}
                        onCancel={() => setIsCustomizeToolbarOpen(false)}
                        onSaveToolbarOptions={handleSaveToolbarOptions}
                    />
                    <Footer />
                </SidebarInset>
            </SidebarProvider>

            {/* @REFACTOR: move this modal from this position, use SetupDialogs or InsertDialogs */}
            <AddSymbolDialog
                isOpen={state.addSymbolVisible}
                onCancel={() => dispatchEditor(setAddSymbolVisible(false))}
                onApply={handleAddSymbol}
            />

            {/* SETUP DIALOGS */}
            <SetupDialogs />

            {/* INSERT DIALOGS */}
            <InsertDialogs
                onInsertSiglum={handleOnSelectSiglum}
            />
        </>

    )
}