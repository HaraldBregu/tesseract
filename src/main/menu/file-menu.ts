import i18next from 'i18next';
import { MenuItem, MenuItemConstructorOptions } from "electron";
import { MenuItemId } from './menu';
import path from "path";
import { getRecentDocuments } from '../document';

export function buildFileMenu(onClick: (menuItem: MenuItem, data?: unknown) => void): MenuItemConstructorOptions {

    const recentDocumentsMenu = Array.isArray(getRecentDocuments()) && getRecentDocuments().length > 0 ? [...getRecentDocuments()].map((doc: string) => ({
        id: MenuItemId.OPEN_RECENT_FILE,
        label: path.basename(doc),
        click: (menuItem: MenuItem): void => onClick(menuItem, doc)
    }))
        : [{
            label: i18next.t("menu.file.noRecentDocuments"),
            enabled: false
        }];

    const fileMenu: MenuItemConstructorOptions = {}

    fileMenu.label = i18next.t("menu.file.label")

    fileMenu.submenu = []

    fileMenu.submenu.push({
        id: MenuItemId.NEW_FILE,
        label: i18next.t("menu.file.new"),
        accelerator: "CmdOrCtrl+N",
        // sublabel: getShortcutLabel('(CmdOrCtrl+N)'),
        click: (menuItem: MenuItem): void => onClick(menuItem)
    })

    fileMenu.submenu.push({
        id: MenuItemId.OPEN_FILE,
        label: i18next.t("menu.file.open"),
        accelerator: "CmdOrCtrl+O",
        // sublabel: getShortcutLabel('(CmdOrCtrl+O)'),
        click: (menuItem: MenuItem): void => onClick(menuItem)
    })

    fileMenu.submenu.push({
        id: MenuItemId.OPEN_RECENT_FILE,
        label: i18next.t("menu.file.openRecent"),
        // sublabel: getShortcutLabel('(Shift+CmdOrCtrl+O)'),
        submenu: recentDocumentsMenu,
    })

    fileMenu.submenu.push({
        id: MenuItemId.IMPORT_FILE,
        label: i18next.t("menu.file.import"),
        accelerator: "CmdOrCtrl+Alt+I",
        click: (menuItem: MenuItem): void => onClick(menuItem)
    })

    fileMenu.submenu.push({ type: "separator" })

    fileMenu.submenu.push({
        id: MenuItemId.CLOSE_FILE,
        label: i18next.t("menu.file.close"),
        accelerator: "CmdOrCtrl+W",
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({
        id: MenuItemId.SAVE_FILE,
        label: i18next.t("menu.file.save"),
        accelerator: "CmdOrCtrl+S",
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({
        id: MenuItemId.SAVE_FILE_AS,
        label: i18next.t("menu.file.saveAs"),
        accelerator: "CmdOrCtrl+Alt+S",
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({
        id: MenuItemId.RENAME_FILE,
        label: i18next.t("menu.file.rename"),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({
        id: MenuItemId.MOVE_FILE,
        label: i18next.t("menu.file.moveTo"),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({
        id: MenuItemId.REVERT_FILE_TO,
        label: i18next.t("menu.file.revertTo.label"),
        // sublabel: getShortcutLabel('(CmdOrCtrl+S)'),
        submenu: [
            {
                id: MenuItemId.EXPORT_TO_PDF,
                label: i18next.t("menu.file.revertTo.lastSaved"),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
            {
                id: MenuItemId.EXPORT_TO_ODT,
                label: i18next.t("menu.file.revertTo.browse"),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
        ],
    })

    fileMenu.submenu.push({ type: "separator" })

    fileMenu.submenu.push({
        id: MenuItemId.SHARE_FOR_REVIEW,
        label: i18next.t("menu.file.shareForReview"),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({
        id: MenuItemId.LOCK_FILE,
        label: i18next.t("menu.file.lock"),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({
        id: MenuItemId.UNLOCK_FILE,
        label: i18next.t("menu.file.unlock"),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({ type: "separator" })

    fileMenu.submenu.push({
        id: MenuItemId.EXPORT_TO,
        label: i18next.t("menu.file.exportTo.label"),
        submenu: [
            {
                id: MenuItemId.EXPORT_TO_PDF,
                label: i18next.t("menu.file.exportTo.pdf"),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
            {
                id: MenuItemId.EXPORT_TO_ODT,
                label: i18next.t("menu.file.exportTo.odt"),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
            {
                id: MenuItemId.EXPORT_TO_XML,
                label: i18next.t("menu.file.exportTo.xml"),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
        ],
    })

    fileMenu.submenu.push({
        id: MenuItemId.LANGUAGE_AND_REGION,
        label: i18next.t("menu.file.language&Region"),
        accelerator: "CmdOrCtrl+Alt+L",
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({ type: "separator" })

    fileMenu.submenu.push({
        id: MenuItemId.SAVE_AS_TEMPLATE,
        label: i18next.t("menu.file.saveAsTemplate"),
        accelerator: "CmdOrCtrl+Shift+S",
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({ type: "separator" })

    fileMenu.submenu.push({
        id: MenuItemId.METADATA,
        label: i18next.t("menu.file.metadata"),
        accelerator: "CmdOrCtrl+M",
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({ type: "separator" })

    fileMenu.submenu.push({
        id: MenuItemId.LAYOUT_PAGE_SETUP,
        label: i18next.t("menu.file.pageSetup"),
        accelerator: "Alt+CmdOrCtrl+P",
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    fileMenu.submenu.push({
        id: MenuItemId.PRINT,
        label: i18next.t("menu.file.print"),
        accelerator: "CmdOrCtrl+P",
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    return fileMenu
}