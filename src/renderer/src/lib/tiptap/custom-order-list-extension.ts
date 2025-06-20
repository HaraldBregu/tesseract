import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

const ListItemName = 'listItem'
const TextStyleName = 'textStyle'

export interface OrderedListOptions {
  /**
   * The node type name for list items.
   * @default 'listItem'
   * @example 'myListItem'
   */
  itemTypeName: string

  /**
   * The HTML attributes for an ordered list node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * Keep the marks when splitting a list item.
   * @default false
   * @example true
   */
  keepMarks: boolean

  /**
   * Keep the attributes when splitting a list item.
   * @default false
   * @example true
   */
  keepAttributes: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderList: {
      /**
       * Toggle an ordered list
       * @example editor.commands.toggleOrderList()
       */
      toggleOrderList: (listStyle?: string) => ReturnType
      getOrderListStyleType: () => any
      unsetOrderList: () => ReturnType
      continueFromPreviousNumber: () => ReturnType
    }
  }
}

/**
 * Matches an ordered list to a 1. on input (or any number followed by a dot).
 */
export const inputRegex = /^(\d+)\.\s$/

/**
 * This extension allows you to create ordered lists.
 * This requires the ListItem extension
 * @see https://www.tiptap.dev/api/nodes/ordered-list
 * @see https://www.tiptap.dev/api/nodes/list-item
 */
export const CustomOrderList = Node.create<OrderedListOptions>({
  name: 'orderList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {},
      keepMarks: false,
      keepAttributes: false
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      start: {
        default: 1,
        parseHTML: (element) => {
          return element.hasAttribute('start')
            ? parseInt(element.getAttribute('start') || '', 10)
            : 1
        }
      },
      type: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('type')
      },
      listStyle: {
        default: 'decimal', // Default style
        parseHTML: (element) => element.style.listStyleType || 'decimal',
        renderHTML: (attributes) => {
          if (!attributes.listStyle) {
            return {}
          }
          return {
            style: `list-style-type: ${attributes.listStyle} !important`
          }
        }
      },
      indent: {
        default: 0,
        parseHTML: (element) => parseInt(element.getAttribute('data-indent') || '0', 10),
        renderHTML: (attributes) => {
          if (!attributes.indent || attributes.indent === 0) {
            return {}
          }
          return {
            style: `margin-left: ${attributes.indent * 40}px !important;`,
            'data-indent': attributes.indent
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'ol'
      }
    ]
  },

  addStorage() {
    return {
      HTMLAttributes: { ...this.options.HTMLAttributes }
    }
  },

  renderHTML({ HTMLAttributes }) {
    const { start, ...attributesWithoutStart } = HTMLAttributes

    return start === 1
      ? ['ol', mergeAttributes(this.options.HTMLAttributes, attributesWithoutStart), 0]
      : ['ol', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleOrderList:
        (listStyle?: string) =>
        ({ chain }) => {
          this.storage.HTMLAttributes.listStyle = listStyle
          if (this.options.keepAttributes) {
            return chain()
              .toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
              .updateAttributes(this.name, { listStyle })
              .updateAttributes(ListItemName, this.editor.getAttributes(TextStyleName))
              .run()
          }
          return chain()
            .toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
            .updateAttributes(this.name, { listStyle })
            .run()
        },
      getBulletListStyleType: () => () => {
        return this.storage.HTMLAttributes.listStyle || 'decimal'
      },
      unsetOrderList:
        () =>
        ({ chain }) => {
          this.storage.HTMLAttributes.listStyle = 'decimal'
          return chain()
            .toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
            .run()
        },
      continueFromPreviousNumber:
        () =>
        ({ chain }) => {
          const { from } = this.editor.state.selection
          const currentNode = this.editor.state.doc.resolve(from)
          let start = 1

          // Traverse backwards from the current position
          for (let pos = currentNode.pos - 1; pos >= 0; pos--) {
            const node = this.editor.state.doc.nodeAt(pos)
            if (!node) continue

            if (
              node.type.name === this.name &&
              node.attrs.listStyle === 'decimal' &&
              node.nodeSize < currentNode.pos - pos
            ) {
              start = node.attrs.start + node.childCount
              break
            }
          }

          if (this.editor.isActive(this.name)) {
            // If the list is already active, just update the start number
            return chain()
              .updateAttributes(this.name, { start })
              .updateAttributes(ListItemName, this.editor.getAttributes(TextStyleName))
              .run()
          }

          return chain()
            .toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
            .updateAttributes(this.name, { listStyle: 'decimal', start })
            .updateAttributes(ListItemName, this.editor.getAttributes(TextStyleName))
            .run()
        }
    }
  },

  addInputRules() {
    let inputRule = wrappingInputRule({
      find: inputRegex,
      type: this.type,
      getAttributes: (match) => ({ start: +match[1] }),
      joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1]
    })

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: inputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: (match) => ({
          start: +match[1],
          ...this.editor.getAttributes(TextStyleName)
        }),
        joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
        editor: this.editor
      })
    }
    return [inputRule]
  }
})
