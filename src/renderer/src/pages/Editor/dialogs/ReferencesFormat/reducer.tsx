import { ReferencesAction } from "./action";

export function separatorReducer(state: ReferencesFormat, action: ReferencesAction): ReferencesFormat {
    switch (action.type) {
        case "SET_SEPARATOR_READING_TYPE":
            return {
                ...state,
                [action.key]: {
                    ...state[action.key],
                    value: action.value,
                },
            };
        case "TOGGLE_STYLE":
            return {
                ...state,
                [action.key]: {
                    ...state[action.key],
                    [action.style]: !state[action.key][action.style],
                },
            };
        case "SET_GUIDE_COLOR":
            return {
                ...state,
                [action.key]: action.value,
            };
        case "SET_NOTES_NUMERATION":
            return {
                ...state,
                [action.key]: {
                    ...state[action.key],
                    numeration: action.value,
                },
            };
        case "SET_NOTES_NUMBER_FORMAT":
            return {
                ...state,
                [action.key]: {
                    ...state[action.key],
                    numberFormat: action.value,
                },
            };
        case "SET_NOTES_SECTION_STYLE":
            return {
                ...state,
                [action.key]: {
                    ...state[action.key],
                    sectionLevel: action.value,
                },
            };
        default:
            return state;
    }
}