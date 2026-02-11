import { forwardRef, memo } from "react";
import { Popover, PopoverTrigger, PopoverAnchor, PopoverContent } from "../ui/popover";
import { cn } from "@/lib/utils";

const AppPopoverContentBase = forwardRef<
    React.ElementRef<typeof PopoverContent>,
    React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, ...props }, ref) => {
    return (
        <PopoverContent
            ref={ref}
            className={cn(
                "border-grey-80 dark:border-grey-30 bg-background text-foreground",
                className
            )}
            {...props}
        />
    )
})
AppPopoverContentBase.displayName = PopoverContent.displayName;

// Memoized wrappers matching the dialog counterparts
const AppPopover = memo(Popover)
const AppPopoverTrigger = memo(PopoverTrigger)
const AppPopoverContent = memo(AppPopoverContentBase);
const AppPopoverAnchor = memo(PopoverAnchor)

export { AppPopover, AppPopoverTrigger, AppPopoverAnchor, AppPopoverContent };
