import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconPrint from "@/components/app/icons/IconPrint";

type ToolbarButtonPrintProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonPrint = memo(({
    title,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonPrintProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}>
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
                <IconPrint />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
