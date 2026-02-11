import { mergeAttributes, Node } from '@tiptap/core'
import { cn } from '../../utils';

// Default reading type constants
const DEFAULT_READING_TYPE_ADD: ReadingTypeAdd = {
    content: "add.",
    style: {
        bold: false,
        italic: false,
        underline: false,
        highlightColor: "transparent"
    }
};

const DEFAULT_READING_TYPE_OM: ReadingTypeOm = {
    content: "om.",
    style: {
        bold: false,
        italic: false,
        underline: false,
        highlightColor: "transparent"
    }
};

const DEFAULT_READING_TYPE_TR: ReadingTypeTr = {
    content: "tr.",
    style: {
        bold: false,
        italic: false,
        underline: false,
        highlightColor: "transparent"
    }
};

const DEFAULT_READING_TYPE_DEL: ReadingTypeDel = {
    content: "del.",
    style: {
        bold: false,
        italic: false,
        underline: false,
        highlightColor: "transparent"
    }
};

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        readingType: {
            /**
             * Add a reading type ADD
             */
            setReadingTypeAdd: (readingType?: ReadingTypeAdd) => ReturnType,
            /**
             * Add a reading type OM
             */
            setReadingTypeOm: (readingType?: ReadingTypeOm) => ReturnType,
            /**
             * Add a reading type TR
             */
            setReadingTypeTr: (readingType?: ReadingTypeTr) => ReturnType,
            /**
             * Add a reading type DEL
             */
            setReadingTypeDel: (readingType?: ReadingTypeDel) => ReturnType,
            /**
             * Add a reading type CUSTOM
             */
            setReadingTypeCustom: (content: string, style: ReadingTypeCustomStyle) => ReturnType,
            /**
             * Update a reading type
             */
            updateReadingType: (readingType: ReadingType) => ReturnType,
            /**
             * Update the highlight color of a reading type
             */
            updateReadingTypeHighlightColor: (highlightColor: string) => ReturnType,            
            /**
             * Remove a reading type
             */
            unsetReadingType: () => ReturnType,
        }
    }
}

export interface ReadingTypeOptions {
    HTMLAttributes: Record<string, unknown>
}

const ReadingType = Node.create<ReadingTypeOptions>({
    name: 'readingType',

    group: 'inline',

    inline: true,

    draggable: false,

    selectable: false,

    contentEditable: false,

    addAttributes() {
        return {
            type: {
                default: null,
            },
            readingType: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'reading-type[data-type="reading-type"]',
                getAttrs: element => {
                    if (typeof element === 'string') {
                        return false;
                    }

                    const typeData = element.getAttribute('reading-type-data');
                    if (!typeData) return false;

                    try {
                        const parsed = JSON.parse(typeData);
                        const typeAttr = element.getAttribute('data-reading-type');
                        return {
                            type: typeAttr,
                            readingType: parsed,
                        };
                    } catch {
                        return false;
                    }
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const readingType = HTMLAttributes.readingType as ReadingTypeAdd | ReadingTypeOm | ReadingTypeTr | ReadingTypeDel;
        const type = HTMLAttributes.type as string;
        const style = readingType?.style;
        const content = readingType?.content || '';

        let contentElement = [
            'content', {
                class: cn(
                    'p-0.5',
                ),
            },
            content,
        ] as any;

        if (style?.underline)
            contentElement = ['u', {}, contentElement];
        if (style?.italic)
            contentElement = ['em', {}, contentElement];
        if (style?.bold)
            contentElement = ['strong', {}, contentElement];

        return [
            'reading-type',
            mergeAttributes(
                this.options.HTMLAttributes,
                HTMLAttributes,
                {
                    'data-type': 'reading-type',
                    'data-reading-type': type,
                    'reading-type-data': JSON.stringify(readingType),
                    style: `
                        background-color: ${style?.highlightColor || 'transparent'};
                    `
                }
            ),
            contentElement,
        ]
    },

    addCommands() {
        return {
            setReadingTypeAdd: (readingType?: ReadingTypeAdd) => ({ chain, state }) => {
                const { from, to } = state.selection;
                const finalReadingType = readingType || DEFAULT_READING_TYPE_ADD;

                return chain()
                    .insertContentAt(from, {
                        type: this.name,
                        attrs: {
                            type: "add",
                            readingType: finalReadingType,
                        }
                    })
                    .deleteRange({
                        from: from + 1,
                        to: to + 1,
                    })
                    .run();
            },
            setReadingTypeOm: (readingType?: ReadingTypeOm) => ({ chain, state }) => {
                const { from, to } = state.selection;
                const finalReadingType = readingType || DEFAULT_READING_TYPE_OM;

                return chain()
                    .insertContentAt(from, {
                        type: this.name,
                        attrs: {
                            type: "om",
                            readingType: finalReadingType,
                        }
                    })
                    .deleteRange({
                        from: from + 1,
                        to: to + 1,
                    })
                    .run();
            },
            setReadingTypeTr: (readingType?: ReadingTypeTr) => ({ chain, state }) => {
                const { from, to } = state.selection;
                const finalReadingType = readingType || DEFAULT_READING_TYPE_TR;

                return chain()
                    .insertContentAt(from, {
                        type: this.name,
                        attrs: {
                            type: "tr",
                            readingType: finalReadingType,
                        }
                    })
                    .deleteRange({
                        from: from + 1,
                        to: to + 1,
                    })
                    .run();
            },
            setReadingTypeDel: (readingType?: ReadingTypeDel) => ({ chain, state }) => {
                const { from, to } = state.selection;
                const finalReadingType = readingType || DEFAULT_READING_TYPE_DEL;

                return chain()
                    .insertContentAt(from, {
                        type: this.name,
                        attrs: {
                            type: "del",
                            readingType: finalReadingType,
                        }
                    })
                    .deleteRange({
                        from: from + 1,
                        to: to + 1,
                    })
                    .run();
            },
            setReadingTypeCustom: (content: string, style?: ReadingTypeCustomStyle) => ({ chain, state }) => {
                const { from, to } = state.selection;
                const finalReadingType = {
                    content: content,
                    style: style,
                };

                return chain()
                    .insertContentAt(from, {
                        type: this.name,
                        attrs: {
                            type: "custom",
                            readingType: finalReadingType,
                        }
                    })
                    .deleteRange({
                        from: from + 1,
                        to: to + 1,
                    })
                    .run();
            },
            updateReadingType:
                (readingType: ReadingType) => ({ chain }) => {
                    return chain().focus().updateAttributes(this.name, { readingType }).run();
                },
            updateReadingTypeHighlightColor:
                (highlightColor: string) => ({ chain }) => {
                    return chain().focus().updateAttributes(this.name, { highlightColor }).run();
                },
            unsetReadingType:
                () => ({ commands }) => {
                    return commands.deleteSelection()
                },
        }
    },
})

export default ReadingType
