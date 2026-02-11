import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconNotifications from "@/components/app/icons/IconNotifications";
import { cn } from "@/lib/utils";

type ToolbarButtonNotificationsProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
    unreadCount?: number;
}

export const ToolbarButtonNotifications = memo(({
    title,
    onClick,
    tabIndex,
    disabled,
    unreadCount = 0,
}: ToolbarButtonNotificationsProps) => {
    const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString();

    return (
        <div className={cn(
            "relative flex items-center",
            disabled && "opacity-50 pointer-events-none"
        )}>
            <ToolbarButtonTooltip
                tooltip={title}>
                <AppButton
                    asChild
                    variant='toolbar'
                    aria-label={title}
                    size="icon"
                    rounded="sm"
                    tabIndex={disabled ? -1 : tabIndex}
                    onClick={disabled ? undefined : onClick}
                    aria-disabled={disabled}
                    disabled={disabled}
                >
                    <IconNotifications />
                </AppButton>
            </ToolbarButtonTooltip>
            {unreadCount > 0 && !disabled && (
                <span
                    className={cn(
                        "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                        "min-w-[14px] h-[14px] px-0.5 rounded-full",
                        "bg-red-500 text-white text-[8px] font-semibold",
                        "pointer-events-none"
                    )}
                >
                    {displayCount}
                </span>
            )}
        </div>
    )
})
