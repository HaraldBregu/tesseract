import { MenuItem, MenuItemConstructorOptions } from "electron";
import { MenuItemId } from "../../types";
import i18n from 'i18next';
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';

export const buildSettingsMenu = (
    onClick: (menuItem: MenuItem) => void
): MenuItemConstructorOptions => {
    return {
        label: i18n.t('menu.settings'),
        submenu: [
            {
                id: MenuItemId.PREFERENCES,
                label: i18n.t('menu.preferences'),
                accelerator: getKeyboardShortcut(MenuItemId.PREFERENCES),
                click: (menuItem: MenuItem): void => onClick(menuItem),
            },
        ]
    };
};