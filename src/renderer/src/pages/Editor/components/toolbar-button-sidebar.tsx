import AppButton from "@/components/app/app-button"
import { ToolbarButtonTooltip } from "./toolbar-button-tooltip"
import { forwardRef, memo } from "react";
import IconDockToRight from "@/components/app/icons/IconDockToRight";

type ToolbarButtonSidebarProps = {
    title: string;
    tabIndex: number;
    ref: React.RefObject<HTMLButtonElement>;
    onClick: () => void;
}

export const ToolbarButtonSidebar = memo(forwardRef<HTMLDivElement, ToolbarButtonSidebarProps>(({
    title,
    tabIndex = 1,
    onClick
}, ref) => {
    return (
        <div ref={ref} className="flex items-center space-x-2 transition-transform duration-300 h-full">
            <ToolbarButtonTooltip
                tooltip={title}>
                <AppButton 
                    asChild
                    variant="toolbar"
                    size="icon"
                    rounded="sm"
                    aria-label={title}
                    tabIndex={tabIndex}
                    onClick={onClick}
                >
                    <IconDockToRight />
                </AppButton>
            </ToolbarButtonTooltip>
        </div>
    )
}))