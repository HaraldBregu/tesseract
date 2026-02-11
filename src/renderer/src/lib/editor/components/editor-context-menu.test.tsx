/**
 * Tests for EditorContextMenu component
 */

import {
    EditorContextMenu,
    EditorContextMenuHeader,
    EditorContextMenuFooter,
    EditorContextMenuToolbar,
    EditorContextMenuSeparator,
    EditorContextMenuList,
    EditorContextMenuItemButton,
} from './editor-context-menu';

describe('EditorContextMenu', () => {
    describe('module exports', () => {
        it('exports EditorContextMenu function', () => {
            expect(typeof EditorContextMenu).toBe('function');
        });

        it('exports EditorContextMenuHeader', () => {
            expect(typeof EditorContextMenuHeader).toBe('function');
        });

        it('exports EditorContextMenuFooter', () => {
            expect(typeof EditorContextMenuFooter).toBe('function');
        });

        it('exports EditorContextMenuToolbar', () => {
            expect(typeof EditorContextMenuToolbar).toBe('function');
        });

        it('exports EditorContextMenuSeparator', () => {
            expect(typeof EditorContextMenuSeparator).toBe('function');
        });

        it('exports EditorContextMenuList', () => {
            expect(typeof EditorContextMenuList).toBe('function');
        });

        it('exports EditorContextMenuItemButton', () => {
            expect(typeof EditorContextMenuItemButton).toBe('function');
        });
    });
});
