import type { IpcMain } from 'electron';
import { connect, connected, disconnect, getDocumentAccess, getHistory, getParticipants, sendMessage, subscribe, unsubscribe } from './chat-service';

export const registerChatHandlers = (ipcMain: IpcMain): void => {

  ipcMain.handle('chat:getDocumentAccess', (_, documentId: string):
    Promise<Result<GetChatDocumentAccessSuccess, GetChatDocumentAccessError>> =>
    getDocumentAccess(documentId));

  ipcMain.handle('chat:getHistory', (_, documentId: string, page: number = 0, size: number = 50):
    Promise<Result<GetChatHistorySuccess, GetChatHistoryError>> =>
    getHistory(documentId, page, size));

  ipcMain.handle('chat:getPartecipants', (_, documentId: string):
    Promise<Result<GetChatParticipantsSuccess, GetChatParticipantsError>> =>
    getParticipants(documentId));

  ipcMain.handle('chat:connect', (event):
    Promise<Result<ConnectChatSuccess, ConnectChatError>> =>
    connect(event));

  ipcMain.handle('chat:disconnect', ():
    Promise<void> =>
    disconnect());

  ipcMain.handle('chat:connected', ():
    Promise<boolean> =>
    connected());

  ipcMain.handle('chat:subscribe', (event, documentId: string):
    Promise<Result<SubscribeChatChannelSuccess, SubscribeChatChannelError>> =>
    subscribe(event, documentId));

  ipcMain.handle('chat:unsubscribe', (_, documentId: string):
    Promise<Result<UnsubscribeChatChannelSuccess, UnsubscribeChatChannelError>> =>
    unsubscribe(documentId));

  ipcMain.handle('chat:sendMessage', (_, documentId, message, documentText):
    Promise<Result<SendMessageChatSuccess, SendMessageChatError>> =>
    sendMessage(documentId, message, documentText));

};
