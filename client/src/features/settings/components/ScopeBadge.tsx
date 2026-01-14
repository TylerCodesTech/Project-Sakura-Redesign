import { Badge } from "@/components/ui/badge";
import { Globe, Building2, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type SettingScope = 'global' | 'department' | 'personal';

interface ScopeBadgeProps {
  scope: SettingScope;
  departmentName?: string;
  departmentColor?: string;
  className?: string;
}

export function ScopeBadge({ scope, departmentName, departmentColor, className }: ScopeBadgeProps) {
  if (scope === 'global') {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5 relative overflow-hidden",
            "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
            "text-blue-700 dark:text-blue-300",
            "border-blue-300/50 dark:border-blue-700/50",
            "shadow-sm shadow-blue-500/20",
            "hover:shadow-md hover:shadow-blue-500/30 transition-all duration-300",
            className
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
          <Globe className="h-3 w-3 relative z-10" />
          <span className="relative z-10 font-medium">Global</span>
          <Sparkles className="h-2.5 w-2.5 text-blue-500 animate-pulse relative z-10" />
        </Badge>
      </motion.div>
    );
  }

  if (scope === 'department') {
    const bgColor = departmentColor
      ? `${departmentColor}20`
      : 'rgb(var(--muted))';
    const textColor = departmentColor || 'rgb(var(--foreground))';
    const borderColor = departmentColor
      ? `${departmentColor}40`
      : 'rgb(var(--border))';

    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 relative overflow-hidden",
            "backdrop-blur-sm shadow-sm",
            "hover:shadow-md transition-all duration-300",
            className
          )}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            borderColor: borderColor,
            boxShadow: `0 0 10px ${departmentColor}20`
          }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${departmentColor}20, transparent 70%)`
            }}
          />
          <Building2 className="h-3 w-3 relative z-10" />
          <span className="relative z-10 font-medium">{departmentName || 'Department'}</span>
        </Badge>
      </motion.div>
    );
  }

  // Personal scope
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Badge
        variant="secondary"
        className={cn(
          "gap-1.5 relative overflow-hidden",
          "bg-gradient-to-r from-gray-500/20 to-slate-500/20",
          "text-gray-700 dark:text-gray-300",
          "border-gray-300/50 dark:border-gray-700/50",
          "shadow-sm hover:shadow-md transition-all duration-300",
          className
        )}
      >
        <User className="h-3 w-3 relative z-10" />
        <span className="relative z-10 font-medium">Personal</span>
      </Badge>
    </motion.div>
  );
}
