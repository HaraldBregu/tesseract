import React, { useReducer, useState } from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import Button from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/modal";
import { separatorReducer } from "./reducer";
import Separators from "./Separators";
import { ReferencesFormatState } from "./types";
import { defaultConfigs } from "./initial";

interface ReferencesFormatModalProps {
    initialConfigs?: ReferencesFormatState;
    isOpen: boolean;
    onCancel: () => void;
    handleSave: (data: ReferencesFormatState) => void;
}

const ReferencesFormatModal: React.FC<ReferencesFormatModalProps> = ({ isOpen, onCancel, handleSave, initialConfigs = defaultConfigs }) => {
    const { t } = useTranslation();

    const [tab, setTab] = useState('separators');
    const [state, dispatch] = useReducer(separatorReducer, initialConfigs);

    return (
        <Modal
            key={"references-format-modal"}
            isOpen={isOpen}
            onOpenChange={onCancel}
            title={t("referencesFormat.title", "References Format")}
            className="max-w-[900px] h-[90%] max-h-[521px] overflow-hidden gap-0 flex flex-col"
            contentClassName="flex flex-col gap-8 px-4 pt-4 pb-10 overflow-hidden flex-1"
            footerClassName='h-[auto] py-4'
            headerClassName="py-2 h-12 leading-[18px] items-center justify-center"
            showCloseIcon={true}
            actions={[
                <Button key="cancel" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"secondary"} variant={"tonal"} onClick={onCancel}>{t('buttons.cancel')}</Button>,
                <Button key="save" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"primary"} onClick={() => handleSave(state)}>
                    {t('buttons.save')}
                </Button>
            ]}
        >
            <Tabs value={tab} onValueChange={setTab} className="w-full h-full overflow-hidden">
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger className="border-grey-50" value="separators">{t("referencesFormat.tabs.separators", "Separators")}</TabsTrigger>
                    <TabsTrigger className="border-grey-50" value="readingTypes">{t("referencesFormat.tabs.readingTypes", "Reading types")}</TabsTrigger>
                    <TabsTrigger className="border-grey-50" value="guideColors">{t("referencesFormat.tabs.guideColors", "Guide colors")}</TabsTrigger>
                    <TabsTrigger className="border-grey-50" value="notes">{t("referencesFormat.tabs.notes", "Notes")}</TabsTrigger>
                </TabsList>
                <TabsContent value="separators" className="mt-6 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Separators state={state} dispatch={dispatch} />
                </TabsContent>
            </Tabs>
        </Modal>
    );
};

export default ReferencesFormatModal;
