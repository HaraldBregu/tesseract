import { BrowserWindow, BrowserWindowConstructorOptions, dialog } from "electron";
import { getBaseWindow } from "./main-window";
import { mainLogger } from "./utils/logger";
import path from "path";

export const openChildWindow = async (pageUrl: string, options: BrowserWindowConstructorOptions = {}): Promise<void> => {
    const baseWindow = getBaseWindow()
    if (!baseWindow)
        return;

    const taskId = mainLogger.startTask("Electron", "Creating sub window");
    try {
        const subWindow = new BrowserWindow({
            width: 440,
            height: 272,
            webPreferences: {
                preload: path.join(__dirname, '../preload/index.mjs'),
                sandbox: false,
                nodeIntegration: false,
                contextIsolation: true,
                devTools: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
            },
            parent: baseWindow, // Set the parent window
            modal: true, // Makes the subwindow modal
            resizable: false,
            minimizable: false,
            maximizable: false,
            ...options
        });
        subWindow.setMenu(null);
        subWindow.loadURL(pageUrl);
        subWindow.on('close', () => {
            subWindow.destroy();
        });
        mainLogger.endTask(taskId, "Electron", "Sub window created");
    } catch (err) {
        mainLogger.error("Electron", "Error while creating sub window", err as Error);
        await dialog.showMessageBox(baseWindow, {
            type: 'error',
            message: 'Error while creating sub window: ' + err
        });
    }
};