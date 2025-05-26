import { RootState } from "src/renderer/src/store/store";

export const selectBookmarks = (state: RootState) => {
  if (!state.bookmark) return [];
  return state.bookmark.bookmarks.filter(bookmark => bookmark.visible);
};

export const selectBookmarksCategories = (state: RootState) => {
  if (!state.bookmark) return [];
  return state.bookmark.bookmarkCategories;
}

export const selectSelectedBookmark = (state: RootState) => {
  if (!state.bookmark) return null;
  return state.bookmark.selectedBookmark;
}
