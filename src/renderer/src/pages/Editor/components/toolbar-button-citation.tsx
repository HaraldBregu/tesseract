import AppButton from "@/components/app/app-button"
import IconCitation from "@/components/app/icons/IconCitation"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";

type ToolbarButtonCitationProps = {
    title: string;
    disabled: boolean;
    onClick: () => void;
}

export const ToolbarButtonCitation = memo(({
    title,
    disabled,
    onClick,
}: ToolbarButtonCitationProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}>
            <AppButton
                asChild
                variant="toolbar"
                size="icon"
                rounded="sm"
                aria-label={title}
                disabled={disabled}
                onClick={onClick}
            >
                <IconCitation />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
