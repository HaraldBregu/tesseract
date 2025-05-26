import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ESidebar from "./ESidebar";
import { EditorFooter } from "./EditorFooter";
import { useEffect, useRef, useState } from "react";
import { Content } from "./Content";
import { useDispatch, useSelector } from "react-redux";
import { getSidebarOpen } from "../store/main.selector";
import { setSidebarOpen } from "../store/main.slice";
import { selectCommentsCategories } from "./store/comment/comments.selector";
import {
    addApparatusAtTop,
    setBookmark,
    setComment,
    setEditorMode,
    setEmphasisState,
} from "./store/editor.slice";
import {
    selectBookmarkActive,
    selectCanAddBookmark,
    selectCanAddComment,
    selectCanUndo,
    selectCommentActive,
    selectEditorMode,
    selectHeadingEnabled,
    selectHistory,
    selectToolbarEmphasisState
} from "./store/editor.selector";
import Toolbar from "../../components/toolbar";
import { selectBookmarksCategories } from "./store/bookmark/bookmark.selector";
import { useIpcRenderer } from "@/hooks/use-ipc-renderer";

export const ELayout = () => {
    const sidebarRef = useRef<any>();
    const contentChildRef = useRef<any>();
    const [showToolbar, setShowToolbar] = useState(true);

    const headingEnabled = useSelector(selectHeadingEnabled);
    const sidebarOpen = useSelector(getSidebarOpen);

    const dispatch = useDispatch();
    const handleSetSidebarOpen = () => {
        dispatch(setSidebarOpen(!sidebarOpen));
    }

    const canUndo = useSelector(selectCanUndo);

    useIpcRenderer((ipc) => {
        ipc.on('toggle toolbar', (_, showToolbar) => {
            setShowToolbar(showToolbar);
        });

        ipc.on('add-apparatus', (_, type: "CRITICAL" | "PAGE_NOTES" | "SECTION_NOTES" | "INNER_MARGIN" | "OUTER_MARGIN") => {
            dispatch(addApparatusAtTop(type))
        });

        return () => {
            ipc.cleanup()
        }
    }, [window.electron.ipcRenderer]);

    useEffect(() => {
        window.application.toolbarIsVisible().then(setShowToolbar);
    }, [window.application.toolbarIsVisible]);

    return (
        <SidebarProvider open={sidebarOpen}>
            <ESidebar
                ref={sidebarRef}
                onClickBookmark={(bookmark: Bookmark) => {
                    contentChildRef.current?.scrollToBookmark(bookmark.id)
                }}
                onClickHeading={(id: string) => {
                    contentChildRef.current?.scrollToHeading(id)
                }}
                onDeleteBookmarks={(bookmarks?: Bookmark[]) => {
                    contentChildRef.current?.deleteBookmarks(bookmarks)
                }}
                onDeleteComments={(comments?: AppComment[]) => {
                    contentChildRef.current?.deleteComments(comments)
                }}
                onClickComment={(comment: AppComment) => {
                    contentChildRef.current?.scrollToComment(comment)
                }}
            />
            <SidebarInset className="overflow-hidden">
                <Toolbar
                    includeOptionals={['NON_PRINTING_CHARACTERS']}
                    viewToolbar={showToolbar}
                    sidebarOpen={sidebarOpen}
                    toggleNonPrintingCharacters={() => {
                        contentChildRef.current?.toggleNonPrintingCharacters()
                    }}
                    onClickToggleSidebar={handleSetSidebarOpen}
                    emphasisState={useSelector(selectToolbarEmphasisState)}
                    onEmphasisStateChange={(emphasisState: EmphasisState) => {
                        dispatch(setEmphasisState(emphasisState))
                        contentChildRef.current?.focus()
                    }}
                    onHeadingLevelChange={(headingLevel: number) => {
                        contentChildRef.current?.setHeadingLevel(headingLevel)
                    }}
                    onFontFamilyChange={(fontFamily: string) => {
                        contentChildRef.current?.setFontFamily(fontFamily)
                    }}
                    onFontSizeChange={(fontSize: string) => {
                        contentChildRef.current?.setFontSize(fontSize)
                    }}
                    onBoldChange={(bold: boolean) => {
                        contentChildRef.current?.setBold(bold)
                    }}
                    onItalicChange={(italic: boolean) => {
                        contentChildRef.current?.setItalic(italic)
                    }}
                    onUnderlineChange={(underline: boolean) => {
                        contentChildRef.current?.setUnderline(underline)
                    }}
                    onTextColorChange={(textColor: string) => {
                        contentChildRef.current?.setTextColor(textColor)
                    }}
                    onHighlightColorChange={(highlightColor: string) => {
                        contentChildRef.current?.setHighlightColor(highlightColor)
                    }}
                    onSetBlockquote={(blockquote: boolean) => {
                        contentChildRef.current?.setBlockquote(blockquote)
                    }}
                    onSetTextAlignment={(alignment: string) => {
                        contentChildRef.current?.setTextAlignment(alignment)
                    }}
                    onSetLineSpacing={(spacing: Spacing) => {
                        contentChildRef.current?.setLineSpacing(spacing)
                    }}
                    onSetListStyle={(style: BulletStyle) => {
                        contentChildRef.current?.setListStyle(style)
                    }}
                    onSetSuperscript={(superscript: boolean) => {
                        contentChildRef.current?.setSuperscript(superscript)
                    }}
                    onSetSubscript={(subscript: boolean) => {
                        contentChildRef.current?.setSubscript(subscript)
                    }}
                    onIncreaseIndent={() => {
                        contentChildRef.current?.increaseIndent();
                    }}
                    onDecreaseIndent={() => {
                        contentChildRef.current?.decreaseIndent();
                    }}
                    onShowCustomSpacing={() => {
                        contentChildRef.current?.showCustomSpacing();
                    }}
                    onShowResumeNumbering={() => {
                        contentChildRef.current?.showResumeNumbering()
                    }}
                    continuePreviousNumbering={() => {
                        contentChildRef.current?.continuePreviousNumbering()
                    }}
                    headingEnabled={headingEnabled}
                    // UNDO REDO HISTORY
                    history={useSelector(selectHistory)}
                    canUndo={canUndo}
                    onUndo={(action) => {
                        contentChildRef.current?.undo(action)
                    }}
                    onRedo={() => {
                        contentChildRef.current?.redo()
                    }}
                    // EDITOR MODE
                    editorMode={useSelector(selectEditorMode)}
                    setEditorMode={(mode) => {
                        dispatch(setEditorMode(mode))
                    }}
                    // BOOKMARK
                    bookmarksCategories={useSelector(selectBookmarksCategories)}
                    bookmarkActive={useSelector(selectBookmarkActive)}
                    canAddBookmark={useSelector(selectCanAddBookmark)}
                    onClickAddBookmark={(categoryId?: string) => {
                        contentChildRef.current?.addBookmark(categoryId)
                    }}
                    onUnsetBookmark={() => {
                        dispatch(setBookmark(false))
                        contentChildRef.current?.unsetBookmark()
                    }}
                    // COMMENT
                    commentCategories={useSelector(selectCommentsCategories)}
                    commentActive={useSelector(selectCommentActive)}
                    canAddComment={useSelector(selectCanAddComment)}
                    onClickAddComment={(categoryId?: string) => {
                        contentChildRef.current?.addComment(categoryId)
                    }}
                    onUnsetComment={() => {
                        dispatch(setComment(false))
                        contentChildRef.current?.unsetComment()
                    }}
                />
                <Content
                    showToolbar={showToolbar}
                    ref={contentChildRef}
                    onRegisterBookmark={(id: string, categoryId?: string) => {
                        sidebarRef.current?.registerBookmark(id, categoryId)
                    }}
                    onRegisterComment={(id: string, categoryId?: string) => {
                        sidebarRef.current?.registerComment(id, categoryId)
                    }}
                />
                <EditorFooter />
            </SidebarInset>
        </SidebarProvider>
    )
}