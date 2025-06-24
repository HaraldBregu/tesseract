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
    lemmataHighlightColor: string;
    siglumHighlightColor: string;
    readingTypeAndSeparatorHighlightColor: string;
    bookmarkHighlightColor: string;
    commentHighlightColor: string;
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
    lemmataHighlightColor: "#FF0000",
    siglumHighlightColor: "#FF0000",
    readingTypeAndSeparatorHighlightColor: "#FF0000",
    bookmarkHighlightColor: "#E5E5E5",
    commentHighlightColor: "#A9BFFF",
}