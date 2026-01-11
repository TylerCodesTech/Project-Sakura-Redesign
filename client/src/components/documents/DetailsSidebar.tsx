import { useState, useEffect } from "react";
import { 
  X, 
  MoreHorizontal, 
  FileText, 
  BookOpen, 
  Folder, 
  ExternalLink, 
  Share2, 
  User,
  Calendar,
  CalendarPlus,
  History,
  Trash2,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { MoveDialog } from "./MoveDialog";

type SidebarItem = {
  id: string;
  title: string;
  itemType: 'book' | 'page' | 'folder';
  description?: string | null;
  content?: string;
  status?: string;
  authorId?: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  parentId?: string | null;
};

interface DetailsSidebarProps {
  item: SidebarItem | null;
  onClose: () => void;
  isOpen: boolean;
  canDelete?: boolean;
  canMove?: boolean;
}

export function DetailsSidebar({ item, onClose, isOpen, canDelete = true, canMove = true }: DetailsSidebarProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [canConfirmDelete, setCanConfirmDelete] = useState(false);

  useEffect(() => {
    if (isDeleteDialogOpen) {
      setDeleteCountdown(5);
      setCanConfirmDelete(false);
      const timer = setInterval(() => {
        setDeleteCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanConfirmDelete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isDeleteDialogOpen]);

  const deleteBookMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/books/${item?.id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "WikiBook has been deleted." });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setIsDeleteDialogOpen(false);
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/pages/${item?.id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Document has been deleted." });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      setIsDeleteDialogOpen(false);
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  });

  if (!item) return null;

  const isBook = item.itemType === 'book';
  const isFolder = item.itemType === 'folder';
  const Icon = isBook ? BookOpen : isFolder ? Folder : FileText;
  const colorClass = isBook ? 'text-emerald-500 bg-emerald-500/10' : 
                     isFolder ? 'text-blue-500 bg-blue-500/10' : 
                     'text-indigo-500 bg-indigo-500/10';
  
  const typeLabel = isBook ? 'WikiBook' : isFolder ? 'Folder' : 'Document';
  const href = isBook ? `/documents/book/${item.id}` : 
               isFolder ? '#' : `/documents/edit/${item.id}`;

  const updatedAt = item.updatedAt ? new Date(item.updatedAt) : new Date();
  const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();
  const status = 'status' in item ? item.status : undefined;
  const description = 'description' in item ? item.description : undefined;

  const contentSize = !isFolder && 'content' in item && item.content 
    ? `${Math.round(new Blob([item.content]).size / 1024)}KB` 
    : '0KB';

  const activities = [
    {
      action: 'You viewed this file',
      time: 'Just now',
      color: 'bg-pink-400'
    },
    {
      action: 'Current User modified',
      time: format(updatedAt, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
      color: 'bg-pink-400'
    }
  ];

  const handleOpen = () => {
    if (!isFolder) {
      navigate(href);
      onClose();
    }
  };

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${href}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({ title: "Link Copied", description: "Document link copied to clipboard." });
    } catch {
      toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
    }
  };

  const handleDelete = () => {
    if (isBook) {
      deleteBookMutation.mutate();
    } else {
      deletePageMutation.mutate();
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-[340px] bg-background/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50",
          "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}
      >
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold tracking-tight">Details</h2>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer">
                      <History className="w-4 h-4" />
                      Version History
                    </DropdownMenuItem>
                    {canMove && !isBook && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 rounded-lg cursor-pointer"
                          onClick={() => setIsMoveDialogOpen(true)}
                        >
                          <FolderOpen className="w-4 h-4" />
                          Move to...
                        </DropdownMenuItem>
                      </>
                    )}
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => setIsDeleteDialogOpen(true)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete {isBook ? 'WikiBook' : isFolder ? 'Folder' : 'Document'}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center text-center mb-8">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300",
                colorClass,
                isOpen && "animate-in zoom-in-50 duration-500"
              )}>
                <Icon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {typeLabel} • {contentSize}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-8">
              {!isFolder && (
                <Button 
                  className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                  onClick={handleOpen}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              )}
              <Button 
                variant="outline" 
                className={cn(
                  "rounded-xl border-border/50 font-bold gap-2",
                  isFolder ? "flex-1" : "px-4"
                )}
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      Owner
                    </div>
                    <p className="text-sm font-medium">Current User</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarPlus className="w-3 h-3" />
                      Created
                    </div>
                    <p className="text-sm font-medium">{format(createdAt, 'MMM d, yyyy')}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Modified
                    </div>
                    <p className="text-sm font-medium">{format(updatedAt, 'MMM d, yyyy \'at\' h:mm a')}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Activity
                </h4>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className={cn("w-2 h-2 rounded-full", activity.color)} />
                        {index < activities.length - 1 && (
                          <div className="w-px h-full bg-border/50 absolute top-3" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {status && (
                <>
                  <Separator className="bg-border/50" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                      Status
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-bold",
                        status === 'published' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                        status === 'draft' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                        status === 'in_review' && "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      )}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                </>
              )}

              {description && (
                <>
                  <Separator className="bg-border/50" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                      Description
                    </h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px] border-border/50 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Delete {isBook ? 'WikiBook' : isFolder ? 'Folder' : 'Document'}?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete <span className="font-bold text-foreground">"{item.title}"</span> and all of its contents.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {!canConfirmDelete && (
              <div className="flex items-center justify-center gap-2 p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                <span className="text-sm text-muted-foreground">You can confirm in</span>
                <span className="text-2xl font-bold text-destructive tabular-nums">{deleteCountdown}</span>
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="rounded-xl gap-2"
              disabled={!canConfirmDelete || deleteBookMutation.isPending || deletePageMutation.isPending}
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              {deleteBookMutation.isPending || deletePageMutation.isPending ? 'Deleting...' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isBook && item && (
        <MoveDialog
          isOpen={isMoveDialogOpen}
          onClose={() => setIsMoveDialogOpen(false)}
          itemId={item.id}
          itemTitle={item.title}
          itemType={item.itemType}
          currentParentId={item.parentId || null}
        />
      )}
    </>
  );
}
