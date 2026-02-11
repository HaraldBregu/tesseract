import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconSearch from "@/components/app/icons/IconSearch";

type ToolbarButtonSearchProps = {
    title: string;
    tabIndex: number;
    onClick: () => void;
    disabled: boolean;
}

export const ToolbarButtonSearch = memo(({
    title,
    onClick,
    tabIndex,
    disabled
}: ToolbarButtonSearchProps) => {
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
                <IconSearch />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
