import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconObject from "@/components/app/icons/IconObject";

type ToolbarButtonObjectProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonObject = memo(({
    title,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonObjectProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}>
            <AppButton
                variant='toolbar'
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-disabled={disabled}
                disabled={disabled}
            >
                <IconObject />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
