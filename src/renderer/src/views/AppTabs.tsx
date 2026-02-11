import BrowserTabBar from "@/components/browser-tab-bar"
import { memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { useIpcRenderer } from "../hooks/use-ipc-renderer"
import { ThemeProvider } from "../providers/theme-provider"
import { useTranslation } from "react-i18next"
import { TooltipProvider } from "@/components/ui/tooltip"

type TabsState = {
  tabs: TabInfo[];
  selectedTab: TabInfo | null;
}

type TabsActions =
  | { type: 'ADD_TABS_WITH_IDS'; payload: number[] }
  | { type: 'ADD'; payload: { id: number, fileName: string, type: TabType, isAutoCreated?: boolean } }
  | { type: 'SELECT'; payload: TabInfo }
  | { type: 'REMOVE'; payload: TabInfo }
  | { type: 'REMOVE_TAB_WITH_ID'; payload: number }
  | { type: 'REORDER'; payload: TabInfo[] }
  | { type: 'RENAME_SELECTED_TAB'; payload: string }
  | { type: 'SET_CURRENT_TAB_AS_CHANGED'; payload: boolean }
  | { type: 'SET_TABS_AS_CHANGED'; payload: { id: number, touched: boolean }[] }

const reducer = (state: TabsState, action: TabsActions): TabsState => {
  switch (action.type) {
    case "ADD_TABS_WITH_IDS": {
      const tabsIds = action.payload
      const newtabs = tabsIds.map((tab, index) => ({
        id: tab,
        name: `Untitled_${index + 1}.critx`,
        changed: false,
        type: 'critx' as const,
        isAutoCreated: false
      }))

      return {
        ...state,
        tabs: newtabs,
        selectedTab: newtabs[0]
      }
    }
    case "ADD": {
      const { id, fileName, type, isAutoCreated = false } = action.payload
      const tabs = state.tabs.concat({
        id,
        name: fileName,
        changed: false,
        type,
        isAutoCreated
      })
      return {
        ...state,
        tabs: tabs,
        selectedTab: tabs[tabs.length - 1]
      }
    }
    case "SELECT": {
      const tab = action.payload
      return {
        ...state,
        selectedTab: tab
      }
    }
    case "REMOVE": {
      const tab = action.payload
      const tabs = state.tabs
      if (tabs.length > 0) {
        const index = tabs.findIndex((t) => t.id === tab.id)
        if (index !== -1)
          tabs.splice(index, 1)
      }

      return {
        ...state,
        tabs: tabs,
      }
    }
    case "REMOVE_TAB_WITH_ID": {
      const id = action.payload
      const tabs = state.tabs
      const index = tabs.findIndex((t) => t.id === id)
      if (index !== -1)
        tabs.splice(index, 1)

      let selectedTab: TabInfo | null = null
      if (tabs.length > 0)
        selectedTab = tabs[tabs.length - 1]

      return {
        ...state,
        tabs: tabs,
        selectedTab: selectedTab,
      }
    }
    case "REORDER": {
      const tabs = action.payload
      return {
        ...state,
        tabs: tabs,
      }
    }
    case "RENAME_SELECTED_TAB": {
      const filename = action.payload
      const tabs = state.tabs
      const selectedTab = state.selectedTab
      if (selectedTab) {
        selectedTab.name = filename
        selectedTab.changed = false
      }
      tabs.forEach((tab) => {
        if (tab.id === state.selectedTab?.id) {
          tab.name = filename
          tab.changed = false
        }
      })
      return {
        ...state,
        tabs: tabs,
        selectedTab: selectedTab,
      }
    }
    case "SET_CURRENT_TAB_AS_CHANGED": {
      const changed = action.payload
      const tabs = state.tabs
      const selectedTab = state.selectedTab
      if (selectedTab)
        selectedTab.changed = changed

      tabs.forEach((tab) => {
        if (tab.id === selectedTab?.id)
          tab.changed = changed
      })
      return {
        ...state,
        tabs: tabs,
        selectedTab: selectedTab,
      }
    }
    case "SET_TABS_AS_CHANGED": {
      const tabs = state.tabs.map((tab) => {
        const tabData = action.payload.find((t) => t.id === tab.id)
        if (tabData) {
          return { ...tab, changed: tabData.touched }
        }
        return tab
      })
      return {
        ...state,
        tabs: tabs,
      }
    }
  }
}

const initialState: TabsState = {
  tabs: [],
  selectedTab: null,
}

const actions: Record<string, (...args: any[]) => TabsActions> = {
  addTabsWithIds: (ids: number[]) => ({ type: 'ADD_TABS_WITH_IDS', payload: ids }),
  addTab: (id: number, fileName: string, type: TabType, isAutoCreated?: boolean) => ({ type: 'ADD', payload: { id, fileName, type, isAutoCreated } }),
  selectTab: (tab: TabInfo) => ({ type: 'SELECT', payload: tab }),
  removeTab: (tab: TabInfo) => ({ type: 'REMOVE', payload: tab }),
  removeTabWithId: (id: number) => ({ type: 'REMOVE_TAB_WITH_ID', payload: id }),
  reorderTabs: (tabs: TabInfo[]) => ({ type: 'REORDER', payload: tabs }),
  renameSelectedTab: (filename: string) => ({ type: 'RENAME_SELECTED_TAB', payload: filename }),
  setCurrentTabAsChanged: (changed: boolean) => ({ type: 'SET_CURRENT_TAB_AS_CHANGED', payload: changed }),
  setTabsAsChanged: (tabs: { id: number, touched: boolean }[]) => ({ type: 'SET_TABS_AS_CHANGED', payload: tabs }),
};

function useTabsStateSync(tabs: TabInfo[]) {
  useEffect(() => {
    globalThis.electron.ipcRenderer.send('tabs-current-state-changed', tabs);
  }, [tabs]);

  useEffect(() => {
    if (tabs.length === 0) {
      globalThis.tooltip.hide().catch(err => {
        console.error('Error hiding tooltip via ipcRenderer:', err);
      });
    }
  }, [tabs]);
}

const AppTabs = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const { t } = useTranslation();

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const contentViewsIds = useMemo(() => {
    return globalThis.tabs.getAllContentViewsIds()
  }, [globalThis.tabs])

  useEffect(() => {
    contentViewsIds.then((ids) => {
      dispatch(actions.addTabsWithIds(ids))
    })
  }, [contentViewsIds])

  // Check initial auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const loggedIn = await globalThis.user.loggedIn();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          const user = await globalThis.user.currentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    checkAuthStatus();
  }, [])

  const handleTabSelectionBeforeRemoval = (tabToRemove: TabInfo) => {
    if (state.selectedTab?.id === tabToRemove.id) {
      const currentIndex = state.tabs.findIndex(t => t.id === tabToRemove.id);
      if (state.tabs.length > 1) {
        if (currentIndex < state.tabs.length - 1) {
          const nextTab = state.tabs[currentIndex + 1];
          globalThis.tabs.select(nextTab.id, nextTab.type);
          dispatch(actions.selectTab(nextTab));
        }
        else if (currentIndex > 0) {
          const prevTab = state.tabs[currentIndex - 1];
          globalThis.tabs.select(prevTab.id, prevTab.type);
          dispatch(actions.selectTab(prevTab));
        }
      }
    }
  };

  const performTabClose = async (tab: TabInfo) => {
    handleTabSelectionBeforeRemoval(tab);
    await globalThis.tabs.close(tab.id);
    dispatch(actions.removeTab(tab));
  };

  const showCloseConfirmation = async (): Promise<number> => {
    const showMessageBox = await globalThis.system.showMessageBox(
      t('close_document_dialog.title'),
      t('close_document_dialog.description'),
      [t('close_document_dialog.buttons.save'), t('close_document_dialog.buttons.abort'), t('close_document_dialog.buttons.cancel')]
    );

    return showMessageBox.response;
  };

  // Helper function to generate next untitled document name
  const getNextUntitledName = useCallback((): string => {
    const untitledPattern = /^Untitled_(\d+)\.critx$/;
    const numbers: number[] = [];

    state.tabs.forEach(tab => {
      // Only count auto-created documents
      if (tab.isAutoCreated) {
        const match = untitledPattern.exec(tab.name);
        if (match) {
          numbers.push(Number.parseInt(match[1], 10));
        }
      }
    });

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `Untitled_${nextNumber}.critx`;
  }, [state.tabs]);

  const handleCreateNewDocument = async (): Promise<void> => {
    const fileType: FileType = "critx"
    const id = await globalThis.tabs.new(fileType)
    if (!id) {
      return;
    }
    const newFileName = getNextUntitledName();
    dispatch(actions.addTab(id, newFileName, fileType, true))
    globalThis.electron.ipcRenderer.send('open-choose-layout-modal');
  };

  useIpcRenderer((ipc) => {

    ipc.on('create-new-document', async (_: any) => {
      await handleCreateNewDocument();
    })

    ipc.on('document-opened', async (_: any, filepath: string, filename: string, fileType: FileType) => {
      const id = await globalThis.tabs.new(fileType)
      dispatch(actions.addTab(id, filename, fileType, false))
      ipc.send('document-opened-at-path', filepath, fileType);
    });

    ipc.on('document-renamed', async (_: any, filename: string) => {
      dispatch(actions.renameSelectedTab(filename))
    });

    ipc.on('document-saved', async (_: any, filename: string) => {
      dispatch(actions.renameSelectedTab(filename))
    });

    ipc.on('close-current-document', async (_: any, tabId: number) => {
      dispatch(actions.removeTabWithId(tabId))
    });

    ipc.on('main-text-changed', async (_: any, changed: boolean) => {
      dispatch(actions.setCurrentTabAsChanged(changed))
    });

    ipc.on('document-tabs-changed', async (_: any, data: { id: number, touched: boolean }[]) => {
      dispatch(actions.setTabsAsChanged(data.map((t) => ({ id: t.id, touched: t.touched }))))
    });

    ipc.on('tab-selected', async (_: any, tabId: number) => {
      const tab = stateRef.current.tabs.find((t) => t.id === tabId);
      if (tab) {
        dispatch(actions.selectTab(tab));
      }
    });

    ipc.on('update-auth-status', async (_: any) => {
      console.log('User authentication status updated');
      try {
        const loggedIn = await globalThis.user.loggedIn();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          const user = await globalThis.user.currentUser();
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          setUnreadNotificationsCount(0);
        }
      } catch (error) {
        console.error('Error updating auth status:', error);
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUnreadNotificationsCount(0);
      }
    });

    ipc.on('update-notification-count', async (_: any, count: number) => {
      setUnreadNotificationsCount(count);
    });

    return () => {
      ipc.cleanup()
    }
  }, [globalThis.electron.ipcRenderer, getNextUntitledName]);

  useTabsStateSync(state.tabs);

  const handleNotificationClick = useCallback(() => {
    globalThis.electron.ipcRenderer.send('toggle-notification-panel');
  }, []);

  return (
    <BrowserTabBar
      tabs={state.tabs}
      selectedTab={state.selectedTab}
      onAdd={async () => {
        await globalThis.doc.openDocument();
      }}
      onSelect={(tab) => {
        globalThis.tabs.select(tab.id, tab.type)
        dispatch(actions.selectTab(tab))
      }}
      onRemove={async (tab) => {
        if (tab.changed) {
          const shouldClose = await showCloseConfirmation();
          switch (shouldClose) {
            case 0: {
              const saveSuccessful = await globalThis.doc.saveDocument();
              if (saveSuccessful) {
                await performTabClose(tab);
              }
              break;
            }
            case 1:
              await performTabClose(tab);
              break;
            case 2:
              break;
            default:
              break;
          }
        } else {
          await performTabClose(tab);
        }
      }}
      onReorder={(tabs) => {
        dispatch(actions.reorderTabs(tabs))
        globalThis.tabs.reorder(tabs.map((tab) => tab.id))
      }}
      isLoggedIn={isLoggedIn}
      user={currentUser ? { 
        firstname: currentUser.firstname, 
        lastname: currentUser.lastname,
        email: currentUser.email,
        institution: currentUser.institution
      } : null}
      unreadNotificationsCount={unreadNotificationsCount}
      onNotificationClick={handleNotificationClick}
    />
  )
}

const AppTabsWithTheme = () => {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        <AppTabs />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default memo(AppTabsWithTheme)