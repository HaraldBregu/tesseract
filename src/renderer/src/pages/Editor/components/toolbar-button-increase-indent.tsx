import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconIndentIncrease from "@/components/app/icons/IconIndentIncrease";

type ToolbarButtonIncreaseIndentProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonIncreaseIndent = memo(({
    title,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonIncreaseIndentProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant='toolbar'
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-disabled={disabled}
                disabled={disabled}
            >
                <IconIndentIncrease />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
