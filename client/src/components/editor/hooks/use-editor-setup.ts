import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Placeholder from '@tiptap/extension-placeholder';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TiptapLink from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { FontSize } from '@/lib/tiptap-extensions';

interface UseEditorSetupOptions {
  content?: string;
  isLocked?: boolean;
  placeholder?: string;
}

export function useEditorSetup({
  content = '',
  isLocked = false,
  placeholder = 'Start writing your WikiBook page...'
}: UseEditorSetupOptions = {}) {
  const editor = useEditor({
    editable: !isLocked,
    extensions: [
      StarterKit.configure({
        underline: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: isLocked ? 'Document is locked for review' : placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sakura max-w-none focus:outline-none min-h-[500px]',
      },
    },
  });

  return editor;
}
