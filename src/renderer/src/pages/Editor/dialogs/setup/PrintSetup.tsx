import AppButton from "@/components/app/app-button"
import { AppDialog, AppDialogContent, AppDialogDescription, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog"
import List from "@/components/app/list"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import { visibleCommentsSelector } from "../../store/comment/comments.selector"
import IconClose from "@/components/app/icons/IconClose"
import { DEFAULT_PRINT_SECTION_SELECTED } from "@/utils/constants"
import { useDocumentAPI } from "@/hooks/use-electron"

interface PrintSetupProps {
    isOpen: boolean
    onCancel: () => void
    printOptions: PrintOptions
}

const PrintSetup: React.FC<PrintSetupProps> = ({ isOpen, onCancel, printOptions }) => {
    const { t } = useTranslation();

    const comments = useSelector(visibleCommentsSelector);
    const documentAPI = useDocumentAPI();

    const authorNames = useMemo(() => Array.from(new Set(comments?.map(comment => comment.author))), [comments]);
    
    const [hasTocSection, setHasTocSection] = useState<boolean>(false);
    const [hasIntroSection, setHasIntroSection] = useState<boolean>(false);
    const [hasBibliographySection, setHasBibliographySection] = useState<boolean>(false);

    const [sectionsSelected, setSectionsSelected] = useState<PrintSections>(DEFAULT_PRINT_SECTION_SELECTED);

    useEffect(() => {
        const loadData = async () => {
            const template = await documentAPI.getTemplate();
            setHasTocSection(template.layout.toc.visible);
            setHasIntroSection(template.layout.intro.visible);
            setHasBibliographySection(template.layout.bibliography.visible);
            setSectionsSelected({
                critical: 1,
                bibliography: template.layout.bibliography.visible ? 1 : 0,
                intro: template.layout.intro.visible ? 1 : 0,
                toc: template.layout.toc.visible ? 1 : 0
            });
        }
        loadData();
    }, [documentAPI, DEFAULT_PRINT_SECTION_SELECTED]);

    const [authorsSelected, setAuthorsSelected] = useState<string[]>([]);

    const handleSectionChecked = useCallback((section: string, selected: 0 | 1) => () => {
        setSectionsSelected({
            ...sectionsSelected,
            [section]: selected
        })
    }, [sectionsSelected]);

    const handleAuthorChecked = useCallback((section: string) => () => {
        if (authorsSelected.includes(section)) {
            setAuthorsSelected(authorsSelected.filter((s) => s !== section));
        } else {
            setAuthorsSelected([...authorsSelected, section]);
        }
    }, [authorsSelected]);

    const handlePrint = useCallback(() => {
        documentAPI.print({
            sections: sectionsSelected,
            commentAuthors: authorsSelected
        }, printOptions);
        onCancel();
    }, [sectionsSelected, authorsSelected, documentAPI, printOptions]);

    return (
        <AppDialog open={isOpen} onOpenChange={onCancel}>
            <AppDialogContent className={cn("max-w-[480px]")}>
                <AppDialogHeader>
                    <div className="flex justify-between items-center">
                        <AppDialogTitle className={cn("text-md font-bold flex-1")}>
                            {t(printOptions.export ? "printSetup.includeExport" : "printSetup.includePrint", "##Include in print##")}
                        </AppDialogTitle>
                        <AppButton
                            variant="transparent"
                            size="icon-sm"
                            onClick={onCancel}
                            aria-label={t("dialog.close", "Close")}
                            className="ml-2">
                            <IconClose />
                        </AppButton>
                    </div>
                    <AppDialogDescription />
                </AppDialogHeader>
                <PrintDialogContent>
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                        <AccordionItem value="item-1" aria-expanded="true">
                            <AccordionTrigger className={cn(
                                "rounded-sm p-1 mb-2 hover:no-underline hover:bg-primary hover:text-white hover:dark:bg-primary-70 hover:dark:text-grey-90",
                                "hover:[&>svg>*]:fill-white hover:[&>svg>*]:dark:fill-primary-70"
                            )}>
                                {t("printSetup.include", "##Include##")}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-2 pb-2">
                                <Label className="flex items-center gap-2 text-grey-10 dark:text-grey-80 text-[13px] font-semibold leading-[15px]">
                                    <Checkbox
                                        className="h-6 w-6"
                                        checked={sectionsSelected.toc === 1}
                                        onClick={handleSectionChecked("toc", sectionsSelected.toc === 0 ? 1 : 0)}
                                        disabled={!hasTocSection}
                                        id="toc"
                                        value="toc"
                                        name="sections"
                                    />
                                    <span>{t("printSetup.toc", "##Table of Contents##")}</span>
                                </Label>
                                <Label className="flex items-center gap-2 text-grey-10 dark:text-grey-80 text-[13px] font-semibold leading-[15px]">
                                    <Checkbox
                                        className="h-6 w-6"
                                        checked={sectionsSelected.intro === 1}
                                        onClick={handleSectionChecked("intro", sectionsSelected.intro === 0 ? 1 : 0)}
                                        disabled={!hasIntroSection}
                                        id="introduction"
                                        value="introduction"
                                        name="sections"
                                    />
                                    <span>{t("printSetup.introduction", "##Introduction##")}</span>
                                </Label>
                                <Label className="flex items-center gap-2 text-grey-10 dark:text-grey-80 text-[13px] font-semibold leading-[15px]">
                                    <Checkbox
                                        className="h-6 w-6"
                                        checked
                                        disabled={true}
                                        id="critical"
                                        value="critical"
                                        name="sections"
                                    />
                                    <span>{t("printSetup.critical", "##Critical##")}</span>
                                </Label>
                                <Label className="flex items-center gap-2 text-grey-10 dark:text-grey-80 text-[13px] font-semibold leading-[15px]">
                                    <Checkbox
                                        className="h-6 w-6"
                                        checked={sectionsSelected.bibliography === 1}
                                        onClick={handleSectionChecked("bibliography", sectionsSelected.bibliography === 0 ? 1 : 0)}
                                        disabled={!hasBibliographySection}
                                        id="bibliography"
                                        value="bibliography"
                                        name="sections"
                                    />
                                    <span>{t("printSetup.bibliography", "##Bibliography##")}</span>
                                </Label>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <SectionContainer>
                        <List
                            data={authorNames}
                            renderItem={(item: string) => (
                                <Control
                                    checked={authorsSelected.includes(item)}
                                    handleChecked={handleAuthorChecked(item)}
                                    label={item}
                                    key={item}
                                    groupName="authors"
                                />
                            )}
                        />
                    </SectionContainer>
                </PrintDialogContent>
                <AppDialogFooter className="sm:flex-row sm:justify-end gap-2 pr-4">
                    {/* <div className="flex">
                        <AppButton
                            variant="transparent"
                            size="icon"
                            className="focus-visible:ring-0"
                        >
                            <IconQuestionCircle />
                        </AppButton>
                    </div>
                    <div className="flex gap-2 ml-auto items-center"> */}
                    <AppButton key="cancel" size="dialog-footer-xs" variant="secondary" onClick={onCancel}>{t('buttons.cancel')}</AppButton>
                    <AppButton key="save" size="dialog-footer-xs" variant="default" onClick={handlePrint}>
                        {t(printOptions.export ? 'buttons.export' : 'buttons.print')}
                    </AppButton>
                    {/* </div> */}
                </AppDialogFooter>
            </AppDialogContent>
        </AppDialog>
    )
}

export default memo(PrintSetup)

const PrintDialogContent = memo(({ children }: { children: React.ReactNode }) => {
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
        <Label className="flex items-center gap-2 text-grey-10 dark:text-grey-80 text-[13px] font-semibold leading-[15px]">
            <Checkbox
                className="h-6 w-6"
                checked={checked}
                onClick={handleChecked}
                name={groupName}
            />
            <span>{label}</span>
        </Label>
    )
})