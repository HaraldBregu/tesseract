import { combineReducers } from '@reduxjs/toolkit';
import editorReducer, { EditorState } from '../pages/editor/store/editor/editor.slice';
import bookmarkReducer, { BookmarkState } from '../pages/editor/store/bookmark/bookmark.slice';
import commentsReducer, { CommentState } from '../pages/editor/store/comment/comments.slice';
import paginationReducer, { PaginationState } from '../pages/editor/store/pagination/pagination.slice';
import layoutReducer, { type SetupPageState } from '../pages/editor/store/layout/layout.sclice';
import preferencesReducer, { type PreferencesState } from '@/pages/preferences/store/preferences.slice';
import stylesReducer from '@/pages/editor/store/editor-styles/editor-styles.slice';
import { StylesState } from '@/pages/editor/store/editor-styles/editor-styles.state';
import { MetadataState } from '@/pages/editor/store/metadata/metadata.slice';
import metadataReducer from '@/pages/editor/store/metadata/metadata.slice';
// Definisci l'interfaccia dello stato globale
export interface RootState {
  editor: EditorState;
  bookmarkState: BookmarkState;
  commentState: CommentState;
  pagination: PaginationState;
  layout: SetupPageState;
  preferences: PreferencesState
  styles: StylesState
  metadata: MetadataState
}

const rootReducer = combineReducers({
  editor: editorReducer,
  bookmarkState: bookmarkReducer,
  commentState: commentsReducer,
  pagination: paginationReducer,
  layout: layoutReducer,
  preferences: preferencesReducer,
  styles: stylesReducer,
  metadata: metadataReducer,
});

export default rootReducer;