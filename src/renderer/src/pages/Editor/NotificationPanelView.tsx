import { memo, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Button from "@/components/ui/button";
import IconSearch from "@/components/app/icons/IconSearch";
import { CheckCheck, Loader2 } from "lucide-react";
import NotificationItem from "@/components/notification-item";
import NotificationFilters from "@/components/notification-filters";
import { useNotificationFilters } from "@/hooks/use-notification-filters";

const LoadingState = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground mt-4">
                {t("notifications.loading")}
            </p>
        </div>
    );
};

const EmptyState = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <IconSearch className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
                {t("notifications.emptyTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
                {t("notifications.emptyDescription")}
            </p>
        </div>
    );
};

interface NotificationListProps {
    notifications: NotificationItem[];
    selectedIndex: number;
    itemRefs: React.RefObject<(HTMLButtonElement | null)[]>;
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => void;
    onClick: (notification: NotificationItem) => void;
    onFocus: (notification: NotificationItem, index: number) => void;
}

const NotificationList = ({
    notifications,
    selectedIndex,
    itemRefs,
    onKeyDown,
    onClick,
    onFocus,
}: NotificationListProps) => {
    const { t } = useTranslation();
    return (
        <ul
            aria-label={t("notifications.title")}
            className="space-y-2 list-none m-0 p-0 w-full overflow-hidden"
        >
            {notifications.map((notification, index) => (
                <li key={notification.notificationId} className="list-none overflow-hidden">
                    <NotificationItem
                        ref={(el) => { itemRefs.current[index] = el; }}
                        notification={notification}
                        isSelected={selectedIndex === index}
                        onClick={onClick}
                        onFocus={() => onFocus(notification, index)}
                        onKeyDown={(e) => onKeyDown(e, index)}
                    />
                </li>
            ))}
        </ul>
    );
};

const LoadingMoreState = () => {
    return (
        <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
    );
};

interface NotificationPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notifications?: NotificationItem[];
    loading?: boolean;
    loadingMore?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onMarkAllAsRead?: () => void;
    onMarkAsViewed?: (notification: NotificationItem) => void;
}

const NotificationPanel = memo(({
    open,
    onOpenChange,
    notifications = [],
    loading = false,
    loadingMore = false,
    hasMore = false,
    onLoadMore,
    onMarkAllAsRead,
    onMarkAsViewed,
}: NotificationPanelProps) => {
    const { t } = useTranslation();
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const {
        searchQuery,
        setSearchQuery,
        timeFilter,
        setTimeFilter,
        actionFilter,
        setActionFilter,
        hasActiveFilters,
        handleClearFilters,
        unreadCount,
        filteredNotifications,
    } = useNotificationFilters({ notifications });

    // Handle scroll to load more notifications
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (!hasMore || loadingMore || !onLoadMore) return;
        
        const target = e.currentTarget;
        const scrollTop = target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;
        
        // Load more when user scrolls to within 100px of the bottom
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        if (isNearBottom) {
            onLoadMore();
        }
    }, [hasMore, loadingMore, onLoadMore]);

    const handleMarkAsViewed = useCallback((notification: NotificationItem) => {
        if (notification.viewedDate === null) {
            onMarkAsViewed?.(notification);
        }
    }, [onMarkAsViewed]);

    const handleNotificationClick = useCallback((notification: NotificationItem) => {
        handleMarkAsViewed(notification);
    }, [handleMarkAsViewed]);

    const handleNotificationFocus = useCallback((notification: NotificationItem, index: number) => {
        setSelectedIndex(index);
        handleMarkAsViewed(notification);
    }, [handleMarkAsViewed]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
        if (filteredNotifications.length === 0) return;

        const getNewIndex = (): number | null => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    return currentIndex < filteredNotifications.length - 1 ? currentIndex + 1 : 0;
                case "ArrowUp":
                    e.preventDefault();
                    return currentIndex > 0 ? currentIndex - 1 : filteredNotifications.length - 1;
                case "Home":
                    e.preventDefault();
                    return 0;
                case "End":
                    e.preventDefault();
                    return filteredNotifications.length - 1;
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (currentIndex >= 0 && currentIndex < filteredNotifications.length) {
                        handleNotificationClick(filteredNotifications[currentIndex]);
                    }
                    return null;
                default:
                    return null;
            }
        };

        const newIndex = getNewIndex();
        if (newIndex !== null && newIndex !== currentIndex) {
            setSelectedIndex(newIndex);
            // Focus triggers onFocus which handles mark as viewed
            itemRefs.current[newIndex]?.focus();
        }
    }, [filteredNotifications, handleNotificationClick]);

    // Handle keyboard navigation when no item is focused
    const handleContainerKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (filteredNotifications.length === 0) return;
        
        // Check if the event target is already a notification item button
        if ((e.target as HTMLElement).closest('button[type="button"]')) {
            return; // Let the item handle its own keydown
        }

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const indexToFocus = e.key === "ArrowDown" ? 0 : filteredNotifications.length - 1;
            setSelectedIndex(indexToFocus);
            itemRefs.current[indexToFocus]?.focus();
        }
    }, [filteredNotifications]);

    return (
      <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          noOverlay
          className="w-[400px] sm:w-[540px] flex flex-col bg-background dark:bg-grey-20 border-l border-grey-70 dark:border-grey-40 top-0 h-[calc(100vh-40px)]"
        >
          <SheetHeader className="border-b border-grey-80 dark:border-grey-50 pb-4 -mx-6 px-6">
            <div className="flex items-center justify-between gap-4 pt-4">
              <SheetTitle className="text-sm">
                {t("notifications.title")}
              </SheetTitle>
              {unreadCount > 0 && (
                <Button
                  variant="link"
                  intent={"secondary"}
                  size="mini"
                  className="text-muted-foreground hover:text-foreground shrink-0 whitespace-nowrap text-[10px] lowercase first-letter:uppercase"
                  onClick={onMarkAllAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  {t("notifications.markAllAsRead")}
                </Button>
              )}
            </div>
          </SheetHeader>

          <NotificationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            actionFilter={actionFilter}
            onActionFilterChange={setActionFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            resultsCount={filteredNotifications.length}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Notifications List */}
          <ScrollArea 
            className="flex-1 -mx-6 px-3 border-t border-grey-70 dark:border-grey-40 pt-4 [&_[data-radix-scroll-area-viewport]>div]:!block"
            onKeyDown={handleContainerKeyDown}
            onScrollCapture={handleScroll}
          >
            {loading && <LoadingState />}
            {!loading && filteredNotifications.length === 0 && <EmptyState />}
            {!loading && filteredNotifications.length > 0 && (
              <>
                <NotificationList
                  notifications={filteredNotifications}
                  selectedIndex={selectedIndex}
                  itemRefs={itemRefs}
                  onKeyDown={handleKeyDown}
                  onClick={handleNotificationClick}
                  onFocus={handleNotificationFocus}
                />
                {loadingMore && <LoadingMoreState />}
              </>
            )}
            <ScrollBar className="[&>div]:bg-[#6a6a6a] [&>div]:hover:bg-[#484848]" />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
});

NotificationPanel.displayName = "NotificationPanel";

export default NotificationPanel;
