import { useState, useEffect } from "react";
import {
  Clock,
  Ticket,
  Mail,
  Webhook,
  MessagesSquare,
  Plus,
  Trash2,
  ChevronRight,
  Globe,
  Save,
  Settings,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Copy,
  ToggleLeft,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { type Department } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  SettingsHeader,
  SettingsCard,
  SettingsSection,
  SettingsRow,
  DepartmentSelector,
} from "../components";

interface HelpdeskSettingsProps {
  subsection?: string;
  initialDepartmentId?: string;
}

const mockCustomFields = [
  { id: "1", name: "Asset ID", type: "text", required: true },
  { id: "2", name: "Urgency Level", type: "select", required: true, options: ["Low", "Medium", "High", "Critical"] },
  { id: "3", name: "Affected Systems", type: "multiselect", required: false, options: ["Email", "VPN", "CRM", "ERP"] },
];

const mockEmailTemplates = [
  { id: "1", name: "Ticket Created", trigger: "ticket_created", enabled: true },
  { id: "2", name: "Status Updated", trigger: "ticket_updated", enabled: true },
  { id: "3", name: "Ticket Resolved", trigger: "ticket_resolved", enabled: true },
  { id: "4", name: "SLA Warning", trigger: "sla_warning", enabled: false },
];

const mockWebhooks = [
  { id: "1", name: "Slack Notifications", url: "https://hooks.slack.com/...", events: ["ticket.created", "ticket.resolved"], enabled: true },
  { id: "2", name: "JIRA Integration", url: "https://company.atlassian.net/...", events: ["ticket.created"], enabled: true },
];

export function HelpdeskSettings({ subsection, initialDepartmentId }: HelpdeskSettingsProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const getInitialTab = () => {
    if (!subsection || subsection === "helpdesk" || subsection === "helpdesk-overview") return "overview";
    return subsection.replace("helpdesk-", "");
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  useEffect(() => {
    if (departments.length > 0 && !selectedDepartment) {
      if (initialDepartmentId) {
        const dept = departments.find((d) => d.id === initialDepartmentId);
        if (dept) setSelectedDepartment(dept);
      } else {
        setSelectedDepartment(departments[0]);
      }
    }
  }, [departments, initialDepartmentId, selectedDepartment]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              Ticket Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockCustomFields.length}</p>
            <p className="text-xs text-muted-foreground">Custom fields configured</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockEmailTemplates.filter(t => t.enabled).length}/{mockEmailTemplates.length}</p>
            <p className="text-xs text-muted-foreground">Templates active</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Webhook className="w-4 h-4 text-primary" />
              Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockWebhooks.filter(w => w.enabled).length}</p>
            <p className="text-xs text-muted-foreground">Active integrations</p>
          </CardContent>
        </Card>
      </div>

      <SettingsCard
        title="Quick Settings"
        description="Common configurations for this department's helpdesk."
        icon={Settings}
      >
        <div className="space-y-4">
          <SettingsRow label="Enable Helpdesk" description="Allow ticket submission for this department.">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Public Access" description="Allow non-authenticated users to submit tickets.">
            <Switch />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Auto-Assignment" description="Automatically assign tickets to available agents.">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="AI Suggestions" description="Enable AI-powered response suggestions.">
            <Switch defaultChecked />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );

  const renderTicketSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Custom Fields"
        description="Define additional fields for ticket creation forms."
        icon={Edit3}
        actions={
          <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Field
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Field</DialogTitle>
                <DialogDescription>
                  Create a new custom field for ticket forms in this department.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Field Name</Label>
                  <Input placeholder="e.g., Asset ID" />
                </div>
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select defaultValue="text">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="multiselect">Multi-Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Required Field</Label>
                  <Switch />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddFieldOpen(false)}>
                  Cancel
                </Button>
                <Button>Create Field</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-3">
          {mockCustomFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
            >
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{field.name}</span>
                    {field.required && (
                      <Badge variant="secondary" className="text-[10px]">Required</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{field.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsCard
          title="Form Settings"
          description="Configure ticket form behavior."
          icon={Ticket}
        >
          <div className="space-y-4">
            <SettingsRow label="Rich Text Editor" description="Allow formatted text in descriptions.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="File Attachments" description="Allow users to attach files.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="Max Attachment Size" vertical>
              <Select defaultValue="10">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 MB</SelectItem>
                  <SelectItem value="10">10 MB</SelectItem>
                  <SelectItem value="25">25 MB</SelectItem>
                  <SelectItem value="50">50 MB</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Default Values"
          description="Set defaults for new tickets."
          icon={Settings}
        >
          <div className="space-y-4">
            <SettingsRow label="Default Priority" vertical>
              <Select defaultValue="medium">
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
            </SettingsRow>
            <SettingsRow label="Auto-Tagging" description="Automatically tag tickets using AI.">
              <Switch defaultChecked />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    </div>
  );

  const renderSLASettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="SLA Policies"
        description="Define response and resolution time targets by priority."
        icon={Clock}
      >
        <div className="space-y-6">
          {["Urgent", "High", "Medium", "Low"].map((priority, index) => (
            <div key={priority} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 rounded-lg bg-secondary/10">
              <div>
                <Badge
                  variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {priority}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">First Response</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={[15, 60, 240, 480][index]} className="w-20 h-8" />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Resolution Target</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={[60, 240, 480, 1440][index]} className="w-20 h-8" />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Escalation</Label>
                <Switch defaultChecked={index < 2} />
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Business Hours"
        description="Define when SLA timers are active."
        icon={Globe}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SettingsRow label="Use Custom Hours" description="Override global business hours for this department.">
              <Switch />
            </SettingsRow>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" defaultValue="17:00" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <SettingsRow label="Timezone" vertical>
              <Select defaultValue="pst">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pst">(GMT-08:00) Pacific Time</SelectItem>
                  <SelectItem value="est">(GMT-05:00) Eastern Time</SelectItem>
                  <SelectItem value="utc">(GMT+00:00) UTC</SelectItem>
                  <SelectItem value="gmt">(GMT+00:00) London</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="24/7 Support" description="SLA timers run continuously.">
              <Switch />
            </SettingsRow>
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Email Configuration"
        description="Configure outbound email settings for this department."
        icon={Mail}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SettingsRow label="From Address" vertical>
              <Input placeholder="support@company.com" defaultValue={`${selectedDepartment?.name.toLowerCase().replace(/\s+/g, '-') || 'support'}@company.com`} />
            </SettingsRow>
            <SettingsRow label="From Name" vertical>
              <Input placeholder="IT Support" defaultValue={`${selectedDepartment?.name || 'Support'} Team`} />
            </SettingsRow>
          </div>
          <div className="space-y-4">
            <SettingsRow label="Reply-To Address" vertical>
              <Input placeholder="tickets@company.com" />
            </SettingsRow>
            <SettingsRow label="Enable Email Notifications" description="Send automatic email notifications.">
              <Switch defaultChecked />
            </SettingsRow>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Email Templates"
        description="Customize automated email templates for different events."
        icon={Mail}
        actions={
          <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
                <DialogDescription>
                  Define a new email template for automated notifications.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input placeholder="e.g., Ticket Assigned" />
                </div>
                <div className="space-y-2">
                  <Label>Trigger Event</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ticket_created">Ticket Created</SelectItem>
                      <SelectItem value="ticket_assigned">Ticket Assigned</SelectItem>
                      <SelectItem value="ticket_updated">Status Updated</SelectItem>
                      <SelectItem value="ticket_resolved">Ticket Resolved</SelectItem>
                      <SelectItem value="sla_warning">SLA Warning</SelectItem>
                      <SelectItem value="custom">Custom / Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input placeholder="[Ticket #{{ticket_id}}] {{subject}}" />
                </div>
                <div className="space-y-2">
                  <Label>Email Body</Label>
                  <Textarea
                    placeholder="Dear {{requester_name}},&#10;&#10;Your ticket has been received..."
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTemplateOpen(false)}>
                  Cancel
                </Button>
                <Button>Create Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-3">
          {mockEmailTemplates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  template.enabled ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                )}>
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-sm">{template.name}</span>
                  <p className="text-xs text-muted-foreground">
                    Trigger: {template.trigger.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked={template.enabled} />
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Email Signature"
        description="Default signature appended to all outgoing emails."
        icon={Edit3}
      >
        <Textarea
          rows={4}
          placeholder="Best regards,&#10;{{agent_name}}&#10;{{department_name}}"
          defaultValue={`Best regards,\n{{agent_name}}\n${selectedDepartment?.name || 'Support'} Team`}
        />
      </SettingsCard>
    </div>
  );

  const renderWebhookSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Webhook Endpoints"
        description="Configure external integrations that receive ticket events."
        icon={Webhook}
        actions={
          <Dialog open={isAddWebhookOpen} onOpenChange={setIsAddWebhookOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Webhook</DialogTitle>
                <DialogDescription>
                  Create a webhook to send ticket events to external services.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Webhook Name</Label>
                  <Input placeholder="e.g., Slack Notifications" />
                </div>
                <div className="space-y-2">
                  <Label>Endpoint URL</Label>
                  <Input placeholder="https://hooks.example.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Ticket Created", "Ticket Updated", "Ticket Resolved", "SLA Breach", "Comment Added", "Agent Assigned"].map((event) => (
                      <div key={event} className="flex items-center gap-2 p-2 rounded border bg-secondary/10">
                        <Switch id={event} />
                        <Label htmlFor={event} className="text-xs cursor-pointer">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secret Key (Optional)</Label>
                  <Input type="password" placeholder="For signature verification" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddWebhookOpen(false)}>
                  Cancel
                </Button>
                <Button>Create Webhook</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-3">
          {mockWebhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  webhook.enabled ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                )}>
                  <Webhook className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{webhook.name}</span>
                    {webhook.enabled && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
                    {webhook.url}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-[10px]">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Switch defaultChecked={webhook.enabled} />
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {mockWebhooks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No webhooks configured</p>
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Webhook Settings"
        description="Global webhook configuration options."
        icon={Settings}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SettingsRow label="Retry Failed Requests" description="Automatically retry failed webhook deliveries.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="Max Retries" vertical>
              <Select defaultValue="3">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 retry</SelectItem>
                  <SelectItem value="3">3 retries</SelectItem>
                  <SelectItem value="5">5 retries</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </div>
          <div className="space-y-4">
            <SettingsRow label="Include Full Payload" description="Send complete ticket data in webhook payloads.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="Timeout (seconds)" vertical>
              <Input type="number" defaultValue="30" />
            </SettingsRow>
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderInteractionRules = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Submission Rules"
        description="Control how users can submit tickets to this department."
        icon={MessagesSquare}
      >
        <div className="space-y-4">
          <SettingsRow label="Require Authentication" description="Only logged-in users can submit tickets.">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Allow Email Submission" description="Create tickets from incoming emails.">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Allow API Submission" description="Accept tickets via REST API.">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Rate Limiting" description="Limit submissions per user per hour." vertical>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue="10" className="w-20" />
              <span className="text-sm text-muted-foreground">per hour</span>
            </div>
          </SettingsRow>
        </div>
      </SettingsCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsCard
          title="Escalation Rules"
          description="Automatic escalation configuration."
          icon={AlertCircle}
        >
          <div className="space-y-4">
            <SettingsRow label="Enable Escalation" description="Escalate tickets that breach SLA.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="Escalation Delay" vertical>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="15" className="w-20" />
                <span className="text-sm text-muted-foreground">minutes after SLA breach</span>
              </div>
            </SettingsRow>
            <SettingsRow label="Notify Emails" vertical>
              <Textarea
                placeholder="manager@company.com&#10;escalations@company.com"
                rows={3}
              />
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Auto-Response"
          description="Automatic replies and acknowledgments."
          icon={ToggleLeft}
        >
          <div className="space-y-4">
            <SettingsRow label="Auto-Acknowledge" description="Send confirmation when ticket is received.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="Business Hours Reply" description="Send out-of-hours message.">
              <Switch />
            </SettingsRow>
            <SettingsRow label="AI Auto-Response" description="Generate AI responses for common issues.">
              <Switch />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "helpdesk"}
        title="Helpdesk Settings"
        description="Configure helpdesk behavior, tickets, and integrations per department."
        actions={
          <DepartmentSelector
            departments={departments}
            selectedDepartment={selectedDepartment}
            onSelect={setSelectedDepartment}
            loading={isLoadingDepts}
          />
        }
      />

      {!selectedDepartment && !isLoadingDepts ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium">Select a department</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a department to configure its helpdesk settings.
            </p>
          </CardContent>
        </Card>
      ) : isLoadingDepts ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto flex-wrap mb-6">
            <TabsTrigger value="overview" className="rounded-lg py-2 px-4 gap-2">
              <FolderKanban className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-lg py-2 px-4 gap-2">
              <Ticket className="w-4 h-4" /> Ticket Editor
            </TabsTrigger>
            <TabsTrigger value="sla" className="rounded-lg py-2 px-4 gap-2">
              <Clock className="w-4 h-4" /> SLA Policies
            </TabsTrigger>
            <TabsTrigger value="emails" className="rounded-lg py-2 px-4 gap-2">
              <Mail className="w-4 h-4" /> Emails
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="rounded-lg py-2 px-4 gap-2">
              <Webhook className="w-4 h-4" /> Webhooks
            </TabsTrigger>
            <TabsTrigger value="rules" className="rounded-lg py-2 px-4 gap-2">
              <MessagesSquare className="w-4 h-4" /> Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="tickets">{renderTicketSettings()}</TabsContent>
          <TabsContent value="sla">{renderSLASettings()}</TabsContent>
          <TabsContent value="emails">{renderEmailSettings()}</TabsContent>
          <TabsContent value="webhooks">{renderWebhookSettings()}</TabsContent>
          <TabsContent value="rules">{renderInteractionRules()}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
