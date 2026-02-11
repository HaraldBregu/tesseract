import ListItem from '@tiptap/extension-list-item';
import { getNextBulletType } from '@/lib/utils/list-type-mappers';

/**
 * Extended ListItem with custom keyboard shortcuts
 * - Tab: For bullet lists, creates nested list with rotated bullet type (disc → circle → square)
 *        For ordered lists, maintains the same list type
 * - Shift-Tab: Lifts list item
 * - Backspace: Lifts list item when at the start
 */
export const ExtendedListItem = ListItem.extend({
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      
      Tab: () => {
        // Handle bullet list rotation on indent
        if (this.editor.isActive('bulletList')) {
          const { state } = this.editor;
          const { $from } = state.selection;
          
          // Get current bullet type before sinking
          let parentBulletType = 'disc';
          for (let d = $from.depth; d >= 0; d--) {
            const node = $from.node(d);
            if (node.type.name === 'bulletList' && node.attrs.bulletType) {
              parentBulletType = node.attrs.bulletType;
              break;
            }
          }
          
          const nextBulletType = getNextBulletType(parentBulletType);
          
          // Sink the list item
          const result = this.editor.commands.sinkListItem(this.name);
          
          // After sinking, find and update only the newly nested list
          if (result) {
            const { state: newState } = this.editor;
            const { $from: new$from } = newState.selection;
            
            // Find the closest bulletList (which should be the nested one)
            for (let d = new$from.depth; d >= 0; d--) {
              const node = new$from.node(d);
              if (node.type.name === 'bulletList') {
                const pos = new$from.before(d);
                // Update only this specific nested list
                this.editor.commands.command(({ tr }) => {
                  tr.setNodeMarkup(pos, undefined, { 
                    ...node.attrs, 
                    bulletType: nextBulletType 
                  });
                  return true;
                });
                break;
              }
            }
          }
          
          return result;
        }

        // For ordered lists, keep the existing behavior
        const listType = this.editor.getAttributes('orderedList').listType;

        const result = this.editor.commands.sinkListItem(this.name);

        // After sinking, apply the same list type to the nested list
        if (result && listType && this.editor.isActive('orderedList')) {
          this.editor.commands.updateAttributes('orderedList', { listType });
        }

        return result;
      },
      
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
      
      Backspace: () => {
        // Only handle backspace at the start of a list item
        const { selection } = this.editor.state;
        const { $from } = selection;

        if ($from.parentOffset === 0 && this.editor.can().liftListItem(this.name)) {
          return this.editor.commands.liftListItem(this.name);
        }

        return false;
      },
    }
  },
});

