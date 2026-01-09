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
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Department, type News, type Stat, type Comment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { currentUser } from "@/lib/mockData";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
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
        userId: currentUser.id,
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

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-primary tracking-tight">Good Evening, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground text-lg">Here's what's happening at Sakura Corp today.</p>
          </div>
          
          <div className="flex items-center gap-4 p-2 bg-secondary/20 dark:bg-card/40 backdrop-blur-md rounded-[20px] border border-border/50 shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-background dark:bg-card rounded-2xl border border-border/50 shadow-sm">
              <CloudSun className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold">72°F</span>
            </div>
            
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-background dark:bg-card rounded-2xl border border-border/50 shadow-sm">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold tabular-nums">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} PM
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                          </span>
                          <Badge variant="outline" className="text-[9px] py-0 h-4 border-indigo-500/20 text-indigo-500">{item.category}</Badge>
                        </div>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-bold text-primary">Watercooler</CardTitle>
                  <Badge variant="outline" className="font-mono text-[10px] py-0 border-primary/20 bg-primary/5 text-primary">#general</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                  <div className="h-4 w-px bg-border/50" />
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">1 Online</span>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[320px]">
                <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground py-12">
                        <div className="text-center space-y-2">
                          <MessageSquare className="w-8 h-8 mx-auto opacity-10" />
                          <p className="text-xs font-medium opacity-40 italic">Start the conversation...</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={cn(
                          "flex flex-col gap-1 max-w-[80%]",
                          msg.userId === currentUser.id ? "ml-auto items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "px-4 py-2 rounded-2xl text-sm",
                            msg.userId === currentUser.id 
                              ? "bg-primary text-white rounded-br-none shadow-md shadow-primary/20" 
                              : "bg-secondary/40 text-foreground rounded-bl-none border border-border/50"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border/40 flex items-center gap-4 bg-background/30">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <div className="relative flex-1 group">
                    <Input 
                      placeholder="Type a message..." 
                      className="bg-secondary/30 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl pl-4 pr-10 transition-all h-11"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary rounded-lg">
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button 
                    size="icon" 
                    className="rounded-2xl w-11 h-11 shadow-lg shadow-primary/20 hover:scale-105 transition-all shrink-0"
                    onClick={handleSendMessage}
                    disabled={postMessageMutation.isPending || !message.trim()}
                  >
                    <SendHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-bold text-primary">Departments</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 px-4 rounded-xl">
                  Manage
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoadingDepts ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-2xl bg-secondary/20 animate-pulse" />
                    ))
                  ) : departments.length === 0 ? (
                    <div className="col-span-2 py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 opacity-20" />
                      </div>
                      <p className="text-sm font-medium opacity-60">No departments found</p>
                    </div>
                  ) : (
                    departments.slice(0, 4).map((dept) => (
                      <div key={dept.id} className="p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-background transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-8 rounded-full" style={ { backgroundColor: dept.color } } />
                          <div>
                            <p className="text-sm font-bold">{dept.name}</p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{dept.description}</p>
                          </div>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md p-6">
              <div className="flex items-center justify-between mb-8">
                <CardTitle className="text-lg font-bold text-primary">Quick Actions</CardTitle>
                <div className="p-1.5 bg-secondary/50 rounded-lg">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Plus, label: "New Ticket", color: "text-blue-500", bg: "bg-blue-500/10" },
                  { icon: FileText, label: "Write Doc", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { icon: Calendar, label: "Book Room", color: "text-purple-500", bg: "bg-purple-500/10" },
                  { icon: LifeBuoy, label: "Get Help", color: "text-rose-500", bg: "bg-rose-500/10" }
                ].map((action) => (
                  <button key={action.label} className="flex flex-col items-center gap-3 p-5 rounded-2xl hover:bg-secondary/40 border border-transparent hover:border-border/40 transition-all group outline-none">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all", action.bg, action.color)}>
                      <action.icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">{action.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Bell className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-primary">Recent Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {[
                    { title: "System Update", msg: "v2.4.0 is now live with performance improvements.", time: "2h ago" },
                    { title: "New Document", msg: "Sarah shared 'Marketing Strategy 2026'.", time: "5h ago" },
                  ].map((notif, i) => (
                    <div key={i} className="p-4 hover:bg-secondary/10 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-bold">{notif.title}</p>
                        <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{notif.msg}</p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5 py-4 h-auto border-t rounded-none">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-indigo-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-primary">Volunteer Events</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 px-4 rounded-xl">Calendar</Button>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 rounded-2xl bg-secondary/20 flex items-center gap-3 border border-border/40">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary text-center min-w-[40px]">
                    <p className="text-[10px] font-bold uppercase">Jan</p>
                    <p className="text-sm font-black">15</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold">Tech Mentorship</p>
                    <p className="text-[10px] text-muted-foreground">3:00 PM - Virtual</p>
                  </div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground italic py-2">More events coming soon</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
