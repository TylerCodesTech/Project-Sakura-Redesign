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
  SendHorizontal
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
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const systems = [
    { name: "AI Engine", status: "Operational", color: "bg-emerald-500", latency: "42ms" },
    { name: "Document Store", status: "Operational", color: "bg-emerald-500", latency: "12ms" },
    { name: "Helpdesk API", status: "Degraded", color: "bg-amber-500", latency: "850ms" },
    { name: "Auth Service", status: "Operational", color: "bg-emerald-500", latency: "24ms" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section with Integrated Status Bar */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Good Evening, Tyler</h1>
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
                  <button className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-help group outline-none">
                    <Activity className="w-5 h-5 text-emerald-500 animate-pulse group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Nominal</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="w-[320px] p-0 rounded-2xl overflow-hidden border border-border shadow-2xl" sideOffset={12} align="end">
                  <div className="bg-secondary/50 dark:bg-secondary/20 p-4 border-b border-border">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">System Infrastructure</h4>
                  </div>
                  <div className="p-4 space-y-4 bg-background/50 backdrop-blur-xl">
                    {systems.map((s) => (
                      <div key={s.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", s.color)} />
                          <span className="text-sm font-medium text-foreground">{s.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/50">
                          {s.latency}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-secondary/30 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">All systems are operational</span>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">History</Button>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Departments Card */}
            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border/40 pb-4 bg-secondary/10">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">Departments</CardTitle>
              </CardHeader>
              <CardContent className="py-16 flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 opacity-20" />
                </div>
                <p className="text-sm font-medium opacity-60">No departments found</p>
              </CardContent>
            </Card>

            {/* Watercooler Section */}
            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-bold">Watercooler</CardTitle>
                  <Badge variant="outline" className="font-mono text-[10px] py-0 border-primary/20 bg-primary/5 text-primary">#general</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                  <div className="h-4 w-px bg-border/50" />
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">0 Online</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[240px] flex items-center justify-center text-muted-foreground bg-secondary/5">
                  <div className="text-center space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto opacity-10" />
                    <p className="text-xs font-medium opacity-40 italic">Start the conversation...</p>
                  </div>
                </div>
                <div className="p-4 border-t border-border/40 flex items-center gap-4 bg-background/30">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <div className="relative flex-1 group">
                    <Input 
                      placeholder="Type a message..." 
                      className="bg-secondary/30 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl pl-4 pr-10 transition-all" 
                    />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary rounded-lg">
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button size="icon" className="rounded-2xl w-11 h-11 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    <SendHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company News */}
            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <CardTitle className="text-lg font-bold">Company News</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 px-4 rounded-xl">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="h-16 flex items-center justify-center">
                <p className="text-xs font-medium text-muted-foreground/60 italic">Checking for new updates...</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions Card */}
            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md p-6">
              <div className="flex items-center justify-between mb-8">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
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

            {/* Open Tickets Card */}
            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-bold">Open Tickets</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold tabular-nums">0 Active</Badge>
              </CardHeader>
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground font-medium opacity-60">No active tickets requiring your attention</p>
                <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none font-bold py-7 rounded-2xl transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Ticket
                </Button>
              </CardContent>
            </Card>

            {/* Volunteer Events Card */}
            <Card className="border border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4 bg-indigo-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-bold">Volunteer Events</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 px-4 rounded-xl">Calendar</Button>
              </CardHeader>
              <CardContent className="py-16 flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm font-medium opacity-60 italic">No upcoming events scheduled</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
