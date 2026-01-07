import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tickets } from "@/lib/mockData";
import { 
  Filter, 
  MoreHorizontal, 
  Search, 
  User, 
  Users as UsersIcon, 
  Clock, 
  AlertCircle,
  LayoutList,
  LayoutGrid,
  Columns as ColumnsIcon,
  Calendar,
  MessageCircle
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useLocation } from "wouter";

export default function Helpdesk() {
  const [activeView, setActiveView] = useState("all");
  const [displayMode, setDisplayMode] = useState("list"); // list, card, kanban
  const [, setLocation] = useLocation();

  const filteredTickets = tickets.filter(ticket => {
    if (activeView === "assigned") return ticket.assignee === "Sarah C.";
    if (activeView === "department") return ticket.department === "IT Support";
    return true;
  });

  const kanbanColumns = ["Open", "In Progress", "Resolved", "Pending"];

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Helpdesk</h1>
            <p className="text-muted-foreground mt-1">Manage and route support tickets efficiently.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-secondary/20 p-1 rounded-xl flex items-center gap-1">
              <Button 
                variant={displayMode === "list" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-lg h-8 w-8 p-0"
                onClick={() => setDisplayMode("list")}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
              <Button 
                variant={displayMode === "card" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-lg h-8 w-8 p-0"
                onClick={() => setDisplayMode("card")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant={displayMode === "kanban" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-lg h-8 w-8 p-0"
                onClick={() => setDisplayMode("kanban")}
              >
                <ColumnsIcon className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />
            <Tabs value={activeView} onValueChange={setActiveView} className="bg-secondary/20 p-1 rounded-xl">
              <TabsList className="bg-transparent border-0 h-8">
                <TabsTrigger value="all" className="rounded-lg px-4 h-7 text-xs">All</TabsTrigger>
                <TabsTrigger value="assigned" className="rounded-lg px-4 h-7 text-xs gap-2">
                  <User className="w-3 h-3" /> Assigned
                </TabsTrigger>
                <TabsTrigger value="department" className="rounded-lg px-4 h-7 text-xs gap-2">
                  <UsersIcon className="w-3 h-3" /> Dept
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {displayMode !== "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border/40 bg-secondary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Average Response Time
                </CardDescription>
                <CardTitle className="text-2xl">2h 15m</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/40 bg-secondary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" /> Urgent Tickets
                </CardDescription>
                <CardTitle className="text-2xl">4</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/40 bg-secondary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" /> Team Capacity
                </CardDescription>
                <CardTitle className="text-2xl">82%</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <div className="flex items-center gap-4 justify-end">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2 shadow-sm">
              <Filter className="w-4 h-4 text-muted-foreground" />
              Filter
            </Button>
          </div>
        </div>

        {displayMode === "list" && (
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="w-[120px] py-4">Ticket ID</TableHead>
                  <TableHead>Subject & Dept</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="hover:bg-secondary/10 cursor-pointer group border-b border-border/50"
                    onClick={() => setLocation(`/helpdesk/ticket/${ticket.id}`)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground pl-6">{ticket.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {ticket.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                         <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-normal bg-background">{ticket.department}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                        ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                        ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-600 border-slate-500/20'
                      }`}>
                        {ticket.status}
                      </span>
                    </TableCell>
                    <TableCell>
                       <span className={`inline-flex items-center gap-2 text-xs font-semibold ${
                        ticket.priority === 'High' ? 'text-destructive' : 
                        ticket.priority === 'Medium' ? 'text-orange-600' : 'text-emerald-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          ticket.priority === 'High' ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                          ticket.priority === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
                        }`} />
                        {ticket.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ticket.assignee}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {displayMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
                onClick={() => setLocation(`/helpdesk/ticket/${ticket.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">{ticket.id}</Badge>
                    <Badge className={
                      ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                      ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-600 border-slate-500/20'
                    }>{ticket.status}</Badge>
                  </div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors leading-tight">{ticket.title}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3 h-3" /> {ticket.created}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-normal">{ticket.department}</Badge>
                    <div className="flex items-center gap-1.5 ml-auto">
                       <span className={`w-1.5 h-1.5 rounded-full ${
                        ticket.priority === 'High' ? 'bg-destructive' : 
                        ticket.priority === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
                      }`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{ticket.priority}</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border">
                        <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">{ticket.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground font-medium">{ticket.assignee}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1 text-[10px]">
                        <MessageCircle className="w-3 h-3" /> 3
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {displayMode === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[500px]">
            {kanbanColumns.map((col) => {
              const colTickets = filteredTickets.filter(t => t.status === col);
              return (
                <div key={col} className="flex-1 min-w-[300px] flex flex-col gap-3">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold tracking-tight">{col}</h3>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{colTickets.length}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="w-3 h-3" /></Button>
                  </div>
                  <ScrollArea className="flex-1 bg-secondary/5 border border-border/40 rounded-2xl p-3">
                    <div className="flex flex-col gap-3">
                      {colTickets.map((ticket) => (
                        <Card 
                          key={ticket.id} 
                          className="shadow-sm hover:border-primary/40 transition-all cursor-pointer"
                          onClick={() => setLocation(`/helpdesk/ticket/${ticket.id}`)}
                        >
                          <CardHeader className="p-3 pb-2">
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-[9px] font-mono text-muted-foreground">{ticket.id}</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                ticket.priority === 'High' ? 'bg-destructive' : 
                                ticket.priority === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
                              }`} />
                            </div>
                            <h4 className="text-xs font-semibold leading-snug">{ticket.title}</h4>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5 border">
                                  <AvatarFallback className="text-[8px]">{ticket.assignee[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-muted-foreground">{ticket.assignee}</span>
                              </div>
                              <Badge variant="outline" className="text-[8px] py-0 h-3.5 px-1 font-normal opacity-70">{ticket.department}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        )}

        {filteredTickets.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-secondary/5 rounded-3xl border border-dashed">
            <Search className="w-10 h-10 opacity-20 mb-3" />
            <p className="text-sm">No tickets found in this view.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
