import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconReadingSeparator from "@/components/app/icons/IconReadingSeparator";

type ToolbarButtonReadingSeparatorProps = {
    title: string;
    isReadingSeparator?: boolean;
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonReadingSeparator = memo(({
    title,
    isReadingSeparator = false,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonReadingSeparatorProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant={isReadingSeparator ? "toolbar-selected" : 'toolbar'}
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-pressed={isReadingSeparator}
                disabled={disabled}>
                <IconReadingSeparator />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
