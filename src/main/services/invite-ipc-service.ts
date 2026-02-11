import { acceptInvitationWithId, declineInvitationWithId, getInvitations, resendInvitationWithId, revokeInvitationWithId, sendInvites, uploadDocumentIfNotExistsAndSendInvites } from './base-service';

export const handleInviteIpc = (ipcMain: Electron.IpcMain): void => {

    ipcMain.handle('invite:sendInvites', (_, data: SendInvitesDataInput):
        Promise<Result<SendInvitesSuccess, SendInvitesError>> =>
        sendInvites(data))

    ipcMain.handle('invite:uploadDocumentAndSendInvites', (_, data: UploadDocumentAndSendInvitesInput):
        Promise<Result<UploadDocumentAndSendInvitesSuccess, UploadDocumentAndSendInvitesError>> =>
        uploadDocumentIfNotExistsAndSendInvites(data))

    ipcMain.handle('invite:getInvitations', (_):
        Promise<Result<GetInvitationsSuccess, GetInvitationsError>> =>
        getInvitations())

    ipcMain.handle('invite:resendInvitationWithId', (_, invitationId):
        Promise<Result<ResendInvitationWithIdSuccess, ResendInvitationWithIdError>> =>
        resendInvitationWithId(invitationId))

    ipcMain.handle('invite:revokeInvitationWithId', (_, invitationId):
        Promise<Result<RevokeInvitationWithIdSuccess, RevokeInvitationWithIdError>> =>
        revokeInvitationWithId(invitationId))

    ipcMain.handle('invite:acceptInvitationWithId', (_, invitationId):
        Promise<Result<AcceptInvitationWithIdSuccess, AcceptInvitationWithIdError>> =>
        acceptInvitationWithId(invitationId))

    ipcMain.handle('invite:declineInvitationWithId', (_, invitationId):
        Promise<Result<DeclineInvitationWithIdSuccess, DeclineInvitationWithIdError>> =>
        declineInvitationWithId(invitationId))        
};
