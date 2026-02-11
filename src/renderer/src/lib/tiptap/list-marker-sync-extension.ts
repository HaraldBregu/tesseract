import { Extension } from '@tiptap/core';
import { createListMarkerSyncPlugin } from './list-marker-sync-plugin';

/**
 * Extension that automatically syncs list marker styles with list item content
 * Ensures that list markers (bullets/numbers) inherit styling from the first text in each list
 */
export const ListMarkerSyncExtension = Extension.create({
  name: 'listMarkerSync',

  addProseMirrorPlugins() {
    return [createListMarkerSyncPlugin(this.editor)];
  },
});

