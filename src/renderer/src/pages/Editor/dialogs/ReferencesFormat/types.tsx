export interface SeparatorConfig {
    value: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
}

export type ReferencesFormatState = {
    lemma: SeparatorConfig;
    fromTo: SeparatorConfig;
    readings: SeparatorConfig;
    apparatus: SeparatorConfig;
};

type SeparatorOption = "none" | " ]" | "custom" | " -" | " :" | " ;";

export type SeparatorOptions = Record<
    keyof ReferencesFormatState,
    { value: SeparatorOption; label: string }[]
>