import { useState } from "react";
import {
  X,
  Ticket,
  Clock,
  User,
  Building2,
  MessageSquare,
  Send,
  Edit3,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Ticket as TicketType, type TicketComment, type SlaState, type User as UserType, type Department } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TicketSidebarPanelProps {
  ticketId: string | null;
  onClose: () => void;
  onOpenFull?: (ticketId: string) => void;
}

export function TicketSidebarPanel({ ticketId, onClose, onOpenFull }: TicketSidebarPanelProps) {
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editState, setEditState] = useState("");

  const queryClient = useQueryClient();

  const { data: ticket, isLoading: isLoadingTicket } = useQuery<TicketType>({
    queryKey: ["/api/tickets", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Ticket not found");
      return res.json();
    },
    enabled: !!ticketId,
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<TicketComment[]>({
    queryKey: ["/api/tickets", ticketId, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}/comments`);
      return res.json();
    },
    enabled: !!ticketId,
  });

  const { data: slaStates = [] } = useQuery<SlaState[]>({
    queryKey: ["/api/helpdesks", ticket?.helpdeskId, "sla-states"],
    queryFn: async () => {
      if (!ticket?.helpdeskId) return [];
      const res = await fetch(`/api/helpdesks/${ticket.helpdeskId}/sla-states`);
      return res.json();
    },
    enabled: !!ticket?.helpdeskId,
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (data: Partial<TicketType>) => {
      const res = await apiRequest("PATCH", `/api/tickets/${ticketId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setIsEditing(false);
      toast.success("Ticket updated");
    },
    onError: () => {
      toast.error("Failed to update ticket");
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/tickets/${ticketId}/comments`, {
        content,
        isInternal: "false",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId, "comments"] });
      setNewComment("");
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const handleSaveEdit = () => {
    const updates: Partial<TicketType> = {};
    if (editTitle && editTitle !== ticket?.title) updates.title = editTitle;
    if (editPriority && editPriority !== ticket?.priority) updates.priority = editPriority;
    if (editState && editState !== ticket?.stateId) updates.stateId = editState;
    
    if (Object.keys(updates).length > 0) {
      updateTicketMutation.mutate(updates);
    } else {
      setIsEditing(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const startEditing = () => {
    setEditTitle(ticket?.title || "");
    setEditPriority(ticket?.priority || "medium");
    setEditState(ticket?.stateId || "");
    setIsEditing(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "low": return "bg-green-500/10 text-green-600 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const currentState = slaStates.find((s) => s.id === ticket?.stateId);
  const assignee = users.find((u) => u.id === ticket?.assignedTo);
  const requester = users.find((u) => u.id === ticket?.createdBy);
  const department = departments.find((d) => d.id === ticket?.departmentId);

  return (
    <Sheet open={!!ticketId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Ticket Details
            </SheetTitle>
            <div className="flex items-center gap-2">
              {onOpenFull && ticketId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenFull(ticketId)}
                  title="Open full view"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Quick view and update ticket details
          </SheetDescription>
        </SheetHeader>

        {isLoadingTicket ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : !ticket ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Ticket not found</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {isEditing ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="font-semibold"
                        />
                      ) : (
                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        #{ticket.id.substring(0, 8)}
                      </p>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "ghost"}
                      size="sm"
                      onClick={isEditing ? handleSaveEdit : startEditing}
                      disabled={updateTicketMutation.isPending}
                    >
                      {updateTicketMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isEditing ? (
                        "Save"
                      ) : (
                        <Edit3 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <Select value={editPriority} onValueChange={setEditPriority}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={cn("border", getPriorityColor(ticket.priority))}>
                        {ticket.priority}
                      </Badge>
                    )}
                    
                    {isEditing ? (
                      <Select value={editState} onValueChange={setEditState}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {slaStates.map((state) => (
                            <SelectItem key={state.id} value={state.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: state.color }}
                                />
                                {state.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : currentState ? (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: currentState.color,
                          color: currentState.color,
                        }}
                      >
                        {currentState.isFinal === "true" && (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        {currentState.name}
                      </Badge>
                    ) : null}
                    
                    <Badge variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      {ticket.ticketType}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Requester</p>
                      <p className="text-sm font-medium">{requester?.username || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Assignee</p>
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-[10px]">
                              {assignee.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium">{assignee.username}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Unassigned</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Department</p>
                      <div className="flex items-center gap-2">
                        {department && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: department.color }}
                          />
                        )}
                        <p className="text-sm font-medium">{department?.name || "Unknown"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">
                        {ticket.createdAt
                          ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Description
                  </h4>
                  <div className="text-sm text-muted-foreground bg-secondary/20 rounded-lg p-3">
                    {ticket.description || "No description provided."}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments ({comments.length})
                  </h4>
                  
                  {isLoadingComments ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((comment) => {
                        const commenter = users.find((u) => u.id === comment.userId);
                        return (
                          <div
                            key={comment.id}
                            className={cn(
                              "rounded-lg p-3",
                              comment.isInternal === "true"
                                ? "bg-yellow-500/10 border border-yellow-500/20"
                                : "bg-secondary/20"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[10px]">
                                  {commenter?.username.substring(0, 2).toUpperCase() || "??"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {commenter?.username || "Unknown"}
                              </span>
                              {comment.isInternal === "true" && (
                                <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-500/30">
                                  Internal
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {comment.createdAt
                                  ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  className="gap-2"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
