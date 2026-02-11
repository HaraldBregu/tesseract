import AppButton from "@/components/app/app-button"
import { AppDialog, AppDialogContent, AppDialogDescription, AppDialogFooter, AppDialogTitle } from "@/components/app/app-dialog"

interface DeleteDialogProps {
    title: string,
    cancelButtonText: string,
    onCancel: () => void,
    confirmButtonText: string,
    onConfirm: () => void,
}

const DeleteDialog:React.FC<DeleteDialogProps> = ({
    title,
    cancelButtonText,
    onCancel,
    confirmButtonText,
    onConfirm
}) => {
    return (
        <AppDialog open={true} onOpenChange={onCancel}>
            <AppDialogContent className="max-w-xs">
                <AppDialogTitle className="hidden">
                    {title}
                </AppDialogTitle>
                <AppDialogDescription className="p-2 items-center text-center">
                    {title}
                </AppDialogDescription>
                <AppDialogFooter className="sm:flex-row sm:justify-end gap-2">
                    <AppButton key="cancel" size="dialog-footer-xs" variant="secondary" onClick={onCancel}>{cancelButtonText}</AppButton>
                    <AppButton key="save" size="dialog-footer-xs" variant="default" onClick={onConfirm}>{confirmButtonText}</AppButton>
                </AppDialogFooter>
            </AppDialogContent>
        </AppDialog>
    )
}

export default DeleteDialog;