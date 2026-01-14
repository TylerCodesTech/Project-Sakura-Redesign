import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalSettings } from '../use-local-settings';

interface TestSettings {
  siteName: string;
  description: string;
  enabled: boolean;
}

describe('useLocalSettings', () => {
  const initialSettings: TestSettings = {
    siteName: 'Test Site',
    description: 'A test description',
    enabled: true,
  };

  it('should initialize with provided settings', () => {
    const { result } = renderHook(() => useLocalSettings(initialSettings));

    expect(result.current.localSettings).toEqual(initialSettings);
    expect(result.current.hasChanges).toBe(false);
  });

  it('should update a single setting', () => {
    const { result } = renderHook(() => useLocalSettings(initialSettings));

    act(() => {
      result.current.updateLocal('siteName', 'New Site Name');
    });

    expect(result.current.localSettings.siteName).toBe('New Site Name');
    expect(result.current.localSettings.description).toBe('A test description');
    expect(result.current.hasChanges).toBe(true);
  });

  it('should update multiple settings at once', () => {
    const { result } = renderHook(() => useLocalSettings(initialSettings));

    act(() => {
      result.current.updateMultiple({
        siteName: 'Updated Name',
        description: 'Updated Description',
      });
    });

    expect(result.current.localSettings.siteName).toBe('Updated Name');
    expect(result.current.localSettings.description).toBe('Updated Description');
    expect(result.current.localSettings.enabled).toBe(true);
    expect(result.current.hasChanges).toBe(true);
  });

  it('should detect changes correctly', () => {
    const { result } = renderHook(() => useLocalSettings(initialSettings));

    expect(result.current.hasChanges).toBe(false);

    act(() => {
      result.current.updateLocal('siteName', 'New Name');
    });

    expect(result.current.hasChanges).toBe(true);

    act(() => {
      result.current.updateLocal('siteName', 'Test Site');
    });

    expect(result.current.hasChanges).toBe(false);
  });

  it('should reset to initial settings', () => {
    const { result } = renderHook(() => useLocalSettings(initialSettings));

    act(() => {
      result.current.updateMultiple({
        siteName: 'Modified',
        description: 'Modified',
      });
    });

    expect(result.current.hasChanges).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.localSettings).toEqual(initialSettings);
    expect(result.current.hasChanges).toBe(false);
  });

  it('should sync with external settings changes', () => {
    const { result, rerender } = renderHook(
      ({ settings }) => useLocalSettings(settings),
      {
        initialProps: { settings: initialSettings },
      }
    );

    const newSettings: TestSettings = {
      siteName: 'External Update',
      description: 'Updated externally',
      enabled: false,
    };

    rerender({ settings: newSettings });

    expect(result.current.localSettings).toEqual(newSettings);
    expect(result.current.hasChanges).toBe(false);
  });

  it('should allow direct state setting', () => {
    const { result } = renderHook(() => useLocalSettings(initialSettings));

    const newState: TestSettings = {
      siteName: 'Direct Set',
      description: 'Set directly',
      enabled: false,
    };

    act(() => {
      result.current.setLocalSettings(newState);
    });

    expect(result.current.localSettings).toEqual(newState);
    expect(result.current.hasChanges).toBe(true);
  });
});
