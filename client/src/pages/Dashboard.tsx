import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { tickets, documents, recentActivity } from "@/lib/mockData";
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MessageSquare, 
  Plus, 
  Sparkles,
  PenLine,
  Calendar,
  LifeBuoy,
  CloudSun,
  Activity,
  AlertCircle,
  Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import abstractBg from "@assets/generated_images/abstract_sakura_nodes_network_background.png";
import { useState, useEffect } from "react";

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
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card/50 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-blue-500" />
              <div className="text-sm">
                <span className="font-semibold">72°F</span>
                <span className="text-muted-foreground ml-1">Partly Cloudy</span>
              </div>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div className="text-sm font-medium tabular-nums">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 cursor-help">
                  <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-600">All Systems Nominal*</span>
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
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {s.latency}
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto flex-col items-start p-4 gap-3 rounded-2xl border-2 border-primary/5 hover:border-primary/20 hover:bg-primary/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">New Ticket</p>
              <p className="text-xs text-muted-foreground">Get technical help</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto flex-col items-start p-4 gap-3 rounded-2xl border-2 border-rose-500/5 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
              <PenLine className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Write Doc</p>
              <p className="text-xs text-muted-foreground">Create knowledge</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto flex-col items-start p-4 gap-3 rounded-2xl border-2 border-amber-500/5 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Book Room</p>
              <p className="text-xs text-muted-foreground">Meeting spaces</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto flex-col items-start p-4 gap-3 rounded-2xl border-2 border-indigo-500/5 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Get Help</p>
              <p className="text-xs text-muted-foreground">24/7 AI Support</p>
            </div>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 shadow-xl">
          <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{ 
              backgroundImage: `url(${abstractBg})`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>AI Insights Available</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">
              Good morning, Sarah
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl mb-8 leading-relaxed">
              You have <span className="font-semibold bg-white/20 px-1 rounded">4 high priority</span> tickets and <span className="font-semibold bg-white/20 px-1 rounded">2 documents</span> awaiting review today.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tickets */}
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">Recent Tickets</CardTitle>
                <CardDescription>Support requests routed by AI</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-6 hover:bg-secondary/30 transition-colors group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full ${
                        ticket.priority === 'High' ? 'bg-destructive' : 
                        ticket.priority === 'Medium' ? 'bg-orange-400' : 'bg-green-400'
                      }`} />
                      <div>
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{ticket.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{ticket.id}</span>
                          <span className="text-xs text-muted-foreground">{ticket.department}</span>
                          <span className="text-xs text-muted-foreground">• {ticket.created}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                        {ticket.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="font-display">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.map((activity, i) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {i !== recentActivity.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-border/50" />
                    )}
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarFallback className="text-xs bg-secondary">{activity.user[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium text-foreground">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
