import { AppDialogDescription, AppDialogTitle } from "@/components/app/app-dialog"
import { cn } from "@/lib/utils"
import { t } from "i18next"
import { memo, useCallback, useRef, useState, useEffect } from "react"
import AppButton from "@/components/app/app-button"
import IconClose from "@/components/app/icons/IconClose"
import { AppDraggableDialog, AppDraggableDialogContent, AppDraggableDialogFooter, AppDraggableDialogHeader } from "@/components/app/app-draggable-dialog"
import { AppNavigatableList } from "@/components/app/app-navigatable-list"

interface ReadingTypeProps {
    readingTypes: ReadingType[]
    open: boolean
    onCancel: () => void
    onCustom: () => void
    onSelectReadingTypeAdd: (readingType: ReadingTypeAdd) => void
    onSelectReadingTypeOm: (readingType: ReadingTypeOm) => void
    onSelectReadingTypeTr: (readingType: ReadingTypeTr) => void
    onSelectReadingTypeDel: (readingType: ReadingTypeDel) => void
}

const ReadingType = ({
    readingTypes,
    open,
    onCancel,
    onCustom,
    onSelectReadingTypeAdd,
    onSelectReadingTypeOm,
    onSelectReadingTypeTr,
    onSelectReadingTypeDel,
}: ReadingTypeProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const listContainerRef = useRef<HTMLDivElement>(null)

    const refocusList = useCallback(() => {
        setTimeout(() => {
            const focusableElement = listContainerRef.current?.querySelector('[tabindex="0"]') as HTMLElement
            if (focusableElement) {
                focusableElement.focus()
            }
        }, 50)
    }, [])

    useEffect(() => {
        if (open) {
            refocusList()
        }
    }, [open, refocusList])

    const navigateToReadingType = useCallback((index: number) => {
        setSelectedIndex(index)
    }, [])

    const selectReadingType = useCallback((readingType: ReadingType) => {
        const index = readingTypes.indexOf(readingType)
        setSelectedIndex(index >= 0 ? index : null)
        refocusList()
    }, [readingTypes, refocusList])

    const insertReadingType = useCallback(() => {
        if (selectedIndex === null) return
        
        // Use index to determine which type and call the appropriate callback
        switch (selectedIndex) {
            case 0:
                onSelectReadingTypeAdd(readingTypes[0])
                break
            case 1:
                onSelectReadingTypeOm(readingTypes[1])
                break
            case 2:
                onSelectReadingTypeTr(readingTypes[2])
                break
            case 3:
                onSelectReadingTypeDel(readingTypes[3])
                break
        }
        refocusList()
    }, [selectedIndex, readingTypes, onSelectReadingTypeAdd, onSelectReadingTypeOm, onSelectReadingTypeTr, onSelectReadingTypeDel, refocusList])

    return (
        <AppDraggableDialog open={open} onOpenChange={onCancel}>
            <AppDraggableDialogContent className={cn("max-w-md")}>
                <AppDraggableDialogHeader>
                    <div className="flex justify-between items-center">
                        <AppDialogTitle className={cn("text-md font-bold flex-1")}>
                            {t("reading_type.title", "Select Reading Type")}
                        </AppDialogTitle>
                        <AppButton
                            variant="transparent"
                            size="icon-sm"
                            onClick={onCancel}
                            aria-label={t("dialog.close", "Close")}
                            className="ml-2">
                            <IconClose />
                        </AppButton>
                        <AppDialogDescription />
                    </div>
                </AppDraggableDialogHeader>
                <div ref={listContainerRef} className="overflow-y-auto min-h-[20vh] max-h-[280px] p-2">
                    <AppNavigatableList
                        items={readingTypes}
                        onSelect={selectReadingType}
                        onNavigate={navigateToReadingType}
                        onEnter={insertReadingType}
                        renderItem={(item, index, _isSelected) => {
                            const labels = ['add.', 'om.', 'tr.', 'del.']
                            return (
                                <div
                                    className={cn(
                                        "flex items-center gap-2 w-full rounded-sm px-2 py-2"
                                    )}>
                                    <span
                                        className={cn(
                                            "text-sm text-gray-900 dark:text-white",
                                        )}>
                                        {item.content} ({labels[index]})
                                    </span>
                                </div>
                            )
                        }}
                        itemClassName="rounded-sm"
                        selectedItemClassName="bg-grey-80 dark:bg-grey-30"
                        onEscape={onCancel}
                        autoFocus={true}
                    />
                </div>
                <AppDraggableDialogFooter>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="secondary"
                        onClick={onCancel}>
                        <span>{t("reading_type.cancel", "Cancel")}</span>
                    </AppButton>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="secondary"
                        onClick={onCustom}>
                        <span>{t("reading_type.custom", "Custom")}</span>
                    </AppButton>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="default"
                        onClick={insertReadingType}>
                        <span>{t("reading_type.select", "Select")}</span>
                    </AppButton>
                </AppDraggableDialogFooter>
            </AppDraggableDialogContent>
        </AppDraggableDialog>
    )
}

export default memo(ReadingType)
