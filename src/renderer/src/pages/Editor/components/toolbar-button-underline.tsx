import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconUnderline from "@/components/app/icons/IconUnderline";

type ToolbarButtonUnderlineProps = {
    title: string;
    isUnderline,
    tabIndex: number;
    onClick: () => void;
    disabled?: boolean;
}

export const ToolbarButtonUnderline = memo(({
    title,
    isUnderline,
    onClick,
    tabIndex,
    disabled = false
}: ToolbarButtonUnderlineProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant={isUnderline ? "toolbar-selected" : 'toolbar'}
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-pressed={isUnderline}
                disabled={disabled}
            >
                <IconUnderline />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
