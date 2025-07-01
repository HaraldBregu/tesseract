import { forwardRef } from "react";
import { SelectContent, SelectItem, SelectSeparator, SelectTrigger } from "../ui/select";
import { cn } from "@/lib/utils";

const AppSelectTrigger = forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, ...props }, ref) => {
    return (
        <SelectTrigger
            ref={ref}
            className={
                cn("min-w-[91px] pl-[4px] pr-[2px] hover:bg-primary hover:text-white active:bg-primary ",
                    "active:text-white focus-visible:bg-primary focus-visible:text-white py-0",
                    " h-auto border-none shadow-none focus:ring-0 focus:ring-offset-0",
                    className
                )}
            onClick={(e) => {
                e.stopPropagation();
                props.onClick?.(e);
            }}
            {...props}
        />
    )
})
AppSelectTrigger.displayName = SelectTrigger.displayName;

const AppSelectContent = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof SelectContent>
>(({ className, ...props }, ref) => {
    return (
        <SelectContent
            ref={ref}
            className={cn(className)}
            {...props}
        />
    )
})
AppSelectContent.displayName = SelectContent.displayName;

const AppSelectItem = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof SelectItem>
>(({ className, ...props }, ref) => {
    return (
        <SelectItem
            ref={ref}
            className={cn("hover:bg-primary hover:text-white active:bg-primary",
                "active:text-white focus-visible:bg-primary focus-visible:text-white",
                className)}
            {...props}
        />
    )
})
AppSelectItem.displayName = SelectItem.displayName;

const AppSelectSeparator = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof SelectSeparator>
>(({ className, ...props }, ref) => {
    return (
        <SelectSeparator
            ref={ref}
            className={cn("text-xs font-normal", className)}
            {...props}
        />
    )
})
AppSelectSeparator.displayName = SelectSeparator.displayName;

export {
    AppSelectTrigger,
    AppSelectContent,
    AppSelectItem,
    AppSelectSeparator,
};
