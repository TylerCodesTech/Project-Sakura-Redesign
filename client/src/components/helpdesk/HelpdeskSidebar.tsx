import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Building2,
  ChevronRight,
  ChevronDown,
  Ticket,
  BarChart3,
} from "lucide-react";
import { type Department, type DepartmentHierarchy, type Ticket as TicketType } from "@shared/schema";

interface HelpdeskSidebarProps {
  departments: Department[];
  hierarchy: DepartmentHierarchy[];
  tickets: TicketType[];
  selectedView: string;
  onSelectView: (view: string) => void;
  selectedDepartmentId: string | null;
  onSelectDepartment: (departmentId: string | null) => void;
}

export function HelpdeskSidebar({
  departments,
  hierarchy,
  tickets,
  selectedView,
  onSelectView,
  selectedDepartmentId,
  onSelectDepartment,
}: HelpdeskSidebarProps) {
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  const isTopLevelDepartment = (deptId: string) => {
    return !hierarchy.some((h) => h.childDepartmentId === deptId);
  };

  const getChildDepartments = (parentId: string) => {
    const childIds = hierarchy
      .filter((h) => h.parentDepartmentId === parentId)
      .map((h) => h.childDepartmentId);
    return departments.filter((d) => childIds.includes(d.id));
  };

  const getTicketCount = (departmentId: string): number => {
    const directCount = tickets.filter((t) => t.departmentId === departmentId).length;
    const children = getChildDepartments(departmentId);
    const childCount = children.reduce((acc, child) => acc + getTicketCount(child.id), 0);
    return directCount + childCount;
  };

  const topLevelDepartments = departments.filter((d) => isTopLevelDepartment(d.id));

  const toggleExpanded = (deptId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepartments(newExpanded);
  };

  const handleDepartmentClick = (dept: Department) => {
    if (selectedView !== "department") {
      onSelectView("department");
    }
    onSelectDepartment(dept.id);
  };

  const renderDepartment = (dept: Department, level: number = 0) => {
    const children = getChildDepartments(dept.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedDepartments.has(dept.id);
    const isSelected = selectedView === "department" && selectedDepartmentId === dept.id;
    const ticketCount = getTicketCount(dept.id);

    return (
      <div key={dept.id} className="space-y-1">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 group",
            isSelected
              ? "bg-primary/10 text-primary border border-primary/20 shadow-md"
              : "hover:bg-secondary/50 border border-transparent text-foreground",
            level > 0 && "ml-4"
          )}
          onClick={() => handleDepartmentClick(dept)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-transparent rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(dept.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-3 h-3 rounded-full shadow-sm border border-white/20 flex-shrink-0"
              style={{ backgroundColor: dept.color || "#6b7280" }}
            />
            <span className="font-medium truncate text-sm">{dept.name}</span>
          </div>

          {ticketCount > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                "h-6 px-2 text-xs font-semibold rounded-xl",
                isSelected 
                  ? "bg-primary/20 text-primary border-primary/30" 
                  : "bg-background/80 text-foreground"
              )}
            >
              {ticketCount}
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1 pl-4">
            {children.map((child) => renderDepartment(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 border-r border-border/30 bg-background/95 backdrop-blur-xl flex flex-col h-full shadow-lg">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-border/30 bg-gradient-to-r from-background/80 to-secondary/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-foreground">Helpdesk</h2>
            <p className="text-sm text-muted-foreground">Support & Tickets</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Dashboard Navigation */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-4 h-14 px-4 rounded-2xl font-medium text-left transition-all duration-200",
                selectedView === "dashboard"
                  ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-md border border-primary/20"
                  : "hover:bg-secondary/60 text-foreground"
              )}
              onClick={() => {
                onSelectView("dashboard");
                onSelectDepartment(null);
              }}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                selectedView === "dashboard" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-secondary/40 text-muted-foreground"
              )}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Dashboard</div>
                <div className="text-xs text-muted-foreground">Overview & Analytics</div>
              </div>
            </Button>
          </div>

          {/* Departments Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="font-semibold text-foreground">Departments</span>
                <p className="text-xs text-muted-foreground">Browse by department</p>
              </div>
            </div>

            <div className="space-y-2">
              {topLevelDepartments.map((dept) => renderDepartment(dept))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-2xl p-4 border border-border/40">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-primary" />
              </div>
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tickets</span>
                <Badge variant="secondary" className="bg-background/80 font-semibold">
                  {tickets.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Open Tickets</span>
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 font-semibold">
                  {tickets.filter(t => {
                    // This is a simplified check - you might want to use your SLA states here
                    return !t.stateId || t.stateId !== "closed";
                  }).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">My Dept</span>
                <Badge className="bg-primary/10 text-primary border-primary/30 font-semibold">
                  {selectedView === "department" && selectedDepartmentId
                    ? getTicketCount(selectedDepartmentId)
                    : 0}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
