import { useState, useEffect } from "react";
import {
  Clock,
  Ticket,
  Mail,
  Webhook,
  MessagesSquare,
  Plus,
  Trash2,
  Globe,
  Settings,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Edit3,
  ToggleLeft,
  Loader2,
  GripVertical,
  ArrowRight,
  Users,
  Building2,
  GitBranch,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Department, type Helpdesk, type SlaState, type SlaPolicy, type EscalationRule, type InboundEmailConfig, type DepartmentHierarchy, type DepartmentManager, type HelpdeskWebhook, type TicketFormField } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  SettingsHeader,
  SettingsCard,
  SettingsSection,
  SettingsRow,
  DepartmentSelector,
} from "../components";
import { apiRequest } from "@/lib/queryClient";

interface HelpdeskSettingsProps {
  subsection?: string;
  initialDepartmentId?: string;
}

export function HelpdeskSettings({ subsection, initialDepartmentId }: HelpdeskSettingsProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (!subsection || subsection === "helpdesk" || subsection === "helpdesk-overview") return "overview";
    return subsection.replace("helpdesk-", "");
  });
  const [isAddStateOpen, setIsAddStateOpen] = useState(false);
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [editingState, setEditingState] = useState<SlaState | null>(null);
  const [newStateName, setNewStateName] = useState("");
  const [newStateColor, setNewStateColor] = useState("#3b82f6");
  const [newStateIsFinal, setNewStateIsFinal] = useState(false);
  const [newStateTargetHours, setNewStateTargetHours] = useState<number | undefined>();
  const [creatingHelpdesk, setCreatingHelpdesk] = useState(false);

  const queryClient = useQueryClient();

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: helpdesk, isLoading: isLoadingHelpdesk } = useQuery<Helpdesk | null>({
    queryKey: ["/api/helpdesks/by-department", selectedDepartment?.id],
    queryFn: async () => {
      if (!selectedDepartment) return null;
      const res = await fetch(`/api/helpdesks/by-department/${selectedDepartment.id}`);
      const data = await res.json();
      return data;
    },
    enabled: !!selectedDepartment,
  });

  const { data: slaStates = [], isLoading: isLoadingSlaStates } = useQuery<SlaState[]>({
    queryKey: ["/api/helpdesks", helpdesk?.id, "sla-states"],
    queryFn: async () => {
      if (!helpdesk?.id) return [];
      const res = await fetch(`/api/helpdesks/${helpdesk.id}/sla-states`);
      return res.json();
    },
    enabled: !!helpdesk?.id,
  });

  const { data: slaPolicies = [] } = useQuery<SlaPolicy[]>({
    queryKey: ["/api/helpdesks", helpdesk?.id, "sla-policies"],
    queryFn: async () => {
      if (!helpdesk?.id) return [];
      const res = await fetch(`/api/helpdesks/${helpdesk.id}/sla-policies`);
      return res.json();
    },
    enabled: !!helpdesk?.id,
  });

  const { data: escalationRules = [] } = useQuery<EscalationRule[]>({
    queryKey: ["/api/helpdesks", helpdesk?.id, "escalation-rules"],
    queryFn: async () => {
      if (!helpdesk?.id) return [];
      const res = await fetch(`/api/helpdesks/${helpdesk.id}/escalation-rules`);
      return res.json();
    },
    enabled: !!helpdesk?.id,
  });

  const { data: emailConfig } = useQuery<InboundEmailConfig | null>({
    queryKey: ["/api/helpdesks", helpdesk?.id, "email-config"],
    queryFn: async () => {
      if (!helpdesk?.id) return null;
      const res = await fetch(`/api/helpdesks/${helpdesk.id}/email-config`);
      return res.json();
    },
    enabled: !!helpdesk?.id,
  });

  const { data: webhooks = [] } = useQuery<HelpdeskWebhook[]>({
    queryKey: ["/api/helpdesks", helpdesk?.id, "webhooks"],
    queryFn: async () => {
      if (!helpdesk?.id) return [];
      const res = await fetch(`/api/helpdesks/${helpdesk.id}/webhooks`);
      return res.json();
    },
    enabled: !!helpdesk?.id,
  });

  const { data: formFields = [] } = useQuery<TicketFormField[]>({
    queryKey: ["/api/helpdesks", helpdesk?.id, "form-fields"],
    queryFn: async () => {
      if (!helpdesk?.id) return [];
      const res = await fetch(`/api/helpdesks/${helpdesk.id}/form-fields`);
      return res.json();
    },
    enabled: !!helpdesk?.id,
  });

  const { data: departmentHierarchy = [] } = useQuery<DepartmentHierarchy[]>({
    queryKey: ["/api/department-hierarchy"],
  });

  const { data: departmentManagers = [] } = useQuery<DepartmentManager[]>({
    queryKey: ["/api/departments", selectedDepartment?.id, "managers"],
    queryFn: async () => {
      if (!selectedDepartment?.id) return [];
      const res = await fetch(`/api/departments/${selectedDepartment.id}/managers`);
      return res.json();
    },
    enabled: !!selectedDepartment?.id,
  });

  const createHelpdeskMutation = useMutation({
    mutationFn: async (data: { departmentId: string; name: string }) => {
      const res = await apiRequest("POST", "/api/helpdesks", data);
      return res.json();
    },
    onSuccess: () => {
      setCreatingHelpdesk(false);
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks/by-department", selectedDepartment?.id] });
    },
    onError: () => {
      setCreatingHelpdesk(false);
    },
  });

  const updateHelpdeskMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Helpdesk>) => {
      const res = await apiRequest("PATCH", `/api/helpdesks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks/by-department", selectedDepartment?.id] });
    },
  });

  const createSlaStateMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; isFinal: string; targetHours?: number }) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/sla-states`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "sla-states"] });
      setIsAddStateOpen(false);
      resetStateForm();
    },
  });

  const updateSlaStateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<SlaState>) => {
      const res = await apiRequest("PATCH", `/api/sla-states/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "sla-states"] });
      setEditingState(null);
      resetStateForm();
    },
  });

  const deleteSlaStateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sla-states/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "sla-states"] });
    },
  });

  const createSlaPolicyMutation = useMutation({
    mutationFn: async (data: Partial<SlaPolicy>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/sla-policies`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "sla-policies"] });
      setIsAddPolicyOpen(false);
    },
  });

  const createEscalationRuleMutation = useMutation({
    mutationFn: async (data: Partial<EscalationRule>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/escalation-rules`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "escalation-rules"] });
      setIsAddRuleOpen(false);
    },
  });

  const deleteEscalationRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/escalation-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "escalation-rules"] });
    },
  });

  const createEmailConfigMutation = useMutation({
    mutationFn: async (data: Partial<InboundEmailConfig>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/email-config`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "email-config"] });
    },
  });

  const updateEmailConfigMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InboundEmailConfig>) => {
      const res = await apiRequest("PATCH", `/api/email-config/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "email-config"] });
    },
  });

  const createDepartmentHierarchyMutation = useMutation({
    mutationFn: async (data: { parentDepartmentId: string; childDepartmentId: string }) => {
      const res = await apiRequest("POST", "/api/department-hierarchy", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/department-hierarchy"] });
    },
  });

  const deleteDepartmentHierarchyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/department-hierarchy/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/department-hierarchy"] });
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: Partial<HelpdeskWebhook>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/webhooks`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "webhooks"] });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<HelpdeskWebhook>) => {
      const res = await apiRequest("PATCH", `/api/webhooks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "webhooks"] });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "webhooks"] });
    },
  });

  const createFormFieldMutation = useMutation({
    mutationFn: async (data: Partial<TicketFormField>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/form-fields`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-fields"] });
    },
  });

  const updateFormFieldMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<TicketFormField>) => {
      const res = await apiRequest("PATCH", `/api/form-fields/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-fields"] });
    },
  });

  const deleteFormFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/form-fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-fields"] });
    },
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

  useEffect(() => {
    if (!selectedDepartment || isLoadingHelpdesk || creatingHelpdesk || createHelpdeskMutation.isPending) {
      return;
    }
    if (helpdesk === null) {
      setCreatingHelpdesk(true);
      createHelpdeskMutation.mutate({
        departmentId: selectedDepartment.id,
        name: `${selectedDepartment.name} Helpdesk`,
      });
    }
  }, [selectedDepartment?.id, isLoadingHelpdesk]);

  const resetStateForm = () => {
    setNewStateName("");
    setNewStateColor("#3b82f6");
    setNewStateIsFinal(false);
    setNewStateTargetHours(undefined);
  };

  const handleSaveState = () => {
    if (editingState) {
      updateSlaStateMutation.mutate({
        id: editingState.id,
        name: newStateName,
        color: newStateColor,
        isFinal: newStateIsFinal ? "true" : "false",
        targetHours: newStateTargetHours,
      });
    } else {
      createSlaStateMutation.mutate({
        name: newStateName,
        color: newStateColor,
        isFinal: newStateIsFinal ? "true" : "false",
        targetHours: newStateTargetHours,
      });
    }
  };

  const getChildDepartments = (parentId: string) => {
    return departmentHierarchy
      .filter((h) => h.parentDepartmentId === parentId)
      .map((h) => departments.find((d) => d.id === h.childDepartmentId))
      .filter(Boolean) as Department[];
  };

  const getParentDepartment = (childId: string) => {
    const hierarchy = departmentHierarchy.find((h) => h.childDepartmentId === childId);
    return hierarchy ? departments.find((d) => d.id === hierarchy.parentDepartmentId) : null;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              SLA States
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{slaStates.length}</p>
            <p className="text-xs text-muted-foreground">Custom states configured</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              SLA Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{slaPolicies.filter((p) => p.enabled === "true").length}/{slaPolicies.length}</p>
            <p className="text-xs text-muted-foreground">Policies active</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Escalation Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{escalationRules.filter((r) => r.enabled === "true").length}</p>
            <p className="text-xs text-muted-foreground">Active rules</p>
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
            <Switch 
              checked={helpdesk?.enabled === "true"} 
              onCheckedChange={(checked) => {
                if (helpdesk) {
                  updateHelpdeskMutation.mutate({ id: helpdesk.id, enabled: checked ? "true" : "false" });
                }
              }}
            />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Public Access" description="Allow non-authenticated users to submit tickets.">
            <Switch 
              checked={helpdesk?.publicAccess === "true"}
              onCheckedChange={(checked) => {
                if (helpdesk) {
                  updateHelpdeskMutation.mutate({ id: helpdesk.id, publicAccess: checked ? "true" : "false" });
                }
              }}
            />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );

  const renderSLAStates = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Ticket States"
        description="Define custom states for tickets in this helpdesk. States define the lifecycle of a ticket."
        icon={FolderKanban}
        actions={
          <Dialog open={isAddStateOpen} onOpenChange={(open) => {
            setIsAddStateOpen(open);
            if (!open) resetStateForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add State
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Ticket State</DialogTitle>
                <DialogDescription>
                  Create a new state for tickets in this helpdesk.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>State Name</Label>
                  <Input 
                    placeholder="e.g., Waiting for Customer" 
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-16 h-10 p-1" 
                      value={newStateColor}
                      onChange={(e) => setNewStateColor(e.target.value)}
                    />
                    <Input 
                      value={newStateColor}
                      onChange={(e) => setNewStateColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target Hours (Optional)</Label>
                  <Input 
                    type="number" 
                    placeholder="Hours before escalation"
                    value={newStateTargetHours || ""}
                    onChange={(e) => setNewStateTargetHours(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Final State</Label>
                    <p className="text-xs text-muted-foreground">Marks ticket as completed</p>
                  </div>
                  <Switch 
                    checked={newStateIsFinal}
                    onCheckedChange={setNewStateIsFinal}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddStateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveState} disabled={!newStateName}>
                  Create State
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        {isLoadingSlaStates ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : slaStates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No custom states configured</p>
            <p className="text-xs">Add states to define ticket lifecycle</p>
          </div>
        ) : (
          <div className="space-y-2">
            {slaStates.map((state, index) => (
              <div
                key={state.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: state.color }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{state.name}</span>
                      {state.isDefault === "true" && (
                        <Badge variant="secondary" className="text-[10px]">Default</Badge>
                      )}
                      {state.isFinal === "true" && (
                        <Badge variant="outline" className="text-[10px]">Final</Badge>
                      )}
                    </div>
                    {state.targetHours && (
                      <p className="text-xs text-muted-foreground">
                        Target: {state.targetHours} hours
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingState(state);
                      setNewStateName(state.name);
                      setNewStateColor(state.color);
                      setNewStateIsFinal(state.isFinal === "true");
                      setNewStateTargetHours(state.targetHours ?? undefined);
                      setIsAddStateOpen(true);
                    }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteSlaStateMutation.mutate(state.id)}
                    disabled={state.isDefault === "true"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        title="SLA Policies"
        description="Define response and resolution time targets by priority."
        icon={Clock}
        actions={
          <Dialog open={isAddPolicyOpen} onOpenChange={setIsAddPolicyOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add SLA Policy</DialogTitle>
                <DialogDescription>
                  Create a new SLA policy for this helpdesk.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createSlaPolicyMutation.mutate({
                  name: formData.get("name") as string,
                  priority: formData.get("priority") as string,
                  firstResponseHours: parseInt(formData.get("firstResponse") as string) || null,
                  resolutionHours: parseInt(formData.get("resolution") as string) || null,
                });
              }}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Policy Name</Label>
                    <Input name="name" placeholder="e.g., Critical Priority SLA" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue="medium">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Response (hours)</Label>
                      <Input name="firstResponse" type="number" placeholder="4" />
                    </div>
                    <div className="space-y-2">
                      <Label>Resolution (hours)</Label>
                      <Input name="resolution" type="number" placeholder="24" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddPolicyOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Policy</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-3">
          {slaPolicies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No SLA policies configured</p>
            </div>
          ) : (
            slaPolicies.map((policy) => (
              <div
                key={policy.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 rounded-lg bg-secondary/10"
              >
                <div>
                  <span className="font-medium text-sm">{policy.name}</span>
                  <Badge 
                    variant={policy.priority === "urgent" ? "destructive" : policy.priority === "high" ? "default" : "secondary"}
                    className="ml-2 text-xs"
                  >
                    {policy.priority}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">First Response</Label>
                  <p className="text-sm">{policy.firstResponseHours ? `${policy.firstResponseHours}h` : "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Resolution Target</Label>
                  <p className="text-sm">{policy.resolutionHours ? `${policy.resolutionHours}h` : "N/A"}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Switch checked={policy.enabled === "true"} />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SettingsCard>
    </div>
  );

  const renderEscalationRules = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Department Hierarchy"
        description="Configure parent-child relationships between departments for escalation paths."
        icon={GitBranch}
      >
        <div className="space-y-4">
          {departments.map((dept) => {
            const children = getChildDepartments(dept.id);
            const parent = getParentDepartment(dept.id);
            const managers = departmentManagers.filter((m) => m.departmentId === dept.id);
            
            return (
              <div key={dept.id} className="p-4 rounded-lg border bg-secondary/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="font-medium">{dept.name}</span>
                    {parent && (
                      <Badge variant="outline" className="text-xs">
                        Under: {parent.name}
                      </Badge>
                    )}
                  </div>
                  <Select
                    value={parent?.id || "none"}
                    onValueChange={(value) => {
                      const existingHierarchy = departmentHierarchy.find(
                        (h) => h.childDepartmentId === dept.id
                      );
                      if (existingHierarchy) {
                        deleteDepartmentHierarchyMutation.mutate(existingHierarchy.id);
                      }
                      if (value !== "none") {
                        createDepartmentHierarchyMutation.mutate({
                          parentDepartmentId: value,
                          childDepartmentId: dept.id,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Set parent department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Parent (Top Level)</SelectItem>
                      {departments
                        .filter((d) => d.id !== dept.id)
                        .map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {children.length > 0 && (
                  <div className="mt-2 pl-6 border-l-2 border-muted">
                    <p className="text-xs text-muted-foreground mb-1">Sub-departments:</p>
                    <div className="flex flex-wrap gap-1">
                      {children.map((child) => (
                        <Badge key={child.id} variant="secondary" className="text-xs">
                          {child.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Escalation Rules"
        description="Configure automatic escalation when tickets meet certain conditions."
        icon={AlertCircle}
        actions={
          <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Escalation Rule</DialogTitle>
                <DialogDescription>
                  Create a rule to automatically escalate tickets based on conditions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createEscalationRuleMutation.mutate({
                  name: formData.get("name") as string,
                  triggerType: formData.get("triggerType") as string,
                  triggerHours: parseInt(formData.get("triggerHours") as string) || null,
                  priority: formData.get("priority") as string || null,
                  targetDepartmentId: formData.get("targetDepartment") as string || null,
                  notifyManagers: formData.get("notifyManagers") ? "true" : "false",
                });
              }}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input name="name" placeholder="e.g., Escalate to IT Manager after 4 hours" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trigger Type</Label>
                      <Select name="triggerType" defaultValue="time_based">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time_based">Time Based</SelectItem>
                          <SelectItem value="sla_breach">SLA Breach</SelectItem>
                          <SelectItem value="priority_change">Priority Change</SelectItem>
                          <SelectItem value="state_change">State Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Trigger After (hours)</Label>
                      <Input name="triggerHours" type="number" placeholder="4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>When Priority Is</Label>
                      <Select name="priority">
                        <SelectTrigger>
                          <SelectValue placeholder="Any priority" />
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
                      <Label>Escalate To Department</Label>
                      <Select name="targetDepartment">
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify Managers</Label>
                      <p className="text-xs text-muted-foreground">Send notification to department managers</p>
                    </div>
                    <Switch name="notifyManagers" defaultChecked />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddRuleOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Rule</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {escalationRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No escalation rules configured</p>
            <p className="text-xs">Add rules to automatically escalate tickets</p>
          </div>
        ) : (
          <div className="space-y-3">
            {escalationRules.map((rule) => {
              const targetDept = departments.find((d) => d.id === rule.targetDepartmentId);
              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      rule.enabled === "true" ? "bg-orange-500/10 text-orange-600" : "bg-muted text-muted-foreground"
                    )}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-sm">{rule.name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {rule.triggerType?.replace("_", " ")}
                        </Badge>
                        {rule.triggerHours && (
                          <span>After {rule.triggerHours}h</span>
                        )}
                        {targetDept && (
                          <>
                            <ArrowRight className="w-3 h-3" />
                            <span>{targetDept.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={rule.enabled === "true"} />
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteEscalationRuleMutation.mutate(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Inbound Email Configuration"
        description="Configure email address for receiving tickets via email. Replies to ticket notifications will automatically update the ticket."
        icon={Mail}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SettingsRow label="Email Address" vertical>
              <Input 
                placeholder="support@yourdomain.com" 
                value={emailConfig?.emailAddress || ""}
                onChange={(e) => {
                  if (emailConfig) {
                    updateEmailConfigMutation.mutate({ id: emailConfig.id, emailAddress: e.target.value });
                  }
                }}
              />
            </SettingsRow>
            <SettingsRow label="Email Provider" vertical>
              <Select 
                value={emailConfig?.provider || "custom"}
                onValueChange={(value) => {
                  if (emailConfig) {
                    updateEmailConfigMutation.mutate({ id: emailConfig.id, provider: value });
                  } else if (helpdesk) {
                    createEmailConfigMutation.mutate({ provider: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom SMTP</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook/Office 365</SelectItem>
                  <SelectItem value="agentmail">AgentMail</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </div>
          <div className="space-y-4">
            <SettingsRow label="Enable Inbound Email" description="Create tickets from incoming emails.">
              <Switch 
                checked={emailConfig?.enabled === "true"}
                onCheckedChange={(checked) => {
                  if (emailConfig) {
                    updateEmailConfigMutation.mutate({ id: emailConfig.id, enabled: checked ? "true" : "false" });
                  } else if (helpdesk) {
                    createEmailConfigMutation.mutate({ enabled: checked ? "true" : "false" });
                  }
                }}
              />
            </SettingsRow>
            <SettingsRow label="Auto-Create Tickets" description="Automatically create tickets from new emails.">
              <Switch 
                checked={emailConfig?.autoCreateTickets === "true"}
                onCheckedChange={(checked) => {
                  if (emailConfig) {
                    updateEmailConfigMutation.mutate({ id: emailConfig.id, autoCreateTickets: checked ? "true" : "false" });
                  }
                }}
              />
            </SettingsRow>
            <SettingsRow label="Default Priority" vertical>
              <Select 
                value={emailConfig?.defaultPriority || "medium"}
                onValueChange={(value) => {
                  if (emailConfig) {
                    updateEmailConfigMutation.mutate({ id: emailConfig.id, defaultPriority: value });
                  }
                }}
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
            </SettingsRow>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Email Threading"
        description="How email replies are matched to existing tickets."
        icon={MessagesSquare}
      >
        <div className="space-y-4">
          <SettingsRow 
            label="Thread by Subject" 
            description="Match emails by subject line containing ticket ID."
          >
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow 
            label="Thread by References" 
            description="Use email headers (In-Reply-To, References) to match threads."
          >
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow 
            label="Thread by Sender" 
            description="Associate emails from the same sender to their open tickets."
          >
            <Switch />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );

  const renderWebhooks = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Webhooks"
        description="Configure webhooks to notify external systems about ticket events."
        icon={Webhook}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Webhook</DialogTitle>
                <DialogDescription>
                  Configure a new webhook to receive ticket event notifications.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createWebhookMutation.mutate({
                    name: formData.get("name") as string,
                    url: formData.get("url") as string,
                    events: formData.get("events") as string || "ticket.created,ticket.updated",
                    secret: formData.get("secret") as string || undefined,
                  });
                  (e.target as HTMLFormElement).reset();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Name</Label>
                  <Input id="webhook-name" name="name" placeholder="Slack Notifications" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL</Label>
                  <Input id="webhook-url" name="url" type="url" placeholder="https://..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-events">Events (comma-separated)</Label>
                  <Input id="webhook-events" name="events" placeholder="ticket.created,ticket.updated,ticket.resolved" defaultValue="ticket.created,ticket.updated" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Secret (optional)</Label>
                  <Input id="webhook-secret" name="secret" type="password" placeholder="HMAC signing secret" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createWebhookMutation.isPending}>
                    {createWebhookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Webhook"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-3">
          {webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Webhook className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No webhooks configured</p>
              <p className="text-xs">Add a webhook to notify external services about ticket events</p>
            </div>
          ) : (
            webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-background/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{webhook.name}</span>
                    <Badge variant={webhook.enabled === "true" ? "default" : "secondary"}>
                      {webhook.enabled === "true" ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-md">{webhook.url}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {webhook.events.split(",").map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={webhook.enabled === "true"}
                    onCheckedChange={(checked) => {
                      updateWebhookMutation.mutate({ id: webhook.id, enabled: checked ? "true" : "false" });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SettingsCard>
    </div>
  );

  const renderTicketSettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Custom Form Fields"
        description="Add custom fields to your ticket creation form."
        icon={Ticket}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Field
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Field</DialogTitle>
                <DialogDescription>
                  Create a new field for your ticket creation form.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createFormFieldMutation.mutate({
                    name: (formData.get("label") as string).toLowerCase().replace(/\s+/g, "_"),
                    label: formData.get("label") as string,
                    fieldType: formData.get("fieldType") as string || "text",
                    placeholder: formData.get("placeholder") as string || undefined,
                    helpText: formData.get("helpText") as string || undefined,
                    required: formData.get("required") ? "true" : "false",
                    options: formData.get("options") as string || undefined,
                    order: formFields.length,
                  });
                  (e.target as HTMLFormElement).reset();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="field-label">Field Label</Label>
                  <Input id="field-label" name="label" placeholder="Product Version" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-type">Field Type</Label>
                  <Select name="fieldType" defaultValue="text">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Long Text</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-placeholder">Placeholder (optional)</Label>
                  <Input id="field-placeholder" name="placeholder" placeholder="Enter placeholder text..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-options">Options (for dropdown, comma-separated)</Label>
                  <Input id="field-options" name="options" placeholder="Option 1, Option 2, Option 3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-help">Help Text (optional)</Label>
                  <Input id="field-help" name="helpText" placeholder="Describe what this field is for" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="field-required" name="required" />
                  <Label htmlFor="field-required">Required field</Label>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createFormFieldMutation.isPending}>
                    {createFormFieldMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Field"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-3">
          {formFields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Ticket className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No custom fields configured</p>
              <p className="text-xs">Add custom fields to collect additional information with tickets</p>
            </div>
          ) : (
            formFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      <Badge variant="outline" className="text-xs">{field.fieldType}</Badge>
                      {field.required === "true" && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {field.placeholder && (
                      <p className="text-xs text-muted-foreground">Placeholder: {field.placeholder}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={field.enabled === "true"}
                    onCheckedChange={(checked) => {
                      updateFormFieldMutation.mutate({ id: field.id, enabled: checked ? "true" : "false" });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFormFieldMutation.mutate(field.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Default Fields"
        description="Configure visibility and requirements for standard ticket fields."
        icon={Settings}
      >
        <div className="space-y-4">
          <SettingsRow label="Priority" description="Allow users to set ticket priority">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Type" description="Allow users to categorize tickets (bug, feature, question)">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Attachments" description="Allow file uploads with ticket submissions">
            <Switch defaultChecked />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "helpdesk"}
        title="Helpdesk Settings"
        description="Configure helpdesk behavior, SLA states, escalation rules, and email settings per department."
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
      ) : isLoadingDepts || isLoadingHelpdesk ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto flex-wrap mb-6">
            <TabsTrigger value="overview" className="rounded-lg py-2 px-4 gap-2">
              <FolderKanban className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="sla" className="rounded-lg py-2 px-4 gap-2">
              <Clock className="w-4 h-4" /> SLA States
            </TabsTrigger>
            <TabsTrigger value="escalation" className="rounded-lg py-2 px-4 gap-2">
              <AlertCircle className="w-4 h-4" /> Escalation
            </TabsTrigger>
            <TabsTrigger value="emails" className="rounded-lg py-2 px-4 gap-2">
              <Mail className="w-4 h-4" /> Inbound Email
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="rounded-lg py-2 px-4 gap-2">
              <Webhook className="w-4 h-4" /> Webhooks
            </TabsTrigger>
            <TabsTrigger value="ticket-settings" className="rounded-lg py-2 px-4 gap-2">
              <Ticket className="w-4 h-4" /> Ticket Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="sla">{renderSLAStates()}</TabsContent>
          <TabsContent value="escalation">{renderEscalationRules()}</TabsContent>
          <TabsContent value="emails">{renderEmailSettings()}</TabsContent>
          <TabsContent value="webhooks">{renderWebhooks()}</TabsContent>
          <TabsContent value="ticket-settings">{renderTicketSettings()}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
