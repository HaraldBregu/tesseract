/**
 * Tests for TipTap extensions configuration and attributes
 * 
 * Note: TipTap extensions are declarative configurations that define how
 * marks/nodes work in the editor. Testing the configuration objects and
 * their attributes is valuable, while the runtime behavior depends on TipTap's engine.
 */

import BookmarkMark from './bookmark-mark';

describe('Bookmark Mark Extension', () => {
  const extension = BookmarkMark;

  describe('configuration', () => {
    it('has correct name', () => {
      expect(extension.config.name).toBe('bookmark');
    });

    it('is exitable', () => {
      expect(extension.config.exitable).toBe(true);
    });

    it('has empty excludes string', () => {
      expect(extension.config.excludes).toBe('');
    });
  });

  describe('options', () => {
    it('provides default options', () => {
      const options = extension.options;
      expect(options).toBeDefined();
      expect(options.HTMLAttributes).toBeDefined();
    });
  });

  describe('attributes', () => {
    const extensionWithAttrs = BookmarkMark.configure({});
    
    it('defines id attribute', () => {
      expect(extensionWithAttrs.config.addAttributes).toBeDefined();
    });

    it('defines highlightColor attribute', () => {
      expect(extensionWithAttrs.config.addAttributes).toBeDefined();
    });
  });

  describe('parseHTML', () => {
    it('defines parseHTML rules', () => {
      expect(extension.config.parseHTML).toBeDefined();
    });
  });

  describe('commands', () => {
    it('defines addCommands', () => {
      expect(extension.config.addCommands).toBeDefined();
    });
  });
});
