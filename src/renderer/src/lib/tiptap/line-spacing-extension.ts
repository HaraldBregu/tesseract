import { Extension } from "@tiptap/core";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineSpacing: {
      setLineSpacing: (lineHeight: Spacing) => ReturnType;
      resetLineSpacing: () => ReturnType;
    };
  }
}

const LineSpacing = Extension.create({
  name: 'lineSpacing',
  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: 1,
            parseHTML: (element) => {
              const lineHeight = element.dataset.lineHeight;
              return lineHeight ? Number.parseFloat(lineHeight) : 1;
            },
            renderHTML: (attributes) => {
              const lineHeight = attributes.lineHeight || 1;
              const marginTop = attributes.marginTop ?? 10;
              const marginBottom = attributes.marginBottom ?? 10;

              const styles: string[] = [
                `margin-top: ${marginTop}px !important`,
                `margin-bottom: ${marginBottom}px !important`
              ];

              if (lineHeight !== 1) {
                styles.unshift(`line-height: ${lineHeight}`);
              }

              return {
                style: styles.join('; '),
                'data-line-height': lineHeight,
                'data-margin-top': marginTop,
                'data-margin-bottom': marginBottom,
              };
            },
          },
          marginTop: {
            default: 10,
            parseHTML: (element) => {
              const margin = element.dataset.marginTop;
              return margin ? Number.parseFloat(margin) : 10;
            },
          },
          marginBottom: {
            default: 10,
            parseHTML: (element) => {
              const margin = element.dataset.marginBottom;
              return margin ? Number.parseFloat(margin) : 10;
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineSpacing: (lineSpacing: Spacing) => ({ commands }) => {
        return this.options.types.every((type: string) =>
          commands.updateAttributes(type, {
            lineHeight: `${lineSpacing.line}`,
            marginTop: `${lineSpacing.before}px`,
            marginBottom: `${lineSpacing.after}px`,
          }),
        );
      },
      resetLineSpacing: () => ({ commands }) => {
        return this.options.types.every((type: string) =>
          commands.resetAttributes(type, ['lineHeight', 'marginTop', 'marginBottom']),
        );
      },
    };
  },
  addKeyboardShortcuts() {
    return {
      // REMOVED shortcut management of this extension because they should be dynamically managed
      // 'Mod+1': () => this.editor.commands.setLineSpacing({
      //   line: 1,
      //   before: null,
      //   after: null,
      // }),
      // 'Mod+2': () => this.editor.commands.setLineSpacing({
      //   line: 1.15,
      //   before: null,
      //   after: null,
      // }),
      // 'Mod+3': () => this.editor.commands.setLineSpacing({
      //   line: 1.5,
      //   before: null,
      //   after: null,
      // }),
      // 'Mod+4': () => this.editor.commands.setLineSpacing({
      //   line: 2,
      //   before: null,
      //   after: null,
      // }),
    };
  },
});

export default LineSpacing;