import { platform } from "@electron-toolkit/utils";
import { MenuItem } from "electron";
import { ApplicationMenu } from "../menu/menu";
import { getWebContentsViews } from "../content";
import { keyboardShortcutsManager } from "./keyboard-shortcuts-manager";

// Store the menu click handler function
let onClickMenuItemFn: ((menuItem: MenuItem, data?: object | string | null) => void) | null = null;

/**
 * Set the menu click handler function
 * This is called during app initialization to avoid circular dependencies
 */
export function setOnClickMenuItemFn(fn: (menuItem: MenuItem, data?: object | string | null) => void): void {
  onClickMenuItemFn = fn;
  console.log('✅ setOnClickMenuItemFn called - function registered');
}

/**
 * Update and rebuild the application menu with new shortcuts
 * Called when shortcuts are modified (e.g., user changes custom shortcuts)
 * 
 * Note: Shortcuts work through menu accelerators, which only activate when
 * the application is focused. They do NOT intercept shortcuts system-wide.
 */
export function updateMenuShortcuts(): void {
  if (!onClickMenuItemFn) {
    console.error('❌ onClickMenuItemFn not set! Cannot rebuild menu');
    return;
  }
  console.log('🔄 Updating menu shortcuts');

  // Rebuild the application menu with updated shortcuts
  // Menu accelerators are automatically handled by Electron and only work when app is focused
  ApplicationMenu.instance.build(onClickMenuItemFn);
  // Send an event of updated shortcuts to the frontend
  const webContentViews = getWebContentsViews();
  webContentViews.forEach(webContentView => {
    webContentView.webContents.send(
      'keyboard-shortcuts-updated',
      keyboardShortcutsManager.getShortcutsForCurrentOS(platform.isMacOS)
    );
  });
  console.log('✅ Menu shortcuts updated successfully');
}