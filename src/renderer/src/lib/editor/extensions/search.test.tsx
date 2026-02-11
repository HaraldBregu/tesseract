/**
 * Tests for VirtualSearchHighlight extension and utility functions
 */

import {
    VirtualSearchHighlight,
    virtualSearchKey,
    setAllMatches,
    setActiveIndex,
    clearVirtualSearch,
} from './search';

describe('VirtualSearchHighlight Extension', () => {
    describe('module exports', () => {
        it('exports VirtualSearchHighlight extension', () => {
            expect(VirtualSearchHighlight).toBeDefined();
        });

        it('exports virtualSearchKey plugin key', () => {
            expect(virtualSearchKey).toBeDefined();
        });

        it('exports setAllMatches helper', () => {
            expect(typeof setAllMatches).toBe('function');
        });

        it('exports setActiveIndex helper', () => {
            expect(typeof setActiveIndex).toBe('function');
        });

        it('exports clearVirtualSearch helper', () => {
            expect(typeof clearVirtualSearch).toBe('function');
        });
    });

    describe('extension configuration', () => {
        it('has correct name', () => {
            expect(VirtualSearchHighlight.config.name).toBe('virtualSearchHighlight');
        });

        it('defines addProseMirrorPlugins', () => {
            expect(VirtualSearchHighlight.config.addProseMirrorPlugins).toBeDefined();
        });
    });
});
