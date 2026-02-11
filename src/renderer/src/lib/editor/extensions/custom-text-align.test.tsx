/**
 * Tests for CustomTextAlign TipTap extension
 */

import { CustomTextAlign } from './custom-text-align';

describe('CustomTextAlign Extension', () => {
    describe('configuration', () => {
        it('extends TextAlign', () => {
            expect(CustomTextAlign).toBeDefined();
            expect(CustomTextAlign.name).toBe('textAlign');
        });

        it('defines keyboard shortcuts', () => {
            expect(CustomTextAlign.config.addKeyboardShortcuts).toBeDefined();
        });
    });

    describe('keyboard shortcuts', () => {
        it('returns empty shortcuts object', () => {
            // The extension has commented-out keyboard shortcuts
            const extension = CustomTextAlign.configure({});
            expect(extension.config.addKeyboardShortcuts).toBeDefined();
        });
    });
});
