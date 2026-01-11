import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  GitBranch, 
  Clock, 
  User, 
  RotateCcw, 
  Archive,
  ArchiveRestore,
  Eye,
  GitCommit,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface Version {
  id: string;
  pageId?: string;
  bookId?: string;
  versionNumber: number;
  title: string;
  content?: string;
  description?: string;
  status?: string;
  authorId: string;
  changeDescription?: string | null;
  isArchived?: string;
  createdAt: string | Date;
}

interface VersionTimelineProps {
  documentId: string;
  documentType: "page" | "book";
  isOpen: boolean;
  onClose: () => void;
  onCompare?: (v1: number, v2: number) => void;
}

export function VersionTimeline({ 
  documentId, 
  documentType, 
  isOpen, 
  onClose,
  onCompare 
}: VersionTimelineProps) {
  const { toast } = useToast();
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [versionToRevert, setVersionToRevert] = useState<Version | null>(null);

  const versionsQuery = useQuery<Version[]>({
    queryKey: [`/api/${documentType}s/${documentId}/versions`],
    enabled: isOpen && !!documentId,
  });

  const revertMutation = useMutation({
    mutationFn: async (versionNumber: number) => {
      return await apiRequest("POST", `/api/${documentType}s/${documentId}/revert/${versionNumber}`, {
        userId: "current-user",
        userName: "Current User",
      });
    },
    onSuccess: () => {
      toast({
        title: "Reverted Successfully",
        description: `Document has been reverted to version ${versionToRevert?.versionNumber}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/${documentType}s/${documentId}/versions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${documentType}s`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${documentType}s/${documentId}`] });
      setRevertDialogOpen(false);
      setVersionToRevert(null);
    },
    onError: () => {
      toast({
        title: "Revert Failed",
        description: "Could not revert to the selected version.",
        variant: "destructive",
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return await apiRequest("POST", `/api/${documentType}s/${documentId}/versions/${versionId}/archive`, {
        userId: "current-user",
      });
    },
    onSuccess: () => {
      toast({ title: "Archived", description: "Version has been archived." });
      queryClient.invalidateQueries({ queryKey: [`/api/${documentType}s/${documentId}/versions`] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return await apiRequest("POST", `/api/${documentType}s/${documentId}/versions/${versionId}/restore`, {
        userId: "current-user",
      });
    },
    onSuccess: () => {
      toast({ title: "Restored", description: "Version has been restored." });
      queryClient.invalidateQueries({ queryKey: [`/api/${documentType}s/${documentId}/versions`] });
    },
  });

  const toggleExpand = (versionNumber: number) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionNumber)) {
      newExpanded.delete(versionNumber);
    } else {
      newExpanded.add(versionNumber);
    }
    setExpandedVersions(newExpanded);
  };

  const toggleCompareSelection = (versionNumber: number) => {
    if (selectedForCompare.includes(versionNumber)) {
      setSelectedForCompare(selectedForCompare.filter(v => v !== versionNumber));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, versionNumber]);
    } else {
      setSelectedForCompare([selectedForCompare[1], versionNumber]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2 && onCompare) {
      const sorted = [...selectedForCompare].sort((a, b) => a - b);
      onCompare(sorted[0], sorted[1]);
    }
  };

  const versions = versionsQuery.data || [];

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-[400px] bg-background/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50",
          "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Version History</h2>
                  <p className="text-xs text-muted-foreground">
                    {versions.length} version{versions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg">
                Close
              </Button>
            </div>

            {selectedForCompare.length > 0 && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-violet-500/10 rounded-xl">
                <span className="text-sm">
                  {selectedForCompare.length === 1 
                    ? `v${selectedForCompare[0]} selected`
                    : `Comparing v${Math.min(...selectedForCompare)} ↔ v${Math.max(...selectedForCompare)}`
                  }
                </span>
                {selectedForCompare.length === 2 && (
                  <Button 
                    size="sm" 
                    className="ml-auto rounded-lg gap-1"
                    onClick={handleCompare}
                  >
                    <Eye className="w-3 h-3" />
                    Compare
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-lg"
                  onClick={() => setSelectedForCompare([])}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              {versionsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">No versions yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Versions are created when you save changes
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-violet-500/50 to-transparent" />
                  
                  <div className="space-y-3">
                    {versions.map((version, index) => {
                      const isExpanded = expandedVersions.has(version.versionNumber);
                      const isSelected = selectedForCompare.includes(version.versionNumber);
                      const isArchived = version.isArchived === "true";
                      const isLatest = index === 0;
                      
                      return (
                        <div
                          key={version.id}
                          className={cn(
                            "relative pl-10 pr-3",
                            isArchived && "opacity-60"
                          )}
                        >
                          <div 
                            className={cn(
                              "absolute left-4 top-4 w-4 h-4 rounded-full border-2 transition-all",
                              isLatest 
                                ? "bg-violet-500 border-violet-500" 
                                : isSelected 
                                  ? "bg-amber-500 border-amber-500" 
                                  : "bg-background border-violet-500/50"
                            )}
                          >
                            {isLatest && (
                              <div className="absolute inset-0 animate-ping bg-violet-500 rounded-full opacity-50" />
                            )}
                          </div>
                          
                          <div 
                            className={cn(
                              "bg-card/50 rounded-xl border transition-all",
                              isSelected 
                                ? "border-amber-500/50 bg-amber-500/5" 
                                : "border-border/50 hover:border-border"
                            )}
                          >
                            <div 
                              className="p-3 cursor-pointer"
                              onClick={() => toggleExpand(version.versionNumber)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs font-mono",
                                        isLatest && "bg-violet-500/10 border-violet-500/30 text-violet-600"
                                      )}
                                    >
                                      v{version.versionNumber}
                                    </Badge>
                                    {isLatest && (
                                      <Badge className="text-[10px] bg-violet-500 text-white">
                                        Latest
                                      </Badge>
                                    )}
                                    {isArchived && (
                                      <Badge variant="secondary" className="text-[10px]">
                                        Archived
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm font-medium mt-2 truncate">
                                    {version.title}
                                  </p>
                                  
                                  {version.changeDescription && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      <GitCommit className="w-3 h-3 inline mr-1" />
                                      {version.changeDescription}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      Author
                                    </span>
                                  </div>
                                </div>
                                
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="px-3 pb-3 pt-0 border-t border-border/50">
                                <div className="flex flex-wrap gap-1 mt-3">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className={cn(
                                            "h-8 rounded-lg text-xs gap-1",
                                            isSelected && "bg-amber-500/10 border-amber-500/50"
                                          )}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCompareSelection(version.versionNumber);
                                          }}
                                        >
                                          <Eye className="w-3 h-3" />
                                          {isSelected ? "Selected" : "Compare"}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Select up to 2 versions to compare
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    {!isLatest && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 rounded-lg text-xs gap-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setVersionToRevert(version);
                                              setRevertDialogOpen(true);
                                            }}
                                          >
                                            <RotateCcw className="w-3 h-3" />
                                            Revert
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Restore document to this version
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 rounded-lg text-xs gap-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (isArchived) {
                                              restoreMutation.mutate(version.id);
                                            } else {
                                              archiveMutation.mutate(version.id);
                                            }
                                          }}
                                        >
                                          {isArchived ? (
                                            <>
                                              <ArchiveRestore className="w-3 h-3" />
                                              Restore
                                            </>
                                          ) : (
                                            <>
                                              <Archive className="w-3 h-3" />
                                              Archive
                                            </>
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {isArchived ? "Restore from archive" : "Move to archive"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                
                                <div className="mt-3 p-2 bg-muted/50 rounded-lg text-xs">
                                  <p className="text-muted-foreground">
                                    Created: {format(new Date(version.createdAt), 'PPp')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px]">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Revert to Version {versionToRevert?.versionNumber}?
            </DialogTitle>
            <DialogDescription>
              This will restore the document to the state from{' '}
              {versionToRevert && formatDistanceToNow(new Date(versionToRevert.createdAt), { addSuffix: true })}.
              Your current changes will be saved as a new version first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRevertDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => versionToRevert && revertMutation.mutate(versionToRevert.versionNumber)}
              disabled={revertMutation.isPending}
              className="rounded-xl gap-2 bg-amber-500 hover:bg-amber-600"
            >
              <RotateCcw className="w-4 h-4" />
              {revertMutation.isPending ? "Reverting..." : "Revert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
