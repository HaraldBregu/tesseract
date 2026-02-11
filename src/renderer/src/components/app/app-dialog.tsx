import { forwardRef, memo } from "react";
import { DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, Dialog } from "../ui/dialog";
import { cn } from "@/lib/utils";

const AppDialog = memo(Dialog)

const AppDialogContent = forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => {
    return (
        <DialogContent
            ref={ref}
            className={cn(
                // TODO: Nice to have, try it
                // "hover:border-primary focus-visible:border-primary",
                // "focus:ring-primary focus:ring-offset-0",
                "!gap-0",
                "[&>button]:hidden", // Remove the default button
                "p-0", // Remove the default padding
                className
            )}
            {...props}
        />
    )
})
AppDialogContent.displayName = DialogContent.displayName;

const AppDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ref, ...restProps } = props as any;
    return (
        <DialogHeader
            className={cn(
                "border-b border-grey-80 dark:border-grey-30 p-3 max-h-12",
                className
            )}
            {...restProps}
        />
    )
}
AppDialogHeader.displayName = "AppDialogHeader";

const AppDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ref, ...restProps } = props as any;
    return (
        <DialogFooter
            className={cn(
                "border-t border-grey-80 dark:border-grey-30 p-3 max-h-16",
                className
            )}
            {...restProps}
        />
    )
}
AppDialogFooter.displayName = "AppDialogFooter";

const AppDialogTitle = forwardRef<
    React.ElementRef<typeof DialogTitle>,
    React.ComponentPropsWithoutRef<typeof DialogTitle>
>(({ className, ...props }, ref) => {
    return (
        <DialogTitle
            ref={ref}
            className={cn(
                "text-grey-100 text-center dark:text-grey-90",
                // "text-lg font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        />
    )
})
AppDialogTitle.displayName = DialogTitle.displayName;

const AppDialogDescription = forwardRef<
    React.ElementRef<typeof DialogDescription>,
    React.ComponentPropsWithoutRef<typeof DialogDescription>
>(({ className, ...props }, ref) => {
    return (
        <DialogDescription
            ref={ref}
            className={cn(
                "text-sm text-muted-foreground",
                className
            )}
            {...props}
        />
    )
})
AppDialogDescription.displayName = DialogDescription.displayName;

export {
    AppDialog,
    AppDialogContent,
    AppDialogHeader,
    AppDialogFooter,
    AppDialogTitle,
    AppDialogDescription,
};
