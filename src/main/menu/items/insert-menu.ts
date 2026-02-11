import i18next from 'i18next';
import { MenuItem, MenuItemConstructorOptions } from "electron";
import { MenuItemId } from '../../types';
import { getMenuViewMode } from '../../shared/constants';
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';
import { getReferencesMenuCurrentContext } from './references-menu';

// This will be set by the main process when line number settings change
let currentLineNumberValue = 0;
let isEnabled = true;
let addCommentMenuItemEnabled = true;
let addBookmarkMenuItemEnabled = true;
let linkMenuItemEnabled = false; // New state for link button
let removeLinkMenuItemEnabled = false; // New state for remove link button
let symbolMenuItemEnabled = false;

export function setCurrentLineNumberValue(value: number): void {
    currentLineNumberValue = value;
}

export function getCurrentLineNumberValue(): number {
    return currentLineNumberValue;
}

export function setInsertMenuEnabled(value: boolean): void {
    isEnabled = value;
}

export function getInsertMenuEnabled(): boolean {
    return isEnabled;
}

export function setLinkMenuItemEnabled(enabled: boolean): void {
    linkMenuItemEnabled = enabled;
}

export function getLinkMenuItemEnabled(): boolean {
    return linkMenuItemEnabled;
}

export function setRemoveLinkMenuItemEnabled(enabled: boolean): void {
    removeLinkMenuItemEnabled = enabled;
}

export function getRemoveLinkMenuItemEnabled(): boolean {
    return removeLinkMenuItemEnabled;
}

export function setSymbolMenuItemEnabled(enabled: boolean): void {
    symbolMenuItemEnabled = enabled;
}

export function getSymbolMenuItemEnabled(): boolean {
    return symbolMenuItemEnabled;
}

export function setAddCommentMenuItemEnabled(enabled: boolean): void {
    addCommentMenuItemEnabled = enabled;
}

export function getAddCommentMenuItemEnabled(): boolean {
    return addCommentMenuItemEnabled;
}

export function setAddBookmarkMenuItemEnabled(enabled: boolean): void {
    addBookmarkMenuItemEnabled = enabled;
}

export function getAddBookmarkMenuItemEnabled(): boolean {
    return addBookmarkMenuItemEnabled;
}

export function buildInsertMenu(onClick: (menuItem: MenuItem) => void): MenuItemConstructorOptions {

    const viewMode = getMenuViewMode()
    // Use the global current line number value instead of reading from document
    const editorContext = getReferencesMenuCurrentContext();
    const isMainTextEditor = editorContext === "maintext_editor";

    const menu: MenuItemConstructorOptions = {}
    menu.label = i18next.t("menu.insert.label")
    menu.submenu = [
        {
            id: MenuItemId.INSERT_COMMENT,
            label: i18next.t("menu.insert.comment"),
            accelerator: getKeyboardShortcut(MenuItemId.INSERT_COMMENT),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: getInsertMenuEnabled() && viewMode === 'critix_editor' && addCommentMenuItemEnabled,
        },
        {
            id: MenuItemId.INSERT_BOOKMARK,
            label: i18next.t("menu.insert.bookmark"),
            accelerator: getKeyboardShortcut(MenuItemId.INSERT_BOOKMARK),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: getInsertMenuEnabled() && viewMode === 'critix_editor' && addBookmarkMenuItemEnabled,
        },
        {
            id: MenuItemId.INSERT_LINK,
            label: i18next.t("menu.insert.link"),
            accelerator: getKeyboardShortcut(MenuItemId.INSERT_LINK),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: getInsertMenuEnabled() && viewMode === 'critix_editor' && getLinkMenuItemEnabled(),
        },
        {
            id: MenuItemId.REMOVE_LINK,
            label: i18next.t("menu.format.removeLink"),
            accelerator: getKeyboardShortcut(MenuItemId.REMOVE_LINK),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: getInsertMenuEnabled() && viewMode === "critix_editor" && getRemoveLinkMenuItemEnabled(),
        },
        {
            id: MenuItemId.INSERT_SYMBOL,
            label: i18next.t("menu.insert.symbol"),
            accelerator: getKeyboardShortcut(MenuItemId.INSERT_SYMBOL),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: getInsertMenuEnabled() && viewMode === 'critix_editor' && getSymbolMenuItemEnabled(),
        },
        {
            id: MenuItemId.INSERT_PAGE_BREAK,
            label: i18next.t("menu.insert.pageBreak"),
            accelerator: getKeyboardShortcut(MenuItemId.INSERT_PAGE_BREAK),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: getInsertMenuEnabled() && viewMode === 'critix_editor' && isMainTextEditor,
        },
        {
            id: MenuItemId.INSERT_LINE_NUMBER,
            label: i18next.t("menu.insert.lineNumber.label"),
            enabled: getInsertMenuEnabled() && viewMode === 'critix_editor',
            type: "submenu",
            submenu: [
                {
                    id: MenuItemId.INSERT_LINE_NUMBER_NONE,
                    label: i18next.t("menu.insert.lineNumber.none"),
                    accelerator: getKeyboardShortcut(MenuItemId.INSERT_LINE_NUMBER_NONE),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                    type: 'radio',
                    checked: getCurrentLineNumberValue() === 0
                },
                {
                    id: MenuItemId.INSERT_LINE_NUMBER_EACH_5_LINE,
                    label: i18next.t("menu.insert.lineNumber.each5Line"),
                    accelerator: getKeyboardShortcut(MenuItemId.INSERT_LINE_NUMBER_EACH_5_LINE),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                    type: 'radio',
                    checked: getCurrentLineNumberValue() === 5
                },
                {
                    id: MenuItemId.INSERT_LINE_NUMBER_EACH_10_LINE,
                    label: i18next.t("menu.insert.lineNumber.every10Lines"),
                    accelerator: getKeyboardShortcut(MenuItemId.INSERT_LINE_NUMBER_EACH_10_LINE),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                    type: 'radio',
                    checked: getCurrentLineNumberValue() === 10
                },
                {
                    id: MenuItemId.INSERT_LINE_NUMBER_EACH_15_LINE,
                    label: i18next.t("menu.insert.lineNumber.every15Lines"),
                    accelerator: getKeyboardShortcut(MenuItemId.INSERT_LINE_NUMBER_EACH_15_LINE),
                    click: (menuItem: MenuItem): void => onClick(menuItem),
                    type: 'radio',
                    checked: getCurrentLineNumberValue() === 15
                },
            ],
        },
    ]

    return menu
}