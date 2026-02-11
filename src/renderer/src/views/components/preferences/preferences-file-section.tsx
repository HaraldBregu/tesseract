import { memo } from "react";
import Button from "@/components/ui/button";
import AppRadioGroup from "@/components/app-radiogroup";
import AppSeparator from "@/components/app/app-separator";
import Folder from "@/components/icons/Folder";
import TextField from "@/components/ui/textField";
import Typography from "@/components/Typography";
import { getAutomaticSaveOptions, getFileSavingOptions } from "@/utils/utils";

interface PreferencesFileSectionProps {
    readonly t: (key: string) => string;
    readonly fileSavingDirectory: string;
    readonly setFileSavingDirectory: (value: string) => void;
    readonly defaultDirectory: string;
    readonly setDefaultDirectory: (value: string) => void;
    readonly automaticFileSave: string;
    readonly setAutomaticFileSave: (value: string) => void;
    readonly onSelectDirectory: () => void;
}

export const PreferencesFileSection = memo(function PreferencesFileSection({
    t,
    fileSavingDirectory,
    setFileSavingDirectory,
    defaultDirectory,
    setDefaultDirectory,
    automaticFileSave,
    setAutomaticFileSave,
    onSelectDirectory,
}: PreferencesFileSectionProps) {
    return (
        <div className="space-y-6">
            {/* File saving directory */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t("preferences.file.fileSavingDirectory.title")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <div className="space-y-2">
                        <AppRadioGroup
                            items={getFileSavingOptions(t).map((option) => ({
                                value: option.value,
                                label: option.label,
                                className: "text-[13px]",
                            }))}
                            value={fileSavingDirectory}
                            onValueChange={setFileSavingDirectory}
                        />
                        <div className="ml-6 mt-2">
                            <TextField
                                id="defaultDirectory"
                                type="text"
                                value={defaultDirectory}
                                disabled={fileSavingDirectory !== "default"}
                                onChange={(event) => setDefaultDirectory(event.target.value)}
                                placeholder={t("preferences.file.selectPath")}
                                className="text-[11px]"
                                rightIcon={
                                    <Button
                                        size="mini"
                                        intent="secondary"
                                        variant="icon"
                                        onClick={onSelectDirectory}
                                    >
                                        <Folder variant="tonal" intent="secondary" size="small" />
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AppSeparator />

            {/* Automatic file save */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex justify-end">
                    <Typography component="h3" className="text-[14px] font-semibold mb-3">
                        {t("preferences.file.automaticFileSave.title")}
                    </Typography>
                </div>
                <div className="col-span-8">
                    <AppRadioGroup
                        items={getAutomaticSaveOptions(t).map((option) => ({
                            value: option.value,
                            label: option.label,
                            className: "text-[13px]",
                        }))}
                        value={automaticFileSave}
                        onValueChange={setAutomaticFileSave}
                    />
                </div>
            </div>
            <AppSeparator />
        </div>
    );
});
