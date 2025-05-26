import { RootState } from "@/store/rootReducers";
import { AvailableApparatusTypes, SetupSettingsState, StandardPageDimensionsState } from "./layout.state";

export const selectLayoutSettings = (state: RootState): SetupSettingsState => state.layout.settings;
export const selectLayoutStandardPageDimensions = (state: RootState): StandardPageDimensionsState[]  => state.layout.standardPageDimensions;
export const selectLayoutAvailableApparatusTypes = (state: RootState): AvailableApparatusTypes => state.layout.availableApparatusTypes;
