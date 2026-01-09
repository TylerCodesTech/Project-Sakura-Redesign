import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
  vertical?: boolean;
}

export function SettingsRow({
  label,
  description,
  children,
  className,
  vertical,
}: SettingsRowProps) {
  if (vertical) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="space-y-0.5">
          <Label>{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        className
      )}
    >
      <div className="space-y-0.5 flex-1">
        <Label>{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
