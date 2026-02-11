/**
 * Tests for CommentMark TipTap Mark extension
 */

import CommentMark from './comment-mark';

describe('CommentMark Mark Extension', () => {
    const extension = CommentMark;

    describe('configuration', () => {
        it('has correct name', () => {
            expect(extension.config.name).toBe('comment');
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
