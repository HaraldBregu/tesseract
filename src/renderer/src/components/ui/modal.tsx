import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
    readonly isOpen: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onClose?: () => void;
    readonly children: ReactNode;
    readonly title?: string;
    readonly header?: ReactNode;
    readonly actions?: ReactNode;
    readonly className?: string;
    readonly headerClassName?: string;
    readonly contentClassName?: string;
    readonly footerClassName?: string;
    readonly titleClassName?: string;
    readonly showCloseIcon?: boolean;
    readonly preventOutsideClick?: boolean;
    readonly preventEscapeClose?: boolean;
}

function Modal({
    isOpen,
    onOpenChange,
    onClose,
    children,
    title,
    header,
    actions,
    className = "",
    headerClassName = "",
    contentClassName = "",
    footerClassName = "",
    titleClassName = "",
    showCloseIcon = true,
    preventOutsideClick = true,
    preventEscapeClose = false,
}: ModalProps) {
    const handleOpenChange = (open: boolean) => {
        if (!open && onClose) {
            onClose();
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                aria-describedby={undefined}
                className={cn(!showCloseIcon && "[&>button]:hidden", "p-0", className, "bg-grey-95 dark:bg-grey-10")}
                onInteractOutside={preventOutsideClick ? (e) => e.preventDefault() : undefined}
                onEscapeKeyDown={preventEscapeClose ? (e) => e.preventDefault() : onClose}
            >
                {(header || title) && (
                    <DialogHeader className={cn("border-b border-grey-80 dark:border-grey-50 p-3 max-h-12", headerClassName)}>
                        {title && <DialogTitle className={cn("text-grey-100 text-center text-[14px] font-[700]", titleClassName)}>
                            {title}
                        </DialogTitle>}
                    </DialogHeader>
                )}
                <div className={cn('p-4', contentClassName)}>
                    {children}
                </div>
                {actions && (
                    <DialogFooter className={cn("border-t border-grey-80 dark:border-grey-50 p-3  max-h-16", footerClassName)}>
                        {actions}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default Modal;