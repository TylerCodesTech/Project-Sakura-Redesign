import { useState, useEffect, useCallback } from "react";

/**
 * Hook for managing local settings state with change detection
 * Consolidates duplicate state management from 7 settings sections
 *
 * @example
 * const { localSettings, updateLocal, updateMultiple, reset, hasChanges } =
 *   useLocalSettings(settings);
 *
 * updateLocal("logoUrl", url);
 * updateMultiple({ siteName: "New Name", description: "New description" });
 */
export function useLocalSettings<T extends Record<string, any>>(
  initialSettings: T
) {
  const [localSettings, setLocalSettings] = useState<T>(initialSettings);

  // Sync with external changes to initialSettings
  useEffect(() => {
    setLocalSettings(initialSettings);
  }, [initialSettings]);

  /**
   * Update a single setting key
   */
  const updateLocal = useCallback((key: keyof T, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Update multiple settings at once
   */
  const updateMultiple = useCallback((updates: Partial<T>) => {
    setLocalSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset local settings to initial values
   */
  const reset = useCallback(() => {
    setLocalSettings(initialSettings);
  }, [initialSettings]);

  /**
   * Check if local settings differ from initial settings
   */
  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(initialSettings);

  return {
    localSettings,
    setLocalSettings,
    updateLocal,
    updateMultiple,
    reset,
    hasChanges,
  };
}
