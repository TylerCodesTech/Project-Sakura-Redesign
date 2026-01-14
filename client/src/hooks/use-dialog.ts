import { useState, useCallback } from "react";

/**
 * Hook for managing dialog/modal state with optional data
 * Replaces 138+ instances of manual dialog state management
 *
 * @example
 * const createDialog = useDialog();
 * createDialog.open();
 * createDialog.close();
 *
 * @example
 * const editDialog = useDialog<User>();
 * editDialog.open(user);
 * const userData = editDialog.data;
 */
export function useDialog<T = undefined>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((initialData?: T) => {
    if (initialData !== undefined) {
      setData(initialData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear data after a short delay to allow for exit animations
    setTimeout(() => setData(undefined), 200);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const updateData = useCallback((newData: T | undefined) => {
    setData(newData);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData: updateData,
  };
}
