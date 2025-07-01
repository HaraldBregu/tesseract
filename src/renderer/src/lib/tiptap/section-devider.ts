import { Extension, mergeAttributes, Node } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';


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
    toDOM: () => ['div', { 'data-type': 'section-divider', class: 'section-divider', contenteditable: 'false' }],

    addAttributes() {
        return {
            sectionType: {
                default: 'introduction',
            },
            label: {
                default: ''
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="section-divider"]',
                getAttrs: element => ({
                    sectionType: (element as HTMLElement).getAttribute('data-section-type'),
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'section-divider',
            'data-section-type': HTMLAttributes.sectionType,
            class: `section-divider section-divider-${HTMLAttributes.sectionType}`,
        })];
    }
});

const SectionDividerProtection = Extension.create({
    name: 'sectionDividerProtection',

    addProseMirrorPlugins() {
        return [
            new Plugin<any>({
                key: new PluginKey('sectionDividerProtection'),
                props: {
                    handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
                        const { state, dispatch } = view;
                        const { selection, doc } = state;
                        const { $from, $to } = selection;

                        const isDivider = (node: ProseMirrorNode | null | undefined) =>
                            node?.type.name === 'sectionDivider';

                        // Handle Delete/Backspace with any selection that contains sectionDividers
                        if ($from.pos !== $to.pos && (event.key === 'Delete' || event.key === 'Backspace')) {
                            // Check if selection contains sectionDividers
                            let hasSectionDividers = false;
                            doc.nodesBetween($from.pos, $to.pos, (node) => {
                                if (isDivider(node)) {
                                    hasSectionDividers = true;
                                    return false;
                                }
                                return true;
                            });

                            if (hasSectionDividers) {
                                // Collect sectionDividers within the selection to preserve them
                                let tr = state.tr;
                                let preservedDividers: any[] = [];

                                // Collect sectionDividers that are within the selection
                                // @ts-ignore
                                doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
                                    if (isDivider(node)) {
                                        preservedDividers.push(node);
                                    }
                                    return true;
                                });

                                // Delete the entire selection
                                tr = tr.delete($from.pos, $to.pos);

                                // Re-insert sectionDividers with empty paragraphs
                                let insertPos = $from.pos;
                                for (const dividerNode of preservedDividers) {
                                    // Insert the sectionDivider
                                    tr = tr.insert(insertPos, dividerNode);
                                    insertPos += dividerNode.nodeSize;

                                    // Insert an empty paragraph after each sectionDivider
                                    const paragraphNode = state.schema.nodes.paragraph.create({
                                        level: 1,
                                        indent: 0,
                                        styleId: "13"
                                    });
                                    tr = tr.insert(insertPos, paragraphNode);
                                    insertPos += paragraphNode.nodeSize;
                                }

                                if (tr.docChanged) {
                                    dispatch(tr);
                                }
                                return true;
                            }

                            // If no sectionDividers in selection, allow normal deletion
                            return false;
                        }



                        // Gestione della cancellazione con cursore (senza selezione)
                        if (event.key === 'Delete' || event.key === 'Backspace') {
                            // Controlla se i nodi adiacenti sono divider
                            const nodeAfter = $to.nodeAfter;
                            const nodeBefore = $from.nodeBefore;

                            if ((event.key === 'Delete' && isDivider(nodeAfter)) ||
                                (event.key === 'Backspace' && isDivider(nodeBefore))) {
                                return true; // Blocca l'evento
                            }

                            // Controlla se l'operazione attraverserebbe un divider
                            const searchRange = event.key === 'Delete'
                                ? { from: $to.pos, to: $to.pos + 2 }
                                : { from: Math.max(0, $from.pos - 2), to: $from.pos };

                            let foundDivider = false;
                            doc.nodesBetween(searchRange.from, searchRange.to, (node: ProseMirrorNode) => {
                                if (isDivider(node)) {
                                    foundDivider = true;
                                    return false;
                                }
                                return !foundDivider;
                            });

                            if (foundDivider) {
                                return true; // Blocca l'evento
                            }
                        }

                        return false; // Lascia che altri gestori trattino l'evento
                    },

                    // Prevent copying sectionDividers
                    handleDOMEvents: {
                        copy: (view, event) => {
                            const { state } = view;
                            const { selection, doc } = state;
                            const { $from, $to } = selection;

                            // Check if selection contains sectionDividers
                            let hasSectionDividers = false;
                            doc.nodesBetween($from.pos, $to.pos, (node) => {
                                if (node.type.name === 'sectionDivider') {
                                    hasSectionDividers = true;
                                    return false;
                                }
                                return true;
                            });

                            if (hasSectionDividers) {
                                // Create a custom selection without sectionDividers
                                const fragment = doc.slice($from.pos, $to.pos);
                                const filteredContent: any[] = [];

                                fragment.content.forEach((node) => {
                                    if (node.type.name !== 'sectionDivider') {
                                        filteredContent.push(node);
                                    }
                                });

                                if (filteredContent.length > 0) {
                                    // Create a temporary div to hold the filtered content
                                    const tempDiv = document.createElement('div');
                                    let textContent = '';

                                    // Extract text content from filtered nodes
                                    filteredContent.forEach(node => {
                                        if (node.textContent) {
                                            textContent += node.textContent;
                                            tempDiv.appendChild(document.createTextNode(node.textContent));
                                        }
                                    });

                                    // Set clipboard data
                                    event.clipboardData?.setData('text/html', tempDiv.innerHTML);
                                    event.clipboardData?.setData('text/plain', textContent);
                                    event.preventDefault();
                                    return true;
                                } else {
                                    // If only sectionDividers were selected, prevent copy
                                    event.preventDefault();
                                    return true;
                                }
                            }

                            return false; // Allow normal copy
                        },

                        cut: (view, event) => {
                            const { state } = view;
                            const { selection, doc } = state;
                            const { $from, $to } = selection;

                            // Check if selection contains sectionDividers
                            let hasSectionDividers = false;
                            doc.nodesBetween($from.pos, $to.pos, (node) => {
                                if (node.type.name === 'sectionDivider') {
                                    hasSectionDividers = true;
                                    return false;
                                }
                                return true;
                            });

                            if (hasSectionDividers) {
                                // First handle the copy part (without sectionDividers)
                                const fragment = doc.slice($from.pos, $to.pos);
                                const filteredContent: any[] = [];

                                fragment.content.forEach((node) => {
                                    if (node.type.name !== 'sectionDivider') {
                                        filteredContent.push(node);
                                    }
                                });

                                if (filteredContent.length > 0) {
                                    // Copy filtered content to clipboard
                                    const tempDiv = document.createElement('div');
                                    filteredContent.forEach(node => {
                                        if (node.textContent) {
                                            tempDiv.appendChild(document.createTextNode(node.textContent));
                                        }
                                    });
                                    event.clipboardData?.setData('text/html', tempDiv.innerHTML);
                                    event.clipboardData?.setData('text/plain', tempDiv.textContent || '');
                                }

                                // Then handle the deletion part (preserve sectionDividers)
                                // This will use the same logic as our delete handler
                                let tr = state.tr;
                                let preservedDividers: any[] = [];

                                // @ts-ignore
                                doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
                                    if (node.type.name === 'sectionDivider') {
                                        preservedDividers.push(node);
                                    }
                                    return true;
                                });

                                tr = tr.delete($from.pos, $to.pos);

                                let insertPos = $from.pos;
                                for (const dividerNode of preservedDividers) {
                                    tr = tr.insert(insertPos, dividerNode);
                                    insertPos += dividerNode.nodeSize;

                                    const paragraphNode = state.schema.nodes.paragraph.create({
                                        level: 1,
                                        indent: 0,
                                        styleId: "13"
                                    });
                                    tr = tr.insert(insertPos, paragraphNode);
                                    insertPos += paragraphNode.nodeSize;
                                }

                                if (tr.docChanged) {
                                    view.dispatch(tr);
                                }

                                event.preventDefault();
                                return true;
                            }

                            return false; // Allow normal cut
                        }
                    },

                    // Impedisci il trascinamento attraverso i divider
                    handleDrop: (view, event) => {
                        // Ottieni la posizione di drop
                        const dropPos = view.posAtCoords({
                            left: event.clientX,
                            top: event.clientY
                        })?.pos;

                        if (!dropPos) return false;

                        // Verifica se il drop attraverserebbe un divider
                        const { state } = view;
                        const { selection } = state;
                        const dragStart = selection.from;
                        const dragEnd = selection.to;

                        // Determina l'intervallo da controllare
                        const minPos = Math.min(dragStart, dropPos);
                        const maxPos = Math.max(dragEnd, dropPos);

                        // Controlla se ci sono divider nel percorso
                        let hasDividerBetween = false;
                        state.doc.nodesBetween(minPos, maxPos, (node) => {
                            if (
                                //node.type.name === 'horizontalRule' ||
                                node.type.name === 'sectionDivider') {
                                hasDividerBetween = true;
                                return false;
                            }
                            return true;
                        });

                        if (hasDividerBetween) {
                            return true; // Blocca il drop
                        }

                        return false; // Consenti il drop
                    }
                }
            })
        ];
    }
});

export { SectionDivider, SectionDividerProtection };

