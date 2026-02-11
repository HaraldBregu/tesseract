import { deleteDocumentWithId, downloadDocument, getDocumentWithId, getMyDocuments, uploadDocument, uploadDocumentIfNotExists } from './base-service';

export const handleDocumentIpc = (ipcMain: Electron.IpcMain): void => {

    ipcMain.handle('shareDocument:uploadDocument', (_, filepath: string, documentId: string):
        Promise<Result<UploadDocumentSuccess, UploadDocumentError>> =>
        uploadDocument(filepath, documentId));

    ipcMain.handle('shareDocument:downloadDocument', (_, documentId: string):
        Promise<Result<DownloadDocumentSuccess, DownloadDocumentError>> =>
        downloadDocument(documentId));

    ipcMain.handle('shareDocument:getDocumentWithId', (_, documentId: string):
        Promise<Result<GetSharedDocumentSuccess, GetSharedDocumentError>> =>
        getDocumentWithId(documentId))

    ipcMain.handle('shareDocument:deleteDocumentWithId', (_, documentId: string):
        Promise<Result<DeleteDocumentWithIdSuccess, DeleteDocumentWithIdError>> =>
        deleteDocumentWithId(documentId))

    ipcMain.handle('shareDocument:uploadDocumentIfNotExists', (_, filepath: string, documentId: string):
        Promise<Result<UploadDocumentIfNotExistsSuccess, UploadDocumentIfNotExistsError>> =>
        uploadDocumentIfNotExists(filepath, documentId));

    ipcMain.handle('shareDocument:getMyDocuments', ():
        Promise<Result<GetMyDocumentsSuccess, GetMyDocumentsError>> =>
        getMyDocuments());

};