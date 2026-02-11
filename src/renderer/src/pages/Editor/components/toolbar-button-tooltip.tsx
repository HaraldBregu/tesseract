import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { memo } from "react";

export const ToolbarButtonTooltip = memo(({
    children,
    tooltip,
    disabled,
    className,
}: {
    children: React.ReactNode,
    tooltip: string,
    disabled?: boolean,
    className?: string
}) => {
    return (
        <Tooltip>
            <TooltipTrigger
                asChild
                disabled={disabled}>
                <span
                    className={cn(
                        "inline-flex leading-none rounded-sm",
                        disabled && "pointer-events-none opacity-50",
                        // "[&_svg]:disabled:!text-grey-60 dark:[&_svg]:disabled:!text-grey-50",
                        // "[&_button:disabled]:!bg-transparent [&_button:disabled]:!text-grey-60",
                        // "dark:[&_button:disabled]:!bg-transparent dark:[&_button:disabled]:!text-grey-50",
                        className
                    )}>
                    {children}
                </span>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    )
})