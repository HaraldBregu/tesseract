import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DocumentTemplate {
  id: string;
  name: string;
  lastUsedDate: string;
  fileName: string;
  type: "Proprietary" | "Community";
  filePath: string;
}
export interface PreferencesState {
  documentTemplate: DocumentTemplate;
}

const initialState: PreferencesState = {
  documentTemplate: {
    id: "",
    name: "",
    lastUsedDate: "",
    fileName: "",
    type: "Community",
    filePath: "",
  },
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setDocumentTemplate(state, action: PayloadAction<DocumentTemplate>) {
      state.documentTemplate = action.payload;
    },
  },
});

export const { setDocumentTemplate } = preferencesSlice.actions;
export default preferencesSlice.reducer;
