import React, { memo, useCallback, useMemo, useReducer, useState } from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import Button from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/modal";
import { separatorReducer } from "./ReferenceFormatReducer";
import Separators from "./ReferenceFormatSeparators";
import ReadingTypes from "./ReferenceFormatReadingTypes";
import GuideColors from "./ReferenceFormatGuideColors";
import { cn } from "@/lib/utils";
import Notes from "./ReferenceFormatNotes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { READING_TYPE_MAX_LENGTH, READING_TYPE_MIN_LENGTH, SEPARATOR_MAX_LENGTH, SEPARATOR_MIN_LENGTH } from "./ReferenceFormatConstants";

interface ReferencesFormatModalProps {
    initialConfigs: ReferencesFormat;
    isOpen: boolean;
    onCancel: () => void;
    onSave: (data: ReferencesFormat, apply?: boolean) => void;
}

const ReferencesFormatModal: React.FC<ReferencesFormatModalProps> = ({ isOpen, onCancel, onSave, initialConfigs }) => {
    const { t } = useTranslation();

    const [tab, setTab] = useState('separators');
    const [state, dispatch] = useReducer(separatorReducer, initialConfigs);

    const isDisabled = useMemo(() => {
        return !(
            state.add_reading_type.value.length >= READING_TYPE_MIN_LENGTH &&
            state.add_reading_type.value.length <= READING_TYPE_MAX_LENGTH
        ) || !(
            state.del_reading_type.value.length >= READING_TYPE_MIN_LENGTH &&
            state.del_reading_type.value.length <= READING_TYPE_MAX_LENGTH
        ) || !(
            state.om_reading_type.value.length >= READING_TYPE_MIN_LENGTH &&
            state.om_reading_type.value.length <= READING_TYPE_MAX_LENGTH
        ) || !(
            state.tr_reading_type.value.length >= READING_TYPE_MIN_LENGTH &&
            state.tr_reading_type.value.length <= READING_TYPE_MAX_LENGTH
        ) || (
                state.lemma_separator.isCustom &&
                !(
                    state.lemma_separator.value.length >= SEPARATOR_MIN_LENGTH &&
                    state.lemma_separator.value.length <= SEPARATOR_MAX_LENGTH
                )
            ) || (
                state.from_to_separator.isCustom &&
                !(
                    state.from_to_separator.value.length >= SEPARATOR_MIN_LENGTH &&
                    state.from_to_separator.value.length <= SEPARATOR_MAX_LENGTH
                )
            ) || (
                state.apparatus_separator.isCustom &&
                !(
                    state.apparatus_separator.value.length >= SEPARATOR_MIN_LENGTH &&
                    state.apparatus_separator.value.length <= SEPARATOR_MAX_LENGTH
                )
            ) || (
                state.readings_separator.isCustom &&
                !(
                    state.readings_separator.value.length >= SEPARATOR_MIN_LENGTH &&
                    state.readings_separator.value.length <= SEPARATOR_MAX_LENGTH
                )
            )
    }, [state]);

    // const onSaveClick = useCallback(() => {
    //     onSave(state);
    // }, [onSave, state]);

    const onSaveAndApplyClick = useCallback(() => {
        onSave(state, true);
    }, [onSave, state]);

    return (
        <Modal
            key={"references-format-modal"}
            isOpen={isOpen}
            onOpenChange={onCancel}
            onClose={onCancel}
            title={t("referencesFormat.title", "References Format")}
            className="max-w-[900px] h-[90%] max-h-[560px] overflow-hidden gap-0 flex flex-col"
            contentClassName={cn("flex flex-col gap-8 px-4 pt-4 overflow-hidden flex-1", (tab === 'guideColors' || tab === 'notes') ? '' : 'pb-10')}
            footerClassName='h-[auto] py-4'
            headerClassName="py-2 h-12 leading-[18px] items-center justify-center"
            showCloseIcon={true}
            actions={[
                <Button key="cancel" className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"secondary"} variant={"tonal"} onClick={onCancel}>{t('buttons.cancel')}</Button>,
                // <Button key="save" disabled={isDisabled} aria-disabled={isDisabled} className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-24" size="mini" intent={"primary"} onClick={onSaveClick}>
                //     {t('buttons.save')}
                // </Button>,
                <Button key="saveAndApply" disabled={isDisabled} aria-disabled={isDisabled} className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" size="mini" intent={"primary"} onClick={onSaveAndApplyClick}>
                    {t('buttons.saveAndApply')}
                </Button>
            ]}
        >
            <TooltipProvider>
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
            </TooltipProvider>
        </Modal>
    );
};

export default memo(ReferencesFormatModal);
