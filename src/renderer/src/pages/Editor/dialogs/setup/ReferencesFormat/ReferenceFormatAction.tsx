export type ReferencesAction =
    { type: "SET_SEPARATOR_READING_TYPE"; key: SeparatorKeys | ReadingKeys; value: string }
    | { type: "SET_SEPARATOR_READING_TYPE_CUSTOM"; key: SeparatorKeys; isCustom: boolean }
    | { type: "TOGGLE_STYLE"; key: SeparatorKeys | ReadingKeys; style: "bold" | "italic" | "underline" }
    | { type: "SET_GUIDE_COLOR"; key: GuideColorsKeys; value: string }
    | { type: "SET_NOTES_NUMERATION"; key: NoteKeys; value: string }
    | { type: "SET_NOTES_NUMBER_FORMAT"; key: NoteKeys; value: string }
    | { type: "SET_NOTES_SECTION_STYLE"; key: NoteKeys; value: string }

export const setSeparatorReadingType = (key: SeparatorKeys | ReadingKeys, value: string): ReferencesAction => ({
    type: 'SET_SEPARATOR_READING_TYPE',
    key,
    value
});

export const setSeparatorReadingTypeCustom = (key: SeparatorKeys, isCustom: boolean): ReferencesAction => ({
    type: 'SET_SEPARATOR_READING_TYPE_CUSTOM',
    key,
    isCustom
});

export const toggleStyle = (key: SeparatorKeys | ReadingKeys, style: "bold" | "italic" | "underline"): ReferencesAction => ({
    type: 'TOGGLE_STYLE',
    key,
    style
});

export const setGuideColor = (key: GuideColorsKeys, value: string): ReferencesAction => ({
    type: 'SET_GUIDE_COLOR',
    key,
    value
});

export const setNotesNumeration = (key: NoteKeys, value: string): ReferencesAction => ({
    type: 'SET_NOTES_NUMERATION',
    key,
    value
});

export const setNotesNumberFormat = (key: NoteKeys, value: string): ReferencesAction => ({
    type: 'SET_NOTES_NUMBER_FORMAT',
    key,
    value
});

export const setNotesSectionStyle = (key: NoteKeys, value: string): ReferencesAction => ({
    type: 'SET_NOTES_SECTION_STYLE',
    key,
    value
});