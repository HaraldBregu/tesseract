import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HeaderContentType, HeaderDisplayMode } from '@/utils/headerEnums'

export interface LineNumberSettings {
  showLines: number // 0, 5, 10, 15
  linesNumeration: number // 1 (intero documento), 2 (ogni pagina), 3 (ogni sezione)
  sectionLevel: number // livello di sezione quando linesNumeration è 3
}

export interface PageNumberSectionSettings {
  pageNumeration: string // "1" (nessuna), "2" (continua), "3" (inizia da)
  startingPointValue: number // valore iniziale per la numerazione
  numberFormat: string // formato del numero
}

export interface PageNumberSettings {
  toc: PageNumberSectionSettings
  intro: PageNumberSectionSettings
  crt: PageNumberSectionSettings
  biblio: PageNumberSectionSettings
}

export interface FooterSettings {
  displayMode: HeaderDisplayMode
  startFromPage: number
  sectionsToShow: number[]
  leftContent: HeaderContentType
  centerContent: HeaderContentType
  rightContent: HeaderContentType
}

export interface PaginationState {
  lineNumberSettings: LineNumberSettings
  pageNumberSettings: PageNumberSettings
  headerSettings: HeaderSettings
  footerSettings: FooterSettings
  // altri stati relativi alla preview potrebbero essere aggiunti qui in futuro
}

export interface HeaderSettings {
  displayMode: HeaderDisplayMode
  startFromPage?: number
  sectionsToShow?: number[]
  leftContent: HeaderContentType
  centerContent: HeaderContentType
  rightContent: HeaderContentType
}

const initialState: PaginationState = {
  lineNumberSettings: {
    showLines: 0,
    linesNumeration: 1,
    sectionLevel: 1
  },
  pageNumberSettings: {
    toc: {
      pageNumeration: '1',
      startingPointValue: 1,
      numberFormat: '1'
    },
    intro: {
      pageNumeration: '1',
      startingPointValue: 1,
      numberFormat: '1'
    },
    crt: {
      pageNumeration: '1',
      startingPointValue: 1,
      numberFormat: '1'
    },
    biblio: {
      pageNumeration: '1',
      startingPointValue: 1,
      numberFormat: '1'
    }
  },
  headerSettings: {
    displayMode: HeaderDisplayMode.NONE,
    startFromPage: 1,
    sectionsToShow: [],
    leftContent: HeaderContentType.NONE,
    centerContent: HeaderContentType.NONE,
    rightContent: HeaderContentType.NONE
  },
  footerSettings: {
    displayMode: HeaderDisplayMode.NONE,
    startFromPage: 1,
    sectionsToShow: [],
    leftContent: HeaderContentType.NONE,
    centerContent: HeaderContentType.NONE,
    rightContent: HeaderContentType.NONE
  }
}

const paginationSlice = createSlice({
  name: 'pagination',
  initialState,
  reducers: {
    // Line number reducers
    updateLineNumberSettings: (state, action: PayloadAction<LineNumberSettings>) => {
      state.lineNumberSettings = action.payload
    },
    setShowLines: (state, action: PayloadAction<number>) => {
      state.lineNumberSettings.showLines = action.payload
    },
    setLinesNumeration: (state, action: PayloadAction<number>) => {
      state.lineNumberSettings.linesNumeration = action.payload
    },
    setSectionLevel: (state, action: PayloadAction<number>) => {
      state.lineNumberSettings.sectionLevel = action.payload
    },

    // Page number reducers
    updatePageNumberSettings: (state, action: PayloadAction<PageNumberSettings>) => {
      state.pageNumberSettings = action.payload
    },
    updateSectionPageNumberSettings: (
      state,
      action: PayloadAction<{
        section: keyof PageNumberSettings
        settings: PageNumberSectionSettings
      }>
    ) => {
      const { section, settings } = action.payload
      state.pageNumberSettings[section] = settings
    },
    setPageNumeration: (
      state,
      action: PayloadAction<{ section: keyof PageNumberSettings; value: string }>
    ) => {
      const { section, value } = action.payload
      state.pageNumberSettings[section].pageNumeration = value
    },
    setStartingPointValue: (
      state,
      action: PayloadAction<{ section: keyof PageNumberSettings; value: number }>
    ) => {
      const { section, value } = action.payload
      state.pageNumberSettings[section].startingPointValue = value
    },
    setNumberFormat: (
      state,
      action: PayloadAction<{ section: keyof PageNumberSettings; value: string }>
    ) => {
      const { section, value } = action.payload
      state.pageNumberSettings[section].numberFormat = value
    },
    clearLineNumberSettings: (state) => {
      state.lineNumberSettings = initialState.lineNumberSettings
    },
    clearPageNumberSettings: (state) => {
      state.pageNumberSettings = initialState.pageNumberSettings
    },

    // Header settings reducers
    updateHeaderSettings: (state, action: PayloadAction<HeaderSettings>) => {
      state.headerSettings = action.payload
    },
    setHeaderDisplayMode: (state, action: PayloadAction<HeaderDisplayMode>) => {
      state.headerSettings.displayMode = action.payload
    },
    setHeaderStartFromPage: (state, action: PayloadAction<number>) => {
      state.headerSettings.startFromPage = action.payload
    },
    setHeaderSectionsToShow: (state, action: PayloadAction<number[]>) => {
      state.headerSettings.sectionsToShow = action.payload
    },
    setHeaderLeftContent: (state, action: PayloadAction<HeaderContentType>) => {
      state.headerSettings.leftContent = action.payload
    },
    setHeaderCenterContent: (state, action: PayloadAction<HeaderContentType>) => {
      state.headerSettings.centerContent = action.payload
    },
    setHeaderRightContent: (state, action: PayloadAction<HeaderContentType>) => {
      state.headerSettings.rightContent = action.payload
    },

    // Footer settings reducers
    updateFooterSettings: (state, action: PayloadAction<FooterSettings>) => {
      state.footerSettings = action.payload
    },
    setFooterDisplayMode: (state, action: PayloadAction<HeaderDisplayMode>) => {
      state.footerSettings.displayMode = action.payload
    },
    setFooterStartFromPage: (state, action: PayloadAction<number>) => {
      state.footerSettings.startFromPage = action.payload
    },
    setFooterSectionsToShow: (state, action: PayloadAction<number[]>) => {
      state.footerSettings.sectionsToShow = action.payload
    },
    setFooterLeftContent: (state, action: PayloadAction<HeaderContentType>) => {
      state.footerSettings.leftContent = action.payload
    },
    setFooterCenterContent: (state, action: PayloadAction<HeaderContentType>) => {
      state.footerSettings.centerContent = action.payload
    },
    setFooterRightContent: (state, action: PayloadAction<HeaderContentType>) => {
      state.footerSettings.rightContent = action.payload
    },

    clearHeaderSettings: (state) => {
      state.headerSettings = initialState.headerSettings
    },
    clearFooterSettings: (state) => {
      state.footerSettings = initialState.footerSettings
    }
  }
})

// Esporta le azioni
export const {
  // Line number actions
  updateLineNumberSettings,
  setShowLines,
  setLinesNumeration,
  setSectionLevel,
  // Page number actions
  updatePageNumberSettings,
  updateSectionPageNumberSettings,
  setPageNumeration,
  setStartingPointValue,
  setNumberFormat,
  //clear actions
  clearLineNumberSettings,
  clearPageNumberSettings,

  // Header actions
  updateHeaderSettings,
  setHeaderDisplayMode,
  setHeaderStartFromPage,
  setHeaderSectionsToShow,
  setHeaderLeftContent,
  setHeaderCenterContent,
  setHeaderRightContent,
  clearHeaderSettings,

  // Footer actions
  updateFooterSettings,
  setFooterDisplayMode,
  setFooterStartFromPage,
  setFooterSectionsToShow,
  setFooterLeftContent,
  setFooterCenterContent,
  setFooterRightContent,
  clearFooterSettings
} = paginationSlice.actions

export default paginationSlice.reducer
