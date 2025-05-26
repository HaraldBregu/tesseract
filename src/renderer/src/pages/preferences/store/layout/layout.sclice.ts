import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setupPageInitialState, SetupSettingsState } from "./layout.state";
import { SetupPageState } from "./layout.state";

const layoutSlice = createSlice({
    name: "layout",
    initialState: setupPageInitialState,
    reducers: {
        updateSetupPageState: (state, action: PayloadAction<SetupSettingsState>) => {
            state.settings = action.payload;
        }
    },
})

export type { SetupPageState };
export const {updateSetupPageState} = layoutSlice.actions;
export default layoutSlice.reducer;
