import { useTranslation } from "react-i18next";
import { ReferencesAction, setSeparatorReadingType, toggleStyle } from "./action";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/button";
import Bold from "@/components/icons/Bold";
import Italic from "@/components/icons/Italic";
import Underline from "@/components/icons/Underline";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { memo, useCallback } from "react";
import { separatorOptions, separators } from "./constants";
import AppSeparator from "@/components/app/app-separator";

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

const getSeparatorValue = (val: string) => {
    if (val.startsWith("custom:")) return val.slice(7);
    return val;
};

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
    const isCustom = config.value?.startsWith("custom:");
    const onRadioChange = useCallback((value: string) => {
        if (value === "custom") {
            dispatch(setSeparatorReadingType(configKey, "custom:"));
        } else {
            dispatch(setSeparatorReadingType(configKey, value));
        }
    }, [configKey, dispatch]);

    const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSeparatorReadingType(configKey, `custom:${e.target.value}`))
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
                <Button
                    intent="secondary"
                    variant={config.bold ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={9}
                    tooltip={t('referencesFormat.bold')}
                    icon={<Bold intent='secondary' variant='tonal' size='small' />}
                    onClick={handleBoldToggle}
                    aria-pressed={config.bold}
                    aria-label="Bold"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {/* ITALIC CONTROL */}
                <Button
                    intent="secondary"
                    variant={config.italic ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={10}
                    tooltip={t('referencesFormat.italic')}
                    icon={<Italic intent='secondary' variant='tonal' size='small' />}
                    onClick={handleItalicToggle}
                    aria-pressed={config.italic}
                    aria-label="Italic"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {/* UNDERLINE CONTROL */}
                <Button
                    intent="secondary"
                    variant={config.underline ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={11}
                    tooltip={t('referencesFormat.underline')}
                    icon={<Underline intent='secondary' variant='tonal' size='small' />}
                    onClick={handleUnderlineToggle}
                    aria-pressed={config.underline}
                    aria-label="Underline"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            <AppSeparator className="my-2"/>
            <RadioGroup
                key={`radio-group-${configKey}`}
                value={isCustom ? "custom" : config.value}
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
                        {t("referencesFormat.separator.customize", "Customize")}
                    </Label>
                    <Input
                        key={`input-${configKey}`}
                        className="w-16 ml-2 border-secondary-85 dark:text-grey-80 dark:border-secondary-85 focus-visible:ring-0 focus-visible:ring-offset-0"
                        size={3}
                        disabled={!isCustom}
                        value={isCustom ? getSeparatorValue(config.value ?? "") : ""}
                        maxLength={3}
                        onChange={onInputChange}
                    />
                </div>
            </RadioGroup>
            <AppSeparator className="my-2"/>
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