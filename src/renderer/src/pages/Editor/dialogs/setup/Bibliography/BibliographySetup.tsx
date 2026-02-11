import AppButton from "@/components/app/app-button";
import { AppDialog, AppDialogContent, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog";
import IconCopy from "@/components/app/icons/IconCopy";
import IconDelete from "@/components/app/icons/IconDelete";
import IconPlusSimple from "@/components/app/icons/IconPlusSimple";
import List from "@/components/app/list";
import { cn } from "@/lib/utils";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEditor } from "../../../hooks/use-editor";
import { addBibliography, deleteBibliography, duplicateBibliography, replaceBibliography, updateBibliography } from "../../../provider";
import AppLabel from "@/components/app/app-label";
import { AppSelect, AppSelectContent, AppSelectItem, AppSelectTrigger, AppSelectValue } from "@/components/app/app-select";
import { CITATION_STYLES } from "@/utils/optionsEnums";
import AppSeparator from "@/components/app/app-separator";
import IconPencil from "@/components/app/icons/IconPencil";
import CreateReference from "./BibliographyAddReference";
import initialReference from "./InitialBibliography";
import DeleteDialog from "./BibliographyDeleteConfirmDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AppSearchBar from "@/components/app/app-search-bar";
import { BIB_NAME_MAX_LENGTH, DEFAULT_BIB_NAME, DEFAULT_CITATION_STYLE } from "./BibliographyConstants";
import { escapeRegExp } from "lodash-es";
import AppInput from "@/components/app/app-input";
import IconClose from "@/components/app/icons/IconClose";
import { useElectron } from "@/hooks/use-electron";

type BibliographySetupMode = "empty" | "update" | "create"

interface BibliographyProps {
    isOpen: boolean;
    onCancel: () => void;
}

export const BibliographySetup: React.FC<BibliographyProps> = ({ isOpen, onCancel }) => {
    const { t } = useTranslation();
    const electron = useElectron();
    const bibliographyUpdateRef = useRef<boolean>(false);
    const [mode, setMode] = useState<BibliographySetupMode>("empty");
    const [state, dispatch] = useEditor();
    const [deleteBibId, setDeleteBibId] = useState<string>('');
    const [deleteRefId, setDeleteRefId] = useState<string>('');
    const selectedBib = useRef<Bibliography | null>(null);
    const [bibName, setBibName] = useState<string>(DEFAULT_BIB_NAME);
    const [citationStyle, setCitationStyle] = useState<CITATION_STYLES>(DEFAULT_CITATION_STYLE);
    const [showAddReferenceModalConfig, setShowAddReferenceModalConfig] = useState<{
        show: boolean;
        reference: BibReference
    }>({
        show: false,
        reference: initialReference
    });
    const [references, setReferences] = useState<BibReference[]>([]);

    const selectedCitation = useMemo(() => CITATION_STYLES.find(style => style.id === citationStyle), [CITATION_STYLES, citationStyle]);

    const hasSameBib = useMemo(() => {
        if (bibName === '') return false;
        const bibliographyList = state.bibliographies || []
        const titleContent = bibName ?? ''
        const hasSame = bibliographyList.some(item => item.name === titleContent && item.id !== selectedBib.current?.id)
        return hasSame
    }, [state.bibliographies, bibName, selectedBib.current]);

    const hasMaxLength = useMemo(() => {
        return bibName.length > BIB_NAME_MAX_LENGTH
    }, [bibName]);

    const errorBibName = useMemo(() => {
        return hasSameBib ? t("bibliography.error.title", "##Bibliography already exists##") : hasMaxLength ? t("bibliography.error.maxLength", "##Bibliography name too long##") : null;
    }, [state.bibliographies, bibName, hasSameBib, hasMaxLength])

    const isDisabled = useMemo(() => {
        return hasSameBib || hasMaxLength || mode === 'empty' || (
            (
                mode === 'create' &&
                bibName === ''
            ) || (
                mode === 'update' &&
                (
                    selectedBib.current?.name === bibName &&
                    selectedBib.current?.citationStyle === citationStyle &&
                    JSON.stringify(references) === JSON.stringify(selectedBib.current?.references)
                )
            )
        )
    }, [selectedBib.current, bibName, citationStyle, references]);

    const handleSetMode = useCallback((mode: BibliographySetupMode) => {
        setMode(mode)
    }, []);

    const handleImportBibliography = useCallback(async () => {
        const importedBibliography = await electron.doc.importBibliography();
        if (!importedBibliography)
            return

        const duplicateCount = state.bibliographies?.filter(item => importedBibliography.name === item.name).length;

        if (duplicateCount === 0) {
            dispatch(addBibliography(importedBibliography))
            bibliographyUpdateRef.current = true;
            return
        }

        const result = await electron.system.showMessageBox(
            t("bibliography.importDialog.title", "##Bibliography already exists. Replace?##"),
            '',
            [
                t("buttons.yes", "##Yes##"),
                t("buttons.no", "##No##"),
                t("buttons.duplicate", "##Duplicate##"),
            ]
        )

        if (result.response === 0) {
            dispatch(replaceBibliography(importedBibliography))
            bibliographyUpdateRef.current = true;
        } else if (result.response === 2) {
            dispatch(duplicateBibliography(importedBibliography))
            bibliographyUpdateRef.current = true;
        }

    }, [state.bibliographies]);

    useEffect(() => {
        if (mode !== 'update') {
            selectedBib.current = {
                id: undefined,
                citationStyle: DEFAULT_CITATION_STYLE,
                name: '',
                references: []
            };
            setBibName(DEFAULT_BIB_NAME);
            setCitationStyle(DEFAULT_CITATION_STYLE);
            setReferences([]);
        }
    }, [mode]);

    useEffect(() => {
        if (!bibliographyUpdateRef.current) return;
        bibliographyUpdateRef.current = false;
        electron.doc.setBibliographies(state.bibliographies);
    }, [state.bibliographies, bibliographyUpdateRef.current]);

    const handleDelete = useCallback((bib: Bibliography) => {
        if (!bib.id) return;
        setDeleteBibId(bib.id);
    }, []);

    const handleDeleteBib = useCallback(() => {
        if (deleteBibId === '') return;
        setDeleteBibId('');
        dispatch(deleteBibliography(deleteBibId));
        bibliographyUpdateRef.current = true;
        setMode('empty');
    }, [deleteBibId]);

    const handleDeleteRef = useCallback(() => {
        if (deleteRefId === '') return;
        setDeleteRefId('');
        setReferences(references.filter(ref => ref.id !== deleteRefId));
    }, [references, deleteRefId]);

    const handleDuplicate = useCallback((bib: Bibliography) => {
        dispatch(duplicateBibliography(bib));
        bibliographyUpdateRef.current = true;
    }, [state.bibliographies]);

    const handleClick = useCallback((item: Bibliography) => {
        setMode("update")
        selectedBib.current = item;
        setBibName(item.name);
        setCitationStyle(item.citationStyle);
        setReferences(item.references);
    }, []);

    const handleBibNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setBibName(e.target.value);
    }, []);

    const handleUpdate = useCallback(() => {
        switch (mode) {
            case "update":
                selectedBib.current = {
                    id: selectedBib.current?.id ?? "",
                    citationStyle: citationStyle,
                    name: bibName,
                    references
                }
                dispatch(updateBibliography(selectedBib.current));
                bibliographyUpdateRef.current = true;
                break
            case "create":
                dispatch(addBibliography({
                    name: bibName,
                    citationStyle: citationStyle,
                    references: references
                }));
                setMode("empty");
                bibliographyUpdateRef.current = true;
                break
            default:
                break
        }
    }, [selectedBib.current, bibName, citationStyle, references, mode]);

    const handleShowAddReferenceModal = useCallback((ref: BibReference) => () => {
        setShowAddReferenceModalConfig({
            show: true,
            reference: ref
        });
    }, []);

    const handleOnCancelShowAddReferenceModal = useCallback(() => setShowAddReferenceModalConfig({
        show: false,
        reference: initialReference
    }), []);

    const handleAddBibRef = useCallback((reference: BibReference) => {
        const referenceList = !showAddReferenceModalConfig.reference?.id ?
            [...references, reference] :
            references.map(ref => ref.id === reference.id ? reference : ref);
        setReferences(referenceList);
        setShowAddReferenceModalConfig({
            show: false,
            reference: initialReference
        });
    }, [references, showAddReferenceModalConfig.reference]);

    return (
        <>
            <TooltipProvider>
                <AppDialog
                    open={isOpen}
                    onOpenChange={onCancel}
                >
                    <AppDialogContent className={cn("max-w-4xl")}>
                        <AppDialogHeader>
                            <div className="flex justify-between items-center">
                                <AppDialogTitle className={cn("text-md font-bold flex-1")}>
                                    {t("bibliography.title", "##Bibliography##")}
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
                        </AppDialogHeader>
                        <BibliographyDialogContent>
                            <BibliographyDialogLeftContent>
                                <BibliographyDialogLeftContentHeader>
                                    <AppButton
                                        variant="secondary"
                                        size="xs"
                                        shadow="none"
                                        className="focus-visible:ring-0"
                                        onClick={() => handleSetMode("create")}>
                                        <IconPlusSimple />
                                        {t("bibliography.create", "##Create##")}
                                    </AppButton>
                                    <AppButton
                                        variant="default"
                                        size="xs"
                                        shadow="none"
                                        className="focus-visible:ring-0"
                                        onClick={handleImportBibliography}>
                                        {t("bibliography.import", "##Import##")}
                                    </AppButton>
                                </BibliographyDialogLeftContentHeader>
                                <BibliographyDialogLeftContentBody>
                                    <BibliographyList
                                        items={state.bibliographies || []}
                                        itemSelected={selectedBib.current}
                                        onDelete={handleDelete}
                                        onDuplicate={handleDuplicate}
                                        onClick={handleClick}
                                    />
                                </BibliographyDialogLeftContentBody>
                            </BibliographyDialogLeftContent>
                            <BibliographyDialogRightContent>
                                {mode === "empty" &&
                                    <EmptyStateLayout title={t("bibliography.empty.title", "##Create a Bibliography before adding citations##")}>
                                        <AppButton
                                            variant="secondary"
                                            size="xs"
                                            shadow="none"
                                            className="focus-visible:ring-0"
                                            onClick={() => handleSetMode("create")}>
                                            <IconPlusSimple />
                                            {t("bibliography.create", "##Create##")}
                                        </AppButton>
                                        <AppButton
                                            variant="default"
                                            size="xs"
                                            shadow="none"
                                            className="focus-visible:ring-0"
                                            onClick={handleImportBibliography}>
                                            {t("bibliography.import", "##Import##")}
                                        </AppButton>
                                    </EmptyStateLayout>
                                }
                                {(mode === "update" || mode === "create") &&
                                    <EditLayout>
                                        <ControlContainer
                                            title={t('bibliography.name')}
                                            htmlFor="bibliographyName"
                                            error={errorBibName}
                                        >
                                            <AppInput
                                                className="text-grey-10 dark:text-grey-80 text-sm leading-[18px] font-normal py-1 px-2 h-8 focus-visible:border-primary"
                                                value={bibName}
                                                onChange={handleBibNameChange}
                                                autoFocus
                                                id="bibliographyName"
                                            />
                                        </ControlContainer>
                                        <ControlContainer
                                            title={t('bibliography.citation')}
                                            htmlFor="bibliographyCitationStyle"
                                        >
                                            <AppSelect value={citationStyle} onValueChange={(value) => setCitationStyle(value as CITATION_STYLES)}>
                                                <AppSelectTrigger id="bibliographyCitationStyle" className="hover:bg-transparent active:bg-transparent focus-visible:ring-1 focus-visible:bg-transparent focus-visible:border-primary text-grey-10 dark:text-grey-90 hover:text-grey-10 hover:dark:text-grey-90 focus-visible:text-grey-10 focus-visible:dark:text-grey-90">
                                                    <AppSelectValue>
                                                        {t(selectedCitation?.label ?? '')} ({t(selectedCitation?.subLabel ?? '')})
                                                    </AppSelectValue>
                                                </AppSelectTrigger>
                                                <AppSelectContent>
                                                    <List
                                                        data={CITATION_STYLES}
                                                        renderItem={(item: CitationStyle) => (
                                                            <CitationSelectItem
                                                                key={item.id}
                                                                value={item.id}
                                                                title={t(item.label)}
                                                                description={t(item.subLabel)}
                                                            />
                                                        )}
                                                    />
                                                </AppSelectContent>
                                            </AppSelect>
                                        </ControlContainer>
                                        <AppSeparator orientation="horizontal" />
                                        <References
                                            references={references}
                                            setDeleteRefId={setDeleteRefId}
                                            handleShowAddReferenceModal={handleShowAddReferenceModal}
                                        />
                                    </EditLayout>
                                }
                            </BibliographyDialogRightContent>
                        </BibliographyDialogContent>
                        <AppDialogFooter className="sm:flex-row sm:justify-end gap-2">
                            {/* <div className="flex">
                                <AppButton
                                    variant="transparent"
                                    size="icon">
                                    <IconQuestionCircle />
                                </AppButton>
                            </div>
                            <div className="flex gap-2 ml-auto items-center"> */}
                            <AppButton key="cancel" size="dialog-footer-xs" variant="secondary" onClick={onCancel}>{t('buttons.cancel')}</AppButton>
                            <AppButton key="save" size="dialog-footer-xs" variant="default" onClick={handleUpdate} disabled={isDisabled} aria-disabled={isDisabled}>
                                {t('buttons.done')}
                            </AppButton>
                            {/* </div> */}
                        </AppDialogFooter>
                    </AppDialogContent>
                </AppDialog>
            </TooltipProvider>
            {
                showAddReferenceModalConfig.show && <CreateReference
                    onCancel={handleOnCancelShowAddReferenceModal}
                    reference={showAddReferenceModalConfig.reference}
                    handleAddBibRef={handleAddBibRef}
                    isOpen={showAddReferenceModalConfig.show}
                />
            }
            {
                deleteBibId !== '' && <DeleteDialog
                    title={t("bibliography.delete", "##Delete##")}
                    cancelButtonText={t("buttons.no", "##No##")}
                    onCancel={() => setDeleteBibId('')}
                    confirmButtonText={t("buttons.yes", "##Yes##")}
                    onConfirm={handleDeleteBib}
                />
            }
            {
                deleteRefId !== '' && <DeleteDialog
                    title={t("bibliography.references.delete", "##Delete##")}
                    cancelButtonText={t("buttons.no", "##No##")}
                    onCancel={() => setDeleteRefId('')}
                    confirmButtonText={t("buttons.yes", "##Yes##")}
                    onConfirm={handleDeleteRef}
                />
            }
        </>
    )
}

type BibliographyListProps = {
    items: Bibliography[]
    itemSelected: Bibliography | null
    onDelete: (bib: Bibliography) => void
    onDuplicate: (bib: Bibliography) => void
    onClick: (bib: Bibliography) => void
}

const BibliographyList = ({
    items,
    itemSelected,
    onDelete,
    onDuplicate,
    onClick
}: BibliographyListProps) => {

    const { t } = useTranslation();

    const handleClick = useCallback((e: React.MouseEvent<HTMLLIElement>, bib: Bibliography) => {
        e.stopPropagation()
        onClick(bib)
    }, [])

    const handleDuplicate = useCallback((e: React.MouseEvent<HTMLButtonElement>, bib: Bibliography) => {
        e.stopPropagation()
        onDuplicate(bib)
    }, [])

    const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>, bib: Bibliography) => {
        e.stopPropagation()
        onDelete(bib)
    }, [])

    return (
        <ul className="flex gap-[2px] flex-col">
            <List
                data={items}
                renderItem={(item) => (
                    <li
                        key={item.id}
                        className="cursor-pointer"
                        onClick={(e) => handleClick(e, item)}>
                        <div className={cn(
                            "flex items-center justify-between w-full rounded-sm px-2 text-grey-10 dark:text-grey-90",
                            itemSelected?.id === item.id && "bg-primary text-white dark:bg-primary-70"
                        )}>
                            <div className="flex-1 min-w-0 mr-2 overflow-hidden">
                                <span
                                    className={cn(
                                        "text-sm text-inherit truncate text-ellipsis block",
                                    )}
                                >
                                    {item.name}
                                </span>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 ml-2 text-inherit">
                                <AppButton
                                    variant="transparent"
                                    size="icon"
                                    className="!text-inherit"
                                    onClick={(e) => handleDuplicate(e, item)}
                                    aria-label={t('buttons.duplicate')}
                                >
                                    <IconCopy />
                                </AppButton>
                                <AppButton
                                    variant="transparent"
                                    size="icon"
                                    className="!text-inherit"
                                    onClick={(e) => handleDelete(e, item)}
                                    aria-label={t('buttons.delete')}
                                >
                                    <IconDelete />
                                </AppButton>
                            </div>
                        </div>
                    </li>
                )}
            />
        </ul>
    )
}

const EmptyStateLayout = memo(({ title, children }: { title: React.ReactNode, children: React.ReactNode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <h1 className="font-bold">
                {title}
            </h1>
            <div className="flex gap-2">
                {children}
            </div>
        </div>
    )
})

const EditLayout = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-col gap-4 w-full flex-1">
                {children}
            </div>
        </div>
    )
})

const BibliographyDialogContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-row h-[50vh] w-full overflow-hidden">
            {children}
        </div>
    )
})

const BibliographyDialogLeftContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-1/3 border-r overflow-y-auto">
            <div className="flex flex-col h-full gap-2 px-[10px] pb-0 py-[13px]">
                {children}
            </div>
        </div>
    )
})

const BibliographyDialogLeftContentHeader = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="sticky top-0 pb-[6px] border-b">
            <div className="flex justify-end items-center">
                <div className="flex gap-2">
                    {children}
                </div>
            </div>
        </div>
    )
})

const BibliographyDialogLeftContentBody = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
    )
})

const BibliographyDialogRightContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-grey-10">
            {children}
        </div>
    )
})

const CitationSelectItem = memo(({ value, title, description }: { value: string; title: string, description: string }) => {
    return (
        <AppSelectItem value={value} className="hover:cursor-pointer hover:bg-transparent hover:text-grey-10 hover:dark:text-grey-90 active:bg-transparent">
            <div className="flex flex-col text-left hover:cursor-pointer">
                <AppLabel className="hover:cursor-pointer text-grey-10 dark:text-grey-90">{title}</AppLabel>
                <AppLabel className="hover:cursor-pointer text-grey-40 dark:text-grey-60">{description}</AppLabel>
            </div>
        </AppSelectItem>
    );
})

const References = memo(({ references, setDeleteRefId, handleShowAddReferenceModal }: { references: BibReference[], setDeleteRefId: (deleteRefId: string) => void, handleShowAddReferenceModal: (reference: BibReference) => () => void }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState<string>('');

    const filterReferences = useMemo(() => {
        return references.filter(ref => JSON.stringify(Object.values(ref)).toLowerCase().match(new RegExp(escapeRegExp(search), 'gmi')))
    }, [
        references,
        search
    ]);

    const handleDelete = useCallback((deleteRefId?: string) => {
        return () => {
            if (!deleteRefId) return;
            setDeleteRefId(deleteRefId);
        }
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between">
                <AppLabel className="dark:text-grey-90 text-grey-10">
                    {t('bibliography.references.title', "##References##")}
                </AppLabel>
                <AppButton
                    variant="outline"
                    size="xs"
                    shadow="none"
                    className="focus-visible:ring-0 focus-visible:border-primary"
                    onClick={handleShowAddReferenceModal(initialReference)}
                >
                    <IconPlusSimple />
                    {t("bibliography.references.addButton", "##Add Reference##")}
                </AppButton>
            </div>
            <AppSearchBar
                search={search}
                handleInputChange={setSearch}
                total={references.length}
                filtered={filterReferences.length}
            />
            <div className="flex flex-col gap-[2px] overflow-auto">
                <List
                    data={filterReferences}
                    renderItem={(item: BibReference) => (
                        <ReferenceItem key={item.id} author={item.author} title={item.title} date={item.date} handleDelete={handleDelete(item.id)} handleUpdate={handleShowAddReferenceModal(item)} />
                    )}
                />
            </div>
        </div>
    )
});

const ReferenceItem = memo(({ author, title, date, handleDelete, handleUpdate }: { author?: string[], title?: string, date?: string, handleDelete: () => void, handleUpdate: () => void }) => {
    const refTitle = useMemo(() => `${title}${title?.length ? ', ' : ''} ${author?.join(', ')}${author?.length ? ', ' : ''} ${date}`.trim(), [title, author, date]);

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
                        {refTitle}
                    </AppLabel>
                </TooltipTrigger>
                <TooltipContent>{refTitle}</TooltipContent>
            </Tooltip>
            <div className="flex flex-row gap-2 items-center">
                <AppButton
                    variant="transparent"
                    size="icon-sm"
                    shadow="none"
                    className="p-0 h-auto leading-none focus-visible:ring-0"
                    onClick={handleUpdate}
                >
                    <IconPencil />
                </AppButton>
                <AppButton
                    variant="transparent"
                    size="icon-sm"
                    shadow="none"
                    className="p-0 h-auto leading-none focus-visible:ring-0"
                    onClick={handleDelete}
                >
                    <IconDelete />
                </AppButton>
            </div>
        </div>
    )
});

interface ControlContainerProps {
    title: React.ReactNode,
    children: React.ReactNode,
    className?: string,
    htmlFor: string,
    error?: string | null
}

const ControlContainer: React.FC<ControlContainerProps> = memo(({ title, children, className, htmlFor, error }) => {
    return (
        <div className="flex flex-col gap-1">
            <div className={cn("flex flex-col gap-1", className)}>
                <AppLabel className="text-secondary-30 dark:text-secondary-foreground text-[13px] font-semibold leading-[15px] px-2" htmlFor={htmlFor}>
                    {title}
                </AppLabel>
                {children}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
});