import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

export const SelectionHandlerExtension = Extension.create({
  name: 'selectionHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            mousedown: (view, _) => {
              view.dispatch(view.state.tr.setMeta('selectionStart', true))
              return false
            },
            mouseup: (view, _) => {
              const { from, to } = view.state.selection
              if (from !== to) {
                view.dispatch(view.state.tr.setMeta('selectionEnd', { from, to }))
              }
              return false
            }
          }
        }
      })
    ]
  }
})
