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
      <div key={dept.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group",
            isSelected
              ? "bg-primary/10 text-primary border border-primary/20"
              : "hover:bg-secondary/50 border border-transparent"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => handleDepartmentClick(dept)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(dept.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-5" />}
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: dept.color || "#6b7280" }}
          />
          <span className="text-sm font-medium truncate flex-1">{dept.name}</span>
          {ticketCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
              {ticketCount}
            </Badge>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {children.map((child) => renderDepartment(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r border-border bg-card/50 flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          Helpdesk
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10 px-3 rounded-lg font-medium",
              selectedView === "dashboard"
                ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "hover:bg-secondary/50"
            )}
            onClick={() => {
              onSelectView("dashboard");
              onSelectDepartment(null);
            }}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>

          <div className="pt-4 pb-2">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Departments
              </span>
            </div>
            <div className="space-y-0.5">
              {topLevelDepartments.map((dept) => renderDepartment(dept))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
