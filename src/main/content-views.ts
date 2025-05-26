import { shell, WebContentsView } from 'electron'
import { join } from 'path'
import { getBaseWindow } from './main-window'
import { NavigationRoutes } from './utils/navigation-routes'
import { getSelectedTabIndex, getTabs, setSelectedTabIndex, setTabsFromUrls } from './tabs-store'
import { getToolbarHeight, resizeToolbar } from './toolbar'
import { getRootUrl } from './utils/util'
import { is } from '@electron-toolkit/utils'

const contentViews: WebContentsView[] = []

let selectedContentView: WebContentsView | null = null

/**
 * Adds a new webContentsView to the contentViews array
 * @param onDone - A callback function that is called when the webContentsView is loaded
 * @returns The id of the new webContentsView
 */
export async function addNewWebContentsView(onDone?: (webContentsView: WebContentsView) => void): Promise<number | null> {
  const mainWindow = getBaseWindow()
  if (mainWindow === null) return null

  const webContentsView = await loadWebContentsView(NavigationRoutes.root, { bringToFront: true })
  if (webContentsView === null) return null

  if (is.dev)
    webContentsView.webContents.toggleDevTools()

  onDone?.(webContentsView)

  return webContentsView.webContents.id
}

/**
 * Loads a webContentsView from a given path
 * @param path - The path to load the webContentsView from
 * @param {bringToFront} bringToFront - Whether to bring the webContentsView to the front
 * @returns The webContentsView
 */
export function loadWebContentsView(path: string, { bringToFront = false }: { bringToFront?: boolean } = {}): Promise<WebContentsView | null> {
  return new Promise((resolve) => {

    const url = getRootUrl() + path

    const baseWindow = getBaseWindow()

    if (baseWindow === null)
      return resolve(null)

    const newContentView = new WebContentsView({
      webPreferences: {
        preload: join(__dirname, '../preload/index.mjs'),
        sandbox: false,
        nodeIntegration: false,
        contextIsolation: true,
      }
    })

    newContentView.webContents.on('did-finish-load', () => {
      if (bringToFront) {
        showWebContentsView(newContentView)
      }

      saveTabs()
      resolve(newContentView)
    })

    newContentView.webContents.on('did-fail-load', () => {
      resolve(null)
    })

    newContentView.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    contentViews.push(newContentView)
    newContentView.webContents.loadURL(url)
  })
}

export function showWebContentsView(webContentsView: WebContentsView): void {
  const baseWindow = getBaseWindow()
  if (!baseWindow) return

  const setWebContentBounds = (): void => {
    const [width, height] = baseWindow.getContentSize()

    webContentsView.setBounds({
      x: 0,
      y: getToolbarHeight(),
      width,
      height: height - getToolbarHeight()
    })
  }

  setWebContentBounds()

  baseWindow.removeAllListeners('resize')

  baseWindow.on('resize', () => {
    setWebContentBounds()
    resizeToolbar()
  })

  selectedContentView = webContentsView

  baseWindow.contentView.addChildView(webContentsView)
}

/**
 * Closes a webContentsView with a given id
 * @param id - The id of the webContentsView to close
 */
export function closeWebContentsViewWithId(id: number): void {
  const idx = contentViews.findIndex((tab) => tab.webContents.id === id)
  if (idx === -1) return

  const baseWindow = getBaseWindow()
  if (!baseWindow) return

  const webContentsViews = getWebContentsViews();

  let indexToSelect = 0;

  if (webContentsViews.length > 1) {
    const isLastTab = idx === webContentsViews.length - 1;
    const isNotFirstTab = idx > 0;

    if (isLastTab && isNotFirstTab) {
      indexToSelect = idx - 1;
    } else if (!isLastTab) {
      indexToSelect = idx + 1;
    }
  }

  setSelectedContentViewWithId(webContentsViews[indexToSelect].webContents.id)

  baseWindow.contentView.removeChildView(contentViews[idx])

  contentViews[idx].webContents.close()
  contentViews.splice(idx, 1)

  saveTabs()
}

export function hideWebContentsViewWithId(id: number): void {
  const tab = contentViews.find((tab) => tab.webContents.id === id)
  if (!tab) return

  const baseWindow = getBaseWindow()
  if (!baseWindow) return

  baseWindow.contentView.removeChildView(tab)
}

export function closeAllTabs({ save = true }: { save?: boolean } = {}): void {
  if (save) {
    saveTabs()
  }

  for (const tab of contentViews) {
    tab.webContents.close()
  }

  contentViews.splice(0, contentViews.length)
  if (!save) {
    saveTabs()
  }
}

export function getTab(id: number): WebContentsView | undefined {
  return contentViews.find((tab) => tab.webContents.id === id)
}

export function getWebContentsViews(): WebContentsView[] {
  return contentViews
}

export function getAllContentViewsIds(): number[] {
  if (contentViews.length === 0) return []
  return contentViews.map((tab) => tab.webContents.id)
}

export function getSelectedContentView(): WebContentsView | null {
  return selectedContentView
}

export function selectedWebContentsViewSend(message: string, data?): void {
  selectedContentView?.webContents.send(message, data)
}

export function setSelectedContentViewWithId(id: number): void {
  if (selectedContentView?.webContents.id === id) {
    return
  }

  const idx = contentViews.findIndex((tab) => tab.webContents.id === id)
  if (idx === -1) {
    return
  }

  showWebContentsView(contentViews[idx])
  saveSelectedTab({ tabIndex: idx })
}

function saveSelectedTab({ tabIndex = -1 }: { tabIndex?: number } = {}): void {
  if (tabIndex !== -1) {
    setSelectedTabIndex(tabIndex)
    return
  }

  if (!selectedContentView)
    return
  
  const idx = contentViews.findIndex((tab) => {
    if (selectedContentView === null) return false
    return tab.webContents.id === selectedContentView!.webContents.id
  })

  if (idx === -1) {
    return
  }

  setSelectedTabIndex(idx)
}

export function getSelectedTabId(): number {
  if (selectedContentView === null) return -1
  return selectedContentView.webContents.id
}

export function reorderTabs(ids: number[]): void {
  const newTabs = ids
    .map((id) => contentViews.find((tab) => tab.webContents.id === id))
    .filter((tab): tab is WebContentsView => tab !== undefined)

  if (newTabs.length === 0)
    return

  contentViews.splice(0, contentViews.length, ...newTabs)

  saveTabs()
  saveSelectedTab()
}

export function saveTabs(): void {
  const mainWindow = getBaseWindow()
  if (!mainWindow) return

  const tabUrls = contentViews.map((tab) => {
    const url = tab.webContents.getURL()
    const idx = url.indexOf('#')
    return idx === -1 ? '/' : url.substring(idx + 1)
  })

  setTabsFromUrls(tabUrls)
}

export async function restoreContentViews({ restore = true }: { restore?: boolean } = {}): Promise<WebContentsView | null> {
  if (!restore) {
    return loadWebContentsView(NavigationRoutes.root)
  }

  const lastSessionTabs = getTabs()

  let selectedTabIndex = getSelectedTabIndex()

  if (lastSessionTabs !== null && lastSessionTabs.length > 0) {
    if (selectedTabIndex < 0 || selectedTabIndex >= lastSessionTabs.length) {
      selectedTabIndex = 0
    }

    for (let i = 0; i < lastSessionTabs.length; i++) {
      if (i === selectedTabIndex) {
        selectedContentView = await loadWebContentsView(lastSessionTabs[i].url)
        continue
      }
      loadWebContentsView(lastSessionTabs[i].url)
    }
  }

  if (selectedContentView === null) {
    selectedContentView = await loadWebContentsView(NavigationRoutes.root)
  }

  return selectedContentView
}
