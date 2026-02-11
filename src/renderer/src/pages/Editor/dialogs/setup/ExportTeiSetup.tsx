import AppButton from "@/components/app/app-button"
import { AppDialog, AppDialogContent, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog"
import { cn } from "@/lib/utils"
import { memo, useCallback } from "react"
import { useTranslation } from "react-i18next"

interface ExportTeiSetupProps {
    isOpen: boolean
    onCancel: () => void
    onExport: () => void
}

const ExportTeiSetup: React.FC<ExportTeiSetupProps> = ({ isOpen, onCancel, onExport }) => {
    const { t } = useTranslation();

    const handleExport = useCallback(() => {
        onExport();
    }, [onExport]);

    return (
        <AppDialog
            open={isOpen}
        >
            <AppDialogContent className={cn("max-w-[480px]")}>
                <AppDialogHeader>
                    <AppDialogTitle className={cn("text-md font-bold")}>
                        {t("tei.dialog.title", "Esporta documento in XML/TEI")}
                    </AppDialogTitle>
                </AppDialogHeader>
                <ExportDialogContent>
                    <SectionContainer>
                        <div className="mb-4">
                            <p className="text-grey-10 dark:text-grey-80 text-[13px] font-semibold leading-[15px] mb-2">
                                {t("tei.dialog.description", "Il documento verrà esportato in formato XML/TEI. Seleziona 'Esporta' per procedere.")}
                            </p>
                        </div>
                    </SectionContainer>
                </ExportDialogContent>
                <AppDialogFooter className="sm:flex-row sm:justify-end gap-2 pr-4">
                    <AppButton key="cancel" size="dialog-footer-xs" variant="secondary" onClick={onCancel}>
                        {t('buttons.cancel')}
                    </AppButton>
                    <AppButton key="export" size="dialog-footer-xs" variant="default" onClick={handleExport}>
                        {t('buttons.export', 'Esporta')}
                    </AppButton>
                </AppDialogFooter>
            </AppDialogContent>
        </AppDialog>
    )
}

export default memo(ExportTeiSetup)

const ExportDialogContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col w-full overflow-auto p-5 gap-2">
            {children}
        </div>
    )
});

const SectionContainer = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col gap-2">
            {children}
        </div>
    )
});
