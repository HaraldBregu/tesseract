import { all } from 'redux-saga/effects';
import editorSaga from '../pages/editor/store/editor.saga';

export default function* rootSaga() {
    yield all([
        editorSaga(),
    ]);
}
