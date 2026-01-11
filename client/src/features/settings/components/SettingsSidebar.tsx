import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Menu, X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { motion, AnimatePresence } from "framer-motion";

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

function NavItem({
  item,
  activeSection,
  onSectionChange,
  depth = 0,
}: {
  item: SettingsNavItem;
  activeSection: string;
  onSectionChange: (section: string) => void;
  depth?: number;
}) {
  const isChildActive = item.children?.some(
    (c: SettingsNavItem) => c.id === activeSection || activeSection.startsWith(c.id)
  );
  const [isOpen, setIsOpen] = useState(isChildActive || activeSection === item.id);

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  const Icon = item.icon;
  const isActive = activeSection === item.id;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              "hover:bg-secondary/60 active:scale-[0.98]",
              isOpen && "bg-secondary/40",
              isChildActive && "text-primary"
            )}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-colors",
              isChildActive ? "bg-primary/10 text-primary" : "bg-muted/50"
            )}>
              <Icon className="w-4 h-4 shrink-0" />
            </div>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium bg-primary/10 text-primary border-0">
                {item.badge}
              </Badge>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
            </motion.div>
          </button>
        </CollapsibleTrigger>
        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent forceMount asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 mt-1 ml-3 pl-3 border-l-2 border-border/40">
                  {item.children?.map((child: SettingsNavItem) => (
                    <NavItem
                      key={child.id}
                      item={child}
                      activeSection={activeSection}
                      onSectionChange={onSectionChange}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    );
  }

  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSectionChange(item.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
        depth > 0 ? "py-2" : "",
        isActive
          ? "bg-primary text-primary-foreground font-medium shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      )}
      style={{ paddingLeft: depth > 0 ? `${8 + depth * 8}px` : `${12 + depth * 16}px` }}
    >
      {depth === 0 && (
        <div className={cn(
          "p-1.5 rounded-lg transition-colors",
          isActive ? "bg-primary-foreground/20" : "bg-muted/50"
        )}>
          <Icon className="w-4 h-4 shrink-0" />
        </div>
      )}
      {depth > 0 && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="flex-1 text-left truncate">{item.label}</span>
      {item.badge && (
        <Badge
          variant={isActive ? "outline" : "secondary"}
          className={cn(
            "text-[10px] px-1.5 py-0 font-medium",
            isActive ? "border-primary-foreground/30 text-primary-foreground" : "bg-primary/10 text-primary border-0"
          )}
        >
          {item.badge}
        </Badge>
      )}
    </motion.button>
  );
}

function SidebarContent({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1.5 p-3">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Settings</h2>
            <p className="text-xs text-muted-foreground">Configure your workspace</p>
          </div>
        </div>
        {settingsNavigation.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        ))}
      </div>
    </ScrollArea>
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
