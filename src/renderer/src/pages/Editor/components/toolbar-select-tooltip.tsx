import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { memo } from "react";

export const ToolbarSelectTooltip = memo(({
    children,
    tooltip,
    disabled,
    className,
    ...props
}: {
    children: React.ReactNode,
    tooltip: string,
    disabled?: boolean,
    asChild?: boolean,
    className?: string
}) => {
    return (
        <Tooltip>
            <TooltipTrigger
                className={cn(
                    "leading-none",
                    className
                )}
                disabled={disabled}
                {...props}>
                {children}
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    )
})