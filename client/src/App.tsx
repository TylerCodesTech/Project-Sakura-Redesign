import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Helpdesk from "@/pages/Helpdesk";
import TicketView from "@/pages/TicketView";
import Documents from "@/pages/Documents";
import BookView from "@/pages/BookView";
import DocEditor from "@/pages/DocEditor";
import SystemSettings from "@/pages/SystemSettings";
import Login from "@/pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/helpdesk" component={Helpdesk} />
      <Route path="/helpdesk/ticket/:id" component={TicketView} />
      <Route path="/documents" component={Documents} />
      <Route path="/documents/book/:id" component={BookView} />
      <Route path="/documents/edit/:id" component={DocEditor} />
      <Route path="/settings" component={SystemSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
