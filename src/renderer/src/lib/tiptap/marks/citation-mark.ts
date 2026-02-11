import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citation: {
      /**
       * Apply a citation to the current selection
       */
      setCitation: (bib: BibReference, citationStyle: CITATION_STYLES, attributes: Style) => ReturnType

      /**
       * Remove a citation from the selection
       */
      unsetCitation: () => ReturnType
    }
  }
}

export const CitationMark = Mark.create<Style>({
  name: 'citation',
  priority: 1000,
  inclusive: false,

  addAttributes() {
    return {
      bibliography: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-bibliography'),
        renderHTML: (attributes) => {
          if (attributes.bibliography) {
            return {
              'data-bibliography': JSON.stringify(attributes.bibliography),
            }
          }
          return ""
        },
      },
      citationStyle: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-citation-style'),
        renderHTML: (attributes) => {
          if (attributes.citationStyle) {
            return {
              'data-citation-style': JSON.stringify(attributes.citationStyle),
            }
          }
          return ""
        },
      },
      fontSize: {
        default: '12pt',
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (attributes.fontSize) {
            return {
              style: `font-size: ${attributes.fontSize}`,
            }
          }
          return {}
        },
      },

      bold: {
        default: false,
        parseHTML: (element) => element.style.fontWeight === 'bold' || element.style.fontWeight === '700',
        renderHTML: (attributes) => {
          if (attributes.bold) {
            return {
              style: `font-weight: bold`,
            }
          }
          return {}
        }
      },

      italic: {
        default: false,
        parseHTML: (element) => element.style.fontStyle === 'italic',
        renderHTML: (attributes) => {
          if (attributes.italic) {
            return {
              style: `font-style: italic`,
            }
          }
          return {}
        }
      },

      underline: {
        default: false,
        parseHTML: (element) => element.style.textDecoration === 'underline',
        renderHTML: (attributes) => {
          if (attributes.underline) {
            return {
              style: `text-decoration: underline`,
            }
          }
          return {}
        }
      },

      fontFamily: {
        default: 'Times New Roman',
        parseHTML: (element) => element.style.fontFamily,
        renderHTML: (attributes) => {
          if (attributes.fontFamily) {
            return {
              style: `font-family: ${attributes.fontFamily}`,
            }
          }
          return {}
        },
      },

      textAlign: {
        default: 'left',
        parseHTML: (element) => element.style.textAlign,
        renderHTML: (attributes) => {
          if (attributes.textAlign) {
            return {
              style: `text-align: ${attributes.textAlign}`,
            }
          }
          return {}
        },
      },

      lineHeight: {
        default: '1',
        parseHTML: (element) => element.style.lineHeight,
        renderHTML: (attributes) => {
          if (attributes.lineHeight) {
            return {
              style: `line-height: ${attributes.lineHeight}`,
            }
          }
          return {}
        },
      },

      marginLeft: {
        default: '0px',
        parseHTML: (element) => element.style.marginLeft,
        renderHTML: (attributes) => {
          if (attributes.marginLeft) {
            return {
              style: `margin-left: ${attributes.marginLeft}`,
            }
          }
          return {}
        },
      },

      marginRight: {
        default: '0px',
        parseHTML: (element) => element.style.marginRight,
        renderHTML: (attributes) => {
          if (attributes.marginRight) {
            return {
              style: `margin-right: ${attributes.marginRight}`,
            }
          }
          return {}
        },
      },

      marginTop: {
        default: '0px',
        parseHTML: (element) => element.style.marginTop,
        renderHTML: (attributes) => {
          if (attributes.marginTop) {
            return {
              style: `margin-top: ${attributes.marginTop}`,
            }
          }
          return {}
        },
      },

      marginBottom: {
        default: '0px',
        parseHTML: (element) => element.style.marginBottom,
        renderHTML: (attributes) => {
          if (attributes.marginBottom) {
            return {
              style: `margin-bottom: ${attributes.marginBottom}`,
            }
          }
          return {}
        },
      },

      color: {
        default: 'black',
        parseHTML: (element) => element.style.color,
        renderHTML: (attributes) => {
          if (attributes.color) {
            return {
              style: `color: ${attributes.color}`,
            }
          }
          return {}
        },
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-bibliography]' }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        HTMLAttributes,
        { class: 'citation' }
      ),
      0,
    ]
  },

  addCommands() {
    return {
      setCitation:
        (bibliography: BibReference, citationStyle: CITATION_STYLES, attributes: Style) =>
        ({ commands }) => {
          return commands.setMark(this.name, {
            ...attributes,
            bibliography,
            citationStyle
          });
        },

      unsetCitation:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        }
    }
  }
});
