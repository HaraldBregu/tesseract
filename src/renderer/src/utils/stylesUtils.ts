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
