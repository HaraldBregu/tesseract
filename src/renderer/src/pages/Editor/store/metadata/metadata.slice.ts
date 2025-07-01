import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialMetadataFields } from "../../dialogs/PageSetupDialog/constants";

export type MetadataState = {
   metadata: DocumentMetadata[]
}

const metadataSlice = createSlice({
    name: 'metadataState',
    initialState: initialMetadataFields,
    reducers: {
        replaceAllMetadata(state, action: PayloadAction<DocumentMetadata[]>) {
            state.metadata = action.payload;
        },
        
    }
});

export const {
    replaceAllMetadata,
 
} = metadataSlice.actions;

export default metadataSlice.reducer;