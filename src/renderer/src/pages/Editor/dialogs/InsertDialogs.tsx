import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditor } from "../hooks/useEditor";
import { setAddSymbolVisible, setInsertSiglumDialogVisible, toggleInsertSiglumDialogVisible } from "../provider";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import AddSymbolDialog from "./AddSymbol";

type InsertDialogsProps = {
    onInsertSiglum: (siglum: Siglum) => void;
    onAddSymbol: (symbol: number) => void;
}

const InsertDialogs = ({
    onInsertSiglum,
    onAddSymbol
}: InsertDialogsProps) => {
    const { t } = useTranslation()
    const [selectedSiglum, setSelectedSiglum] = useState<Siglum | null>(null)
    const [state, dispatch] = useEditor()


    const handleOpenChange = useCallback(() => {
        dispatch(toggleInsertSiglumDialogVisible())
    }, [dispatch])

    const handleOnSelectSiglum = useCallback((e: React.MouseEvent<HTMLLIElement>, item: Siglum) => {
        e.stopPropagation()
        setSelectedSiglum(item)
    }, [])

    const handleOnInsertSiglumDialogVisible = useCallback(() => {
        dispatch(setInsertSiglumDialogVisible(false))
    }, [dispatch])

    const handleOnInsertSiglum = useCallback(() => {
        if (!selectedSiglum) return
        onInsertSiglum(selectedSiglum)
        dispatch(setInsertSiglumDialogVisible(false))
    }, [dispatch, onInsertSiglum, selectedSiglum])


    return (
        <>
            {
                state.addSymbolVisible && <AddSymbolDialog
                    isOpen={state.addSymbolVisible}
                    onCancel={() => dispatch(setAddSymbolVisible(false))}
                    onApply={onAddSymbol}
                />
            }
            { 
                state.insertSiglumDialogVisible && <Dialog
                    open={state.insertSiglumDialogVisible}
                    onOpenChange={handleOpenChange}
                >
                    <DialogContent
                        className={cn(
                            "max-w-[250px] overflow-hidden !gap-0",
                            "[&>button]:hidden",
                            "p-0",
                        )}>
                        <DialogHeader className={cn("border-b border-grey-80 dark:border-grey-30 p-3 max-h-12")}>
                            <DialogTitle>
                                {t("siglum.insertDialog.title", "##Insert Siglum##")}
                            </DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <ul className="p-2">
                            {state.siglumList.map((item) => (
                                <li
                                    key={item.id}
                                    className="p-2 cursor-pointer"
                                    onClick={(e) => handleOnSelectSiglum(e, item)}>
                                    <div
                                        className={cn(
                                            "flex items-center gap-2 w-full rounded-sm px-2",
                                            selectedSiglum?.id === item.id && "bg-grey-80 dark:bg-grey-30"
                                        )}>
                                        <span
                                            className={cn(
                                                "text-sm text-gray-900 dark:text-white",
                                            )}>{item.siglum.value}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <DialogFooter
                            className={
                                cn("border-t border-grey-80 dark:border-grey-30 p-3  max-h-16")
                            }>
                            <Button
                                type="submit"
                                intent="secondary"
                                variant="filled"
                                size="mini"
                                onClick={handleOnInsertSiglumDialogVisible}>
                                <span>{t("siglum.insertDialog.cancel", "##Cancel##")}</span>
                            </Button>
                            <Button
                                type="submit"
                                intent="primary"
                                variant="filled"
                                size="mini"
                                onClick={handleOnInsertSiglum}>
                                <span>{t("siglum.insertDialog.insert", "##Insert##")}</span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            }
        </>
    )
}

export default InsertDialogs
