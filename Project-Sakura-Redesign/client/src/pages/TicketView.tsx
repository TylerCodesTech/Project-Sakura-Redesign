import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Phone,
  Mail,
  MoreVertical,
  Hash,
  MessageSquare,
  Zap,
  Tag,
  History
} from "lucide-react";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TicketView() {
  const [, setLocation] = useLocation();
  const [replyText, setReplyText] = useState("");
  
  // Mock ticket data
  const ticket = {
    id: "T-1024",
    title: "SSO Login failure for Engineering team",
    description: "Multiple users in the engineering department are reporting that they cannot log in using the SSO portal. It keeps redirecting back to the login page without any specific error message. This started happening around 8:00 AM PST this morning.",
    status: "Open",
    priority: "High",
    department: "IT Support",
    assignee: "Alex K.",
    creator: {
      name: "James Wilson",
      email: "j.wilson@sakura.ai",
      dept: "Engineering",
      avatar: ""
    },
    created: "2 hours ago",
    messages: [
      {
        id: 1,
        sender: "James Wilson",
        role: "Creator",
        content: "I've tried clearing cache and cookies but the issue persists for everyone on my team.",
        time: "1h 45m ago",
        isInternal: false
      },
      {
        id: 2,
        sender: "Alex K.",
        role: "Agent",
        content: "Checking the SSO logs now. It seems there might be a token mismatch in the latest deployment.",
        time: "45m ago",
        isInternal: true
      }
    ]
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Header */}
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
                <Badge variant="secondary" className="font-mono text-[10px] bg-secondary/30">{ticket.id}</Badge>
                <h1 className="text-xl font-display font-bold truncate max-w-[400px]">{ticket.title}</h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>Created {ticket.created} by</span>
                <span className="font-medium text-foreground">{ticket.creator.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Badge className={
                ticket.priority === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }>{ticket.priority} Priority</Badge>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl gap-2 shadow-sm h-9">
                  {ticket.status} <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem>In Progress</DropdownMenuItem>
                <DropdownMenuItem>Resolved</DropdownMenuItem>
                <DropdownMenuItem>Closed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content / Chat */}
          <div className="flex-1 flex flex-col min-w-0 bg-secondary/5">
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-4xl mx-auto space-y-8 pb-32">
                {/* Ticket Description */}
                <div className="bg-background border border-border/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback>{ticket.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{ticket.creator.name}</span>
                        <span className="text-[10px] text-muted-foreground">{ticket.created}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Messages */}
                {ticket.messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                    msg.sender === ticket.creator.name ? "flex-row" : "flex-row-reverse"
                  )}>
                    <Avatar className={cn(
                      "h-10 w-10 border-2 shrink-0",
                      msg.isInternal ? "border-amber-500/50" : 
                      msg.sender === ticket.creator.name ? "border-primary/20" : "border-blue-500/20"
                    )}>
                      <AvatarFallback className={cn(
                        "text-xs font-bold",
                        msg.isInternal ? "bg-amber-500/10 text-amber-700" :
                        msg.sender === ticket.creator.name ? "bg-primary/5 text-primary" : "bg-blue-500/10 text-blue-700"
                      )}>
                        {msg.sender[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn(
                      "flex flex-col gap-1.5 max-w-[80%]",
                      msg.sender === ticket.creator.name ? "items-start" : "items-end"
                    )}>
                      <div className={cn(
                        "flex items-center gap-2 px-1",
                        msg.sender === ticket.creator.name ? "flex-row" : "flex-row-reverse"
                      )}>
                        <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-tight">
                          {msg.sender}
                        </span>
                        <Badge variant="outline" className={cn(
                          "text-[9px] h-4 px-1.5 font-bold uppercase",
                          msg.isInternal ? "bg-amber-500 text-white border-transparent" :
                          msg.role === "Agent" ? "bg-blue-500/10 text-blue-700 border-blue-200" : "bg-secondary text-secondary-foreground"
                        )}>
                          {msg.isInternal ? "Internal Note" : msg.role}
                        </Badge>
                      </div>

                      <div className={cn(
                        "rounded-2xl p-4 shadow-sm border-2 transition-all",
                        msg.isInternal 
                          ? "bg-amber-50/50 border-amber-200 shadow-amber-100/50" 
                          : msg.sender === ticket.creator.name
                            ? "bg-background border-border/60"
                            : "bg-blue-50/50 border-blue-100 shadow-blue-100/50"
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      <div className={cn(
                        "flex items-center gap-1.5 px-2 text-[10px] font-medium text-muted-foreground",
                        msg.sender === ticket.creator.name ? "flex-row" : "flex-row-reverse"
                      )}>
                        <Clock className="w-3 h-3" />
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border/60 backdrop-blur-md">
              <div className="max-w-4xl mx-auto">
                <div className="bg-secondary/20 rounded-2xl border border-border p-2 focus-within:border-primary/50 transition-all shadow-sm">
                  <Textarea 
                    placeholder="Type your response..." 
                    className="min-h-[100px] border-0 bg-transparent focus-visible:ring-0 resize-none text-sm p-3"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex items-center justify-between px-2 pb-1">
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <Paperclip className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Attach files</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <Zap className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Quick responses</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Separator orientation="vertical" className="h-4 mx-1" />
                      <div className="flex items-center gap-2 px-2">
                        <Switch id="internal-toggle" className="data-[state=checked]:bg-amber-500" />
                        <Label htmlFor="internal-toggle" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">Internal Note</Label>
                      </div>
                    </div>
                    <Button 
                      className="rounded-xl h-9 px-4 gap-2 shadow-lg shadow-primary/20" 
                      disabled={!replyText.trim()}
                    >
                      Send Message <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 px-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Suggested:</span>
                  <button className="text-[10px] bg-secondary/30 hover:bg-secondary/50 py-1 px-3 rounded-full transition-colors border border-border/40">Request more info</button>
                  <button className="text-[10px] bg-secondary/30 hover:bg-secondary/50 py-1 px-3 rounded-full transition-colors border border-border/40">Mark as duplicate</button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Sidebar Info */}
          <div className="w-80 bg-background border-l border-border/60 hidden xl:flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-8">
                {/* Requester Profile */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Requester</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">{ticket.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{ticket.creator.name}</span>
                      <span className="text-xs text-muted-foreground">{ticket.creator.dept}</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" /> {ticket.creator.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" /> +1 (555) 0123
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 mt-2 h-9">
                    <User className="w-3.5 h-3.5" /> View Full Profile
                  </Button>
                </div>

                <Separator className="bg-border/40" />

                {/* Ticket Properties */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Properties</h3>
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Department</Label>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Building className="w-3.5 h-3.5 text-primary" /> {ticket.department}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Assignee</Label>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Avatar className="h-5 w-5 border">
                          <AvatarFallback className="text-[8px] bg-secondary">{ticket.assignee[0]}</AvatarFallback>
                        </Avatar>
                        {ticket.assignee}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tags</Label>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[9px] rounded-lg px-2 h-5 bg-background font-normal">SSO</Badge>
                        <Badge variant="outline" className="text-[9px] rounded-lg px-2 h-5 bg-background font-normal">Engineering</Badge>
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-lg border border-dashed border-border/60">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/40" />

                {/* Related Tickets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Similar</h3>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">View all</Button>
                  </div>
                  <div className="space-y-3">
                    <div className="group cursor-pointer">
                      <p className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-1">Password reset issues on mobile</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[8px] h-4 px-1">Resolved</Badge>
                        <span className="text-[9px] text-muted-foreground">Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-border/40" />

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Activity</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative mt-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                        <div className="absolute top-2 left-1 h-full w-[1px] bg-border/40" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold">Ticket created</span>
                        <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative mt-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold">Assigned to Alex K.</span>
                        <span className="text-[10px] text-muted-foreground">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
