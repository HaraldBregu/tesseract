import { shell, WebContentsView } from 'electron'
import { join } from 'node:path'
import { getBaseWindow } from './main-window'
import { getRootUrl, getAppLanguage } from './shared/util'
import {
  getToolbarWebContentsViewHeight,
  resizeToolbarWebContentsView,
  setSelectedTabIndex,
} from './toolbar'
import { getTabs, setTabs } from './store'
import { SimplifiedTab, UpdateTabsCallback } from './types'
import { mainLogger } from './shared/logger'
import { showLoaderWindow, hideLoaderWindow } from './loader-window'

const webContentViews: WebContentsView[] = []
let currentWebContentsView: WebContentsView | null = null

export const getWebContentsView = (id: number): WebContentsView | undefined => webContentViews.find((tab) => tab.webContents.id === id)
export const getWebContentsViews = (): WebContentsView[] => webContentViews
export const getWebContentsViewsIds = (): number[] => webContentViews.map((tab) => tab.webContents.id)
export const getSelectedWebContentsView = (): WebContentsView | null => currentWebContentsView
export const getSelectedWebContentsViewId = (): number => currentWebContentsView?.webContents.id ?? -1

export function createWebContentsView(route: WebContentsRoute): Promise<WebContentsView | null> {
  return new Promise((resolve) => {
    const url = getRootUrl() + route
    
    // Show loader while creating the WebContentsView
    showLoaderWindow()

    const webContentsView = new WebContentsView({
      webPreferences: {
        preload: join(__dirname, '../preload/index.mjs'),
        sandbox: false,
        nodeIntegration: false,
        contextIsolation: true,
        partition: 'persist:content'
      }
    })

    webContentsView.webContents.on('did-finish-load', () => {
      // Hide loader when content is ready
      hideLoaderWindow()
      
      // Send initial language to content view after load
      const currentLanguage = getAppLanguage();
      webContentsView.webContents.send("language-changed", currentLanguage);
      
      showWebContentsView(webContentsView)
      updateTabs(webContentViews)
      resolve(webContentsView)
    })

    webContentsView.webContents.on('did-fail-load', () => {
      // Hide loader on failure as well
      hideLoaderWindow()
      resolve(webContentsView)
    })

    webContentsView.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    webContentViews.push(webContentsView)
    webContentsView.webContents.loadURL(url)

    return webContentsView.webContents.id
  })
}

export function showWebContentsView(webContentsView: WebContentsView): void {
  const baseWindow = getBaseWindow()
  if (!baseWindow)
    return

  const setWebContentBounds = (): void => {
    const [width, height] = baseWindow.getContentSize()
    webContentsView.setBounds({
      x: 0,
      y: getToolbarWebContentsViewHeight(),
      width,
      height: height - getToolbarWebContentsViewHeight()
    })
  }

  setWebContentBounds()

  baseWindow.removeAllListeners('resize')

  baseWindow.on('resize', () => {
    setWebContentBounds()
    resizeToolbarWebContentsView(baseWindow)
  })

  currentWebContentsView = webContentsView
  baseWindow.contentView.addChildView(webContentsView)
}

export function closeWebContentsViewWithId(id: number): Tab[] {
  const idx = webContentViews.findIndex((tab) => tab.webContents.id === id)
  const baseWindow = getBaseWindow()
  if (idx === -1 || !baseWindow)
    return []

  const webContentsViews = getWebContentsViews();

  // Remove the view first
  baseWindow.contentView.removeChildView(webContentViews[idx])
  webContentViews[idx].webContents.close()
  webContentViews.splice(idx, 1)

  // Now select another tab if there are remaining tabs
  if (webContentsViews.length > 0) {
    let indexToSelect = 0;
    const isLastTab = idx >= webContentsViews.length;
    const isNotFirstTab = idx > 0;

    if (isLastTab && isNotFirstTab) {
      indexToSelect = webContentsViews.length - 1;
    } else if (!isLastTab) {
      indexToSelect = idx;
    }

    setSelectedWebContentsViewWithId(webContentsViews[indexToSelect].webContents.id)
  } else {
    // No tabs remaining - clear current view
    currentWebContentsView = null;
  }

  updateTabs(webContentViews)

  const tabs = getTabs()
  return tabs
}

export function closeAllTabs({ save = true }: { save?: boolean } = {}): void {
  if (save) {
    updateTabs(webContentViews)
  }

  for (const tab of webContentViews) {
    tab.webContents.close()
  }

  webContentViews.splice(0, webContentViews.length)
  if (!save) {
    updateTabs(webContentViews)
  }
}

export function selectedWebContentsViewSend(message: string, ...args: unknown[]): void {
  currentWebContentsView?.webContents.send(message, ...args)
}

export function setSelectedWebContentsViewWithId(id: number): void {
  if (currentWebContentsView?.webContents.id === id)
    return

  const idx = webContentViews.findIndex((tab) => tab.webContents.id === id)
  if (idx === -1)
    return

  const webContentsView = webContentViews[idx]

  showWebContentsView(webContentsView)
  saveSelectedTab({ tabIndex: idx })
}

export function reorderTabs(ids: number[]): void {
  const newTabs = ids
    .map((id) => webContentViews.find((tab) => tab.webContents.id === id))
    .filter((tab): tab is WebContentsView => tab !== undefined)

  if (newTabs.length === 0)
    return

  webContentViews.splice(0, webContentViews.length, ...newTabs)

  updateTabs(webContentViews)
  saveSelectedTab()
}

// UTILS

export function hideWebContentsViewWithId(id: number): void {
  const webContentView = webContentViews.find((tab) => tab.webContents.id === id)
  if (!webContentView) return
  const baseWindow = getBaseWindow()
  baseWindow?.contentView.removeChildView(webContentView)
}

const updateTabs = (webContentViews: WebContentsView[], onUpdate?: UpdateTabsCallback): void => {
  const webContentViewsData = webContentViews
    .map((webContentView) => {
      const url = webContentView.webContents.getURL()
      const idx = url.indexOf('#')
      const path = idx === -1 ? '/' : url.substring(idx + 1)

      const data = {
        id: webContentView.webContents.id,
        path: path,
      } as const satisfies Record<string, number | WebContentsRoute>

      return data
    })

  const currentTabs = getTabs()
  const currentSelectedId = currentWebContentsView?.webContents.id

  const newTabs = webContentViewsData
    .map((webContentView) => {
      const currentTab = currentTabs?.find((tab) => tab.id === webContentView.id)

      const tab = {
        id: webContentView.id,
        route: webContentView.path,
        selected: webContentView.id === currentSelectedId,
        filePath: currentTab?.filePath,
      } as Tab

      return tab
    })

  setTabs(newTabs)
  onUpdate?.(newTabs)
}

function saveSelectedTab({ tabIndex = -1 }: { tabIndex?: number } = {}): void {
  if (tabIndex !== -1) {
    setSelectedTabIndex(tabIndex)
    return
  }

  if (!currentWebContentsView)
    return

  const idx = webContentViews.findIndex((tab) => {
    if (currentWebContentsView === null)
      return false

    return tab.webContents.id === currentWebContentsView!.webContents.id
  })

  if (idx === -1)
    return

  setSelectedTabIndex(idx)
}

export const selectPreviouslySelectedTab = (simplifiedTabs: SimplifiedTab[]): void => {
  const selectedTabIndex = simplifiedTabs.findIndex(tab => tab.selected);
  if (selectedTabIndex >= 0) {
    const currentWebContentsViews = getWebContentsViews();
    if (selectedTabIndex < currentWebContentsViews.length) {
      const selectedContentView = currentWebContentsViews[selectedTabIndex];
      setSelectedWebContentsViewWithId(selectedContentView.webContents.id);
      showWebContentsView(selectedContentView);
      selectedContentView.webContents.focus();
      mainLogger.info("Layout", `Selected restored tab at index: ${selectedTabIndex}`);
    }
  }
};

export const selectContentViewAfterClosingTabWithId = (tabId: number): void => {
  const webContentsViews = getWebContentsViews();
  const currentViewIndex = webContentsViews.findIndex(view => view.webContents.id === tabId);

  if (currentViewIndex > -1) {
    const selectedWebContentsView = getSelectedWebContentsView();
    if (selectedWebContentsView?.webContents.id === tabId) {
      if (webContentsViews.length > 1) {
        if (currentViewIndex < webContentsViews.length - 1) {
          const nextView = webContentsViews[currentViewIndex + 1];
          setSelectedWebContentsViewWithId(nextView.webContents.id);
        } else if (currentViewIndex > 0) {
          const prevView = webContentsViews[currentViewIndex - 1];
          setSelectedWebContentsViewWithId(prevView.webContents.id);
        }
      }
    }
  }
}