import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  User,
  Building2,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  History,
  Send,
  Loader2,
  ExternalLink,
  Bell,
  ArrowUpRight,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { type Ticket, type Department, type User as UserType, type SlaState, type TicketComment, type TicketActivity } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TicketDrawerProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenFull?: (ticketId: string) => void;
}

export function TicketDrawer({ ticketId, open, onOpenChange, onOpenFull }: TicketDrawerProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: ["/api/tickets", ticketId],
    queryFn: async () => {
      if (!ticketId) return null;
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch ticket");
      return res.json();
    },
    enabled: !!ticketId && open,
  });

  const { data: comments = [] } = useQuery<TicketComment[]>({
    queryKey: ["/api/tickets", ticketId, "comments"],
    queryFn: async () => {
      if (!ticketId) return [];
      const res = await fetch(`/api/tickets/${ticketId}/comments`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!ticketId && open,
  });

  const { data: activity = [] } = useQuery<TicketActivity[]>({
    queryKey: ["/api/tickets", ticketId, "activity"],
    queryFn: async () => {
      if (!ticketId) return [];
      const res = await fetch(`/api/tickets/${ticketId}/activity`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!ticketId && open,
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: slaStates = [] } = useQuery<SlaState[]>({
    queryKey: ["/api/helpdesks", ticket?.helpdeskId, "sla-states"],
    queryFn: async () => {
      if (!ticket?.helpdeskId) return [];
      const res = await fetch(`/api/helpdesks/${ticket.helpdeskId}/sla-states`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!ticket?.helpdeskId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/tickets/${ticketId}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId, "activity"] });
      setNewComment("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (updates: Partial<Ticket>) => {
      const res = await apiRequest("PATCH", `/api/tickets/${ticketId}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId, "activity"] });
      toast({ title: "Ticket updated" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    },
  });

  const getDepartment = (id: string | null) => departments.find(d => d.id === id);
  const getUser = (id: string | null | undefined) => users.find(u => u.id === id);
  const getState = (id: string | null) => slaStates.find(s => s.id === id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "low": return "bg-green-500/10 text-green-600 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "created": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "assigned": return <UserCheck className="h-4 w-4 text-blue-500" />;
      case "reassigned": return <RotateCcw className="h-4 w-4 text-orange-500" />;
      case "escalated": return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "reminder_sent": return <Bell className="h-4 w-4 text-yellow-500" />;
      case "status_changed": return <History className="h-4 w-4 text-purple-500" />;
      case "commented": return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const hasEscalationWarning = ticket?.escalationWarningSent === "true";
  const hasReminderSent = ticket?.responseReminderSent === "true";

  if (!ticketId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : ticket ? (
          <>
            <SheetHeader className="p-6 border-b space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <SheetTitle className="text-lg font-semibold leading-tight">
                    {ticket.title}
                  </SheetTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </div>
                </div>
                {onOpenFull && (
                  <Button variant="outline" size="sm" onClick={() => onOpenFull(ticket.id)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("capitalize", getPriorityColor(ticket.priority))}>
                  {ticket.priority}
                </Badge>
                {getState(ticket.stateId) && (
                  <Badge style={{ backgroundColor: getState(ticket.stateId)?.color + "20", color: getState(ticket.stateId)?.color }}>
                    {getState(ticket.stateId)?.name}
                  </Badge>
                )}
                {hasReminderSent && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                    <Bell className="h-3 w-3 mr-1" />
                    Reminder Sent
                  </Badge>
                )}
                {hasEscalationWarning && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Escalation Warning
                  </Badge>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments ({comments.length})
                  </TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 m-0 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Department</span>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {getDepartment(ticket.departmentId)?.name || "Unassigned"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Assignee</span>
                        <Select
                          value={ticket.assignedTo || ""}
                          onValueChange={(value) => updateTicketMutation.mutate({ assignedTo: value || null })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.displayName || u.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <Select
                          value={ticket.stateId || ""}
                          onValueChange={(value) => updateTicketMutation.mutate({ stateId: value || null })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select status" />
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
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Priority</span>
                        <Select
                          value={ticket.priority}
                          onValueChange={(value) => updateTicketMutation.mutate({ priority: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Description</span>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap rounded-lg bg-muted/50 p-3">
                        {ticket.description || "No description provided"}
                      </div>
                    </div>

                    {ticket.aiRoutingConfidence && (
                      <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">AI Routing</span>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(parseFloat(ticket.aiRoutingConfidence) * 100)}% confident
                          </Badge>
                          {ticket.aiSuggestedAssignee && (
                            <span className="text-muted-foreground">
                              Suggested: {getUser(ticket.aiSuggestedAssignee)?.username || "Unknown"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="flex-1 m-0 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No comments yet
                        </p>
                      ) : (
                        comments.map((comment) => {
                          const author = getUser(comment.userId);
                          return (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {author?.username?.slice(0, 2).toUpperCase() || "??"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {author?.displayName || author?.username || "Unknown"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  </span>
                                  {comment.isInternal === "true" && (
                                    <Badge variant="outline" className="text-xs">Internal</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t">
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
                        size="sm"
                        onClick={() => addCommentMutation.mutate(newComment)}
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                      >
                        {addCommentMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="flex-1 m-0 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {activity.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No activity recorded
                      </p>
                    ) : (
                      activity.map((item) => {
                        const actor = getUser(item.userId);
                        return (
                          <div key={item.id} className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getActivityIcon(item.action)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium capitalize">
                                  {item.action.replace(/_/g, " ")}
                                </span>
                                {actor && (
                                  <span className="text-xs text-muted-foreground">
                                    by {actor.displayName || actor.username}
                                  </span>
                                )}
                              </div>
                              {item.reason && (
                                <p className="text-xs text-muted-foreground">{item.reason}</p>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Ticket not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
