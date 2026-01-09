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
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  actions,
  className,
  noPadding,
}: SettingsCardProps) {
  return (
    <Card className={cn("border-border/40 shadow-sm", className)}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent className={cn(noPadding && "p-0")}>{children}</CardContent>
    </Card>
  );
}
