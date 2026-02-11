import { Fragment, memo } from "react";
import Typography from "@/components/Typography";
import {
    AppSelect,
    AppSelectContent,
    AppSelectItem,
    AppSelectSeparator,
    AppSelectTrigger,
    AppSelectValue,
} from "@/components/app/app-select";
import List from "@/components/app/list";
import { dateFormatOptions, languageOptions, timeFormatOptions } from "@/utils/utils";

interface PreferencesLanguageSectionProps {
    readonly t: (key: string) => string;
    readonly criterionLanguage: string;
    readonly setCriterionLanguage: (value: string) => void;
    readonly dateFormat: string;
    readonly setDateFormatHandler: (value: string) => void;
    readonly timeFormat: string;
    readonly setTimeFormatHandler: (value: string) => void;
}

export const PreferencesLanguageSection = memo(function PreferencesLanguageSection({
    t,
    criterionLanguage,
    setCriterionLanguage,
    dateFormat,
    setDateFormatHandler,
    timeFormat,
    setTimeFormatHandler,
}: PreferencesLanguageSectionProps) {
    return (
        <div className="space-y-6">
            {/* Criterion Language */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[13px] font-semibold">
                        {t("preferences.language.criterionLanguage")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="w-60 border border-grey-70 rounded-md">
                        <AppSelect value={criterionLanguage} onValueChange={setCriterionLanguage}>
                            <AppSelectTrigger
                                aria-label="Date Format"
                                className="border-none min-w-[192px] bg-transparent p-1"
                            >
                                <AppSelectValue />
                            </AppSelectTrigger>
                            <AppSelectContent>
                                <List
                                    data={languageOptions}
                                    renderItem={(data, index) => (
                                        <Fragment key={index}>
                                            {index > 0 && <AppSelectSeparator />}
                                            {data && (
                                                <AppSelectItem value={data.value}>
                                                    {data.label}
                                                </AppSelectItem>
                                            )}
                                        </Fragment>
                                    )}
                                />
                            </AppSelectContent>
                        </AppSelect>
                    </div>
                </div>
            </div>
            {/* Date format */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[13px] font-semibold">
                        {t("preferences.language.dateFormat")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="w-60 border border-grey-70 rounded-md">
                        <AppSelect value={dateFormat} onValueChange={setDateFormatHandler}>
                            <AppSelectTrigger
                                aria-label="Date Format"
                                className="border-none min-w-[192px] bg-transparent p-1"
                            >
                                <AppSelectValue />
                            </AppSelectTrigger>
                            <AppSelectContent>
                                <List
                                    data={dateFormatOptions}
                                    renderItem={(data, index) => (
                                        <Fragment key={index}>
                                            {index > 0 && <AppSelectSeparator />}
                                            {data && (
                                                <AppSelectItem value={data.value}>
                                                    {data.label}
                                                </AppSelectItem>
                                            )}
                                        </Fragment>
                                    )}
                                />
                            </AppSelectContent>
                        </AppSelect>
                    </div>
                </div>
            </div>
            {/* Time format */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[13px] font-semibold">
                        {t("preferences.language.timeFormat")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="w-60 border border-grey-70 rounded-md">
                        <AppSelect value={timeFormat} onValueChange={setTimeFormatHandler}>
                            <AppSelectTrigger
                                aria-label="Date Format"
                                className="border-none min-w-[192px] bg-transparent p-1"
                            >
                                <AppSelectValue />
                            </AppSelectTrigger>
                            <AppSelectContent>
                                <List
                                    data={timeFormatOptions}
                                    renderItem={(data, index) => (
                                        <Fragment key={index}>
                                            {index > 0 && <AppSelectSeparator />}
                                            {data && (
                                                <AppSelectItem value={data.value}>
                                                    {data.label}
                                                </AppSelectItem>
                                            )}
                                        </Fragment>
                                    )}
                                />
                            </AppSelectContent>
                        </AppSelect>
                    </div>
                </div>
            </div>
        </div>
    );
});
