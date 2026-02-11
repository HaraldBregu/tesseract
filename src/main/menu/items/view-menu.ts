import { MenuItem, MenuItemConstructorOptions } from "electron";
import i18next from "i18next";
import { MenuItemId } from "../../types";
import { getMenuViewMode } from "../../shared/constants";
import { readStatusbarVisibility, readToolbarIsVisible, readZoom, storeZoom } from "../../store";
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';

let apparatusSubMenuObjectItems: Apparatus[] = []
let tocVisible = false;
let enableTocVisibilityMenuItem = false;
let printPreviewVisible = false;

export function setEnableTocVisibilityMenuItem(enable: boolean): void {
    enableTocVisibilityMenuItem = enable
}

export function getEnableTocVisibilityMenuItem(): boolean {
    return enableTocVisibilityMenuItem
}

export function setApparatusSubMenuObjectItems(items: Apparatus[]): void {
    apparatusSubMenuObjectItems = items
}

export function getApparatusSubMenuObjectItems(): Apparatus[] {
    return apparatusSubMenuObjectItems;
}

export function setTocVisible(visible: boolean): void {
    tocVisible = visible
}

export function getTocVisible(): boolean {
    return tocVisible;
}

export function setPrintPreviewVisible(visible: boolean): void {
    printPreviewVisible = visible
}

export function getPrintPreviewVisible(): boolean {
    return printPreviewVisible;
}

const generateZoomValues = (): number[] => {
    // 20%, 30%, 40%, 50%
    const firstSeries = Array.from({ length: 4 }, (_, i) => i * 10 + 20);

    // 100%, 150%, 200%, 250%, 300%, 350%, 400%, 450%, 500%
    const secondSeries = Array.from({ length: ((600 - 100) / 50) + 1 }, (_, i) => 100 + i * 50)
        .filter(val => val > 0 && val <= 500);

    return [...firstSeries, ...secondSeries];
};


export function buildViewMenu(onClick: (menuItem: MenuItem, data?: unknown) => void): MenuItemConstructorOptions {

    const viewMode = getMenuViewMode()
    const currentZoom = parseInt(readZoom());

    const menu: MenuItemConstructorOptions = {}
    menu.label = i18next.t("menu.view.label")

    const apparatusSubMenuItems: MenuItemConstructorOptions[] = []
    let zoomSubMenuItems: MenuItemConstructorOptions[] = [];

    apparatusSubMenuObjectItems.forEach((item) => {
        apparatusSubMenuItems.push({
            id: MenuItemId.TOGGLE_VIEW_APPARATUS,
            label: `${item.title} (${item.type})`,
            type: item.visible ? 'checkbox' : 'normal',
            checked: item.visible,
            enabled: true,
            click: (menuItem: MenuItem): void => onClick(menuItem, item)
        })

        // if (apparatusSubMenuObjectItems.filter(({ visible }) => visible).length === 1 && item.visible) {
        //     apparatusSubMenuItems.push({
        //         id: MenuItemId.TOGGLE_VIEW_APPARATUS,
        //         label: `${item.title} (${item.type})`,
        //         type: item.visible ? 'checkbox' : 'normal',
        //         checked: item.visible,
        //         enabled: false,
        //         click: (menuItem: MenuItem): void => onClick(menuItem, item)
        //     })
        // } else {
        //     apparatusSubMenuItems.push({
        //         id: MenuItemId.TOGGLE_VIEW_APPARATUS,
        //         label: `${item.title} (${item.type})`,
        //         type: item.visible ? 'checkbox' : 'normal',
        //         checked: item.visible,
        //         enabled: true,
        //         click: (menuItem: MenuItem): void => onClick(menuItem, item)
        //     })
        // }
    })

    const zoomValues = generateZoomValues();
    zoomSubMenuItems = zoomValues.map(value => ({
        id: MenuItemId.ZOOM,
        label: `${value}%`,
        type: 'radio' as const,
        checked: value === currentZoom,
        click: (menuItem: MenuItem): void => {
            storeZoom(value.toString());
            onClick(menuItem, value.toString())
        }
    }));

    const subMenuItems: MenuItemConstructorOptions[] = [
        {
            label: i18next.t("menu.view.apparatus.label"),
            enabled: viewMode === 'critix_editor',
            submenu: apparatusSubMenuItems
        },
        {
            id: MenuItemId.TABLE_OF_CONTENTS,
            label: i18next.t("menu.view.tableOfContents"),
            type: 'checkbox',
            checked: tocVisible,
            accelerator: getKeyboardShortcut(MenuItemId.TABLE_OF_CONTENTS),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor' && enableTocVisibilityMenuItem,
        },
        {
            id: MenuItemId.TOOLBAR,
            label: i18next.t("menu.view.toolbar"),
            type: 'checkbox',
            checked: readToolbarIsVisible(),
            accelerator: getKeyboardShortcut(MenuItemId.TOOLBAR),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.CUSTOMIZE_TOOLBAR,
            label: i18next.t("menu.view.customizeToolbar"),
            type: 'normal',
            accelerator: getKeyboardShortcut(MenuItemId.CUSTOMIZE_TOOLBAR),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.STATUS_BAR,
            label: i18next.t("menu.view.statusBar"),
            type: 'checkbox',
            checked: readStatusbarVisibility(),
            accelerator: getKeyboardShortcut(MenuItemId.STATUS_BAR),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.CUSTOMIZE_STATUS_BAR,
            label: i18next.t("menu.view.customizeStatusBar"),
            type: 'normal',
            accelerator: getKeyboardShortcut(MenuItemId.CUSTOMIZE_STATUS_BAR),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.PRINT_PREVIEW,
            label: i18next.t("menu.view.printPreview"),
            type: 'checkbox',
            checked: printPreviewVisible,
            accelerator: getKeyboardShortcut(MenuItemId.PRINT_PREVIEW),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.ZOOM,
            label: i18next.t("menu.view.zoom"),
            submenu: zoomSubMenuItems,
        },
        {
            id: MenuItemId.EXPAND_COLLAPSE,
            label: i18next.t("menu.view.expandCollapse"),
            type: 'normal',
            accelerator: getKeyboardShortcut(MenuItemId.EXPAND_COLLAPSE),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
    ]

    menu.submenu = subMenuItems

    return menu
}
