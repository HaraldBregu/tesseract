import PlusSimple from "@/components/icons/PlusSimple"
import Button from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ForwardedRef, forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import Copy from "@/components/icons/Copy"
import Delete from "@/components/icons/Delete"
import { useEditor } from "../hooks/useEditor"
import { addSiglum, deleteSiglum, duplicateSiglum, updateSiglum } from "../provider"
import RichTextEditor, { HTMLRichTextEditorElement } from "@/lib/tiptap/richtext/rich-text-editor"
import Superscript from "@/components/icons/Superscript"
import Subscript from "@/components/icons/Subscript"
import Underline from "@/components/icons/Underline"
import Beta from "@/components/icons/Beta"
import Bold from "@/components/icons/Bold"
import Divider from "@/components/ui/divider"
import Siglum from "@/components/icons/Siglum"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Italic from "@/components/icons/Italic"
import { useTranslation } from "react-i18next"
import { oneLinerExtensionsConfig } from "@/lib/tiptap/richtext/constants"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"


type SiglumSetupMode = "empty" | "update" | "create"

type SiglumSetupProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    fontFamilyList: string[]
    fontFamilySymbols: CharacterSet
    onSelectFontFamily: (fontFamily: string) => void
    onImportSiglum: () => void
    onExportSiglumList: () => void
}

export const SiglumSetup = ({
    open,
    onOpenChange,
    fontFamilyList,
    fontFamilySymbols,
    onSelectFontFamily,
    onImportSiglum,
    onExportSiglumList
}: SiglumSetupProps) => {

    const { t } = useTranslation()
    const [mode, setMode] = useState<SiglumSetupMode>("empty")
    const [state, dispatch] = useEditor()

    const defaultSiglumData: SiglumData = { value: "", content: "" }
    const [siglumId, setSiglumId] = useState<string | null>(null)
    const [siglumDataTitle, setSiglumDataTitle] = useState<SiglumData>(defaultSiglumData)
    const [siglumDataManuscripts, setSiglumDataManuscripts] = useState<SiglumData>(defaultSiglumData)
    const [siglumDataDescription, setSiglumDataDescription] = useState<SiglumData>(defaultSiglumData)

    const editorContainersRef = useRef<any>(null)
    const selectedSiglum = useRef<Siglum | null>(null)

    const handleSetMode = useCallback((mode: SiglumSetupMode) => {
        setMode(mode)
        editorContainersRef?.current?.setSiglum(null)
    }, [])

    const handleDeleteSiglum = useCallback((siglum: Siglum) => {
        dispatch(deleteSiglum(siglum))
    }, [])

    const handleDuplicateSiglum = useCallback((siglum: Siglum) => {
        dispatch(duplicateSiglum(siglum))
    }, [])

    const handleUpdateSiglum = useCallback(() => {
        switch (mode) {
            case "update":
                dispatch(updateSiglum(siglumId ?? "", siglumDataTitle, siglumDataManuscripts, siglumDataDescription))
                break
            case "create":
                dispatch(addSiglum(siglumDataTitle, siglumDataManuscripts, siglumDataDescription))
                editorContainersRef?.current?.setSiglum(null)
                break
            default:
                break
        }
    }, [siglumId, siglumDataTitle, siglumDataManuscripts, siglumDataDescription, mode])

    const handleClickSiglum = useCallback((item: Siglum) => {
        setMode("update")
        selectedSiglum.current = item
        editorContainersRef?.current?.setSiglum(item)
    }, [])

    const enabledExportButton = useMemo(() => {
        return state.siglumList.length > 0
    }, [state.siglumList])

    const hasSameSiglum = useMemo(() => {
        const siglumLits = state.siglumList
        const titleContent = siglumDataTitle.content ?? ''
        const hasSameSiglum = siglumLits.some(item => item.siglum.content === titleContent && item.id !== siglumId)
        return hasSameSiglum
    }, [state.siglumList, siglumDataTitle])

    const enabledSaveButton = useMemo(() => {
        const title = siglumDataTitle.value ?? ''
        const manuscripts = siglumDataManuscripts.value ?? ''
        return title.length > 0 && manuscripts.length > 0 && !hasSameSiglum
    }, [siglumDataTitle, siglumDataManuscripts])

    const errorDataTitle = useMemo(() => {
        return hasSameSiglum ? t("siglum.error.title", "##Siglum already exists##") : null
    }, [state.siglumList, siglumDataTitle])

    const [textFormatting, setTextFormatting] = useState<TextFormatting | undefined>(undefined)

    const handleOnUpdateTextFormatting = useCallback((textFormatting: TextFormatting | undefined) => {
        setTextFormatting(textFormatting)
    }, [])

    const handleOnUpdateSiglumData = useCallback((id: string | null, title: SiglumData, manuscripts: SiglumData, description: SiglumData) => {
        setSiglumId(id)
        setSiglumDataTitle(title)
        setSiglumDataManuscripts(manuscripts)
        setSiglumDataDescription(description)
    }, [])

    const handleSetFontFamily = useCallback((fontFamily: string) => {
        onSelectFontFamily(fontFamily)
        editorContainersRef?.current?.setFontFamily(fontFamily)
    }, [])

    const handleSetSuperscript = useCallback(() => {
        editorContainersRef?.current?.setSuperscript()
    }, [])

    const handleSetSubscript = useCallback(() => {
        editorContainersRef?.current?.setSubscript()
    }, [])

    const handleSetBold = useCallback(() => {
        editorContainersRef?.current?.setBold()
    }, [])

    const handleSetItalic = useCallback(() => {
        editorContainersRef?.current?.setItalic()
    }, [])

    const handleSetUnderline = useCallback(() => {
        editorContainersRef?.current?.setUnderline()
    }, [])

    const handleSelectFontFamilySymbolCode = useCallback((symbol: number) => {
        editorContainersRef?.current?.insertContent(String.fromCharCode(symbol))
    }, [])

    const handleSelectSiglum = useCallback((siglum: Siglum) => {
        editorContainersRef?.current?.addSiglum(siglum)
    }, [])

    const handleCancel = useCallback(() => {
        onOpenChange(false)
    }, [])

    const handleExportSiglumList = useCallback(() => {
        onExportSiglumList()
    }, [])

    const handleSetModeCreate = useCallback(() => {
        handleSetMode("create")
    }, [])

    const handleImportSiglum = useCallback(() => {
        onImportSiglum()
    }, [])

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}>
            <DialogContent
                className={cn("max-w-[60vw] overflow-hidden !gap-0", "[&>button]:hidden", "p-0")}>
                <DialogHeader className={cn("border-b border-grey-80 dark:border-grey-30 p-3 max-h-12")}>
                    <DialogTitle className={cn("text-grey-100 text-center text-[14px] font-[700]")}>
                        {t("siglum.title", "##Siglum##")}
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <SiglumDialogContent>
                    <SiglumDialogLeftContent>
                        <SiglumDialogLeftContentHeader>
                            <Button
                                size="mini"
                                variant="tonal"
                                intent={"secondary"}
                                leftIcon={<PlusSimple
                                    className="w-4 h-4"
                                    color="var(--color-primary)"
                                />}
                                onClick={handleSetModeCreate}>
                                {t("siglum.create", "##Create##")}
                            </Button>
                            <Button
                                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
                                size="mini"
                                intent={"primary"}
                                onClick={handleImportSiglum}>
                                {t("siglum.import", "##Import##")}
                            </Button>
                        </SiglumDialogLeftContentHeader>
                        <SiglumDialogLeftContentBody>
                            <SiglumList
                                items={state.siglumList}
                                itemSelected={selectedSiglum.current}
                                onDelete={handleDeleteSiglum}
                                onDuplicate={handleDuplicateSiglum}
                                onClick={handleClickSiglum}
                            />
                        </SiglumDialogLeftContentBody>
                    </SiglumDialogLeftContent>
                    <SiglumDialogRightContent>
                        {mode === "empty" &&
                            <EmptyStateLayout title={t("siglum.empty.title", "##Create sigla before adding notes##")}>
                                <Button
                                    size="mini"
                                    variant="tonal"
                                    intent="secondary"
                                    leftIcon={<PlusSimple
                                        className="w-4 h-4"
                                        color="var(--color-primary)"
                                    />}
                                    onClick={handleSetModeCreate}>
                                    {t("siglum.create", "##Create##")}
                                </Button>
                                <Button
                                    className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
                                    size="mini"
                                    intent="primary"
                                    onClick={handleImportSiglum}>
                                    {t("siglum.import", "##Import##")}
                                </Button>
                            </EmptyStateLayout>
                        }
                        {(mode === "update" || mode === "create") &&
                            <EditSiglumLayout>
                                <SiglumSetupToolbar
                                    fontFamily={textFormatting?.fontFamily || "Times New Roman"}
                                    fontFamilyList={fontFamilyList}
                                    onSetFontFamily={handleSetFontFamily}
                                    superscript={textFormatting?.superscript || false}
                                    onSetSuperscript={handleSetSuperscript}
                                    subscript={textFormatting?.subscript || false}
                                    onSetSubscript={handleSetSubscript}
                                    bold={textFormatting?.bold || false}
                                    onSetBold={handleSetBold}
                                    italic={textFormatting?.italic || false}
                                    onSetItalic={handleSetItalic}
                                    underline={textFormatting?.underline || false}
                                    onSetUnderline={handleSetUnderline}
                                    fontFamilySymbols={fontFamilySymbols}
                                    onSelectFontFamilySymbolCode={handleSelectFontFamilySymbolCode}
                                    siglumList={state.siglumList}
                                    onSelectSiglum={handleSelectSiglum}
                                />
                                <SiglumSetupEditorContainer
                                    ref={editorContainersRef}
                                    onUpdateTextFormatting={handleOnUpdateTextFormatting}
                                    errorDataTitle={errorDataTitle}
                                    onUpdateSiglumData={handleOnUpdateSiglumData}
                                />
                            </EditSiglumLayout>
                        }
                    </SiglumDialogRightContent>
                </SiglumDialogContent>
                <DialogFooter className={cn("border-t border-grey-80 dark:border-grey-30 p-3  max-h-16")}>
                    <Button
                        className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini"
                        intent={"secondary"}
                        variant={"tonal"}
                        onClick={handleCancel}>
                        {t("siglum.cancel", "##Cancel##")}
                    </Button>
                    <Button
                        className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24"
                        size="mini"
                        intent={"secondary"}
                        variant={"tonal"}
                        disabled={!enabledExportButton}
                        onClick={handleExportSiglumList}>
                        {t("siglum.export", "##Export##")}
                    </Button>
                    <Button
                        className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24"
                        size="mini"
                        intent={"primary"}
                        disabled={!enabledSaveButton}
                        onClick={handleUpdateSiglum}>
                        {t("siglum.save", "##Save##")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

type SiglumListProps = {
    items: Siglum[]
    itemSelected: Siglum | null
    onDelete: (siglum: Siglum) => void
    onDuplicate: (siglum: Siglum) => void
    onClick: (siglum: Siglum) => void
}

const SiglumList = ({
    items,
    itemSelected,
    onDelete,
    onDuplicate,
    onClick
}: SiglumListProps) => {

    const handleClick = useCallback((e: React.MouseEvent<HTMLLIElement>, siglum: Siglum) => {
        e.stopPropagation()
        onClick(siglum)
    }, [])

    const handleDuplicate = useCallback((e: React.MouseEvent<HTMLButtonElement>, siglum: Siglum) => {
        e.stopPropagation()
        onDuplicate(siglum)
    }, [])

    const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>, siglum: Siglum) => {
        e.stopPropagation()
        onDelete(siglum)
    }, [])

    return (
        <ul>
            {items.map((item) => (
                <li
                    key={item.id}
                    className="p-2 cursor-pointer"
                    onClick={(e) => handleClick(e, item)}>
                    <div className={cn(
                        "flex items-center gap-2 w-full rounded-sm px-2 ",
                        itemSelected?.id === item.id && "bg-primary dark:bg-grey-30"
                    )}>
                        <span className={cn(
                            "text-sm text-gray-900 dark:text-grey-80",
                            itemSelected?.id === item.id && "text-white dark:text-grey-90"
                        )}>{item.siglum.value}</span>
                        <div className="ml-auto flex gap-2">
                            <Button
                                intent="secondary"
                                variant="icon"
                                size="iconSm"
                                tabIndex={10}
                                icon={<Copy
                                    color={itemSelected?.id === item.id ? "#ffffff" : "#000"}
                                    intent='secondary'
                                    variant='tonal'
                                    size='small'
                                />}
                                onClick={(e) => handleDuplicate(e, item)}
                                aria-pressed={false}
                                aria-label="Italic"
                                className="border-none shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <Button
                                intent="secondary"
                                variant="icon"
                                size="iconSm"
                                tabIndex={10}
                                icon={<Delete
                                    color={itemSelected?.id === item.id ? "#ffffff" : "#000"}
                                    intent='secondary'
                                    variant='tonal'
                                    size='small'
                                />}
                                onClick={(e) => handleDelete(e, item)}
                                aria-pressed={false}
                                aria-label="Italic"
                                className="border-none shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}

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
        <div className="flex flex-row h-[50vh]">
            {children}
        </div>
    )
})

const SiglumDialogLeftContent = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-1/3 border-r overflow-y-auto">
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
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-grey-10">
            {children}
        </div>
    )
})

type SiglumSetupToolbarProps = {
    fontFamily: string
    fontFamilyList: string[]
    onSetFontFamily: (fontFamily: string) => void
    superscript: boolean
    onSetSuperscript: () => void
    subscript: boolean
    onSetSubscript: () => void
    bold: boolean
    onSetBold: () => void
    italic: boolean
    onSetItalic: () => void
    underline: boolean
    onSetUnderline: () => void
    fontFamilySymbols: CharacterSet
    onSelectFontFamilySymbolCode: (code: number) => void
    siglumList: Siglum[]
    onSelectSiglum: (siglum: Siglum) => void
}

const SiglumSetupToolbar = memo(({
    fontFamily,
    fontFamilyList,
    onSetFontFamily,
    superscript,
    onSetSuperscript,
    subscript,
    onSetSubscript,
    bold,
    onSetBold,
    italic,
    onSetItalic,
    underline,
    onSetUnderline,
    fontFamilySymbols,
    onSelectFontFamilySymbolCode,
    siglumList,
    onSelectSiglum,
}: SiglumSetupToolbarProps) => {

    const handleSetFontFamily = useCallback((fontFamily: string) => {
        onSetFontFamily(fontFamily)
    }, [])

    const handleSetSuperscript = useCallback(() => {
        onSetSuperscript()
    }, [])

    const handleSetSubscript = useCallback(() => {
        onSetSubscript()
    }, [])

    const handleSetBold = useCallback(() => {
        onSetBold()
    }, [])

    const handleSetItalic = useCallback(() => {
        onSetItalic()
    }, [])

    const handleSetUnderline = useCallback(() => {
        onSetUnderline()
    }, [])

    const handleSelectFontFamilySymbolCode = useCallback((code: number) => {
        onSelectFontFamilySymbolCode(code)
    }, [])

    const handleSelectSiglum = useCallback((siglum: Siglum) => {
        onSelectSiglum(siglum)
    }, [])

    return (
        <SiglumSetupToolbarLayout>
            <div className="flex gap-2 items-center">
                <div className={`flex items-center space-x-2 transition-transform duration-300`}>
                    <Select
                        value={fontFamily}
                        onValueChange={handleSetFontFamily}
                    >
                        <SelectTrigger
                            className="w-auto shadow-none focus:ring-0 focus:ring-offset-0 font-[400] text-[14px] border-none px-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {fontFamilyList.map((ff) => (
                                <SelectItem
                                    key={ff}
                                    value={ff}
                                    style={{ fontFamily: ff }}
                                >
                                    {ff}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Divider className="px-0" />
                <Button
                    intent="secondary"
                    variant={superscript ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={10}
                    icon={<Superscript intent='secondary' variant='tonal' size='small' />}
                    onClick={handleSetSuperscript}
                    aria-pressed={false}
                    aria-label="superscript"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                    intent="secondary"
                    variant={subscript ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={10}
                    icon={<Subscript intent='secondary' variant='tonal' size='small' />}
                    onClick={handleSetSubscript}
                    aria-pressed={false}
                    aria-label="subscript"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                    intent="secondary"
                    variant={bold ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={10}
                    icon={<Bold intent='secondary' variant='tonal' size='small' />}
                    onClick={handleSetBold}
                    aria-pressed={false}
                    aria-label="bold"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                    intent="secondary"
                    variant={italic ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={10}
                    icon={<Italic intent='secondary' variant='tonal' size='small' />}
                    onClick={handleSetItalic}
                    aria-pressed={false}
                    aria-label="italic"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                    intent="secondary"
                    variant={underline ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={10}
                    icon={<Underline intent='secondary' variant='tonal' size='small' />}
                    onClick={handleSetUnderline}
                    aria-pressed={false}
                    aria-label="underline"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Divider className="px-0" />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            intent="secondary"
                            variant={"icon"}
                            size="iconSm"
                            icon={<Beta
                                intent='secondary'
                                variant='tonal'
                                size='small'
                                disabled={fontFamilySymbols.length === 0}
                            />}
                            disabled={fontFamilySymbols.length === 0}
                        />
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="flex flex-wrap overflow-auto ">
                            {fontFamilySymbols.map(({ code, name }) => (
                                <Button
                                    key={`${code}-${name}`}
                                    intent={"secondary"}
                                    variant={"border"}
                                    className="h-[40px] w-[40px] px-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                                    onClick={() => handleSelectFontFamilySymbolCode(code)}
                                >
                                    {String.fromCharCode(code)}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
                <Divider className="px-0" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            intent="secondary"
                            variant={"icon"}
                            size="iconSm"
                            icon={
                                <Siglum
                                    intent='secondary'
                                    variant='tonal'
                                    size='small'
                                    disabled={siglumList.length === 0}
                                />}
                            disabled={siglumList.length === 0}
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                        {siglumList.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onClick={() => handleSelectSiglum(item)}>
                                {item.siglum.value}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </SiglumSetupToolbarLayout>
    )
})

type SiglumSetupEditorContainerProps = {
    onUpdateTextFormatting: (textFormatting: TextFormatting | undefined) => void
    onUpdateSiglumData: (id: string | null, title: SiglumData, manuscripts: SiglumData, description: SiglumData) => void
    errorDataTitle: string | null
}

const SiglumSetupEditorContainer = forwardRef(({
    onUpdateTextFormatting,
    onUpdateSiglumData,
    errorDataTitle
}: SiglumSetupEditorContainerProps,
    ref: ForwardedRef<unknown>) => {

    const { t } = useTranslation()

    const siglumRef = useRef<Siglum | null>(null)

    const [currentEditorRef, setCurrentEditorRef] = useState<HTMLRichTextEditorElement | null>(null)

    const titleEditorRef = useRef<HTMLRichTextEditorElement>(null)
    const manuscriptsEditorRef = useRef<HTMLRichTextEditorElement>(null)
    const descriptionEditorRef = useRef<HTMLRichTextEditorElement>(null)

    const handleUpdateContent = useCallback(() => {

        const title: SiglumData = {
            value: titleEditorRef.current?.getText() || "",
            content: titleEditorRef.current?.getHTML() || ""
        }

        const manuscripts: SiglumData = {
            value: manuscriptsEditorRef.current?.getText() || "",
            content: manuscriptsEditorRef.current?.getHTML() || ""
        }

        const description: SiglumData = {
            value: descriptionEditorRef.current?.getText() || "",
            content: descriptionEditorRef.current?.getHTML() || ""
        }

        onUpdateSiglumData(
            siglumRef.current?.id ?? null,
            title,
            manuscripts,
            description
        )
    }, [])

    useImperativeHandle(ref, () => ({
        setSiglum: (item: Siglum | null) => {
            siglumRef.current = item
            titleEditorRef.current?.setContent(item?.siglum.content)
            manuscriptsEditorRef.current?.setContent(item?.manuscripts.content)
            descriptionEditorRef.current?.setContent(item?.description.content)
            handleUpdateContent()
        },
        addSiglum: (item: Siglum) => {
            titleEditorRef.current?.insertContent(item?.siglum.content)
            manuscriptsEditorRef.current?.insertContent(item?.manuscripts.content)
            descriptionEditorRef.current?.insertContent(item?.description.content)
        },
        setFontFamily: (fontFamily: string) => {
            currentEditorRef?.setFontFamily(fontFamily)
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
        setCurrentEditorRef(titleEditorRef.current)
        const textFormatting = titleEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
    }, [])

    const handleOnSelectionUpdateTitleEditor = useCallback(() => {
        const textFormatting = titleEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
    }, [])

    const handleOnUpdateTitleEditor = useCallback(() => {
        const textFormatting = titleEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
        handleUpdateContent()
    }, [])

    const handleOnFocusManuscriptsEditor = useCallback(() => {
        setCurrentEditorRef(manuscriptsEditorRef.current)
    }, [])

    const handleOnSelectionUpdateManuscriptsEditor = useCallback(() => {
        const textFormatting = manuscriptsEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
    }, [])

    const handleOnUpdateManuscriptsEditor = useCallback(() => {
        const textFormatting = manuscriptsEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
        handleUpdateContent()
    }, [])

    const handleOnFocusDescriptionEditor = useCallback(() => {
        setCurrentEditorRef(descriptionEditorRef.current)
    }, [])

    const handleOnSelectionUpdateDescriptionEditor = useCallback(() => {
        const textFormatting = descriptionEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
    }, [])

    const handleOnUpdateDescriptionEditor = useCallback(() => {
        const textFormatting = descriptionEditorRef.current?.getTextFormatting()
        onUpdateTextFormatting(textFormatting)
        handleUpdateContent()
    }, [])

    const handleOnCreateDescriptionEditor = useCallback(() => {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            await delay(100);
            titleEditorRef.current?.setFocus()
        })();
    }, [])

    return (
        <>
            <div className="flex flex-col gap-2">
                <RichTextEditor
                    ref={titleEditorRef}
                    className="p-2 rounded-sm border-2 !bg-white dark:!bg-grey-10"
                    extensions={oneLinerExtensionsConfig}
                    characterCountLimit={30}
                    content={siglumRef.current?.siglum.content}
                    onFocus={handleOnFocusTitleEditor}
                    onSelectionUpdate={handleOnSelectionUpdateTitleEditor}
                    onUpdate={handleOnUpdateTitleEditor}
                />
                {errorDataTitle && <p className="text-red-500 text-xs">{errorDataTitle}</p>}
            </div>
            <div className="flex flex-col gap-2 h-32">
                <Label className="text-xs font-bold ml-2">
                    {t("siglum.manuscripts", "##Manuscripts*##")}
                </Label>
                <RichTextEditor
                    ref={manuscriptsEditorRef}
                    className="p-2 rounded-sm border-2 h-full !bg-white dark:!bg-grey-10"
                    characterCountLimit={5000}
                    content={siglumRef.current?.manuscripts.content}
                    onFocus={handleOnFocusManuscriptsEditor}
                    onSelectionUpdate={handleOnSelectionUpdateManuscriptsEditor}
                    onUpdate={handleOnUpdateManuscriptsEditor}
                />
            </div>
            <div className="flex flex-col gap-2 h-32">
                <Label className="text-xs font-bold ml-2">
                    {t("siglum.description", "##Description##")}
                </Label>
                <RichTextEditor
                    ref={descriptionEditorRef}
                    className="p-2 rounded-sm border-2 h-full !bg-white dark:!bg-grey-10"
                    characterCountLimit={10000}
                    content={siglumRef.current?.description.content}
                    onFocus={handleOnFocusDescriptionEditor}
                    onCreate={handleOnCreateDescriptionEditor}
                    onSelectionUpdate={handleOnSelectionUpdateDescriptionEditor}
                    onUpdate={handleOnUpdateDescriptionEditor}
                />
            </div>
        </>
    )
})

const SiglumSetupToolbarLayout = memo(({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex gap-2 items-center justify-between  border-b border-grey-80 pb-2">
            <div className="flex gap-2 items-center">
                {children}
            </div>
        </div>
    )
})
