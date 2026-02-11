import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconSubscript from "@/components/app/icons/IconSubscript";

type ToolbarButtonSubscriptProps = {
    title: string;
    isSubscript,
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonSubscript = memo(({
    title,
    isSubscript,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonSubscriptProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}
            >
            <AppButton
                asChild
                variant={isSubscript ? "toolbar-selected" : 'toolbar'}
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-pressed={isSubscript}
                disabled={disabled}
            >
                <IconSubscript />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
