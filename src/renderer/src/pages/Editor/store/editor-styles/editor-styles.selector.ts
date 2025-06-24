import { createSelector } from "@reduxjs/toolkit";
import { StylesState } from "./editor-styles.state";
import { HEADING_CUSTOM_TYPES } from "@/utils/stylesUtils";

/**
 * @todo remove this, we need to use fixed it
 */
// Keep all the couple <style, id>
const customStyleIdMap = new Map<string, number>();
let nextCustomId = -1;

// Associate each style with an id
// In order to mantain some ids fixed, maps a new just for custom styles
export function getStyleNumericId(style: string, name: string): string {
  switch (style) {
    case "H1": return "1";
    case "H2": return "2";
    case "H3": return "3";
    case "H4": return "4";
    case "H5": return "5";
    case "H6": return "6";
    case "P": return "0";
    default: {
      // for the custom or other styles, use type + name as unique key
     const uniqueKey = `${style}-${name}`;
      if (!customStyleIdMap.has(uniqueKey)) {
        customStyleIdMap.set(uniqueKey, nextCustomId--);
      }
      return customStyleIdMap.get(uniqueKey)!.toString();
    }
  }
}

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

// Enabled styles are those to show in sections styles modal
// Select all enabled styles and add them a numeric id
export const selectStylesOptions = createSelector(
  [selectHeadingAndCustomStyles],
  (styles) => {
    return styles
      .filter(style => style.enabled === true)
      .map(({ name, type }) => ({ 
        label: name, 
        value: getStyleNumericId(type, name) 
      }));
  }
)
