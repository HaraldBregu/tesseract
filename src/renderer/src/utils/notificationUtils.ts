/**
 * Maps notificationEventId from backend to NotificationType
 */
export const mapEventIdToType = (eventId: number): NotificationType => {
    const mapping: Record<number, NotificationType> = {
        1: "send_invitation",
        2: "resend_invitation",
        3: "revoke_access",
        4: "share_new_version",
        5: "delete_document",
        6: "accept_invitation",
        7: "decline_invitation",
        8: "download",
        9: "download_new_version",
        10: "invitation_expired",
        11: "password_changed",
        12: "account_deleted",
    };
    return mapping[eventId] || "send_invitation";
};

/**
 * Formats a date string into a human-readable timestamp
 */
export const formatNotificationTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Returns the color classes for a notification icon based on type
 */
export const getNotificationIconColor = (type: NotificationType): string => {
    switch (type) {
        case "send_invitation":
        case "share_new_version":
        case "password_changed":
            return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
        case "resend_invitation":
            return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
        case "accept_invitation":
            return "text-green-600 bg-green-100 dark:bg-green-900/30";
        case "revoke_access":
        case "delete_document":
        case "decline_invitation":
        case "account_deleted":
            return "text-red-600 bg-red-100 dark:bg-red-900/30";
        case "download":
        case "download_new_version":
            return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
        case "invitation_expired":
            return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
        default:
            return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
};
