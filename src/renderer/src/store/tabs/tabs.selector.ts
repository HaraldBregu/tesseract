import { RootState } from "src/renderer/src/store/store";

export const selectTabs = (state: RootState) => state.tabs.items
export const selectSelectedTab = (state: RootState) => state.tabs.selectedTab
