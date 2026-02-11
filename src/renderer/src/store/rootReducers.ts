import { combineReducers } from '@reduxjs/toolkit';
import editorReducer, { EditorState } from '../pages/editor/store/editor/editor.slice';
import bookmarkReducer, { BookmarkState } from '../pages/editor/store/bookmark/bookmark.slice';
import commentsReducer, { CommentState } from '../pages/editor/store/comment/comments.slice';
import paginationReducer, { PaginationState } from '../pages/editor/store/pagination/pagination.slice';
import chatReducer from '../pages/editor/store/chat/slice';
import { ChatState } from '@/pages/editor/store/chat/state';
import documentReducer from '../views/store/document/slice';
import { DocumentState } from '../views/store/document/state';
import authReducer from '../views/store/auth/slice';
import { AuthState } from '@/views/store/auth/state';

export interface RootState {
  editor: EditorState;
  bookmarkState: BookmarkState;
  commentState: CommentState;
  pagination: PaginationState;
  chat: ChatState;
  document: DocumentState;
  auth: AuthState;
}

const rootReducer = combineReducers({
  editor: editorReducer,
  bookmarkState: bookmarkReducer,
  commentState: commentsReducer,
  pagination: paginationReducer,
  chat: chatReducer,
  document: documentReducer,
  auth: authReducer,
});

export default rootReducer;