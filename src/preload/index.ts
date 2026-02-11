import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IApplicationAPI, IDocumentAPI, IMenuAPI, IPreferencesAPI, ISystemAPI, IThemeAPI, ITooltipAPI, IKeyboardShortcutsAPI, IUserAPI, IInviteAPI, ITabsAPI, IShareDocumentAPI, INotificationAPI, IChatAPI } from './index.d'
import { JSONContent } from '@tiptap/core'
import { ActivationState } from '@stomp/stompjs'

const tabsAPI = {
    new: (fileType: FileType): Promise<number | null> => ipcRenderer.invoke('tabs:new', fileType),
    close: (id: number): Promise<void> => ipcRenderer.invoke('tabs:close', id),
    select: (id: number, fileType: TabType): Promise<void> => ipcRenderer.invoke('tabs:select', id, fileType),
    reorder: (tabIds: number[]): Promise<void> => ipcRenderer.invoke('tabs:reorder', tabIds),
    getAllContentViewsIds: (): Promise<number[]> => ipcRenderer.invoke('tabs:getAllContentViewsIds'),
    getSelectedTabId: (): Promise<number> => ipcRenderer.invoke('tabs:getSelectedTabId'),
    getCurrenTab: (): Promise<DocumentTab> => ipcRenderer.invoke('tabs:getCurrenTab'),
    getCurrenTabFileName: (): Promise<string | null> => ipcRenderer.invoke('tabs:getCurrenTabFileName'),
    getCurrenTabFilePath: (): Promise<string | null> => ipcRenderer.invoke('tabs:getCurrenTabFilePath'),
} satisfies ITabsAPI

const menuAPI: IMenuAPI = {
    disableReferencesMenuItems: (items: string[]): Promise<void> => ipcRenderer.invoke('menu:disableReferencesMenuItems', items),
    updateViewApparatusesMenuItems: (items: Apparatus[]): Promise<void> => ipcRenderer.invoke('menu:updateViewApparatusesMenuItems', items),
    setTocVisibility: (visibility: boolean): Promise<void> => ipcRenderer.invoke('menu:setTocVisibility', visibility),
    setLineNumberShowLines: (lineNumber: number): Promise<void> => ipcRenderer.invoke('menu:setLineNumberShowLines', lineNumber),
    setPrintPreviewVisibility: (visibility: boolean): Promise<void> => ipcRenderer.invoke('menu:setPrintPreviewVisibility', visibility),
    setTocMenuItemsEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setTocMenuItemsEnabled', isEnable),
    setTocSettingsEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setTocSettingsEnabled', isEnable),
    setMenuFeatureEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setMenuFeatureEnabled', isEnable),
    setAddCommentMenuItemEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setAddCommentMenuItemEnabled', isEnable),
    setAddBookmarkMenuItemEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setAddBookmarkMenuItemEnabled', isEnable),
    setAddNoteMenuItemEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setAddNoteMenuItemEnabled', isEnable),
    setAddReadingsEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setAddReadingsEnabled', isEnable),
    setReferencesMenuCurrentContext: (context: "maintext_editor" | "apparatus_editor"): Promise<void> => ipcRenderer.invoke('menu:setReferencesMenuCurrentContext', context),
    setSiglumMenuItemEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setSiglumMenuItemEnabled', isEnable),
    setLinkMenuItemEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setLinkMenuItemEnabled', isEnable),
    setCurrentSection: (section: string): Promise<void> => ipcRenderer.invoke('menu:setCurrentSection', section),
    setRemoveLinkMenuItemEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setRemoveLinkMenuItemEnabled', isEnable),
    setAddCitationMenuItemEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setAddCitationMenuItemEnabled', isEnable),
    setSymbolMenuItemEnabled: (isEnable: boolean): Promise<void> => ipcRenderer.invoke('menu:setSymbolMenuItemEnabled', isEnable),
}

const systemAPI: ISystemAPI = {
    selectFolder: (): Promise<string> => ipcRenderer.invoke('system:selectFolder'),
    saveFile: (filepath: string, content: Record<string, unknown>): Promise<string> => ipcRenderer.invoke('system:saveFile', filepath, content),
    getUserInfo: (): Promise<void> => ipcRenderer.invoke('system:getUserInfo'),
    getFonts: (): Promise<string[]> => ipcRenderer.invoke('system:getFonts'),
    getSubsets: (): Promise<Subset[]> => ipcRenderer.invoke('system:getSubsets'),
    getSymbols: (fontName: string): Promise<CharacterSet> => ipcRenderer.invoke('system:getSymbols', fontName),
    getConfiguredSpcialCharactersList: (): Promise<CharacterConfiguration[]> => ipcRenderer.invoke('system:getConfiguredSpcialCharactersList'),
    showMessageBox: (title: string, message: string, buttons: string[], type?: string): Promise<Electron.MessageBoxReturnValue> => ipcRenderer.invoke('system:showMessageBox', title, message, buttons, type),
    findWorker: (payload: WorkerRequest): Promise<WorkerMatch[]> => ipcRenderer.invoke('system:worker', payload),
    log: (entry: LogEntry): Promise<void> => ipcRenderer.invoke('system:log', entry),
}

const applicationAPI: IApplicationAPI = {
    getStatusBarVisibility: (): Promise<boolean> => ipcRenderer.invoke('application:getStatusBarVisibility'),
    toolbarIsVisible: (): Promise<boolean> => ipcRenderer.invoke('application:toolbarIsVisible'),
    readToolbarAdditionalItems: (): Promise<string[]> => ipcRenderer.invoke('application:readToolbarAdditionalItems'),
    storeToolbarAdditionalItems: (items: string[]): Promise<void> => ipcRenderer.invoke('application:updateToolbarAdditionalItems', items),
    readStatusBarConfig: (): Promise<string[]> => ipcRenderer.invoke('application:readStatusBarConfig'),
    storeStatusBarConfig: (statusBarConfig: string[]): Promise<void> => ipcRenderer.invoke('application:storeStatusBarConfig', statusBarConfig),
    readZoom: (): Promise<string> => ipcRenderer.invoke('application:readZoom'),
    storeZoom: (zoom: string): Promise<void> => ipcRenderer.invoke('application:storeZoom', zoom),
    closeChildWindow: (): Promise<void> => ipcRenderer.invoke('application:closeChildWindow'),
    openPreferencesWindow: (options?: { account?: boolean }): Promise<void> =>
        ipcRenderer.invoke('application:openPreferencesWindow', options),
}

const debugAPI = {
    getLayoutTabs: (): Promise<Tab[]> => ipcRenderer.invoke('debug:getLayoutTabs'),
    getCurrentTabs: (): Promise<Tab[]> => ipcRenderer.invoke('debug:getCurrentTabs'),
    testTabRestoration: (): Promise<{ success: boolean, count?: number, error?: string }> => ipcRenderer.invoke('debug:testTabRestoration'),
    forceSaveTabs: (): Promise<Tab[]> => ipcRenderer.invoke('debug:forceSaveTabs'),
}

const documentAPI: IDocumentAPI = {
    downloadDocument: (filename: string, document: DocumentData): Promise<boolean> =>
        ipcRenderer.invoke('document:downloadDocument', filename, document),
    uploadDocument: (documentId: string): Promise<Result<UploadDocumentSuccess, UploadDocumentError>> =>
        ipcRenderer.invoke('document:uploadDocument', documentId),
    getDocument: (): Promise<DocumentData> => ipcRenderer.invoke('document:getDocument'),
    openDocument: (): Promise<void> => ipcRenderer.invoke('document:openDocument'),
    openDocumentAtPath: (filePath: string): Promise<void> => ipcRenderer.invoke('document:openDocumentAtPath', filePath),
    saveDocument: (): Promise<boolean> => ipcRenderer.invoke('document:saveDocument'),
    getTemplate: (): Promise<Template> => ipcRenderer.invoke('document:getTemplate'),
    getMainText: (): Promise<JSONContent | null> => ipcRenderer.invoke('document:getMainText'),
    getAnnotations: (): Promise<Annotations> => ipcRenderer.invoke('document:getAnnotations'),
    setComments: (comments: AppComment[] | null): Promise<void> => ipcRenderer.invoke('document:setComments', comments),
    setCommentCategories: (commentCategories: CommentCategory[] | null): Promise<void> => ipcRenderer.invoke('document:setCommentCategories', commentCategories),
    setBookmarks: (bookmarks: Bookmark[] | null): Promise<void> => ipcRenderer.invoke('document:setBookmarks', bookmarks),
    setBookmarkCategories: (bookmarkCategories: BookmarkCategory[] | null): Promise<void> => ipcRenderer.invoke('document:setBookmarkCategories', bookmarkCategories),
    getFileAsDataUrl: (filePath: string): Promise<string> => ipcRenderer.invoke('document:getFileAsDataUrl', filePath),

    getTemplates: (): Promise<{ filename: string; template: Template; }[]> => ipcRenderer.invoke('document:getTemplates'),

    importTemplate: (): Promise<void> => ipcRenderer.invoke('document:importTemplate'),
    createTemplate: (name: string): Promise<void> => ipcRenderer.invoke('document:createTemplate', name),

    setTemplate: (template: Template): Promise<void> => ipcRenderer.invoke('document:setTemplate', template),

    getApparatuses: (): Promise<DocumentApparatus[]> => ipcRenderer.invoke('document:getApparatuses'),
    getApparatusWithId: (id: string): Promise<DocumentApparatus | undefined> => ipcRenderer.invoke('document:getApparatusWithId', id),
    removeApparatusWithId: (id: string): Promise<void> => ipcRenderer.invoke('document:removeApparatusWithId', id),
    hideApparatus: (id: string): Promise<void> => ipcRenderer.invoke('document:hideApparatus', id),
    updateApparatusType: (id: string, type: ApparatusType): Promise<void> => ipcRenderer.invoke('document:updateApparatusType', id, type),
    updateApparatusTitle: (id: string, title: string): Promise<void> => ipcRenderer.invoke('document:updateApparatusTitle', id, title),
    updateApparatusExpanded: (id: string, expanded: boolean): Promise<void> => ipcRenderer.invoke('document:updateApparatusExpanded', id, expanded),
    addApparatusTypeAtIndex: (type: ApparatusType, index: number): Promise<DocumentApparatus | undefined> => ipcRenderer.invoke('document:addApparatusTypeAtIndex', type, index),
    reorderApparatusesByIds: (apparatusesIds: string[]): Promise<DocumentApparatus[]> => ipcRenderer.invoke('document:reorderApparatusesByIds', apparatusesIds),
    updateApparatusIdWithContent: (id: string, content: JSONContent, shouldMarkAsTouched?: boolean): Promise<void> => ipcRenderer.invoke('document:updateApparatusIdWithContent', id, content, shouldMarkAsTouched),
    toggleApparatusNoteVisibility: (id: string): Promise<DocumentApparatus | undefined> => ipcRenderer.invoke('document:toggleApparatusNoteVisibility', id),
    toggleApparatusCommentVisibility: (id: string): Promise<DocumentApparatus | undefined> => ipcRenderer.invoke('document:toggleApparatusCommentVisibility', id),

    setMainText: (setMainText: JSONContent | null, shouldMarkAsTouched?: boolean): Promise<void> => ipcRenderer.invoke('document:setMainText', setMainText, shouldMarkAsTouched),
    setApparatuses: (apparatuses: DocumentApparatus[]): Promise<void> => ipcRenderer.invoke('document:setApparatuses', apparatuses),

    setParatextual: (paratextual: unknown): Promise<void> => ipcRenderer.invoke('document:setParatextual', paratextual),

    getPageNumberSettings: (): Promise<PageNumberSettings> => ipcRenderer.invoke('document:getPageNumberSettings'),
    setPageNumberSettings: (pageNumberSettings: PageNumberSettings | null): Promise<void> => ipcRenderer.invoke('document:setPageNumberSettings', pageNumberSettings),

    getLineNumberSettings: (): Promise<LineNumberSettings> => ipcRenderer.invoke('document:getLineNumberSettings'),
    setLineNumberSettings: (lineNumberSettings: LineNumberSettings | null): Promise<void> => ipcRenderer.invoke('document:setLineNumberSettings', lineNumberSettings),

    getTocSettings: (): Promise<TocSettings> => ipcRenderer.invoke('document:getTocSettings'),
    setTocSettings: (tocSettings: TocSettings | null): Promise<void> => ipcRenderer.invoke('document:setTocSettings', tocSettings),

    getPageSetup: (): Promise<SetupOptionType> => ipcRenderer.invoke('document:getPageSetup'),
    setPageSetup: (pageSetup: SetupOptionType | null): Promise<void> => ipcRenderer.invoke('document:setPageSetup', pageSetup),

    getHeaderSettings: (): Promise<HeaderSettings> => ipcRenderer.invoke('document:getHeaderSettings'),
    setHeaderSettings: (headerSettings: HeaderSettings | null): Promise<void> => ipcRenderer.invoke('document:setHeaderSettings', headerSettings),
    getFooterSettings: (): Promise<FooterSettings> => ipcRenderer.invoke('document:getFooterSettings'),
    setFooterSettings: (footerSettings: FooterSettings | null): Promise<void> => ipcRenderer.invoke('document:setFooterSettings', footerSettings),

    setLayout: (layout: Layout): Promise<void> => ipcRenderer.invoke('document:setLayout', layout),
    getLayout: (): Promise<Layout> => ipcRenderer.invoke('document:getLayout'),
    getSort: (): Promise<string[]> => ipcRenderer.invoke('document:getSort'),
    setSort: (sort: unknown[]): Promise<void> => ipcRenderer.invoke('document:setSort', sort),

    setStyles: (style: object[]): Promise<void> => ipcRenderer.invoke('document:setStyles', style),
    getStyles: (): Promise<Style[]> => ipcRenderer.invoke('document:getStyles'),
    getStylesFileNames: (): Promise<string[]> => ipcRenderer.invoke("document:getStylesFileNames"),
    getStylesFromFile: (filename: string): Promise<Style[] | null> => ipcRenderer.invoke("document:getStylesFromFile", filename),
    exportStyles: (styles: Style[]): Promise<void> => ipcRenderer.invoke('document:exportStyles', styles),
    importStyles: (): Promise<string | null> => ipcRenderer.invoke('document:importStyles'),
    exportSigla: (sigla: DocumentSiglum[]): Promise<void> => ipcRenderer.invoke('document:exportSigla', sigla),
    importSigla: (): Promise<DocumentSiglum[]> => ipcRenderer.invoke('document:importSigla'),
    setSiglumList: (siglumList: DocumentSiglum[] | null): Promise<void> => ipcRenderer.invoke('document:setSiglumList', siglumList),
    getSiglumList: (): Promise<DocumentSiglum[]> => ipcRenderer.invoke('document:getSiglumList'),
    setReferencesFormat: (referencesFormat: ReferencesFormat | null): Promise<void> => ipcRenderer.invoke('document:setReferencesFormat', referencesFormat),
    getReferencesFormat: (): Promise<ReferencesFormat> => ipcRenderer.invoke('document:getReferencesFormat'),
    setMetadata: (metadata: Metadata | null): Promise<void> => ipcRenderer.invoke('document:setMetadata', metadata),
    getMetadata: (): Promise<Metadata> => ipcRenderer.invoke('document:getMetadata'),

    setBibliographies: (bibliographyList: Bibliography[] | null): Promise<void> => ipcRenderer.invoke('document:setBibliographies', bibliographyList),
    getBibliographies: (): Promise<Bibliography[]> => ipcRenderer.invoke('document:getBibliographies'),
    importBibliography: (): Promise<Bibliography> => ipcRenderer.invoke('document:importBibliography'),

    print: (includeContent: PrintIncludeContents, options?: PrintOptions): Promise<void> => ipcRenderer.invoke('document:print', includeContent, options),
    exportToTei: (): Promise<void> => ipcRenderer.invoke('document:exportToTei'),

    // #region  find and replace actions
    openFind: (): Promise<void> => ipcRenderer.invoke('document:openFind'),
    findNext: (): Promise<void> => ipcRenderer.invoke('document:findNext'),
    findPrevious: (): Promise<void> => ipcRenderer.invoke('document:findPrevious'),
    replace: (replacement: string): Promise<void> => ipcRenderer.invoke('document:replace', replacement),
    replaceAll: (replacement: string): Promise<void> => ipcRenderer.invoke('document:replaceAll', replacement),
    setSearchCriteria: (options: SearchCriteria): Promise<void> => ipcRenderer.invoke('document:setSearchCriteria', options),
    resetSearchCriteria: (): Promise<void> => ipcRenderer.invoke('document:resetSearchCriteria'),
    setDisableReplaceAction: (disableReplaceAction: boolean): Promise<void> => ipcRenderer.invoke('document:setDisableReplaceAction', disableReplaceAction),
    sendCurrentSearchIndex: (index: number): Promise<void> => ipcRenderer.invoke('document:sendCurrentSearchIndex', index),
    sendTotalSearchResults: (total: number): Promise<void> => ipcRenderer.invoke('document:sendTotalSearchResults', total),
    sendSearchHistory: (history: string[]): Promise<void> => ipcRenderer.invoke('document:sendSearchHistory', history),
    sendReplaceHistory: (history: string[]): Promise<void> => ipcRenderer.invoke('document:sendReplaceHistory', history),
    setReplaceInProgress: (isInProgress: boolean): Promise<void> => ipcRenderer.invoke('document:setReplaceInProgress', isInProgress),
    // #endregion

    exportExcel: (data: Blob, fileName: string): Promise<void> => ipcRenderer.invoke('document:exportExcel', data, fileName),
    savePdf: (includeSections: PrintSections): Promise<void> => ipcRenderer.invoke('document:savePdf', includeSections),
    getPrintPreview: (): Promise<{ path: string | null; isLoaded: boolean; error: string | null }> => ipcRenderer.invoke('document:getPrintPreview'),
}

const preferencesAPI: IPreferencesAPI = {
    getPreferences: (): Promise<Preferences> => ipcRenderer.invoke('preferences:get'),
    savePreferences: (preferences: Preferences): Promise<void> => ipcRenderer.invoke('preferences:save', preferences),
    getPageSetup: (): Promise<PageSetup> => ipcRenderer.invoke('pageSetup:get'),
    savePageSetup: (pageSetup: PageSetup): Promise<void> => ipcRenderer.invoke('pageSetup:save', pageSetup)
}

const themeAPI: IThemeAPI = {
    setTheme: (theme: 'light' | 'dark' | 'system'): Promise<void> => ipcRenderer.invoke('theme:setTheme', theme),
    getTheme: (): Promise<'light' | 'dark' | 'system'> => ipcRenderer.invoke('theme:getTheme')
}

const tooltipAPI: ITooltipAPI = {
    show: (x: number, y: number, text: string): Promise<void> => ipcRenderer.invoke('tooltip:show', { x, y, text }),
    hide: (): Promise<void> => ipcRenderer.invoke('tooltip:hide'),
    setText: (text: string): Promise<void> => ipcRenderer.invoke('tooltip:set-text', text),
}

const keyboardShortcutsAPI = {
    getShortcuts: () => ipcRenderer.invoke('keyboard-shortcuts:getShortcuts') as ReturnType<IKeyboardShortcutsAPI['getShortcuts']>,
    setShortcut: (menuItemId: string, shortcut: string) => ipcRenderer.invoke('keyboard-shortcuts:setShortcut', menuItemId, shortcut) as ReturnType<IKeyboardShortcutsAPI['setShortcut']>,
    removeShortcut: (menuItemId: string) => ipcRenderer.invoke('keyboard-shortcuts:removeShortcut', menuItemId) as ReturnType<IKeyboardShortcutsAPI['removeShortcut']>,
    resetAll: () => ipcRenderer.invoke('keyboard-shortcuts:resetAll') as ReturnType<IKeyboardShortcutsAPI['resetAll']>,
} satisfies IKeyboardShortcutsAPI

const userAPI = {
    login: (data: LoginDataInput): Promise<Result<LoginSuccess, LoginError>> => ipcRenderer.invoke('user:login', data),
    loggedIn: (): Promise<boolean> => ipcRenderer.invoke('user:loggedIn'),
    logout: (): Promise<boolean> => ipcRenderer.invoke('user:logout'),
    currentUser: (): Promise<User> => ipcRenderer.invoke('user:currentUser'),
    getCurrentUser: (): Promise<Result<UserSuccess, UserError>> => ipcRenderer.invoke('user:getCurrentUser'),
    deleteCurrentUser: (password: string): Promise<Result<DeleteCurrentUserSuccess, DeleteCurrentUserError>> => ipcRenderer.invoke('user:deleteCurrentUser', password),
    register: (data: RegisterDataInput): Promise<Result<RegistrationSuccess, RegistrationError>> => ipcRenderer.invoke('user:register', data),
    sendVerificationCode: (data: SendVerificationCodeDataInput): Promise<Result<SendVerificationCodeSuccess, SendVerificationCodeError>> => ipcRenderer.invoke('user:sendVerificationCode', data),
    verifyUser: (data: VerifyUserDataInput): Promise<Result<VerifyUserSuccess, VerifyUserError>> => ipcRenderer.invoke('user:verifyuser', data),
    requestResetPassword: (data: RequestResetPasswordDataInput): Promise<Result<RequestResetPasswordSuccess, RequestResetPasswordError>> => ipcRenderer.invoke('user:requestResetPassword', data),
    resetPassword: (data: ResetPasswordDataInput): Promise<Result<ResetPasswordSuccess, ResetPasswordError>> => ipcRenderer.invoke('user:resetPassword', data),
    changePassword: (data: ChangePasswordDataInput): Promise<Result<ChangePasswordSuccess, ChangePasswordError>> => ipcRenderer.invoke('user:changePassword', data),
    updateUser: (data: UpdateUserDataInput): Promise<Result<UpdateUserSuccess, UpdateUserError>> => ipcRenderer.invoke('user:updateUser', data),
    searchUsers: (data: SearchUserDataInput): Promise<Result<SearchUserSuccess[], SearchUserError>> => ipcRenderer.invoke('user:searchUsers', data),
} satisfies IUserAPI;

const inviteAPI = {
    sendInvites:
        (data: SendInvitesDataInput):
            Promise<Result<SendInvitesSuccess, SendInvitesError>> =>
            ipcRenderer.invoke('invite:sendInvites', data),
    uploadDocumentAndSendInvites:
        (data: UploadDocumentAndSendInvitesInput):
            Promise<Result<UploadDocumentAndSendInvitesSuccess, UploadDocumentAndSendInvitesError>> =>
            ipcRenderer.invoke('invite:uploadDocumentAndSendInvites', data),
    getInvitations: ():
        Promise<Result<GetInvitationsSuccess, GetInvitationsError>> =>
        ipcRenderer.invoke('invite:getInvitations'),
    resendInvitationWithId: (invitationId: string):
        Promise<Result<ResendInvitationWithIdSuccess, ResendInvitationWithIdError>> =>
        ipcRenderer.invoke('invite:resendInvitationWithId', invitationId),
    revokeInvitationWithId: (invitationId: string):
        Promise<Result<RevokeInvitationWithIdSuccess, RevokeInvitationWithIdError>> =>
        ipcRenderer.invoke('invite:revokeInvitationWithId', invitationId),
    acceptInvitationWithId: (invitationId: string):
        Promise<Result<AcceptInvitationWithIdSuccess, AcceptInvitationWithIdError>> =>
        ipcRenderer.invoke('invite:acceptInvitationWithId', invitationId),
    declineInvitationWithId: (invitationId: string):
        Promise<Result<DeclineInvitationWithIdSuccess, DeclineInvitationWithIdError>> =>
        ipcRenderer.invoke('invite:declineInvitationWithId', invitationId),
} satisfies IInviteAPI;

const shareDocumentAPI = {
    uploadDocument:
        (filepath: string, documentId: string):
            Promise<Result<UploadDocumentSuccess, UploadDocumentError>> =>
            ipcRenderer.invoke('shareDocument:uploadDocument', filepath, documentId),
    downloadDocument:
        (documentId: string):
            Promise<Result<DownloadDocumentSuccess, DownloadDocumentError>> =>
            ipcRenderer.invoke('shareDocument:downloadDocument', documentId),
    getDocumentWithId:
        (documentId: string):
            Promise<Result<GetSharedDocumentSuccess, GetSharedDocumentError>> =>
            ipcRenderer.invoke('shareDocument:getDocumentWithId', documentId),
    deleteDocumentWithId: (documentId: string):
        Promise<Result<DeleteDocumentWithIdSuccess, DeleteDocumentWithIdError>> =>
        ipcRenderer.invoke('shareDocument:deleteDocumentWithId', documentId),
    uploadDocumentIfNotExists:
        (filepath: string, documentId: string):
            Promise<Result<UploadDocumentIfNotExistsSuccess, UploadDocumentIfNotExistsError>> =>
            ipcRenderer.invoke('shareDocument:uploadDocumentIfNotExists', filepath, documentId),
    getMyDocuments: ():
        Promise<Result<GetMyDocumentsSuccess, GetMyDocumentsError>> =>
        ipcRenderer.invoke('shareDocument:getMyDocuments'),

} satisfies IShareDocumentAPI;

const notificationsAPI = {
    getNotifications: (page?: number): Promise<NotificationResponse> => ipcRenderer.invoke('notifications:getNotifications', page),
    markAsViewed: (notificationId: string): Promise<NotificationItem> => ipcRenderer.invoke('notifications:markAsViewed', notificationId),
    markAllAsViewed: (notificationIds: string[]): Promise<NotificationItem[]> => ipcRenderer.invoke('notifications:markAllAsViewed', notificationIds),
} satisfies INotificationAPI;

const chatAPI = {
    getDocumentAccess: (documentId: string):
        Promise<Result<GetChatDocumentAccessSuccess, GetChatDocumentAccessError>> =>
        ipcRenderer.invoke('chat:getDocumentAccess', documentId),
    getHistory: (documentId: string, page: number, size: number):
        Promise<Result<GetChatHistorySuccess, GetChatHistoryError>> =>
        ipcRenderer.invoke('chat:getHistory', documentId, page, size),
    getPartecipants: (documentId: string):
        Promise<Result<GetChatParticipantsSuccess, GetChatParticipantsError>> =>
        ipcRenderer.invoke('chat:getPartecipants', documentId),
    connect: ():
        Promise<Result<ConnectChatSuccess, ConnectChatError>> =>
        ipcRenderer.invoke('chat:connect'),
    disconnect: ():
        Promise<void> =>
        ipcRenderer.invoke('chat:disconnect'),
    subscribe: (documentId: string):
        Promise<Result<SubscribeChatChannelSuccess, SubscribeChatChannelError>> =>
        ipcRenderer.invoke('chat:subscribe', documentId),
    unsubscribe: (documentId: string):
        Promise<Result<UnsubscribeChatChannelSuccess, UnsubscribeChatChannelError>> =>
        ipcRenderer.invoke('chat:unsubscribe', documentId),
    sendMessage: (documentId: string, message: string, reference: string | null):
        Promise<Result<SendMessageChatSuccess, SendMessageChatError>> =>
        ipcRenderer.invoke('chat:sendMessage', documentId, message, reference),
    connected: ():
        Promise<boolean> =>
        ipcRenderer.invoke('chat:connected'),

    onConnecting: (callback: () => void) => {
        const listener = () => callback();
        ipcRenderer.on('chat:connecting', listener);
        return () => ipcRenderer.removeListener('chat:connecting', listener);
    },

    onConnected: (callback: () => void) => {
        const listener = () => callback();
        ipcRenderer.on('chat:connected', listener);
        return () => ipcRenderer.removeListener('chat:connected', listener);
    },

    onDisconnected: (callback: () => void) => {
        const listener = () => callback();
        ipcRenderer.on('chat:disconnected', listener);
        return () => ipcRenderer.removeListener('chat:disconnected', listener);
    },

    onError: (callback: (error: string) => void) => {
        const listener = (_event: any, error: string) => callback(error);
        ipcRenderer.on('chat:error', listener);
        return () => ipcRenderer.removeListener('chat:error', listener);
    },

    onMessage: (callback: (message: ChatMessage) => void) => {
        const listener = (_event: any, message: ChatMessage) => callback(message);
        ipcRenderer.on('chat:message', listener);
        return () => ipcRenderer.removeListener('chat:message', listener);
    },

    onChangeState: (callback: (state: ChatState) => void) => {
        const listener = (_event: any, state: ActivationState) => {
            switch (state) {
                case ActivationState.ACTIVE:
                    callback("ACTIVE")
                    break;
                case ActivationState.DEACTIVATING:
                    callback("DEACTIVATING")
                    break;
                case ActivationState.INACTIVE:
                    callback("INACTIVE")
                    break;
            }
        };
        ipcRenderer.on('chat:changeState', listener);
        return () => ipcRenderer.removeListener('chat:changeState', listener);
    },

} satisfies IChatAPI;

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('tabs', tabsAPI)
        contextBridge.exposeInMainWorld('menu', menuAPI)
        contextBridge.exposeInMainWorld('system', systemAPI)
        contextBridge.exposeInMainWorld('application', applicationAPI)
        contextBridge.exposeInMainWorld('doc', documentAPI)
        contextBridge.exposeInMainWorld('theme', themeAPI)
        contextBridge.exposeInMainWorld('preferences', preferencesAPI)
        contextBridge.exposeInMainWorld('debug', debugAPI)
        contextBridge.exposeInMainWorld('tooltip', tooltipAPI)
        contextBridge.exposeInMainWorld('keyboardShortcuts', keyboardShortcutsAPI)
        contextBridge.exposeInMainWorld('user', userAPI)
        contextBridge.exposeInMainWorld('invite', inviteAPI)
        contextBridge.exposeInMainWorld('shareDocument', shareDocumentAPI)
        contextBridge.exposeInMainWorld('notifications', notificationsAPI)
        contextBridge.exposeInMainWorld('chat', chatAPI)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    globalThis.electron = electronAPI
    // @ts-ignore (define in dts)
    globalThis.tabs = tabsAPI
    // @ts-ignore (define in dts)
    globalThis.system = systemAPI
    // @ts-ignore (define in dts)
    globalThis.application = applicationAPI
    // @ts-ignore (define in dts)
    wglobalThisindow.doc = documentAPI
    // @ts-ignore (define in dts)
    globalThis.menu = menuAPI
    // @ts-ignore (define in dts)
    globalThis.theme = themeAPI
    // @ts-ignore (define in dts)
    globalThis.preferences = preferencesAPI
    // @ts-ignore (define in dts)
    globalThis.tooltip = tooltipAPI
    // @ts-ignore (define in dts)
    globalThis.keyboardShortcuts = keyboardShortcutsAPI
    // @ts-ignore (define in dts)
    globalThis.user = accountAPI
    // @ts-ignore (define in dts)
    globalThis.invite = inviteAPI
    // @ts-ignore (define in dts)
    globalThis.shareDocument = shareDocumentAPI
    // @ts-ignore (define in dts)
    globalThis.notifications = notificationsAPI
    // @ts-ignore (define in dts)
    globalThis.chat = chatAPI
}
