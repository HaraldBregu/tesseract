import { useCallback, useEffect, useState } from "react";
import Button from "./ui/button";
import Divider from "./ui/divider";
import Modal from "./ui/modal";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AppRadioGroup from "./app-radiogroup";
import Typography from "./Typography";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { sectionTypes } from "@/utils/optionsEnums";
import { updateLineNumberSettings } from "@/pages/editor/store/pagination/pagination.slice";
import { selectLineNumberSettings } from "@/pages/editor/store/pagination/pagination.selector";

interface LineNumberModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const LineNumberModal = ({ isOpen, setIsOpen }: LineNumberModalProps) => {
    const { t } = useTranslation();
    const lineNumberSettings = useSelector(selectLineNumberSettings);
    const dispatch = useDispatch();
    const [settings, setSettings] = useState({
        showLines: 0,
        linesNumeration: 1,
        sectionLevel: 1,
    });

    useEffect(() => {
        // console.log("🚀 ~ LineNumberModal ~ lineNumberSettings:", lineNumberSettings)
        setSettings(prev => ({
            ...prev,
            ...lineNumberSettings
        }))
    }, [lineNumberSettings])

    const submitHandler = useCallback(() => {
        dispatch(updateLineNumberSettings(settings));
        setIsOpen(false);
    }, [dispatch, settings, setIsOpen]);

    const selectSectionLevel = () => {
        return <Select
            onValueChange={(value) => setSettings(prev => ({ ...prev, sectionLevel: parseInt(value) }))}
            value={settings.sectionLevel?.toString()}
            disabled={settings.linesNumeration !== 3}
        >
            <SelectTrigger className="w-[120px] shadow-none focus:ring-0 focus:ring-offset-0 font-[400] text-[14px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {sectionTypes.map((type, index) => (
                    <SelectItem
                        className="font-thin"
                        value={type.value.toString()}
                        key={`${type.value}-${index}`}>
                        <span> {t(type.label)}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    }

    return <Modal
        key={"line-number-modal"}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={t('lineNumber.label')}
        className="min-w-[600px]"
        actions={[
            <Button key="cancel" className="w-24" size="mini" intent={"secondary"} variant={"tonal"} onClick={() => setIsOpen(false)}>{t('buttons.cancel')}</Button>,
            <Button key="save" className="w-24" size="mini" intent={"primary"} onClick={() => submitHandler()}>{t('buttons.done')}</Button>
        ]}
    >
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <Typography component="h6" className="text-[18px] font-bold">{t('lineNumber.show.label')}</Typography>
                    <Typography component="p" className="text-[13px]">{t('lineNumber.show.description')}</Typography>
                </div>
                <AppRadioGroup
                    items={[
                        { label: t('lineNumber.show.none'), value: '0', className: "text-[13px] font-[600]" },
                        { label: t('lineNumber.show.everyFive'), value: '5', className: "text-[13px] font-[600]" },
                        { label: t('lineNumber.show.everyTen'), value: '10', className: "text-[13px] font-[600]" },
                        { label: t('lineNumber.show.everyFifteen'), value: '15', className: "text-[13px] font-[600]" },
                    ]}
                    value={settings?.showLines?.toString()}
                    onValueChange={(value) => {
                        setSettings((prev) => ({ ...prev, showLines: parseInt(value) }));
                    }}
                />
            </div>
            <Divider orientation="horizontal" />
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <Typography component="p" className="text-[13px] font-bold">{t('lineNumber.numeration')}</Typography>
                </div>
                <AppRadioGroup
                    items={[
                        { label: t('lineNumber.whole'), value: '1', className: "text-[13px] font-[600]" },
                        { label: t('lineNumber.everyPage'), value: '2', className: "text-[13px] font-[600]" },
                        { label: <>{t('lineNumber.everySection')} {selectSectionLevel()}</>, value: '3', className: "text-[13px] font-[600]" },
                    ]}
                    value={settings.linesNumeration.toString()}
                    onValueChange={(value) => {
                        setSettings((prev) => ({ ...prev, linesNumeration: parseInt(value) }));
                    }}
                />
            </div>
        </div>
    </Modal>
}

export default LineNumberModal;