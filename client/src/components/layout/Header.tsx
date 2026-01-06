import { Search, Bell, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@/lib/mockData";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 md:px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Ask anything or search documents..." 
            className="pl-10 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:border-primary/20 w-full transition-all duration-300"
            data-testid="global-search"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors hidden sm:block">
          <HelpCircle className="w-5 h-5" />
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
