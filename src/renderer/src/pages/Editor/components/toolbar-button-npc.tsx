import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconNonPrintingCharact from "@/components/app/icons/IconNonPrintingCharact";

type ToolbarButtonNPCProps = {
    title: string;
    isNPC,
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonNPC = memo(({
    title,
    isNPC,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonNPCProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}>
            <AppButton
                asChild
                variant={isNPC ? "toolbar-selected" : 'toolbar'}
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-pressed={isNPC}
                disabled={disabled}
            >
                <IconNonPrintingCharact />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
