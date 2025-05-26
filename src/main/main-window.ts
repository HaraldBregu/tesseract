import { app, BaseWindow, WebContentsView } from "electron";
import path from 'path'
import fs from 'fs'
import { is } from "@electron-toolkit/utils";
import { createToolbar } from "./toolbar";
import { restoreContentViews, saveTabs, showWebContentsView } from "./content-views";
import { mainLogger } from "./utils/logger";

let baseWindow: BaseWindow | null = null
let toolbarContentView: WebContentsView | null = null
let selectedContentView: WebContentsView | null = null

export async function initializeMainWindow(): Promise<void> {

    let iconPath = is.dev
        ? path.join(app.getAppPath(), 'buildResources', 'appIcons', 'icon.ico')
        : path.join(process.resourcesPath, 'buildResources', 'appIcons', 'app.ico');

    if (fs.existsSync(iconPath) === false) {
        mainLogger.error('------', '----------------------------------------------------------')
        mainLogger.error('DEBUG', `Icon path does not exist: ${iconPath}`)
        // Prova un percorso alternativo se il primo non esiste
        const altIconPath = path.join(app.getAppPath(), 'buildResources', 'build', 'icon.ico');
        if (fs.existsSync(altIconPath)) {
            mainLogger.info('DEBUG', `Using alternative icon path: ${altIconPath}`)
            iconPath = altIconPath;
        } else {
            mainLogger.error('DEBUG', `Alternative icon path also does not exist: ${altIconPath}`)
        }
        mainLogger.error('------', '----------------------------------------------------------')
    } else {
        mainLogger.info('DEBUG', `Icon found at: ${iconPath}`)
    }

    baseWindow = new BaseWindow({
        width: 1500,
        height: 1000,
        icon: iconPath,
        show: false,
        trafficLightPosition: {
            x: 9,
            y: 9
        },
        backgroundColor: '#FFFFFF',
    })

    app.on('activate', () => {
        showWindow()
    })

    app.on('before-quit', () => {
        saveTabs()
    })

    toolbarContentView = await createToolbar()
    if (!toolbarContentView) return
    baseWindow.contentView.addChildView(toolbarContentView)

    selectedContentView = await restoreContentViews({ restore: false })
    if (selectedContentView) {
        baseWindow.contentView.addChildView(selectedContentView)
        showWebContentsView(selectedContentView)
        selectedContentView.webContents.focus()
    }

    showWindow()
}

export function getBaseWindow(): BaseWindow | null {
    return baseWindow
}

export function getToolbarContentView(): WebContentsView | null {
    return toolbarContentView
}

export function sendToolbarContentViewMessage(message: string, data?): void {
    toolbarContentView?.webContents.send(message, data)
}

export function showWindow(): void {
    if (!baseWindow)
        return

    //? This is to prevent the window from gaining focus everytime we make a change in code.
    if (!is.dev && !process.env['ELECTRON_RENDERER_URL']) {
        baseWindow!.show()
        return
    }

    if (!baseWindow.isVisible()) {
        baseWindow!.show()
    }
}
