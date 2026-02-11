/**
 * Tests for TocParagraph TipTap Node extension
 */

import TocParagraph from './toc-paragraph';

describe('TocParagraph Node Extension', () => {
    const extension = TocParagraph;

    describe('configuration', () => {
        it('has correct name', () => {
            expect(extension.config.name).toBe('tocParagraph');
        });

        it('is a block element', () => {
            expect(extension.config.group).toBe('block');
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

});
