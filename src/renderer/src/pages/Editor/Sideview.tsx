import { AppTab, AppTabsList } from "@/components/ui/app-tabs-list";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEditor } from "./hooks/use-editor";
import { setSelectedSideviewTabIndex } from "./provider";
import TableOfContents, { TableOfContentsElement } from "@/components/app-table-of-contents";
import BookmarkList, { BookmarkListElement } from "./components/bookmark-list";
import CommentList, { CommentListElement } from "./components/comment-list";
import { AppDialog, AppDialogContent, AppDialogDescription, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog";
import { AppSelect, AppSelectContent, AppSelectItem, AppSelectTrigger, AppSelectValue } from "@/components/app/app-select";
import AppButton from "@/components/app/app-button";
import useComment from "./hooks/use-comment";
import useBookmark from "./hooks/use-bookmark";
import { calculateLevelCounterOffset, createTocTreeStructure, extractEditorSections } from "@/lib/toc-tree-mapper";
import { JSONContent } from "@tiptap/core";

export interface SideviewElement {
    setOpen: (open: boolean) => void
    scrollAndEditBookmark: (id: string, categoryId?: string) => void
    scrollAndEditComment: (id: string, categoryId?: string) => void
    scrollToCommentId: (id: string) => void
    scrollToBookmarkId: (id: string) => void
    updateTocStructure: (content: JSONContent | null) => void
}

interface ESideviewProps {
    onClickBookmark: (bookmark: Bookmark) => void
    onClickComment: (comment: AppComment) => void
    onClickHeadingIndex: (index: number, sectionType?: string) => void
    onScrollToSection: (sectionId: string, position?: 'top' | 'bottom') => void
    onDeleteBookmarksWithIds: (ids: string[]) => void
    onDeleteCommentsWithIds: (ids: string[]) => void
}

export default forwardRef(({
    onClickBookmark,
    onClickComment,
    onClickHeadingIndex,
    onScrollToSection,
    onDeleteBookmarksWithIds,
    onDeleteCommentsWithIds,
}: ESideviewProps,
    ref: ForwardedRef<SideviewElement>) => {

    const sidebar = useSidebar()

    useImperativeHandle(ref, () => {
        return {
            setOpen: (open: boolean) => {
                sidebar.setOpen(open)
            },
            scrollAndEditBookmark: (id: string, categoryId?: string) => {
                bookmarkRef.current?.scrollAndEditItem(id, categoryId)
            },
            scrollAndEditComment: (id: string, categoryId?: string) => {
                commentRef.current?.scrollAndEditItem(id, categoryId)
            },
            scrollToCommentId: (id: string) => {
                setTimeout(() => {
                    commentRef.current?.scrollToCommentId(id)
                }, 100);
            },
            scrollToBookmarkId: (id: string) => {
                setTimeout(() => {
                    bookmarkRef.current?.scrollToBookmarkId(id)
                }, 100);
            },
            updateTocStructure,
        }
    })

    const comment = useComment();
    const bookmark = useBookmark();
    const [state, dispatchEditor] = useEditor();
    const selectedSidebarTabIndex = useMemo(() => state.selectedSideviewTabIndex, [state.selectedSideviewTabIndex]);

    const commentRef = useRef<CommentListElement | null>(null);
    const bookmarkRef = useRef<BookmarkListElement | null>(null);
    const [tocVisible, setTocVisible] = useState(true);
    const [tabs, setTabs] = useState<AppTab[]>([
        { value: "comments", label: "1" },
        { value: "bookmarks", label: "2" },
        { value: "tableOfContents", label: "3" },
    ]);

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleTabChange = useCallback((tab: AppTab) => {
        const index = tabs.indexOf(tab);
        dispatchEditor(setSelectedSideviewTabIndex(index));
        updateTocStructure(null)
    }, [dispatchEditor, tabs])

    const tableOfContentsRef = useRef<TableOfContentsElement | null>(null)
    // VISIBLE BOOKMARKS
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    useEffect(() => {
        setBookmarks(bookmark.bookmarks ?? [])
    }, [bookmark.bookmarks])

    const bookmarksMemo = useMemo(() => bookmarks, [bookmarks, bookmark.bookmarks])

    const bookmarkCategoriesMemo = useMemo(() => bookmark.bookmarkCategories, [bookmark.bookmarkCategories])

    const [newCategoryIdToMoveBookmarks, setNewCategoryIdToMoveBookmarks] = useState<string | null>(null);

    const [deleteBookmarkCategoryDialogOpen, setDeleteBookmarkCategoryDialogOpen] = useState<{
        open: boolean,
        category?: BookmarkCategory,
        bookmarks?: Bookmark[],
        categories?: BookmarkCategory[]
    }>({ open: false });

    const [moveBookmarksFromCategoryDialogOpen, setMoveBookmarksFromCategoryDialogOpen] = useState<{
        open: boolean,
        category?: BookmarkCategory,
        categories?: BookmarkCategory[]
    }>({ open: false });

    const [deleteCommentCategoryDialogOpen, setDeleteCommentCategoryDialogOpen] = useState<{
        open: boolean,
        category?: CommentCategory,
        comments?: AppComment[],
        categories?: CommentCategory[]
    }>({ open: false });

    const [moveCommentsFromCategoryDialogOpen, setMoveCommentsFromCategoryDialogOpen] = useState<{
        open: boolean,
        category?: CommentCategory,
        categories?: CommentCategory[]
    }>({ open: false });

    const selectedTab = useMemo(() => {
        return tabs[selectedSidebarTabIndex]?.value
    }, [selectedSidebarTabIndex])

    const handleDeleteBookmarkCategory = useCallback((category: BookmarkCategory, bookmarks: Bookmark[], categories: BookmarkCategory[]) => {
        if (bookmarks.length === 0) {
            bookmark.deleteBookmarkCategory(category)
            return
        }
        setDeleteBookmarkCategoryDialogOpen({ open: true, category: category, bookmarks: bookmarks, categories: categories })
    }, [dispatch])

    const handleEditBookmark = useCallback(async (data: Bookmark) => {
        const userInfo = await window.system.getUserInfo() as unknown as UserInfo
        data.author = userInfo?.username
        bookmark.editBookmark(data)
    }, [dispatch])

    const handleDeleteBookmark = useCallback((data: Bookmark) => {
        onDeleteBookmarksWithIds([data].map(bookmark => bookmark.id))
    }, [dispatch])

    const deleteBookmarkCategoryDialogIsOpen = useMemo(() => deleteBookmarkCategoryDialogOpen.open, [deleteBookmarkCategoryDialogOpen.open])
    const bookmarksFromCategoryDialogIsOpen = useMemo(() => moveBookmarksFromCategoryDialogOpen.open, [moveBookmarksFromCategoryDialogOpen.open])
    const deleteCommentCategoryDialogIsOpen = useMemo(() => deleteCommentCategoryDialogOpen.open, [deleteCommentCategoryDialogOpen.open])
    const moveCommentsFromCategoryDialogIsOpen = useMemo(() => moveCommentsFromCategoryDialogOpen.open, [moveCommentsFromCategoryDialogOpen.open])

    const handleDeleteCategoryClose = useCallback(() => {
        setDeleteBookmarkCategoryDialogOpen({ open: false })
    }, [deleteBookmarkCategoryDialogOpen])

    const handleDeleteCategoryDelete = useCallback(() => {
        handleDeleteCategoryClose()

        if (!deleteBookmarkCategoryDialogOpen.category)
            return

        bookmark.deleteBookmarkCategory(deleteBookmarkCategoryDialogOpen.category)
        onDeleteBookmarksWithIds(deleteBookmarkCategoryDialogOpen.bookmarks?.map(bookmark => bookmark.id) ?? [])
    }, [deleteBookmarkCategoryDialogOpen])

    const handleDeleteCategoryMove = useCallback(() => {
        handleDeleteCategoryClose()
        setMoveBookmarksFromCategoryDialogOpen({
            open: true,
            category: deleteBookmarkCategoryDialogOpen.category,
            categories: deleteBookmarkCategoryDialogOpen.categories
        })
    }, [moveBookmarksFromCategoryDialogOpen, deleteBookmarkCategoryDialogOpen])

    const handleBookmarksFromCategoryClose = useCallback(() => {
        setMoveBookmarksFromCategoryDialogOpen({ open: false })
    }, [moveBookmarksFromCategoryDialogOpen])

    const handleOnSetCategoryIdToMoveBookmarks = useCallback((value: string) => {
        const categoryId = (value === "UNCATEGORISED") ? null : value
        setNewCategoryIdToMoveBookmarks(categoryId)
    }, [newCategoryIdToMoveBookmarks])

    const handleBookmarksFromCategoryMove = useCallback(() => {
        handleBookmarksFromCategoryClose()
        const categoryId = moveBookmarksFromCategoryDialogOpen.category?.id
        if (!categoryId)
            return

        bookmark.moveBookmarksFromCategory(categoryId, newCategoryIdToMoveBookmarks)

    }, [newCategoryIdToMoveBookmarks, moveBookmarksFromCategoryDialogOpen])

    const handleDeleteCommentCategoryClose = useCallback(() => {
        setDeleteCommentCategoryDialogOpen({ open: false })
    }, [deleteCommentCategoryDialogOpen])

    const handleDeleteCommentCategoryDelete = useCallback(() => {
        handleDeleteCommentCategoryClose()

        if (!deleteCommentCategoryDialogOpen.category)
            return

        comment.deleteCommentCategory(deleteCommentCategoryDialogOpen.category)
        const comments = deleteCommentCategoryDialogOpen.comments
        if (!comments || comments.length === 0)
            return
        onDeleteCommentsWithIds(comments.map(comment => comment.id))
    }, [deleteCommentCategoryDialogOpen])

    const handleDeleteCommentCategoryMove = useCallback(() => {
        handleDeleteCommentCategoryClose()
        setMoveCommentsFromCategoryDialogOpen({
            open: true,
            category: deleteCommentCategoryDialogOpen.category,
            categories: deleteCommentCategoryDialogOpen.categories
        })
    }, [moveCommentsFromCategoryDialogOpen, deleteCommentCategoryDialogOpen])

    const handleMoveCommentsFromCategoryClose = useCallback(() => {
        setMoveCommentsFromCategoryDialogOpen({ open: false })
    }, [moveCommentsFromCategoryDialogOpen])

    const handleOnSetCategoryIdToMoveComments = useCallback((value: string) => {
        const categoryId = (value === "UNCATEGORISED") ? null : value
        setNewCategoryIdToMoveBookmarks(categoryId)
    }, [newCategoryIdToMoveBookmarks])

    const handleMoveCommentsFromCategoryMove = useCallback(() => {
        handleMoveCommentsFromCategoryClose()
        const categoryId = moveCommentsFromCategoryDialogOpen.category?.id
        if (!categoryId)
            return

        comment.moveCommentsFromCategory(categoryId, newCategoryIdToMoveBookmarks)
    }, [newCategoryIdToMoveBookmarks, moveCommentsFromCategoryDialogOpen])

    const onClickHeadingIndexRef = useRef(onClickHeadingIndex);
    onClickHeadingIndexRef.current = onClickHeadingIndex;

    const handleClickHeadingIndex = useCallback((index: number, sectionType?: string) => {
        onClickHeadingIndexRef.current?.(index, sectionType);
    }, []);

    const isInitialLoadingRef = useRef(true);

    useEffect(() => {
        const getAnnotations = async () => {
            const annotations = await window.doc.getAnnotations()
            const _comments = annotations.comments
            const _commentCategories = annotations.commentCategories
            const _bookmarks = annotations.bookmarks
            const _bookmarkCategories = annotations.bookmarkCategories

            comment.setComments(_comments);
            comment.setCommentCategories(_commentCategories);
            bookmark.setBookmarks(_bookmarks);
            bookmark.setBookmarksCategories(_bookmarkCategories);
        }
        const handleTocVisibility = async () => {
            const tocSettings = await window.doc.getTocSettings()
            setTocVisible(tocSettings.show)
            handleTabsChange(tocSettings.show)
        }
        getAnnotations()
        handleTocVisibility()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            isInitialLoadingRef.current = false;
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isInitialLoadingRef.current)
            return;
        window.doc.setComments(comment.visibleComments)
    }, [comment.visibleComments])

    useEffect(() => {
        if (isInitialLoadingRef.current)
            return;
        window.doc.setCommentCategories(comment.commentCategories)
    }, [comment.commentCategories])

    useEffect(() => {
        if (isInitialLoadingRef.current)
            return;
        window.doc.setBookmarks(bookmark.bookmarks)
    }, [bookmark.bookmarks])

    useEffect(() => {
        if (isInitialLoadingRef.current)
            return;
        window.doc.setBookmarkCategories(bookmark.bookmarkCategories)
    }, [bookmark.bookmarkCategories])

    const handleTabsChange = useCallback((show: boolean) => {
        const baseTabs: AppTab[] = [
            { value: "comments", label: "1" },
            { value: "bookmarks", label: "2" },
        ];

        const tocTab: AppTab = { value: "tableOfContents", label: "3" };

        setTabs(show ? [...baseTabs, tocTab] : baseTabs);
    }, [])


    const updateTocStructure = useCallback(async (content: JSONContent | null) => {
        let _mainText = content
        if (!content) {
            _mainText = await window.doc.getMainText()
        };
        const _template = await window.doc.getTemplate()
        const _sort = _template.sort
        const _tocSettings = _template.paratextual.tocSettings

        setTocVisible(_tocSettings.show)
        handleTabsChange(_tocSettings.show ?? true)

        const { mainTextData, introductionData, bibliographyData } = extractEditorSections(_mainText);

        const mainTextContent = {
            type: "doc",
            content: mainTextData,
        }

        const introductionContent = {
            type: "doc",
            content: introductionData,
        }

        const bibliographyContent = {
            type: "doc",
            content: bibliographyData,
        }

        // Prepare all sections data for offset calculation
        const allSectionsData = {
            'intro': introductionData,
            'critical': mainTextData,
            'bibliography': bibliographyData
        };

        // Create TOC structures with continuous numbering
        const tocStructureDataIntroduction = createTocTreeStructure(
            introductionContent,
            _tocSettings,
            calculateLevelCounterOffset('intro', allSectionsData, _sort)
        );

        const tocStructureDataCriticalText = createTocTreeStructure(
            mainTextContent,
            _tocSettings,
            calculateLevelCounterOffset('critical', allSectionsData, _sort)
        );

        const tocStructureDataBibliography = createTocTreeStructure(
            bibliographyContent,
            _tocSettings,
            calculateLevelCounterOffset('bibliography', allSectionsData, _sort)
        );

        tableOfContentsRef.current?.updateTocSettings(_template, tocStructureDataCriticalText, tocStructureDataIntroduction, tocStructureDataBibliography)

    }, [tableOfContentsRef.current, tocVisible])

    return (
        <>
            <Sidebar
                collapsible="offcanvas"
                className="border-t border-grey-70 dark:border-grey-40 ">

                {/* Sidebar Header */}
                <SidebarHeader className=" dark:bg-grey-20">
                    <AppTabsList
                        tabs={tabs}
                        selectedTab={tabs[selectedSidebarTabIndex]}
                        onTabChange={handleTabChange}
                    />
                </SidebarHeader>
                <SidebarContent className=" dark:bg-grey-20">

                    {/* Comments */}
                    {selectedTab === "comments" &&
                        <CommentList
                            ref={commentRef}
                            categories={comment.commentCategories ?? []}
                            items={comment.visibleComments ?? []}
                            onCreateCategory={comment.addCommentCategory}
                            onUpdateCategory={comment.updateCommentCategory}
                            onDeleteCategory={(category: CommentCategory, comments: AppComment[], categories: CommentCategory[]) => {
                                if (comments.length === 0) {
                                    comment.deleteCommentCategory(category)
                                    return
                                }
                                setDeleteCommentCategoryDialogOpen({ open: true, category: category, comments: comments, categories: categories })
                            }}
                            onEditComment={async (data: AppComment) => {
                                const userInfo = await window.system.getUserInfo() as unknown as UserInfo
                                data.author = userInfo?.username
                                comment.editComment(data)
                            }}
                            onDeleteComment={(data: AppComment) => {
                                onDeleteCommentsWithIds([data].map(comment => comment.id))
                            }}
                            onMoveCommentToCategory={comment.moveCommentToCategory}
                            onClickComment={onClickComment}
                        />
                    }

                    {/* Bookmarks */}
                    {selectedTab === "bookmarks" &&
                        <BookmarkList
                            ref={bookmarkRef}
                            categories={bookmarkCategoriesMemo ?? []}
                            items={bookmarksMemo}
                            onCreateCategory={bookmark.addBookmarkCategory}
                            onUpdateCategory={bookmark.updateBookmarkCategory}
                            onDeleteCategory={handleDeleteBookmarkCategory}
                            onEditBookmark={handleEditBookmark}
                            onDeleteBookmark={handleDeleteBookmark}
                            onMoveBookmarkToCategory={bookmark.moveBookmarkToCategory}
                            onClickBookmark={onClickBookmark}
                        />
                    }

                    {/* Table of Contents */}
                    {selectedTab === "tableOfContents" && tocVisible &&
                        <TableOfContents
                            ref={tableOfContentsRef}
                            onClickHeadingIndex={handleClickHeadingIndex}
                            onScrollToSection={onScrollToSection}
                        />
                    }
                </SidebarContent>
            </Sidebar>

            {deleteBookmarkCategoryDialogIsOpen && <AppDialog
                open={deleteBookmarkCategoryDialogIsOpen}
                onOpenChange={handleDeleteCategoryClose}>
                <AppDialogContent>
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t('delete_bookmark_category_dialog.nav_title')}
                        </AppDialogTitle>
                        <AppDialogDescription />
                    </AppDialogHeader>
                    <div className="p-4 space-y-4">
                        <p>{t('delete_bookmark_category_dialog.title')}</p>
                        <p>{t('delete_bookmark_category_dialog.description')}</p>
                    </div>
                    <AppDialogFooter>
                        <AppButton
                            variant="secondary"
                            size="sm"
                            onClick={handleDeleteCategoryClose}>
                            <span>{t('delete_bookmark_category_dialog.buttons.cancel')}</span>
                        </AppButton>
                        <AppButton
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteCategoryDelete}>
                            <span>{t('delete_bookmark_category_dialog.buttons.delete')}</span>
                        </AppButton>
                        {deleteBookmarkCategoryDialogOpen.bookmarks && deleteBookmarkCategoryDialogOpen.bookmarks?.length > 0 &&
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteCategoryMove}>
                                <span>{t('delete_bookmark_category_dialog.buttons.move')}</span>
                            </AppButton>
                        }
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>}

            {bookmarksFromCategoryDialogIsOpen && <AppDialog
                open={bookmarksFromCategoryDialogIsOpen}
                onOpenChange={handleBookmarksFromCategoryClose}>
                <AppDialogContent>
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t('move_bookmarks_dialog.title')}
                        </AppDialogTitle>
                        <AppDialogDescription />
                    </AppDialogHeader>
                    <div className="p-4 space-y-4">
                        <p>{t('move_bookmarks_dialog.description')}</p>
                        <AppSelect
                            onValueChange={handleOnSetCategoryIdToMoveBookmarks}>
                            <AppSelectTrigger>
                                <AppSelectValue placeholder="Select a category" />
                            </AppSelectTrigger>
                            <AppSelectContent>
                                <AppSelectItem value="UNCATEGORISED">Uncategorised</AppSelectItem>
                                {moveBookmarksFromCategoryDialogOpen.categories
                                    ?.filter(category => category.id !== moveBookmarksFromCategoryDialogOpen.category?.id)
                                    .map((category) => (
                                        <AppSelectItem
                                            key={category.id}
                                            value={category.id}>
                                            {category.name}
                                        </AppSelectItem>
                                    ))}
                            </AppSelectContent>
                        </AppSelect>
                    </div>
                    <AppDialogFooter>
                        <AppButton
                            variant="secondary"
                            size="sm"
                            onClick={handleBookmarksFromCategoryClose}>
                            <span>{t('move_bookmarks_dialog.buttons.cancel')}</span>
                        </AppButton>
                        <AppButton
                            variant="outline"
                            size="sm"
                            onClick={handleBookmarksFromCategoryMove}>
                            <span>{t('move_bookmarks_dialog.buttons.move')}</span>
                        </AppButton>
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>}

            {deleteCommentCategoryDialogIsOpen && <AppDialog
                open={deleteCommentCategoryDialogIsOpen}
                onOpenChange={handleDeleteCommentCategoryClose}>
                <AppDialogContent>
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t('delete_comment_category_dialog.nav_title')}
                        </AppDialogTitle>
                        <AppDialogDescription />
                    </AppDialogHeader>
                    <div className="p-4 space-y-4">
                        <p>{t('delete_comment_category_dialog.title')}</p>
                        <p>{t('delete_comment_category_dialog.description')}</p>
                    </div>
                    <AppDialogFooter>
                        <AppButton
                            variant="secondary"
                            size="sm"
                            onClick={handleDeleteCommentCategoryClose}>
                            <span>{t('delete_comment_category_dialog.buttons.cancel')}</span>
                        </AppButton>
                        <AppButton
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteCommentCategoryDelete}>
                            <span>{t('delete_comment_category_dialog.buttons.delete')}</span>
                        </AppButton>
                        {deleteCommentCategoryDialogOpen.comments
                            && deleteCommentCategoryDialogOpen.comments?.length > 0
                            && <AppButton
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteCommentCategoryMove}>
                                <span>{t('delete_comment_category_dialog.buttons.move')}</span>
                            </AppButton>}
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>}

            {moveCommentsFromCategoryDialogIsOpen && <AppDialog
                open={moveCommentsFromCategoryDialogIsOpen}
                onOpenChange={handleMoveCommentsFromCategoryClose}>
                <AppDialogContent>
                    <AppDialogHeader>
                        <AppDialogTitle>
                            {t('move_comments_dialog.title')}
                        </AppDialogTitle>
                        <AppDialogDescription />
                    </AppDialogHeader>
                    <div className="p-4 space-y-4">
                        <p>{t('move_comments_dialog.description')}</p>
                        <AppSelect
                            onValueChange={handleOnSetCategoryIdToMoveComments}>
                            <AppSelectTrigger>
                                <AppSelectValue placeholder="Select a category" />
                            </AppSelectTrigger>
                            <AppSelectContent>
                                <AppSelectItem value="UNCATEGORISED">Uncategorised</AppSelectItem>
                                {moveCommentsFromCategoryDialogOpen.categories
                                    ?.filter(category => category.id !== moveCommentsFromCategoryDialogOpen.category?.id)
                                    .map((category) => (
                                        <AppSelectItem key={category.id} value={category.id}>{category.name}</AppSelectItem>
                                    ))}
                            </AppSelectContent>
                        </AppSelect>
                    </div>
                    <AppDialogFooter>
                        <AppButton
                            variant="secondary"
                            size="sm"
                            onClick={handleMoveCommentsFromCategoryClose}>
                            <span>{t('move_comments_dialog.buttons.cancel')}</span>
                        </AppButton>
                        <AppButton
                            variant="outline"
                            size="sm"
                            onClick={handleMoveCommentsFromCategoryMove}>
                            <span>{t('move_comments_dialog.buttons.move')}</span>
                        </AppButton>
                    </AppDialogFooter>
                </AppDialogContent>
            </AppDialog>}
        </>
    )
})
