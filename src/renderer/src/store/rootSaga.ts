import { all } from 'redux-saga/effects';
import editorSaga from '../pages/editor/store/editor/editor.saga';
import chatSaga from '../pages/editor/store/chat/saga';
import documentSaga from '@/views/store/document/saga';
import authSaga from '@/views/store/auth/saga';

export default function* rootSaga() {
    yield all([
        editorSaga(),
        chatSaga(),
        documentSaga(),
        authSaga(),
    ]);
}
