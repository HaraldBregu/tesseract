import {
  writeClipboardItem,
  writeClipboardItems,
  readClipboardItems,
  readClipboardText,
  clearClipboardData,
} from './clipboardUtils';

// Mock the Clipboard API
const mockClipboard = {
  write: jest.fn().mockResolvedValue(undefined),
  read: jest.fn().mockResolvedValue([]),
  readText: jest.fn().mockResolvedValue(''),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock ClipboardItem
global.ClipboardItem = jest.fn().mockImplementation((data) => ({
  types: Object.keys(data),
  getType: (type) => Promise.resolve(data[type]),
  supports: () => true
})) as unknown as typeof ClipboardItem;

describe('clipboardUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('writeClipboardItem', () => {
    it('creates ClipboardItem with text/plain and text/html', async () => {
      await writeClipboardItem('<p>HTML</p>', 'Plain text');

      expect(ClipboardItem).toHaveBeenCalledWith({
        'text/plain': expect.any(Blob),
        'text/html': expect.any(Blob),
      });
    });

    it('calls clipboard.write with items', async () => {
      await writeClipboardItem('<div>Test</div>', 'Test');

      expect(mockClipboard.write).toHaveBeenCalledTimes(1);
      expect(mockClipboard.write).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('writeClipboardItems', () => {
    it('writes items to clipboard', async () => {
      const items = [new ClipboardItem({ 'text/plain': new Blob(['test']) })];
      
      await writeClipboardItems(items);

      expect(mockClipboard.write).toHaveBeenCalledWith(items);
    });

    it('returns promise', async () => {
      const result = writeClipboardItems([]);
      expect(result).toBeInstanceOf(Promise);
      await result;
    });
  });

  describe('readClipboardItems', () => {
    it('reads items from clipboard', async () => {
      const mockItems = [{ types: ['text/plain'] }];
      mockClipboard.read.mockResolvedValueOnce(mockItems);

      const result = await readClipboardItems();

      expect(mockClipboard.read).toHaveBeenCalled();
      expect(result).toEqual(mockItems);
    });

    it('returns empty array when clipboard is empty', async () => {
      mockClipboard.read.mockResolvedValueOnce([]);

      const result = await readClipboardItems();

      expect(result).toEqual([]);
    });
  });

  describe('readClipboardText', () => {
    it('reads text from clipboard', async () => {
      mockClipboard.readText.mockResolvedValueOnce('clipboard text');

      const result = await readClipboardText();

      expect(mockClipboard.readText).toHaveBeenCalled();
      expect(result).toBe('clipboard text');
    });

    it('returns empty string when no text', async () => {
      mockClipboard.readText.mockResolvedValueOnce('');

      const result = await readClipboardText();

      expect(result).toBe('');
    });
  });

  describe('clearClipboardData', () => {
    it('writes empty array to clipboard', () => {
      clearClipboardData();

      expect(mockClipboard.write).toHaveBeenCalledWith([]);
    });
  });
});
