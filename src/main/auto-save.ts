import { mainLogger } from "./shared/logger";
import { readAutomaticFileSave } from "./store";
import { getTabs } from "./store";
import { getWebContentsViews } from "./content";
import { saveDocument } from "./document/document-manager";
import { Route } from "./shared/constants";

let autoSaveInterval: NodeJS.Timeout | null = null;

export const initializeAutoSave = (): void => {
    const automaticFileSave = readAutomaticFileSave();

    // Clear existing interval if any
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }

    // Don't set up auto save if set to 'never'
    if (automaticFileSave === 'never') {
        return;
    }

    // Convert the setting to milliseconds
    const getIntervalMs = (setting: string): number => {
        switch (setting) {
            case '5min':
                return 5 * 60 * 1000; // 5 minutes
            case '10min':
                return 10 * 60 * 1000; // 10 minutes
            case '15min':
                return 15 * 60 * 1000; // 15 minutes
            default:
                return 0;
        }
    };

    const intervalMs = getIntervalMs(automaticFileSave);

    if (intervalMs > 0) {
        mainLogger.info("AutoSave", `Auto save initialized with interval: ${automaticFileSave}`);

        autoSaveInterval = setInterval(async () => {
            await performAutoSave();
        }, intervalMs);
    }
};

const performAutoSave = async (): Promise<void> => {
    const taskId = mainLogger.startTask("AutoSave", "Starting auto save of selected document");

    try {
        const tabs = getTabs();

        if (!tabs || tabs.length === 0) {
            mainLogger.info("AutoSave", "No tabs available for auto save");
            return;
        }

        // Find the currently selected tab
        const selectedTab = tabs.find(tab => tab.selected);

        if (!selectedTab) {
            mainLogger.info("AutoSave", "No tab is currently selected");
            return;
        }

        // Only save if the selected tab has a file path and is a criterion document
        if (!selectedTab.filePath) {
            mainLogger.info("AutoSave", "Selected tab has no file path (new document), skipping auto save");
            return;
        }

        if (selectedTab.route !== Route.root) {
            mainLogger.info("AutoSave", "Selected tab is not a criterion document, skipping auto save");
            return;
        }

        mainLogger.info("AutoSave", `Auto saving selected document: ${selectedTab.filePath}`);

        try {
            const webContentsView = getWebContentsViews().find(view => view.webContents.id === selectedTab.id);

            if (!webContentsView) {
                mainLogger.error("AutoSave", `Could not find web contents view for selected tab ${selectedTab.id}`);
                return;
            }

            // Perform the save operation on the selected tab
            await new Promise<void>((resolve, reject) => {
                saveDocument((filePath: string) => {
                    mainLogger.info("AutoSave", `Auto saved document: ${filePath}`);
                    resolve();
                }, selectedTab, true).catch(reject);
            });

        } catch (error) {
            mainLogger.error("AutoSave", `Failed to auto save selected document with tab ID ${selectedTab.id}`, error as Error);
        }

        mainLogger.endTask(taskId, "AutoSave", "Auto save completed successfully");

    } catch (error) {
        mainLogger.error("AutoSave", "Error during auto save operation", error as Error);
    }
};

// Update auto save when preferences change
export const updateAutoSave = (): void => {
    initializeAutoSave();
};

// Cleanup function to clear the interval when app shuts down
export const cleanupAutoSave = (): void => {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        mainLogger.info("AutoSave", "Auto save cleanup completed");
    }
}; 