import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useEffect, useState, useCallback } from "react";
import PageOrientation from "@/components/page-orientation";
import PaperSize from "@/components/paper-size";
import { t } from "i18next";
import SelectMarginBox from "@/components/select-margin-box";
import { Label } from "@/components/ui/label";
import CustomWidthHeightModal from "./LayoutSetup/components/custom-width-height-modal";
import AppSeparator from "@/components/app/app-separator";
import Pencil from "@/components/icons/Pencil";


const standardPageDimensions: StandardPageDimension[] = [
    {
        name: 'A3',
        width: 29.7,
        height: 42,
    },
    {
        name: 'A4',
        width: 21.0,
        height: 29.7,
    },
    {
        name: 'A5',
        width: 14.8,
        height: 21,
    },
    {
        name: 'A6',
        width: 10.5,
        height: 14.8,
    }
]
interface PageSetupProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    onSave: (pageSetup: SetupOptionType) => void
}

const PageSetup = ({
    isOpen,
    setIsOpen,
    onSave,
}: PageSetupProps) => {
    const [openCustomWidthHeight, setOpenCustomWidthHeight] = useState(false);
    const [paperSizeDataCustom, setPaperSizeDataCustom] = useState<{
        name: string,
        height: number,
        width: number,
    }>({
        name: '',
        height: 0,
        width: 0,
    });
    const [optSetup, setOptSetup] = useState<SetupOptionType>({
        "template_type": "Personal",
        "paperSize_name": "A4",
        "paperSize_width": 24,
        "paperSize_height": 16,
        "paperSize_orientation": "vertical",
        "header_show": true,
        "header_weight": 1.25,
        "footer_show": true,
        "footer_weight": 1.25,
        "margin_top": 1.25,
        "margin_bottom": 1.25,
        "margin_left": 1.25,
        "margin_right": 1.25,
        "innerMarginNote_show": true,
        "innerMarginNote_weight": 0.5,
        "outerMarginNote_show": true,
        "outerMarginNote_weight": 0.5
    });

    useEffect(() => {
        const loadPageSetup = async () => {
            const pageSetup = await window.doc.getPageSetup();
            setPaperSizeDataCustom(
                pageSetup.paperSize_name === 'custom'
                    ? { name: 'custom', height: pageSetup.paperSize_height, width: pageSetup.paperSize_width }
                    : { name: '', height: 0, width: 0 })
            setOptSetup(pageSetup);
        }
        loadPageSetup();
        return () => {
            setPaperSizeDataCustom({ name: '', height: 0, width: 0 })
        }
    }, []);

    const handleSubmit = useCallback(() => {
        const optionPayload = optSetup;
        onSave(optionPayload);
        setIsOpen(false);
        setOpenCustomWidthHeight(false);
    }, [optSetup]);

    const handleClose = useCallback(() => {
        setOpenCustomWidthHeight(false);
        setIsOpen(false);
    }, [setOpenCustomWidthHeight, setIsOpen]);


    return (
        <Modal
            title={t("pageSetup.component.accordionSetup.title")}
            isOpen={isOpen}
            className="w-full max-w-[90vw] lg:max-w-2xl max-h-[90vh]"
            onOpenChange={handleClose}
            showCloseIcon={true}
            onClose={handleClose}
            actions={[
                <Button
                    key="cancel"
                    onClick={handleClose}
                    className="w-20 lg:w-24 items-center justify-center"
                    size="mini"
                    intent="secondary"
                    variant="tonal"
                >
                    {t("buttons.cancel")}
                </Button>,
                <Button
                    key="save"
                    onClick={handleSubmit}
                    className="w-20 lg:w-24 items-center justify-center"
                    size="mini"
                    intent={"primary"}
                >
                    {t("buttons.save")}
                </Button>,
            ]}
            footerClassName="flex justify-end gap-2 px-3 py-2 border-t flex-shrink-0"
            contentClassName="overflow-y-auto px-3 py-2 lg:px-6 lg:py-4 max-h-[calc(90vh-8rem)]"
        >
            <div className="flex flex-col gap-2 lg:gap-6">
                <div className="flex items-start gap-2 w-full">
                    <div className="flex-1">
                        <PaperSize
                            label={t("pageSetup.component.accordionSetup.title")}
                            setOpenCustomWidthHeight={setOpenCustomWidthHeight}
                            setPaperSizeData={(paperSize) => {
                                if (paperSize === "custom") {
                                    setOpenCustomWidthHeight(true);
                                    return;
                                }

                                const isCustomPaperSize = paperSize === "custom"
                                const name = isCustomPaperSize ? paperSize : standardPageDimensions.find(({ name }) => paperSize === name)?.name;

                                setOptSetup((value) => ({
                                    ...value,
                                    paperSize_name: name as PaperSizeName,
                                    paperSize_width: standardPageDimensions.find(({ name }) => paperSize === name)?.width ?? 0,
                                    paperSize_height: standardPageDimensions.find(({ name }) => paperSize === name)?.height ?? 0,
                                }));
                            }}
                            paperSizeData={optSetup.paperSize_name}
                            standardPageDimensions={[
                                ...standardPageDimensions,
                                {
                                    name: 'custom',
                                    height: 0, width: 0
                                },
                            ]}
                            setPaperSizeDataCustom={setPaperSizeDataCustom}
                        />
                    </div>
                    {optSetup.paperSize_name === "custom" && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpenCustomWidthHeight(true);
                            }}
                            className="mt-6 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                            title={t("pageSetup.component.editCustom") || "Edit custom size"}
                        >
                            <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                    )}
                </div>
                <AppSeparator />
                <PageOrientation
                    label={t("pageSetup.component.accordionSetup.size")}
                    selectedOrientation={optSetup.paperSize_orientation}
                    setSelectedOrientation={(orientation) => {
                        setOptSetup((value) => ({
                            ...value,
                            paperSize_orientation: orientation as 'horizontal' | 'vertical',
                        }));
                    }}
                    standardPageDimensions={standardPageDimensions}
                    paperSizeData={optSetup.paperSize_name}
                    paperSizeDataCustom={paperSizeDataCustom}
                />
                <AppSeparator />
                <div className="flex flex-row flex-wrap gap-2 lg:gap-6">
                    <SelectMarginBox
                        id="header"
                        checked={optSetup.header_show}
                        value={{ checked: optSetup.header_show, value: optSetup.header_weight }}
                        onChange={(action: any) => {
                            setOptSetup((value) => ({
                                ...value,
                                header_show: action.checked,
                                header_weight: action.value,
                            }));
                        }}
                        label={t("pageSetup.areas.header")}
                        isCheckedVisible={true}
                        labelBottom={t("pageSetup.position.top")}

                    />
                    <SelectMarginBox
                        id="footer"
                        checked={optSetup.footer_show}
                        value={{ checked: optSetup.footer_show, value: optSetup.footer_weight }}
                        onChange={(action: any) => {
                            setOptSetup((value) => ({
                                ...value,
                                footer_show: action.checked,
                                footer_weight: action.value,
                            }));
                        }}
                        label={t("pageSetup.areas.footer")}
                        isCheckedVisible={true}
                        labelBottom={t("pageSetup.position.bottom")}

                    />
                </div>
                <AppSeparator />
                <div className="flex flex-col gap-1 lg:gap-2">
                    <Label>{t("pageSetup.areas.documentMargin")}</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                        <SelectMarginBox
                            id="top"
                            checked={false}
                            value={{ checked: false, value: optSetup.margin_top }}
                            onChange={(action: any) => {
                                setOptSetup((value) => ({
                                    ...value,
                                    margin_top: action.value,
                                }));
                            }}
                            label={''}
                            isCheckedVisible={false}
                            labelBottom={t("pageSetup.position.top")}
                        />
                        <SelectMarginBox
                            id="bottom"
                            checked={false}
                            value={{ checked: false, value: optSetup.margin_bottom }}
                            onChange={(action: any) => {
                                setOptSetup((value) => ({
                                    ...value,
                                    margin_bottom: action.value,
                                }));
                            }}
                            label={''}
                            isCheckedVisible={false}
                            labelBottom={t("pageSetup.position.bottom")}
                        />
                        <SelectMarginBox
                            id="left"
                            checked={false}
                            value={{ checked: false, value: optSetup.margin_left }}
                            onChange={(action: any) => {
                                setOptSetup((value) => ({
                                    ...value,
                                    margin_left: action.value,
                                }));
                            }}
                            label={''}
                            isCheckedVisible={false}
                            labelBottom={t("pageSetup.position.left")}
                        />
                        <SelectMarginBox
                            id="right"
                            checked={false}
                            value={{ checked: false, value: optSetup.margin_right }}
                            onChange={(action: any) => {
                                setOptSetup((value) => ({
                                    ...value,
                                    margin_right: action.value,
                                }));
                            }}
                            label={''}
                            isCheckedVisible={false}
                            labelBottom={t("pageSetup.position.right")}
                        />
                    </div>
                </div>
                <AppSeparator />
                <div className="flex flex-row gap-2 lg:gap-6">
                    <SelectMarginBox
                        id="marginNote"
                        checked={optSetup.innerMarginNote_show}
                        value={{ checked: optSetup.innerMarginNote_show, value: optSetup.innerMarginNote_weight }}
                        onChange={(action: any) => {
                            setOptSetup((value) => ({
                                ...value,
                                innerMarginNote_show: action.checked,
                                innerMarginNote_weight: action.value,
                                outerMarginNote_show: action.checked,
                                outerMarginNote_weight: action.value,
                            }));
                        }}
                        label={t("pageSetup.areas.marginNote")}
                        isCheckedVisible={true}
                    />
                </div>
            </div>
            <CustomWidthHeightModal
                open={openCustomWidthHeight}
                onDone={(payload) => {
                    setOpenCustomWidthHeight(false);
                    setPaperSizeDataCustom(payload);
                    setOptSetup((value) => ({
                        ...value,
                        paperSize_name: payload.name as PaperSizeName,
                        paperSize_width: payload.width,
                        paperSize_height: payload.height,
                    }));
                }}
                onClose={() => setOpenCustomWidthHeight(false)}
            />
        </Modal>
    )
}

export default PageSetup
