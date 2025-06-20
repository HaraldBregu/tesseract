import { mergeAttributes } from '@tiptap/core'
import Highlight from '@tiptap/extension-highlight'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bookmark: {
      setBookmark: (attributes: { id?: string; color?: string }) => ReturnType
      toggleBookmark: (attributes: { color?: string }) => ReturnType
      unsetBookmark: () => ReturnType
      updateBookmarkColor: (attributes: { color: string }) => ReturnType
    }
  }
}

const BookmarkMark = Highlight.extend({
  name: 'bookmark',
  priority: 1000,

  addOptions() {
    return {
      ...this.parent?.(),
      multicolor: true,
      HTMLAttributes: {
        class: 'highlight-bookmark',
        textColor: '#000000',
        backgroundColor: '#E5E5E5'
      }
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) return {}
          return {
            'data-id': attributes.id
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-id]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: `cursor: pointer; border-radius: 2px;`
      }),
      0
    ]
  },

  addCommands() {
    return {
      setBookmark:
        (attributes) =>
        ({ chain, tr, dispatch }) => {
          // const { from, to } = state.selection;
          // const schema = state.schema;
          // const marks = schema.marks;
          // const selectionMarks = Object.values(marks).filter(markType =>
          //     state.doc.rangeHasMark(from, to, markType)
          // );
          // selectionMarks.forEach(markType => {
          //     if  (markType.name === 'highlight') {
          //         tr.removeMark(from, to, markType);
          //     }
          // });

          if (dispatch) dispatch(tr)
          return chain().setMark(this.name, attributes).run()
        },
      toggleBookmark:
        (attributes) =>
        ({ chain, tr, dispatch }) => {
          if (dispatch) dispatch(tr)

          return chain().toggleMark(this.name, attributes).run()
        },
      unsetBookmark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
      updateBookmarkColor:
        (attributes) =>
        ({ chain, state, dispatch }) => {
          if (!dispatch) return false

          const { from, to } = state.selection
          const marks = state.doc.rangeHasMark(from, to, this.type)

          if (!marks) return false

          return chain()
            .command(({ tr }) => {
              state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.marks) {
                  node.marks.forEach((mark) => {
                    if (mark.type === this.type) {
                      const currentAttrs = mark.attrs
                      tr.addMark(
                        pos,
                        pos + node.nodeSize,
                        this.type.create({
                          ...currentAttrs,
                          id: currentAttrs.id,
                          color: attributes.color
                        })
                      )
                    }
                  })
                }
              })
              return true
            })
            .run()
        }
    }
  }
})

export { BookmarkMark }
