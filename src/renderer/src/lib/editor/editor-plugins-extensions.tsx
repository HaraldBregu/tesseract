import { Extension } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';

declare module '@tiptap/core' {
    interface EditorEvents {
        clickLemmaWithId: string; // LEMMA CLICK
        clickNoteWithId: string; // NOTE CLICK
        clickCommentWithId: string; // COMMENT CLICK
        clickBookmarkWithId: string; // BOOKMARK CLICK
        customMarksDeleted: Array<{
            id: string;
            type: string;
            content: string;
        }>[];
    }
}

export const MainTextPluginsExtension = Extension.create({
    name: 'mainTextPluginsExtension',

    addCommands() {
        return {
            // Override selectAll to skip sectionDividers
            selectAll: () => ({ state, dispatch }) => {
                if (dispatch) {
                    const { doc } = state;

                    // Simply select from 0 to doc.content.size
                    // Commands that modify content will need to handle dividers themselves
                    const selection = TextSelection.create(doc, 0, doc.content.size);
                    dispatch(state.tr.setSelection(selection));
                }
                return true;
            }
        };
    },

    addProseMirrorPlugins() {
        return [

            /**
             * NAME: ProtectDividersPlugin
             * This plugin is used to protect dividers from being deleted or modified
             */
            new Plugin({
                key: new PluginKey('protect-dividers'),
                props: {
                    handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
                        const { state } = view;
                        const { selection } = state;
                        const { $from, $to } = selection;

                        // Check if we're trying to delete a divider
                        if (event.key === 'Backspace' || event.key === 'Delete') {
                            // Check if selection contains a divider
                            let hasDivider = false;
                            state.doc.nodesBetween($from.pos, $to.pos, (node) => {
                                if (node.type.name === 'sectionDivider') {
                                    hasDivider = true;
                                    return false;
                                }
                                return true;
                            });

                            // Check if cursor is adjacent to a divider
                            const nodeBefore = $from.nodeBefore;
                            const nodeAfter = $from.nodeAfter;
                            const isAdjacentToDivider =
                                (nodeBefore && nodeBefore.type.name === 'sectionDivider') ||
                                (nodeAfter && nodeAfter.type.name === 'sectionDivider');

                            if (hasDivider || isAdjacentToDivider) {
                                event.preventDefault();
                                return true;
                            }
                        }

                        return false;
                    },
                    handleClick: (view, pos, _) => {
                        const node = view.state.doc.nodeAt(pos);
                        if (node && node.type.name === 'sectionDivider') {
                            return true;
                        }
                        return false;
                    },

                    handleDOMEvents: {
                        // Prevent cut operations on dividers
                        cut: (view, event) => {
                            const { state } = view;
                            const { selection } = state;
                            const { $from, $to } = selection;

                            let hasDivider = false;
                            state.doc.nodesBetween($from.pos, $to.pos, (node) => {
                                if (node.type.name === 'sectionDivider') {
                                    hasDivider = true;
                                    return false;
                                }
                                return true;
                            });

                            if (hasDivider) {
                                event.preventDefault();
                                return true;
                            }
                            return false;
                        },

                        // Prevent paste operations that might affect dividers
                        paste: (view, event) => {
                            const { state } = view;
                            const { selection } = state;
                            const { $from } = selection;

                            // Check if we're pasting next to a divider
                            const nodeBefore = $from.nodeBefore;
                            const nodeAfter = $from.nodeAfter;
                            const isAdjacentToDivider =
                                (nodeBefore && nodeBefore.type.name === 'sectionDivider') ||
                                (nodeAfter && nodeAfter.type.name === 'sectionDivider');

                            if (isAdjacentToDivider) {
                                event.preventDefault();
                                return true;
                            }
                            return false;
                        },

                        // Prevent drag and drop operations
                        dragstart: (view, event) => {
                            const { state } = view;
                            const { selection } = state;
                            const { $from, $to } = selection;

                            let hasDivider = false;
                            state.doc.nodesBetween($from.pos, $to.pos, (node) => {
                                if (node.type.name === 'sectionDivider') {
                                    hasDivider = true;
                                    return false;
                                }
                                return true;
                            });

                            if (hasDivider) {
                                event.preventDefault();
                                return true;
                            }
                            return false;
                        },

                        // Prevent drop operations
                        drop: (view, event) => {
                            const { state } = view;
                            const { selection } = state;
                            const { $from } = selection;

                            const nodeBefore = $from.nodeBefore;
                            const nodeAfter = $from.nodeAfter;
                            const isAdjacentToDivider =
                                (nodeBefore && nodeBefore.type.name === 'sectionDivider') ||
                                (nodeAfter && nodeAfter.type.name === 'sectionDivider');

                            if (isAdjacentToDivider) {
                                event.preventDefault();
                                return true;
                            }
                            return false;
                        }
                    }
                },
            }),

            /**
             * NAME: SelectionHandlerPlugin
             * This plugin is used to handle selection events
             * and emit a selectionStart and selectionEnd event
             */
            new Plugin({
                key: new PluginKey('selection-handler'),
                props: {
                    handleDOMEvents: {
                        mousedown: (view, _) => {
                            view.dispatch(view.state.tr.setMeta("selectionStart", true))
                            return false
                        },
                        mouseup: (view, _) => {
                            const { from, to } = view.state.selection
                            if (from !== to) {
                                view.dispatch(view.state.tr.setMeta("selectionEnd", { from, to }))
                            }
                            return false
                        },
                    },
                },
            }),

            /**
             * NAME: SectionDividerProtectionPlugin
             * This plugin is used to protect section dividers from being deleted or modified
             */
            new Plugin({
                key: new PluginKey('section-divider-protection'),
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
                        keydown: (view, event) => {
                            // Intercept Ctrl+A / Cmd+A to create custom selection excluding sectionDividers
                            if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
                                event.preventDefault();

                                const { state, dispatch } = view;
                                const { doc, tr } = state;

                                // Collect all nodes that are NOT sectionDividers
                                const contentNodes: any[] = [];
                                let hasDividers = false;

                                doc.descendants((node, pos) => {
                                    if (node.type.name === 'sectionDivider') {
                                        hasDividers = true;
                                    } else if (node.isBlock && node.type.name !== 'doc') {
                                        // Only collect top-level block nodes
                                        contentNodes.push({ node, pos });
                                    }
                                    return true;
                                });

                                // If there are no dividers, use normal select all
                                if (!hasDividers) {
                                    const selection = TextSelection.create(doc, 0, doc.content.size);
                                    dispatch(tr.setSelection(selection));
                                    return true;
                                }

                                // Create a new document fragment without sectionDividers
                                const filteredNodes: any[] = [];
                                doc.content.forEach((node) => {
                                    if (node.type.name !== 'sectionDivider') {
                                        filteredNodes.push(node);
                                    }
                                });

                                if (filteredNodes.length === 0) {
                                    // Nothing to select
                                    return true;
                                }

                                // Find first and last selectable position
                                let firstPos = -1;
                                let lastPos = -1;

                                doc.descendants((node, pos) => {
                                    if (node.type.name !== 'sectionDivider') {
                                        if (firstPos === -1) {
                                            firstPos = pos;
                                        }
                                        lastPos = pos + node.nodeSize;
                                    }
                                    return true;
                                });

                                // Create selection from first to last non-divider content
                                if (firstPos !== -1 && lastPos !== -1) {
                                    try {
                                        // Use TextSelection that spans the entire selectable content
                                        const $from = doc.resolve(Math.max(0, firstPos));
                                        const $to = doc.resolve(Math.min(doc.content.size, lastPos));

                                        // Create a custom transaction that marks sectionDividers as unselectable
                                        const selection = TextSelection.between($from, $to);
                                        dispatch(tr.setSelection(selection));
                                    } catch (e) {
                                        console.error('Selection error:', e);
                                        // Fallback to full selection
                                        const selection = TextSelection.create(doc, 0, doc.content.size);
                                        dispatch(tr.setSelection(selection));
                                    }
                                }

                                return true;
                            }
                            return false;
                        },

                        // Override browser selection behavior for sectionDividers
                        selectstart: (_view, event) => {
                            const target = event.target;
                            // Prevent selection if target is a section divider
                            if (target instanceof HTMLElement && target.closest('[data-type="section-divider"]')) {
                                event.preventDefault();
                                return true;
                            }
                            return false;
                        },

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
            }),

            new Plugin({
                key: new PluginKey('trim-selection-plugin'),
                props: {
                    handleDOMEvents: {
                        // Fires whenever the selection changes in the DOM
                        mouseup(view) {
                            const { state, dispatch } = view
                            const sel = state.selection
                            if (!(sel instanceof TextSelection)) return false

                            const { from, to } = sel
                            if (from === to) return false // caret only

                            const text = state.doc.textBetween(from, to, '\n', '\ufffc')
                            if (!text) return false

                            // Count leading whitespace without regex (avoids ReDoS)
                            let leading = 0
                            while (leading < text.length && /\s/.test(text[leading])) {
                                leading++
                            }

                            // Count trailing whitespace without regex (avoids ReDoS)
                            let trailing = 0
                            while (trailing < text.length - leading && /\s/.test(text[text.length - 1 - trailing])) {
                                trailing++
                            }

                            const newFrom = from + leading
                            const newTo = to - trailing

                            if (newFrom < newTo && (newFrom !== from || newTo !== to)) {
                                const tr = state.tr.setSelection(TextSelection.create(state.doc, newFrom, newTo))
                                dispatch(tr)
                            }

                            return false
                        },
                    },
                },
            }),

            /**
             * NAME: MarksClickListenerPlugin
             * This plugin is used to listen for click events on comment and bookmark marks
             * and emit a clickCommentWithId event and a clickBookmarkWithId event
             */
            new Plugin({
                key: new PluginKey('marks-click-listener-plugin'),
                props: {
                    handleDOMEvents: {
                        click: (_view, event) => {
                            const target = event.target as HTMLElement;
                            const bookmarkElement = target.closest('bookmark');
                            const commentElement = target.closest('comment');
                            const noteElement = target.closest('note');

                            if (bookmarkElement && bookmarkElement instanceof HTMLElement && bookmarkElement.dataset.id) {
                                this.editor.emit(
                                    'clickBookmarkWithId',
                                    bookmarkElement.dataset.id,
                                );
                            }

                            if (commentElement && commentElement instanceof HTMLElement && commentElement.dataset.id) {
                                this.editor.emit(
                                    'clickCommentWithId',
                                    commentElement.dataset.id,
                                );
                            }

                            if (noteElement && noteElement instanceof HTMLElement && noteElement.dataset.id) {
                                this.editor.emit(
                                    'clickNoteWithId',
                                    noteElement.dataset.id,
                                );
                            }

                            return false;
                        }
                    }
                }
            }),

            /**
             * NAME: CustomMarksUpdatesListenerPlugin
             * This plugin is used to listen for text update events
             * and emit a markDeleted event and a markCurrent event
             */
            new Plugin({
                key: new PluginKey('custom-marks-updates-listener-plugin'),
                appendTransaction: (transactions, oldState, newState) => {
                    if (transactions.length === 0) return null;

                    const hasChanges = transactions.some(tr =>
                        tr.docChanged || tr.selectionSet || tr.steps.length > 0
                    );

                    if (!hasChanges) return null;

                    const oldMarks: Array<{
                        markType: string;
                        markId: string;
                        text: string;
                        pos: number;
                        nodeType: string;
                    }> = [];

                    const newMarks: Array<{
                        markType: string;
                        markId: string;
                        text: string;
                        pos: number;
                        nodeType: string;
                    }> = [];

                    if (oldState) {
                        oldState.doc.descendants((node: Node, pos: number) => {
                            if (node.type.name === 'text' && node.marks.length > 0) {
                                node.marks.forEach(mark => {
                                    const markType = mark.type.name;

                                    // Only handle custom marks like comments
                                    if (markType === 'comment' || markType === 'textNote' || markType === 'bookmark') {
                                        const markId = mark.attrs.id || mark.attrs.lemmaId || mark.attrs.commentId || 'default';

                                        oldMarks.push({
                                            markType,
                                            markId,
                                            text: node.textContent,
                                            pos,
                                            nodeType: node.type.name
                                        });
                                    }
                                });
                            }
                            return true;
                        });
                    }

                    newState.doc.descendants((node: Node, pos: number) => {
                        if (node.type.name === 'text' && node.marks.length > 0) {
                            node.marks.forEach(mark => {
                                const markType = mark.type.name;

                                // Only handle custom marks like comments
                                if (markType === 'comment' || markType === 'textNote' || markType === 'bookmark') {
                                    const markId = mark.attrs.id || mark.attrs.lemmaId || mark.attrs.commentId || 'default';
                                    newMarks.push({
                                        markType,
                                        markId,
                                        text: node.textContent,
                                        pos,
                                        nodeType: node.type.name
                                    });
                                }
                            });
                        }
                        return true;
                    });

                    const groupedOldMarks: Record<string, Record<string, { text: string; pos: number; nodeType: string }[]>> = {};
                    const groupedNewMarks: Record<string, Record<string, { text: string; pos: number; nodeType: string }[]>> = {};

                    oldMarks.forEach(mark => {
                        if (!groupedOldMarks[mark.markType]) {
                            groupedOldMarks[mark.markType] = {};
                        }
                        if (!groupedOldMarks[mark.markType][mark.markId]) {
                            groupedOldMarks[mark.markType][mark.markId] = [];
                        }
                        groupedOldMarks[mark.markType][mark.markId].push({
                            text: mark.text,
                            pos: mark.pos,
                            nodeType: mark.nodeType
                        });
                    });

                    newMarks.forEach(mark => {
                        if (!groupedNewMarks[mark.markType]) {
                            groupedNewMarks[mark.markType] = {};
                        }
                        if (!groupedNewMarks[mark.markType][mark.markId]) {
                            groupedNewMarks[mark.markType][mark.markId] = [];
                        }
                        groupedNewMarks[mark.markType][mark.markId].push({
                            text: mark.text,
                            pos: mark.pos,
                            nodeType: mark.nodeType
                        });
                    });

                    // Collect deleted marks
                    const deletedMarks: Array<{ id: string; type: string; content: string }> = [];
                    Object.entries(groupedOldMarks).forEach(([markType, markGroups]) => {
                        Object.entries(markGroups).forEach(([markId, oldItems]) => {
                            const newMarkGroup = groupedNewMarks[markType];
                            const newItems = newMarkGroup ? newMarkGroup[markId] : null;

                            if (!newItems || newItems.length === 0) {
                                const combinedText = oldItems.map(item => item.text).join('');
                                deletedMarks.push({
                                    id: markId,
                                    type: markType,
                                    content: combinedText
                                });
                            }
                        });
                    });

                    // Collect current marks
                    const currentMarks: Array<{ id: string; type: string; content: string }> = [];
                    Object.entries(groupedNewMarks).forEach(([markType, markGroups]) => {
                        Object.entries(markGroups).forEach(([markId, newItems]) => {
                            const combinedText = newItems.map(item => item.text).join('');
                            currentMarks.push({
                                id: markId,
                                type: markType,
                                content: combinedText
                            });
                        });
                    });

                    if (deletedMarks.length > 0) {
                        this.editor.emit('customMarksDeleted', deletedMarks);
                    }

                    return null;
                }
            }),
        ]
    }
})

export const ApparatusPluginsExtension = Extension.create({
    name: 'apparatusPluginsExtension',

    addProseMirrorPlugins() {
        return [

            /**
             * NAME: MarksClickListenerPlugin
             * This plugin is used to listen for click events on lemma marks
             * and emit a clickLemmaWithId event
             */
            new Plugin({
                key: new PluginKey('marks-click-listener-plugin'),
                props: {
                    handleDOMEvents: {
                        click: (_view, event) => {
                            const target = event.target as HTMLElement;
                            const lemmaElement = target.closest('lemma');
                            const commentElement = target.closest('comment');

                            if (lemmaElement && lemmaElement instanceof HTMLElement && lemmaElement.dataset.id) {
                                event.preventDefault();
                                event.stopPropagation();
                                this.editor.emit(
                                    'clickLemmaWithId',
                                    lemmaElement.dataset.id,
                                );
                                return true;
                            }

                            if (commentElement && commentElement instanceof HTMLElement && commentElement.dataset.id) {
                                this.editor.emit(
                                    'clickCommentWithId',
                                    commentElement.dataset.id,
                                );
                            }

                            return false;
                        }
                    }
                }
            }),

            /**
             * NAME: ApparatusContentPreventionPlugin
             * This plugin is used to prevent typing and pasting inside an apparatus node
             * If the apparatus node doesn't have a lemma, prevent typing and pasting
             */
            new Plugin({
                key: new PluginKey('apparatus-content-prevention-plugin'),
                props: {
                    handleKeyPress: (view, event) => {
                        const { state } = view
                        const { selection } = state

                        const $pos = state.doc.resolve(selection.from)
                        let depth = $pos.depth
                        let isInsideApparatus = false
                        let apparatusNode: any = null

                        while (depth > 0) {
                            const node = $pos.node(depth)
                            if (node.type.name === 'apparatusEntry') {
                                isInsideApparatus = true
                                apparatusNode = node
                                break
                            }
                            depth--
                        }

                        if (isInsideApparatus && apparatusNode) {
                            let hasLemma = false
                            apparatusNode.descendants((childNode: any) => {
                                if (childNode.type.name === 'lemma') {
                                    hasLemma = true
                                    return false // Stop searching
                                }
                                return true
                            })

                            if (!hasLemma) {
                                event.preventDefault()
                                return true
                            }
                        }

                        return false
                    },
                }
            }),

            /**
             * NAME: ApparatusLemmaCheckerPlugin
             * Check if the apparatus node contains a lemma node
             * If it doesn't, delete the apparatus node
             */
            new Plugin({
                key: new PluginKey('apparatus-lemma-checker-plugin'),
                appendTransaction: (transactions, _oldState, newState) => {
                    // Only process if there are actual changes
                    if (!transactions.some(transaction => transaction.docChanged)) {
                        return null
                    }

                    const { tr } = newState
                    let modified = false

                    try {
                        // Find all apparatus nodes in the document
                        newState.doc.descendants((node, pos) => {
                            if (node.type.name === 'apparatusEntry') {
                                let hasLemma = false
                                node.descendants((childNode) => {
                                    if (childNode.type.name === 'lemma') {
                                        hasLemma = true
                                        return false // Stop searching once we find a lemma
                                    }
                                    return true // Continue searching
                                })

                                // If no lemma found, delete the apparatus node
                                if (!hasLemma) {
                                    tr.delete(pos, pos + node.nodeSize)
                                    modified = true
                                }
                            }
                            return true
                        })
                        return modified ? tr : null
                    } catch (error) {
                        console.error('Error in apparatus-lemma-checker plugin:', error)
                        return null
                    }
                }
            }),

            /**
             * NAME: LemmaDeletionPreventionPlugin
             * Prevent deleting a lemma node
             * If the lemma node is inside an apparatus, prevent deleting it
             */
            new Plugin({
                key: new PluginKey('lemma-deletion-prevention-plugin'),
                props: {
                    handleKeyDown: (view, event) => {
                        const { state } = view
                        const { selection } = state

                        // Check if the key pressed is backspace or delete
                        if (event.key === 'Backspace' || event.key === 'Delete') {

                            // Method 1: Check if cursor is on a lemma node
                            let isDeletingLemma = false
                            const $pos = state.doc.resolve(selection.from)
                            let depth = $pos.depth

                            while (depth > 0) {
                                const node = $pos.node(depth)
                                if (node.type.name === 'lemma') {
                                    isDeletingLemma = true
                                    break
                                }
                                depth--
                            }

                            // Method 2: Check if selection spans a lemma node
                            if (!isDeletingLemma) {
                                state.doc.nodesBetween(selection.from, selection.to, (node) => {
                                    if (node.type.name === 'lemma') {
                                        isDeletingLemma = true
                                        return false
                                    }
                                    return true
                                })
                            }

                            // Method 3: Check if we're adjacent to a lemma node
                            if (!isDeletingLemma) {
                                const beforePos = selection.from - 1
                                const afterPos = selection.to + 1

                                if (beforePos >= 0) {
                                    const beforeNode = state.doc.nodeAt(beforePos)
                                    if (beforeNode && beforeNode.type.name === 'lemma') {
                                        isDeletingLemma = true
                                    }
                                }

                                if (!isDeletingLemma && afterPos < state.doc.content.size) {
                                    const afterNode = state.doc.nodeAt(afterPos)
                                    if (afterNode && afterNode.type.name === 'lemma') {
                                        isDeletingLemma = true
                                    }
                                }
                            }

                            // Method 4: Check if we're at the start of a lemma node (for delete key)
                            if (!isDeletingLemma && event.key === 'Delete') {
                                const $pos = state.doc.resolve(selection.from)
                                let depth = $pos.depth

                                while (depth > 0) {
                                    const node = $pos.node(depth)
                                    if (node.type.name === 'lemma') {
                                        // Check if we're at the start of this lemma node
                                        const nodeStart = $pos.start(depth)
                                        if (selection.from === nodeStart) {
                                            isDeletingLemma = true
                                            break
                                        }
                                    }
                                    depth--
                                }
                            }

                            // Method 5: Check if we're at the end of a lemma node (for backspace key)
                            if (!isDeletingLemma && event.key === 'Backspace') {
                                const $pos = state.doc.resolve(selection.from)
                                let depth = $pos.depth

                                while (depth > 0) {
                                    const node = $pos.node(depth)
                                    if (node.type.name === 'lemma') {
                                        // Check if we're at the end of this lemma node
                                        const nodeEnd = $pos.end(depth)
                                        if (selection.from === nodeEnd) {
                                            isDeletingLemma = true
                                            break
                                        }
                                    }
                                    depth--
                                }
                            }

                            // Method 6: Check if the next node after cursor is a lemma (for delete key)
                            if (!isDeletingLemma && event.key === 'Delete') {
                                const nextPos = selection.from
                                if (nextPos < state.doc.content.size) {
                                    const nextNode = state.doc.nodeAt(nextPos)
                                    if (nextNode && nextNode.type.name === 'lemma') {
                                        isDeletingLemma = true
                                    }
                                }
                            }

                            // Method 7: Check if the previous node before cursor is a lemma (for backspace key)
                            if (!isDeletingLemma && event.key === 'Backspace') {
                                const prevPos = selection.from - 1
                                if (prevPos >= 0) {
                                    const prevNode = state.doc.nodeAt(prevPos)
                                    if (prevNode && prevNode.type.name === 'lemma') {
                                        isDeletingLemma = true
                                    }
                                }
                            }

                            // Method 8: Check if we're at the boundary of a lemma node
                            if (!isDeletingLemma) {
                                const $pos = state.doc.resolve(selection.from)
                                let depth = $pos.depth

                                while (depth > 0) {
                                    const node = $pos.node(depth)
                                    if (node.type.name === 'lemma') {
                                        const nodeStart = $pos.start(depth)
                                        const nodeEnd = $pos.end(depth)

                                        // Check if cursor is at the boundary of the lemma node
                                        if (selection.from === nodeStart || selection.from === nodeEnd) {
                                            isDeletingLemma = true
                                            break
                                        }
                                    }
                                    depth--
                                }
                            }

                            // If we're trying to delete a lemma node, prevent it
                            if (isDeletingLemma) {
                                event.preventDefault()
                                event.stopPropagation()
                                return true
                            }
                        }

                        return false
                    }
                }
            }),

            /**
             * NAME: CustomMarksUpdatesListenerPlugin
             * This plugin is used to listen for text update events
             * and emit a markDeleted event and a markCurrent event
             */
            new Plugin({
                key: new PluginKey('custom-marks-updates-listener-plugin'),
                appendTransaction: (transactions, oldState, newState) => {
                    if (transactions.length === 0) return null;

                    const hasChanges = transactions.some(tr =>
                        tr.docChanged || tr.selectionSet || tr.steps.length > 0
                    );

                    if (!hasChanges) return null;

                    const oldMarks: Array<{
                        markType: string;
                        markId: string;
                        text: string;
                        pos: number;
                        nodeType: string;
                    }> = [];

                    const newMarks: Array<{
                        markType: string;
                        markId: string;
                        text: string;
                        pos: number;
                        nodeType: string;
                    }> = [];

                    if (oldState) {
                        oldState.doc.descendants((node: Node, pos: number) => {
                            if (node.type.name === 'text' && node.marks.length > 0) {
                                node.marks.forEach(mark => {
                                    const markType = mark.type.name;

                                    // Only handle custom marks like comments
                                    if (markType === 'comment') {
                                        const markId = mark.attrs.id || mark.attrs.lemmaId || mark.attrs.commentId || 'default';

                                        oldMarks.push({
                                            markType,
                                            markId,
                                            text: node.textContent,
                                            pos,
                                            nodeType: node.type.name
                                        });
                                    }
                                });
                            }
                            return true;
                        });
                    }

                    newState.doc.descendants((node: Node, pos: number) => {
                        if (node.type.name === 'text' && node.marks.length > 0) {
                            node.marks.forEach(mark => {
                                const markType = mark.type.name;

                                // Only handle custom marks like comments
                                if (markType === 'comment') {
                                    const markId = mark.attrs.id || mark.attrs.lemmaId || mark.attrs.commentId || 'default';
                                    newMarks.push({
                                        markType,
                                        markId,
                                        text: node.textContent,
                                        pos,
                                        nodeType: node.type.name
                                    });
                                }
                            });
                        }
                        return true;
                    });

                    const groupedOldMarks: Record<string, Record<string, { text: string; pos: number; nodeType: string }[]>> = {};
                    const groupedNewMarks: Record<string, Record<string, { text: string; pos: number; nodeType: string }[]>> = {};

                    oldMarks.forEach(mark => {
                        if (!groupedOldMarks[mark.markType]) {
                            groupedOldMarks[mark.markType] = {};
                        }
                        if (!groupedOldMarks[mark.markType][mark.markId]) {
                            groupedOldMarks[mark.markType][mark.markId] = [];
                        }
                        groupedOldMarks[mark.markType][mark.markId].push({
                            text: mark.text,
                            pos: mark.pos,
                            nodeType: mark.nodeType
                        });
                    });

                    newMarks.forEach(mark => {
                        if (!groupedNewMarks[mark.markType]) {
                            groupedNewMarks[mark.markType] = {};
                        }
                        if (!groupedNewMarks[mark.markType][mark.markId]) {
                            groupedNewMarks[mark.markType][mark.markId] = [];
                        }
                        groupedNewMarks[mark.markType][mark.markId].push({
                            text: mark.text,
                            pos: mark.pos,
                            nodeType: mark.nodeType
                        });
                    });

                    // Collect deleted marks
                    const deletedMarks: Array<{ id: string; type: string; content: string }> = [];
                    Object.entries(groupedOldMarks).forEach(([markType, markGroups]) => {
                        Object.entries(markGroups).forEach(([markId, oldItems]) => {
                            const newMarkGroup = groupedNewMarks[markType];
                            const newItems = newMarkGroup ? newMarkGroup[markId] : null;

                            if (!newItems || newItems.length === 0) {
                                const combinedText = oldItems.map(item => item.text).join('');
                                deletedMarks.push({
                                    id: markId,
                                    type: markType,
                                    content: combinedText
                                });
                            }
                        });
                    });

                    // Collect current marks
                    const currentMarks: Array<{ id: string; type: string; content: string }> = [];
                    Object.entries(groupedNewMarks).forEach(([markType, markGroups]) => {
                        Object.entries(markGroups).forEach(([markId, newItems]) => {
                            const combinedText = newItems.map(item => item.text).join('');
                            currentMarks.push({
                                id: markId,
                                type: markType,
                                content: combinedText
                            });
                        });
                    });

                    if (deletedMarks.length > 0) {
                        this.editor.emit('customMarksDeleted', deletedMarks);
                    }

                    return null;
                }
            }),

            /**
             * NAME: ParagraphDeletionPreventionPlugin
             * Print current and next node content when Delete key is pressed
             */
            new Plugin({
                key: new PluginKey('paragraph-deletion-prevention-plugin'),
                props: {
                    handleKeyDown: (view, event) => {
                        if (event.key === 'Delete') {
                            const { state } = view
                            const { selection } = state
                            const currentPos = selection.from

                            const rootNodes: Array<{ pos: number; type: string; content: string; size: number; endPos: number }> = []

                            let pos = 1
                            state.doc.content.forEach((node: Node) => {
                                const endPos = pos + node.nodeSize - 1
                                rootNodes.push({
                                    pos,
                                    type: node.type.name,
                                    content: node.textContent || '',
                                    size: node.nodeSize,
                                    endPos
                                })
                                pos += node.nodeSize
                            })

                            let currentNode: typeof rootNodes[0] | null = null
                            for (let i = 0; i < rootNodes.length; i++) {
                                const node = rootNodes[i]
                                if (currentPos >= node.pos && currentPos <= node.endPos) {
                                    currentNode = node
                                }
                            }

                            if (currentNode && currentPos === currentNode.endPos - 2) {
                                event.preventDefault()
                                event.stopPropagation()
                                return true
                            }
                        }

                        if (event.key === 'Backspace') {
                            const { state } = view
                            const { selection } = state
                            const currentPos = selection.from

                            if (currentPos === 0) {
                                event.preventDefault()
                                event.stopPropagation()
                                return true
                            }

                            const rootNodes: Array<{ pos: number; startPos: number; type: string; content: string; size: number; endPos: number }> = []

                            let pos = 1
                            state.doc.content.forEach((node: Node) => {
                                const endPos = pos + node.nodeSize - 1
                                rootNodes.push({
                                    pos,
                                    startPos: pos,
                                    type: node.type.name,
                                    content: node.textContent || '',
                                    size: node.nodeSize,
                                    endPos
                                })
                                pos += node.nodeSize
                            })

                            let currentNode: typeof rootNodes[0] | null = null
                            for (let i = 0; i < rootNodes.length; i++) {
                                const node = rootNodes[i]
                                if (currentPos >= node.pos && currentPos <= node.endPos) {
                                    currentNode = node
                                }
                            }

                            if (currentNode && currentPos === currentNode.pos + 1) {
                                event.preventDefault()
                                event.stopPropagation()
                                return true
                            }
                        }

                        return false
                    }
                }
            }),

        ]
    }
})