import { cn } from "@/lib/utils"
import { t } from "i18next"
import { memo, useCallback, useState } from "react"
import AppInput from "@/components/app/app-input"
import AppButton from "@/components/app/app-button"
import IconClose from "@/components/app/icons/IconClose"
import { AppDraggableDialog, AppDraggableDialogContent, AppDraggableDialogHeader, AppDraggableDialogTitle, AppDraggableDialogFooter, AppDraggableDialogDescription } from "@/components/app/app-draggable-dialog"


type ReadingTypeCustomProps = {
    open: boolean
    onCancel: () => void
    onInsertReadingType: (readingType: string) => void
}

const ReadingTypeCustom = ({
    open,
    onCancel,
    onInsertReadingType,
}: ReadingTypeCustomProps) => {
    const [readingType, setReadingType] = useState<string>("")

    const handleOnChangeReadingType = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setReadingType(e.target.value)
    }, [setReadingType])

    const handleOnInsertReadingType = useCallback(() => {
        onInsertReadingType(readingType)
    }, [onInsertReadingType, readingType])

    return (
        <AppDraggableDialog open={open} onOpenChange={onCancel}>
            <AppDraggableDialogContent className={cn("max-w-xs max-h-[70vh]")}>
                <AppDraggableDialogHeader>
                    <div className="flex justify-between items-center">
                        <AppDraggableDialogTitle className={cn("text-md font-bold flex-1")}>
                            {t("reading_type_custom.title", "Custom Reading Type")}
                        </AppDraggableDialogTitle>
                        <AppButton
                            variant="transparent"
                            size="icon-sm"
                            onClick={(onCancel)}
                            aria-label={t("dialog.close", "Close")}
                            className="ml-2">
                            <IconClose />
                        </AppButton>
                        <AppDraggableDialogDescription />
                    </div>
                </AppDraggableDialogHeader>
                <div className="overflow-y-auto h-[100px] p-4">
                    <div className="grid w-full items-center">
                        <AppInput
                            type="text"
                            value={readingType}
                            onChange={handleOnChangeReadingType}
                        />
                    </div>
                </div>
                <AppDraggableDialogFooter>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="secondary"
                        onClick={onCancel}>
                        <span>{t("reading_type_custom.cancel", "Cancel")}</span>
                    </AppButton>
                    <AppButton
                        className="px-6"
                        type="submit"
                        size="xs"
                        variant="default"
                        onClick={handleOnInsertReadingType}>
                        <span>{t("reading_type_custom.insert", "Insert")}</span>
                    </AppButton>
                </AppDraggableDialogFooter>
            </AppDraggableDialogContent>
        </AppDraggableDialog>
    )
}

export default memo(ReadingTypeCustom)