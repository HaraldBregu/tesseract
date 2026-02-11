import { memo, forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
    mapEventIdToType,
    getNotificationIconColor,
    formatNotificationTimestamp,
} from "@/utils/notificationUtils";
import IconCheck from "@/components/app/icons/IconCheck";
import IconDownload from "@/components/app/icons/IconDownload";
import IconShare from "@/components/app/icons/IconShare";
import IconDelete from "@/components/app/icons/IconDelete";
import IconLocked from "@/components/app/icons/IconLocked";
import { Clock, UserX } from "lucide-react";

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case "send_invitation":
        case "resend_invitation":
            return <IconShare className="h-4 w-4" />;
        case "revoke_access":
            return <IconLocked className="h-4 w-4" />;
        case "share_new_version":
            return <IconShare className="h-4 w-4" />;
        case "delete_document":
        case "account_deleted":
            return <IconDelete className="h-4 w-4" />;
        case "accept_invitation":
            return <IconCheck className="h-4 w-4" />;
        case "decline_invitation":
            return <UserX className="h-4 w-4" />;
        case "download":
        case "download_new_version":
            return <IconDownload className="h-4 w-4" />;
        case "invitation_expired":
            return <Clock className="h-4 w-4" />;
        case "password_changed":
            return <IconCheck className="h-4 w-4" />;
        default:
            return <IconCheck className="h-4 w-4" />;
    }
};

// Props are used inside forwardRef callback but linter cannot trace them
/* eslint-disable react/no-unused-prop-types */
interface NotificationItemProps {
    notification: NotificationItem;
    isSelected?: boolean;
    onClick?: (notification: NotificationItem) => void;
    onFocus?: (notification: NotificationItem) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

// Event IDs where we should show recipient info instead of owner info
const RECIPIENT_EVENT_IDS = [6, 7, 8, 9, 10]; // accept_invitation, decline_invitation, download, download_new_version, invitation_expired

const NotificationItemComponent = memo(forwardRef<HTMLButtonElement, NotificationItemProps>(
    (props, ref) => {
        const { notification, isSelected, onClick, onFocus, onKeyDown } = props;
        console.log(notification);
        const isRead = notification.viewedDate !== null;
        const notificationType = mapEventIdToType(notification.notificationEventId);
        
        // Determine which name to display based on notification event type
        const useRecipientInfo = RECIPIENT_EVENT_IDS.includes(notification.notificationEventId);
        const displayName = useRecipientInfo
            ? `${notification.recipientName} ${notification.recipientSurname}`.trim()
            : `${notification.ownerName} ${notification.ownerSurname}`.trim();
        const hasDisplayName = useRecipientInfo
            ? (notification.recipientName || notification.recipientSurname)
            : (notification.ownerName || notification.ownerSurname);

        return (
            <button
                ref={ref}
                type="button"
                tabIndex={0}
                className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors w-full text-left border border-transparent",
                    "hover:bg-muted/50 focus:outline-none focus-visible:border-primary/50",
                    !isRead && "bg-muted/30",
                    isSelected && "border-sky-300/60 bg-muted/30",
                )}
                onClick={() => onClick?.(notification)}
                onFocus={() => onFocus?.(notification)}
                onKeyDown={onKeyDown}
            >
                <div
                    className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                        getNotificationIconColor(notificationType),
                    )}
                >
                    {getNotificationIcon(notificationType)}
                </div>

                <div className="flex-1 min-w-0 overflow-hidden space-y-1">
                    {/* Sender/Actor info */}
                    {hasDisplayName && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">
                                {displayName}
                            </span>
                            {notification.senderRole && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                                    {notification.senderRole === "Collaborator" ? "owner" : 'collaborator'}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <p className="font-medium text-sm">{notification.notificationTitle}</p>
                    
                    {/* Message */}
                    <p className="text-xs text-muted-foreground line-clamp-2 w-full break-words">
                        {notification.senderRole === "Owner" ? notification.ownerMessage : notification.recipientMessage}
                    </p>

                    {/* Document name and timestamp */}
                    <div className="flex flex-col gap-0.5 pt-1">
                        {notification.documentFile && (
                            <span className="text-xs text-muted-foreground font-medium">
                                {notification.documentFile}
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {formatNotificationTimestamp(notification.creationDate)}
                        </span>
                    </div>
                </div>

                {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
            </button>
        );
    }
));

NotificationItemComponent.displayName = "NotificationItem";

export default NotificationItemComponent;
