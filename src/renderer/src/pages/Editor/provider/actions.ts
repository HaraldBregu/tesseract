export type EditorAction =
    | { type: 'TEST' }
    | { type: 'SET_ACTIVE_EDITOR'; payload: number }
    | { type: 'RESET_EDITOR' }
    | { type: 'SET_CONTENT_TOC_VISIBLE'; payload: boolean }
    | { type: 'SET_EDITOR_FOCUS'; payload: boolean }
    | { type: 'SET_SELECTED_SIDEVIEW_TAB_INDEX'; payload: number }
    | { type: 'SET_CHARACTERS'; payload: number }
    | { type: 'SET_WORDS'; payload: number }
    | { type: 'SET_SIGLUM_LIST'; payload: Siglum[] }
    | { type: 'ADD_SIGLUM_LIST_FROM_FILE'; payload: Siglum[] }
    | { type: 'DUPLICATE_SIGLUM_LIST_FROM_FILE'; payload: Siglum[] }
    | { type: 'REPLACE_SIGLUM_LIST_FROM_FILE'; payload: Siglum[] }
    | { type: 'ADD_SIGLUM'; payload: { siglum: SiglumData, manuscripts: SiglumData, description: SiglumData } }
    | { type: 'UPDATE_SIGLUM'; payload: { id: string, siglum: SiglumData, manuscripts: SiglumData, description: SiglumData } }
    | { type: 'DUPLICATE_SIGLUM'; payload: Siglum }
    | { type: 'TOGGLE_INSERT_SIGLUM_DIALOG_VISIBLE' }
    | { type: 'SET_INSERT_SIGLUM_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_SIGLUM_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'DELETE_SIGLUM'; payload: Siglum }
    | { type: 'SET_FONT_FAMILY_LIST'; payload: string[] }
    | { type: 'SET_FONT_FAMILY_SYMBOLS'; payload: CharacterSet }
    | { type: 'SET_ADD_SYMBOL_VISIBLE'; payload: boolean }
    | { type: 'SET_LINE_NUMBER_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_PAGE_NUMBER_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_HEADER_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_FOOTER_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_PAGE_SETUP_OPT_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_TOC_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_REFERENCE_FORMAT_VISIBLE'; payload: boolean }
    | { type: 'SET_PRINT_PREVIEW_VISIBLE'; payload: boolean }
    | { type: 'TOGGLE_PRINT_PREVIEW_VISIBLE' }
    | { type: 'SET_REFERENCE_FORMAT'; payload: ReferencesFormat }
    | { type: 'SET_BOOKMARK_HIGHLIGHTED'; payload: boolean }
    | { type: 'SET_COMMENT_HIGHLIGHTED'; payload: boolean }
    | { type: 'SET_LINK_CONFIG_VISIBLE'; payload: boolean }
    | { type: 'TOGGLE_BOOKMARK_HIGHLIGHTED' }
    | { type: 'TOGGLE_COMMENT_HIGHLIGHTED' }


export const setSelectedSideviewTabIndex = (tab: number): EditorAction => ({
    type: 'SET_SELECTED_SIDEVIEW_TAB_INDEX',
    payload: tab
})

export const setCharacters = (characters: number): EditorAction => ({
    type: 'SET_CHARACTERS',
    payload: characters
})

export const setWords = (words: number): EditorAction => ({
    type: 'SET_WORDS',
    payload: words
})

export const setSiglumList = (siglumList: Siglum[]): EditorAction => ({
    type: 'SET_SIGLUM_LIST',
    payload: siglumList
})

export const addSiglumListFromFile = (siglumList: Siglum[]): EditorAction => ({
    type: 'ADD_SIGLUM_LIST_FROM_FILE',
    payload: siglumList
})

export const duplicateSiglumListFromFile = (siglumList: Siglum[]): EditorAction => ({
    type: 'DUPLICATE_SIGLUM_LIST_FROM_FILE',
    payload: siglumList
})

export const replaceSiglumListFromFile = (siglumList: Siglum[]): EditorAction => ({
    type: 'REPLACE_SIGLUM_LIST_FROM_FILE',
    payload: siglumList
})

export const addSiglum = (siglum: SiglumData, manuscripts: SiglumData, description: SiglumData): EditorAction => ({
    type: 'ADD_SIGLUM',
    payload: { siglum, manuscripts, description }
})

export const updateSiglum = (id: string, siglum: SiglumData, manuscripts: SiglumData, description: SiglumData): EditorAction => ({
    type: 'UPDATE_SIGLUM',
    payload: { id, siglum, manuscripts, description }
})

export const duplicateSiglum = (siglum: Siglum): EditorAction => ({
    type: 'DUPLICATE_SIGLUM',
    payload: siglum
})

export const toggleInsertSiglumDialogVisible = (): EditorAction => ({
    type: 'TOGGLE_INSERT_SIGLUM_DIALOG_VISIBLE',
})

export const setInsertSiglumDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_INSERT_SIGLUM_DIALOG_VISIBLE',
    payload: visible
})

export const setSiglumSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_SIGLUM_SETUP_DIALOG_VISIBLE',
    payload: visible
})

export const deleteSiglum = (siglum: Siglum): EditorAction => ({
    type: 'DELETE_SIGLUM',
    payload: siglum
})

export const setFontFamilyList = (fontFamilyList: string[]): EditorAction => ({
    type: 'SET_FONT_FAMILY_LIST',
    payload: fontFamilyList
})

export const setFontFamilySymbols = (fontFamilySymbols: CharacterSet): EditorAction => ({
    type: 'SET_FONT_FAMILY_SYMBOLS',
    payload: fontFamilySymbols
})

export const setEditorFocus = (isFocused: boolean): EditorAction => ({
    type: 'SET_EDITOR_FOCUS',
    payload: isFocused
})

export const setAddSymbolVisible = (visible: boolean): EditorAction => ({
    type: 'SET_ADD_SYMBOL_VISIBLE',
    payload: visible
})

export const setLineNumberSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_LINE_NUMBER_SETUP_DIALOG_VISIBLE',
    payload: visible
})

export const setPageNumberSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_PAGE_NUMBER_SETUP_DIALOG_VISIBLE',
    payload: visible
})

export const setHeaderSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_HEADER_SETUP_DIALOG_VISIBLE',
    payload: visible
})

export const setFooterSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_FOOTER_SETUP_DIALOG_VISIBLE',
    payload: visible
})

export const setPageSetupOptDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_PAGE_SETUP_OPT_DIALOG_VISIBLE',
    payload: visible
})

export const setTocSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_TOC_SETUP_DIALOG_VISIBLE',
    payload: visible
})

export const setReferenceFormatVisible = (visible: boolean): EditorAction => ({
    type: 'SET_REFERENCE_FORMAT_VISIBLE',
    payload: visible
})

export const setPrintPreviewVisible = (visible: boolean): EditorAction => ({
    type: 'SET_PRINT_PREVIEW_VISIBLE',
    payload: visible
})

export const togglePrintPreviewVisible = (): EditorAction => ({
    type: 'TOGGLE_PRINT_PREVIEW_VISIBLE',
})

export const setReferenceFormat = (referenceFormat: ReferencesFormat): EditorAction => ({
    type: 'SET_REFERENCE_FORMAT',
    payload: referenceFormat
})

export const setBookmarkHighlighted = (highlighted: boolean): EditorAction => ({
    type: 'SET_BOOKMARK_HIGHLIGHTED',
    payload: highlighted
})

export const setCommentHighlighted = (highlighted: boolean): EditorAction => ({
    type: 'SET_COMMENT_HIGHLIGHTED',
    payload: highlighted
})

export const toggleBookmarkHighlighted = (): EditorAction => ({
    type: 'TOGGLE_BOOKMARK_HIGHLIGHTED',
})

export const toggleCommentHighlighted = (): EditorAction => ({
    type: 'TOGGLE_COMMENT_HIGHLIGHTED',
})

export const setLinkConfigVisible = (visible: boolean): EditorAction => ({
    type: 'SET_LINK_CONFIG_VISIBLE',
    payload: visible
})