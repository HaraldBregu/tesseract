import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconIndentDecrease from "@/components/app/icons/IconIndentDecrease";

type ToolbarButtonDecreaseIndentProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonDecreaseIndent = memo(({
    title,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonDecreaseIndentProps) => {
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
                <IconIndentDecrease />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
