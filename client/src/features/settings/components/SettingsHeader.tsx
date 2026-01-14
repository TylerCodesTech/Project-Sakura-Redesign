import { ReactNode, useState } from "react";
import { ChevronRight, Home, Clock, Search, Sparkles, Settings, ArrowRight } from "lucide-react";
import { findNavItem, findParentNavItem } from "../navigation";
import { cn } from "@/lib/utils";
import { SaveStateIndicator, type SaveState } from "./SaveStateIndicator";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isHovered, setIsHovered] = useState(false);
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
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-background via-background to-background/95",
        "border-b border-border/20 backdrop-blur-xl"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Floating particle effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                }}
                animate={{
                  y: -10,
                  x: Math.random() * window.innerWidth,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-8 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced breadcrumbs */}
          {showBreadcrumbs && (
            <motion.nav
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-200 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Settings</span>
              </motion.div>
              
              {parentItem && (
                <>
                  <motion.div
                    animate={{ rotate: isHovered ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                  <span className="hover:text-foreground transition-colors duration-200 font-medium cursor-pointer">
                    {parentItem.label}
                  </span>
                </>
              )}
              
              <motion.div
                animate={{ rotate: isHovered ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
              
              <span className="text-foreground font-semibold flex items-center gap-1.5">
                {currentItem?.icon && <currentItem.icon className="w-4 h-4" />}
                {displayTitle}
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-primary"
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.span>
                )}
              </span>
            </motion.nav>
          )}

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 min-w-0">
              {/* Enhanced title section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-4 mb-3"
              >
                {currentItem?.icon && (
                  <motion.div
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: [0, -10, 10, 0],
                      boxShadow: "0 8px 30px rgba(var(--primary), 0.3)"
                    }}
                    transition={{ 
                      scale: { duration: 0.2 },
                      rotate: { duration: 0.6 },
                      boxShadow: { duration: 0.3 }
                    }}
                    className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm shadow-lg"
                  >
                    <currentItem.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                )}
                
                <div className="flex-1">
                  <motion.h1 
                    className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {displayTitle}
                    {isHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3 text-primary/60"
                      >
                        <ArrowRight className="w-6 h-6 inline" />
                      </motion.span>
                    )}
                  </motion.h1>
                  
                  {displayDescription && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed"
                    >
                      {displayDescription}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Enhanced save status */}
              {(lastSaved || saveState) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex items-center gap-3 mt-4"
                >
                  {saveState && (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <SaveStateIndicator state={saveState} />
                    </motion.div>
                  )}
                  
                  {lastSaved && (
                    <motion.div 
                      className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg backdrop-blur-sm border border-border/20"
                      whileHover={{ 
                        backgroundColor: "rgba(var(--muted), 0.5)",
                        borderColor: "rgba(var(--border), 0.4)"
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      >
                        <Clock className="w-4 h-4" />
                      </motion.div>
                      <span className="font-medium">Last saved {formatLastSaved(lastSaved)}</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Enhanced actions section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {actions}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
    </motion.header>
  );
}