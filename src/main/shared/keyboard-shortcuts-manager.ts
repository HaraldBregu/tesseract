import { getDefaultKeyboardShortcuts } from './keyboard-shortcuts-defaults';
import Store from 'electron-store';
import { MenuItemId } from "../types";
import { mainLogger } from "./logger";
import { platform } from "@electron-toolkit/utils";

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = getDefaultKeyboardShortcuts(MenuItemId);
const MODIFIER_KEYS = new Set(['CmdOrCtrl', 'Cmd', 'Ctrl', 'Alt', 'Shift', 'Meta', 'Super']);

/**
 * Platform-specific reserved shortcuts organized by OS and reason.
 * Each platform has shortcuts reserved by:
 * - DevTools: Electron/Chromium developer tools
 * - OS: Operating system level shortcuts that cannot be intercepted
 */
const PLATFORM_RESERVED_SHORTCUTS = {
    windows: {
        devtools: new Set([
            'Ctrl+Shift+C',      // DevTools - Inspect Element
            'Ctrl+Shift+I',      // DevTools - Toggle
            'Ctrl+Shift+J',      // DevTools - Console
            'F12',               // DevTools - Toggle
        ]),
        os: new Set([
            // Window management
            'Alt+Tab',           // Switch applications
            'Alt+Shift+Tab',     // Switch applications (reverse)
            'Alt+F4',            // Close window/application
            'Alt+Escape',        // Cycle through windows
            'Alt+Space',         // Window menu
            'Alt+Enter',         // Toggle fullscreen (in some apps)
            // System
            'Ctrl+Alt+Delete',   // Security screen / Task Manager
            'Ctrl+Shift+Escape', // Task Manager direct
            // Keyboard layout switching (common configurations)
            'Alt+Shift',         // Switch keyboard layout
            'Ctrl+Shift',        // Switch keyboard layout (some configurations)
        ])
    },
    linux: {
        devtools: new Set([
            'Ctrl+Shift+C',      // DevTools - Inspect Element
            'Ctrl+Shift+I',      // DevTools - Toggle
            'Ctrl+Shift+J',      // DevTools - Console
            'F12',               // DevTools - Toggle
        ]),
        os: new Set([
            // Window management (common across GNOME, KDE, etc.)
            'Alt+Tab',           // Switch applications
            'Alt+Shift+Tab',     // Switch applications (reverse)
            'Alt+F4',            // Close window
            'Alt+F2',            // Run dialog
            'Alt+F1',            // Application menu
            'Alt+Space',         // Window menu
            'Alt+Escape',        // Cycle windows
            // Workspace navigation
            'Ctrl+Alt+Up',       // Workspace up
            'Ctrl+Alt+Down',     // Workspace down
            'Ctrl+Alt+Left',     // Workspace left
            'Ctrl+Alt+Right',    // Workspace right
            // System
            'Ctrl+Alt+Delete',   // Logout / System dialog
            'Ctrl+Alt+L',        // Lock screen
            'Ctrl+Alt+T',        // Terminal (Ubuntu/GNOME)
        ])
    },
    macos: {
        devtools: new Set([
            'Cmd+Option+C',      // DevTools - Inspect Element
            'Cmd+Option+I',      // DevTools - Toggle
            'Cmd+Option+J',      // DevTools - Console
        ]),
        os: new Set([
            // Application switching
            'Cmd+Tab',           // Switch applications
            'Cmd+Shift+Tab',     // Switch applications (reverse)
            // Spotlight and Siri
            'Cmd+Space',         // Spotlight search
            'Ctrl+Space',        // Input source switching
            // Window management
            'Cmd+H',             // Hide application
            'Cmd+Option+H',      // Hide others
            'Cmd+M',             // Minimize window
            'Cmd+Option+M',      // Minimize all
            // Mission Control / Spaces
            'Ctrl+Up',           // Mission Control
            'Ctrl+Down',         // Application windows
            'Ctrl+Left',         // Move space left
            'Ctrl+Right',        // Move space right
            // System
            'Cmd+Option+Escape', // Force Quit dialog
            'Cmd+Shift+Q',       // Log out
            'Ctrl+Cmd+Q',        // Lock screen
            // Screenshots (can be reassigned but often expected)
            'Cmd+Shift+3',       // Screenshot full screen
            'Cmd+Shift+4',       // Screenshot selection
            'Cmd+Shift+5',       // Screenshot options
        ])
    }
} as const;

/**
 * Get the current platform key for PLATFORM_RESERVED_SHORTCUTS
 */
const getCurrentPlatformKey = (): 'windows' | 'linux' | 'macos' => {
    if (platform.isMacOS) return 'macos';
    if (platform.isLinux) return 'linux';
    return 'windows';
};

/**
 * On macOS, Option (Alt) + letter/number produces special characters.
 * These combinations cannot be used as shortcuts because the OS intercepts them
 * to input special characters (e.g., Option+A = å, Option+K = ˚, Option+2 = ™).
 * 
 * This includes:
 * - Option + any letter (A-Z): produces accented/special characters
 * - Option + any number (0-9): produces symbols like ™, £, ¢, etc.
 * - Option + Shift + letter/number: produces uppercase versions or different symbols
 * 
 * Valid macOS shortcuts with Alt must also include Cmd: Cmd+Alt+Key
 */
const isMacOptionSpecialCharConflict = (shortcut: string): boolean => {
    if (!platform.isMacOS) return false;
    
    const parts = shortcut.split('+').map(p => p.trim());
    const hasAlt = parts.includes('Alt') || parts.includes('Option');
    const hasCmd = parts.includes('Cmd') || parts.includes('CmdOrCtrl');
    
    if (!hasAlt || hasCmd) return false;
    
    // Get the key (last part that's not a modifier)
    const key = parts.filter(p => !MODIFIER_KEYS.has(p))[0];
    if (!key) return false;
    
    // Check if it's a letter (A-Z) or number (0-9)
    const isLetter = /^[A-Z]$/i.test(key);
    const isNumber = /^\d$/.test(key);
    
    return isLetter || isNumber;
};

class KeyboardShortcutsManager {
    private customShortcuts: Map<string, string> = new Map();
    private readonly store: Store<{ customShortcuts: Record<string, string> }>;

    constructor() {
        this.store = new Store({
            name: 'keyboard-shortcuts',
            defaults: {
                customShortcuts: {}
            }
        });
        this.loadCustomShortcuts();
    }

    /**
     * Check if a shortcut should be included in the UI
     */
    private shouldIncludeShortcut(shortcut: KeyboardShortcut, isMacOS: boolean): boolean {
        // Exclude Developer category from UI
        if (shortcut.category === 'Developer') {
            return false;
        }
        // Platform-specific menu logic:
        // - macOS: show Criterion menu, hide Settings menu
        // - Windows/Linux: hide Criterion menu, show Settings menu
        if (!isMacOS && shortcut.category === 'Criterion') {
            return false;
        }
        if (isMacOS && shortcut.category === 'Settings') {
            return false;
        }

        return true;
    }

    private getDefaultShortcut(menuItemId: string): KeyboardShortcut | undefined {
        return DEFAULT_SHORTCUTS.find(s => s.menuItemId === menuItemId);
    }

    private isLockedMenuItem(menuItemId: string): boolean {
        return this.getDefaultShortcut(menuItemId)?.locked ?? false;
    }

    /**
     * Get all keyboard shortcuts organized by category
     * @param isMacOS - Whether the platform is macOS (affects which categories are shown)
     */
    getShortcutsForCurrentOS(isMacOS: boolean = false): KeyboardShortcutCategory[] {
        const categories = new Map<string, KeyboardShortcut[]>();

        for (const shortcut of DEFAULT_SHORTCUTS) {
            if (!this.shouldIncludeShortcut(shortcut, isMacOS)) {
                continue;
            }

            if (!categories.has(shortcut.category)) {
                categories.set(shortcut.category, []);
            }
            const categoryShortcuts = categories.get(shortcut.category);
            if (categoryShortcuts) {
                categoryShortcuts.push(shortcut);
            }
        }

        // Define the order of categories to match menu structure
        const categoryOrder = isMacOS
            ? ['Criterion', 'File', 'Edit', 'Insert', 'References', 'Format', 'View', 'Tools', 'Help']
            : ['File', 'Edit', 'Insert', 'References', 'Format', 'View', 'Tools', 'Help', 'Settings'];

        // Category label mapping for i18n
        const categoryLabelMap: Record<string, string> = {
            'Criterion': 'Criterion',
            'File': 'menu.file.label',
            'Edit': 'menu.edit.label',
            'Insert': 'menu.insert.label',
            'References': 'menu.references.label',
            'Format': 'menu.format.label',
            'View': 'menu.view.label',
            'Tools': 'menu.tools.label',
            'Help': 'menu.help.label',
            'Settings': 'menu.settings'
        };

        // Sort categories according to menu order
        const sortedCategories = categoryOrder
            .filter(cat => categories.has(cat))
            .map(name => {
                const categoryCommands = categories.get(name);
                return {
                    name,
                    label: (categoryLabelMap[name] || name),
                    commands: (categoryCommands || []).map(cmd => ({
                        ...cmd,
                        shortcut: this.getEffectiveShortcut(cmd.menuItemId),
                        isCustom: !this.isLockedMenuItem(cmd.menuItemId) && this.customShortcuts.has(cmd.menuItemId)
                    }))
                };
            });
        return sortedCategories;
    }

    /**
     * Check if a shortcut is reserved by the system/browser and cannot be overridden.
     * This includes:
     * - DevTools shortcuts (Electron/Chromium reserved)
     * - OS-level shortcuts (handled by the operating system)
     * - macOS Option+letter/number (produces special characters)
     * 
     * NOTE: This method only checks shortcuts for the CURRENT platform where the app is running.
     * Cross-platform validation is not needed since shortcuts are registered at runtime.
     */
    private isReservedShortcut(shortcut: string): { reserved: boolean; reason?: 'devtools' | 'os' | 'macOptionSpecialChar' } {
        if (!shortcut) return { reserved: false };
        
        // Check macOS Option special character conflict first (only on macOS)
        if (isMacOptionSpecialCharConflict(shortcut)) {
            return { reserved: true, reason: 'macOptionSpecialChar' };
        }
        
        // Get the current platform's reserved shortcuts
        const platformKey = getCurrentPlatformKey();
        const platformReserved = PLATFORM_RESERVED_SHORTCUTS[platformKey];
        
        // Normalize the shortcut format for comparison
        // 1. CmdOrCtrl → Cmd (macOS) or Ctrl (Windows/Linux)
        // 2. Alt → Option (macOS only, for display consistency)
        let normalizedShortcut = shortcut.replaceAll('CmdOrCtrl', platform.isMacOS ? 'Cmd' : 'Ctrl');
        if (platform.isMacOS) {
            normalizedShortcut = normalizedShortcut.replaceAll('Alt', 'Option');
        }
        
        // Check DevTools reserved shortcuts for current platform
        if (platformReserved.devtools.has(normalizedShortcut)) {
            return { reserved: true, reason: 'devtools' };
        }
        
        // Check OS-level reserved shortcuts for current platform
        if (platformReserved.os.has(normalizedShortcut)) {
            return { reserved: true, reason: 'os' };
        }
        
        return { reserved: false };
    }

    /**
     * Get the effective shortcut for a menu item (custom or default)
     */
    getEffectiveShortcut(menuItemId: string): string {
        const defaultShortcut = this.getDefaultShortcut(menuItemId);
        if (!defaultShortcut) return '';

        // Locked shortcuts (e.g. Copy/Paste) must never be overridden.
        if (defaultShortcut.locked) return defaultShortcut.shortcut;

        return this.customShortcuts.get(menuItemId) || defaultShortcut.shortcut || '';
    }

    /**
     * Set a custom shortcut for a menu item
     */
    setCustomShortcut(menuItemId: string, shortcut: string): { 
        success: boolean; 
        conflict?: string; 
        isReserved?: boolean;
        reservedReason?: 'devtools' | 'os' | 'macOptionSpecialChar';
    } {
        if (this.isLockedMenuItem(menuItemId)) {
            return { success: false };
        }

        // Check if shortcut is reserved
        const reservedCheck = this.isReservedShortcut(shortcut);
        if (reservedCheck.reserved) {
            return { 
                success: false,
                isReserved: true,
                reservedReason: reservedCheck.reason
            };
        }

        // Check for conflicts
        const conflict = this.findShortcutConflict(shortcut, menuItemId);
        if (conflict) {
            return { success: false, conflict };
        }

        this.customShortcuts.set(menuItemId, shortcut);
        this.saveCustomShortcuts();
        // Note: Global shortcuts are updated by the caller (index.ts)

        return { success: true };
    }

    /**
     * Remove a custom shortcut (revert to default)
     */
    removeCustomShortcut(menuItemId: string): void {
        this.customShortcuts.delete(menuItemId);
        this.saveCustomShortcuts();
        // Note: Global shortcuts are updated by the caller (index.ts)
    }

    /**
     * Reset all shortcuts to default
     */
    resetAllShortcuts(): void {
        this.customShortcuts.clear();
        this.saveCustomShortcuts();
        // Note: Global shortcuts are updated by the caller (index.ts)
    }

    /**
     * Find if a shortcut conflicts with existing ones
     */
    private findShortcutConflict(shortcut: string, excludeMenuItemId?: string): string | null {
        for (const [menuItemId, customShortcut] of this.customShortcuts.entries()) {
            if (menuItemId !== excludeMenuItemId && customShortcut === shortcut) {
                const defaultShortcut = DEFAULT_SHORTCUTS.find(s => s.menuItemId === menuItemId);
                return defaultShortcut?.label || menuItemId;
            }
        }

        // Check against default shortcuts
        for (const defaultShortcut of DEFAULT_SHORTCUTS) {
            if (defaultShortcut.menuItemId !== excludeMenuItemId &&
                defaultShortcut.shortcut === shortcut &&
                !this.customShortcuts.has(defaultShortcut.menuItemId)) {
                return defaultShortcut.label || defaultShortcut.menuItemId;
            }
        }

        return null;
    }

    /**
     * Load custom shortcuts from electron-store
     */
    private loadCustomShortcuts(): void {
        try {
            const shortcuts = this.store.get('customShortcuts', {});

            const filtered = new Map<string, string>();
            let removedCount = 0;

            for (const [menuItemId, value] of Object.entries(shortcuts)) {
                const defaultShortcut = this.getDefaultShortcut(menuItemId);
                if (!defaultShortcut) {
                    removedCount += 1;
                    continue;
                }
                if (defaultShortcut.locked) {
                    removedCount += 1;
                    continue;
                }
                if (!value || !this.isValidShortcut(value) || this.isReservedShortcut(value).reserved) {
                    removedCount += 1;
                    continue;
                }

                filtered.set(menuItemId, value);
            }

            this.customShortcuts = filtered;
            mainLogger.info('KeyboardShortcutsManager', `Loaded ${this.customShortcuts.size} custom shortcuts`);

            if (removedCount > 0) {
                this.saveCustomShortcuts();
            }
        } catch (error) {
            mainLogger.error('KeyboardShortcutsManager', 'Failed to load custom shortcuts', error as Error);
        }
    }

    /**
     * Save custom shortcuts to electron-store
     */
    private saveCustomShortcuts(): void {
        try {
            const shortcutsObj = Object.fromEntries(this.customShortcuts);
            this.store.set('customShortcuts', shortcutsObj);
            mainLogger.info('KeyboardShortcutsManager', 'Custom shortcuts saved to store');
        } catch (error) {
            mainLogger.error('KeyboardShortcutsManager', 'Failed to save custom shortcuts', error as Error);
        }
    }

    /**
     * Get the shortcut for a specific menu item
     * Returns the custom shortcut if set, otherwise returns the default shortcut
     */
    getShortcut(menuItemId: string): string | undefined {
        return this.getEffectiveShortcut(menuItemId);
    }

    /**
     * Get all shortcuts for global registration
     */
    getAllShortcuts(): Array<{ shortcut: string; menuItemId: string }> {
        const shortcuts: Array<{ shortcut: string; menuItemId: string }> = [];

        for (const defaultShortcut of DEFAULT_SHORTCUTS) {
            const effectiveShortcut = this.getEffectiveShortcut(defaultShortcut.menuItemId);
            if (effectiveShortcut && this.isValidShortcut(effectiveShortcut)) {
                shortcuts.push({
                    shortcut: effectiveShortcut,
                    menuItemId: defaultShortcut.menuItemId
                });
            }
        }

        return shortcuts;
    }

    /**
     * Check if a shortcut is valid for registration
     * Invalid shortcuts are those with only modifiers or incomplete combinations
     */
    private isValidShortcut(shortcut: string): boolean {
        if (!shortcut || shortcut.trim() === '') {
            return false;
        }

        const parts = shortcut.split('+');
        const nonModifierParts = parts.filter(p => !MODIFIER_KEYS.has(p.trim()));

        return nonModifierParts.length > 0;
    }
}

export const keyboardShortcutsManager = new KeyboardShortcutsManager();
