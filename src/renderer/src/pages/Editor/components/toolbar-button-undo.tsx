import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconUndo from "@/components/app/icons/IconUndo";

type ToolbarButtonUndoProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled?: boolean;
}

export const ToolbarButtonUndo = memo(({
    title,
    onClick,
    tabIndex,
    disabled = false
}: ToolbarButtonUndoProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}>
            <AppButton
                asChild
                variant={'toolbar'}
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-pressed={false}
                disabled={disabled}
            >
                <IconUndo />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
