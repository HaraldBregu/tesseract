import { MenuItem, MenuItemConstructorOptions } from "electron";
import i18next from "i18next";
import { MenuItemId } from "./menu";

let apparatusSubMenuObjectItems: { id: string, title: string, visible: boolean }[] = []

export function setApparatusSubMenuObjectItems(items: { id: string, title: string, visible: boolean }[]): void {
    apparatusSubMenuObjectItems = items
}

export function buildViewMenu(onClick: (menuItem: MenuItem, data?: unknown) => void): MenuItemConstructorOptions {

    const apparatusSubMenuItems: MenuItemConstructorOptions[] = []

    apparatusSubMenuObjectItems.forEach((item) => {
        apparatusSubMenuItems.push({
            id: MenuItemId.VIEW_APPARATUS,
            label: item.title,
            type: item.visible ? 'checkbox' : 'normal',
            checked: item.visible,
            click: (menuItem: MenuItem): void => onClick(menuItem, item),
        })
    })

    const subMenuItems: MenuItemConstructorOptions[] = [
        {
            label: i18next.t("menu.view.apparatus.label"),
            submenu: apparatusSubMenuItems
        },
        {
            id: MenuItemId.HEADER_FOOTER,
            label: i18next.t("menu.view.headerFooter"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.TABLE_OF_CONTENTS,
            label: i18next.t("menu.view.tableOfContents"),
            accelerator: "CmdOrCtrl+Alt+T",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.TOOLBAR,
            label: i18next.t("menu.view.toolbar"),
            accelerator: "CmdOrCtrl+Alt+R",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.CUSTOMIZE_TOOLBAR,
            label: i18next.t("menu.view.customizeToolbar"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.STATUS_BAR,
            label: i18next.t("menu.view.statusBar"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.CUSTOMIZE_STATUS_BAR,
            label: i18next.t("menu.view.customizeStatusBar"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.PRINT_PREVIEW,
            label: i18next.t("menu.view.printPreview"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.SHOW_TABS_ALIGNED_HORIZONTALLY,
            label: i18next.t("menu.view.showTabsAlignedHorizontally"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.SHOW_TABS_ALIGNED_VERTICALLY,
            label: i18next.t("menu.view.showTabsAlignedVertically"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.ZOOM,
            label: i18next.t("menu.view.zoom"),
            accelerator: "CmdOrCtrl++",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.ENTER_FULL_SCREEN,
            label: i18next.t("menu.view.enterFullScreen"),
            accelerator: "Fn+F11",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            label: i18next.t("menu.view.goTo.label"),
            submenu: [
                {
                    id: MenuItemId.GO_TO_NEXT_PAGE,
                    label: i18next.t("menu.view.goTo.nextPage"),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                },
                {
                    id: MenuItemId.GO_TO_PREVIOUS_PAGE,
                    label: i18next.t("menu.view.goTo.previousPage"),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                },
                {
                    id: MenuItemId.GO_TO_FIRST_PAGE,
                    label: i18next.t("menu.view.goTo.firstPage"),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                },
                {
                    id: MenuItemId.GO_TO_LAST_PAGE,
                    label: i18next.t("menu.view.goTo.lastPage"),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                },
                {
                    id: MenuItemId.GO_TO_PAGE,
                    label: i18next.t("menu.view.goTo.page"),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                },
            ],
        },
        {
            id: MenuItemId.SYNCHRONIZE_VIEWS,
            label: i18next.t("menu.view.synchronizeViews"),
            accelerator: "CmdOrCtrl+E",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.SYNCHRONIZE_DOCUMENTS,
            label: i18next.t("menu.view.synchronizeDocuments"),
            accelerator: "CmdOrCtrl+Shift+Q",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.NON_PRINTING_CHARACTERS,
            label: i18next.t("menu.view.nonprintingCharacters"),
            accelerator: "Fn+F7",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.EXPAND_COLLAPSE,
            label: i18next.t("menu.view.expandCollapse"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.THESAURUS,
            label: i18next.t("menu.view.thesaurus"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
    ]

    return {
        label: i18next.t("menu.view.label"),
        submenu: subMenuItems
    };
}
