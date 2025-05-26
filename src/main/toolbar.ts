import { shell, WebContentsView } from 'electron'
import { join } from 'path'
import { getBaseWindow } from './main-window'
import { NavigationRoutes } from './utils/navigation-routes'
import { getRootUrl } from './utils/util'
import { is } from '@electron-toolkit/utils'

const toolbarHeight = 32

let toolbarView: WebContentsView | null = null

export function createToolbar(): Promise<WebContentsView | null> {
  return new Promise((resolve) => {

    if (toolbarView !== null) {
      return resolve(toolbarView)
    }

    const baseWindow = getBaseWindow()

    if (baseWindow === null) {
      return resolve(null)
    }

    toolbarView = new WebContentsView({
      webPreferences: {
        preload: join(__dirname, '../preload/index.mjs'),
        sandbox: false,
        nodeIntegration: false,
        contextIsolation: true,
      }
    })

    toolbarView.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    const bounds = baseWindow.getBounds()

    toolbarView.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: toolbarHeight
    })

    baseWindow.on('resize', () => {
      const newBounds = baseWindow.getBounds()
      if (toolbarView === null) {
        return
      }
      toolbarView.setBounds({
        x: 0,
        y: 0,
        width: newBounds.width,
        height: toolbarHeight
      })
    })

    const url = getRootUrl() + NavigationRoutes.toolbar
    toolbarView.webContents.loadURL(url)

    toolbarView.webContents.on('did-finish-load', () => {
      return resolve(toolbarView)
    })

    toolbarView.webContents.on('did-fail-load', () => {
      return resolve(null)
    })

    if (is.dev) {
      //toolbarView.webContents.toggleDevTools()
    }
  })
}

export function getToolbarHeight(): number {
  return toolbarHeight
}

export function getToolbar(): WebContentsView | null {
  return toolbarView
}

export function resizeToolbar(): void {
  const baseWindow = getBaseWindow()
  if (!baseWindow) {
    return
  }

  const newBounds = baseWindow.getBounds()
  if (toolbarView === null) {
    return
  }
  
  toolbarView.setBounds({
    x: 0,
    y: 0,
    width: newBounds.width,
    height: toolbarHeight
  })
}
