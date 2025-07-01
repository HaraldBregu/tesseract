import { forwardRef } from "react";
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
            className={cn("border-grey-80 dark:border-grey-40",
                className)}
            {...props}
        />

    )
})
AppSeparator.displayName = Separator.displayName;

export default AppSeparator;