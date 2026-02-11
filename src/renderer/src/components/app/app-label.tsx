import { forwardRef, memo } from "react";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

const AppLabel = forwardRef<
    React.ElementRef<typeof Label>,
    React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
    return (
        <Label
            ref={ref}
            className={cn(
                "text-grey-10 dark:text-grey-95 font-medium",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        />
    )
})
AppLabel.displayName = Label.displayName;

export default memo(AppLabel);
