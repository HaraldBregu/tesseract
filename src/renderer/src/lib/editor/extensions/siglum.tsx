import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from '@tiptap/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        sigla: {
            /**
             * Add a siglum nodes
             */
            addSiglumNodes: (nodes: SiglumNode[], highlightColor?: string, manuscriptsHtml?: string) => ReturnType,

            /**
             * Update sigla highlight color
             */
            updateSiglaHighlightColor: (highlightColor: string) => ReturnType,

            /**
             * Remove a siglum
             */
            unsetSiglum: () => ReturnType,
        }
    }
}

export interface SiglumOptions {
    HTMLAttributes: Record<string, unknown>
}

export default Node.create<SiglumOptions>({
    name: 'siglum',

    group: 'inline',

    inline: true,

    draggable: false,

    selectable: false,

    contentEditable: false,

    addAttributes() {
        return {
            siglumNodes: {
                default: [],
            },
            highlightColor: {
                default: 'transparent',
            },
            manuscriptsHtml: {
                default: '',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'siglum[data-type="siglum"]',
                getAttrs: element => {
                    return {
                        content: element.dataset.content || '',
                        highlightColor: element.dataset.highlightColor || 'transparent',
                        manuscriptsHtml: element.dataset.manuscriptsHtml || '',
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const siglumNodes = HTMLAttributes.siglumNodes as SiglumNode[];
        const highlightColor = HTMLAttributes.highlightColor as string;
        const manuscriptsContent = HTMLAttributes.manuscriptsHtml as string;


        const data: any[] = []

        siglumNodes.forEach((node) => {
            const { content, style } = node;

            let siglaContent = [
                'span', {
                    style: `
                        font-family: ${style.fontFamily};
                        font-size: ${style.fontSize};
                    `
                },
                content,
            ] as any

            if (style.superscript)
                siglaContent = ['sup', {
                    style: `
                        font-family: ${style.fontFamily};
                        font-size: ${style.fontSize};
                    `
                }, siglaContent];
            if (style.subscript)
                siglaContent = ['sub', {
                    style: `
                        font-family: ${style.fontFamily};
                        font-size: ${style.fontSize};
                    `
                }, siglaContent];
            if (style.underline)
                siglaContent = ['u', {
                    style: `
                        font-family: ${style.fontFamily};
                        font-size: ${style.fontSize};
                    `
                }, siglaContent];
            if (style.italic)
                siglaContent = ['em', {
                    style: `
                        font-family: ${style.fontFamily};
                        font-size: ${style.fontSize};
                    `
                }, siglaContent];
            if (style.bold)
                siglaContent = ['strong', {
                    style: `
                        font-family: ${style.fontFamily};
                        font-size: ${style.fontSize};
                    `
                }, siglaContent];

            data.push(siglaContent)
        })

        return [
            'siglum',
            mergeAttributes(
                this.options.HTMLAttributes,
                HTMLAttributes,
                {
                    'data-type': 'sigla',
                    'data-highlight-color': highlightColor,
                    'data-manuscripts-html': manuscriptsContent,
                    // style: `
                    //     user-select: none;
                    //     border-radius: 2px;
                    //     background-color: ${highlightColor || 'transparent'};
                    //     font-size: 12pt;
                    //     font-family: "Times New Roman";
                    // `
                }
            ),
            ...data,
        ]
    },

    addCommands() {
        return {
            addSiglumNodes:
                (nodes: SiglumNode[], highlightColor: string = 'transparent', manuscriptsHtml: string = '') => ({ chain, state }) => {
                    const { from, to } = state.selection;
                    return chain()
                        .insertContentAt(from, {
                            type: this.name,
                            attrs: {
                                highlightColor,
                                siglumNodes: nodes,
                                manuscriptsHtml,
                            },
                        })
                        .deleteRange({
                            from: from + 1,
                            to: to + 1,
                        })
                        .run();
                },
            updateSiglaHighlightColor: (highlightColor: string) => ({ chain }) => {
                return chain()
                    .updateAttributes(this.name, {
                        highlightColor
                    })
                    .run();
            },
            unsetSiglum:
                () => ({ commands }) => {
                    return commands.deleteSelection()
                },
        }
    },
    addNodeView() {
        return ReactNodeViewRenderer(SiglumNodeView);
    },
})

function SiglumNodeView({ node }: Readonly<NodeViewProps>) {
    const siglumNodes = node.attrs.siglumNodes as SiglumNode[];
    const highlightColor = node.attrs.highlightColor as string;
    const manuscriptsHtml = node.attrs.manuscriptsHtml as string;

    const renderSiglumContent = () => {
        return siglumNodes.map((siglumNode, index) => {
            const { content, style } = siglumNode;

            const uniqueKey = `siglum-${index}-${content}-${JSON.stringify(style)}`;

            let contentElement = (
                <span
                    style={{
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                    }}
                >
                    {content}
                </span>
            );

            if (style.bold) {
                contentElement = <strong>{contentElement}</strong>;
            }
            if (style.italic) {
                contentElement = <em>{contentElement}</em>;
            }
            if (style.underline) {
                contentElement = <u>{contentElement}</u>;
            }
            if (style.subscript) {
                contentElement = <sub>{contentElement}</sub>;
            }
            if (style.superscript) {
                contentElement = <sup>{contentElement}</sup>;
            }

            return <span key={uniqueKey}>{contentElement}</span>;
        });
    };

    if (!manuscriptsHtml) {
        return (
            <NodeViewWrapper
                as="span"
                className="inline-block select-none rounded-sm text-[12pt] font-['Times_New_Roman']"
                style={{
                    backgroundColor: highlightColor || 'transparent',
                }}
            >
                {renderSiglumContent()}
            </NodeViewWrapper>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <NodeViewWrapper
                        as="span"
                        className="inline-block select-none rounded-sm text-[12pt] font-['Times_New_Roman']"
                        style={{
                            backgroundColor: highlightColor || 'transparent',
                            cursor: 'pointer',
                            userSelect: 'none',
                            borderRadius: '2px',
                            // fontSize: '12pt',
                            // fontFamily: 'Times New Roman',
                        }}
                    >
                        {renderSiglumContent()}
                    </NodeViewWrapper>
                </TooltipTrigger>
                <TooltipContent className='m-2 p-2'>
                    <div className="max-w-[30rem] max-h-[30rem] overflow-y-auto" dangerouslySetInnerHTML={{ __html: manuscriptsHtml }} />
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
