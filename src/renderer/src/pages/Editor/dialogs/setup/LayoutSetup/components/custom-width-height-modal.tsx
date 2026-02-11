import Button from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import TextField from "@/components/ui/textField"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type CustomWidthHeightModalProps = {
    open: boolean
    onDone: (val: { name: string, width: number, height: number }) => void
    onClose?: () => void
}

const CustomWidthHeightModal = ({ open, onDone, onClose }: CustomWidthHeightModalProps) => {
    const [openModal, setOpenModal] = useState(false)

    const [width, setWidth] = useState<number>(0)
    const [height, setHeight] = useState<number>(0)

    useEffect(() => {
        setOpenModal(open)
        // Reset values when modal opens
        // if (open) {
        //     setWidth(0)
        //     setHeight(0)
        // }
    }, [open]);

    const closeModal = () => {
        setOpenModal(false)
        onClose?.()
    }

    const doneHdlr = () => {
        onDone({ name: 'custom', width, height })
        closeModal()
    }

    const { t } = useTranslation();


    return (
        <Modal
            title={t('pageSetup.component.customPaperSize.title')}
            header={<div>{t('pageSetup.component.customPaperSize.title')}</div>}
            className="w-fit h-fit"
            isOpen={openModal}
            onOpenChange={() => { }}
            onClose={closeModal}
            actions={
                <div className="flex flex-row gap-2">
                    <Button className="w-24 h-7 text-[13px]" size="small" variant="tonal" intent="secondary" onClick={closeModal}>{t('pageSetup.component.customPaperSize.cancel')}</Button>
                    <Button className="w-24 h-7 text-[13px]" size="small" variant="filled" intent="primary" onClick={doneHdlr}>{t('pageSetup.component.customPaperSize.done')}</Button>
                </div>
            }
        >
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="width" className="dark:text-grey-90">{t('pageSetup.component.customPaperSize.width')}</label>
                        <TextField
                            id="width"
                            type="number"
                            onChange={e => setWidth(parseFloat(e.target.value))}
                            value={width}
                            min={0}
                            decimals={2}
                            unitMesure="cm"
                        // className="max-w-[100px]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="height" className="dark:text-grey-90">{t('pageSetup.component.customPaperSize.height')}</label>
                        <TextField
                            id="height"
                            type="number"
                            onChange={e => setHeight(parseFloat(e.target.value))}
                            value={height}
                            min={0}
                            decimals={2}
                            unitMesure="cm"
                        // className="max-w-[100px]"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default CustomWidthHeightModal