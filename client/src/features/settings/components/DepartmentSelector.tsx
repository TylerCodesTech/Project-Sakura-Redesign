import { Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { type Department } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DepartmentSelectorProps {
  departments: Department[];
  selectedDepartment: Department | null;
  onSelect: (department: Department) => void;
  loading?: boolean;
}

export function DepartmentSelector({
  departments,
  selectedDepartment,
  onSelect,
  loading,
}: DepartmentSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 min-w-[200px] justify-between"
          disabled={loading}
        >
          {selectedDepartment ? (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedDepartment.color }}
              />
              <span>{selectedDepartment.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>Select Department</span>
            </div>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {departments.map((dept) => (
          <DropdownMenuItem
            key={dept.id}
            onClick={() => onSelect(dept)}
            className={cn(
              "gap-2",
              selectedDepartment?.id === dept.id && "bg-secondary"
            )}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: dept.color }}
            />
            <span className="flex-1 truncate">{dept.name}</span>
            {selectedDepartment?.id === dept.id && (
              <Badge variant="secondary" className="text-[10px]">
                Active
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
        {departments.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No departments found
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
