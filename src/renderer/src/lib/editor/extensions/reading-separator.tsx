import { mergeAttributes, Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    readingSeparator: {
      /**
       * Add a reading separator
       */
      setReadingSeparator: (readingSeparator?: ReadingSeparator | null) => ReturnType,
      /**
       * Update a reading separator
       */
      updateReadingSeparator: (readingSeparator: ReadingSeparator) => ReturnType,
      /**
       * Remove a reading separator
       */
      unsetReadingSeparator: () => ReturnType,
    }
  }
}

export interface ReadingSeparatorOptions {
  HTMLAttributes: Record<string, unknown>
}

const ReadingSeparator = Node.create<ReadingSeparatorOptions>({
  name: 'readingSeparator',

  group: 'inline',

  inline: true,

  draggable: false,

  selectable: false,

  contentEditable: false,

  addAttributes() {
    return {
      readingSeparator: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'reading-separator[data-type="reading-separator"]',
        getAttrs: element => {
          if (typeof element === 'string') {
            return false;
          }

          return {
            readingSeparator: {
              content: element.getAttribute('data-character') || ' ',
              style: {
                highlightColor: element.style.backgroundColor || 'transparent',
                bold: element.style.fontWeight === 'bold',
                italic: element.style.fontStyle === 'italic',
                underline: element.style.textDecoration.includes('underline'),
              }
            },
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const readingSeparator = HTMLAttributes.readingSeparator as ReadingSeparator;
    const character = readingSeparator?.content || ' ';
    const style = readingSeparator?.style;

    return [
      'reading-separator',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': 'reading-separator',
          'data-character': character,
          style: `
            background-color: ${style?.highlightColor || 'transparent'};
            font-weight: ${style?.bold ? 'bold' : 'normal'};
            font-style: ${style?.italic ? 'italic' : 'normal'};
            text-decoration: ${style?.underline ? 'underline' : 'none'};
          `
        }
      ),
      character,
    ]
  },

  addCommands() {
    return {
      setReadingSeparator: (readingSeparator: ReadingSeparator | null = null) => ({ chain, state }) => {
        const { from, to } = state.selection;
        const defaultSeparator: ReadingSeparator = {
          content: ':',
          style: {
            highlightColor: 'transparent',
            bold: false,
            italic: false,
            underline: false,
          }
        };
        const finalSeparator = readingSeparator || defaultSeparator;

        return chain()
          .insertContentAt(from, {
            type: this.name,
            attrs: {
              readingSeparator: finalSeparator,
            }
          })
          .deleteRange({
            from: from + 1,
            to: to + 1,
          })
          .run();
      },
      updateReadingSeparator: (readingSeparator: ReadingSeparator) => ({ chain }) => {
        return chain().focus().updateAttributes(this.name, { readingSeparator }).run();
      },
      unsetReadingSeparator:
        () => ({ commands }) => {
          return commands.deleteSelection()
        },
    }
  },
})

export default ReadingSeparator
