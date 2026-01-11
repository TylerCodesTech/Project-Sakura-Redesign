import { Search, Bell, HelpCircle, X, Sparkles, User, Settings, LogOut, Moon, Sun, Monitor, Mail, MessageSquare, Globe, Loader2, Book, FileText, Building2, History, Archive } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navItems } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
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

interface SearchResult {
  type: 'book' | 'page' | 'department' | 'page_version' | 'book_version';
  id: string;
  title: string;
  link: string;
  displayLabel?: string;
  isLegacy?: boolean;
  versionNumber?: number;
}

export function Header() {
  const [location] = useLocation();
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { settings, isLoading } = useSystemSettings();
  const { user, logoutMutation } = useAuth();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system' | null>(null);
  const [resourceSearch, setResourceSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const canOverrideTheme = settings.allowUserThemeOverride === "true";
  const theme = canOverrideTheme && userTheme !== null ? userTheme : (settings.defaultTheme as 'light' | 'dark' | 'system') || 'system';
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (canOverrideTheme) {
      setUserTheme(newTheme);
    }
  };

  const { data: searchResults = [], isLoading: isSearching } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", { q: globalSearch }],
    queryFn: async () => {
      if (!globalSearch) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(globalSearch)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: globalSearch.length > 0,
  });

  const { data: links = [], isLoading: isLoadingLinks } = useQuery<ExternalLink[]>({
    queryKey: ["/api/external-links"],
  });

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    link.url.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", user?.id],
    enabled: !!user?.id,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", user?.id] });
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
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.companyName} className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-5 h-5 fill-primary/20" />
              </div>
            )}
            <span className="font-display font-bold text-xl tracking-tight">{settings.companyName}</span>
        </Link>

        <div className="h-6 w-px bg-border mx-2"></div>

        <div className="flex-1 max-w-md hidden md:block relative" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Ask AI or search..." 
              className="pl-10 h-9 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:border-primary/20 w-full transition-all duration-300"
              data-testid="global-search"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
          </div>

          {isSearchOpen && (globalSearch || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden z-50">
              <ScrollArea className="max-h-[400px]">
                <div className="p-2">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No results found for "{globalSearch}"
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((result) => (
                        <Link 
                          key={`${result.type}-${result.id}`} 
                          href={result.link}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setGlobalSearch("");
                          }}
                        >
                          <div className="flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-xl cursor-pointer transition-colors group">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              result.type === 'book' && "bg-emerald-50 text-emerald-600",
                              result.type === 'page' && "bg-rose-50 text-rose-600",
                              result.type === 'department' && "bg-indigo-50 text-indigo-600",
                              result.type === 'page_version' && "bg-violet-50 text-violet-600",
                              result.type === 'book_version' && "bg-amber-50 text-amber-600",
                            )}>
                              {result.type === 'book' && <Book className="w-4 h-4" />}
                              {result.type === 'page' && <FileText className="w-4 h-4" />}
                              {result.type === 'department' && <Building2 className="w-4 h-4" />}
                              {result.type === 'page_version' && <History className="w-4 h-4" />}
                              {result.type === 'book_version' && <Archive className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{result.title}</p>
                                {result.isLegacy && result.displayLabel && (
                                  <Badge variant="outline" className={cn(
                                    "text-[9px] font-bold shrink-0",
                                    result.displayLabel.includes('Archived') 
                                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30" 
                                      : "bg-violet-500/10 text-violet-600 border-violet-500/30"
                                  )}>
                                    {result.displayLabel}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] uppercase font-black tracking-wider text-muted-foreground/60">
                                {result.type === 'page_version' ? 'page version' : result.type === 'book_version' ? 'book version' : result.type}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 bg-secondary/20 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">AI Enhanced Search</span>
                </div>
              </div>
            </div>
          )}
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
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-6">{settings.companyName} Apps</h3>
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
                            case 'Report Builder': return 'bg-violet-50 text-violet-600';
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
                <p className="text-sm font-medium leading-none transition-colors group-hover:text-primary">{user?.username || "User"}</p>
                <p className="text-xs text-muted-foreground mt-1">{user?.department || "Member"}</p>
              </div>
              <Avatar className="h-9 w-9 border border-border shadow-sm group-hover:border-primary/30 transition-colors">
                <AvatarImage src="" />
                <AvatarFallback>{(user?.username || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2 rounded-xl" align="end" sideOffset={12}>
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.department || "Member"}</p>
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
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xl">{(user?.username || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Username</Label>
                      <Input id="name" defaultValue={user?.username || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">ID</Label>
                      <Input id="email" defaultValue={user?.id || ""} readOnly className="bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue="Team Member" readOnly className="bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept">Department</Label>
                      <Input id="dept" defaultValue={user?.department || "General"} />
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
                logoutMutation.mutate();
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
