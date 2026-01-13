import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Filter, 
  MoreHorizontal, 
  Search, 
  User, 
  Users as UsersIcon, 
  Clock, 
  AlertCircle,
  LayoutList,
  LayoutGrid,
  Columns as ColumnsIcon,
  Calendar,
  MessageCircle,
  Plus,
  Loader2,
  Ticket as TicketIcon,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Ticket, type Department, type User as UserType, type SlaState, type Helpdesk as HelpdeskType } from "@shared/schema";
import { TicketSidebarPanel } from "@/components/tickets/TicketSidebarPanel";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Helpdesk() {
  const [activeView, setActiveView] = useState("all");
  const [displayMode, setDisplayMode] = useState("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: helpdesks = [] } = useQuery<HelpdeskType[]>({
    queryKey: ["/api/helpdesks"],
  });

  const allSlaStatesQueries = helpdesks.map(h => h.id);
  const { data: allSlaStates = [] } = useQuery<SlaState[]>({
    queryKey: ["/api/all-sla-states"],
    queryFn: async () => {
      const states: SlaState[] = [];
      for (const helpdesk of helpdesks) {
        const res = await fetch(`/api/helpdesks/${helpdesk.id}/sla-states`);
        const helpdeskStates = await res.json();
        states.push(...helpdeskStates);
      }
      return states;
    },
    enabled: helpdesks.length > 0,
  });

  const getState = (stateId: string | null) => allSlaStates.find(s => s.id === stateId);
  
  const getStateName = (stateId: string | null) => {
    const state = getState(stateId);
    return state?.name || "Unknown";
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeView === "assigned") return ticket.assignedTo === user?.id;
    if (activeView === "department") return ticket.departmentId === user?.department;
    return true;
  });

  const kanbanColumns = ["Open", "In Progress", "Pending", "Resolved", "Closed"];

  const getDepartment = (departmentId: string | null) => 
    departments.find(d => d.id === departmentId);

  const getUser = (userId: string | null | undefined) => 
    users.find(u => u.id === userId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "low": return "bg-green-500/10 text-green-600 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "in progress": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "resolved": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "closed": return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      case "pending": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const urgentCount = tickets.filter(t => t.priority === "urgent" || t.priority === "high").length;
  
  const openTicketsCount = tickets.filter(t => {
    const state = getState(t.stateId);
    return state && state.isFinal !== "true";
  }).length;

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTicketClick = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setSelectedTicketId(ticketId);
    }, 250);
  };

  const handleTicketDoubleClick = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    handleOpenFull(ticketId);
  };

  const handleOpenFull = (ticketId: string) => {
    setSelectedTicketId(null);
    setLocation(`/helpdesk/ticket/${ticketId}`);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Helpdesk</h1>
            <p className="text-muted-foreground mt-1">Manage and route support tickets efficiently.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-secondary/20 p-1 rounded-xl flex items-center gap-1">
              <Button 
                variant={displayMode === "list" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-lg h-8 w-8 p-0"
                onClick={() => setDisplayMode("list")}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
              <Button 
                variant={displayMode === "card" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-lg h-8 w-8 p-0"
                onClick={() => setDisplayMode("card")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant={displayMode === "kanban" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-lg h-8 w-8 p-0"
                onClick={() => setDisplayMode("kanban")}
              >
                <ColumnsIcon className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />
            <Tabs value={activeView} onValueChange={setActiveView} className="bg-secondary/20 p-1 rounded-xl">
              <TabsList className="bg-transparent border-0 h-8">
                <TabsTrigger value="all" className="rounded-lg px-4 h-7 text-xs">All</TabsTrigger>
                <TabsTrigger value="assigned" className="rounded-lg px-4 h-7 text-xs gap-2">
                  <User className="w-3 h-3" /> Assigned
                </TabsTrigger>
                <TabsTrigger value="department" className="rounded-lg px-4 h-7 text-xs gap-2">
                  <UsersIcon className="w-3 h-3" /> Dept
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {displayMode !== "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border/40 bg-secondary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TicketIcon className="w-4 h-4" /> Total Tickets
                </CardDescription>
                <CardTitle className="text-2xl">{tickets.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/40 bg-secondary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" /> Urgent/High Priority
                </CardDescription>
                <CardTitle className="text-2xl">{urgentCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/40 bg-secondary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" /> Open Tickets
                </CardDescription>
                <CardTitle className="text-2xl">
                  {openTicketsCount}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <div className="flex items-center gap-4 justify-end">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2 shadow-sm">
              <Filter className="w-4 h-4 text-muted-foreground" />
              Filter
            </Button>
          </div>
        </div>

        {isLoadingTickets ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <>
            {displayMode === "list" && (
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/20">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="w-[120px] py-4">Ticket ID</TableHead>
                      <TableHead>Subject & Dept</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead className="text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => {
                      const department = getDepartment(ticket.departmentId);
                      const assignee = getUser(ticket.assignedTo);
                      return (
                        <TableRow 
                          key={ticket.id} 
                          className="hover:bg-secondary/10 cursor-pointer group border-b border-border/50"
                          onClick={(e) => handleTicketClick(ticket.id, e)}
                          onDoubleClick={(e) => handleTicketDoubleClick(ticket.id, e)}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground pl-6">
                            #{ticket.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                              {ticket.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              {department && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-normal bg-background">
                                  <div 
                                    className="w-1.5 h-1.5 rounded-full mr-1" 
                                    style={{ backgroundColor: department.color }} 
                                  />
                                  {department.name}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const state = getState(ticket.stateId);
                              return state ? (
                                <span 
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                                  style={{ 
                                    backgroundColor: `${state.color}15`, 
                                    color: state.color,
                                    borderColor: `${state.color}30`
                                  }}
                                >
                                  {state.name}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-muted text-muted-foreground">
                                  Unknown
                                </span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border capitalize", getPriorityColor(ticket.priority))}>
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {assignee ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-[10px]">
                                    {assignee.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {assignee.username}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTicketClick(ticket.id, e); }}>
                                  <Eye className="w-4 h-4 mr-2" /> Quick View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenFull(ticket.id); }}>
                                  <ExternalLink className="w-4 h-4 mr-2" /> Open Full
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {displayMode === "card" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTickets.map((ticket) => {
                  const department = getDepartment(ticket.departmentId);
                  const assignee = getUser(ticket.assignedTo);
                  return (
                    <Card 
                      key={ticket.id} 
                      className="hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
                      onClick={(e) => handleTicketClick(ticket.id, e)}
                      onDoubleClick={(e) => handleTicketDoubleClick(ticket.id, e)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            #{ticket.id.substring(0, 8)}
                          </Badge>
                          {(() => {
                            const state = getState(ticket.stateId);
                            return state ? (
                              <Badge 
                                className="border"
                                style={{ 
                                  backgroundColor: `${state.color}15`, 
                                  color: state.color,
                                  borderColor: `${state.color}30`
                                }}
                              >
                                {state.name}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors leading-tight">
                          {ticket.title}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3" /> 
                          {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "Unknown"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          {department && (
                            <Badge variant="outline" className="text-[10px] font-normal">
                              <div 
                                className="w-1.5 h-1.5 rounded-full mr-1" 
                                style={{ backgroundColor: department.color }} 
                              />
                              {department.name}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Badge className={cn("border text-[10px] capitalize", getPriorityColor(ticket.priority))}>
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="pt-2 flex items-center justify-between border-t border-border/50">
                          <div className="flex items-center gap-2">
                            {assignee ? (
                              <>
                                <Avatar className="h-6 w-6 border">
                                  <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                                    {assignee.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground font-medium">
                                  {assignee.username}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">Unassigned</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="flex items-center gap-1 text-[10px]">
                              <MessageCircle className="w-3 h-3" /> 0
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {displayMode === "kanban" && (
              <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[500px]">
                {kanbanColumns.map((col) => {
                  const colTickets = filteredTickets.filter(t => {
                    const state = getState(t.stateId);
                    return state?.name.toLowerCase() === col.toLowerCase();
                  });
                  return (
                    <div key={col} className="flex-1 min-w-[300px] flex flex-col gap-3">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold tracking-tight">{col}</h3>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{colTickets.length}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="w-3 h-3" /></Button>
                      </div>
                      <ScrollArea className="flex-1 bg-secondary/5 border border-border/40 rounded-2xl p-3">
                        <div className="flex flex-col gap-3">
                          {colTickets.map((ticket) => {
                            const department = getDepartment(ticket.departmentId);
                            const assignee = getUser(ticket.assignedTo);
                            return (
                              <Card 
                                key={ticket.id} 
                                className="shadow-sm hover:border-primary/40 transition-all cursor-pointer"
                                onClick={(e) => handleTicketClick(ticket.id, e)}
                                onDoubleClick={(e) => handleTicketDoubleClick(ticket.id, e)}
                              >
                                <CardHeader className="p-3 pb-2">
                                  <div className="flex justify-between items-start mb-1.5">
                                    <span className="text-[9px] font-mono text-muted-foreground">
                                      #{ticket.id.substring(0, 8)}
                                    </span>
                                    <Badge className={cn("border text-[9px] py-0 h-4", getPriorityColor(ticket.priority))}>
                                      {ticket.priority}
                                    </Badge>
                                  </div>
                                  <h4 className="text-xs font-semibold leading-snug">{ticket.title}</h4>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5">
                                      {assignee ? (
                                        <>
                                          <Avatar className="h-5 w-5 border">
                                            <AvatarFallback className="text-[8px]">
                                              {assignee.username.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-[10px] text-muted-foreground">{assignee.username}</span>
                                        </>
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground/50">Unassigned</span>
                                      )}
                                    </div>
                                    {department && (
                                      <Badge variant="outline" className="text-[8px] py-0 h-3.5 px-1 font-normal opacity-70">
                                        {department.name}
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredTickets.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-secondary/5 rounded-3xl border border-dashed">
                <Search className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-sm">No tickets found in this view.</p>
              </div>
            )}
          </>
        )}
      </div>

      <TicketSidebarPanel
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onOpenFull={handleOpenFull}
      />
    </Layout>
  );
}
