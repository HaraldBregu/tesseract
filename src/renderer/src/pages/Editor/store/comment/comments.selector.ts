import { RootState } from "src/renderer/src/store/store";

export const selectComments = (state: RootState) => {
  if (!state.comments) return [];
  return state.comments.comments.filter(comment => comment.visible);
};

export const selectCommentsCategories = (state: RootState) => {
  if (!state.comments) return [];
  return state.comments.commentCategories;
}

export const selectSelectedComment = (state: RootState) => {
  if (!state.comments) return null;
  return state.comments.selectedComment;
}

