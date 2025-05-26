import { mergeAttributes } from "@tiptap/core";
import Highlight from '@tiptap/extension-highlight';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        comment: {
            setComment: (attributes: { id?: string, color?: string }) => ReturnType;
            toggleComment: (attributes: { color?: string }) => ReturnType;
            unsetComment: () => ReturnType;
            updateCommentColor: (attributes: { color: string }) => ReturnType;
        };
    }
}

const CommentMark = Highlight.extend({
    name: 'comment',
    priority: 1000,
    
    addOptions() {
        return {
            ...this.parent?.(),
            multicolor: true,
            HTMLAttributes: {
                class: 'highlight-comment',
                textColor: '#000000',
                backgroundColor: '#A9BFFF',
            },
        };
    },
    
    addAttributes() {
        return {
            ...this.parent?.(),
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-id'),
                renderHTML: attributes => {
                    if (!attributes.id) return {};
                    return {
                        'data-id': attributes.id
                    };
                }
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-id]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'mark',
            mergeAttributes(
                this.options.HTMLAttributes,
                HTMLAttributes,
                {
                    style: `cursor: pointer; border-radius: 2px;`,
                }
            ),
            0
        ];
    },

    addCommands() {
        return {
            setComment: (attributes) => ({ chain, tr, dispatch }) => {
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

                if (dispatch) dispatch(tr);

                return chain()
                    .setMark(this.name, attributes)
                    .run();
            },
            toggleComment: (attributes) => ({ chain, tr, dispatch }) => {
                if (dispatch) dispatch(tr);

                return chain()
                    .toggleMark(this.name, attributes)
                    .run();
            },
            unsetComment: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
            updateCommentColor: (attributes) => ({ chain, state, dispatch }) => {
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
                                        tr.addMark(
                                            pos,
                                            pos + node.nodeSize,
                                            this.type.create({
                                                ...currentAttrs,
                                                id: currentAttrs.id,
                                                color: attributes.color
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
        };
    },

});

export { CommentMark }