import { memo, useCallback } from "react";
import { ReferencesAction, setGuideColor } from "./action";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { guideColors, highlightColors } from "./constants";
import { cn } from "@/lib/utils";

interface GuideColorsProps {
    state: ReferencesFormat;
    dispatch: (action: ReferencesAction) => void;
}

interface GuideColorsSectionProps {
    configKey: GuideColorsKeys;
    label: string;
    currentColor: string;
    dispatch: (action: ReferencesAction) => void;
}

const GuideColorsSection: React.FC<GuideColorsSectionProps> = memo(({ configKey, label, currentColor, dispatch }) => {
    const { t } = useTranslation();

    const handleChange = useCallback((value) => {
        dispatch(setGuideColor(configKey, value));
    }, [configKey, dispatch]);
    
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-secondary-30 text-[13px] font-semibold flex leading-[15px] dark:text-foreground">{label}</Label>
            <div className="flex gap-2">
                {
                    highlightColors.map((color) => {
                        return (
                            <Label
                                key={color.value}
                                style={{ backgroundColor: color.value }}
                                className={cn("w-10 h-10 text-[8px] text-grey-50 font-semibold leading-none flex flex-col items-center justify-center border-2 cursor-pointer", currentColor === color.value ? "border-primary" : "border-transparent")}
                                title={t(color.label)}
                                onClick={handleChange.bind(null, color.value)}
                            >
                                {color.key === 'none' ? 'None' : ''}
                            </Label>
                        )
                    }
                )}
            </div>
        </div>
    );
});

const GuideColors: React.FC<GuideColorsProps> = ({
    state,
    dispatch
}) => {
    const { t } = useTranslation();

    return (
        <>
            <Label className="flex text-lg leading-6 font-bold mb-2 text-secondary-30 dark:text-foreground">
                {t("referencesFormat.highlightColor", "Highlights Color")}
            </Label>
            <Label className="flex text-secondary-30 mb-6 leading-6 dark:text-foreground">
                {t(
                    "referencesFormat.customizeGuideColors",
                    "Text highlights that are not included in print."
                )}
            </Label>
            <div className="flex gap-10 flex-wrap overflow-auto">
                {
                    guideColors.map(({ key, label }) => (
                        <GuideColorsSection
                            key={key}
                            configKey={key as GuideColorsKeys}
                            label={t(label)}
                            currentColor={state[key as GuideColorsKeys]}
                            dispatch={dispatch}
                        />
                    ))
                }
            </div>
        </>
    )
};

export default memo(GuideColors);