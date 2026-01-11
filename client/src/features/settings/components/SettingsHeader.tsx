import { ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import { findNavItem, findParentNavItem } from "../navigation";
import { cn } from "@/lib/utils";

interface SettingsHeaderProps {
  sectionId: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  showBreadcrumbs?: boolean;
}

export function SettingsHeader({
  sectionId,
  title,
  description,
  actions,
  showBreadcrumbs = true,
}: SettingsHeaderProps) {
  const currentItem = findNavItem(sectionId);
  const parentItem = findParentNavItem(sectionId);

  const displayTitle = title || currentItem?.label || "Settings";
  const displayDescription = description || currentItem?.description;

  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-border/40 mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
      {showBreadcrumbs && (
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Settings</span>
          </button>
          {parentItem && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="text-muted-foreground">{parentItem.label}</span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className="font-medium text-foreground">{currentItem?.label || displayTitle}</span>
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
            {displayTitle}
          </h1>
          {displayDescription && (
            <p className="text-muted-foreground text-sm max-w-2xl">{displayDescription}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
