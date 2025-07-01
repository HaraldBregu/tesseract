import { Label } from "@/components/ui/label";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ReferencesAction, setSeparatorReadingType, toggleStyle } from "./action";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import Bold from "@/components/icons/Bold";
import Italic from "@/components/icons/Italic";
import Underline from "@/components/icons/Underline";
import { readingTypes } from "./constants";
import AppSeparator from "@/components/app/app-separator";

interface ReadingTypesProps {
    state: ReferencesFormat;
    dispatch: (action: ReferencesAction) => void
}

interface ReadingTypesSectionProps {
    configKey: ReadingKeys,
    label: string,
    config: ReadingTypeConfig,
    dispatch: (action: ReferencesAction) => void
}

const Preview: React.FC<{
    configKey: ReadingKeys,
}> = memo(({ configKey }) => {
    let text = "";
    switch (configKey) {
        case "add_reading_type":
            text = `add.`;
            break;
        case "om_reading_type":
            text = `om.`;
            break;
        case "tr_reading_type":
            text = `tr.`;
            break;
        case "del_reading_type":
            text = `del.`;
            break;
    }
    return (
        <Label className='text-sm text-grey-10 leading-[15px] dark:text-grey-80'>
            {text}
        </Label>
    );
});

const ReadingTypesSection: React.FC<ReadingTypesSectionProps> = memo(({ configKey, label, config, dispatch }) => {
    const { t } = useTranslation();

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
        dispatch(setSeparatorReadingType(configKey, e.target.value)),
        [configKey, dispatch]
    );

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
        <div className="flex-1 mb-4">
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
            <Input
                key={`input-${configKey}`}
                value={config.value}
                className="w-16 ml-2 border-secondary-85 dark:border-secondary-85 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-50"
                onChange={handleChange}
                size={10}
                maxLength={10}
            />
            <AppSeparator className="my-2"/>
            <Preview 
                key={`preview-${configKey}`}
                configKey={configKey}
            />
        </div>
    );
})

const ReadingTypes: React.FC<ReadingTypesProps> = ({
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
                    "referencesFormat.customizeReadingTypes",
                    "Customize readings wording and style."
                )}
            </Label>
            <div className="flex gap-10 flex-wrap">
                {
                    readingTypes.map(({ key, label }) => (
                        <ReadingTypesSection
                            key={key}
                            configKey={key as ReadingKeys}
                            label={t(label)}
                            config={state[key as ReadingKeys]}
                            dispatch={dispatch}
                        />
                    ))
                }
            </div>
        </>
    )
};

export default memo(ReadingTypes);