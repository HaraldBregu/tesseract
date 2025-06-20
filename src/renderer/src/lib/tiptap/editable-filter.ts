import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

const EditableFilter = Extension.create({
  name: 'editableFilter',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('editableFilter'),
        props: {
          handleKeyDown(view, _) {
            const { state } = view
            const { selection } = state
            const { $from } = selection

            let inReadOnly = false
            let currentSectionType: string | null = null

            state.doc.nodesBetween(0, $from.pos, (node, _) => {
              if (node.type.name === 'sectionDivider') {
                currentSectionType = node.attrs.sectionType as string
                return false
              }
              return true
            })

            if (currentSectionType === 'toc') {
              inReadOnly = true
            }

            if (inReadOnly) {
              return true
            }

            return false
          }
        }
      })
    ]
  }
})

export { EditableFilter }
