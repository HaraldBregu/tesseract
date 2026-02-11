import TextAlign from "@tiptap/extension-text-align";

export const CustomTextAlign = TextAlign.extend({
  addKeyboardShortcuts() {
    return {
      // 'Mod-l': () => this.editor.commands.toggleTextAlign('left'),
      // 'Mod-e': () => this.editor.commands.toggleTextAlign('center'),
      // 'Mod-r': () => this.editor.commands.toggleTextAlign('right'),
      // 'Mod-j': () => this.editor.commands.toggleTextAlign('justify'),
    };
  },
});
