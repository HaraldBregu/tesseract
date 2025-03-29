import { call, delay, put, takeLatest } from 'redux-saga/effects';
import { fetchDataStart, fetchDataSuccess, fetchDataFailure, setComment, executeComment, setBookmark, executeBookmark } from './editor.slice';

function* fetchDataSaga() {
    try {
        const data: string[] = yield call(fetchDataFromAPI);
        yield put(fetchDataSuccess(data));
    } catch (error) {
        console.log('Error fetching data:', error);
        yield put(fetchDataFailure());
    }
}

function* handleCommentSaga() {
    yield put(setComment(true))
    yield delay(100)
    yield put(setComment(false))
}

function* handleBookmarkSaga() {
    yield put(setBookmark(true))
    yield delay(100)
    yield put(setBookmark(false))
}


function fetchDataFromAPI(): Promise<string[]> {
    return new Promise((resolve) =>
        setTimeout(() => resolve(['Item 1', 'Item 2', 'Item 3']), 1000)
    );
}

export default function* editorSaga() {
    yield takeLatest(fetchDataStart.type, fetchDataSaga);
    yield takeLatest(executeComment.type, handleCommentSaga);
    yield takeLatest(executeBookmark.type, handleBookmarkSaga);
}
