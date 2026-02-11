import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DocumentState } from './state';
import {
    fetchInvitations,
    fetchInvitationsSuccess,
    fetchInvitationsFailure,
    fetchMyDocuments,
    fetchMyDocumentsSuccess,
    fetchMyDocumentsFailure,
    acceptInvitation,
    acceptInvitationSuccess,
    acceptInvitationFailure,
    revokeInvitation,
    revokeInvitationSuccess,
    revokeInvitationFailure,
    declineInvitation,
    declineInvitationSuccess,
    declineInvitationFailure,
    resendInvitation,
    resendInvitationSuccess,
    resendInvitationFailure,
    deleteDocument,
    deleteDocumentSuccess,
    deleteDocumentFailure,
    uploadDocument,
    uploadDocumentSuccess,
    uploadDocumentFailure,
    uploadDocumentIfNotExists,
    uploadDocumentIfNotExistsSuccess,
    uploadDocumentIfNotExistsFailure,
    selectFolder,
    selectFolderSuccess,
    downloadAndSaveDocument,
    downloadDocument,
    downloadDocumentSuccess,
    downloadDocumentFailure,
    clearDownloadDocument,
    saveFile,
    saveFileSuccess,
    saveFileFailure,
    updateInvitationDownloadDate
} from './slice';

// Worker saga for fetching invitations
function* fetchInvitationsSaga() {
    try {
        // Call the API
        const result: Result<GetInvitationsSuccess, GetInvitationsError> =
            yield call(window.invite.getInvitations);

        // Handle success/error
        if (result.success) {
            yield put(fetchInvitationsSuccess(result.data));
        } else {
            yield put(fetchInvitationsFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('fetchInvitationsSaga error:', error);
        yield put(fetchInvitationsFailure('UNKNOWN_ERROR'));
    }
}

// Worker saga for fetching my documents
function* fetchMyDocumentsSaga() {
    try {
        // Call the API
        const result: Result<GetMyDocumentsSuccess, GetMyDocumentsError> =
            yield call(window.shareDocument.getMyDocuments);

        // Handle success/error
        if (result.success) {
            yield put(fetchMyDocumentsSuccess(result.data));
        } else {
            yield put(fetchMyDocumentsFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('fetchMyDocumentsSaga error:', error);
        yield put(fetchMyDocumentsFailure('UNKNOWN_ERROR'));
    }
}

// Worker saga for accepting invitation
function* acceptInvitationSaga(action: PayloadAction<string>) {
    try {
        const invitationId = action.payload;

        // Call the API
        const result: Result<AcceptInvitationWithIdSuccess, AcceptInvitationWithIdError> =
            yield call(window.invite.acceptInvitationWithId, invitationId);

        // Handle success/error
        if (result.success) {
            yield put(acceptInvitationSuccess(result.data));
        } else {
            yield put(acceptInvitationFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('acceptInvitationSaga error:', error);
        yield put(acceptInvitationFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for fetching invitations
function* watchFetchInvitations() {
    yield takeLatest(fetchInvitations.type, fetchInvitationsSaga);
}

// Watcher saga for fetching my documents
function* watchFetchMyDocuments() {
    yield takeLatest(fetchMyDocuments.type, fetchMyDocumentsSaga);
}

// Watcher saga for accepting invitation
function* watchAcceptInvitation() {
    yield takeLatest(acceptInvitation.type, acceptInvitationSaga);
}

// Worker saga for revoking invitation
function* revokeInvitationSaga(action: PayloadAction<string>) {
    try {
        const invitationId = action.payload;

        // Call the API
        const result: Result<RevokeInvitationWithIdSuccess, RevokeInvitationWithIdError> =
            yield call(window.invite.revokeInvitationWithId, invitationId);

        // Handle success/error
        if (result.success) {
            yield put(revokeInvitationSuccess(result.data));
        } else {
            yield put(revokeInvitationFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('revokeInvitationSaga error:', error);
        yield put(revokeInvitationFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for revoking invitation
function* watchRevokeInvitation() {
    yield takeLatest(revokeInvitation.type, revokeInvitationSaga);
}

// Worker saga for declining invitation
function* declineInvitationSaga(action: PayloadAction<string>) {
    try {
        const invitationId = action.payload;

        // Call the API
        const result: Result<DeclineInvitationWithIdSuccess, DeclineInvitationWithIdError> =
            yield call(window.invite.declineInvitationWithId, invitationId);

        // Handle success/error
        if (result.success) {
            yield put(declineInvitationSuccess(result.data));
        } else {
            yield put(declineInvitationFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('declineInvitationSaga error:', error);
        yield put(declineInvitationFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for declining invitation
function* watchDeclineInvitation() {
    yield takeLatest(declineInvitation.type, declineInvitationSaga);
}

// Worker saga for resending invitation
function* resendInvitationSaga(action: PayloadAction<string>) {
    try {
        const invitationId = action.payload;

        // Call the API
        const result: Result<ResendInvitationWithIdSuccess, ResendInvitationWithIdError> =
            yield call(window.invite.resendInvitationWithId, invitationId);

        // Handle success/error
        if (result.success) {
            yield put(resendInvitationSuccess(result.data));
        } else {
            yield put(resendInvitationFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('resendInvitationSaga error:', error);
        yield put(resendInvitationFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for resending invitation
function* watchResendInvitation() {
    yield takeLatest(resendInvitation.type, resendInvitationSaga);
}

// Worker saga for deleting document
function* deleteDocumentSaga(action: PayloadAction<string>) {
    try {
        const documentId = action.payload;

        // Call the API
        const result: Result<DeleteDocumentWithIdSuccess, DeleteDocumentWithIdError> =
            yield call(window.shareDocument.deleteDocumentWithId, documentId);

        // Handle success/error
        if (result.success) {
            yield put(deleteDocumentSuccess(result.data));
        } else {
            yield put(deleteDocumentFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('deleteDocumentSaga error:', error);
        yield put(deleteDocumentFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for deleting document
function* watchDeleteDocument() {
    yield takeLatest(deleteDocument.type, deleteDocumentSaga);
}

// Worker saga for uploading document
function* uploadDocumentSaga(action: PayloadAction<{ documentId: string }>) {
    try {
        const { documentId } = action.payload;

        // Call the API
        const result: Result<UploadDocumentSuccess, UploadDocumentError> =
            yield call(window.doc.uploadDocument, documentId);

        // Handle success/error
        if (result.success) {
            yield put(uploadDocumentSuccess(result.data));
        } else {
            yield put(uploadDocumentFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('uploadDocumentSaga error:', error);
        yield put(uploadDocumentFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for uploading document
function* watchUploadDocument() {
    yield takeLatest(uploadDocument.type, uploadDocumentSaga);
}

// Worker saga for uploading document if not exists
function* uploadDocumentIfNotExistsSaga(action: PayloadAction<{ filepath: string; documentId: string }>) {
    try {
        const { filepath, documentId } = action.payload;

        // Call the API
        const result: Result<UploadDocumentIfNotExistsSuccess, UploadDocumentIfNotExistsError> =
            yield call(window.shareDocument.uploadDocumentIfNotExists, filepath, documentId);

        // Handle success/error
        if (result.success) {
            yield put(uploadDocumentIfNotExistsSuccess(result.data));
        } else {
            yield put(uploadDocumentIfNotExistsFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('uploadDocumentIfNotExistsSaga error:', error);
        yield put(uploadDocumentIfNotExistsFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for uploading document if not exists
function* watchUploadDocumentIfNotExists() {
    yield takeLatest(uploadDocumentIfNotExists.type, uploadDocumentIfNotExistsSaga);
}

// Worker saga for downloading and saving document (orchestrates the entire flow)
function* downloadAndSaveDocumentSaga(action: PayloadAction<{ documentId: string; filename: string | null }>) {
    try {
        const { documentId, filename } = action.payload;

        // Step 1: Prompt user to select folder (always ask, don't use stored folder)
        yield put(selectFolder());

        // Wait for user to select folder
        const folderPath: string = yield call(window.system.selectFolder);

        if (!folderPath) {
            // User cancelled folder selection - clear loading state and return
            yield put(clearDownloadDocument());
            return;
        }

        // Store the selected folder
        yield put(selectFolderSuccess(folderPath));

        // Step 2: Download the document from server
        const downloadResult: Result<DownloadDocumentSuccess, DownloadDocumentError> =
            yield call(window.shareDocument.downloadDocument, documentId);

        if (!downloadResult.success) {
            yield put(downloadDocumentFailure(downloadResult.error.type));
            return;
        }

        // Store download result
        yield put(downloadDocumentSuccess(downloadResult.data));

        // Step 3: Save the file to selected folder
        const data = downloadResult.data;

        if (!filename || !data) {
            yield put(saveFileFailure('Missing filename or data'));
            return;
        }

        // Build full file path
        const filepath = `${folderPath}/${filename}`;

        // Convert DocumentData to Record<string, unknown> for window.system.saveFile
        const content = data as unknown as Record<string, unknown>;

        // Call window.system.saveFile to save programmatically
        yield put(saveFile());

        yield call(window.system.saveFile, filepath, content);


        yield put(saveFileSuccess({ filepath }));

        // Update the invitation's downloadDate
        const currentDate = new Date().toISOString();
        yield put(updateInvitationDownloadDate({ documentId, downloadDate: currentDate }));
    } catch (error) {
        console.error('downloadAndSaveDocumentSaga error:', error);
        yield put(downloadDocumentFailure('UNKNOWN_ERROR'));
        yield put(saveFileFailure(error instanceof Error ? error.message : 'UNKNOWN_ERROR'));
    }
}

// Watcher saga for downloading and saving document
function* watchDownloadAndSaveDocument() {
    yield takeLatest(downloadAndSaveDocument.type, downloadAndSaveDocumentSaga);
}

// Worker saga for downloading document
function* downloadDocumentSaga(action: PayloadAction<{ documentId: string; filename: string | null }>) {
    try {
        const { documentId } = action.payload;

        // Call the API
        const result: Result<DownloadDocumentSuccess, DownloadDocumentError> =
            yield call(window.shareDocument.downloadDocument, documentId);

        // Handle success/error
        if (result.success) {
            yield put(downloadDocumentSuccess(result.data));
            yield put(saveFile());
        } else {
            yield put(downloadDocumentFailure(result.error.type));
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('downloadDocumentSaga error:', error);
        yield put(downloadDocumentFailure('UNKNOWN_ERROR'));
    }
}

// Watcher saga for downloading document
function* watchDownloadDocument() {
    yield takeLatest(downloadDocument.type, downloadDocumentSaga);
}

// Worker saga for saving file
function* saveFileSaga() {
    try {
        const state: { document: DocumentState } = yield select();
        const { filename, data, documentId, folderPath } = state.document.downloadDocument;

        // Validate required fields
        if (!filename || !data || !documentId) {
            yield put(saveFileFailure('Missing filename, data, or documentId'));
            return;
        }

        // Require folder path - No fallback to old approach
        if (!folderPath) {
            yield put(saveFileFailure('No folder selected. Please select a folder first.'));
            return;
        }

        // Build full file path
        const filepath = `${folderPath}/${filename}`;

        // Convert DocumentData to Record<string, unknown> for window.system.saveFile
        const content = data as unknown as Record<string, unknown>;

        // Call window.system.saveFile to save programmatically
        const savedPath: string = yield call(window.system.saveFile, filepath, content);

        if (savedPath) {
            yield put(saveFileSuccess({ filepath: savedPath }));

            // Update the invitation's downloadDate
            const currentDate = new Date().toISOString();
            yield put(updateInvitationDownloadDate({ documentId, downloadDate: currentDate }));
        } else {
            yield put(saveFileFailure('File was not saved to selected folder'));
        }
    } catch (error) {
        console.error('saveFileSaga error:', error);
        yield put(saveFileFailure(error instanceof Error ? error.message : 'UNKNOWN_ERROR'));
    }
}

// Watcher saga for saving file
function* watchSaveFile() {
    yield takeLatest(saveFile.type, saveFileSaga);
}

// Worker saga for sending invitation
// function* sendInvitationSaga() {
//     try {
//         const state: { document: DocumentState } = yield select();
//         const { filename, data, documentId, folderPath } = state.document.downloadDocument;

//         // Validate required fields
//         if (!filename || !data || !documentId) {
//             yield put(saveFileFailure('Missing filename, data, or documentId'));
//             return;
//         }

//         // Require folder path - No fallback to old approach
//         if (!folderPath) {
//             yield put(saveFileFailure('No folder selected. Please select a folder first.'));
//             return;
//         }

//         // Build full file path
//         const filepath = `${folderPath}/${filename}`;

//         // Convert DocumentData to Record<string, unknown> for window.system.saveFile
//         const content = data as unknown as Record<string, unknown>;

//         // Call window.system.saveFile to save programmatically
//         const savedPath: string = yield call(window.system.saveFile, filepath, content);

//         if (savedPath) {
//             yield put(saveFileSuccess({ filepath: savedPath }));

//             // Update the invitation's downloadDate
//             const currentDate = new Date().toISOString();
//             yield put(updateInvitationDownloadDate({ documentId, downloadDate: currentDate }));
//         } else {
//             yield put(saveFileFailure('File was not saved to selected folder'));
//         }
//     } catch (error) {
//         console.error('saveFileSaga error:', error);
//         yield put(saveFileFailure(error instanceof Error ? error.message : 'UNKNOWN_ERROR'));
//     }
// }

// Watcher saga for sendingInvitation
// function* watchSendInvitation() {
//     yield takeLatest(saveFile.type, sendInvitationSaga);
// }


export default function* documentSaga() {
    yield all([
        watchFetchInvitations(),
        watchFetchMyDocuments(),
        watchAcceptInvitation(),
        watchRevokeInvitation(),
        watchDeclineInvitation(),
        watchResendInvitation(),
        watchDeleteDocument(),
        watchUploadDocument(),
        watchUploadDocumentIfNotExists(),
        watchDownloadAndSaveDocument(),
        watchDownloadDocument(),
        watchSaveFile(),
    ]);
}
