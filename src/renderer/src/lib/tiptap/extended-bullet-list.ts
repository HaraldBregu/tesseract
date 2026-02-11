import BulletList from '@tiptap/extension-bullet-list';

/**
 * Extended BulletList with support for different bullet types (disc, circle, square)
 * and automatic rotation when creating nested lists
 * Also supports marker styling inheritance from list item content
 */
export const ExtendedBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      bulletType: {
        default: 'disc',
        parseHTML: element => {
          const styleAttr = element.style.listStyleType;
          return styleAttr || 'disc';
        },
        renderHTML: attributes => {
          const bulletType = attributes.bulletType || 'disc';
          const styles = [`list-style-type: ${bulletType} !important`];
          const dataAttrs: Record<string, string> = {};

          // Add marker styling
          if (attributes.markerColor) {
            styles.push(`--marker-color: ${attributes.markerColor}`);
            dataAttrs['data-marker-color'] = attributes.markerColor;
          }
          if (attributes.markerBold !== null) {
            styles.push(`--marker-bold: ${attributes.markerBold ? 'bold' : 'normal'}`);
            dataAttrs['data-marker-bold'] = String(attributes.markerBold);
          }
          if (attributes.markerItalic !== null) {
            styles.push(`--marker-italic: ${attributes.markerItalic ? 'italic' : 'normal'}`);
            dataAttrs['data-marker-italic'] = String(attributes.markerItalic);
          }
          if (attributes.markerFontSize) {
            styles.push(`--marker-font-size: ${attributes.markerFontSize}`);
            dataAttrs['data-marker-font-size'] = attributes.markerFontSize;
          }
          if (attributes.markerFontFamily) {
            styles.push(`--marker-font-family: ${attributes.markerFontFamily}`);
            dataAttrs['data-marker-font-family'] = attributes.markerFontFamily;
          }

          return {
            ...dataAttrs,
            style: styles.join('; '),
          };
        },
        keepOnSplit: true,
      },
      markerColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-marker-color'),
        keepOnSplit: true,
      },
      markerBold: {
        default: null,
        parseHTML: element => {
          const bold = element.getAttribute('data-marker-bold');
          return bold === 'true' ? true : bold === 'false' ? false : null;
        },
        keepOnSplit: true,
      },
      markerItalic: {
        default: null,
        parseHTML: element => {
          const italic = element.getAttribute('data-marker-italic');
          return italic === 'true' ? true : italic === 'false' ? false : null;
        },
        keepOnSplit: true,
      },
      markerFontSize: {
        default: null,
        parseHTML: element => element.getAttribute('data-marker-font-size'),
        keepOnSplit: true,
      },
      markerFontFamily: {
        default: null,
        parseHTML: element => element.getAttribute('data-marker-font-family'),
        keepOnSplit: true,
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      updateBulletListMarkerStyles: () => ({ commands, state }) => {
        const { selection } = state;
        const { $from } = selection;

        // Find the bulletList node
        for (let depth = $from.depth; depth >= 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name === 'bulletList') {
            // Find first listItem and extract styles from its first text node
            let markerAttrs: Record<string, any> = {};
            
            if (node.firstChild && node.firstChild.type.name === 'listItem') {
              node.firstChild.descendants((childNode, _pos, parent) => {
                if (childNode.isText && childNode.marks.length > 0) {
                  // Extract style from marks
                  childNode.marks.forEach(mark => {
                    if (mark.type.name === 'bold') {
                      markerAttrs.markerBold = true;
                    }
                    if (mark.type.name === 'italic') {
                      markerAttrs.markerItalic = true;
                    }
                    if (mark.type.name === 'textStyle') {
                      if (mark.attrs.color) markerAttrs.markerColor = mark.attrs.color;
                      if (mark.attrs.fontSize) markerAttrs.markerFontSize = mark.attrs.fontSize;
                      if (mark.attrs.fontFamily) markerAttrs.markerFontFamily = mark.attrs.fontFamily;
                    }
                  });
                  return false; // Stop after first text node
                }
                
                // Check parent paragraph/heading for styles
                if (parent && (parent.type.name === 'paragraph' || parent.type.name === 'heading')) {
                  if (parent.attrs.color) markerAttrs.markerColor = parent.attrs.color;
                  if (parent.attrs.fontSize) markerAttrs.markerFontSize = parent.attrs.fontSize;
                  if (parent.attrs.fontFamily) markerAttrs.markerFontFamily = parent.attrs.fontFamily;
                }
                return true; // Continue traversing
              });
            }

            return commands.updateAttributes('bulletList', markerAttrs);
          }
        }
        return false;
      },
    };
  },
});

