import { useState, useEffect } from "react";
import { 
  Folder, 
  ChevronRight, 
  ChevronLeft,
  Home,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Page } from "@shared/schema";

interface MoveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  itemType: 'book' | 'page' | 'folder';
  currentParentId: string | null;
}

export function MoveDialog({ 
  isOpen, 
  onClose, 
  itemId, 
  itemTitle, 
  itemType,
  currentParentId 
}: MoveDialogProps) {
  const { toast } = useToast();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [browsingFolderId, setBrowsingFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, title: string}[]>([
    { id: null, title: 'Root' }
  ]);

  const { data: allPages = [] } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
    enabled: isOpen
  });

  const folders = allPages.filter(p => 
    p.type === 'folder' && 
    p.id !== itemId && 
    p.parentId === browsingFolderId
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(null);
      setBrowsingFolderId(null);
      setBreadcrumbs([{ id: null, title: 'Root' }]);
    }
  }, [isOpen]);

  const moveItemMutation = useMutation({
    mutationFn: async ({ id, parentId }: { id: string, parentId: string | null }) => {
      const res = await apiRequest("PATCH", `/api/pages/${id}`, { 
        parentId,
        movedAt: new Date().toISOString()
      });
      return await res.json() as Page;
    },
    onSuccess: () => {
      toast({ title: "Item Moved", description: `"${itemTitle}" has been moved successfully.` });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to move item.", variant: "destructive" });
    }
  });

  const handleBrowseIntoFolder = (folderId: string, folderTitle: string) => {
    setBrowsingFolderId(folderId);
    setBreadcrumbs(prev => [...prev, { id: folderId, title: folderTitle }]);
  };

  const handleNavigateToBreadcrumb = (index: number) => {
    const crumb = breadcrumbs[index];
    setBrowsingFolderId(crumb.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setSelectedFolderId(null);
  };

  const handleGoBack = () => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      setBreadcrumbs(newBreadcrumbs);
      setBrowsingFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
      setSelectedFolderId(null);
    }
  };

  const handleMove = () => {
    const targetId = selectedFolderId !== undefined ? selectedFolderId : browsingFolderId;
    if (targetId === currentParentId) {
      toast({ title: "No Change", description: "Item is already in this location.", variant: "default" });
      return;
    }
    moveItemMutation.mutate({ id: itemId, parentId: targetId });
  };

  const handleSelectCurrentLocation = () => {
    setSelectedFolderId(browsingFolderId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] rounded-[24px] border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-500" />
            Move "{itemTitle}"
          </DialogTitle>
          <DialogDescription>
            Select a destination folder for this {itemType === 'book' ? 'wikibook' : itemType}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id ?? 'root'} className="flex items-center">
                {index > 0 && <ChevronRight className="w-3 h-3 mx-1" />}
                <button
                  onClick={() => handleNavigateToBreadcrumb(index)}
                  className={cn(
                    "hover:text-primary transition-colors",
                    index === breadcrumbs.length - 1 && "font-semibold text-foreground"
                  )}
                >
                  {index === 0 ? <Home className="w-4 h-4" /> : crumb.title}
                </button>
              </div>
            ))}
          </div>

          <ScrollArea className="h-[280px] rounded-xl border border-border/50 bg-secondary/20">
            <div className="p-2 space-y-1">
              {breadcrumbs.length > 1 && (
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl h-12 gap-3 font-medium"
                  onClick={handleGoBack}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}

              <Button
                variant={selectedFolderId === browsingFolderId ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-xl h-12 gap-3 font-medium",
                  selectedFolderId === browsingFolderId && "ring-2 ring-primary"
                )}
                onClick={handleSelectCurrentLocation}
              >
                <Home className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left">Move here</span>
                {browsingFolderId === currentParentId && (
                  <span className="text-xs text-muted-foreground">(current)</span>
                )}
              </Button>

              {folders.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No folders in this location
                </div>
              )}

              {folders.map(folder => (
                <div 
                  key={folder.id} 
                  className={cn(
                    "flex items-center rounded-xl transition-colors",
                    selectedFolderId === folder.id && "ring-2 ring-primary bg-secondary"
                  )}
                >
                  <Button
                    variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                    className="flex-1 justify-start rounded-xl rounded-r-none h-12 gap-3 font-medium"
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <Folder className="w-5 h-5 text-blue-500" />
                    <span className="flex-1 text-left truncate">{folder.title}</span>
                    {folder.id === currentParentId && (
                      <span className="text-xs text-muted-foreground">(current)</span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl rounded-l-none"
                    onClick={() => handleBrowseIntoFolder(folder.id, folder.title)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleMove}
            disabled={moveItemMutation.isPending || (selectedFolderId === undefined && browsingFolderId === currentParentId)}
            className="rounded-xl"
          >
            {moveItemMutation.isPending ? 'Moving...' : 'Move Here'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
