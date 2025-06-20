import { Node, mergeAttributes } from '@tiptap/core'

export interface TocItemOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tocItem: {
      setTocItem: (attributes: {
        title: string
        level: number
        pageNumber: string
        fontSize: string
      }) => ReturnType
    }
  }
}

export const TocItem = Node.create<TocItemOptions>({
  name: 'tocItem',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  addAttributes() {
    return {
      title: {
        default: ''
      },
      level: {
        default: 1
      },
      pageNumber: {
        default: 'tbd'
      },
      fontSize: {
        default: '12'
      }
    }
  },

  group: 'block',
  content: '',

  parseHTML() {
    return [
      {
        tag: 'div[data-type="tocItem"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    const fontSize = attrs.fontSize.replace('pt', '')

    return [
      'div',
      {
        'data-type': 'tocItem',
        class: `toc-item toc-level-${attrs.level}`,
        style: `font-size: ${fontSize}pt;`
      },
      [
        'span',
        { class: 'toc-title' },
        attrs.title,
        'span',
        { class: 'toc-dots' },
        '',
        'span',
        { class: 'toc-page' },
        attrs.pageNumber
      ]
    ]
  },

  addCommands() {
    return {
      setTocItem:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes
          })
        }
    }
  }
})
