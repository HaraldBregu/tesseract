import { MenuItem, MenuItemConstructorOptions } from "electron";
import i18next from "i18next";
import { MenuItemId, OnMenuItemClick } from '../../types';
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';

export function buildHelpMenu(onClick: OnMenuItemClick): MenuItemConstructorOptions {
    return {
        label: i18next.t("menu.help.label"),
        submenu: [
            {
                id: MenuItemId.HELP,
                label: i18next.t("menu.help.criterionHelp"),
                accelerator: getKeyboardShortcut(MenuItemId.HELP),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
            {
                id: MenuItemId.SUBMIT_TICKET,
                label: i18next.t("menu.help.submitTicket"),
                accelerator: getKeyboardShortcut(MenuItemId.SUBMIT_TICKET),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
            {
                id: MenuItemId.ABOUT,
                label: i18next.t("menu.help.about"),
                accelerator: getKeyboardShortcut(MenuItemId.ABOUT),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
        ],
    };
}
