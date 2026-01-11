import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CloudSun, 
  Clock, 
  Activity,
  Calendar,
  MessageSquare,
  FileText,
  Plus,
  PenLine,
  LifeBuoy,
  AlertCircle,
  Smile,
  Paperclip,
  SendHorizontal,
  TrendingUp,
  Users,
  Building2,
  Bell,
  ChevronRight as ChevronRightIcon,
  Ticket,
  Loader2,
  Monitor,
  Laptop,
  Network,
  Key,
  HelpCircle,
  Settings,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Department, type News, type Stat, type Comment, type Helpdesk, type TicketFormCategory } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { toast } from "sonner";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [message, setMessage] = useState("");
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketHelpdeskId, setTicketHelpdeskId] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: helpdesks = [] } = useQuery<Helpdesk[]>({
    queryKey: ["/api/helpdesks"],
  });

  const { data: formCategories = [] } = useQuery<TicketFormCategory[]>({
    queryKey: ["/api/helpdesks", ticketHelpdeskId, "form-categories"],
    queryFn: async () => {
      if (!ticketHelpdeskId) return [];
      const res = await fetch(`/api/helpdesks/${ticketHelpdeskId}/form-categories`);
      return res.json();
    },
    enabled: !!ticketHelpdeskId,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: { 
      helpdeskId: string; 
      title: string; 
      description: string; 
      priority: string;
      departmentId: string;
    }) => {
      const res = await apiRequest("POST", "/api/tickets", {
        ...data,
        ticketType: "request",
        source: "web",
        createdBy: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Ticket created successfully");
      setIsCreateTicketOpen(false);
      setTicketTitle("");
      setTicketDescription("");
      setTicketHelpdeskId("");
      setTicketPriority("medium");
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: () => {
      toast.error("Failed to create ticket");
    },
  });

  const { data: news = [], isLoading: isLoadingNews } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const { data: backendStats = [], isLoading: isLoadingStats } = useQuery<Stat[]>({
    queryKey: ["/api/stats"],
  });

  const { data: messages = [] } = useQuery<Comment[]>({
    queryKey: ["/api/watercooler"],
    refetchInterval: 3000,
  });

  const postMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/watercooler", {
        content,
        userId: user?.id || "anonymous",
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/watercooler"] });
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    postMessageMutation.mutate(message);
  };

  const systems = [
    { name: "AI Engine", status: "Operational", color: "bg-emerald-400", latency: "42ms" },
    { name: "Document Store", status: "Operational", color: "bg-emerald-400", latency: "12ms" },
    { name: "Helpdesk API", status: "Degraded", color: "bg-rose-400/30", latency: "850ms" },
    { name: "Auth Service", status: "Operational", color: "bg-emerald-400", latency: "24ms" },
  ];

  const userName = user?.username || "User";
  const companyName = settings.companyName || "Your Company";

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-primary tracking-tight">{getTimeGreeting()}, {userName}</h1>
            <p className="text-muted-foreground text-lg">Here's what's happening at {companyName} today.</p>
          </div>
          
          <div className="flex items-center gap-4 p-2 bg-secondary/20 dark:bg-card/40 backdrop-blur-md rounded-[20px] border border-border/50 shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-background dark:bg-card rounded-2xl border border-border/50 shadow-sm">
              <CloudSun className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold">72°F</span>
            </div>
            
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-background dark:bg-card rounded-2xl border border-border/50 shadow-sm">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold tabular-nums">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors cursor-help group outline-none">
                    <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Nominal</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="w-[320px] p-0 rounded-3xl overflow-hidden border-none shadow-[0_20px_50px_rgba(219,39,119,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]" sideOffset={12} align="end">
                  <div className="bg-primary/40 dark:bg-primary/60 backdrop-blur-md p-4 px-6 border-b border-white/10">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">System Infrastructure</h4>
                  </div>
                  <div className="bg-primary dark:bg-primary/90 p-6 space-y-5">
                    {systems.map((s) => (
                      <div key={s.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]", s.color)} />
                          <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{s.name}</span>
                        </div>
                        <div className="text-[10px] font-black text-white/90 bg-white/20 px-2 py-1 rounded-lg border border-white/10 backdrop-blur-sm min-w-[50px] text-center">
                          {s.latency}
                        </div>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <Bell className="w-4 h-4 text-indigo-500" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">Company News</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 px-4 rounded-xl">
                  View All
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {isLoadingNews ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl bg-secondary/20 animate-pulse" />
                  ))
                ) : (
                  news.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-secondary/20 transition-colors cursor-pointer group">
                      <div className="space-y-1">
                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge variant="secondary" className="rounded-full px-3 bg-primary/10 text-primary hover:bg-primary/20">
                        New
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {isLoadingStats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border border-border/50 shadow-sm rounded-3xl bg-white/60 dark:bg-card/60 backdrop-blur-md">
                    <CardContent className="p-4 h-24 flex flex-col justify-center">
                      <div className="h-4 w-16 bg-secondary/30 rounded animate-pulse mb-2" />
                      <div className="h-8 w-12 bg-secondary/20 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                backendStats.map((stat) => (
                  <Card key={stat.id} className="border border-border/50 shadow-sm rounded-3xl bg-white/60 dark:bg-card/60 backdrop-blur-md hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground font-medium capitalize">{stat.key.replace(/_/g, " ")}</p>
                      <p className="text-3xl font-black text-primary mt-1 group-hover:scale-105 transition-transform origin-left">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-bold">{stat.change || "+0%"}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                    <Building2 className="w-4 h-4 text-cyan-500" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">Departments</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 px-4 rounded-xl">
                  View All
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {isLoadingDepts ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-2xl bg-secondary/20 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {departments.slice(0, 4).map((dept) => (
                      <div 
                        key={dept.id} 
                        className="p-4 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                            style={{ backgroundColor: dept.color || '#7c3aed' }}
                          >
                            {dept.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-primary truncate group-hover:text-primary transition-colors">{dept.name}</p>
                            <p className="text-xs text-muted-foreground">12 members</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-border/50 shadow-sm rounded-3xl bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-2xl border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-medium">
                      <div className="p-1.5 bg-rose-500/10 rounded-lg">
                        <Ticket className="w-4 h-4 text-rose-500" />
                      </div>
                      Create Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {showCategorySelection && selectedCategoryId && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 mr-1"
                            onClick={() => {
                              setSelectedCategoryId(null);
                              setShowCategorySelection(true);
                            }}
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                        )}
                        <Ticket className="w-5 h-5 text-primary" />
                        {showCategorySelection && !selectedCategoryId 
                          ? "Select Issue Type" 
                          : "Create New Ticket"}
                      </DialogTitle>
                      <DialogDescription>
                        {showCategorySelection && !selectedCategoryId
                          ? "What type of issue are you experiencing?"
                          : "Submit a new support ticket. Choose the appropriate helpdesk for your request."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {showCategorySelection && !selectedCategoryId && formCategories.length > 0 ? (
                      <div className="py-4">
                        <div className="grid grid-cols-2 gap-4">
                          {formCategories.filter(c => c.enabled !== "false").sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((category) => {
                            const CATEGORY_ICONS: Record<string, any> = {
                              Monitor, Laptop, Network, Key, HelpCircle, Settings, Mail, Ticket
                            };
                            const IconComponent = CATEGORY_ICONS[category.icon || "HelpCircle"] || HelpCircle;
                            return (
                              <button
                                key={category.id}
                                onClick={() => {
                                  setSelectedCategoryId(category.id);
                                }}
                                className="group p-6 rounded-xl border-2 border-border/50 hover:border-primary/50 bg-card hover:bg-primary/5 transition-all text-left"
                              >
                                <div className="flex flex-col items-center text-center gap-3">
                                  <div 
                                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${category.color || "#3b82f6"}20` }}
                                  >
                                    <IconComponent className="w-7 h-7" style={{ color: category.color || "#3b82f6" }} />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-sm">{category.name}</h3>
                                    {category.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Helpdesk <span className="text-destructive">*</span></Label>
                            <Select 
                              value={ticketHelpdeskId} 
                              onValueChange={(value) => {
                                setTicketHelpdeskId(value);
                                setSelectedCategoryId(null);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a helpdesk..." />
                              </SelectTrigger>
                              <SelectContent>
                                {helpdesks.filter(h => h.enabled === "true").map((helpdesk) => {
                                  const dept = departments.find(d => d.id === helpdesk.departmentId);
                                  return (
                                    <SelectItem key={helpdesk.id} value={helpdesk.id}>
                                      <div className="flex items-center gap-2">
                                        {dept && (
                                          <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: dept.color }}
                                          />
                                        )}
                                        {helpdesk.name}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                                {helpdesks.filter(h => h.enabled === "true").length === 0 && (
                                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                    No helpdesks available. Contact your administrator.
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {ticketHelpdeskId && formCategories.length > 1 && !selectedCategoryId && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setShowCategorySelection(true)}
                            >
                              <HelpCircle className="w-4 h-4 mr-2" />
                              Select Issue Type
                            </Button>
                          )}
                          
                          {selectedCategoryId && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                              {(() => {
                                const category = formCategories.find(c => c.id === selectedCategoryId);
                                if (!category) return null;
                                const CATEGORY_ICONS: Record<string, any> = {
                                  Monitor, Laptop, Network, Key, HelpCircle, Settings, Mail, Ticket
                                };
                                const IconComponent = CATEGORY_ICONS[category.icon || "HelpCircle"] || HelpCircle;
                                return (
                                  <>
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                                      style={{ backgroundColor: `${category.color || "#3b82f6"}20` }}
                                    >
                                      <IconComponent className="w-4 h-4" style={{ color: category.color || "#3b82f6" }} />
                                    </div>
                                    <span className="text-sm font-medium">{category.name}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="ml-auto h-6 text-xs"
                                      onClick={() => setShowCategorySelection(true)}
                                    >
                                      Change
                                    </Button>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label>Title <span className="text-destructive">*</span></Label>
                            <Input 
                              placeholder="Brief description of your issue"
                              value={ticketTitle}
                              onChange={(e) => setTicketTitle(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                              placeholder="Provide more details about your request..."
                              className="min-h-[100px]"
                              value={ticketDescription}
                              onChange={(e) => setTicketDescription(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={ticketPriority} onValueChange={setTicketPriority}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsCreateTicketOpen(false);
                              setSelectedCategoryId(null);
                              setShowCategorySelection(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              const helpdesk = helpdesks.find(h => h.id === ticketHelpdeskId);
                              if (!ticketHelpdeskId || !ticketTitle.trim()) {
                                toast.error("Please fill in all required fields");
                                return;
                              }
                              createTicketMutation.mutate({
                                helpdeskId: ticketHelpdeskId,
                                title: ticketTitle,
                                description: ticketDescription,
                                priority: ticketPriority,
                                departmentId: helpdesk?.departmentId || "",
                              });
                            }}
                            disabled={createTicketMutation.isPending}
                          >
                            {createTicketMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Ticket"
                            )}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-2xl border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-medium">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <PenLine className="w-4 h-4 text-blue-500" />
                  </div>
                  New Document
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-2xl border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-medium">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <LifeBuoy className="w-4 h-4 text-amber-500" />
                  </div>
                  Get Support
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm rounded-3xl bg-white/60 dark:bg-card/60 backdrop-blur-md flex flex-col h-[400px]">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-500/10 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">Water Cooler</CardTitle>
                </div>
                <Badge variant="outline" className="rounded-full text-xs font-black">
                  Live
                </Badge>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-3">
                    {messages.map((msg, i) => (
                      <div key={msg.id || i} className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(msg.userId || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="bg-secondary/30 rounded-2xl rounded-tl-md px-3 py-2 max-w-[85%]">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-border/40 bg-secondary/5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input 
                        placeholder="Say something..." 
                        className="h-10 rounded-2xl border-border/50 pr-20 bg-background/50"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-secondary/50">
                          <Smile className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-secondary/50">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      className="h-10 w-10 rounded-2xl shadow-sm"
                      onClick={handleSendMessage}
                      disabled={postMessageMutation.isPending}
                    >
                      <SendHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
