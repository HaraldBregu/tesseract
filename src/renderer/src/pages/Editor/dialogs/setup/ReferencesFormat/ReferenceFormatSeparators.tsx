import { useTranslation } from "react-i18next";
import { ReferencesAction, setSeparatorReadingType, setSeparatorReadingTypeCustom, toggleStyle } from "./ReferenceFormatAction";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { memo, useCallback } from "react";
import { SEPARATOR_MAX_LENGTH, SEPARATOR_MIN_LENGTH, separatorOptions, separators } from "./ReferenceFormatConstants";
import AppSeparator from "@/components/app/app-separator";
import { ToolbarButtonBold } from "@/pages/editor/components/toolbar-button-bold";
import { ToolbarButtonItalic } from "@/pages/editor/components/toolbar-button-italic";
import { ToolbarButtonUnderline } from "@/pages/editor/components/toolbar-button-underline";

interface SeparatorsProps {
    state: ReferencesFormat,
    dispatch: (action: ReferencesAction) => void
}

interface PreviewProps {
    configKey: SeparatorKeys,
}

interface SeparatorSectionProps {
    configKey: SeparatorKeys,
    label: string,
    config: ReferenceFormatChar,
    dispatch: (action: ReferencesAction) => void
}

const Preview: React.FC<PreviewProps> = memo(({
    configKey,
}): React.ReactNode => {
    let text = "";
    switch (configKey) {
        case "lemma_separator":
            text = `lemma ]`;
            break;
        case "from_to_separator":
            text = `lemma ... lemma ]`;
            break;
        case "readings_separator":
            text = `reading : reading`;
            break;
        case "apparatus_separator":
            text = `entry ; entry`;
            break;
    }
    return (
        <Label className='text-sm text-grey-10 leading-[15px] dark:text-grey-80'>
            {text}
        </Label>
    );
});

const SeparatorSection: React.FC<SeparatorSectionProps> = memo(({
    configKey,
    label,
    config,
    dispatch,
}) => {
    const { t } = useTranslation();
    const onRadioChange = useCallback((value: string) => {
        dispatch(setSeparatorReadingTypeCustom(configKey, value === "custom"));
        if (value !== "custom") {
            dispatch(setSeparatorReadingType(configKey, value !== 'none' ? value : ""));
        }
    }, [configKey, dispatch]);

    const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSeparatorReadingType(configKey, e.target.value))
    }, [configKey, dispatch]);

    const handleBoldToggle = useCallback(() => {
        dispatch(toggleStyle(configKey, "bold"));
    }, [configKey, dispatch]);

    const handleItalicToggle = useCallback(() => {
        dispatch(toggleStyle(configKey, "italic"));
    }, [configKey, dispatch]);

    const handleUnderlineToggle = useCallback(() => {
        dispatch(toggleStyle(configKey, "underline"));
    }, [configKey, dispatch]);

    return (
        <div className="flex-1 mb-4 " key={configKey}>
            <Label className="text-secondary-30 dark:text-foreground text-[13px] font-semibold mb-4 flex">{label}</Label>
            <div className="flex items-center gap-2 mb-2">
                {/* BOLD CONTROL */}
                <ToolbarButtonBold
                    title={t('referencesFormat.bold')}
                    isBold={config.bold}
                    onClick={handleBoldToggle}
                    tabIndex={9}
                />
                {/* ITALIC CONTROL */}
                <ToolbarButtonItalic
                    title={t('referencesFormat.italic')}
                    isItalic={config.italic}
                    onClick={handleItalicToggle}
                    tabIndex={10}
                />
                {/* UNDERLINE CONTROL */}
                <ToolbarButtonUnderline
                    title={t('referencesFormat.underline')}
                    isUnderline={config.underline}
                    onClick={handleUnderlineToggle}
                    tabIndex={11}
                />
            </div>
            <AppSeparator className="my-2" />
            <RadioGroup
                key={`radio-group-${configKey}`}
                value={config.isCustom ? "custom" : config.value}
                onValueChange={onRadioChange}
            >
                {
                    separatorOptions[configKey].map((opt) => (
                        <div key={`radio-${configKey}-${opt.value}`} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`${configKey}-${opt.value}`} />
                            <Label htmlFor={`${configKey}-${opt.value}`} className="text-secondary-30 text-[13px] leading-[15px] font-semibold dark:text-grey-80">{t(opt.label)}</Label>
                        </div>
                    ))
                }
                <div className="flex items-center mt-2 space-x-2">
                    <RadioGroupItem key={`radio-${configKey}-custom`} value="custom" id={`${configKey}-custom`} />
                    <Label htmlFor={`${configKey}-custom`} className="text-secondary-30 text-[13px] leading-[15px] font-semibold dark:text-grey-80">
                        {t("referencesFormat.customize", "Customize")}
                    </Label>
                    <Input
                        key={`input-${configKey}`}
                        className="w-16 ml-2 border-secondary-85 dark:text-grey-80 dark:border-secondary-85 focus-visible:ring-0 focus-visible:ring-offset-0"
                        size={SEPARATOR_MAX_LENGTH}
                        disabled={!config.isCustom}
                        value={config.isCustom ? config.value : ""}
                        maxLength={SEPARATOR_MAX_LENGTH}
                        minLength={SEPARATOR_MIN_LENGTH}
                        onChange={onInputChange}
                    />
                </div>
            </RadioGroup>
            <AppSeparator className="my-2" />
            <Preview key={`preview-${configKey}`} configKey={configKey} />
        </div>
    );
});

const Separators: React.FC<SeparatorsProps> = ({
    state,
    dispatch
}) => {
    const { t } = useTranslation();

    return (
        <>
            <Label className="flex text-lg leading-6 font-bold mb-2 text-secondary-30 dark:text-foreground">
                {t("referencesFormat.appearance", "Appearance")}
            </Label>
            <Label className="flex text-secondary-30 mb-6 leading-6 dark:text-foreground">
                {t(
                    "referencesFormat.customizeSeparators",
                    "Customize critical notes separators characters and style."
                )}
            </Label>
            <div className="flex gap-10 flex-wrap">
                {separators.map(({ key, label }) => (
                    <SeparatorSection
                        key={key}
                        configKey={key as SeparatorKeys}
                        label={t(label)}
                        config={state[key as SeparatorKeys]}
                        dispatch={dispatch}
                    />
                ))}
            </div>
        </>
    )
};

export default memo(Separators);