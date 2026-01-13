import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Filter, 
  MoreHorizontal, 
  LayoutList,
  LayoutGrid,
  Columns as ColumnsIcon,
  Calendar,
  MessageCircle,
  Plus,
  Loader2,
  Eye,
  ExternalLink,
  Search,
  SortAsc,
  SortDesc,
  RefreshCw,
  Settings,
  Bell,
  Zap,
  TrendingUp,
  Users2,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Ticket, type Department, type User as UserType, type SlaState, type Helpdesk as HelpdeskType, type DepartmentHierarchy } from "@shared/schema";
import { TicketSidebarPanel } from "@/components/tickets/TicketSidebarPanel";
import { HelpdeskSidebar } from "@/components/helpdesk/HelpdeskSidebar";
import { HelpdeskDashboard } from "@/components/helpdesk/HelpdeskDashboard";
import { QuickTicketModal } from "@/components/helpdesk/QuickTicketModal";
import { TicketDrawer } from "@/components/helpdesk/TicketDrawer";
import { TicketSearchCommand } from "@/components/helpdesk/TicketSearchCommand";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function Helpdesk() {
  const [selectedView, setSelectedView] = useState("dashboard");
  const [displayMode, setDisplayMode] = useState("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [isQuickTicketOpen, setIsQuickTicketOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [drawerTicketId, setDrawerTicketId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"created" | "updated" | "priority">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterText, setFilterText] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const { data: departmentHierarchy = [] } = useQuery<DepartmentHierarchy[]>({
    queryKey: ["/api/department-hierarchy"],
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

  const getDepartment = (departmentId: string | null) => 
    departments.find(d => d.id === departmentId);

  const getUser = (userId: string | null | undefined) => 
    users.find(u => u.id === userId);

  const openTickets = tickets.filter((t) => {
    const state = getState(t.stateId);
    return state && state.isFinal !== "true";
  });

  const urgentTickets = tickets.filter(
    (t) => t.priority === "urgent" || t.priority === "high"
  );

  const getChildDepartmentIds = (parentId: string): string[] => {
    const directChildren = departmentHierarchy
      .filter((h) => h.parentDepartmentId === parentId)
      .map((h) => h.childDepartmentId);

    const allDescendants: string[] = [...directChildren];
    directChildren.forEach((childId) => {
      allDescendants.push(...getChildDepartmentIds(childId));
    });

    return allDescendants;
  };

  const filteredTickets = tickets.filter(ticket => {
    // Department filter
    let departmentMatch = true;
    if (selectedView === "department" && selectedDepartmentId) {
      const childIds = getChildDepartmentIds(selectedDepartmentId);
      const relevantDeptIds = [selectedDepartmentId, ...childIds];
      departmentMatch = relevantDeptIds.includes(ticket.departmentId || "");
    }

    // Text filter
    let textMatch = true;
    if (filterText.trim()) {
      const searchText = filterText.toLowerCase();
      textMatch = 
        ticket.title.toLowerCase().includes(searchText) ||
        ticket.id.toLowerCase().includes(searchText) ||
        Boolean(ticket.description && ticket.description.toLowerCase().includes(searchText));
    }

    return departmentMatch && textMatch;
  }).sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "created":
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case "updated":
        const updatedA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const updatedB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = updatedA - updatedB;
        break;
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                    (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
        break;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  const kanbanColumns = ["Open", "In Progress", "Pending", "Resolved", "Closed"];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "low": return "bg-green-500/10 text-green-600 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTicketClick = (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const selectedDepartment = selectedDepartmentId ? getDepartment(selectedDepartmentId) : null;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
  };

  const handleSort = (field: "created" | "updated" | "priority") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const SortButton = ({ field, children }: { field: "created" | "updated" | "priority", children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-xs"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortBy === field && (
        sortOrder === "asc" ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
      )}
    </Button>
  );

  return (
    <Layout>
      <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-background via-background/95 to-secondary/10">
        <HelpdeskSidebar
          departments={departments}
          hierarchy={departmentHierarchy}
          tickets={tickets}
          selectedView={selectedView}
          onSelectView={setSelectedView}
          selectedDepartmentId={selectedDepartmentId}
          onSelectDepartment={setSelectedDepartmentId}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedView === "dashboard" ? (
            <ScrollArea className="h-full">
              <HelpdeskDashboard
                tickets={tickets}
                departments={departments}
                users={users}
                slaStates={allSlaStates}
                onTicketClick={handleTicketClick}
              />
            </ScrollArea>
          ) : (
            <>
              {/* Modern Header with Glassmorphism Effect */}
              <div className="flex-shrink-0 border-b border-border/30 bg-background/80 backdrop-blur-xl">
                <div className="px-8 py-6">
                  {/* Title Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {selectedDepartment ? (
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div
                              className="w-12 h-12 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center"
                              style={{ 
                                background: `linear-gradient(135deg, ${selectedDepartment.color}20, ${selectedDepartment.color}10)`,
                                borderColor: `${selectedDepartment.color}30`
                              }}
                            >
                              <div
                                className="w-6 h-6 rounded-lg"
                                style={{ backgroundColor: selectedDepartment.color }}
                              />
                            </div>
                          </div>
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                              {selectedDepartment.name}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4" />
                                {filteredTickets.length} total tickets
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-blue-500" />
                                {openTickets.filter(t => {
                                  const childIds = getChildDepartmentIds(selectedDepartmentId!);
                                  const relevantDeptIds = [selectedDepartmentId!, ...childIds];
                                  return relevantDeptIds.includes(t.departmentId || "");
                                }).length} open
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-red-500" />
                                {urgentTickets.filter(t => {
                                  const childIds = getChildDepartmentIds(selectedDepartmentId!);
                                  const relevantDeptIds = [selectedDepartmentId!, ...childIds];
                                  return relevantDeptIds.includes(t.departmentId || "");
                                }).length} urgent
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight text-foreground">All Tickets</h1>
                          <p className="text-sm text-muted-foreground mt-1">Manage all tickets across departments</p>
                        </div>
                      )}
                    </div>

                    <Button 
                      size="lg"
                      className="h-12 px-8 rounded-2xl gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/20 border border-primary/20"
                      onClick={() => setIsQuickTicketOpen(true)}
                    >
                      <Plus className="w-5 h-5" />
                      New Ticket
                      <Sparkles className="w-4 h-4 ml-1 opacity-70" />
                    </Button>
                  </div>

                  {/* Controls Section */}
                  <div className="flex items-center justify-between">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-6">
                      <div className="bg-secondary/40 backdrop-blur-sm p-1.5 rounded-2xl flex items-center gap-2 border border-border/40 shadow-sm">
                        <Button 
                          variant={displayMode === "list" ? "default" : "ghost"} 
                          size="sm" 
                          className="rounded-xl h-10 px-4 font-medium shadow-sm"
                          onClick={() => setDisplayMode("list")}
                        >
                          <LayoutList className="w-4 h-4 mr-2" />
                          List
                        </Button>
                        <Button 
                          variant={displayMode === "card" ? "default" : "ghost"} 
                          size="sm" 
                          className="rounded-xl h-10 px-4 font-medium shadow-sm"
                          onClick={() => setDisplayMode("card")}
                        >
                          <LayoutGrid className="w-4 h-4 mr-2" />
                          Cards
                        </Button>
                        <Button 
                          variant={displayMode === "kanban" ? "default" : "ghost"} 
                          size="sm" 
                          className="rounded-xl h-10 px-4 font-medium shadow-sm"
                          onClick={() => setDisplayMode("kanban")}
                        >
                          <ColumnsIcon className="w-4 h-4 mr-2" />
                          Board
                        </Button>
                      </div>
                    </div>

                    {/* Search and Actions */}
                    <div className="flex items-center gap-3">
                      {/* Quick Search */}
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="Filter tickets..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          className="pl-11 w-72 h-12 rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm focus:bg-background shadow-sm font-medium placeholder:font-normal"
                        />
                        {filterText && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg"
                            onClick={() => setFilterText("")}
                          >
                            ×
                          </Button>
                        )}
                      </div>

                      {/* Advanced Search */}
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="h-12 px-6 rounded-2xl gap-3 border-border/40 bg-background/60 backdrop-blur-sm hover:bg-secondary/50 shadow-sm font-medium"
                        onClick={() => setIsSearchOpen(true)}
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Search
                        <kbd className="bg-secondary/80 px-2 py-0.5 rounded text-xs font-mono ml-2">⌘K</kbd>
                      </Button>

                      {/* Sort & Filter Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="h-12 px-6 rounded-2xl gap-3 border-border/40 bg-background/60 backdrop-blur-sm hover:bg-secondary/50 shadow-sm font-medium"
                          >
                            <Filter className="w-4 h-4" />
                            Sort & Filter
                            <ArrowUpRight className="w-3 h-3 ml-1 opacity-60" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-xl">
                          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Sort Options</DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="rounded-xl px-3 py-3 cursor-pointer"
                            onClick={() => handleSort("created")}
                          >
                            <Calendar className="w-4 h-4 mr-3" />
                            <span className="font-medium">Created Date</span>
                            <div className="ml-auto">
                              {sortBy === "created" && (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="rounded-xl px-3 py-3 cursor-pointer"
                            onClick={() => handleSort("updated")}
                          >
                            <RefreshCw className="w-4 h-4 mr-3" />
                            <span className="font-medium">Last Updated</span>
                            <div className="ml-auto">
                              {sortBy === "updated" && (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="rounded-xl px-3 py-3 cursor-pointer"
                            onClick={() => handleSort("priority")}
                          >
                            <Zap className="w-4 h-4 mr-3" />
                            <span className="font-medium">Priority</span>
                            <div className="ml-auto">
                              {sortBy === "priority" && (sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Refresh */}
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="h-12 w-12 p-0 rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm hover:bg-secondary/50 shadow-sm"
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <ScrollArea className="flex-1 bg-background/20">
                <div className="p-8">
                  {isLoadingTickets ? (
                    <div className="flex items-center justify-center py-32">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary/60 mx-auto" />
                        <p className="text-muted-foreground font-medium">Loading tickets...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {displayMode === "list" && (
                        <div className="bg-background/80 backdrop-blur-xl rounded-3xl border border-border/30 shadow-xl overflow-hidden">
                          <Table>
                            <TableHeader className="bg-secondary/20 backdrop-blur-sm">
                              <TableRow className="hover:bg-transparent border-b border-border/30">
                                <TableHead className="w-[140px] py-6 px-8 font-semibold text-foreground">Ticket</TableHead>
                                <TableHead className="font-semibold text-foreground">Subject & Department</TableHead>
                                <TableHead className="font-semibold text-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-foreground">Priority</TableHead>
                                <TableHead className="font-semibold text-foreground">Assignee</TableHead>
                                <TableHead className="text-right pr-8 font-semibold text-foreground">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredTickets.map((ticket, index) => {
                                const department = getDepartment(ticket.departmentId);
                                const assignee = getUser(ticket.assignedTo);
                                return (
                                  <TableRow 
                                    key={ticket.id} 
                                    className={cn(
                                      "hover:bg-secondary/20 cursor-pointer group border-b border-border/20 transition-all duration-200",
                                      index % 2 === 0 ? "bg-background/40" : "bg-background/20"
                                    )}
                                    onClick={(e) => handleTicketClick(ticket.id, e)}
                                    onDoubleClick={(e) => handleTicketDoubleClick(ticket.id, e)}
                                  >
                                    <TableCell className="px-8 py-6">
                                      <div className="font-mono text-sm text-muted-foreground bg-secondary/40 px-3 py-2 rounded-lg w-fit">
                                        #{ticket.id.substring(0, 8)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                      <div className="space-y-2">
                                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                                          {ticket.title}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {department && (
                                            <Badge 
                                              variant="outline" 
                                              className="font-normal border-border/60 bg-background/60"
                                            >
                                              <div 
                                                className="w-2 h-2 rounded-full mr-2" 
                                                style={{ backgroundColor: department.color }} 
                                              />
                                              {department.name}
                                            </Badge>
                                          )}
                                          <span className="text-xs text-muted-foreground">
                                            {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "Unknown"}
                                          </span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                      {(() => {
                                        const state = getState(ticket.stateId);
                                        return state ? (
                                          <Badge
                                            className="font-medium px-3 py-1.5 rounded-xl shadow-sm"
                                            style={{ 
                                              backgroundColor: `${state.color}15`, 
                                              color: state.color,
                                              borderColor: `${state.color}30`
                                            }}
                                          >
                                            {state.name}
                                          </Badge>
                                        ) : (
                                          <Badge variant="secondary" className="font-medium px-3 py-1.5 rounded-xl">
                                            Unknown
                                          </Badge>
                                        );
                                      })()}
                                    </TableCell>
                                    <TableCell className="py-6">
                                      <Badge className={cn("border capitalize font-medium px-3 py-1.5 rounded-xl shadow-sm", getPriorityColor(ticket.priority))}>
                                        {ticket.priority}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-6">
                                      {assignee ? (
                                        <div className="flex items-center gap-3">
                                          <Avatar className="w-8 h-8 border border-border/40 shadow-sm">
                                            <AvatarFallback className="text-xs font-medium">
                                              {assignee.username.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="font-medium text-foreground">{assignee.username}</span>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground/60 font-medium">Unassigned</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right pr-8 py-6">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-10 w-10 rounded-xl hover:bg-secondary/60 transition-all duration-200"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MoreHorizontal className="w-5 h-5" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-xl">
                                          <DropdownMenuItem 
                                            className="rounded-xl px-4 py-3 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); handleTicketClick(ticket.id, e); }}
                                          >
                                            <Eye className="w-4 h-4 mr-3" /> 
                                            Quick View
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            className="rounded-xl px-4 py-3 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); handleOpenFull(ticket.id); }}
                                          >
                                            <ExternalLink className="w-4 h-4 mr-3" /> 
                                            Open Full View
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              {filteredTickets.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-16">
                                    <div className="text-center space-y-4">
                                      <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto">
                                        <Search className="w-8 h-8 text-muted-foreground/60" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-foreground mb-2">No tickets found</p>
                                        <p className="text-muted-foreground text-sm">Try adjusting your search criteria or create a new ticket.</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {displayMode === "card" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                          {filteredTickets.map((ticket) => {
                            const department = getDepartment(ticket.departmentId);
                            const assignee = getUser(ticket.assignedTo);
                            const state = getState(ticket.stateId);
                            return (
                              <Card 
                                key={ticket.id} 
                                className="group hover:border-primary/30 transition-all duration-300 cursor-pointer bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-primary/10 border-border/40 rounded-3xl overflow-hidden"
                                onClick={(e) => handleTicketClick(ticket.id, e)}
                                onDoubleClick={(e) => handleTicketDoubleClick(ticket.id, e)}
                              >
                                <CardHeader className="pb-4 pt-6">
                                  <div className="flex justify-between items-start mb-3">
                                    <Badge variant="secondary" className="font-mono text-xs bg-secondary/60 text-foreground px-3 py-1 rounded-xl">
                                      #{ticket.id.substring(0, 8)}
                                    </Badge>
                                    {state && (
                                      <Badge 
                                        className="font-medium px-3 py-1 rounded-xl shadow-sm"
                                        style={{ 
                                          backgroundColor: `${state.color}15`, 
                                          color: state.color,
                                          borderColor: `${state.color}30`
                                        }}
                                      >
                                        {state.name}
                                      </Badge>
                                    )}
                                  </div>
                                  <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight line-clamp-2 mb-2">
                                    {ticket.title}
                                  </CardTitle>
                                  <CardDescription className="text-sm flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-4 h-4" /> 
                                    {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "Unknown"}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pb-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {department && (
                                        <Badge 
                                          variant="outline" 
                                          className="font-normal border-border/60 bg-background/80"
                                        >
                                          <div 
                                            className="w-2 h-2 rounded-full mr-2" 
                                            style={{ backgroundColor: department.color }} 
                                          />
                                          {department.name}
                                        </Badge>
                                      )}
                                    </div>
                                    <Badge className={cn("capitalize font-medium px-3 py-1 rounded-xl shadow-sm", getPriorityColor(ticket.priority))}>
                                      {ticket.priority}
                                    </Badge>
                                  </div>

                                  <div className="pt-4 flex items-center justify-between border-t border-border/30">
                                    <div className="flex items-center gap-3">
                                      {assignee ? (
                                        <>
                                          <Avatar className="h-8 w-8 border border-border/40 shadow-sm">
                                            <AvatarFallback className="text-xs font-medium bg-secondary/60">
                                              {assignee.username.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <span className="text-sm font-medium text-foreground">
                                              {assignee.username}
                                            </span>
                                            <p className="text-xs text-muted-foreground">Assigned</p>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-full bg-secondary/40 border border-dashed border-border/60 flex items-center justify-center">
                                            <Users2 className="w-4 h-4 text-muted-foreground/60" />
                                          </div>
                                          <div>
                                            <span className="text-sm font-medium text-muted-foreground/60">Unassigned</span>
                                            <p className="text-xs text-muted-foreground">Available</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 text-muted-foreground">
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <MessageCircle className="w-3.5 h-3.5" /> 
                                        <span>0</span>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-xl hover:bg-secondary/60 opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MoreHorizontal className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-xl">
                                          <DropdownMenuItem 
                                            className="rounded-xl px-4 py-3 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); handleTicketClick(ticket.id, e); }}
                                          >
                                            <Eye className="w-4 h-4 mr-3" /> Quick View
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            className="rounded-xl px-4 py-3 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); handleOpenFull(ticket.id); }}
                                          >
                                            <ExternalLink className="w-4 h-4 mr-3" /> Open Full View
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                          {filteredTickets.length === 0 && (
                            <div className="col-span-full text-center py-16">
                              <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-secondary/20 rounded-3xl flex items-center justify-center mx-auto">
                                  <LayoutGrid className="w-10 h-10 text-muted-foreground/60" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground mb-2">No tickets found</p>
                                  <p className="text-muted-foreground text-sm">Try adjusting your search criteria or create a new ticket.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {displayMode === "kanban" && (
                        <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px]">
                          {kanbanColumns.map((col) => {
                            const colTickets = filteredTickets.filter(t => {
                              const state = getState(t.stateId);
                              return state?.name.toLowerCase() === col.toLowerCase();
                            });

                            const getColumnColor = (columnName: string) => {
                              switch (columnName.toLowerCase()) {
                                case "open": return "from-blue-500/10 to-blue-600/5 border-blue-500/20";
                                case "in progress": return "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20";
                                case "pending": return "from-orange-500/10 to-orange-600/5 border-orange-500/20";
                                case "resolved": return "from-green-500/10 to-green-600/5 border-green-500/20";
                                case "closed": return "from-gray-500/10 to-gray-600/5 border-gray-500/20";
                                default: return "from-secondary/20 to-secondary/10 border-border/30";
                              }
                            };

                            return (
                              <div key={col} className="flex-1 min-w-[320px] max-w-[380px] flex flex-col gap-4">
                                <div className="flex items-center justify-between px-4">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">{col}</h3>
                                    <Badge variant="secondary" className="h-6 px-3 text-sm font-medium bg-secondary/60">
                                      {colTickets.length}
                                    </Badge>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-xl hover:bg-secondary/60"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>

                                <ScrollArea className={cn("flex-1 bg-gradient-to-br border rounded-3xl p-4 min-h-[500px]", getColumnColor(col))}>
                                  <div className="flex flex-col gap-4">
                                    {colTickets.map((ticket) => {
                                      const department = getDepartment(ticket.departmentId);
                                      const assignee = getUser(ticket.assignedTo);
                                      return (
                                        <Card 
                                          key={ticket.id} 
                                          className="shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer bg-background/90 backdrop-blur-sm border-border/40 rounded-2xl"
                                          onClick={(e) => handleTicketClick(ticket.id, e)}
                                          onDoubleClick={(e) => handleTicketDoubleClick(ticket.id, e)}
                                        >
                                          <CardHeader className="p-4 pb-3">
                                            <div className="flex justify-between items-start mb-3">
                                              <Badge variant="secondary" className="text-xs font-mono bg-secondary/60 px-2 py-1 rounded-lg">
                                                #{ticket.id.substring(0, 8)}
                                              </Badge>
                                              <Badge className={cn("text-xs py-1 px-2 rounded-lg shadow-sm", getPriorityColor(ticket.priority))}>
                                                {ticket.priority}
                                              </Badge>
                                            </div>
                                            <h4 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                                              {ticket.title}
                                            </h4>
                                          </CardHeader>
                                          <CardContent className="p-4 pt-0">
                                            {department && (
                                              <Badge 
                                                variant="outline" 
                                                className="text-xs mb-3 bg-background/80 border-border/60"
                                              >
                                                <div 
                                                  className="w-2 h-2 rounded-full mr-2" 
                                                  style={{ backgroundColor: department.color }} 
                                                />
                                                {department.name}
                                              </Badge>
                                            )}

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                                              <div className="flex items-center gap-2">
                                                {assignee ? (
                                                  <>
                                                    <Avatar className="h-6 w-6 border border-border/40">
                                                      <AvatarFallback className="text-[10px] font-medium">
                                                        {assignee.username.substring(0, 2).toUpperCase()}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-medium text-foreground">
                                                      {assignee.username}
                                                    </span>
                                                  </>
                                                ) : (
                                                  <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-secondary/40 border border-dashed border-border/60 flex items-center justify-center">
                                                      <Users2 className="w-3 h-3 text-muted-foreground/60" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground/60">Unassigned</span>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="flex items-center gap-1 text-xs">
                                                  <MessageCircle className="w-3 h-3" /> 
                                                  <span>0</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                  <Clock className="w-3 h-3" /> 
                                                  <span>{ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }).replace(' ago', '') : '?'}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      );
                                    })}

                                    {colTickets.length === 0 && (
                                      <div className="text-center py-8 text-muted-foreground/60">
                                        <ColumnsIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">No tickets in {col.toLowerCase()}</p>
                                      </div>
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <TicketSidebarPanel
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onOpenFull={handleOpenFull}
        />

        <TicketDrawer
          ticketId={drawerTicketId}
          open={!!drawerTicketId}
          onOpenChange={(open) => !open && setDrawerTicketId(null)}
        />
      </div>

      <QuickTicketModal
        open={isQuickTicketOpen}
        onOpenChange={setIsQuickTicketOpen}
        onSuccess={(ticketId: string) => {
          // Optional: Auto-open the created ticket
          setSelectedTicketId(ticketId);
        }}
      />

      <TicketSearchCommand
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectTicket={(ticketId) => {
          setSelectedTicketId(ticketId);
        }}
      />
    </Layout>
  );
}
