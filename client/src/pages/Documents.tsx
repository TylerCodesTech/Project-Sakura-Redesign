import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  FileText, 
  BookOpen, 
  MoreVertical, 
  Clock, 
  ChevronRight,
  Sparkles,
  Folder,
  LayoutGrid,
  List,
  Filter,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import type { Book, Page } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState, Fragment, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DetailsSidebar } from "@/components/documents/DetailsSidebar";

export default function Documents() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: books = [], isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    enabled: currentFolderId === null && !searchQuery,
  });

  const { data: allPages = [], isLoading: isLoadingPages } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  const filteredPages = allPages.filter(p => {
    const matchesSearch = searchQuery ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesFolder = searchQuery ? true : p.parentId === currentFolderId;
    return matchesSearch && matchesFolder && !p.bookId;
  });

  const standalonePages = filteredPages;
  const currentFolder = allPages.find(p => p.id === currentFolderId);

  const breadcrumbs = [];
  let tempId = currentFolderId;
  while (tempId) {
    const folder = allPages.find(p => p.id === tempId);
    if (folder) {
      breadcrumbs.unshift(folder);
      tempId = folder.parentId;
    } else {
      tempId = null;
    }
  }

  const createBookMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/books", {
        title,
        description: "A collaborative knowledge base",
        authorId: "1" 
      });
      if (!res.ok) throw new Error("Failed to create book");
      const book = await res.json() as Book;
      
      const pageRes = await apiRequest("POST", "/api/pages", {
        bookId: book.id,
        title: "Introduction",
        content: "<h1>Introduction</h1><p>Welcome to your new WikiBook!</p>",
        order: "0",
        type: "page",
        authorId: "1", // Added missing field
        status: "published" // Start as published
      });
      if (!pageRes.ok) throw new Error("Failed to create intro page");
      
      return book;
    },
    onSuccess: (book) => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "WikiBook Created", description: "Your new book is ready." });
      setLocation(`/documents/book/${book.id}`);
      setIsBookModalOpen(false);
      setNewName("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Creation Failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const createPageMutation = useMutation({
    mutationFn: async ({ title, type }: { title: string, type: string }) => {
      const res = await apiRequest("POST", "/api/pages", {
        title,
        content: type === 'folder' ? "" : `<h1>${title}</h1><p>Start writing...</p>`,
        order: "0",
        type,
        bookId: null,
        parentId: currentFolderId,
        authorId: "1", // Hardcoded for MVP
        status: "draft"
      });
      return await res.json() as Page;
    },
    onSuccess: (page) => {
      toast({ title: `${page.type === 'folder' ? 'Folder' : 'File'} Created`, description: `Created successfully.` });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      if (page.type === 'page') {
        setLocation(`/documents/edit/${page.id}`);
      }
      setIsPageModalOpen(false);
      setIsFolderModalOpen(false);
      setNewName("");
    }
  });

  const handleCreateBook = () => {
    if (!newName) return;
    createBookMutation.mutate(newName);
  };

  const handleCreateStandalone = (type: 'page' | 'folder') => {
    if (!newName) return;
    createPageMutation.mutate({ title: newName, type });
  };

  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  const moveItemMutation = useMutation({
    mutationFn: async ({ id, parentId }: { id: string, parentId: string | null }) => {
      const res = await apiRequest("PATCH", `/api/pages/${id}`, { parentId });
      return await res.json() as Page;
    },
    onSuccess: () => {
      toast({ title: "Item Moved", description: "Successfully moved the item." });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      setMovingItemId(null);
    }
  });

  const handleMoveItem = (id: string, parentId: string | null) => {
    if (id === parentId) return;
    moveItemMutation.mutate({ id, parentId });
  };

  const onDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const onDragOver = (e: React.DragEvent, id: string | null) => {
    e.preventDefault();
    setDropTargetId(id);
  };

  const onDrop = (e: React.DragEvent, parentId: string | null) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== parentId) {
      handleMoveItem(draggedItemId, parentId);
    }
    setDraggedItemId(null);
    setDropTargetId(null);
  };

  const onDragEnd = () => {
    setDraggedItemId(null);
    setDropTargetId(null);
  };

  const allItems = [
    ...books.map(b => ({ ...b, itemType: 'book' as const })),
    ...standalonePages.map(p => ({ ...p, itemType: p.type as 'page' | 'folder' }))
  ];

  const folders = allPages.filter(p => p.type === 'folder');

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
            <button 
              onClick={() => { setCurrentFolderId(null); setSearchQuery(""); }} 
              onDragOver={(e) => onDragOver(e, null)}
              onDrop={(e) => onDrop(e, null)}
              className={cn(
                "hover:text-primary transition-all cursor-pointer px-2 py-1 rounded-md",
                dropTargetId === null && draggedItemId && "bg-primary/10 text-primary ring-1 ring-primary/20 scale-105"
              )}
            >
              Documents
            </button>
            {breadcrumbs.map((crumb) => (
              <Fragment key={crumb.id}>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                <button 
                  onClick={() => setCurrentFolderId(crumb.id)}
                  onDragOver={(e) => onDragOver(e, crumb.id)}
                  onDrop={(e) => onDrop(e, crumb.id)}
                  className={cn(
                    "hover:text-primary transition-all cursor-pointer px-2 py-1 rounded-md",
                    dropTargetId === crumb.id && draggedItemId && "bg-primary/10 text-primary ring-1 ring-primary/20 scale-105"
                  )}
                >
                  {crumb.title}
                </button>
              </Fragment>
            ))}
          </div>
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
              {currentFolder ? currentFolder.title : "Documents"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentFolder ? `Contents of ${currentFolder.title}` : "Manage files, folders, and structured books."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search documents..." 
                className="pl-9 w-64 rounded-xl border-border/50 bg-secondary/10 focus:bg-background h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {currentFolderId && (
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl h-11 px-4 font-bold border-border/50 hover:bg-secondary/50"
                onClick={() => {
                  const parent = allPages.find(p => p.id === currentFolderId)?.parentId;
                  setCurrentFolderId(parent || null);
                }}
              >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                Go Back
              </Button>
            )}
            <div className="flex items-center bg-secondary/30 p-1 rounded-xl border border-border/50">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-lg", view === 'grid' && "bg-background shadow-sm")}
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-lg", view === 'list' && "bg-background shadow-sm")}
                onClick={() => setView('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-border/50 shadow-2xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-3 py-2">Content Types</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsBookModalOpen(true)} className="rounded-xl py-3 cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 mr-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Wiki Book</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Structured collections</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPageModalOpen(true)} className="rounded-xl py-3 cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 mr-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Single File</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Draft a document</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={() => setIsFolderModalOpen(true)} className="rounded-xl py-3 cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 mr-3 group-hover:scale-110 transition-transform">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Folder</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Organize your space</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Modals */}
        <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[24px] border-border/50 shadow-2xl">
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Create Wiki Book</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <Input placeholder="Book Title" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={handleCreateBook}>Initialize Book</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPageModalOpen} onOpenChange={setIsPageModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[24px] border-border/50 shadow-2xl">
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Create Single File</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <Input placeholder="File Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={() => handleCreateStandalone('page')}>Create File</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[24px] border-border/50 shadow-2xl">
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-4">
                <Folder className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Create Folder</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <Input placeholder="Folder Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={() => handleCreateStandalone('folder')}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!movingItemId} onOpenChange={(open) => !open && setMovingItemId(null)}>
          <DialogContent className="sm:max-w-[425px] rounded-[24px] border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Move Item</DialogTitle>
              <DialogDescription>Select a destination folder</DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-2 max-h-[300px] overflow-y-auto">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl font-bold h-12"
                onClick={() => movingItemId && handleMoveItem(movingItemId, null)}
              >
                <Folder className="w-4 h-4 mr-2 text-muted-foreground" />
                Root Directory
              </Button>
              {folders
                .filter(f => f.id !== movingItemId)
                .map(folder => (
                  <Button
                    key={folder.id}
                    variant="ghost"
                    className="w-full justify-start rounded-xl font-bold h-12"
                    onClick={() => movingItemId && handleMoveItem(movingItemId, folder.id)}
                  >
                    <Folder className="w-4 h-4 mr-2 text-blue-500" />
                    {folder.title}
                  </Button>
                ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Grid/List */}
        <div 
          className={cn(
            "grid gap-6 min-h-[400px] p-4 rounded-3xl transition-colors",
            dropTargetId === null && draggedItemId && "bg-primary/5 border-2 border-dashed border-primary/20",
            "grid",
            view === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
          onDragOver={(e) => onDragOver(e, null)}
          onDrop={(e) => onDrop(e, null)}
        >
          {(isLoadingBooks || isLoadingPages) ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-3xl border-border/50 animate-pulse bg-secondary/20 h-48" />
            ))
          ) : (standalonePages.length > 0 || books.length > 0) ? (
            [...books.map(b => ({ ...b, itemType: 'book' as const })), 
             ...standalonePages.map(p => ({ ...p, itemType: p.type as 'page' | 'folder' }))]
            .map((item) => (
              <DocCard 
                key={`${item.itemType}-${item.id}`} 
                item={item} 
                view={view} 
                onFolderClick={setCurrentFolderId} 
                onMoveClick={item.itemType !== 'book' ? setMovingItemId : undefined}
                onSelect={setSelectedItem}
                isSelected={selectedItem?.id === item.id}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
                isDragged={draggedItemId === item.id}
                isDropTarget={dropTargetId === item.id}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <h3 className="text-xl font-bold">No documents yet</h3>
            </div>
          )}
        </div>
      </div>

      <DetailsSidebar 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
      
      {selectedItem && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setSelectedItem(null)}
        />
      )}
    </Layout>
  );
}

function DocCard({ 
  item, 
  view, 
  onFolderClick, 
  onMoveClick,
  onSelect,
  isSelected,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragged,
  isDropTarget
}: { 
  item: any, 
  view: 'grid' | 'list', 
  onFolderClick?: (id: string) => void, 
  onMoveClick?: (id: string) => void,
  onSelect?: (item: any) => void,
  isSelected?: boolean,
  onDragStart: (id: string) => void,
  onDragOver: (e: React.DragEvent, id: string | null) => void,
  onDrop: (e: React.DragEvent, parentId: string | null) => void,
  onDragEnd: () => void,
  isDragged: boolean,
  isDropTarget: boolean
}) {
  const [, navigate] = useLocation();
  const isBook = item.itemType === 'book';
  const isFolder = item.itemType === 'folder';
  const Icon = isBook ? BookOpen : isFolder ? Folder : FileText;
  const colorClass = isBook ? 'text-emerald-500 bg-emerald-500/10' : 
                     isFolder ? 'text-blue-500 bg-blue-500/10' : 
                     'text-indigo-500 bg-indigo-500/10';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFolder && onFolderClick) {
      onFolderClick(item.id);
    } else if (isBook) {
      navigate(`/documents/book/${item.id}`);
    } else {
      navigate(`/documents/edit/${item.id}`);
    }
  };

  const href = isBook ? `/documents/book/${item.id}` : 
               isFolder ? `#` : `/documents/edit/${item.id}`;

  const actionButtons = (
    <div className="flex gap-2">
      {onMoveClick && (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onMoveClick(item.id); }} className="h-8 rounded-lg text-muted-foreground font-bold hover:bg-secondary">
          Move
        </Button>
      )}
      {isFolder ? (
        <Button variant="ghost" size="sm" onClick={handleClick} className="h-8 rounded-lg text-primary font-bold hover:bg-primary/10">
          Open
        </Button>
      ) : (
        <Link href={href}>
          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-primary font-bold hover:bg-primary/10">
            Open
          </Button>
        </Link>
      )}
    </div>
  );

  const containerClasses = cn(
    "group border transition-all overflow-hidden cursor-pointer",
    view === 'list' ? "rounded-2xl" : "rounded-3xl h-full",
    isDragged && "opacity-40 grayscale blur-[1px]",
    isFolder && isDropTarget && "ring-2 ring-primary border-primary bg-primary/5 scale-[1.02] shadow-xl",
    isSelected && "ring-2 ring-primary border-primary bg-primary/5",
    !isDropTarget && !isSelected && "border-border/50 hover:border-primary/30",
    "bg-white/60 dark:bg-card/60 backdrop-blur-md"
  );

  const cardProps = {
    draggable: !isBook,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", item.id);
      onDragStart(item.id);
    },
    onDragOver: isFolder ? (e: React.DragEvent) => onDragOver(e, item.id) : undefined,
    onDrop: isFolder ? (e: React.DragEvent) => onDrop(e, item.id) : undefined,
    onDragEnd: onDragEnd,
    className: containerClasses,
    onClick: handleClick,
    onDoubleClick: handleDoubleClick
  };

  if (view === 'list') {
    return (
      <Card {...cardProps}>
        <CardContent className="p-4 flex items-center gap-6">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{item.title || item.name}</h3>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={cn("hidden sm:inline-flex font-bold text-[10px] uppercase tracking-wider", colorClass)}>
              {item.itemType}
            </Badge>
            {actionButtons}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...cardProps}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", colorClass)}>
            <Icon className="w-7 h-7" />
          </div>
          {onMoveClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
              onClick={(e) => { e.stopPropagation(); onMoveClick(item.id); }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{item.title || item.name}</h3>
          <p className="text-xs text-muted-foreground font-medium line-clamp-2">{item.description || (isFolder ? "Folder" : "Document")}</p>
        </div>

        <div className="mt-8 pt-4 border-t border-border/30 flex items-center justify-between">
          <Badge variant="outline" className={cn("font-bold text-[10px] uppercase tracking-wider", colorClass)}>
            {item.itemType}
          </Badge>
          {actionButtons}
        </div>
      </CardContent>
    </Card>
  );
}
