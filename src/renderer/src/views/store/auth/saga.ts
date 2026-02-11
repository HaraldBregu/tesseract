import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
    login,
    loginSuccess,
    loginFailure,
    logout,
    logoutSuccess,
    logoutFailure,
    fetchUser,
    fetchUserSuccess,
    fetchUserFailure,
} from './slice';

// Worker saga for login
function* loginSaga(action: PayloadAction<LoginDataInput>) {
    try {
        // Call the login API
        const result: Result<LoginSuccess, LoginError> = 
            yield call(window.user.login, action.payload);

        // Handle success/error
        if (result.success) {
            yield put(loginSuccess(result.data));
        } else {
            yield put(loginFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('loginSaga error:', error);
        yield put(loginFailure('UNKNOWN_ERROR'));
    }
}

// Worker saga for logout
function* logoutSaga() {
    try {
        // Call the logout API
        const success: boolean = yield call(window.user.logout);
        
        if (success) {
            yield put(logoutSuccess());
        } else {
            yield put(logoutFailure('Logout failed'));
        }
    } catch (error) {
        console.error('logoutSaga error:', error);
        yield put(logoutFailure(error instanceof Error ? error.message : 'UNKNOWN_ERROR'));
    }
}

// Worker saga for fetching user
function* fetchUserSaga() {
    try {
        // Call the getCurrentUser API
        const result: Result<UserSuccess, UserError> =
            yield call(window.user.getCurrentUser);

        // Handle success/error
        if (result.success) {
            yield put(fetchUserSuccess(result.data));
        } else {
            yield put(fetchUserFailure(result.error.type));
        }
    } catch (error) {
        console.error('fetchUserSaga error:', error);
        yield put(fetchUserFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for login
function* watchLogin() {
    yield takeLatest(login.type, loginSaga);
}

// Watcher saga for logout
function* watchLogout() {
    yield takeLatest(logout.type, logoutSaga);
}

// Watcher saga for fetching user
function* watchFetchUser() {
    yield takeLatest(fetchUser.type, fetchUserSaga);
}

export default function* authSaga() {
    yield all([
        watchLogin(),
        watchLogout(),
        watchFetchUser(),
    ]);
}