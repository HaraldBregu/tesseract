import { SearchController } from './search-controller';

// Mock Editor type
const createMockEditor = (textContent = 'Test document with some text content') => {
  const mockDoc = {
    descendants: jest.fn((callback) => {
      // Simulate a simple text node
      const textNode = {
        isText: true,
        text: textContent,
      };
      callback(textNode, 0);
      return true;
    }),
  };

  const mockTransaction = {
    insertText: jest.fn().mockReturnThis(),
    setMeta: jest.fn().mockReturnThis(),
  };

  const mockState = {
    doc: mockDoc,
    tr: mockTransaction,
  };

  const mockView = {
    dispatch: jest.fn(),
    dom: {
      getBoundingClientRect: () => ({ top: 0 }),
      scrollTop: 0,
      scrollTo: jest.fn(),
    },
    coordsAtPos: jest.fn().mockReturnValue({ top: 100 }),
  };

  return {
    state: mockState,
    view: mockView,
  } as any;
};

// Mock external dependencies
jest.mock('../extensions/search', () => ({
  setAllMatches: jest.fn(),
  setActiveIndex: jest.fn(),
  clearVirtualSearch: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  getAllSectionRanges: jest.fn(() => []),
  shouldDisableReplace: jest.fn(() => false),
}));

// Mock findWorker function
const mockFindWorker = jest.fn();

describe('SearchController', () => {
  let controller: SearchController;
  let mockEditor: any;

  beforeEach(() => {
    controller = new SearchController();
    mockEditor = createMockEditor();
    jest.clearAllMocks();
    
    // Mock window.system.findWorker directly on the window object
    Object.defineProperty(globalThis, 'system', {
      value: {
        findWorker: mockFindWorker,
      },
      writable: true,
      configurable: true,
    });
    // Also set it on window for compatibility
    (window as any).system = { findWorker: mockFindWorker };
    mockFindWorker.mockReset();
  });

  afterEach(() => {
    // Clean up
    jest.clearAllMocks();
  });

  describe('setEditor', () => {
    it('sets the editor instance', () => {
      controller.setEditor(mockEditor);
      // Controller should be initialized
      expect(controller.count).toBe(0);
    });
  });

  describe('dispose', () => {
    it('clears matches and resets state', () => {
      controller.setEditor(mockEditor);
      controller.dispose();
      
      expect(controller.count).toBe(0);
      expect(controller.getActiveIndex()).toBe(-1);
      expect(controller.isInReplaceMode).toBe(false);
    });
  });

  describe('cancel', () => {
    it('increments serial number to cancel pending searches', () => {
      controller.cancel();
      // This should not throw
      expect(controller.count).toBe(0);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      controller.setEditor(mockEditor);
    });

    it('returns 0 when editor is not set', async () => {
      const emptyController = new SearchController();
      const result = await emptyController.search('test');
      expect(result).toBe(0);
    });

    it('returns 0 when no chunks found', async () => {
      const emptyEditor = createMockEditor();
      emptyEditor.state.doc.descendants = jest.fn(() => false);
      
      const emptyController = new SearchController();
      emptyController.setEditor(emptyEditor);
      
      const result = await emptyController.search('test');
      expect(result).toBe(0);
    });

    it('calls findWorker with correct payload', async () => {
      const mockMatches: any[] = [];
      mockFindWorker.mockResolvedValue(mockMatches);

      await controller.search('test', false, false);

      expect(mockFindWorker).toHaveBeenCalledWith({
        chunks: expect.arrayContaining([
          expect.objectContaining({ id: expect.any(Number), text: expect.any(String) }),
        ]),
        searchTerm: 'test',
        caseSensitive: false,
        wholeWords: false,
      });
    });

    it('passes caseSensitive flag correctly', async () => {
      mockFindWorker.mockResolvedValue([]);

      await controller.search('test', true, false);

      expect(mockFindWorker).toHaveBeenCalledWith(
        expect.objectContaining({ caseSensitive: true })
      );
    });

    it('passes wholeWords flag correctly', async () => {
      mockFindWorker.mockResolvedValue([]);

      await controller.search('test', false, true);

      expect(mockFindWorker).toHaveBeenCalledWith(
        expect.objectContaining({ wholeWords: true })
      );
    });

    it('returns number of matches found', async () => {
      const mockMatches = [
        { chunkId: 0, index: 5, length: 4 },
        { chunkId: 0, index: 20, length: 4 },
      ];
      mockFindWorker.mockResolvedValue(mockMatches);

      const result = await controller.search('test');

      expect(result).toBe(2);
      expect(controller.count).toBe(2);
    });
  });

  describe('setActiveSearch', () => {
    it('does nothing when ranges are empty', () => {
      controller.setEditor(mockEditor);
      controller.setActiveSearch(0);
      expect(controller.getActiveIndex()).toBe(-1);
    });

    it('does nothing when index is null', () => {
      controller.setEditor(mockEditor);
      controller.setActiveSearch(null as any);
      expect(controller.getActiveIndex()).toBe(-1);
    });
  });

  describe('getters', () => {
    it('getMatches returns empty array initially', () => {
      expect(controller.getMatches()).toEqual([]);
    });

    it('getActiveIndex returns -1 initially', () => {
      expect(controller.getActiveIndex()).toBe(-1);
    });

    it('isInReplaceMode returns false initially', () => {
      expect(controller.isInReplaceMode).toBe(false);
    });

    it('count returns 0 initially', () => {
      expect(controller.count).toBe(0);
    });
  });

  describe('disableReplace', () => {
    it('returns false when no active match', () => {
      controller.setEditor(mockEditor);
      expect(controller.disableReplace()).toBe(false);
    });
  });

  describe('replaceOne', () => {
    it('returns false when editor is not set', async () => {
      const emptyController = new SearchController();
      const result = await emptyController.replaceOne('new', 0, {
        caseSensitive: false,
        searchTerm: 'old',
        wholeWords: false,
        documentCriteria: {},
      } as any);
      expect(result).toBe(false);
    });
  });

  describe('replaceAll', () => {
    it('does nothing when no matches', async () => {
      controller.setEditor(mockEditor);
      await controller.replaceAll('new', 'old');
      // Should complete without error
      expect(controller.count).toBe(0);
    });
  });
});
