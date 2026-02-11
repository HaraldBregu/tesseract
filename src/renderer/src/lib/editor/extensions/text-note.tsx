import { cn } from '@/lib/utils'
import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textNote: {
            /**
             * Set a text note mark
             */
            setTextNote: (attributes: { highlightColor: string }) => ReturnType
            /**
             * Update a text note highlight color in the mark
             */
            updateTextNote: (attributes: { highlightColor: string }) => ReturnType;
            /**
             * Unset a text note mark
             */
            unsetTextNote: () => ReturnType
        }
    }

    interface EditorEvents {
        textNoteCreationFailed: void;
        textNoteCreationSuccess: { id: string; content: string };
    }
}

interface TextNoteOptions {
    HTMLAttributes: Record<string, unknown>
}

const TextNote = Mark.create<TextNoteOptions>({
    name: 'textNote',
    priority: 98,
    exitable: true,
    excludes: '',
    // Set to false if you want to unset the mark when the cursor is at the end of the mark
    inclusive: false,

    addOptions() {
        return {
            HTMLAttributes: {}
        }
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: (element) => element.dataset.id,
                renderHTML: (attributes) => ({
                    'data-id': attributes.id,
                })
            },
            highlightColor: {
                default: 'transparent',
                parseHTML: (element) => element.dataset.highlightColor,
                renderHTML: (attributes) => ({
                    'data-highlight-color': attributes.highlightColor,
                })
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'note[data-id]',
                getAttrs: (element: HTMLElement) => ({
                    id: element.dataset.id,
                    highlightColor: element.dataset.highlightColor,
                })
            },
        ]
    },

    renderHTML({ HTMLAttributes, mark }) {
        const highlightColor = mark.attrs.highlightColor || 'transparent'

        return [
            'note',
            mergeAttributes(
                this.options.HTMLAttributes,
                HTMLAttributes,
                {
                    class: cn(
                        'cursor-pointer',
                        "hover:!bg-[var(--highlight-color)]",
                    ),
                    style: `
                    --highlight-color: ${highlightColor};
                    background-color: ${highlightColor}80;
                    transition: background-color 0.2s ease;
                `,
                }),
            0
        ]
    },

    addCommands() {
        return {
            setTextNote: (attributes) => ({ commands, state, editor }) => {
                const id = crypto.randomUUID();
                const content = state.doc.textBetween(state.selection.from, state.selection.to);
                const result = commands.setMark(this.name, { ...attributes, id });
                if (result) {
                    editor.emit('textNoteCreationSuccess', { id, content });
                } else {
                    editor.emit('textNoteCreationFailed');
                }
                return result
            },
            updateTextNote: ({ highlightColor }) => ({ chain, state, dispatch }) => {
                if (!dispatch) return false;

                const { from, to } = state.selection;
                const marks = state.doc.rangeHasMark(from, to, this.type);

                if (!marks) return false;

                return chain()
                    .command(({ tr }) => {
                        state.doc.nodesBetween(from, to, (node, pos) => {
                            if (node.marks) {
                                node.marks.forEach(mark => {
                                    if (mark.type === this.type) {
                                        const currentAttrs = mark.attrs;
                                        tr.removeMark(pos, pos + node.nodeSize, this.type);
                                        tr.addMark(
                                            pos,
                                            pos + node.nodeSize,
                                            this.type.create({
                                                ...currentAttrs,
                                                highlightColor
                                            })
                                        );
                                    }
                                });
                            }
                        });
                        return true;
                    })
                    .run();
            },
            unsetTextNote: () => ({ commands }) => {
                return commands.unsetMark(this.name)
            },
        }
    }
})

export default TextNote
