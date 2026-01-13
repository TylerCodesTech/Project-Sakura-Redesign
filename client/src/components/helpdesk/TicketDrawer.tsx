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
  RefreshCw,
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
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-xl border-border/30">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary/60 mx-auto" />
              <p className="text-muted-foreground font-medium">Loading ticket details...</p>
            </div>
          </div>
        ) : ticket ? (
          <>
            {/* Enhanced Header */}
            <SheetHeader className="p-8 border-b border-border/30 bg-gradient-to-r from-background/80 to-secondary/10">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono text-xs bg-secondary/60 px-3 py-1 rounded-xl">
                      #{ticket.id.substring(0, 8)}
                    </Badge>
                    {getState(ticket.stateId) && (
                      <Badge
                        className="font-medium px-3 py-1 rounded-xl shadow-sm"
                        style={{
                          backgroundColor: `${getState(ticket.stateId)!.color}15`,
                          color: getState(ticket.stateId)!.color,
                          borderColor: `${getState(ticket.stateId)!.color}30`
                        }}
                      >
                        {getState(ticket.stateId)!.name}
                      </Badge>
                    )}
                    <Badge className={cn("font-medium px-3 py-1 rounded-xl shadow-sm capitalize", getPriorityColor(ticket.priority))}>
                      {ticket.priority}
                    </Badge>
                  </div>

                  <SheetTitle className="text-2xl font-bold leading-tight text-foreground pr-4">
                    {ticket.title}
                  </SheetTitle>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </div>
                    {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>

                {onOpenFull && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onOpenFull(ticket.id)}
                    className="rounded-xl gap-2 border-border/40 hover:bg-secondary/50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Full View
                  </Button>
                )}
              </div>

              {/* Ticket Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                {/* Department */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-background/60 border border-border/40">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Department</p>
                    <p className="font-semibold text-foreground truncate">
                      {getDepartment(ticket.departmentId)?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-background/60 border border-border/40">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Assigned to</p>
                    <p className="font-semibold text-foreground truncate">
                      {getUser(ticket.assignedTo)?.username || "Unassigned"}
                    </p>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-background/60 border border-border/40">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    ticket.priority === "urgent" ? "bg-red-500/10" :
                    ticket.priority === "high" ? "bg-orange-500/10" :
                    ticket.priority === "medium" ? "bg-yellow-500/10" : "bg-green-500/10"
                  )}>
                    <AlertTriangle className={cn(
                      "h-4 w-4",
                      ticket.priority === "urgent" ? "text-red-600" :
                      ticket.priority === "high" ? "text-orange-600" :
                      ticket.priority === "medium" ? "text-yellow-600" : "text-green-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Priority</p>
                    <p className="font-semibold text-foreground capitalize">{ticket.priority}</p>
                  </div>
                </div>
              </div>

              {/* Alert indicators */}
              {(hasEscalationWarning || hasReminderSent) && (
                <div className="flex gap-3 pt-4">
                  {hasEscalationWarning && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                      <Bell className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-medium text-red-600">Escalation Warning Sent</span>
                    </div>
                  )}
                  {hasReminderSent && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-600">Reminder Sent</span>
                    </div>
                  )}
                </div>
              )}
            </SheetHeader>

            {/* Enhanced Tabbed Content */}
            <div className="flex-1 overflow-hidden p-6">
              <Tabs defaultValue="details" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/30 p-1 rounded-2xl">
                  <TabsTrigger value="details" className="rounded-xl font-medium">Details</TabsTrigger>
                  <TabsTrigger value="comments" className="rounded-xl font-medium">
                    Comments 
                    {comments.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">{comments.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-xl font-medium">
                    Activity
                    {activity.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">{activity.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-6">
                      {/* Description */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          Description
                        </h3>
                        <div className="bg-secondary/20 rounded-2xl p-6 border border-border/40">
                          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                            {ticket.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Select
                            value={getState(ticket.stateId)?.id || ""}
                            onValueChange={(value) => updateTicketMutation.mutate({ stateId: value })}
                          >
                            <SelectTrigger className="rounded-2xl border-border/40 bg-background/60 h-12">
                              <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                              {slaStates.map((state) => (
                                <SelectItem key={state.id} value={state.id} className="rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: state.color }}
                                    />
                                    {state.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={ticket.assignedTo || ""}
                            onValueChange={(value) => updateTicketMutation.mutate({ assignedTo: value })}
                          >
                            <SelectTrigger className="rounded-2xl border-border/40 bg-background/60 h-12">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                              <SelectItem value="" className="rounded-xl">Unassigned</SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id} className="rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs">
                                        {user.username.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {user.username}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
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
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-3xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Ticket not found</p>
                <p className="text-muted-foreground text-sm">The requested ticket could not be loaded.</p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
