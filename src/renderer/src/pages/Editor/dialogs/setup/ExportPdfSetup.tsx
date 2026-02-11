import AppButton from "@/components/app/app-button"
import { AppDialog, AppDialogContent, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog"
import List from "@/components/app/list"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { memo, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import { visibleCommentsSelector } from "../../store/comment/comments.selector"
import AppLabel from "@/components/app/app-label"

interface ExportPdfSetupProps {
    isOpen: boolean
    onCancel: () => void
    onExport: (authorNames: string[]) => void
}

const ExportPdfSetup: React.FC<ExportPdfSetupProps> = ({ isOpen, onCancel, onExport }) => {
    const { t } = useTranslation();

    const comments = useSelector(visibleCommentsSelector);

    const authorNames = useMemo(() => Array.from(new Set(comments?.map(comment => comment.author))), [comments]);

    const [authorsSelected, setAuthorsSelected] = useState<string[]>([]);

    // Rimuovo hasSelected perché non è necessario selezionare autori per esportare

    const handleAuthorChecked = useCallback((authorName: string) => () => {
        if (authorsSelected.includes(authorName)) {
            setAuthorsSelected(authorsSelected.filter((s) => s !== authorName));
        } else {
            setAuthorsSelected([...authorsSelected, authorName]);
        }
    }, [authorsSelected]);

    const handleExport = useCallback(() => {
        onExport(authorsSelected);
    }, [authorsSelected, onExport]);

    return (
        <AppDialog
            open={isOpen}
        >
            <AppDialogContent className={cn("max-w-[480px]")}>
                <AppDialogHeader>
                    <AppDialogTitle className={cn("text-md font-bold")}>
                        {t("exportPdfSetup.title", "Seleziona autori da includere nell'export PDF")}
                    </AppDialogTitle>
                </AppDialogHeader>
                <ExportDialogContent>
                    <SectionContainer>
                        <div className="mb-4">
                            <p className="text-grey-10 dark:text-grey-80 text-[13px] font-semibold leading-[15px] mb-2">
                                {t("exportPdfSetup.selectAuthors", "Seleziona gli autori dei commenti da includere:")}
                            </p>
                        </div>
                        <List
                            data={authorNames}
                            renderItem={(item: string) => (
                                <Control
                                    checked={authorsSelected.includes(item)}
                                    handleChecked={handleAuthorChecked(item)}
                                    label={`${item}`}
                                    key={item}
                                    groupName="authors"
                                />
                            )}
                        />
                        {authorNames.length === 0 && (
                            <p className="text-grey-50 dark:text-grey-60 text-[13px] italic">
                                {t("exportPdfSetup.noAuthors", "Nessun autore di commenti disponibile")}
                            </p>
                        )}
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

export default memo(ExportPdfSetup)

const ExportDialogContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col h-[50vh] w-full overflow-auto p-5 gap-2">
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

const Control: React.FC<{
    checked: boolean;
    handleChecked: () => void;
    label: string;
    groupName: string;
}> = memo(({ groupName, checked, handleChecked, label }) => {
    return (
        <AppLabel className="flex items-center gap-2 text-grey-10 dark:text-grey-80 text-[13px] font-semibold leading-[15px]">
            <Checkbox
                className="h-6 w-6"
                checked={checked}
                onClick={handleChecked}
                name={groupName}
            />
            <span>{label}</span>
        </AppLabel>
    )
})
