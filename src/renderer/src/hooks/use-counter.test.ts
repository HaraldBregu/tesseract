import { renderHook, act } from '@testing-library/react';
import { useCounter } from './use-counter';

describe('useCounter', () => {
  describe('initialization', () => {
    it('initializes with default value of 0', () => {
      const { result } = renderHook(() => useCounter());
      expect(result.current[0]).toBe(0);
    });

    it('initializes with custom value', () => {
      const { result } = renderHook(() => useCounter(10));
      expect(result.current[0]).toBe(10);
    });

    it('initializes with negative value', () => {
      const { result } = renderHook(() => useCounter(-5));
      expect(result.current[0]).toBe(-5);
    });
  });

  describe('increment', () => {
    it('increments counter by 1', () => {
      const { result } = renderHook(() => useCounter(0));

      act(() => {
        result.current[1].increment();
      });

      expect(result.current[0]).toBe(1);
    });

    it('increments multiple times', () => {
      const { result } = renderHook(() => useCounter(0));

      act(() => {
        result.current[1].increment();
        result.current[1].increment();
        result.current[1].increment();
      });

      expect(result.current[0]).toBe(3);
    });

    it('increments from negative number', () => {
      const { result } = renderHook(() => useCounter(-2));

      act(() => {
        result.current[1].increment();
      });

      expect(result.current[0]).toBe(-1);
    });
  });

  describe('decrement', () => {
    it('decrements counter by 1', () => {
      const { result } = renderHook(() => useCounter(5));

      act(() => {
        result.current[1].decrement();
      });

      expect(result.current[0]).toBe(4);
    });

    it('decrements to negative number', () => {
      const { result } = renderHook(() => useCounter(0));

      act(() => {
        result.current[1].decrement();
      });

      expect(result.current[0]).toBe(-1);
    });

    it('decrements multiple times', () => {
      const { result } = renderHook(() => useCounter(10));

      act(() => {
        result.current[1].decrement();
        result.current[1].decrement();
        result.current[1].decrement();
      });

      expect(result.current[0]).toBe(7);
    });
  });

  describe('reset', () => {
    it('resets to initial value', () => {
      const { result } = renderHook(() => useCounter(5));

      act(() => {
        result.current[1].increment();
        result.current[1].increment();
      });
      expect(result.current[0]).toBe(7);

      act(() => {
        result.current[1].reset();
      });
      expect(result.current[0]).toBe(5);
    });

    it('resets to default initial value (0)', () => {
      const { result } = renderHook(() => useCounter());

      act(() => {
        result.current[1].increment();
        result.current[1].increment();
      });

      act(() => {
        result.current[1].reset();
      });
      expect(result.current[0]).toBe(0);
    });

    it('resets to negative initial value', () => {
      const { result } = renderHook(() => useCounter(-10));

      act(() => {
        result.current[1].increment();
        result.current[1].increment();
      });

      act(() => {
        result.current[1].reset();
      });
      expect(result.current[0]).toBe(-10);
    });
  });

  describe('combined operations', () => {
    it('handles mixed increment and decrement', () => {
      const { result } = renderHook(() => useCounter(0));

      act(() => {
        result.current[1].increment();
        result.current[1].increment();
        result.current[1].decrement();
        result.current[1].increment();
      });

      expect(result.current[0]).toBe(2);
    });

    it('handles increment, decrement, and reset', () => {
      const { result } = renderHook(() => useCounter(5));

      act(() => {
        result.current[1].increment();
        result.current[1].decrement();
        result.current[1].decrement();
        result.current[1].reset();
      });

      expect(result.current[0]).toBe(5);
    });
  });

  describe('return type', () => {
    it('returns array with counter and actions', () => {
      const { result } = renderHook(() => useCounter());

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      expect(typeof result.current[0]).toBe('number');
      expect(typeof result.current[1]).toBe('object');
    });

    it('returns actions object with correct methods', () => {
      const { result } = renderHook(() => useCounter());
      const actions = result.current[1];

      expect(typeof actions.increment).toBe('function');
      expect(typeof actions.decrement).toBe('function');
      expect(typeof actions.reset).toBe('function');
    });
  });
});
