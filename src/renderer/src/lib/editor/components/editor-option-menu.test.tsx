/**
 * Tests for EditorOptionMenu component
 */

import {
    EditorOptionMenu,
    EditorOptionMenuHeader,
    EditorOptionMenuFooter,
} from './editor-option-menu';

describe('EditorOptionMenu', () => {
    describe('module exports', () => {
        it('exports EditorOptionMenu function', () => {
            expect(typeof EditorOptionMenu).toBe('function');
        });

        it('exports EditorOptionMenuHeader', () => {
            expect(typeof EditorOptionMenuHeader).toBe('function');
        });

        it('exports EditorOptionMenuFooter', () => {
            expect(typeof EditorOptionMenuFooter).toBe('function');
        });
    });
});
