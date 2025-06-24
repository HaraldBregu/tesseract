import { useTranslation } from "react-i18next";
import { ReferencesAction } from "./action";
import { SeparatorConfig, SeparatorOptions, ReferencesFormatState } from "./types";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/button";
import Bold from "@/components/icons/Bold";
import Italic from "@/components/icons/Italic";
import Underline from "@/components/icons/Underline";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import Divider from "@/components/ui/divider";
import cn from "@/utils/classNames";

interface SeparatorsProps {
    state: ReferencesFormatState,
    dispatch: (action: ReferencesAction) => void
}

interface PreviewProps {
    configKey: keyof ReferencesFormatState,
    config: SeparatorConfig
}

const getSeparatorValue = (val: string) => {
    if (val.startsWith("custom:")) return val.slice(7);
    return val;
};

const Preview: React.FC<PreviewProps> = ({
    configKey,
    config
}): React.ReactNode => {
    const sep = config.value.startsWith("custom:")
                    ? ` ${getSeparatorValue(config.value)}`
                    : config.value !== "none" ? config.value : "";
    let text = "";
    switch (configKey) {
        case "lemma":
            text = `lemma${sep}`;
            break;
        case "fromTo":
            text = `lemma${sep} lemma ]`;
            break;
        case "readings":
            text = `reading${sep} reading`;
            break;
        case "apparatus":
            text = `entry${sep} entry`;
            break;
    }
    return <Label className={cn('text-sm text-grey-10 leading-[15px]', config.bold ? 'font-bold' : '', config.italic ? 'italic' : '', config.underline ? 'underline' : '')}>{text}</Label>;
};

const renderSeparatorSection = (
    configKey: keyof ReferencesFormatState,
    label: string,
    config: SeparatorConfig,
    options: SeparatorOptions,
    dispatch: (action: ReferencesAction) => void,
) => {
    const { t } = useTranslation();
    const isCustom = config.value.startsWith("custom:");
    return (
        <div className="flex-1 mb-4">
            <Label className="text-secondary-30 text-[13px] font-semibold mb-4 flex">{label}</Label>
            <div className="flex items-center gap-2 mb-2">
                {/* BOLD CONTROL */}
                <Button
                    intent="secondary"
                    variant={config.bold ? "tonal" : "icon"}
                    size="iconSm"
                    tabIndex={9}
                    tooltip={t('toolbar.bold')}
                    icon={<Bold intent='secondary' variant='tonal' size='small' />}
                    onClick={() => dispatch({ type: "TOGGLE_SEPERATOR_STYLE", key: configKey, style: "bold" })}
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
                    tooltip={t('toolbar.italic')}
                    icon={<Italic intent='secondary' variant='tonal' size='small' />}
                    onClick={() => dispatch({ type: "TOGGLE_SEPERATOR_STYLE", key: configKey, style: "italic" })}
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
                    tooltip={t('toolbar.underline')}
                    icon={<Underline intent='secondary' variant='tonal' size='small' />}
                    onClick={() => dispatch({ type: "TOGGLE_SEPERATOR_STYLE", key: configKey, style: "underline" })}
                    aria-pressed={config.underline}
                    aria-label="Underline"
                    className="border-none shadow-none hover:bg-grey-80 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            <Divider className="my-2" orientation="horizontal" />
            <RadioGroup
                value={isCustom ? "custom" : config.value}
                onValueChange={(value) => {
                    if (value === "custom") {
                        dispatch({
                            type: "SET_SEPERATOR",
                            key: configKey,
                            value: "custom:",
                        });
                    } else {
                        dispatch({
                            type: "SET_SEPERATOR",
                            key: configKey,
                            value,
                        });
                    }
                }}
            >
                {
                    options[configKey].map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`${configKey}-${opt.value}`} />
                            <Label htmlFor={`${configKey}-${opt.value}`} className="text-secondary-30 text-[13px] leading-[15px] font-semibold">{opt.label}</Label>
                        </div>
                    ))
                }
                <div className="flex items-center mt-2 space-x-2">
                    <RadioGroupItem value="custom" id={`${configKey}-custom`} />
                    <Label htmlFor={`${configKey}-custom`} className="text-secondary-30 text-[13px] leading-[15px] font-semibold">
                        {t("referencesFormat.separator.customize", "Customize")}
                    </Label>
                    <Input
                        className="w-16 ml-2 border-secondary-85"
                        size={6}
                        disabled={!isCustom}
                        value={isCustom ? getSeparatorValue(config.value) : ""}
                        maxLength={6}
                        onChange={
                            (e) => dispatch({
                                type: "SET_SEPERATOR",
                                key: configKey,
                                value: `custom:${e.target.value}`,
                            })
                        }
                    />
                </div>
            </RadioGroup>
            <Divider className="my-2" orientation="horizontal" />
            <Preview configKey={configKey} config={config} />
        </div>
    );
};

const Separators: React.FC<SeparatorsProps> = ({
    state,
    dispatch
}) => {
    const { t } = useTranslation();

    const separatorOptions: SeparatorOptions = useMemo(() => ({
        lemma: [
            { value: "none", label: t("referencesFormat.separator.none", "None") },
            { value: " ]", label: t("referencesFormat.separator.bracket", `Bracket ( ] )`) },
        ],
        fromTo: [
            { value: "none", label: t("referencesFormat.separator.none", "None") },
            { value: " -", label: t("referencesFormat.separator.dash", "Dash ( - )") },
        ],
        readings: [
            { value: "none", label: t("referencesFormat.separator.none", "None") },
            { value: " :", label: t("referencesFormat.separator.colon", "Colon ( : )") },
        ],
        apparatus: [
            { value: "none", label: t("referencesFormat.separator.none", "None") },
            { value: " ;", label: t("referencesFormat.separator.semicolon", "Semicolon ( ; )") },
        ],
    }), []);

    return (
        <>
            <Label className="flex text-lg leading-6 font-bold mb-2 text-secondary-30">
                {t("referencesFormat.appearance", "Appearance")}
            </Label>
            <Label className="flex text-secondary-30 mb-6 leading-6">
                {t(
                    "referencesFormat.customizeSeparators",
                    "Customize critical notes separators characters and style."
                )}
            </Label>
            <div className="flex gap-10 flex-wrap">
                {renderSeparatorSection("lemma", t("referencesFormat.lemmaSeparator", "Lemma separator"), state['lemma'], separatorOptions, dispatch)}
                {renderSeparatorSection("fromTo", t("referencesFormat.fromToSeparator", "From-To terms separator"), state['fromTo'], separatorOptions, dispatch )}
                {renderSeparatorSection("readings", t("referencesFormat.readingsSeparator", "Readings separator"), state['readings'], separatorOptions, dispatch )}
                {renderSeparatorSection("apparatus", t("referencesFormat.apparatusSeparator", "Apparatus entries separator"), state['apparatus'], separatorOptions, dispatch )}
            </div>
        </>
    )
}

export default Separators;