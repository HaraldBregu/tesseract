import path from "node:path";
import { getBaseWindow } from "../main-window";
import { mainLogger } from "../shared/logger";
import { promises, existsSync, openSync, writeFileSync, readFileSync, closeSync, constants } from 'node:fs'
import { app, dialog } from "electron";
import i18next from 'i18next';
import {
    createDocument,
    createDocumentRecord,
} from "./document";
import { getSelectedTab, setFilePathForSelectedTab } from "../toolbar";
import { readFileSavingDirectory, readDefaultDirectory, storeLastFolderPath, readLastFolderPath, readPdfQuality } from "../store";
import { platform } from "@electron-toolkit/utils";
import { exec } from "node:child_process";
import { checkSignature, checkVersion, getAppBasePath, MIN_DOCUMENT_VERSION_SUPPORTED, readFile, readObject, updateRecentDocuments } from "../shared/util";
import { DocumentTabManager } from "./document-tab";
import { buildTei } from "./buildTei";
import { corruptedFileMessageBox, misssingVersionMessageBox, showFileNotFoundMessageBox, unsupportedVersionMessageBox, openFileDialog, invalidContentMessageBox, invalidJSONMessageBox, misssingSignatureMessageBox } from "../shared/dialogs";
import { createSignature } from "../shared/signature";

let documentObject: Record<string, unknown> | null = null

const setDocumentObject = (data: Record<string, unknown> | null): void => {
    documentObject = data
}

export const getDocumentObject = (): Record<string, unknown> | null => documentObject

/**
 * Truncates a filename to avoid Windows MAX_PATH (260 chars) limit.
 * Keeps the filename short enough for temp paths while preserving readability.
 * @param fileName - Original filename without extension
 * @param maxLength - Maximum allowed length (default 50 chars)
 * @returns Truncated filename
 */
const truncateFileName = (fileName: string, maxLength: number = 50): string => {
    if (fileName.length <= maxLength) {
        return fileName;
    }
    // Keep first part and add hash of the full name for uniqueness
    const hash = fileName.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const hashStr = Math.abs(hash).toString(36).substring(0, 6);
    const truncatedPart = fileName.substring(0, maxLength - 7); // -7 for underscore + 6 char hash
    return `${truncatedPart}_${hashStr}`;
}

export const loadDocumentFromPath = async (filepath: string): Promise<Record<string, unknown> | null> => {
    const window = getBaseWindow();
    if (!window)
        return null;

    // Check if file exist at the filepath
    if (!existsSync(filepath)) {
        mainLogger.error("Document", `File not found: ${filepath}`);
        await showFileNotFoundMessageBox(window, filepath)
        return null;
    }

    // Read the file content
    const [fileString, readFileError] = readFile(filepath);
    if (readFileError) {
        await invalidContentMessageBox(window);
        return null;
    }

    // Parse the JSON
    const [object, readObjectError] = readObject(fileString);
    if (readObjectError) {
        await invalidJSONMessageBox(window);
        return null;
    }

    // Check the signature
    const signature = checkSignature(object)
    switch (signature) {
        case "MISSING":
            await misssingSignatureMessageBox(window, filepath)
            return null;
        case "INVALID":
            await corruptedFileMessageBox(window, filepath)
            return null;
    }

    // Check version compatibility
    const version = checkVersion(object, MIN_DOCUMENT_VERSION_SUPPORTED)
    switch (version) {
        case "MISSING":
            await misssingVersionMessageBox(window, filepath)
            return null;
        case "UNSUPPORTED":
            await unsupportedVersionMessageBox(window)
            return null;
    }

    return object
}

export const openDocumentAtPath = async (filepath: string, onDone: (filePath: string) => void): Promise<void> => {
    setDocumentObject(null)
    storeLastFolderPath(filepath)
    updateRecentDocuments(filepath);

    const fileNameParsed = path.parse(filepath);
    const fileNameExt = fileNameParsed.ext as FileNameExt;
    const fileType = fileNameExt.slice(1) as FileType;

    if (fileType !== 'critx') {
        onDone(filepath)
        return
    }

    // const window = getBaseWindow();
    // if (!window)
    //     return;

    // // Check if file exist at the filepath
    // if (!existsSync(filepath)) {
    //     mainLogger.error("Document", `File not found: ${filepath}`);
    //     await showFileNotFoundMessageBox(window, filepath)
    //     return;
    // }

    // // Read the file content
    // const [fileString, readFileError] = readFile(filepath);
    // if (readFileError) {
    //     await invalidContentMessageBox(window);
    //     return;
    // }

    // // Parse the JSON
    // const [object, readObjectError] = readObject(fileString);
    // if (readObjectError) {
    //     await invalidJSONMessageBox(window);
    //     return;
    // }

    // // Check the signature
    // const signature = checkSignature(object)
    // switch (signature) {
    //     case "MISSING":
    //         await misssingSignatureMessageBox(window, filepath)
    //         return;
    //     case "INVALID":
    //         await corruptedFileMessageBox(window, filepath)
    //         return;
    // }

    // // Check version compatibility
    // const version = checkVersion(object, MIN_DOCUMENT_VERSION_SUPPORTED)
    // switch (version) {
    //     case "MISSING":
    //         await misssingVersionMessageBox(window, filepath)
    //         return;
    //     case "UNSUPPORTED":
    //         await unsupportedVersionMessageBox(window)
    //         return;
    // }

    const object = await loadDocumentFromPath(filepath);
    if (!object)
        return;

    setDocumentObject(object)
    onDone(filepath)
}

export const openDocumentDialog = async (): Promise<string | null> => {
    const taskId = mainLogger.startTask("Electron", "Opening file dialog");
    const window = getBaseWindow();
    if (!window)
        return null

    let defaultDirectory: string;
    const fileSavingDirectory = readFileSavingDirectory();

    if (fileSavingDirectory === 'last') {
        defaultDirectory = readLastFolderPath() ?? app.getPath('documents');
    } else if (fileSavingDirectory === 'default') {
        const defaultDir = readDefaultDirectory();
        defaultDirectory = defaultDir.startsWith('~/')
            ? path.join(app.getPath('home'), defaultDir.slice(2))
            : defaultDir;
    } else {
        defaultDirectory = app.getPath('documents');
    }

    const result = await openFileDialog(window, path.join(defaultDirectory, ''))
    mainLogger.endTask(taskId, "Electron", "File dialog closed");

    if (result.canceled || !result.filePaths[0])
        return null;

    const filepath = result.filePaths[0]
    return filepath
}


export const openDocument = async (onDone: (filePath: string) => void): Promise<void> => {
    const filepath = await openDocumentDialog()
    if (!filepath)
        return;

    openDocumentAtPath(filepath, onDone)
}

export const saveDocument = async (onDone: ((filePath: string) => void), _specificTab?: Tab, suppressPopup?: boolean): Promise<boolean> => {
    const currentDocTabInstance = DocumentTabManager.getCurrentTab()
    const filePath = currentDocTabInstance?.path
    const isNewDocument = !filePath
    suppressPopup = true

    if (isNewDocument)
        return await createNewDocument(onDone)
    else
        return await updateCurrentDocument(onDone, currentDocTabInstance, suppressPopup)
}

export const saveDocumentAs = async (onDone: (filePath: string, doc: DocumentData) => void): Promise<void> => {
    const currentTab = getSelectedTab()
    if (!currentTab)
        return;

    const filePath = currentTab.filePath;
    const fileName = filePath ? path.basename(filePath, '.critx') : undefined;
    createNewDocument(onDone, fileName)
}

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

        if (existsSync(result.filePath)) {
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
            await promises.rename(filePath, result.filePath);
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

    if (existsSync(destPath)) {
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
        await promises.rename(filePath, destPath);
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'EXDEV') {
            // Cross-device move not permitted, fallback to copy + delete
            await promises.copyFile(filePath, destPath);
            await promises.unlink(filePath);
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

export const closeApplication = async (): Promise<void> => {
    const taskId = mainLogger.startTask("Electron", "Exiting application");

    app.exit();

    mainLogger.endTask(taskId, "Electron", "Application exited");
}

const updateCurrentDocument = async (onDone?: ((filePath: string, doc: DocumentData) => void), specificTab?: DocumentTab, suppressPopup?: boolean): Promise<boolean> => {
    const taskId = mainLogger.startTask("Electron", "Updating current document");

    const baseWindow = getBaseWindow()
    if (!baseWindow || !specificTab?.id)
        return false

    const currentTab = specificTab
    const filePath = currentTab?.path

    const currentMetadata = DocumentTabManager
        .setCurrentTab()
        .getMetadata()

    const documentData = DocumentTabManager
        .setCurrentTab()
        .setMetadata({
            ...currentMetadata,
            updatedDate: new Date().toISOString()
        })
        .getDocument()

    const updatedDocument = await createDocumentRecord(documentData);

    delete updatedDocument.signature
    const newSignature = createSignature(updatedDocument)
    updatedDocument.signature = newSignature

    await promises.writeFile(filePath, JSON.stringify(updatedDocument, null, 2));

    onDone?.(filePath, documentData)
    if (!suppressPopup) {
        await dialog.showMessageBox(baseWindow, { message: 'Document updated!' });
    }

    mainLogger.endTask(taskId, "Electron", "Document updated");
    return true
}

export const downloadDocument = async (filename: string, document: DocumentData): Promise<boolean> => {
    const taskId = mainLogger.startTask("Electron", "Download document");

    const newDocument = await createDocumentRecord(document);
    const baseWindow = getBaseWindow()
    if (!baseWindow)
        return false

    let defaultDirectory: string;
    const fileSavingDirectory = readFileSavingDirectory();

    if (fileSavingDirectory === 'last') {
        defaultDirectory = readLastFolderPath() ?? app.getPath('documents');
    } else if (fileSavingDirectory === 'default') {
        const defaultDir = readDefaultDirectory();
        defaultDirectory = defaultDir.startsWith('~/')
            ? path.join(app.getPath('home'), defaultDir.slice(2))
            : defaultDir;
    } else {
        defaultDirectory = app.getPath('downloads');
    }

    const result = await dialog.showSaveDialog(baseWindow, {
        title: 'Save Document As...', // Translate this
        defaultPath: path.join(defaultDirectory, filename),
        filters: [{ name: 'Criterion', extensions: ['critx'] }]
    });

    if (result.canceled || !result.filePath)
        return false

    storeLastFolderPath(path.dirname(result.filePath))

    await promises.writeFile(result.filePath, JSON.stringify(newDocument, null, 2));

    await dialog.showMessageBox(baseWindow, { message: 'Document saved!' });

    mainLogger.endTask(taskId, "Electron", "Document downloaded");

    return true
}

export const saveFile = async (filePath: string, content: Record<string, unknown>) => {
    const taskId = mainLogger.startTask("Electron", "Save file");
    
    await promises.writeFile(filePath, JSON.stringify(content, null, 2));
    
    mainLogger.endTask(taskId, "Electron", "File saved");
}

const createNewDocument = async (onDone: ((filePath: string, doc: DocumentData) => void), fileName?: string): Promise<boolean> => {
    const taskId = mainLogger.startTask("Electron", "Creating new document");

    const baseWindow = getBaseWindow()
    if (!baseWindow)
        return false

    const currentMetadata = DocumentTabManager
        .setCurrentTab()
        .getMetadata()

    const documentData = DocumentTabManager
        .setCurrentTab()
        .setMetadata({
            ...currentMetadata,
            updatedDate: new Date().toISOString()
        })
        .getDocument()

    const newDocument = await createDocumentRecord(documentData);

    delete newDocument.signature
    const newSignature = createSignature(newDocument)
    newDocument.signature = newSignature

    // Determine the default directory based on file saving preferences
    let defaultDirectory: string;
    const fileSavingDirectory = readFileSavingDirectory();

    if (fileSavingDirectory === 'last') {
        // Use the last folder path if available, otherwise fall back to documents
        defaultDirectory = readLastFolderPath() ?? app.getPath('documents');
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

    const customFileName = fileName ? `${fileName}.critx` : 'CRIT_Document.critx';

    const result = await dialog.showSaveDialog(baseWindow, {
        title: 'Save Document As...', // Translate this
        defaultPath: path.join(defaultDirectory, customFileName),
        filters: [{ name: 'Criterion', extensions: ['critx'] }]
    });

    if (result.canceled || !result.filePath)
        return false

    // Update the last folder path when a file is saved
    storeLastFolderPath(path.dirname(result.filePath))

    await promises.writeFile(result.filePath, JSON.stringify(newDocument, null, 2));
    onDone?.(result.filePath, documentData)

    await dialog.showMessageBox(baseWindow, { message: 'Document saved!' });

    mainLogger.endTask(taskId, "Electron", "New document created");
    return true
}

export const cleanupOldTempDirectories = async (): Promise<void> => {
    mainLogger.info('PRINT-PREVIEW', '🧹 [cleanupOldTempDirectories] Inizio pulizia cartelle temporanee');

    try {
        const systemTempDir = app.getPath('temp');
        mainLogger.info('PRINT-PREVIEW', `📁 [cleanupOldTempDirectories] Directory temporanea sistema: ${systemTempDir}`);

        const tempDirContents = await promises.readdir(systemTempDir);
        mainLogger.info('PRINT-PREVIEW', `📋 [cleanupOldTempDirectories] Contenuto directory temp: ${tempDirContents.length} elementi`);
        mainLogger.info('PRINT-PREVIEW', `📋 [cleanupOldTempDirectories] Elementi trovati: ${JSON.stringify(tempDirContents)}`);

        const criterionTempDirs = tempDirContents.filter(name => name.startsWith('criterion-'));
        mainLogger.info('PRINT-PREVIEW', `🔍 [cleanupOldTempDirectories] Cartelle Criterion trovate: ${criterionTempDirs.length}`);
        mainLogger.info('PRINT-PREVIEW', `🔍 [cleanupOldTempDirectories] Cartelle Criterion: ${JSON.stringify(criterionTempDirs)}`);

        const cutoffTime = Date.now() - (60 * 1000); // 1 minuto fa
        const cutoffDate = new Date(cutoffTime);
        mainLogger.info('PRINT-PREVIEW', `⏰ [cleanupOldTempDirectories] Cutoff time: ${cutoffTime} (${cutoffDate.toISOString()})`);

        for (const dirName of criterionTempDirs) {
            mainLogger.info('PRINT-PREVIEW', `🔍 [cleanupOldTempDirectories] Analizzando cartella: ${dirName}`);

            try {
                const dirPath = path.join(systemTempDir, dirName);
                const dirStats = await promises.stat(dirPath);

                const dirModTime = dirStats.mtime.getTime();
                const dirModDate = new Date(dirModTime);
                const isOlderThanCutoff = dirModTime < cutoffTime;

                mainLogger.info('PRINT-PREVIEW', `📊 [cleanupOldTempDirectories] ${dirName} - isDirectory: ${dirStats.isDirectory()}, mtime: ${dirModTime} (${dirModDate.toISOString()}), isOlderThanCutoff: ${isOlderThanCutoff}`);

                if (dirStats.isDirectory() && isOlderThanCutoff) {
                    mainLogger.info('PRINT-PREVIEW', `🗑️ [cleanupOldTempDirectories] Eliminando cartella vecchia: ${dirPath}`);
                    await promises.rmdir(dirPath, { recursive: true });
                    mainLogger.info('PRINT-PREVIEW', `✅ [cleanupOldTempDirectories] Cartella eliminata con successo: ${dirPath}`);
                } else {
                    mainLogger.info('PRINT-PREVIEW', `⏭️ [cleanupOldTempDirectories] Cartella non eliminata (${dirStats.isDirectory() ? 'troppo recente' : 'non è una directory'}): ${dirPath}`);
                }
            } catch (error) {
                mainLogger.error('PRINT-PREVIEW', `❌ [cleanupOldTempDirectories] Errore durante analisi/eliminazione cartella ${dirName}: ${error}`);
            }
        }

        mainLogger.info('PRINT-PREVIEW', '✅ [cleanupOldTempDirectories] Pulizia cartelle temporanee completata');
    } catch (error) {
        mainLogger.error('PRINT-PREVIEW', `❌ [cleanupOldTempDirectories] Errore generale durante pulizia cartelle temporanee: ${error}`);
    }
};

const createTempCritxFile = async (): Promise<string> => {
    mainLogger.info('PRINT-PREVIEW', '[createTempCritxFile] Inizio creazione file temporaneo');

    // Pulizia preventiva delle cartelle temporanee vecchie
    await cleanupOldTempDirectories();

    const currentTab = getSelectedTab()
    const currentFilePath = currentTab?.filePath
    mainLogger.info('PRINT-PREVIEW', `[createTempCritxFile] File path corrente: ${currentFilePath || 'File non salvato'}`);

    // Determina il nome del file (usa nome dal path se salvato, altrimenti genera nome temporaneo)
    const fileName = currentFilePath
        ? path.basename(currentFilePath, '.critx')
        : `untitled`;

    mainLogger.info('PRINT-PREVIEW', `[createTempCritxFile] Nome file estratto: ${fileName}`);

    const documentData = DocumentTabManager
        .setCurrentTab()
        .getDocument()

    // Crea il documento oggetto
    const tempDocument = await createDocumentRecord(documentData);
    mainLogger.info('PRINT-PREVIEW', '[createTempCritxFile] Documento oggetto creato');

    // Usa la directory temporanea del sistema
    const systemTempDir = app.getPath('temp');
    const timestamp = Date.now();
    // Truncate filename to avoid Windows MAX_PATH (260 chars) limit
    const shortFileName = truncateFileName(fileName, 40);
    const tempFolderName = `criterion-${shortFileName}-${timestamp}`;
    const tempFolderPath = path.join(systemTempDir, tempFolderName);
    mainLogger.info('PRINT-PREVIEW', `📁 [createTempCritxFile] Cartella temporanea: ${tempFolderPath}`);
    mainLogger.info('PRINT-PREVIEW', `📁 [createTempCritxFile] Nome file originale: ${fileName}, troncato: ${shortFileName}`);

    // Crea la cartella temporanea se non esiste
    try {
        await promises.mkdir(tempFolderPath, { recursive: true });
        mainLogger.info('PRINT-PREVIEW', `[createTempCritxFile] Cartella temporanea creata: ${tempFolderPath}`);
    } catch (error) {
        mainLogger.error('PRINT-PREVIEW', `[createTempCritxFile] Errore creazione cartella temporanea: ${error}`);
        throw error;
    }

    // Genera il nome del file temporaneo (usa nome troncato per evitare problemi di path su Windows)
    const tempFileName = `${shortFileName}.critx`;
    const tempFilePath = path.join(tempFolderPath, tempFileName);
    mainLogger.info('PRINT-PREVIEW', `[createTempCritxFile] File temporaneo path: ${tempFilePath}`);

    // Scrive il file temporaneo
    await promises.writeFile(tempFilePath, JSON.stringify(tempDocument, null, 2));
    mainLogger.info('PRINT-PREVIEW', '[createTempCritxFile] File temporaneo scritto con successo');

    // Verifica che il file sia stato creato correttamente
    try {
        const tempFileStats = await promises.stat(tempFilePath);
        mainLogger.info('PRINT-PREVIEW', `[createTempCritxFile] File temporaneo verificato: ${tempFileStats.isFile()}, Size: ${tempFileStats.size}`);
    } catch (error) {
        mainLogger.error('PRINT-PREVIEW', `[createTempCritxFile] Errore verifica file temporaneo: ${error}`);
        throw error;
    }

    return tempFilePath;
};

export const savePdf = async (sections: PrintSections, authorNames?: string[]): Promise<string> => {

    mainLogger.info('PRINT-PREVIEW', '📁 [savePdf] Starting PDF generation');

    // Create a temporary .critx file with the current state
    const tempFilePath = await createTempCritxFile();
    mainLogger.info('PRINT-PREVIEW', `📁 [savePdf] File created: ${tempFilePath}`);
    const tempWorkingDirectory = path.dirname(tempFilePath);
    mainLogger.info('PRINT-PREVIEW', `📁 [savePdf] Starting PDF generation with temporary working directory: ${tempWorkingDirectory}`);

    const sandboxFilePath = path.join(tempWorkingDirectory, 'sandbox');
    mainLogger.info('PRINT-PREVIEW', `📁 [savePdf] sandboxFilePath: ${sandboxFilePath}`);


    // Estrae il nome del file senza estensione (.critx)
    const fileName = path.basename(tempFilePath, '.critx');
    mainLogger.info('PRINT-PREVIEW', `📁 [savePdf] Filename: ${fileName}`);

    let jreBinFolder: string;

    const buildResourcesPath = path.join(getAppBasePath(), 'buildResources/printPreview');
    mainLogger.info('PRINT-PREVIEW', `🏠 [savePdf] App path: ${buildResourcesPath}`);
    mainLogger.info('PRINT-PREVIEW', `📦 [savePdf] Base path: ${getAppBasePath()}`);

    mainLogger.info('PRINT-PREVIEW', `🔧 [savePdf] Build resources path: ${buildResourcesPath}`);

    // Verifica che la directory buildResources esista
    try {
        const buildResourcesStats = await promises.stat(buildResourcesPath);
        mainLogger.info('PRINT-PREVIEW', `📁 [savePdf] Build resources directory exists: ${buildResourcesStats.isDirectory()}`);
    } catch (error) {
        mainLogger.error('PRINT-PREVIEW', `❌ [savePdf] Build resources directory not found: ${error}`);
        throw new Error(`Directory buildResources not found: ${buildResourcesPath}`);
    }

    const jreFilePath = path.join(buildResourcesPath, 'printpreview-0.0.1-SNAPSHOT.jar');
    mainLogger.info('PRINT-PREVIEW', `☕ [savePdf] JAR file path: ${jreFilePath}`);

    // Verifica che il file JAR esista
    try {
        const jarStats = await promises.stat(jreFilePath);
        mainLogger.info('PRINT-PREVIEW', `✅ [savePdf] JAR file exists: ${jarStats.isFile()}`);
    } catch (error) {
        mainLogger.error('PRINT-PREVIEW', `❌ [savePdf] JAR file not found: ${error}`);
        throw new Error(`File JAR not found: ${jreFilePath}`);
    }



    // Log per debug del sistema operativo
    if (platform.isMacOS) {
        jreBinFolder = path.join(buildResourcesPath, 'jre/macos/Contents/Home/bin');
    } else if (platform.isWindows) {
        jreBinFolder = path.join(buildResourcesPath, 'jre/win/bin'); // verificare che sia corretto
    } else if (platform.isLinux) {
        jreBinFolder = path.join(buildResourcesPath, 'jre/linux/bin'); // verificare che sia corretto
    }
    else {
        // TODO: supporto per linux
        throw new Error("Unsupported operating system");
    }

    mainLogger.info('PRINT-PREVIEW', `☕ [savePdf] JRE bin folder: ${jreBinFolder}`);

    // Verifica che la directory JRE esista
    try {
        const jreStats = await promises.stat(jreBinFolder);
        mainLogger.info('PRINT-PREVIEW', `📁 [savePdf] The JRE directory exists: ${jreStats.isDirectory()}`);
    } catch (error) {
        mainLogger.error('PRINT-PREVIEW', `❌ [savePdf] JRE directory not found: ${error}`);
        throw new Error(`Directory JRE not found: ${jreBinFolder}`);
    }

    // Verifica che l'eseguibile java esista (con estensione .exe su Windows)
    const javaExecutableName = platform.isWindows ? 'java.exe' : 'java';
    const javaExecutable = path.join(jreBinFolder, javaExecutableName);
    try {
        const javaStats = await promises.stat(javaExecutable);
        mainLogger.info('PRINT-PREVIEW', `✅ [savePdf] Java executable exists: ${javaStats.isFile()}`);
        mainLogger.info('PRINT-PREVIEW', `✅ [savePdf] Java executable is executable: ${javaStats.mode & 0o111}`);
    } catch (error) {
        mainLogger.error('PRINT-PREVIEW', `❌ [savePdf] Java executable not found: ${error}`);
        throw new Error(`Java executable not found: ${javaExecutable}`);
    }

    // Costruisce il comando con percorsi correttamente quotati per gestire spazi
    // Aggiunge gli author names alla fine del comando se presenti
    const pdfQuality = readPdfQuality();

    let cmd = `"${javaExecutable}" -jar "${jreFilePath}" "${tempFilePath}" ${sections.toc} ${sections.intro} ${sections.critical} ${sections.bibliography} "${sandboxFilePath}" ${pdfQuality}`;

    if (authorNames && authorNames.length > 0) {
        const quotedAuthors = authorNames.map(author => `"${author}"`).join(' ');
        cmd += ` ${quotedAuthors}`;
        mainLogger.info('PRINT-PREVIEW', `📝 [savePdf] Author names added to the command: ${authorNames.join(', ')}`);
    }

    mainLogger.info('PRINT-PREVIEW', `🚀 [savePdf] Command to execute: ${cmd}`);

    // Esegue il comando di compilazione in modo asincrono dalla directory dell'app
    const execOptions = {
        cwd: buildResourcesPath,
        timeout: 99999999 // 60 secondi di timeout
    };

    mainLogger.info('PRINT-PREVIEW', `📂 [savePdf] Working directory: ${execOptions.cwd}`);

    return new Promise((resolve, reject) => {
        exec(cmd, execOptions, async (err, stdout, stderr) => {
            mainLogger.info('PRINT-PREVIEW', `[savePdf] Command executed, stdout: ${stdout}`);
            mainLogger.info('PRINT-PREVIEW', `[savePdf] Command executed, stderr: ${stderr}`);

            try {
                // FIRST check if there are any errors in the compilation
                if (err) {
                    mainLogger.error('PRINT-PREVIEW', `❌ [savePdf] XeLaTeX compilation failed: ${err}`);
                    mainLogger.error('PRINT-PREVIEW', `❌ [savePdf] Error code: ${err.code}`);
                    mainLogger.error('PRINT-PREVIEW', `❌ [savePdf] Error message: ${err.message}`);
                    mainLogger.error('PRINT-PREVIEW', `❌ [savePdf] Error stderr: ${stderr}`);

                    // Retrieving the temporary file in case of error
                    try {
                        await promises.unlink(tempFilePath);
                        mainLogger.info('PRINT-PREVIEW', '[savePdf] File temporary deleted after error');
                    } catch (cleanupError) {
                        mainLogger.info('PRINT-PREVIEW', `[savePdf] Error while cleaning up temporary file: ${cleanupError}`);
                    }

                    await dialog.showMessageBox({
                        type: 'info',
                        message: 'Error while generating PDF: ',
                        detail: ` ${stderr}`
                    })
                    return reject(new Error(`Error while generating PDF: ${stderr}`));
                }

                // The PDF is generated in the sandbox folder
                const outputFolder = sandboxFilePath;
                mainLogger.info('PRINT-PREVIEW', `[savePdf] Output folder: ${outputFolder}`);

                // Verify that the PDF has been successfully created
                const generatedPdfPath = path.join(outputFolder, `${fileName}.pdf`);
                mainLogger.info('PRINT-PREVIEW', `[savePdf] PDF generato path: ${generatedPdfPath}`);

                console.log("PATH OF PDF IS: ", generatedPdfPath)

                try {
                    await promises.access(generatedPdfPath, constants.F_OK);
                    mainLogger.info('PRINT-PREVIEW', '[savePdf] Generated PDF found and accessible');
                } catch (accessError) {
                    mainLogger.error('PRINT-PREVIEW', `[savePdf] Error while accessing generated PDF: ${accessError}`);
                    mainLogger.error('PRINT-PREVIEW', `[savePdf] Error while accessing PDF at path: ${generatedPdfPath}`);

                    // Try to list the contents of the output directory
                    try {
                        const outputContents = await promises.readdir(outputFolder);
                        mainLogger.info('PRINT-PREVIEW', `[savePdf] Content of output directory: ${JSON.stringify(outputContents)}`);

                        // Try to read the XeLaTeX log file to understand the error
                        const logFileName = `${fileName}.log`;
                        if (outputContents.includes(logFileName)) {
                            const logFilePath = path.join(outputFolder, logFileName);
                            try {
                                const logContent = await promises.readFile(logFilePath, 'utf-8');
                                // Get last 100 lines of the log for error diagnosis
                                const logLines = logContent.split('\n');
                                const lastLines = logLines.slice(-100).join('\n');
                                mainLogger.error('PRINT-PREVIEW', `[savePdf] XeLaTeX log (last 100 lines):\n${lastLines}`);

                                // Look for specific error patterns
                                const errorMatch = logContent.match(/^!.*$/gm);
                                if (errorMatch) {
                                    mainLogger.error('PRINT-PREVIEW', `[savePdf] XeLaTeX errors found: ${errorMatch.join('\n')}`);
                                }
                            } catch (logReadError) {
                                mainLogger.error('PRINT-PREVIEW', `[savePdf] Could not read XeLaTeX log: ${logReadError}`);
                            }
                        }
                    } catch (listError) {
                        mainLogger.error('PRINT-PREVIEW', `[savePdf] Error while listing output directory: ${listError}`);
                    }

                    // Clean up temporary file in case of error
                    try {
                        await promises.unlink(tempFilePath);
                        mainLogger.info('PRINT-PREVIEW', '[savePdf] Temporary file deleted after PDF not found error');
                    } catch (cleanupError) {
                        mainLogger.info('PRINT-PREVIEW', `[savePdf] Error while cleaning up temporary file: ${cleanupError}`);
                    }
                    return reject(new Error('PDF not generated: LaTeX compilation failed'));
                }

                // Clean up temporary file after success
                try {
                    await promises.unlink(tempFilePath);
                    mainLogger.info('PRINT-PREVIEW', '[savePdf] Temporary file deleted after success');
                } catch (cleanupError) {
                    mainLogger.info('PRINT-PREVIEW', `[savePdf] Error while cleaning up temporary file: ${cleanupError}`);
                }

                mainLogger.info('PRINT-PREVIEW', `[savePdf] PDF generated successfully: ${generatedPdfPath}`);
                // If everything went well, resolve with the path of the generated PDF
                resolve(generatedPdfPath);
            } catch (error) {
                mainLogger.error('PRINT-PREVIEW', `[savePdf] Generic error occurred during execution: ${error}`);
                // Clean up temporary file in case of generic error
                try {
                    await promises.unlink(tempFilePath);
                    mainLogger.info('PRINT-PREVIEW', '[savePdf] Temporary file deleted after generic error');
                } catch (cleanupError) {
                    mainLogger.info('PRINT-PREVIEW', `[savePdf] Error while cleaning up temporary file: ${cleanupError}`);
                }
                reject(new Error(`Error occurred while generating PDF: ${error}`));
            }
        });
    });
};

export const getExportPath = async (extensionFilters: DialogExtensionFilters = [], title: string = 'pdf.export.saveTo', defaultExtension: string = 'pdf'): Promise<string> => {
    // Get the reference to the main application window
    const baseWindow = getBaseWindow();
    if (!baseWindow) {
        throw new Error("Base window not available");
    }

    // Get the current tab and its file path
    const currentTab = getSelectedTab()
    const currentFilePath = currentTab?.filePath

    mainLogger.info('EXPORT-SAVE-PATH', `[getExportPath] Current file path: ${currentFilePath || 'Unsaved file (new document)'}`);

    // Determine the file name (use name from path if saved, otherwise generate a temporary name)
    const fileName = currentFilePath
        ? path.basename(currentFilePath, '.critx')
        : `untitled`;

    mainLogger.info('EXPORT-SAVE-PATH', `[getExportPath] File name for export: ${fileName}`);

    // Show a dialog box to select where to save the file
    const result = await dialog.showSaveDialog(baseWindow, {
        title: i18next.t(title),
        defaultPath: path.join(app.getPath('downloads'), `${fileName}.${defaultExtension}`),
        filters: extensionFilters
    });

    if (result.canceled || !result.filePath) {
        throw new Error("Operation cancelled by the user");
    }

    // Extract information from the output path chosen by the user
    return result.filePath;
}

export const generatePDF = async (includeContent: PrintIncludeContents): Promise<string> => {
    // Get the reference to the main application window
    const baseWindow = getBaseWindow();
    if (!baseWindow) {
        throw new Error("Base window not available");
    }

    try {
        // Show informative dialog that the operation has started
        const startDialog = dialog.showMessageBox(baseWindow, {
            message: i18next.t('pdf.export.title'),
            detail: i18next.t('pdf.export.detail'),
            type: "info",
            buttons: ['OK'],
            noLink: true,
        });

        // Don't wait for the user to close the dialog, start the operation immediately
        startDialog.then(() => {
            // Dialog closed, do nothing
        }).catch(() => {
            // Ignore errors from the dialog
        });

        // Small delay to allow the dialog to appear
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate the PDF (blocking operation that "freezes" the UI)
        const generatedPdfPath = await savePdf(includeContent.sections, includeContent.commentAuthors);

        return generatedPdfPath;
    } catch (error) {
        // In case of error, show error message
        await dialog.showMessageBox(baseWindow, {
            message: i18next.t('pdf.export.errorTitle'),
            detail: i18next.t('pdf.export.errorDetail', {
                errorMessage: error instanceof Error ? error.message : i18next.t('pdf.unknownError')
            }),
            type: "error",
            buttons: ['OK'],
            noLink: true,
        });

        throw error;
    }
};

export const saveFileAtPath = async (sourcePath: string, destinationPath: string, translationParent = 'pdf'): Promise<void> => {
    // Get the reference to the main application window
    const baseWindow = getBaseWindow();
    if (!baseWindow) {
        throw new Error("Base window not available");
    }
    const taskId = mainLogger.startTask("SAVE-FILE-AT-PATH", `Saving ${translationParent.toUpperCase()} from ${sourcePath} to ${destinationPath}`);
    try {
        // Save the FILE to the location chosen by the user
        await promises.rename(sourcePath, destinationPath);

        // Mostra messaggio di successo
        await dialog.showMessageBox(baseWindow, {
            message: i18next.t(`${translationParent}.export.successTitle`),
            detail: i18next.t(`${translationParent}.export.successDetail`),
            type: "info",
            buttons: ['OK'],
            noLink: true,
        });
        mainLogger.endTask(taskId, "SAVE-FILE-AT-PATH", "FILE saved successfully");
    } catch (error) {
        mainLogger.error("SAVE-FILE-AT-PATH", `Error saving FILE: ${error}`);
        // In case of error, show error message
        await dialog.showMessageBox(baseWindow, {
            message: i18next.t(`${translationParent}.export.errorTitle`),
            detail: i18next.t(`${translationParent}.export.errorDetail`, {
                errorMessage: error instanceof Error ? error.message : i18next.t(`${translationParent}.unknownError`)
            }),
            type: "error",
            buttons: ['OK'],
            noLink: true,
        });

        throw error;
    }
}
/**
 * Exports the current document to XML/TEI, prompting the user to save it.
 * @returns Promise<string> - The path of the saved XML/TEI file
 */
export const generateTEI = async (tocHeaderTitle: string): Promise<string> => {
    let tempWorkingDirectory!: string;
    // Get the reference to the main application window
    const baseWindow = getBaseWindow();
    if (!baseWindow) {
        throw new Error("Base window not available");
    }

    try {
        // Show information dialog that the operation has started
        const startDialog = dialog.showMessageBox(baseWindow, {
            message: i18next.t('tei.export.title'),
            detail: i18next.t('tei.export.detail'),
            type: "info",
            buttons: ['OK'],
            noLink: true,
        });

        // Non aspettiamo che l'utente chiuda il dialog, iniziamo subito l'operazione
        startDialog.then(() => {
            // Dialog chiuso, non facciamo nulla
        }).catch(() => {
            // Ignora errori del dialog
        });

        // Piccolo delay per permettere al dialog di apparire
        await new Promise(resolve => setTimeout(resolve, 500));

        mainLogger.info('TEI-EXPORT', '📁 [generateTEI] Starting PDF generation');

        // Create a temporary .critx file with the current state
        const tempFilePath = await createTempCritxFile();
        mainLogger.info('TEI-EXPORT', `📁 [generateTEI] File created: ${tempFilePath}`);
        tempWorkingDirectory = path.dirname(tempFilePath);
        mainLogger.info('TEI-EXPORT', `📁 [generateTEI] Starting XML/TEI generation with temporary working directory: ${tempWorkingDirectory}`);
        const tempSaveXML = path.join(tempWorkingDirectory, 'temp.xml');

        const docData: DocumentData = await createDocument(JSON.parse(readFileSync(tempFilePath, 'utf8')));

        const writeFile = openSync(tempSaveXML, 'w');

        const teiXml = await buildTei(tocHeaderTitle, docData);

        writeFileSync(writeFile, teiXml);

        closeSync(writeFile);

        return tempSaveXML;
    } catch (error) {
        if (tempWorkingDirectory) {
            try {
                await promises.rmdir(tempWorkingDirectory);
                mainLogger.info('PRINT-PREVIEW', '🧹 [generateTEI] Temporary TEI file deleted after error');
            } catch (cleanupError) {
                mainLogger.info('PRINT-PREVIEW', `⚠️ [generateTEI] Error while cleaning up temporary TEI file: ${cleanupError}`);
            }
        }
        // In caso di errore, mostra messaggio di errore
        await dialog.showMessageBox(baseWindow, {
            message: i18next.t('tei.export.errorTitle'),
            detail: i18next.t('tei.export.errorDetail', {
                errorMessage: error instanceof Error ? error.message : i18next.t('tei.unknownError')
            }),
            type: "error",
            buttons: ['OK'],
            noLink: true,
        });

        throw error;
    }
};
