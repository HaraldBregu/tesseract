import { FIND_WHOLE_DOC } from "@/utils/constants";

export type ChatState = "OPENED" | "MINIMIZED" | "CLOSED";

export const defaultReferenceFormatConfigs: ReferencesFormat = {
    lemma_separator: { isCustom: false, value: "]", bold: false, italic: false, underline: false },
    from_to_separator: { isCustom: false, value: "-", bold: false, italic: false, underline: false },
    readings_separator: { isCustom: false, value: ":", bold: false, italic: false, underline: false },
    apparatus_separator: { isCustom: false, value: ";", bold: false, italic: false, underline: false },
    add_reading_type: { isCustom: false, value: "add.", bold: false, italic: false, underline: false },
    om_reading_type: { isCustom: false, value: "om.", bold: false, italic: false, underline: false },
    tr_reading_type: { isCustom: false, value: "tr.", bold: false, italic: false, underline: false },
    del_reading_type: { isCustom: false, value: "del.", bold: false, italic: false, underline: false },
    lemma_color: "#ffc7ff",
    sigla_color: "#fbffb3",
    reading_type_separator_color: "#fafafa",
    comments_color: "#98a5ff",
    bookmarks_color: "#e5e5e5",
    page_note: { numeration: "whole", sectionLevel: "1", numberFormat: "1" },
    section_note: { numeration: "whole", sectionLevel: "1", numberFormat: "1" },
};

export const initialSearchCriteria: SearchCriteria = {
    searchTerm: '',
    caseSensitive: false,
    wholeWords: false,
    documentCriteria: [FIND_WHOLE_DOC],
}

export const defaultToolbarState: ToolbarState = {
    headingLevel: undefined,
    styleId: undefined,
    fontFamily: 'Times New Roman',
    fontSize: '12pt',
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
    highlightColor: '#000000',
    superscript: false,
    subscript: false,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left',
    listStyle: '',
    spacing: {
        line: 1,
        before: 0,
        after: 0,
    },
    link: '',
}

export type EditorContextState = {
    toolbarState: ToolbarState;
    template: Template | null;
    styles: Style[];
    siglumList: Siglum[] | null;
    bibliographies: Bibliography[] | null;
    apparatusNotes: ApparatusNote[];
    readingTypeEnabled: boolean;
    readingSeparatorEnabled: boolean;
    notesEnabled: boolean;
    siglumEnabled: boolean;
    bookmarkEnabled: boolean;
    commentEnabled: boolean;
    linkEnabled: boolean;
    zoomRatio: number;
    toolbarVisible: boolean;
    statusBarVisible: boolean;
    selectedSideviewTabIndex: number;
    contentTocVisible: boolean;
    isFocused: boolean;
    activeEditor: number;
    characters: number;
    words: number;
    insertSiglumDialogVisible: boolean;
    siglumSetupDialogVisible: boolean;
    lineNumberSetupDialogVisible: boolean;
    pageNumberSetupDialogVisible: boolean;
    sectionStyleSetupDialogVisible: boolean;
    headerFooterSetupDialogVisible: boolean;
    headerFooterInitialTab: "header" | "footer";
    pageSetupOptDialogVisible: boolean;
    tocSetupDialogVisible: boolean;
    fontFamilyList: string[];
    fontFamilySymbols: CharacterSet;
    citationSelectedBibliographyId: string | null;
    addSymbolVisible: boolean;
    referenceFormatVisible: boolean;
    metadataSetupDialogVisible: boolean;
    customizeStatusBarVisible: boolean;
    printPreviewVisible: boolean;
    referenceFormat: ReferencesFormat;
    textNoteHighlighted: boolean;
    bookmarkHighlighted: boolean;
    commentHighlighted: boolean;
    linkConfigVisible: boolean;

    saveTemplateDialogVisible: boolean;
    chooseTemplateModalVisible: boolean;
    layoutSetupDialogVisible: boolean;
    customSpacingDialogVisible: boolean;
    resumeNumberingDialogVisible: boolean;
    suggestedStartNumber: { number: number; listType: OrderedListType } | null;
    changeTemplateModalVisible: boolean;
    deleteApparatusDialogVisible: boolean;
    deleteApparatusEnytryDialogVisible: boolean;
    confirmChangeTemplateModal: { visible: boolean; text: string, onConfirm: (() => void) | null };
    bibliographySetupDialogVisible: boolean;
    citationInsertDialogVisible: boolean;
    isBibliographySection: boolean;
    canInsertCitation: boolean;
    canInsertSymbol: boolean;
    printSetupDialogVisible: boolean;
    printOptions: PrintOptions;
    exportTeiSetupDialogVisible: boolean;
    insertCustomReadingTypeDialogVisible: boolean;
    insertReadingTypeDialogVisible: boolean;
    linkActive: boolean;
    searchCriteria: SearchCriteria;
    searchHistory: string[];
    replaceHistory: string[];
    totalCriticalMatches: number;
    totalApparatusMatches: number;
    totalMatches: number;
    currentSearchIndex: number | null;
    currentCriticalSearchIndex: number | null;
    currentApparatusSearchIndex: number | null;
    disableReplaceAction: boolean;
    isApparatusReplacing: boolean;
    isCriticalReplacing: boolean;
    replacedCount: number;
    styleSelectOpen: boolean;
    fontFamilySelectOpen: boolean;
    fontSizeSelectOpen: boolean;
    showNonPrintingCharacters?: boolean;
    commentCategoriesDialogVisible: boolean;
    bookmarkCategoriesDialogVisible: boolean;
    keyboardShortcuts: KeyboardShortcutCategory[];
    chatState: ChatState;
    chatTextReference: string | null;
}

export const initialState: EditorContextState = {
    toolbarState: defaultToolbarState,
    styles: [],
    template: null,
    apparatusNotes: [],
    readingTypeEnabled: true,
    readingSeparatorEnabled: true,
    notesEnabled: false,
    siglumEnabled: false,
    bookmarkEnabled: true,
    commentEnabled: true,
    linkEnabled: false,
    zoomRatio: 0,
    toolbarVisible: true,
    statusBarVisible: true,
    selectedSideviewTabIndex: 0,
    contentTocVisible: false,
    activeEditor: 0,
    isFocused: false,
    characters: 0,
    words: 0,
    insertSiglumDialogVisible: false,
    siglumSetupDialogVisible: false,
    lineNumberSetupDialogVisible: false,
    pageNumberSetupDialogVisible: false,
    sectionStyleSetupDialogVisible: false,
    headerFooterSetupDialogVisible: false,
    headerFooterInitialTab: "header",
    pageSetupOptDialogVisible: false,
    tocSetupDialogVisible: false,
    fontFamilyList: [],
    fontFamilySymbols: [],
    siglumList: null,
    bibliographies: null,
    citationSelectedBibliographyId: null,
    addSymbolVisible: false,
    referenceFormatVisible: false,
    metadataSetupDialogVisible: false,
    customizeStatusBarVisible: false,
    printPreviewVisible: false,
    referenceFormat: defaultReferenceFormatConfigs,
    textNoteHighlighted: true,
    bookmarkHighlighted: true,
    commentHighlighted: true,
    linkConfigVisible: false,
    saveTemplateDialogVisible: false,
    chooseTemplateModalVisible: false,
    layoutSetupDialogVisible: false,
    customSpacingDialogVisible: false,
    resumeNumberingDialogVisible: false,
    suggestedStartNumber: null,
    changeTemplateModalVisible: false,
    deleteApparatusDialogVisible: false,
    deleteApparatusEnytryDialogVisible: false,
    confirmChangeTemplateModal: { visible: false, text: "", onConfirm: null },
    bibliographySetupDialogVisible: false,
    citationInsertDialogVisible: false,
    isBibliographySection: false,
    canInsertCitation: false,
    canInsertSymbol: false,
    printSetupDialogVisible: false,
    printOptions: { export: false, print: false },
    exportTeiSetupDialogVisible: false,
    insertCustomReadingTypeDialogVisible: false,
    insertReadingTypeDialogVisible: false,
    linkActive: false,
    searchCriteria: initialSearchCriteria,
    searchHistory: [],
    replaceHistory: [],
    totalCriticalMatches: 0,
    totalApparatusMatches: 0,
    totalMatches: 0,
    currentSearchIndex: null,
    currentCriticalSearchIndex: null,
    currentApparatusSearchIndex: null,
    disableReplaceAction: false,
    isApparatusReplacing: false,
    isCriticalReplacing: false,
    replacedCount: 0,
    styleSelectOpen: false,
    fontFamilySelectOpen: false,
    fontSizeSelectOpen: false,
    showNonPrintingCharacters: false,
    commentCategoriesDialogVisible: false,
    bookmarkCategoriesDialogVisible: false,
    keyboardShortcuts: [],
    chatState: "CLOSED",
    chatTextReference: null,
}

export const stateHideAllDialogsState = (state: EditorContextState): EditorContextState => {
    return {
        ...state,
        insertSiglumDialogVisible: false,
        siglumSetupDialogVisible: false,
        lineNumberSetupDialogVisible: false,
        pageNumberSetupDialogVisible: false,
        headerFooterSetupDialogVisible: false,
        pageSetupOptDialogVisible: false,
        tocSetupDialogVisible: false,
        referenceFormatVisible: false,
        metadataSetupDialogVisible: false,
        customizeStatusBarVisible: false,
        linkConfigVisible: false,
        saveTemplateDialogVisible: false,
        chooseTemplateModalVisible: false,
        layoutSetupDialogVisible: false,
        customSpacingDialogVisible: false,
        resumeNumberingDialogVisible: false,
        changeTemplateModalVisible: false,
        deleteApparatusDialogVisible: false,
        deleteApparatusEnytryDialogVisible: false,
        confirmChangeTemplateModal: { visible: false, text: "", onConfirm: null },
        bibliographySetupDialogVisible: false,
        citationInsertDialogVisible: false,
        printSetupDialogVisible: false,
        exportTeiSetupDialogVisible: false,
        insertCustomReadingTypeDialogVisible: false,
        sectionStyleSetupDialogVisible: false,
        commentCategoriesDialogVisible: false,
        bookmarkCategoriesDialogVisible: false,
        insertReadingTypeDialogVisible: false,
    }
}