import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

// Selettore base per lo stato di paginazione
const paginationState = (state: RootState) => state.pagination;

// Selettori per line number settings
export const selectLineNumberSettings = createSelector(
    paginationState,
    (pagination) => pagination.lineNumberSettings
);

 export const selectSectionLevel = createSelector(
    selectLineNumberSettings,
    (lineNumberSettings) => lineNumberSettings.sectionLevel
);
