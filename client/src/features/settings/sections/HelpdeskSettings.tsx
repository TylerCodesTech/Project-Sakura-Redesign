import { useState } from "react";
import { 
  Headphones, Plus, Edit, Trash2, Clock, Mail, MessageSquare, 
  AlertTriangle, CheckCircle, Archive, Settings, RotateCcw,
  Bell, Users, Tag, Calendar, TrendingUp, Filter,
  ExternalLink, Webhook, Zap, Shield, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsCard, SettingsRow } from "../components";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type HelpdeskQueue, type User, type Department } from "@shared/schema";

interface HelpdeskSettingsProps {
  departmentId?: string;
  subsection?: string;
}

interface HelpdeskStats {
  totalTickets: number;
  openTickets: number;
  avgResponseTime: number;
  satisfactionScore: number;
  agentCount: number;
}

const PRIORITY_COLORS = {
  low: "#10b981",
  medium: "#f59e0b", 
  high: "#ef4444",
  urgent: "#dc2626"
};

const STATUS_COLORS = {
  open: "#3b82f6",
  "in-progress": "#f59e0b",
  resolved: "#10b981",
  closed: "#6b7280"
};

export function HelpdeskSettings({ departmentId, subsection }: HelpdeskSettingsProps) {
  const { toast } = useToast();
  const [selectedQueue, setSelectedQueue] = useState<HelpdeskQueue | null>(null);
  const [showCreateQueue, setShowCreateQueue] = useState(false);
  const [showEditQueue, setShowEditQueue] = useState(false);
  
  const [newQueue, setNewQueue] = useState({
    name: "",
    description: "",
    departmentId: departmentId || "",
    priority: "medium" as const,
    autoAssignment: true,
    maxTicketsPerAgent: 10,
    slaHours: 24,
  });

  const { data: queues = [], isLoading } = useQuery<HelpdeskQueue[]>({
    queryKey: ["/api/helpdesk/queues", departmentId],
  });

  const { data: stats } = useQuery<HelpdeskStats>({
    queryKey: ["/api/helpdesk/stats", departmentId],
  });

  const { data: agents = [] } = useQuery<User[]>({
    queryKey: ["/api/helpdesk/agents", departmentId],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const createQueueMutation = useMutation({
    mutationFn: async (data: typeof newQueue) => {
      return apiRequest("POST", "/api/helpdesk/queues", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesk/queues"] });
      setShowCreateQueue(false);
      setNewQueue({
        name: "",
        description: "",
        departmentId: departmentId || "",
        priority: "medium",
        autoAssignment: true,
        maxTicketsPerAgent: 10,
        slaHours: 24,
      });
      toast({
        title: "Queue created",
        description: "The helpdesk queue has been created successfully.",
      });
    },
  });

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.openTickets}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
              <p className="text-xs text-muted-foreground">First response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.satisfactionScore}%</div>
              <p className="text-xs text-muted-foreground">Customer rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.agentCount}</div>
              <p className="text-xs text-muted-foreground">Support team</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="queues" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="queues" className="space-y-6">
          <SettingsCard
            title="Helpdesk Queues"
            description="Manage ticket queues and routing configuration"
            icon={Headphones}
            scope={departmentId ? "department" : "global"}
            helpText="Queues organize tickets by type, priority, or department"
            actions={
              <Button onClick={() => setShowCreateQueue(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Queue
              </Button>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading queues...
                  </div>
                ) : queues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Headphones className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No helpdesk queues configured</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowCreateQueue(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Queue
                    </Button>
                  </div>
                ) : (
                  queues.map((queue) => (
                    <div 
                      key={queue.id}
                      className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                        selectedQueue?.id === queue.id 
                          ? "bg-primary/5 border-primary/30" 
                          : "hover:bg-muted/50 hover:border-border/60"
                      }`}
                      onClick={() => setSelectedQueue(queue)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{queue.name}</h3>
                            <Badge variant="secondary">
                              {queue.priority}
                            </Badge>
                            {queue.autoAssignment && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto-assign
                              </Badge>
                            )}
                          </div>
                          
                          {queue.description && (
                            <p className="text-sm text-muted-foreground mb-3 truncate">
                              {queue.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {queue.slaHours}h SLA
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {queue.maxTicketsPerAgent} per agent
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {(queue as any).openTickets || 0} open
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                {selectedQueue ? (
                  <>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">{selectedQueue.name}</h3>
                      
                      {selectedQueue.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedQueue.description}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Priority</span>
                          <Badge variant="secondary">{selectedQueue.priority}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">SLA</span>
                          <span className="font-medium">{selectedQueue.slaHours} hours</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Max per Agent</span>
                          <span className="font-medium">{selectedQueue.maxTicketsPerAgent}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Auto-assignment</span>
                          <Badge variant={selectedQueue.autoAssignment ? "secondary" : "outline"}>
                            {selectedQueue.autoAssignment ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Open Tickets</span>
                          <span className="font-medium">{(selectedQueue as any).openTickets || 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setShowEditQueue(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Tickets
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Queue Performance</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Resolution Rate</span>
                            <span>87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Avg Response Time</span>
                            <span>2.3h</span>
                          </div>
                          <Progress value={76} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Customer Satisfaction</span>
                            <span>4.2/5</span>
                          </div>
                          <Progress value={84} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-muted-foreground border rounded-lg">
                    <Headphones className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select a queue to view details</p>
                  </div>
                )}
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Queue Configuration"
            description="Global settings for all helpdesk queues"
            icon={Settings}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Default Priority" 
                description="Priority assigned to new tickets when not specified"
              >
                <Select defaultValue="medium">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsRow 
                label="Auto-close Resolved Tickets" 
                description="Automatically close tickets after they've been resolved"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Select defaultValue="7">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Ticket Numbering" 
                description="Format for ticket ID generation"
              >
                <Select defaultValue="sequential">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequential">Sequential (001, 002...)</SelectItem>
                    <SelectItem value="random">Random (ABC123)</SelectItem>
                    <SelectItem value="timestamp">Timestamp Based</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsRow 
                label="Customer Portal" 
                description="Allow customers to create and track tickets"
              >
                <Switch defaultChecked />
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <SettingsCard
            title="Ticket Routing"
            description="Automatically route tickets to appropriate queues and agents"
            icon={RotateCcw}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Auto-assignment" 
                description="Automatically assign tickets to available agents"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Load Balancing" 
                description="How to distribute tickets among agents"
              >
                <Select defaultValue="round-robin">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                    <SelectItem value="workload">By Workload</SelectItem>
                    <SelectItem value="expertise">By Expertise</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsRow 
                label="Escalation Rules" 
                description="Automatically escalate overdue tickets"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm text-muted-foreground">After</span>
                  <Input type="number" defaultValue="24" className="w-16" />
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Priority Escalation" 
                description="Automatically increase priority for aging tickets"
              >
                <Switch />
              </SettingsRow>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Business Rules"
            description="Conditional logic for ticket processing"
            icon={Shield}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Active Rules</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>Urgent tickets → Notify manager immediately</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>VIP customers → Priority queue</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>Keywords "refund" → Finance team</span>
                    <Switch />
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create New Rule
              </Button>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <SettingsCard
            title="Notification Settings"
            description="Configure when and how notifications are sent"
            icon={Bell}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="New Ticket Notifications" 
                description="Notify agents when new tickets are assigned"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Select defaultValue="immediate">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="digest">Daily Digest</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Customer Updates" 
                description="Notify customers about ticket status changes"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="SLA Alerts" 
                description="Alert when tickets approach SLA deadline"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Input type="number" defaultValue="2" className="w-16" />
                  <span className="text-sm text-muted-foreground">hours before</span>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Manager Escalations" 
                description="Notify managers of escalated tickets"
              >
                <Switch defaultChecked />
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <SettingsCard
            title="Response Templates"
            description="Pre-written responses for common issues"
            icon={FileText}
            scope={departmentId ? "department" : "global"}
            actions={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            }
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Welcome Message</h4>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    Thank you for contacting support. We've received your request...
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Ticket Resolved</h4>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    Your issue has been resolved. Please let us know if...
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">More Info Needed</h4>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    To help resolve your issue faster, please provide...
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Escalation Notice</h4>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    Your ticket has been escalated to our senior team...
                  </p>
                </div>
              </div>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <SettingsCard
            title="External Integrations"
            description="Connect with external services and tools"
            icon={Webhook}
            scope={departmentId ? "department" : "global"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email Integration</h4>
                    <p className="text-sm text-muted-foreground">Create tickets from emails</p>
                  </div>
                  <Switch defaultChecked className="ml-auto" />
                </div>
                <div className="text-sm text-muted-foreground">
                  support@company.com → New tickets
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Slack Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send alerts to Slack channels</p>
                  </div>
                  <Switch className="ml-auto" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Not configured
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Webhook className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Webhooks</h4>
                    <p className="text-sm text-muted-foreground">Send events to external services</p>
                  </div>
                  <Switch className="ml-auto" />
                </div>
                <div className="text-sm text-muted-foreground">
                  2 endpoints configured
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Knowledge Base</h4>
                    <p className="text-sm text-muted-foreground">Link to external documentation</p>
                  </div>
                  <Switch defaultChecked className="ml-auto" />
                </div>
                <div className="text-sm text-muted-foreground">
                  docs.company.com
                </div>
              </div>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-6">
          <SettingsCard
            title="Reporting Configuration"
            description="Configure reports and analytics for helpdesk performance"
            icon={TrendingUp}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Daily Reports" 
                description="Generate daily performance summaries"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Select defaultValue="email">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="dashboard">Dashboard Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Performance Metrics" 
                description="Track key performance indicators"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Response time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Resolution time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Customer satisfaction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">Agent productivity</span>
                  </div>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Data Retention" 
                description="How long to keep helpdesk data and reports"
              >
                <Select defaultValue="365">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="730">2 years</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>
      </Tabs>

      {/* Create Queue Dialog */}
      <Dialog open={showCreateQueue} onOpenChange={setShowCreateQueue}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Helpdesk Queue</DialogTitle>
            <DialogDescription>
              Create a new queue to organize and route support tickets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Queue Name *</Label>
              <Input
                placeholder="e.g., Technical Support"
                value={newQueue.name}
                onChange={(e) => setNewQueue(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this queue..."
                value={newQueue.description}
                onChange={(e) => setNewQueue(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select 
                  value={newQueue.priority} 
                  onValueChange={(value: any) => setNewQueue(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>SLA Hours</Label>
                <Input
                  type="number"
                  value={newQueue.slaHours}
                  onChange={(e) => setNewQueue(prev => ({ ...prev, slaHours: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Tickets per Agent</Label>
              <div className="px-3">
                <Slider
                  value={[newQueue.maxTicketsPerAgent]}
                  onValueChange={([value]) => setNewQueue(prev => ({ ...prev, maxTicketsPerAgent: value }))}
                  min={1}
                  max={50}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1</span>
                  <span className="font-medium">{newQueue.maxTicketsPerAgent}</span>
                  <span>50</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-assignment</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign tickets to available agents
                </p>
              </div>
              <Switch
                checked={newQueue.autoAssignment}
                onCheckedChange={(checked) => setNewQueue(prev => ({ ...prev, autoAssignment: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateQueue(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createQueueMutation.mutate(newQueue)}
              disabled={createQueueMutation.isPending || !newQueue.name}
            >
              {createQueueMutation.isPending ? "Creating..." : "Create Queue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}