import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/mockData";
import { Command, Feather } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar h-screen flex flex-col fixed left-0 top-0 z-30 hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Feather className="w-5 h-5" />
        </div>
        <span className="font-display font-bold text-xl text-sidebar-foreground tracking-tight">Sakura</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive 
                    ? "bg-sidebar-primary/10 text-sidebar-primary" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                data-testid={`nav-item-${item.label.toLowerCase()}`}
              >
                <item.icon className={cn("w-4.5 h-4.5", isActive ? "stroke-2" : "stroke-[1.5]")} />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-background rounded-md shadow-sm">
              <Command className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">Pro Plan</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Your team is on the Pro plan with unlimited AI queries.</p>
          <button className="w-full text-xs bg-sidebar-foreground text-background py-1.5 rounded-md font-medium hover:opacity-90 transition-opacity">
            Manage Plan
          </button>
        </div>
      </div>
    </aside>
  );
}
