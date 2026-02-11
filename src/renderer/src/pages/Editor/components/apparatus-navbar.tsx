import { motion } from "framer-motion";
import IconDragIndicator from "@/components/app/icons/IconDragIndicator";
import IconUnfoldMore from "@/components/app/icons/IconUnfoldMore";
import IconMore from "@/components/app/icons/IconMore";
import IconPlusSimple from "@/components/app/icons/IconPlusSimple";
import {
    AppDropdownMenu,
    AppDropdownMenuContent,
    AppDropdownMenuItem,
    AppDropdownMenuPortal,
    AppDropdownMenuSeparator,
    AppDropdownMenuSub,
    AppDropdownMenuSubContent,
    AppDropdownMenuSubTrigger,
    AppDropdownMenuTrigger,
} from "@/components/app/app-dropdown-menu";
import IconCheck from "@/components/app/icons/IconCheck";
import List from "@/components/app/list";
import IconRight_1 from "@/components/app/icons/IconRight_1";
import { Input } from "@/components/ui/input";
import useSingleAndDoubleClick from "@/hooks/use-single-double-click";
import { useTranslation } from "react-i18next";
import { memo, useCallback, useRef, useState } from "react";
import AppButton from "@/components/app/app-button";
import { cn } from "@/lib/utils";
import { apparatusTypeTranslationKey } from "@/utils/constants";

type ApparatusNavBar = {
    item: Apparatus
    apparatuses: Apparatus[],
    activeTypes: ApparatusType[],
    disabledTypes: ApparatusType[],
    disabledChangeType: boolean,
    disabledChangeTypeToCritical: boolean,
    disabledChangeTypeToPageNotes: boolean,
    disabledChangeTypeToSectionNotes: boolean,
    disabledChangeTypeToInnerMargin: boolean,
    disabledChangeTypeToOuterMargin: boolean,
    disabledHideApparatus: boolean,
    disabledDeleteApparatus: boolean,
    activeNoteHighlights: boolean,
    activeCommentHighlights: boolean,
    onPointerEnter: (event: React.PointerEvent<HTMLDivElement>) => void,
    onClickExpand: (item: Apparatus) => void,
    onOpenChangeMoreMenu: (open: boolean, item: Apparatus) => void,
    onPointerDownMoreMenu: (event: React.PointerEvent<HTMLButtonElement>, item: Apparatus) => void,
    onChangeTypeToCritical: () => void,
    onChangeTypeToPageNotes: () => void,
    onChangeTypeToSectionNotes: () => void,
    onChangeTypeToInnerMargin: () => void,
    onChangeTypeToOuterMargin: () => void,
    onHideApparatus: (item: Apparatus) => void,
    onDeleteApparatus: (item: Apparatus) => void,
    onOpenChangeAddMenu: (open: boolean, item: Apparatus) => void,
    onPointerDownAddMenu: (event: React.PointerEvent<HTMLButtonElement>, item: Apparatus) => void,
    onAddNewApparatus: (type: ApparatusType) => void,
    onUpdateApparatus: (apparatus: Apparatus) => void,
    onExportApparatus: (item: Apparatus) => void,
    onToggleNoteHighlights: (item: Apparatus) => void,
    onToggleCommentHighlights: (item: Apparatus) => void,
    dragControls?: any,
}

const ApparatusNavBar = ({
    item,
    apparatuses,
    activeTypes,
    disabledTypes,
    disabledChangeType,
    disabledChangeTypeToCritical,
    disabledChangeTypeToPageNotes,
    disabledChangeTypeToSectionNotes,
    disabledChangeTypeToInnerMargin,
    disabledChangeTypeToOuterMargin,
    disabledHideApparatus,
    disabledDeleteApparatus,
    activeNoteHighlights,
    activeCommentHighlights,
    onPointerEnter,
    onClickExpand,
    onOpenChangeMoreMenu,
    onPointerDownMoreMenu,
    onChangeTypeToCritical,
    onChangeTypeToPageNotes,
    onChangeTypeToSectionNotes,
    onChangeTypeToInnerMargin,
    onChangeTypeToOuterMargin,
    onHideApparatus,
    onDeleteApparatus,
    onOpenChangeAddMenu,
    onPointerDownAddMenu,
    onAddNewApparatus,
    onUpdateApparatus,
    onExportApparatus,
    onToggleNoteHighlights,
    onToggleCommentHighlights,
    dragControls
}: ApparatusNavBar) => {

    const { t } = useTranslation()
    const inputRef = useRef<HTMLInputElement>(null);
    const [apparatus, setApparatus] = useState<Apparatus>(item);
    const [mode, setMode] = useState<"edit" | "view">("view");

    const handleOnDoubleClickTitle = useSingleAndDoubleClick(
        () => { },
        () => handleOnClickRename(),
        450,
    );

    const handleOnChangeTitle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setApparatus({
            ...apparatus,
            title: e.target.value,
        })
    }, [apparatus])

    const handleOnBlurTitle = useCallback(() => {
        setMode("view")
    }, [mode])

    const handleOnKeyDownTitle = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Escape") {
            e.preventDefault()
            setMode("view")
        } else if (e.key === "Enter" && apparatus.title.length > 0) {
            const apparatusesTitles = apparatuses.map((apparatus) => apparatus.title)
            if (apparatusesTitles.includes(apparatus.title) && apparatus.title !== item.title)
                return

            setMode("view")
            onUpdateApparatus(apparatus)
        }
    }, [apparatus, apparatuses, item])

    const handleOnClickRename = useCallback(() => {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        (async () => {
            await delay(100);
            setMode("edit")
            await delay(100);
            inputRef.current?.focus();
            inputRef.current?.select();
        })();
    }, [inputRef])

    const handleOnClickTitle = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation()
        handleOnDoubleClickTitle()
    }, [])

    const handleOnPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation()
    }, [])

    const handleOnExportApparatus = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation()
        onExportApparatus(item);
    }, [onExportApparatus, item])

    const handleOnToggleNoteHighlights = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation()
        onToggleNoteHighlights(item)
    }, [onToggleNoteHighlights, item])

    const handleOnToggleCommentHighlights = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation()
        onToggleCommentHighlights(item)
    }, [onToggleCommentHighlights, item])

    const handleOnHideApparatus = useCallback(() => {
        onHideApparatus(item)
    }, [onHideApparatus, item])

    const handleOnDeleteApparatus = useCallback(() => {
        onDeleteApparatus(item)
    }, [onDeleteApparatus, item])

    return (
        <motion.nav
            className={cn("h-8 px-2 flex items-center justify-between dark:bg-grey-20")}>
            <ApparatusNavBarDragIndicator onPointerEnter={onPointerEnter} dragControls={dragControls} />
            <motion.span className="text-center text-xs font-medium">
                {mode === "edit" ? (
                    <Input
                        ref={inputRef}
                        autoFocus
                        className="w-full border-none focus-visible:ring-0 !text-center !text-xs !font-medium shadow-none"
                        value={apparatus.title}
                        onChange={handleOnChangeTitle}
                        onBlur={handleOnBlurTitle}
                        onKeyDown={handleOnKeyDownTitle}
                    />
                ) : (
                    <ApparatusNavBarTitle
                        item={item}
                        typeName={t(apparatusTypeTranslationKey[item.type])}
                        handleOnClickTitle={handleOnClickTitle}
                    />
                )}
            </motion.span>
            <motion.div className="relative space-x-2">
                <motion.button
                    onPointerDown={handleOnPointerDown}
                    initial={false}
                    animate={{
                        backgroundColor: 'transparent'
                    }}
                    whileHover={{
                        scale: 1.1,
                        transition: { duration: 0.2 }
                    }}
                    children={<IconUnfoldMore className={cn("w-4 h-4")} />}
                    onClick={() => onClickExpand(item)}
                />
                <AppDropdownMenu
                    modal={false}
                    onOpenChange={(open) => onOpenChangeMoreMenu(open, item)}>
                    <AppDropdownMenuTrigger asChild>
                        <motion.button
                            onPointerDown={(event) => onPointerDownMoreMenu(event, item)}
                            initial={false}
                            animate={{
                                backgroundColor: 'transparent'
                            }}
                            whileHover={{
                                scale: 1.1,
                                transition: { duration: 0.2 }
                            }}
                            children={<IconMore className={cn("w-4 h-4")} />}
                        />
                    </AppDropdownMenuTrigger>
                    <AppDropdownMenuContent align="end">
                        {disabledChangeType && <AppDropdownMenuItem disabled className="flex items-center justify-between w-full">
                            <span>{t('apparatusesMenu.changeType')}</span>
                            <IconRight_1 className="w-4 h-4" />
                        </AppDropdownMenuItem>}
                        {!disabledChangeType && <AppDropdownMenuSub>
                            <AppDropdownMenuSubTrigger className="flex items-center justify-between w-full">
                                <span>{t('apparatusesMenu.changeType')}</span>
                                <IconRight_1 className="w-4 h-4" />
                            </AppDropdownMenuSubTrigger>
                            <AppDropdownMenuPortal>
                                <AppDropdownMenuSubContent>
                                    <AppDropdownMenuItem
                                        disabled={disabledChangeTypeToCritical}
                                        onClick={onChangeTypeToCritical}>
                                        {item.type === 'CRITICAL' && <IconCheck className="w-4 h-4" />}
                                        <span>{t('confirmChangeTemplateModal.apparatusType.critical')}</span>
                                    </AppDropdownMenuItem>
                                    <AppDropdownMenuItem
                                        disabled={disabledChangeTypeToPageNotes}
                                        onClick={onChangeTypeToPageNotes}>
                                        {item.type === 'PAGE_NOTES' && <IconCheck className="w-4 h-4" />}
                                        <span>{t('confirmChangeTemplateModal.apparatusType.pageNotes')}</span>
                                    </AppDropdownMenuItem>
                                    <AppDropdownMenuItem
                                        disabled={disabledChangeTypeToSectionNotes}
                                        onClick={onChangeTypeToSectionNotes}>
                                        {item.type === 'SECTION_NOTES' && <IconCheck className="w-4 h-4" />}
                                        <span>{t('confirmChangeTemplateModal.apparatusType.sectionNotes')}</span>
                                    </AppDropdownMenuItem>
                                    <AppDropdownMenuItem
                                        disabled={disabledChangeTypeToInnerMargin}
                                        onClick={onChangeTypeToInnerMargin}>
                                        {item.type === 'INNER_MARGIN' && <IconCheck className="w-4 h-4" />}
                                        <span>{t('confirmChangeTemplateModal.apparatusType.innerMargin')}</span>
                                    </AppDropdownMenuItem>
                                    <AppDropdownMenuItem
                                        disabled={disabledChangeTypeToOuterMargin}
                                        onClick={onChangeTypeToOuterMargin}>
                                        {item.type === 'OUTER_MARGIN' && <IconCheck className="w-4 h-4" />}
                                        <span>{t('confirmChangeTemplateModal.apparatusType.outerMargin')}</span>
                                    </AppDropdownMenuItem>
                                </AppDropdownMenuSubContent>
                            </AppDropdownMenuPortal>
                        </AppDropdownMenuSub>}
                        <AppDropdownMenuSeparator />
                        <AppDropdownMenuItem
                            onClick={handleOnClickRename}>
                            {t('apparatusesMenu.rename')}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuItem
                            disabled={disabledHideApparatus}
                            onClick={handleOnHideApparatus}>
                            {t('apparatusesMenu.hide')}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuItem
                            disabled={disabledDeleteApparatus}
                            onClick={handleOnDeleteApparatus}>
                            {t('apparatusesMenu.delete')}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuSeparator />
                        <AppDropdownMenuItem onClick={handleOnExportApparatus}>
                            {t('apparatusesMenu.export')}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuSeparator />
                        <AppDropdownMenuItem
                            onClick={handleOnToggleNoteHighlights}>
                            {activeNoteHighlights ? <IconCheck className="w-4 h-4" /> : null}
                            {t('apparatusesMenu.showNoteHighlights')}
                        </AppDropdownMenuItem>
                        <AppDropdownMenuItem
                            onClick={handleOnToggleCommentHighlights}>
                            {activeCommentHighlights ? <IconCheck className="w-4 h-4" /> : null}
                            {t('apparatusesMenu.showCommentHighlights')}
                        </AppDropdownMenuItem>
                    </AppDropdownMenuContent>
                </AppDropdownMenu>
                <AppDropdownMenu
                    onOpenChange={(open) => onOpenChangeAddMenu(open, item)}>
                    <AppDropdownMenuTrigger asChild>
                        <motion.button
                            onPointerDown={(event) => onPointerDownAddMenu(event, item)}
                            initial={false}
                            animate={{
                                backgroundColor: 'transparent'
                            }}
                            whileHover={{
                                scale: 1.1,
                                transition: { duration: 0.2 }
                            }}
                            children={<IconPlusSimple className={cn("w-4 h-4")} />}
                        />
                    </AppDropdownMenuTrigger>
                    <AppDropdownMenuContent align="end">
                        <List
                            data={activeTypes}
                            renderItem={(item) => (
                                <AppDropdownMenuItem
                                    key={item}
                                    onClick={() => onAddNewApparatus(item)}>
                                    {t(apparatusTypeTranslationKey[item as Apparatus['type']])}
                                </AppDropdownMenuItem>
                            )}
                        />

                        {activeTypes.length > 0
                            && disabledTypes.length > 0
                            && <AppDropdownMenuSeparator />}

                        <List
                            data={disabledTypes}
                            renderItem={(item) => (
                                <AppDropdownMenuItem
                                    key={item}
                                    disabled>
                                    {t(apparatusTypeTranslationKey[item as Apparatus['type']])}
                                </AppDropdownMenuItem>
                            )}
                        />
                    </AppDropdownMenuContent>
                </AppDropdownMenu>
            </motion.div>
        </motion.nav>
    )
}

export default memo(ApparatusNavBar)


const ApparatusNavBarDragIndicator = memo(({
    onPointerEnter,
    dragControls,
}: {
    onPointerEnter: (event: React.PointerEvent<HTMLDivElement>) => void
    dragControls: any
}) => {
    return (
        <motion.div
            className='cursor-grab active:cursor-grabbing'
            onPointerEnter={onPointerEnter}
            onPointerDown={(e) => {
                e.preventDefault();
                dragControls.start(e);
            }}
            onPointerUp={() => {
                dragControls.stop();
            }}
        // onPointerMove={(e) => {
        //     dragControls.move(e);
        // }}
        >
            <AppButton
                variant="transparent"
                size="icon-xs">
                <IconDragIndicator />
            </AppButton>
        </motion.div>
    )
})

const ApparatusNavBarTitle = memo(({
    item,
    typeName,
    handleOnClickTitle,
}: {
    item: Apparatus
    typeName: string
    handleOnClickTitle: (e: React.MouseEvent<HTMLSpanElement>) => void
}) => {
    return (
        <motion.span
            onClick={handleOnClickTitle}>
            <span>{item.title} ({typeName})</span>
        </motion.span>
    )
})