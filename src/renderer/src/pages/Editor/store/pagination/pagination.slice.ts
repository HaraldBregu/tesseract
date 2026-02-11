import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HeaderDisplayMode } from '@/utils/headerEnums';
export interface PaginationState {
    lineNumberSettings: LineNumberSettings;
 }
export interface CommonSettings {
    displayMode: HeaderDisplayMode;
    startFromPage?: number;
    sectionsToShow?: number[];
}

const initialState: PaginationState = {
    lineNumberSettings: {
        showLines: 0,
        linesNumeration: 1,
        sectionLevel: 1,
    }
};

const paginationSlice = createSlice({
    name: 'pagination',
    initialState,
    reducers: {
        updateLineNumberSettings: (state, action: PayloadAction<LineNumberSettings>) => {
            state.lineNumberSettings = action.payload;
        },
    },
});

// Esporta le azioni
export const {
    updateLineNumberSettings,


 
 } = paginationSlice.actions;


export default paginationSlice.reducer;