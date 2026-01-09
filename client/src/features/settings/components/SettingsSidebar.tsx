import { useState } from "react";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(
    item.children?.some(
      (c: SettingsNavItem) => c.id === activeSection || activeSection.startsWith(c.id)
    ) || activeSection === item.id
  );

  const Icon = item.icon;
  const isActive = activeSection === item.id;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-secondary/50",
              isOpen && "bg-secondary/30"
            )}
            style={{ paddingLeft: `${12 + depth * 12}px` }}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {item.badge}
              </Badge>
            )}
            {isOpen ? (
              <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-0.5">
          {item.children?.map((child: SettingsNavItem) => (
            <NavItem
              key={child.id}
              item={child}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              depth={depth + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <button
      onClick={() => onSectionChange(item.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
        "hover:bg-secondary/50",
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
      style={{ paddingLeft: `${12 + depth * 12}px` }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left truncate">{item.label}</span>
      {item.badge && (
        <Badge
          variant={isActive ? "outline" : "secondary"}
          className="text-[10px] px-1.5 py-0"
        >
          {item.badge}
        </Badge>
      )}
    </button>
  );
}

function SidebarContent({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
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
      item.children?.some((c) => c.id === activeSection)
  );

  return (
    <>
      <div className="hidden lg:block w-64 shrink-0 border-r border-border/40 bg-card/30">
        <div className="sticky top-0 h-[calc(100vh-4rem)]">
          <SidebarContent
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 mb-4 w-full justify-start"
            >
              <Menu className="w-4 h-4" />
              <span className="flex-1 text-left">
                {activeItem?.label || "Settings"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Settings</SheetTitle>
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
