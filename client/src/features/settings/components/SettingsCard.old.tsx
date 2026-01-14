import { ReactNode, useState } from "react";
import { LucideIcon, RotateCcw, HelpCircle, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ScopeBadge, type SettingScope } from "./ScopeBadge";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: "default" | "elevated" | "bordered" | "glassmorphism" | "premium";
  scope?: SettingScope;
  departmentName?: string;
  departmentColor?: string;
  helpText?: string;
  helpLink?: string;
  onReset?: () => void;
  showResetButton?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
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
  scope,
  departmentName,
  departmentColor,
  helpText,
  helpLink,
  onReset,
  showResetButton = false,
}: SettingsCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "bg-card border-border/60",
        variant === "default" && "hover:border-primary/20 hover:shadow-sm",
        variant === "elevated" && "shadow-md bg-card/50 border-transparent backdrop-blur-sm",
        variant === "bordered" && "border-2 border-border/60",
        className
      )}
    >
      <div className="relative z-10">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                {scope && (
                  <ScopeBadge
                    scope={scope}
                    departmentName={departmentName}
                    departmentColor={departmentColor}
                  />
                )}
                {(helpText || helpLink) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {helpLink ? (
                          <a href={helpLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-5 w-5 -ml-1 text-muted-foreground hover:text-foreground">
                              <HelpCircle className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-5 w-5 -ml-1 text-muted-foreground hover:text-foreground">
                            <HelpCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{helpText || "Click for more info"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {description && (
                <CardDescription className="text-sm mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-center">
          {actions}
          {showResetButton && onReset && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onReset}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to defaults</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0", noPadding && "p-0")}>
        {children}
      </CardContent>
      </div>
    </Card>
  );
}
