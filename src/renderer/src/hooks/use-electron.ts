import { useCallback, useMemo } from 'react';

/**
 * Hook personalizzato per accedere alle API di Electron esposte tramite il preload script.
 * Fornisce un'interfaccia type-safe per tutte le API disponibili.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { doc, system, theme } = useElectron();
 *   
 *   const handleLoad = async () => {
 *     const mainText = await doc.getMainText();
 *     console.log(mainText);
 *   };
 *   
 *   return <button onClick={handleLoad}>Load</button>;
 * }
 * ```
 */
export const useElectron = () => {
    // Verifica che siamo in un ambiente Electron
    const isElectron = useMemo(() => {
        return typeof window !== 'undefined' && window.electron !== undefined;
    }, []);

    // Crea un wrapper con gestione errori per ogni namespace API
    const createAPIProxy = useCallback(<T extends object>(api: T | undefined, namespace: string): T => {
        if (!isElectron || !api) {
            throw new Error(
                `Tentativo di accedere all'API Electron '${namespace}' al di fuori dell'ambiente Electron.`
            );
        }
        return api;
    }, [isElectron]);

    return useMemo(() => ({
        // Flag per verificare se siamo in ambiente Electron
        isElectron,

        // API per la gestione dei tabs
        tabs: createAPIProxy(window.tabs, 'tabs'),

        // API per la gestione del menu
        menu: createAPIProxy(window.menu, 'menu'),

        // API di sistema (fonts, simboli, messagebox, etc.)
        system: createAPIProxy(window.system, 'system'),

        // API per l'applicazione (toolbar, statusbar, zoom, etc.)
        application: createAPIProxy(window.application, 'application'),

        // API per la gestione dei documenti (la più utilizzata)
        doc: createAPIProxy(window.doc, 'doc'),

        // API per la gestione del tema
        theme: createAPIProxy(window.theme, 'theme'),

        // API per le preferenze dell'utente
        preferences: createAPIProxy(window.preferences, 'preferences'),

        // API per i tooltip
        tooltip: createAPIProxy(window.tooltip, 'tooltip'),

        // API per le shortcut
        keyboardShortcuts: createAPIProxy(window.keyboardShortcuts, 'keyboardShortcuts'),

        // API di Electron di base (ipcRenderer, etc.)
        electron: createAPIProxy(window.electron, 'electron'),
    }), [isElectron, createAPIProxy]);
};

/**
 * Hook semplificato per accedere solo all'API dei documenti.
 * Utile quando hai bisogno solo delle funzionalità relative ai documenti.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const doc = useDocumentAPI();
 *   
 *   const handleSave = async () => {
 *     await doc.saveDocument();
 *   };
 *   
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export const useDocumentAPI = () => {
    const { doc } = useElectron();
    return doc;
};

/**
 * Hook semplificato per accedere solo all'API di sistema.
 */
export const useSystemAPI = () => {
    const { system } = useElectron();
    return system;
};

/**
 * Hook semplificato per accedere solo all'API del tema.
 */
export const useThemeAPI = () => {
    const { theme } = useElectron();
    return theme;
};

/**
 * Hook semplificato per accedere solo all'API delle preferenze.
 */
export const usePreferencesAPI = () => {
    const { preferences } = useElectron();
    return preferences;
};

/**
 * Hook semplificato per accedere solo all'API dei menu.
 */
export const useMenuAPI = () => {
    const { menu } = useElectron();
    return menu;
};

/**
 * Hook semplificato per accedere solo all'API dei tabs.
 */
export const useTabsAPI = () => {
    const { tabs } = useElectron();
    return tabs;
};

/**
 * Hook semplificato per accedere solo all'API dei tooltip.
 */
export const useTooltipAPI = () => {
    const { tooltip } = useElectron();
    return tooltip;
}

/**
 * Hook semplificato per accedere solo all'API delle shortcut.
 */
export const useKeyboardShortcutsAPI = () => {
    const { keyboardShortcuts } = useElectron();
    return keyboardShortcuts;
};

