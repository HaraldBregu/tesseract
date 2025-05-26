import { RootState } from "src/renderer/src/store/store";

export const selectDocumentTemplate = (state: RootState) => {
    if (!state.preferences) return null;
    return state.preferences.documentTemplate;
}

