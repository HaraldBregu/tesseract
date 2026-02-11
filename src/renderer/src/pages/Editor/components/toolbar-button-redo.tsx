import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconRestore from "@/components/app/icons/IconRestore";

type ToolbarButtonRedoProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled?: boolean;
}

export const ToolbarButtonRedo = memo(({
    title,
    onClick,
    tabIndex,
    disabled = false
}: ToolbarButtonRedoProps) => {
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
                <IconRestore />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
