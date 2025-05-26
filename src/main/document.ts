import * as _ from 'lodash-es';
import path from 'path';
import { promises as fs } from 'fs'
import Store from 'electron-store'

export interface DocumentMetadata {
    title?: string;
    author?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Apparatus {
    type: "CRITICAL" | "PAGE_NOTES" | "SECTION_NOTES";
    title: string;
    content: object | null;
}

export interface DocumentData {
    version: string;
    createdAt: string;
    updatedAt: string;
    criticalText: object | null;
    apparatuses: Apparatus[];
    annotations: object | null;
    template: object | null;
    metadata?: DocumentMetadata;
}

const store = new Store();

let currentCriticalText: object | null = null
let currentApparatuses: Apparatus[] = []
let currentAnnotations: object | null = null
let currentTemplate: object | null = null
let currentDocument: DocumentData | null = null


/**
 * Sets the last folder path
 * @param folderPath - The folder path to set
 * @returns void
 */
export const setLastFolderPath = (folderPath: string | null): void => {
    store.set('lastFolderPath', folderPath)
}

/**
 * Gets the last folder path
 * @returns The last folder path
 */
export const getLastFolderPath = (): string | null => {
    return store.get('lastFolderPath', null) as string | null
}

/**
 * Returns the recent documents list
 * @returns The recent documents list from the store
 */
export function getRecentDocuments(): string[] {
    return store.get('recentDocuments', []) as string[];
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

    store.set('recentDocuments', recentDocuments)
};

/**
 * Updates the recent documents list
 * @param filePath - The path to the document to update the recent documents list
 * @returns void
 */
export const updateRecentDocuments = (filePath: string): void => {
    const fileExtension = path.extname(filePath).toLowerCase().replace('.', '');

    if (fileExtension !== 'critx') return;

    let recentDocuments = getRecentDocuments()
    recentDocuments = recentDocuments.filter(doc => doc !== filePath);
    recentDocuments.unshift(filePath);
    recentDocuments = recentDocuments.slice(0, 10);

    store.set('recentDocuments', recentDocuments);
};

/**
 * Sets the current critical text
 * @param criticalText - The critical text to set
 * @returns void
 */
export const setCurrentCriticalText = (criticalText: object | null): void => {
    currentCriticalText = criticalText
}

/**
 * Gets the current critical text
 * @returns The current critical text
 */
export const getCurrentCriticalText = (): object | null => {
    return currentCriticalText
}

/**
 * Sets the current apparatus text
 * @param apparatusText - The apparatus text to set
 * @returns void
 */
export const setCurrentApparatuses = (apparatuses: Apparatus[]): void => {
    currentApparatuses = apparatuses
}

/**
 * Gets the current apparatus text
 * @returns The current apparatus text
 */
export const getCurrentApparatuses = (): Apparatus[] => {
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
 * Sets the current template
 * @param template - The template to set
 * @returns void
 */
export const setCurrentTemplate = (template: object | null): void => {
    currentTemplate = template
}

/**
 * Gets the current template
 * @returns The current template
 */
export const getCurrentTemplate = (): object | null => {
    return currentTemplate
}

/**
 * Sets the current document
 * @param document - The document to set
 * @returns void
 */
export const setCurrentDocument = (document: DocumentData | null): void => {
    currentDocument = document
}

/**
 * Gets the current document
 * @returns The current document
 */
export const getCurrentDocument = (): DocumentData | null => {
    return currentDocument
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
 * Creates a document object
 * @param object - The object to create
 * @returns The created document object
 */
export async function createDocument(object: object): Promise<DocumentData> {
    const document: DocumentData = {
        ...object,
        criticalText: object['critical_text'],
        apparatuses: object['apparatuses'],
        annotations: object['annotations'],
        template: object['template'],
        metadata: object['metadata'],
        version: object['version'],
        createdAt: object['created_at'],
        updatedAt: object['updated_at'],
    }

    const scDocument = await _.mapKeys(document, (__, key) => _.camelCase(key));

    return scDocument;
}
