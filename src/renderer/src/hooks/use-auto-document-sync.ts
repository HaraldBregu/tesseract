import { useCallback, useEffect, useRef } from 'react';
import { debounce, isEqual } from 'lodash-es';
import { rendererLogger } from '@/utils/logger';

/**
 * Configuration for the auto document sync hook
 */
interface AutoDocumentSyncConfig {
    /** Debounce delay in milliseconds (default: 300) */
    debounceDelay?: number;
    /** Whether to enable automatic syncing (default: true) */
    enabled?: boolean;
    /** Whether to log sync operations (default: true) */
    enableLogging?: boolean;
}

/**
 * Data structure for document updates
 */
interface DocumentUpdateData {
    criticalText?: any;
    annotations?: {
        comments?: any[];
        commentCategories?: any;
        bookmarks?: any[];
        bookmarkCategories?: any;
    };
    paratextual?: {
        tocSettings?: any;
        lineNumberSettings?: any;
        pageNumberSettings?: any;
        headerSettings?: any;
        footerSettings?: any;
    };
    layoutTemplate?: any;
    pageSetup?: any;
    sort?: any;
    styles?: any;
}

/**
 * Custom hook that automatically syncs document changes to the main process
 * This eliminates the need for manual IPC calls when refs change
 */
export const useAutoDocumentSync = (config: AutoDocumentSyncConfig = {}) => {
    const {
        debounceDelay = 300,
        enabled = true,
        enableLogging = true
    } = config;

    // Keep track of the last sent data to avoid unnecessary updates
    const lastSentDataRef = useRef<DocumentUpdateData>({});
    const isInitializedRef = useRef(false);

    // Refs for debounced functions to ensure proper cleanup
    const debouncedFunctionsRef = useRef<{
        sendCriticalTextUpdate?: ReturnType<typeof debounce>;
        sendAnnotationsUpdate?: ReturnType<typeof debounce>;
    }>({});

    // Create stable debounced functions
    useEffect(() => {
        // Cancel previous debounced functions if they exist
        if (debouncedFunctionsRef.current.sendCriticalTextUpdate) {
            debouncedFunctionsRef.current.sendCriticalTextUpdate.cancel();
        }
        if (debouncedFunctionsRef.current.sendAnnotationsUpdate) {
            debouncedFunctionsRef.current.sendAnnotationsUpdate.cancel();
        }

        // Create new debounced functions
        debouncedFunctionsRef.current.sendCriticalTextUpdate = debounce((data: any) => {
            if (!enabled) return;

            if (enableLogging) {
                const taskId = rendererLogger.startTask("AutoSync", "Sending critical text update");
                window.electron.ipcRenderer.send("update-critical-text", data);
                rendererLogger.endTask(taskId, "AutoSync", "Critical text update sent");
            } else {
                window.electron.ipcRenderer.send("update-critical-text", data);
            }
        }, debounceDelay);

        debouncedFunctionsRef.current.sendAnnotationsUpdate = debounce((data: any) => {
            if (!enabled) return;

            if (enableLogging) {
                const taskId = rendererLogger.startTask("AutoSync", "Sending annotations update");
                window.electron.ipcRenderer.send("update-annotations", data);
                rendererLogger.endTask(taskId, "AutoSync", "Annotations update sent");
            } else {
                window.electron.ipcRenderer.send("update-annotations", data);
            }
        }, debounceDelay);

        return () => {
            // Cleanup on unmount or config change
            if (debouncedFunctionsRef.current.sendCriticalTextUpdate) {
                debouncedFunctionsRef.current.sendCriticalTextUpdate.cancel();
            }
            if (debouncedFunctionsRef.current.sendAnnotationsUpdate) {
                debouncedFunctionsRef.current.sendAnnotationsUpdate.cancel();
            }
        };
    }, [enabled, enableLogging, debounceDelay]);

    /**
     * Function to sync document data automatically with deep comparison
     */
    const syncDocumentData = useCallback((data: DocumentUpdateData) => {
        if (!enabled || !isInitializedRef.current) return;

        const lastData = lastSentDataRef.current;

        // Check if critical text has changed using deep comparison
        if (data.criticalText !== undefined && !isEqual(data.criticalText, lastData.criticalText)) {
            debouncedFunctionsRef.current.sendCriticalTextUpdate?.(data.criticalText);
            lastSentDataRef.current.criticalText = data.criticalText;
        }

        // Check if annotations have changed using deep comparison
        if (data.annotations !== undefined && !isEqual(data.annotations, lastData.annotations)) {
            debouncedFunctionsRef.current.sendAnnotationsUpdate?.(data.annotations);
            lastSentDataRef.current.annotations = data.annotations;
        }

        // IMPORTANT: Always call window.doc APIs (preserving original behavior)
        // These calls may have side effects in the main process that we need to preserve
        if (data.layoutTemplate !== undefined) {
            window.doc.setLayoutTemplate(data.layoutTemplate);
        }

        if (data.pageSetup !== undefined) {
            window.doc.setPageSetup(data.pageSetup);
        }

        if (data.sort !== undefined) {
            window.doc.setSort(data.sort);
        }

        if (data.styles !== undefined) {
            window.doc.setStyles(data.styles);
        }

        if (data.paratextual !== undefined) {
            window.doc.setParatextual(data.paratextual);
        }

        // Update cache for all data (not just IPC data) for consistency
        if (data.layoutTemplate !== undefined) {
            lastSentDataRef.current.layoutTemplate = data.layoutTemplate;
        }
        if (data.pageSetup !== undefined) {
            lastSentDataRef.current.pageSetup = data.pageSetup;
        }
        if (data.sort !== undefined) {
            lastSentDataRef.current.sort = data.sort;
        }
        if (data.styles !== undefined) {
            lastSentDataRef.current.styles = data.styles;
        }
        if (data.paratextual !== undefined) {
            lastSentDataRef.current.paratextual = data.paratextual;
        }
    }, [enabled]);

    /**
     * Function to manually trigger a sync (useful for edge cases)
     */
    const forceSync = useCallback((data: DocumentUpdateData) => {
        lastSentDataRef.current = {}; // Clear cache to force update
        syncDocumentData(data);
    }, [syncDocumentData]);

    /**
     * Initialize the hook
     */
    useEffect(() => {
        isInitializedRef.current = true;

        return () => {
            isInitializedRef.current = false;
            // Final cleanup
            if (debouncedFunctionsRef.current.sendCriticalTextUpdate) {
                debouncedFunctionsRef.current.sendCriticalTextUpdate.cancel();
            }
            if (debouncedFunctionsRef.current.sendAnnotationsUpdate) {
                debouncedFunctionsRef.current.sendAnnotationsUpdate.cancel();
            }
        };
    }, []);

    return {
        /**
         * Main function to call when document data changes
         */
        syncDocumentData,

        /**
         * Force a sync ignoring the cache
         */
        forceSync,

        /**
         * Check if auto sync is enabled
         */
        isEnabled: enabled,

        /**
         * Manually send critical text update (for backward compatibility)
         */
        sendCriticalTextUpdate: (data: any) => debouncedFunctionsRef.current.sendCriticalTextUpdate?.(data),

        /**
         * Manually send annotations update (for backward compatibility)
         */
        sendAnnotationsUpdate: (data: any) => debouncedFunctionsRef.current.sendAnnotationsUpdate?.(data),
    };
};

export type { AutoDocumentSyncConfig, DocumentUpdateData }; 