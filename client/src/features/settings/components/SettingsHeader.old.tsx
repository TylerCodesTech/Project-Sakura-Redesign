import { ReactNode } from "react";
import { ChevronRight, Home, Clock, Search } from "lucide-react";
import { findNavItem, findParentNavItem } from "../navigation";
import { cn } from "@/lib/utils";
import { SaveStateIndicator, type SaveState } from "./SaveStateIndicator";
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  sectionId: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  showBreadcrumbs?: boolean;
  lastSaved?: Date;
  saveState?: SaveState;
  onSearchClick?: () => void;
  showSearch?: boolean;
}

export function SettingsHeader({
  sectionId,
  title,
  description,
  actions,
  showBreadcrumbs = true,
  lastSaved,
  saveState,
  onSearchClick,
  showSearch = true,
}: SettingsHeaderProps) {
  const currentItem = findNavItem(sectionId);
  const parentItem = findParentNavItem(sectionId);

  const displayTitle = title || currentItem?.label || "Settings";
  const displayDescription = description || currentItem?.description;

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleString();
  };

  return (
    <div className="relative flex flex-col gap-4 pb-6 mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {showBreadcrumbs && (
            <nav className="flex items-center gap-1.5 text-sm mb-2" aria-label="Breadcrumb">
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

          <div>
             <h1 className="text-2xl font-bold tracking-tight">{displayTitle}</h1>
             {displayDescription && <p className="text-muted-foreground mt-1">{displayDescription}</p>}
          </div>

        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatLastSaved(lastSaved)}</span>
            </div>
          )}
          {saveState && <SaveStateIndicator state={saveState} />}
          {showSearch && onSearchClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSearchClick}
              className="gap-2 bg-background/50 hover:bg-background border-border/60 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group h-9"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="hidden sm:inline text-muted-foreground group-hover:text-foreground">Search settings...</span>
              <kbd className="hidden sm:inline pointer-events-none h-5 select-none items-center gap-1 rounded bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          )}
          {actions}
        </div>
      </div>
    
      {/* Subtle separator */}
      <div className="h-px bg-border/40 w-full" />
    </div>
  );
}

