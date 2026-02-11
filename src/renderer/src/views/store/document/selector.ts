import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

const documentState = (state: RootState) => state.document;

// Invitations selectors
export const selectInvitations = createSelector(
    documentState,
    (document) => document.invitations.data
);

export const selectInvitationsLoading = createSelector(
    documentState,
    (document) => document.invitations.loading
);

export const selectInvitationsError = createSelector(
    documentState,
    (document) => document.invitations.error
);

export const selectInvitationsPage = createSelector(
    documentState,
    (document) => document.invitations.page
);

export const selectInvitationsOriginalData = createSelector(
    documentState,
    (document) => document.invitations.originalData
);

export const selectInvitationsFilters = createSelector(
    documentState,
    (document) => document.invitations.filters
);

// My documents selectors
export const selectMyDocuments = createSelector(
    documentState,
    (document) => document.myDocuments.data
);

export const selectMyDocumentsLoading = createSelector(
    documentState,
    (document) => document.myDocuments.loading
);

export const selectMyDocumentsError = createSelector(
    documentState,
    (document) => document.myDocuments.error
);

export const selectMyDocumentsPage = createSelector(
    documentState,
    (document) => document.myDocuments.page
);

export const selectMyDocumentsOriginalData = createSelector(
    documentState,
    (document) => document.myDocuments.originalData
);

export const selectMyDocumentsFilters = createSelector(
    documentState,
    (document) => document.myDocuments.filters
);

// Accept invitation selectors
export const selectAcceptInvitationData = createSelector(
    documentState,
    (document) => document.acceptInvitation.data
);

export const selectAcceptInvitationLoading = createSelector(
    documentState,
    (document) => document.acceptInvitation.loading
);

export const selectAcceptInvitationIdLoading = createSelector(
    documentState,
    (document) => document.acceptInvitation.loadingInviteId
);

export const selectAcceptInvitationError = createSelector(
    documentState,
    (document) => document.acceptInvitation.error
);

export const selectAcceptInvitationId = createSelector(
    documentState,
    (document) => document.acceptInvitation.invitationId
);

// Revoke invitation selectors
export const selectRevokeInvitationData = createSelector(
    documentState,
    (document) => document.revokeInvitation.data
);

export const selectRevokeInvitationLoading = createSelector(
    documentState,
    (document) => document.revokeInvitation.loading
);

export const selectRevokeInvitationError = createSelector(
    documentState,
    (document) => document.revokeInvitation.error
);

export const selectRevokeInvitationId = createSelector(
    documentState,
    (document) => document.revokeInvitation.invitationId
);

export const selectRevokeInvitationIdLoading = createSelector(
    documentState,
    (document) => document.revokeInvitation.loadingInviteId
);

// Decline invitation selectors
export const selectDeclineInvitationData = createSelector(
    documentState,
    (document) => document.declineInvitation.data
);

export const selectDeclineInvitationLoading = createSelector(
    documentState,
    (document) => document.declineInvitation.loading
);

export const selectDeclineInvitationError = createSelector(
    documentState,
    (document) => document.declineInvitation.error
);

export const selectDeclineInvitationId = createSelector(
    documentState,
    (document) => document.declineInvitation.invitationId
);

export const selectDeclineInvitationIdLoading = createSelector(
    documentState,
    (document) => document.declineInvitation.loadingInviteId
);

// Resend invitation selectors
export const selectResendInvitationData = createSelector(
    documentState,
    (document) => document.resendInvitation.data
);

export const selectResendInvitationLoading = createSelector(
    documentState,
    (document) => document.resendInvitation.loading
);

export const selectResendInvitationError = createSelector(
    documentState,
    (document) => document.resendInvitation.error
);

export const selectResendInvitationId = createSelector(
    documentState,
    (document) => document.resendInvitation.invitationId
);

export const selectResendInvitationIdLoading = createSelector(
    documentState,
    (document) => document.resendInvitation.loadingInviteId
);

// Delete document selectors
export const selectDeleteDocumentData = createSelector(
    documentState,
    (document) => document.deleteDocument.data
);

export const selectDeleteDocumentLoading = createSelector(
    documentState,
    (document) => document.deleteDocument.loading
);

export const selectDeleteDocumentError = createSelector(
    documentState,
    (document) => document.deleteDocument.error
);

export const selectDeleteDocumentId = createSelector(
    documentState,
    (document) => document.deleteDocument.documentId
);

export const selectDeleteDocumentIdLoading = createSelector(
    documentState,
    (document) => document.deleteDocument.loadingDocumentId
);

// Upload document selectors
export const selectUploadDocumentData = createSelector(
    documentState,
    (document) => document.uploadDocument.data
);

export const selectUploadDocumentLoading = createSelector(
    documentState,
    (document) => document.uploadDocument.loading
);

export const selectUploadDocumentError = createSelector(
    documentState,
    (document) => document.uploadDocument.error
);

export const selectUploadDocumentId = createSelector(
    documentState,
    (document) => document.uploadDocument.documentId
);

export const selectUploadDocumentIdLoading = createSelector(
    documentState,
    (document) => document.uploadDocument.loadingDocumentId
);

// Upload document if not exists selectors
export const selectUploadDocumentIfNotExistsData = createSelector(
    documentState,
    (document) => document.uploadDocumentIfNotExists.data
);

export const selectUploadDocumentIfNotExistsLoading = createSelector(
    documentState,
    (document) => document.uploadDocumentIfNotExists.loading
);

export const selectUploadDocumentIfNotExistsError = createSelector(
    documentState,
    (document) => document.uploadDocumentIfNotExists.error
);

export const selectUploadDocumentIfNotExistsId = createSelector(
    documentState,
    (document) => document.uploadDocumentIfNotExists.documentId
);

export const selectUploadDocumentIfNotExistsFilepath = createSelector(
    documentState,
    (document) => document.uploadDocumentIfNotExists.filepath
);

export const selectUploadDocumentIfNotExistsIdLoading = createSelector(
    documentState,
    (document) => document.uploadDocumentIfNotExists.loadingDocumentId
);

// Download document selectors
export const selectDownloadDocumentData = createSelector(
    documentState,
    (document) => document.downloadDocument.data
);

export const selectDownloadDocumentDataWithFilename = createSelector(
    documentState,
    (document) => ({
        filename: document.downloadDocument.filename,
        document: document.downloadDocument.data,
    })
);

export const selectDownloadDocumentLoading = createSelector(
    documentState,
    (document) => document.downloadDocument.loading
);

export const selectDownloadDocumentError = createSelector(
    documentState,
    (document) => document.downloadDocument.error
);

export const selectDownloadDocumentId = createSelector(
    documentState,
    (document) => document.downloadDocument.documentId
);

export const selectDownloadDocumentFilename = createSelector(
    documentState,
    (document) => document.downloadDocument.filename
);

export const selectDownloadDocumentIdLoading = createSelector(
    documentState,
    (document) => document.downloadDocument.loadingDocumentId
);

// Save file selectors
export const selectSaveFileLoading = createSelector(
    documentState,
    (document) => document.saveFile.loading
);

export const selectSaveFileError = createSelector(
    documentState,
    (document) => document.saveFile.error
);

export const selectSaveFileSuccess = createSelector(
    documentState,
    (document) => document.saveFile.success
);

export const selectSaveFileDocumentIdLoading = createSelector(
    documentState,
    (document) => document.saveFile.loadingDocumentId
);

export const selectSaveFilepath = createSelector(
    documentState,
    (document) => document.saveFile.filepath
);

export const selectSaveFileFolderPath = createSelector(
    documentState,
    (document) => document.saveFile.folderPath
);

// Select folder selectors
export const selectFolderPath = createSelector(
    documentState,
    (document) => document.selectFolder.folderPath
);

export const selectFolderLoading = createSelector(
    documentState,
    (document) => document.selectFolder.loading
);

export const selectFolderError = createSelector(
    documentState,
    (document) => document.selectFolder.error
);

export const selectHasSelectedFolder = createSelector(
    selectFolderPath,
    (folderPath) => folderPath !== null && folderPath.length > 0
);

export const selectDownloadFolderPath = createSelector(
    documentState,
    (document) => document.downloadDocument.folderPath
);
