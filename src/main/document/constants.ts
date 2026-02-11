import { DEAFAULT_STYLES, DEFAULT_LAYOUT, DEFAULT_METADATA, DEFAULT_PAGE_SETUP, DEFAULT_PARATEXTUAL, DEFAULT_REFERENCES_FORMAT, DEFAULT_SORT, DOCUMENT_VERSION, TEMPLATE_VERSION } from "../shared/util"

const defaultDocumentTemplate: Template = {
    name: 'Default',
    type: 'DEFAULT',
    version: TEMPLATE_VERSION,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    layout: DEFAULT_LAYOUT,
    pageSetup: DEFAULT_PAGE_SETUP,
    sort: DEFAULT_SORT,
    styles: DEAFAULT_STYLES,
    paratextual: DEFAULT_PARATEXTUAL,
}

export const defaultDocumentData: DocumentData = {
    id: crypto.randomUUID(),
    version: DOCUMENT_VERSION,
    signature: '',
    mainText: null,
    apparatuses: defaultDocumentTemplate
        .layout
        .critical
        .apparatusDetails
        .filter(apparatus => apparatus.type !== "text")
        .map(apparatus => ({
            id: apparatus.id,
            title: apparatus.title,
            type: apparatus.sectionType as ApparatusType,
            visible: apparatus.visible,
            expanded: true,
            content: null,
            notesVisible: true,
            commentsVisible: true,
        } satisfies DocumentApparatus)),
    annotations: {
        comments: [],
        commentCategories: [],
        bookmarks: [],
        bookmarkCategories: [],
    },
    template: defaultDocumentTemplate,
    referencesFormat: DEFAULT_REFERENCES_FORMAT,
    metadata: DEFAULT_METADATA,
    sigla: [],
    bibliographies: [],
}

export const defaultDocumentTab: DocumentTab = {
    id: -1,
    path: '',
    touched: false,
    document: defaultDocumentData,
}

export const SectionNames: Record<MainEditorSections, string> = {
    intro: 'Introduction',
    critical: 'CriticalText',
    bibliography: 'Bibliography',
    toc: 'Table of Contents',
}