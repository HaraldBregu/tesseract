import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  getDocumentAccess,
  getDocumentAccessSuccess,
  getDocumentAccessFailure,
  getHistory,
  getHistorySuccess,
  getHistoryFailure,
  getPartecipants,
  getPartecipantsSuccess,
  getPartecipantsFailure,
  type GetDocumentAccessPayload,
  type GetHistoryPayload,
  type GetPartecipantsPayload,
} from './slice';

// ==================== WORKER SAGAS ====================

function* getDocumentAccessSaga(action: PayloadAction<GetDocumentAccessPayload>) {
  try {
    const { documentId } = action.payload;

    const result: Result<GetChatDocumentAccessSuccess, GetChatDocumentAccessError> = yield call(() =>
      window.chat.getDocumentAccess(documentId)
    );

    if (result.success) {
      yield put(getDocumentAccessSuccess(result.data));
    } else {
      yield put(getDocumentAccessFailure(result.error.type));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get document access';
    console.error('getDocumentAccessSaga error:', error);
    yield put(getDocumentAccessFailure(errorMessage));
  }
}

function* getHistorySaga(action: PayloadAction<GetHistoryPayload>) {
  try {
    const { documentId, page = 0, size = 1000 } = action.payload;

    const result: Result<GetChatHistorySuccess, GetChatHistoryError> = yield call(() =>
      window.chat.getHistory(documentId, page, size)
    )
    
    if (result.success) {
      const sortedChat = result.data.content.toSorted((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      yield put(getHistorySuccess(sortedChat || []));
    } else {
      yield put(getHistoryFailure(result.error.type));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get chat history';
    console.error('getHistorySaga error:', error);
    yield put(getHistoryFailure(errorMessage));
  }
}

function* getPartecipantsSaga(action: PayloadAction<GetPartecipantsPayload>) {
  try {
    const { documentId } = action.payload;

    const result: Result<GetChatParticipantsSuccess, GetChatParticipantsError> = yield call(() =>
      window.chat.getPartecipants(documentId)
    );
    
    if (result.success) {
      console.log(result.data)
      yield put(getPartecipantsSuccess(result.data));
    } else {
      yield put(getPartecipantsFailure(result.error.type));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get participants';
    console.error('getPartecipantsSaga error:', error);
    yield put(getPartecipantsFailure(errorMessage));
  }
}


// ==================== WATCHER SAGAS ====================

function* watchGetDocumentAccess() {
  yield takeLatest(getDocumentAccess.type, getDocumentAccessSaga);
}

function* watchGetHistory() {
  yield takeLatest(getHistory.type, getHistorySaga);
}

function* watchGetPartecipants() {
  yield takeLatest(getPartecipants.type, getPartecipantsSaga);
}

// ==================== ROOT SAGA ====================

export default function* chatSaga() {
  yield all([
    watchGetDocumentAccess(),
    watchGetHistory(),
    watchGetPartecipants(),
  ]);
}
