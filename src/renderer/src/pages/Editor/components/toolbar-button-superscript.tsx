import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconSuperscript from "@/components/app/icons/IconSuperscript";

type ToolbarButtonSuperscriptProps = {
    title: string;
    isSuperscript,
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonSuperscript = memo(({
    title,
    isSuperscript,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonSuperscriptProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}
            >
            <AppButton
                asChild
                variant={isSuperscript ? "toolbar-selected" : 'toolbar'}
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-pressed={isSuperscript}
                disabled={disabled}
            >
                <IconSuperscript />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
