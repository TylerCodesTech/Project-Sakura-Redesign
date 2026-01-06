import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { tickets, documents, recentActivity } from "@/lib/mockData";
import { ArrowUpRight, CheckCircle2, Clock, FileText, MessageSquare, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import abstractBg from "@assets/generated_images/abstract_sakura_nodes_network_background.png";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
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
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transition-all font-semibold" data-testid="btn-view-tickets">
                View Tickets
              </Button>
              <Button size="lg" className="bg-white/10 hover:bg-white/20 border border-white/20 shadow-none backdrop-blur-sm" data-testid="btn-ask-ai">
                Ask AI Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm bg-gradient-to-br from-white to-purple-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
              <MessageSquare className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-foreground">24</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium inline-flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 12%
                </span> from yesterday
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm bg-gradient-to-br from-white to-pink-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Docs</CardTitle>
              <FileText className="w-4 h-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-foreground">7</div>
              <p className="text-xs text-muted-foreground mt-1">Needs your approval</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Response Time</CardTitle>
              <Clock className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-foreground">1.2h</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> On track
                </span>
              </p>
            </CardContent>
          </Card>
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
