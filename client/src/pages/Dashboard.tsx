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
    { name: "AI Engine", status: "Operational", color: "text-green-500", latency: "42ms" },
    { name: "Document Store", status: "Operational", color: "text-green-500", latency: "12ms" },
    { name: "Helpdesk API", status: "Degraded", color: "text-amber-500", latency: "850ms" },
    { name: "Auth Service", status: "Operational", color: "text-green-500", latency: "24ms" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section from Screenshot */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-primary">Good Evening, Tyler</h1>
            <p className="text-muted-foreground text-lg">Here's what's happening at Sakura Corp today.</p>
          </div>
          
          <div className="flex items-center gap-6 px-6 py-3 bg-white/40 dark:bg-card/40 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">Sunny, 72°F</span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium tabular-nums">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} PM
              </span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help text-green-600">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wide">Status Unavailable</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64 p-0 rounded-xl overflow-hidden border-border shadow-xl">
                  <div className="bg-secondary/30 p-3 border-b border-border">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Health</h4>
                  </div>
                  <div className="p-3 space-y-3">
                    {systems.map((s) => (
                      <div key={s.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", s.color.replace('text', 'bg'))} />
                          <span className="text-xs font-medium">{s.name}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">{s.latency}</div>
                      </div>
                    ))}
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
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center gap-2 border-b border-border/40 pb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">Departments</CardTitle>
              </CardHeader>
              <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No departments found</p>
              </CardContent>
            </Card>

            {/* Watercooler Section */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold">Watercooler</CardTitle>
                  <Badge variant="secondary" className="font-mono text-[10px] py-0">#general</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">0</span>
                  <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[240px] flex items-center justify-center text-muted-foreground bg-secondary/5">
                  {/* Empty chat area */}
                </div>
                <div className="p-4 border-t border-border/40 flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Type a message..." 
                      className="bg-secondary/20 border-transparent focus-visible:ring-1 focus-visible:ring-primary/20 rounded-full pl-4 pr-10" 
                    />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button size="icon" className="rounded-full w-10 h-10 shadow-lg">
                    <SendHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company News */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <CardTitle className="text-lg font-bold">Company News</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">View All</Button>
              </CardHeader>
              <CardContent className="h-12" />
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions Card */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md p-6">
              <CardTitle className="text-lg font-bold mb-6">Quick Actions</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Plus, label: "New Ticket", color: "text-blue-500", bg: "bg-blue-500/10" },
                  { icon: FileText, label: "Write Doc", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { icon: Calendar, label: "Book Room", color: "text-purple-500", bg: "bg-purple-500/10" },
                  { icon: LifeBuoy, label: "Get Help", color: "text-rose-500", bg: "bg-rose-500/10" }
                ].map((action) => (
                  <button key={action.label} className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-secondary/40 transition-all group outline-none">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", action.bg, action.color)}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Open Tickets Card */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-bold">Open Tickets</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 border-none font-bold">0 Active</Badge>
              </CardHeader>
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">No active tickets</p>
                <Button className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-none font-bold py-6 rounded-2xl transition-colors">
                  + Create New Ticket
                </Button>
              </CardContent>
            </Card>

            {/* Volunteer Events Card */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-bold">Volunteer Events</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-rose-400 font-bold hover:bg-rose-50 transition-colors">Calendar</Button>
              </CardHeader>
              <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No upcoming events</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
