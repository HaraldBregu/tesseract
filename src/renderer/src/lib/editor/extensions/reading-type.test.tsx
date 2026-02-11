/**
 * Tests for ReadingType TipTap Node extension
 */

import ReadingType from './reading-type';

describe('ReadingType Node Extension', () => {
    const extension = ReadingType;

    describe('configuration', () => {
        it('has correct name', () => {
            expect(extension.config.name).toBe('readingType');
        });

        it('is an inline element', () => {
            expect(extension.config.group).toBe('inline');
            expect(extension.config.inline).toBe(true);
        });

        it('is not draggable', () => {
            expect(extension.config.draggable).toBe(false);
        });

        it('is not selectable', () => {
            expect(extension.config.selectable).toBe(false);
        });

        it('is not contentEditable', () => {
            expect(extension.config.contentEditable).toBe(false);
        });
    });

    describe('attributes', () => {
        it('defines addAttributes function', () => {
            expect(extension.config.addAttributes).toBeDefined();
        });
    });

    describe('commands', () => {
        it('defines addCommands', () => {
            expect(extension.config.addCommands).toBeDefined();
        });
    });
});
