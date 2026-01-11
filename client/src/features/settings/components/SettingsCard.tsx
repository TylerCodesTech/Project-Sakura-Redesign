import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: "default" | "elevated" | "bordered";
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  actions,
  className,
  noPadding,
  variant = "default",
}: SettingsCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2",
        variant === "default" && "border-border/40 shadow-sm hover:shadow-md",
        variant === "elevated" && "border-border/30 shadow-lg hover:shadow-xl bg-gradient-to-br from-card to-card/80",
        variant === "bordered" && "border-2 border-border/60 shadow-none",
        className
      )}
    >
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-0.5">{description}</CardDescription>
              )}
            </div>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent className={cn(noPadding && "p-0 pt-0")}>{children}</CardContent>
    </Card>
  );
}
