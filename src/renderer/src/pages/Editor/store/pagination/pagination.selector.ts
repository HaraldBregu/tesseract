import { RootState } from "@/store/store";
import { PageNumberSettings } from "./pagination.slice";

// Selettori per line number settings
const selectLineNumberSettings = (state: RootState) => state.pagination.lineNumberSettings;
const selectShowLines = (state: RootState) => state.pagination.lineNumberSettings.showLines;
const selectLinesNumeration = (state: RootState) => state.pagination.lineNumberSettings.linesNumeration;
const selectSectionLevel = (state: RootState) => state.pagination.lineNumberSettings.sectionLevel;

// Selettori per page number settings
const selectPageNumberSettings = (state: RootState) => state.pagination.pageNumberSettings;

// Selettori per sezioni specifiche
const selectTocNumberSettings = (state: RootState) => state.pagination.pageNumberSettings.toc;
const selectIntroNumberSettings = (state: RootState) => state.pagination.pageNumberSettings.intro;
const selectCrtNumberSettings = (state: RootState) => state.pagination.pageNumberSettings.crt;
const selectBiblioNumberSettings = (state: RootState) => state.pagination.pageNumberSettings.biblio;

// Selettore per una specifica sezione (usando un parametro)
const selectSectionNumberSettings = (state: RootState, section: keyof PageNumberSettings) =>
    state.pagination.pageNumberSettings[section];

// Selettori per le impostazioni dell'header
const selectHeaderSettings = (state: RootState) => state.pagination.headerSettings;
const selectHeaderDisplayMode = (state: RootState) => state.pagination.headerSettings.displayMode;
const selectHeaderStartFromPage = (state: RootState) => state.pagination.headerSettings.startFromPage;
const selectHeaderSectionsToShow = (state: RootState) => state.pagination.headerSettings.sectionsToShow;
const selectHeaderLeftContent = (state: RootState) => state.pagination.headerSettings.leftContent;
const selectHeaderCenterContent = (state: RootState) => state.pagination.headerSettings.centerContent;
const selectHeaderRightContent = (state: RootState) => state.pagination.headerSettings.rightContent;

// Selettori per le impostazioni del footer
const selectFooterSettings = (state: RootState) => state.pagination.footerSettings;
const selectFooterDisplayMode = (state: RootState) => state.pagination.footerSettings.displayMode;
const selectFooterStartFromPage = (state: RootState) => state.pagination.footerSettings.startFromPage;
const selectFooterSectionsToShow = (state: RootState) => state.pagination.footerSettings.sectionsToShow;
const selectFooterLeftContent = (state: RootState) => state.pagination.footerSettings.leftContent;
const selectFooterCenterContent = (state: RootState) => state.pagination.footerSettings.centerContent;
const selectFooterRightContent = (state: RootState) => state.pagination.footerSettings.rightContent;

export {
    // Line number selectors
    selectLineNumberSettings,
    selectShowLines,
    selectLinesNumeration,
    selectSectionLevel,

    // Page number selectors
    selectPageNumberSettings,
    selectTocNumberSettings,
    selectIntroNumberSettings,
    selectCrtNumberSettings,
    selectBiblioNumberSettings,
    selectSectionNumberSettings,

    // Header selectors
    selectHeaderSettings,
    selectHeaderDisplayMode,
    selectHeaderStartFromPage,
    selectHeaderSectionsToShow,
    selectHeaderLeftContent,
    selectHeaderCenterContent,
    selectHeaderRightContent,

    // Footer selectors
    selectFooterSettings,
    selectFooterDisplayMode,
    selectFooterStartFromPage,
    selectFooterSectionsToShow,
    selectFooterLeftContent,
    selectFooterCenterContent,
    selectFooterRightContent,
}