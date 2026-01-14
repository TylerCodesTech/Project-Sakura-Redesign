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
  variant = "premium",
  scope,
  departmentName,
  departmentColor,
  helpText,
  helpLink,
  onReset,
  showResetButton = false,
  collapsible = false,
  defaultExpanded = true,
}: SettingsCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    default: "border bg-card shadow-sm",
    elevated: "border bg-card shadow-lg hover:shadow-xl transition-shadow duration-300",
    bordered: "border-2 bg-card/50 backdrop-blur-sm",
    glassmorphism: cn(
      "bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl",
      "border border-white/10 shadow-2xl hover:shadow-3xl",
      "hover:border-white/20 transition-all duration-500"
    ),
    premium: cn(
      "bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm",
      "border border-border/20 shadow-xl hover:shadow-2xl",
      "hover:border-border/40 hover:bg-gradient-to-br hover:from-card/95 hover:via-card/90 hover:to-card/85",
      "transition-all duration-500 relative overflow-hidden group"
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          cardVariants[variant],
          className
        )}
      >
        {/* Premium gradient overlay effect */}
        {variant === "premium" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100"
            animate={{
              x: isHovered ? ['-100%', '100%'] : '-100%'
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 0.8
            }}
          />
        )}

        <CardHeader className={cn(
          "relative z-10",
          collapsible && "cursor-pointer",
          noPadding && "pb-2"
        )}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {Icon && (
                <motion.div
                  animate={{ 
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? [0, -5, 5, 0] : 0
                  }}
                  transition={{ 
                    scale: { duration: 0.2 },
                    rotate: { duration: 0.8, repeat: isHovered ? Infinity : 0, repeatDelay: 2 }
                  }}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-300",
                    variant === "premium" 
                      ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-lg backdrop-blur-sm" 
                      : "bg-primary/10 border border-primary/20"
                  )}
                >
                  <Icon className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    isHovered ? "text-primary drop-shadow-sm" : "text-primary/80"
                  )} />
                </motion.div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className={cn(
                    "text-lg font-semibold transition-colors duration-300",
                    isHovered && "text-primary"
                  )}>
                    {title}
                    {isHovered && variant === "premium" && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-2 inline-block"
                      >
                        <Sparkles className="w-4 h-4 text-primary/60" />
                      </motion.span>
                    )}
                  </CardTitle>
                  
                  {scope && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                    >
                      <ScopeBadge 
                        scope={scope}
                        departmentName={departmentName}
                        departmentColor={departmentColor}
                      />
                    </motion.div>
                  )}
                </div>
                
                {description && (
                  <CardDescription className="mt-2 text-muted-foreground">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {helpText && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted/50"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>{helpText}</p>
                      {helpLink && (
                        <a 
                          href={helpLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 block"
                        >
                          Learn more
                        </a>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {showResetButton && onReset && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onReset}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Reset to defaults</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {actions}

              {collapsible && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {(!collapsible || isExpanded) && (
            <motion.div
              initial={collapsible ? { height: 0, opacity: 0 } : {}}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.04, 0.62, 0.23, 0.98],
                opacity: { duration: 0.2 }
              }}
              className="overflow-hidden"
            >
              <CardContent className={cn(
                "relative z-10",
                noPadding && "p-0"
              )}>
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}