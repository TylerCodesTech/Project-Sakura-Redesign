import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialog } from '../use-dialog';

describe('useDialog', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useDialog());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should open dialog without data', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should open dialog with data', () => {
    const { result } = renderHook(() => useDialog<{ name: string }>());

    act(() => {
      result.current.open({ name: 'John Doe' });
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toEqual({ name: 'John Doe' });
  });

  it('should close dialog and clear data after delay', async () => {
    const { result } = renderHook(() => useDialog<string>());

    act(() => {
      result.current.open('test data');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('test data');

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);

    // Wait for data to be cleared (200ms delay)
    await new Promise(resolve => setTimeout(resolve, 250));

    expect(result.current.data).toBeUndefined();
  });

  it('should toggle dialog state', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should update data independently', () => {
    const { result } = renderHook(() => useDialog<number>());

    act(() => {
      result.current.setData(42);
    });

    expect(result.current.data).toBe(42);
    expect(result.current.isOpen).toBe(false);
  });

  it('should handle multiple open/close cycles', () => {
    const { result } = renderHook(() => useDialog<string>());

    // First cycle
    act(() => {
      result.current.open('first');
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('first');

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);

    // Second cycle
    act(() => {
      result.current.open('second');
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('second');
  });
});
