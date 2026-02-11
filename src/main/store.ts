import Store from 'electron-store'
import { defaultSpecialCharacterConfig } from './shared/constants';
import { SimplifiedTab } from './types';

const store = new Store({
    defaults: {
        statusbarVisible: true,
        statusbarHideItems: [],
        toolbarIsVisible: true,
        toolbarAdditionalItems: [],
        specialCharacterConfig: defaultSpecialCharacterConfig,
        fileNameDisplay: 'full',
        rememberLayout: true,
        pdfQuality: '4',
        lastPageSetup: null,
        recentFilesCount: 10,
        theme: 'system',
        commentPreviewLimit: '20',
        bookmarkPreviewLimit: '20',
        fileSavingDirectory: 'last',
        defaultDirectory: '~/Select/your/path/',
        automaticFileSave: 'never',
        versioningDirectory: 'default',
        customVersioningDirectory: '~/Select/your/path/',
        criterionLanguage: 'en',
        criterionRegion: 'IT',
        dateFormat: 'yyyy/MM/dd HH:mm:ss',
        historyActionsCount: '10',
        layoutTabs: [],
        statusBarConfig: ['pageNumber', 'wordCount', 'zoom'],
        zoom: '100',
        tabs: [],
        simplifiedLayoutTabs: [],
        tabsState: [],
        lastFolderPath: null,
        recentDocuments: [],
        appLanguage: 'en'
    },
});

export const saveBaseAuthToken = (token: string): void => store.set('baseAuthToken', token)
export const getBaseAuthToken = (): string | null => store.get('baseAuthToken') as string | null
export const deleteBaseAuthToken = (): void => store.delete('baseAuthToken')

export const saveUser = (user: User): void => store.set('user', user)
export const getUser = (): User | null => store.get('user') as User | null
export const deleteUser = (): void => store.delete('user')

export const setTabs = (tabs: Tab[]): void => store.set('tabs', tabs)

export const getTabs = (): Tab[] => store.get('tabs', []) as Tab[]

export const resetTabs = (): void => store.set('tabs', [])

// New simplified layout tab structure for better persistence
export const setSimplifiedLayoutTabs = (tabs: SimplifiedTab[]): void => store.set('simplifiedLayoutTabs', tabs)

export const getSimplifiedLayoutTabs = (): SimplifiedTab[] => store.get('simplifiedLayoutTabs', []) as SimplifiedTab[]

export const resetSimplifiedLayoutTabs = (): void => store.set('simplifiedLayoutTabs', [])

export const updateTabFilePath = (id: number, filePath: string): void => {
    const tabs = getTabs()
    const index = tabs.findIndex((t) => t.id === id)
    if (index !== -1) {
        tabs[index].filePath = filePath
    }
    setTabs(tabs)
}

export const setUpdatedTabsState = (tabs: TabInfo[]): void => store.set('tabsState', tabs)

export const getUpdatedTabsState = (): TabInfo[] => store.get('tabsState', []) as TabInfo[]

export const resetUpdatedTabsState = (): void => store.set('tabsState', [])

export const storeLastFolderPath = (folderPath: string | null): void => store.set('lastFolderPath', folderPath)

export const readLastFolderPath = (): string | null => store.get('lastFolderPath', null) as string | null

export const storeRecentDocuments = (documents: string[]): void => store.set('recentDocuments', documents)

export const readRecentDocuments = (): string[] => store.get('recentDocuments', []) as string[];

export const storeToolbarIsVisible = (visible: boolean): void => store.set("toolbarIsVisible", visible)

export const readToolbarIsVisible = (): boolean => store.get("toolbarIsVisible", true) as boolean

export const readToolbarAdditionalItems = (): string[] => store.get("toolbarAdditionalItems", []) as string[]

export const storeToolbarAdditionalItems = (items: string[]): void => store.set("toolbarAdditionalItems", items)

export const storeAppLanguage = (language: string): void => store.set("appLanguage", language);

export const readAppLanguage = (): string => store.get("appLanguage", "en") as string

export const storeSpecialCharacterConfig = (data: CharacterConfiguration[]): void => store.set('specialCharacterConfig', data)

export const readSpecialCharacterConfig = (): CharacterConfiguration[] => store.get('specialCharacterConfig', defaultSpecialCharacterConfig) as CharacterConfiguration[]

export const storeFileNameDisplay = (display: 'full' | 'filename'): void => store.set('fileNameDisplay', display)

export const readFileNameDisplay = (): 'full' | 'filename' => store.get('fileNameDisplay', 'full') as 'full' | 'filename'

export const storeRecentFilesCount = (count: number): void => store.set('recentFilesCount', count)

export const readRecentFilesCount = (): number => store.get('recentFilesCount', 10)

export const storeRememberLayout = (remember: boolean): void => store.set('rememberLayout', remember)

export const readRememberLayout = (): boolean => store.get('rememberLayout', true)

export const storePdfQuality = (quality: string): void => store.set('pdfQuality', quality)

export const readPdfQuality = (): string => store.get('pdfQuality', '4')

export const storeLastPageSetup = (pageSetup: unknown): void => store.set('lastPageSetup', pageSetup)

export const readLastPageSetup = (): unknown => store.get('lastPageSetup', null)

export const storeTheme = (theme: 'light' | 'dark' | 'system'): void => store.set('theme', theme)

export const readTheme = (): 'light' | 'dark' | 'system' => store.get('theme', 'system') as 'light' | 'dark' | 'system'

export const storeCommentPreviewLimit = (limit: string): void => store.set('commentPreviewLimit', limit)

export const readCommentPreviewLimit = (): string => store.get('commentPreviewLimit', '20')

export const storeBookmarkPreviewLimit = (limit: string): void => store.set('bookmarkPreviewLimit', limit)

export const readBookmarkPreviewLimit = (): string => store.get('bookmarkPreviewLimit', '20')

export const storeFileSavingDirectory = (directory: string): void => store.set('fileSavingDirectory', directory)

export const readFileSavingDirectory = (): string => store.get('fileSavingDirectory', 'last')

export const storeDefaultDirectory = (directory: string): void => store.set('defaultDirectory', directory)

export const readDefaultDirectory = (): string => store.get('defaultDirectory', '~/Select/your/path/')

export const storeAutomaticFileSave = (setting: string): void => store.set('automaticFileSave', setting)

export const readAutomaticFileSave = (): string => store.get('automaticFileSave', 'never')

export const storeVersioningDirectory = (directory: string): void => store.set('versioningDirectory', directory)

export const readVersioningDirectory = (): string => store.get('versioningDirectory', 'default')

export const storeCustomVersioningDirectory = (directory: string): void => store.set('customVersioningDirectory', directory)

export const readCustomVersioningDirectory = (): string => store.get('customVersioningDirectory', '~/Select/your/path/')

export const storeCriterionLanguage = (language: string): void => store.set('criterionLanguage', language)

export const readCriterionLanguage = (): string => store.get('criterionLanguage', 'en')

export const storeCriterionRegion = (region: string): void => store.set('criterionRegion', region)

export const readCriterionRegion = (): string => store.get('criterionRegion', 'IT')

export const storeDateFormat = (format: string): void => store.set('dateFormat', format)

export const readDateFormat = (): string => store.get('dateFormat', 'yyyy/MM/dd HH:mm:ss')  

export const storeHistoryActionsCount = (count: string): void => store.set('historyActionsCount', count)

export const readHistoryActionsCount = (): string => store.get('historyActionsCount', '10')

export const toggleStatusbarVisibility = (): void => {
    const currentVisibility = store.get('statusbarVisible', true) as boolean;
    store.set('statusbarVisible', !currentVisibility);
};

export const readStatusbarVisibility = (): boolean => store.get('statusbarVisible', true) as boolean;

export const readStatusBarConfig = (): string[] => store.get('statusBarConfig', ['pageNumber', 'wordCount', 'zoom']) as string[];

export const storeStatusBarConfig = (config: string[]): void => store.set('statusBarConfig', config);

export const storeZoom = (zoom: string): void => store.set('zoom', zoom);

export const readZoom = (): string => store.get('zoom', '100') as string;