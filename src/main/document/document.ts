import * as _ from 'lodash-es';
import { promises as fs } from 'fs'
import { readLastFolderPath, readRecentDocuments, storeLastFolderPath, storeRecentDocuments, readFileNameDisplay, readRecentFilesCount } from '../store';
import path from 'path';

export interface DocumentData {
    version: string;
    createdAt: string;
    updatedAt: string;
    mainText: object | null;
    apparatuses: DocumentApparatus[];
    annotations: object | null;
    template: object | null;
    referencesFormat: ReferencesFormat | null;
    metadata: DocumentMetadata[];
}

let currentMainText: object | null = null
let currentApparatuses: DocumentApparatus[] = []
let currentAnnotations: object | null = null
let currentDocument: DocumentData | null = null
let currentLayoutTemplate: object | null = null
let currentPageSetup: object | null = null
let currentSort: object | null = null
let currentStyles: object | null = null
let currentParatextual: object | null = null
let currentReferencesFormat: ReferencesFormat | null = null
let currentMetadata: DocumentMetadata[] = []


export const setCurrentMetadata = (metadata: DocumentMetadata[]): void => {
    currentMetadata = metadata;
}

export const getCurrentMetadata = (): DocumentMetadata[] => {
    return currentMetadata
}   

/**
 * Sets the last folder path
 * @param folderPath - The folder path to set
 * @returns void
 */
export const setLastFolderPath = (folderPath: string | null): void => {
    storeLastFolderPath(folderPath)
}

/**
 * Gets the last folder path
 * @returns The last folder path
 */
export const getLastFolderPath = (): string | null => {
    return readLastFolderPath()
}

/**
 * Returns the recent documents list
 * @returns The recent documents list from the store
 */
export function getRecentDocuments(): string[] {
    return readRecentDocuments()
}

/**
 * Sets the recent documents list
 * @returns void
 */
export const setRecentDocuments = async (): Promise<void> => {
    let recentDocuments = getRecentDocuments()

    recentDocuments = await Promise.all(
        recentDocuments.map(async (filePath) => {
            try {
                await fs.access(filePath)
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

/**
 * Updates the recent documents list
 * @param filePath - The path to the document to update the recent documents list
 * @returns void
 */
export const updateRecentDocuments = (filePath: string): void => {
    let recentDocuments = getRecentDocuments()
    recentDocuments = recentDocuments.filter(doc => doc !== filePath);
    recentDocuments.unshift(filePath);
    const maxRecentFiles = readRecentFilesCount();
    recentDocuments = recentDocuments.slice(0, maxRecentFiles);

    storeRecentDocuments(recentDocuments)
};

/**
 * Sets the current main text
 * @param mainText - The main text to set
 * @returns void
 */
export const setCurrentMainText = (mainText: object | null): void => {
    currentMainText = mainText
}

/**
 * Gets the current critical text
 * @returns The current critical text
 */
export const getCurrentMainText = (): object | null => {
    return currentMainText
}

/**
 * Sets the current apparatus text
 * @param apparatusText - The apparatus text to set
 * @returns void
 */
export const setCurrentApparatuses = (apparatuses: DocumentApparatus[]): void => {
    currentApparatuses = apparatuses
}

/**
 * Gets the current apparatus text
 * @returns The current apparatus text
 */
export const getCurrentApparatuses = (): DocumentApparatus[] => {
    return currentApparatuses
}

/**
 * Sets the current annotations
 * @param annotations - The annotations to set
 * @returns void
 */
export const setCurrentAnnotations = (annotations: object | null): void => {
    currentAnnotations = annotations
}

/**
 * Gets the current annotations
 * @returns The current annotations
 */
export const getCurrentAnnotations = (): object | null => {
    return currentAnnotations
}

/**
 * Gets the current template
 * @returns The current template
 */
export const getCurrentTemplate = (): object | null => {
    return {
        layoutTemplate: getCurrentLayoutTemplate(),
        pageSetup: getCurrentPageSetup(),
        sort: getCurrentSort(),
        styles: getCurrentStyles(),
        paratextual: getCurrentParatextual(),
    }
}

/**
 * Sets the current document
 * @param document - The document to set
 * @returns void
 */
export const setCurrentDocument = (document: DocumentData | null): void => {
    currentDocument = document
    currentMainText = document?.mainText || null
    currentApparatuses = document?.apparatuses || []
    currentAnnotations = document?.annotations || null
    //this part is new
    const template = document?.template
    currentLayoutTemplate = template?.['layoutTemplate'] || null
    currentPageSetup = template?.['pageSetup'] || null
    currentSort = template?.['sort'] || null
    currentStyles = template?.['styles'] || null
    currentParatextual = template?.['paratextual'] || null
    //end of new part
    currentReferencesFormat = document?.referencesFormat || null
    currentMetadata = document?.metadata || []
}

/**
 * Gets the current document
 * @returns The current document
 */
export const getCurrentDocument = (): DocumentData | null => {
    return currentDocument
}

/**
 * Sets the current layout template
 * @param layoutTemplate - The layout template to set
 * @returns void
 */
export const setCurrentLayoutTemplate = (layoutTemplate: object | null): void => {
    currentLayoutTemplate = layoutTemplate
}

/**
 * Gets the current layout template
 * @returns The current layout template
 */
export const getCurrentLayoutTemplate = (): object | null => {
    return currentLayoutTemplate
}

/**
 * Sets the current page setup
 * @param pageSetup - The page setup to set
 * @returns void
 */
export const setCurrentPageSetup = (pageSetup: object | null): void => {
    currentPageSetup = pageSetup
}

/**
 * Gets the current page setup
 * @returns The current page setup
 */
export const getCurrentPageSetup = (): object | null => {
    return currentPageSetup
}

/**
 * Sets the current sort
 * @param sort - The sort to set
 * @returns void
 */
export const setCurrentSort = (sort: object | null): void => {
    currentSort = sort
}

/**
 * Gets the current sort
 * @returns The current sort
 */
export const getCurrentSort = (): object | null => {
    return currentSort
}

/**
 * Sets the current styles
 * @param styles - The styles to set
 * @returns void
 */
export const setCurrentStyles = (styles: object | null): void => {
    currentStyles = styles
}

/**
 * Gets the current styles
 * @returns The current styles
 */
export const getCurrentStyles = (): object | null => {
    return currentStyles
}

/**
 * Sets the current paratextual
 * @param paratextual - The paratextual to set
 * @returns void
 */
export const setCurrentParatextual = (paratextual: object | null): void => {
    currentParatextual = paratextual
}

/**
 * Gets the current paratextual
 * @returns The current paratextual
 */
export const getCurrentParatextual = (): object | null => {
    return currentParatextual
}

/**
 * Sets the current references format
 * @param referencesFormat - The references format to set
 * @returns void
 */
export const setCurrentReferencesFormat = (referencesFormat: ReferencesFormat | null): void => {
    currentReferencesFormat = referencesFormat
}

/**
 * Gets the current references format
 * @returns The current references format
 */
export const getCurrentReferencesFormat = (): ReferencesFormat | null => {
    return currentReferencesFormat
}

/**
 * Creates a document object
 * @param document - The document to create
 * @returns The created document object
 */
export async function createDocumentObject(document: DocumentData): Promise<object> {
    const newDocument: DocumentData = {
        ...document,
    }
    const scDocument = await _.mapKeys(newDocument, (__, key) => _.snakeCase(key));
    return scDocument;
}

/**
 * Creates a document object from file data, safely transforming snake_case to camelCase
 * @param object - The object to create from (typically from JSON file with snake_case keys)
 * @returns The created document object with camelCase keys
 */
export async function createDocument(object: Record<string, unknown>): Promise<DocumentData> {
    // First, safely extract known fields with explicit mapping to avoid conflicts
    const knownFields = {
        version: (object.version || object.Version || '1.0') as string,
        createdAt: (object.created_at || object.createdAt || new Date().toISOString()) as string,
        updatedAt: (object.updated_at || object.updatedAt || new Date().toISOString()) as string,
        mainText: (object.main_text || object.mainText || null) as object | null,
        apparatuses: (object.apparatuses || []) as DocumentApparatus[],
        annotations: (object.annotations || null) as object | null,
        template: (object.template || null) as object | null,
        referencesFormat: (object.references_format || object.referencesFormat || null) as ReferencesFormat | null,
        metadata: (object.metadata || []) as DocumentMetadata[],
    };

    // Then handle any additional fields that might exist in the object
    // Convert their keys to camelCase while avoiding conflicts with known fields
    const knownFieldsSnakeCase = ['version', 'created_at', 'updated_at', 'main_text', 'apparatuses', 'annotations', 'template', 'references_format', 'metadata'];
    const knownFieldsCamelCase = ['version', 'createdAt', 'updatedAt', 'mainText', 'apparatuses', 'annotations', 'template', 'referencesFormat', 'metadata'];

    const additionalFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(object)) {
        // Skip known fields that we've already handled
        if (!knownFieldsSnakeCase.includes(key) && !knownFieldsCamelCase.includes(key)) {
            const camelKey = _.camelCase(key);
            // Only add if it doesn't conflict with known fields
            if (!knownFieldsCamelCase.includes(camelKey)) {
                additionalFields[camelKey] = value;
            }
        }
    }

    // Combine known fields with additional fields
    const document: DocumentData = {
        ...knownFields,
        ...additionalFields,
    };

    return document;
}

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
