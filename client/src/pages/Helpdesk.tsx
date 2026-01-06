import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tickets } from "@/lib/mockData";
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";

export default function Helpdesk() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Helpdesk</h1>
            <p className="text-muted-foreground mt-1">Manage and route support tickets efficiently.</p>
          </div>
          <Button className="shadow-lg hover:shadow-xl transition-all" data-testid="btn-create-ticket">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-4 justify-between bg-secondary/10">
            <div className="flex items-center gap-3 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." className="pl-9 bg-background border-border" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                Filter
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-secondary/20 cursor-pointer group">
                  <TableCell className="font-mono text-xs text-muted-foreground">{ticket.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {ticket.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ticket.department}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {ticket.status}
                    </span>
                  </TableCell>
                  <TableCell>
                     <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      ticket.priority === 'High' ? 'text-destructive' : 
                      ticket.priority === 'Medium' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        ticket.priority === 'High' ? 'bg-destructive' : 
                        ticket.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                      {ticket.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ticket.assignee}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
