import { cn } from "@/lib/utils";
import { Mark, mergeAttributes } from "@tiptap/core";

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        bookmark: {
            /**
             * Set a bookmark mark
             */
            setBookmark: (attributes: { highlightColor: string }) => ReturnType;
            /**
             * Unset a bookmark mark
             */
            unsetBookmark: () => ReturnType;
            /**
             * Unset bookmarks with ids
             */
            unsetBookmarksWithIds: (ids: string[]) => ReturnType;
            /**
             * Update a bookmark highlight color in the mark
             */
            updateBookmark: (attributes: { highlightColor: string }) => ReturnType;
        };
    }

    interface EditorEvents {
        bookmarkCreated: { id: string; selectedText: string };
    }
}

interface BookmarkMarkOptions {
    HTMLAttributes: Record<string, unknown>
}

export default Mark.create<BookmarkMarkOptions>({
    name: 'bookmark',
    // priority: 98,
    exitable: true,
    excludes: '',
    // Set to false if you want to unset the mark when the cursor is at the end of the mark
    inclusive: false,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
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
                    'data-highlight-color': attributes.highlightColor
                })
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'bookmark[data-id]',
                getAttrs: (element: HTMLElement) => ({
                    id: element.dataset.id,
                    highlightColor: element.dataset.highlightColor,
                })
            },
        ];
    },

    renderHTML({ HTMLAttributes, mark }) {
        const highlightColor = mark.attrs.highlightColor || 'transparent'
        return [
            'bookmark',
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
                        background-color: ${highlightColor}70;
                        transition: background-color 0.2s ease;
                    `,
                }
            ),
            0
        ];
    },

    addCommands() {
        return {
            setBookmark: ({ highlightColor }) => ({ editor, commands, state }) => {
                const id = crypto.randomUUID();
                const selectedText = state.doc.textBetween(state.selection.from, state.selection.to);
                const result = commands.setMark(this.name, { highlightColor, id });
                editor.emit('bookmarkCreated', { id, selectedText });
                return result;
            },
            unsetBookmark: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
            unsetBookmarksWithIds: (ids) => ({ state, dispatch }) => {
                if (!dispatch)
                    return false;

                const transaction = state.tr;
                state.doc.descendants((node, pos) => {
                    const marks = node.marks.filter(mark => mark.type.name === 'bookmark' && ids.includes(mark.attrs.id));
                    for (const mark of marks) {
                        transaction.removeMark(
                            pos,
                            pos + node.nodeSize,
                            mark
                        );
                    }
                });
                dispatch(transaction);

                return true;
            },
            updateBookmark: ({ highlightColor }) => ({ chain, state, dispatch }) => {
                if (!dispatch) return false;

                const { from, to } = state.selection;
                const marks = state.doc.rangeHasMark(from, to, this.type);

                if (!marks) return false;

                return chain()
                    .command(({ tr }) => {
                        // First, remove all existing bookmark marks in the range
                        tr.removeMark(from, to, this.type);

                        // Then add the updated mark with new color
                        state.doc.nodesBetween(from, to, (node, pos) => {
                            for (const mark of node.marks) {
                                if (mark.type === this.type) {
                                    const currentAttrs = mark.attrs;
                                    tr.addMark(
                                        pos,
                                        pos + node.nodeSize,
                                        this.type.create({
                                            ...currentAttrs,
                                            highlightColor,
                                        })
                                    );
                                }
                            }
                        });
                        return true;
                    })
                    .run();
            },
        };
    },
});