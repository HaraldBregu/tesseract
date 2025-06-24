import Store from 'electron-store'
import { defaultSpecialCharacterConfig } from './shared/constants';

const store = new Store({
    defaults: {
        toolbarIsVisible: true,
        toolbarAdditionalItems: [],
        specialCharacterConfig: defaultSpecialCharacterConfig,
        fileNameDisplay: 'full',
        rememberLayout: true,
        lastPageSetup: null,
        recentFilesCount: 10,
        theme: 'system',
        commentPreviewLimit: '20',
        bookmarkPreviewLimit: '20',
        fileSavingDirectory: 'last',
        defaultDirectory: '~/Username/Documents/',
        automaticFileSave: 'never',
        versioningDirectory: 'default',
        customVersioningDirectory: '~/Username/Documents/',
        criterionLanguage: 'en',
        criterionRegion: 'IT',
        dateTimeFormat: 'DD/MM/YYYY HH:MM:SS',
        historyActionsCount: '10'
    },
});

export const setTabs = (tabs: Tab[]): void => store.set('tabs', tabs)

export const getTabs = (): Tab[] => store.get('tabs', []) as Tab[]

export const resetTabs = (): void => store.set('tabs', [])

export const updateTabFilePath = (id: number, filePath: string): void => {
    const tabs = getTabs()
    const index = tabs.findIndex((t) => t.id === id)
    if (index !== -1) {
        tabs[index].filePath = filePath
    }
    setTabs(tabs)
}

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

export const readRecentFilesCount = (): number => store.get('recentFilesCount', 10) as number

export const storeRememberLayout = (remember: boolean): void => store.set('rememberLayout', remember)

export const readRememberLayout = (): boolean => store.get('rememberLayout', true) as boolean

export const storeLastPageSetup = (pageSetup: unknown): void => store.set('lastPageSetup', pageSetup)

export const readLastPageSetup = (): unknown => store.get('lastPageSetup', null)

export const storeTheme = (theme: 'light' | 'dark' | 'system'): void => store.set('theme', theme)

export const readTheme = (): 'light' | 'dark' | 'system' => store.get('theme', 'system') as 'light' | 'dark' | 'system'

export const storeCommentPreviewLimit = (limit: string): void => store.set('commentPreviewLimit', limit)

export const readCommentPreviewLimit = (): string => store.get('commentPreviewLimit', '20') as string

export const storeBookmarkPreviewLimit = (limit: string): void => store.set('bookmarkPreviewLimit', limit)

export const readBookmarkPreviewLimit = (): string => store.get('bookmarkPreviewLimit', '20') as string

export const storeFileSavingDirectory = (directory: string): void => store.set('fileSavingDirectory', directory)

export const readFileSavingDirectory = (): string => store.get('fileSavingDirectory', 'last') as string

export const storeDefaultDirectory = (directory: string): void => store.set('defaultDirectory', directory)

export const readDefaultDirectory = (): string => store.get('defaultDirectory', '~/Username/Documents/') as string

export const storeAutomaticFileSave = (setting: string): void => store.set('automaticFileSave', setting)

export const readAutomaticFileSave = (): string => store.get('automaticFileSave', 'never') as string

export const storeVersioningDirectory = (directory: string): void => store.set('versioningDirectory', directory)

export const readVersioningDirectory = (): string => store.get('versioningDirectory', 'default') as string

export const storeCustomVersioningDirectory = (directory: string): void => store.set('customVersioningDirectory', directory)

export const readCustomVersioningDirectory = (): string => store.get('customVersioningDirectory', '~/Username/Documents/') as string

export const storeCriterionLanguage = (language: string): void => store.set('criterionLanguage', language)

export const readCriterionLanguage = (): string => store.get('criterionLanguage', 'en') as string

export const storeCriterionRegion = (region: string): void => store.set('criterionRegion', region)

export const readCriterionRegion = (): string => store.get('criterionRegion', 'IT') as string

export const storeDateTimeFormat = (format: string): void => store.set('dateTimeFormat', format)

export const readDateTimeFormat = (): string => store.get('dateTimeFormat', 'DD/MM/YYYY HH:MM:SS') as string

export const storeHistoryActionsCount = (count: string): void => store.set('historyActionsCount', count)

export const readHistoryActionsCount = (): string => store.get('historyActionsCount', '10') as string