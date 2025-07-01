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
    toggleVisibilityApparatus,
} from "./store/editor/editor.slice";
import {
    selectApparatuses,
    selectBookmarkActive,
    selectCanAddBookmark,
    selectCanAddComment,
    selectCanUndo,
    selectCommentActive,
    selectEditorMode,
    selectHeadingEnabled,
    selectHistory,
    selectLinkActive,
    selectToolbarEmphasisState,
    selectVisibleApparatuses,
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
import { editorContext as EditorContext, reducer, initialState, setSiglumSetupDialogVisible, setFontFamilyList, setAddSymbolVisible, setReferenceFormatVisible, toggleInsertSiglumDialogVisible, setLineNumberSetupDialogVisible, setPageNumberSetupDialogVisible, setHeaderSetupDialogVisible, setFooterSetupDialogVisible, setPageSetupOptDialogVisible, setTocSetupDialogVisible, togglePrintPreviewVisible, setLinkConfigVisible } from "./provider";
import Apparatuses from "./Apparatuses";
import { selectHeadingAndCustomStyles } from "./store/editor-styles/editor-styles.selector";
import { useEditor } from "./hooks/useEditor";
import SetupDialogs from "./dialogs/SetupDialogs";
import MetadataSetup from "./dialogs/MetadataSetup";
import InsertDialogs from "./dialogs/InsertDialogs";
import LinkConfig from "./dialogs/LinkConfig";


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

    const [editorContainerRef, setEditorContainerRef] = useState<any>(editorTextRef);
    const [isCustomizeToolbarOpen, setIsCustomizeToolbarOpen] = useState(false);
    const [isMetadataOpen, setIsMetadataOpen] = useState(false);

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
    const linkActive = useSelector(selectLinkActive);
    const currentLink = useMemo(() => emphasisState.link, [emphasisState.link]);
    const linkConfigVisible = useMemo(() => state.linkConfigVisible, [state.linkConfigVisible]);

    const handleInsertLink = useCallback((link: string) => {
        editorContainerRef?.current.setLink(link);
        dispatchEditor(setLinkConfigVisible(false));
    }, [editorContainerRef, dispatchEditor]);

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
        ipc.on("metadata", () => {
            setIsMetadataOpen(true)
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

        ipc.on('insert-link', () => {
            dispatchEditor(setLinkConfigVisible(true));
        });

        ipc.on('remove-link', () => {
            handleRemoveLink();
        });

        ipc.on('CmdOrCtrl+Shift+K', () => {
            handleRemoveLink();
        });

        ipc.on('CmdOrCtrl+K', () => {
            dispatchEditor(setLinkConfigVisible(true));
        });

        ipc.send('request-system-fonts');
        ipc.on('receive-system-fonts', (_: any, fonts: string[]) => {
            dispatchEditor(setFontFamilyList(fonts))
        });

        ipc.on('cut', () => {
            editorContainerRef?.current.cut();
        });

        ipc.on('copy', () => {
            editorContainerRef?.current.copy();
        });

        ipc.on('copy-style', () => {
            editorContainerRef?.current.copyStyle();
        });

        ipc.on('paste', () => {
            editorContainerRef?.current.paste();
        });

        ipc.on('paste-style', () => {
            editorContainerRef?.current.pasteStyle();
        });

        ipc.on('insert-symbol', () => {
            handleOnShowAddSymbol();
        });

        return () => {
            ipc.off('receive-system-fonts');
            ipc.cleanup()
        }
    }, [window.electron.ipcRenderer, editorContainerRef]);

    // @REFACTOR: check again this solution, only when user change the toc visibility using the button
    useEffect(() => {
        window.menu.setTocVisibility(showToc);
    }, [showToc]);

    useEffect(() => {
        window.application.toolbarIsVisible().then(setShowToolbar);
    }, []);

    useEffect(() => {
        window.application.toolbarAdditionalItems().then(setToolbarAdditionalItems);
    }, []);

    // @REFACTOR: check again this solution
    const handleSaveToolbarOptions = useCallback((items: string[]) => {
        window.electron.ipcRenderer.send('application:updateToolbarAdditionalItems', items);
        setIsCustomizeToolbarOpen(false);
    }, [])

    const handleAddSymbol = useCallback((character: number) => {
        editorContainerRef?.current.insertCharacter(character);
    }, [editorContainerRef])

    const siglumList = useMemo(() => state.siglumList, [state.siglumList]);

    const onEmphasisStateChange = useCallback((emphasisState: EmphasisState) => {
        dispatch(setEmphasisState(emphasisState))
        editorContainerRef.current?.focus()
    }, [dispatch, editorContainerRef])

    // TOOLBAR

    const handleOnSelectSiglum = useCallback((siglum: Siglum) => {
        editorApparatusesRef.current?.insertSiglum(siglum)
    }, [])

    const handleOnShowSiglumSetup = useCallback(() => {
        dispatchEditor(setSiglumSetupDialogVisible(true))
    }, [dispatchEditor])

    const handleOnToggleNonPrintingCharacters = useCallback(() => {
        editorContainerRef.current?.toggleNonPrintingCharacters()
    }, [editorContainerRef])

    const handleOnHeadingChange = useCallback((style: Style) => {
        editorContainerRef.current?.setHeading(style)
    }, [editorContainerRef])

    const handleOnSetBody = useCallback((style?: Style) => {
        editorContainerRef.current?.setBody(style)
    }, [editorContainerRef])

    const handleOnSetCustomStyle = useCallback((style?: Style) => {
        editorContainerRef.current?.setCustomStyle(style)
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
    }, [dispatch])

    const handleOnClickAddBookmark = useCallback((categoryId?: string) => {
        const color = state.referenceFormat.bookmarks_color
        editorContainerRef.current?.addBookmark(color, categoryId)
    }, [editorContainerRef, state.referenceFormat])

    const handleOnUnsetBookmark = useCallback(() => {
        dispatch(setBookmark(false))
        editorContainerRef.current?.unsetBookmark()
    }, [dispatch, editorContainerRef])

    const handleOnClickAddComment = useCallback((categoryId?: string) => {
        const color = state.referenceFormat.comments_color
        editorContainerRef.current?.addComment(color, categoryId)
    }, [editorContainerRef, state.referenceFormat])

    const handleOnUnsetComment = useCallback(() => {
        dispatch(setComment(false))
        editorContainerRef.current?.unsetComment()
    }, [dispatch, editorContainerRef])

    const handleOnShowCustomizeToolbar = useCallback(() => {
        setIsCustomizeToolbarOpen(true);
    }, [])

    const handleOnShowAddSymbol = useCallback(() => {
        dispatchEditor(setAddSymbolVisible(true));
    }, [dispatchEditor])

    const handleOnClickBookmark = useCallback((bookmark: Bookmark) => {
        editorTextRef.current?.scrollToBookmark(bookmark.id)
    }, [])

    const handleOnClickHeadingIndex = useCallback((index: number) => {
        editorTextRef.current?.scrollToHeadingIndex(index)
    }, [])

    const handleOnDeleteBookmarks = useCallback((bookmarks?: Bookmark[]) => {
        editorTextRef.current?.deleteBookmarks(bookmarks)
    }, [])

    const handleOnDeleteComments = useCallback((comments?: AppComment[]) => {
        editorTextRef.current?.deleteComments(comments)
    }, [])

    const handleOnClickComment = useCallback((comment: AppComment) => {
        editorContainerRef.current?.scrollToComment(comment)
    }, [editorContainerRef])

    const handleOnFocusContentEditor = useCallback(() => {
        setEditorContainerRef(editorTextRef)
    }, [])

    const handleOnRegisterBookmark = useCallback((id: string, categoryId?: string) => {
        sidebarRef.current?.registerBookmark(id, categoryId)
    }, [])

    const handleOnRegisterComment = useCallback((id: string, categoryId?: string) => {
        sidebarRef.current?.registerComment(id, categoryId)
    }, [])

    const handleOnFocusApparatusEditor = useCallback(() => {
        setEditorContainerRef(editorApparatusesRef)
    }, [])

    const handleOnShowLinkConfig = useCallback(() => {
        dispatchEditor(setLinkConfigVisible(true))
    }, [dispatchEditor])

    const handleRemoveLink = useCallback(() => {
        editorContainerRef.current?.removeLink();
    }, [editorContainerRef])

    const apparatuses = useSelector(selectApparatuses)
    const visibleApparatuses = useSelector(selectVisibleApparatuses)

    useIpcRenderer((ipc) => {
        ipc.on("view-apparatus", (_, data: any) => {
            dispatch(toggleVisibilityApparatus({
                id: data.id,
                visible: !data.visible
            }))
        })
    }, [window.electron])

    useEffect(() => {
        const items = apparatuses.map((apparatus) => {
            return {
                id: apparatus.id,
                title: apparatus.title,
                visible: apparatus.visible,
                disabled: false,
            }
        })
        window.menu.updateViewApparatusesMenuItems(items)
    }, [apparatuses])

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
                        onHeadingLevelChange={(level) => {
                            editorContainerRef.current?.setHeadingLevel(level)
                        }}
                        onHeadingChange={handleOnHeadingChange}
                        onSetBody={handleOnSetBody}
                        onCustomStyleChange={handleOnSetCustomStyle}
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
                        linkActive={linkActive}
                        showLinkConfig={handleOnShowLinkConfig}
                        removeLink={handleRemoveLink}
                    />
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel
                            minSize={35}
                            defaultSize={40}>
                            <Content
                                ref={editorTextRef}
                                onFocusEditor={handleOnFocusContentEditor}
                                showToolbar={showToolbar}
                                linkActive={linkActive}
                                onRegisterBookmark={handleOnRegisterBookmark}
                                onRegisterComment={handleOnRegisterComment}
                            />
                        </ResizablePanel>
                        {visibleApparatuses.length > 0 &&
                            <>
                                <ResizableHandle withHandle />
                                <ResizablePanel
                                    minSize={30}
                                    defaultSize={40}>
                                    <Apparatuses
                                        ref={editorApparatusesRef}
                                        showToolbar={showToolbar}
                                        linkActive={linkActive}
                                        onFocusEditor={handleOnFocusApparatusEditor}
                                        onRegisterComment={handleOnRegisterComment}
                                    />
                                </ResizablePanel>
                            </>
                        }
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

            {/* Link Config Dialog */}
            {linkConfigVisible && <LinkConfig
                isOpen={linkConfigVisible}
                onCancel={() => dispatchEditor(setLinkConfigVisible(false))}
                onDone={handleInsertLink}
                currentLink={currentLink} // Get current link if available
            />}

            {/* SETUP DIALOGS */}
            <SetupDialogs />

            {/* INSERT DIALOGS */}
            <InsertDialogs
                onInsertSiglum={handleOnSelectSiglum}
                onAddSymbol={handleAddSymbol}
            />

            {isMetadataOpen && <MetadataSetup
                isOpen={isMetadataOpen}
                onClose={() => setIsMetadataOpen(false)}
                metadata={window.doc.getMetadata()}
                onSave={(metadata) => window.doc.setMetadata(metadata)}
            />}
        </>

    )
}