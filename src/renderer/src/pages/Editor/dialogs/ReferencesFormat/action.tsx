import { ReferencesFormatState } from "./types";

export type ReferencesAction =
    { type: "SET_SEPERATOR"; key: keyof ReferencesFormatState; value: string }
    | { type: "TOGGLE_SEPERATOR_STYLE"; key: keyof ReferencesFormatState; style: "bold" | "italic" | "underline" };

export const setSeparator = (key: keyof ReferencesFormatState, value: string): ReferencesAction => ({
    type: 'SET_SEPERATOR',
    key,
    value
})

export const toggleSeperatorStyle = (key: keyof ReferencesFormatState, style: "bold" | "italic" | "underline"): ReferencesAction => ({
    type: 'TOGGLE_SEPERATOR_STYLE',
    key,
    style
})