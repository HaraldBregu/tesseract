import { BaseWindow, dialog, MessageBoxReturnValue, OpenDialogReturnValue, SaveDialogReturnValue } from "electron";
import i18next from "i18next";

export const showSaveTemplateMessageBoxWarning = async (window: BaseWindow, filename: string): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: "warning",
        buttons: [
            "Replace",
            "Cancel",
        ],
        defaultId: 1,
        noLink: true,
        title: "Confirm Replacement", // to be translated
        message: `A template named "${filename}" already exists. Do you want to overwrite it?`, // to be translated
    });
}

export const showFileNotFoundMessageBox = async (window: BaseWindow, filepath: string): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: "error",
        message: 'File not found',
        detail: `The file "${filepath}" could not be found.`
    });
}

export const showNoMoreReplacementsMessageBox = async (window: BaseWindow): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'warning',
        message: "We're finished searching the document.",
    });
}

export const invalidSiglumContentMessageBox = async (window: BaseWindow): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'error',
        message: "The content of the file is invalid! Please verify the file and reload it.",
    });
}

export const invalidSiglumJSONMessageBox = async (window: BaseWindow): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'error',
        message: "The JSON of the file is invalid! Please verify the file and reload it.",
    });
}

export const misssingSignatureMessageBox = async (window: BaseWindow, filepath: string): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'error',
        message: 'Missing signature',
        detail: `The file "${filepath}" does not have a signature and cannot be opened.`
    });
}

export const corruptedFileMessageBox = async (window: BaseWindow, filepath: string): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'error',
        message: 'Corrupted file',
        detail: `The file "${filepath}" is corrupted and cannot be opened.`
    });
}

export const misssingVersionMessageBox = async (window: BaseWindow, filepath: string): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'error',
        message: 'Missing version',
        detail: `The file "${filepath}" does not have a version and cannot be opened.`
    });
}

export const unsupportedVersionMessageBox = async (window: BaseWindow): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'error',
        message: i18next.t('document.unsupportedVersion.title'),
        detail: i18next.t('document.unsupportedVersion.message')
    });
}

export const siglumExportSuccessMessageBox = async (window: BaseWindow): Promise<MessageBoxReturnValue> => {
    return dialog.showMessageBox(window, {
        message: 'Siglum saved successfully!',
    });
}

export const stylesExportSuccessMessageBox = async (window: BaseWindow): Promise<MessageBoxReturnValue> => {
    return dialog.showMessageBox(window, {
        message: 'Styles saved successfully!',
    });
}

export const invalidContentMessageBox = async (window: BaseWindow): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'error',
        message: "The content of the file is invalid! Please verify the file and reload it.",
    });
}

export const invalidJSONMessageBox = async (window: BaseWindow): Promise<MessageBoxReturnValue> => {
    return await dialog.showMessageBox(window, {
        type: 'error',
        message: "The JSON of the file is invalid! Please verify the file and reload it.",
    });
}

export const confirmReplacmentStylesMessageBox = async (window: BaseWindow, fileName): Promise<MessageBoxReturnValue> => {
    return dialog.showMessageBox(window, {
        type: "warning",
        buttons: ["Replace", "Cancel"],
        defaultId: 1,
        noLink: true,
        title: "Confirm Replacement",
        message: `A style named "${fileName}" already exists. Do you want to overwrite it?`,
    });
}

export const openFileDialog = async (window: BaseWindow, defaultPath: string): Promise<OpenDialogReturnValue> => {
    return dialog.showOpenDialog(window, {
        title: 'Open file',
        defaultPath,
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
        properties: ['openFile'],
    });
}

export const saveSiglaDialog = async (window: BaseWindow, defaultPath: string): Promise<SaveDialogReturnValue> => {
    return dialog.showSaveDialog(window, {
        title: 'Export Siglum',
        defaultPath,
        filters: [{
            name: "Siglum",
            extensions: ["siglum"]
        }]
    });
}

export const openSiglaDialog = async (window: BaseWindow, defaultPath: string): Promise<OpenDialogReturnValue> => {
    return dialog.showOpenDialog(window, {
        title: 'Import Sigla',
        defaultPath,
        properties: ["openFile"],
        filters: [{
            name: "Siglum",
            extensions: ["siglum"],
        }]
    });
}

export const saveStylesDialog = async (window: BaseWindow, defaultPath: string): Promise<SaveDialogReturnValue> => {
    return dialog.showSaveDialog(window, {
        title: 'Export Style',
        defaultPath,
        filters: [{
            name: "Style",
            extensions: ["stl"],
        }]
    });
}

export const openStylesDialog = async (window: BaseWindow, defaultPath: string): Promise<OpenDialogReturnValue> => {
    return dialog.showOpenDialog(window, {
        title: 'Import Styles',
        defaultPath,
        properties: ["openFile"],
        filters: [{
            name: "Style",
            extensions: ["stl"]
        }],
    });
}

export const openImportTemplateDialog = async (window: BaseWindow, defaultPath: string): Promise<OpenDialogReturnValue> => {
    return dialog.showOpenDialog(window, {
        title: 'Import Template',
        defaultPath,
        properties: ["openFile"],
        filters: [{
            name: "Template",
            extensions: ["tml"]
        }],
    });
}

export const openFolder = (): Promise<Electron.OpenDialogReturnValue> => {
    const result = dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Choose destination folder',
    });

    return result
}