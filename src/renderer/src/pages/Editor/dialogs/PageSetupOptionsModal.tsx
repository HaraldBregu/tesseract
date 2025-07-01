import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useEffect, useState } from "react";
import { StandardPageDimensionsState } from "@/pages/editor/store/layout/layout.state";
import { selectLayoutSettings, selectLayoutStandardPageDimensions } from "@/pages/editor/store/layout/layout.selector";
import { useDispatch, useSelector } from "react-redux";
import PageOrientation from "@/components/page-orientation";
import PaperSize from "@/components/paper-size";
import { t } from "i18next";
import SelectMarginBox from "@/components/select-margin-box";
import { Label } from "@/components/ui/label";
import { updatePageSetupOptions } from "@/pages/editor/store/layout/layout.sclice";
import CustomWidthHeightModal from "./PageSetupDialog/components/custom-width-height-modal";
import AppSeparator from "@/components/app/app-separator";


interface IPageSetupOptionsModal {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const PageSetupOptionsModal = ({ isOpen, setIsOpen }: IPageSetupOptionsModal) => {
    const dispatch = useDispatch();

    //redux states
    const standardPageDimensions: StandardPageDimensionsState[] = useSelector(
        selectLayoutStandardPageDimensions
    );
    const { setupOption } = useSelector(selectLayoutSettings);


    //state to save data from setup page form
    const [paperSizeData, setPaperSizeData] = useState<string>(setupOption.paperSize_name);
    const [paperSizeDataCustom, setPaperSizeDataCustom] = useState<{ name: string, height: number, width: number }>({ name: '', height: 0, width: 0 });
    const [selectedOrientation, setSelectedOrientation] = useState<"horizontal" | "vertical">(setupOption.paperSize_orientation);
    const [header, setHeader] = useState<{ checked: boolean, value: number }>({ checked: setupOption.header_show, value: setupOption.header_weight })
    const [footer, setFooter] = useState<{ checked: boolean, value: number }>({ checked: setupOption.footer_show, value: setupOption.footer_weight })
    const [marginTop, setMarginTop] = useState<{ checked: boolean, value: number }>({ checked: false, value: setupOption.margin_top })
    const [marginBottom, setMarginBottom] = useState<{ checked: boolean, value: number }>({ checked: false, value: setupOption.margin_bottom })
    const [marginLeft, setMarginLeft] = useState<{ checked: boolean, value: number }>({ checked: false, value: setupOption.margin_left })
    const [marginRight, setMarginRight] = useState<{ checked: boolean, value: number }>({ checked: false, value: setupOption.margin_right })
    const [innerMargin, setInnerMargin] = useState<{ checked: boolean, value: number }>({ checked: setupOption.innerMarginNote_show, value: setupOption.innerMarginNote_weight })
    const [outerMargin, setOuterMargin] = useState<{ checked: boolean, value: number }>({ checked: setupOption.outerMarginNote_show, value: setupOption.outerMarginNote_weight })
    const [openCustomWidthHeight, setOpenCustomWidthHeight] = useState(false);

    // @REFACTOR: useCallback
    const handleSubmit = () => {
        const optionPayload = {
            ...setupOption,
            paperSize_name: paperSizeData,
            paperSize_width: paperSizeData === 'custom' ? paperSizeDataCustom.width : standardPageDimensions.find(({ name }) => (name === paperSizeData))?.width || setupOption.paperSize_width,
            paperSize_height: paperSizeData === 'custom' ? paperSizeDataCustom.height : standardPageDimensions.find(({ name }) => (name === paperSizeData))?.height || setupOption.paperSize_height,
            paperSize_orientation: selectedOrientation,
            header_show: header.checked,
            header_weight: header.value,
            footer_show: footer.checked,
            footer_weight: footer.value,
            margin_top: marginTop.value,
            margin_bottom: marginBottom.value,
            margin_left: marginLeft.value,
            margin_right: marginRight.value,
            innerMarginNote_show: innerMargin.checked,
            innerMarginNote_weight: innerMargin.value,
            outerMarginNote_show: outerMargin.checked,
            outerMarginNote_weight: outerMargin.value,
        }
        dispatch(updatePageSetupOptions(optionPayload));
        setIsOpen(false);
        setOpenCustomWidthHeight(false);
    }

    // @REFACTOR: useCallback
    const handleClose = () => {
        setOpenCustomWidthHeight(false);
        paperSizeDataCustom.name.length > 0 && setPaperSizeDataCustom({ name: '', height: 0, width: 0 })
        setIsOpen(false);
    }


    useEffect(() => {
        if (isOpen) {
            setPaperSizeDataCustom(setupOption.paperSize_name === 'custom' ? { name: 'custom', height: setupOption.paperSize_height, width: setupOption.paperSize_width } : { name: '', height: 0, width: 0 })
            setPaperSizeData(setupOption.paperSize_name);
            setSelectedOrientation(setupOption.paperSize_orientation);
            setHeader({ checked: setupOption.header_show, value: setupOption.header_weight });
            setFooter({ checked: setupOption.footer_show, value: setupOption.footer_weight });
            setMarginTop({ checked: false, value: setupOption.margin_top });
            setMarginBottom({ checked: false, value: setupOption.margin_bottom });
            setMarginLeft({ checked: false, value: setupOption.margin_left });
            setMarginRight({ checked: false, value: setupOption.margin_right });
            setInnerMargin({ checked: setupOption.innerMarginNote_show, value: setupOption.innerMarginNote_weight });
            setOuterMargin({ checked: setupOption.outerMarginNote_show, value: setupOption.outerMarginNote_weight });
        }
    }, [isOpen, setupOption]);

    return (
        <Modal
            title={t("pageSetup.component.accordionSetup.title")}
            isOpen={isOpen}
            className="w-[50rem] h-[90%] overflow-hidden"
            onOpenChange={() => { }}
            actions={[
                <Button
                    key="cancel"
                    onClick={handleClose}
                    className="w-24 items-center justify-center"
                    size="mini"
                    intent="secondary"
                    variant="tonal"
                >
                    {t("buttons.cancel")}
                </Button>,
                <Button
                    key="save"
                    onClick={handleSubmit}
                    className="w-24 items-center justify-center"
                    size="mini"
                    intent={"primary"}
                >
                    {t("buttons.save")}
                </Button>,
            ]}
            footerClassName="!flex-1 items-center !max-h-5/6"
            contentClassName="overflow-y-auto h-full"
        >
            <div className="flex flex-col gap-6 h-full">
                <PaperSize
                    label={t("pageSetup.component.accordionSetup.title")}
                    setOpenCustomWidthHeight={setOpenCustomWidthHeight}
                    setPaperSizeData={setPaperSizeData}
                    paperSizeData={paperSizeData}
                    standardPageDimensions={[...standardPageDimensions, { name: 'custom', height: 0, width: 0 }]}
                    setPaperSizeDataCustom={setPaperSizeDataCustom}
                />
                <AppSeparator />
                <PageOrientation
                    label={t("pageSetup.component.accordionSetup.size")}
                    selectedOrientation={selectedOrientation}
                    setSelectedOrientation={setSelectedOrientation}
                    standardPageDimensions={standardPageDimensions}
                    paperSizeData={paperSizeData}
                    paperSizeDataCustom={paperSizeDataCustom}
                />
                <AppSeparator />
                <div className="flex flex-row gap-14">
                    <SelectMarginBox
                        id="header"
                        checked={header?.checked}
                        value={header}
                        onChange={setHeader}
                        label={t("pageSetup.areas.header")}
                        isCheckedVisible={true}
                        labelBottom={t("pageSetup.position.top")}

                    />
                    <SelectMarginBox
                        id="footer"
                        checked={footer?.checked}
                        value={footer}
                        onChange={setFooter}
                        label={t("pageSetup.areas.footer")}
                        isCheckedVisible={true}
                        labelBottom={t("pageSetup.position.bottom")}

                    />
                </div>
                <AppSeparator />
                <div className="flex flex-col gap-2">
                    <Label>{t("pageSetup.areas.documentMargin")}</Label>
                    <div className="flex flex-row gap-4">
                        <SelectMarginBox
                            id="top"
                            checked={false}
                            value={{ checked: false, value: marginTop.value }}
                            onChange={setMarginTop}
                            label={''}
                            isCheckedVisible={false}
                            labelBottom={t("pageSetup.position.top")}
                        />
                        <SelectMarginBox
                            id="bottom"
                            checked={false}
                            value={{ checked: false, value: marginBottom.value }}
                            onChange={setMarginBottom}
                            label={''}
                            isCheckedVisible={false}
                            labelBottom={t("pageSetup.position.bottom")}
                        /><SelectMarginBox
                            id="left"
                            checked={false}
                            value={{ checked: false, value: marginLeft.value }}
                            onChange={setMarginLeft}
                            label={''}
                            isCheckedVisible={false}
                            labelBottom={t("pageSetup.position.left")}

                        /><SelectMarginBox
                            id="right"
                            checked={false}
                            value={{ checked: false, value: marginRight.value }}
                            onChange={setMarginRight}
                            label={''}
                            isCheckedVisible={false}
                            labelBottom={t("pageSetup.position.right")}

                        />

                    </div>
                </div>
                <AppSeparator />
                <div className="flex flex-row  gap-6">
                    <SelectMarginBox
                        id="innermargin"
                        checked={innerMargin.checked}
                        value={innerMargin}
                        onChange={setInnerMargin}
                        label={t("pageSetup.areas.innerMarginNote")}
                        isCheckedVisible={true}
                    /><SelectMarginBox
                        id="outermargin"
                        checked={outerMargin.checked}
                        value={outerMargin}
                        onChange={setOuterMargin}
                        label={t("pageSetup.areas.outerMarginNote")}
                        isCheckedVisible={true}
                    />
                </div>
            </div>
            <CustomWidthHeightModal
                open={openCustomWidthHeight}
                onDone={(payload) => { setPaperSizeDataCustom(payload); }}
            />
        </Modal>
    )
}


export default PageSetupOptionsModal