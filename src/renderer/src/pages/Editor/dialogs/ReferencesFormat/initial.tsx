import { ReferencesFormatState } from "./types";

export const defaultConfigs: ReferencesFormatState = {
    lemma: { value: " ]", bold: false, italic: false, underline: false },
    fromTo: { value: " -", bold: false, italic: false, underline: false },
    readings: { value: " :", bold: false, italic: false, underline: false },
    apparatus: { value: " ;", bold: false, italic: false, underline: false },
};