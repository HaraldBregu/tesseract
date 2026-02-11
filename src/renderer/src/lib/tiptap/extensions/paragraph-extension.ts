import { Paragraph } from '@tiptap/extension-paragraph';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        extendedParagraph: {
            setParagraph: (attributes: any) => ReturnType;
            setParagraphStyle: (attributes: ElementAttribute) => ReturnType;
        };

    }
}

const defaultAttributes: ElementAttribute = {
    fontSize: '12pt',
    fontFamily: 'Times New Roman',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    color: '#000000',
    lineHeight: '1',
}

export const ExtendedParagraph = Paragraph
    .extend({
        onCreate() {
            this.editor.chain()
                .focus()
                .command(({ tr, state }) => {
                    let modified = false;
                    state.doc.descendants((node, pos) => {
                        if (node.type.name === 'paragraph') {
                            if (!node.attrs.fontSize || !node.attrs.fontFamily) {
                                tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    fontSize: node.attrs.fontSize || defaultAttributes.fontSize,
                                    fontFamily: node.attrs.fontFamily || defaultAttributes.fontFamily,
                                    fontWeight: node.attrs.fontWeight || defaultAttributes.fontWeight,
                                    fontStyle: node.attrs.fontStyle || defaultAttributes.fontStyle,
                                    textAlign: node.attrs.textAlign || defaultAttributes.textAlign,
                                    marginLeft: node.attrs.marginLeft || defaultAttributes.marginLeft,
                                    marginRight: node.attrs.marginRight || defaultAttributes.marginRight,
                                    marginTop: node.attrs.marginTop || defaultAttributes.marginTop,
                                    marginBottom: node.attrs.marginBottom || defaultAttributes.marginBottom,
                                    lineHeight: node.attrs.lineHeight || defaultAttributes.lineHeight,
                                    color: node.attrs.color || defaultAttributes.color,
                                });
                                modified = true;
                            }
                        }
                    });
                    return modified;
                }).run();
        },

        addAttributes() {
            return {
                ...this.parent?.(),
                fontSize: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.fontSize || element.dataset.fontSize || '12pt',
                    renderHTML: attributes => {
                        const fontSize = attributes.fontSize || defaultAttributes.fontSize;
                        return { style: `font-size: ${fontSize}` };
                    },
                },
                fontFamily: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.fontFamily || element.dataset.fontFamily || 'Times New Roman',
                    renderHTML: attributes => {
                        const fontFamily = attributes.fontFamily || defaultAttributes.fontFamily;
                        return { style: `font-family: ${fontFamily}` };
                    },
                },
                fontWeight: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.fontWeight || element.dataset.fontWeight || 'normal',
                    renderHTML: attributes => {
                        const fontWeight = attributes.fontWeight || defaultAttributes.fontWeight;
                        return { style: `font-weight: ${fontWeight}` };
                    },
                },
                fontStyle: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.fontStyle || element.dataset.fontStyle || 'normal',
                    renderHTML: attributes => {
                        const fontStyle = attributes.fontStyle || defaultAttributes.fontStyle;
                        return { style: `font-style: ${fontStyle}` };
                    },
                },
                textAlign: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.textAlign || element.dataset.textAlign || 'left',
                    renderHTML: attributes => {
                        const textAlign = attributes.textAlign || defaultAttributes.textAlign;
                        return { style: `text-align: ${textAlign}` };
                    },
                },
                marginLeft: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.marginLeft || element.dataset.marginLeft || '0px',
                    renderHTML: attributes => {
                        const marginLeft = attributes.marginLeft || defaultAttributes.marginLeft;
                        return { style: `margin-left: ${marginLeft}` };
                    },
                },
                marginRight: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.marginRight || element.dataset.marginRight || '0px',
                    renderHTML: attributes => {
                        const marginRight = attributes.marginRight || defaultAttributes.marginRight;
                        return { style: `margin-right: ${marginRight}` };
                    },
                },
                marginTop: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.marginTop || element.dataset.marginTop || '0px',
                    renderHTML: attributes => {
                        const marginTop = attributes.marginTop || defaultAttributes.marginTop;
                        return { style: `margin-top: ${marginTop}` };
                    },
                },
                marginBottom: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.marginBottom || element.dataset.marginBottom || '0px',
                    renderHTML: attributes => {
                        const marginBottom = attributes.marginBottom || defaultAttributes.marginBottom;
                        return { style: `margin-bottom: ${marginBottom}` };
                    },
                },
                lineHeight: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.lineHeight || element.dataset.lineHeight || '1',
                    renderHTML: attributes => {
                        const lineHeight = attributes.lineHeight || defaultAttributes.lineHeight;
                        return { style: `line-height: ${lineHeight}` };
                    },
                },
                color: {
                    default: null,
                    rendered: true,
                    parseHTML: element => element.style.color || element.dataset.color || defaultAttributes.color,
                    renderHTML: attributes => {
                        const color = attributes.color || defaultAttributes.color;
                        return { style: `color: ${color}` };
                    },
                },
            }
        },

        renderHTML({ node, HTMLAttributes }) {
            const attrs = { ...defaultAttributes, ...node.attrs, ...HTMLAttributes };

            const fontFamily = attrs.fontFamily;
            const fontSize = attrs.fontSize;
            const fontWeight = attrs.fontWeight;
            const fontStyle = attrs.fontStyle;
            const textAlign = attrs.textAlign;
            const marginTop = attrs.marginTop;
            const marginBottom = attrs.marginBottom;
            const marginLeft =  `${(node.attrs.indent * 40)}px`;
            const marginRight = attrs.marginRight;
            const lineHeight = attrs.lineHeight;
            const color = attrs.color;

            const styleString = `
                font-size: ${fontSize};
                font-weight: ${fontWeight};
                font-style: ${fontStyle};
                font-family: ${fontFamily};
                text-align: ${textAlign};
                margin-top: ${marginTop};
                margin-bottom: ${marginBottom};
                margin-left: ${marginLeft};
                margin-right: ${marginRight};
                line-height: ${lineHeight};
                color: ${color};
            `;

            return ['p', {
                ...HTMLAttributes,
                style: styleString,
                "data-font-size": fontSize,
                "data-font-weight": fontWeight,
                "data-font-style": fontStyle,
                "data-font-family": fontFamily,
                "data-color": color,
            }, 0];
        },
        addCommands() {
            return {
                ...this.parent?.(),
                setParagraph: () => ({ chain }) => {
                    return chain().setNode('paragraph', { // TODO : Fix this 
                        // fontSize: '19pt',
                        // fontWeight: 'normal',
                        // fontStyle: 'normal',
                        // fontFamily: 'Times New Roman'
                    }).run();
                },
                setParagraphStyle: (attributes: ElementAttribute) => ({ chain }) => {
                    const styles = defaultAttributes

                    return chain().setNode('paragraph', {
                        fontSize: attributes.fontSize ?? styles.fontSize,
                        fontWeight: attributes.fontWeight ?? styles.fontWeight,
                        fontStyle: attributes.fontStyle ?? styles.fontStyle,
                        color: attributes.color ?? styles.color,
                        fontFamily: attributes.fontFamily ?? styles.fontFamily,
                        textAlign: attributes.textAlign ?? styles.textAlign,
                        marginTop: attributes.marginTop ?? styles.marginTop,
                        marginBottom: attributes.marginBottom ?? styles.marginBottom,
                        lineHeight: attributes.lineHeight ?? styles.lineHeight,
                        marginLeft: attributes.marginLeft ?? styles.marginLeft,
                        marginRight: attributes.marginRight ?? styles.marginRight,
                    }).run();
                }
            }
        },
    })
