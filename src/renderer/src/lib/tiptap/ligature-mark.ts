import { Mark } from "@tiptap/core";

export type LigatureType = "standard" | "all" | "none";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ligature: {
      setLigature: (type: LigatureType) => ReturnType;
      unsetLigature: () => ReturnType;
    };
  }
}
const Ligature = Mark.create({
  name: 'ligature',
  addOptions() {
    return {
      HTMLAttributes: {},
      ligatureTypes: {
        standard: 'common-ligatures',
        all: 'common-ligatures discretionary-ligatures historical-ligatures contextual',
        none: 'none'
      }
    };
  },
  addAttributes() {
    return {
      type: {
        default: 'standard',
        parseHTML: element => {
          const styles = element.getAttribute('style') || '';
          if (styles.includes('common-ligatures') && !styles.includes('discretionary-ligatures')) {
            return 'standard';
          }
          if (styles.includes('discretionary-ligatures')) {
            return 'all';
          }
          if (styles.includes('none')) {
            return 'none';
          }
          return null;
        },
      },
    };
  },
  parseHTML() {
    return [{
      tag: 'span[style*="ligatures"]',
    }];
  },
  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes.type || 'standard';
    const ligatureValue = this.options.ligatureTypes[type];
    let fontFeatureSettings = '';

    if (type === 'all') {
      fontFeatureSettings = `"liga" 1, "dlig" 1, "hlig" 1, "calt" 1`;
    } else if (type === 'standard') {
      fontFeatureSettings = `"liga" 1, "calt" 1`;
    } else if (type === 'none') {
      fontFeatureSettings = `"liga" 0, "dlig" 0, "hlig" 0, "calt" 0`;
    }

    return ['span',
      {
        ...HTMLAttributes,
        style: `font-variant-ligatures: ${ligatureValue}; font-feature-settings: ${fontFeatureSettings};`,
        class: `ligature-${type}`,
      },
      0
    ];
  },
  addCommands() {
    return {
      setLigature: (type: LigatureType) => ({ commands }) => {
        return commands.setMark(this.name, { type });
      },
      unsetLigature: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

export default Ligature;