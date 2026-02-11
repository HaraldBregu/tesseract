import TextStyle from '@tiptap/extension-text-style'

export default TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize)
            return {}

          return {
            style: `font-size: ${attributes.fontSize}`
          }
        }
      },
      fontFamily: {
        default: null,
        parseHTML: (element) => element.style.fontFamily ?? null,
        renderHTML: (attributes) => {
          if (!attributes.fontFamily)
            return {};

          return {
            style: `font-family: ${attributes.fontFamily}`,
          };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => element.style.color ?? null,
        renderHTML: (attributes) => {
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
    }
  },
});