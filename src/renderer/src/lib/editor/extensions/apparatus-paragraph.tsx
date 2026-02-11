import { Paragraph } from "@tiptap/extension-paragraph";

const defaultAttributes: ElementAttribute = {
    fontSize: '12pt',
    fontFamily: 'Times New Roman',
    color: '#000000',
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'left',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    lineHeight: '1',

}

const ApparatusParagraph = Paragraph
    .extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                fontSize: {
                    default: defaultAttributes.fontSize,
                    rendered: true,
                    parseHTML: element => element.style.fontSize || element.dataset.fontSize || '12pt',
                    renderHTML: attributes => {
                        const fontSize = attributes.fontSize || defaultAttributes.fontSize;
                        return { style: `font-size: ${fontSize}` };
                    },
                },
                fontFamily: {
                    default: defaultAttributes.fontFamily,
                    rendered: true,
                    parseHTML: element => element.style.fontFamily || element.dataset.fontFamily || 'Times New Roman',
                    renderHTML: attributes => {
                        const fontFamily = attributes.fontFamily || defaultAttributes.fontFamily;
                        return { style: `font-family: ${fontFamily}` };
                    },
                },
                color: {
                    default: defaultAttributes.color,
                    rendered: true,
                    parseHTML: element => element.style.color || element.dataset.color || '#000000',
                    renderHTML: attributes => {
                        const color = attributes.color || defaultAttributes.color;
                        return { style: `color: ${color}` };
                    },
                },
                fontWeight: {
                    default: defaultAttributes.fontWeight,
                    rendered: true,
                    parseHTML: element => element.style.fontWeight || element.dataset.fontWeight || 'normal',
                    renderHTML: attributes => {
                        const fontWeight = attributes.fontWeight || defaultAttributes.fontWeight;
                        return { style: `font-weight: ${fontWeight}` };
                    },
                },
                fontStyle: {
                    default: defaultAttributes.fontStyle,
                    rendered: true,
                    parseHTML: element => element.style.fontStyle || element.dataset.fontStyle || 'normal',
                    renderHTML: attributes => {
                        const fontStyle = attributes.fontStyle || defaultAttributes.fontStyle;
                        return { style: `font-style: ${fontStyle}` };
                    },
                },
            }
        },
    })
    .configure({
        HTMLAttributes: {
            class: '!my-0 !mx-0',
        }
    })

export default ApparatusParagraph