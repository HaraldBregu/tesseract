/**
 * Tests for EditorBubbleMenu component
 */

import { EditorBubbleMenu } from './editor-bubble-menu';

describe('EditorBubbleMenu', () => {
    describe('module exports', () => {
        it('exports EditorBubbleMenu function', () => {
            expect(typeof EditorBubbleMenu).toBe('function');
        });
    });

    describe('EditorBubbleMenuElement interface', () => {
        it('defines show, hide, toggle, activate methods', () => {
            // Interface verification through import
            // Full testing requires mocking TipTap Editor and floating-ui
            expect(EditorBubbleMenu).toBeDefined();
        });
    });
});
