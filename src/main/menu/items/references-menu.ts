import i18next from 'i18next';
import { MenuItem, MenuItemConstructorOptions } from "electron";
import { MenuItemId } from '../../types';
import { getMenuViewMode } from '../../shared/constants';
import { formatShortcutForDisplay, getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';


let referencesMenuCurrentContext: "maintext_editor" | "apparatus_editor" = "maintext_editor"
let disabledReferencesMenuItemsIds: string[] = []
let referencesMenuApparatuses: DocumentApparatus[] = [];
let enabledApparatuses: DocumentApparatus[] = [];
let addNoteMenuItemEnabled: boolean = true
let addReadingsEnabled: boolean = true
let insertSiglumMenuItemEnabled: boolean = true
let addCitationMenuItemEnabled: boolean = true

export function setCurrentSection(section: string): void {
    const isTocSection = section === 'toc';
    const isIntroductionSection = section === 'introduction';
    const isBibliographySection = section === 'bibliography';
    if (isTocSection) {
        enabledApparatuses = [];
    } else if (isIntroductionSection || isBibliographySection) {
        enabledApparatuses = referencesMenuApparatuses.filter((apparatus) => apparatus.type === 'PAGE_NOTES' || apparatus.type === 'SECTION_NOTES');
    } else {
        enabledApparatuses = referencesMenuApparatuses;
    }
}

export function setReferencesMenuCurrentContext(context: "maintext_editor" | "apparatus_editor"): void {
    referencesMenuCurrentContext = context
}

export function getReferencesMenuCurrentContext(): "maintext_editor" | "apparatus_editor" {
    return referencesMenuCurrentContext
}

export function setDisabledReferencesMenuItemsIds(ids: string[]): void {
    disabledReferencesMenuItemsIds = ids;
}

export function getDisabledReferencesMenuItemsIds(): string[] {
    return disabledReferencesMenuItemsIds;
}

export function setReferencesMenuApparatuses(apparatuses: DocumentApparatus[]): void {
    referencesMenuApparatuses = apparatuses
}

export function getReferencesMenuApparatuses(): DocumentApparatus[] {
    return referencesMenuApparatuses
}

export function setAddNoteMenuItemEnabled(enabled: boolean): void {
    addNoteMenuItemEnabled = enabled
    addReadingsEnabled = !addNoteMenuItemEnabled
}

export function getAddNoteMenuItemEnabled(): boolean {
    return addNoteMenuItemEnabled;
}

export function setAddReadingsEnabled(enabled: boolean): void {
    addReadingsEnabled = enabled
    addNoteMenuItemEnabled = !addReadingsEnabled
}

export function getAddReadingsEnabled(): boolean {
    return addReadingsEnabled;
}

export function setSiglumMenuItemEnabled(value: boolean): void {
    insertSiglumMenuItemEnabled = value;
}

export function getSiglumMenuItemEnabled(): boolean {
    return insertSiglumMenuItemEnabled;
}

export function setAddCitationMenuItemEnabled(enabled: boolean): void {
    addCitationMenuItemEnabled = enabled;
}

export function getAddCitationMenuItemEnabled(): boolean {
    return addCitationMenuItemEnabled;
}

/**
 * Build the references menu
 * @param onClick - The function to call when a menu item is clicked
 * @returns The references menu
 */
export function buildReferencesMenu(onClick: (menuItem: MenuItem, data?: unknown) => void): MenuItemConstructorOptions {
    const viewMode = getMenuViewMode()
    const insertNoteEnabled = viewMode === 'critix_editor' && addNoteMenuItemEnabled && referencesMenuCurrentContext === "maintext_editor"


    const menu: MenuItemConstructorOptions = {}
    menu.label = i18next.t("menu.references.addApparatus.label")
    menu.enabled = viewMode === 'critix_editor'
    menu.submenu = []
    menu.submenu.push({
        id: MenuItemId.ADD_APPARATUS_CRITICAL,
        label: i18next.t("menu.references.addApparatus.critical"),
        accelerator: getKeyboardShortcut(MenuItemId.ADD_APPARATUS_CRITICAL),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_CRITICAL) && viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    menu.submenu.push({
        id: MenuItemId.ADD_APPARATUS_PAGE_NOTES,
        label: i18next.t("menu.references.addApparatus.pageNotes"),
        accelerator: getKeyboardShortcut(MenuItemId.ADD_APPARATUS_PAGE_NOTES),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_PAGE_NOTES) && viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    menu.submenu.push({
        id: MenuItemId.ADD_APPARATUS_SECTION_NOTES,
        label: i18next.t("menu.references.addApparatus.sectionNotes"),
        accelerator: getKeyboardShortcut(MenuItemId.ADD_APPARATUS_SECTION_NOTES),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_SECTION_NOTES) && viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    menu.submenu.push({
        id: MenuItemId.ADD_APPARATUS_INNER_MARGIN,
        label: i18next.t("menu.references.addApparatus.innerMargin"),
        accelerator: getKeyboardShortcut(MenuItemId.ADD_APPARATUS_INNER_MARGIN),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_INNER_MARGIN) && viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })
    menu.submenu.push({
        id: MenuItemId.ADD_APPARATUS_OUTER_MARGIN,
        label: i18next.t("menu.references.addApparatus.outerMargin"),
        accelerator: getKeyboardShortcut(MenuItemId.ADD_APPARATUS_OUTER_MARGIN),
        enabled: !disabledReferencesMenuItemsIds.includes(MenuItemId.ADD_APPARATUS_OUTER_MARGIN) && viewMode === 'critix_editor',
        click: (menuItem: MenuItem): void => onClick(menuItem),
    })

    const subMenuItems: MenuItemConstructorOptions[] = [
        {
            id: MenuItemId.INSERT_NOTE,
            label: (() => {
                const baseLabel = i18next.t("menu.references.addNote");
                const shortcut = getKeyboardShortcut(MenuItemId.INSERT_NOTE);
                return shortcut ? `${baseLabel}\t\t\t${formatShortcutForDisplay(shortcut)}` : baseLabel;
            })(),
            type: "submenu",
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: insertNoteEnabled && enabledApparatuses.length > 0,
            submenu: enabledApparatuses.map((apparatus) => ({
                id: MenuItemId.INSERT_NOTE_TO_APPARATUS,
                label: `${apparatus.title} (${apparatus.type})`,
                click: (menuItem: MenuItem): void => onClick(menuItem, apparatus.id),
                enabled: insertNoteEnabled,
            })),
        },
        {
            id: MenuItemId.SWAP_MARGIN,
            label: i18next.t("menu.references.swapMargin"),
            accelerator: getKeyboardShortcut(MenuItemId.SWAP_MARGIN),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor'
                && referencesMenuApparatuses.some(apparatus => apparatus.type === 'INNER_MARGIN')
                && referencesMenuApparatuses.some(apparatus => apparatus.type === 'OUTER_MARGIN'),
        },
        {
            id: MenuItemId.ADD_READING,
            label: i18next.t("menu.references.addReading"),
            enabled: viewMode === 'critix_editor' && addReadingsEnabled && referencesMenuCurrentContext === "apparatus_editor",
            submenu: [
                {
                    label: (() => {
                        const baseLabel = i18next.t("menu.references.addReadingType");
                        const shortcut = getKeyboardShortcut(MenuItemId.INSERT_READING_TYPE);
                        return shortcut ? `${baseLabel}\t\t\t${formatShortcutForDisplay(shortcut)}` : baseLabel;
                    })(),
                    submenu: [
                        {
                            id: MenuItemId.ADD_READING_TYPE_ADD,
                            label: i18next.t("menu.references.addReadingTypeAdd"),
                            accelerator: getKeyboardShortcut(MenuItemId.ADD_READING_TYPE_ADD),
                            enabled: viewMode === 'critix_editor' && addReadingsEnabled && referencesMenuCurrentContext === "apparatus_editor",
                            click: (menuItem: MenuItem): void => onClick(menuItem),
                        },
                        {
                            id: MenuItemId.ADD_READING_TYPE_OM,
                            label: i18next.t("menu.references.addReadingTypeOm"),
                            accelerator: getKeyboardShortcut(MenuItemId.ADD_READING_TYPE_OM),
                            enabled: viewMode === 'critix_editor' && addReadingsEnabled && referencesMenuCurrentContext === "apparatus_editor",
                            click: (menuItem: MenuItem): void => onClick(menuItem),
                        },
                        {
                            id: MenuItemId.ADD_READING_TYPE_TR,
                            label: i18next.t("menu.references.addReadingTypeTr"),
                            accelerator: getKeyboardShortcut(MenuItemId.ADD_READING_TYPE_TR),
                            enabled: viewMode === 'critix_editor' && addReadingsEnabled && referencesMenuCurrentContext === "apparatus_editor",
                            click: (menuItem: MenuItem): void => onClick(menuItem),
                        },
                        {
                            id: MenuItemId.ADD_READING_TYPE_DEL,
                            label: i18next.t("menu.references.addReadingTypeDel"),
                            accelerator: getKeyboardShortcut(MenuItemId.ADD_READING_TYPE_DEL),
                            enabled: viewMode === 'critix_editor' && addReadingsEnabled && referencesMenuCurrentContext === "apparatus_editor",
                            click: (menuItem: MenuItem): void => onClick(menuItem),
                        },
                        {
                            id: MenuItemId.ADD_READING_TYPE_CUSTOM,
                            label: i18next.t("menu.references.addReadingTypeCustom"),
                            accelerator: getKeyboardShortcut(MenuItemId.ADD_READING_TYPE_CUSTOM),
                            enabled: viewMode === 'critix_editor' && addReadingsEnabled && referencesMenuCurrentContext === "apparatus_editor",
                            click: (menuItem: MenuItem): void => onClick(menuItem),
                        },
                    ]
                },
                {
                    id: MenuItemId.ADD_READING_SEPARATOR,
                    label: i18next.t("menu.references.addReadingSeparator"),
                    accelerator: getKeyboardShortcut(MenuItemId.ADD_READING_SEPARATOR),
                    enabled: viewMode === 'critix_editor' && addReadingsEnabled && referencesMenuCurrentContext === "apparatus_editor",
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                },
            ]
        },
        {
            id: MenuItemId.ADD_SIGLUM,
            label: i18next.t("menu.references.addSiglum"),
            accelerator: getKeyboardShortcut(MenuItemId.ADD_SIGLUM),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor' && insertSiglumMenuItemEnabled,
        },
        {
            id: MenuItemId.SIGLA_SETUP,
            label: i18next.t("menu.references.siglaSetup"),
            accelerator: getKeyboardShortcut(MenuItemId.SIGLA_SETUP),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.ADD_CITATION,
            label: i18next.t("menu.references.addCitation"),
            accelerator: getKeyboardShortcut(MenuItemId.ADD_CITATION),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor' && addCitationMenuItemEnabled,
        },
        {
            id: MenuItemId.ADD_BIBLIOGRAPHY,
            label: i18next.t("menu.references.bibliography"),
            accelerator: getKeyboardShortcut(MenuItemId.ADD_BIBLIOGRAPHY),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.REFERENCES_FORMAT,
            label: i18next.t("menu.references.referencesFormat"),
            accelerator: getKeyboardShortcut(MenuItemId.REFERENCES_FORMAT),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },

    ]
    subMenuItems.push(menu)

    return {
        label: i18next.t("menu.references.label"),
        submenu: subMenuItems,
    }
}
