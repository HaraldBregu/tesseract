import { cn } from "@/lib/utils"
import { ForwardedRef, forwardRef, Fragment, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useEditor } from "../../hooks/use-editor"
import { addSiglum, addSiglumListFromFile, deleteSiglum, duplicateSiglum, duplicateSiglumListFromFile, replaceSiglumListFromFile, setFontFamilySymbols, updateSiglum } from "../../provider"
import SiglumTextEditor, { HTMLSiglumTextEditorElement } from "@/lib/editor/siglum-text-editor"
import { useTranslation } from "react-i18next"
import AppSeparator from "@/components/app/app-separator"
import { AppDialog, AppDialogContent, AppDialogDescription, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/app/app-dialog"
import List from "@/components/app/list"
import AppButton from "@/components/app/app-button"
import IconBold from "@/components/app/icons/IconBold"
import IconItalic from "@/components/app/icons/IconItalic"
import IconUnderline from "@/components/app/icons/IconUnderline"
import IconBeta from "@/components/app/icons/IconBeta"
import IconCopy from "@/components/app/icons/IconCopy"
import IconDelete from "@/components/app/icons/IconDelete"
import IconClose from "@/components/app/icons/IconClose"
import IconPlusSimple from "@/components/app/icons/IconPlusSimple"
import { AppPopoverContent, AppPopover, AppPopoverTrigger } from "@/components/app/app-popover"
import IconSiglum from "@/components/app/icons/IconSiglum"
import AppLabel from "@/components/app/app-label"
import IconSubscript from "@/components/app/icons/IconSubscript"
import IconSuperscript from "@/components/app/icons/IconSuperscript"
import { AppSelect, AppSelectContent, AppSelectItem, AppSelectSeparator, AppSelectTrigger, AppSelectValue } from "@/components/app/app-select"
import ManuscriptTextEditor, { HTMLManuscriptTextEditorElement } from "@/lib/editor/manuscript-text-editor"
import DescriptionTextEditor, { HTMLDescriptionTextEditorElement } from "@/lib/editor/description-text-editor"
import { AppDropdownMenu, AppDropdownMenuTrigger, AppDropdownMenuContent, AppDropdownMenuItem } from "@/components/app/app-dropdown-menu"
import { useElectron } from "@/hooks/use-electron"
import { siglumFontSizes } from "@/utils/optionsEnums"
import { JSONContent } from "@tiptap/core"

type SiglumMode = "empty" | "update" | "create"

type SiglumProps = {
    open: boolean
    onCancel: () => void
    onExportSiglumList: () => void
}

export const Siglum = ({
    open,
    onCancel,
    onExportSiglumList,
}: SiglumProps) => {
    const { t } = useTranslation()
    const electron = useElectron();
    const [mode, setMode] = useState<SiglumMode>("empty")
    const [state, dispatch] = useEditor()
    const editorContainersRef = useRef<SiglumSetupEditorElement | null>(null)
    const siglumListUpdateRef = useRef<boolean>(false)
    const siglumListRef = useRef<SiglumListElement | null>(null)
    const siglumColor = useMemo(() => state.referenceFormat.sigla_color, [state.referenceFormat.sigla_color])
    const [textFormatting, setTextFormatting] = useState<TextFormatting | undefined>(undefined)
    const enabledExportButton = useMemo(() => state.siglumList && state.siglumList.length > 0, [state.siglumList])
    const siglumList = useMemo(() => state.siglumList, [state.siglumList])
    const [newSiglum, setNewSiglum] = useState<Siglum | null>(null)
    const [updatedSiglum, setUpdatedSiglum] = useState<Siglum | null>(null)

    useEffect(() => {
        if (!siglumListUpdateRef.current) return;
        siglumListUpdateRef.current = false;
        electron.doc.setSiglumList(siglumList);
    }, [siglumList, siglumListUpdateRef.current]);

    const hasSameSiglum = useMemo(() => {
        let value = false
        if (!siglumList) return false
        switch (mode) {
            case "update":
                if (!updatedSiglum)
                    return false
                value = siglumList.some(item =>
                    JSON.stringify(item.value?.content ?? []) === JSON.stringify(updatedSiglum.value?.content ?? [])
                    && item.id !== updatedSiglum.id)
                break
            case "create":
                if (!newSiglum)
                    return false
                value = siglumList.some(item =>
                    JSON.stringify(item.value?.content ?? []) === JSON.stringify(newSiglum.value?.content ?? [])
                    && item.id !== newSiglum.id)
                break
        }

        return value
    }, [siglumList, mode, newSiglum, updatedSiglum])

    const enabledSaveButton = useMemo(() => {
        let value = ""
        let enable = false

        switch (mode) {
            case "update": {
                if (!updatedSiglum)
                    return false
                value = updatedSiglum.value?.title ?? ''

                // Manuscript
                let hasManuscriptContent = false
                const manuscriptJsonContent = updatedSiglum.manuscripts.content as JSONContent
                const manuscriptJsonContentList = manuscriptJsonContent.content
                hasManuscriptContent = manuscriptJsonContentList?.[0].content !== undefined

                enable = value.length > 0 && hasManuscriptContent && !hasSameSiglum
                break
            }
            case "create": {
                if (!newSiglum)
                    return false

                value = newSiglum.value?.title ?? ''

                // Manuscript
                let hasManuscriptContent = false
                const manuscriptJsonContent = newSiglum.manuscripts.content as JSONContent
                const manuscriptJsonContentList = manuscriptJsonContent.content
                hasManuscriptContent = manuscriptJsonContentList?.[0].content !== undefined

                enable = value.length > 0 && hasManuscriptContent && !hasSameSiglum
                break
            }
        }

        return enable
    }, [mode, updatedSiglum, newSiglum, hasSameSiglum])

    const errorDataTitle = useMemo(() => {
        return hasSameSiglum ? t("siglum.errors.siglumExists", "##Siglum already exists##") : null
    }, [state.siglumList, hasSameSiglum])

    const handleSetMode = useCallback((mode: SiglumMode) => {
        setMode(mode)
        siglumListRef?.current?.unselectItem()
        editorContainersRef?.current?.setSiglum(null)
    }, [mode, editorContainersRef?.current])

    const handleDeleteSiglum = useCallback((siglum: Siglum) => {
        dispatch(deleteSiglum(siglum))
        siglumListUpdateRef.current = true;
        editorContainersRef?.current?.setSiglum(null)
        siglumListRef?.current?.unselectItem()
    }, [editorContainersRef.current, state.siglumList])

    const handleDuplicateSiglum = useCallback((siglum: Siglum) => {
        dispatch(duplicateSiglum(siglum))
        siglumListUpdateRef.current = true;
        editorContainersRef?.current?.setSiglum(null)
        siglumListRef?.current?.unselectItem()
    }, [editorContainersRef.current, state.siglumList])

    const handleUpdateSiglum = useCallback(() => {
        if (!updatedSiglum) return
        dispatch(updateSiglum(updatedSiglum))
        siglumListUpdateRef.current = true;
        setUpdatedSiglum(null)
    }, [updatedSiglum, dispatch])

    const handleCreateSiglum = useCallback(() => {
        if (!newSiglum) return
        dispatch(addSiglum(newSiglum))
        siglumListUpdateRef.current = true;
        editorContainersRef?.current?.setSiglum(null)
        siglumListRef?.current?.unselectItem()
        setNewSiglum(null)
    }, [newSiglum, dispatch])

    const handleClickSiglum = useCallback((item: Siglum) => {
        setMode("update")
        setTimeout(() => {
            editorContainersRef?.current?.setSiglum(item)
        }, 100)
    }, [mode, editorContainersRef?.current])

    const handleOnUpdateTextFormatting = useCallback((textFormatting: TextFormatting | undefined) => {
        setTextFormatting(textFormatting)
    }, [setTextFormatting])

    const handleSetFontFamily = useCallback((fontFamily: string) => {
        editorContainersRef?.current?.setFontFamily(fontFamily)
    }, [editorContainersRef?.current])

    const setFontSize = useCallback((fontSize: string) => {
        editorContainersRef?.current?.setFontSize(fontSize + "pt")
    }, [editorContainersRef?.current])

    const handleSetSuperscript = useCallback(() => {
        editorContainersRef?.current?.setSuperscript()
    }, [editorContainersRef?.current])

    const handleSetSubscript = useCallback(() => {
        editorContainersRef?.current?.setSubscript()
    }, [editorContainersRef?.current])

    const handleSetBold = useCallback(() => {
        editorContainersRef?.current?.setBold()
    }, [editorContainersRef?.current])

    const handleSetItalic = useCallback(() => {
        editorContainersRef?.current?.setItalic()
    }, [editorContainersRef?.current])

    const handleSetUnderline = useCallback(() => {
        editorContainersRef?.current?.setUnderline()
    }, [editorContainersRef?.current])

    const handleSelectFontFamilySymbolCode = useCallback((symbol: number) => {
        editorContainersRef?.current?.insertContent(String.fromCharCode(symbol))
    }, [editorContainersRef?.current])

    const handleSelectSiglum = useCallback((siglum: Siglum) => {
        editorContainersRef?.current?.insertSiglum(siglum, siglumColor)
    }, [editorContainersRef?.current, siglumColor])

    const handleOnUpdatedNewSiglum = useCallback((siglum: Siglum) => {
        setNewSiglum(siglum)
    }, [setNewSiglum])

    const handleOnUpdatedCurrentSiglum = useCallback((siglum: Siglum) => {
        setUpdatedSiglum(siglum)
    }, [setUpdatedSiglum])

    const handleImportSiglum = useCallback(async () => {
        const importedSiglum = await electron.doc.importSigla()

        const duplicateCount = importedSiglum.filter(item =>
            siglumList?.some(siglum => siglum.value.title === item.value.title)
        ).length;

        if (duplicateCount === 0) {
            dispatch(addSiglumListFromFile(importedSiglum))
            siglumListUpdateRef.current = true;
            return
        }

        const result = await electron.system.showMessageBox(
            t("siglum.importDialog.title", { count: duplicateCount }),
            '',
            [
                t("siglum.importDialog.replace", "###Replace###"),
                t("siglum.importDialog.cancel", "###Cancel###"),
                t("siglum.importDialog.keepBoth", "###Keep Both###"),
            ]
        )

        if (result.response === 0) {
            dispatch(replaceSiglumListFromFile(importedSiglum))
            siglumListUpdateRef.current = true;
        }
        else if (result.response === 2) {
            dispatch(duplicateSiglumListFromFile(importedSiglum))
            siglumListUpdateRef.current = true;
        }

    }, [siglumList])

    return (
        <AppDialog open={open} onOpenChange={onCancel} >
            <AppDialogContent className={cn("max-w-[900px]")}>
                <AppDialogHeader>
                    <div className="flex justify-between items-center">
                        <AppDialogTitle className={cn("text-md font-bold flex-1")}>
                            {t("siglum.title", "##Siglum##")}
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
                <SiglumDialogContent>
                    <SiglumDialogLeftContent>
                        <SiglumDialogLeftContentHeader>
                            <AppButton
                                variant="secondary"
                                size="xs"
                                onClick={() => handleSetMode("create")}>
                                <IconPlusSimple />
                                {t("siglum.create", "##Create##")}
                            </AppButton>
                            <AppButton
                                variant="default"
                                size="xs"
                                onClick={handleImportSiglum}>
                                {t("siglum.import", "##Import##")}
                            </AppButton>
                        </SiglumDialogLeftContentHeader>
                        <SiglumDialogLeftContentBody>
                            <SiglumList
                                ref={siglumListRef}
                                items={state.siglumList || []}
                                onDelete={handleDeleteSiglum}
                                onDuplicate={handleDuplicateSiglum}
                                onClick={handleClickSiglum}
                            />
                        </SiglumDialogLeftContentBody>
                    </SiglumDialogLeftContent>
                    <SiglumDialogRightContent>
                        {mode === "empty" &&
                            <EmptyStateLayout title={t("siglum.empty.title", "##Create sigla before adding notes##")}>
                                <AppButton
                                    variant="secondary"
                                    size="xs"
                                    onClick={() => handleSetMode("create")}>
                                    <IconPlusSimple />
                                    {t("siglum.create", "##Create##")}
                                </AppButton>
                                <AppButton
                                    variant="default"
                                    size="xs"
                                    onClick={handleImportSiglum}>
                                    {t("siglum.import", "##Import##")}
                                </AppButton>
                            </EmptyStateLayout>
                        }
                        {(mode === "update" || mode === "create") &&
                            <EditSiglumLayout>
                                <SiglumSetupToolbar
                                    fontFamily={textFormatting?.fontFamily || "Times New Roman"}
                                    fontSize={textFormatting?.fontSize || "12"}
                                    superscript={textFormatting?.superscript || false}
                                    subscript={textFormatting?.subscript || false}
                                    bold={textFormatting?.bold || false}
                                    italic={textFormatting?.italic || false}
                                    underline={textFormatting?.underline || false}
                                    siglumList={state.siglumList || []}
                                    onSetFontFamily={handleSetFontFamily}
                                    onSetFontSize={setFontSize}
                                    onSetSuperscript={handleSetSuperscript}
                                    onSetSubscript={handleSetSubscript}
                                    onSetBold={handleSetBold}
                                    onSetItalic={handleSetItalic}
                                    onSetUnderline={handleSetUnderline}
                                    onSelectFontFamilySymbolCode={handleSelectFontFamilySymbolCode}
                                    onSelectSiglum={handleSelectSiglum}
                                />
                                <SiglumSetupEditorContainer
                                    ref={editorContainersRef}
                                    errorDataTitle={errorDataTitle}
                                    onUpdateTextFormatting={handleOnUpdateTextFormatting}
                                    onUpdatedNewSiglum={handleOnUpdatedNewSiglum}
                                    onUpdatedCurrentSiglum={handleOnUpdatedCurrentSiglum}
                                />
                            </EditSiglumLayout>
                        }
                    </SiglumDialogRightContent>
                </SiglumDialogContent>
                <AppDialogFooter className="sm:flex-row sm:justify-end">
                    <AppButton
                        variant="secondary"
                        size="dialog-footer-xs"
                        onClick={onCancel}>
                        {t("siglum.cancel", "##Cancel##")}
                    </AppButton>
                    <AppButton
                        variant="secondary"
                        size="dialog-footer-xs"
                        disabled={!enabledExportButton}
                        onClick={onExportSiglumList}>
                        {t("siglum.export", "##Export##")}
                    </AppButton>
                    {mode === "update" && (
                        <AppButton
                            variant="default"
                            size="dialog-footer-xs"
                            disabled={!enabledSaveButton}
                            onClick={handleUpdateSiglum}>
                            {t("siglum.save", "##Save##")}
                        </AppButton>
                    )}
                    {mode === "create" && (
                        <AppButton
                            variant="default"
                            size="dialog-footer-xs"
                            disabled={!enabledSaveButton}
                            onClick={handleCreateSiglum}>
                            {t("siglum.save", "##Save##")}
                        </AppButton>
                    )}
                    {/* </div> */}
                </AppDialogFooter>
            </AppDialogContent>
        </AppDialog>
    )
}

type SiglumListElement = {
    unselectItem: () => void
}

type SiglumListProps = {
    items: Siglum[]
    onDelete: (siglum: Siglum) => void
    onDuplicate: (siglum: Siglum) => void
    onClick: (siglum: Siglum) => void
}

const SiglumList = forwardRef<SiglumListElement, SiglumListProps>(({
    items,
    onDelete,
    onDuplicate,
    onClick
}, ref) => {
    const [selectedSiglum, setSelectedSiglum] = useState<Siglum | null>(null)

    const handleClick = useCallback((e: React.MouseEvent<HTMLLIElement>, siglum: Siglum) => {
        e.stopPropagation()
        setSelectedSiglum(siglum)
        onClick(siglum)
    }, [onClick, selectedSiglum])

    const handleDuplicate = useCallback((e: React.MouseEvent<HTMLButtonElement>, siglum: Siglum) => {
        e.stopPropagation()
        onDuplicate(siglum)
    }, [onDuplicate])

    const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>, siglum: Siglum) => {
        e.stopPropagation()
        onDelete(siglum)
    }, [onDelete])

    useImperativeHandle(ref, () => ({
        unselectItem: () => {
            setSelectedSiglum(null)
        }
    }))

    const getSiglumContent = useCallback((contentHtml: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const paragraph = tempDiv.querySelector('p');
        const inner = paragraph ? paragraph.innerHTML : '';
        return `<div style="height:60px;display:flex;align-items:center;">${inner}</div>`;
    }, []);

    return (
        <ul>
            <List
                data={items}
                renderItem={(item) => (
                    <li
                        key={item.id}
                        className="p-2 cursor-pointer" // Increase vertical padding
                        onClick={(e) => handleClick(e, item)}>
                        <div className={cn(
                            "flex items-center justify-between w-full rounded-sm px-2", // add a minimum height
                            selectedSiglum?.id === item.id && "bg-primary dark:bg-grey-30"
                        )}>
                            <div className="flex-1 items-center min-w-0 mr-2 overflow-hidden">
                                <span
                                    className={cn(
                                        "text-base text-gray-900 dark:text-grey-80 truncate text-ellipsis block", // make font larger
                                        selectedSiglum?.id === item.id && "text-white dark:text-grey-90"
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: getSiglumContent(item.value.contentHtml)
                                    }}
                                />
                            </div>
                            <div className={cn("flex gap-2 flex-shrink-0 ml-2")}>
                                <AppButton
                                    variant={selectedSiglum?.id === item.id ? "transparent-selected" : "transparent"}
                                    size="icon-sm"
                                    tabIndex={10}
                                    onClick={(e) => handleDuplicate(e, item)}
                                    aria-pressed={false}
                                    aria-label="copy">
                                    <IconCopy />
                                </AppButton>
                                <AppButton
                                    variant={selectedSiglum?.id === item.id ? "transparent-selected" : "transparent"}
                                    size="icon-sm"
                                    tabIndex={10}
                                    onClick={(e) => handleDelete(e, item)}
                                    aria-pressed={false}
                                    aria-label="delete">
                                    <IconDelete />
                                </AppButton>
                            </div>
                        </div>
                    </li>
                )}
            />
        </ul>
    )
})

type SiglumSetupToolbarProps = {
    fontFamily: string
    fontSize: string
    superscript: boolean
    subscript: boolean
    bold: boolean
    italic: boolean
    underline: boolean
    siglumList: Siglum[]
    onSetFontFamily: (fontFamily: string) => void
    onSetFontSize: (fontSize: string) => void
    onSetSuperscript: () => void
    onSetSubscript: () => void
    onSetBold: () => void
    onSetItalic: () => void
    onSetUnderline: () => void
    onSelectFontFamilySymbolCode: (code: number) => void
    onSelectSiglum: (siglum: Siglum) => void
}

const SiglumSetupToolbar = memo(({
    fontFamily,
    fontSize,
    superscript,
    subscript,
    bold,
    italic,
    underline,
    siglumList,
    onSetFontFamily,
    onSetFontSize,
    onSetSuperscript,
    onSetSubscript,
    onSetBold,
    onSetItalic,
    onSetUnderline,
    onSelectFontFamilySymbolCode,
    onSelectSiglum,
}: SiglumSetupToolbarProps) => {
    const { t } = useTranslation()
    const [state, dispatch] = useEditor()
    const fontFamilyList = useMemo(() => state.fontFamilyList, [state.fontFamilyList]);
    const fontFamilySymbols = useMemo(() => state.fontFamilySymbols, [state.fontFamilySymbols]);
    const [currentFontFamily, setCurrentFontFamily] = useState<string>(fontFamily)
    const fontSizeValue = fontSize.replace('pt', '')

    const handleSelectFontFamily = useCallback(async (fontFamily: string) => {
        const symbols = await window.system.getSymbols(fontFamily)
        dispatch(setFontFamilySymbols(symbols))
        onSetFontFamily(fontFamily)
    }, [fontFamily])

    useEffect(() => {
        setCurrentFontFamily(fontFamily)
    }, [fontFamily])

    return (
        <SiglumSetupToolbarLayout>
            <div className="flex gap-2 items-center h-full">
                <div className={`flex items-center space-x-2 transition-transform duration-300 h-full`}>
                    <AppSelect
                        value={currentFontFamily}
                        onValueChange={handleSelectFontFamily}>
                        <AppSelectTrigger
                            tabIndex={1}
                            aria-label="Font Family"
                            className="py-0 border-none min-w-[140px]"
                            style={{ fontFamily: currentFontFamily }}>
                            <AppSelectValue />
                        </AppSelectTrigger>
                        <AppSelectContent>
                            <List
                                data={fontFamilyList}
                                renderItem={(ff, index) => (
                                    <Fragment
                                        key={`font-family-${index}`}>
                                        {!index ? null : <AppSelectSeparator />}
                                        {ff && <AppSelectItem
                                            value={ff}
                                            style={{ fontFamily: ff }}>
                                            {ff}
                                        </AppSelectItem>}
                                    </Fragment>
                                )}
                            />
                        </AppSelectContent>
                    </AppSelect>
                </div>
                <div className={`flex items-center space-x-2 transition-transform duration-300 h-full`}>
                    <AppSelect
                        value={fontSizeValue}
                        onValueChange={onSetFontSize}>
                        <AppSelectTrigger
                            tabIndex={1}
                            aria-label="Font Size"
                            className="py-0 border-none min-w-[60px]">
                            <AppSelectValue />
                        </AppSelectTrigger>
                        <AppSelectContent>
                            <List
                                data={siglumFontSizes}
                                renderItem={(size, index) => (
                                    <Fragment key={`font-size-${index}`}>
                                        {!index ? null : <AppSelectSeparator />}
                                        {size !== undefined && size !== null && (
                                            <AppSelectItem value={size.toString()}>
                                                {size}
                                            </AppSelectItem>
                                        )}
                                    </Fragment>
                                )}
                            />
                        </AppSelectContent>
                    </AppSelect>
                </div>
                <AppSeparator orientation="vertical" className="h-4 border-grey-80 dark:border-grey-40" />
                <AppButton
                    variant={superscript ? "toolbar-selected" : 'toolbar'}
                    aria-label={t('toolbar.subscript')}
                    size="icon-xs"
                    rounded="xs"
                    tabIndex={2}
                    onClick={onSetSuperscript}
                    aria-pressed={superscript}>
                    <IconSuperscript />
                </AppButton>
                <AppButton
                    variant={subscript ? "toolbar-selected" : 'toolbar'}
                    aria-label={t('toolbar.subscript')}
                    size="icon-xs"
                    rounded="xs"
                    tabIndex={3}
                    onClick={onSetSubscript}
                    aria-pressed={subscript}>
                    <IconSubscript />
                </AppButton>
                <AppButton
                    variant={bold ? "toolbar-selected" : 'toolbar'}
                    aria-label={t('toolbar.bold')}
                    size="icon-xs"
                    rounded="xs"
                    tabIndex={4}
                    onClick={onSetBold}
                    aria-pressed={bold}>
                    <IconBold />
                </AppButton>
                <AppButton
                    variant={italic ? "toolbar-selected" : 'toolbar'}
                    aria-label={t('toolbar.bold')}
                    size="icon-xs"
                    rounded="xs"
                    tabIndex={5}
                    onClick={onSetItalic}
                    aria-pressed={italic}>
                    <IconItalic />
                </AppButton>
                <AppButton
                    variant={underline ? "toolbar-selected" : 'toolbar'}
                    aria-label={t('toolbar.bold')}
                    size="icon-xs"
                    rounded="xs"
                    tabIndex={6}
                    onClick={onSetUnderline}
                    aria-pressed={underline}>
                    <IconUnderline />
                </AppButton>
                <AppSeparator orientation="vertical" className="h-4 border-grey-80 dark:border-grey-40" />
                <AppPopover modal={true}>
                    <AppPopoverTrigger
                        className={cn(
                            "leading-none",
                            "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-10 dark:[&>svg]:hover:!bg-transparent",
                            "disabled:!bg-transparent hover:!bg-transparent dark:disabled:!bg-transparent dark:hover:!bg-transparent",
                        )}
                        disabled={fontFamilySymbols.length === 0}>
                        <AppButton
                            asChild
                            variant='toolbar'
                            size="icon-xs"
                            rounded="xs"
                            tabIndex={7}>
                            <IconBeta />
                        </AppButton>
                    </AppPopoverTrigger>
                    <AppPopoverContent className="w-80 max-h-[300px] overflow-y-scroll">
                        <List
                            data={fontFamilySymbols}
                            renderItem={({ code, name }) => (
                                <AppButton
                                    key={`${code}-${name}`}
                                    variant="special-character-popover"
                                    rounded="none"
                                    className="h-[40px] w-[40px] px-[15px] shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 rounded-none text-secondary border-grey-85 hover:bg-grey-80 disabled:text-grey"
                                    size="rect-sm"
                                    onClick={() => onSelectFontFamilySymbolCode(code)}>
                                    {String.fromCharCode(code)}
                                </AppButton>
                            )}
                        />
                    </AppPopoverContent>
                </AppPopover>
                <AppSeparator orientation="vertical" className="h-4 border-grey-80 dark:border-grey-40" />
                <AppDropdownMenu>
                    <AppDropdownMenuTrigger
                        className={cn(
                            "leading-none",
                            // Text color
                            "[&>svg]:disabled:!text-grey-60 [&>svg]:disabled:hover:!bg-transparent dark:[&>svg]:disabled:!text-grey-10 dark:[&>svg]:hover:!bg-transparent",

                            // Background color
                            "disabled:!bg-transparent hover:!bg-transparent dark:disabled:!bg-transparent dark:hover:!bg-transparent",
                        )}
                        disabled={siglumList.length === 0}>
                        <AppButton
                            asChild
                            variant='toolbar'
                            size="icon-xs"
                            rounded="xs"
                            tabIndex={8}>
                            <IconSiglum />
                        </AppButton>
                    </AppDropdownMenuTrigger>
                    <AppDropdownMenuContent className="w-40">
                        <List
                            data={siglumList}
                            renderItem={(item) => (
                                <AppDropdownMenuItem
                                    key={item.value.title}
                                    onClick={() => onSelectSiglum(item)}
                                    dangerouslySetInnerHTML={{ __html: item.value.contentHtml }}
                                />
                            )}
                        />
                    </AppDropdownMenuContent>
                </AppDropdownMenu>
            </div>
        </SiglumSetupToolbarLayout>
    )
})

type SiglumSetupEditorElement = {
    setSiglum: (item: Siglum | null) => void
    insertSiglum: (item: Siglum, highlightColor: string) => void
    setFontFamily: (fontFamily: string) => void
    setFontSize: (fontSize: string) => void
    setSuperscript: () => void
    setSubscript: () => void
    setBold: () => void
    setItalic: () => void
    setUnderline: () => void
    insertContent: (content: string) => void
}

type SiglumSetupEditorContainerProps = {
    errorDataTitle: string | null
    onUpdateTextFormatting: (textFormatting: TextFormatting | undefined) => void
    onUpdatedNewSiglum: (data: Siglum) => void
    onUpdatedCurrentSiglum: (data: Siglum) => void
}

const SiglumSetupEditorContainer = forwardRef(({
    errorDataTitle,
    onUpdateTextFormatting,
    onUpdatedNewSiglum,
    onUpdatedCurrentSiglum,
}: SiglumSetupEditorContainerProps,
    ref: ForwardedRef<SiglumSetupEditorElement>) => {
    const { t } = useTranslation()
    const siglumRef = useRef<Siglum | null>(null)
    const titleEditorRef = useRef<HTMLSiglumTextEditorElement>(null)
    const manuscriptsEditorRef = useRef<HTMLManuscriptTextEditorElement>(null)
    const descriptionEditorRef = useRef<HTMLDescriptionTextEditorElement>(null)
    const [currentEditorType, setCurrentEditorType] = useState<"title" | "manuscripts" | "description" | null>(null)
    const [currentEditorRef, setCurrentEditorRef] = useState<HTMLSiglumTextEditorElement | HTMLManuscriptTextEditorElement | HTMLDescriptionTextEditorElement | null>(null)

    const handleUpdateContent = useCallback(() => {
        const value: SiglumValue = {
            title: titleEditorRef.current?.getText() || "",
            content: titleEditorRef.current?.getJSON() || "",
            contentHtml: titleEditorRef.current?.getHTML() || ""
        }

        const manuscripts: SiglumManuscripts = {
            title: manuscriptsEditorRef.current?.getText() || "",
            content: manuscriptsEditorRef.current?.getJSON() || "",
            contentHtml: manuscriptsEditorRef.current?.getHTML() || ""
        }

        const description: SiglumDescription = {
            title: descriptionEditorRef.current?.getText() || "",
            content: descriptionEditorRef.current?.getJSON() || "",
            contentHtml: descriptionEditorRef.current?.getHTML() || ""
        }

        if (siglumRef.current?.id) {
            onUpdatedCurrentSiglum({
                id: siglumRef.current?.id ?? "",
                value,
                manuscripts,
                description
            })
        } else {
            onUpdatedNewSiglum({
                id: crypto.randomUUID(),
                value,
                manuscripts,
                description
            })
        }

    }, [
        titleEditorRef.current,
        manuscriptsEditorRef.current,
        descriptionEditorRef.current,
        siglumRef.current,
        onUpdatedNewSiglum,
        onUpdatedCurrentSiglum,
    ])

    useImperativeHandle(ref, () => ({
        setSiglum: (item: Siglum | null) => {
            siglumRef.current = item
            titleEditorRef.current?.setContent(item?.value.content)
            manuscriptsEditorRef.current?.setContent(item?.manuscripts.content)
            descriptionEditorRef.current?.setContent(item?.description.content)
        },
        insertSiglum: (item: Siglum, highlightColor: string) => {
            if (currentEditorType === "title") {
                titleEditorRef.current?.insertContent(item?.value.content)
            } else if (currentEditorType === "manuscripts") {
                manuscriptsEditorRef.current?.insertSiglum(item, highlightColor)
            } else if (currentEditorType === "description") {
                descriptionEditorRef.current?.insertSiglum(item, highlightColor)
            }
        },
        setFontFamily: (fontFamily: string) => {
            currentEditorRef?.setFontFamily(fontFamily)
        },
        setFontSize: (fontSize: string) => {
            currentEditorRef?.setFontSize(fontSize)
        },
        setSuperscript: () => {
            currentEditorRef?.setSuperscript()
        },
        setSubscript: () => {
            currentEditorRef?.setSubscript()
        },
        setBold: () => {
            currentEditorRef?.setBold()
        },
        setItalic: () => {
            currentEditorRef?.setItalic()
        },
        setUnderline: () => {
            currentEditorRef?.setUnderline()
        },
        insertContent: (content: string) => {
            currentEditorRef?.insertContent(content)
        }
    }))

    const handleOnFocusTitleEditor = useCallback(() => {
        setCurrentEditorType("title")
        setCurrentEditorRef(titleEditorRef.current)
        const textFormatting = titleEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
    }, [titleEditorRef.current])

    const handleOnSelectionUpdateTitleEditor = useCallback(() => {
        const textFormatting = titleEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
    }, [titleEditorRef.current])

    const handleOnUpdateTitleEditor = useCallback(() => {
        const textFormatting = titleEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
        handleUpdateContent()
    }, [titleEditorRef.current])

    const handleOnFocusManuscriptsEditor = useCallback(() => {
        setCurrentEditorType("manuscripts")
        setCurrentEditorRef(manuscriptsEditorRef.current)
    }, [manuscriptsEditorRef.current])

    const handleOnSelectionUpdateManuscriptsEditor = useCallback(() => {
        const textFormatting = manuscriptsEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
    }, [manuscriptsEditorRef.current])

    const handleOnUpdateManuscriptsEditor = useCallback(() => {
        const textFormatting = manuscriptsEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
        handleUpdateContent()
    }, [manuscriptsEditorRef.current])

    const handleOnFocusDescriptionEditor = useCallback(() => {
        setCurrentEditorType("description")
        setCurrentEditorRef(descriptionEditorRef.current)
    }, [descriptionEditorRef.current])

    const handleOnSelectionUpdateDescriptionEditor = useCallback(() => {
        const textFormatting = descriptionEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
    }, [descriptionEditorRef.current])

    const handleOnUpdateDescriptionEditor = useCallback(() => {
        const textFormatting = descriptionEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
        handleUpdateContent()
    }, [descriptionEditorRef.current])

    const handleOnCreateDescriptionEditor = useCallback(() => {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            await delay(100);
            titleEditorRef.current?.setFocus()
        })();
    }, [titleEditorRef.current])

    const remainingCharactersTitle = 30 - (titleEditorRef.current?.getText().length ?? 0)
    const remainingCharactersManuscripts = 5000 - (manuscriptsEditorRef.current?.getText().length ?? 0)
    const remainingCharactersDescription = 10000 - (descriptionEditorRef.current?.getText().length ?? 0)

    return (
        <div className="px-6 pb-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <SiglumTextEditor
                    ref={titleEditorRef}
                    className="p-2 rounded-sm border-2 !bg-white dark:!bg-grey-10"
                    characterCountLimit={30}
                    content={siglumRef.current?.value?.contentHtml}
                    defaultFontFamily="Times New Roman"
                    defaultFontSize="12pt"
                    onFocus={handleOnFocusTitleEditor}
                    onSelectionUpdate={handleOnSelectionUpdateTitleEditor}
                    onUpdate={handleOnUpdateTitleEditor}
                />
                {!errorDataTitle && <p className="px-2 text-xs">{remainingCharactersTitle} {t("siglum.messages.charactersRemaining", "#characters remaining")}</p>}
                {errorDataTitle && <p className="text-red-500 text-xs">{errorDataTitle}</p>}
            </div>
            <div className="flex flex-col gap-2 h-32">
                <AppLabel className="text-xs font-bold ml-2">
                    {t("siglum.manuscripts", "##Manuscripts*##")}
                </AppLabel>
                <ManuscriptTextEditor
                    ref={manuscriptsEditorRef}
                    className="p-2 rounded-sm border-2 h-full !bg-white dark:!bg-grey-10 max-h-[100px]"
                    characterCountLimit={5000}
                    content={siglumRef.current?.manuscripts.content}
                    onFocus={handleOnFocusManuscriptsEditor}
                    onSelectionUpdate={handleOnSelectionUpdateManuscriptsEditor}
                    onUpdate={handleOnUpdateManuscriptsEditor}
                />
                {<p className="px-2 text-xs">{remainingCharactersManuscripts} {t("siglum.messages.charactersRemaining", "#characters remaining")}</p>}
            </div>
            <div className="flex flex-col gap-2 h-32">
                <AppLabel className="text-xs font-bold ml-2">
                    {t("siglum.description", "##Description##")}
                </AppLabel>
                <DescriptionTextEditor
                    ref={descriptionEditorRef}
                    className="p-2 rounded-sm border-2 h-full !bg-white dark:!bg-grey-10 max-h-[100px]"
                    characterCountLimit={10000}
                    content={siglumRef.current?.description.content}
                    onFocus={handleOnFocusDescriptionEditor}
                    onCreate={handleOnCreateDescriptionEditor}
                    onSelectionUpdate={handleOnSelectionUpdateDescriptionEditor}
                    onUpdate={handleOnUpdateDescriptionEditor}
                />
                <p className="px-2 text-xs">{remainingCharactersDescription} {t("siglum.messages.charactersRemaining", "#characters remaining")}</p>
            </div>
        </div>
    )
})

const SiglumSetupToolbarLayout = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="sticky top-0 z-10 flex gap-2 pt-6 mx-6 items-center justify-between border-b border-grey-80 pb-2 bg-gray-50 dark:bg-grey-10">
            <div className="flex gap-2 items-center">
                {children}
            </div>
        </div>
    )
})

const EmptyStateLayout = memo(({ title, children }: { title: React.ReactNode, children: React.ReactNode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="font-bold">
                {title}
            </h1>
            <div className="flex gap-2 mt-4">
                {children}
            </div>
        </div>
    )
})

const EditSiglumLayout = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col gap-4 w-full">
                {children}
            </div>
        </div>
    )
})

const SiglumDialogContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-row h-[53vh]">
            {children}
        </div>
    )
})

const SiglumDialogLeftContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-[320px] border-r overflow-y-auto">
            <div className="flex flex-col h-full">
                {children}
            </div>
        </div>
    )
})

const SiglumDialogLeftContentHeader = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="sticky top-0 p-2 border-b">
            <div className="flex justify-end items-center">
                <div className="flex gap-2">
                    {children}
                </div>
            </div>
        </div>
    )
})

const SiglumDialogLeftContentBody = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
    )
})

const SiglumDialogRightContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-grey-10">
            {children}
        </div>
    )
})

