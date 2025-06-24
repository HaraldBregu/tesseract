import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    title?: string;
    header?: ReactNode;
    actions?: ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
    titleClassName?: string;
    showCloseIcon?: boolean;
}

function Modal({
    isOpen,
    onOpenChange,
    children,
    title,
    header,
    actions,
    className = "",
    headerClassName = "",
    contentClassName = "",
    footerClassName = "",
    titleClassName = "",
    showCloseIcon = false,
}: ModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={cn(!showCloseIcon && "[&>button]:hidden", "p-0", className, "bg-grey-95 dark:bg-grey-10")}>
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