/**
 * Tests for PageBreak TipTap Node extension
 */

import PageBreak from './page-break';

describe('PageBreak Node Extension', () => {
    const extension = PageBreak;

    describe('configuration', () => {
        it('has correct name (hardBreak)', () => {
            expect(extension.config.name).toBe('hardBreak');
        });

        it('is a block element', () => {
            expect(extension.config.group).toBe('block');
        });

        it('is atomic', () => {
            expect(extension.config.atom).toBe(true);
        });

        it('is not selectable', () => {
            expect(extension.config.selectable).toBe(false);
        });

        it('is not draggable', () => {
            expect(extension.config.draggable).toBe(false);
        });

        it('is not inline', () => {
            expect(extension.config.inline).toBe(false);
        });
    });

    describe('options', () => {
        it('provides default HTMLAttributes option', () => {
            const options = extension.options;
            expect(options).toBeDefined();
            expect(options.HTMLAttributes).toBeDefined();
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

    describe('nodeView', () => {
        it('defines addNodeView', () => {
            expect(extension.config.addNodeView).toBeDefined();
        });
    });
});
