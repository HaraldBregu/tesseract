import { EditorAction } from "..";

export const setCommentCategoriesDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_COMMENT_CATEGORIES_DIALOG_VISIBLE',
    payload: visible
})

export const setBookmarkCategoriesDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_BOOKMARK_CATEGORIES_DIALOG_VISIBLE',
    payload: visible
})