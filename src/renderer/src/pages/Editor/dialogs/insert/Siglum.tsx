import { AppDialogDescription, AppDialogTitle } from "@/components/app/app-dialog"
import { cn } from "@/lib/utils"
import { t } from "i18next"
import { useEditor } from "../../hooks/use-editor"
import { memo, useCallback, useMemo, useRef, useState } from "react"
import AppButton from "@/components/app/app-button"
import IconClose from "@/components/app/icons/IconClose"
import { AppDraggableDialog, AppDraggableDialogContent, AppDraggableDialogFooter, AppDraggableDialogHeader } from "@/components/app/app-draggable-dialog"
import { AppNavigatableList } from "@/components/app/app-navigatable-list"
import AppInput from "@/components/app/app-input"

type SiglumProps = {
    open: boolean
    onCancel: () => void
    onInsertSiglum: (siglum: Siglum) => void
}

const Siglum = ({
    open,
    onCancel,
    onInsertSiglum,
}: SiglumProps) => {
    const [selectedSiglum, setSelectedSiglum] = useState<Siglum | null>(null)
    const [filterText, setFilterText] = useState("")
    const [state] = useEditor()
    const listContainerRef = useRef<HTMLDivElement>(null)

    const filteredSiglumList = useMemo(() => {
        const siglumList = state.siglumList || []
        if (!filterText.trim()) {
            return siglumList
        }

        const lowerFilter = filterText.toLowerCase()
        return siglumList.filter((siglum) => {
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = siglum.value.contentHtml
            const textContent = (tempDiv.textContent || '').toLowerCase()
            return textContent.includes(lowerFilter)
        })
    }, [state.siglumList, filterText])

    const refocusList = useCallback(() => {
        setTimeout(() => {
            const focusableElement = listContainerRef.current?.querySelector('[tabindex="0"]') as HTMLElement
            if (focusableElement) {
                focusableElement.focus()
            }
        }, 50)
    }, [])

    const navigateToSiglum = useCallback((index: number) => {
        if (filteredSiglumList[index]) {
            setSelectedSiglum(filteredSiglumList[index])
        }
    }, [filteredSiglumList])

    const selectSiglum = useCallback((siglum: Siglum) => {
        setSelectedSiglum(siglum)
        refocusList()
    }, [onInsertSiglum, refocusList])

    const insertSiglum = useCallback(() => {
        if (!selectedSiglum) return
        onInsertSiglum(selectedSiglum)
        refocusList()
    }, [onInsertSiglum, selectedSiglum, refocusList])

    const getSiglumContent = useCallback((contentHtml: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const paragraph = tempDiv.querySelector('p');
        const inner = paragraph ? paragraph.innerHTML : '';
        return `<div style="height:60px;display:flex;align-items:center;">${inner}</div>`;
    }, []);

    return (
        <AppDraggableDialog open={open} onOpenChange={onCancel}>
            <AppDraggableDialogContent className={cn("max-w-xs")}>
                <AppDraggableDialogHeader>
                    <div className="flex justify-between items-center">
                        <AppDialogTitle className={cn("text-md font-bold flex-1")}>
                            {t("siglum.insertDialog.title", "##Insert Siglum##")}
                        </AppDialogTitle>
                        <AppButton
                            variant="transparent"
                            size="icon-sm"
                            onClick={(onCancel)}
                            className="ml-2">
                            <IconClose />
                        </AppButton>
                        <AppDialogDescription />
                    </div>
                </AppDraggableDialogHeader>
                <div className="p-2">
                    <AppInput
                        type="search"
                        placeholder={t("siglum.insertDialog.filterPlaceholder", "##Filter sigla...##")}
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full"
                        autoFocus={false}
                    />
                </div>
                <div ref={listContainerRef} className="overflow-y-auto min-h-[20vh] max-h-[380px] p-2">
                    <AppNavigatableList
                        items={filteredSiglumList}
                        onSelect={selectSiglum}
                        onNavigate={navigateToSiglum}
                        onEnter={insertSiglum}
                        renderItem={(item, _index, _isSelected) => (
                            <div
                                className={cn(
                                    "flex items-center gap-2 w-full rounded-sm px-2 py-2"
                                )}>
                                <span
                                    className={cn(
                                        "text-sm text-gray-900 dark:text-white",
                                    )}
                                    dangerouslySetInnerHTML={{ 
                                        __html: getSiglumContent(item.value.contentHtml) 
                                    }}
                                />
                            </div>
                        )}
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
                        <span>{t("siglum.insertDialog.cancel", "##Cancel##")}</span>
                    </AppButton>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="default"
                        onClick={insertSiglum}
                        disabled={filteredSiglumList.length === 0 || !selectedSiglum}>
                        <span>{t("siglum.insertDialog.insert", "##Insert##")}</span>
                    </AppButton>
                </AppDraggableDialogFooter>
            </AppDraggableDialogContent>
        </AppDraggableDialog>
    )
}

export default memo(Siglum)