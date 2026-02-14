import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from "electron";
import path from 'node:path';
import { exec } from 'node:child_process';
import { is } from "@electron-toolkit/utils";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, '../../resources/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      devTools: is.dev,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    trafficLightPosition: {
      x: 9,
      y: 9
    },
    backgroundColor: '#FFFFFF',
  })

  // Load the app
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    //mainWindow.close()
  })
}

let tray: Tray | null = null;

function createTray(): void {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../../resources/icons/icon.png')
  );
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Tesseract',
      click: () => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          windows[0].show();
          windows[0].focus();
        } else {
          createWindow();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Tesseract');
  tray.setContextMenu(contextMenu);
}

// Handle play-sound IPC
ipcMain.on('play-sound', () => {
  const soundPath = is.dev
    ? path.join(__dirname, '../../resources/sounds/click1.wav')
    : path.join(process.resourcesPath, 'resources/sounds/click1.wav');
  if (process.platform === 'darwin') {
    exec(`afplay "${soundPath}"`);
  } else if (process.platform === 'win32') {
    exec(`powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`);
  } else {
    exec(`aplay "${soundPath}"`);
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createTray();
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})