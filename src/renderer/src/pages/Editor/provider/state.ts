
export const defaultConfigs: ReferencesFormat = {
    lemma_separator: { value: " ]", bold: false, italic: false, underline: false },
    from_to_separator: { value: " -", bold: false, italic: false, underline: false },
    readings_separator: { value: " :", bold: false, italic: false, underline: false },
    apparatus_separator: { value: " ;", bold: false, italic: false, underline: false },
    add_reading_type: { value: "add.", bold: false, italic: false, underline: false },
    om_reading_type: { value: "om.", bold: false, italic: false, underline: false },
    tr_reading_type: { value: "tr.", bold: false, italic: false, underline: false },
    del_reading_type: { value: "del.", bold: false, italic: false, underline: false },
    lemma_color: "#ffc7ff",
    sigla_color: "#fbffb3",
    reading_type_separator_color: "#fafafa",
    comments_color: "#98a5ff",
    bookmarks_color: "#e5e5e5",
    page_note: { numeration: "whole", sectionLevel: "1", numberFormat: "1" },
    section_note: { numeration: "whole", sectionLevel: "1", numberFormat: "1" },
};

export type EditorContextState = {
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
    headerSetupDialogVisible: boolean;
    footerSetupDialogVisible: boolean;
    pageSetupOptDialogVisible: boolean;
    tocSetupDialogVisible: boolean;
    fontFamilyList: string[];
    fontFamilySymbols: CharacterSet;
    siglumList: Siglum[];
    addSymbolVisible: boolean;
    referenceFormatVisible: boolean;
    printPreviewVisible: boolean;
    referenceFormat: ReferencesFormat;
    bookmarkHighlighted: boolean;
    commentHighlighted: boolean;
    linkConfigVisible: boolean;
}

export const initialState: EditorContextState = {
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
    headerSetupDialogVisible: false,
    footerSetupDialogVisible: false,
    pageSetupOptDialogVisible: false,
    tocSetupDialogVisible: false,
    fontFamilyList: [],
    fontFamilySymbols: [],
    siglumList: [],
    addSymbolVisible: false,
    referenceFormatVisible: false,
    printPreviewVisible: false,
    referenceFormat: defaultConfigs,
    bookmarkHighlighted: true,
    commentHighlighted: true,
    linkConfigVisible: false,
}