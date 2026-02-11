/**
 * Tests for TextNote TipTap Mark extension
 */

import TextNote from './text-note';

describe('TextNote Mark Extension', () => {
    const extension = TextNote;

    describe('configuration', () => {
        it('has correct name', () => {
            expect(extension.config.name).toBeDefined();
        });
    });

    describe('attributes', () => {
        it('defines addAttributes function', () => {
            expect(extension.config.addAttributes).toBeDefined();
        });
    });

    describe('parseHTML', () => {
        it('defines parseHTML rules', () => {
            expect(extension.config.parseHTML).toBeDefined();
        });
    });

    describe('renderHTML', () => {
        it('defines renderHTML function', () => {
            expect(extension.config.renderHTML).toBeDefined();
        });
    });

    describe('commands', () => {
        it('defines addCommands', () => {
            expect(extension.config.addCommands).toBeDefined();
        });
    });
});
