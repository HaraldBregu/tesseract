import { renderHook, act } from '@testing-library/react';
import { useArray } from './use-array';

describe('useArray', () => {
  describe('initialization', () => {
    it('initializes with provided array', () => {
      const { result } = renderHook(() => useArray([1, 2, 3]));
      expect(result.current[0]).toEqual([1, 2, 3]);
    });

    it('initializes with empty array', () => {
      const { result } = renderHook(() => useArray([]));
      expect(result.current[0]).toEqual([]);
    });

    it('initializes with array of objects', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const { result } = renderHook(() => useArray(items));
      expect(result.current[0]).toEqual(items);
    });

    it('handles null/undefined gracefully', () => {
      const { result } = renderHook(() => useArray(null as any));
      expect(result.current[0]).toEqual([]);
    });
  });

  describe('add', () => {
    it('adds element to end of array', () => {
      const { result } = renderHook(() => useArray([1, 2]));

      act(() => {
        result.current[1].add(3);
      });

      expect(result.current[0]).toEqual([1, 2, 3]);
    });

    it('adds element to empty array', () => {
      const { result } = renderHook(() => useArray<number>([]));

      act(() => {
        result.current[1].add(1);
      });

      expect(result.current[0]).toEqual([1]);
    });

    it('adds multiple elements', () => {
      const { result } = renderHook(() => useArray<string>([]));

      act(() => {
        result.current[1].add('a');
        result.current[1].add('b');
        result.current[1].add('c');
      });

      expect(result.current[0]).toEqual(['a', 'b', 'c']);
    });

    it('adds complex objects', () => {
      const { result } = renderHook(() => useArray<{ id: number }>([]));

      act(() => {
        result.current[1].add({ id: 1 });
      });

      expect(result.current[0]).toEqual([{ id: 1 }]);
    });
  });

  describe('remove', () => {
    it('removes element at index', () => {
      const { result } = renderHook(() => useArray(['a', 'b', 'c']));

      act(() => {
        result.current[1].remove(1);
      });

      expect(result.current[0]).toEqual(['a', 'c']);
    });

    it('removes first element', () => {
      const { result } = renderHook(() => useArray([1, 2, 3]));

      act(() => {
        result.current[1].remove(0);
      });

      expect(result.current[0]).toEqual([2, 3]);
    });

    it('removes last element', () => {
      const { result } = renderHook(() => useArray([1, 2, 3]));

      act(() => {
        result.current[1].remove(2);
      });

      expect(result.current[0]).toEqual([1, 2]);
    });

    it('handles removal from single-element array', () => {
      const { result } = renderHook(() => useArray([1]));

      act(() => {
        result.current[1].remove(0);
      });

      expect(result.current[0]).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates element at index', () => {
      const { result } = renderHook(() => useArray(['a', 'b', 'c']));

      act(() => {
        result.current[1].update(1, 'updated');
      });

      expect(result.current[0]).toEqual(['a', 'updated', 'c']);
    });

    it('updates first element', () => {
      const { result } = renderHook(() => useArray([1, 2, 3]));

      act(() => {
        result.current[1].update(0, 10);
      });

      expect(result.current[0]).toEqual([10, 2, 3]);
    });

    it('updates last element', () => {
      const { result } = renderHook(() => useArray([1, 2, 3]));

      act(() => {
        result.current[1].update(2, 30);
      });

      expect(result.current[0]).toEqual([1, 2, 30]);
    });

    it('updates complex objects', () => {
      const { result } = renderHook(() =>
        useArray([{ id: 1, name: 'old' }])
      );

      act(() => {
        result.current[1].update(0, { id: 1, name: 'new' });
      });

      expect(result.current[0][0].name).toBe('new');
    });
  });

  describe('replace', () => {
    it('replaces entire array', () => {
      const { result } = renderHook(() => useArray([1, 2, 3]));

      act(() => {
        result.current[1].replace([4, 5, 6]);
      });

      expect(result.current[0]).toEqual([4, 5, 6]);
    });

    it('replaces with empty array', () => {
      const { result } = renderHook(() => useArray([1, 2, 3]));

      act(() => {
        result.current[1].replace([]);
      });

      expect(result.current[0]).toEqual([]);
    });

    it('replaces empty array with new values', () => {
      const { result } = renderHook(() => useArray<number>([]));

      act(() => {
        result.current[1].replace([1, 2, 3]);
      });

      expect(result.current[0]).toEqual([1, 2, 3]);
    });

    it('does not update if arrays are equal', () => {
      const { result } = renderHook(() => useArray([1, 2, 3]));
      const originalReference = result.current[0];

      act(() => {
        result.current[1].replace([1, 2, 3]);
      });

      // The array reference should remain the same if values are equal
      expect(result.current[0]).toBe(originalReference);
    });
  });

  describe('combined operations', () => {
    it('handles add, remove, update sequence', () => {
      const { result } = renderHook(() => useArray<string>([]));

      act(() => {
        result.current[1].add('a');
        result.current[1].add('b');
        result.current[1].add('c');
      });
      expect(result.current[0]).toEqual(['a', 'b', 'c']);

      act(() => {
        result.current[1].remove(1);
      });
      expect(result.current[0]).toEqual(['a', 'c']);

      act(() => {
        result.current[1].update(0, 'updated');
      });
      expect(result.current[0]).toEqual(['updated', 'c']);
    });
  });

  describe('return type', () => {
    it('returns array with data and actions', () => {
      const { result } = renderHook(() => useArray([]));

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      expect(Array.isArray(result.current[0])).toBe(true);
      expect(typeof result.current[1]).toBe('object');
    });

    it('returns actions object with correct methods', () => {
      const { result } = renderHook(() => useArray([]));
      const actions = result.current[1];

      expect(typeof actions.add).toBe('function');
      expect(typeof actions.remove).toBe('function');
      expect(typeof actions.update).toBe('function');
      expect(typeof actions.replace).toBe('function');
    });
  });
});
