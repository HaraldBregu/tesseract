import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface BookmarkState {
    bookmarks: Bookmark[] | null;
    bookmarkCategories: BookmarkCategory[] | null;
}

const initialState: BookmarkState = {
    bookmarks: null,
    bookmarkCategories: null,
};

const bookmarkSlice = createSlice({
    name: 'bookmarkState',
    initialState,
    reducers: {
        addBookmark(state, action: PayloadAction<{ id: string, baseTitle: string, content: string, categoryId?: string, userInfo?: string }>) {
            const sortedBookmarks = state.bookmarks?.filter(bookmark => bookmark.visible).length ?? 0

            const lastSortedNumber = sortedBookmarks + 1;

            const newBookmark: Bookmark = {
                id: action.payload.id,
                content: action.payload.content,
                title: `${action.payload.baseTitle} ${lastSortedNumber}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: action.payload.userInfo ?? "Unknown",
                visible: true,
            }

            if (action.payload.categoryId)
                newBookmark.categoryId = action.payload.categoryId

            let bookmarks = state.bookmarks
            if (!bookmarks)
                bookmarks = []

            bookmarks?.push(newBookmark)

            state.bookmarks = bookmarks
        },
        editBookmark(state, action: PayloadAction<Bookmark>) {
            const bookmark = state.bookmarks?.find(bookmark => bookmark.id === action.payload.id)
            if (bookmark) {
                bookmark.author = action.payload.author
                bookmark.title = action.payload.title
                bookmark.description = action.payload.description
                bookmark.updatedAt = new Date().toISOString()
            }
        },
        // editBookmarkContent(state, action: PayloadAction<{ bookmarkId: string, content: string }>) {
        //     const bookmark = state.bookmarks?.find(bookmark => bookmark.id === action.payload.bookmarkId)
        //     if (bookmark) {
        //         bookmark.content = action.payload.content
        //     }
        // },
        editBookmarksContent(state, action: PayloadAction<{ id: string, content: string }[]>) {
            if (!state.bookmarks)
                return

            const bookmarks = state.bookmarks
                .map(bookmark => ({
                    ...bookmark,
                    visible: action.payload.some(data => data.id === bookmark.id) || bookmark.visible,
                    content: action.payload.find(data => data.id === bookmark.id)?.content || bookmark.content
                }))

            state.bookmarks = bookmarks
        },
        hideBookmarksWithIds(state, action: PayloadAction<string[]>) {
            if (!state.bookmarks)
                return
 
            const bookmarks = state.bookmarks
                .map(bookmark => ({
                    ...bookmark,
                    visible: action.payload.includes(bookmark.id) ? false : bookmark.visible,
                }))

            state.bookmarks = bookmarks
        },
        // updateBookmarkList(state, action: PayloadAction<any[]>) {
        //     const bookmarks = action.payload
        //         .reduce((b: any[], a: any) => {
        //             let index = b.findIndex((arr: any) => arr.id == a.id);
        //             if (index > -1) b[index].content += " " + a.content;
        //             else b.push(a);
        //             return b;
        //         }, [])

        //     const bookmarkIds = bookmarks.map(bookmark => bookmark.id)

        //     if (!state.bookmarks)
        //         return

        //     const newBookmarks = state.bookmarks.map(bookmark => ({
        //         ...bookmark,
        //         visible: bookmarkIds.includes(bookmark.id)
        //     }));

        //     if (JSON.stringify(state.bookmarks) === JSON.stringify(newBookmarks)) return;
        //     state.bookmarks = newBookmarks;
        // },
        moveBookmarkToCategoryId(state, action: PayloadAction<{ bookmark: Bookmark, categoryId?: string }>) {
            const bookmark = state.bookmarks?.find(bookmark => bookmark.id === action.payload.bookmark.id)
            if (bookmark) {
                bookmark.categoryId = action.payload.categoryId
            }
        },
        addBookmarkCategory(state) {
            const bookmarkCategories = state.bookmarkCategories || []
            const bookmarkCategoryPattern = /^Category (\d+)$/;
            const matchingBookmarkCategories = bookmarkCategories.filter(categoryBookmarks =>
                bookmarkCategoryPattern.test(categoryBookmarks.name)
            );

            const sortedBookmarkCategories = matchingBookmarkCategories.sort((a, b) => {
                const aMatch = a.name.match(bookmarkCategoryPattern);
                const bMatch = b.name.match(bookmarkCategoryPattern);
                const aNum = aMatch ? parseInt(aMatch[1]) : 0;
                const bNum = bMatch ? parseInt(bMatch[1]) : 0;
                return aNum - bNum;
            });

            var lastSortedNumber = 1;
            if (sortedBookmarkCategories && sortedBookmarkCategories.length > 0) {
                const lastBookmarkCategory = sortedBookmarkCategories[sortedBookmarkCategories.length - 1];
                const number = parseInt(lastBookmarkCategory.name.match(/\d+/)?.[0] || '0');
                lastSortedNumber = number + 1;
            }

            bookmarkCategories.push({
                id: crypto.randomUUID(),
                name: `Category ${lastSortedNumber}`
            })

            state.bookmarkCategories = bookmarkCategories
        },
        deleteBookmarkCategory(state, action: PayloadAction<BookmarkCategory>) {
            if (!state.bookmarkCategories)
                return
            state.bookmarkCategories = state.bookmarkCategories.filter(category => category.id !== action.payload.id)
            if (!state.bookmarks)
                return
            state.bookmarks = state.bookmarks?.filter(bookmark => bookmark.categoryId !== action.payload.id)
        },
        updateBookmarkCategory(state, action: PayloadAction<BookmarkCategory>) {
            if (!state.bookmarkCategories)
                return
            const category = state.bookmarkCategories.find(category => category.id === action.payload.id)
            if (category) {
                category.name = action.payload.name
            }
        },
        moveBookmarksFromCategory(state, action: PayloadAction<{ categoryId: string, newCategoryId: string | null }>) {
            const bookmarks = state.bookmarks?.filter(bookmark => bookmark.categoryId === action.payload.categoryId)
            bookmarks?.forEach(bookmark => {
                bookmark.categoryId = action.payload.newCategoryId ?? undefined
            })
        },
        setBookmarks(state, action: PayloadAction<Bookmark[]>) {
            const bookmarks = action.payload
            state.bookmarks = bookmarks.filter(bookmark => bookmark.visible);
        },
        setBookmarksCategories(state, action: PayloadAction<BookmarkCategory[]>) {
            state.bookmarkCategories = action.payload ?? []
        },
    },
});

export const {
    addBookmark,
    editBookmark,
    moveBookmarkToCategoryId,
    addBookmarkCategory,
    deleteBookmarkCategory,
    updateBookmarkCategory,
    moveBookmarksFromCategory,
    setBookmarks,
    setBookmarksCategories,
    editBookmarksContent,
    hideBookmarksWithIds,
} = bookmarkSlice.actions;

export default bookmarkSlice.reducer;
