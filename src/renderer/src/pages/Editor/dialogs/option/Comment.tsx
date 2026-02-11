import { AppDialogDescription, AppDialogTitle } from "@/components/app/app-dialog"
import { cn } from "@/lib/utils"
import { t } from "i18next"
import { memo, useCallback, useMemo, useRef, useState, useEffect } from "react"
import AppButton from "@/components/app/app-button"
import IconClose from "@/components/app/icons/IconClose"
import { AppDraggableDialog, AppDraggableDialogContent, AppDraggableDialogFooter, AppDraggableDialogHeader } from "@/components/app/app-draggable-dialog"
import { AppNavigatableList } from "@/components/app/app-navigatable-list"
import AppInput from "@/components/app/app-input"

interface CommentProps {
    open: boolean
    onCancel: () => void
    onSelectCategory: (category: CommentCategory) => void
    categories: CommentCategory[] | null
}

const Comment = ({
    open,
    onCancel,
    onSelectCategory,
    categories,
}: CommentProps) => {
    const [selectedCategory, setSelectedCategory] = useState<CommentCategory | null>(null)
    const [filterText, setFilterText] = useState("")
    const listContainerRef = useRef<HTMLDivElement>(null)

    const uncategorizedItem = useMemo(() => ({
        id: undefined,
        name: t("comments.category.uncategorized", "##Uncategorized##"),
    } as CommentCategory), [])

    const filteredCategoryList = useMemo(() => {
        const categoryList = categories || []
        const hasFilter = filterText.trim().length > 0
        
        if (!hasFilter) {
            return [uncategorizedItem, ...categoryList]
        }
        
        const lowerFilter = filterText.toLowerCase()
        const filtered = categoryList.filter((category) => {
            return category.name.toLowerCase().includes(lowerFilter)
        })
        return filtered
    }, [categories, filterText, uncategorizedItem])

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

    const navigateToCategory = useCallback((index: number) => {
        if (filteredCategoryList[index]) {
            setSelectedCategory(filteredCategoryList[index])
        }
    }, [filteredCategoryList])

    const selectCategory = useCallback((category: CommentCategory) => {
        setSelectedCategory(category)
        refocusList()
    }, [refocusList])

    const insertCategory = useCallback(() => {
        if (!selectedCategory) return
        onSelectCategory(selectedCategory)
        setSelectedCategory(null)
        setFilterText("")
        refocusList()
    }, [onSelectCategory, selectedCategory, refocusList])

    return (
        <AppDraggableDialog open={open} onOpenChange={onCancel}>
            <AppDraggableDialogContent className={cn("max-w-xs")}>
                <AppDraggableDialogHeader>
                    <div className="flex justify-between items-center">
                        <AppDialogTitle className={cn("text-md font-bold flex-1")}>
                            {t("comments.category.title", "##Select Category##")}
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
                <div className="p-2">
                    <AppInput
                        type="search"
                        placeholder={t("comments.category.filterPlaceholder", "##Filter categories...##")}
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full"
                        autoFocus={false}
                    />
                </div>
                <div ref={listContainerRef} className="overflow-y-auto min-h-[20vh] max-h-[380px] p-2">
                    <AppNavigatableList
                        items={filteredCategoryList}
                        onSelect={selectCategory}
                        onNavigate={navigateToCategory}
                        onEnter={insertCategory}
                        renderItem={(item, _index, _isSelected) => (
                            <div
                                className={cn(
                                    "flex items-center gap-2 w-full rounded-sm px-2 py-2"
                                )}>
                                <span
                                    className={cn(
                                        "text-sm text-gray-900 dark:text-white",
                                    )}>
                                    {item.name}
                                </span>
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
                        <span>{t("comments.category.cancel", "##Cancel##")}</span>
                    </AppButton>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="default"
                        onClick={insertCategory}
                        disabled={filteredCategoryList.length === 0 || !selectedCategory}>
                        <span>{t("comments.category.select", "##Select##")}</span>
                    </AppButton>
                </AppDraggableDialogFooter>
            </AppDraggableDialogContent>
        </AppDraggableDialog>
    )
}

export default memo(Comment)
