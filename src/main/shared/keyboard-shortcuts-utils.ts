import { keyboardShortcutsManager } from "./keyboard-shortcuts-manager";
import { platform } from "@electron-toolkit/utils";

export function getKeyboardShortcut(menuItemId: string): string | undefined {
    return keyboardShortcutsManager.getShortcut(menuItemId);
}

export function formatShortcutForDisplay(shortcut: string): string {
    if (!shortcut) return '';

    if (platform.isMacOS) {
        return shortcut
            .replace(/CmdOrCtrl/g, '⌘')
            .replace(/Cmd/g, '⌘')
            .replace(/Alt/g, '⌥')
            .replace(/Shift/g, '⇧')
            .replace(/Ctrl/g, '⌃')
            .replace(/\+/g, '');
    }

    // Windows and Linux
    return shortcut
}
