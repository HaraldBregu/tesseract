import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './state';

const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        fetchInvitations(state) {
            state.invitations.loading = true;
            state.invitations.error = null;
        },

        fetchInvitationsSuccess(state, action: PayloadAction<GetInvitationsSuccess>) {
            state.invitations.data = action.payload.content;
            state.invitations.originalData = action.payload.content;
            state.invitations.page = action.payload.page;
            state.invitations.loading = false;
            state.invitations.error = null;
            state.invitations.filters = null;
        },

        fetchInvitationsFailure(state, action: PayloadAction<GetInvitationsError['type']>) {
            state.invitations.loading = false;
            state.invitations.error = action.payload;
        },

        clearInvitations(state) {
            state.invitations = initialState.invitations;
        },

        fetchMyDocuments(state) {
            state.myDocuments.loading = true;
            state.myDocuments.error = null;
        },

        fetchMyDocumentsSuccess(state, action: PayloadAction<GetMyDocumentsSuccess>) {
            state.myDocuments.data = action.payload.content;
            state.myDocuments.originalData = action.payload.content;
            state.myDocuments.page = action.payload.page;
            state.myDocuments.loading = false;
            state.myDocuments.error = null;
            state.myDocuments.filters = null;
        },

        fetchMyDocumentsFailure(state, action: PayloadAction<GetMyDocumentsError['type']>) {
            state.myDocuments.loading = false;
            state.myDocuments.error = action.payload;
        },

        clearMyDocuments(state) {
            state.myDocuments = initialState.myDocuments;
        },

        filterMyDocuments(state, action: PayloadAction<{ filename: string; collaboratorFullName: string; invitationStatus: InvitationStatus | 'All' }>) {
            const { filename, collaboratorFullName, invitationStatus } = action.payload;

            // Store the filter criteria
            state.myDocuments.filters = {
                filename,
                collaboratorFullName,
                invitationStatus
            };

            // Normalize filters
            const normalizedFileName = filename.trim().toLowerCase();
            const normalizedUserFullName = collaboratorFullName.trim().toLowerCase();

            // Apply filters to originalData
            state.myDocuments.data = state.myDocuments.originalData.filter(document => {
                const filenameMatch = normalizedFileName.length === 0
                    ? true
                    : (document.fileName ?? '').toLowerCase().includes(normalizedFileName);

                const userFullNameMatch = normalizedUserFullName.length === 0
                    ? true
                    : document.inviteDocumentResponseDTOS?.some(invite =>
                        (invite.invitedUserDto.userName ?? '').toLowerCase().includes(normalizedUserFullName) ||
                        (invite.invitedUserDto.userSurname ?? '').toLowerCase().includes(normalizedUserFullName)
                    );

                const statusMatch = invitationStatus === 'All'
                    ? true
                    : document.inviteDocumentResponseDTOS?.some(invite => invite.invitationStatus === invitationStatus);

                return filenameMatch && userFullNameMatch && statusMatch;
            });
        },

        clearMyDocumentsFilter(state) {
            state.myDocuments.filters = null;
            state.myDocuments.data = state.myDocuments.originalData;
        },

        filterInvitations(state, action: PayloadAction<{ filename: string; userFullName: string; invitationStatus: InvitationStatus | 'All' }>) {
            const { filename, userFullName, invitationStatus } = action.payload;

            // Store the filter criteria
            state.invitations.filters = {
                filename,
                userFullName,
                invitationStatus
            };

            // Normalize filters
            const normalizedFileName = filename.trim().toLowerCase();
            const normalizedUserFullName = userFullName.trim().toLowerCase();

            // Apply filters to originalData
            state.invitations.data = state.invitations.originalData.filter(invitation => {
                const filenameMatch = normalizedFileName.length === 0
                    ? true
                    : (invitation.documentDto.fileName ?? '').toLowerCase().includes(normalizedFileName);

                const userFullNameMatch = normalizedUserFullName.length === 0
                    ? true
                    : (invitation.userDocumentOwner.userName ?? '').toLowerCase().includes(normalizedUserFullName) ||
                    (invitation.userDocumentOwner.userSurname ?? '').toLowerCase().includes(normalizedUserFullName);

                const statusMatch = invitationStatus === 'All'
                    ? true
                    : invitation.invitationStatus === invitationStatus;

                return filenameMatch && userFullNameMatch && statusMatch;
            });
        },

        clearInvitationFilter(state) {
            state.invitations.filters = null;
            state.invitations.data = state.invitations.originalData;
        },

        acceptInvitation(state, action: PayloadAction<string>) {
            state.acceptInvitation.loading = true;
            state.acceptInvitation.error = null;
            state.acceptInvitation.invitationId = action.payload;
            state.acceptInvitation.loadingInviteId = action.payload;
        },

        acceptInvitationSuccess(state, action: PayloadAction<AcceptInvitationWithIdSuccess>) {
            state.acceptInvitation.data = action.payload;
            state.acceptInvitation.loading = false;
            state.acceptInvitation.error = null;
            state.acceptInvitation.loadingInviteId = null;

            // Update the invitation in the invitations list
            const invitationIndex = state.invitations.data.findIndex(
                inv => inv.inviteId === action.payload.inviteId
            );
            if (invitationIndex !== -1) {
                state.invitations.data[invitationIndex].invitationStatus = action.payload.invitationStatus;
                state.invitations.data[invitationIndex].invitationAcceptanceDate = action.payload.invitationAcceptanceDate;
                state.invitations.data[invitationIndex].lastUpdateDate = action.payload.lastUpdateDate;
            }

            // Update the original data as well
            const originalInvitationIndex = state.invitations.originalData.findIndex(
                inv => inv.inviteId === action.payload.inviteId
            );
            if (originalInvitationIndex !== -1) {
                state.invitations.originalData[originalInvitationIndex].invitationStatus = action.payload.invitationStatus;
                state.invitations.originalData[originalInvitationIndex].invitationAcceptanceDate = action.payload.invitationAcceptanceDate;
                state.invitations.originalData[originalInvitationIndex].lastUpdateDate = action.payload.lastUpdateDate;
            }
        },

        acceptInvitationFailure(state, action: PayloadAction<AcceptInvitationWithIdError['type']>) {
            state.acceptInvitation.loading = false;
            state.acceptInvitation.error = action.payload;
            state.acceptInvitation.loadingInviteId = null;
        },

        clearAcceptInvitation(state) {
            state.acceptInvitation = initialState.acceptInvitation;
        },

        revokeInvitation(state, action: PayloadAction<string>) {
            state.revokeInvitation.loading = true;
            state.revokeInvitation.error = null;
            state.revokeInvitation.invitationId = action.payload;
            state.revokeInvitation.loadingInviteId = action.payload;
        },

        revokeInvitationSuccess(state, action: PayloadAction<RevokeInvitationWithIdSuccess>) {
            state.revokeInvitation.data = action.payload;
            state.revokeInvitation.loading = false;
            state.revokeInvitation.error = null;
            state.revokeInvitation.loadingInviteId = null;

            // Update the invitation in myDocuments.data list
            state.myDocuments.data.forEach(document => {
                const inviteIndex = document.inviteDocumentResponseDTOS?.findIndex(
                    invite => invite.inviteId === action.payload.inviteId
                );
                if (inviteIndex !== undefined && inviteIndex !== -1 && document.inviteDocumentResponseDTOS) {
                    document.inviteDocumentResponseDTOS[inviteIndex].invitationStatus = action.payload.invitationStatus;
                    document.inviteDocumentResponseDTOS[inviteIndex].invitationRevokeDate = action.payload.invitationRevokeDate;
                    document.inviteDocumentResponseDTOS[inviteIndex].lastUpdateDate = action.payload.lastUpdateDate;
                }
            });

            // Update the invitation in myDocuments.originalData list
            state.myDocuments.originalData.forEach(document => {
                const inviteIndex = document.inviteDocumentResponseDTOS?.findIndex(
                    invite => invite.inviteId === action.payload.inviteId
                );
                if (inviteIndex !== undefined && inviteIndex !== -1 && document.inviteDocumentResponseDTOS) {
                    document.inviteDocumentResponseDTOS[inviteIndex].invitationStatus = action.payload.invitationStatus;
                    document.inviteDocumentResponseDTOS[inviteIndex].invitationRevokeDate = action.payload.invitationRevokeDate;
                    document.inviteDocumentResponseDTOS[inviteIndex].lastUpdateDate = action.payload.lastUpdateDate;
                }
            });
        },

        revokeInvitationFailure(state, action: PayloadAction<RevokeInvitationWithIdError['type']>) {
            state.revokeInvitation.loading = false;
            state.revokeInvitation.error = action.payload;
            state.revokeInvitation.loadingInviteId = null;
        },

        clearRevokeInvitation(state) {
            state.revokeInvitation = initialState.revokeInvitation;
        },

        declineInvitation(state, action: PayloadAction<string>) {
            state.declineInvitation.loading = true;
            state.declineInvitation.error = null;
            state.declineInvitation.invitationId = action.payload;
            state.declineInvitation.loadingInviteId = action.payload;
        },

        declineInvitationSuccess(state, action: PayloadAction<DeclineInvitationWithIdSuccess>) {
            state.declineInvitation.data = action.payload;
            state.declineInvitation.loading = false;
            state.declineInvitation.error = null;
            state.declineInvitation.loadingInviteId = null;

            // Update the invitation in the invitations list
            const invitationIndex = state.invitations.data.findIndex(
                inv => inv.inviteId === action.payload.inviteId
            );
            if (invitationIndex !== -1) {
                state.invitations.data[invitationIndex].invitationStatus = action.payload.invitationStatus;
                state.invitations.data[invitationIndex].invitationDeclinedDate = action.payload.invitationDeclinedDate;
                state.invitations.data[invitationIndex].lastUpdateDate = action.payload.lastUpdateDate;
            }

            // Update the original data as well
            const originalInvitationIndex = state.invitations.originalData.findIndex(
                inv => inv.inviteId === action.payload.inviteId
            );
            if (originalInvitationIndex !== -1) {
                state.invitations.originalData[originalInvitationIndex].invitationStatus = action.payload.invitationStatus;
                state.invitations.originalData[originalInvitationIndex].invitationDeclinedDate = action.payload.invitationDeclinedDate;
                state.invitations.originalData[originalInvitationIndex].lastUpdateDate = action.payload.lastUpdateDate;
            }
        },

        declineInvitationFailure(state, action: PayloadAction<DeclineInvitationWithIdError['type']>) {
            state.declineInvitation.loading = false;
            state.declineInvitation.error = action.payload;
            state.declineInvitation.loadingInviteId = null;
        },

        clearDeclineInvitation(state) {
            state.declineInvitation = initialState.declineInvitation;
        },

        sendInvitation(state, action: PayloadAction<string>) {
            state.sendInvitation.loading = true;
            state.sendInvitation.error = null;
            state.sendInvitation.documentId = action.payload;
            state.sendInvitation.loadingDocumentId = action.payload;
        },

        sendInvitationSuccess(state, action: PayloadAction<SendInvitesSuccess>) {
            state.sendInvitation.data = action.payload;
            state.sendInvitation.loading = false;
            state.sendInvitation.error = null;
            state.sendInvitation.loadingDocumentId = null;
           
            // Update the invitation in myDocuments.data list
            // state.myDocuments.data.forEach(document => {
            //     const inviteIndex = document.inviteDocumentResponseDTOS?.findIndex(
            //         invite => invite.inviteId === action.payload.inviteId
            //     );
            //     if (inviteIndex !== undefined && inviteIndex !== -1 && document.inviteDocumentResponseDTOS) {
            //         document.inviteDocumentResponseDTOS[inviteIndex].invitationStatus = action.payload.invitationStatus;
            //         document.inviteDocumentResponseDTOS[inviteIndex].invitationDate = action.payload.invitationDate;
            //         document.inviteDocumentResponseDTOS[inviteIndex].lastUpdateDate = action.payload.lastUpdateDate;
            //     }
            // });

            // // Update the invitation in myDocuments.originalData list
            // state.myDocuments.originalData.forEach(document => {
            //     const inviteIndex = document.inviteDocumentResponseDTOS?.findIndex(
            //         invite => invite.inviteId === action.payload.inviteId
            //     );
            //     if (inviteIndex !== undefined && inviteIndex !== -1 && document.inviteDocumentResponseDTOS) {
            //         document.inviteDocumentResponseDTOS[inviteIndex].invitationStatus = action.payload.invitationStatus;
            //         document.inviteDocumentResponseDTOS[inviteIndex].invitationDate = action.payload.invitationDate;
            //         document.inviteDocumentResponseDTOS[inviteIndex].lastUpdateDate = action.payload.lastUpdateDate;
            //     }
            // });
        },

        sendInvitationFailure(state, action: PayloadAction<SendInvitesError['type']>) {
            state.sendInvitation.loading = false;
            state.sendInvitation.error = action.payload;
            state.sendInvitation.loadingDocumentId = null;
        },

        resendInvitation(state, action: PayloadAction<string>) {
            state.resendInvitation.loading = true;
            state.resendInvitation.error = null;
            state.resendInvitation.invitationId = action.payload;
            state.resendInvitation.loadingInviteId = action.payload;
        },

        resendInvitationSuccess(state, action: PayloadAction<ResendInvitationWithIdSuccess>) {
            state.resendInvitation.data = action.payload;
            state.resendInvitation.loading = false;
            state.resendInvitation.error = null;
            state.resendInvitation.loadingInviteId = null;

            // Update the invitation in myDocuments.data list
            state.myDocuments.data.forEach(document => {
                const inviteIndex = document.inviteDocumentResponseDTOS?.findIndex(
                    invite => invite.inviteId === action.payload.inviteId
                );
                if (inviteIndex !== undefined && inviteIndex !== -1 && document.inviteDocumentResponseDTOS) {
                    document.inviteDocumentResponseDTOS[inviteIndex].invitationStatus = action.payload.invitationStatus;
                    document.inviteDocumentResponseDTOS[inviteIndex].invitationDate = action.payload.invitationDate;
                    document.inviteDocumentResponseDTOS[inviteIndex].lastUpdateDate = action.payload.lastUpdateDate;
                }
            });

            // Update the invitation in myDocuments.originalData list
            state.myDocuments.originalData.forEach(document => {
                const inviteIndex = document.inviteDocumentResponseDTOS?.findIndex(
                    invite => invite.inviteId === action.payload.inviteId
                );
                if (inviteIndex !== undefined && inviteIndex !== -1 && document.inviteDocumentResponseDTOS) {
                    document.inviteDocumentResponseDTOS[inviteIndex].invitationStatus = action.payload.invitationStatus;
                    document.inviteDocumentResponseDTOS[inviteIndex].invitationDate = action.payload.invitationDate;
                    document.inviteDocumentResponseDTOS[inviteIndex].lastUpdateDate = action.payload.lastUpdateDate;
                }
            });
        },

        resendInvitationFailure(state, action: PayloadAction<ResendInvitationWithIdError['type']>) {
            state.resendInvitation.loading = false;
            state.resendInvitation.error = action.payload;
            state.resendInvitation.loadingInviteId = null;
        },

        clearResendInvitation(state) {
            state.resendInvitation = initialState.resendInvitation;
        },

        deleteDocument(state, action: PayloadAction<string>) {
            state.deleteDocument.loading = true;
            state.deleteDocument.error = null;
            state.deleteDocument.documentId = action.payload;
            state.deleteDocument.loadingDocumentId = action.payload;
        },

        deleteDocumentSuccess(state, action: PayloadAction<DeleteDocumentWithIdSuccess>) {
            state.deleteDocument.data = action.payload;
            state.deleteDocument.loading = false;
            state.deleteDocument.error = null;
            state.deleteDocument.loadingDocumentId = null;

            // Remove the document from myDocuments list
            const documentIndex = state.myDocuments.data.findIndex(
                doc => doc.documentId === action.payload.documentId
            );
            if (documentIndex !== -1) {
                state.myDocuments.data.splice(documentIndex, 1);
            }

            // Remove from original data as well
            const originalDocumentIndex = state.myDocuments.originalData.findIndex(
                doc => doc.documentId === action.payload.documentId
            );
            if (originalDocumentIndex !== -1) {
                state.myDocuments.originalData.splice(originalDocumentIndex, 1);
            }
        },

        deleteDocumentFailure(state, action: PayloadAction<DeleteDocumentWithIdError['type']>) {
            state.deleteDocument.loading = false;
            state.deleteDocument.error = action.payload;
            state.deleteDocument.loadingDocumentId = null;
        },

        clearDeleteDocument(state) {
            state.deleteDocument = initialState.deleteDocument;
        },

        uploadDocument(state, action: PayloadAction<{ documentId: string }>) {
            state.uploadDocument.loading = true;
            state.uploadDocument.error = null;
            state.uploadDocument.documentId = action.payload.documentId;
            state.uploadDocument.loadingDocumentId = action.payload.documentId;
        },

        uploadDocumentSuccess(state, action: PayloadAction<UploadDocumentSuccess>) {
            state.uploadDocument.data = action.payload;
            state.uploadDocument.loading = false;
            state.uploadDocument.error = null;
            state.uploadDocument.loadingDocumentId = null;

            // Update the document's lastUpdateDate in myDocuments.data
            const documentIndex = state.myDocuments.data.findIndex(
                doc => doc.documentId === action.payload.documentId
            );
            if (documentIndex !== -1 && action.payload.lastUpdateDate) {
                state.myDocuments.data[documentIndex].lastUpdateDate = action.payload.lastUpdateDate;
            }

            // Update the document's lastUpdateDate in myDocuments.originalData
            const originalDocumentIndex = state.myDocuments.originalData.findIndex(
                doc => doc.documentId === action.payload.documentId
            );
            if (originalDocumentIndex !== -1 && action.payload.lastUpdateDate) {
                state.myDocuments.originalData[originalDocumentIndex].lastUpdateDate = action.payload.lastUpdateDate;
            }
        },

        uploadDocumentFailure(state, action: PayloadAction<UploadDocumentError['type']>) {
            state.uploadDocument.loading = false;
            state.uploadDocument.error = action.payload;
            state.uploadDocument.loadingDocumentId = null;
        },

        clearUploadDocument(state) {
            state.uploadDocument = initialState.uploadDocument;
        },

        uploadDocumentIfNotExists(state, action: PayloadAction<{ filepath: string; documentId: string }>) {
            state.uploadDocumentIfNotExists.loading = true;
            state.uploadDocumentIfNotExists.error = null;
            state.uploadDocumentIfNotExists.documentId = action.payload.documentId;
            state.uploadDocumentIfNotExists.filepath = action.payload.filepath;
            state.uploadDocumentIfNotExists.loadingDocumentId = action.payload.documentId;
        },

        uploadDocumentIfNotExistsSuccess(state, action: PayloadAction<UploadDocumentIfNotExistsSuccess>) {
            state.uploadDocumentIfNotExists.data = action.payload;
            state.uploadDocumentIfNotExists.loading = false;
            state.uploadDocumentIfNotExists.error = null;
            state.uploadDocumentIfNotExists.loadingDocumentId = null;

            // Update the document's lastUpdateDate in myDocuments.data
            const documentIndex = state.myDocuments.data.findIndex(
                doc => doc.documentId === action.payload.documentId
            );
            if (documentIndex !== -1 && action.payload.lastUpdateDate) {
                state.myDocuments.data[documentIndex].lastUpdateDate = action.payload.lastUpdateDate;
            }

            // Update the document's lastUpdateDate in myDocuments.originalData
            const originalDocumentIndex = state.myDocuments.originalData.findIndex(
                doc => doc.documentId === action.payload.documentId
            );
            if (originalDocumentIndex !== -1 && action.payload.lastUpdateDate) {
                state.myDocuments.originalData[originalDocumentIndex].lastUpdateDate = action.payload.lastUpdateDate;
            }
        },

        uploadDocumentIfNotExistsFailure(state, action: PayloadAction<UploadDocumentIfNotExistsError['type']>) {
            state.uploadDocumentIfNotExists.loading = false;
            state.uploadDocumentIfNotExists.error = action.payload;
            state.uploadDocumentIfNotExists.loadingDocumentId = null;
        },

        clearUploadDocumentIfNotExists(state) {
            state.uploadDocumentIfNotExists = initialState.uploadDocumentIfNotExists;
        },

        selectFolder(state) {
            state.selectFolder.loading = true;
            state.selectFolder.error = null;
        },

        selectFolderSuccess(state, action: PayloadAction<string>) {
            state.selectFolder.folderPath = action.payload;
            state.selectFolder.loading = false;
            state.selectFolder.error = null;
        },

        selectFolderFailure(state, action: PayloadAction<string>) {
            state.selectFolder.loading = false;
            state.selectFolder.error = action.payload;
        },

        clearSelectedFolder(state) {
            state.selectFolder = initialState.selectFolder;
        },

        downloadAndSaveDocument(state, action: PayloadAction<{ documentId: string; filename: string | null }>) {
            state.downloadDocument.loading = true;
            state.downloadDocument.error = null;
            state.downloadDocument.documentId = action.payload.documentId;
            state.downloadDocument.filename = action.payload.filename;
            state.downloadDocument.loadingDocumentId = action.payload.documentId;
        },

        downloadDocument(state, action: PayloadAction<{ documentId: string; filename: string | null; folderPath?: string | null }>) {
            state.downloadDocument.loading = true;
            state.downloadDocument.error = null;
            state.downloadDocument.documentId = action.payload.documentId;
            state.downloadDocument.filename = action.payload.filename;
            state.downloadDocument.folderPath = action.payload.folderPath ?? state.selectFolder.folderPath;
            state.downloadDocument.loadingDocumentId = action.payload.documentId;
        },

        downloadDocumentSuccess(state, action: PayloadAction<DownloadDocumentSuccess>) {
            state.downloadDocument.data = action.payload;
            state.downloadDocument.loading = false;
            state.downloadDocument.error = null;
            state.downloadDocument.loadingDocumentId = null;
        },

        downloadDocumentFailure(state, action: PayloadAction<DownloadDocumentError['type']>) {
            state.downloadDocument.loading = false;
            state.downloadDocument.error = action.payload;
            state.downloadDocument.loadingDocumentId = null;
        },

        clearDownloadDocument(state) {
            state.downloadDocument = initialState.downloadDocument;
        },

        saveFile(state) {
            state.saveFile.loading = true;
            state.saveFile.error = null;
            state.saveFile.success = false;
            state.saveFile.folderPath = state.downloadDocument.folderPath;
            state.saveFile.loadingDocumentId = state.downloadDocument.documentId;
        },

        saveFileSuccess(state, action: PayloadAction<{ filepath: string }>) {
            state.saveFile.loading = false;
            state.saveFile.error = null;
            state.saveFile.success = true;
            state.saveFile.filepath = action.payload.filepath;
            state.saveFile.loadingDocumentId = null;
        },

        saveFileFailure(state, action: PayloadAction<string>) {
            state.saveFile.loading = false;
            state.saveFile.error = action.payload;
            state.saveFile.success = false;
            state.saveFile.loadingDocumentId = null;
        },

        clearSaveFile(state) {
            state.saveFile = initialState.saveFile;
        },

        updateInvitationDownloadDate(state, action: PayloadAction<{ documentId: string; downloadDate: string }>) {
            const { documentId, downloadDate } = action.payload;
            const invitationIndex = state.invitations.data.findIndex(
                inv => inv.documentId === documentId
            );
            if (invitationIndex !== -1) {
                state.invitations.data[invitationIndex].downloadDate = downloadDate;
                state.invitations.data[invitationIndex].alreadyDownloaded = true;
            }

            // Update the original data as well
            const originalInvitationIndex = state.invitations.originalData.findIndex(
                inv => inv.documentId === documentId
            );
            if (originalInvitationIndex !== -1) {
                state.invitations.originalData[originalInvitationIndex].downloadDate = downloadDate;
                state.invitations.originalData[originalInvitationIndex].alreadyDownloaded = true;
            }
        },

    },
});

export const {
    fetchInvitations,
    fetchInvitationsSuccess,
    fetchInvitationsFailure,
    clearInvitations,
    fetchMyDocuments,
    fetchMyDocumentsSuccess,
    fetchMyDocumentsFailure,
    clearMyDocuments,
    filterMyDocuments,
    clearMyDocumentsFilter,
    filterInvitations,
    clearInvitationFilter,
    acceptInvitation,
    acceptInvitationSuccess,
    acceptInvitationFailure,
    clearAcceptInvitation,
    revokeInvitation,
    revokeInvitationSuccess,
    revokeInvitationFailure,
    clearRevokeInvitation,
    declineInvitation,
    declineInvitationSuccess,
    declineInvitationFailure,
    clearDeclineInvitation,
    sendInvitation,
    sendInvitationSuccess,
    sendInvitationFailure,
    resendInvitation,
    resendInvitationSuccess,
    resendInvitationFailure,
    clearResendInvitation,
    deleteDocument,
    deleteDocumentSuccess,
    deleteDocumentFailure,
    clearDeleteDocument,
    uploadDocument,
    uploadDocumentSuccess,
    uploadDocumentFailure,
    clearUploadDocument,
    uploadDocumentIfNotExists,
    uploadDocumentIfNotExistsSuccess,
    uploadDocumentIfNotExistsFailure,
    clearUploadDocumentIfNotExists,
    selectFolder,
    selectFolderSuccess,
    selectFolderFailure,
    clearSelectedFolder,
    downloadAndSaveDocument,
    downloadDocument,
    downloadDocumentSuccess,
    downloadDocumentFailure,
    clearDownloadDocument,
    saveFile,
    saveFileSuccess,
    saveFileFailure,
    clearSaveFile,
    updateInvitationDownloadDate,
} = documentSlice.actions;

export default documentSlice.reducer;
