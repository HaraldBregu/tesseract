import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Editor } from '@tiptap/core';

/**
 * Plugin to automatically sync list marker styles with list item content
 * This ensures markers inherit the styling from the first text node in the list
 */
export const ListMarkerSyncPluginKey = new PluginKey('listMarkerSync');

export function createListMarkerSyncPlugin(_editor: Editor) {
  return new Plugin({
    key: ListMarkerSyncPluginKey,
    
    appendTransaction(_transactions, _oldState, newState) {
      const { selection } = newState;
      const { $from } = selection;
      let tr = newState.tr;
      let modified = false;

      // Check if cursor is in a list
      for (let depth = $from.depth; depth >= 0; depth--) {
        const node = $from.node(depth);
        
        if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
          const pos = $from.before(depth);
          
          // Extract styles from first list item
          const markerAttrs: Record<string, any> = {};
          let hasStyles = false;
          
          if (node.firstChild && node.firstChild.type.name === 'listItem') {
            // Traverse first list item to find styled text
            node.firstChild.descendants((childNode, _childPos, parent) => {
              // Extract from text marks
              if (childNode.isText && childNode.marks.length > 0) {
                childNode.marks.forEach(mark => {
                  if (mark.type.name === 'bold') {
                    markerAttrs.markerBold = true;
                    hasStyles = true;
                  }
                  if (mark.type.name === 'italic') {
                    markerAttrs.markerItalic = true;
                    hasStyles = true;
                  }
                  if (mark.type.name === 'textStyle') {
                    if (mark.attrs.color) {
                      markerAttrs.markerColor = mark.attrs.color;
                      hasStyles = true;
                    }
                    if (mark.attrs.fontSize) {
                      markerAttrs.markerFontSize = mark.attrs.fontSize;
                      hasStyles = true;
                    }
                    if (mark.attrs.fontFamily) {
                      markerAttrs.markerFontFamily = mark.attrs.fontFamily;
                      hasStyles = true;
                    }
                  }
                  if (mark.type.name === 'customStyleMark') {
                    if (mark.attrs.color) {
                      markerAttrs.markerColor = mark.attrs.color;
                      hasStyles = true;
                    }
                    if (mark.attrs.fontSize) {
                      markerAttrs.markerFontSize = mark.attrs.fontSize;
                      hasStyles = true;
                    }
                    if (mark.attrs.fontFamily) {
                      markerAttrs.markerFontFamily = mark.attrs.fontFamily;
                      hasStyles = true;
                    }
                  }
                });
                return false; // Stop after first text node with marks
              }

              // Extract from parent paragraph/heading attributes
              if (parent && (parent.type.name === 'paragraph' || parent.type.name === 'heading')) {
                if (parent.attrs.color) {
                  markerAttrs.markerColor = parent.attrs.color;
                  hasStyles = true;
                }
                if (parent.attrs.fontSize) {
                  markerAttrs.markerFontSize = parent.attrs.fontSize;
                  hasStyles = true;
                }
                if (parent.attrs.fontFamily) {
                  markerAttrs.markerFontFamily = parent.attrs.fontFamily;
                  hasStyles = true;
                }
                if (parent.attrs.fontWeight === 'bold' || parent.attrs.fontWeight === '700') {
                  markerAttrs.markerBold = true;
                  hasStyles = true;
                }
              }
              return true; // Continue traversing
            });
          }

          // Check if attributes need updating
          const currentAttrs = node.attrs;
          const needsUpdate = hasStyles && (
            currentAttrs.markerColor !== markerAttrs.markerColor ||
            currentAttrs.markerBold !== markerAttrs.markerBold ||
            currentAttrs.markerItalic !== markerAttrs.markerItalic ||
            currentAttrs.markerFontSize !== markerAttrs.markerFontSize ||
            currentAttrs.markerFontFamily !== markerAttrs.markerFontFamily
          );

          if (needsUpdate) {
            tr.setNodeMarkup(pos, undefined, {
              ...currentAttrs,
              ...markerAttrs,
            });
            modified = true;
          }
          
          break; // Only process innermost list
        }
      }

      return modified ? tr : null;
    },
  });
}

