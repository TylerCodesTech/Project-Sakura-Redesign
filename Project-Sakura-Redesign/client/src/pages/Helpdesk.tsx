import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tickets } from "@/lib/mockData";
import { Filter, MoreHorizontal, Search, User, Users as UsersIcon, Clock, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Helpdesk() {
  const [activeView, setActiveView] = useState("all");

  const filteredTickets = tickets.filter(ticket => {
    if (activeView === "assigned") return ticket.assignee === "Sarah C.";
    if (activeView === "department") return ticket.department === "IT Support";
    return true;
  });

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Helpdesk</h1>
            <p className="text-muted-foreground mt-1">Manage and route support tickets efficiently.</p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={activeView} onValueChange={setActiveView} className="bg-secondary/20 p-1 rounded-xl">
              <TabsList className="bg-transparent border-0">
                <TabsTrigger value="all" className="rounded-lg px-4">All</TabsTrigger>
                <TabsTrigger value="assigned" className="rounded-lg px-4 gap-2">
                  <User className="w-4 h-4" /> Assigned
                </TabsTrigger>
                <TabsTrigger value="department" className="rounded-lg px-4 gap-2">
                  <UsersIcon className="w-4 h-4" /> Dept
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/40 bg-secondary/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Average Response Time
              </CardDescription>
              <CardTitle className="text-2xl">2h 15m</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/40 bg-secondary/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Urgent Tickets
              </CardDescription>
              <CardTitle className="text-2xl">4</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/40 bg-secondary/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" /> Team Capacity
              </CardDescription>
              <CardTitle className="text-2xl">82%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-4 justify-between bg-secondary/5">
            <div className="flex items-center gap-3 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." className="pl-10 bg-background border-border rounded-xl" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                Filter
              </Button>
            </div>
          </div>

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
                <TableRow key={ticket.id} className="hover:bg-secondary/10 cursor-pointer group border-b border-border/50">
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
              {filteredTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Search className="w-8 h-8" />
                      <p>No tickets found in this view.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
