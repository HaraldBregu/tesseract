import { mainLogger } from "./shared/logger";
import { readAutomaticFileSave } from "./store";
import { getTabs } from "./store";
import { getWebContentsViews, setSelectedWebContentsViewWithId } from "./content";
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
    const taskId = mainLogger.startTask("AutoSave", "Starting auto save of all documents");

    try {
        const tabs = getTabs();

        if (!tabs || tabs.length === 0) {
            mainLogger.info("AutoSave", "No tabs to auto save");
            return;
        }

        const documentsToSave = tabs.filter(tab =>
            tab.filePath && // Only save documents that have been saved before (not new documents)
            tab.route === Route.root // Only save criterion documents, not file viewers
        );

        if (documentsToSave.length === 0) {
            mainLogger.info("AutoSave", "No documents to auto save");
            return;
        }

        mainLogger.info("AutoSave", `Auto saving ${documentsToSave.length} documents`);

        // Save each document
        for (const tab of documentsToSave) {
            try {
                // Temporarily select the tab to save it
                const originalSelectedTab = tabs.find(t => t.selected);
                const webContentsView = getWebContentsViews().find(view => view.webContents.id === tab.id);

                if (!webContentsView) {
                    mainLogger.error("AutoSave", `Could not find web contents view for tab ${tab.id}`);
                    continue;
                }

                // Set the tab as selected temporarily for saving
                setSelectedWebContentsViewWithId(tab.id);

                // Perform the save operation
                await new Promise<void>((resolve, reject) => {
                    saveDocument((filePath: string) => {
                        mainLogger.info("AutoSave", `Auto saved document: ${filePath}`);
                        resolve();
                    }).catch(reject);
                });

                // Restore original selection if it was different
                if (originalSelectedTab && originalSelectedTab.id !== tab.id) {
                    setSelectedWebContentsViewWithId(originalSelectedTab.id);
                }

            } catch (error) {
                mainLogger.error("AutoSave", `Failed to auto save document with tab ID ${tab.id}`, error as Error);
            }
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