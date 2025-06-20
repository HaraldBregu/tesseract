import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

const ListItemName = 'listItem'
const TextStyleName = 'textStyle'

export interface BulletListOptions {
  itemTypeName: string
  HTMLAttributes: Record<string, any>
  keepMarks: boolean
  keepAttributes: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletedList: {
      toggleBulletedList: (listStyle?: string) => ReturnType
      getBulletListStyleType: () => any
      unsetBulletList: () => ReturnType
    }
  }
}

export const inputRegex = /^\s*([-+*])\s$/

export const CustomBulletedList = Node.create<BulletListOptions>({
  name: 'bulletedList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {},
      keepMarks: true,
      keepAttributes: true
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

  parseHTML() {
    return [{ tag: 'ul' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addStorage() {
    return {
      HTMLAttributes: { ...this.options.HTMLAttributes }
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      listStyle: {
        default: 'disc', // Default style
        parseHTML: (element) => element.style.listStyleType || 'disc',
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

  addCommands() {
    return {
      toggleBulletedList:
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
        return this.storage.HTMLAttributes.listStyle || 'disc'
      },
      unsetBulletList:
        () =>
        ({ chain }) => {
          this.storage.HTMLAttributes.listStyle = 'disc'
          return chain()
            .toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
            .run()
        }
    }
  },

  addInputRules() {
    let inputRule = wrappingInputRule({
      find: inputRegex,
      type: this.type
    })

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: inputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: () => this.editor.getAttributes(TextStyleName),
        editor: this.editor
      })
    }
    return [inputRule]
  }
})
