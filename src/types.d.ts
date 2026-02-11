/**
 * Base template type
 */
type Template = {
    name: string;
    version: string;
    type: "DEFAULT" | "PROPRIETARY" | "COMMUNITY";
    createdDate: string;
    updatedDate: string;
    layout: Layout;
    pageSetup: SetupOptionType;
    sort: string[];
    styles: Style[];
    paratextual: Paratextual;
}

type ApparatusType = 'CRITICAL' | 'PAGE_NOTES' | 'SECTION_NOTES' | 'INNER_MARGIN' | 'OUTER_MARGIN' | 'text';

type Apparatus = {
    id: string;
    title: string;
    type: ApparatusType;
    visible: boolean;
    expanded: boolean;
    notesVisible: boolean;
    commentsVisible: boolean;
}

type DocumentApparatus = Apparatus & {
    content: JSONContent
}

type Annotations = {
    comments: AppComment[];
    commentCategories: CommentCategory[];
    bookmarks: Bookmark[];
    bookmarkCategories: BookmarkCategory[];
}

/**
 * Document data type
 */
type DocumentData = {
    id: string;
    version: string;
    signature: string;
    mainText: JSONContent | null;
    apparatuses: DocumentApparatus[];
    annotations: Annotations;
    template: Template;
    referencesFormat: ReferencesFormat;
    metadata: Metadata;
    bibliographies: Bibliography[];
    sigla: DocumentSiglum[];
}

// @TODO: 
type CustomMark = {
    id: string;
    title: string;
    description?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: string;
}

type Bookmark = {
    id: string;
    title: string;
    description?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: string;
    categoryId?: string;
    visible: boolean;
}

type Preferences = {
    fileNameDisplay: "full" | "filename";
    pdfQuality: string;
    recentFilesCount: number;
    rememberLayout: boolean;
    theme: 'light' | 'dark' | 'system';
    commentPreviewLimit?: string;
    bookmarkPreviewLimit?: string;
    fileSavingDirectory?: string;
    defaultDirectory?: string;
    automaticFileSave?: string;
    versioningDirectory?: string;
    customVersioningDirectory?: string;
    criterionLanguage?: string;
    criterionRegion?: string;
    dateFormat: string;
    historyActionsCount?: string;
}

type AppComment = {
    id: string;
    description?: string;
    content: string;
    target: CommentTarget;
    createdAt: string;
    updatedAt: string;
    author: string;
    categoryId?: string;
    visible: boolean;
}

type CommentTarget = 'MAIN_TEXT' | 'APPARATUS_TEXT'

type Category = {
    id: string;
    name: string;
}

type BookmarkCategory = Category<Bookmark>

type CommentCategory = Category<AppComment>

type FileNameExt = '.critx' | '.pdf' | '.png' | '.jpg' | '.jpeg'

type FileType = FileNameExt extends `.${infer T}` ? T : never

type NodeTextAlign = "left" | "center" | "right" | "justify"

type TocParagraphAttributes = {
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    color: string;
    index: number;
    spacingType: string;
    tocNumber: string;
    text: string;
    sectionType: string | null;
}

type ElementAttribute = {
    fontSize: string
    fontFamily: string
    fontWeight: string
    fontStyle: string;
    textAlign: NodeTextAlign;
    color: string | null | undefined;
    lineHeight: string;
    marginLeft: string | null;
    marginRight: string | null;
    marginTop: string | null;
    marginBottom: string | null;
}

type TargetTypeStyle =
    | "TOC"
    | "TOC_H1"
    | "TOC_H2"
    | "TOC_H3"
    | "TOC_H4"
    | "TOC_H5"
    | "TOC_H6"
    | "H1"
    | "H2"
    | "H3"
    | "H4"
    | "H5"
    | "H6"
    | "P"
    | "APP_LEM"
    | "APP_VAR"
    | "MARGIN_NOTES"
    | "LINE_NUMBER"
    | "PAGE_NOTE"
    | "SECTION_NOTE"
    | "BIB"
    | "HEAD"
    | "FOOT"
    | "CUSTOM";

type Style = {
    id: string;
    name: string;
    enabled: boolean;
    type: TargetTypeStyle;
    level?: number;
    fontWeight: string
    color: string
    fontFamily: string
    fontSize: string
    bold: boolean;
    italic: boolean;
    underline: boolean;
    align?: NodeTextAlign;
    lineHeight?: string;
    marginTop?: string;
    marginBottom?: string;
}
interface ErrorDetails {
    errorCode: number;
    errorMessage: string;
    stack?: string;
}

interface PerformanceDetails {
    durationMs: number;
    memoryUsage?: number;
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    process: 'main' | 'renderer';
    category: string;
    message: string;
    details?: ErrorDetails | PerformanceDetails;
    duration?: number;
}

type Route =
    | '/'
    | '/file-viewer'
    | '/browser-tab-bar'
    | '/welcome'
    | '/about'
    | '/preferences'
    | '/find_and_replace'
    | '/keyboard-shortcuts'
    | '/auth'
    | '/logout'
    | '/share-document'
    | '/shared-files'

type WebContentsRoute = Partial<Route, '/' | '/file-viewer'>

type TabType = FileType

type TabInfo = {
    id: number
    name: string
    type: TabType
    changed: boolean
    isAutoCreated?: boolean
}

type Tab = {
    id: number
    route: WebContentsRoute
    selected: boolean
    filePath: string | null
}

type TocSettings = {
    show: boolean;
    levels: number;
    indentLevels: boolean;
    title: string;
    tabLeaderFormat: string;
    showHeadingNumbers: boolean;
    numberSeparator: string;
    level1Format?: string;
    level2Format?: string;
    level3Format?: string;
    level4Format?: string;
    level5Format?: string;
    level6Format?: string;
}

type Subset = {
    name: string;
    start: number;
    end: number;
}

type CharacterSet = {
    code: number;
    name: string;
}[]

type Fonts = Record<string, {
    name: string;
    path: string;
    symbols: CharacterSet
}>

type SiglumValue = {
    title: string
    content: unknown
    contentHtml: string
}

type SiglumManuscripts = SiglumValue

type SiglumDescription = SiglumValue

type SiglumMetadata = Pick<Metadata, 'author'> & {
    exportDate: string
}

type DocumentSiglum = {
    value: SiglumValue
    manuscripts: SiglumManuscripts
    description: SiglumDescription
}

type DocumentSiglum = Pick<Siglum, 'siglum' | 'manuscripts' | 'description'>

type CharacterConfiguration = {
    code: number;
    character: string;
    shortcut: string | null;
}

type ReferenceFormatChar = {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    value: string;
    isCustom?: boolean;
}

type LemmaSeparator = ReferenceFormatChar

type FormToTermSeparator = ReferenceFormatChar

type ReadingsSeparator = ReferenceFormatChar

type ApparatusEntriesSeparator = ReferenceFormatChar

type ReadingTypeAdd = ReferenceFormatChar

type ReadingTypeOm = ReferenceFormatChar

type ReadingTypeTr = ReferenceFormatChar

type ReadingTypeDel = ReferenceFormatChar

type SeparatorOption = "none" | "]" | "-" | ":" | ";";

type ReadingTypeConfig = ReferenceFormatChar & {};

type SeparatorOptions = Record<SeparatorKeys, { value: SeparatorOption; label: string }[]>

type SeparatorKeys = "lemma_separator" | "from_to_separator" | "readings_separator" | "apparatus_separator";

type ReadingKeys = "add_reading_type" | "om_reading_type" | "tr_reading_type" | "del_reading_type";

type GuideColorsKeys = "lemma_color" | "sigla_color" | "reading_type_separator_color" | "comments_color" | "bookmarks_color"

type NoteKeys = "page_note" | "section_note";

type NotesConfig = {
    numeration: string;
    sectionLevel: string;
    numberFormat: string;
}

type ListValueType = 'text' | 'number' | 'date' | 'list';

type Typology = 'custom' | 'fixed'

type AddOnMetadataType = string | number | string[] | boolean

type AddOnMetadata = {
    name: string,
    value: AddOnMetadataType,
    type: ListValueType
}

type DocumentCriteria = 'wholeDoc' | 'apparatus' | 'text' | string;

type SearchCriteria = {
    searchTerm: string;
    documentCriteria: DocumentCriteria[];
    caseSensitive: boolean;
    wholeWords: boolean;
}

type SectionRange = { type: string, from: number, to: number };

type SectionRanges = SectionRange[];

type FindState = { matchesCount: number; activeIndex: number | null; matchPositions: { from: number; to: number }[] }

type FindAndReplaceHistory = {
    searchTerm: string[];
    replacement: string[];
}

type ReplaceCriteria = {
    replace: string;
    isDisabled: boolean;
}

type Matches = {
    section: string;
    position: TTextPosition;
}

type WorkerRequest = {
    chunks: Array<{ id: number; text: string }>;
    searchTerm: string;
    caseSensitive: boolean;
    wholeWords: boolean;
};

type WorkerMatch = { chunkId: number; index: number; length: number };

type WorkerResponse = { matches: WorkerMatch[] };


type MetadataStatus = 'Draft' | 'In review' | 'Final';

type Metadata = {
    license: string;
    createdDate: string;
    updatedDate: string;
    title: string;
    subject: string;
    author: string;
    copyrightHolder: string;
    keywords: string[];
    status: MetadataStatus;
    templateName: string;
    language: string;
    version: string;
    persistentIdentifier: string | null
    manager: string | null
    company: string | null
    publisher: string | null
    licenseInformation: string | null
    category: string | null
    comments: string | null
    lastAuthor: string | null
    revisionNumber: string | null
    totalEditingTime: string | null
    lastPrintedDate: string | null
    contentStatus: string | null
    contentType: string | null
    wordCount: string | null
    characterCountWithSpaces: string | null
    characterCountNoSpaces: string | null
    lineCount: string | null
    paragraphCount: string | null
    pageCount: string | null
    customName: string | null
    valueType: string | null
    value: string | null
    others: AddOnMetadata[];
}

type ReferencesFormat = Record<SeparatorKeys, ReferenceFormatChar>
    & Record<ReadingKeys, ReadingTypeConfig>
    & Record<GuideColorsKeys, string>
    & Record<NoteKeys, NotesConfig>;

type CITATION_STYLES = | "chicago-17-author-date" | "chicago-17-note-bibliography";

type BIB_REFERENCE_TYPES = 'book' | 'book_section' | 'journal';

type CitationStyle = {
    id: CITATION_STYLES;
    label: string;
    subLabel: string;
}

type ReferenceSourceType = {
    value: BIB_REFERENCE_TYPES;
    label: string;
}

type VALIDATION = {
    required: boolean;
    pattern: string;
}

type BIB_REFERENCE_FIELDS = "sourceType" | "title" | "editor" | "author" | "bookTitle" | "series" | "seriesNumber" | "volume" | "numberOfVolumes" | "issue" | "doi" | "place" | "publisher" | "date" | "pages" | "shortTitle" | "url" | "accessed";

type BIB_REFERENCE_FIELDS_EXCLUDED_SOURCE = Exclude<BIB_REFERENCE_FIELDS, 'sourceType'>;

type CONTROL_TYPE = 'text' | 'date' | 'tag';

type ReferenceField = {
    label: string;
    key: BIB_REFERENCE_FIELDS;
    sourceTypes: BIB_REFERENCE_TYPES[];
    controlType: CONTROL_TYPE;
    pattern: string;
}

type BibReference = {
    id?: string;
    sourceType: BIB_REFERENCE_TYPES;
    title: string;
    editor?: string;
    author: string[];
    bookTitle?: string;
    series?: string;
    seriesNumber?: string;
    volume?: string;
    numberOfVolumes?: string;
    issue?: string;
    doi?: string;
    place?: string;
    publisher?: string;
    date?: string;
    pages?: string;
    shortTitle?: string;
    url?: string;
    accessed?: string;
};

type Bibliography = {
    id?: string;
    name: string;
    citationStyle: CITATION_STYLES;
    references: BibReference[];
}

type InsertBibliography = {
    bib: BibReference;
    citationStyle: CITATION_STYLES;
}

type DialogExtensionFilter = { name: string; extensions: string[] };

type DialogExtensionFilters = DialogExtensionFilter[];

type MainEditorSections = 'intro' | 'critical' | 'bibliography' | 'toc';

type PrintSections = {
    intro: 0 | 1;
    toc: 0 | 1;
    critical: 0 | 1;
    bibliography: 0 | 1;
}

type PrintIncludeContents = {
    sections: PrintSections;
    commentAuthors: string[];
}

type PrintOptions = {
    export: boolean;
    print: boolean;
}

type ExportApparatus = {
    additionalHeaders: string[];
    data: Record<string, string>[];
}

type Alignment = 'left' | 'center' | 'right' | 'justify' | '';

type DocumentTab = {
    id: number;
    path: string;
    touched: boolean;
    document: DocumentData | null;
    printPreview?: {
        path: string | null;
        isLoaded: boolean;
        error: string | null;
    };
}

type LineNumberSettings = {
    showLines: number;       // 0, 5, 10, 15
    linesNumeration: number; // 1 (intero documento), 2 (ogni pagina), 3 (ogni sezione)
    sectionLevel: number;    // livello di sezione quando linesNumeration è 3
}

type PageNumberSectionSettings = {
    pageNumeration: string;     // "1" (nessuna), "2" (continua), "3" (inizia da)
    startingPointValue: number; // valore iniziale per la numerazione
    numberFormat: string;       // formato del numero
}

type PageNumberSettings = {
    toc: PageNumberSectionSettings;
    intro: PageNumberSectionSettings;
    crt: PageNumberSectionSettings;
    biblio: PageNumberSectionSettings;
}


type HeaderSettings = {
    displayMode: HeaderDisplayMode;
    startFromPage?: number;
    sectionsToShow?: number[];
    leftContent: HeaderContentType;
    centerContent: HeaderContentType;
    rightContent: HeaderContentType;
}

type FooterSettings = {
    displayMode: HeaderDisplayMode;
    startFromPage?: number;
    sectionsToShow?: number[];
    leftContent: HeaderContentType;
    centerContent: HeaderContentType;
    rightContent: HeaderContentType;
}

type Paratextual = {
    tocSettings: TocSettings;
    lineNumberSettings: LineNumberSettings;
    pageNumberSettings: PageNumberSettings;
    headerSettings: HeaderSettings;
    footerSettings: FooterSettings;
}

interface PageSetupInterface {
    layoutTemplate: SetupDialogStateType,
    pageSetup: SetupOptionType,
    sort: SetupDialogStateKeys[],
    styles: Style[],
    templateName?: string
}


type SetupDialogStateType = {
    [key in SetupDialogStateKeys]: {
        visible: boolean,
        required: boolean,
        layout: LayoutType,
        apparatusDetails: TElement[]
    }
}

type LayoutTemplateToc = {
    visible: boolean;
    required: boolean;
    layout: string;
    apparatusDetails: Array<{
        id: string;
        title: string;
        sectionType: string;
        type: string;
        columns: number;
        disabled: boolean;
        visible: boolean;
    }>;
}

type ApparatusLayout = {
    id: string;
    title: string;
    sectionType: string;
    type: string;
    columns: number;
    disabled: boolean;
    visible: boolean;
}

type Layout = {
    toc: LayoutItem;
    intro: LayoutItem;
    critical: LayoutItem;
    bibliography: LayoutItem;
};

type LayoutItem = {
    visible: boolean;
    required: boolean;
    layout: string;
    apparatusDetails: ApparatusLayout[];
}

type PageSetup = {
    pageSetup: PageSetupData;
    sort: SortData;
    layoutTemplate: LayoutTemplateData;
}

type SetupOptionType = {
    template_type: 'Community' | 'Personal',
    paperSize_name: PaperSizeName,
    paperSize_width: number,
    paperSize_height: number,
    paperSize_orientation: 'horizontal' | 'vertical',
    header_show: boolean,
    header_weight: number,
    footer_show: boolean,
    footer_weight: number,
    margin_top: number,
    margin_bottom: number,
    margin_left: number,
    margin_right: number,
    innerMarginNote_show: boolean,
    innerMarginNote_weight: number,
    outerMarginNote_show: boolean,
    outerMarginNote_weight: number,
}

type SetupDialogStateKeys = 'toc' | 'intro' | 'critical' | 'bibliography'

type StandardPageDimension = {
    name: PaperSizeName,
    width: number,
    height: number,
}

type PaperSizeName = `A${3 | 4 | 5 | 6}` | 'custom'

type KeyboardShortcut = {
    menuItemId: string;
    label?: string;
    shortcut: string;
    description: string;
    category: string;
    firstParentLabel: string;
    secondParentLabel: string;
    isCustom: boolean;
    locked: boolean;
}

type KeyboardShortcutCategory = {
    name: string;
    label: string;
    commands: KeyboardShortcut[];
}

/**
 * ACCOUNT TYPES
 */

// GENERICS
type Result<T, E> =
    | { success: true; data: T }
    | { success: false; error: E };

// COMMON TYPES

type AuthenticationError = {
    type: "UNAUTHENTICATED"
}
type CurrentUserError = {
    type: "CURRENT_USER_NOT_FOUND"
}
type NetworkError = {
    type: "NO_INTERNET_CONNECTION";
}

type User = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    institution: string;
    keywords: string[];
}

type Page = {
    size: 20,
    number: 0,
    totalElements: 1,
    totalPages: 1,
};

type UserData = {
    userId: string;
    userEmail: string;
    userName: string;
    userSurname: string;
    userInstitution: string;
    userKeywords: string[];
    status: string;
    creationDate: string;
    lastUpdateDate: string;
    lastAccessDate: string;
    policyAcceptedDate: string;
}

type Invitation = {
    inviteId: string;
    docOwnerUserId: string;
    documentId: string;
    invitedUserId: string;
    invitationDate: string;
    invitationAcceptanceDate: string;
    invitationDeclinedDate: string;
    invitationRevokeDate: string;
    invitationStatus: InvitationStatus;
    message: string;
    creationDate: string;
    lastUpdateDate: string;
    invitationExpirationDate: string;
    downloadDate: string | null;
    alreadyDownloaded: boolean;
    userDocumentOwner: UserData;
    documentDto: SharedDocument;
}

type InvitationStatus = "Pending" | "Accepted" | "Declined" | "Revoked" | "Expired";

type SharedDocument = {
    documentId: string;
    status: string;
    locked: boolean;
    blocked: boolean;
    documentUrl: string;
    fileName: string | null;
    userId: string;
    creationDate: string;
    lastUpdateDate: string | null;
    notes?: string;
    inviteDocumentResponseDTOS?: SharedDocumentInvitedUser[];
}

type InvitedUser = {
    userId: string;
    userEmail: string
    userName: string
    userSurname: string
    userInstitution: string
    userKeywords: string[]
    status: string
    creationDate: string
    lastUpdateDate: string
    lastAccessDate: string
    policyAcceptedDate: string
}

type SharedDocumentInvitedUser = {
    inviteId: string;
    docOwnerUserId: string;
    documentId: string;
    invitedUserId: string;
    invitationDate: string;
    invitationAcceptanceDate: string;
    invitationDeclinedDate: string;
    invitationRevokeDate: string;
    invitationStatus: InvitationStatus;
    message: string;
    creationDate: string;
    lastUpdateDate: string;
    invitationExpirationDate: string;
    invitedUserDto: InvitedUser;
    downloadDate: string | null;
    alreadyDownloaded: boolean
}

// GET CURRENT USER
type UserSuccess = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    institution: string;
    keywords: string[];
}
type UserError = {
    type:
    | AuthenticationError['type']
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_INPUT_DATA"
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "USER_UNVERIFIED";
}

// LOGIN
type LoginDataInput = {
    email: string
    password: string
}
type LoginSuccess = {
    userId: string;
    userEmail: string;
    userName: string;
    userSurname: string;
    userInstitution: string;
    userKeywords: string[];
    status: 'Active' | 'Reset' | 'Inactive';
    creationDate: string;
    lastUpdateDate: string;
    lastAccessDate: string;
    policyAcceptedDate: string;
}
type LoginError = {
    type:
    | "UNKNOWN_ERROR"
    | "INVALID_INPUT_DATA"
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "MAX_ATTEMPTS_REACHED"
    | "USER_UNVERIFIED";
};

// REGISTRATION
type RegisterDataInput = {
    userName: string;
    userSurname: string;
    userInstitution?: string;
    userKeywords?: string[];
    userEmail: string;
    password: string;
    confirmPassword: string;
    policyAccepted: boolean;
    passwordMatching?: boolean;
}
type RegistrationSuccess = {
    userId: string;
    userEmail: string;
    userName: string;
    userSurname: string;
    userInstitution: string;
    userKeywords: string[];
    status: 'Active' | 'Reset' | 'Inactive';
    creationDate: string;
    lastUpdateDate: string;
    lastAccessDate: string;
    policyAcceptedDate: string;
}
type RegistrationError = {
    type: "UNKNOWN_ERROR" | "INVALID_INPUT_DATA" | "EMAIL_NOT_VERIFIED" | "EMAIL_ALREADY_EXISTS"
}

// VERIFY USER
type VerifyUserDataInput = {
    userEmail: string;
    code: string;
}
type VerifyUserSuccess = {
    message: string;
    success: boolean;
    messageTimestamp: string;
}
type VerifyUserError = {
    type: "UNKNOWN_ERROR" | "INVALID_EMAIL_OR_USER_NOT_FOUND" | "USER_NOT_FOUND" | "INVALID_CODE"
}

type SendVerificationCodeDataInput = {
    userEmail: string;
}
type SendVerificationCodeSuccess = {
    message: string;
    success: boolean;
    messageTimestamp: string;
}
type SendVerificationCodeError = {
    type: "UNKNOWN_ERROR" | "INVALID_EMAIL_FORMAT" | "USER_NOT_FOUND_OR_VERIFIED"
}

// REQUEST RESET PASSWORD
type RequestResetPasswordDataInput = {
    userEmail: string
}
type RequestResetPasswordSuccess = {
    message: string;
    success: boolean;
    messageTimestamp: string;
}
type RequestResetPasswordError = {
    type: "UNKNOWN_ERROR" | "INVALID_EMAIL" | "USER_NOT_FOUND" | "MAXIMUM_REQUESTS_REACHED"
}

// CHANGE PASSWORD
type ChangePasswordDataInput = {
    oldPassword: string;
    newPassword: string;
}
type ChangePasswordSuccess = {
    message: string;
    success: boolean;
    messageTimestamp: string;
}
type ChangePasswordError = {
    type: "UNKNOWN_ERROR" | "INVALID_INPUT_DATA" | "UNAUTHORIZED" | "USER_NOT_FOUND" | "MAXIMUM_REQUESTS_REACHED"
}

// RESET PASSWORD
type ResetPasswordDataInput = {
    email: string
    resetCode: string
    newPassword: string
}
type ResetPasswordSuccess = {
    data: boolean
}
type ResetPasswordError = {
    type: "UNKNOWN_ERROR" | "INVALID_INPUT_DATA" | "EXPIRED_RESET_CODE" | "USER_NOT_FOUND" | "INVALID_OPERATION"
}

// UPDATE USER
type UpdateUserDataInput = {
    userName: string;
    userSurname: string;
    userInstitution?: string;
    userKeywords?: string[];
}
type UpdateUserSuccess = {
    userId: string,
    userEmail: string,
    userName: string,
    userSurname: string,
    userInstitution: string,
    userKeywords: string[],
    status: string,
    creationDate: string,
    lastUpdateDate: string,
    lastAccessDate: string,
    policyAcceptedDate: string
}
type UpdateUserError = {
    type: "UNKNOWN_ERROR" | "INVALID_INPUT_DATA" | "UNAUTHORIZED" | "USER_NOT_FOUND";
}

// SEARCH USER
type SearchUserDataInput = {
    textToSearch: string;
    fields: string[];
    documentId: string;
}
type SearchUserSuccess = {
    userId?: string;
    userEmail?: string;
    userName?: string;
    userSurname?: string;
    userInstitution?: string;
    userKeywords?: string[];
    status?: 'Active' | 'Reset' | 'Inactive';
    creationDate?: string;
    lastUpdateDate?: string;
    lastAccessDate?: string;
    policyAcceptedDate?: string;
}
type SearchUserError = {
    type: "UNKNOWN_ERROR" | "INVALID_SEARCH_PARAMS" | "UNAUTHORIZED"
}

// USER
type GetUserByIdSuccess = {
    data: User
}
type GetUserByIdFailure = {
    type: "ERROR_GET_USER_BY_ID"
}
type GetUserByEmailSuccess = {
    data: User
}
type GetUserByEmailFailure = {
    type: "ERROR_GET_USER_BY_EMAIL"
}

type DeleteCurrentUserSuccess = {
    data: boolean
}
type DeleteCurrentUserError = {
    type:
    | AuthenticationError['type']
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "INVALID_OPERATION";
}

// INVITE USERS

type SendInvitesDataInput = {
    documentId: string
    invitedUsersIds: string[];
    message: string;
}
type SendInvitesSuccess = {
    message: string;
    success: boolean;
    messageTimestamp: string;
}
type SendInvitesError = {
    type:
    | AuthenticationError['type']
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_INPUT_DATA"
    | "UNAUTHORIZED"
    | "NO_PERMISSION"
    | "USER_OR_DOCUMENT_NOT_FOUND"
    | "INTERNAL_SERVER_ERROR";
}

// Upload Document and Send Invitations
type UploadDocumentAndSendInvitesInput = {
    filepath: string,
    documentId: string
    invitedUsersIds: string[];
    message: string;
}
type UploadDocumentAndSendInvitesSuccess = SendInvitesSuccess
type UploadDocumentAndSendInvitesError = {
    type:
    | UploadDocumentIfNotExistsError['type']
    | SendInvitesError['type']
}

// Get Invitations

type GetInvitationsSuccess = {
    content: Invitation[],
    page: Page
}
type GetInvitationsError = {
    type:
    | AuthenticationError['type']
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "UNAUTHORIZED"
    | "USER_OR_DOCUMENT_NOT_FOUND"
    | "INTERNAL_SERVER_ERROR";
}

// Resend invitation
type ResendInvitationWithIdSuccess = {
    creationDate: string;
    docOwnerUserId: string;
    documentId: string;
    invitationAcceptanceDate: string;
    invitationDate: string;
    invitationDeclinedDate: string;
    invitationExpirationDate: string;
    invitationRevokeDate: string;
    invitationStatus: InvitationStatus;
    inviteId: string;
    invitedUserId: string;
    lastUpdateDate: string;
    message: string;
}
type ResendInvitationWithIdError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_STATUS_RESEND"
    | "UNAUTHORIZED"
    | "INVITE_NOT_FOUND"
    | "INTERNAL_SERVER_ERROR";
}

// Revoke invitation
type RevokeInvitationWithIdSuccess = {
    creationDate: string;
    docOwnerUserId: string;
    documentId: string;
    invitationAcceptanceDate: string;
    invitationDate: string;
    invitationDeclinedDate: string;
    invitationExpirationDate: string;
    invitationRevokeDate: string;
    invitationStatus: InvitationStatus;
    inviteId: string;
    invitedUserId: string;
    lastUpdateDate: string;
    message: string;
}
type RevokeInvitationWithIdError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_STATUS_REVOKE"
    | "UNAUTHORIZED"
    | "INVITE_NOT_FOUND"
    | "INTERNAL_SERVER_ERROR";
}

// Accept invitation
type AcceptInvitationWithIdSuccess = {
    creationDate: string;
    docOwnerUserId: string;
    documentId: string;
    invitationAcceptanceDate: string;
    invitationDate: string;
    invitationDeclinedDate: string;
    invitationExpirationDate: string;
    invitationRevokeDate: string;
    invitationStatus: InvitationStatus;
    inviteId: string;
    invitedUserId: string;
    lastUpdateDate: string;
    message: string;
}
type AcceptInvitationWithIdError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_STATUS_REVOKE"
    | "UNAUTHORIZED"
    | "INVITE_NOT_FOUND"
    | "INTERNAL_SERVER_ERROR";
}

// Decline invitation
type DeclineInvitationWithIdSuccess = {
    creationDate: string;
    docOwnerUserId: string;
    documentId: string;
    invitationAcceptanceDate: string;
    invitationDate: string;
    invitationDeclinedDate: string;
    invitationExpirationDate: string;
    invitationRevokeDate: string;
    invitationStatus: InvitationStatus;
    inviteId: string;
    invitedUserId: string;
    lastUpdateDate: string;
    message: string;
}
type DeclineInvitationWithIdError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_STATUS_REVOKE"
    | "UNAUTHORIZED"
    | "INVITE_NOT_FOUND"
    | "INTERNAL_SERVER_ERROR";
}

// DOCUMENT SHARING 

// Upload Document
type UploadDocumentSuccess = SharedDocument
type UploadDocumentError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_INPUT_DATA"
    | "UNAUTHORIZED"
    | "USER_NOT_FOUND"
    | "ERROR_UPLOADING_DOCUMENT";
}

type DownloadDocumentSuccess = DocumentData
type DownloadDocumentError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "UNAUTHORIZED"
    | "DOCUMENT_NOT_FOUND"
    | "ERROR_DOWNLOADING_DOCUMENT";
}

// Get Shared Document
type GetSharedDocumentSuccess = SharedDocument
type GetSharedDocumentError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_DOCUMENT_ID"
    | "UNAUTHORIZED"
    | "DOCUMENT_NOT_FOUND";
}

// Get My Documents
type GetMyDocumentsSuccess = {
    content: SharedDocument[],
    page: Page
}
type GetMyDocumentsError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "INVALID_PAGINATION_PARAMS"
    | "UNAUTHORIZED"
    | "NO_DOCUMENT_FOUND"
    | "ERROR_RETRIEVING_DOCUMENT"
}

// Delete Document With Id 
type DeleteDocumentWithIdSuccess = {
    documentId: string
    status: string
    locked: boolean
    blocked: boolean
    documentUrl: string
    fileName: string
    userId: string
    creationDate: string
    lastUpdateDate: string
}
type DeleteDocumentWithIdError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | "UNKNOWN_ERROR"
    | "MISSING_REQUIRED_PARAMS"
    | "UNAUTHORIZED"
    | "DOCUMENT_NOT_FOUND"
    | "ERROR_DELETION_DOCUMENT";
}

// Upload Document If Not Exists
type UploadDocumentIfNotExistsSuccess = SharedDocument
type UploadDocumentIfNotExistsError = {
    type:
    | GetSharedDocumentError['type']
    | UploadDocumentError['type']
}

// SHARED DOCUMENTS

// NOTIFICATIONS

type NotificationPage = {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

type NotificationResponse = {
    content: NotificationItem[];
    page: NotificationPage;
}

type NotificationItem = {
    notificationId: string;
    notificationOwnerId: string;
    documentOwnerId: string;
    documentId: string;
    recipientUserId: string;
    notificationEventId: number;
    notificationTitle: string;
    ownerMessage: string | null;
    recipientMessage: string;
    viewedDate: string | null;
    creationDate: string;
    emailSend: boolean;
    ownerName: string;
    ownerSurname: string;
    recipientName: string;
    recipientSurname: string;
    documentFile: string;
    senderRole: string;
}

type NotificationType =
    | "send_invitation"
    | "resend_invitation"
    | "revoke_access"
    | "share_new_version"
    | "delete_document"
    | "accept_invitation"
    | "decline_invitation"
    | "download"
    | "download_new_version"
    | "invitation_expired"
    | "password_changed"
    | "account_deleted";

type NotificationTimeFilter =
    | "all"
    | "today"
    | "yesterday"
    | "last_7_days"
    | "last_30_days";

type GetNotificationsError = {
    type: 'INVALID_USER_ID' | 'UNAUTHORIZED' | 'USER_NOT_FOUND' | 'UNKNOWN_ERROR' | 'UNAUTHENTICATED';
}

type MarkAsViewedError = {
    type: 'INVALID_NOTIFICATION_ID' | 'UNAUTHORIZED' | 'NOTIFICATION_NOT_FOUND' | 'UNKNOWN_ERROR' | 'UNAUTHENTICATED';
}

// ==================== CHAT TYPES ====================

type ChatState =
    | "ACTIVE"
    | "DEACTIVATING"
    | "INACTIVE"

type ChatMessage = {
    chatId: string
    documentId: string
    senderUserId: string | "CURRENT_USER"
    senderDisplayName: string
    senderInitials: string
    text: string
    documentText: string | null
    timestamp: string
    formattedTime: string
    eventType: "MESSAGE_SENT" | "MESSAGE_DELETED"
}

type ChatParticipant = UserData

type ChatUserAccess = {
    canAccess: boolean
    userId: string
    displayName: string
    initials: string
    reason: string
}

// GET CHAT USER ACCESS
type GetChatDocumentAccessSuccess = ChatUserAccess;
type GetChatDocumentAccessError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | 'UNKNOWN_ERROR';
}

// GET CHAT HISTORY
type GetChatHistorySuccess = {
    content: ChatMessage[],
    page: Page
};
type GetChatHistoryError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | 'UNKNOWN_ERROR';
}

// GET CHAT PARTICIPANTS
type GetChatParticipantsSuccess = ChatParticipant[];
type GetChatParticipantsError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | 'UNKNOWN_ERROR';
}

type ConnectChatSuccess = boolean;
type ConnectChatError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | 'STOMP_ERROR'
    | 'WEBSOCKET_ERROR'
    | 'UNKNOWN_ERROR';
}

type SubscribeChatChannelSuccess = boolean;
type SubscribeChatChannelError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | 'UNCONNECTED_WEBSOCKET';
}

type UnsubscribeChatChannelSuccess = boolean;
type UnsubscribeChatChannelError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | 'UNCONNECTED_WEBSOCKET';
}

type SendMessageChatSuccess = ChatMessage;
type SendMessageChatError = {
    type:
    | AuthenticationError["type"]
    | CurrentUserError['type']
    | 'UNCONNECTED_WEBSOCKET';
}
