import { Search, Bell, HelpCircle, X, Sparkles, User, Settings, LogOut, Moon, Sun, Monitor, Mail, MessageSquare } from "lucide-react";
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
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="w-5 h-5 fill-primary/20" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Sakura</span>
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
                />
              </div>

              <div className="space-y-8">
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

                      return (
                        <Link key={item.href} href={item.href}>
                          <a 
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
            </div>
          </PopoverContent>
        </Popover>

        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>

        <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 group outline-none">
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
                      <RadioGroup defaultValue="system" className="flex gap-4">
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

            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-[-8px] my-2" />
            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
