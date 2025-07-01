// Remove the static import of t from i18next since we'll pass it as parameter
// import { t } from "i18next";

// Convert all constants to functions that accept t as parameter
const getSidebarItems = (t: (key: string) => string) => [
    { id: 'general', label: t('preferences.sections.general') },
    { id: 'appearance', label: t('preferences.sections.appearance') },
    { id: 'file', label: t('preferences.sections.file') },
    { id: 'language', label: t('preferences.sections.language') },
    { id: 'editing', label: t('preferences.sections.editing') },
    // { id: 'account', label: t('preferences.sections.account') }
];

const getFileNameOptions = (t: (key: string) => string) => [
    {
        value: 'full',
        label: t('preferences.general.fileNameDisplay.fullPath'),
        description: t('preferences.general.fileNameDisplay.fullPathDescription')
    },
    {
        value: 'filename',
        label: t('preferences.general.fileNameDisplay.filenameOnly'),
        description: t('preferences.general.fileNameDisplay.filenameOnlyDescription')
    }
];

const getLinksOptions = (t: (key: string) => string) => [
    {
        value: 'default',
        label: t('preferences.general.links.openInDefaultApp')
    },
    {
        value: 'criterion',
        label: t('preferences.general.links.openInCriterion')
    }
];

const getThemeOptions = (t: (key: string) => string) => [
    {
        value: 'system',
        label: t('preferences.appearance.theme.system')
    },
    {
        value: 'light',
        label: t('preferences.appearance.theme.light')
    },
    {
        value: 'dark',
        label: t('preferences.appearance.theme.dark')
    }
];

/*     const recentFilesOptions = [
        { value: '5', label: '5' },
        { value: '10', label: '10' },
        { value: '15', label: '15' },
        { value: '20', label: '20' }
    ]; */

const characterLimitOptions = [
    { value: '25', label: '25' },
    { value: '50', label: '50' },
    { value: '75', label: '75' },
    { value: '100', label: '100' },
    { value: '150', label: '150' },
    { value: '200', label: '200' }
];

const getFileSavingOptions = (t: (key: string) => string) => [
    {
        value: 'last',
        label: t('preferences.file.fileSavingDirectory.lastOpened')
    },
    {
        value: 'default',
        label: t('preferences.file.fileSavingDirectory.defaultDirectory')
    }
];

const getAutomaticSaveOptions = (t: (key: string) => string) => [
    {
        value: 'never',
        label: t('preferences.file.automaticFileSave.never')
    },
    {
        value: '5min',
        label: t('preferences.file.automaticFileSave.every5min')
    },
    {
        value: '10min',
        label: t('preferences.file.automaticFileSave.every10min')
    },
    {
        value: '15min',
        label: t('preferences.file.automaticFileSave.every15min')
    }
];

const getVersioningOptions = (t: (key: string) => string) => [
    {
        value: 'default',
        label: t('preferences.file.versioningDirectory.defaultDirectory')
    },
    {
        value: 'custom',
        label: t('preferences.file.versioningDirectory.customDirectory')
    }
];

// const encodingOptions = [
//     {
//         value: 'utf8',
//         label: 'UTF-8'
//     },
//     {
//         value: 'utf16',
//         label: 'UTF-16'
//     },
//     {
//         value: 'utf32',
//         label: 'UTF-32'
//     }
// ];

const languageOptions = [
    { value: 'en', label: 'English (International)' },
    { value: 'it', label: 'Italiano (Italia)' },
    { value: 'fr', label: 'Français (France)' },
    { value: 'de', label: 'Deutsch (Deutschland)' },
    { value: 'es', label: 'Español (España)' }
];

const regionOptions = [
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'IT', label: 'Italy' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'ES', label: 'Spain' }
];

const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US format): 12/25/2023' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European format): 25/12/2023' },
    { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD (ISO format): 2023/12/25' },
    { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY: 12-25-2023' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY: 25-12-2023' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD: 2023-12-25' },
    { value: 'MM.DD.YYYY', label: 'MM.DD.YYYY: 12.25.2023' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY: 25.12.2023' }
];

const timeFormatOptions = [
    { value: 'HH:MM', label: 'HH:MM: 14:30' },
    { value: 'H:MM', label: 'H:MM: 14:30' },
    { value: 'HH:MM:SS', label: 'HH:MM:SS: 14:30:45' },
    { value: 'HHMM', label: 'HHMM: 1430' },
    { value: 'HHMMSS', label: 'HHMMSS: 143045' },
    { value: 'HH:MM:SS.mmm', label: 'HH:MM:SS.mmm: 14:30:45.123' },
    { value: 'HH:MM:SS,mmm', label: 'HH:MM:SS,mmm: 14:30:45,123' },
    { value: 'h:MM A', label: '12-hour format (h:MM AM/PM): 2:30 PM' },
    { value: 'h:MM:SS A', label: '12-hour format (h:MM:SS AM/PM): 2:30:45 PM' }
];

export {
    getSidebarItems,
    getFileNameOptions,
    getLinksOptions,
    getThemeOptions,
    characterLimitOptions,
    getFileSavingOptions,
    getAutomaticSaveOptions,
    getVersioningOptions,
    languageOptions,
    regionOptions,
    dateFormatOptions,
    timeFormatOptions
};

