/**
 * Tests for Siglum TipTap Node extension
 */

import Siglum from './siglum';

describe('Siglum Node Extension', () => {
    const extension = Siglum;

    describe('configuration', () => {
        it('has correct name', () => {
            expect(extension.config.name).toBe('siglum');
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
