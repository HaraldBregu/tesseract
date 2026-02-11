import { memo } from "react";
import AppCheckbox from "@/components/app-checkbox";
import AppRadioGroup from "@/components/app-radiogroup";
import AppSeparator from "@/components/app/app-separator";
import TextField from "@/components/ui/textField";
import Typography from "@/components/Typography";
import { getFileNameOptions, getPdfQualityOptions } from "@/utils/utils";

interface PreferencesGeneralSectionProps {
    readonly t: (key: string) => string;
    readonly fileNameDisplay: "full" | "filename";
    readonly setFileNameDisplay: (value: "full" | "filename") => void;
    readonly rememberLayout: boolean;
    readonly setRememberLayout: (value: boolean) => void;
    readonly pdfQuality: string;
    readonly setPdfQuality: (value: string) => void;
    readonly recentFilesCount: number;
    readonly setRecentFilesCount: (value: number) => void;
}

export const PreferencesGeneralSection = memo(function PreferencesGeneralSection({
    t,
    fileNameDisplay,
    setFileNameDisplay,
    rememberLayout,
    setRememberLayout,
    pdfQuality,
    setPdfQuality,
    recentFilesCount,
    setRecentFilesCount,
}: PreferencesGeneralSectionProps) {
    return (
        <div className="space-y-6">
            {/* File name display */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t("preferences.general.fileNameDisplay.title")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppRadioGroup
                        items={getFileNameOptions(t).map((option) => ({
                            value: option.value,
                            label: option.label,
                            description: option.description,
                            className: "text-[13px]",
                        }))}
                        value={fileNameDisplay}
                        onValueChange={(value: string) =>
                            setFileNameDisplay(value as "full" | "filename")
                        }
                    />
                </div>
            </div>
            <AppSeparator />
            {/* Restore Criterion layout */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography
                        component="h3"
                        className="text-[14px] font-semibold mb-3 ml-24"
                    >
                        {t("preferences.general.restoreCriterionLayout.title")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="space-y-2">
                        <AppCheckbox
                            checked={rememberLayout}
                            onCheckedChange={setRememberLayout}
                            labelClassName="text-[14px]"
                            label={t(
                                "preferences.general.restoreCriterionLayout.rememberLastLayout"
                            )}
                        />
                        <Typography
                            component="p"
                            className="text-[11px] text-grey-50 dark:text-grey-70 ml-6"
                        >
                            {t(
                                "preferences.general.restoreCriterionLayout.rememberLastLayoutDescription"
                            )}
                        </Typography>
                    </div>
                </div>
            </div>
            <AppSeparator />
            {/* Pdf quality */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t("preferences.general.pdfQuality.title")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppRadioGroup
                        items={getPdfQualityOptions(t).map((option) => ({
                            value: option.value,
                            label: option.label,
                            className: "text-[13px]",
                        }))}
                        value={pdfQuality}
                        onValueChange={setPdfQuality}
                    />
                </div>
            </div>
            <AppSeparator />
            {/* Recent files to open */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t("preferences.general.recentFiles.title")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="flex items-center gap-3">
                        <TextField
                            id="recentFilesCount"
                            type="number"
                            min={1}
                            max={10}
                            value={recentFilesCount.toString()}
                            onChange={(event) =>
                                setRecentFilesCount(Number.parseInt(event.target.value, 10))
                            }
                            className="w-16"
                        />
                    </div>
                    <Typography
                        component="p"
                        className="text-[11px] text-grey-50 dark:text-grey-70 mt-2"
                    >
                        {t("preferences.general.recentFiles.description")}
                    </Typography>
                </div>
            </div>
        </div>
    );
});
