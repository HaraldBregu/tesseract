import { BaseWindow, MenuItem, WebContentsView } from "electron";

export enum MenuItemId {

    //Settings menu
    SETTINGS = "settings",
    PREFERENCES = "preferences",
    SIGN_IN = "signIn",
    NOTIFICATIONS = "notifications",
    SHARED_FILES = "sharedFiles",
    FEEDBACK = "feedback",
    CHECK_FOR_UPDATES = "checkForUpdates",
    HIDE = "hide",
    HIDE_OTHERS = "hideOthers",
    SHOW_ALL = "showAll",
    QUIT = "quit",

    // File menu
    NEW_FILE = "newFile",
    OPEN_FILE = "openFile",
    OPEN_RECENT_FILE = "openRecentFile",
    IMPORT_FILE = "importFile",
    CLOSE_FILE = "closeFile",
    SAVE_FILE = "saveFile",
    SAVE_FILE_AS = "saveFileAs",
    RENAME_FILE = "renameFile",
    MOVE_FILE = "moveFile",
    REVERT_FILE_TO = "revertFileTo",
    SHARE_FOR_REVIEW = "shareForReview",
    LOCK_FILE = "lockFile",
    UNLOCK_FILE = "unlockFile",
    EXPORT_TO = "exportTo",
    EXPORT_TO_PDF = "exportToPdf",
    EXPORT_TO_XML_TEI = "exportToXmlTei",
    EXPORT_TEMPLATE = "exportTemplate",
    SAVE_AS_TEMPLATE = "saveAsTemplate",
    METADATA = "metadata",
    PAGE_SETUP = "pageSetup",
    PRINT = "print",
    CHAT = "chat",
    AUTHENTICATION = "authentication",
    LOGOUT = "logout",
    SHARE_FOR_COLLABORATOR = "shareForCollaborator",

    // Edit menu
    FIND_AND_REPLACE = "findAndReplace",
    UNDO = "undo",
    REDO = "redo",
    CUT = "cut",
    COPY = "copy",
    COPY_STYLE = "copyStyle",
    PASTE = "paste",
    PASTE_STYLE = "pasteStyle",
    PASTE_TEXT_WITHOUT_FORMATTING = "pasteTextWithoutFormatting",
    DELETE_SELECTION = "deleteSelection",
    SELECT_ALL = "selectAll",
    DESELECT_ALL = "deSelectAll",

    // Insert menu
    INSERT_COMMENT = "insertComment",
    INSERT_BOOKMARK = "insertBookmark",
    INSERT_HIGHLIGHT = "insertHighlight",
    INSERT_LINE_NUMBER = "insertLineNumber",
    INSERT_LINK = "insertLink",
    INSERT_IMAGE = "insertImage",
    INSERT_SYMBOL = "insertSymbol",
    INSERT_OBJECT = "insertObject",
    INSERT_TABLE = "insertTable",
    INSERT_SHAPES_AND_LINES = "insertShapesAndLines",
    INSERT_PAGE_BREAK = "insertPageBreak",
    INSERT_READING_TYPE = "insertReadingType",
    INSERT_SECTION_BREAK = "insertSectionBreak",
    INSERT_LINE_NUMBER_NONE = "insertLineNumberNone",
    INSERT_LINE_NUMBER_EACH_5_LINE = "insertLineNumberEach5Line",
    INSERT_LINE_NUMBER_EACH_LINE = "insertLineNumberEachLine",
    INSERT_LINE_NUMBER_EACH_10_LINE = "insertLineNumberEach10Line",
    INSERT_LINE_NUMBER_EACH_15_LINE = "insertLineNumberEach15Line",
    INSERT_PAGE_NUMBER = "insertPageNumber",
    INSERT_DATE = "insertDate",
    INSERT_DATE_AND_TIME = "insertDateAndTime",
    INSERT_AUTHOR = "insertAuthor",
    INSERT_TITLE = "insertTitle",

    // References menu 
    INSERT_NOTE = "insertNote",
    INSERT_NOTE_TO_APPARATUS = "insertNoteToApparatus",
    INSERT_NOTE_IN_INNER_MARGIN = "insertNoteInInnerMargin",
    INSERT_NOTE_IN_OUTER_MARGIN = "insertNoteInOuterMargin",
    SWAP_MARGIN = "swapMargin",
    ADD_READING = "addReading",
    ADD_READING_TYPE_ADD = "addReadingTypeAdd",
    ADD_READING_TYPE_OM = "addReadingTypeOm",
    ADD_READING_TYPE_TR = "addReadingTypeTr",
    ADD_READING_TYPE_DEL = "addReadingTypeDel",
    ADD_READING_TYPE_CUSTOM = "addReadingTypeCustom",
    ADD_READING_SEPARATOR = "addReadingSeparator",
    ADD_SIGLUM = "addSiglum",
    SIGLA_SETUP = "siglaSetup",
    ADD_CITATION = "addCitation",
    ADD_BIBLIOGRAPHY = "addBibliography",
    REFERENCES_FORMAT = "referencesFormat",
    ADD_APPARATUS = "addApparatus",
    ADD_APPARATUS_CRITICAL = "CRITICAL",
    ADD_APPARATUS_PAGE_NOTES = "PAGE_NOTES",
    ADD_APPARATUS_SECTION_NOTES = "SECTION_NOTES",
    ADD_APPARATUS_INNER_MARGIN = "INNER_MARGIN",
    ADD_APPARATUS_OUTER_MARGIN = "OUTER_MARGIN",

    // Format menu 
    FONT_BOLD = "fontBold",
    FONT_ITALIC = "fontItalic",
    FONT_UNDERLINE = "fontUnderline",
    FONT_STRIKETHROUGH = "fontStrikethrough",
    FONT_SUPERSCRIPT = "fontSuperscript",
    FONT_SUBSCRIPT = "fontSubscript",
    FONT_NPC = "fontNPC",
    FONT_CAPTALIZATION_ALL_CAPS = "fontCaptalizationAllCaps",
    FONT_CAPTALIZATION_SMALL_CAPS = "fontCaptalizationSmallCaps",
    FONT_CAPTALIZATION_TITLE_CASE = "fontCaptalizationTitleCase",
    FONT_CAPTALIZATION_START_CASE = "fontCaptalizationStartCase",
    FONT_CAPTALIZATION_NONE = "fontCaptalizationNone",
    FONT_LIGATURE_DEFAULT = "fontLigatureDefault",
    FONT_LIGATURE_NONE = "fontLigatureNone",
    FONT_LIGATURE_ALL = "fontLigatureAll",
    FONT_CHARACTER_SPACING_NORMAL = "fontCharacterSpacingNormal",
    FONT_CHARACTER_SPACING_TIGHTEN = "fontCharacterSpacingTighten",
    FONT_CHARACTER_SPACING_LOOSEN = "fontCharacterSpacingLoosen",
    TEXT_ALIGN_LEFT = "textAlignLeft",
    TEXT_ALIGN_CENTER = "textAlignCenter",
    TEXT_ALIGN_RIGHT = "textAlignRight",
    TEXT_ALIGN_JUSTIFY = "textAlignJustify",
    TEXT_INCREASE_INDENT = "textIncreaseIndent",
    TEXT_DECREASE_INDENT = "textDecreaseIndent",
    TEXT_SPACING_SINGLE = "textSpacingSingle",
    TEXT_SPACING_1_15 = "textSpacing1_15",
    TEXT_SPACING_ONE_AND_HALF = "textSpacingOneAndHalf",
    TEXT_SPACING_DOUBLE = "textSpacingDouble",
    CUSTOM_SPACING = "customSpacing",
    NUMBER_BULLET = "numberBullet",
    UPPER_LETTER_BULLET = "upperLetterBullet",
    LOW_LETTER_BULLET = "lowLetterBullet",
    UPPER_ROMAN_BULLET = "upperRomanBullet",
    LOW_ROMAN_BULLET = "lowRomanBullet",
    POINT_BULLET = "pointBullet",
    CIRCLE_BULLET = "circleBullet",
    SQUARE_BULLET = "squareBullet",
    PREVIOUS_NUMBERING = "previousNumbering",
    RESUME_NUMBERING = "resumeNumbering",
    LAYOUT_PAGE_SETUP = "layoutPageSetup",
    PAGE_NUMBER = "pageNumber",
    SECTIONS_STYLE = "sectionsStyle",
    OPEN_LINE_NUMBER_SETTINGS = "openLineNumberSettings",
    OPEN_HEADER_FOOTER_SETTINGS = "openHeaderFooterSettings",
    OPEN_HEADER_SETTINGS = "openHeaderSettings",
    OPEN_FOOTER_SETTINGS = "openFooterSettings",
    OPEN_TOC_SETTINGS = "openTocSettings",
    CHANGE_TEMPLATE = "changeTemplate",
    REMOVE_LINK = "removeLink",
    LAYOUT = "layout",

    // Tools menu
    MACROS = "macros",
    MACROS_RECORD = "macrosRecord",
    DOCUMENT_STATISTICS = "documentStatistics",
    HYPHENATION = "hyphenation",
    COMPARE_DOCUMENTS = "compareDocuments",
    REVIEW = "review",
    ACCEPT_ALL_CHANGES = "acceptAllChanges",
    REJECT_ALL_CHANGES = "rejectAllChanges",
    ADD_ONS = "addOns",

    // Keyboard menu
    SHOW_MAP = "showMap",
    CUSTOMIZE_SHORTCUTS = "customizeShortcuts",
    NONE = "none",
    ARABIC = "arabic",
    ARMENIAN = "armenian",
    CYRILLIC = "cyrillic",
    LATIN = "latin",

    // View menu 
    TOGGLE_VIEW_APPARATUS = "toggleViewApparatus",
    TABLE_OF_CONTENTS = "tableOfContents",
    TOOLBAR = "toggleShowToolbar",
    CUSTOMIZE_TOOLBAR = "customizeToolbar",
    STATUS_BAR = "statusBar",
    CUSTOMIZE_STATUS_BAR = "customizeStatusBar",
    PRINT_PREVIEW = "printPreview",
    SHOW_TABS_ALIGNED_HORIZONTALLY = "showTabsAlignedHorizontally",
    SHOW_TABS_ALIGNED_VERTICALLY = "showTabsAlignedVertically",
    ZOOM = "zoom",
    GO_TO_NEXT_PAGE = "goToNextPage",
    GO_TO_PREVIOUS_PAGE = "goToPreviousPage",
    GO_TO_FIRST_PAGE = "goToFirstPage",
    GO_TO_LAST_PAGE = "goToLastPage",
    GO_TO_PAGE = "goToPage",
    SYNCHRONIZE_VIEWS = "synchronizeViews",
    NON_PRINTING_CHARACTERS = "nonPrintingCharacters",
    EXPAND_COLLAPSE = "expandCollapse",

    // Window menu 
    MINIMIZE = "minimize",
    ZOOM_WINDOW = "zoomWindow",
    ZOOM_ALL = "zoomAll",
    FILL = "fill",
    CENTRE = "centre",
    MOVE_RESIZE = "moveResize",
    FULL_SCREEN_TILE = "fullScreenTile",
    REMOVE_WINDOW_FROM_SET = "removeWindowFromSet",
    MOVE_TO = "moveTo",
    BRING_ALL_TO_FRONT = "bringAllToFront",
    SHOW_PREVIOUS_TAB = "showPreviousTab",
    SHOW_NEXT_TAB = "showNextTab",
    MOVE_TAB_TO_NEW_WINDOW = "moveTabToNewWindow",
    MERGE_ALL_WINDOWS = "mergeAllWindows",
    UNTITLED = "untitled",

    // Help menu
    SEARCH = "search",
    HELP = "help",
    FAQS = "faqs",
    FORUM = "forum",
    WHAT_IS_NEW = "whatIsNew",
    REPORT_AN_ISSUE = "reportAnIssue",
    CRITERION_FEEDBACK = "criterionFeedback",
    CHECK_UPDATES = "checkUpdates",
    ABOUT = "about",
    SUBMIT_TICKET = 'submitTicket',

    // Developer menu
    RELOAD = "reload",
    TOGGLE_DEV_TOOLS = "toggleDevTools",
}

export type MenuItemClickHandler = (menuItem: MenuItem, data?: unknown) => void

export type WebContentsViewMode = 'critix_editor' | 'file_viewer'

export type MenuViewMode = "initial" | WebContentsViewMode

export type OnBaseWindowReady = (baseWindow: BaseWindow) => void
export type OnOpenFileFromLocalDisk = (filePath: string) => void

export type OnMenuItemClick = (menuItem: MenuItem) => void

export type OnWebContentsViewCreated = (route: WebContentsRoute, webContentsView: WebContentsView) => void

export type UpdateTabsCallback = (tabs: Tab[]) => void

export type SimplifiedTab = {
    filePath: string
    selected: boolean
    route: WebContentsRoute
}

export type UserIpcEvent =
    | "LOGIN_SUCCESS"
    | "LOGOUT_SUCCESS"
    | "REGISTRATION_SUCCESS"
    | "CHANGE_PASSWORD_SUCCESS"
    | "UPDATE_USER_SUCCESS"
    | "CURRENT_USER_SUCCESS"
    | "DELETE_CURRENT_USER_SUCCESS";
