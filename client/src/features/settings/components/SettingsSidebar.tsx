import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Menu, X, Settings, Search, Sparkles, ArrowRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { settingsNavigation, type SettingsNavItem } from "../navigation";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { searchSettings } from "../search";

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface NavItemProps {
  item: SettingsNavItem;
  activeSection: string;
  onSectionChange: (section: string) => void;
  depth?: number;
  searchTerm?: string;
}

function NavItem({
  item,
  activeSection,
  onSectionChange,
  depth = 0,
  searchTerm = "",
}: NavItemProps) {
  const isChildActive = item.children?.some(
    (c: SettingsNavItem) => c.id === activeSection || activeSection.startsWith(c.id)
  );
  const [isOpen, setIsOpen] = useState(isChildActive || activeSection === item.id);
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced motion values for micro-interactions
  const x = useMotionValue(0);
  const scale = useTransform(x, [-50, 0, 50], [0.95, 1, 1.05]);

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  const Icon = item.icon;
  const isActive = activeSection === item.id;
  
  // Filter logic for search
  const matchesSearch = !searchTerm || 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.children?.some(child => 
      child.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!matchesSearch) return null;
  
  // Ultra-modern aesthetic with glassmorphism and depth
  const baseClasses = cn(
    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl group relative overflow-hidden",
    "backdrop-blur-sm border border-transparent hover:border-border/20",
    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
    "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
  );
  
  const activeClasses = cn(
    "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary shadow-lg shadow-primary/20",
    "border-primary/20 backdrop-blur-md",
    "before:from-primary/10 before:via-primary/20 before:to-primary/10"
  );
  
  const inactiveClasses = cn(
    "text-muted-foreground hover:text-foreground",
    "hover:bg-gradient-to-r hover:from-secondary/30 hover:via-secondary/20 hover:to-transparent",
    "hover:shadow-md hover:shadow-black/5 hover:scale-[1.02] hover:backdrop-blur-sm"
  );

  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.1 }}
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <motion.button
              whileHover={{ 
                scale: 1.02, 
                x: 4,
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
              }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className={cn(
                baseClasses,
                "justify-between group-hover:shadow-lg",
                isOpen && !isChildActive && "bg-secondary/40 backdrop-blur-md border-border/30",
                isChildActive && activeClasses,
                !isChildActive && inactiveClasses
              )}
              style={{ paddingLeft: `${20 + depth * 16}px` }}
            >
              <div className="flex items-center gap-3 overflow-hidden relative z-10">
                <motion.div
                  whileHover={{ 
                    rotate: [0, -5, 5, 0],
                    scale: 1.05
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <Icon className={cn(
                    "w-5 h-5 shrink-0 transition-all duration-300", 
                    isChildActive ? "text-primary drop-shadow-sm" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                  )} />
                </motion.div>
                <span className="truncate">{item.label}</span>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-primary/60"
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                )}
              </div>
              <motion.div
                animate={{ 
                  rotate: isOpen ? 90 : 0,
                  scale: isHovered ? 1.2 : 1
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/70 group-hover:text-primary/70" />
              </motion.div>
            </motion.button>
          </CollapsibleTrigger>
          <AnimatePresence initial={false}>
            {isOpen && (
              <CollapsibleContent forceMount asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0, scale: 0.95 }}
                  animate={{ height: "auto", opacity: 1, scale: 1 }}
                  exit={{ height: 0, opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.04, 0.62, 0.23, 0.98],
                    opacity: { duration: 0.25 }
                  }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1 relative">
                     {/* Enhanced hierarchy line with gradient */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute left-[30px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-border/40 to-transparent" 
                      style={{ left: `${30 + depth * 16}px` }} 
                    />
                    
                    {item.children?.map((child: SettingsNavItem, index) => (
                      <motion.div
                        key={child.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                      >
                        <NavItem
                          item={child}
                          activeSection={activeSection}
                          onSectionChange={onSectionChange}
                          depth={depth + 1}
                          searchTerm={searchTerm}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative group/item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.05 }}
      whileHover={{ x: 6 }}
    >
      <motion.button
        whileHover={{ 
          scale: 1.02,
          boxShadow: isActive 
            ? "0 12px 40px rgba(var(--primary), 0.25)" 
            : "0 8px 25px rgba(0,0,0,0.1)"
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSectionChange(item.id)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          baseClasses,
          isActive ? activeClasses : inactiveClasses,
          depth > 0 && "py-2.5 text-sm ml-2",
          "group-hover/item:shadow-xl group-hover/item:backdrop-blur-lg"
        )}
        style={{ paddingLeft: depth > 0 ? `${36 + depth * 16}px` : `${20 + depth * 16}px` }}
      >
        {/* Background gradient effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100"
          animate={{
            x: isHovered ? ['-100%', '100%'] : '-100%'
          }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            repeat: isHovered ? Infinity : 0,
            repeatDelay: 0.5
          }}
        />
        
        {depth === 0 && (
          <motion.div
            animate={{ 
              scale: isActive ? 1.1 : isHovered ? 1.05 : 1,
              rotate: isHovered ? [0, -5, 5, 0] : 0
            }}
            transition={{ 
              scale: { duration: 0.2 },
              rotate: { duration: 0.6, repeat: isHovered ? Infinity : 0, repeatDelay: 2 }
            }}
          >
            <Icon className={cn(
              "w-5 h-5 shrink-0 transition-all duration-300 relative z-10", 
              isActive 
                ? "text-primary drop-shadow-md filter" 
                : "text-muted-foreground group-hover:text-primary/80 group-hover:drop-shadow-sm"
            )} />
          </motion.div>
        )}
        
        <span className="flex-1 text-left truncate relative z-10 font-medium">
          {item.label}
        </span>
        
        {item.badge && (
          <motion.div
            animate={{ scale: isActive ? 1.1 : 1 }}
            whileHover={{ scale: 1.2 }}
          >
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "text-[11px] px-2 h-6 flex items-center justify-center min-w-[24px] font-semibold relative z-10",
                "shadow-sm backdrop-blur-sm",
                isActive 
                  ? "bg-primary/90 text-primary-foreground shadow-primary/30" 
                  : "bg-muted/80 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              )}
            >
              {item.badge}
            </Badge>
          </motion.div>
        )}
      </motion.button>
      
      {/* Active indicator with enhanced styling */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="active-indicator"
            className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-r-full shadow-lg shadow-primary/50" 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            style={{ y: "-50%" }}
          />
        )}
      </AnimatePresence>
      
      {/* Hover glow effect */}
      <AnimatePresence>
        {isHovered && !isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SidebarContent({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = searchSettings(searchTerm);
      setSearchResults(results);
      setSelectedResultIndex(-1);
    } else {
      setSearchResults([]);
      setSelectedResultIndex(-1);
    }
  }, [searchTerm]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedResultIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault();
      const result = searchResults[selectedResultIndex];
      onSectionChange(result.section);
      setSearchTerm("");
      setSearchResults([]);
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    } else if (e.key === "Escape") {
      setSearchTerm("");
      setSearchResults([]);
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  const handleResultClick = (result: any) => {
    onSectionChange(result.section);
    setSearchTerm("");
    setSearchResults([]);
    setIsSearchFocused(false);
    searchInputRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current && 
        !searchDropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setSearchResults([]);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Modern header with glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-border/20 backdrop-blur-xl bg-gradient-to-r from-background/95 to-background/80"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg backdrop-blur-sm border border-primary/20"
          >
            <Settings className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              System Settings
            </h2>
            <p className="text-xs text-muted-foreground font-medium">Configure your workspace</p>
          </div>
        </div>

        {/* Enhanced search with modern styling and dropdown */}
        <div className="relative">
          <motion.div 
            className={cn(
              "relative transition-all duration-300",
              isSearchFocused && "scale-105"
            )}
            whileFocus={{ scale: 1.02 }}
          >
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300",
              isSearchFocused ? "text-primary scale-110" : "text-muted-foreground"
            )} />
            <Input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search settings..."
              className={cn(
                "pl-10 h-11 bg-background/50 border-border/30 backdrop-blur-sm",
                "focus:bg-background/80 focus:border-primary/40 focus:shadow-lg focus:shadow-primary/10",
                "transition-all duration-300 rounded-lg font-medium"
              )}
            />
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/50 rounded-md transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </motion.button>
            )}
          </motion.div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                ref={searchDropdownRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/30 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2 border-b border-border/20 bg-muted/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <Hash className="w-3 h-3" />
                    <span className="font-medium">{searchResults.length} settings found</span>
                  </div>
                </div>
                <ScrollArea className="max-h-80">
                  <div className="p-2 space-y-1">
                    {searchResults.map((result, index) => (
                      <motion.button
                        key={`${result.section}-${result.term}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-all duration-200",
                          "hover:bg-primary/10 hover:border-primary/20 border border-transparent",
                          "group cursor-pointer",
                          selectedResultIndex === index && "bg-primary/10 border-primary/20"
                        )}
                        onMouseEnter={() => setSelectedResultIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm capitalize text-foreground group-hover:text-primary transition-colors">
                                {result.term}
                              </span>
                              <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-muted/50">
                                {result.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-muted-foreground/80">
                              {result.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0 ml-2" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t border-border/20 bg-muted/10">
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    <span className="font-medium">Tip:</span> Use ↑↓ keys to navigate, Enter to select
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation with enhanced scrolling */}
      <ScrollArea className="flex-1 px-4 py-2">
        <motion.div 
          className="space-y-1 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {settingsNavigation.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.3 }}
            >
              <NavItem
                item={item}
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                searchTerm={searchTerm}
              />
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>

      {/* Modern footer with status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-4 border-t border-border/20 bg-gradient-to-t from-muted/20 to-transparent backdrop-blur-sm"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Settings v2.1.0</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
          />
        </div>
      </motion.div>
    </div>
  );
}

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setMobileOpen(false);
  };

  const activeItem = settingsNavigation.find(
    (item) =>
      item.id === activeSection ||
      item.children?.some((c) => c.id === activeSection || activeSection.startsWith(c.id))
  );

  const activeChild = activeItem?.children?.find(
    (c) => c.id === activeSection || activeSection.startsWith(c.id)
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border/40 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-sm">
        <div className="sticky top-0 h-[calc(100vh-4rem)]">
          <SidebarContent
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full justify-between h-11 rounded-xl border-border/60 bg-card/50"
            >
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4" />
                <span className="font-medium">
                  {activeChild?.label || activeItem?.label || "Settings"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </SheetTitle>
            </SheetHeader>
            <SidebarContent
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
