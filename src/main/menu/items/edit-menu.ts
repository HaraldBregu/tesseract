import i18next from 'i18next';
import { MenuItem, MenuItemConstructorOptions } from "electron";
import { MenuItemId } from '../../types';
import { getMenuViewMode } from '../../shared/constants';
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';

export function buildEditMenu(onClick: (menuItem: MenuItem) => void): MenuItemConstructorOptions {

    const viewMode = getMenuViewMode()

    const menu: MenuItemConstructorOptions = {}
    menu.label = i18next.t("menu.edit.label")
    menu.submenu = [
        {
            id: MenuItemId.FIND_AND_REPLACE,
            label: i18next.t("menu.edit.find.label"),
            accelerator: getKeyboardShortcut(MenuItemId.FIND_AND_REPLACE),
            enabled: viewMode === 'critix_editor',
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.UNDO,
            label: i18next.t("menu.edit.undo"),
            accelerator: getKeyboardShortcut(MenuItemId.UNDO),
            enabled: viewMode === 'critix_editor',
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.REDO,
            label: i18next.t("menu.edit.redo"),
            accelerator: getKeyboardShortcut(MenuItemId.REDO),
            enabled: viewMode === 'critix_editor',
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.CUT,
            label: i18next.t("menu.edit.cut"),
            accelerator: getKeyboardShortcut(MenuItemId.CUT),
            enabled: viewMode === 'critix_editor',
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.COPY,
            label: i18next.t("menu.edit.copy"),
            accelerator: getKeyboardShortcut(MenuItemId.COPY),
            enabled: viewMode === 'critix_editor',
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            id: MenuItemId.PASTE,
            label: i18next.t("menu.edit.paste"),
            accelerator: getKeyboardShortcut(MenuItemId.PASTE),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.COPY_STYLE,
            label: i18next.t("menu.edit.copyStyle"),
            accelerator: getKeyboardShortcut(MenuItemId.COPY_STYLE),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.PASTE_STYLE,
            label: i18next.t("menu.edit.pasteStyle"),
            accelerator: getKeyboardShortcut(MenuItemId.PASTE_STYLE),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.PASTE_TEXT_WITHOUT_FORMATTING,
            label: i18next.t("menu.edit.pasteTextWithoutFormatting"),
            accelerator: getKeyboardShortcut(MenuItemId.PASTE_TEXT_WITHOUT_FORMATTING),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.DELETE_SELECTION,
            label: i18next.t("menu.edit.delete"),
            accelerator: getKeyboardShortcut(MenuItemId.DELETE_SELECTION),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.SELECT_ALL,
            label: i18next.t("menu.edit.selectAll"),
            accelerator: getKeyboardShortcut(MenuItemId.SELECT_ALL),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
        {
            id: MenuItemId.DESELECT_ALL,
            label: i18next.t("menu.edit.deSelectAll"),
            accelerator: getKeyboardShortcut(MenuItemId.DESELECT_ALL),
            click: (menuItem: MenuItem): void => onClick(menuItem),
            enabled: viewMode === 'critix_editor',
        },
    ]

    return menu;
}
