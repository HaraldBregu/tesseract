import { MenuItem, MenuItemConstructorOptions } from "electron";
import i18next from "i18next";
import { MenuItemId } from '../../types';
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';

export function buildDeveloperMenu(onClick: (menuItem: MenuItem) => void): MenuItemConstructorOptions {
    return {
        label: "Developer",
        submenu: [
            {
                id: MenuItemId.RELOAD,
                label: i18next.t("menu.reload"),
                accelerator: getKeyboardShortcut(MenuItemId.RELOAD),
                click: (menuItem: MenuItem): void => onClick(menuItem)
            },
            {
                id: MenuItemId.TOGGLE_DEV_TOOLS,
                label: i18next.t("menu.toggleDevTools"),
                accelerator: getKeyboardShortcut(MenuItemId.TOGGLE_DEV_TOOLS),
                click: (menuItem: MenuItem): void => onClick(menuItem)
            }
        ]
    };
}
