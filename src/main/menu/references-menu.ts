import i18next from 'i18next';
import { MenuItem, MenuItemConstructorOptions } from "electron";
import { getShortcutLabel, MenuItemId } from './menu';

let disabledReferencesMenuItemsIds: string[] = []

/**
 * Set the disabled references menu items ids
 * @param ids - The ids of the disabled references menu items
 */
export function setDisabledReferencesMenuItemsIds(ids: string[]): void {
    disabledReferencesMenuItemsIds = ids
}

/**
 * Build the references menu
 * @param onClick - The function to call when a menu item is clicked
 * @returns The references menu
 */
export function buildReferencesMenu(onClick: (menuItem: MenuItem) => void): MenuItemConstructorOptions {
    const subMenuItems: MenuItemConstructorOptions[] = [
        {
            id: MenuItemId.INSERT_NOTE,
            label: i18next.t("menu.references.addNote"),
            sublabel: getShortcutLabel("Fn+F5"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            submenu: [],
        },
        {
            id: MenuItemId.INSERT_NOTE_IN_INNER_MARGIN,
            label: i18next.t("menu.references.addNoteInInnerMargin"),
            sublabel: getShortcutLabel("Fn+F1"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            submenu: [],
        },
        {
            id: MenuItemId.INSERT_NOTE_IN_OUTER_MARGIN,
            label: i18next.t("menu.references.addNoteInOuterMargin"),
            accelerator: "Fn+F2",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.SWAP_MARGIN,
            label: i18next.t("menu.references.swapMargin"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: true,
        },
        {
            id: MenuItemId.ADD_READING_SEPARATOR,
            label: i18next.t("menu.references.addReadingSeparator"),
            accelerator: "Fn+F4",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.ADD_SIGLUM,
            label: i18next.t("menu.references.addSiglum"),
            accelerator: "Fn+F3",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.SIGLA_SETUP,
            label: i18next.t("menu.references.siglaSetup"),
            accelerator: "Fn+F6",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        { type: "separator" },
        {
            id: MenuItemId.ADD_CITATION,
            label: i18next.t("menu.references.addCitation"),
            accelerator: "CmdOrCtrl+Alt+C",
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.ADD_BIBLIOGRAPHY,
            label: i18next.t("menu.references.bibliography"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        { type: "separator" },
        {
            id: MenuItemId.REFERENCES_FORMAT,
            label: i18next.t("menu.references.referencesFormat"),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        }
    ]

    const apparatusMenuItem: MenuItemConstructorOptions = {}
    apparatusMenuItem.label = i18next.t("menu.references.addApparatus.label")
    apparatusMenuItem.submenu = []
    apparatusMenuItem.submenu.push({
        id: MenuItemId.ADD_APPARATUS_CRITICAL,
        label: i18next.t("menu.references.addApparatus.critical"),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_CRITICAL),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    apparatusMenuItem.submenu.push({
        id: MenuItemId.ADD_APPARATUS_PAGE_NOTES,
        label: i18next.t("menu.references.addApparatus.pageNotes"),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_PAGE_NOTES),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    apparatusMenuItem.submenu.push({
        id: MenuItemId.ADD_APPARATUS_SECTION_NOTES,
        label: i18next.t("menu.references.addApparatus.sectionNotes"),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_SECTION_NOTES),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    apparatusMenuItem.submenu.push({
        id: MenuItemId.ADD_APPARATUS_INNER_MARGIN,
        label: i18next.t("menu.references.addApparatus.innerMargin"),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_INNER_MARGIN),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    apparatusMenuItem.submenu.push({
        id: MenuItemId.ADD_APPARATUS_OUTER_MARGIN,
        label: i18next.t("menu.references.addApparatus.outerMargin"),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_OUTER_MARGIN),
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    subMenuItems.push(apparatusMenuItem)

    return {
        label: i18next.t("menu.references.label"),
        submenu: subMenuItems,
    }
}
