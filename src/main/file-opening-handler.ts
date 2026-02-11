import { app, BaseWindow } from "electron";
import { mainLogger } from "./shared/logger";

/**
 * Handles file opening events across different platforms.
 * - macOS: Uses 'open-file' event
 * - Windows/Linux: Uses 'second-instance' event for already-running instances
 *                  and command-line args for first launch
 */

let pendingFilePathToOpen: string | null = null;

interface FileOpeningHandlerOptions {
    getWindow: () => BaseWindow | null;
    onFileOpen: (filePath: string) => void;
}

/**
 * Initializes file opening event handlers for macOS, Windows, and Linux.
 * Must be called VERY early - before app.whenReady()
 */
export function initializeFileOpeningHandlers(options: FileOpeningHandlerOptions): void {
    const { getWindow, onFileOpen } = options;

    // Windows/Linux: Check for first-launch file from command-line arguments
    // This needs to happen EARLY so it's queued before the window is ready
    if ((process.platform === 'win32' || process.platform === 'linux') && process.argv.length >= 2) {
        const filePath = String(process.argv[1]);
        if (filePath !== '.') {
            mainLogger.info("Electron", `${process.platform} first launch detected with file: ${filePath}`);
            pendingFilePathToOpen = filePath;
        }
    }

    // macOS: Handle 'open-file' event
    // This event can fire before the app is fully initialized
    app.on('open-file', (event, filePath) => {
        event.preventDefault();
        mainLogger.info("Electron", `open-file event received: ${filePath}, window ready: ${!!getWindow()}`);

        if (getWindow()) {
            mainLogger.info("Electron", `Window ready, opening file immediately: ${filePath}`);
            onFileOpen(filePath);
        } else {
            mainLogger.info("Electron", `Window not ready, queuing file: ${filePath}`);
            pendingFilePathToOpen = filePath;
        }
    });

    // Windows/Linux: Handle 'second-instance' event
    // When user double-clicks a file while app is already running
    app.on('second-instance', (_event, commandLine) => {
        mainLogger.info("Electron", `second-instance event received, commandLine: ${JSON.stringify(commandLine)}`);

        const window = getWindow();
        if (window) {
            if (window.isMinimized()) {
                window.restore();
            }
            window.focus();
        }

        if ((process.platform === 'win32' || process.platform === 'linux') && commandLine.length >= 2) {
            const filePath = commandLine.slice(1).find(arg => !arg.startsWith('--') && arg !== '.');

            if (filePath) {
                mainLogger.info("Electron", `Opening file from second instance (${process.platform}): ${filePath}`);
                setTimeout(() => {
                    onFileOpen(filePath);
                }, 100);
            }
        }
    });
}

/**
 * Gets the pending file path that was queued before the window was ready.
 * Returns null if no file is pending.
 */
export function getPendingFilePath(): string | null {
    return pendingFilePathToOpen;
}

/**
 * Clears the pending file path after it has been processed.
 */
export function clearPendingFilePath(): void {
    pendingFilePathToOpen = null;
}

