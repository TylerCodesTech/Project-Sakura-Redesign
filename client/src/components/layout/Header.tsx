import { Search, Bell, HelpCircle, X, Sparkles, User, Settings, LogOut, Moon, Sun, Monitor, Mail, MessageSquare, Globe, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser, navItems } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Notification, type User as DBUser, type ExternalLink } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [resourceSearch, setResourceSearch] = useState("");

  const { data: links = [], isLoading: isLoadingLinks } = useQuery<ExternalLink[]>({
    queryKey: ["/api/external-links"],
  });

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    link.url.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", currentUser.id],
    enabled: !!currentUser.id,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", currentUser.id] });
    },
  });

  const unreadCount = notifications.filter(n => n.read === "false").length;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Custom App Launcher Icon based on user screenshot
  const LauncherIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="13" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 md:px-8">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <Link href="/" className="flex items-center gap-2 mr-4 group hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-5 h-5 fill-primary/20" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Sakura</span>
        </Link>

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

      <div className="flex items-center gap-2 ml-4">
        {/* App Launcher - Moved to the left of the bell */}
        <Popover open={isLauncherOpen} onOpenChange={setIsLauncherOpen}>
          <PopoverTrigger asChild>
            <button 
              className="p-2 hover:bg-secondary rounded-lg transition-colors group text-muted-foreground hover:text-primary"
              data-testid="button-app-launcher"
            >
              <LauncherIcon />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[480px] p-0 border-border shadow-2xl rounded-2xl overflow-hidden" align="end" sideOffset={12}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">App Launcher</h2>
                <button onClick={() => setIsLauncherOpen(false)} className="p-1 hover:bg-secondary rounded-md transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="relative mb-8 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search apps and resources..." 
                  className="pl-10 h-11 bg-secondary/30 border-transparent focus-visible:bg-background focus-visible:border-primary/20 transition-all"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[480px] -mr-4 pr-4">
                <div className="space-y-8 pb-4">
                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-6">Sakura Apps</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {navItems.map((item) => {
                        const isActive = location === item.href;
                        const Icon = item.icon;
                        const getIconColor = (label: string) => {
                          switch(label) {
                            case 'Dashboard': return 'bg-emerald-50 text-emerald-600';
                            case 'Documents': return 'bg-rose-50 text-rose-600';
                            case 'Team Directory': return 'bg-indigo-50 text-indigo-600';
                            case 'Helpdesk': return 'bg-amber-50 text-amber-600';
                            default: return 'bg-primary/10 text-primary';
                          }
                        };

                        if (resourceSearch && !item.label.toLowerCase().includes(resourceSearch.toLowerCase())) {
                          return null;
                        }

                        return (
                          <Link 
                            key={item.href} 
                            href={item.href}
                            onClick={() => setIsLauncherOpen(false)}
                            className="flex flex-col items-center gap-3 group"
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
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Resources</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {/* Native App Links */}
                      {isLoadingLinks ? (
                        <div className="col-span-4 py-8 flex justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
                        </div>
                      ) : filteredLinks.length === 0 ? (
                        <div className="col-span-4 py-8 flex flex-col items-center justify-center bg-secondary/20 rounded-xl border border-dashed border-border">
                          <p className="text-sm text-muted-foreground">
                            {resourceSearch ? "No matching resources" : "No resources available"}
                          </p>
                        </div>
                      ) : (
                        filteredLinks.map((link) => (
                          <a 
                            key={link.id}
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-3 group"
                          >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg bg-secondary/50 text-muted-foreground overflow-hidden relative">
                              <img 
                                src={`/api/proxy-favicon?url=${encodeURIComponent(link.url)}`} 
                                alt={link.title}
                                className="w-full h-full object-cover z-10 relative"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <Globe className="w-7 h-7 absolute inset-0 m-auto z-0" />
                            </div>
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors text-center line-clamp-1">
                              {link.title}
                            </span>
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
            <div className="bg-secondary/30 p-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/10 rounded">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span className="text-xs font-semibold">AI Powered Workspace</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-destructive text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-background px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 border-border shadow-2xl rounded-xl overflow-hidden" align="end" sideOffset={12}>
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="font-semibold text-sm">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            <ScrollArea className="h-[350px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-4 hover:bg-secondary/50 transition-colors cursor-pointer group relative",
                        notification.read === "false" && "bg-primary/5"
                      )}
                      onClick={() => {
                        if (notification.read === "false" && notification.title !== "New Page for Review") {
                          markReadMutation.mutate(notification.id);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0 transition-all",
                          notification.read === "false" ? "bg-primary scale-100" : "bg-transparent scale-0"
                        )} />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold leading-none">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 pt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-2 border-t border-border bg-muted/30">
              <Button variant="ghost" className="w-full h-8 text-xs font-medium hover:bg-secondary">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 group outline-none cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none transition-colors group-hover:text-primary">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentUser.role}</p>
              </div>
              <Avatar className="h-9 w-9 border border-border shadow-sm group-hover:border-primary/30 transition-colors">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2 rounded-xl" align="end" sideOffset={12}>
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-[-8px] my-2" />
            
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  Profile Settings
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display font-bold">Profile Settings</DialogTitle>
                  <DialogDescription>
                    Manage your personal information and preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="text-xl">SC</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={currentUser.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={currentUser.email} readOnly className="bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue={currentUser.role} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept">Department</Label>
                      <Input id="dept" defaultValue="Product Engineering" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex flex-col gap-2">
                      <Label>System Theme</Label>
                      <RadioGroup 
                        value={theme} 
                        onValueChange={(v: 'light' | 'dark' | 'system') => setTheme(v)} 
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2 bg-secondary/30 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-secondary/50">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                            <Sun className="w-4 h-4" /> Light
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-secondary/30 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-secondary/50">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                            <Moon className="w-4 h-4" /> Dark
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-secondary/30 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-secondary/50">
                          <RadioGroupItem value="system" id="system" />
                          <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                            <Monitor className="w-4 h-4" /> System
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex flex-col gap-4 pt-2">
                      <Label>Communication Preferences</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Email Notifications</p>
                              <p className="text-xs text-muted-foreground">Receive updates on tickets and docs via email.</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">Slack Integration</p>
                              <p className="text-xs text-muted-foreground">Get instant alerts in your workspace.</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsProfileOpen(false)}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="/settings">
              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                System Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="mx-[-8px] my-2" />
            <DropdownMenuItem 
              className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                // In a real app, we'd call a logout API here
                window.location.href = "/login";
              }}
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
