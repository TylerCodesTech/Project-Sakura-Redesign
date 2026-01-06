import { Search, Bell, HelpCircle, Grid3X3, X, Command, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser, navItems } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 md:px-8">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button 
              className="p-2 hover:bg-secondary rounded-lg transition-colors group relative"
              data-testid="button-app-launcher"
            >
              <Grid3X3 className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[480px] p-0 border-border shadow-2xl rounded-2xl overflow-hidden" align="start" sideOffset={8}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">App Launcher</h2>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary rounded-md transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="relative mb-8 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search apps and resources..." 
                  className="pl-10 h-11 bg-secondary/30 border-transparent focus-visible:bg-background focus-visible:border-primary/20 transition-all"
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-6">Sakura Apps</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {navItems.map((item) => {
                      const isActive = location === item.href;
                      const Icon = item.icon;
                      // Color mapping for icons based on the screenshot style
                      const getIconColor = (label: string) => {
                        switch(label) {
                          case 'Dashboard': return 'bg-emerald-50 text-emerald-600';
                          case 'Documents': return 'bg-rose-50 text-rose-600';
                          case 'Team Directory': return 'bg-indigo-50 text-indigo-600';
                          case 'Helpdesk': return 'bg-amber-50 text-amber-600';
                          default: return 'bg-primary/10 text-primary';
                        }
                      };

                      return (
                        <Link key={item.href} href={item.href}>
                          <a 
                            onClick={() => setIsOpen(false)}
                            className="flex flex-col items-center gap-3 group"
                            data-testid={`launcher-item-${item.label.toLowerCase()}`}
                          >
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                              getIconColor(item.label),
                              isActive && "ring-2 ring-primary ring-offset-2"
                            )}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                              {item.label === 'Dashboard' ? 'Intranet' : item.label === 'Team Directory' ? 'Directory' : item.label}
                            </span>
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Resources</h3>
                  <div className="py-8 flex flex-col items-center justify-center bg-secondary/20 rounded-xl border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">No resources available</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-secondary/30 p-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/10 rounded">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span className="text-xs font-semibold">AI Powered Workspace</span>
              </div>
              <Link href="/settings">
                <a className="text-xs text-primary font-medium hover:underline">Settings</a>
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2 ml-4">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="w-4 h-4 fill-primary/20" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Sakura</span>
        </div>

        <div className="h-6 w-px bg-border mx-2"></div>

        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Ask AI or search..." 
              className="pl-10 h-9 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:border-primary/20 w-full transition-all duration-300"
              data-testid="global-search"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>
        <div className="h-6 w-px bg-border hidden sm:block"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none" data-testid="user-name">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{currentUser.role}</p>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
