import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
} from "lucide-react";
import { type Ticket as TicketType, type Department, type User, type SlaState } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface HelpdeskDashboardProps {
  tickets: TicketType[];
  departments: Department[];
  users: User[];
  slaStates: SlaState[];
  onTicketClick: (ticketId: string) => void;
}

export function HelpdeskDashboard({
  tickets,
  departments,
  users,
  slaStates,
  onTicketClick,
}: HelpdeskDashboardProps) {
  const getState = (stateId: string | null) => slaStates.find((s) => s.id === stateId);
  const getUser = (userId: string | null | undefined) => users.find((u) => u.id === userId);
  const getDepartment = (departmentId: string | null) => departments.find((d) => d.id === departmentId);

  const openTickets = tickets.filter((t) => {
    const state = getState(t.stateId);
    return state && state.isFinal !== "true";
  });

  const urgentTickets = tickets.filter(
    (t) => t.priority === "urgent" || t.priority === "high"
  );

  const resolvedToday = tickets.filter((t) => {
    const state = getState(t.stateId);
    if (!state || state.isFinal !== "true") return false;
    const updatedAt = t.updatedAt ? new Date(t.updatedAt) : null;
    if (!updatedAt) return false;
    const today = new Date();
    return (
      updatedAt.getDate() === today.getDate() &&
      updatedAt.getMonth() === today.getMonth() &&
      updatedAt.getFullYear() === today.getFullYear()
    );
  });

  const recentTickets = [...tickets]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "high":
        return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "low":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const ticketsByDepartment = departments.map((dept) => ({
    department: dept,
    count: tickets.filter((t) => t.departmentId === dept.id).length,
    openCount: openTickets.filter((t) => t.departmentId === dept.id).length,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);

  const priorityBreakdown = [
    { label: "Urgent", count: tickets.filter((t) => t.priority === "urgent").length, color: "bg-red-500" },
    { label: "High", count: tickets.filter((t) => t.priority === "high").length, color: "bg-orange-500" },
    { label: "Medium", count: tickets.filter((t) => t.priority === "medium").length, color: "bg-yellow-500" },
    { label: "Low", count: tickets.filter((t) => t.priority === "low").length, color: "bg-green-500" },
  ];

  const totalPriorityCount = priorityBreakdown.reduce((acc, p) => acc + p.count, 0);

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-background/50 via-background/80 to-secondary/10 min-h-full">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Comprehensive overview of your helpdesk performance</p>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group relative overflow-hidden bg-background/80 backdrop-blur-sm border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="flex items-center gap-3 text-blue-600 font-medium">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
              Total Tickets
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
              {tickets.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              All tickets in the system
            </p>
            <div className="mt-2 text-xs text-blue-600 font-medium">
              +{tickets.filter(t => {
                const created = t.createdAt ? new Date(t.createdAt) : null;
                const today = new Date();
                return created && 
                  created.getDate() === today.getDate() &&
                  created.getMonth() === today.getMonth() &&
                  created.getFullYear() === today.getFullYear();
              }).length} today
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-background/80 backdrop-blur-sm border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="flex items-center gap-3 text-orange-600 font-medium">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              Open Tickets
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
              {openTickets.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Awaiting resolution
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center text-xs text-orange-600 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                {Math.round((openTickets.length / Math.max(tickets.length, 1)) * 100)}% of total
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-background/80 backdrop-blur-sm border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="flex items-center gap-3 text-red-600 font-medium">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              High Priority
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-foreground group-hover:text-red-600 transition-colors">
              {urgentTickets.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Requires immediate attention
            </p>
            <div className="mt-2 text-xs text-red-600 font-medium">
              {urgentTickets.filter(t => {
                const state = getState(t.stateId);
                return state && state.isFinal !== "true";
              }).length} still open
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-background/80 backdrop-blur-sm border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="flex items-center gap-3 text-emerald-600 font-medium">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              Resolved Today
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">
              {resolvedToday.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Tickets closed today
            </p>
            <div className="mt-2 text-xs text-emerald-600 font-medium">
              Great progress!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Tickets - Enhanced */}
        <Card className="lg:col-span-8 bg-background/80 backdrop-blur-sm border-border/40 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">Recent Tickets</CardTitle>
                  <CardDescription>Latest tickets submitted to the system</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="px-3 py-1 rounded-xl">
                {recentTickets.length} tickets
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recentTickets.map((ticket, index) => {
                  const dept = getDepartment(ticket.departmentId);
                  const assignee = getUser(ticket.assignedTo);
                  const state = getState(ticket.stateId);
                  return (
                    <div
                      key={ticket.id}
                      className="group flex items-start gap-4 p-4 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-secondary/20 cursor-pointer transition-all duration-200"
                      onClick={() => onTicketClick(ticket.id)}
                    >
                      <div className="flex-shrink-0">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/20"
                          style={{
                            background: dept?.color ? `linear-gradient(135deg, ${dept.color}20, ${dept.color}10)` : 'linear-gradient(135deg, #6b728020, #6b728010)',
                            borderColor: dept?.color ? `${dept.color}30` : '#6b728030'
                          }}
                        >
                          <Ticket className="w-5 h-5" style={{ color: dept?.color || '#6b7280' }} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="font-mono text-xs px-2 py-1 rounded-lg">
                            #{ticket.id.substring(0, 8)}
                          </Badge>
                          {state && (
                            <Badge
                              className="text-xs px-2 py-1 rounded-lg font-medium"
                              style={{
                                backgroundColor: `${state.color}15`,
                                color: state.color,
                                borderColor: `${state.color}30`
                              }}
                            >
                              {state.name}
                            </Badge>
                          )}
                          <Badge className={cn("text-xs px-2 py-1 rounded-lg capitalize", getPriorityColor(ticket.priority))}>
                            {ticket.priority}
                          </Badge>
                        </div>

                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {ticket.title}
                        </h4>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {dept && (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: dept.color }} 
                              />
                              <span>{dept.name}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                          </div>

                          {assignee && (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-[10px]">
                                  {assignee.username.substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{assignee.username}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                          <Activity className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {recentTickets.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">No recent tickets to display</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Department Analytics and Priority Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Priority Breakdown */}
          <Card className="bg-background/80 backdrop-blur-sm border-border/40 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Priority Distribution</CardTitle>
                  <CardDescription>Breakdown by ticket priority</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {priorityBreakdown.map((priority) => (
                <div key={priority.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: priority.color === 'bg-red-500' ? '#ef4444' : 
                                          priority.color === 'bg-orange-500' ? '#f97316' : 
                                          priority.color === 'bg-yellow-500' ? '#eab308' : 
                                          priority.color === 'bg-green-500' ? '#22c55e' : '#6b7280' 
                        }}
                      />
                      <span className="font-medium">{priority.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{priority.count}</span>
                      <span className="text-xs">
                        ({totalPriorityCount > 0 ? Math.round((priority.count / totalPriorityCount) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary/30 rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full transition-all duration-500", priority.color)}
                      style={{
                        width: totalPriorityCount > 0 
                          ? `${(priority.count / totalPriorityCount) * 100}%` 
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Departments */}
          <Card className="bg-background/80 backdrop-blur-sm border-border/40 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Department Activity</CardTitle>
                  <CardDescription>Most active departments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px] pr-4">
                <div className="space-y-4">
                  {ticketsByDepartment.slice(0, 6).map((dept, index) => (
                    <div key={dept.department.id} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/30 transition-all">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                          style={{ backgroundColor: dept.department.color }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">
                            {dept.department.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{dept.count} total</span>
                            <span>•</span>
                            <span className="text-orange-600 font-medium">{dept.openCount} open</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {dept.count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((dept.count / Math.max(tickets.length, 1)) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}

                  {ticketsByDepartment.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground text-sm">No department data available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-background/80 backdrop-blur-sm border-border/40 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Response Time</CardTitle>
                <CardDescription className="text-xs">Average first response</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">2.4 hours</div>
            <div className="text-xs text-green-600 font-medium">↓ 15% from last week</div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/40 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Customer Satisfaction</CardTitle>
                <CardDescription className="text-xs">Average rating</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">4.2 / 5</div>
            <div className="text-xs text-green-600 font-medium">↑ 3% from last month</div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/40 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base">Resolution Rate</CardTitle>
                <CardDescription className="text-xs">Tickets resolved</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">94%</div>
            <div className="text-xs text-green-600 font-medium">↑ 2% from last week</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
