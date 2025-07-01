import path from "path";
import { getBaseWindow } from "../main-window";
import { mainLogger } from "../shared/logger";
import { promises as fs } from 'fs'
import { app, dialog } from "electron";
import * as fsSync from 'fs';
import {
    createDocumentObject,
    getCurrentAnnotations,
    getCurrentApparatuses,
    getCurrentMainText,
    getCurrentMetadata,
    getCurrentTemplate,
    getLastFolderPath,
    setLastFolderPath,
    updateRecentDocuments,
    getCurrentReferencesFormat,
} from "./document";
import { getSelectedTab, setFilePathForSelectedTab } from "../toolbar";
import { readFileSavingDirectory, readDefaultDirectory } from "../store";
import assert from "assert";


/**
 * Opens a file dialog to select a file and loads the document at the selected path
 * @returns void
 */
export const openDocument = async (filePath: string | null | undefined, onDone?: (filePath: string) => void): Promise<void> => {
    if (filePath) {
        onDone?.(filePath)
        return;
    }

    const taskId = mainLogger.startTask("Electron", "Opening file dialog");

    const window = getBaseWindow();
    if (!window) return

    // Determine the default directory based on file saving preferences
    let defaultDirectory: string;
    const fileSavingDirectory = readFileSavingDirectory();

    if (fileSavingDirectory === 'last') {
        // Use the last folder path if available, otherwise fall back to documents
        defaultDirectory = getLastFolderPath() ?? app.getPath('documents');
    } else if (fileSavingDirectory === 'default') {
        // Use the default directory from preferences
        const defaultDir = readDefaultDirectory();
        // Expand the ~ to the user's home directory if needed
        defaultDirectory = defaultDir.startsWith('~/')
            ? path.join(app.getPath('home'), defaultDir.slice(2))
            : defaultDir;
    } else {
        // Fallback to documents folder for any other case
        defaultDirectory = app.getPath('documents');
    }

    const result = await dialog.showOpenDialog(window, {
        title: 'Open file', // To be translated
        defaultPath: path.join(defaultDirectory, ''),
        filters: [
            {
                name: 'Criterion',
                extensions: [
                    'critx',
                ]
            },
            {
                name: 'Images',
                extensions: [
                    'jpeg',
                    'jpg',
                    'png',
                    'gif',
                    'bmp',
                    'tiff',
                    'tif',
                ]
            },
            {
                name: 'PDF',
                extensions: [
                    'pdf',
                ]
            }
        ],
        properties: ['openFile']
    });

    mainLogger.endTask(taskId, "Electron", "File dialog closed");

    if (result.canceled || !result.filePaths[0]) return;
    const selectedFilePath = result.filePaths[0]
    setLastFolderPath(path.dirname(selectedFilePath))
    onDone?.(selectedFilePath)
}

/**
 * Saves the current document
 * @param onDone - The callback to call when the document is saved
 * @param specificTab - Optional specific tab to save (if not provided, uses selected tab)
 * @param suppressPopup - Optional flag to suppress the "Document updated!" popup (useful for auto-save)
 * @returns Promise<boolean> - true if saved successfully, false if cancelled
 */
export const saveDocument = async (onDone?: ((filePath: string) => void), specificTab?: Tab, suppressPopup?: boolean): Promise<boolean> => {
    const currentTab = specificTab || getSelectedTab()
    const filePath = currentTab?.filePath
    const isNewDocument = !filePath

    if (isNewDocument)
        return await createNewDocument(onDone)
    else
        return await updateCurrentDocument(onDone, currentTab, suppressPopup)
}

/**
 * Saves current document as a new document by showing a save dialog
 * @returns void
 */
export const saveDocumentAs = async (onDone?: (filePath: string) => void): Promise<void> => {
    createNewDocument(onDone)
}

/**
 * Renames a document by showing a save dialog
 * @param onDone - The callback to call when the document is renamed
 * @returns void
 */
export const renameDocument = async (onDone?: (filename: string) => void): Promise<void> => {
    const dialogTaskId = mainLogger.startTask("Electron", "Show rename dialog");

    const currentTab = getSelectedTab()
    const baseWindow = getBaseWindow()
    if (!baseWindow || !currentTab) return

    const filePath = currentTab.filePath
    if (!filePath) return

    const currentDirectory = path.dirname(filePath);
    const currentFileName = path.basename(filePath);

    const result = await dialog.showSaveDialog(baseWindow, {
        title: 'Rename...', // To be translated
        defaultPath: path.join(currentDirectory, currentFileName),
        filters: [{ name: 'Criterion', extensions: ['critx'] }],
        properties: ['createDirectory']
    });

    mainLogger.endTask(dialogTaskId, "Electron", "Rename dialog closed");

    if (!result.canceled && result.filePath && result.filePath !== filePath) {
        if (result.filePath === filePath) return;

        if (fsSync.existsSync(result.filePath)) {
            const { response } = await dialog.showMessageBox(
                baseWindow,
                {
                    type: 'warning',
                    buttons: [ // To be translated
                        'Cancel',
                        'No',
                        'Yes',
                    ],
                    defaultId: 2, // Yes
                    cancelId: 0,  // Cancel
                    message: 'File already exists! Do you want to overwrite it?'
                });

            if (response === 0) return;
            if (response === 1) return await renameDocument();
        }

        try {
            await fs.rename(filePath, result.filePath);
        } catch (err) {
            await dialog.showMessageBox(baseWindow, {
                type: 'error',
                message: 'Error while renaming file: ' + err
            });
            return;
        }

        setFilePathForSelectedTab(result.filePath);
        updateRecentDocuments(result.filePath);

        const basename = path.parse(result.filePath).base
        onDone?.(basename)

        await dialog.showMessageBox(baseWindow, {
            type: 'info',
            message: 'File renamed successfully!'
        });
    }
}

/**
 * Moves a document to a new folder by showing a save dialog
 * @returns void
 */
export const moveDocument = async (): Promise<void> => {
    const currentTab = getSelectedTab()
    const baseWindow = getBaseWindow()
    if (!baseWindow || !currentTab) return

    const filePath = currentTab.filePath
    if (!filePath) return

    const fileName = path.basename(filePath)

    const { canceled, filePaths } = await dialog.showOpenDialog(baseWindow, {
        properties: ['openDirectory'],
        title: 'Choose destination folder', // To be translated
    });

    if (canceled || filePaths.length === 0) return;

    const destFolder = filePaths[0];
    const destPath = path.join(destFolder, fileName);

    if (fsSync.existsSync(destPath)) {
        const { response } = await dialog.showMessageBox(baseWindow, {
            type: 'warning',
            buttons: [
                'Yes', // To be translated
                'No', // To be translated
            ],
            defaultId: 1, // No
            title: 'Confirm Overwrite', // To be translated
            message: `${fileName} already exists. Please replace the file?`,
        });

        if (response === 1) return;
    }

    // 3. Try to move the file (using rename first, fallback to copy + delete)
    try {
        await fs.rename(filePath, destPath);
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'EXDEV') {
            // Cross-device move not permitted, fallback to copy + delete
            await fs.copyFile(filePath, destPath);
            await fs.unlink(filePath);
        } else {
            throw err;
        }
    }

    setFilePathForSelectedTab(destPath);
    updateRecentDocuments(destPath);

    await dialog.showMessageBox(baseWindow, {
        type: 'info',
        message: 'File moved successfully.',
    });
}

/**
 * Closes the application
 * @returns void
 */
export const closeApplication = async (): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Exiting application");

    app.exit();

    mainLogger.endTask(taskId, "Electron", "Application exited");
}

const updateCurrentDocument = async (onDone?: ((filePath: string) => void), specificTab?: Tab, suppressPopup?: boolean): Promise<boolean> => {
    const taskId = mainLogger.startTask("Electron", "Updating current document");

    const baseWindow = getBaseWindow()
    if (!baseWindow) return false

    const currentTab = specificTab || getSelectedTab()
    const filePath = currentTab?.filePath
    assert(filePath, "Current tab has no file path");

    const fileContent = await fs.readFile(filePath, 'utf8');
    const document = JSON.parse(fileContent);

    const updatedDocument = await createDocumentObject({
        version: document.version,
        createdAt: document.createdAt,
        updatedAt: new Date().toISOString(),
        mainText: getCurrentMainText(),
        apparatuses: getCurrentApparatuses(),
        annotations: getCurrentAnnotations(),
        template: getCurrentTemplate(),
        referencesFormat: getCurrentReferencesFormat(),
        metadata: getCurrentMetadata(),
    });

    await fs.writeFile(filePath, JSON.stringify(updatedDocument, null, 2));
    onDone?.(filePath)
    if (!suppressPopup) {
        await dialog.showMessageBox(baseWindow, { message: 'Document updated!' });
    }

    mainLogger.endTask(taskId, "Electron", "Document updated");
    return true
}

const createNewDocument = async (onDone?: ((filePath: string) => void)): Promise<boolean> => {
    const taskId = mainLogger.startTask("Electron", "Creating new document");

    const baseWindow = getBaseWindow()
    if (!baseWindow) return false

    // New document
    const newDocument = await createDocumentObject({
        version: "1.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mainText: getCurrentMainText(),
        apparatuses: getCurrentApparatuses(),
        annotations: getCurrentAnnotations(),
        template: getCurrentTemplate(),
        referencesFormat: getCurrentReferencesFormat(),
        metadata: getCurrentMetadata(),
    });

    // Determine the default directory based on file saving preferences
    let defaultDirectory: string;
    const fileSavingDirectory = readFileSavingDirectory();

    if (fileSavingDirectory === 'last') {
        // Use the last folder path if available, otherwise fall back to documents
        defaultDirectory = getLastFolderPath() ?? app.getPath('documents');
    } else if (fileSavingDirectory === 'default') {
        // Use the default directory from preferences
        const defaultDir = readDefaultDirectory();
        // Expand the ~ to the user's home directory if needed
        defaultDirectory = defaultDir.startsWith('~/')
            ? path.join(app.getPath('home'), defaultDir.slice(2))
            : defaultDir;
    } else {
        // Fallback to downloads folder for any other case
        defaultDirectory = app.getPath('downloads');
    }

    const result = await dialog.showSaveDialog(baseWindow, {
        title: 'Save Document As...', // Translate this
        defaultPath: path.join(defaultDirectory, 'CRIT_Document.critx'),
        filters: [{ name: 'Criterion', extensions: ['critx'] }]
    });

    if (result.canceled || !result.filePath) return false

    // Update the last folder path when a file is saved
    setLastFolderPath(path.dirname(result.filePath));

    await fs.writeFile(result.filePath, JSON.stringify(newDocument, null, 2));
    onDone?.(result.filePath)
    await dialog.showMessageBox(baseWindow, { message: 'Document saved!' });

    mainLogger.endTask(taskId, "Electron", "New document created");
    return true
}
