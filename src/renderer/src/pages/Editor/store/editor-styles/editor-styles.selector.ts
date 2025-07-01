import { createSelector } from "@reduxjs/toolkit";
import { StylesState } from "./editor-styles.state";
import { HEADING_CUSTOM_TYPES } from "@/utils/stylesUtils";

// Select all styles
export const selectStyles = (state: { styles: StylesState }) => state.styles.styles;

// Select the styles tho show on the toolbar select
export const selectHeadingAndCustomStyles = createSelector(
  [selectStyles],
  (styles) => styles?.filter(style => HEADING_CUSTOM_TYPES.includes(style?.type))
);

// Select a style by type
export const selectStyleByType = createSelector(
  [selectStyles, (_: any, styleType: string) => styleType],
  (styles, styleType) => styles.find(style => style.type === styleType)
);

// Select all enabled styles
export const selectEnabledStyles = createSelector(
  [selectStyles],
  (styles) => styles.filter(style => style.enabled)
);

// Select a style by ID
export const selectStyleById = createSelector(
  [selectStyles, (_: any, styleId: string) => styleId],
  (styles, styleId) => styles.find(style => style.id === styleId)
);

