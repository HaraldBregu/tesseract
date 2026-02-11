import { cn } from '@/lib/utils';
import { mergeAttributes } from '@tiptap/core'
import { Node, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';


const defaultAttributes: TocParagraphAttributes = {
    fontSize: '12pt',
    fontFamily: 'Times New Roman',
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
    index: -1,
    spacingType: '1',
    tocNumber: "0",
    text: "-",
    sectionType: null,
}

export interface TocParagraphOptions {
    HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface EditorEvents {
    clickTocParagraphAttributes: TocParagraphAttributes;
  }
}

export default Node.create<TocParagraphOptions>({
    name: 'tocParagraph',

    group: 'block',

    content: 'inline*',

    draggable: false,

    inline: false,

    handleContextMenu: false,

    addAttributes() {
        return {
            fontSize: {
                default: defaultAttributes.fontSize,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.fontSize;
                    return element.style.fontSize || element.dataset.fontSize || defaultAttributes.fontSize;
                },
                renderHTML: attributes => {
                    const fontSize = attributes.fontSize || defaultAttributes.fontSize;
                    return { style: `font-size: ${fontSize}` };
                },
            },
            fontFamily: {
                default: defaultAttributes.fontFamily,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.fontFamily;
                    return element.style.fontFamily || element.dataset.fontFamily || defaultAttributes.fontFamily;
                },
                renderHTML: attributes => {
                    const fontFamily = attributes.fontFamily || defaultAttributes.fontFamily;
                    return { style: `font-family: ${fontFamily}` };
                },
            },
            fontWeight: {
                default: defaultAttributes.fontWeight,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.fontWeight;
                    return element.style.fontWeight || element.dataset.fontWeight || defaultAttributes.fontWeight;
                },
                renderHTML: attributes => {
                    const fontWeight = attributes.fontWeight || defaultAttributes.fontWeight;
                    return { style: `font-weight: ${fontWeight}` };
                },
            },
            fontStyle: {
                default: defaultAttributes.fontStyle,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.fontStyle;
                    return element.style.fontStyle || element.dataset.fontStyle || defaultAttributes.fontStyle;
                },
                renderHTML: attributes => {
                    const fontStyle = attributes.fontStyle || defaultAttributes.fontStyle;
                    return { style: `font-style: ${fontStyle}` };
                },
            },
            color: {
                default: defaultAttributes.color,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.color;
                    return element.style.color || element.dataset.color || defaultAttributes.color;
                },
                renderHTML: attributes => {
                    const color = attributes.color || defaultAttributes.color;
                    return { style: `color: ${color}` };
                },
            },
            index: {
                default: defaultAttributes.index,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.index;
                    return element.dataset.index || defaultAttributes.index;
                },
            },
            spacingType: {
                default: defaultAttributes.spacingType,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.spacingType;
                    return element.dataset.spacingType || defaultAttributes.spacingType;
                },
            },
            tocNumber: {
                default: defaultAttributes.tocNumber,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.tocNumber;
                    return element.dataset.tocNumber || defaultAttributes.tocNumber;
                },
            },
            text: {
                default: defaultAttributes.text,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.text;
                    return element.dataset.text || defaultAttributes.text;
                },
            },
            sectionType: {
                default: defaultAttributes.sectionType,
                rendered: true,
                parseHTML: element => {
                    if (typeof element === 'string') return defaultAttributes.sectionType;
                    return element.dataset.sectionType || defaultAttributes.sectionType;
                },
            },
        }
    },

    addOptions() {
        return {
            HTMLAttributes: {},
        }
    },

    parseHTML() {
        return [
            {
                tag: 'p[data-type="toc-paragraph"]',
                getAttrs: element => {
                    if (typeof element === 'string')
                        return false

                    return {
                        fontSize: element.getAttribute('data-font-size') || element.style.fontSize || defaultAttributes.fontSize,
                        fontFamily: element.getAttribute('data-font-family') || element.style.fontFamily || defaultAttributes.fontFamily,
                        fontWeight: element.getAttribute('data-font-weight') || element.style.fontWeight || defaultAttributes.fontWeight,
                        fontStyle: element.getAttribute('data-font-style') || element.style.fontStyle || defaultAttributes.fontStyle,
                        color: element.getAttribute('data-color') || element.style.color || defaultAttributes.color,
                    }
                },
            },
        ]
    },

    renderHTML({ HTMLAttributes, node }) {
        const attrs = { ...defaultAttributes, ...node.attrs, ...HTMLAttributes };

        const fontFamily = attrs.fontFamily;
        const fontSize = attrs.fontSize;
        const fontWeight = attrs.fontWeight;
        const fontStyle = attrs.fontStyle;
        const color = attrs.color;

        const styleString = `
            font-size: ${fontSize};
            font-weight: ${fontWeight};
            font-style: ${fontStyle};
            font-family: ${fontFamily};
            color: ${color};
        `.trim();

        return [
            'p',
            mergeAttributes(
                this.options.HTMLAttributes,
                HTMLAttributes,
                {
                    'data-type': 'toc-paragraph',
                    'data-font-size': fontSize,
                    'data-font-weight': fontWeight,
                    'data-font-style': fontStyle,
                    'data-font-family': fontFamily,
                    'data-color': color,
                    style: styleString,
                }
            ),
            0,
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(TocParagraphNodeView)
    },
})

function TocParagraphNodeView({ node, editor }: any) {
    const attrs = node.attrs;
    const tocNumber = attrs.tocNumber;
    const title = attrs.text;
    const spacingType = attrs.spacingType;

    const handleClick = () => {
        editor.emit('clickTocParagraphAttributes', attrs as TocParagraphAttributes);
    };

    return (
        <NodeViewWrapper>
            <div
                className="w-full"
                style={{
                    fontSize: attrs.fontSize,
                    fontWeight: attrs.fontWeight,
                    fontStyle: attrs.fontStyle,
                    fontFamily: attrs.fontFamily,
                    color: attrs.color,
                }}>
                <span className="toc-item grid grid-cols-[auto_max-content] items-end mb-2 cursor-pointer no-underline">
                    <span
                        className="title relative overflow-hidden"
                        onClick={handleClick}>
                        {tocNumber} {title}
                        <span
                            className={cn(
                                "after:absolute after:ps-[.25ch] after:color-red-500",
                                spacingType === '1'
                                    ? 'dots'
                                    : spacingType === '2'
                                        ? 'dashes'
                                        : spacingType === '3'
                                            ? 'line'
                                            : ''
                            )}
                            aria-hidden="true">
                        </span>
                    </span>
                    <span className="page text-right">
                        <span className="visually-hidden clip-[rect(0,0,0,0)] [clip-path:inset(100%)] h-px overflow-hidden absolute w-px whitespace-nowrap">Page&nbsp;</span>
                        TBD
                    </span>
                </span>
            </div>
        </NodeViewWrapper>
    )
}

