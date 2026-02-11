import { forwardRef, memo } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

const AppDropdownMenu = memo(DropdownMenu);

const AppDropdownMenuTrigger = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuTrigger>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuTrigger
            ref={ref}
            className={cn(
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuTrigger.displayName = DropdownMenuTrigger.displayName;

const AppDropdownMenuContent = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuContent>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuContent>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuContent
            ref={ref}
            className={cn(
                "border-grey-80 dark:border-grey-30 bg-white dark:bg-grey-20",
                "shadow-lg",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuContent.displayName = DropdownMenuContent.displayName;

const AppDropdownMenuItem = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuItem>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuItem
            ref={ref}
            className={cn(
                "text-grey-100 dark:text-primary-foreground",
                "hover:bg-grey-80 dark:hover:bg-grey-50",
                "focus:bg-grey-80 dark:focus:bg-grey-50",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuItem.displayName = DropdownMenuItem.displayName;

const AppDropdownMenuCheckboxItem = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuCheckboxItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuCheckboxItem>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuCheckboxItem
            ref={ref}
            className={cn(
                "text-grey-100 dark:text-primary-foreground",
                "hover:bg-grey-80 dark:hover:bg-grey-50",
                "focus:bg-grey-80 dark:focus:bg-grey-50",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuCheckboxItem.displayName = DropdownMenuCheckboxItem.displayName;

const AppDropdownMenuRadioItem = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuRadioItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuRadioItem>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuRadioItem
            ref={ref}
            className={cn(
                "text-grey-100 dark:text-primary-foreground",
                "hover:bg-grey-80 dark:hover:bg-grey-50",
                "focus:bg-grey-80 dark:focus:bg-grey-50",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuRadioItem.displayName = DropdownMenuRadioItem.displayName;

const AppDropdownMenuLabel = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuLabel>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuLabel>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuLabel
            ref={ref}
            className={cn(
                "text-grey-100 dark:text-primary-foreground font-semibold",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuLabel.displayName = DropdownMenuLabel.displayName;

const AppDropdownMenuSeparator = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuSeparator>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuSeparator>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuSeparator
            ref={ref}
            className={cn(
                "bg-grey-80 dark:bg-grey-30",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuSeparator.displayName = DropdownMenuSeparator.displayName;

const AppDropdownMenuShortcut = memo(({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <DropdownMenuShortcut
            className={cn(
                "text-grey-60 dark:text-grey-70",
                className
            )}
            {...props}
        />
    )
});
AppDropdownMenuShortcut.displayName = "AppDropdownMenuShortcut";

const AppDropdownMenuGroup = memo(DropdownMenuGroup);
const AppDropdownMenuPortal = memo(DropdownMenuPortal);
const AppDropdownMenuSub = memo(DropdownMenuSub);
const AppDropdownMenuRadioGroup = memo(DropdownMenuRadioGroup);

const AppDropdownMenuSubTrigger = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuSubTrigger>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuSubTrigger>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuSubTrigger
            ref={ref}
            className={cn(
                "text-grey-100 dark:text-primary-foreground",
                "hover:bg-grey-80 dark:hover:bg-grey-50",
                "focus:bg-grey-80 dark:focus:bg-grey-50",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuSubTrigger.displayName = DropdownMenuSubTrigger.displayName;

const AppDropdownMenuSubContent = memo(forwardRef<
    React.ElementRef<typeof DropdownMenuSubContent>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuSubContent>
>(({ className, ...props }, ref) => {
    return (
        <DropdownMenuSubContent
            ref={ref}
            className={cn(
                "border-grey-80 dark:border-grey-30 bg-white dark:bg-grey-20",
                "shadow-lg",
                className
            )}
            {...props}
        />
    )
}));
AppDropdownMenuSubContent.displayName = DropdownMenuSubContent.displayName;

export {
    AppDropdownMenu,
    AppDropdownMenuTrigger,
    AppDropdownMenuContent,
    AppDropdownMenuItem,
    AppDropdownMenuCheckboxItem,
    AppDropdownMenuRadioItem,
    AppDropdownMenuLabel,
    AppDropdownMenuSeparator,
    AppDropdownMenuShortcut,
    AppDropdownMenuGroup,
    AppDropdownMenuPortal,
    AppDropdownMenuSub,
    AppDropdownMenuSubContent,
    AppDropdownMenuSubTrigger,
    AppDropdownMenuRadioGroup,
};
