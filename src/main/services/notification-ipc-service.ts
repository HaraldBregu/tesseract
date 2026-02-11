import { getNotifications, markAsViewed, markAllAsViewed } from './base-service';

export const handleNotificationIpc = (ipcMain: Electron.IpcMain): void => {

    ipcMain.handle('notifications:getNotifications', async (_, page?: number): Promise<NotificationResponse> => {
        const result = await getNotifications(page ?? 0);
        return result;
    });

    ipcMain.handle('notifications:markAsViewed', (_, notificationId: string):
        Promise<NotificationItem | null> =>
        markAsViewed(notificationId));

    ipcMain.handle('notifications:markAllAsViewed', (_, notificationIds: string[]):
        Promise<NotificationItem[]> =>
        markAllAsViewed(notificationIds));

};
