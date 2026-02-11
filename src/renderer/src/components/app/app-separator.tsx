import { forwardRef, memo } from "react";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

const AppSeparator = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
        <Separator
            ref={ref}
            orientation={orientation}
            className={cn("border-grey-80 dark:bg-grey-50",
                className)}
            {...props}
        />

    )
})
AppSeparator.displayName = Separator.displayName;

export default memo(AppSeparator);