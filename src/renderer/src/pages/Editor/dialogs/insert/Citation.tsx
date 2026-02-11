import AppButton from "@/components/app/app-button"
import AppLabel from "@/components/app/app-label"
import { AppSelectContent, AppSelectItem, AppSelectTrigger } from "@/components/app/app-select"
import List from "@/components/app/list"
import { Select, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { memo, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useEditor } from "@/pages/editor/hooks/use-editor"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AppSeparator from "@/components/app/app-separator"
import AppSearchBar from "@/components/app/app-search-bar"
import generateInlineCitationText from "@/utils/generateInlineCitationText"
import { DEFAULT_CITATION_STYLE } from "../setup/Bibliography/BibliographyConstants"
import { setCitationSelectedBibliographyId } from "@/pages/editor/provider"
import IconClose from "@/components/app/icons/IconClose"
import { AppDraggableDialog, AppDraggableDialogContent, AppDraggableDialogFooter, AppDraggableDialogHeader, AppDraggableDialogTitle } from "@/components/app/app-draggable-dialog"

type CitationProps = {
    open: boolean;
    onInsert: (citationStyle: CITATION_STYLES, citation: BibReference) => void;
    onClose?: () => void;
}

const Citation: React.FC<CitationProps> = ({ open, onInsert, onClose }) => {
    const [state, dispatch] = useEditor();
    const bibliographyList = useMemo(() => state.bibliographies || [], [state.bibliographies]);
    const currentBib = useMemo(() => bibliographyList.length > 0 ?
        state.citationSelectedBibliographyId ?
            bibliographyList.find(bib => bib.id === state.citationSelectedBibliographyId) :
            bibliographyList[0] :
        undefined,
        [
            bibliographyList,
            state.citationSelectedBibliographyId
        ]
    );

    const { t } = useTranslation();

    const handleCurrentBib = useCallback((bibId: string) => {
        dispatch(setCitationSelectedBibliographyId(bibId));
    }, [dispatch]);

    const handleCitations = useCallback((citation: BibReference) => {
        onInsert(currentBib?.citationStyle ?? DEFAULT_CITATION_STYLE, citation);
    }, [onInsert, currentBib]);

    return (
        <TooltipProvider>
            <AppDraggableDialog
                open={open}
                onOpenChange={onClose}
            >
                <AppDraggableDialogContent className={cn("max-w-[600px]")}>
                    <AppDraggableDialogHeader>
                        <div className="flex justify-between items-center">
                            <AppDraggableDialogTitle className={cn("text-md font-bold flex-1")}>
                                {t("citations.insertDialog.title", "##Add Citation##")}
                            </AppDraggableDialogTitle>
                            <AppButton
                                variant="transparent"
                                size="icon-sm"
                                onClick={onClose}
                                aria-label={t("dialog.close", "Close")}
                                className="ml-2">
                                <IconClose />
                            </AppButton>
                        </div>
                    </AppDraggableDialogHeader>
                    <div className="overflow-y-auto min-h-[20vh] h-full max-h-[45.8vh] flex flex-col gap-6 p-6">
                        <div className="flex flex-col gap-1">
                            <AppLabel className="text-secondary-30 dark:text-secondary-foreground text-[13px] font-semibold leading-[15px] px-2" htmlFor="bibliography">
                                {t("citations.insertDialog.bibliography", "Bibliography")}
                            </AppLabel>
                            <Select value={currentBib?.id} onValueChange={handleCurrentBib}>
                                <AppSelectTrigger id="bibliography" className="hover:bg-transparent active:bg-transparent focus-visible:ring-1 focus-visible:bg-transparent focus-visible:border-primary text-grey-10 dark:text-grey-90 hover:text-grey-10 hover:dark:text-grey-90 focus-visible:text-grey-10 focus-visible:dark:text-grey-90">
                                    <SelectValue />
                                </AppSelectTrigger>
                                <AppSelectContent>
                                    <List
                                        data={bibliographyList}
                                        renderItem={(item: Bibliography) => (
                                            <AppSelectItem
                                                key={item.id}
                                                value={item.id ?? ''}
                                                className="hover:cursor-pointer"
                                            >
                                                {item.name}
                                            </AppSelectItem>
                                        )}
                                    />
                                </AppSelectContent>
                            </Select>
                        </div>
                        <AppSeparator orientation="horizontal" />
                        <References citationStyle={currentBib?.citationStyle ?? DEFAULT_CITATION_STYLE} references={currentBib?.references ?? []} handleCitations={handleCitations} />
                    </div>
                    <AppDraggableDialogFooter className="sm:flex-row sm:justify-end sm:items-center">
                        <AppButton className="focus-visible:ring-0" key="save" size="dialog-footer-xs" variant="default" onClick={onClose}>
                            {t('buttons.close')}
                        </AppButton>
                    </AppDraggableDialogFooter>
                </AppDraggableDialogContent>
            </AppDraggableDialog>
        </TooltipProvider>
    )
}

export default memo(Citation);

const References = memo(({ citationStyle, references, handleCitations }: { citationStyle: CITATION_STYLES, references: BibReference[], handleCitations: (citationIndex: BibReference) => void }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState<string>('');

    const filterReferences = useMemo(() => {
        return references.filter(ref => JSON.stringify(Object.values(ref)).toLowerCase().match(new RegExp(search, 'gmi')))
    }, [
        references,
        search
    ]);

    const handleUse = useCallback((item?: BibReference) => {
        return () => {
            if (!item) return;
            handleCitations(item);
        }
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <AppLabel className="leading-6">
                {t('bibliography.references.title', "##References##")}
            </AppLabel>
            <AppSearchBar
                search={search}
                handleInputChange={setSearch}
                total={references.length}
                filtered={filterReferences.length}
            />
            <div className="flex flex-col gap-[2px]">
                <List
                    data={filterReferences}
                    renderItem={(item: BibReference) => (
                        <ReferenceItem key={item.id} title={generateInlineCitationText(item, citationStyle)} handleUse={handleUse(item)} />
                    )}
                />
            </div>
        </div>
    )
});

const ReferenceItem = memo(({ title, handleUse }: { title?: string, handleUse: () => void }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-row gap-2 items-center justify-between">
            <Tooltip>
                <TooltipTrigger
                    className={cn(
                        "text-[14px] leading-[18px]",
                        // Text color
                        "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-50 dark:[&>svg]:hover:!bg-transparent",

                        // Background color
                        "disabled:!bg-transparent hover:!bg-transparent dark:disabled:!bg-transparent dark:hover:!bg-transparent",
                        "max-w-[75%] overflow-hidden flex flex-col"
                    )}
                >
                    <AppLabel className="truncate w-full dark:text-grey-90 text-grey-10 leading-[inherit]">
                        {title}
                    </AppLabel>
                </TooltipTrigger>
                <TooltipContent>{title}</TooltipContent>
            </Tooltip>
            <div className="flex flex-row gap-2 items-center">
                <AppButton
                    variant="link"
                    size="xs"
                    shadow="none"
                    className="h-auto focus-visible:ring-0 bg-transparent hover:bg-transparent underline font-semibold text-grey-10 p-[2px]"
                    onClick={handleUse}
                >
                    {t("bibliography.references.use", "##Use##")}
                </AppButton>
            </div>
        </div>
    )
});