import i18next from 'i18next';
import { MenuItem, MenuItemConstructorOptions } from "electron";
import { MenuItemClickHandler, MenuItemId } from '../../types';
import { getIsNewDocument, getMenuViewMode } from '../../shared/constants';
import { getBaseAuthToken, readRecentDocuments, readRecentFilesCount } from '../../store';
import { formatFileName } from '../../shared/util';
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';
import { platform } from '@electron-toolkit/utils';
// import { DocumentTabManager } from '../../document/document-tab';

const menuItems = (onClick: MenuItemClickHandler): MenuItemConstructorOptions[] => {
    const items: MenuItemConstructorOptions[] = []

    const viewMode = getMenuViewMode()
    const isNewDocument = getIsNewDocument()

    const recentDocuments = readRecentDocuments()
    const maxRecentFiles = readRecentFilesCount()
    const recentDocumentsMenu = Array.isArray(recentDocuments) && recentDocuments.length > 0
        ? recentDocuments.slice(0, maxRecentFiles).map((doc: string) => ({
            id: MenuItemId.OPEN_RECENT_FILE,
            label: formatFileName(doc),
            click: (menuItem: MenuItem): void => onClick(menuItem, doc)
        }))
        : [{
            label: i18next.t("menu.file.noRecentDocuments"),
            enabled: false
        }];

    items.push({
        id: MenuItemId.NEW_FILE,
        label: i18next.t("menu.file.new"),
        accelerator: getKeyboardShortcut(MenuItemId.NEW_FILE),
        enabled: true,
        click: (menuItem: MenuItem): void => onClick(menuItem)
    })

    items.push({
        id: MenuItemId.OPEN_FILE,
        label: i18next.t("menu.file.open"),
        accelerator: getKeyboardShortcut(MenuItemId.OPEN_FILE),
        enabled: true,
        click: (menuItem: MenuItem): void => onClick(menuItem)
    })

    items.push({
        id: MenuItemId.OPEN_RECENT_FILE,
        label: i18next.t("menu.file.openRecent"),
        enabled: true,
        submenu: recentDocumentsMenu,
    })
    items.push({
        id: MenuItemId.CLOSE_FILE,
        label: i18next.t("menu.file.close"),
        accelerator: getKeyboardShortcut(MenuItemId.CLOSE_FILE),
        enabled: viewMode === 'critix_editor' || viewMode === 'file_viewer',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    items.push({
        id: MenuItemId.SAVE_FILE,
        label: i18next.t("menu.file.save"),
        accelerator: getKeyboardShortcut(MenuItemId.SAVE_FILE),
        enabled: viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    items.push({
        id: MenuItemId.SAVE_FILE_AS,
        label: i18next.t("menu.file.saveAs"),
        accelerator: getKeyboardShortcut(MenuItemId.SAVE_FILE_AS),
        enabled: viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    items.push({
        id: MenuItemId.RENAME_FILE,
        label: i18next.t("menu.file.rename"),
        accelerator: getKeyboardShortcut(MenuItemId.RENAME_FILE),
        enabled: viewMode === 'critix_editor' && !isNewDocument,
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    items.push({
        id: MenuItemId.MOVE_FILE,
        label: i18next.t("menu.file.moveTo"),
        accelerator: getKeyboardShortcut(MenuItemId.MOVE_FILE),
        enabled: viewMode === 'critix_editor' && !isNewDocument,
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    items.push({
        id: MenuItemId.EXPORT_TO,
        label: i18next.t("menu.file.exportTo.label"),
        enabled: viewMode === 'critix_editor',
        submenu: [
            {
                id: MenuItemId.EXPORT_TO_PDF,
                label: i18next.t("menu.file.exportTo.pdf"),
                accelerator: getKeyboardShortcut(MenuItemId.EXPORT_TO_PDF),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
            {
                id: MenuItemId.EXPORT_TO_XML_TEI,
                label: i18next.t("menu.file.exportTo.xml"),
                accelerator: getKeyboardShortcut(MenuItemId.EXPORT_TO_XML_TEI),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
        ],
    })

    items.push({
        id: MenuItemId.SAVE_AS_TEMPLATE,
        label: i18next.t("menu.file.saveAsTemplate"),
        accelerator: getKeyboardShortcut(MenuItemId.SAVE_AS_TEMPLATE),
        enabled: viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    items.push({
        id: MenuItemId.METADATA,
        label: i18next.t("menu.file.metadata"),
        accelerator: getKeyboardShortcut(MenuItemId.METADATA),
        enabled: viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    items.push({
        id: MenuItemId.PAGE_SETUP,
        label: i18next.t("menu.file.pageSetup"),
        accelerator: getKeyboardShortcut(MenuItemId.PAGE_SETUP),
        enabled: viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    items.push({
        id: MenuItemId.PRINT,
        label: i18next.t("menu.file.print"),
        accelerator: getKeyboardShortcut(MenuItemId.PRINT),
        enabled: viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    const baseAuthToken = getBaseAuthToken()
    const authenticated = baseAuthToken !== null && baseAuthToken !== undefined

    items.push({ type: "separator" })

    if (authenticated) {
        items.push({
            id: MenuItemId.CHAT,
            label: i18next.t("Open Chat"),
            enabled: viewMode === 'critix_editor',
            click: (menuItem: MenuItem): void => onClick(menuItem),
        })
    }

    items.push({ type: "separator" })

    if (authenticated) {
        items.push({
            id: MenuItemId.SHARE_FOR_COLLABORATOR,
            label: i18next.t("menu.file.shareForCollaborator"),
            enabled: viewMode === 'critix_editor',
            click: (menuItem: MenuItem): void => onClick(menuItem),
        })
    }

    if (!platform.isMacOS && authenticated) {
        items.push({
            id: MenuItemId.SHARED_FILES,
            label: i18next.t("menu.file.sharedFiles"),
            enabled: true,
            click: (menuItem: MenuItem): void => onClick(menuItem),
        })
    }

    items.push({ type: "separator" })

    if (!authenticated) {
        items.push({
            id: MenuItemId.AUTHENTICATION,
            label: i18next.t("menu.file.signin"),
            enabled: true,
            click: (menuItem: MenuItem): void => onClick(menuItem),
        })
    }

    if (authenticated) {
        items.push({
            id: MenuItemId.LOGOUT,
            label: i18next.t("menu.file.signout"),
            enabled: true,
            click: (menuItem: MenuItem): void => onClick(menuItem),
        })
    }

    return items
}

export function buildFileMenu(onClick: MenuItemClickHandler): MenuItemConstructorOptions {
    const menu: MenuItemConstructorOptions = {}
    menu.label = i18next.t("menu.file.label")
    menu.submenu = menuItems(onClick)
    return menu
}
