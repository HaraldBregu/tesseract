import * as _ from 'lodash-es';
import { defaultDocumentData } from './constants';
import { migrateObject, MigrationConfig } from '../shared/migration';
import { DOCUMENT_VERSION } from '../shared/util';

export async function createDocumentRecord(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const document = await _.mapKeys(data, (__, key) => _.snakeCase(key));
    return document;
}

export async function createDocument(object: Record<string, unknown>): Promise<DocumentData> {
    const migrationConfig: MigrationConfig = {
        transforms: {
            "type": (value: unknown) => {
                if (value === "bulletedList") {
                    return "bulletList"
                }
                if (value === "orderList") {
                    return "orderedList"
                }

                if (value === "critical") {
                    return "CRITICAL"
                }
                if (value === "pageNotes") {
                    return "PAGE_NOTES"
                }
                if (value === "sectionNotes") {
                    return "SECTION_NOTES"
                }

                return value
            },
        },
        remove: {
            'type': (typeName, data) => {
                if (typeName === 'apparatusEntry' && data) {
                    const attrs = data['attrs'] as Record<string, unknown>;
                    if (attrs['id'] === null || attrs['type'] === null) {
                        return true;
                    }
                    return false;
                }
                return false;
            }
        }
    };
    object = migrateObject(object, migrationConfig)

    const rawReferencesFormat = (object.references_format || object.referencesFormat || null) as ReferencesFormat | null;
    const validatedReferencesFormat = validateAndNormalizeReferencesFormat(rawReferencesFormat);

    const knownFields: DocumentData = {
        id: (object.id || crypto.randomUUID()) as string,
        version: (object.version || DOCUMENT_VERSION) as string,
        signature: object.signature as string,
        mainText: (object.main_text || object.mainText || null) as object | null,
        apparatuses: (object.apparatuses || []) as DocumentApparatus[],
        annotations: (object.annotations) as Annotations,
        template: object.template as Template,
        referencesFormat: validatedReferencesFormat ?? defaultDocumentData.referencesFormat,
        metadata: (object.metadata || defaultDocumentData.metadata) as Metadata,
        sigla: (object.sigla || []) as DocumentSiglum[],
        bibliographies: (object.bibliographies || []) as Bibliography[],
    };

    const knownFieldsSnakeCase = ['main_text', 'apparatuses', 'annotations', 'template', 'references_format', 'metadata', 'sigla', 'bibliographies'];
    const knownFieldsCamelCase = ['mainText', 'apparatuses', 'annotations', 'template', 'referencesFormat', 'metadata', 'sigla', 'bibliographies'];

    const additionalFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(object)) {
        if (!knownFieldsSnakeCase.includes(key) && !knownFieldsCamelCase.includes(key)) {
            const camelKey = _.camelCase(key);
            if (!knownFieldsCamelCase.includes(camelKey)) {
                additionalFields[camelKey] = value;
            }
        }
    }

    const document: DocumentData = {
        ...knownFields,
        ...additionalFields,
    };

    return document;
}

const validateAndNormalizeReferencesFormat = (referencesFormat: ReferencesFormat | null): ReferencesFormat | null => {
    if (!referencesFormat) {
        return null;
    }

    const defaultSeparatorConfig = {
        isCustom: false,
        value: "",
        bold: false,
        italic: false,
        underline: false
    };

    const defaultReadingTypeConfig = {
        isCustom: false,
        value: "",
        bold: false,
        italic: false,
        underline: false
    };

    const separatorKeys: SeparatorKeys[] = ["lemma_separator", "from_to_separator", "readings_separator", "apparatus_separator"];
    const readingKeys: ReadingKeys[] = ["add_reading_type", "om_reading_type", "tr_reading_type", "del_reading_type"];
    const guideColorKeys: GuideColorsKeys[] = ["lemma_color", "sigla_color", "reading_type_separator_color", "comments_color", "bookmarks_color"];
    const noteKeys: NoteKeys[] = ["page_note", "section_note"];

    const normalizedFormat: ReferencesFormat = { ...referencesFormat };

    separatorKeys.forEach(key => {
        if (!normalizedFormat[key] || typeof normalizedFormat[key] !== 'object') {
            normalizedFormat[key] = { ...defaultSeparatorConfig };
        } else {
            const separator = normalizedFormat[key] as ReferenceFormatChar;
            normalizedFormat[key] = {
                ...defaultSeparatorConfig,
                ...separator,
                isCustom: separator.isCustom ?? false,
                value: separator.value ?? "",
                bold: separator.bold ?? false,
                italic: separator.italic ?? false,
                underline: separator.underline ?? false
            };
        }
    });

    readingKeys.forEach(key => {
        if (!normalizedFormat[key] || typeof normalizedFormat[key] !== 'object') {
            normalizedFormat[key] = { ...defaultReadingTypeConfig };
        } else {
            const readingType = normalizedFormat[key] as ReferenceFormatChar;
            normalizedFormat[key] = {
                ...defaultReadingTypeConfig,
                ...readingType,
                isCustom: readingType.isCustom ?? false,
                value: readingType.value ?? "",
                bold: readingType.bold ?? false,
                italic: readingType.italic ?? false,
                underline: readingType.underline ?? false
            };
        }
    });

    guideColorKeys.forEach(key => {
        if (typeof normalizedFormat[key] !== 'string') {
            const defaultColors: Record<GuideColorsKeys, string> = {
                lemma_color: "#ffc7ff",
                sigla_color: "#fbffb3",
                reading_type_separator_color: "#fafafa",
                comments_color: "#98a5ff",
                bookmarks_color: "#e5e5e5"
            };
            normalizedFormat[key] = defaultColors[key];
        }
    });

    noteKeys.forEach(key => {
        if (!normalizedFormat[key] || typeof normalizedFormat[key] !== 'object') {
            normalizedFormat[key] = { numeration: "whole", sectionLevel: "1", numberFormat: "1" };
        } else {
            const note = normalizedFormat[key] as NotesConfig;
            normalizedFormat[key] = {
                numeration: note.numeration ?? "whole",
                sectionLevel: note.sectionLevel ?? "1",
                numberFormat: note.numberFormat ?? "1"
            };
        }
    });

    return normalizedFormat;
};