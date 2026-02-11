import z from "zod";
import packageJson from '../../../../package.json';
import layout from '../../../../resources/layout.json';
import pageSetup from '../../../../resources/page_setup.json';
import paratextual from '../../../../resources/paratextual.json';
import styles from '../../../../resources/styles.json';

const environment = import.meta.env.VITE_APP_ENV
export const isDev = environment === "development";

export const DEFAULT_LAYOUT = layout as Layout;
export const DEFAULT_PAGE_SETUP = pageSetup as SetupOptionType;
export { default as DEFAULT_SORT } from '../../../../resources/sort.json';
export const DEAFAULT_STYLES = styles as Style[];
export const DEFAULT_PARATEXTUAL = paratextual as Paratextual;
export { templateVersion as TEMPLATE_VERSION } from '../../../../package.json';

const getAppInfo = (): { name: string, version: string, license: string, copyright: string } => {
    return {
        name: packageJson.productName,
        version: packageJson.version,
        license: packageJson.license,
        copyright: packageJson.copyright
    }
}

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

const getPdfQualityOptions = (t: (key: string) => string) => [
    {
        value: '1',
        label: t('preferences.general.pdfQuality.low')
    },
    {
        value: '2',
        label: t('preferences.general.pdfQuality.medium')
    },
    {
        value: '4',
        label: t('preferences.general.pdfQuality.high')
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
    // {
    //     value: 'system',
    //     label: t('preferences.appearance.theme.system')
    // },
    {
        value: 'light',
        label: t('preferences.appearance.theme.light') + ' (default)'
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
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US format): 12/25/2023' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (European format): 25/12/2023' },
    { value: 'yyyy/MM/dd', label: 'YYYY/MM/DD (ISO format): 2023/12/25' },
    { value: 'MM-dd-yyyy', label: 'MM-DD-YYYY: 12-25-2023' },
    { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY: 25-12-2023' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD: 2023-12-25' },
    { value: 'MM.dd.yyyy', label: 'MM.DD.YYYY: 12.25.2023' },
    { value: 'dd.MM.yyyy', label: 'DD.MM.YYYY: 25.12.2023' }
];

const timeFormatOptions = [
    { value: 'HH:mm', label: 'HH:MM: 14:30' },
    { value: 'H:mm', label: 'H:MM: 14:30' },
    { value: 'HH:mm:ss', label: 'HH:MM:SS: 14:30:45' },
    { value: 'HHmm', label: 'HHMM: 1430' },
    { value: 'HHmmss', label: 'HHMMSS: 143045' },
    { value: 'HH:mm:ss.SSS', label: 'HH:MM:SS.mmm: 14:30:45.123' },
    { value: 'HH:mm:ss,SSS', label: 'HH:MM:SS,mmm: 14:30:45,123' },
    { value: 'h:mm a', label: '12-hour format (h:MM AM/PM): 2:30 PM' },
    { value: 'h:mm:ss a', label: '12-hour format (h:MM:SS AM/PM): 2:30:45 PM' }
];

export {
    getAppInfo,
    getFileNameOptions,
    getPdfQualityOptions,
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

export const cssTocStyleForlevel = ((level: number, styles: Style[]) => {
    const getStyleForLevel = ((level: number): Style | undefined => {
        switch (level) {
            case 1:
                return styles.find((style: Style) => style.type === "TOC_H1" && style.enabled);
            case 2:
                return styles.find((style: Style) => style.type === "TOC_H2" && style.enabled);
            case 3:
                return styles.find((style: Style) => style.type === "TOC_H3" && style.enabled);
            case 4:
                return styles.find((style: Style) => style.type === "TOC_H4" && style.enabled);
            case 5:
                return styles.find((style: Style) => style.type === "TOC_H5" && style.enabled);
            case 6:
                return styles.find((style: Style) => style.type === "TOC_H6" && style.enabled);;
            default:
                return undefined;
        }
    })

    const item = getStyleForLevel(level)
    if (!item) {
        return {};
    }

    return {
        lineHeight: '1',
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
        fontStyle: item.italic ? 'italic' : 'normal',
        fontWeight: item.bold ? 'bold' : 'normal',
        color: item.color
    }
});

export const cssTocTitleStyle = (styles: Style[]) => {
    const item = styles.find((style: Style) => style.type === "TOC" && style.enabled);
    if (!item) {
        return {};
    }
    return {
        lineHeight: '1',
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
        fontStyle: item.italic ? 'italic' : 'normal',
        fontWeight: item.bold ? 'bold' : 'normal',
        color: item.color,
        textAlign: item.align
    }
}

export function createPasswordSchema(t: (key: string) => string) {
    return z
        .string()
        .min(1, t("auth.validation.passwordRequired"))
        .min(8, t("auth.validation.passwordMin"))
        .max(255, t("auth.validation.passwordMax"))
        .regex(/[a-z]/, t("auth.validation.passwordLowercase"))
        .regex(/[A-Z]/, t("auth.validation.passwordUppercase"))
        .regex(/\d/, t("auth.validation.passwordDigit"))
        .regex(/[!#@&%$]/, t("auth.validation.passwordSymbol"))
        .regex(/^\S*$/, t("auth.validation.passwordWhitespace"));
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}