import { BrowserWindow } from 'electron';
import { getBaseWindow } from './main-window';

let loaderWindow: BrowserWindow | null = null;

const loaderHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: rgba(255, 255, 255, 0.95);
      font-family: system-ui, -apple-system, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: rgba(30, 30, 30, 0.95);
      }
      .loader-text {
        color: #e0e0e0;
      }
    }
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loader-text {
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="loader-container">
    <div class="spinner"></div>
    <div class="loader-text" id="loader-text">Loading...</div>
  </div>
  <script>
    const { ipcRenderer } = require('electron');
    const textEl = document.getElementById('loader-text');
    
    ipcRenderer.on('loader:set-text', (_event, text) => {
      textEl.textContent = text || 'Loading...';
    });
  </script>
</body>
</html>
`;

export const getLoaderWindow = (): BrowserWindow | null => {
    return loaderWindow;
};

export function showLoaderWindow(text?: string): void {
    const baseWindow = getBaseWindow();
    if (!baseWindow) return;

    if (loaderWindow && !loaderWindow.isDestroyed()) {
        loaderWindow.show();
        if (text) {
            loaderWindow.webContents.send('loader:set-text', text);
        }
        return;
    }

    const [parentWidth, parentHeight] = baseWindow.getSize();
    const [parentX, parentY] = baseWindow.getPosition();

    const loaderWidth = 200;
    const loaderHeight = 120;

    const x = Math.round(parentX + (parentWidth - loaderWidth) / 2);
    const y = Math.round(parentY + (parentHeight - loaderHeight) / 2);

    loaderWindow = new BrowserWindow({
        width: loaderWidth,
        height: loaderHeight,
        x,
        y,
        resizable: false,
        frame: false,
        skipTaskbar: true,
        transparent: false,
        focusable: false,
        show: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        parent: baseWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
        }
    });

    loaderWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(loaderHtmlContent))
        .then(() => {
            if (loaderWindow && !loaderWindow.isDestroyed()) {
                loaderWindow.show();
                if (text) {
                    loaderWindow.webContents.send('loader:set-text', text);
                }
            }
        })
        .catch(err => {
            console.error('Error loading loader window HTML:', err);
        });

    loaderWindow.on('closed', () => {
        loaderWindow = null;
    });
}

export function hideLoaderWindow(): void {
    if (loaderWindow && !loaderWindow.isDestroyed()) {
        loaderWindow.close();
        loaderWindow = null;
    }
    // setTimeout(() => {
    // }, 0);
}

export function setLoaderText(text: string): void {
    if (loaderWindow && !loaderWindow.isDestroyed()) {
        loaderWindow.webContents.send('loader:set-text', text);
    }
}
