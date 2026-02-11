import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: InvitationStatus;
}

export function StatusBadge({ status }: Readonly<StatusBadgeProps>) {
    const { t } = useTranslation();

    const statusConfig: Record<InvitationStatus, { label: string; className: string }> = {
        Pending: {
            label: t("sharedFiles.status.pending"),
            className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
        },
        Accepted: {
            label: t("sharedFiles.status.accepted"),
            className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
        },
        Declined: {
            label: t("sharedFiles.status.declined"),
            className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        },
        Expired: {
            label: t("sharedFiles.status.expired"),
            className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800",
        },
        Revoked: {
            label: t("sharedFiles.status.revoked"),
            className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
        },
    };

    const config = statusConfig[status];

    return (
        <Badge variant="outline" className={cn("text-xs font-medium", config.className )}>
            {config.label}
        </Badge>
    );
}
