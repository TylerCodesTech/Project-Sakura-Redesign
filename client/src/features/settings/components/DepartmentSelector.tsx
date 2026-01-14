import { Building2, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { type Department } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DepartmentSelectorProps {
  departments: Department[];
  selectedDepartment: Department | null;
  onSelect: (department: Department | null) => void;
  loading?: boolean;
  showGlobalOption?: boolean;
}

export function DepartmentSelector({
  departments,
  selectedDepartment,
  onSelect,
  loading,
  showGlobalOption = true,
}: DepartmentSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-3 min-w-[240px] justify-between group relative overflow-hidden",
            "backdrop-blur-sm bg-card/50 border-border/40",
            "hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
            "transition-all duration-300"
          )}
          disabled={loading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {selectedDepartment ? (
            <motion.div
              className="flex items-center gap-2 relative z-10"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="w-3 h-3 rounded-full shadow-lg animate-pulse"
                style={{
                  backgroundColor: selectedDepartment.color,
                  boxShadow: `0 0 10px ${selectedDepartment.color}40`
                }}
              />
              <span className="font-medium">{selectedDepartment.name}</span>
            </motion.div>
          ) : showGlobalOption ? (
            <div className="flex items-center gap-2 text-muted-foreground relative z-10">
              <Globe className="w-4 h-4" />
              <span>System-Wide Settings</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground relative z-10">
              <Building2 className="w-4 h-4" />
              <span>Select Department</span>
            </div>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300 relative z-10" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "w-[280px] backdrop-blur-xl bg-card/95 border-border/40",
          "shadow-2xl shadow-black/10"
        )}
      >
        {showGlobalOption && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Scope
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onSelect(null)}
              className={cn(
                "gap-2 cursor-pointer",
                !selectedDepartment && "bg-primary/10 text-primary"
              )}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="flex-1 font-medium">System-Wide</span>
              {!selectedDepartment && (
                <Badge variant="default" className="text-[10px]">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Departments
            </DropdownMenuLabel>
          </>
        )}
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <DropdownMenuItem
              onClick={() => onSelect(dept)}
              className={cn(
                "gap-2 cursor-pointer group/item",
                selectedDepartment?.id === dept.id && "bg-primary/10 text-primary"
              )}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0 group-hover/item:scale-110 transition-transform duration-200"
                style={{
                  backgroundColor: dept.color,
                  boxShadow: selectedDepartment?.id === dept.id ? `0 0 8px ${dept.color}60` : 'none'
                }}
              />
              <span className="flex-1 truncate">{dept.name}</span>
              {selectedDepartment?.id === dept.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Badge variant="default" className="text-[10px]">
                    Active
                  </Badge>
                </motion.div>
              )}
            </DropdownMenuItem>
          </motion.div>
        ))}
        {departments.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No departments found
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
