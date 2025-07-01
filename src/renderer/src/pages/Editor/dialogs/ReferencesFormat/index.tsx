import React, { memo, useCallback, useReducer, useState } from "react";
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
import ReadingTypes from "./ReadingTypes";
import GuideColors from "./GuideColors";
import { cn } from "@/lib/utils";
import Notes from "./Notes";

interface ReferencesFormatModalProps {
    initialConfigs: ReferencesFormat;
    isOpen: boolean;
    onCancel: () => void;
    handleSave: (data: ReferencesFormat) => void;
}

const ReferencesFormatModal: React.FC<ReferencesFormatModalProps> = ({ isOpen, onCancel, handleSave, initialConfigs }) => {
    const { t } = useTranslation();

    const [tab, setTab] = useState('separators');
    const [state, dispatch] = useReducer(separatorReducer, initialConfigs);

    const handleSaveClick = useCallback(() => {
        handleSave(state);
    }, [handleSave, state]);

    return (
        <Modal
            key={"references-format-modal"}
            isOpen={isOpen}
            onOpenChange={onCancel}
            title={t("referencesFormat.title", "References Format")}
            className="max-w-[900px] h-[90%] max-h-[560px] overflow-hidden gap-0 flex flex-col"
            contentClassName={cn("flex flex-col gap-8 px-4 pt-4 overflow-hidden flex-1", (tab === 'guideColors' || tab === 'notes') ? '' : 'pb-10')}
            footerClassName='h-[auto] py-4'
            headerClassName="py-2 h-12 leading-[18px] items-center justify-center"
            showCloseIcon={true}
            actions={[
                <Button key="cancel" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"secondary"} variant={"tonal"} onClick={onCancel}>{t('buttons.cancel')}</Button>,
                <Button key="save" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"primary"} onClick={handleSaveClick}>
                    {t('buttons.save')}
                </Button>
            ]}
        >
            <Tabs value={tab} onValueChange={setTab} className="w-full h-full overflow-hidden gap-6 flex flex-col">
                <TabsList className="grid grid-cols-4 w-full p-0 h-auto border">
                    <TabsTrigger className="border-grey-50 p-[1px] after:border-r after:rounded-none after:content-[''] after:h-[70%] after:w-px after:top-[15%] after:absolute after:right-0 relative" value="separators">{t("referencesFormat.tabs.separators", "Separators")}</TabsTrigger>
                    <TabsTrigger className="border-grey-50 p-[1px] after:border-r after:rounded-none after:content-[''] after:h-[70%] after:w-px after:top-[15%] after:absolute after:right-0 relative" value="readingTypes">{t("referencesFormat.tabs.readingTypes", "Reading types")}</TabsTrigger>
                    <TabsTrigger className="border-grey-50 p-[1px] after:border-r after:rounded-none after:content-[''] after:h-[70%] after:w-px after:top-[15%] after:absolute after:right-0 relative" value="guideColors">{t("referencesFormat.tabs.guideColors", "Guide colors")}</TabsTrigger>
                    <TabsTrigger className="border-grey-50 p-[1px]" value="notes">{t("referencesFormat.tabs.notes", "Notes")}</TabsTrigger>
                </TabsList>
                <TabsContent value="separators" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-auto h-[calc(100%-28px-16px)]">
                    <Separators key="separators" state={state} dispatch={dispatch} />
                </TabsContent>
                <TabsContent value="readingTypes" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-auto h-[calc(100%-28px-16px)]">
                    <ReadingTypes key="readingTypes" state={state} dispatch={dispatch} />
                </TabsContent>
                <TabsContent value="guideColors" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-auto h-[calc(100%-28px-16px)]">
                    <GuideColors key="guideColors" state={state} dispatch={dispatch} />
                </TabsContent>
                <TabsContent value="notes" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-auto h-[calc(100%-28px-16px)]">
                    <Notes key="notes" state={state} dispatch={dispatch} />
                </TabsContent>
            </Tabs>
        </Modal>
    );
};

export default memo(ReferencesFormatModal);
