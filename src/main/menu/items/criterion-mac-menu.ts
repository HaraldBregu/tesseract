import { MenuItem, MenuItemConstructorOptions } from "electron";
import { MenuItemId } from "../../types";
import i18next from "i18next";
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';
import { getBaseAuthToken } from '../../store';

export const buildCriterionMacMenu = (
    onClick: (menuItem: MenuItem) => void
): MenuItemConstructorOptions => {
    const baseAuthToken = getBaseAuthToken();
    const authenticated = baseAuthToken !== null && baseAuthToken !== undefined;

    const submenu: MenuItemConstructorOptions[] = [
        {
            id: MenuItemId.ABOUT,
            label: i18next.t("menu.help.about"),
            accelerator: getKeyboardShortcut(MenuItemId.ABOUT),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        {
            type: 'separator'
        },
        {
            id: MenuItemId.PREFERENCES,
            label: i18next.t('menu.preferences') + '\u2026',
            accelerator: getKeyboardShortcut(MenuItemId.PREFERENCES),
            click: (menuItem: MenuItem): void => onClick(menuItem),
        },
    ];

    // Add Shared Files menu item for authenticated users on macOS
    if (authenticated) {
        submenu.push({
            type: 'separator'
        });
        submenu.push({
            id: MenuItemId.SHARED_FILES,
            label: i18next.t("menu.file.sharedFiles"),
            enabled: true,
            click: (menuItem: MenuItem): void => onClick(menuItem),
        });
    }

    submenu.push(
        {
            type: 'separator'
        },
        {
            role: 'hide',
            label: i18next.t('criterion.hide'),
            accelerator: 'CmdOrCtrl+H',
        },
        {
            role: 'hideOthers',
            label: i18next.t('criterion.hideOthers'),
            accelerator: 'CmdOrCtrl+Alt+H',
        },
        {
            role: 'unhide',
            label: i18next.t('criterion.showAll')
        },
        {
            role: 'quit',
            accelerator: 'CmdOrCtrl+Q',
            label: i18next.t('criterion.quit')
        }
    );

    return {
        label: i18next.t('criterion.label'),
        submenu
    };
};