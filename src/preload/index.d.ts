import { ElectronAPI } from '@electron-toolkit/preload'
import { JSONContent } from '@tiptap/core'

declare global {
  interface Window {
    electron: ElectronAPI
    tabs: ITabsAPI
    menu: IMenuAPI
    system: ISystemAPI,
    application: IApplicationAPI,
    doc: IDocumentAPI,
    theme: IThemeAPI,
    preferences: IPreferencesAPI,
    tooltip: ITooltipAPI,
    keyboardShortcuts: IKeyboardShortcutsAPI,
    user: IUserAPI,
    invite: IInviteAPI,
    shareDocument: IShareDocumentAPI,
    notifications: INotificationAPI,
    chat: IChatAPI,
  }
}

interface ITabsAPI {
  new: (fileType: FileType) => Promise<number | null>
  close: (id: number) => Promise<void>
  select: (id: number, tabType: TabType) => Promise<void>
  reorder: (tabIds: number[]) => Promise<void>
  getAllContentViewsIds: () => Promise<number[]>
  getSelectedTabId: () => Promise<number>
  getCurrenTab: () => Promise<DocumentTab>
  getCurrenTabFileName: () => Promise<string | null>
  getCurrenTabFilePath: () => Promise<string | null>
}

interface IMenuAPI {
  disableReferencesMenuItems: (items: string[]) => Promise<void>
  updateViewApparatusesMenuItems: (items: Apparatus[]) => Promise<void>
  setTocVisibility: (visibility: boolean) => Promise<void>
  setLineNumberShowLines: (lineNumber: number) => Promise<void>
  setPrintPreviewVisibility: (visibility: boolean) => Promise<void>
  setTocMenuItemsEnabled: (isEnable: boolean) => Promise<void>
  setTocSettingsEnabled: (isEnable: boolean) => Promise<void>
  setMenuFeatureEnabled: (isEnable: boolean) => Promise<void>
  setAddCommentMenuItemEnabled: (isEnable: boolean) => Promise<void>
  setAddBookmarkMenuItemEnabled: (isEnable: boolean) => Promise<void>
  setLinkMenuItemEnabled: (isEnable: boolean) => Promise<void>
  setCurrentSection: (section: string) => Promise<void>
  setRemoveLinkMenuItemEnabled: (isEnable: boolean) => Promise<void>
  setAddCitationMenuItemEnabled: (isEnable: boolean) => Promise<void>
  setSymbolMenuItemEnabled: (isEnable: boolean) => Promise<void>
  setAddNoteMenuItemEnabled: (isEnable: boolean) => Promise<void>
  setAddReadingsEnabled: (isEnable: boolean) => Promise<void>
  setReferencesMenuCurrentContext: (context: "maintext_editor" | "apparatus_editor") => Promise<void>
  setSiglumMenuItemEnabled: (isEnable: boolean) => Promise<void>
}

interface IDocumentAPI {
  downloadDocument: (filename: string, document: DocumentData) => Promise<boolean>
  uploadDocument: (documentId: string) => Promise<Result<UploadDocumentSuccess, UploadDocumentError>>
  getDocument: () => Promise<DocumentData>
  openDocument: () => Promise<void>
  openDocumentAtPath: (filePath: string) => Promise<void>
  saveDocument: () => Promise<boolean>
  getMainText: () => Promise<JSONContent | null>
  getAnnotations: () => Promise<Annotations>
  setComments: (comments: AppComment[] | null) => Promise<void>
  setCommentCategories: (commentCategories: CommentCategory[] | null) => Promise<void>
  setBookmarks: (bookmarks: Bookmark[] | null) => Promise<void>
  setBookmarkCategories: (bookmarkCategories: BookmarkCategory[] | null) => Promise<void>
  getTemplate: () => Promise<Template>
  getFileAsDataUrl: (filePath: string) => Promise<string>
  getTemplates: () => Promise<{ filename: string; template: Template; }[]>
  importTemplate: () => Promise<void>
  createTemplate: (name: string) => Promise<void>
  setTemplate: (template: Template) => Promise<void>
  setApparatuses: (apparatuses: DocumentApparatus[]) => Promise<void>
  getApparatuses: () => Promise<DocumentApparatus[]>
  getApparatusWithId: (id: string) => Promise<DocumentApparatus | undefined>
  hideApparatus: (id: string) => Promise<void>
  removeApparatusWithId: (id: string) => Promise<void>
  updateApparatusType: (id: string, type: ApparatusType) => Promise<void>
  updateApparatusTitle: (id: string, title: string) => Promise<void>
  updateApparatusExpanded: (id: string, expanded: boolean) => Promise<void>
  addApparatusTypeAtIndex: (type: ApparatusType, index: number) => Promise<DocumentApparatus | undefined>
  reorderApparatusesByIds: (apparatusesIds: string[]) => Promise<DocumentApparatus[]>
  updateApparatusIdWithContent: (id: string, content: JSONContent, shouldMarkAsTouched?: boolean) => Promise<void>
  toggleApparatusNoteVisibility: (id: string) => Promise<DocumentApparatus | undefined>
  toggleApparatusCommentVisibility: (id: string) => Promise<DocumentApparatus | undefined>
  setMainText: (setMainText: JSONContent | null, shouldMarkAsTouched?: boolean) => Promise<void>
  setParatextual: (paratextual: unknown) => Promise<void>
  getPageNumberSettings: () => Promise<PageNumberSettings>
  setPageNumberSettings: (pageNumberSettings: PageNumberSettings | null) => Promise<void>
  getLineNumberSettings: () => Promise<LineNumberSettings>
  setLineNumberSettings: (lineNumberSettings: LineNumberSettings | null) => Promise<void>
  getTocSettings: () => Promise<TocSettings>
  setTocSettings: (tocSettings: TocSettings | null) => Promise<void>
  getPageSetup: () => Promise<SetupOptionType>
  setPageSetup: (pageSetup: SetupOptionType | null) => Promise<void>
  getHeaderSettings: () => Promise<HeaderSettings>
  setHeaderSettings: (headerSettings: HeaderSettings | null) => Promise<void>
  getFooterSettings: () => Promise<FooterSettings>
  setFooterSettings: (footerSettings: FooterSettings | null) => Promise<void>
  setLayout: (layout: Layout) => Promise<void>
  getLayout: () => Promise<Layout>
  getSort: () => Promise<string[]>
  setSort: (sort: string[]) => Promise<void>
  setStyles: (style: object[]) => Promise<void>
  getStyles: () => Promise<Style[]>
  getStylesFileNames: () => Promise<string[]>
  getStylesFromFile: (filename: string) => Promise<Style[] | null>
  exportStyles: (styles: Style[]) => Promise<void>
  importStyles: () => Promise<string | null>
  exportSigla: (sigla: DocumentSiglum[]) => Promise<void>
  importSigla: () => Promise<DocumentSiglum[]>
  setSiglumList: (siglumList: DocumentSiglum[] | null) => Promise<void>
  getSiglumList: () => Promise<DocumentSiglum[]>
  setReferencesFormat: (referencesFormat: ReferencesFormat | null) => Promise<void>
  getReferencesFormat: () => Promise<ReferencesFormat>
  setMetadata: (metadata: Metadata | null) => Promise<void>
  getMetadata: () => Promise<Metadata>
  setBibliographies: (bibliographyList: Bibliography[] | null) => Promise<void>
  getBibliographies: () => Promise<Bibliography[]>
  importBibliography: () => Promise<Bibliography>
  print: (includeContent: PrintIncludeContents, printOptions: PrintOptions) => Promise<void>
  exportToTei: () => Promise<void>
  openFind: () => Promise<void>
  findNext: () => Promise<void>
  findPrevious: () => Promise<void>
  setSearchCriteria: (options: SearchCriteria) => Promise<void>
  setDisableReplaceAction: (isDisable: boolean) => Promise<void>
  replace: (replacement: string) => Promise<void>
  replaceAll: (replacement: string) => Promise<void>
  sendCurrentSearchIndex: (searchIndex: number) => Promise<void>
  sendTotalSearchResults: (totalSearchResults: number) => Promise<void>
  sendSearchHistory: (searchHistory: string[]) => Promise<void>
  sendReplaceHistory: (replaceHistory: string[]) => Promise<void>
  resetSearchCriteria: () => Promise<void>
  setReplaceInProgress: (isInProgress: boolean) => Promise<void>
  exportExcel: (data: Blob, fileName: string) => Promise<void>
  savePdf: (includeSections: PrintSections) => Promise<void>
  getPrintPreview: () => Promise<{ path: string | null; isLoaded: boolean; error: string | null }>
}

interface ISystemAPI {
  selectFolder: () => Promise<string>
  saveFile: (filepath: string, content: Record<string, unknown>) => Promise<string>
  getUserInfo: () => Promise<void>
  getFonts: () => Promise<string[]>
  getSubsets: () => Promise<Subset[]>
  getSymbols: (fontName: string) => Promise<CharacterSet>
  getConfiguredSpcialCharactersList: () => Promise<CharacterConfiguration[]>
  showMessageBox: (title: string, message: string, buttons: string[], type?: string) => Promise<Electron.MessageBoxReturnValue>
  findWorker: (payload: WorkerRequest) => Promise<WorkerMatch[]>
  log: (entry: LogEntry) => Promise<void>
}

interface IApplicationAPI {
  toolbarIsVisible: () => Promise<boolean>
  readToolbarAdditionalItems: () => Promise<string[]>
  storeToolbarAdditionalItems: (items: string[]) => Promise<void>
  readStatusBarConfig: () => Promise<string[]>
  storeStatusBarConfig: (statusBarConfig: string[]) => Promise<void>
  readZoom: () => Promise<string>
  storeZoom: (zoom: string) => Promise<void>
  closeChildWindow: () => Promise<void>
  getStatusBarVisibility: () => Promise<boolean>
  openPreferencesWindow: (options?: { account?: boolean }) => Promise<void>
}

interface IThemeAPI {
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>
  getTheme: () => Promise<'light' | 'dark' | 'system'>
}

interface IPreferencesAPI {
  getPreferences: () => Promise<Preferences>
  savePreferences: (preferences: Preferences) => Promise<void>
  getPageSetup: () => Promise<PageSetup>
  savePageSetup: (pageSetup: PageSetup) => Promise<void>
}

interface ITooltipAPI {
  show: (x: number, y: number, text: string) => Promise<void>
  hide: () => Promise<void>
  setText: (text: string) => Promise<void>
}

interface IKeyboardShortcutsAPI {
  getShortcuts: () => Promise<KeyboardShortcutCategory[]>
  setShortcut: (menuItemId: string, shortcut: string) => Promise<{
    success: boolean;
    conflict?: string;
    isReserved?: boolean;
    reservedReason?: 'devtools' | 'os' | 'macOptionSpecialChar';
  }>
  removeShortcut: (menuItemId: string) => Promise<void>
  resetAll: () => Promise<void>
}

interface IUserAPI {
  login: (data: LoginDataInput) => Promise<Result<LoginSuccess, LoginError>>
  loggedIn: () => Promise<boolean>
  logout: () => Promise<boolean>
  currentUser: () => Promise<User>
  getCurrentUser: () => Promise<Result<UserSuccess, UserError>>
  deleteCurrentUser: (password: string) => Promise<Result<DeleteCurrentUserSuccess, DeleteCurrentUserError>>
  register: (data: RegisterDataInput) => Promise<Result<RegistrationSuccess, RegistrationError>>
  sendVerificationCode: (data: SendVerificationCodeDataInput) => Promise<Result<SendVerificationCodeSuccess, SendVerificationCodeError>>
  verifyUser: (data: VerifyUserDataInput) => Promise<Result<VerifyUserSuccess, VerifyUserError>>
  requestResetPassword: (data: RequestResetPasswordDataInput) => Promise<Result<RequestResetPasswordSuccess, RequestResetPasswordError>>
  resetPassword: (data: ResetPasswordDataInput) => Promise<Result<ResetPasswordSuccess, ResetPasswordError>>
  changePassword: (data: ChangePasswordDataInput) => Promise<Result<ChangePasswordSuccess, ChangePasswordError>>
  updateUser: (data: UpdateUserDataInput) => Promise<Result<UpdateUserSuccess, UpdateUserError>>
  searchUsers: (data: SearchUserDataInput) => Promise<Result<SearchUserSuccess[], SearchUserError>>
}

interface IInviteAPI {
  sendInvites: (data: SendInvitesDataInput) =>
    Promise<Result<SendInvitesSuccess, SendInvitesError>>
  uploadDocumentAndSendInvites:
  (data: UploadDocumentAndSendInvitesInput) =>
    Promise<Result<UploadDocumentAndSendInvitesSuccess, UploadDocumentAndSendInvitesError>>
  getInvitations: () =>
    Promise<Result<GetInvitationsSuccess, GetInvitationsError>>
  resendInvitationWithId: (invitationId: string) =>
    Promise<Result<ResendInvitationWithIdSuccess, ResendInvitationWithIdError>>
  revokeInvitationWithId: (invitationId: string) =>
    Promise<Result<RevokeInvitationWithIdSuccess, RevokeInvitationWithIdError>>
  acceptInvitationWithId: (invitationId: string) =>
    Promise<Result<AcceptInvitationWithIdSuccess, AcceptInvitationWithIdError>>
  declineInvitationWithId: (invitationId: string) =>
    Promise<Result<DeclineInvitationWithIdSuccess, DeclineInvitationWithIdError>>
}

interface IShareDocumentAPI {
  uploadDocument: (filepath: string, documentId: string) =>
    Promise<Result<UploadDocumentSuccess, UploadDocumentError>>
  downloadDocument: (documentId: string) =>
    Promise<Result<DownloadDocumentSuccess, DownloadDocumentError>>
  getDocumentWithId: (documentId: string) =>
    Promise<Result<GetSharedDocumentSuccess, GetSharedDocumentError>>
  deleteDocumentWithId: (documentId: string) =>
    Promise<Result<DeleteDocumentWithIdSuccess, DeleteDocumentWithIdError>>
  uploadDocumentIfNotExists:
  (filepath: string, documentId: string) =>
    Promise<Result<UploadDocumentIfNotExistsSuccess, UploadDocumentIfNotExistsError>>
  getMyDocuments: () =>
    Promise<Result<GetMyDocumentsSuccess, GetMyDocumentsError>>
}

interface INotificationAPI {
  getNotifications: (page?: number) => Promise<NotificationResponse>
  markAsViewed: (notificationId: string) => Promise<NotificationItem>
  markAllAsViewed: (notificationIds: string[]) => Promise<NotificationItem[]>
}

interface IChatAPI {
  getDocumentAccess: (documentId: string) =>
    Promise<Result<GetChatDocumentAccessSuccess, GetChatDocumentAccessError>>
  getHistory: (documentId: string, page: number, size: number) =>
    Promise<Result<GetChatHistorySuccess, GetChatHistoryError>>
  getPartecipants: (documentId: string) =>
    Promise<Result<GetChatParticipantsSuccess, GetChatParticipantsError>>

  connect: () => Promise<Result<ConnectChatSuccess, ConnectChatError>>
  disconnect: () => Promise<void>
  subscribe: (documentId: string) => Promise<Result<SubscribeChatChannelSuccess, SubscribeChatChannelError>>
  unsubscribe: (documentId: string) => Promise<Result<UnsubscribeChatChannelSuccess, UnsubscribeChatChannelError>>
  sendMessage: (documentId: string, message: string, reference: string | null) => Promise<Result<SendMessageChatSuccess, SendMessageChatError>>
  connected: () => Promise<boolean>

  onConnecting: (callback: () => void) => () => void
  onConnected: (callback: () => void) => () => void
  onDisconnected: (callback: () => void) => () => void
  onError: (callback: (error: string) => void) => () => void
  onMessage: (callback: (message: ChatMessage) => void) => () => void
  onChangeState: (callback: (state: ChatState) => void) => () => void
}
