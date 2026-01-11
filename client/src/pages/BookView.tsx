import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search as SearchIcon, 
  ChevronRight, 
  BookOpen, 
  Share2,
  ArrowLeft,
  FileText,
  Sparkles,
  Plus,
  Save,
  Undo2,
  Redo2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Type,
  Highlighter,
  Palette,
  CheckSquare,
  ExternalLink,
  Clock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Link as RouterLink, useParams } from "wouter";
import type { Page, Book } from "@shared/schema";
import { useEditor, EditorContent } from '@tiptap/react';
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
import { LinkPreview } from '@/components/editor/LinkPreview';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function SaveStatusBadge({ saveStatus }: { saveStatus: 'saved' | 'saving' | 'error' | 'unsaved' }) {
  return (
    <div className="flex items-center gap-1.5">
      {saveStatus === 'saving' && (
        <Badge variant="outline" className="text-[10px] py-0.5 px-2 gap-1 bg-blue-500/5 border-blue-500/20 text-blue-600 animate-pulse">
          <Clock className="w-3 h-3 animate-spin" />
          Saving...
        </Badge>
      )}
      {saveStatus === 'saved' && (
        <Badge variant="outline" className="text-[10px] py-0.5 px-2 gap-1 bg-emerald-500/5 border-emerald-500/20 text-emerald-600">
          <CheckCircle className="w-3 h-3" />
          Saved
        </Badge>
      )}
      {saveStatus === 'unsaved' && (
        <Badge variant="outline" className="text-[10px] py-0.5 px-2 gap-1 bg-amber-500/5 border-amber-500/20 text-amber-600">
          <Clock className="w-3 h-3" />
          Unsaved changes
        </Badge>
      )}
      {saveStatus === 'error' && (
        <Badge variant="outline" className="text-[10px] py-0.5 px-2 gap-1 bg-red-500/5 border-red-500/20 text-red-600">
          Error saving
        </Badge>
      )}
    </div>
  );
}

export default function BookView() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeSlug, setActiveSlug] = useState("");
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [renamePageTitle, setRenamePageTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('saved');
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVersionContentRef = useRef<string>('');

  const { data: book } = useQuery<Book>({
    queryKey: [`/api/books/${id}`],
  });

  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: [`/api/books/${id}/pages`],
  });

  const activePage = pages.find(p => p.id === activeSlug) || pages[0];

  const editor = useEditor({
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
        placeholder: 'Start writing...',
      }),
    ],
    content: activePage?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sakura max-w-none focus:outline-none',
        style: 'font-size: 16px;',
      },
    },
    editable: isEditing,
  });

  useEffect(() => {
    if (activePage?.content && editor && !editor.isFocused) {
      editor.commands.setContent(activePage.content);
    }
  }, [activePage, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  const updatePageMutation = useMutation({
    mutationFn: async (content: string) => {
      setSaveStatus('saving');
      await apiRequest("PATCH", `/api/pages/${activePage?.id}`, { content });
      return content;
    },
    onSuccess: (savedContent) => {
      setSaveStatus('saved');
      setLastSavedContent(savedContent);
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}/pages`] });
    },
    onError: () => {
      setSaveStatus('error');
    }
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({ content, changeDescription }: { content: string, changeDescription: string }) => {
      if (!activePage) return content;
      await apiRequest("POST", `/api/pages/${activePage.id}/versions`, { 
        title: activePage.title,
        content,
        status: activePage.status,
        changeDescription,
        createdBy: "current-user-id"
      });
      return content;
    },
    onSuccess: (content) => {
      lastVersionContentRef.current = content;
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${activePage?.id}/versions`] });
    }
  });

  // Initialize last saved content when page loads
  useEffect(() => {
    if (activePage?.content) {
      setLastSavedContent(activePage.content);
      lastVersionContentRef.current = activePage.content;
      setSaveStatus('saved');
    }
  }, [activePage?.id]);

  // Handle auto-save with proper debouncing via TipTap onUpdate
  const handleEditorUpdate = useCallback(() => {
    if (!editor || !isEditing || !activePage) return;
    
    const currentContent = editor.getHTML();
    
    // Mark as unsaved if content differs
    if (currentContent !== lastSavedContent) {
      setSaveStatus('unsaved');
    }
    
    // Clear existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new auto-save timer (2 second debounce)
    autoSaveTimerRef.current = setTimeout(() => {
      if (currentContent !== lastSavedContent) {
        updatePageMutation.mutate(currentContent);
      }
    }, 2000);
    
    // Clear existing version timer
    if (versionTimerRef.current) {
      clearTimeout(versionTimerRef.current);
    }
    
    // Create version after 30 seconds of no changes (if content differs from last version)
    versionTimerRef.current = setTimeout(() => {
      if (currentContent !== lastVersionContentRef.current && currentContent.length > 10) {
        createVersionMutation.mutate({ 
          content: currentContent, 
          changeDescription: "Auto-saved version" 
        });
      }
    }, 30000);
  }, [editor, isEditing, activePage, lastSavedContent, updatePageMutation, createVersionMutation]);

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

  const createPageMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/pages", {
        bookId: id,
        title,
        content: `<h1>${title}</h1><p>Start writing...</p>`,
        order: (pages.length).toString(),
        type: "page",
        authorId: "current-user-id"
      });
      return await res.json() as Page;
    },
    onSuccess: (newPage) => {
      toast({ title: "Page Created", description: `Created new page: ${newPage.title}` });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}/pages`] });
      setActiveSlug(newPage.id);
      setIsNewPageModalOpen(false);
      setNewPageTitle("");
    }
  });

  const handleCreatePage = () => {
    if (!newPageTitle) return;
    createPageMutation.mutate(newPageTitle);
  };

  const renamePageMutation = useMutation({
    mutationFn: async (title: string) => {
      await apiRequest("PATCH", `/api/pages/${activePage.id}`, { title });
    },
    onSuccess: () => {
      toast({ title: "Page Renamed", description: "The page has been renamed successfully." });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}/pages`] });
      setIsRenameModalOpen(false);
    }
  });

  const handleRenamePage = () => {
    if (!renamePageTitle) return;
    renamePageMutation.mutate(renamePageTitle);
  };

  const insertWikiLink = async () => {
    if (!linkTitle || !editor) return;
    const existingPage = pages.find(p => p.title.toLowerCase() === linkTitle.toLowerCase());
    if (existingPage) {
      editor.chain().focus().extendMarkRange('link').setLink({ 
        href: `/api/books/${id}/pages/${existingPage.id}` 
      }).run();
    } else {
      const newPage = await createPageMutation.mutateAsync(linkTitle);
      editor.chain().focus().extendMarkRange('link').setLink({ 
        href: `/api/books/${id}/pages/${newPage.id}`
      }).run();
    }
    setLinkTitle("");
    setIsLinkPopoverOpen(false);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Book Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <RouterLink href="/documents">
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </RouterLink>
            <div className="h-6 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{book?.title || "Product Handbook"}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/20 text-emerald-600 bg-emerald-500/5 uppercase font-black">Book</Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">• v1.0.0</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && <SaveStatusBadge saveStatus={saveStatus} />}
            {!isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-border/50 gap-2 font-bold"
                  onClick={() => setIsNewPageModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  New Page
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-border/50 gap-2 font-bold"
                  onClick={() => setIsEditing(true)}
                >
                  <FileText className="w-4 h-4" />
                  Edit Page
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl gap-2 font-bold"
                  onClick={() => {
                    setIsEditing(false);
                    setSaveStatus('saved');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                  onClick={() => updatePageMutation.mutate(editor?.getHTML() || '')}
                  disabled={updatePageMutation.isPending}
                >
                  <Save className="w-4 h-4" />
                  {updatePageMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
            <Button size="sm" className="rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold gap-2 no-default-hover-elevate">
              <Sparkles className="w-4 h-4" />
              Ask AI
            </Button>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-1 bg-secondary/20 p-1.5 rounded-xl border border-border/40 mb-6 overflow-x-auto flex-wrap">
            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 px-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
            
            {/* Font Family */}
            <Select onValueChange={(value) => editor?.chain().focus().setFontFamily(value).run()}>
              <SelectTrigger className="w-[130px] h-8 rounded-lg border-transparent bg-transparent hover:bg-secondary/40 font-bold text-xs">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                <SelectItem value="Comic Sans MS, Comic Sans, cursive">Comic Sans</SelectItem>
                <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                <SelectItem value="Georgia, serif">Georgia</SelectItem>
                <SelectItem value="Courier New, monospace">Courier New</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Font Size (Word-style) */}
            <Select onValueChange={(value) => editor?.chain().focus().setFontSize(value).run()}>
              <SelectTrigger className="w-[70px] h-8 rounded-lg border-transparent bg-transparent hover:bg-secondary/40 font-bold text-xs">
                <SelectValue placeholder="11" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="8pt">8</SelectItem>
                <SelectItem value="9pt">9</SelectItem>
                <SelectItem value="10pt">10</SelectItem>
                <SelectItem value="11pt">11</SelectItem>
                <SelectItem value="12pt">12</SelectItem>
                <SelectItem value="14pt">14</SelectItem>
                <SelectItem value="16pt">16</SelectItem>
                <SelectItem value="18pt">18</SelectItem>
                <SelectItem value="20pt">20</SelectItem>
                <SelectItem value="24pt">24</SelectItem>
                <SelectItem value="28pt">28</SelectItem>
                <SelectItem value="36pt">36</SelectItem>
                <SelectItem value="48pt">48</SelectItem>
                <SelectItem value="72pt">72</SelectItem>
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
            
            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5">
              <Button 
                variant={editor?.isActive('bold') ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <BoldIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant={editor?.isActive('italic') ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <ItalicIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant={editor?.isActive('underline') ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
            
            {/* Text Color */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <Palette className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3 rounded-xl">
                <div className="space-y-2">
                  <h4 className="font-bold text-xs">Text Color</h4>
                  <div className="grid grid-cols-6 gap-1">
                    {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed', '#db2777'].map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-md border border-border/50 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => editor?.chain().focus().setColor(color).run()}
                      />
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs mt-2"
                    onClick={() => editor?.chain().focus().unsetColor().run()}
                  >
                    Remove Color
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Highlight Color */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={editor?.isActive('highlight') ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8 rounded-lg"
                >
                  <Highlighter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3 rounded-xl">
                <div className="space-y-2">
                  <h4 className="font-bold text-xs">Highlight Color</h4>
                  <div className="grid grid-cols-6 gap-1">
                    {['#fef08a', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fbcfe8', '#fed7aa', '#fecaca', '#d9f99d', '#a5f3fc', '#c4b5fd', '#f9a8d4', '#fde68a'].map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-md border border-border/50 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => editor?.chain().focus().toggleHighlight({ color }).run()}
                      />
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs mt-2"
                    onClick={() => editor?.chain().focus().unsetHighlight().run()}
                  >
                    Remove Highlight
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
            
            {/* Lists */}
            <div className="flex items-center gap-0.5">
              <Button 
                variant={editor?.isActive('bulletList') ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant={editor?.isActive('orderedList') ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button 
                variant={editor?.isActive('taskList') ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
              >
                <CheckSquare className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
            
            {/* Text Alignment */}
            <div className="flex items-center gap-0.5">
              <Button 
                variant={editor?.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant={editor?.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button 
                variant={editor?.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
            
            {/* Link */}
            <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant={editor?.isActive('link') ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8 rounded-lg"
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 rounded-xl">
                <div className="space-y-3">
                  <h4 className="font-bold text-xs">Insert Link</h4>
                  <div className="space-y-2">
                    <Input 
                      className="h-8 text-xs rounded-lg"
                      placeholder="Enter URL or page title..."
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 h-8 text-xs rounded-lg gap-1"
                        onClick={() => {
                          if (linkTitle.startsWith('http')) {
                            editor?.chain().focus().setLink({ href: linkTitle }).run();
                          } else {
                            insertWikiLink();
                          }
                          setLinkTitle('');
                          setIsLinkPopoverOpen(false);
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Add Link
                      </Button>
                      {editor?.isActive('link') && (
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="h-8 text-xs rounded-lg"
                          onClick={() => {
                            editor?.chain().focus().unsetLink().run();
                            setIsLinkPopoverOpen(false);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex gap-12 h-full overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 shrink-0 flex flex-col gap-8">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search handbook..." 
                className="h-10 pl-9 bg-secondary/20 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
              />
            </div>

            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-8 pb-12">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-3">Contents</h4>
                  <div className="space-y-1">
                    {pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          setActiveSlug(page.id);
                          setIsEditing(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all group text-left",
                          (activeSlug === page.id || (!activeSlug && page.id === pages[0]?.id))
                            ? "bg-primary/10 text-primary shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                        )}
                      >
                        <span className="truncate">{page.title}</span>
                        {(activeSlug === page.id || (!activeSlug && page.id === pages[0]?.id)) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(219,39,119,0.5)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex gap-12 h-full overflow-hidden">
            <ScrollArea className="flex-1 h-full">
              <div className="max-w-3xl pb-24">
                {activePage ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      {!isEditing ? (
                        <>
                          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight">
                            {book?.title} <ChevronRight className="w-4 h-4" />
                          </div>
                          <h2 className="text-4xl font-display font-black tracking-tight text-foreground capitalize">
                            {activePage.title}
                          </h2>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight">
                            {book?.title} <ChevronRight className="w-4 h-4" /> Editing
                          </div>
                          <h2 
                            className="text-4xl font-display font-black tracking-tight text-foreground capitalize cursor-pointer hover:text-primary transition-colors inline-block group"
                            onClick={() => {
                              setRenamePageTitle(activePage.title);
                              setIsRenameModalOpen(true);
                            }}
                          >
                            {activePage.title}
                            <Type className="w-4 h-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h2>
                        </div>
                      )}
                    </div>

                    <div className={cn(
                      "prose prose-sakura max-w-none mt-12 text-foreground/80 leading-loose relative",
                      isEditing && "bg-white/50 dark:bg-card/50 p-6 rounded-2xl border border-border/50 shadow-inner"
                    )}>
                      <EditorContent editor={editor} />
                      {editor && <LinkPreview editor={editor} />}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-xl font-bold text-muted-foreground">No pages found</h3>
                    <p className="text-sm text-muted-foreground/60">Start by creating a new page.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <Dialog open={isNewPageModalOpen} onOpenChange={setIsNewPageModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px] border-border/50 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Create New Page</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Input 
              placeholder="Page Title" 
              value={newPageTitle} 
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreatePage();
              }}
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCreatePage}
              disabled={createPageMutation.isPending}
            >
              {createPageMutation.isPending ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px] border-border/50 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4">
              <Type className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Rename Page</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Input 
              placeholder="Page Title" 
              value={renamePageTitle} 
              onChange={(e) => setRenamePageTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenamePage();
              }}
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={handleRenamePage}
              disabled={renamePageMutation.isPending}
            >
              {renamePageMutation.isPending ? "Renaming..." : "Rename Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
