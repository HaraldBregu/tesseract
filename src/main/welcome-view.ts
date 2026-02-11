import { BaseWindow, shell, WebContentsView } from 'electron'
import { join } from 'node:path'
import { getRootUrl, getAppLanguage } from './shared/util'
import { getToolbarWebContentsViewHeight } from './toolbar'

const welcomeRoute: Route = "/welcome";

let welcomeWebContentsView: WebContentsView | null = null
let isWelcomeViewVisible = false

export const getWelcomeWebContentsView = (): WebContentsView | null => welcomeWebContentsView
export const isWelcomeViewShown = (): boolean => isWelcomeViewVisible

export function createWelcomeWebContentsView(baseWindow: BaseWindow | null): Promise<WebContentsView | null> {
    return new Promise((resolve) => {
        if (welcomeWebContentsView !== null)
            return resolve(welcomeWebContentsView)

        if (baseWindow === null)
            return resolve(null)

        welcomeWebContentsView = new WebContentsView({
            webPreferences: {
                preload: join(__dirname, '../preload/index.mjs'),
                sandbox: false,
                nodeIntegration: false,
                contextIsolation: true,
                partition: 'persist:welcome'
            },
        })

        welcomeWebContentsView.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url)
            return { action: 'deny' }
        })

        const bounds = baseWindow.getContentBounds()
        const toolbarHeight = getToolbarWebContentsViewHeight()

        welcomeWebContentsView.setBounds({
            x: 0,
            y: toolbarHeight,
            width: bounds.width,
            height: bounds.height - toolbarHeight
        })

        const url = getRootUrl() + welcomeRoute
        welcomeWebContentsView.webContents.loadURL(url)

        welcomeWebContentsView.webContents.on('did-finish-load', () => {
            // Send initial language to welcome view after load
            const currentLanguage = getAppLanguage();
            welcomeWebContentsView?.webContents.send("language-changed", currentLanguage);
            return resolve(welcomeWebContentsView)
        })

        welcomeWebContentsView.webContents.on('did-fail-load', () => {
            return resolve(null)
        })
    })
}

export function showWelcomeView(baseWindow: BaseWindow): void {
    if (!welcomeWebContentsView || isWelcomeViewVisible) return

    const bounds = baseWindow.getContentBounds()
    const toolbarHeight = getToolbarWebContentsViewHeight()

    welcomeWebContentsView.setBounds({
        x: 0,
        y: toolbarHeight,
        width: bounds.width,
        height: bounds.height - toolbarHeight
    })

    baseWindow.contentView.addChildView(welcomeWebContentsView)
    isWelcomeViewVisible = true

    // Handle resize
    baseWindow.removeAllListeners('resize')
    baseWindow.on('resize', () => {
        if (!welcomeWebContentsView) return
        const newBounds = baseWindow.getContentBounds()
        welcomeWebContentsView.setBounds({
            x: 0,
            y: toolbarHeight,
            width: newBounds.width,
            height: newBounds.height - toolbarHeight
        })
    })
}

export function hideWelcomeView(baseWindow: BaseWindow): void {
    if (!welcomeWebContentsView || !isWelcomeViewVisible) return

    baseWindow.contentView.removeChildView(welcomeWebContentsView)
    isWelcomeViewVisible = false
}

export function resizeWelcomeView(baseWindow: BaseWindow): void {
    if (!welcomeWebContentsView || !isWelcomeViewVisible) return

    const bounds = baseWindow.getContentBounds()
    const toolbarHeight = getToolbarWebContentsViewHeight()

    welcomeWebContentsView.setBounds({
        x: 0,
        y: toolbarHeight,
        width: bounds.width,
        height: bounds.height - toolbarHeight
    })
}
