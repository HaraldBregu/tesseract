import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconBold from "@/components/app/icons/IconBold";

type ToolbarButtonBoldProps = {
    title: string;
    isBold: boolean,
    tabIndex: number;
    onClick: () => void;
    disabled?: boolean;
}

export const ToolbarButtonBold = memo(({
    title,
    isBold,
    onClick,
    tabIndex,
    disabled = false
}: ToolbarButtonBoldProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant={isBold ? "toolbar-selected" : 'toolbar'}
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-pressed={isBold}
                disabled={disabled}
            >
                <IconBold />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
