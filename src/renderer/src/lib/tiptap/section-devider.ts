import { Extension, mergeAttributes, Node } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Node as ProseMirrorNode } from 'prosemirror-model'

const SectionDivider = Node.create({
  name: 'sectionDivider',
  group: 'block',
  selectable: false,
  draggable: false,
  atom: true,
  content: '',
  defining: true,
  isolating: true,
  code: true,
  whitespace: 'pre',
  parseDOM: [],
  toDOM: () => [
    'div',
    { 'data-type': 'section-divider', class: 'section-divider', contenteditable: 'false' }
  ],

  addAttributes() {
    return {
      sectionType: {
        default: 'introduction'
      },
      label: {
        default: ''
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="section-divider"]',
        getAttrs: (element) => ({
          sectionType: (element as HTMLElement).getAttribute('data-section-type')
        })
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'section-divider',
        'data-section-type': HTMLAttributes.sectionType,
        class: `section-divider section-divider-${HTMLAttributes.sectionType}`
      })
    ]
  }
})

const SectionDividerProtection = Extension.create({
  name: 'sectionDividerProtection',

  addProseMirrorPlugins() {
    return [
      new Plugin<any>({
        key: new PluginKey('sectionDividerProtection'),
        props: {
          handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
            const { state } = view
            const { selection, doc } = state
            const { $from, $to } = selection

            // Funzione per controllare se un nodo è un divider
            const isDivider = (node: ProseMirrorNode | null | undefined) =>
              //  node?.type.name === 'horizontalRule' ||
              node?.type.name === 'sectionDivider'

            // Se abbiamo una selezione non-vuota
            if ($from.pos !== $to.pos && (event.key === 'Delete' || event.key === 'Backspace')) {
              // Controlla se la selezione contiene un divider
              let hasSelectedDivider = false
              doc.nodesBetween($from.pos, $to.pos, (node) => {
                if (isDivider(node)) {
                  hasSelectedDivider = true
                  return false
                }
                return !hasSelectedDivider
              })

              // Se la selezione contiene un divider, blocca la cancellazione
              if (hasSelectedDivider) {
                return true // Blocca l'evento
              }

              // Altrimenti, consenti la cancellazione del testo selezionato
              return false
            }

            // Gestione della cancellazione con cursore (senza selezione)
            if (event.key === 'Delete' || event.key === 'Backspace') {
              // Controlla se i nodi adiacenti sono divider
              const nodeAfter = $to.nodeAfter
              const nodeBefore = $from.nodeBefore

              if (
                (event.key === 'Delete' && isDivider(nodeAfter)) ||
                (event.key === 'Backspace' && isDivider(nodeBefore))
              ) {
                return true // Blocca l'evento
              }

              // Controlla se l'operazione attraverserebbe un divider
              const searchRange =
                event.key === 'Delete'
                  ? { from: $to.pos, to: $to.pos + 2 }
                  : { from: Math.max(0, $from.pos - 2), to: $from.pos }

              let foundDivider = false
              doc.nodesBetween(searchRange.from, searchRange.to, (node: ProseMirrorNode) => {
                if (isDivider(node)) {
                  foundDivider = true
                  return false
                }
                return !foundDivider
              })

              if (foundDivider) {
                return true // Blocca l'evento
              }
            }

            return false // Lascia che altri gestori trattino l'evento
          },

          // Impedisci il trascinamento attraverso i divider
          handleDrop: (view, event) => {
            // Ottieni la posizione di drop
            const dropPos = view.posAtCoords({
              left: event.clientX,
              top: event.clientY
            })?.pos

            if (!dropPos) return false

            // Verifica se il drop attraverserebbe un divider
            const { state } = view
            const { selection } = state
            const dragStart = selection.from
            const dragEnd = selection.to

            // Determina l'intervallo da controllare
            const minPos = Math.min(dragStart, dropPos)
            const maxPos = Math.max(dragEnd, dropPos)

            // Controlla se ci sono divider nel percorso
            let hasDividerBetween = false
            state.doc.nodesBetween(minPos, maxPos, (node) => {
              if (
                //node.type.name === 'horizontalRule' ||
                node.type.name === 'sectionDivider'
              ) {
                hasDividerBetween = true
                return false
              }
              return true
            })

            if (hasDividerBetween) {
              return true // Blocca il drop
            }

            return false // Consenti il drop
          }
        }
      })
    ]
  }
})

export { SectionDivider, SectionDividerProtection }
