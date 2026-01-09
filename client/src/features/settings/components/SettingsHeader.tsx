import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { findNavItem, findParentNavItem, settingsNavigation } from "../navigation";

interface SettingsHeaderProps {
  sectionId: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function SettingsHeader({
  sectionId,
  title,
  description,
  actions,
}: SettingsHeaderProps) {
  const currentItem = findNavItem(sectionId);
  const parentItem = findParentNavItem(sectionId);

  const displayTitle = title || currentItem?.label || "Settings";
  const displayDescription = description || currentItem?.description;

  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-border/40 mb-6">
      {parentItem && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{parentItem.label}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{currentItem?.label}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {displayTitle}
          </h1>
          {displayDescription && (
            <p className="text-muted-foreground text-sm">{displayDescription}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
