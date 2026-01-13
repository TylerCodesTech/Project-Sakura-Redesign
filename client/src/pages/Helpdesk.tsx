import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MoreHorizontal, 
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
  LayoutDashboard,
  Inbox,
  FolderTree,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Shield,
  Headphones,
  HardDrive,
  Server,
  Network,
  Zap,
  TrendingUp,
  CheckCircle2,
  Timer,
  UserPlus,
  Play,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

type HelpdeskSection = "dashboard" | "my-queue" | "team-queue" | "teams";

export default function Helpdesk() {
  const [activeSection, setActiveSection] = useState<HelpdeskSection>("dashboard");
  const [displayMode, setDisplayMode] = useState("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
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

  const myQueueTickets = tickets.filter(ticket => ticket.assignedTo === user?.id);
  
  const userDepartment = departments.find(d => d.id === user?.department);
  const userTeamIds = userDepartment 
    ? [userDepartment.id, ...departments.filter(d => d.parentId === userDepartment.id).map(d => d.id)]
    : [];
  
  const teamQueueTickets = tickets.filter(ticket => {
    const isUnassigned = !ticket.assignedTo;
    const isInUserTeams = userTeamIds.includes(ticket.departmentId || "");
    return isUnassigned || isInUserTeams;
  });

  const rootDepartments = departments.filter(d => !d.parentId);
  const getSubTeams = (parentId: string) => departments.filter(d => d.parentId === parentId);

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

  const urgentCount = tickets.filter(t => t.priority === "urgent" || t.priority === "high").length;
  
  const openTicketsCount = tickets.filter(t => {
    const state = getState(t.stateId);
    return state && state.isFinal !== "true";
  }).length;

  const resolvedToday = tickets.filter(t => {
    const state = getState(t.stateId);
    if (!state || state.isFinal !== "true") return false;
    const today = new Date();
    const ticketDate = new Date(t.updatedAt || t.createdAt || "");
    return ticketDate.toDateString() === today.toDateString();
  }).length;

  const avgResponseTime = "2.4h";
  const slaComplianceRate = 94;

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

  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const getTeamIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("hardware")) return HardDrive;
    if (lowerName.includes("sys") || lowerName.includes("admin")) return Server;
    if (lowerName.includes("network") || lowerName.includes("security")) return Shield;
    if (lowerName.includes("helpdesk") || lowerName.includes("support")) return Headphones;
    return FolderTree;
  };

  const getTicketsForTeam = (teamId: string) => {
    const teamAndSubTeams = [teamId, ...getSubTeams(teamId).map(t => t.id)];
    return tickets.filter(t => teamAndSubTeams.includes(t.departmentId || ""));
  };

  const renderTicketTable = (ticketList: Ticket[], emptyMessage: string) => {
    if (ticketList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">{emptyMessage}</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Check back later or explore other queues</p>
        </div>
      );
    }

    if (displayMode === "card") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ticketList.map((ticket) => {
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
      );
    }

    return (
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
            {ticketList.map((ticket) => {
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
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/40 bg-gradient-to-br from-blue-500/5 to-blue-500/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TicketIcon className="w-4 h-4 text-blue-500" /> Open Tickets
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{openTicketsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total active tickets</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/40 bg-gradient-to-br from-red-500/5 to-red-500/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4" /> Urgent/High
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{urgentCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/40 bg-gradient-to-br from-green-500/5 to-green-500/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-4 h-4" /> Resolved Today
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{resolvedToday}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Closed within 24 hours</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/40 bg-gradient-to-br from-purple-500/5 to-purple-500/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-purple-500">
              <Timer className="w-4 h-4" /> Avg Response
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{avgResponseTime}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">First response time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              SLA Compliance
            </CardTitle>
            <CardDescription>Current performance against service level agreements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Compliance</span>
                <span className="font-semibold text-green-600">{slaComplianceRate}%</span>
              </div>
              <Progress value={slaComplianceRate} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 rounded-xl bg-secondary/20">
                <div className="text-2xl font-bold text-green-600">{tickets.filter(t => t.priority === "low").length}</div>
                <div className="text-xs text-muted-foreground mt-1">Low Priority</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/20">
                <div className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.priority === "medium").length}</div>
                <div className="text-xs text-muted-foreground mt-1">Medium Priority</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/20">
                <div className="text-2xl font-bold text-red-600">{tickets.filter(t => t.priority === "high" || t.priority === "urgent").length}</div>
                <div className="text-xs text-muted-foreground mt-1">High/Urgent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common helpdesk operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2 h-10">
              <Plus className="w-4 h-4" /> Create New Ticket
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-10" onClick={() => setActiveSection("my-queue")}>
              <User className="w-4 h-4" /> View My Queue ({myQueueTickets.length})
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-10" onClick={() => setActiveSection("team-queue")}>
              <UsersIcon className="w-4 h-4" /> View Team Queue ({teamQueueTickets.length})
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-10">
              <UserPlus className="w-4 h-4" /> Claim Unassigned
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest ticket updates across all queues</CardDescription>
        </CardHeader>
        <CardContent>
          {renderTicketTable(tickets.slice(0, 5), "No recent activity")}
        </CardContent>
      </Card>
    </div>
  );

  const renderMyQueue = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Queue</h2>
          <p className="text-sm text-muted-foreground">Tickets assigned directly to you</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            {myQueueTickets.length} ticket{myQueueTickets.length !== 1 ? "s" : ""}
          </Badge>
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
          </div>
        </div>
      </div>
      {renderTicketTable(myQueueTickets, "Your queue is empty")}
    </div>
  );

  const renderTeamQueue = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Queue</h2>
          <p className="text-sm text-muted-foreground">Unassigned tickets and tickets from your teams</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            {teamQueueTickets.length} ticket{teamQueueTickets.length !== 1 ? "s" : ""}
          </Badge>
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
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/40 bg-secondary/10 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Inbox className="w-4 h-4" /> Unassigned
            </CardDescription>
            <CardTitle className="text-2xl">{tickets.filter(t => !t.assignedTo).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/40 bg-secondary/10 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Play className="w-4 h-4" /> In Progress
            </CardDescription>
            <CardTitle className="text-2xl">
              {teamQueueTickets.filter(t => {
                const state = getState(t.stateId);
                return state?.name.toLowerCase().includes("progress");
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/40 bg-secondary/10 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> Urgent
            </CardDescription>
            <CardTitle className="text-2xl">
              {teamQueueTickets.filter(t => t.priority === "urgent").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {renderTicketTable(teamQueueTickets, "No tickets in team queue")}
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Teams</h2>
          <p className="text-sm text-muted-foreground">Browse tickets by department and sub-teams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {rootDepartments.map((dept) => {
              const subTeams = getSubTeams(dept.id);
              const hasSubTeams = subTeams.length > 0;
              const isExpanded = expandedTeams.has(dept.id);
              const DeptIcon = getTeamIcon(dept.name);
              const teamTickets = getTicketsForTeam(dept.id);

              return (
                <div key={dept.id} className="space-y-1">
                  <Collapsible open={isExpanded} onOpenChange={() => hasSubTeams && toggleTeamExpand(dept.id)}>
                    <div 
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors",
                        selectedTeamId === dept.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
                      )}
                      onClick={() => setSelectedTeamId(dept.id)}
                    >
                      {hasSubTeams && (
                        <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                      {!hasSubTeams && <div className="w-6" />}
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${dept.color}20` }}
                      >
                        <DeptIcon className="w-4 h-4" style={{ color: dept.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{dept.name}</div>
                        <div className="text-xs text-muted-foreground">{teamTickets.length} tickets</div>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="ml-6 pl-4 border-l border-border/50 space-y-1 mt-1">
                        {subTeams.map((subTeam) => {
                          const SubIcon = getTeamIcon(subTeam.name);
                          const subTickets = tickets.filter(t => t.departmentId === subTeam.id);
                          return (
                            <div 
                              key={subTeam.id}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors",
                                selectedTeamId === subTeam.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
                              )}
                              onClick={() => setSelectedTeamId(subTeam.id)}
                            >
                              <div 
                                className="w-7 h-7 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: `${subTeam.color}20` }}
                              >
                                <SubIcon className="w-3.5 h-3.5" style={{ color: subTeam.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{subTeam.name}</div>
                                <div className="text-xs text-muted-foreground">{subTickets.length} tickets</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
            
            {rootDepartments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderTree className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No teams configured</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="lg:col-span-3">
          {selectedTeamId ? (
            <div className="space-y-4">
              {(() => {
                const team = departments.find(d => d.id === selectedTeamId);
                const teamTickets = tickets.filter(t => t.departmentId === selectedTeamId);
                const TeamIcon = team ? getTeamIcon(team.name) : FolderTree;
                
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${team?.color || '#3b82f6'}20` }}
                        >
                          <TeamIcon className="w-5 h-5" style={{ color: team?.color || '#3b82f6' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{team?.name || "Select a team"}</h3>
                          <p className="text-sm text-muted-foreground">{teamTickets.length} tickets in this team</p>
                        </div>
                      </div>
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
                      </div>
                    </div>
                    {renderTicketTable(teamTickets, "No tickets in this team")}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <ArrowRight className="w-12 h-12 text-muted-foreground/20 mb-4 -rotate-180" />
              <h3 className="text-lg font-medium text-muted-foreground">Select a team</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Choose a team from the sidebar to view its tickets</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Helpdesk</h1>
            <p className="text-muted-foreground mt-1">Manage and route support tickets efficiently.</p>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as HelpdeskSection)} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto">
              <TabsTrigger 
                value="dashboard" 
                className="rounded-lg px-4 py-2 text-sm gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="my-queue" 
                className="rounded-lg px-4 py-2 text-sm gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <User className="w-4 h-4" /> My Queue
                {myQueueTickets.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{myQueueTickets.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="team-queue" 
                className="rounded-lg px-4 py-2 text-sm gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <UsersIcon className="w-4 h-4" /> Team Queue
                {teamQueueTickets.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{teamQueueTickets.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="teams" 
                className="rounded-lg px-4 py-2 text-sm gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FolderTree className="w-4 h-4" /> Teams
              </TabsTrigger>
            </TabsList>
          </div>

          {isLoadingTickets ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            </div>
          ) : (
            <>
              <TabsContent value="dashboard" className="mt-0">
                {renderDashboard()}
              </TabsContent>
              <TabsContent value="my-queue" className="mt-0">
                {renderMyQueue()}
              </TabsContent>
              <TabsContent value="team-queue" className="mt-0">
                {renderTeamQueue()}
              </TabsContent>
              <TabsContent value="teams" className="mt-0">
                {renderTeams()}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <TicketSidebarPanel
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onOpenFull={handleOpenFull}
      />
    </Layout>
  );
}