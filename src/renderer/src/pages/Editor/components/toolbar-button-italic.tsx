import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { memo } from "react";
import IconItalic from "@/components/app/icons/IconItalic";

type ToolbarButtonItalicProps = {
    title: string;
    isItalic,
    tabIndex: number;
    onClick: () => void;
    disabled?: boolean;
}

export const ToolbarButtonItalic = memo(({
    title,
    isItalic,
    onClick,
    tabIndex,
    disabled = false
}: ToolbarButtonItalicProps) => {
    return (
        <ToolbarButtonTooltip
            tooltip={title}
            disabled={disabled}
        >
            <AppButton
                asChild
                variant={isItalic ? "toolbar-selected" : 'toolbar'}
                aria-label={title}
                size="icon"
                rounded="sm"
                tabIndex={tabIndex}
                onClick={onClick}
                aria-pressed={isItalic}
                disabled={disabled}
            >
                <IconItalic />
            </AppButton>
        </ToolbarButtonTooltip>
    )
})
