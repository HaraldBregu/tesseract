import { useCallback, useMemo, useState } from "react";
import { mapEventIdToType } from "@/utils/notificationUtils";

interface UseNotificationFiltersOptions {
    notifications: NotificationItem[];
}

interface UseNotificationFiltersReturn {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    timeFilter: NotificationTimeFilter;
    setTimeFilter: (filter: NotificationTimeFilter) => void;
    actionFilter: NotificationType | "all";
    setActionFilter: (filter: NotificationType | "all") => void;
    hasActiveFilters: boolean;
    handleClearFilters: () => void;
    unreadCount: number;
    filteredNotifications: NotificationItem[];
}

export function useNotificationFilters({
    notifications,
}: UseNotificationFiltersOptions): UseNotificationFiltersReturn {
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState<NotificationTimeFilter>("all");
    const [actionFilter, setActionFilter] = useState<NotificationType | "all">("all");

    const hasActiveFilters = useMemo(() => {
        return (
            searchQuery.trim() !== "" ||
            timeFilter !== "all" ||
            actionFilter !== "all"
        );
    }, [searchQuery, timeFilter, actionFilter]);

    const handleClearFilters = useCallback(() => {
        setSearchQuery("");
        setTimeFilter("all");
        setActionFilter("all");
    }, []);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => n.viewedDate === null).length;
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        let filtered = [...notifications];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((n) => {
                const title = n.notificationTitle ?? "";
                const message =
                    n.senderRole === "Owner"
                        ? n.ownerMessage ?? ""
                        : n.recipientMessage ?? "";
                return (
                    title.toLowerCase().includes(query) ||
                    message.toLowerCase().includes(query)
                );
            });
        }

        // Filter by action type
        if (actionFilter !== "all") {
            filtered = filtered.filter(
                (n) => mapEventIdToType(n.notificationEventId) === actionFilter,
            );
        }

        // Filter by time
        if (timeFilter !== "all") {
            const now = new Date();
            const startOfToday = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
            );
            const startOfYesterday = new Date(
                startOfToday.getTime() - 24 * 60 * 60 * 1000,
            );

            filtered = filtered.filter((n) => {
                const notificationDate = new Date(n.creationDate);
                switch (timeFilter) {
                    case "today":
                        return notificationDate >= startOfToday;
                    case "yesterday":
                        return (
                            notificationDate >= startOfYesterday &&
                            notificationDate < startOfToday
                        );
                    case "last_7_days":
                        return (
                            notificationDate >=
                            new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000)
                        );
                    case "last_30_days":
                        return (
                            notificationDate >=
                            new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000)
                        );
                    default:
                        return true;
                }
            });
        }

        // Sort by creationDate (newest first)
        return filtered.sort(
            (a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime(),
        );
    }, [notifications, searchQuery, timeFilter, actionFilter]);

    return {
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
    };
}
