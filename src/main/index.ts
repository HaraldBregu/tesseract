import path from "node:path";
import { app, BaseWindow, dialog, ipcMain, MenuItem, net, protocol, screen, shell } from "electron";
import { MenuItemId, SimplifiedTab } from "./types";
import i18next from "i18next";
import { mainLogger } from "./shared/logger";
import fontList from "font-list";
import os from "node:os";
import { Worker } from 'node:worker_threads';
import { is, platform } from "@electron-toolkit/utils";
import {
  promises,
  existsSync,
  statSync,
  readdirSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";
import {
  getBaseWindow,
  getToolbarWebContentsView,
  initializeMainWindow,
  openChildWindow,
  toolbarWebContentsViewSend,
  closeChildWindow,
  childWindowSend,
  getChildWindow,
  openAuthWindow,
  openLogoutWindow,
  getLogoutWindow,
  openFindAndReplaceWindow,
  getFindAndReplaceWindow,
  openShareDocumentWindow,
  getShareDocumentWindow,
  openSharedDocumentsWindow,
  getSharedDocumentsWindow,
} from "./main-window";
import {
  buildExportableSiglaObject,
  buildExportableStylesObject,
  buildExportableTemplateObject,
  checkSignature,
  checkVersion,
  convertPath,
  devToolsToggleHandler,
  downloadsDirectoryPath,
  getRootUrl,
  initializei18next,
  MIN_SIGLUM_VERSION_SUPPORTED,
  MIN_STYLE_VERSION_SUPPORTED,
  MIN_TEMPLATE_VERSION_SUPPORTED,
  readFile,
  readObject,
  saveTemplate,
  setRecentDocuments,
  showCloseConfirmation,
  stylesFolderPath,
  templatesFolderPath,
  updateAppSettingsLanguage,
  updateRecentDocuments
} from "./shared/util";
import {
  closeWebContentsViewWithId,
  getWebContentsViewsIds,
  getSelectedWebContentsView,
  getSelectedWebContentsViewId,
  getWebContentsViews,
  reorderTabs,
  selectedWebContentsViewSend,
  setSelectedWebContentsViewWithId,
  createWebContentsView,
  selectContentViewAfterClosingTabWithId,
  showWebContentsView,
} from "./content";
import {
  closeApplication,
  moveDocument,
  openDocument,
  renameDocument,
  saveDocument,
  saveDocumentAs,
  savePdf,
  cleanupOldTempDirectories,
  getExportPath,
  generatePDF,
  saveFileAtPath,
  generateTEI,
  openDocumentAtPath,
  getDocumentObject,
  downloadDocument,
  openDocumentDialog,
  loadDocumentFromPath,
  saveFile,
} from "./document/document-manager";
import { createDocument } from "./document/document";
import { fileTypeToRouteMapping, LINK_TO_SUPPORT_PAGE, routeToMenuMapping, typeTypeToRouteMapping } from "./shared/constants";
import { getSelectedTab, setFilePathForSelectedTab } from "./toolbar";
import {
  getTabs,
  readAppLanguage,
  readSpecialCharacterConfig,
  readToolbarAdditionalItems,
  readToolbarIsVisible,
  storeAppLanguage,
  storeToolbarAdditionalItems,
  storeToolbarIsVisible,
  storeFileNameDisplay,
  readFileNameDisplay,
  storeRememberLayout,
  readRememberLayout,
  storePdfQuality,
  readPdfQuality,
  storeLastPageSetup,
  readLastPageSetup,
  updateTabFilePath,
  storeRecentFilesCount,
  readRecentFilesCount,
  storeTheme,
  readTheme,
  storeCommentPreviewLimit,
  storeBookmarkPreviewLimit,
  readCommentPreviewLimit,
  readBookmarkPreviewLimit,
  storeFileSavingDirectory,
  readFileSavingDirectory,
  storeDefaultDirectory,
  readDefaultDirectory,
  storeAutomaticFileSave,
  readAutomaticFileSave,
  storeVersioningDirectory,
  readVersioningDirectory,
  storeCustomVersioningDirectory,
  readCustomVersioningDirectory,
  storeCriterionLanguage,
  readCriterionLanguage,
  storeCriterionRegion,
  readCriterionRegion,
  storeDateFormat,
  readDateFormat,
  storeHistoryActionsCount,
  readHistoryActionsCount,
  setSimplifiedLayoutTabs,
  setUpdatedTabsState,
  getUpdatedTabsState,
  toggleStatusbarVisibility,
  readStatusbarVisibility,
  readStatusBarConfig,
  storeStatusBarConfig,
  readZoom,
  storeZoom,
  getSimplifiedLayoutTabs,
  deleteBaseAuthToken,
} from "./store";
import { initializeAutoSave, updateAutoSave, cleanupAutoSave } from "./auto-save";
import { ApplicationMenu } from "./menu/menu";
import initializeFonts, { getSymbols, getFonts, getSubsets } from "./shared/fonts";
import { initializeThemeManager } from "./theme-manager";
import { createFreshTooltipWindow, getTooltipWindow } from "./tooltip-window";
import parseBibtexFile from "./bibtex-parser";
import { DocumentTabManager } from "./document/document-tab";
import { JSONContent } from "@tiptap/core";
import {
  createWelcomeWebContentsView,
  getWelcomeWebContentsView,
  showWelcomeView,
  hideWelcomeView,
} from "./welcome-view";
import {
  confirmReplacmentStylesMessageBox,
  corruptedFileMessageBox,
  invalidSiglumContentMessageBox,
  invalidSiglumJSONMessageBox,
  misssingSignatureMessageBox,
  misssingVersionMessageBox,
  showSaveTemplateMessageBoxWarning,
  siglumExportSuccessMessageBox,
  stylesExportSuccessMessageBox,
  unsupportedVersionMessageBox,
  openSiglaDialog,
  openStylesDialog,
  saveSiglaDialog,
  saveStylesDialog,
  openImportTemplateDialog,
  invalidContentMessageBox,
  invalidJSONMessageBox,
  showNoMoreReplacementsMessageBox,
  openFolder,
} from "./shared/dialogs";
import { initializeFileOpeningHandlers, getPendingFilePath, clearPendingFilePath } from "./file-opening-handler";
import { updateMenuShortcuts, setOnClickMenuItemFn } from "./shared/shortcut-handler";
import { keyboardShortcutsManager } from "./shared/keyboard-shortcuts-manager";
import { createSignature, equalSignature } from "./shared/signature";
import { handleUserIpc } from "./services/user-ipc-service";
import { handleInviteIpc } from "./services/invite-ipc-service";
import { handleDocumentIpc } from "./services/document-ipc-service";
import { handleNotificationIpc } from "./services/notification-ipc-service";
import { registerChatHandlers } from "./services/chat-ipc-service";
import { uploadDocument } from "./services/base-service";

// Setup file opening event handlers VERY early - before app.whenReady()
// This must be done before any other app initialization
initializeFileOpeningHandlers({
  getWindow: getBaseWindow,
  onFileOpen: (filePath: string) => onDocumentOpened(filePath)
});

// Increase memory limits and optimize garbage collection for Windows large document handling
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192');
app.commandLine.appendSwitch('js-flags', '--max-semi-space-size=512');

// Additional Windows-specific optimizations for large documents
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('js-flags', '--expose-gc');
  app.commandLine.appendSwitch('disable-background-timer-throttling');
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
}

// Linux switches
// IMPORTANT: keep this early (before app.whenReady())
if (process.platform === 'linux') {
  // Common on constrained environments (e.g. small /dev/shm)
  app.commandLine.appendSwitch('disable-dev-shm-usage');

  if (is.dev) {
    app.commandLine.appendSwitch('enable-logging');
    app.commandLine.appendSwitch('enable-dev-tools');
  }
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("critx", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("critx");
}

const protocolName = "local-resource";

protocol.registerSchemesAsPrivileged([
  {
    scheme: protocolName,
    privileges: {
      secure: true,
      supportFetchAPI: true, // impotant
      standard: true,
      bypassCSP: true, // impotant
      stream: true
    }
  }
])

const handleLayoutPreservation = async (): Promise<void> => {
  if (readRememberLayout()) {
    try {
      const currentTabs = getTabs();
      mainLogger.info("Layout", `rememberLayout is enabled. Found ${currentTabs?.length || 0} current tabs`);

      if (currentTabs && currentTabs.length > 0) {
        // Only save tabs that have file paths (opened documents)
        const validTabs = currentTabs.filter(tab => tab.filePath && tab.filePath !== null);
        mainLogger.info("Layout", `Filtered to ${validTabs.length} valid tabs with file paths`);

        // Create simplified tab objects that don't rely on runtime IDs
        const simplifiedTabs: SimplifiedTab[] = validTabs.map(tab => ({
          filePath: tab.filePath!,
          selected: tab.selected,
          route: tab.route,
        }));

        simplifiedTabs.forEach((tab, index) => {
          mainLogger.info("Layout", `Tab ${index}: ${tab.filePath} (route: ${tab.route}, selected: ${tab.selected})`);
        });

        setSimplifiedLayoutTabs(simplifiedTabs);
        mainLogger.info("Layout", `Saved ${simplifiedTabs.length} simplified tabs for layout restoration`);
      } else {
        mainLogger.info("Layout", "No tabs to save");
      }
    } catch (err) {
      mainLogger.error("Layout", "Error saving tabs for layout restoration", err as Error);
    }
  } else {
    mainLogger.info("Layout", "rememberLayout is disabled, not saving tabs");
  }
}

const handleAppClose = (closeFileFn: () => Promise<void>) => async (event: Electron.Event): Promise<void> => {
  !is.dev && event.preventDefault();

  try {
    // Save current layout if enabled
    await handleLayoutPreservation().catch(err => {
      mainLogger.error("AppClose", "Error saving layout", err as Error);
    });

    const currentTabs = getTabs();

    if (currentTabs.length === 0) {
      await closeFileFn();
      return;
    }

    // Close each document, prompting for unsaved changes
    // performTabClose automatically selects the next tab after each close
    let closingCancelled = false;

    for (let i = 0; i < currentTabs.length; i++) {
      const wasSuccessfullyClosed = await closeCurrentDocument();

      if (!wasSuccessfullyClosed) {
        closingCancelled = true;
        break;
      }
    }

    if (!closingCancelled) {
      await closeFileFn();
    }
  } catch (err) {
    mainLogger.error("AppClose", "Error during app closure", err as Error);
  }
}

function openPreferencesWindow(options?: { account?: boolean }): void {
  const accountParam = options?.account ? "?account=1" : "";
  const url = getRootUrl() + "preferences" + accountParam;
  const existingWindow = getChildWindow();
  if (existingWindow && !existingWindow.isDestroyed()) {
    existingWindow.focus();
  } else {
    openChildWindow(url, {
      title: i18next.t('menu.preferencesWindowTitle'),
    });
  }
}

const changeLanguageComprehensive = async (language: string): Promise<void> => {
  const taskId = mainLogger.startTask("Electron", `Changing language to: ${language}`);
  try {
    // Validate language parameter
    if (!language || typeof language !== 'string') {
      throw new Error(`Invalid language parameter: ${language}`);
    }

    const baseWindow = getBaseWindow();
    if (!baseWindow) {
      mainLogger.error("Electron", "Base window not available for language change");
      return;
    }

    // Store language in both storage mechanisms for consistency
    storeAppLanguage(language);
    storeCriterionLanguage(language);
    updateAppSettingsLanguage(language);

    // Change i18next language
    await i18next.changeLanguage(language);

    // Update recent documents with new language
    await setRecentDocuments();

    // Rebuild application menu with new language
    ApplicationMenu.build(onClickMenuItem);

    // Notify all UI components about language change
    const webContentsViews = getWebContentsViews();
    webContentsViews.forEach(webContentsView => {
      webContentsView.webContents.send("language-changed", language);
    });

    // Notify toolbar about language change
    const toolbarContentView = getToolbarWebContentsView();
    toolbarContentView?.webContents.send("language-changed", language);

    // Notify child windows about language change
    childWindowSend("language-changed", language);

    mainLogger.endTask(taskId, "Electron", `Language successfully changed to: ${language}`);
  } catch (err) {
    mainLogger.error("Electron", `Error while changing language to ${language}`, err as Error);
    throw err; // Re-throw to allow caller to handle if needed
  }
};

const registerIpcListeners = (): void => {

  ipcMain.on('no-more-replacements', () => {
    if (!getFindAndReplaceWindow()) return;
    showNoMoreReplacementsMessageBox(getFindAndReplaceWindow()!).catch(err => {
      mainLogger.error("Electron", "Failed to show no more replacements message box via IPC", err as Error);
    });
  });

  ipcMain.on("open-logout-window", () => {
    openLogoutWindow()
  })

  ipcMain.on("close-logout-window", () => {
    const logoutWindow = getLogoutWindow();
    if (!logoutWindow)
      return;
    logoutWindow.close();
  })

  ipcMain.on("close-auth-window", () => {
    const authWindow = getChildWindow();
    if (!authWindow)
      return;
    authWindow.close();
  })

  ipcMain.on("close-share-document-window", () => {
    const shareDocumentWindow = getShareDocumentWindow();
    if (!shareDocumentWindow)
      return;
    shareDocumentWindow.close();
  })

  ipcMain.on("close-shared-files-window", () => {
    const sharedDocumentsWindow = getSharedDocumentsWindow();
    if (!sharedDocumentsWindow)
      return;
    sharedDocumentsWindow.close();
  })

  ipcMain.on("logout", () => {
    deleteBaseAuthToken()
    ApplicationMenu.build(onClickMenuItem)
  })

  ipcMain.on("update-auth-status", () => {
    toolbarWebContentsViewSend("update-auth-status");
  })

  // Notification toggle: AppTabs -> Main -> Active Editor Tab (or Welcome View if no tabs)
  ipcMain.on("toggle-notification-panel", () => {
    const selectedView = getSelectedWebContentsView();
    if (selectedView?.webContents) {
      selectedView.webContents.send('toggle-notification-panel');
    } else {
      // Fallback to welcome view when no document tabs are open
      const welcomeView = getWelcomeWebContentsView();
      if (welcomeView?.webContents) {
        welcomeView.webContents.send('toggle-notification-panel');
      }
    }
  })

  // Account panel toggle: AppTabs -> Main -> Active Editor Tab (or Welcome View if no tabs)
  ipcMain.on("toggle-account-panel", () => {
    const selectedView = getSelectedWebContentsView();
    if (selectedView?.webContents) {
      selectedView.webContents.send('toggle-account-panel');
    } else {
      // Fallback to welcome view when no document tabs are open
      const welcomeView = getWelcomeWebContentsView();
      if (welcomeView?.webContents) {
        welcomeView.webContents.send('toggle-account-panel');
      }
    }
  })

  // Notification count update: Editor Tab -> Main -> AppTabs
  ipcMain.on("update-notification-count", (_event, count: number) => {
    toolbarWebContentsViewSend("update-notification-count", count);
  })

  // New document request: WelcomeView -> Main -> AppTabs
  ipcMain.on("menu:new-document", () => {
    toolbarWebContentsViewSend("create-new-document");
    ApplicationMenu
      .setIsNewDocument(true)
      .build(onClickMenuItem);
  })

  ipcMain.on("tabs-current-state-changed", (_event, tabs: TabInfo[]) => {
    setUpdatedTabsState(tabs)
  })

  ipcMain.on("set-electron-language", (_event, language: string) => {
    changeLanguageComprehensive(language).catch(err => {
      mainLogger.error("Electron", "Failed to change language via IPC", err as Error);
    });
  });

  ipcMain.on("request-system-fonts", async (event) => {
    try {
      const fonts = await fontList.getFonts();
      const cleanedFonts = fonts.map((font: string) => font.replace(/"/g, ""));
      event.reply("receive-system-fonts", cleanedFonts);
    } catch (error) {
      console.error("Error fetching system fonts:", error);
      event.reply("receive-system-fonts", []);
    }
  });

  ipcMain.handle('tooltip:show', async (_event, { x, y, text }: { x: number, y: number, text: string }) => {
    try {
      const tooltip = createFreshTooltipWindow();

      // Wait for the window to be fully ready
      await new Promise<void>(resolve => {
        if (tooltip.webContents.isLoading()) {
          tooltip.webContents.once('dom-ready', () => {
            setTimeout(resolve, 100); // Extra time for scripts to load
          });
        } else {
          setTimeout(resolve, 50); // Small delay even if not loading
        }
      });

      // Set position and text
      let newY = y;
      if (platform.isWindows) {
        newY = y + 30;
      }
      tooltip.setPosition(Math.round(x), Math.round(newY));
      tooltip.webContents.send('tooltip:set-text', text || 'Untitled');

      // Show after a small delay to allow rendering
      setTimeout(() => {
        if (!tooltip.isDestroyed()) {
          tooltip.showInactive();
        }
      }, 150);

    } catch (err) {
      mainLogger.error("Tooltip", "Error showing tooltip", err as Error);
      console.error('❌ Tooltip error:', err);
    }
  });

  ipcMain.handle('tooltip:hide', () => {
    const tooltipWindow = getTooltipWindow()
    if (tooltipWindow && !tooltipWindow.isDestroyed() && tooltipWindow.isVisible())
      tooltipWindow.hide();
  });

  ipcMain.on('tooltip:resize', (_event, { width, height }: { width: number, height: number }) => {
    const tooltipWindow = getTooltipWindow()
    if (!tooltipWindow || tooltipWindow.isDestroyed()) return;

    const newWidth = Math.max(width, 20);
    const newHeight = Math.max(height, 16);
    tooltipWindow.setSize(newWidth, newHeight);

    // Reposition tooltip if it goes off-screen
    const [currentX, currentY] = tooltipWindow.getPosition();
    const { x: screenX, y: screenY, width: screenWidth, height: screenHeight } = screen.getDisplayNearestPoint({ x: currentX, y: currentY }).workArea;
    const margin = 10;

    const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, max));

    const newX = clamp(currentX, screenX + margin, screenX + screenWidth - newWidth - margin);
    const newY = clamp(currentY, screenY + margin, screenY + screenHeight - newHeight - margin);

    if (newX !== currentX || newY !== currentY) {
      tooltipWindow.setPosition(Math.round(newX), Math.round(newY));
    }
  });

  ipcMain.on("open-external-file", async (_, filePath: string) => {
    const taskId = mainLogger.startTask("Electron", "Opening external link");
    try {
      await shell.openExternal(filePath, { activate: true, logUsage: true });
      mainLogger.endTask(taskId, "Electron", "External link opened");
    } catch (err) {
      mainLogger.error(
        "Electron",
        "Error while opening external link",
        err as Error
      );
    }
  });

  ipcMain.on("open-choose-layout-modal", async () => {
    selectedWebContentsViewSend("receive-open-choose-layout-modal");
  });

  ipcMain.on("open-change-template-modal", async () => {
    selectedWebContentsViewSend("show-change-template-modal");
  })

  ipcMain.on("document-opened-at-path", async (_, filepath: string, fileType: FileType) => {
    const taskId = mainLogger.startTask("Document", `Loading document at path: ${filepath}`);

    try {
      switch (fileType) {
        case "critx": {
          const documentObject = getDocumentObject()
          if (!documentObject)
            return

          const document = await createDocument(documentObject);
          const tabs = getTabs();
          const selectedTab = tabs.find((tab) => tab.selected);
          const tabId = selectedTab?.id || null;

          if (!tabId) {
            mainLogger.error("Document", `No tab ID available for: ${filepath}`);
            return;
          }

          DocumentTabManager
            .setId(tabId)
            .setPath(filepath)
            .setDocument(document)
            .setTouched(false)
            .sendUpdate()

          updateTabFilePath(tabId, filepath);

          mainLogger.endTask(taskId, "Document", `Document loaded successfully: ${filepath}`);
        } break;
        case 'pdf':
        case 'png':
        case 'jpg':
        case 'jpeg':
          selectedWebContentsViewSend("load-file-at-path", filepath);
          setFilePathForSelectedTab(filepath);
          updateRecentDocuments(filepath);
          ApplicationMenu.build(onClickMenuItem)
          mainLogger.endTask(taskId, "Document", `File loaded successfully: ${filepath}`);
          break;
      }
    } catch (error) {
      mainLogger.error("Document", `Unexpected error loading document: ${filepath}`, error as Error);
      await dialog.showMessageBox(getBaseWindow()!, {
        type: 'error',
        message: 'Error opening document',
        detail: `An unexpected error occurred while opening "${filepath}".`
      });
      mainLogger.endTask(taskId, "Document", `Error loading document: ${filepath}`);
    }
  });

  ipcMain.on("select-folder-path", async (event) => {
    const taskId = mainLogger.startTask("Dialog", "Opening folder selection dialog");
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Seleziona cartella per il versioning',
      });

      if (!result.canceled && result.filePaths.length > 0) {
        event.reply("receive-folder-path", result.filePaths[0]);
        mainLogger.endTask(taskId, "Dialog", `Folder selected: ${result.filePaths[0]}`);
      } else {
        event.reply("receive-folder-path", null);
        mainLogger.endTask(taskId, "Dialog", "Folder selection cancelled");
      }
    } catch (err) {
      mainLogger.error("Dialog", "Error in folder selection", err as Error);
      event.reply("receive-folder-path", null);
    }
  });

  ipcMain.on("open-auth-modal", () => {
    openAuthWindow()
  });

  ipcMain.on("open-auth-from-preferences", () => {
    closeChildWindow();
    setTimeout(() => {
      openAuthWindow();
    }, 100);
  });

  ipcMain.handle("application:openPreferencesWindow", (_event, options?: { account?: boolean }) => {
    openPreferencesWindow(options);
  });
};

const performTabClose = async (tabId: number): Promise<void> => {
  const taskId = mainLogger.startTask("Electron", `Performing tab close for ID: ${tabId}`);
  // Select the next tab BEFORE closing
  selectContentViewAfterClosingTabWithId(tabId);
  // Update DocumentTabManager to point to the new current tab BEFORE removing the old one
  // This ensures that any subsequent operations (like save) use the correct tab context
  const webContentsViews = getWebContentsViews();
  if (webContentsViews.length > 1) {
    DocumentTabManager.setCurrentTab();
  }

  toolbarWebContentsViewSend("close-current-document", tabId);

  const tabs = closeWebContentsViewWithId(tabId);
  const route = tabs.find((tab) => tab.selected)?.route;
  const menuViewMode = routeToMenuMapping[route];
  const selectedTab = tabs.find((tab) => tab.selected);
  const isNewDocument = !selectedTab || !selectedTab.filePath || selectedTab.filePath === null;

  // Notify the newly selected tab about the tab change (simulate tabs:select behavior)
  const newSelectedTabId = selectedTab?.id;
  if (newSelectedTabId) {
    const selectedView = getSelectedWebContentsView();
    if (selectedView) {
      selectedView.webContents.send('tab-selected', newSelectedTabId);
    }
  }

  if (process.platform === 'win32') {
    // On Windows, add significant delay to allow complete resource cleanup for large documents
    // Force garbage collection if available, then rebuild menu after substantial delay
    if (global.gc) {
      global.gc();
    }

    // Wait for the cleanup delay with proper async handling
    await new Promise<void>((resolve) => {
      setTimeout((): void => {
        // Check if the window still exists before rebuilding menu
        // During app shutdown, this timer might fire after the window is destroyed
        const baseWindow = getBaseWindow();
        if (!baseWindow || baseWindow.isDestroyed()) {
          mainLogger.info("Electron", "Window destroyed, skipping menu rebuild during shutdown");
          resolve();
          return;
        }

        DocumentTabManager
          .removeWithId(tabId)

        ApplicationMenu
          .setIsNewDocument(isNewDocument)
          .setMenuViewMode(menuViewMode)
          .build(onClickMenuItem);
        mainLogger.endTask(taskId, "Electron", "Tab closed successfully");
        resolve();
      }, 200); // 200ms delay for Windows large document cleanup
    });
  } else {
    DocumentTabManager
      .removeWithId(tabId)

    ApplicationMenu
      .setIsNewDocument(isNewDocument)
      .setMenuViewMode(menuViewMode)
      .build(onClickMenuItem);
    mainLogger.endTask(taskId, "Electron", "Tab closed successfully");
  }
};

const closeCurrentDocument = async (): Promise<boolean> => {
  const taskId = mainLogger.startTask("Electron", "Closing current document");

  const currentWebContentsView = getSelectedWebContentsView();
  const tabId = currentWebContentsView?.webContents.id || -1;

  if (tabId === -1) {
    mainLogger.endTask(taskId, "Electron", "No current document to close");
    return true;
  }

  const tabsState = getUpdatedTabsState();
  const currentTabState = tabsState.find((tab) => tab.id === tabId);

  mainLogger.info("Document", `Attempting to close document. Has changes`);

  if (currentTabState?.changed) {
    const baseWindow = getBaseWindow();
    if (!baseWindow)
      return false;

    const shouldClose = await showCloseConfirmation(baseWindow);
    switch (shouldClose) {
      case 0: {
        const saveSuccessful = await saveDocument(onDocumentSaved);
        if (saveSuccessful) {
          await performTabClose(tabId);
          mainLogger.endTask(taskId, "Electron", "Document saved and closed");
          return true;
        } else {
          mainLogger.endTask(taskId, "Electron", "Save failed, document not closed");
          return false;
        }
      }
      case 1:
        await performTabClose(tabId);
        mainLogger.endTask(taskId, "Electron", "Document closed without saving");
        return true;
      case 2:
      default:
        mainLogger.endTask(taskId, "Electron", "File close cancelled by user");
        return false;
    }
  } else {
    await performTabClose(tabId);
    mainLogger.endTask(taskId, "Electron", "Document closed (no changes)");
    return true;
  }
};

const checkCurrentTabIsOpened = async (filePath: string): Promise<boolean> => {
  const currentTabs = getTabs();
  const isDocumentAlreadyOpen = currentTabs.some(tab => tab.filePath === filePath);

  if (isDocumentAlreadyOpen) {
    const openedDocumentTab = currentTabs.find(tab => tab.filePath === filePath);
    const baseWindow = getBaseWindow();
    if (baseWindow && openedDocumentTab) {
      await dialog.showMessageBox(baseWindow, {
        type: 'warning',
        title: i18next.t('document.alreadyOpen.title'),
        message: i18next.t('document.alreadyOpen.message'),
        buttons: ['OK']
      });

      setSelectedWebContentsViewWithId(openedDocumentTab.id);
      toolbarWebContentsViewSend("tab-selected", openedDocumentTab.id);

      const webContentsViews = getWebContentsViews();
      webContentsViews.forEach(webContentView => {
        webContentView.webContents.send('tab-selected', openedDocumentTab.id);
      });

      const route = openedDocumentTab.route;
      const menuViewMode = routeToMenuMapping[route];

      ApplicationMenu
        .setIsNewDocument(false)
        .setMenuViewMode(menuViewMode)
        .build(onClickMenuItem);

      DocumentTabManager.setCurrentTab();
    }
    return true;
  }

  return false;
}

const SUPPORTED_FILE_TYPES = ['critx', 'pdf', 'png', 'jpg', 'jpeg'];

async function onDocumentOpened(filePath: string, skipDuplicateCheck = false): Promise<void> {
  const fileNameParsed = path.parse(filePath);
  const fileNameBase = fileNameParsed.base;
  const fileNameExt = fileNameParsed.ext as FileNameExt;
  const fileType = fileNameExt.slice(1) as FileType;

  // Check if file type is supported before creating a tab
  if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
    mainLogger.info("Document", `Unsupported file type: ${fileType} for file: ${filePath}`);
    const baseWindow = getBaseWindow();
    if (baseWindow) {
      await dialog.showMessageBox(baseWindow, {
        type: 'warning',
        title: i18next.t('fileViewer.unsupportedFile.title'),
        message: i18next.t('fileViewer.unsupportedFile.message'),
        detail: `${i18next.t('fileViewer.unsupportedFile.fileType', { type: `.${fileType}` })}\n${i18next.t('fileViewer.unsupportedFile.supportedFormats')}`,
        buttons: ['OK']
      });
    }
    return;
  }

  // Hide welcome view when opening a document
  const baseWindow = getBaseWindow();
  if (baseWindow) {
    hideWelcomeView(baseWindow);
  }

  if (!skipDuplicateCheck) {
    const skipOpening = await checkCurrentTabIsOpened(filePath);
    if (skipOpening) {
      return;
    }
  }

  toolbarWebContentsViewSend("document-opened", filePath, fileNameBase, fileType);

  ApplicationMenu
    .setIsNewDocument(false)
    .build(onClickMenuItem)
}

function onDocumentSaved(filePath: string): void {
  const fileNameParsed = path.parse(filePath);
  const fileNameBase = fileNameParsed.base;

  toolbarWebContentsViewSend("document-saved", fileNameBase);
  toolbarWebContentsViewSend("main-text-changed", false);
  updateRecentDocuments(filePath);
  selectedWebContentsViewSend("document-saved");

  ApplicationMenu.build(onClickMenuItem)
  const selectedContentView = getSelectedWebContentsView()
  if (!selectedContentView)
    return

  const selectedContentViewId = selectedContentView?.webContents.id
  updateTabFilePath(selectedContentViewId, filePath)

  DocumentTabManager
    .setCurrentTab()
    .setTouched(false)
    .sendUpdate()

  ApplicationMenu
    .setIsNewDocument(false)
    .build(onClickMenuItem)
}

function onDocumentRenamed(filename: string): void {
  toolbarWebContentsViewSend("document-renamed", filename);
}

function onClickMenuItem(menuItem: MenuItem, data?: object | string | null): void {
  const typeId: MenuItemId = menuItem.id as MenuItemId;

  switch (typeId) {
    case MenuItemId.PREFERENCES: {
      openPreferencesWindow();
    }
      break;
    case MenuItemId.NEW_FILE:
      toolbarWebContentsViewSend("create-new-document");
      ApplicationMenu
        .setIsNewDocument(true)
        .build(onClickMenuItem)
      break;
    case MenuItemId.OPEN_FILE:
      openDocument(onDocumentOpened);
      break;
    case MenuItemId.OPEN_RECENT_FILE:
      openDocumentAtPath(data as string, onDocumentOpened);
      break;
    case MenuItemId.CLOSE_FILE:
      closeCurrentDocument();
      break;
    case MenuItemId.SAVE_FILE:
      saveDocument(onDocumentSaved);
      break;
    case MenuItemId.SAVE_FILE_AS:
      saveDocumentAs(onDocumentSaved);
      break;
    case MenuItemId.RENAME_FILE:
      renameDocument(onDocumentRenamed);
      break;
    case MenuItemId.MOVE_FILE:
      moveDocument();
      break;
    case MenuItemId.EXPORT_TO_PDF:
      selectedWebContentsViewSend('print-options', {
        export: true,
        print: false
      });
      break;
    case MenuItemId.EXPORT_TO_XML_TEI:
      selectedWebContentsViewSend('export-tei-setup');
      break;
    case MenuItemId.SAVE_AS_TEMPLATE:
      selectedWebContentsViewSend('save-as-template');
      break
    case MenuItemId.METADATA:
      selectedWebContentsViewSend('metadata');
      break;
    case MenuItemId.PAGE_SETUP:
      selectedWebContentsViewSend('page-setup')
      break;
    case MenuItemId.PRINT:
      selectedWebContentsViewSend('print-options', {
        print: true,
        export: false
      });
      break;
    case MenuItemId.AUTHENTICATION:
      openAuthWindow()
      break;
    case MenuItemId.LOGOUT:
      openLogoutWindow()
      break;
    case MenuItemId.CHAT:
      selectedWebContentsViewSend('open-chat');
      break;
    case MenuItemId.SHARE_FOR_COLLABORATOR:
      openShareDocumentWindow()
      break;
    case MenuItemId.SHARED_FILES:
      openSharedDocumentsWindow()
      break;

    // Edit menu
    case MenuItemId.FIND_AND_REPLACE:
      openFindWindow();
      break;
    case MenuItemId.UNDO:
      selectedWebContentsViewSend('trigger-undo');
      break
    case MenuItemId.REDO:
      selectedWebContentsViewSend('trigger-redo');
      break
    case MenuItemId.CUT:
      selectedWebContentsViewSend("cut");
      break;
    case MenuItemId.COPY:
      selectedWebContentsViewSend("copy");
      break;
    case MenuItemId.COPY_STYLE:
      selectedWebContentsViewSend("copy-style");
      break;
    case MenuItemId.PASTE:
      selectedWebContentsViewSend("paste");
      break;
    case MenuItemId.PASTE_STYLE:
      selectedWebContentsViewSend("paste-style");
      break;
    case MenuItemId.PASTE_TEXT_WITHOUT_FORMATTING:
      selectedWebContentsViewSend("paste-text-without-formatting");
      break;
    case MenuItemId.DELETE_SELECTION:
      selectedWebContentsViewSend("delete-selection");
      break;
    case MenuItemId.SELECT_ALL:
      selectedWebContentsViewSend('select-all');
      break;
    case MenuItemId.DESELECT_ALL:
      selectedWebContentsViewSend('deselect-all');
      break;

    // Insert menu
    case MenuItemId.INSERT_COMMENT:
      selectedWebContentsViewSend('insert-comment');
      break
    case MenuItemId.INSERT_BOOKMARK:
      selectedWebContentsViewSend('insert-bookmark');
      break
    case MenuItemId.INSERT_HIGHLIGHT:
      selectedWebContentsViewSend("insert-highlight");
      break
    case MenuItemId.INSERT_LINK:
      selectedWebContentsViewSend("insert-link");
      break
    case MenuItemId.INSERT_IMAGE:
      selectedWebContentsViewSend("insert-image");
      break
    case MenuItemId.INSERT_SYMBOL:
      selectedWebContentsViewSend("insert-symbol");
      break
    case MenuItemId.INSERT_OBJECT:
      selectedWebContentsViewSend("insert-object");
      break
    case MenuItemId.INSERT_TABLE:
      selectedWebContentsViewSend("insert-table");
      break
    case MenuItemId.INSERT_SHAPES_AND_LINES:
      selectedWebContentsViewSend("insert-shapes-and-lines");
      break
    case MenuItemId.INSERT_PAGE_BREAK:
      selectedWebContentsViewSend("insert-page-break");
      break
    case MenuItemId.INSERT_SECTION_BREAK:
      selectedWebContentsViewSend("insert-section-break");
      break
    case MenuItemId.INSERT_LINE_NUMBER_NONE:
      DocumentTabManager
        .setCurrentTab()
        .setLineNumberShowLines(0)
        .setTouched()
        .sendUpdate();
      ApplicationMenu
        .setLineNumberShowLines(0)
        .build(onClickMenuItem);
      break
    case MenuItemId.INSERT_LINE_NUMBER_EACH_5_LINE:
      DocumentTabManager
        .setCurrentTab()
        .setLineNumberShowLines(5)
        .setTouched()
        .sendUpdate();
      ApplicationMenu
        .setLineNumberShowLines(5)
        .build(onClickMenuItem);
      break
    case MenuItemId.INSERT_LINE_NUMBER_EACH_10_LINE:
      DocumentTabManager
        .setCurrentTab()
        .setLineNumberShowLines(10)
        .setTouched()
        .sendUpdate();
      ApplicationMenu
        .setLineNumberShowLines(10)
        .build(onClickMenuItem);
      break
    case MenuItemId.INSERT_LINE_NUMBER_EACH_15_LINE:
      DocumentTabManager
        .setCurrentTab()
        .setLineNumberShowLines(15)
        .setTouched()
        .sendUpdate();
      ApplicationMenu
        .setLineNumberShowLines(15)
        .build(onClickMenuItem);
      break
    case MenuItemId.INSERT_PAGE_NUMBER:
      selectedWebContentsViewSend("insert-page-number");
      break
    case MenuItemId.INSERT_DATE:
      selectedWebContentsViewSend("insert-date");
      break
    case MenuItemId.INSERT_DATE_AND_TIME:
      selectedWebContentsViewSend("insert-date-and-time");
      break
    case MenuItemId.INSERT_AUTHOR:
      selectedWebContentsViewSend("insert-author");
      break
    case MenuItemId.INSERT_TITLE:
      selectedWebContentsViewSend("insert-title");
      break
    case MenuItemId.INSERT_NOTE:
      break
    case MenuItemId.INSERT_NOTE_TO_APPARATUS:
      selectedWebContentsViewSend("insert-note-to-apparatus", data);
      break
    case MenuItemId.INSERT_NOTE_IN_INNER_MARGIN:
      selectedWebContentsViewSend("add-note-in-inner-margin");
      break
    case MenuItemId.INSERT_NOTE_IN_OUTER_MARGIN:
      selectedWebContentsViewSend("add-note-in-outer-margin");
      break
    case MenuItemId.SWAP_MARGIN:
      selectedWebContentsViewSend("swap-margin");
      break
    case MenuItemId.ADD_READING_TYPE_ADD:
      selectedWebContentsViewSend("add-reading-type-add");
      break
    case MenuItemId.ADD_READING_TYPE_OM:
      selectedWebContentsViewSend("add-reading-type-om");
      break
    case MenuItemId.ADD_READING_TYPE_TR:
      selectedWebContentsViewSend("add-reading-type-tr");
      break
    case MenuItemId.ADD_READING_TYPE_DEL:
      selectedWebContentsViewSend("add-reading-type-del");
      break
    case MenuItemId.ADD_READING_TYPE_CUSTOM:
      selectedWebContentsViewSend("add-reading-type-custom");
      break
    case MenuItemId.ADD_READING_SEPARATOR:
      selectedWebContentsViewSend("add-reading-separator");
      break
    case MenuItemId.ADD_SIGLUM:
      selectedWebContentsViewSend("add-siglum");
      break
    case MenuItemId.SIGLA_SETUP:
      selectedWebContentsViewSend("sigla-setup");
      break
    case MenuItemId.ADD_CITATION:
      selectedWebContentsViewSend("add-citation");
      break
    case MenuItemId.ADD_BIBLIOGRAPHY:
      selectedWebContentsViewSend("bibliography");
      break
    case MenuItemId.REFERENCES_FORMAT:
      selectedWebContentsViewSend("references-format");
      break
    case MenuItemId.ADD_APPARATUS_CRITICAL: {
      const apparatus = DocumentTabManager
        .setCurrentTab()
        .addApparatusTypeAtIndex("CRITICAL", 0)
        .updateLayout()
        .sendUpdate()
        .apparatusAtIndex(0)
      selectedWebContentsViewSend("add-apparatus", apparatus);
      break
    }
    case MenuItemId.ADD_APPARATUS_PAGE_NOTES: {
      const apparatus = DocumentTabManager
        .setCurrentTab()
        .addApparatusTypeAtIndex("PAGE_NOTES", 0)
        .updateLayout()
        .sendUpdate()
        .apparatusAtIndex(0)
      selectedWebContentsViewSend("add-apparatus", apparatus);
      break
    }
    case MenuItemId.ADD_APPARATUS_SECTION_NOTES: {
      const apparatus = DocumentTabManager
        .setCurrentTab()
        .addApparatusTypeAtIndex("SECTION_NOTES", 0)
        .updateLayout()
        .sendUpdate()
        .apparatusAtIndex(0)
      selectedWebContentsViewSend("add-apparatus", apparatus);
      break
    }
    case MenuItemId.ADD_APPARATUS_INNER_MARGIN: {
      const apparatus = DocumentTabManager
        .setCurrentTab()
        .addApparatusTypeAtIndex("INNER_MARGIN", 0)
        .updateLayout()
        .sendUpdate()
        .apparatusAtIndex(0)
      selectedWebContentsViewSend("add-apparatus", apparatus);
      break
    }
    case MenuItemId.ADD_APPARATUS_OUTER_MARGIN: {
      const apparatus = DocumentTabManager
        .setCurrentTab()
        .addApparatusTypeAtIndex("OUTER_MARGIN", 0)
        .updateLayout()
        .sendUpdate()
        .apparatusAtIndex(0)
      selectedWebContentsViewSend("add-apparatus", apparatus);
      break
    }
    case MenuItemId.FONT_BOLD:
      selectedWebContentsViewSend("toggle-bold");
      break
    case MenuItemId.FONT_ITALIC:
      selectedWebContentsViewSend("toggle-italic");
      break
    case MenuItemId.FONT_UNDERLINE:
      selectedWebContentsViewSend("toggle-underline");
      break
    case MenuItemId.FONT_STRIKETHROUGH:
      selectedWebContentsViewSend("toggle-strikethrough");
      break
    case MenuItemId.FONT_SUPERSCRIPT:
      selectedWebContentsViewSend("toggle-superscript");
      break
    case MenuItemId.FONT_SUBSCRIPT:
      selectedWebContentsViewSend("toggle-subscript");
      break
    case MenuItemId.FONT_NPC:
      selectedWebContentsViewSend("toggle-npc", 'npc');
      break
    case MenuItemId.FONT_CAPTALIZATION_ALL_CAPS:
      selectedWebContentsViewSend("change-character-style", 'all-caps');
      break
    case MenuItemId.FONT_CAPTALIZATION_SMALL_CAPS:
      selectedWebContentsViewSend("change-character-style", 'small-caps');
      break
    case MenuItemId.FONT_CAPTALIZATION_TITLE_CASE:
      selectedWebContentsViewSend("change-character-style", 'title-case');
      break
    case MenuItemId.FONT_CAPTALIZATION_START_CASE:
      selectedWebContentsViewSend("change-character-style", 'start-case');
      break
    case MenuItemId.FONT_CAPTALIZATION_NONE:
      selectedWebContentsViewSend("change-character-style", 'none-case');
      break
    case MenuItemId.FONT_LIGATURE_DEFAULT:
      selectedWebContentsViewSend("set-font-ligature", "standard");
      break
    case MenuItemId.FONT_LIGATURE_NONE:
      selectedWebContentsViewSend("set-font-ligature", "none");
      break
    case MenuItemId.FONT_LIGATURE_ALL:
      selectedWebContentsViewSend("set-font-ligature", "all");
      break
    case MenuItemId.FONT_CHARACTER_SPACING_NORMAL:
      selectedWebContentsViewSend("change-character-spacing", "normal");
      break
    case MenuItemId.FONT_CHARACTER_SPACING_TIGHTEN:
      selectedWebContentsViewSend("change-character-spacing", "decrease");
      break
    case MenuItemId.FONT_CHARACTER_SPACING_LOOSEN:
      selectedWebContentsViewSend("change-character-spacing", "increase");
      break
    case MenuItemId.TEXT_ALIGN_LEFT:
      selectedWebContentsViewSend("change-alignment", "left");
      break
    case MenuItemId.TEXT_ALIGN_CENTER:
      selectedWebContentsViewSend("change-alignment", "center");
      break
    case MenuItemId.TEXT_ALIGN_RIGHT:
      selectedWebContentsViewSend("change-alignment", "right");
      break
    case MenuItemId.TEXT_ALIGN_JUSTIFY:
      selectedWebContentsViewSend("change-alignment", "justify");
      break
    case MenuItemId.TEXT_INCREASE_INDENT:
      selectedWebContentsViewSend("change-indent-level", "increase");
      break
    case MenuItemId.TEXT_DECREASE_INDENT:
      selectedWebContentsViewSend("change-indent-level", "decrease");
      break
    case MenuItemId.TEXT_SPACING_SINGLE:
      selectedWebContentsViewSend("set-line-spacing", "1");
      break
    case MenuItemId.TEXT_SPACING_1_15:
      selectedWebContentsViewSend("set-line-spacing", "1.15");
      break
    case MenuItemId.TEXT_SPACING_ONE_AND_HALF:
      selectedWebContentsViewSend("set-line-spacing", "1.5");
      break
    case MenuItemId.TEXT_SPACING_DOUBLE:
      selectedWebContentsViewSend("set-line-spacing", "2");
      break
    case MenuItemId.CUSTOM_SPACING:
      selectedWebContentsViewSend("show-spacing-settings");
      break
    case MenuItemId.LAYOUT_PAGE_SETUP:
      selectedWebContentsViewSend('show-page-setup');
      break
    case MenuItemId.CHANGE_TEMPLATE:
      selectedWebContentsViewSend('show-change-template-modal');
      break
    case MenuItemId.PAGE_NUMBER:
      selectedWebContentsViewSend('page-number-settings');
      break
    case MenuItemId.OPEN_LINE_NUMBER_SETTINGS:
      selectedWebContentsViewSend('line-numbers-settings');
      break
    case MenuItemId.OPEN_HEADER_FOOTER_SETTINGS:
      selectedWebContentsViewSend('header-settings');
      break
    case MenuItemId.OPEN_FOOTER_SETTINGS:
      selectedWebContentsViewSend('footer-settings');
      break
    case MenuItemId.OPEN_TOC_SETTINGS:
      selectedWebContentsViewSend('toc-settings');
      break
    case MenuItemId.REMOVE_LINK:
      selectedWebContentsViewSend("remove-link");
      break
    case MenuItemId.NUMBER_BULLET:
      selectedWebContentsViewSend("number-bullet");
      break;
    case MenuItemId.UPPER_LETTER_BULLET:
      selectedWebContentsViewSend("upper-letter-bullet");
      break;
    case MenuItemId.LOW_LETTER_BULLET:
      selectedWebContentsViewSend("low-letter-bullet");
      break;
    case MenuItemId.UPPER_ROMAN_BULLET:
      selectedWebContentsViewSend("upper-roman-bullet");
      break;
    case MenuItemId.LOW_ROMAN_BULLET:
      selectedWebContentsViewSend("low-roman-bullet");
      break;
    case MenuItemId.POINT_BULLET:
      selectedWebContentsViewSend("point-bullet");
      break;
    case MenuItemId.CIRCLE_BULLET:
      selectedWebContentsViewSend("circle-bullet");
      break;
    case MenuItemId.SQUARE_BULLET:
      selectedWebContentsViewSend("square-bullet");
      break;
    case MenuItemId.PREVIOUS_NUMBERING:
      selectedWebContentsViewSend("previous-numbering");
      break;
    case MenuItemId.RESUME_NUMBERING:
      selectedWebContentsViewSend("resume-numbering");
      break;
    case MenuItemId.SECTIONS_STYLE:
      selectedWebContentsViewSend("show-sections-style-modal");
      break;

    // Tools menu
    case MenuItemId.MACROS:
      selectedWebContentsViewSend("record");
      break
    case MenuItemId.MACROS_RECORD:
      selectedWebContentsViewSend("record");
      break
    case MenuItemId.DOCUMENT_STATISTICS:
      selectedWebContentsViewSend("document-statistics");
      break
    case MenuItemId.HYPHENATION:
      selectedWebContentsViewSend("hyphenation");
      break
    case MenuItemId.COMPARE_DOCUMENTS:
      selectedWebContentsViewSend("compare-documents");
      break
    case MenuItemId.REVIEW:
      selectedWebContentsViewSend("review");
      break
    case MenuItemId.ACCEPT_ALL_CHANGES:
      selectedWebContentsViewSend("accept-all-changes");
      break
    case MenuItemId.REJECT_ALL_CHANGES:
      selectedWebContentsViewSend("reject-all-changes");
      break
    case MenuItemId.ADD_ONS:
      selectedWebContentsViewSend("addOns");
      break

    // Keyboard menu
    case MenuItemId.SHOW_MAP:
      selectedWebContentsViewSend("show-map");
      break
    case MenuItemId.CUSTOMIZE_SHORTCUTS: {
      const url = getRootUrl() + "keyboard-shortcuts";
      const existingWindow = getChildWindow();
      if (existingWindow && !existingWindow.isDestroyed()) {
        existingWindow.focus();
      } else {
        openChildWindow(url, {
          title: i18next.t('menu.keyboard.customizeShortcuts'),
          resizable: true,
        });
      }
      break;
    }
    case MenuItemId.NONE:
      selectedWebContentsViewSend("none");
      break
    case MenuItemId.ARABIC:
      selectedWebContentsViewSend("language");
      break
    case MenuItemId.ARMENIAN:
      selectedWebContentsViewSend("language");
      break
    case MenuItemId.CYRILLIC:
      selectedWebContentsViewSend("language");
      break
    case MenuItemId.LATIN:
      selectedWebContentsViewSend("language");
      break

    // View menu
    case MenuItemId.TOGGLE_VIEW_APPARATUS: {
      const apparatus = data as Apparatus;
      DocumentTabManager
        .setCurrentTab()
        .toggleApparatusVisibility(apparatus)
        .updateLayout()
        .sendUpdate()
      selectedWebContentsViewSend("toggle-view-apparatus", apparatus);
      break
    }
    case MenuItemId.TABLE_OF_CONTENTS:
      selectedWebContentsViewSend("toggle-toc-visibility");
      break
    case MenuItemId.TOOLBAR:
      storeToolbarIsVisible(!readToolbarIsVisible())
      ApplicationMenu.build(onClickMenuItem)
      getWebContentsViews().forEach((webContentView) =>
        webContentView.webContents.send(
          "toggle-toolbar",
          readToolbarIsVisible()
        )
      );
      break;
    case MenuItemId.CUSTOMIZE_TOOLBAR:
      selectedWebContentsViewSend("customize-toolbar");
      break
    case MenuItemId.STATUS_BAR:
      toggleStatusbarVisibility();
      ApplicationMenu.build(onClickMenuItem);
      getWebContentsViews().forEach((webContentView) =>
        webContentView.webContents.send(
          "set-status-visibility",
          readStatusbarVisibility()
        )
      );
      break;
    case MenuItemId.CUSTOMIZE_STATUS_BAR:
      selectedWebContentsViewSend("customize-status-bar");
      break
    case MenuItemId.PRINT_PREVIEW:
      selectedWebContentsViewSend("toggle-print-preview");
      break
    case MenuItemId.SHOW_TABS_ALIGNED_HORIZONTALLY:
      selectedWebContentsViewSend("show-tabs-aligned-horizontally");
      break
    case MenuItemId.SHOW_TABS_ALIGNED_VERTICALLY:
      selectedWebContentsViewSend("show-tabs-aligned-vertically");
      break
    case MenuItemId.ZOOM: {
      const webContentViews = getWebContentsViews();
      webContentViews.forEach(webContentView => {
        webContentView.webContents.send('zoom-change', readZoom());
      });
      break
    }
    case MenuItemId.GO_TO_NEXT_PAGE:
      selectedWebContentsViewSend("go-to-next-page");
      break
    case MenuItemId.GO_TO_PREVIOUS_PAGE:
      selectedWebContentsViewSend("go-to-previous-page");
      break
    case MenuItemId.GO_TO_FIRST_PAGE:
      selectedWebContentsViewSend("go-to-first-page");
      break
    case MenuItemId.GO_TO_LAST_PAGE:
      selectedWebContentsViewSend("go-to-last-page");
      break
    case MenuItemId.GO_TO_PAGE:
      selectedWebContentsViewSend("go-to-page");
      break
    case MenuItemId.SYNCHRONIZE_VIEWS:
      selectedWebContentsViewSend("synchronize-views");
      break
    case MenuItemId.NON_PRINTING_CHARACTERS:
      selectedWebContentsViewSend("non-printing-characters");
      break
    case MenuItemId.EXPAND_COLLAPSE:
      selectedWebContentsViewSend("expand-collapse");
      break

    // Window menu
    case MenuItemId.MINIMIZE:
      selectedWebContentsViewSend("minimize");
      break
    case MenuItemId.ZOOM_WINDOW:
      selectedWebContentsViewSend("zoom-window");
      break
    case MenuItemId.ZOOM_ALL:
      selectedWebContentsViewSend("zoom-all");
      break
    case MenuItemId.FILL:
      selectedWebContentsViewSend("fill");
      break
    case MenuItemId.CENTRE:
      selectedWebContentsViewSend("centre");
      break
    case MenuItemId.MOVE_RESIZE:
      selectedWebContentsViewSend("move-resize");
      break
    case MenuItemId.FULL_SCREEN_TILE:
      selectedWebContentsViewSend("full-screen-tile");
      break
    case MenuItemId.REMOVE_WINDOW_FROM_SET:
      selectedWebContentsViewSend("remove-window-from-set");
      break
    case MenuItemId.MOVE_TO:
      selectedWebContentsViewSend("move-to");
      break
    case MenuItemId.BRING_ALL_TO_FRONT:
      selectedWebContentsViewSend("bring-all-to-front");
      break
    case MenuItemId.SHOW_PREVIOUS_TAB:
      selectedWebContentsViewSend("show-previous-tab");
      break
    case MenuItemId.SHOW_NEXT_TAB:
      selectedWebContentsViewSend("show-next-tab");
      break
    case MenuItemId.MOVE_TAB_TO_NEW_WINDOW:
      selectedWebContentsViewSend("move-tab-to-new-window");
      break
    case MenuItemId.MERGE_ALL_WINDOWS:
      selectedWebContentsViewSend("merge-all-windows");
      break
    case MenuItemId.UNTITLED:
      selectedWebContentsViewSend("untitled");
      break

    // Help menu
    case MenuItemId.HELP:
      selectedWebContentsViewSend("help");
      break
    case MenuItemId.SUBMIT_TICKET:
      shell.openExternal(LINK_TO_SUPPORT_PAGE).catch(err => {
        mainLogger.error("Electron", "Error opening support page", err as Error);
      });
      break
    case MenuItemId.FAQS:
      selectedWebContentsViewSend("faqs");
      break
    case MenuItemId.FORUM:
      selectedWebContentsViewSend("forum");
      break
    case MenuItemId.WHAT_IS_NEW:
      selectedWebContentsViewSend("what-is-new");
      break
    case MenuItemId.REPORT_AN_ISSUE:
      selectedWebContentsViewSend("report-an-issue");
      break
    case MenuItemId.ABOUT: {
      const url = getRootUrl() + "about";
      openChildWindow(url, { title: "About", width: 440, height: 272 });
      break;
    }
    case MenuItemId.RELOAD:
      getSelectedWebContentsView()?.webContents.reload()
      break
    case MenuItemId.TOGGLE_DEV_TOOLS:
      devToolsToggleHandler(getSelectedWebContentsView())
      break
    default:
      break;
  }
}

const waitForToolbarReady = async (): Promise<void> => {
  const toolbarWebContentsView = getToolbarWebContentsView();
  if (!toolbarWebContentsView) {
    throw new Error("Toolbar WebContentsView not available");
  }

  const isToolbarReady = (): boolean => {
    return toolbarWebContentsView.webContents.isLoading() === false;
  };

  if (isToolbarReady()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const checkReady = (): void => {
      if (isToolbarReady()) {
        resolve();
      } else {
        setImmediate(checkReady);
      }
    };
    checkReady();
  });
};

const restoreTabsFromSavedLayout = async (simplifiedTabs: SimplifiedTab[]): Promise<void> => {
  const toolbarWebContentsView = getToolbarWebContentsView();
  if (!toolbarWebContentsView) {
    mainLogger.error("Layout", "Toolbar WebContentsView not available for tab restoration");
    return;
  }

  await waitForToolbarReady();
  mainLogger.info("Layout", "Toolbar is ready, starting tab restoration");

  // Open documents sequentially using the existing, proven flow
  // Wait for each document to fully load before opening the next one
  for (let i = 0; i < simplifiedTabs.length; i++) {
    const savedTab = simplifiedTabs[i];

    try {
      mainLogger.info("Layout", `Restoring document ${i + 1}/${simplifiedTabs.length}: ${savedTab.filePath}`);

      // Use the existing openDocument function with onDocumentOpened callback
      // This is the same flow used when manually opening documents
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Timeout restoring document: ${savedTab.filePath}`));
        }, 10000); // 10 second timeout per document

        // Create a one-time listener for this specific document load
        const handleDocumentLoaded = (_event: Electron.IpcMainEvent, filepath: string): void => {
          if (filepath === savedTab.filePath) {
            clearTimeout(timeoutId);
            ipcMain.removeListener("document-opened-at-path", handleDocumentLoaded);

            // Wait a bit for DocumentTabManager to be fully initialized
            setTimeout(() => {
              mainLogger.info("Layout", `Document ${i + 1} fully loaded: ${savedTab.filePath}`);
              resolve();
            }, 200);
          }
        };

        ipcMain.on("document-opened-at-path", handleDocumentLoaded);

        // Use the existing openDocument function - this is the proven, working flow
        // Skip duplicate check during restoration to avoid showing dialog
        openDocumentAtPath(savedTab.filePath, (filePath) => onDocumentOpened(filePath, true));
      });

    } catch (err) {
      mainLogger.error("Layout", `Failed to restore document: ${savedTab.filePath}`, err as Error);
    }
  }

  // All documents are now loaded, select the last opened tab (last in cycle)
  const webContentViews = getWebContentsViews();
  const lastTabIndex = webContentViews.length - 1;

  if (lastTabIndex >= 0) {
    const lastContentView = webContentViews[lastTabIndex];
    const lastTabId = lastContentView.webContents.id;

    // Set the last tab as selected
    setSelectedWebContentsViewWithId(lastTabId);
    showWebContentsView(lastContentView);
    lastContentView.webContents.focus();

    // Initialize DocumentTabManager for the last tab
    DocumentTabManager.setCurrentTab();

    // Notify all views about the selection
    webContentViews.forEach(webContentView => {
      webContentView.webContents.send('tab-selected', lastTabId);
    });

    mainLogger.info("Layout", `Selected last restored tab ${lastTabId} (index: ${lastTabIndex})`);
  }

  mainLogger.info("Layout", `Tab restoration completed: ${simplifiedTabs.length} documents restored`);
};

const onBaseWindowReady = async (baseWindow: BaseWindow): Promise<void> => {
  const pendingFile = getPendingFilePath();
  mainLogger.info("Layout", `onBaseWindowReady called, rememberLayout: ${readRememberLayout()}, pendingFile: ${pendingFile}`);

  // Store pending file to open (from double-click while app was closed)
  const hasPendingFile = !!pendingFile;
  const fileToOpen = pendingFile;
  if (hasPendingFile) {
    mainLogger.info("Layout", `Found pending file to open: ${fileToOpen}`);
    clearPendingFilePath(); // Clear it
  }

  // Check if rememberLayout is enabled and if there are saved tabs to restore
  let shouldRestoreTabs = false;
  const simplifiedTabs: SimplifiedTab[] = [];

  if (readRememberLayout()) {
    const savedTabs = getSimplifiedLayoutTabs();
    mainLogger.info("Layout", `Found ${savedTabs?.length || 0} saved simplified tabs`);

    if (savedTabs && savedTabs.length > 0) {
      // Check which tabs can be restored (files still exist)
      for (const savedTab of savedTabs) {
        if (!savedTab.filePath) {
          mainLogger.info("Layout", "Skipping tab without file path");
          continue;
        }

        // Check if file still exists
        if (!existsSync(savedTab.filePath)) {
          mainLogger.info("Layout", `File not found: ${savedTab.filePath}, skipping restoration`);
          continue;
        }

        simplifiedTabs.push(savedTab);
      }

      if (simplifiedTabs.length > 0) {
        mainLogger.info("Layout", `Found ${simplifiedTabs.length} valid tabs to restore`);

        simplifiedTabs.forEach((tab, index) => {
          mainLogger.info("Layout", `Valid tab ${index}: ${tab.filePath} (route: ${tab.route}, selected: ${tab.selected})`);
        });

        shouldRestoreTabs = true;
        mainLogger.info("Layout", "Will restore tabs using event-driven approach");
      }
    }
  }

  // Decision tree:
  // 1. If we have saved tabs to restore: restore them
  // 2. If we don't have saved tabs but have a pending file: open the pending file only
  // 3. If we have neither: create a new empty document

  if (shouldRestoreTabs) {
    // Restore saved layout
    await restoreTabsFromSavedLayout(simplifiedTabs);

    // If there's also a pending file from double-click, open it too
    if (hasPendingFile && fileToOpen) {
      mainLogger.info("Layout", `Opening double-clicked file after layout restoration: ${fileToOpen}`);
      await waitForToolbarReady();
      await openDocumentAtPath(fileToOpen, onDocumentOpened);
    }
  } else if (hasPendingFile && fileToOpen) {
    // No saved tabs, but we have a file from double-click - open it
    mainLogger.info("Layout", `Opening double-clicked file without layout restoration: ${fileToOpen}`);
    await waitForToolbarReady();
    await openDocumentAtPath(fileToOpen, onDocumentOpened);
  } else {
    // No saved tabs and no pending file - show welcome view
    mainLogger.info("Layout", `Showing welcome view (no saved tabs, no pending file)`);
    await createWelcomeWebContentsView(baseWindow);
    showWelcomeView(baseWindow);
  }
};

const openFindWindow = (): void => {
  if (!getFindAndReplaceWindow()) {
    const url = getRootUrl() + "find_and_replace";
    openFindAndReplaceWindow(url, { title: "Find and Replace", height: 300, width: 640, minHeight: 256, minWidth: 640 });
    getFindAndReplaceWindow()?.once('close', () => {
      selectedWebContentsViewSend('document-reset-find');
    });
  }
}

const initializeApp = async (): Promise<void> => {
  const appTaskId = mainLogger.startTask("Electron", "Starting application");

  await initializei18next();

  initializeThemeManager();

  await app.whenReady();

  await cleanupOldTempDirectories();

  DocumentTabManager.onUpdate((documentTab: DocumentTab, documentTabList: DocumentTab[]) => {

    console.log('DocumentTabManager onUpdate', documentTabList)

    toolbarWebContentsViewSend("document-tabs-changed", documentTabList.map(doc => ({
      id: doc.id,
      touched: doc.touched,
    })));

    ApplicationMenu
      .setReferencesMenuApparatuses(documentTab.document?.apparatuses ?? [])
      .build(onClickMenuItem)
  })

  // PROTOCOL API (for local resources)
  protocol.handle('local-resource', async (request) => {
    const decodedUrl = decodeURIComponent(
      request.url.replace(new RegExp(`^local-resource://`, 'i'), '/')
    )
    const fullPath = process.platform === 'win32' ? convertPath(decodedUrl) : decodedUrl
    return net.fetch(`file://${fullPath}`)
  })

  // TABS API
  ipcMain.handle('tabs:new', async (_, fileType: FileType) => {
    const baseWindow = getBaseWindow();

    // Hide welcome view when creating a new tab
    if (baseWindow) {
      hideWelcomeView(baseWindow);
    }

    const route = fileTypeToRouteMapping[fileType]
    const menuViewMode = routeToMenuMapping[route]
    ApplicationMenu
      .setMenuViewMode(menuViewMode)
      .build(onClickMenuItem)
    const webContentsView = await createWebContentsView(route)
    const tabId = webContentsView?.webContents.id

    if (!tabId)
      return null

    DocumentTabManager
      .create()
      .setId(tabId)
      .add()

    return tabId
  })

  ipcMain.handle('tabs:close', async (_, tabId: number) => {
    mainLogger.info('tabs:close', `[tabs:close] Closing tab ${tabId}`);
    const tabs = closeWebContentsViewWithId(tabId)
    const route = tabs.find((tab) => tab.selected)?.route
    const menuViewMode = routeToMenuMapping[route]
    const baseWindow = getBaseWindow();

    // Check if this was the last tab
    const remainingViews = getWebContentsViews();
    const isLastTab = remainingViews.length === 0;
    mainLogger.info('tabs:close', `[tabs:close] Remaining views: ${remainingViews.length}, isLastTab: ${isLastTab}`)

    if (process.platform === 'win32') {
      // On Windows, add significant delay to allow complete resource cleanup for large documents
      // Force garbage collection if available, then rebuild menu after substantial delay
      if (global.gc) {
        global.gc();
      }
      setTimeout(async (): Promise<void> => {
        DocumentTabManager
          .removeWithId(tabId)

        ApplicationMenu
          .setMenuViewMode(menuViewMode)
          .build(onClickMenuItem)

        // Show welcome view if no tabs remain
        if (isLastTab && baseWindow) {
          await createWelcomeWebContentsView(baseWindow);
          showWelcomeView(baseWindow);
        }
      }, 200); // 200ms delay for Windows large document cleanup
    } else {
      DocumentTabManager
        .removeWithId(tabId)

      ApplicationMenu
        .setMenuViewMode(menuViewMode)
        .build(onClickMenuItem)

      // Show welcome view if no tabs remain
      if (isLastTab && baseWindow) {
        mainLogger.info('tabs:close', ` Showing welcome view (isLastTab: ${isLastTab}, baseWindow: ${!!baseWindow})`)
        await createWelcomeWebContentsView(baseWindow);
        showWelcomeView(baseWindow);
      } else {
        mainLogger.info('tabs:close', `[tabs:close] NOT showing welcome view (isLastTab: ${isLastTab}, baseWindow: ${!!baseWindow})`);
      }
    }
  })

  ipcMain.handle('tabs:select', (_, id: number, tabType: TabType) => {
    setSelectedWebContentsViewWithId(id)
    const tabs = getTabs()
    const selectedTab = tabs.find((tab) => tab.selected)
    const isNewDocument = !selectedTab?.filePath || selectedTab.filePath === null
    const route = typeTypeToRouteMapping[tabType]
    const menuViewMode = routeToMenuMapping[route]

    ApplicationMenu
      .setIsNewDocument(isNewDocument)
      .setMenuViewMode(menuViewMode)
      .build(onClickMenuItem)

    DocumentTabManager
      .setCurrentTab()

    const webContentViews = getWebContentsViews();
    //print-preview tabId handler
    webContentViews.forEach(webContentView => {
      webContentView.webContents.send('tab-selected', id);
    });
  })

  ipcMain.handle('tabs:reorder', (_, tabIds: number[]) => reorderTabs(tabIds))

  ipcMain.handle('tabs:getAllContentViewsIds', () => getWebContentsViewsIds())

  ipcMain.handle('tabs:getSelectedTabId', () => getSelectedWebContentsViewId())

  ipcMain.handle('tabs:getCurrenTab', (): DocumentTab => {
    return DocumentTabManager.setCurrentTab().getCurrentTab()
  });

  ipcMain.handle('tabs:getCurrenTabFileName', (): string | null => {
    const tab = getSelectedTab()
    if (!tab)
      return null

    const currentTab = DocumentTabManager.setCurrentTab().getCurrentTab()
    const filepath = currentTab.path
    if (!filepath)
      return null
    const filename = path.basename(filepath)
    return filename;
  });

  ipcMain.handle('tabs:getCurrenTabFilePath', (): string | null => {
    const tab = getSelectedTab()
    if (!tab)
      return null
    const currentTab = DocumentTabManager.setCurrentTab().getCurrentTab()
    return currentTab.path
  });

  ipcMain.handle('menu:disableReferencesMenuItems', (_, data: string[]) => {
    if (JSON.stringify(ApplicationMenu.getDisabledReferencesMenuItemsIds()) === JSON.stringify(data)) return;
    mainLogger.info("Disabled references menu items:", JSON.stringify(data));
    ApplicationMenu
      .setDisabledReferencesMenuItemsIds(data)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:updateViewApparatusesMenuItems', (_, data) => {
    if (JSON.stringify(ApplicationMenu.getApparatusSubMenuObjectItems()) === JSON.stringify(data)) return;
    mainLogger.info("Apparatuses menu items:", JSON.stringify(data));
    ApplicationMenu
      .setApparatusSubMenuObjectItems(data)
      .build(onClickMenuItem)
  })

  ipcMain.handle('menu:setTocVisibility', (_, isVisible: boolean) => {
    if (ApplicationMenu.getTocVisible() === isVisible) return;
    mainLogger.info("Toc visibility:", JSON.stringify(isVisible));
    ApplicationMenu
      .setTocVisible(isVisible)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setLineNumberShowLines', (_event, value: number) => {
    mainLogger.info("Line number show lines:", value.toString());
    ApplicationMenu
      .setLineNumberShowLines(value)
      .build(onClickMenuItem);
  });

  ipcMain.handle('menu:setPrintPreviewVisibility', (_, isVisible: boolean) => {
    if (ApplicationMenu.getPrintPreviewVisible() === isVisible) return;
    mainLogger.info("Print preview visibility:", JSON.stringify(isVisible));
    ApplicationMenu
      .setPrintPreviewVisible(isVisible)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setTocMenuItemsEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getEnableTocVisibilityMenuItem() === isEnable) return;
    mainLogger.info("Toc menu items enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setEnableTocVisibilityMenuItem(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setTocSettingsEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getEnableTocSettingsMenu() === isEnable) return;
    mainLogger.info("Toc settings enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setEnableTocSettingsMenu(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setMenuFeatureEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getInsertMenuEnabled() === isEnable &&
      ApplicationMenu.getTextFormattingMenuEnabled() === isEnable) return;
    mainLogger.info("Menu features enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setInsertMenuEnabled(isEnable)
      .setTextFormattingMenuEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setAddCommentMenuItemEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getAddCommentMenuItemEnabled() === isEnable) return;
    mainLogger.info("Add comment menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setAddCommentMenuItemEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setAddBookmarkMenuItemEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getAddBookmarkMenuItemEnabled() === isEnable) return;
    mainLogger.info("Add bookmark menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setAddBookmarkMenuItemEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setLinkMenuItemEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getLinkMenuItemEnabled() === isEnable) return;
    mainLogger.info("Link menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setLinkMenuItemEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setCurrentSection', (_, section: string) => {
    mainLogger.info("Current section:", section);
    ApplicationMenu
      .setCurrentSection(section)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setRemoveLinkMenuItemEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getRemoveLinkMenuItemEnabled() === isEnable) return;
    mainLogger.info("Remove link menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setRemoveLinkMenuItemEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setAddCitationMenuItemEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getAddCitationMenuItemEnabled() === isEnable) return;
    mainLogger.info("Add citation menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setAddCitationMenuItemEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setSymbolMenuItemEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getSymbolMenuItemEnabled() === isEnable) return;
    mainLogger.info("Symbol menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setSymbolMenuItemEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setAddNoteMenuItemEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getAddNoteMenuItemEnabled() === isEnable) return;
    mainLogger.info("Add note menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setAddNoteMenuItemEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setAddReadingsEnabled', (_, isEnable: boolean) => {
    mainLogger.info("Add readings menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setAddReadingsEnabled(isEnable)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setReferencesMenuCurrentContext', (_, context: "maintext_editor" | "apparatus_editor") => {
    mainLogger.info("References menu context:", JSON.stringify(context));
    ApplicationMenu
      .setReferencesMenuCurrentContext(context)
      .build(onClickMenuItem)
  });

  ipcMain.handle('menu:setSiglumMenuItemEnabled', (_, isEnable: boolean) => {
    if (ApplicationMenu.getSiglumMenuItemEnabled() === isEnable) return;
    mainLogger.info("Siglum menu item enabled:", JSON.stringify(isEnable));
    ApplicationMenu
      .setSiglumMenuItemEnabled(isEnable)
      .build(onClickMenuItem)
  });

  // SYSTEM API
  ipcMain.handle('system:selectFolder', async (): Promise<string | null> => {
    const { canceled, filePaths } = await openFolder();
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle('system:saveFile', async (_, filepath, content): Promise<void> => {
    saveFile(filepath, content)
  })

  ipcMain.handle('system:getUserInfo', () => os.userInfo())

  ipcMain.handle('system:getFonts', () => Object.values(getFonts()).map(f => f.name).sort((a, b) => a.localeCompare(b)));

  ipcMain.handle('system:getSubsets', () => getSubsets());

  ipcMain.handle('system:getSymbols', (_, fontName: string) => getSymbols(fontName));

  ipcMain.handle('system:getConfiguredSpcialCharactersList', () => readSpecialCharacterConfig());

  ipcMain.handle('system:showMessageBox', async (_, title: string, message: string, buttons: string[], type?: string,) => {
    const baseWindow = getBaseWindow();
    if (!baseWindow) return;
    const result = await dialog.showMessageBox(baseWindow, {
      message: title,
      detail: message,
      buttons: buttons,
      type: (type as "warning" | "none" | "info" | "error" | "question") || "warning",
      noLink: true,
    });

    return result;
  })

  ipcMain.handle('system:worker', async (_, payload: WorkerRequest) => {
    const taskId = mainLogger.startTask("Worker", `Starting worker for search: ${JSON.stringify(payload)}`);
    return new Promise((resolve, reject) => {
      const workerPath = path.resolve(import.meta.dirname, "search-worker.js");
      const worker = new Worker(workerPath);
      worker.on('message', (msg: WorkerResponse) => {
        mainLogger.endTask(taskId, "Worker", `Worker returned ${msg.matches.length} matches for search: ${payload}`);
        resolve(msg.matches);
        worker.terminate();
      });
      worker.on('error', (err) => {
        mainLogger.error("Worker", "Worker error", err);
        reject(err);
        worker.terminate();
      });
      worker.postMessage(payload);
    });
  })

  ipcMain.handle('system:log', (_, entry: LogEntry) => {
    mainLogger.persistLog(entry);
  })

  ipcMain.handle('application:toolbarIsVisible', () => readToolbarIsVisible())

  ipcMain.handle('application:getStatusBarVisibility', () => readStatusbarVisibility());

  ipcMain.handle('application:readToolbarAdditionalItems', () => readToolbarAdditionalItems())

  ipcMain.handle('application:readStatusBarConfig', () => {
    return readStatusBarConfig();
  })

  ipcMain.handle('application:storeStatusBarConfig', (_, items) => {
    storeStatusBarConfig(items);
    const webContentViews = getWebContentsViews();
    webContentViews.forEach(webContentView => webContentView.webContents.send('status-bar-config', readStatusBarConfig()));
  })

  ipcMain.handle('application:readZoom', () => readZoom());

  ipcMain.handle('application:storeZoom', (_, zoom: string) => {
    storeZoom(zoom);
    // Convert percentage zoom to Electron zoom level (100% = 0, 200% = 1, 50% = -1, etc.)
    const webContentViews = getWebContentsViews();
    webContentViews.forEach(webContentView => {
      webContentView.webContents.send('zoom-change', readZoom());
    });
  });

  ipcMain.handle('application:updateToolbarAdditionalItems', (_, items) => {
    storeToolbarAdditionalItems(items);
    const webContentViews = getWebContentsViews();
    webContentViews.forEach((webContentView) =>
      webContentView.webContents.send(
        "toolbar-additional-items",
        readToolbarAdditionalItems()
      )
    );
  });

  ipcMain.handle('application:closeChildWindow', () => {
    closeChildWindow();
  })

  // Keyboard shortcuts IPC handlers
  ipcMain.handle('keyboard-shortcuts:getShortcuts', () => {
    return keyboardShortcutsManager.getShortcutsForCurrentOS(platform.isMacOS);
  });

  ipcMain.handle('keyboard-shortcuts:setShortcut', (_, menuItemId: string, shortcut: string) => {
    const result = keyboardShortcutsManager.setCustomShortcut(menuItemId, shortcut);
    if (result.success) {
      // Rebuild menu with updated shortcuts
      updateMenuShortcuts();
    }
    return result;
  });

  ipcMain.handle('keyboard-shortcuts:removeShortcut', (_, menuItemId: string) => {
    keyboardShortcutsManager.removeCustomShortcut(menuItemId);
    // Rebuild menu with updated shortcuts
    updateMenuShortcuts();
  });

  ipcMain.handle('keyboard-shortcuts:resetAll', () => {
    keyboardShortcutsManager.resetAllShortcuts();
    // Rebuild menu with updated shortcuts
    updateMenuShortcuts();
  });

  ipcMain.handle('document:savePdf', async (_, includeSections: PrintSections) => {
    // Get the current tab ID BEFORE generating the PDF to ensure we use the correct tab
    const currentTabId = getSelectedWebContentsViewId();

    // Set initial state: loading on the specific tab that requested the PDF
    DocumentTabManager
      .setId(currentTabId)
      .setPrintPreview({
        path: null,
        isLoaded: false,
        error: null
      });

    try {
      const pdfPath = await savePdf(includeSections);

      // Update state: success on the specific tab
      DocumentTabManager
        .setId(currentTabId)
        .setPrintPreview({
          path: pdfPath,
          isLoaded: true,
          error: null
        });

      // Notify all renderer views that PDF is ready, including the tab ID
      const webContentViews = getWebContentsViews();
      webContentViews.forEach(webContentView => {
        webContentView.webContents.send('pdf-generated', pdfPath, currentTabId);
      });
      return pdfPath;
    } catch (error) {
      // Update state: error on the specific tab
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto durante la generazione del PDF';
      DocumentTabManager
        .setId(currentTabId)
        .setPrintPreview({
          path: null,
          isLoaded: true,
          error: errorMessage
        });

      // Notify all renderer views about the error
      const webContentViews = getWebContentsViews();
      webContentViews.forEach(webContentView => {
        webContentView.webContents.send('pdf-generation-error', errorMessage, currentTabId);
      });
      throw error;
    }
  })

  ipcMain.handle('document:downloadDocument', (_, filename: string, document: DocumentData): Promise<boolean> => {
    return downloadDocument(filename, document)
  })

  ipcMain.handle('document:uploadDocument', async (_, documentId: string): Promise<Result<UploadDocumentSuccess, UploadDocumentError>> => {
    try {
      const documentTab = DocumentTabManager
        .setDocumentId(documentId)
        .getCurrentTab()

      const documentRecord = await loadDocumentFromPath(documentTab.path)
      if (!documentRecord)
        throw new Error("No document record loaded")

      const document = await createDocument(documentRecord)
      return uploadDocument(documentTab.path, document.id)
    } catch {
      const filepath = await openDocumentDialog()
      if (!filepath)
        throw new Error("No file path found")

      const documentRecord = await loadDocumentFromPath(filepath)
      if (!documentRecord)
        throw new Error("No document record loaded")

      const document = await createDocument(documentRecord)
      return uploadDocument(filepath, document.id)
    }
  })

  ipcMain.handle('document:getDocument', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getDocument();
  })

  ipcMain.handle('document:openDocument', () => {
    openDocument(onDocumentOpened);
  })

  ipcMain.handle('document:openDocumentAtPath', (_, filePath: string) => {
    openDocumentAtPath(filePath, onDocumentOpened);
  })

  ipcMain.handle('document:saveDocument', async () => {
    return await saveDocument(onDocumentSaved);
  })

  ipcMain.handle('document:getMainText', async () => {
    return DocumentTabManager
      .setCurrentTab()
      .getMainText()
  })

  ipcMain.handle('document:getAnnotations', async () => {
    return DocumentTabManager
      .setCurrentTab()
      .getAnnotations()
  })

  ipcMain.handle('document:setComments', (_, comments: AppComment[] | null) => {
    if (!comments)
      return;


    DocumentTabManager
      .setCurrentTab()
      .setComments(comments)
      .setTouched()
      .sendUpdate()
  })

  ipcMain.handle('document:setCommentCategories', (_, commentCategories: CommentCategory[] | null) => {
    if (!commentCategories)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setCommentCategories(commentCategories)
      .setTouched()
      .sendUpdate()
  })

  ipcMain.handle('document:setBookmarks', (_, bookmarks: Bookmark[] | null) => {
    if (!bookmarks)
      return;

    DocumentTabManager
      .setCurrentTab()
      .setBookmarks(bookmarks)
      .setTouched()
      .sendUpdate()
  })

  ipcMain.handle('document:setBookmarkCategories', (_, bookmarkCategories: BookmarkCategory[] | null) => {
    if (!bookmarkCategories)
      return;

    DocumentTabManager
      .setCurrentTab()
      .setBookmarkCategories(bookmarkCategories)
      .setTouched()
      .setBookmarkCategories(bookmarkCategories)
      .sendUpdate()
  })

  ipcMain.handle('document:getTemplate', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getTemplate()
  })

  ipcMain.handle('document:getPrintPreview', async () => {
    return DocumentTabManager.getPrintPreview() || { path: null, isLoaded: false, error: null };
  })

  ipcMain.handle('document:getFileAsDataUrl', async (_, filePath: string) => {
    const taskId = mainLogger.startTask("Document", `Converting file to data URL: ${filePath}`);
    mainLogger.info("Document", `getFileAsDataUrl called for: ${filePath}`);

    try {
      mainLogger.info("Document", "Checking if file exists");
      if (!existsSync(filePath)) {
        mainLogger.error("Document", `File not found: ${filePath}`);
        throw new Error(`File not found: ${filePath}`);
      }
      mainLogger.info("Document", "File exists, proceeding with read");

      const fileExtension = path.extname(filePath).toLowerCase();
      mainLogger.info("Document", `File extension: ${fileExtension}`);

      // Per i PDF, leggi il file e restituisci l'ArrayBuffer
      if (fileExtension === '.pdf') {
        mainLogger.info("Document", "PDF file detected, reading file as ArrayBuffer");

        // Check file size before reading
        const stats = statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        mainLogger.info("Document", `PDF file size: ${fileSizeInMB.toFixed(2)} MB`);

        if (fileSizeInMB > 500) {
          const errorMsg = `PDF file too large (${fileSizeInMB.toFixed(2)} MB). Maximum allowed size is 500 MB.`;
          mainLogger.error("Document", errorMsg);
          throw new Error(errorMsg);
        }

        mainLogger.info("Document", "Reading PDF file as ArrayBuffer");

        // Add timeout for large PDF files to prevent hanging
        const readPromise = promises.readFile(filePath);
        const timeoutPromise = new Promise((_, reject) => {
          const timeoutMs = fileSizeInMB > 50 ? 60000 : 30000; // 60s for files > 50MB, 30s for others
          setTimeout(() => reject(new Error(`PDF read timeout after ${timeoutMs / 1000} seconds`)), timeoutMs);
        });

        const fileBuffer = await Promise.race([readPromise, timeoutPromise]) as Buffer;
        mainLogger.info("Document", `PDF file read completed, buffer size: ${fileBuffer.length} bytes`);

        // Convert PDF to data URL for iframe compatibility
        const base64Data = fileBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64Data}`;

        mainLogger.info("Document", `PDF converted to data URL, length: ${dataUrl.length} characters`);
        mainLogger.endTask(taskId, "Document", `PDF data URL returned: ${filePath}`);
        return dataUrl;
      }

      // Check file size before reading (solo per immagini)
      const stats = statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      mainLogger.info("Document", `File size: ${fileSizeInMB.toFixed(2)} MB`);

      if (fileSizeInMB > 100) {
        mainLogger.info("Document", `File is very large (${fileSizeInMB.toFixed(2)} MB), this may take a while`);
      }

      // Limit file size to prevent memory issues
      if (fileSizeInMB > 500) {
        const errorMsg = `File too large (${fileSizeInMB.toFixed(2)} MB). Maximum allowed size is 500 MB.`;
        mainLogger.error("Document", errorMsg);
        throw new Error(errorMsg);
      }

      mainLogger.info("Document", "Starting file read operation");

      // Add timeout for large files to prevent hanging
      const readPromise = promises.readFile(filePath);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('File read timeout after 30 seconds')), 30000);
      });

      const fileBuffer = await Promise.race([readPromise, timeoutPromise]) as Buffer;
      mainLogger.info("Document", `File read completed, buffer size: ${fileBuffer.length} bytes`);

      let mimeType: string;
      switch (fileExtension) {
        case '.png':
          mimeType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.gif':
          mimeType = 'image/gif';
          break;
        case '.bmp':
          mimeType = 'image/bmp';
          break;
        case '.tiff':
        case '.tif':
          mimeType = 'image/tiff';
          break;
        default:
          mimeType = 'application/octet-stream';
      }
      mainLogger.info("Document", `MIME type determined: ${mimeType}`);

      mainLogger.info("Document", "Starting base64 conversion");

      // Add timeout for base64 conversion to prevent hanging
      const base64Promise = new Promise<string>((resolve) => {
        const base64Data = fileBuffer.toString('base64');
        resolve(base64Data);
      });
      const base64TimeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Base64 conversion timeout after 30 seconds')), 30000);
      });

      const base64Data = await Promise.race([base64Promise, base64TimeoutPromise]) as string;
      mainLogger.info("Document", `Base64 conversion completed, length: ${base64Data.length} characters`);

      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      mainLogger.info("Document", `Data URL created, total length: ${dataUrl.length} characters`);

      mainLogger.endTask(taskId, "Document", `File converted to data URL successfully`);
      return dataUrl;
    } catch (err) {
      mainLogger.error("Document", `Error converting file to data URL: ${filePath}`, err as Error);
      mainLogger.endTask(taskId, "Document", `Error converting file to data URL: ${filePath}`);
      throw err;
    }
  })

  ipcMain.handle('document:getTemplates', () => {
    const folderPath = templatesFolderPath();
    if (!folderPath)
      return;

    const templatesFilenames = readdirSync(folderPath);
    const templates = templatesFilenames
      .filter((filename) => filename.endsWith(".tml"))
      .map((filename) => {
        const filePath = path.join(folderPath, filename);

        const [fileString, errorFile] = readFile(filePath);
        if (errorFile)
          return null

        const [object, errorObject] = readObject(fileString);
        if (errorObject)
          return null

        const signature = checkSignature(object)
        if (signature !== 'VALID')
          return null

        const version = checkVersion(object, MIN_TEMPLATE_VERSION_SUPPORTED)
        if (version !== 'SUPPORTED')
          return null;

        const template = object as Template

        return { filename, template }
      })
      .filter((data) => data !== null)

    return templates;
  });

  ipcMain.handle('document:importTemplate', async () => {
    const window = getBaseWindow();
    if (!window)
      return;

    const folderPath = templatesFolderPath();
    if (!folderPath)
      return;

    const result = await openImportTemplateDialog(window, downloadsDirectoryPath);

    if (result.canceled)
      return;

    const filePath = result.filePaths[0];

    // Read the file content
    const [fileString, readFileError] = readFile(filePath);
    if (readFileError) {
      await invalidContentMessageBox(window);
      return;
    }

    // Parse the JSON
    const [object, readObjectError] = readObject(fileString);
    if (readObjectError) {
      await invalidJSONMessageBox(window);
      return;
    }

    // Check the signature
    const signature = checkSignature(object)
    switch (signature) {
      case "MISSING":
        await misssingSignatureMessageBox(window, filePath)
        return;
      case "INVALID":
        await corruptedFileMessageBox(window, filePath)
        return;
    }

    // Check version compatibility
    const version = checkVersion(object, MIN_TEMPLATE_VERSION_SUPPORTED)
    switch (version) {
      case "MISSING":
        await misssingVersionMessageBox(window, filePath)
        return;
      case "UNSUPPORTED":
        await unsupportedVersionMessageBox(window)
        return;
    }

    const fileNameParsed = path.parse(filePath);
    const fileName = fileNameParsed.name;
    const fileNameWithExt = fileNameParsed.base;

    const templatesFilenames = readdirSync(folderPath);
    const matchFilenames = templatesFilenames.filter((filename) => filename.includes(fileName));
    const matchFilename = matchFilenames.length > 0

    if (matchFilename) {
      const confirmation = await showSaveTemplateMessageBoxWarning(window, fileNameWithExt);
      if (confirmation.response === 1)
        return
    }

    const targetFilePath = path.join(folderPath, fileNameWithExt)
    copyFileSync(filePath, targetFilePath);
  })

  ipcMain.handle('document:createTemplate', async (_, name: string) => {
    const window = getBaseWindow();
    if (!window)
      return;

    const fileNameWithExt = name + ".tml";
    const folderPath = templatesFolderPath()
    if (!folderPath)
      return

    const templatesFilenames = readdirSync(folderPath);
    const matchFilenames = templatesFilenames.filter((filename) => filename.includes(name));
    const matchFilename = matchFilenames.length > 0

    if (matchFilename) {
      const confirmation = await showSaveTemplateMessageBoxWarning(window, fileNameWithExt);
      if (confirmation.response === 1)
        return;
    }

    const template = DocumentTabManager
      .setCurrentTab()
      .getTemplate()

    const data = buildExportableTemplateObject(name, template)
    await saveTemplate(data, fileNameWithExt);
  })

  ipcMain.handle('document:setTemplate', (_, template: Template) => {
    if (!template)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setTemplate(template)
      .setTouched()
      .updateMetadata()
      .updateApparatusesFromLayout()
      .sendUpdate()
  })

  ipcMain.handle('document:setMainText', (_, mainText: JSONContent | null, shouldMarkAsTouched: boolean = true) => {
    if (!mainText)
      return;

    DocumentTabManager
      .setCurrentTab()
      .setMainText(mainText)

    if (shouldMarkAsTouched) {
      DocumentTabManager
        .setCurrentTab()
        .setTouched()
    }

    DocumentTabManager
      .setCurrentTab()
      .sendUpdate()
  });

  ipcMain.handle('document:getApparatuses', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getApparatuses()
  });

  ipcMain.handle('document:getApparatusWithId', (_, apparatusId) => {
    return DocumentTabManager
      .setCurrentTab()
      .getApparatusWithId(apparatusId)
  });

  ipcMain.handle('document:setApparatuses', (_, apparatuses) => {
    DocumentTabManager
      .setCurrentTab()
      .setApparatuses(apparatuses)
      .setTouched()
      .updateLayout()
      .sendUpdate()
  });

  ipcMain.handle('document:removeApparatusWithId', (_, apparatusId: string) => {
    DocumentTabManager
      .setCurrentTab()
      .removeApparatusWithId(apparatusId)
      .setTouched()
      .updateLayout()
      .sendUpdate()
  });

  ipcMain.handle('document:hideApparatus', (_, apparatusId: string) => {
    DocumentTabManager
      .setCurrentTab()
      .hideApparatus(apparatusId)
      .setTouched()
      .updateLayout()
      .sendUpdate()
  });

  ipcMain.handle('document:updateApparatusType', (_, apparatusId: string, type: ApparatusType) => {
    DocumentTabManager
      .setCurrentTab()
      .updateApparatusType(apparatusId, type)
      .setTouched()
      .updateLayout()
      .sendUpdate()
  });

  ipcMain.handle('document:updateApparatusTitle', (_, apparatusId: string, title: string) => {
    DocumentTabManager
      .setCurrentTab()
      .updateApparatusTitle(apparatusId, title)
      .setTouched()
      .updateLayout()
      .sendUpdate()
  });

  ipcMain.handle('document:updateApparatusExpanded', (_, apparatusId: string, expanded: boolean) => {
    DocumentTabManager
      .setCurrentTab()
      .updateApparatusExpanded(apparatusId, expanded)
      .setTouched()
      .sendUpdate()
  });

  ipcMain.handle('document:addApparatusTypeAtIndex', (_, type: ApparatusType, index: number) => {
    return DocumentTabManager
      .setCurrentTab()
      .addApparatusTypeAtIndex(type, index)
      .setTouched()
      .updateLayout()
      .sendUpdate()
      .apparatusAtIndex(index)
  });

  ipcMain.handle('document:reorderApparatusesByIds', (_, apparatusesIds: string[]) => {
    return DocumentTabManager
      .setCurrentTab()
      .reorderApparatusesByIds(apparatusesIds)
      .setTouched()
      .updateLayout()
      .sendUpdate()
      .getApparatuses()
  });

  ipcMain.handle('document:updateApparatusIdWithContent', (_, id: string, content: JSONContent, shouldMarkAsTouched: boolean = true) => {
    DocumentTabManager
      .setCurrentTab()
      .updateApparatusIdWithContent(id, content)
      .setTouched(shouldMarkAsTouched)
      .sendUpdate()
  });

  ipcMain.handle('document:toggleApparatusNoteVisibility', (_, id: string) => {
    return DocumentTabManager
      .setCurrentTab()
      .toggleApparatusNoteVisibility(id)
      .setTouched()
      .getApparatusWithId(id)
  });

  ipcMain.handle('document:toggleApparatusCommentVisibility', (_, id: string) => {
    return DocumentTabManager
      .setCurrentTab()
      .toggleApparatusCommentVisibility(id)
      .setTouched()
      .getApparatusWithId(id)
  });

  ipcMain.handle('document:getPageNumberSettings', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getPageNumberSettings()
  });

  ipcMain.handle('document:setPageNumberSettings', (_, pageNumberSettings: PageNumberSettings | null) => {
    if (!pageNumberSettings)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setPageNumberSettings(pageNumberSettings)
      .setTouched()
      .sendUpdate()
  });

  ipcMain.handle('document:getLineNumberSettings', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getLineNumberSettings()
  });

  ipcMain.handle('document:setLineNumberSettings', (_, lineNumberSettings: LineNumberSettings | null) => {
    if (!lineNumberSettings)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setLineNumberSettings(lineNumberSettings)
      .setTouched()
      .sendUpdate()
  });

  ipcMain.handle('document:getTocSettings', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getTocSettings()
  });

  ipcMain.handle('document:setTocSettings', (_, tocSettings: TocSettings | null) => {
    if (!tocSettings)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setTocSettings(tocSettings)
      .setTouched()
      .sendUpdate()
  });

  ipcMain.handle('document:getPageSetup', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getPageSetup()
  });

  ipcMain.handle('document:setPageSetup', (_, pageSetup: SetupOptionType | null) => {
    if (!pageSetup)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setPageSetup(pageSetup)
      .setTouched()
      .sendUpdate()
  });

  ipcMain.handle('document:getHeaderSettings', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getHeaderSettings()
  })

  ipcMain.handle('document:setHeaderSettings', (_, headerSettings: HeaderSettings | null) => {
    if (!headerSettings)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setHeaderSettings(headerSettings)
      .setTouched()
      .sendUpdate()
  })

  ipcMain.handle('document:getFooterSettings', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getFooterSettings()
  })

  ipcMain.handle('document:setFooterSettings', (_, footerSettings: FooterSettings | null) => {
    if (!footerSettings)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setFooterSettings(footerSettings)
      .setTouched()
      .sendUpdate()
  })

  ipcMain.handle('document:setLayout', (_, layout: Layout) => {
    DocumentTabManager
      .setCurrentTab()
      .setLayout(layout)
      .setTouched()
      .updateApparatusesFromLayout()
      .sendUpdate()
  })

  ipcMain.handle('document:getLayout', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getLayout()
  })

  ipcMain.handle('document:getSort', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getSort()
  })

  ipcMain.handle('document:setSort', (_, sort: SetupDialogStateKeys[]) => {
    DocumentTabManager
      .setCurrentTab()
      .setSort(sort)
      .setTouched()
  })

  ipcMain.handle('document:setStyles', (_, styles: Style[]) => {
    DocumentTabManager
      .setCurrentTab()
      .setStyles(styles)
      .setTouched()
  })

  ipcMain.handle('document:getStyles', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getStyles()
  })

  ipcMain.handle('document:getStylesFileNames', () => {
    const folderPath = stylesFolderPath()
    if (!folderPath)
      return

    const stylesFolderContent = readdirSync(folderPath);
    const filenames = stylesFolderContent.filter((filename) => filename.endsWith(".stl"));
    return filenames;
  })

  ipcMain.handle('document:getStylesFromFile', async (_, filename) => {
    const window = getBaseWindow();
    if (!window)
      return;

    const folderPath = stylesFolderPath()
    if (!folderPath)
      return null

    const stylesFolderContent = readdirSync(folderPath);
    const found = stylesFolderContent.find(style => style === filename)
    if (!found)
      return null

    const filePath = path.join(folderPath, filename);

    // Read the file content
    const [fileString, readFileError] = readFile(filePath);
    if (readFileError) {
      await invalidContentMessageBox(window);
      return null;
    }

    // Parse the JSON
    const [object, readObjectError] = readObject(fileString);
    if (readObjectError) {
      await invalidJSONMessageBox(window);
      return null;
    }

    // Check the signature
    const signature = checkSignature(object)
    switch (signature) {
      case "MISSING":
        await misssingSignatureMessageBox(window, filePath)
        return null;
      case "INVALID":
        await corruptedFileMessageBox(window, filePath)
        return null;
    }

    // Check version compatibility
    const version = checkVersion(object, MIN_STYLE_VERSION_SUPPORTED)
    switch (version) {
      case "MISSING":
        await misssingVersionMessageBox(window, filePath)
        return null;
      case "UNSUPPORTED":
        await unsupportedVersionMessageBox(window)
        return null;
    }

    return object.styles as Style[];
  })

  ipcMain.handle("document:exportStyles", async (_, styles: Style[]) => {
    const window = getBaseWindow();
    if (!window)
      return;

    const folderPath = stylesFolderPath()
    if (!folderPath)
      return

    const filepath = path.join(folderPath, 'untitled.stl')
    const result = await saveStylesDialog(window, filepath);
    const data = buildExportableStylesObject(styles);

    if (result.canceled)
      return

    const filePath = result.filePath;
    await promises.writeFile(filePath, JSON.stringify(data, null, 2));
    await stylesExportSuccessMessageBox(window)
  });

  ipcMain.handle('document:importStyles', async (): Promise<string | null> => {
    const window = getBaseWindow();
    if (!window)
      return null;

    const folderPath = stylesFolderPath();
    if (!folderPath)
      return null;

    const result = await openStylesDialog(window, folderPath);

    if (result.canceled)
      return null;

    const filePath = result.filePaths[0];

    // Read the file content
    const [fileString, readFileError] = readFile(filePath);
    if (readFileError) {
      await invalidContentMessageBox(window);
      return null;
    }

    // Parse the JSON
    const [object, readObjectError] = readObject(fileString);
    if (readObjectError) {
      await invalidJSONMessageBox(window);
      return null;
    }

    // Check the signature
    const signature = checkSignature(object)
    switch (signature) {
      case "MISSING":
        await misssingSignatureMessageBox(window, filePath)
        return null;
      case "INVALID":
        await corruptedFileMessageBox(window, filePath)
        return null;
    }

    // Check version compatibility
    const version = checkVersion(object, MIN_STYLE_VERSION_SUPPORTED)
    switch (version) {
      case "MISSING":
        await misssingVersionMessageBox(window, filePath)
        return null;
      case "UNSUPPORTED":
        await unsupportedVersionMessageBox(window)
        return null;
    }

    const fileNameParsed = path.parse(filePath);
    const fileName = fileNameParsed.name;
    const fileNameWithExt = fileNameParsed.base;

    const stylesFilenames = readdirSync(folderPath);
    const matchFilenames = stylesFilenames.filter((filename) => filename.includes(fileName));
    const matchFilename = matchFilenames.length > 0

    if (matchFilename) {
      const confirmation = await confirmReplacmentStylesMessageBox(window, fileName);
      if (confirmation.response === 1)
        return null;
    }

    const destinationPath = path.join(folderPath, fileNameWithExt);
    writeFileSync(destinationPath, JSON.stringify(object, null, 2));
    return fileNameWithExt;
  })

  ipcMain.handle('document:exportSigla', async (_event, sigla: DocumentSiglum[]) => {
    const window = getBaseWindow();
    if (!window)
      return;

    const filepath = path.join(downloadsDirectoryPath, `Untitled.siglum`);
    const result = await saveSiglaDialog(window, filepath);
    const data = await buildExportableSiglaObject(sigla);

    if (result.canceled)
      return;

    const filePath = result.filePath;
    await promises.writeFile(filePath, JSON.stringify(data, null, 2));
    await siglumExportSuccessMessageBox(window)
  });

  ipcMain.handle('document:importSigla', async (): Promise<DocumentSiglum[]> => {
    const window = getBaseWindow();
    if (!window)
      return [];

    const folder = path.join(downloadsDirectoryPath);
    const result = await openSiglaDialog(window, folder);

    if (result.canceled)
      return [];

    const filePath = result.filePaths[0];

    // Read the file content
    let fileString: string;
    try {
      fileString = await promises.readFile(filePath, "utf8");
    } catch (error) {
      mainLogger.error("Sigla", "The content of the file is invalid!", error as Error);
      await invalidSiglumContentMessageBox(window);
      return [];
    }

    // Parse the JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let object: Record<string, any>;
    try {
      object = JSON.parse(fileString);
    } catch (error) {
      mainLogger.error("Sigla", "The json of the file is invalid!", error as Error);
      await invalidSiglumJSONMessageBox(window);
      return [];
    }

    // Check the signature
    if (object.signature) {
      mainLogger.info("Sigla", `Checking file signature...`);

      const currentSignature = object.signature
      const tmpObject = { ...object }
      delete tmpObject.signature

      const expectedSignature = createSignature(tmpObject)
      const signaturesAreValid = equalSignature(currentSignature, expectedSignature)
      if (!signaturesAreValid) {
        mainLogger.error("Sigla", `Corrupted file: ${filePath} signature`);
        await corruptedFileMessageBox(window, filePath)
        return []
      }

      mainLogger.info("Sigla", `Signature is valid`);
    } else {
      mainLogger.error("Sigla", `Missing signature in file: ${filePath}`);
      await misssingSignatureMessageBox(window, filePath)
      return [];
    }

    // Check version compatibility
    if (object.version) {
      const compare = object.version.localeCompare(MIN_SIGLUM_VERSION_SUPPORTED, undefined, { numeric: true })
      if (compare === -1) {
        mainLogger.error("Sigla", `Unsupported document version in file: ${filePath}`);
        await unsupportedVersionMessageBox(window)
        return [];
      }

      mainLogger.info("Sigla", `Version is valid`);
    } else {
      mainLogger.error("Sigla", `Missing version in file: ${filePath}`);
      await misssingVersionMessageBox(window, filePath)
      return [];
    }

    const entries = object.entries.map((entry) => ({
      value: entry.value,
      manuscripts: entry.manuscripts,
      description: entry.description,
    })) as DocumentSiglum[]

    return entries;
  });

  ipcMain.handle('document:setSiglumList', (_, siglumList: DocumentSiglum[] | null) => {
    if (!siglumList)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setSigla(siglumList)
      .setTouched()
      .sendUpdate()
  })

  ipcMain.handle('document:getSiglumList', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getSigla()
  })

  ipcMain.handle('document:exportExcel', async (_, data: ArrayBuffer, fileName: string): Promise<void> => {
    const taskId = mainLogger.startTask("Export Excel", "Exporting Excel");
    const baseWindow = getBaseWindow();
    if (!baseWindow) return;

    try {
      const { filePath, canceled } = await dialog.showSaveDialog(baseWindow, {
        title: "Save File",
        defaultPath: fileName,
        filters: [{ name: "Excel Files", extensions: ["xlsx"] }]
      });

      if (canceled || !filePath) {
        return;
      }

      // Convert ArrayBuffer → Buffer (Node.js)
      const buffer = Buffer.from(data);

      writeFileSync(filePath, buffer);

      await dialog.showMessageBox(baseWindow, { message: "File saved successfully!" });

      mainLogger.endTask(taskId, "Export Excel", "File saved successfully!");
      return;
    } catch (error) {
      const errorMessage = "The file loaded has errors. Please correct the data and reload the file";
      await dialog.showMessageBox(baseWindow, { message: errorMessage, type: 'error' });
      mainLogger.error("Export Excel", errorMessage, error as Error);
      return;
    }
  });

  ipcMain.handle('document:print', async (_, includeContent: PrintIncludeContents, printOptions: PrintOptions): Promise<void> => {
    let savePdfPath: string = '';
    if (printOptions.export) {
      savePdfPath = await getExportPath([{ name: 'PDF', extensions: ['pdf'] }]);
      if (!savePdfPath)
        return;
    }
    const tempPdfPath = await generatePDF(includeContent);

    if (printOptions.export) {
      await saveFileAtPath(tempPdfPath, savePdfPath);
    } else {
      // Use native print preview on macOS, Windows, and Linux
      const baseWindow = getBaseWindow();
      if (!baseWindow) {
        mainLogger.error('Print', 'Base window not found');
        return;
      }
      // Open the PDF in the native system viewer using shell
      await shell.openPath(tempPdfPath);

      mainLogger.info('Print', `Opened PDF in native viewer: ${tempPdfPath}`);
    }
  });

  ipcMain.handle('document:exportToTei', async (): Promise<void> => {
    const saveFile = await getExportPath([{ name: 'XML/TEI', extensions: ['xml'] }], 'tei.export.saveTo', 'xml');
    if (!saveFile)
      return;

    const tocHeaderTitle = DocumentTabManager
      .setCurrentTab()
      .getTocSettings()
      .title;

    const tempTEIPath = await generateTEI(tocHeaderTitle);

    await saveFileAtPath(tempTEIPath, saveFile, 'tei');
  });

  ipcMain.handle('document:importBibliography', async (): Promise<Bibliography | undefined> => {
    const baseWindow = getBaseWindow();
    if (!baseWindow)
      return;

    const result = await dialog.showOpenDialog(baseWindow, {
      title: 'Import Bibliographys', // @MISSING: to be translated
      defaultPath: path.join(app.getPath("downloads")),
      filters: [{ name: "Bibliography", extensions: ["bib"] }]
    });

    if (result.canceled || (!result.canceled && result.filePaths.length === 0))
      return;

    const selectedFilePath = result.filePaths[0];
    const bibData = await promises.readFile(selectedFilePath, "utf8");

    try {
      const selectedFileName = path.parse(selectedFilePath).name;
      const references = await parseBibtexFile(bibData);

      const newBibliography: Bibliography = {
        name: selectedFileName.trim(),
        citationStyle: "chicago-17-author-date",
        references
      }

      return newBibliography
    } catch (error) {
      const errorMessage = "The file loaded has errors. Please correct the data and reload the file";
      await dialog.showMessageBox(baseWindow, { message: errorMessage, type: 'error' });
      mainLogger.error("Import Bibliography", errorMessage, error as Error);
      return;
    }
  })

  ipcMain.handle('document:setBibliographies', (_, bibliographyList: Bibliography[] | null) => {
    if (!bibliographyList)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setBibliographies(bibliographyList)
      .setTouched()
      .sendUpdate()
  })

  ipcMain.handle('document:getBibliographies', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getBibliographies()
  })

  ipcMain.handle('document:setReferencesFormat', (_, referencesFormat: ReferencesFormat | null) => {
    if (!referencesFormat)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setReferencesFormat(referencesFormat)
      .setTouched()
      .sendUpdate()
  })

  ipcMain.handle('document:getReferencesFormat', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getReferencesFormat()
  })

  ipcMain.handle('preferences:get', () => {
    const taskId = mainLogger.startTask("Preferences", "Loading preferences");
    const preferences = {
      fileNameDisplay: readFileNameDisplay(),
      pdfQuality: readPdfQuality(),
      rememberLayout: readRememberLayout(),
      recentFilesCount: readRecentFilesCount(),
      theme: readTheme(),
      commentPreviewLimit: readCommentPreviewLimit(),
      bookmarkPreviewLimit: readBookmarkPreviewLimit(),
      fileSavingDirectory: readFileSavingDirectory(),
      defaultDirectory: readDefaultDirectory(),
      automaticFileSave: readAutomaticFileSave(),
      versioningDirectory: readVersioningDirectory(),
      customVersioningDirectory: readCustomVersioningDirectory(),
      criterionLanguage: readCriterionLanguage(),
      criterionRegion: readCriterionRegion(),
      dateFormat: readDateFormat(),
      historyActionsCount: readHistoryActionsCount(),
    };
    mainLogger.endTask(taskId, "Preferences", "Preferences loaded successfully");
    return preferences;
  })

  ipcMain.handle('preferences:save', async (_, preferences: Preferences) => {
    const taskId = mainLogger.startTask("Preferences", "Saving preferences");
    const webContentsViews = getWebContentsViews();
    try {
      // Save the file name display preference
      if (preferences.fileNameDisplay) {
        storeFileNameDisplay(preferences.fileNameDisplay);
        ApplicationMenu.build(onClickMenuItem);
      }
      // Save the remember layout preference
      if (preferences.rememberLayout !== undefined) {
        storeRememberLayout(preferences.rememberLayout);
      }
      if (preferences.pdfQuality) {
        storePdfQuality(preferences.pdfQuality);
      }
      if (preferences.recentFilesCount) {
        storeRecentFilesCount(preferences.recentFilesCount);
      }
      if (preferences.theme) {
        storeTheme(preferences.theme);
        // Apply theme immediately when saved
        webContentsViews.forEach(webContentsView => {
          webContentsView.webContents.send('theme-changed', preferences.theme);
        });
        toolbarWebContentsViewSend('theme-changed', preferences.theme);
      }
      if (preferences.commentPreviewLimit) {
        storeCommentPreviewLimit(preferences.commentPreviewLimit);
      }
      if (preferences.bookmarkPreviewLimit) {
        storeBookmarkPreviewLimit(preferences.bookmarkPreviewLimit);
      }
      if (preferences.fileSavingDirectory) {
        storeFileSavingDirectory(preferences.fileSavingDirectory);
      }
      if (preferences.defaultDirectory) {
        storeDefaultDirectory(preferences.defaultDirectory);
      }
      if (preferences.automaticFileSave) {
        storeAutomaticFileSave(preferences.automaticFileSave);
        updateAutoSave(() => {
          saveDocument(onDocumentSaved);
        }); // Update auto save intervals when preference changes
      }
      if (preferences.versioningDirectory) {
        storeVersioningDirectory(preferences.versioningDirectory);
      }
      if (preferences.customVersioningDirectory) {
        storeCustomVersioningDirectory(preferences.customVersioningDirectory);
      }
      if (preferences.criterionLanguage) {
        try {
          storeCriterionLanguage(preferences.criterionLanguage);
          updateAppSettingsLanguage(preferences.criterionLanguage);
          await changeLanguageComprehensive(preferences.criterionLanguage);
        } catch (err) {
          mainLogger.error("Preferences", `Failed to change language to ${preferences.criterionLanguage}`, err as Error);
        }
      }
      if (preferences.criterionRegion) {
        storeCriterionRegion(preferences.criterionRegion);
      }
      if (preferences.dateFormat) {
        storeDateFormat(preferences.dateFormat);
      }

      if (preferences.historyActionsCount) {
        storeHistoryActionsCount(preferences.historyActionsCount);
      }

      webContentsViews.forEach(webContentView => webContentView.webContents.send('preferences-changed'));

      mainLogger.endTask(taskId, "Preferences", "Preferences saved successfully");
    } catch (err) {
      mainLogger.error("Preferences", "Error saving preferences", err as Error);
    }
  })

  ipcMain.handle('document:getMetadata', () => {
    return DocumentTabManager
      .setCurrentTab()
      .getMetadata()
  });

  ipcMain.handle('document:setMetadata', (_, metadata: Metadata | null) => {
    if (!metadata)
      return;
    DocumentTabManager
      .setCurrentTab()
      .setMetadata(metadata)
      .setTouched()
      .sendUpdate()
  });

  ipcMain.handle('document:openFind', () => {
    openFindWindow();
  })

  ipcMain.handle('document:findNext', () => {
    selectedWebContentsViewSend('document-find-next')
  })

  ipcMain.handle('document:findPrevious', () => {
    selectedWebContentsViewSend('document-find-previous')
  })

  ipcMain.handle('document:setSearchCriteria', (_, data: SearchCriteria) => {
    selectedWebContentsViewSend('document-set-find', data)
  })

  ipcMain.handle('document:setDisableReplaceAction', (_, isDisable: boolean) => {
    if (getFindAndReplaceWindow()) {
      getFindAndReplaceWindow()?.webContents.send('set-disable-replace-action', isDisable);
    }
  })

  ipcMain.handle('document:resetSearchCriteria', () => {
    selectedWebContentsViewSend('document-reset-find');
  })

  ipcMain.handle('document:replace', (_, replacement: string) => {
    selectedWebContentsViewSend('document-replace', replacement);
  })

  ipcMain.handle('document:replaceAll', (_, replacement: string) => {
    selectedWebContentsViewSend('document-replace-all', replacement);
  })

  ipcMain.handle('document:sendCurrentSearchIndex', (_, index: number) => {
    if (getFindAndReplaceWindow()) {
      getFindAndReplaceWindow()?.webContents.send('current-search-index', index);
    }
  });

  ipcMain.handle('document:sendTotalSearchResults', (_, total: number) => {
    if (getFindAndReplaceWindow()) {
      getFindAndReplaceWindow()?.webContents.send('total-search-results', total);
    }
  });

  ipcMain.handle('document:sendSearchHistory', (_, history: string[]) => {
    if (getFindAndReplaceWindow()) {
      getFindAndReplaceWindow()?.webContents.send('search-history', history);
    }
  })

  ipcMain.handle('document:sendReplaceHistory', (_, history: string[]) => {
    if (getFindAndReplaceWindow()) {
      getFindAndReplaceWindow()?.webContents.send('replace-history', history);
    }
  })

  ipcMain.handle('document:setReplaceInProgress', (_, isInProgress: boolean) => {
    if (getFindAndReplaceWindow()) {
      getFindAndReplaceWindow()?.webContents.send('replace-in-progress', isInProgress);
    }
  })

  ipcMain.handle('pageSetup:get', () => readLastPageSetup())

  ipcMain.handle('pageSetup:save', (_, pageSetup: PageSetup) => {
    const taskId = mainLogger.startTask("PageSetup", "Saving page setup");
    try {
      storeLastPageSetup(pageSetup);
      mainLogger.endTask(taskId, "PageSetup", "Page setup saved successfully");
    } catch (err) {
      mainLogger.error("PageSetup", "Error saving page setup", err as Error);
    }
  })

  handleUserIpc(ipcMain, () => {
    ApplicationMenu.build(onClickMenuItem)
  })
  handleInviteIpc(ipcMain)
  handleDocumentIpc(ipcMain)
  handleNotificationIpc(ipcMain)
  registerChatHandlers(ipcMain)

  initializeMainWindow(onBaseWindowReady);

  initializeFonts();

  const baseWindow = getBaseWindow();

  baseWindow?.on("close", handleAppClose(() => {
    cleanupAutoSave(); // Clean up auto save before closing
    return closeApplication();
  }));

  const language = readAppLanguage();
  await changeLanguageComprehensive(language);

  registerIpcListeners();

  // Set up the menu click handler for shortcuts
  // Shortcuts work through menu accelerators and only activate when the app is focused
  console.log('🔧 Setting up keyboard shortcuts system');
  setOnClickMenuItemFn(onClickMenuItem);
  console.log('✅ Keyboard shortcuts system initialized - using menu accelerators');

  initializeAutoSave(() => {
    saveDocument(onDocumentSaved);
  });

  mainLogger.endTask(appTaskId, "Electron", "Application started");
};

initializeApp().catch((err) => {
  mainLogger.error("Electron", "Fatal error during startup", err as Error);
});
