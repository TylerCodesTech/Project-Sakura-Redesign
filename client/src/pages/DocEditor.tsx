import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft,
  Save,
  Sparkles,
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
  ChevronDown,
  Wand2,
  Heading1,
  Heading2,
  Type,
  Link as LinkIcon,
  Plus,
  Send,
  MessageSquare,
  CheckCircle,
  Clock,
  Highlighter,
  Palette,
  CheckSquare,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useParams, useLocation } from "wouter";
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
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Page, Book, Comment, User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DocStatus({ status, reviewerId, saveStatus }: { status: string, reviewerId?: string | null, saveStatus: 'saved' | 'saving' | 'error' }) {
  const isLocked = status === "in_review";
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        {isLocked ? (
          <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3" />
            In Review
          </Badge>
        ) : status === "published" ? (
          <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Published
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] py-0 border-indigo-500/20 text-indigo-600 bg-indigo-500/5 uppercase font-black tracking-widest">Draft</Badge>
        )}
        <div className="flex items-center ml-1">
          {saveStatus === 'saving' && <Clock className="w-3 h-3 animate-spin text-muted-foreground" />}
          {saveStatus === 'saved' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
          {saveStatus === 'error' && <span className="text-[10px] text-destructive font-bold">Error saving</span>}
        </div>
      </div>
      {isLocked && reviewerId && (
        <span className="text-[10px] text-muted-foreground mt-0.5">Assigned Reviewer ID: {reviewerId}</span>
      )}
    </div>
  );
}

export default function DocEditor() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const { data: page, isLoading: isLoadingPage } = useQuery<Page>({
    queryKey: [`/api/pages/${id}`],
    enabled: !!id && id !== 'new',
    retry: false
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/pages/${id}/comments`],
    enabled: !!id && id !== 'new',
  });

  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: [`/api/books/${page?.bookId}/pages`],
    enabled: !!page?.bookId
  });

  const updatePageMutation = useMutation({
    mutationFn: async (content: string) => {
      setSaveStatus('saving');
      await apiRequest("PATCH", `/api/pages/${id}`, { content });
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${id}`] });
    },
    onError: () => {
      setSaveStatus('error');
    }
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/pages/${id}`, { status: "in_review" });
    },
    onSuccess: () => {
      toast({ title: "Review Started", description: "A random reviewer from your department has been assigned." });
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${id}`] });
    }
  });

  const approveAndPublishMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/pages/${id}`, { status: "published" });
      await apiRequest("POST", `/api/pages/${id}/comments`, { 
        content: "LGTM! Approved and Published.",
        userId: "current-user-id"
      });
    },
    onSuccess: () => {
      toast({ title: "Document Published", description: "The document is now live." });
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${id}/comments`] });
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/pages/${id}/comments`, { 
        content,
        userId: "current-user-id" // In a real app, this would be the logged in user
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${id}/comments`] });
    }
  });

  const isLocked = page?.status === "in_review";

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
        placeholder: isLocked ? 'Document is locked for review' : 'Start writing your WikiBook page...',
      }),
    ],
    content: page?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sakura max-w-none focus:outline-none min-h-[500px]',
      },
    },
  });

  // Auto-save logic
  useEffect(() => {
    if (!editor || isLocked || page?.status === "published") return;

    const timer = setTimeout(() => {
      const currentContent = editor.getHTML();
      if (currentContent !== page?.content) {
        updatePageMutation.mutate(currentContent);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [editor?.getHTML(), isLocked, page?.status]);

  useEffect(() => {
    if (page?.content && editor && !editor.isFocused) {
      editor.commands.setContent(page.content);
    }
    if (editor) {
      editor.setEditable(!isLocked);
    }
  }, [page, editor, isLocked]);

  const insertWikiLink = async () => {
    if (!linkTitle || !editor || isLocked) return;
    const existingPage = pages.find(p => p.title.toLowerCase() === linkTitle.toLowerCase());
    if (existingPage) {
      editor.chain().focus().extendMarkRange('link').setLink({ 
        href: `/documents/edit/${existingPage.id}`
      }).run();
    }
    setLinkTitle("");
    setIsLinkPopoverOpen(false);
  };

  if (isLoadingPage || !editor) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Badge variant="outline" className="animate-pulse">Loading Editor...</Badge>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Editor Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <Link href="/documents">
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">{page?.title || "New Page"}</h1>
              <DocStatus status={page?.status || "draft"} reviewerId={page?.reviewerId} saveStatus={saveStatus} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isLocked && (
              <Button 
                variant="outline" 
                size="icon"
                className={cn(
                  "rounded-xl border-border/50 transition-all",
                  isCommentsOpen ? "bg-primary/10 border-primary/20 text-primary" : ""
                )}
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              className={cn(
                "rounded-xl border-border/50 gap-2 font-bold transition-all",
                isAiPanelOpen ? "bg-primary/10 border-primary/20 text-primary" : ""
              )}
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </Button>
            {!isLocked && page?.status === "draft" && (
              <Button 
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20"
                onClick={() => submitForReviewMutation.mutate()}
                disabled={submitForReviewMutation.isPending}
              >
                <Send className="w-4 h-4" />
                {submitForReviewMutation.isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            )}
          </div>
        </div>

        {/* Toolbar - Hide or disable when locked */}
        <div className={cn(
          "flex items-center gap-1 bg-secondary/20 p-1.5 rounded-2xl border border-border/40 mb-6 backdrop-blur-sm overflow-x-auto scrollbar-hide flex-wrap",
          isLocked && "opacity-50 pointer-events-none"
        )}>
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 px-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
          
          {/* Font Family */}
          <Select onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}>
            <SelectTrigger className="w-[130px] h-8 rounded-lg border-transparent bg-transparent hover:bg-secondary/40 transition-all font-bold text-xs">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
              <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
              <SelectItem value="Comic Sans MS, Comic Sans, cursive">Comic Sans</SelectItem>
              <SelectItem value="Inter, sans-serif">Inter</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="Courier New, monospace">Courier New</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Font Size */}
          <Select onValueChange={(value) => editor.chain().focus().setMark('textStyle', { fontSize: value }).run()}>
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
            <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().toggleBold().run()}>
              <BoldIcon className="w-4 h-4" />
            </Button>
            <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().toggleItalic().run()}>
              <ItalicIcon className="w-4 h-4" />
            </Button>
            <Button variant={editor.isActive('underline') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().toggleUnderline().run()}>
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
                      onClick={() => editor.chain().focus().setColor(color).run()}
                    />
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs mt-2"
                  onClick={() => editor.chain().focus().unsetColor().run()}
                >
                  Remove Color
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Highlight Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={editor.isActive('highlight') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg">
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
                      onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                    />
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs mt-2"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                >
                  Remove Highlight
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
          
          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <Button variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button variant={editor.isActive('taskList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().toggleTaskList().run()}>
              <CheckSquare className="w-4 h-4" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
          
          {/* Text Alignment */}
          <div className="flex items-center gap-0.5">
            <Button variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
          
          {/* Link */}
          <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant={editor.isActive('link') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg">
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
                          editor.chain().focus().setLink({ href: linkTitle }).run();
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
                    {editor.isActive('link') && (
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="h-8 text-xs rounded-lg"
                        onClick={() => {
                          editor.chain().focus().unsetLink().run();
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

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Main Editor Surface */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 overflow-hidden backdrop-blur-sm relative">
              <ScrollArea className="h-full">
                <div className="max-w-3xl mx-auto py-16 px-8">
                  <EditorContent 
                    editor={editor} 
                    className={cn("wiki-editor-content", isLocked && "cursor-not-allowed")}
                  />
                </div>
              </ScrollArea>
              {isLocked && (
                <div className="absolute top-4 right-4 z-50">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 backdrop-blur-md">
                    Read-Only Mode
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Comment Sidebar */}
          {isCommentsOpen && (
            <div className="w-80 shrink-0 flex flex-col gap-4 animate-in slide-in-from-right duration-300">
              <Card className="flex-1 flex flex-col border border-border/50 shadow-2xl rounded-3xl overflow-hidden bg-background/50 backdrop-blur-xl">
                <div className="p-4 border-b border-border/50 bg-secondary/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Review Feedback</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => setIsCommentsOpen(false)}>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="p-4 border-b border-border/50 bg-amber-500/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] font-bold h-8 rounded-lg border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                      onClick={() => approveAndPublishMutation.mutate()}
                      disabled={approveAndPublishMutation.isPending}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {approveAndPublishMutation.isPending ? "Publishing..." : "Approve"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] font-bold h-8 rounded-lg border-rose-500/20 text-rose-600 hover:bg-rose-500/10"
                      onClick={() => createCommentMutation.mutate("Requested changes. See comments.")}
                    >
                      <Undo2 className="w-3 h-3 mr-1" />
                      Revisions
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                        <p className="text-xs text-muted-foreground">No feedback yet</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-secondary/20 p-3 rounded-2xl border border-border/40">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {comment.userId.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-bold">User {comment.userId.substring(0, 4)}</span>
                            <span className="text-[8px] text-muted-foreground ml-auto">
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border/50 bg-secondary/10">
                  <div className="relative group">
                    <textarea 
                      placeholder="Add specific feedback..." 
                      className="w-full bg-background border-border/50 rounded-2xl p-3 pt-4 text-xs min-h-[80px] focus:ring-1 focus:ring-primary/20 outline-none resize-none transition-all shadow-sm"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button 
                      size="icon" 
                      className="absolute right-2 bottom-2 rounded-xl h-8 w-8 bg-primary shadow-lg shadow-primary/20"
                      onClick={() => createCommentMutation.mutate(newComment)}
                      disabled={!newComment.trim() || createCommentMutation.isPending}
                    >
                      <Send className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* AI Assistant Sidebar */}
          {isAiPanelOpen && (
            <div className="w-80 shrink-0 flex flex-col gap-4 animate-in slide-in-from-right duration-300">
              <Card className="flex-1 flex flex-col border border-border/50 shadow-2xl rounded-3xl overflow-hidden bg-background/50 backdrop-blur-xl">
                <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">AI Writing Agent</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => setIsAiPanelOpen(false)}>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-3 rounded-2xl text-xs leading-relaxed border border-border/50">
                      Hello! I can help you generate content, fix grammar, or even build entire sections based on your data. What should we do next?
                    </div>
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border/50 bg-secondary/10">
                  <div className="relative group">
                    <textarea 
                      placeholder="Ask the agent to write..." 
                      className="w-full bg-background border-border/50 rounded-2xl p-3 pt-4 text-xs min-h-[100px] focus:ring-1 focus:ring-primary/20 outline-none resize-none transition-all shadow-sm"
                    />
                    <Button size="icon" className="absolute right-2 bottom-2 rounded-xl h-8 w-8 bg-primary shadow-lg shadow-primary/20">
                      <Sparkles className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
