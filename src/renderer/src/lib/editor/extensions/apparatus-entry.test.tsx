/**
 * Tests for ApparatusEntry TipTap Node extension
 */

import ApparatusEntry from './apparatus-entry';

describe('ApparatusEntry Node Extension', () => {
    const extension = ApparatusEntry;

    describe('configuration', () => {
        it('has correct name', () => {
            expect(extension.config.name).toBe('apparatusEntry');
        });

        it('is a block element', () => {
            expect(extension.config.group).toBe('block');
        });

        it('has paragraph content', () => {
            expect(extension.config.content).toBe('paragraph');
        });

        it('is draggable', () => {
            expect(extension.config.draggable).toBe(true);
        });

        it('is not inline', () => {
            expect(extension.config.inline).toBe(false);
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

    describe('nodeView', () => {
        it('defines addNodeView', () => {
            expect(extension.config.addNodeView).toBeDefined();
        });
    });
});
