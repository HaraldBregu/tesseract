// For native menu system - should stay in English
export const apparatusTypeName: Record<ApparatusType, string> = {
    text: 'Text',
    CRITICAL: 'Critical',
    PAGE_NOTES: 'Page Notes',
    SECTION_NOTES: 'Section Notes',
    INNER_MARGIN: 'Inner Margin',
    OUTER_MARGIN: 'Outer Margin',
} as const;

// For UI components - supports translation
export const apparatusTypeTranslationKey: Record<ApparatusType, string> = {
    text: 'confirmChangeTemplateModal.apparatusType.text',
    CRITICAL: 'confirmChangeTemplateModal.apparatusType.critical',
    PAGE_NOTES: 'confirmChangeTemplateModal.apparatusType.pageNotes',
    SECTION_NOTES: 'confirmChangeTemplateModal.apparatusType.sectionNotes',
    INNER_MARGIN: 'confirmChangeTemplateModal.apparatusType.innerMargin',
    OUTER_MARGIN: 'confirmChangeTemplateModal.apparatusType.outerMargin',
} as const;

export const DEFAULT_PRINT_SECTION_SELECTED: PrintSections = {
  critical: 1,
  bibliography: 0,
  intro: 0,
  toc: 0
};

export const FIND_WHOLE_DOC: DocumentCriteria = 'wholeDoc';

export const FIND_MAIN_TEXT: DocumentCriteria = 'text';

export const FIND_MAX_DEPTH = 10;

export const REPLACE_MAX_DEPTH = 10;

// CONSTANTS
export const HEADING_CUSTOM_TYPES = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'CUSTOM'];
export const HEADING_TYPES = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
export const BODY_TYPE = 'P';
export const CUSTOM_TYPE = "CUSTOM";

/**
 * Merge two arrays of style definitions with specific business rules.
 * 
 * Rules:
 * 1. Preserve the full order and content of the first list (priorityStyles),
 *    including all CUSTOM styles and their positions.
 * 2. Integrate any missing required style types (system-defined, non-CUSTOM)
 *    from the second list (defaultStyles).
 * 3. Required style types are predefined and must be present in the result exactly once.
 * 4. Missing required styles are appended at the end, following the order in defaultStyles.
 * 
 * @param {Array} priorityStyles - The main list of styles (e.g., user-modified or imported styles)
 * @param {Array} defaultStyles - The fallback list of styles (e.g., system defaults or template base)
 * @returns {Array} A merged styles array satisfying all structural and completeness rules
 */

export function mergeStyles(priorityStyles: any[], defaultStyles: any[]): any[] {
  const safePriorityStyles = Array.isArray(priorityStyles) ? priorityStyles : [];
  const safeDefaultStyles = Array.isArray(defaultStyles) ? defaultStyles : [];

  const REQUIRED_TYPES = new Set([
    "TOC", "TOC_H1", "TOC_H2", "TOC_H3", "TOC_H4", "TOC_H5",
    "H1", "H2", "H3", "H4", "H5", "H6", "P",
    "APP_LEM", "APP_VAR", "ANN", "NOTE_REF_TXT", "NOTE_REF_FOOT",
    "NOTE", "BIB", "HEAD", "FOOT"
  ]);

  // Track which required types have already been added
  const addedTypes = new Set<string>();

  // Start with the priorityStyles, respecting their order
  const result: any[] = [];

  for (const style of safePriorityStyles) {
    result.push(style);
    if (REQUIRED_TYPES.has(style.type)) {
      addedTypes.add(style.type);
    }
  }

  // Now add any missing required types from defaultStyles (in their order)
  for (const defaultStyle of safeDefaultStyles) {
    if (REQUIRED_TYPES.has(defaultStyle.type) && !addedTypes.has(defaultStyle.type)) {
      result.push(defaultStyle);
      addedTypes.add(defaultStyle.type);
    }
  }

  return result;
}


/**
 * This function emulates the Windows-style "Copy" naming behavior.
 *
 * Given a base name (e.g., "Document") and a list of existing names,
 * it generates the next available name in the format:
 *
 * - "Document"                    → original
 * - "Document - Copy"             → first duplicate
 * - "Document - Copy (2)"         → second duplicate
 * - "Document - Copy (3)"         → third duplicate
 * - ...and so on
 *
 * Algorithm:
 * 1. Match all names that follow one of these patterns:
 *    - "Document"
 *    - "Document - Copy"
 *    - "Document - Copy (n)"
 * 2. Extract the numeric suffix if present.
 *    - "Document"     → treated as 0 (original)
 *    - "Document - Copy" → treated as 1
 *    - "Document - Copy (2)" → treated as 2
 * 3. Sort the suffixes and find the smallest missing integer ≥ 1.
 * 4. Return the corresponding name:
 *    - If 1 is missing → return "Document - Copy"
 *    - If 2 is missing → return "Document - Copy (2)"
 *    - and so on...
 *
 * This ensures no duplicates and that numbering is compact,
 * just like Windows Explorer does when duplicating files.
 */


export function getNextName(baseName: string, existingNames: string[]): string {
  const basePattern = new RegExp(`^${baseName}( - Copy)?( \\((\\d+)\\))?$`);
  const suffixes = existingNames
    .map(name => {
      const match = name.match(basePattern);
      if (match) {
        if (!match[1]) return 0; // original base name
        if (!match[3]) return 1; // " - Copy"
        return parseInt(match[3], 10); // " - Copy (n)"
      }
      return null;
    })
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  if (!suffixes.includes(1)) {
    return `${baseName} - Copy`;
  }

  for (let i = 2; i <= suffixes.length + 1; i++) {
    if (!suffixes.includes(i)) {
      return `${baseName} - Copy (${i})`;
    }
  }

  return `${baseName} - Copy (${suffixes.length + 1})`;
}

// BASE CONSTANTS
const DEFAULT_FONT_FAMILY = "Times New Roman";
const DEFAULT_COLOR = "#000000";
const DEFAULT_ALIGN_LEFT = "left";
const DEFAULT_LINE_HEIGHT_NORMAL = "1";
const DEFAULT_LINE_HEIGHT_LOOSE = "1.2";
const DEFAULT_LINE_HEIGHT_RELAXED = "1.3";

// FONT SIZES
const FONT_SIZE_10PT = "10pt";
const FONT_SIZE_12PT = "12pt";
const FONT_SIZE_14PT = "14pt";
const FONT_SIZE_16PT = "16pt";
const FONT_SIZE_18PT = "18pt";

// FONT WEIGHTS
const FONT_WEIGHT_NORMAL = "normal";
const FONT_WEIGHT_BOLD = "bold";
const FONT_WEIGHT_ITALIC = "italic";

// MARGINS
const MARGIN_12PT = "12pt";
const MARGIN_6PT = "6pt";

// BASE STYLE TEMPLATE
const BASE_STYLE = {
  enabled: true,
  fontFamily: DEFAULT_FONT_FAMILY,
  color: DEFAULT_COLOR,
  fontWeight: FONT_WEIGHT_NORMAL,
  align: undefined,
  lineHeight: undefined,
  marginTop: undefined,
  marginBottom: undefined,
  level: undefined
};

// INDIVIDUAL STYLE DEFINITIONS
export const DEFAULT_TOC_STYLE = {
  ...BASE_STYLE,
  id: "1",
  type: "TOC",
  level: 1,
  name: "TOC Title | Table of Contents",
  fontSize: FONT_SIZE_18PT,
  align: DEFAULT_ALIGN_LEFT,
  lineHeight: DEFAULT_LINE_HEIGHT_RELAXED,
};

export const DEFAULT_TOC_H1_STYLE = {
  ...BASE_STYLE,
  id: "2",
  type: "TOC_H1",
  level: 2,
  name: "TOC Heading Level 1",
  fontSize: FONT_SIZE_18PT,
  lineHeight: DEFAULT_LINE_HEIGHT_RELAXED,
};

export const DEFAULT_TOC_H2_STYLE = {
  ...BASE_STYLE,
  id: "3",
  type: "TOC_H2",
  level: 3,
  name: "TOC Heading Level 2",
  fontSize: FONT_SIZE_16PT,
  lineHeight: DEFAULT_LINE_HEIGHT_RELAXED,
};

export const DEFAULT_TOC_H3_STYLE = {
  ...BASE_STYLE,
  id: "4",
  type: "TOC_H3",
  level: 4,
  name: "TOC Heading Level 3",
  fontSize: FONT_SIZE_14PT,
  lineHeight: DEFAULT_LINE_HEIGHT_RELAXED,
};

export const DEFAULT_TOC_H4_STYLE = {
  ...BASE_STYLE,
  id: "5",
  type: "TOC_H4",
  level: 5,
  name: "TOC Heading Level 4",
  fontSize: FONT_SIZE_12PT,
  fontWeight: FONT_WEIGHT_ITALIC,
  lineHeight: DEFAULT_LINE_HEIGHT_LOOSE,
};

export const DEFAULT_TOC_H5_STYLE = {
  ...BASE_STYLE,
  id: "6",
  type: "TOC_H5",
  level: 6,
  name: "TOC Heading Level 5",
  fontSize: FONT_SIZE_12PT,
  fontWeight: FONT_WEIGHT_ITALIC,
  lineHeight: DEFAULT_LINE_HEIGHT_LOOSE,
};

export const DEFAULT_H1_STYLE = {
  ...BASE_STYLE,
  id: "7",
  type: "H1",
  level: 1,
  name: "Title",
  fontSize: FONT_SIZE_18PT,
  fontWeight: FONT_WEIGHT_BOLD,
  align: DEFAULT_ALIGN_LEFT,
  lineHeight: DEFAULT_LINE_HEIGHT_NORMAL,
};

export const DEFAULT_H2_STYLE = {
  ...BASE_STYLE,
  id: "8",
  type: "H2",
  level: 2,
  name: "Heading 1",
  fontSize: FONT_SIZE_16PT,
  fontWeight: FONT_WEIGHT_BOLD,
  align: DEFAULT_ALIGN_LEFT,
  lineHeight: DEFAULT_LINE_HEIGHT_NORMAL,
};

export const DEFAULT_H3_STYLE = {
  ...BASE_STYLE,
  id: "9",
  type: "H3",
  level: 3,
  name: "Heading 2",
  fontSize: FONT_SIZE_16PT,
  fontWeight: FONT_WEIGHT_BOLD,
  align: DEFAULT_ALIGN_LEFT,
  lineHeight: DEFAULT_LINE_HEIGHT_NORMAL,
};

export const DEFAULT_H4_STYLE = {
  ...BASE_STYLE,
  id: "10",
  type: "H4",
  level: 4,
  name: "Heading 3",
  fontSize: FONT_SIZE_14PT,
  fontWeight: FONT_WEIGHT_BOLD,
  align: DEFAULT_ALIGN_LEFT,
  lineHeight: DEFAULT_LINE_HEIGHT_NORMAL,
};

export const DEFAULT_H5_STYLE = {
  ...BASE_STYLE,
  id: "11",
  type: "H5",
  level: 5,
  name: "Heading 4",
  fontSize: FONT_SIZE_12PT,
  fontWeight: FONT_WEIGHT_ITALIC,
  align: DEFAULT_ALIGN_LEFT,
  lineHeight: DEFAULT_LINE_HEIGHT_NORMAL,
};

export const DEFAULT_H6_STYLE = {
  ...BASE_STYLE,
  id: "12",
  type: "H6",
  level: 6,
  name: "Heading 5",
  fontSize: FONT_SIZE_10PT,
  fontWeight: FONT_WEIGHT_ITALIC,
  align: DEFAULT_ALIGN_LEFT,
  lineHeight: DEFAULT_LINE_HEIGHT_NORMAL,
};

export const defaultParagraphStyle = {
  ...BASE_STYLE,
  id: "13",
  type: "P",
  level: 0,
  name: "Body",
  fontSize: FONT_SIZE_12PT,
  align: DEFAULT_ALIGN_LEFT,
  lineHeight: DEFAULT_LINE_HEIGHT_LOOSE,
  marginTop: MARGIN_12PT,
  marginBottom: MARGIN_6PT,
};

export const DEFAULT_APP_LEM_STYLE = {
  ...BASE_STYLE,
  id: "14",
  type: "APP_LEM",
  name: "Apparatus Lemma",
  fontSize: FONT_SIZE_12PT,
};

export const DEFAULT_MARGIN_NOTES_STYLE = {
  ...BASE_STYLE,
  id: "16",
  type: "MARGIN_NOTES",
  name: "Margin Notes",
  fontSize: FONT_SIZE_12PT,
};

export const DEFAULT_LINE_NUMBER_STYLE = {
  ...BASE_STYLE,
  id: "17",
  type: "LINE_NUMBER",
  name: "Line Numbers",
  fontSize: FONT_SIZE_12PT,
};

export const DEFAULT_PAGE_NOTE_STYLE = {
  ...BASE_STYLE,
  id: "18",
  type: "PAGE_NOTE",
  name: "Page Notes",
  fontSize: FONT_SIZE_12PT,
};

export const DEFAULT_SECTION_NOTE_STYLE = {
  ...BASE_STYLE,
  id: "19",
  type: "SECTION_NOTE",
  name: "Section",
  fontSize: FONT_SIZE_12PT,
};

export const DEFAULT_BIB_STYLE = {
  ...BASE_STYLE,
  id: "20",
  type: "BIB",
  name: "Bibliographic Reference",
  fontSize: FONT_SIZE_12PT,
  lineHeight: DEFAULT_LINE_HEIGHT_LOOSE,
};

export const DEFAULT_HEAD_STYLE = {
  ...BASE_STYLE,
  id: "21",
  type: "HEAD",
  name: "Header",
  fontSize: FONT_SIZE_12PT,
};

export const DEFAULT_FOOT_STYLE = {
  ...BASE_STYLE,
  id: "22",
  type: "FOOT",
  name: "Footer",
  fontSize: FONT_SIZE_12PT,
};

// COLLECTIONS
export const DEFAULT_TOC_STYLES = [
  DEFAULT_TOC_STYLE,
  DEFAULT_TOC_H1_STYLE,
  DEFAULT_TOC_H2_STYLE,
  DEFAULT_TOC_H3_STYLE,
  DEFAULT_TOC_H4_STYLE,
  DEFAULT_TOC_H5_STYLE,
];

export const defaultHeadingStyles = [
  DEFAULT_H1_STYLE,
  DEFAULT_H2_STYLE,
  DEFAULT_H3_STYLE,
  DEFAULT_H4_STYLE,
  DEFAULT_H5_STYLE,
  DEFAULT_H6_STYLE,
];

export const DEFAULT_APPARATUS_STYLES = [
  DEFAULT_APP_LEM_STYLE,
  // DEFAULT_APP_VAR_STYLE,
];

export const DEFAULT_NOTE_STYLES = [
  DEFAULT_MARGIN_NOTES_STYLE,
  DEFAULT_LINE_NUMBER_STYLE,
  DEFAULT_PAGE_NOTE_STYLE,
  DEFAULT_SECTION_NOTE_STYLE,
];

// COMPLETE DEFAULT STYLES ARRAY
export const DEFAULT_STYLES = [
  ...DEFAULT_TOC_STYLES,
  ...defaultHeadingStyles,
  defaultParagraphStyle,
  ...DEFAULT_APPARATUS_STYLES,
  ...DEFAULT_NOTE_STYLES,
  DEFAULT_BIB_STYLE,
  DEFAULT_HEAD_STYLE,
  DEFAULT_FOOT_STYLE,
];

// UTILITY FUNCTIONS TO GET SPECIFIC STYLES
export const getDefaultStyleByType = (type: string) => {
  return DEFAULT_STYLES.find(style => style.type === type);
};

export const getDefaultStylesByCategory = (category: 'TOC' | 'HEADING' | 'APPARATUS' | 'NOTE') => {
  switch (category) {
    case 'TOC': return DEFAULT_TOC_STYLES;
    case 'HEADING': return defaultHeadingStyles;
    case 'APPARATUS': return DEFAULT_APPARATUS_STYLES;
    case 'NOTE': return DEFAULT_NOTE_STYLES;
    default: return [];
  }
};