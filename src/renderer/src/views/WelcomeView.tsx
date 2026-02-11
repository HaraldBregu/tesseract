import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "../providers/theme-provider";
import { cn } from "@/lib/utils";
import { FilePlus, FolderOpen, Clock, FileText } from "lucide-react";
import AccountPanel from "./AccountPanelView";
import NotificationPanel from "@/pages/editor/NotificationPanelView";
import criterionLogo from "@resources/appIcons/icon.png";

interface RecentFile {
    name: string;
    path: string;
    lastOpened: string;
}

const WelcomeContent = () => {
    const { t } = useTranslation();
    const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
    
    // Account panel state
    const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
    
    // Notification panel state
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [isLoadingMoreNotifications, setIsLoadingMoreNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notificationPage, setNotificationPage] = useState<NotificationPage | null>(null);

    const handleOnAccountClickRef = useRef<(() => void) | null>(null);
    const handleOnNotificationClickRef = useRef<(() => void) | null>(null);

    // Calculate unread notifications count
    const unreadNotificationsCount = useMemo(
        () => (notifications ?? []).filter(n => n.viewedDate === null).length,
        [notifications]
    );

    // Send notification count to AppTabs whenever it changes
    useEffect(() => {
        globalThis.electron?.ipcRenderer?.send('update-notification-count', unreadNotificationsCount);
    }, [unreadNotificationsCount]);

    // Poll notifications every 5 seconds (only if logged in)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const loggedIn = await globalThis.user?.loggedIn?.();

                if (!loggedIn) {
                    setNotifications([]);
                    setNotificationPage(null);
                    return;
                }

                const response = await globalThis.notifications?.getNotifications?.(0);
                const notificationsList = response?.content ?? [];

                setNotificationPage(response?.page ?? null);
                setNotifications(notificationsList);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        // Fetch immediately on mount
        fetchNotifications();

        // Set up polling interval
        const intervalId = setInterval(fetchNotifications, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // Handle notification panel toggle
    const handleOnNotificationClick = useCallback(async () => {
        const willOpen = !isNotificationPanelOpen;
        setIsAccountPanelOpen(false); // Close account panel when opening notifications
        setIsNotificationPanelOpen(willOpen);

        if (willOpen) {
            setIsLoadingNotifications(true);
            try {
                const response = await globalThis.notifications?.getNotifications?.(0);
                setNotifications(response?.content ?? []);
                setNotificationPage(response?.page ?? null);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setTimeout(() => {
                    setIsLoadingNotifications(false);
                }, 1000);
            }
        }
    }, [isNotificationPanelOpen]);

    // Handle account panel toggle
    const handleOnAccountClick = useCallback(() => {
        setIsNotificationPanelOpen(false); // Close notification panel when opening account
        setIsAccountPanelOpen(prev => !prev);
    }, []);

    // Keep refs updated for IPC handlers
    useEffect(() => {
        handleOnAccountClickRef.current = handleOnAccountClick;
    }, [handleOnAccountClick]);

    useEffect(() => {
        handleOnNotificationClickRef.current = handleOnNotificationClick;
    }, [handleOnNotificationClick]);

    // Setup IPC listeners for panel toggles
    useEffect(() => {
        const ipc = globalThis.electron?.ipcRenderer;
        if (!ipc) return;

        const handleToggleAccount = () => {
            handleOnAccountClickRef.current?.();
        };

        const handleToggleNotification = () => {
            handleOnNotificationClickRef.current?.();
        };

        ipc.on("toggle-account-panel", handleToggleAccount);
        ipc.on("toggle-notification-panel", handleToggleNotification);

        return () => {
            ipc.removeListener("toggle-account-panel", handleToggleAccount);
            ipc.removeListener("toggle-notification-panel", handleToggleNotification);
        };
    }, []);

    // Load more notifications handler
    const handleLoadMoreNotifications = useCallback(async () => {
        if (!notificationPage || isLoadingMoreNotifications) return;

        const currentPage = notificationPage.number;
        const totalPages = notificationPage.totalPages;

        // Check if there are more pages to load
        if (currentPage >= totalPages - 1) return;

        const nextPage = currentPage + 1;
        setIsLoadingMoreNotifications(true);

        try {
            const response = await globalThis.notifications?.getNotifications?.(nextPage);
            const newNotifications = response?.content ?? [];

            if (newNotifications.length > 0) {
                setNotifications(prev => [...prev, ...newNotifications]);
                setNotificationPage(response?.page ?? null);
            }
        } catch (error) {
            console.error("Error loading more notifications:", error);
        } finally {
            setIsLoadingMoreNotifications(false);
        }
    }, [notificationPage, isLoadingMoreNotifications]);

    // Check if there are more notifications to load
    const hasMoreNotifications = useMemo(() => {
        if (!notificationPage) return false;
        return notificationPage.number < notificationPage.totalPages - 1;
    }, [notificationPage]);

    // Mark single notification as viewed
    const handleMarkAsViewed = useCallback(async (notification: NotificationItem) => {
        try {
            const updatedNotification = await globalThis.notifications?.markAsViewed?.(notification.notificationId);
            if (updatedNotification) {
                setNotifications(prev =>
                    prev.map(n => n.notificationId === notification.notificationId
                        ? { ...n, ...updatedNotification }
                        : n)
                );
            }
        } catch (error) {
            console.error("Error marking notification as viewed:", error);
        }
    }, []);

    // Mark all notifications as read
    const handleMarkAllAsRead = useCallback(async () => {
        const unreadIds = (notifications ?? [])
            .filter(n => n.viewedDate === null)
            .map(n => n.notificationId);

        if (unreadIds.length === 0) return;

        try {
            const updatedNotifications = await globalThis.notifications?.markAllAsViewed?.(unreadIds);
            if (updatedNotifications) {
                setNotifications(prev => {
                    const updatedMap = new Map<string, NotificationItem>(
                        updatedNotifications.map(n => [n.notificationId, n])
                    );
                    return prev.map(n => updatedMap.get(n.notificationId) ?? n);
                });
            }
        } catch (error) {
            console.error("Error marking all notifications as viewed:", error);
        }
    }, [notifications]);

    // Load recent files
    useEffect(() => {
        const loadRecentFiles = async () => {
            try {
                const files = await globalThis.doc?.getRecentFiles?.();
                if (files && Array.isArray(files)) {
                    setRecentFiles(files.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to load recent files:", error);
            }
        };
        loadRecentFiles();
    }, []);

    const handleNewDocument = useCallback(() => {
        globalThis.electron?.ipcRenderer?.send("menu:new-document");
    }, []);

    const handleOpenDocument = useCallback(() => {
        globalThis.doc?.openDocument?.();
    }, []);

    const handleOpenRecentFile = useCallback((filePath: string) => {
        globalThis.electron?.ipcRenderer?.send("open-file", filePath);
    }, []);

    return (
      <div className="w-full h-screen bg-background overflow-auto dark:bg-grey-10">
        {/* Main content area */}
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-lg w-full flex flex-col items-center">
            {/* Logo and title */}
            <div className="text-center mb-12">
              <div className="flex h-32 w-full items-center justify-center mb-6">
                <img
                  src={criterionLogo}
                  alt="Criterion Logo"
                  className="h-28 w-28 object-contain drop-shadow-lg rounded-lg shadow-md"
                />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                {t("welcome")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("welcomeView.subtitle")}
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-6 mb-10 w-full max-w-md">
              <button
                onClick={handleNewDocument}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-6 rounded-xl",
                  "border border-border bg-card hover:bg-accent",
                  "transition-colors cursor-pointer dark:bg-grey-10 dark:hover:bg-grey-20",
                )}
              >
                <FilePlus className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {t("welcomeView.newDocument")}
                </span>
              </button>

              <button
                onClick={handleOpenDocument}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-6 rounded-xl",
                  "border border-border bg-card hover:bg-accent",
                  "transition-colors cursor-pointer dark:bg-grey-10 dark:hover:bg-grey-20",
                )}
              >
                <FolderOpen className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {t("welcomeView.openDocument")}
                </span>
              </button>
            </div>

            {/* Recent files */}
            {recentFiles.length > 0 && (
              <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium text-muted-foreground">
                    {t("welcomeView.recentFiles")}
                  </h2>
                </div>
                <div className="space-y-1">
                  {recentFiles.map((file, index) => (
                    <button
                      key={`${file.path}-${index}`}
                      onClick={() => handleOpenRecentFile(file.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                        "text-left hover:bg-accent transition-colors",
                      )}
                    >
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {file.path}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panels */}
        <NotificationPanel
          open={isNotificationPanelOpen}
          onOpenChange={setIsNotificationPanelOpen}
          notifications={notifications}
          loading={isLoadingNotifications}
          loadingMore={isLoadingMoreNotifications}
          hasMore={hasMoreNotifications}
          onLoadMore={handleLoadMoreNotifications}
          onMarkAsViewed={handleMarkAsViewed}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
        <AccountPanel
          open={isAccountPanelOpen}
          onOpenChange={setIsAccountPanelOpen}
        />
      </div>
    );
};

const WelcomeView = () => {
    return (
        <ThemeProvider>
            <WelcomeContent />
        </ThemeProvider>
    );
};

export default memo(WelcomeView);
