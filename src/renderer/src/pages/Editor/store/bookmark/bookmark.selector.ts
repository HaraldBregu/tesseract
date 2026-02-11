import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "src/renderer/src/store/store";

const bookmarkState = (state: RootState) => state.bookmarkState

const bookmarksSelector = createSelector(bookmarkState, (state) => state.bookmarks)

export const visibleBookmarksSelector = createSelector(bookmarksSelector, (bookmarks) => bookmarks?.filter(bookmark => bookmark.visible) || null)
export const bookmarkCategoriesSelector = createSelector(bookmarkState, (state) => state.bookmarkCategories)
