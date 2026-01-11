import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SystemSettingsProvider } from "@/contexts/SystemSettingsContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Helpdesk from "@/pages/Helpdesk";
import TicketView from "@/pages/TicketView";
import Documents from "@/pages/Documents";
import BookView from "@/pages/BookView";
import DocEditor from "@/pages/DocEditor";
import SystemSettings from "@/pages/SystemSettings";
import TeamDirectory from "@/pages/TeamDirectory";
import Login from "@/pages/Login";
import SetupWizard from "@/pages/SetupWizard";
import Reports from "@/pages/Reports";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/setup" component={SetupWizard} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/helpdesk" component={Helpdesk} />
      <ProtectedRoute path="/helpdesk/ticket/:id" component={TicketView} />
      <ProtectedRoute path="/documents" component={Documents} />
      <ProtectedRoute path="/documents/book/:id" component={BookView} />
      <ProtectedRoute path="/documents/edit/:id" component={DocEditor} />
      <ProtectedRoute path="/team" component={TeamDirectory} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/settings" component={SystemSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SystemSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SystemSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
