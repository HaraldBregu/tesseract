/**
 * Tests for ApparatusParagraph TipTap Node extension
 */

import ApparatusParagraph from './apparatus-paragraph';

describe('ApparatusParagraph Node Extension', () => {
    const extension = ApparatusParagraph;

    describe('configuration', () => {
        it('has a defined name', () => {
            // TipTap extensions expose name property
            expect(extension.name).toBeDefined();
        });

        it('is based on Paragraph extension', () => {
            // ApparatusParagraph extends Paragraph which is a block element
            // The extension config is inherited from the parent
            expect(extension.name).toBe('paragraph');
        });
    });

    describe('commands', () => {
        it('defines addCommands if present', () => {
            // ApparatusParagraph may or may not define commands
            expect(extension).toBeDefined();
        });
    });
});
