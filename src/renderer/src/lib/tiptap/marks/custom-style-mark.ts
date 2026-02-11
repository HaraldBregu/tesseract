import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customStyleMark: {
      setCustomStyleMark: (attributes: any) => ReturnType
      unSetCustomStyleMark: () => ReturnType
    }
  }
}

const defaultAttributes = {
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
  styleId: null,
}

export const CustomStyleMark = Mark.create({
  name: 'customStyleMark',
  inclusive: true,

  addAttributes() {
    return {
      styleId: {
        default: defaultAttributes.styleId,
        parseHTML: element => element.getAttribute('data-style-id') || defaultAttributes.styleId,
        renderHTML: attributes => attributes.styleId ? { 'data-style-id': attributes.styleId } : {},
      },
      fontSize: {
        default: defaultAttributes.fontSize,
        parseHTML: element => element.style.fontSize || defaultAttributes.fontSize,
        renderHTML: attributes => ({ style: `font-size: ${attributes.fontSize}` }),
      },
      fontFamily: {
        default: defaultAttributes.fontFamily,
        parseHTML: element => element.style.fontFamily || defaultAttributes.fontFamily,
        renderHTML: attributes => ({ style: `font-family: ${attributes.fontFamily}` }),
      },
      fontWeight: {
        default: defaultAttributes.fontWeight,
        parseHTML: element => element.style.fontWeight || defaultAttributes.fontWeight,
        renderHTML: attributes => ({ style: `font-weight: ${attributes.fontWeight}` }),
      },
      fontStyle: {
        default: defaultAttributes.fontStyle,
        parseHTML: element => element.style.fontStyle || defaultAttributes.fontStyle,
        renderHTML: attributes => ({ style: `font-style: ${attributes.fontStyle}` }),
      },
      textAlign: {
        default: defaultAttributes.textAlign,
        parseHTML: element => element.style.textAlign || defaultAttributes.textAlign,
        renderHTML: attributes => ({ style: `text-align: ${attributes.textAlign}` }),
      },
      marginLeft: {
        default: defaultAttributes.marginLeft,
        parseHTML: element => element.style.marginLeft || defaultAttributes.marginLeft,
        renderHTML: attributes => ({ style: `margin-left: ${attributes.marginLeft}` }),
      },
      marginRight: {
        default: defaultAttributes.marginRight,
        parseHTML: element => element.style.marginRight || defaultAttributes.marginRight,
        renderHTML: attributes => ({ style: `margin-right: ${attributes.marginRight}` }),
      },
      marginTop: {
        default: defaultAttributes.marginTop,
        parseHTML: element => element.style.marginTop || defaultAttributes.marginTop,
        renderHTML: attributes => ({ style: `margin-top: ${attributes.marginTop}` }),
      },
      marginBottom: {
        default: defaultAttributes.marginBottom,
        parseHTML: element => element.style.marginBottom || defaultAttributes.marginBottom,
        renderHTML: attributes => ({ style: `margin-bottom: ${attributes.marginBottom}` }),
      },
      lineHeight: {
        default: defaultAttributes.lineHeight,
        parseHTML: element => element.style.lineHeight || defaultAttributes.lineHeight,
        renderHTML: attributes => ({ style: `line-height: ${attributes.lineHeight}` }),
      },
      color: {
        default: defaultAttributes.color,
        parseHTML: element => element.style.color || defaultAttributes.color,
        renderHTML: attributes => ({ style: `color: ${attributes.color}` }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: element => (element instanceof HTMLElement && (
          element.hasAttribute('style') ||
          element.hasAttribute('data-style-id')
        )) && null,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setCustomStyleMark: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      unsetCustomStyleMark: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
