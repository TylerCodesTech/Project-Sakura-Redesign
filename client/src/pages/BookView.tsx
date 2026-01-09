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
  Type
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
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useParams } from "wouter";
import type { Page, Book } from "@shared/schema";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Placeholder from '@tiptap/extension-placeholder';

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
      }),
      Underline,
      TextStyle,
      FontFamily,
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
      await apiRequest("PATCH", `/api/pages/${activePage.id}`, { content });
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Page content updated successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}/pages`] });
      setIsEditing(false);
    }
  });

  const createPageMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/pages", {
        bookId: id,
        title,
        content: `<h1>${title}</h1><p>Start writing...</p>`,
        order: (pages.length).toString(),
        type: "page"
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
            <Link href="/documents">
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
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
                  onClick={() => setIsEditing(false)}
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
          <div className="flex items-center gap-1 bg-secondary/20 p-1 rounded-xl border border-border/40 mb-6 overflow-x-auto">
            <div className="flex items-center gap-1 px-1">
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
            <Select onValueChange={(value) => editor?.chain().focus().setFontFamily(value).run()}>
              <SelectTrigger className="w-[120px] h-8 rounded-lg border-transparent bg-transparent hover:bg-secondary/40 font-bold text-xs">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="monospace">Mono</SelectItem>
                <SelectItem value="Comic Sans MS, Comic Sans">Comic Sans</SelectItem>
                <SelectItem value="cursive">Cursive</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
            <Select onValueChange={(value) => editor?.chain().focus().setMark('textStyle', { fontSize: value }).run()}>
              <SelectTrigger className="w-[80px] h-8 rounded-lg border-transparent bg-transparent hover:bg-secondary/40 font-bold text-xs">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="12px">12px</SelectItem>
                <SelectItem value="14px">14px</SelectItem>
                <SelectItem value="16px">16px</SelectItem>
                <SelectItem value="18px">18px</SelectItem>
                <SelectItem value="20px">20px</SelectItem>
                <SelectItem value="24px">24px</SelectItem>
                <SelectItem value="30px">30px</SelectItem>
                <SelectItem value="36px">36px</SelectItem>
                <SelectItem value="48px">48px</SelectItem>
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
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
            </div>
            <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
            <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 rounded-xl">
                <div className="space-y-3">
                  <h4 className="font-bold text-xs">Wiki Link</h4>
                  <div className="flex gap-2">
                    <Input 
                      className="h-8 text-xs rounded-lg"
                      placeholder="Page title..."
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                    />
                    <Button size="icon" className="h-8 w-8 rounded-lg" onClick={insertWikiLink}>
                      <Plus className="w-3 h-3" />
                    </Button>
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
                      "prose prose-sakura max-w-none mt-12 text-foreground/80 leading-loose",
                      isEditing && "bg-white/50 dark:bg-card/50 p-6 rounded-2xl border border-border/50 shadow-inner"
                    )}>
                      <EditorContent editor={editor} />
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
