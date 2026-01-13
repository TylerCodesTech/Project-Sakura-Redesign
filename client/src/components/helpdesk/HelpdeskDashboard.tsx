import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your helpdesk activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Total Tickets
            </CardDescription>
            <CardTitle className="text-3xl">{tickets.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              All tickets in the system
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-blue-600">
              <Clock className="w-4 h-4" />
              Open Tickets
            </CardDescription>
            <CardTitle className="text-3xl">{openTickets.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Awaiting resolution
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              Urgent/High Priority
            </CardDescription>
            <CardTitle className="text-3xl">{urgentTickets.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              Resolved Today
            </CardDescription>
            <CardTitle className="text-3xl">{resolvedToday.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Tickets closed today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Tickets
            </CardTitle>
            <CardDescription>Latest tickets submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                {recentTickets.map((ticket) => {
                  const dept = getDepartment(ticket.departmentId);
                  const assignee = getUser(ticket.assignedTo);
                  const state = getState(ticket.stateId);
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-secondary/20 cursor-pointer transition-all"
                      onClick={() => onTicketClick(ticket.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            #{ticket.id.substring(0, 8)}
                          </span>
                          {state && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 h-4"
                              style={{
                                backgroundColor: `${state.color}15`,
                                color: state.color,
                                borderColor: `${state.color}30`,
                              }}
                            >
                              {state.name}
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm font-medium truncate">{ticket.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          {dept && (
                            <Badge variant="secondary" className="text-[10px] py-0 h-4">
                              <div
                                className="w-1.5 h-1.5 rounded-full mr-1"
                                style={{ backgroundColor: dept.color }}
                              />
                              {dept.name}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {ticket.createdAt
                              ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={cn("border text-[10px]", getPriorityColor(ticket.priority))}>
                          {ticket.priority}
                        </Badge>
                        {assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              {assignee.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  );
                })}
                {recentTickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tickets yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Priority Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorityBreakdown.map((priority) => (
                  <div key={priority.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{priority.label}</span>
                      <span className="font-medium">{priority.count}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", priority.color)}
                        style={{
                          width: totalPriorityCount > 0 ? `${(priority.count / totalPriorityCount) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                By Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[140px]">
                <div className="space-y-2">
                  {ticketsByDepartment.slice(0, 5).map(({ department, count, openCount }) => (
                    <div
                      key={department.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: department.color || "#6b7280" }}
                        />
                        <span className="text-sm truncate max-w-[120px]">{department.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {count} total
                        </Badge>
                        {openCount > 0 && (
                          <Badge variant="outline" className="text-[10px] h-5 text-blue-600 border-blue-200">
                            {openCount} open
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {ticketsByDepartment.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No department data
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
