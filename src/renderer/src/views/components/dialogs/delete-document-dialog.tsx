import AppButton from "@/components/app/app-button"
import { AppDialog, AppDialogContent, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog"
import { t } from "i18next"
import { Loader2 } from "lucide-react"

interface DeleteDocumentDialogProps {
    open: boolean
    document: SharedDocument
    deleting: boolean
    onOpenChange?(open: boolean): void;
    onCancel(): void
    onConfirm(): void
}
const DeleteDocumentDialog = ({
    open,
    document,
    deleting,
    onOpenChange,
    onCancel,
    onConfirm,
}: DeleteDocumentDialogProps) => {

    return (
        <AppDialog
            open={open}
            onOpenChange={onOpenChange}>
            <AppDialogContent>
                <AppDialogHeader>
                    <AppDialogTitle>
                        {t("Delete document")}
                    </AppDialogTitle>
                </AppDialogHeader>
                <div className="p-4 space-y-4">
                    <p>{t('If you continue, you will delete permanently this file from cloud')}</p>
                    <p><strong>{document.fileName}</strong></p>
                </div>
                <AppDialogFooter>
                    <AppButton
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onCancel}>
                        {t("common.cancel")}
                    </AppButton>
                    <AppButton
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={onConfirm}>
                        {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {deleting ? t("Deleting") : t("Confirm")}
                    </AppButton>
                </AppDialogFooter>
            </AppDialogContent>
        </AppDialog>
    )
}

export default DeleteDocumentDialog;