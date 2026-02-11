import { BrowserWindow } from 'electron';
import { getBaseWindow } from './main-window';
import { htmlContent } from './shared/tooltip-template-html';

let tooltipWindow: BrowserWindow | null = null;

export const getTooltipWindow = (): BrowserWindow | null => {
    return tooltipWindow
}

export function createTooltipWindow(): BrowserWindow {
    const baseWindow = getBaseWindow();

    const tooltip = new BrowserWindow({
        width: 200,
        height: 50,
        resizable: false,
        frame: false,
        skipTaskbar: true,
        transparent: true,
        focusable: false,
        show: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        // Set parent to prevent focus stealing - this is the key fix
        parent: baseWindow || undefined,
        // Use type 'toolbar' for proper tooltip behavior without focus stealing
        type: 'toolbar',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
        }
    });

    tooltip.setIgnoreMouseEvents(true);

    // Only set workspace visibility if we don't have a parent window
    if (!baseWindow) {
        tooltip.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }

    tooltip.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent)).then(() => {
    }).catch(err => {
        console.error('❌ Error loading inline HTML:', err);
    });

    return tooltip;
}

export function createFreshTooltipWindow(): BrowserWindow {
  if (tooltipWindow && !tooltipWindow.isDestroyed()) {
    tooltipWindow.destroy();
  }
  tooltipWindow = null;

  try {
    tooltipWindow = createTooltipWindow();

    // Add error handling
    tooltipWindow.webContents.on('render-process-gone', () => {
      if (tooltipWindow && !tooltipWindow.isDestroyed()) {
        tooltipWindow.destroy();
      }
      tooltipWindow = null;
    });

    tooltipWindow.on('closed', () => {
      tooltipWindow = null;
    });

    return tooltipWindow;

  } catch (err) {
    console.error('❌ Error creating fresh tooltip window:', err);
    tooltipWindow = null;
    throw err;
  }
}