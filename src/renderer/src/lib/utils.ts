import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Node as ProseMirrorNode } from "prosemirror-model";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export const getTOCSectionRange = (state: any): { from: number, to: number } | null => {
  const sections: { type: string, pos: number, nodeSize: number }[] = [];

  // Push all section into sections array
  state.doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'sectionDivider') {
      sections.push({
        type: node.attrs?.sectionType || 'unknown',
        pos: pos,
        nodeSize: node.nodeSize
      });
    }
    return true;
  });

  const tocIndex = sections.findIndex(section => section.type === 'toc');

  if (tocIndex === -1) {
    return null;
  }

  const tocStart = sections[tocIndex].pos;
  let tocEnd: number;

  if (tocIndex + 1 < sections.length) {
    tocEnd = sections[tocIndex + 1].pos;
  } else {
    tocEnd = state.doc.content.size;
  }
  return { from: tocStart, to: tocEnd };
};

export const getSectionRange = (doc: ProseMirrorNode, sectionType: string): TTextPosition | null => {
  const sections: SectionRanges = getAllSectionRanges(doc);
  const section = sections.find(section => section.type === sectionType);
  if (section) {
    return { from: section.from, to: section.to };
  }
  return null;
};

export const getAllSectionRanges = (doc: ProseMirrorNode): SectionRanges => {
  const sections: SectionRanges = [];
  let isPreviousNodeSection = false;
  let sectionEnd = 0;

  // Push all section into sections array
  doc.descendants((node: any, pos: number) => {
    if (isPreviousNodeSection) {
      isPreviousNodeSection = false;
      sections[sections.length - 1].from = pos;
    } else if (node.type.name === 'sectionDivider') {
      if (sections.length > 0) {
        sections[sections.length - 1].to = sectionEnd;
      }
      isPreviousNodeSection = true;
      sections.push({
        type: node.attrs?.sectionType || 'unknown',
        from: pos,
        to: pos
      });
    }
    sectionEnd = pos + node.nodeSize;
    return true;
  });

  if (sections.length > 0) {
    sections[sections.length - 1].to = sectionEnd;
  }
  return sections;
};

export function shouldDisableReplace(element: Matches, _): boolean {
  if (element.section === 'toc') {
    return true;
  }
  return false;
}

/**
 * Utility function to check if a keyboard event matches a shortcut definition
 * @param event - The keyboard event
 * @param shortcut - The shortcut string (e.g., "CmdOrCtrl+Shift+C", "F5")
 * @returns true if the event matches the shortcut
 */
export const matchesShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
  if (!shortcut) return false;

  const parts = shortcut.split('+').map(p => p.trim());
  // Use userAgent as platform is deprecated
  const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);

  let requiresCtrl = false;
  let requiresCmd = false;
  let requiresAlt = false;
  let requiresShift = false;
  let keyToMatch = '';

  for (const part of parts) {
    switch (part) {
      case 'CmdOrCtrl':
        if (isMac) requiresCmd = true;
        else requiresCtrl = true;
        break;
      case 'Cmd':
      case 'Meta':
      case 'Super':
        requiresCmd = true;
        break;
      case 'Ctrl':
        requiresCtrl = true;
        break;
      case 'Alt':
        requiresAlt = true;
        break;
      case 'Shift':
        requiresShift = true;
        break;
      default:
        keyToMatch = part;
    }
  }

  // Check modifiers
  const ctrlMatch = requiresCtrl ? event.ctrlKey : !event.ctrlKey;
  const cmdMatch = requiresCmd ? event.metaKey : !event.metaKey;
  const altMatch = requiresAlt ? event.altKey : !event.altKey;
  const shiftMatch = requiresShift ? event.shiftKey : !event.shiftKey;

  // Check key
  const keyMatch = event.key === keyToMatch ||
    event.key.toUpperCase() === keyToMatch.toUpperCase() ||
    event.code === keyToMatch;

  return ctrlMatch && cmdMatch && altMatch && shiftMatch && keyMatch;
};

/**
 * Get shortcut string for a menu item from keyboard shortcuts
 * @param keyboardShortcuts - Array of keyboard shortcut categories
 * @param menuItemId - The menu item ID to find
 * @returns The shortcut string or undefined
 */
export const getShortcutForMenuItem = (keyboardShortcuts: KeyboardShortcutCategory[], menuItemId: string): string | undefined => {
  for (const category of keyboardShortcuts) {
    const command = category.commands.find(cmd => cmd.menuItemId === menuItemId);
    if (command) return command.shortcut;
  }
  return undefined;
};

/**
 * Check if a keyboard event matches any menu shortcut
 * Used to determine if we should let the event pass through to Electron's menu accelerators
 * @param event - The keyboard event
 * @param keyboardShortcuts - Array of keyboard shortcut categories
 * @param excludeMenuIds - Optional array of menu item IDs to exclude from check
 * @returns true if the event matches a menu shortcut
 */
export const isMenuShortcut = (event: KeyboardEvent, keyboardShortcuts: KeyboardShortcutCategory[], excludeMenuIds: string[] = []): boolean => {
  for (const category of keyboardShortcuts) {
    for (const command of category.commands) {
      if (excludeMenuIds.includes(command.menuItemId)) continue;
      if (command.shortcut && matchesShortcut(event, command.shortcut)) {
        return true;
      }
    }
  }
  return false;
};

const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
export const shortcutLabel = (shortcut?: string): string => {
  if (!shortcut)
    return "";

  if (isMac) {
    return shortcut
      .replaceAll("CmdOrCtrl", '⌘')
      .replaceAll("Cmd", '⌘')
      .replaceAll("Alt", '⌥')
      .replaceAll("Shift", '⇧')
      .replaceAll("Ctrl", '⌃')
      .replaceAll("+", '');
  }

  return shortcut
    .replaceAll("CmdOrCtrl", "Ctrl")
    .replaceAll("Alt", "Alt")
};
