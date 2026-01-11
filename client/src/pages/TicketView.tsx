import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Send, 
  MoreHorizontal, 
  Paperclip, 
  Clock, 
  User, 
  Building, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Hash,
  MessageSquare,
  Tag,
  Loader2,
  Edit3,
  Check,
  X,
  FileText,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Ticket, type TicketComment, type SlaState, type User as UserType, type Department, type Helpdesk } from "@shared/schema";

interface RelatedDocument {
  id: string;
  title: string;
  content: string;
  type: 'page' | 'pageVersion';
  bookId?: string | null;
  versionNumber?: number;
  pageId?: string;
  similarity: number;
  status: string;
}
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Code
} from "lucide-react";

export default function TicketView() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/helpdesk/ticket/:id");
  const ticketId = params?.id;
  
  const [composerMode, setComposerMode] = useState<"reply" | "internal">("reply");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  
  const queryClient = useQueryClient();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: composerMode === "internal" ? "Type internal note..." : "Type your response...",
      }),
    ],
    content: '',
  });

  const { data: ticket, isLoading: isLoadingTicket } = useQuery<Ticket>({
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

  const { data: helpdesks = [] } = useQuery<Helpdesk[]>({
    queryKey: ["/api/helpdesks"],
  });

  const { data: relatedDocuments = [], isLoading: isLoadingRelated } = useQuery<RelatedDocument[]>({
    queryKey: ["/api/tickets", ticketId, "related-documents"],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}/related-documents`);
      return res.json();
    },
    enabled: !!ticketId,
    staleTime: 1000 * 60 * 5,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (data: Partial<Ticket>) => {
      const res = await apiRequest("PATCH", `/api/tickets/${ticketId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast.success("Ticket updated");
      setIsEditingTitle(false);
    },
    onError: () => {
      toast.error("Failed to update ticket");
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; isInternal: boolean }) => {
      const res = await apiRequest("POST", `/api/tickets/${ticketId}/comments`, {
        ...data,
        userId: "current-user",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId, "comments"] });
      editor?.commands.clearContent();
      toast.success(composerMode === "internal" ? "Internal note added" : "Reply sent");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const handleSendMessage = () => {
    const content = editor?.getHTML();
    if (!content || content === '<p></p>') {
      toast.error("Please enter a message");
      return;
    }
    addCommentMutation.mutate({
      content,
      isInternal: composerMode === "internal",
    });
  };

  const currentState = slaStates.find(s => s.id === ticket?.stateId);
  const department = departments.find(d => d.id === ticket?.departmentId);
  const helpdesk = helpdesks.find(h => h.id === ticket?.helpdeskId);
  const assignee = users.find(u => u.id === ticket?.assignedTo);
  const creator = users.find(u => u.id === ticket?.createdBy);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "low": return "bg-green-500/10 text-green-600 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoadingTicket) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Ticket not found</p>
          <Button variant="outline" onClick={() => setLocation("/helpdesk")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Helpdesk
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border/60 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-secondary" 
              onClick={() => setLocation("/helpdesk")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px] bg-secondary/30">
                  #{ticket.id.substring(0, 8)}
                </Badge>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 w-[300px]"
                      autoFocus
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7"
                      onClick={() => updateTicketMutation.mutate({ title: editTitle })}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7"
                      onClick={() => setIsEditingTitle(false)}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-xl font-display font-bold truncate max-w-[400px]">
                      {ticket.title}
                    </h1>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setEditTitle(ticket.title);
                        setIsEditingTitle(true);
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>Created {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "recently"}</span>
                {creator && <span className="font-medium text-foreground">by {creator.username}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("border capitalize", getPriorityColor(ticket.priority))}>
              {ticket.priority} Priority
            </Badge>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl gap-2 shadow-sm h-9">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: currentState?.color || "#6b7280" }}
                  />
                  {currentState?.name || "Unknown"} 
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {slaStates.map((state) => (
                  <DropdownMenuItem 
                    key={state.id}
                    onClick={() => updateTicketMutation.mutate({ stateId: state.id })}
                    className="gap-2"
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: state.color }}
                    />
                    {state.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-secondary/5">
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-4xl mx-auto space-y-6 pb-32">
                <div className="bg-background border border-border/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback>
                        {(creator?.username || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{creator?.username || "Unknown"}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : ""}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {ticket.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>

                {isLoadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment) => {
                    const commentUser = users.find(u => u.id === comment.userId);
                    const isCreator = comment.userId === ticket.createdBy;
                    return (
                      <div key={comment.id} className={cn(
                        "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                        isCreator ? "flex-row" : "flex-row-reverse"
                      )}>
                        <Avatar className={cn(
                          "h-10 w-10 border-2 shrink-0",
                          comment.isInternal === "true" ? "border-amber-500/50" : 
                          isCreator ? "border-primary/20" : "border-blue-500/20"
                        )}>
                          <AvatarFallback className={cn(
                            "text-xs font-bold",
                            comment.isInternal === "true" ? "bg-amber-500/10 text-amber-700" :
                            isCreator ? "bg-primary/5 text-primary" : "bg-blue-500/10 text-blue-700"
                          )}>
                            {(commentUser?.username || "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className={cn(
                          "flex flex-col gap-1.5 max-w-[80%]",
                          isCreator ? "items-start" : "items-end"
                        )}>
                          <div className={cn(
                            "flex items-center gap-2 px-1",
                            isCreator ? "flex-row" : "flex-row-reverse"
                          )}>
                            <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-tight">
                              {commentUser?.username || "Unknown"}
                            </span>
                            <Badge variant="outline" className={cn(
                              "text-[9px] h-4 px-1.5 font-bold uppercase",
                              comment.isInternal === "true" ? "bg-amber-500 text-white border-transparent" :
                              !isCreator ? "bg-blue-500/10 text-blue-700 border-blue-200" : "bg-secondary text-secondary-foreground"
                            )}>
                              {comment.isInternal === "true" ? "Internal Note" : isCreator ? "Creator" : "Agent"}
                            </Badge>
                          </div>

                          <div className={cn(
                            "rounded-2xl p-4 shadow-sm border-2 transition-all",
                            comment.isInternal === "true"
                              ? "bg-amber-50/50 border-amber-200 shadow-amber-100/50" 
                              : isCreator
                                ? "bg-background border-border/60"
                                : "bg-blue-50/50 border-blue-100 shadow-blue-100/50"
                          )}>
                            <div 
                              className="text-sm leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: comment.content }}
                            />
                          </div>

                          <div className={cn(
                            "flex items-center gap-1.5 px-2 text-[10px] font-medium text-muted-foreground",
                            isCreator ? "flex-row" : "flex-row-reverse"
                          )}>
                            <Clock className="w-3 h-3" />
                            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="p-4 bg-background border-t border-border/60 backdrop-blur-md">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-1 mb-3 bg-secondary/20 p-1 rounded-xl w-fit">
                  <Button 
                    variant={composerMode === "reply" ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-lg h-8 px-4 text-xs font-bold transition-all",
                      composerMode === "reply" && "bg-background shadow-sm"
                    )}
                    onClick={() => setComposerMode("reply")}
                  >
                    Public Reply
                  </Button>
                  <Button 
                    variant={composerMode === "internal" ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-lg h-8 px-4 text-xs font-bold transition-all",
                      composerMode === "internal" && "bg-amber-500 text-white shadow-sm hover:bg-amber-600"
                    )}
                    onClick={() => setComposerMode("internal")}
                  >
                    Internal Note
                  </Button>
                </div>

                <div className={cn(
                  "rounded-2xl border-2 transition-all shadow-sm flex flex-col",
                  composerMode === "internal" 
                    ? "bg-amber-50/50 border-amber-300 ring-4 ring-amber-500/10" 
                    : "bg-secondary/20 border-border focus-within:border-primary/50"
                )}>
                  <div className="flex items-center gap-0.5 p-1.5 border-b border-border/40 bg-background/50 rounded-t-2xl overflow-x-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7 rounded-md", editor?.isActive('bold') && "bg-secondary")}
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7 rounded-md", editor?.isActive('italic') && "bg-secondary")}
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7 rounded-md", editor?.isActive('underline') && "bg-secondary")}
                      onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    >
                      <UnderlineIcon className="w-3.5 h-3.5" />
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7 rounded-md", editor?.isActive('bulletList') && "bg-secondary")}
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    >
                      <List className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7 rounded-md", editor?.isActive('orderedList') && "bg-secondary")}
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7 rounded-md", editor?.isActive('blockquote') && "bg-secondary")}
                      onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7 rounded-md", editor?.isActive('code') && "bg-secondary")}
                      onClick={() => editor?.chain().focus().toggleCode().run()}
                    >
                      <Code className="w-3.5 h-3.5" />
                    </Button>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md"
                      onClick={() => editor?.chain().focus().undo().run()}
                    >
                      <Undo className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md"
                      onClick={() => editor?.chain().focus().redo().run()}
                    >
                      <Redo className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="p-3 min-h-[100px]">
                    <EditorContent 
                      editor={editor} 
                      className="prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[60px]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 border-t border-border/40 bg-background/50 rounded-b-2xl">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      className={cn(
                        "rounded-xl gap-2 h-9 px-4 font-bold shadow-md",
                        composerMode === "internal" && "bg-amber-500 hover:bg-amber-600"
                      )}
                      onClick={handleSendMessage}
                      disabled={addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {composerMode === "internal" ? "Add Note" : "Send Reply"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[320px] border-l border-border/60 bg-background hidden lg:block">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" />
                      Ticket Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select 
                        value={ticket.stateId || ""} 
                        onValueChange={(value) => updateTicketMutation.mutate({ stateId: value })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {slaStates.map((state) => (
                            <SelectItem key={state.id} value={state.id}>
                              <div className="flex items-center gap-2">
                                <span 
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

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Select 
                        value={ticket.priority} 
                        onValueChange={(value) => updateTicketMutation.mutate({ priority: value })}
                      >
                        <SelectTrigger className="h-9">
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

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Assignee</Label>
                      <Select 
                        value={ticket.assignedTo || "unassigned"} 
                        onValueChange={(value) => updateTicketMutation.mutate({ 
                          assignedTo: value === "unassigned" ? null : value 
                        })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Department</Label>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        {department?.name || "Not assigned"}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Helpdesk</Label>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        {helpdesk?.name || "Not assigned"}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Source</Label>
                      <div className="flex items-center gap-2 text-sm capitalize">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {ticket.source || "Web"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Requester
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>
                          {(creator?.username || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{creator?.username || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{creator?.department || "No department"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <div>
                        <p className="text-xs font-medium">Created</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "Unknown"}
                        </p>
                      </div>
                    </div>
                    {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                        <div>
                          <p className="text-xs font-medium">Last Updated</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(ticket.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Related Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {isLoadingRelated ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : relatedDocuments.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No related documents found
                      </p>
                    ) : (
                      relatedDocuments.map((doc) => (
                        <div 
                          key={doc.id}
                          className="group p-2 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer"
                          onClick={() => {
                            if (doc.type === 'page') {
                              setLocation(`/docs/page/${doc.id}`);
                            } else if (doc.pageId) {
                              setLocation(`/docs/page/${doc.pageId}`);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-medium truncate">{doc.title}</p>
                                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                                {doc.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[9px] h-4 px-1">
                                  {Math.round(doc.similarity * 100)}% match
                                </Badge>
                                <span className="text-[9px] text-muted-foreground capitalize">
                                  {doc.type === 'pageVersion' ? 'Version' : 'Page'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Layout>
  );
}
