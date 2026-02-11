import { Node } from "@tiptap/pm/model";


export * from './notes';

export type EditorAction =
    | { type: 'SET_TEMPLATE'; payload: Template }
    | { type: 'SET_STYLES'; payload: Style[] }
    | { type: 'SET_LAYOUT'; payload: Layout }
    | { type: 'SET_PAGE_SETUP'; payload: SetupOptionType }
    | { type: 'SET_KEYBOARD_SHORTCUTS'; payload: KeyboardShortcutCategory[] }
    | { type: 'INSERT_APPARATUS_NOTE'; payload: ApparatusNote }
    | { type: 'INSERT_NOTES'; payload: ApparatusNote[] }
    | { type: 'UPDATE_NOTES_ENTRY_NODES'; payload: { noteId: string, apparatusId: string, entryNodes: Node[] }[] }
    | { type: 'DELETE_NOTE_WITH_ID'; payload: string }

    | { type: 'SET_COMMENT_CATEGORIES_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_BOOKMARK_CATEGORIES_DIALOG_VISIBLE'; payload: boolean }

    | { type: 'SET_READING_TYPE_ENABLED'; payload: boolean }
    | { type: 'SET_READING_SEPARATOR_ENABLED'; payload: boolean }

    | { type: 'SET_SORT'; payload: string[] }
    | { type: 'TOGGLE_TOC_VISIBILITY' }
    | { type: 'SET_ZOOM_RATIO'; payload: number }
    | { type: 'SET_TOOLBAR_VISIBLE'; payload: boolean }
    | { type: 'SET_STATUS_BAR_VISIBLE'; payload: boolean }
    | { type: 'SET_ACTIVE_EDITOR'; payload: number }
    | { type: 'RESET_EDITOR' }
    | { type: 'SET_CONTENT_TOC_VISIBLE'; payload: boolean }
    | { type: 'SET_EDITOR_FOCUS'; payload: boolean }
    | { type: 'SET_SELECTED_SIDEVIEW_TAB_INDEX'; payload: number }
    | { type: 'SET_CHARACTERS'; payload: number }
    | { type: 'SET_WORDS'; payload: number }
    | { type: 'SET_SIGLUM_ENABLED'; payload: boolean }
    | { type: 'SET_SIGLUM_LIST'; payload: Siglum[] }
    | { type: 'ADD_SIGLUM_LIST_FROM_FILE'; payload: DocumentSiglum[] }
    | { type: 'DUPLICATE_SIGLUM_LIST_FROM_FILE'; payload: DocumentSiglum[] }
    | { type: 'REPLACE_SIGLUM_LIST_FROM_FILE'; payload: DocumentSiglum[] }
    | { type: 'ADD_SIGLUM'; payload: Siglum }
    | { type: 'UPDATE_SIGLUM'; payload: Siglum }
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
    | { type: 'SET_SECTION_STYLE_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_HEADER_FOOTER_SETUP_DIALOG_VISIBLE'; payload: { visible: boolean; initialTab?: "header" | "footer" } }
    | { type: 'SET_PAGE_SETUP_OPT_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_TOC_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_REFERENCE_FORMAT_VISIBLE'; payload: boolean }
    | { type: 'SET_PRINT_PREVIEW_VISIBLE'; payload: boolean }
    | { type: 'TOGGLE_PRINT_PREVIEW_VISIBLE' }
    | { type: 'SET_REFERENCE_FORMAT'; payload: ReferencesFormat }
    | { type: 'SET_CUSTOMIZE_STATUS_BAR_VISIBLE'; payload: boolean }
    | { type: 'SET_BOOKMARK_HIGHLIGHTED'; payload: boolean }
    | { type: 'SET_COMMENT_HIGHLIGHTED'; payload: boolean }

    | { type: 'SET_LINK_CONFIG_VISIBLE'; payload: boolean }
    | { type: 'SET_LINK_ENABLED'; payload: boolean }
    | { type: 'TOGGLE_TEXT_NOTE_HIGHLIGHTED' }
    | { type: 'TOGGLE_BOOKMARK_HIGHLIGHTED' }
    | { type: 'TOGGLE_COMMENT_HIGHLIGHTED' }
    | { type: 'SET_METADATA_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_SAVE_TEMPLATE_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_CHOOSE_TEMPLATE_MODAL_VISIBLE'; payload: boolean }
    | { type: 'SET_LAYOUT_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_CUSTOM_SPACING_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_RESUME_NUMBERING_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_SUGGESTED_START_NUMBER'; payload: { number: number; listType: OrderedListType } | null }
    | { type: 'SET_CHANGE_TEMPLATE_MODAL_VISIBLE'; payload: boolean }
    | { type: 'SET_DELETE_APPARATUS_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_DELETE_APPARATUS_ENTRY_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_CONFIRM_CHANGE_TEMPLATE_MODAL'; payload: { visible: boolean; text: string, onConfirm: (() => void) | null } }

    // #region Toolbar State
    | { type: 'SET_TOOLBAR_STATE_FROM_APPARATUS_TEXT_STYLE'; payload: ApparatusTextStyle }
    | { type: 'SET_TOOLBAR_STATE_FROM_MAIN_TEXT_STYLE'; payload: MainTextStyle }
    | { type: 'SET_TOOLBAR_STATE'; payload: ToolbarState }
    | { type: 'SET_TOOLBAR_STATE_FONT_FAMILY'; payload: string }
    | { type: 'SET_TOOLBAR_STATE_FONT_SIZE'; payload: string }
    | { type: 'SET_TOOLBAR_STATE_ALIGNMENT'; payload: Alignment }
    | { type: 'TOGGLE_TOOLBAR_STATE_ALIGNMENT'; payload: Alignment }
    | { type: 'SET_TOOLBAR_STATE_SUPERSCRIPT'; payload: boolean }
    | { type: 'SET_TOOLBAR_STATE_SUBSCRIPT'; payload: boolean }
    | { type: 'SET_TOOLBAR_STATE_BOLD'; payload: boolean }
    | { type: 'SET_TOOLBAR_STATE_ITALIC'; payload: boolean }
    | { type: 'SET_TOOLBAR_STATE_UNDERLINE'; payload: boolean }
    | { type: 'SET_TOOLBAR_STATE_STRIKETHROUGH'; payload: boolean }
    | { type: 'SET_TOOLBAR_STATE_BOOKMARK'; payload: boolean }
    | { type: 'SET_TOOLBAR_STATE_COMMENT'; payload: boolean }
    // #endregion

    // #region Bibliography
    | { type: 'SET_BIBLIOGRAPHY_SETUP_VISIBLE'; payload: boolean }
    | { type: 'SET_IS_BIBLIOGRAPHY_SECTION'; payload: boolean }
    | { type: 'SET_HAS_BIBLIOGRAPHY_SECTION'; payload: boolean }
    | { type: 'ADD_BIBLIOGRAPHY'; payload: Bibliography }
    | { type: 'UPDATE_BIBLIOGRAPHY'; payload: Bibliography }
    | { type: 'DUPLICATE_BIBLIOGRAPHY'; payload: Bibliography }
    | { type: 'REPLACE_BIBLIOGRAPHY'; payload: Bibliography }
    | { type: 'DELETE_BIBLIOGRAPHY'; payload: string }
    | { type: 'SET_BIBLIOGRAPHY_LIST'; payload: Bibliography[] }
    | { type: 'SET_CITATION_SELECTED_BIBLIOGRAPHY_ID'; payload: string | null }
    // #endregion

    // #region Citation
    | { type: 'SET_CITATION_INSERT_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_CAN_INSERT_CITATION'; payload: boolean }
    // #endregion

    // #region Citation
    | { type: 'SET_CAN_INSERT_SYMBOL'; payload: boolean }
    // #endregion

    // #region Notes
    | { type: 'SET_NOTES_ENABLED'; payload: boolean }
    // #endregion

    // #region Bookmark
    | { type: 'SET_BOOKMARK_ENABLED'; payload: boolean }
    // #endregion

    // #region Comment
    | { type: 'SET_COMMENT_ENABLED'; payload: boolean }
    // #endregion

    // #region PrintSetup
    | { type: 'SET_PRINT_SETUP_DIALOG_VISIBLE'; payload: boolean }
    | { type: 'SET_PRINT_OPTIONS'; payload: PrintOptions }
    // #endregion

    // #region ExportTeiSetup
    | { type: 'SET_EXPORT_TEI_SETUP_DIALOG_VISIBLE'; payload: boolean }
    // #endregion

    // #region InsertCustomReadingType
    | { type: 'SET_INSERT_CUSTOM_READING_TYPE_DIALOG_VISIBLE'; payload: boolean }
    // #endregion

    // #region InsertReadingType
    | { type: 'SET_INSERT_READING_TYPE_DIALOG_VISIBLE'; payload: boolean }
    // #endregion

    // #region Search
    | { type: 'SET_SEARCH_CRITERIA'; payload: SearchCriteria }
    | { type: 'SET_REPLACE_HISTORY'; payload: string }
    | { type: 'INCREASE_REPLACED_COUNT'; }
    | { type: 'SET_REPLACED_COUNT'; payload: number }
    | { type: 'RESET_REPLACED_COUNT'; }
    | { type: 'RESET_SEARCH_CRITERIA'; }
    | { type: 'SET_TOTAL_CRITICAL_MATCHES'; payload: number }
    | { type: 'SET_TOTAL_APPARATUS_MATCHES'; payload: number }
    | { type: 'RESET_TOTAL_MATCHES'; payload: number }
    | { type: 'SET_CURRENT_SEARCH_INDEX'; payload: number | null }
    | { type: 'TRIGGER_NEXT_SEARCH'; }
    | { type: 'TRIGGER_PREVIOUS_SEARCH'; }
    | { type: 'SET_DISABLE_REPLACE_ACTION', payload: boolean }
    | { type: 'SET_CRITICAL_REPLACE_MODE', payload: boolean }
    | { type: 'SET_APPARATUS_REPLACE_MODE', payload: boolean }
    // #endregion

    // #region Selects
    | { type: 'SET_STYLE_SELECT_OPEN'; payload: boolean }
    | { type: 'SET_FONT_FAMILY_SELECT_OPEN'; payload: boolean }
    | { type: 'SET_FONT_SIZE_SELECT_OPEN'; payload: boolean }
    | { type: "CLOSE_ALL_SELECTS" }
    | { type: 'TOGGLE_SHOW_NON_PRINTING_CHARACTERS' }
    | { type: 'OPEN_CHAT'; payload?: string }
    | { type: 'SET_CHAT_REFERENCE'; payload: string | null }
    | { type: 'CLOSE_CHAT' }
    | { type: 'MINIMIZE_CHAT' }


export const setTemplate = (template: Template): EditorAction => ({
    type: 'SET_TEMPLATE',
    payload: template
})

export const setStyles = (styles: Style[]): EditorAction => ({
    type: 'SET_STYLES',
    payload: styles
})

export const setLayout = (layout: Layout): EditorAction => ({
    type: 'SET_LAYOUT',
    payload: layout
})

export const setHandleKeyboardShortcuts = (keyboardShortcuts: KeyboardShortcutCategory[]): EditorAction => ({
    type: 'SET_KEYBOARD_SHORTCUTS',
    payload: keyboardShortcuts
})

export const setPageSetup = (pageSetup: SetupOptionType): EditorAction => ({
    type: 'SET_PAGE_SETUP',
    payload: pageSetup
})

export const setSort = (sort: string[]): EditorAction => ({
    type: 'SET_SORT',
    payload: sort
})

export const toggleTocVisibility = (): EditorAction => ({
    type: 'TOGGLE_TOC_VISIBILITY',
})

export const setZoomRatio = (zoomRatio: number): EditorAction => ({
    type: 'SET_ZOOM_RATIO',
    payload: zoomRatio
})

export const setToolbarVisible = (visible: boolean): EditorAction => ({
    type: 'SET_TOOLBAR_VISIBLE',
    payload: visible
})

export const setStatusBarVisible = (visible: boolean): EditorAction => ({
    type: 'SET_STATUS_BAR_VISIBLE',
    payload: visible
})

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

export const setSiglumEnabled = (enabled: boolean): EditorAction => ({
    type: 'SET_SIGLUM_ENABLED',
    payload: enabled
})

export const setSiglumList = (siglumList: Siglum[]): EditorAction => ({
    type: 'SET_SIGLUM_LIST',
    payload: siglumList
})

export const addSiglumListFromFile = (siglumList: DocumentSiglum[]): EditorAction => ({
    type: 'ADD_SIGLUM_LIST_FROM_FILE',
    payload: siglumList
})

export const duplicateSiglumListFromFile = (siglumList: DocumentSiglum[]): EditorAction => ({
    type: 'DUPLICATE_SIGLUM_LIST_FROM_FILE',
    payload: siglumList
})

export const replaceSiglumListFromFile = (siglumList: DocumentSiglum[]): EditorAction => ({
    type: 'REPLACE_SIGLUM_LIST_FROM_FILE',
    payload: siglumList
})

export const addSiglum = (siglum: Siglum): EditorAction => ({
    type: 'ADD_SIGLUM',
    payload: siglum
})

export const updateSiglum = (siglum: Siglum): EditorAction => ({
    type: 'UPDATE_SIGLUM',
    payload: siglum
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

export const setSectionStyleSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_SECTION_STYLE_SETUP_DIALOG_VISIBLE',
    payload: visible
})

export const setHeaderFooterSetupDialogVisible = (visible: boolean, initialTab: "header" | "footer" = "header"): EditorAction => ({
    type: 'SET_HEADER_FOOTER_SETUP_DIALOG_VISIBLE',
    payload: { visible, initialTab }
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

export const toggleTextNoteHighlighted = (): EditorAction => ({
    type: 'TOGGLE_TEXT_NOTE_HIGHLIGHTED',
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

export const setLinkEnabled = (enabled: boolean): EditorAction => ({
    type: 'SET_LINK_ENABLED',
    payload: enabled
})

export const setMetadataSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_METADATA_SETUP_DIALOG_VISIBLE',
    payload: visible
})

export const setCustomizeStatusBarVisible = (visible: boolean): EditorAction => ({
    type: 'SET_CUSTOMIZE_STATUS_BAR_VISIBLE',
    payload: visible
})

export const setSaveTemplateDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_SAVE_TEMPLATE_DIALOG_VISIBLE',
    payload: visible,
})

export const setChooseTemplateModalVisible = (visible: boolean): EditorAction => ({
    type: 'SET_CHOOSE_TEMPLATE_MODAL_VISIBLE',
    payload: visible,
})

export const setLayoutSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_LAYOUT_SETUP_DIALOG_VISIBLE',
    payload: visible,
})

export const setCustomSpacingDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_CUSTOM_SPACING_DIALOG_VISIBLE',
    payload: visible,
})

export const setResumeNumberingDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_RESUME_NUMBERING_DIALOG_VISIBLE',
    payload: visible,
})

export const setSuggestedStartNumber = (value: { number: number; listType: OrderedListType } | null): EditorAction => ({
    type: 'SET_SUGGESTED_START_NUMBER',
    payload: value,
})

export const setDeleteApparatusDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_DELETE_APPARATUS_DIALOG_VISIBLE',
    payload: visible,
})

export const setDeleteApparatusEntryDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_DELETE_APPARATUS_ENTRY_DIALOG_VISIBLE',
    payload: visible,
})

export const setChangeTemplateModalVisible = (visible: boolean): EditorAction => ({
    type: 'SET_CHANGE_TEMPLATE_MODAL_VISIBLE',
    payload: visible,
})

export const setConfirmChangeTemplateModal = (payload: { visible: boolean; text: string, onConfirm: (() => void) | null }): EditorAction => ({
    type: 'SET_CONFIRM_CHANGE_TEMPLATE_MODAL',
    payload
})

// #region Bibliography
export const setBibliographySetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_BIBLIOGRAPHY_SETUP_VISIBLE',
    payload: visible,
})

export const setBibliographyList = (bibliographyList: Bibliography[]): EditorAction => ({
    type: 'SET_BIBLIOGRAPHY_LIST',
    payload: bibliographyList
})

export const addBibliography = (payload: Bibliography): EditorAction => ({
    type: "ADD_BIBLIOGRAPHY",
    payload
});

export const updateBibliography = (payload: Bibliography): EditorAction => ({
    type: "UPDATE_BIBLIOGRAPHY",
    payload
});

export const duplicateBibliography = (payload: Bibliography): EditorAction => ({
    type: "DUPLICATE_BIBLIOGRAPHY",
    payload
});

export const replaceBibliography = (payload: Bibliography): EditorAction => ({
    type: "REPLACE_BIBLIOGRAPHY",
    payload
});

export const deleteBibliography = (payload: string): EditorAction => ({
    type: "DELETE_BIBLIOGRAPHY",
    payload
});

export const setIsBibliographySection = (isBibliographySection: boolean): EditorAction => ({
    type: "SET_IS_BIBLIOGRAPHY_SECTION",
    payload: isBibliographySection
})

export const setCitationSelectedBibliographyId = (id: string | null): EditorAction => ({
    type: "SET_CITATION_SELECTED_BIBLIOGRAPHY_ID",
    payload: id
})
// #endregion

// #region Citation
export const setCitationInsertDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_CITATION_INSERT_DIALOG_VISIBLE',
    payload: visible,
})
export const setCanInsertCitation = (canInsertCitation: boolean): EditorAction => ({
    type: "SET_CAN_INSERT_CITATION",
    payload: canInsertCitation
})
// #endregion

// #region Notes
export const setNotesEnabled = (enabled: boolean): EditorAction => ({
    type: "SET_NOTES_ENABLED",
    payload: enabled
})
// #endregion

// #region Notes
export const setCanInsertSymbol = (enabled: boolean): EditorAction => ({
    type: "SET_CAN_INSERT_SYMBOL",
    payload: enabled
})
// #endregion

// #region Bookmark
export const setBookmarkEnabled = (enabled: boolean): EditorAction => ({
    type: "SET_BOOKMARK_ENABLED",
    payload: enabled
})
// #endregion

// #region Comment
export const setCommentEnabled = (enabled: boolean): EditorAction => ({
    type: "SET_COMMENT_ENABLED",
    payload: enabled
})
// #endregion

// #region PrintSetup
export const setPrintSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_PRINT_SETUP_DIALOG_VISIBLE',
    payload: visible,
})
export const setPrintOptions = (printOptions: PrintOptions): EditorAction => ({
    type: 'SET_PRINT_OPTIONS',
    payload: printOptions,
})
// #endregion

// #region ExportTeiSetup
export const setExportTeiSetupDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_EXPORT_TEI_SETUP_DIALOG_VISIBLE',
    payload: visible,
})
// #endregion

// #region InsertCustomReadingType
export const setInsertCustomReadingTypeDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_INSERT_CUSTOM_READING_TYPE_DIALOG_VISIBLE',
    payload: visible,
})
// #endregion

// #region InsertReadingType
export const setInsertReadingTypeDialogVisible = (visible: boolean): EditorAction => ({
    type: 'SET_INSERT_READING_TYPE_DIALOG_VISIBLE',
    payload: visible,
})
// #endregion

// #region Search
export const setSearchCriteria = (options: SearchCriteria): EditorAction => ({
    type: 'SET_SEARCH_CRITERIA',
    payload: options
})

export const setReplaceHistory = (replacement: string): EditorAction => ({
    type: 'SET_REPLACE_HISTORY',
    payload: replacement
})

export const increaseReplacedCount = (): EditorAction => ({
    type: 'INCREASE_REPLACED_COUNT',
})

export const setReplacedCount = (count: number): EditorAction => ({
    type: 'SET_REPLACED_COUNT',
    payload: count
})

export const resetReplacedCount = (): EditorAction => ({
    type: 'RESET_REPLACED_COUNT',
})

export const resetSearchCriteria = (): EditorAction => ({
    type: 'RESET_SEARCH_CRITERIA',
})

export const setTotalCriticalMatches = (total: number): EditorAction => ({
    type: 'SET_TOTAL_CRITICAL_MATCHES',
    payload: total
})

export const setTotalApparatusMatches = (total: number): EditorAction => ({
    type: 'SET_TOTAL_APPARATUS_MATCHES',
    payload: total
})

export const resetTotalMatches = (total: number): EditorAction => ({
    type: 'RESET_TOTAL_MATCHES',
    payload: total
})

export const setCurrentSearchIndex = (index: number | null): EditorAction => ({
    type: 'SET_CURRENT_SEARCH_INDEX',
    payload: index
})

export const triggerNextSearch = (): EditorAction => ({
    type: 'TRIGGER_NEXT_SEARCH',
})

export const triggerPreviousSearch = (): EditorAction => ({
    type: 'TRIGGER_PREVIOUS_SEARCH',
})

export const setDisableReplaceAction = (disabled: boolean): EditorAction => ({
    type: 'SET_DISABLE_REPLACE_ACTION',
    payload: disabled
})

export const setCriticalReplaceMode = (isInReplaceMode: boolean): EditorAction => ({
    type: 'SET_CRITICAL_REPLACE_MODE',
    payload: isInReplaceMode
})

export const setApparatusReplaceMode = (isInReplaceMode: boolean): EditorAction => ({
    type: 'SET_APPARATUS_REPLACE_MODE',
    payload: isInReplaceMode
})
// #endregion

export const setStyleSelectOpen = (open: boolean): EditorAction => ({
    type: 'SET_STYLE_SELECT_OPEN',
    payload: open
})

export const setFontFamilySelectOpen = (open: boolean): EditorAction => ({
    type: 'SET_FONT_FAMILY_SELECT_OPEN',
    payload: open
})

export const setFontSizeSelectOpen = (open: boolean): EditorAction => ({
    type: 'SET_FONT_SIZE_SELECT_OPEN',
    payload: open
})

export const closeAllSelects = (): EditorAction => ({
    type: "CLOSE_ALL_SELECTS"
})

export const toggleShowNonPrintingCharacters = (): EditorAction => ({
    type: 'TOGGLE_SHOW_NON_PRINTING_CHARACTERS',
})

export const setReadingTypeEnabled = (enabled: boolean): EditorAction => ({
    type: 'SET_READING_TYPE_ENABLED',
    payload: enabled
})

export const setReadingSeparatorEnabled = (enabled: boolean): EditorAction => ({
    type: 'SET_READING_SEPARATOR_ENABLED',
    payload: enabled
})