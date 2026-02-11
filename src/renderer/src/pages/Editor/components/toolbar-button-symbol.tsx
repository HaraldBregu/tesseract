import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconSymbol from "@/components/app/icons/IconSymbol";

type ToolbarButtonSymbolProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonSymbol = memo(({
    title,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonSymbolProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}
            >
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
                <IconSymbol />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
