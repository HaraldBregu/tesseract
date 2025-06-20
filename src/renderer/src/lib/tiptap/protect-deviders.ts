import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
// import { Transaction } from 'prosemirror-state';

const ProtectDividers = Extension.create({
  name: 'protectDividers',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('protectDividers'),
        props: {
          handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
            const { state } = view
            const { selection } = state
            const { $from, $to } = selection

            // Check if we're trying to delete a divider
            if (event.key === 'Backspace' || event.key === 'Delete') {
              // Check if selection contains a divider
              let hasDivider = false
              state.doc.nodesBetween($from.pos, $to.pos, (node) => {
                if (node.type.name === 'sectionDivider') {
                  hasDivider = true
                  return false
                }
                return true
              })

              // Check if cursor is adjacent to a divider
              const nodeBefore = $from.nodeBefore
              const nodeAfter = $from.nodeAfter
              const isAdjacentToDivider =
                (nodeBefore && nodeBefore.type.name === 'sectionDivider') ||
                (nodeAfter && nodeAfter.type.name === 'sectionDivider')

              if (hasDivider || isAdjacentToDivider) {
                event.preventDefault()
                return true
              }
            }

            return false
          },

          handleClick: (view, pos, _) => {
            const node = view.state.doc.nodeAt(pos)
            if (node && node.type.name === 'sectionDivider') {
              return true
            }
            return false
          },

          handleDOMEvents: {
            // Prevent cut operations on dividers
            cut: (view, event) => {
              const { state } = view
              const { selection } = state
              const { $from, $to } = selection

              let hasDivider = false
              state.doc.nodesBetween($from.pos, $to.pos, (node) => {
                if (node.type.name === 'sectionDivider') {
                  hasDivider = true
                  return false
                }
                return true
              })

              if (hasDivider) {
                event.preventDefault()
                return true
              }
              return false
            },

            // Prevent paste operations that might affect dividers
            paste: (view, event) => {
              const { state } = view
              const { selection } = state
              const { $from } = selection

              // Check if we're pasting next to a divider
              const nodeBefore = $from.nodeBefore
              const nodeAfter = $from.nodeAfter
              const isAdjacentToDivider =
                (nodeBefore && nodeBefore.type.name === 'sectionDivider') ||
                (nodeAfter && nodeAfter.type.name === 'sectionDivider')

              if (isAdjacentToDivider) {
                event.preventDefault()
                return true
              }
              return false
            },

            // Prevent drag and drop operations
            dragstart: (view, event) => {
              const { state } = view
              const { selection } = state
              const { $from, $to } = selection

              let hasDivider = false
              state.doc.nodesBetween($from.pos, $to.pos, (node) => {
                if (node.type.name === 'sectionDivider') {
                  hasDivider = true
                  return false
                }
                return true
              })

              if (hasDivider) {
                event.preventDefault()
                return true
              }
              return false
            },

            // Prevent drop operations
            drop: (view, event) => {
              const { state } = view
              const { selection } = state
              const { $from } = selection

              const nodeBefore = $from.nodeBefore
              const nodeAfter = $from.nodeAfter
              const isAdjacentToDivider =
                (nodeBefore && nodeBefore.type.name === 'sectionDivider') ||
                (nodeAfter && nodeAfter.type.name === 'sectionDivider')

              if (isAdjacentToDivider) {
                event.preventDefault()
                return true
              }
              return false
            }
          }
        }

        // // Add transaction filter to prevent divider deletion
        // // Verifica solo che rimanga almeno un divisore 'maintext'
        // filterTransaction: (tr: Transaction, state) => {
        //     const changeStructureEvent = tr.getMeta('changeStructureEvent');
        //     console.log("changeStructureEvent", changeStructureEvent);
        //     if (tr.docChanged) {
        //         let oldDoc = state.doc;
        //         let newDoc = tr.doc;

        //         if (changeStructureEvent) {
        //             console.log('sono dentro')
        //             // Se c'è un evento di struttura, non controllare i divisori
        //             oldDoc = newDoc;
        //             let hasMainTextSection = false;

        //             newDoc.nodesBetween(0, newDoc.content.size, (node) => {
        //                 if (node.type.name === 'sectionDivider' &&
        //                     node.attrs.sectionType === 'maintext') {
        //                     hasMainTextSection = true;
        //                     return false; // Interrompi la ricerca una volta trovato
        //                 }
        //                 return true;
        //             });

        //             // Consenti la transazione solo se è presente almeno un divisore 'maintext'
        //             if (!hasMainTextSection) {
        //                 return false;
        //             }
        //         } else {

        //             // Check if any dividers were deleted
        //             let oldDividerCount = 0;
        //             let newDividerCount = 0;

        //             oldDoc.nodesBetween(0, oldDoc.content.size, (node) => {
        //                 if (node.type.name === 'sectionDivider') {
        //                     oldDividerCount++;
        //                 }
        //                 return true;
        //             });

        //             newDoc.nodesBetween(0, newDoc.content.size, (node) => {
        //                 if (node.type.name === 'sectionDivider') {
        //                     newDividerCount++;
        //                 }
        //                 return true;
        //             });

        //             // If dividers were deleted, prevent the transaction
        //             if (newDividerCount < oldDividerCount) {
        //                 return false;
        //             }
        //         }

        //     }
        //     return true;
        // }
      })
    ]
  }
})

export { ProtectDividers }
