import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditor } from "../hooks/useEditor";
import { setInsertSiglumDialogVisible, toggleInsertSiglumDialogVisible } from "../provider";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type InsertDialogsProps = {
    onInsertSiglum: (siglum: Siglum) => void
}

const InsertDialogs = ({
    onInsertSiglum
}: InsertDialogsProps) => {
    const { t } = useTranslation()
    const [selectedSiglum, setSelectedSiglum] = useState<Siglum | null>(null)
    const [state, dispatch] = useEditor()

    return (
        <>

            <Dialog
                open={state.insertSiglumDialogVisible}
                // @REFACTOR: useCallback
                onOpenChange={() => {
                    dispatch(toggleInsertSiglumDialogVisible())
                }}
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
                                // @REFACTOR: useCallback
                                onClick={(e: React.MouseEvent<HTMLLIElement>) => {
                                    e.stopPropagation()
                                    setSelectedSiglum(item)
                                }}>
                                <div className={cn(
                                    "flex items-center gap-2 w-full rounded-sm px-2",
                                    selectedSiglum?.id === item.id && "bg-grey-80 dark:bg-grey-30"
                                )}>
                                    <span className={cn(
                                        "text-sm text-gray-900 dark:text-white",
                                    )}>{item.siglum.value}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <DialogFooter className={cn("border-t border-grey-80 dark:border-grey-30 p-3  max-h-16")}>
                        <Button
                            type="submit"
                            intent="secondary"
                            variant="filled"
                            size="mini"
                            // @REFACTOR: useCallback
                            onClick={() => {
                                dispatch(setInsertSiglumDialogVisible(false))
                            }}>
                            <span>{t("siglum.insertDialog.cancel", "##Cancel##")}</span>
                        </Button>
                        <Button
                            type="submit"
                            intent="primary"
                            variant="filled"
                            size="mini"
                            // @REFACTOR: useCallback
                            onClick={() => {
                                if (!selectedSiglum) return
                                onInsertSiglum(selectedSiglum)
                                dispatch(setInsertSiglumDialogVisible(false))
                            }}
                        >
                            <span>{t("siglum.insertDialog.insert", "##Insert##")}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default InsertDialogs
