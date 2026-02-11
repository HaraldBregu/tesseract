import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Button from "@/components/ui/button";
import IconSearch from "@/components/app/icons/IconSearch";

interface NotificationFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    actionFilter: NotificationType | "all";
    onActionFilterChange: (filter: NotificationType | "all") => void;
    timeFilter: NotificationTimeFilter;
    onTimeFilterChange: (filter: NotificationTimeFilter) => void;
    resultsCount: number;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

const NotificationFilters = memo(({
    searchQuery,
    onSearchChange,
    actionFilter,
    onActionFilterChange,
    timeFilter,
    onTimeFilterChange,
    resultsCount,
    hasActiveFilters,
    onClearFilters,
}: NotificationFiltersProps) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-3 py-4">
            {/* Search Input */}
            <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("notifications.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Filters Row */}
            <div className="flex gap-2">
                <Select
                    value={actionFilter}
                    onValueChange={(value) =>
                        onActionFilterChange(value as NotificationType | "all")
                    }
                >
                    <SelectTrigger className="flex-1">
                        <SelectValue
                            placeholder={t("notifications.filters.allActions")}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            {t("notifications.filters.allActions")}
                        </SelectItem>
                        <SelectItem value="send_invitation">
                            {t("notifications.filters.sendInvitation")}
                        </SelectItem>
                        <SelectItem value="resend_invitation">
                            {t("notifications.filters.resendInvitation")}
                        </SelectItem>
                        <SelectItem value="revoke_access">
                            {t("notifications.filters.revokeAccess")}
                        </SelectItem>
                        <SelectItem value="share_new_version">
                            {t("notifications.filters.shareNewVersion")}
                        </SelectItem>
                        <SelectItem value="delete_document">
                            {t("notifications.filters.deleteDocument")}
                        </SelectItem>
                        <SelectItem value="accept_invitation">
                            {t("notifications.filters.acceptInvitation")}
                        </SelectItem>
                        <SelectItem value="decline_invitation">
                            {t("notifications.filters.declineInvitation")}
                        </SelectItem>
                        <SelectItem value="download">
                            {t("notifications.filters.download")}
                        </SelectItem>
                        <SelectItem value="download_new_version">
                            {t("notifications.filters.downloadNewVersion")}
                        </SelectItem>
                        <SelectItem value="invitation_expired">
                            {t("notifications.filters.invitationExpired")}
                        </SelectItem>
                        <SelectItem value="password_changed">
                            {t("notifications.filters.passwordChanged")}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={timeFilter}
                    onValueChange={(value) =>
                        onTimeFilterChange(value as NotificationTimeFilter)
                    }
                >
                    <SelectTrigger className="flex-1">
                        <SelectValue
                            placeholder={t("notifications.filters.allTime")}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            {t("notifications.filters.allTime")}
                        </SelectItem>
                        <SelectItem value="today">
                            {t("notifications.filters.today")}
                        </SelectItem>
                        <SelectItem value="yesterday">
                            {t("notifications.filters.yesterday")}
                        </SelectItem>
                        <SelectItem value="last_7_days">
                            {t("notifications.filters.last7Days")}
                        </SelectItem>
                        <SelectItem value="last_30_days">
                            {t("notifications.filters.last30Days")}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results Counter and Clear Filters */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                    {t("notifications.resultsCount", {
                        count: resultsCount,
                    })}
                </span>
                {hasActiveFilters && (
                    <Button
                        intent="secondary"
                        variant="link"
                        className="text-[11px] capitalize"
                        size="mini"
                        onClick={onClearFilters}
                    >
                        {t("notifications.clearFilters")}
                    </Button>
                )}
            </div>
        </div>
    );
});

NotificationFilters.displayName = "NotificationFilters";

export default NotificationFilters;
