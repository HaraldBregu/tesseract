import { app, BaseWindow, WebContentsView, nativeTheme, ipcMain, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import path from 'node:path'
import fs from 'node:fs'
import { is } from "@electron-toolkit/utils";
import { mainLogger } from "./shared/logger";
import { OnBaseWindowReady } from "./types";
import { createToolbarWebContentsView } from "./toolbar";
import i18next from "i18next";
import { getRootUrl } from "./shared/util";

let baseWindow: BaseWindow | null = null
let childWindow: BrowserWindow | null = null
let findAndReplaceWindow: BrowserWindow | null = null
let logoutWindow: BrowserWindow | null = null
let shareDocumentWindow: BrowserWindow | null = null
let sharedDocumentsWindow: BrowserWindow | null = null
let toolbarWebContentsView: WebContentsView | null = null

export const getBaseWindow = (): BaseWindow | null => baseWindow
export const getToolbarWebContentsView = (): WebContentsView | null => toolbarWebContentsView
export const getChildWindow = (): BrowserWindow | null => childWindow
export const getShareDocumentWindow = (): BrowserWindow | null => shareDocumentWindow
export const getSharedDocumentsWindow = (): BrowserWindow | null => sharedDocumentsWindow
export const getFindAndReplaceWindow = (): BrowserWindow | null => findAndReplaceWindow
export const getLogoutWindow = (): BrowserWindow | null => logoutWindow

const getIconPath = (): string => {
    let iconPath = is.dev
        ? path.join(app.getAppPath(), 'buildResources', 'appIcons', 'icon.png')
        : path.join(process.resourcesPath, 'buildResources', 'appIcons', 'icon.png');
    if (fs.existsSync(iconPath) === false) {
        mainLogger.error('------', '----------------------------------------------------------')
        mainLogger.error('DEBUG', `Icon path does not exist: ${iconPath}`)
        // Prova un percorso alternativo se il primo non esiste
        const altIconPath = path.join(app.getAppPath(), 'buildResources', 'build', 'icon.ico');
        if (fs.existsSync(altIconPath)) {
            mainLogger.info('DEBUG', `Using alternative icon path: ${altIconPath}`)
            iconPath = altIconPath;
        } else {
            mainLogger.error('DEBUG', `Alternative icon path also does not exist: ${altIconPath}`)
        }
        mainLogger.error('------', '----------------------------------------------------------')
    } else {
        mainLogger.info('DEBUG', `Icon found at: ${iconPath}`)
    }
    return iconPath;
}

export async function initializeMainWindow(onDone: OnBaseWindowReady): Promise<void> {
    const taskId = mainLogger.startTask("Electron", "Initializing main window");
    const gotLock = app.requestSingleInstanceLock();

    baseWindow = new BaseWindow({
        width: 1500,
        height: 1000,
        minWidth: 1000,
        minHeight: 700,
        icon: getIconPath(),
        show: false,
        trafficLightPosition: {
            x: 9,
            y: 9
        },
        backgroundColor: '#FFFFFF',
    })

    toolbarWebContentsView = await createToolbarWebContentsView(baseWindow)
    if (!toolbarWebContentsView)
        return

    baseWindow.contentView.addChildView(toolbarWebContentsView)

    // Ensures there is only one instance open at a time (on Windows)
    if (!gotLock) {
        app.quit();
    }

    showWindow()
    onDone(baseWindow)

    mainLogger.endTask(taskId, "Electron", "Main window created");
}


export function toolbarWebContentsViewSend(message: string, ...args: unknown[]): void {
    toolbarWebContentsView?.webContents.send(message, ...args)
}

export function childWindowSend(message: string, ...args: unknown[]): void {
    childWindow?.webContents.send(message, ...args)
}

export function closeChildWindow(): void {
    console.log("DEBUG: closeChildWindow called", childWindow ? "childWindow exists" : "childWindow is null");
    if (childWindow) {
        childWindow.close();
        childWindow = null;
    }
}

export function showWindow(): void {
    if (!baseWindow)
        return

    //? This is to prevent the window from gaining focus everytime we make a change in code.
    if (!is.dev && !process.env['ELECTRON_RENDERER_URL']) {
        baseWindow.show()
        return
    }

    if (!baseWindow.isVisible()) {
        baseWindow.show()
    }
}

/**
 * @param pageUrl - The URL of the page to open.
 * @param options - The options for the sub window.
 * @returns A promise that resolves when the sub window is created.
 */
export const openChildWindow = async (pageUrl: string, options: BrowserWindowConstructorOptions = {}): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Creating sub window");

    if (!baseWindow)
        return;

    const backgroundColor = nativeTheme.shouldUseDarkColors ? '#0a0a0a' : '#FFFFFF';

    childWindow = new BrowserWindow({
        width: 950,
        height: 700,
        minWidth: 850,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            devTools: is.dev,
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        parent: baseWindow, // Set the parent window
        modal: false, // Makes the subwindow modal
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: options.title || "Preferences", // Use title from options or default
        icon: getIconPath(), // Use the same icon as the main window
        show: false, // Don't show the window until it's ready to prevent flicker
        backgroundColor,
        ...options
    });

    // Listen for when the renderer is ready to show
    const handleRendererReady = (): void => {
        if (childWindow && !childWindow.isDestroyed()) {
            childWindow.show();
        }
    };

    // Setup a one-time listener for this specific window
    const rendererReadyHandler = (_event: Electron.IpcMainEvent): void => {
        if (_event.sender === childWindow?.webContents) {
            handleRendererReady();
            ipcMain.off('child-window-ready', rendererReadyHandler);
        }
    };
    ipcMain.on('child-window-ready', rendererReadyHandler);

    // Setup the window after content is loaded
    childWindow.webContents.once('did-finish-load', () => {
        childWindow?.setMenu(null);
        childWindow?.webContents.executeJavaScript('localStorage.clear();', true)
            .then(() => {
                console.log('Local storage cleared for child window.');
            })
            .catch(error => {
                console.error('Error clearing local storage:', error);
            });
        const finalTitle = options.title || i18next.t('menu.preferencesWindowTitle');
        childWindow?.setTitle(finalTitle);

        // Send initial language to child window after load
        const currentLanguage = i18next.language;
        childWindow?.webContents.send("language-changed", currentLanguage);
    });

    // Add keyboard shortcut to toggle DevTools
    childWindow.webContents.on('before-input-event', (event, input) => {
        // Cmd/Ctrl + Alt + I or F12 to toggle DevTools
        const isDevToolsShortcut =
            ((input.control || input.meta) && input.alt && input.key.toLowerCase() === 'i') ||
            input.key === 'F12';

        if (isDevToolsShortcut && input.type === 'keyDown') {
            event.preventDefault();
            if (childWindow?.webContents.isDevToolsOpened()) {
                childWindow?.webContents.closeDevTools();
            } else {
                childWindow?.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });

    childWindow.loadURL(pageUrl);
    childWindow.on('close', () => {
        // Clean up the IPC listener if window is closed before showing
        ipcMain.off('child-window-ready', rendererReadyHandler);
        childWindow?.destroy();
        childWindow = null;
    });

    // childWindow.webContents.toggleDevTools();

    mainLogger.endTask(taskId, "Electron", "Sub window created");
};

/**
 * @param pageUrl - The URL of the page to open.
 * @param options - The options for the sub window.
 * @returns A promise that resolves when the sub window is created.
 */
export const openFindAndReplaceWindow = async (pageUrl: string, options: BrowserWindowConstructorOptions = {}): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Creating sub window");

    if (!baseWindow)
        return;

    const backgroundColor = nativeTheme.shouldUseDarkColors ? '#0a0a0a' : '#FFFFFF';

    findAndReplaceWindow = new BrowserWindow({
        width: 950,
        height: 700,
        minWidth: 850,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            devTools: is.dev,
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        parent: baseWindow, // Set the parent window
        modal: false, // Makes the subwindow modal
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: options.title || "Preferences", // Use title from options or default
        icon: getIconPath(), // Use the same icon as the main window
        show: false, // Don't show the window until it's ready to prevent flicker
        backgroundColor,
        ...options
    });

    // Listen for when the renderer is ready to show
    const handleRendererReady = (): void => {
        if (findAndReplaceWindow && !findAndReplaceWindow.isDestroyed()) {
            findAndReplaceWindow.show();
        }
    };

    // Setup a one-time listener for this specific window
    const rendererReadyHandler = (_event: Electron.IpcMainEvent): void => {
        if (_event.sender === findAndReplaceWindow?.webContents) {
            handleRendererReady();
            ipcMain.off('child-window-ready', rendererReadyHandler);
        }
    };
    ipcMain.on('child-window-ready', rendererReadyHandler);

    // Setup the window after content is loaded
    findAndReplaceWindow.webContents.once('did-finish-load', () => {
        findAndReplaceWindow?.setMenu(null);
        findAndReplaceWindow?.webContents.executeJavaScript('localStorage.clear();', true)
            .then(() => {
                console.log('Local storage cleared for child window.');
            })
            .catch(error => {
                console.error('Error clearing local storage:', error);
            });
        const finalTitle = options.title || i18next.t('menu.preferencesWindowTitle');
        findAndReplaceWindow?.setTitle(finalTitle);

        // Send initial language to child window after load
        const currentLanguage = i18next.language;
        findAndReplaceWindow?.webContents.send("language-changed", currentLanguage);
    });

    // Add keyboard shortcut to toggle DevTools
    findAndReplaceWindow.webContents.on('before-input-event', (event, input) => {
        // Cmd/Ctrl + Alt + I or F12 to toggle DevTools
        const isDevToolsShortcut =
            ((input.control || input.meta) && input.alt && input.key.toLowerCase() === 'i') ||
            input.key === 'F12';

        if (isDevToolsShortcut && input.type === 'keyDown') {
            event.preventDefault();
            if (findAndReplaceWindow?.webContents.isDevToolsOpened()) {
                findAndReplaceWindow?.webContents.closeDevTools();
            } else {
                findAndReplaceWindow?.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });

    findAndReplaceWindow.loadURL(pageUrl);
    findAndReplaceWindow.on('close', () => {
        // Clean up the IPC listener if window is closed before showing
        ipcMain.off('child-window-ready', rendererReadyHandler);
        findAndReplaceWindow?.destroy();
        findAndReplaceWindow = null;
    });

    mainLogger.endTask(taskId, "Electron", "Sub window created");
};

export const openAuthWindow = async (): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Opening auth window");
    console.log("DEBUG: openAuthWindow called");
    if (!baseWindow)
        return;

    const pageUrl = getRootUrl() + "auth"
    const backgroundColor = nativeTheme.shouldUseDarkColors ? '#0a0a0a' : '#FFFFFF';
    childWindow = new BrowserWindow({
        width: 950,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            devTools: is.dev,
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        parent: baseWindow, // Set the parent window
        modal: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: "Authentication",
        icon: getIconPath(),
        show: false,
        backgroundColor,
    });

    // Listen for when the renderer is ready to show
    const handleRendererReady = (): void => {
        if (childWindow && !childWindow.isDestroyed()) {
            childWindow.show();
        }
    };

    handleRendererReady();

    // Setup the window after content is loaded
    childWindow.webContents.once('did-finish-load', () => {
        childWindow?.setMenu(null);
        childWindow?.webContents.executeJavaScript('localStorage.clear();', true)
            .then(() => {
                console.log('Local storage cleared for child window.');
            })
            .catch(error => {
                console.error('Error clearing local storage:', error);
            });
        const finalTitle = "Authentication";
        childWindow?.setTitle(finalTitle);

        // Send initial language to child window after load
        const currentLanguage = i18next.language;
        childWindow?.webContents.send("language-changed", currentLanguage);
    });

    // Add keyboard shortcut to toggle DevTools and close on ESC
    childWindow.webContents.on('before-input-event', (event, input) => {
        // Close window on ESC key
        if (input.key === 'Escape' && input.type === 'keyDown') {
            event.preventDefault();
            childWindow?.close();
            return;
        }

        // Cmd/Ctrl + Alt + I or F12 to toggle DevTools
        const isDevToolsShortcut =
            ((input.control || input.meta) && input.alt && input.key.toLowerCase() === 'i') ||
            input.key === 'F12';

        if (isDevToolsShortcut && input.type === 'keyDown') {
            event.preventDefault();
            if (childWindow?.webContents.isDevToolsOpened()) {
                childWindow?.webContents.closeDevTools();
            } else {
                childWindow?.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });

    // Close modal when clicking outside (when child window loses focus)
    // if (platform() === 'darwin') {
    //     childWindow.on('blur', () => {
    //         if (childWindow && !childWindow.isDestroyed()) {
    //             childWindow.close();
    //         }
    //     });
    // }

    childWindow.loadURL(pageUrl);
    childWindow.on('close', () => {
        // Clean up the IPC listener if window is closed before showing
        ipcMain.off('child-window-ready', handleRendererReady);
        childWindow?.destroy();
        childWindow = null;
    });

    childWindow.webContents.toggleDevTools();

    mainLogger.endTask(taskId, "Electron", "Sub window created");
};

/**
 * Opens the logout window.
 */
export const openLogoutWindow = async (): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Opening logout window");
    if (!baseWindow)
        return;

    const pageUrl = getRootUrl() + "logout"
    const backgroundColor = nativeTheme.shouldUseDarkColors
        ? '#0a0a0a'
        : '#FFFFFF';

    logoutWindow = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            devTools: is.dev,
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        parent: baseWindow,
        modal: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: "Logout",
        icon: getIconPath(),
        show: false,
        backgroundColor,
    });

    if (logoutWindow && !logoutWindow.isDestroyed()) {
        logoutWindow.show();
    }

    logoutWindow.webContents.once('did-finish-load', () => {
        logoutWindow?.setMenu(null);
        logoutWindow?.setTitle("Logout");
        const currentLanguage = i18next.language;
        logoutWindow?.webContents.send("language-changed", currentLanguage);
    });

    logoutWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Escape' && input.type === 'keyDown') {
            event.preventDefault();
            logoutWindow?.close();
            return;
        }

        const isDevToolsShortcut =
            ((input.control || input.meta) && input.alt && input.key.toLowerCase() === 'i') ||
            input.key === 'F12';

        if (isDevToolsShortcut && input.type === 'keyDown') {
            event.preventDefault();
            if (logoutWindow?.webContents.isDevToolsOpened()) {
                logoutWindow?.webContents.closeDevTools();
            } else {
                logoutWindow?.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });

    logoutWindow.loadURL(pageUrl);
    logoutWindow.on('close', () => {
        logoutWindow?.destroy();
        logoutWindow = null;
    });

    mainLogger.endTask(taskId, "Electron", "Logout window created");
};

/**
 * Opens the share document window.
 */
export const openShareDocumentWindow = async (): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Opening share document window");
    if (!baseWindow)
        return;

    const pageUrl = getRootUrl() + "share-document"
    const backgroundColor = nativeTheme.shouldUseDarkColors
        ? '#0a0a0a'
        : '#FFFFFF';

    shareDocumentWindow = new BrowserWindow({
        width: 500,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            devTools: is.dev,
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        parent: baseWindow,
        modal: true,
        resizable: true,
        minimizable: false,
        maximizable: false,
        title: "Share Document",
        icon: getIconPath(),
        show: false,
        backgroundColor,
    });

    if (shareDocumentWindow && !shareDocumentWindow.isDestroyed()) {
        shareDocumentWindow.show();
    }

    shareDocumentWindow.webContents.once('did-finish-load', () => {
        shareDocumentWindow?.setMenu(null);
        shareDocumentWindow?.setTitle("Share Document");
        const currentLanguage = i18next.language;
        shareDocumentWindow?.webContents.send("language-changed", currentLanguage);
    });

    shareDocumentWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Escape' && input.type === 'keyDown') {
            event.preventDefault();
            shareDocumentWindow?.close();
            return;
        }

        const isDevToolsShortcut =
            ((input.control || input.meta) && input.alt && input.key.toLowerCase() === 'i') ||
            input.key === 'F12';

        if (isDevToolsShortcut && input.type === 'keyDown') {
            event.preventDefault();
            if (shareDocumentWindow?.webContents.isDevToolsOpened()) {
                shareDocumentWindow?.webContents.closeDevTools();
            } else {
                shareDocumentWindow?.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });

    shareDocumentWindow.loadURL(pageUrl);
    shareDocumentWindow.on('close', () => {
        shareDocumentWindow?.destroy();
        shareDocumentWindow = null;
    });

    shareDocumentWindow.webContents.toggleDevTools();

    mainLogger.endTask(taskId, "Electron", "Opening share window created");
};

/**
 * Opens the shared files window.
 */
export const openSharedDocumentsWindow = async (): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Opening shared files window");
    if (!baseWindow)
        return;

    const pageUrl = getRootUrl() + "shared-files";
    const backgroundColor = nativeTheme.shouldUseDarkColors
        ? '#0a0a0a'
        : '#FFFFFF';

    sharedDocumentsWindow = new BrowserWindow({
        width: 1300,
        height: 700,
        minWidth: 1000,
        minHeight: 500,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            devTools: is.dev,
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        parent: baseWindow,
        modal: true,
        resizable: true,
        minimizable: false,
        maximizable: false,
        title: i18next.t("sharedFiles.title"),
        icon: getIconPath(),
        show: false,
        backgroundColor,
    });

    if (sharedDocumentsWindow && !sharedDocumentsWindow.isDestroyed()) {
        sharedDocumentsWindow.show();
    }

    sharedDocumentsWindow.webContents.once('did-finish-load', () => {
        sharedDocumentsWindow?.setMenu(null);
        sharedDocumentsWindow?.setTitle(i18next.t("sharedFiles.title"));
        const currentLanguage = i18next.language;
        sharedDocumentsWindow?.webContents.send("language-changed", currentLanguage);
    });

    sharedDocumentsWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Escape' && input.type === 'keyDown') {
            event.preventDefault();
            sharedDocumentsWindow?.close();
            return;
        }

        const isDevToolsShortcut =
            ((input.control || input.meta) && input.alt && input.key.toLowerCase() === 'i') ||
            input.key === 'F12';

        if (isDevToolsShortcut && input.type === 'keyDown') {
            event.preventDefault();
            if (sharedDocumentsWindow?.webContents.isDevToolsOpened()) {
                sharedDocumentsWindow?.webContents.closeDevTools();
            } else {
                sharedDocumentsWindow?.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });

    sharedDocumentsWindow.loadURL(pageUrl);
    sharedDocumentsWindow.on('close', () => {
        sharedDocumentsWindow?.destroy();
        sharedDocumentsWindow = null;
    });

    sharedDocumentsWindow.webContents.toggleDevTools()

    mainLogger.endTask(taskId, "Electron", "Shared files window created");
};

/**
 * @param filePath - The URL of the page to open.
 * @param didFinishLoadCallback - The callback to call when the sub window is created.
 * @returns A promise that resolves when the sub window is created.
 */
export const openPDFFileWindow = async (
    filePath: string,
    options: BrowserWindowConstructorOptions = {}
): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Creating sub file window");

    if (!baseWindow) return;

    childWindow = new BrowserWindow({
        width: 850,
        height: 700,
        modal: false,
        show: false,
        title: "Preview",
        icon: getIconPath(),
        webPreferences: {
            sandbox: false,
            webSecurity: true,
            devTools: true,
            contextIsolation: true,
            nodeIntegration: false,
        },
        ...options
    });

    await childWindow.loadFile(filePath);

    childWindow.on("closed", () => {
        childWindow?.destroy();
        childWindow = null;
    });

    childWindow?.setMenu(null);
    childWindow?.show();

    mainLogger.endTask(taskId, "Electron", "Sub file window created");
};
