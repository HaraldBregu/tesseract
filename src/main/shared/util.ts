import { is, platform } from "@electron-toolkit/utils";
import { app, BaseWindow, dialog, WebContentsView } from "electron";
import path from "node:path";
import url from 'node:url';
import fs, { promises as promisefs, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { mainLogger } from "./logger";
import i18next from "i18next";
import { readFileNameDisplay, readRecentDocuments, readRecentFilesCount, storeAppLanguage, storeRecentDocuments } from "../store";
import Backend from "i18next-fs-backend";
import * as fsSync from "node:fs";
import packageJson from '../../../package.json';
import os from "node:os";
import { mapKeys, snakeCase } from 'lodash-es';
import { createSignature, equalSignature } from "./signature";
import layout from '../../../resources/layout.json';
import pageSetup from '../../../resources/page_setup.json';
import paratextual from '../../../resources/paratextual.json';
import metadata from '../../../resources/metadata.json';
import styles from '../../../resources/styles.json';
import referencesFormat from '../../../resources/reference_format.json';

export const DEFAULT_LAYOUT = layout as Layout;
export const DEFAULT_PAGE_SETUP = pageSetup as SetupOptionType;
export { default as DEFAULT_SORT } from '../../../resources/sort.json';
export const DEFAULT_PARATEXTUAL = paratextual as Paratextual;
export const DEAFAULT_STYLES = styles as Style[];
export const DEFAULT_REFERENCES_FORMAT = referencesFormat as ReferencesFormat;
export const DEFAULT_METADATA = metadata as Metadata;

export const appPath = is.dev ? app.getAppPath() : process.resourcesPath
export const userDataPath = app.getPath('userData')
export const downloadsDirectoryPath = app.getPath("downloads")
export const translationsFolderPath = path.join(appPath, "i18n")

/**
 * Gets a writable folder path, with fallback to userData on Linux.
 * On Linux, installation directories (e.g., /opt) are read-only,
 * so we fall back to userData and copy default files if needed.
 */
const getWritableFolderPath = (
  folderName: string,
  fileExtension: string
): string | null => {

  if (is.dev)
    return path.join(app.getAppPath(), 'buildResources', folderName)

  const installationPath = path.join(process.resourcesPath, 'buildResources', folderName)

  // On non-Linux systems, try to use installation path directly
  if (process.platform !== 'linux') {
    if (existsSync(installationPath))
      return installationPath

    mainLogger.info("FOLDER", `Folder not found on path ${installationPath}, creating new...`);
    const newFolderPath = mkdirSync(installationPath, { recursive: true });
    if (!newFolderPath)
      return null;

    return newFolderPath;
  }

  // On Linux (or if installation path doesn't exist), use userData
  const userPath = path.join(app.getPath('userData'), folderName)

  if (!existsSync(userPath)) {
    try {
      mkdirSync(userPath, { recursive: true })
      // Copy default files from installation directory
      if (existsSync(installationPath)) {
        const files = fs.readdirSync(installationPath)
        for (const file of files) {
          if (file.endsWith(fileExtension)) {
            fs.copyFileSync(
              path.join(installationPath, file),
              path.join(userPath, file)
            )
          }
        }
      }
    } catch (error) {
      mainLogger.error("FOLDER", `Could not create ${folderName} folder: ${error}`)
      return null
    }
  }

  return userPath
}

export const templatesFolderPath = (): string | null => {
  return getWritableFolderPath('templates', '.tml')
}

export const stylesFolderPath = (): string | null => {
  return getWritableFolderPath('styles', '.stl')
}

export const readFile = (filePath: string): [string, Error] => {
  let fileString;
  let error;
  try {
    fileString = readFileSync(filePath);
  } catch (err) {
    error = err as Error
    mainLogger.error("READ_FILE", "The content of the file is invalid!", error);
  }

  return [fileString, error]
}

export const readObject = (fileString: string): [Record<string, unknown>, Error] => {
  let object;
  let error;
  try {
    object = JSON.parse(fileString);
  } catch (err) {
    error = err as Error
    mainLogger.error("Template", "The json of the file is invalid!", error);
  }

  return [object, error]
}

export const checkSignature = (object: Record<string, unknown>): "MISSING" | "VALID" | "INVALID" => {
  if (object.signature) {
    const currentSignature = object.signature as string
    const tmpObject = { ...object }
    delete tmpObject.signature

    const expectedSignature = createSignature(tmpObject)
    const signaturesAreValid = equalSignature(currentSignature, expectedSignature)

    if (!signaturesAreValid) {
      mainLogger.error("Template", `Corrupted file`);
      return "INVALID"
    }

    mainLogger.info("Template", `Signature is valid`);
    return "VALID"
  } else {
    mainLogger.error("Template", `Missing signature in file`);
    return "MISSING"
  }
}

export const checkVersion = (object: Record<string, unknown>, minVersion: string): "MISSING" | "SUPPORTED" | "UNSUPPORTED" => {
  if (object.version) {
    const version = object.version as string
    const compare = version.localeCompare(minVersion, undefined, { numeric: true })
    if (compare === -1) {
      mainLogger.error("Template", `Unsupported document version in file`);
      return "UNSUPPORTED";
    }

    mainLogger.info("Template", `Version is valid`);
    return "SUPPORTED"
  } else {
    mainLogger.error("Template", `Missing version in file`);
    return "MISSING";
  }
}

export function getCachePath(): string {
  // On Windows, app.getPath('userData') is already a per-user writable directory (e.g., C:\Users\<User>\AppData\Roaming\<AppName>)
  // On macOS, it's ~/Library/Application Support/<AppName>
  // On Linux, it's ~/.config/<AppName>
  // Adding ".cache" as a subdirectory is safe and cross-platform.
  return path.join(app.getPath('userData'), '.cache');
}

export function getRootUrl(): string {
  // Must add a # because we are using hash routing.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    return process.env['ELECTRON_RENDERER_URL'] + '#'
  } else {
    return (
      url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true
      }) + '#'
    )
  }
}

export const getShortcutLabel = (shortcut: string): string => {
  const isMacOS = platform.isMacOS

  return shortcut
    .replace(/CmdOrCtrl/g, isMacOS ? '⌘' : 'Ctrl')
    .replace(/Alt/g, isMacOS ? '⌥' : 'Alt')
    .replace(/Shift/g, isMacOS ? '⇧' : 'Shift')
    .replace(/Del/g, isMacOS ? '⌫' : 'Del')
    .replace(/Enter/g, isMacOS ? '⏎' : 'Enter')
    .replace(/Fn/g, isMacOS ? 'fn' : 'F')
    .replace(/\+/g, '+'); // Keep "+" signs
};

export const devToolsToggleHandler = (selectedView: WebContentsView | null): void => {
  const taskId = mainLogger.startTask("Developer", "Toggling developer tools");

  if (!selectedView) {
    mainLogger.endTask(taskId, "Developer", "No selected view");
    return
  }

  try {
    selectedView.webContents.toggleDevTools();
    mainLogger.endTask(taskId, "Developer", "Developer tools toggled successfully");
  } catch (err) {
    mainLogger.error("Developer", "Error toggling developer tools", err as Error);

    // Additional logging for Linux platform
    if (process.platform === 'linux') {
      mainLogger.info("Developer", `Linux specific info - Dev mode: ${is.dev}`);
      mainLogger.info("Developer", `Linux specific info - Command line args: ${process.argv.join(' ')}`);
    }
  }
}

export const initializei18next = async (): Promise<void> => {
  const langTaskId = mainLogger.startTask("Electron", "Starting i18next");
  const appLanguage = getAppLanguage();

  // Store in electron-store for the main process
  storeAppLanguage(appLanguage);

  mainLogger.info("Electron", "App language: " + appLanguage);
  await i18next.use(Backend).init({
    lng: appLanguage, // Use the language from settings
    fallbackLng: "en",
    backend: {
      loadPath: path.join(translationsFolderPath, "{{lng}}/translations.json"),
    },
  });

  mainLogger.endTask(langTaskId, "Electron", "i18next configured");
};

export const getAppLanguage = (): string => {
  const configPath = path.join(
    app.getPath("appData"),
    "Criterion",
    "config-store",
    "app-settings.json"
  );
  try {
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
      return configData.language || "en"; // Return language or default to 'en'
    }
  } catch (err) {
    mainLogger.error("Electron", "Error reading app settings", err as Error);
  }

  // For macOS and Linux: detect system language on first run (Windows handles this via installer)
  if (process.platform !== 'win32') {
    try {
      const systemLocale = app.getLocale(); // Returns 'it', 'en-US', 'es-ES', 'fr-FR', 'de-DE', etc.
      const supportedLanguages = ['it', 'en', 'es', 'fr', 'de'];
      const detectedLang = systemLocale.split('-')[0].toLowerCase(); // Extract 'it' from 'it-IT'

      if (supportedLanguages.includes(detectedLang)) {
        mainLogger.info("Electron", `System language detected: ${systemLocale}, using: ${detectedLang}`);
        // Auto-save the detected language for future runs
        updateAppSettingsLanguage(detectedLang);
        return detectedLang;
      } else {
        mainLogger.info("Electron", `System language ${systemLocale} not supported, defaulting to 'en'`);
      }
    } catch (err) {
      mainLogger.error("Electron", "Error detecting system language", err as Error);
    }
  }

  return "en"; // Default language if file doesn't exist or has errors
};

export const updateAppSettingsLanguage = (language: string): void => {
  const configPath = path.join(
    app.getPath("appData"),
    "Criterion",
    "config-store",
    "app-settings.json"
  );
  try {
    let configData: { language?: string;[key: string]: unknown } = {};

    // Read existing config if it exists
    if (fs.existsSync(configPath)) {
      const existingData = fs.readFileSync(configPath, "utf8");
      configData = JSON.parse(existingData);
    } else {
      // Create directory if it doesn't exist
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
    }

    // Update the language
    configData.language = language;

    // Write back to file
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), "utf8");
    mainLogger.info("Electron", `Updated app-settings.json with language: ${language}`);
  } catch (err) {
    mainLogger.error("Electron", "Error updating app settings", err as Error);
  }
};

export const showCloseConfirmation = async (baseWindow: BaseWindow): Promise<number> => {
  const result = await dialog.showMessageBox(baseWindow, {
    message: i18next.t('close_document_dialog.title'),
    detail: i18next.t('close_document_dialog.description'),
    buttons: [
      i18next.t('close_document_dialog.buttons.save'),
      i18next.t('close_document_dialog.buttons.abort'),
      i18next.t('close_document_dialog.buttons.cancel')
    ],
    type: "warning",
    noLink: true,
  });

  return result.response;
};

export const setRecentDocuments = async (): Promise<void> => {
  let recentDocuments = readRecentDocuments()

  recentDocuments = await Promise.all(
    recentDocuments.map(async (filePath) => {
      try {
        await promisefs.access(filePath)
        return filePath
      } catch {
        return null
      }
    })
  ).then((files) => files.filter((file): file is string => file !== null))

  // Apply the current preference limit
  const maxRecentFiles = readRecentFilesCount();
  recentDocuments = recentDocuments.slice(0, maxRecentFiles);
  storeRecentDocuments(recentDocuments)
};

export const updateRecentDocuments = (filePath: string): void => {
  let recentDocuments = readRecentDocuments()
  recentDocuments = recentDocuments.filter(doc => doc !== filePath);
  recentDocuments.unshift(filePath);
  const maxRecentFiles = readRecentFilesCount();
  recentDocuments = recentDocuments.slice(0, maxRecentFiles);
  storeRecentDocuments(recentDocuments)
};

/**
 * Formats a file path based on the file name display preference
 * @param filePath - The full file path
 * @returns The formatted file name
 */
export const formatFileName = (filePath: string): string => {
  const displayMode = readFileNameDisplay();

  if (displayMode === 'filename') {
    return path.basename(filePath);
  } else {
    // For 'full' mode, show filename and last directory
    const parsed = path.parse(filePath);
    const parentDir = path.basename(parsed.dir);
    return parentDir ? `${parentDir}/${parsed.base}` : parsed.base;
  }
};

export const getAppBasePath = (): string => {
  const isDev = !app.isPackaged || app.getAppPath().includes('node_modules');
  if (isDev) {
    // Modalità sviluppo (yarn dev)
    return app.getAppPath();
  } else {
    // Modalità distribuzione
    return process.resourcesPath;
  }
};

export const templateWithNameExists = (name: string): boolean => {
  const templatesPath = templatesFolderPath();
  if (!templatesPath) return false;
  const templatesFilenames = fsSync.readdirSync(templatesPath);
  const matchFilenames = templatesFilenames.filter((filename) => filename.includes(name));
  const matchFilename = matchFilenames.length > 0
  return matchFilename;
}

export const saveTemplate = async (template: Record<string, unknown>, filenameWithExt: string): Promise<void> => {
  const templatesPath = templatesFolderPath();
  if (!templatesPath) throw new Error('Templates folder not available');
  const stringifiedTemplate = JSON.stringify(template, null, 2);
  const destinationPath = path.join(templatesPath, filenameWithExt);
  await promisefs.writeFile(destinationPath, stringifiedTemplate);
}

export const convertPath = (originalPath: string): string => {
  const match = originalPath.match(/^\/([a-zA-Z])\/(.*)$/)
  if (match) {
    return `${match[1]}:/${match[2]}`
  } else {
    return originalPath
  }
}

export const buildExportableSiglaObject = async (siglumList: DocumentSiglum[]) => {
  const userInfo = os.userInfo()
  const metadata = {
    author: userInfo.username,
    exportDate: new Date().toISOString(),
  } satisfies SiglumMetadata
  const scMetadata = await mapKeys(metadata, (__, key) => snakeCase(key))

  const siglumListData = siglumList.map((item) => ({
    value: item.value,
    manuscripts: item.manuscripts,
    description: item.description,
  })) satisfies DocumentSiglum[]

  const dataToSign = {
    version: SIGLUM_VERSION,
    metadata: scMetadata,
    entries: siglumListData,
  }

  const signature = createSignature(dataToSign)

  const data = {
    ...dataToSign,
    signature,
  }

  return data
}

export const buildExportableStylesObject = (styles: Style[]) => {
  const dataToSign = {
    version: STYLE_VERSION,
    styles,
  }
  const signature = createSignature(dataToSign)
  const data = {
    ...dataToSign,
    signature,
  }
  return data
}

export const buildExportableTemplateObject = (name: string, template: Template) => {
  const layout = template.layout
  const pageSetup = template.pageSetup
  const sort = template.sort
  const styles = template.styles
  const paratextual = template.paratextual

  const data = {
    name,
    type: "PROPRIETARY",
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    version: TEMPLATE_VERSION,
    layout,
    pageSetup,
    sort,
    styles,
    paratextual,
  }

  const signature = createSignature(data);
  data['signature'] = signature;

  return data
}

export const APP_VERSION = packageJson.version;

export const DOCUMENT_VERSION = packageJson.documentVersion;

export const MIN_DOCUMENT_VERSION_SUPPORTED = packageJson.minDocumentVersionSupported;

export const TEMPLATE_VERSION = packageJson.templateVersion;

export const MIN_TEMPLATE_VERSION_SUPPORTED = packageJson.minTemplateVersionSupported;

export const SIGLUM_VERSION = packageJson.siglumVersion;

export const MIN_SIGLUM_VERSION_SUPPORTED = packageJson.minSiglumVersionSupported;

export const STYLE_VERSION = packageJson.styleVersion;

export const MIN_STYLE_VERSION_SUPPORTED = packageJson.minStyleVersionSupported;