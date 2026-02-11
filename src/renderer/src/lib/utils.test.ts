import { cn, debounce, matchesShortcut, shouldDisableReplace } from './utils';

describe('cn (classnames utility)', () => {
  it('merges class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isInactive = false;
    expect(cn('base', isActive && 'active', isInactive && 'inactive')).toBe('base active');
  });

  it('handles arrays', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('handles objects', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles null and undefined', () => {
    expect(cn(null, undefined, 'valid')).toBe('valid');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles complex tailwind conflicting classes', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('bg-red-500 hover:bg-red-600', 'bg-blue-500')).toBe('hover:bg-red-600 bg-blue-500');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('delays function execution', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets timer on subsequent calls', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    jest.advanceTimersByTime(50);
    
    debouncedFn();
    jest.advanceTimersByTime(50);
    
    expect(fn).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to original function', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('only executes once for rapid calls', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    for (let i = 0; i < 10; i++) {
      debouncedFn();
    }

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('matchesShortcut', () => {
  const createKeyboardEvent = (
    key: string,
    options: Partial<KeyboardEvent> = {}
  ): KeyboardEvent => {
    return new KeyboardEvent('keydown', {
      key,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      ...options,
    });
  };

  it('matches simple key', () => {
    const event = createKeyboardEvent('F5');
    expect(matchesShortcut(event, 'F5')).toBe(true);
  });

  it('does not match different key', () => {
    const event = createKeyboardEvent('F4');
    expect(matchesShortcut(event, 'F5')).toBe(false);
  });

  it('matches Ctrl modifier', () => {
    const event = createKeyboardEvent('s', { ctrlKey: true });
    expect(matchesShortcut(event, 'Ctrl+s')).toBe(true);
  });

  it('matches Shift modifier', () => {
    const event = createKeyboardEvent('S', { shiftKey: true });
    expect(matchesShortcut(event, 'Shift+S')).toBe(true);
  });

  it('matches Alt modifier', () => {
    const event = createKeyboardEvent('a', { altKey: true });
    expect(matchesShortcut(event, 'Alt+a')).toBe(true);
  });

  it('matches multiple modifiers', () => {
    const event = createKeyboardEvent('S', { ctrlKey: true, shiftKey: true });
    expect(matchesShortcut(event, 'Ctrl+Shift+S')).toBe(true);
  });

  it('case insensitive key matching', () => {
    const event = createKeyboardEvent('A');
    expect(matchesShortcut(event, 'a')).toBe(true);
  });

  it('returns false for empty shortcut', () => {
    const event = createKeyboardEvent('a');
    expect(matchesShortcut(event, '')).toBe(false);
  });
});

describe('shouldDisableReplace', () => {
  it('returns true for toc section', () => {
    const element = { section: 'toc' } as any;
    expect(shouldDisableReplace(element, null)).toBe(true);
  });

  it('returns false for other sections', () => {
    const element = { section: 'body' } as any;
    expect(shouldDisableReplace(element, null)).toBe(false);
  });

  it('returns false for undefined section', () => {
    const element = {} as any;
    expect(shouldDisableReplace(element, null)).toBe(false);
  });
});
