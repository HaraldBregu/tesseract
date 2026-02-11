import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addBookmark,
    addBookmarkCategory,
    deleteBookmarkCategory,
    editBookmark,
    moveBookmarksFromCategory,
    moveBookmarkToCategoryId,
    setBookmarks,
    setBookmarksCategories,
    updateBookmarkCategory,
    editBookmarksContent,
    hideBookmarksWithIds,
} from '../store/bookmark/bookmark.slice';
import {
    visibleBookmarksSelector,
    bookmarkCategoriesSelector,
} from '../store/bookmark/bookmark.selector';

export interface UseBookmarkReturn {
    editBookmarksContent: (data: { id: string, content: string }[]) => void;
    createBookmark: (id: string, baseTitle: string, content: string, categoryId?: string, userInfo?: string) => void;
    addBookmarkCategory: () => void;
    deleteBookmarkCategory: (category: BookmarkCategory) => void;
    hideBookmarksWithIds: (ids: string[]) => void;
    editBookmark: (bookmark: Bookmark) => void;
    moveBookmarksFromCategory: (categoryId: string, newCategoryId: string | null) => void;
    moveBookmarkToCategory: (bookmark: Bookmark, category: BookmarkCategory | null) => void;
    setBookmarks: (bookmarks: Bookmark[]) => void;
    setBookmarksCategories: (categories: BookmarkCategory[]) => void;
    updateBookmarkCategory: (category: BookmarkCategory) => void;
    bookmarks: Bookmark[] | null;
    bookmarkCategories: BookmarkCategory[] | null;
}

export const useBookmark = (): UseBookmarkReturn => {
    const dispatch = useDispatch();
    const bookmarks = useSelector(visibleBookmarksSelector);
    const bookmarkCategories = useSelector(bookmarkCategoriesSelector);

    const createBookmark = useCallback((id: string, baseTitle: string, content: string, categoryId?: string, userInfo?: string) => {
        dispatch(addBookmark({ id, baseTitle, content, categoryId, userInfo }));
    }, [dispatch]);

    const editBookmarksContentHandler = useCallback((data: { id: string, content: string }[]) => {
        dispatch(editBookmarksContent(data));
    }, [dispatch]);

    const addBookmarkCategoryHandler = useCallback(() => {
        dispatch(addBookmarkCategory())
    }, [dispatch]);

    const deleteBookmarkCategoryHandler = useCallback((category: BookmarkCategory) => {
        dispatch(deleteBookmarkCategory(category))
    }, [dispatch]);

    const editBookmarkHandler = useCallback((bookmark: Bookmark) => {
        dispatch(editBookmark(bookmark))
    }, [dispatch]);

    const moveBookmarksFromCategoryHandler = useCallback((categoryId: string, newCategoryId: string | null) => {
        dispatch(moveBookmarksFromCategory({ categoryId, newCategoryId }))
    }, [dispatch]);

    const moveBookmarkToCategoryHandler = useCallback((bookmark: Bookmark, category: BookmarkCategory | null) => {
        dispatch(moveBookmarkToCategoryId({ bookmark, categoryId: category?.id ?? undefined }))
    }, [dispatch]);

    const setBookmarksHandler = useCallback((bookmarks: Bookmark[]) => {
        dispatch(setBookmarks(bookmarks));
    }, [dispatch]);

    const setBookmarksCategoriesHandler = useCallback((categories: BookmarkCategory[]) => {
        dispatch(setBookmarksCategories(categories));
    }, [dispatch]);

    const updateBookmarkCategoryHandler = useCallback((category: BookmarkCategory) => {
        dispatch(updateBookmarkCategory(category))
    }, [dispatch]);

    const hideBookmarksWithIdsHandler = useCallback((ids: string[]) => {
        dispatch(hideBookmarksWithIds(ids))
    }, [dispatch]);

    return {
        bookmarks,
        bookmarkCategories,
        createBookmark,
        addBookmarkCategory: addBookmarkCategoryHandler,
        deleteBookmarkCategory: deleteBookmarkCategoryHandler,
        editBookmark: editBookmarkHandler,
        moveBookmarksFromCategory: moveBookmarksFromCategoryHandler,
        moveBookmarkToCategory: moveBookmarkToCategoryHandler,
        setBookmarks: setBookmarksHandler,
        setBookmarksCategories: setBookmarksCategoriesHandler,
        updateBookmarkCategory: updateBookmarkCategoryHandler,
        editBookmarksContent: editBookmarksContentHandler,
        hideBookmarksWithIds: hideBookmarksWithIdsHandler,
    };
};

export default useBookmark;
