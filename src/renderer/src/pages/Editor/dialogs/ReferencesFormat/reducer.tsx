import { ReferencesAction } from "./action";
import { ReferencesFormatState } from "./types";

export function separatorReducer(state: ReferencesFormatState, action: ReferencesAction): ReferencesFormatState {
    switch (action.type) {
        case "SET_SEPERATOR":
            return {
                ...state,
                [action.key]: {
                    ...state[action.key],
                    value: action.value,
                },
            };
        case "TOGGLE_SEPERATOR_STYLE":
            return {
                ...state,
                [action.key]: {
                    ...state[action.key],
                    [action.style]: !state[action.key][action.style],
                },
            };
        default:
            return state;
    }
}