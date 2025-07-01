import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { ReferencesAction, setNotesNumberFormat, setNotesNumeration, setNotesSectionStyle } from "./action";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallback } from "react";
import { NUMERATION_OPTIONS, SECTION_LEVELS } from "./constants";
import { cn } from "@/lib/utils";
import { levelFormat } from "@/utils/optionsEnums";
import AppSeparator from "@/components/app/app-separator";

interface NoteProps {
    state: ReferencesFormat;
    dispatch: (action: ReferencesAction) => void;
}

const NotesSection: React.FC<{
    sectionTitle: string;
    sectionKey: NoteKeys;
    sectionConfig: NotesConfig;
    dispatch: (action: ReferencesAction) => void;
}> = ({ sectionTitle, sectionKey, sectionConfig, dispatch }) => {
    const { t } = useTranslation();

    const handleNumerationChange = useCallback((value: string) => {
        dispatch(setNotesNumeration(sectionKey, value));
    }, [sectionKey, dispatch]);

    const handleSectionLevelChange = useCallback((value: string) => {
        dispatch(setNotesSectionStyle(sectionKey, value));
    }, [sectionKey, dispatch]);

    const handleNumberFormatChange = useCallback((value: string) => {
        dispatch(setNotesNumberFormat(sectionKey, value));
    }, [sectionKey, dispatch]);

    return (
        <div className="flex flex-col gap-4">
            <Label className="text-secondary-30 text-lg font-bold leading-6 dark:text-foreground">
                {t(sectionTitle)}
            </Label>
            <div className="flex flex-row gap-10">
                <div className="flex flex-col gap-2 min-w-[260px]">
                    <Label className="text-secondary-30 text-[13px] font-semibold leading-[15px] dark:text-foreground">
                        {t("referencesFormat.numerationTitle", "Numeration")}
                    </Label>
                    <RadioGroup
                        value={sectionConfig.numeration}
                        onValueChange={handleNumerationChange}
                        className="flex flex-col gap-2"
                    >
                        {NUMERATION_OPTIONS.map(option => {
                            return sectionKey === 'section_note' && option.value === "page" ? null : (
                                <div key={option.value} className="flex items-center gap-2 px-[2px]">
                                    <RadioGroupItem
                                        value={option.value}
                                        id={`${sectionKey}-numeration-${option.value}`}
                                        className={
                                            cn('border-grey-50 shadow-none h-6 w-6', option.value === sectionConfig.numeration
                                                ? "border-primary-50 ring-primary-50 ring-2 ring-offset-0"
                                                : "")
                                        }
                                        style={{ position: "relative" }}
                                    />
                                    <Label
                                        htmlFor={`${sectionKey}-numeration-${option.value}`}
                                        className="text-secondary-30 text-[13px] font-semibold leading-[15px] dark:text-grey-80 hover:cursor-pointer"
                                    >
                                        {t(option.label)}
                                    </Label>
                                    {option.value === "section" && (
                                        <Select
                                            value={sectionConfig.sectionLevel}
                                            onValueChange={handleSectionLevelChange}
                                        >
                                            <SelectTrigger className="ml-2 w-[120px] h-8 leading-[18px] dark:text-grey-80 hover:cursor-pointer" disabled={sectionConfig.numeration !== "section"}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="dark:text-grey-80">
                                                {SECTION_LEVELS.map(level => (
                                                    <SelectItem className="dark:text-grey-80 hover:cursor-pointer" key={level.value} value={level.value}>
                                                        {t(level.label)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )
                        }
                        )}
                    </RadioGroup>
                </div>
                <div className="flex flex-col gap-2 min-w-[156px]">
                    <Label className="text-secondary-30 text-[13px] font-semibold leading-[15px] dark:text-foreground hover:cursor-pointer">
                        {t("referencesFormat.numberFormat", "Number format")}
                    </Label>
                    <Select
                        value={sectionConfig.numberFormat}
                        onValueChange={handleNumberFormatChange}
                    >
                        <SelectTrigger className="w-full dark:text-grey-80">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {levelFormat.map(format => (
                                <SelectItem className="dark:text-grey-80 hover:cursor-pointer" key={format.value} value={format.value}>
                                    {format.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

const Notes: React.FC<NoteProps> = ({
    state,
    dispatch
}) => {
    return (
        <div className="flex flex-col gap-6">
            <NotesSection
                sectionTitle="referencesFormat.pageNotes"
                sectionKey="page_note"
                sectionConfig={state.page_note}
                dispatch={dispatch}
            />
            <AppSeparator />
            <NotesSection
                sectionTitle="referencesFormat.sectionNotes"
                sectionKey="section_note"
                sectionConfig={state.section_note}
                dispatch={dispatch}
            />
        </div>
    );
}

export default Notes;