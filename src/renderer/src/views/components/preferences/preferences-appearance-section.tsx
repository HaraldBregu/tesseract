import { memo } from "react";
import AppRadioGroup from "@/components/app-radiogroup";
import AppSeparator from "@/components/app/app-separator";
import TextField from "@/components/ui/textField";
import Typography from "@/components/Typography";
import { getThemeOptions } from "@/utils/utils";

interface PreferencesAppearanceSectionProps {
    readonly t: (key: string) => string;
    readonly selectedTheme: "light" | "dark";
    readonly setSelectedTheme: (value: "light" | "dark") => void;
    readonly commentPreviewLimit: string;
    readonly setCommentPreviewLimit: (value: string) => void;
    readonly bookmarkPreviewLimit: string;
    readonly setBookmarkPreviewLimit: (value: string) => void;
}

export const PreferencesAppearanceSection = memo(
    function PreferencesAppearanceSection({
        t,
        selectedTheme,
        setSelectedTheme,
        commentPreviewLimit,
        setCommentPreviewLimit,
        bookmarkPreviewLimit,
        setBookmarkPreviewLimit,
    }: PreferencesAppearanceSectionProps) {
        return (
            <div className="space-y-6">
                {/* Theme */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4 flex justify-end">
                        <Typography component="h3" className="text-[14px] font-semibold mb-3">
                            {t("preferences.appearance.theme.title")}
                        </Typography>
                    </div>
                    <div className="col-span-8">
                        <AppRadioGroup
                            items={getThemeOptions(t).map((option) => ({
                                value: option.value,
                                label: option.label,
                                className: "text-[13px]",
                            }))}
                            value={selectedTheme}
                            onValueChange={(value: string) =>
                                setSelectedTheme(value as "light" | "dark")
                            }
                        />
                    </div>
                </div>

                <AppSeparator />

                {/* Comment preview character limit */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4 flex justify-end">
                        <Typography
                            component="h3"
                            className="text-[14px] font-semibold mb-3 ml-20"
                        >
                            {t("preferences.appearance.commentPreviewLimit.title")}
                        </Typography>
                    </div>
                    <div className="col-span-8">
                        <div className="flex items-center gap-3">
                            <TextField
                                id="commentPreviewLimit"
                                type="number"
                                value={commentPreviewLimit}
                                onChange={(event) => setCommentPreviewLimit(event.target.value)}
                                className="w-24 text-[13px]"
                                min={10}
                                step={10}
                                max={1500}
                            />
                        </div>
                        <Typography
                            component="p"
                            className="text-[11px] text-grey-50 dark:text-grey-70 mt-2"
                        >
                            {t("preferences.appearance.commentPreviewLimit.description")}
                        </Typography>
                    </div>
                </div>

                <AppSeparator />

                {/* Bookmark preview character limit */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4 flex justify-end">
                        <Typography
                            component="h3"
                            className="text-[14px] font-semibold mb-3 ml-20"
                        >
                            {t("preferences.appearance.bookmarkPreviewLimit.title")}
                        </Typography>
                    </div>
                    <div className="col-span-8">
                        <div className="flex items-center gap-3">
                            <TextField
                                id="bookmarkPreviewLimit"
                                type="number"
                                value={bookmarkPreviewLimit}
                                onChange={(event) =>
                                    setBookmarkPreviewLimit(event.target.value)
                                }
                                className="w-24 text-[13px]"
                                min={10}
                                step={10}
                                max={1500}
                            />
                        </div>
                        <Typography
                            component="p"
                            className="text-[11px] text-grey-50 dark:text-grey-70 mt-2"
                        >
                            {t("preferences.appearance.bookmarkPreviewLimit.description")}
                        </Typography>
                    </div>
                </div>
            </div>
        );
    }
);
