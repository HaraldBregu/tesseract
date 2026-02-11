import Heading, { Level } from '@tiptap/extension-heading';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        extendedHeading: {
            setHeading: (attributes: { level: Level }) => ReturnType;
            toggleHeading: (attributes: { level: Level }) => ReturnType;
            setHeadingStyle: (level: number, attributes: ElementAttribute) => ReturnType;
        };

    }
}

const h1: ElementAttribute = {
    fontSize: '18pt',
    fontWeight: 'normal',
    color: '#000000',
    fontStyle: 'normal',
    fontFamily: "Times New Roman",
    textAlign: 'left',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    lineHeight: '1',
}

const h2: ElementAttribute = {
    fontSize: '16pt',
    fontWeight: 'normal',
    color: '#000000',
    fontStyle: 'normal',
    fontFamily: "Times New Roman",
    textAlign: 'left',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    lineHeight: '1',
}

const h3: ElementAttribute = {
    fontSize: '14pt',
    fontWeight: 'normal',
    color: '#000000',
    fontStyle: 'normal',
    fontFamily: "Times New Roman",
    textAlign: 'left',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    lineHeight: '1',
}

const h4: ElementAttribute = {
    fontSize: '12pt',
    fontWeight: 'normal',
    color: '#000000',
    fontStyle: 'normal',
    fontFamily: "Times New Roman",
    textAlign: 'left',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    lineHeight: '1',
}

const h5: ElementAttribute = {
    fontSize: '12pt',
    fontWeight: 'normal',
    color: '#000000',
    fontStyle: 'italic',
    fontFamily: "Times New Roman",
    textAlign: 'left',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    lineHeight: '1',
}

const h6: ElementAttribute = {
    fontSize: '10pt',
    fontWeight: 'normal',
    color: '#000000',
    fontStyle: 'italic',
    fontFamily: "Times New Roman",
    textAlign: 'left',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    lineHeight: '1',
}

// Define heading styles for each level
const headingStyles: Record<number, ElementAttribute> = {
    1: h1,
    2: h2,
    3: h3,
    4: h4,
    5: h5,
    6: h6,
};

export const ExtendedHeading = Heading
    .configure({
        levels: [1, 2, 3, 4, 5, 6],
    })
    .extend({
        onCreate() {
            this.editor.chain()
                .focus()
                .command(({ tr, state }) => {
                    let modified = false;
                    state.doc.descendants((node, pos) => {
                        if (node.type.name === 'heading') {
                            const level = node.attrs.level;
                            const style = headingStyles[level];

                            if (!node.attrs.fontSize || !node.attrs.fontFamily) {
                                tr
                                    .setNodeMarkup(pos, undefined, {
                                        ...node.attrs,
                                        fontSize: node.attrs.fontSize || style.fontSize,
                                        fontFamily: node.attrs.fontFamily || style.fontFamily,
                                        fontWeight: node.attrs.fontWeight || style.fontWeight,
                                        fontStyle: node.attrs.fontStyle || style.fontStyle,
                                        textAlign: node.attrs.textAlign || style.textAlign,
                                        marginLeft: node.attrs.marginLeft || style.marginLeft,
                                        marginRight: node.attrs.marginRight || style.marginRight,
                                        marginTop: node.attrs.marginTop || style.marginTop,
                                        marginBottom: node.attrs.marginBottom || style.marginBottom,
                                        lineHeight: node.attrs.lineHeight || style.lineHeight,
                                        color: node.attrs.color || style.color,
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
                level: {
                    default: 1,
                    rendered: true,
                    // Aggiungiamo un trigger per aggiornare gli altri attributi quando cambia il livello
                    parseHTML: element => {
                        const level = parseInt(element.tagName.replace('H', ''), 10);
                        return level || 1;
                    }
                },
                fontSize: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => {
                        const style = element.getAttribute('style');
                        if (style) {
                            const match = style.match(/font-size:\s*([^;]+)/);
                            return match ? match[1].trim() : null;
                        }
                        return element.dataset.fontSize || null;
                    },
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const fontSize = attributes.fontSize || headingStyles[level].fontSize;
                        return { style: `font-size: ${fontSize}` };
                    },
                },
                fontWeight: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.fontWeight || element.dataset.fontWeight || 'bold',
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const weight = attributes.fontWeight || headingStyles[level].fontWeight;
                        return { style: `font-weight: ${weight}` };
                    },
                },
                fontStyle: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.fontStyle || element.dataset.fontStyle || null,
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const style = attributes.fontStyle || headingStyles[level].fontStyle;
                        if (style === 'normal') return {};
                        return { style: `font-style: ${style}` };
                    },
                },
                color: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.color || element.dataset.color || '#000000',
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const color = attributes.color || headingStyles[level].color;
                        return { style: `color: ${color}` };
                    },
                },
                fontFamily: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.fontFamily || element.dataset.fontFamily || 'Times New Roman',
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const fontFamily = attributes.fontFamily || headingStyles[level].fontFamily;
                        return { style: `font-family: ${fontFamily}` };
                    },
                },
                textAlign: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.textAlign || element.dataset.textAlign || 'left',
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const textAlign = attributes.textAlign || headingStyles[level].textAlign;
                        return { style: `text-align: ${textAlign}` };
                    },
                },
                marginLeft: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.marginLeft || element.dataset.marginLeft || '0px',
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const marginLeft = attributes.marginLeft || headingStyles[level].marginLeft;
                        return { style: `margin-left: ${marginLeft}` };
                    },
                },
                marginRight: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.marginRight || element.dataset.marginRight || '0px',
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const marginRight = attributes.marginRight || headingStyles[level].marginRight;
                        return { style: `margin-right: ${marginRight}` };
                    },
                },
                marginTop: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.marginTop || element.dataset.marginTop || '0px',
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const marginTop = attributes.marginTop || headingStyles[level].marginTop;
                        return { style: `margin-top: ${marginTop}` };
                    },
                },
                marginBottom: {
                    default: null, // Rimosso valore di default statico
                    parseHTML: element => element.style.marginBottom || element.dataset.marginBottom || '0px',
                    renderHTML: attributes => {
                        const level = attributes.level || 1;
                        const marginBottom = attributes.marginBottom || headingStyles[level].marginBottom;
                        return { style: `margin-bottom: ${marginBottom}` };
                    },
                },
            };
        },

        addCommands() {
            return {

                setHeading: attributes => ({ chain }) => {
                    const level = attributes.level;
                    const styles = headingStyles[level];

                    return chain().setNode('heading', {
                        level,
                        fontSize: styles.fontSize,
                        fontWeight: styles.fontWeight,
                        fontStyle: styles.fontStyle,
                        color: styles.color,
                        fontFamily: styles.fontFamily
                    }).run();
                },
                setHeadingStyle: (level, attributes) => ({ chain }) => {
                    const styles = headingStyles[level]

                    return chain()
                        .setNode('heading', {
                            level,
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
                        })
                        .run();
                }
            }
        },

        renderHTML({ node, HTMLAttributes }) {
            const level = node.attrs.level;
            const styles = headingStyles[level];

            const attrs = { ...styles, ...node.attrs, ...HTMLAttributes };

            const fontSize = attrs.fontSize;
            const fontWeight = attrs.fontWeight;
            const fontStyle = attrs.fontStyle;
            const color = attrs.color;
            const fontFamily = attrs.fontFamily;
            const textAlign = attrs.textAlign;
            const marginTop = attrs.marginTop;
            const marginBottom = attrs.marginBottom;
            const marginLeft = `${(node.attrs.indent * 40)}px`;
            const marginRight = attrs.marginRight;
            const lineHeight = attrs.lineHeight;

            const styleString = `
        font-size: ${fontSize};
        font-weight: ${fontWeight};
        color: ${color};
        ${fontStyle === 'italic' ? 'font-style: italic' : 'font-style: normal'};
        font-family: ${fontFamily};
        text-align: ${textAlign};
        margin-left: ${marginLeft};
        margin-right: ${marginRight};
        margin-top: ${marginTop};
        margin-bottom: ${marginBottom};
        line-height: ${lineHeight};`;

            return [`h${level}`, {
                ...HTMLAttributes,
                class: `heading-${level}`,
                style: styleString,
                "data-font-size": fontSize,
                "data-font-weight": fontWeight,
                "data-color": color,
                "data-font-style": fontStyle,
                "data-font-family": fontFamily,
            }, 0];
        },

    });
