import { combineReducers } from '@reduxjs/toolkit';
import editorReducer, { EditorState } from '../pages/editor/store/editor.slice';
import bookmarkReducer, { BookmarkState } from '../pages/editor/store/bookmark/bookmark.slice';
import commentsReducer, { CategoryStateParent } from '../pages/editor/store/comment/comments.slice';
import paginationReducer, { PaginationState } from '../pages/editor/store/pagination/pagination.slice';
import layoutReducer, { type SetupPageState } from '../pages/preferences/store/layout/layout.sclice';
import mainReducer, { MainState } from '../pages/store/main.slice';
import preferencesReducer, { type PreferencesState } from '@/pages/preferences/store/preferences.slice';
import tabsReducer, { TabsState } from './tabs/tabs.slice';
// Definisci l'interfaccia dello stato globale
export interface RootState {
  main: MainState;
  editor: EditorState;
  bookmark: BookmarkState;
  comments: CategoryStateParent;
  pagination: PaginationState;
  layout: SetupPageState;
  preferences: PreferencesState
  tabs: TabsState
}

const rootReducer = combineReducers({
  main: mainReducer,
  editor: editorReducer,
  bookmark: bookmarkReducer,
  comments: commentsReducer,
  pagination: paginationReducer,
  layout: layoutReducer,
  preferences: preferencesReducer,
  tabs: tabsReducer
});

export default rootReducer;