import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Editor } from '@tiptap/react';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

interface UseAutosaveOptions {
  editor: Editor | null;
  pageId: string | undefined;
  isLocked: boolean;
  initialContent?: string;
  autoSaveDelay?: number;
  versionDelay?: number;
}

export function useAutosave({
  editor,
  pageId,
  isLocked,
  initialContent = '',
  autoSaveDelay = 2000,
  versionDelay = 30000,
}: UseAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedContent, setLastSavedContent] = useState<string>(initialContent);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVersionContentRef = useRef<string>(initialContent);

  // Initialize last saved content when initial content changes
  useEffect(() => {
    if (initialContent) {
      setLastSavedContent(initialContent);
      lastVersionContentRef.current = initialContent;
    }
  }, [initialContent]);

  const updatePageMutation = useMutation({
    mutationFn: async (content: string) => {
      setSaveStatus('saving');
      await apiRequest('PATCH', `/api/pages/${pageId}`, { content });
      return content;
    },
    onSuccess: (savedContent) => {
      setSaveStatus('saved');
      setLastSavedContent(savedContent);
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${pageId}`] });
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({ content, changeDescription }: { content: string; changeDescription: string }) => {
      await apiRequest('POST', `/api/pages/${pageId}/versions`, {
        content,
        changeDescription,
      });
      return content;
    },
    onSuccess: (content) => {
      lastVersionContentRef.current = content;
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${pageId}/versions`] });
    },
  });

  // Handle auto-save with proper debouncing
  const handleEditorUpdate = useCallback(() => {
    if (!editor || isLocked || !pageId) return;

    const currentContent = editor.getHTML();

    // Mark as unsaved if content differs
    if (currentContent !== lastSavedContent) {
      setSaveStatus('unsaved');
    }

    // Clear existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new auto-save timer
    autoSaveTimerRef.current = setTimeout(() => {
      if (currentContent !== lastSavedContent) {
        updatePageMutation.mutate(currentContent);
      }
    }, autoSaveDelay);

    // Clear existing version timer
    if (versionTimerRef.current) {
      clearTimeout(versionTimerRef.current);
    }

    // Create version after delay of no changes (if content differs from last version)
    versionTimerRef.current = setTimeout(() => {
      if (currentContent !== lastVersionContentRef.current && currentContent.length > 10) {
        createVersionMutation.mutate({
          content: currentContent,
          changeDescription: 'Auto-saved version',
        });
      }
    }, versionDelay);
  }, [editor, isLocked, pageId, lastSavedContent, updatePageMutation, createVersionMutation, autoSaveDelay, versionDelay]);

  // Subscribe to editor updates
  useEffect(() => {
    if (!editor) return;

    editor.on('update', handleEditorUpdate);

    return () => {
      editor.off('update', handleEditorUpdate);
      // Cleanup timers
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (versionTimerRef.current) clearTimeout(versionTimerRef.current);
    };
  }, [editor, handleEditorUpdate]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (!editor || isLocked || !pageId) return;
    const currentContent = editor.getHTML();
    if (currentContent !== lastSavedContent) {
      updatePageMutation.mutate(currentContent);
    }
  }, [editor, isLocked, pageId, lastSavedContent, updatePageMutation]);

  return {
    saveStatus,
    saveNow,
    lastSavedContent,
  };
}
