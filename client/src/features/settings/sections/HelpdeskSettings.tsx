import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Ticket,
  Mail,
  Webhook,
  Plus,
  Trash2,
  Settings,
  FolderKanban,
  AlertCircle,
  Edit3,
  Loader2,
  GripVertical,
  ArrowRight,
  Building2,
  GitBranch,
  Save,
  LayoutGrid,
  Eye,
  ChevronDown,
  ChevronRight,
  FormInput,
  ListOrdered,
  ToggleLeft,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  FileUp,
  Phone,
  AtSign,
  ListChecks,
  Link2,
  Copy,
  Layers,
  EyeOff,
  Lock,
  Monitor,
  Laptop,
  Network,
  Key,
  HelpCircle,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Department, type Helpdesk, type SlaState, type SlaPolicy, type EscalationRule, type InboundEmailConfig, type DepartmentHierarchy, type HelpdeskWebhook, type TicketFormField, type TicketFormCategory } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  SettingsHeader,
  SettingsCard,
  SettingsSection,
  SettingsRow,
  DepartmentSelector,
} from "../components";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HelpdeskSettingsProps {
  subsection?: string;
  initialDepartmentId?: string;
}

const FIELD_TYPES = [
  { value: "text", label: "Text Input", icon: Type, description: "Single line text" },
  { value: "textarea", label: "Text Area", icon: FormInput, description: "Multi-line text" },
  { value: "number", label: "Number", icon: Hash, description: "Numeric input" },
  { value: "email", label: "Email", icon: AtSign, description: "Email address" },
  { value: "phone", label: "Phone", icon: Phone, description: "Phone number" },
  { value: "url", label: "URL", icon: Link2, description: "Web address" },
  { value: "select", label: "Dropdown", icon: List, description: "Single selection" },
  { value: "multiselect", label: "Multi-Select", icon: ListChecks, description: "Multiple selections" },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Yes/No toggle" },
  { value: "date", label: "Date", icon: Calendar, description: "Date picker" },
  { value: "file", label: "File Upload", icon: FileUp, description: "File attachment" },
];

const FIELD_CATEGORIES = [
  { value: "general", label: "General Information" },
  { value: "category", label: "Category & Type" },
  { value: "contact", label: "Contact Details" },
  { value: "custom", label: "Custom Fields" },
];

interface SortableFieldItemProps {
  field: TicketFormField;
  onEdit: (field: TicketFormField) => void;
  onDelete: (id: string) => void;
  onDuplicate: (field: TicketFormField) => void;
}

function SortableFieldItem({ field, onEdit, onDelete, onDuplicate }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldType = FIELD_TYPES.find((t) => t.value === field.fieldType);
  const FieldIcon = fieldType?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border bg-secondary/10",
        isDragging && "ring-2 ring-primary shadow-lg"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FieldIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{field.label}</span>
            {field.required === "true" && (
              <Badge variant="destructive" className="text-[10px]">Required</Badge>
            )}
            {field.category && (
              <Badge variant="outline" className="text-[10px]">{field.category}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-[10px]">
              {fieldType?.label || field.fieldType}
            </Badge>
            {field.width && field.width !== "full" && (
              <Badge variant="outline" className="text-[10px]">
                {field.width === "half" ? "½" : "⅓"} Width
              </Badge>
            )}
            {field.internalOnly === "true" && (
              <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-600">
                <Lock className="w-3 h-3 mr-1" />
                Staff Only
              </Badge>
            )}
            {field.placeholder && (
              <span className="truncate max-w-[200px]">{field.placeholder}</span>
            )}
            {field.conditionalField && (
              <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-600">
                <EyeOff className="w-3 h-3 mr-1" />
                Conditional
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDuplicate(field)}
          title="Duplicate field"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(field)}
          title="Edit field"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(field.id)}
          title="Delete field"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function HelpdeskSettings({ subsection, initialDepartmentId }: HelpdeskSettingsProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (!subsection || subsection === "helpdesk" || subsection === "helpdesk-overview") return "overview";
    return subsection.replace("helpdesk-", "");
  });
  
  const [pendingChanges, setPendingChanges] = useState<Partial<Helpdesk>>({});
  const [isAddStateOpen, setIsAddStateOpen] = useState(false);
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isAddSubdeptOpen, setIsAddSubdeptOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingState, setEditingState] = useState<SlaState | null>(null);
  const [editingField, setEditingField] = useState<TicketFormField | null>(null);
  const [editingCategory, setEditingCategory] = useState<TicketFormCategory | null>(null);
  const [newStateName, setNewStateName] = useState("");
  const [newStateColor, setNewStateColor] = useState("#3b82f6");
  const [newStateIsFinal, setNewStateIsFinal] = useState(false);
  const [newStateTargetHours, setNewStateTargetHours] = useState<number | undefined>();
  const [creatingHelpdesk, setCreatingHelpdesk] = useState(false);
  const [expandedSubdepts, setExpandedSubdepts] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const { data: formCategories = [] } = useQuery<TicketFormCategory[]>({
    queryKey: ["/api/helpdesks", helpdesk?.id, "form-categories"],
    queryFn: async () => {
      if (!helpdesk?.id) return [];
      const res = await fetch(`/api/helpdesks/${helpdesk.id}/form-categories`);
      return res.json();
    },
    enabled: !!helpdesk?.id,
  });

  const { data: departmentHierarchy = [] } = useQuery<DepartmentHierarchy[]>({
    queryKey: ["/api/department-hierarchy"],
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
      setPendingChanges({});
      toast.success("Settings saved for this department");
    },
    onError: () => {
      toast.error("Failed to save settings");
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
      toast.success("State created");
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
      toast.success("State updated");
    },
  });

  const deleteSlaStateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sla-states/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "sla-states"] });
      toast.success("State deleted");
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
      toast.success("Policy created");
    },
  });

  const deleteSlaPolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sla-policies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "sla-policies"] });
      toast.success("Policy deleted");
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
      toast.success("Rule created");
    },
  });

  const deleteEscalationRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/escalation-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "escalation-rules"] });
      toast.success("Rule deleted");
    },
  });

  const createEmailConfigMutation = useMutation({
    mutationFn: async (data: Partial<InboundEmailConfig>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/email-config`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "email-config"] });
      toast.success("Email config saved");
    },
  });

  const updateEmailConfigMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InboundEmailConfig>) => {
      const res = await apiRequest("PATCH", `/api/email-config/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "email-config"] });
      toast.success("Email config updated");
    },
  });

  const createDepartmentMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/departments", data);
      return res.json();
    },
    onSuccess: (newDept) => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      return newDept;
    },
  });

  const createDepartmentHierarchyMutation = useMutation({
    mutationFn: async (data: { parentDepartmentId: string; childDepartmentId: string }) => {
      const res = await apiRequest("POST", "/api/department-hierarchy", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/department-hierarchy"] });
      toast.success("Subdepartment added");
    },
  });

  const deleteDepartmentHierarchyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/department-hierarchy/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/department-hierarchy"] });
      toast.success("Subdepartment removed");
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: Partial<HelpdeskWebhook>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/webhooks`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "webhooks"] });
      toast.success("Webhook created");
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "webhooks"] });
      toast.success("Webhook deleted");
    },
  });

  const createFormFieldMutation = useMutation({
    mutationFn: async (data: Partial<TicketFormField>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/form-fields`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-fields"] });
      setIsAddFieldOpen(false);
      toast.success("Field created");
    },
  });

  const updateFormFieldMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<TicketFormField>) => {
      const res = await apiRequest("PATCH", `/api/form-fields/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-fields"] });
      setEditingField(null);
      toast.success("Field updated");
    },
  });

  const deleteFormFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/form-fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-fields"] });
      toast.success("Field deleted");
    },
  });

  const createFormCategoryMutation = useMutation({
    mutationFn: async (data: Partial<TicketFormCategory>) => {
      const res = await apiRequest("POST", `/api/helpdesks/${helpdesk?.id}/form-categories`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-categories"] });
      setIsAddCategoryOpen(false);
      setEditingCategory(null);
      toast.success("Form category created");
    },
  });

  const updateFormCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<TicketFormCategory>) => {
      const res = await apiRequest("PATCH", `/api/form-categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-categories"] });
      setIsAddCategoryOpen(false);
      setEditingCategory(null);
      toast.success("Form category updated");
    },
  });

  const deleteFormCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/form-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/helpdesks", helpdesk?.id, "form-categories"] });
      toast.success("Form category deleted");
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

  const handleSaveDepartmentSettings = () => {
    if (helpdesk && Object.keys(pendingChanges).length > 0) {
      updateHelpdeskMutation.mutate({ id: helpdesk.id, ...pendingChanges });
    }
  };

  const updatePendingChange = (key: keyof Helpdesk, value: string) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
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

  const isTopLevelDepartment = (deptId: string) => {
    return !departmentHierarchy.some((h) => h.childDepartmentId === deptId);
  };

  const topLevelDepartments = departments.filter((d) => isTopLevelDepartment(d.id));

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

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
              <FormInput className="w-4 h-4 text-primary" />
              Form Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formFields.length}</p>
            <p className="text-xs text-muted-foreground">Custom fields configured</p>
          </CardContent>
        </Card>
      </div>

      <SettingsCard
        title="General Settings"
        description={`Configure helpdesk settings for ${selectedDepartment?.name || "this department"}.`}
        icon={Settings}
        actions={
          hasPendingChanges && (
            <Button 
              size="sm" 
              className="gap-2" 
              onClick={handleSaveDepartmentSettings}
              disabled={updateHelpdeskMutation.isPending}
            >
              {updateHelpdeskMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          )
        }
      >
        <div className="space-y-4">
          <SettingsRow label="Enable Helpdesk" description="Allow ticket submission for this department.">
            <Switch 
              checked={(pendingChanges.enabled ?? helpdesk?.enabled) === "true"} 
              onCheckedChange={(checked) => updatePendingChange("enabled", checked ? "true" : "false")}
            />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Public Access" description="Allow non-authenticated users to submit tickets.">
            <Switch 
              checked={(pendingChanges.publicAccess ?? helpdesk?.publicAccess) === "true"}
              onCheckedChange={(checked) => updatePendingChange("publicAccess", checked ? "true" : "false")}
            />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );

  const renderSubdepartments = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Subdepartments"
        description={`Manage subdepartments under ${selectedDepartment?.name}. For example, IT department may have Helpdesk, Hardware, Software subdepartments.`}
        icon={GitBranch}
        actions={
          <Dialog open={isAddSubdeptOpen} onOpenChange={setIsAddSubdeptOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Subdepartment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subdepartment</DialogTitle>
                <DialogDescription>
                  Create a new subdepartment under {selectedDepartment?.name}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const existingDeptId = formData.get("existingDept") as string;
                
                if (existingDeptId && existingDeptId !== "new") {
                  createDepartmentHierarchyMutation.mutate({
                    parentDepartmentId: selectedDepartment!.id,
                    childDepartmentId: existingDeptId,
                  });
                } else {
                  const newDept = await createDepartmentMutation.mutateAsync({
                    name: formData.get("name") as string,
                    color: formData.get("color") as string || "#6b7280",
                    description: formData.get("description") as string || undefined,
                  });
                  createDepartmentHierarchyMutation.mutate({
                    parentDepartmentId: selectedDepartment!.id,
                    childDepartmentId: newDept.id,
                  });
                }
                setIsAddSubdeptOpen(false);
              }}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Use Existing Department</Label>
                    <Select name="existingDept" defaultValue="new">
                      <SelectTrigger>
                        <SelectValue placeholder="Create new or select existing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Create New Department</SelectItem>
                        <Separator className="my-1" />
                        {departments
                          .filter((d) => d.id !== selectedDepartment?.id && isTopLevelDepartment(d.id))
                          .map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                                {dept.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">Or create a new department:</p>
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input name="name" placeholder="e.g., Hardware Support" />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" name="color" defaultValue="#6b7280" className="w-16 h-10 p-1" />
                      <Input name="colorHex" defaultValue="#6b7280" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea name="description" placeholder="Brief description of this subdepartment" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddSubdeptOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDepartmentMutation.isPending || createDepartmentHierarchyMutation.isPending}>
                    {(createDepartmentMutation.isPending || createDepartmentHierarchyMutation.isPending) && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Add Subdepartment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {!selectedDepartment ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Select a department to manage subdepartments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getChildDepartments(selectedDepartment.id).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No subdepartments configured</p>
                <p className="text-xs">Add subdepartments to create a hierarchy</p>
              </div>
            ) : (
              getChildDepartments(selectedDepartment.id).map((subDept) => {
                const isExpanded = expandedSubdepts.has(subDept.id);
                const subChildren = getChildDepartments(subDept.id);
                const hierarchy = departmentHierarchy.find(
                  (h) => h.parentDepartmentId === selectedDepartment.id && h.childDepartmentId === subDept.id
                );
                
                return (
                  <Collapsible
                    key={subDept.id}
                    open={isExpanded}
                    onOpenChange={(open) => {
                      const next = new Set(expandedSubdepts);
                      if (open) next.add(subDept.id);
                      else next.delete(subDept.id);
                      setExpandedSubdepts(next);
                    }}
                  >
                    <div className="rounded-lg border bg-secondary/10 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subDept.color }}
                          />
                          <div>
                            <span className="font-medium">{subDept.name}</span>
                            {subChildren.length > 0 && (
                              <Badge variant="secondary" className="ml-2 text-[10px]">
                                {subChildren.length} sub
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              if (hierarchy) {
                                deleteDepartmentHierarchyMutation.mutate(hierarchy.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent className="mt-3 pl-9 space-y-2">
                        {subDept.description && (
                          <p className="text-sm text-muted-foreground">{subDept.description}</p>
                        )}
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            ID: {subDept.id.substring(0, 8)}...
                          </Badge>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            )}
          </div>
        )}
      </SettingsCard>
    </div>
  );

  const CATEGORY_ICONS = [
    { value: "Monitor", label: "Hardware", icon: Monitor },
    { value: "Laptop", label: "Software", icon: Laptop },
    { value: "Network", label: "Network", icon: Network },
    { value: "Key", label: "Access", icon: Key },
    { value: "HelpCircle", label: "Other", icon: HelpCircle },
    { value: "Settings", label: "Settings", icon: Settings },
    { value: "Mail", label: "Email", icon: Mail },
    { value: "Ticket", label: "Ticket", icon: Ticket },
  ];

  const renderTicketFormDesigner = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Form Categories"
        description="Create multiple form categories (e.g., Hardware, Software, Network). Users will select a category before filling out the form."
        icon={Layers}
        actions={
          <Dialog open={isAddCategoryOpen} onOpenChange={(open) => {
            setIsAddCategoryOpen(open);
            if (!open) setEditingCategory(null);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add Form Category"}</DialogTitle>
                <DialogDescription>
                  Create a category to organize your ticket forms. Each category can have its own set of fields.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const categoryData = {
                  name: formData.get("name") as string,
                  description: formData.get("description") as string || null,
                  icon: formData.get("icon") as string || "HelpCircle",
                  color: formData.get("color") as string || "#3b82f6",
                  enabled: "true",
                  order: editingCategory?.order ?? formCategories.length,
                };
                
                if (editingCategory) {
                  updateFormCategoryMutation.mutate({ id: editingCategory.id, ...categoryData });
                } else {
                  createFormCategoryMutation.mutate(categoryData);
                }
              }}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input 
                      name="name" 
                      placeholder="e.g., Hardware Issue" 
                      defaultValue={editingCategory?.name || ""}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      name="description" 
                      placeholder="Brief description of this category..."
                      defaultValue={editingCategory?.description || ""}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select name="icon" defaultValue={editingCategory?.icon || "HelpCircle"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_ICONS.map((iconOption) => (
                            <SelectItem key={iconOption.value} value={iconOption.value}>
                              <div className="flex items-center gap-2">
                                <iconOption.icon className="w-4 h-4" />
                                {iconOption.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          name="color"
                          className="w-12 h-10 p-1"
                          defaultValue={editingCategory?.color || "#3b82f6"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddCategoryOpen(false);
                    setEditingCategory(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Update Category" : "Add Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {formCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No form categories configured</p>
            <p className="text-xs">Add categories to let users choose the type of issue when creating a ticket</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formCategories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((category) => {
              const IconComponent = CATEGORY_ICONS.find(i => i.value === category.icon)?.icon || HelpCircle;
              return (
                <div
                  key={category.id}
                  className="relative group p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: category.color }} />
                    </div>
                    <span className="font-medium text-sm">{category.name}</span>
                    {category.description && (
                      <span className="text-xs text-muted-foreground line-clamp-2">{category.description}</span>
                    )}
                    {category.enabled === "false" && (
                      <Badge variant="secondary" className="text-[10px]">Disabled</Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingCategory(category);
                        setIsAddCategoryOpen(true);
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteFormCategoryMutation.mutate(category.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        title="Ticket Form Designer"
        description="Configure the fields that appear when creating a new ticket. Drag to reorder."
        icon={LayoutGrid}
        actions={
          <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Field
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingField ? "Edit Field" : "Add Form Field"}</DialogTitle>
                <DialogDescription>
                  Configure a custom field for the ticket creation form.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const label = formData.get("label") as string;
                const fieldData = {
                  name: label.toLowerCase().replace(/\s+/g, "_"),
                  label,
                  fieldType: formData.get("fieldType") as string,
                  placeholder: formData.get("placeholder") as string || null,
                  required: formData.get("required") === "on" ? "true" : "false",
                  options: formData.get("options") as string || null,
                  defaultValue: formData.get("defaultValue") as string || null,
                  category: formData.get("category") as string || null,
                  helpText: formData.get("helpText") as string || null,
                  minValue: formData.get("minValue") as string || null,
                  maxValue: formData.get("maxValue") as string || null,
                  conditionalField: formData.get("conditionalField") as string || null,
                  conditionalValue: formData.get("conditionalValue") as string || null,
                  width: formData.get("width") as string || "full",
                  internalOnly: formData.get("internalOnly") === "on" ? "true" : "false",
                };
                
                if (editingField) {
                  updateFormFieldMutation.mutate({ id: editingField.id, ...fieldData });
                } else {
                  createFormFieldMutation.mutate({
                    ...fieldData,
                    order: formFields.length,
                  });
                }
              }}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Field Label</Label>
                    <Input 
                      name="label" 
                      placeholder="e.g., Category" 
                      defaultValue={editingField?.label || ""}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select name="fieldType" defaultValue={editingField?.fieldType || "text"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder Text</Label>
                    <Input 
                      name="placeholder" 
                      placeholder="e.g., Select a category..." 
                      defaultValue={editingField?.placeholder || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Options (for dropdown, comma-separated)</Label>
                    <Textarea 
                      name="options" 
                      placeholder="Option 1, Option 2, Option 3"
                      defaultValue={editingField?.options || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Value</Label>
                    <Input 
                      name="defaultValue" 
                      placeholder="Default value (optional)"
                      defaultValue={editingField?.defaultValue || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Help Text</Label>
                    <Input 
                      name="helpText" 
                      placeholder="Additional help or instructions for this field"
                      defaultValue={editingField?.helpText || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field Width</Label>
                    <Select name="width" defaultValue={editingField?.width || "full"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Width</SelectItem>
                        <SelectItem value="half">Half Width</SelectItem>
                        <SelectItem value="third">Third Width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Required Field</Label>
                      <p className="text-xs text-muted-foreground">User must fill this field</p>
                    </div>
                    <Switch 
                      name="required" 
                      defaultChecked={editingField?.required === "true"} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Internal Only</Label>
                      <p className="text-xs text-muted-foreground">Only visible to staff, not end users</p>
                    </div>
                    <Switch 
                      name="internalOnly" 
                      defaultChecked={editingField?.internalOnly === "true"} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddFieldOpen(false);
                    setEditingField(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingField ? "Update Field" : "Add Field"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {formFields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FormInput className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No custom fields configured</p>
            <p className="text-xs">Add fields to customize the ticket creation form</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event: DragEndEvent) => {
              const { active, over } = event;
              if (over && active.id !== over.id) {
                const oldIndex = formFields.findIndex((f) => f.id === active.id);
                const newIndex = formFields.findIndex((f) => f.id === over.id);
                const reorderedFields = arrayMove(formFields, oldIndex, newIndex);
                reorderedFields.forEach((field, index) => {
                  updateFormFieldMutation.mutate({ id: field.id, order: index });
                });
              }
            }}
          >
            <SortableContext
              items={formFields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {formFields.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    onEdit={(f) => {
                      setEditingField(f);
                      setIsAddFieldOpen(true);
                    }}
                    onDelete={(id) => deleteFormFieldMutation.mutate(id)}
                    onDuplicate={(f) => {
                      createFormFieldMutation.mutate({
                        name: `${f.name}_copy`,
                        label: `${f.label} (Copy)`,
                        fieldType: f.fieldType,
                        placeholder: f.placeholder,
                        helpText: f.helpText,
                        required: f.required,
                        options: f.options,
                        defaultValue: f.defaultValue,
                        category: f.category,
                        order: formFields.length,
                      });
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </SettingsCard>

      <SettingsCard
        title="Form Preview"
        description="Preview how the ticket creation form will look with your configured fields."
        icon={Eye}
      >
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="font-semibold mb-4">New Ticket</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Input placeholder="Brief description of the issue" disabled />
            </div>
            <div className="space-y-2">
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea placeholder="Detailed description..." disabled className="min-h-[100px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {formFields.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((field) => {
                const widthClass = field.width === "third" ? "col-span-2" : field.width === "half" ? "col-span-3" : "col-span-6";
                return (
                  <div key={field.id} className={cn("space-y-2", widthClass)}>
                    <Label className="flex items-center gap-2">
                      {field.label}
                      {field.required === "true" && <span className="text-destructive">*</span>}
                      {field.internalOnly === "true" && (
                        <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-600">
                          <Lock className="w-3 h-3 mr-1" />
                          Staff Only
                        </Badge>
                      )}
                    </Label>
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                    {field.fieldType === "text" && (
                      <Input placeholder={field.placeholder || ""} disabled />
                    )}
                    {field.fieldType === "textarea" && (
                      <Textarea placeholder={field.placeholder || ""} disabled />
                    )}
                    {field.fieldType === "number" && (
                      <Input type="number" placeholder={field.placeholder || ""} disabled />
                    )}
                    {field.fieldType === "email" && (
                      <Input type="email" placeholder={field.placeholder || ""} disabled />
                    )}
                    {field.fieldType === "phone" && (
                      <Input type="tel" placeholder={field.placeholder || ""} disabled />
                    )}
                    {field.fieldType === "url" && (
                      <Input type="url" placeholder={field.placeholder || ""} disabled />
                    )}
                    {field.fieldType === "select" && (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || "Select..."} />
                        </SelectTrigger>
                      </Select>
                    )}
                    {field.fieldType === "multiselect" && (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || "Select multiple..."} />
                        </SelectTrigger>
                      </Select>
                    )}
                    {field.fieldType === "checkbox" && (
                      <div className="flex items-center gap-2">
                        <Switch disabled />
                        <span className="text-sm text-muted-foreground">{field.placeholder}</span>
                      </div>
                    )}
                    {field.fieldType === "date" && (
                      <Input type="date" disabled />
                    )}
                    {field.fieldType === "file" && (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                        <FileUp className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        Drop files here or click to upload
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderSLASettings = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Ticket States"
        description="Define custom states for tickets in this helpdesk."
        icon={FolderKanban}
        actions={
          <Dialog open={isAddStateOpen} onOpenChange={(open) => {
            setIsAddStateOpen(open);
            if (!open) {
              resetStateForm();
              setEditingState(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add State
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingState ? "Edit State" : "Add Ticket State"}</DialogTitle>
                <DialogDescription>
                  {editingState ? "Update this ticket state." : "Create a new state for tickets."}
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
                <Button variant="outline" onClick={() => {
                  setIsAddStateOpen(false);
                  setEditingState(null);
                  resetStateForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveState} disabled={!newStateName}>
                  {editingState ? "Update State" : "Create State"}
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
            {slaStates.map((state) => (
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
        {slaPolicies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No SLA policies configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slaPolicies.map((policy) => (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteSlaPolicyMutation.mutate(policy.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
    </div>
  );

  const renderEscalationRules = () => (
    <div className="space-y-6">
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
                    <Input name="name" placeholder="e.g., Escalate to Manager after 4 hours" required />
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
        description="Configure email address for receiving tickets via email."
        icon={Mail}
      >
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
                <SelectItem value="outlook">Outlook/O365</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
          <Separator />
          <SettingsRow label="Auto-Create Tickets" description="Automatically create tickets from incoming emails.">
            <Switch
              checked={emailConfig?.autoCreateTickets === "true"}
              onCheckedChange={(checked) => {
                if (emailConfig) {
                  updateEmailConfigMutation.mutate({ id: emailConfig.id, autoCreateTickets: checked ? "true" : "false" });
                }
              }}
            />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );

  const renderWebhooks = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Webhooks"
        description="Configure webhooks to send ticket events to external services."
        icon={Webhook}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Webhook</DialogTitle>
                <DialogDescription>
                  Configure a webhook endpoint to receive ticket events.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createWebhookMutation.mutate({
                  name: formData.get("name") as string,
                  url: formData.get("url") as string,
                  events: formData.get("events") as string || "ticket.created,ticket.updated",
                });
              }}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Webhook Name</Label>
                    <Input name="name" placeholder="e.g., Slack Notifications" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <Input name="url" type="url" placeholder="https://..." required />
                  </div>
                  <div className="space-y-2">
                    <Label>Events (comma-separated)</Label>
                    <Input name="events" placeholder="ticket.created,ticket.updated" defaultValue="ticket.created,ticket.updated" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Webhook</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {webhooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Webhook className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No webhooks configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
              >
                <div className="space-y-1">
                  <span className="font-medium text-sm">{webhook.name}</span>
                  <p className="text-xs text-muted-foreground truncate max-w-md">{webhook.url}</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events?.split(",").map((event) => (
                      <Badge key={event} variant="outline" className="text-[10px]">
                        {event.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={webhook.enabled === "true"} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
    </div>
  );

  if (isLoadingDepts) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "helpdesk"}
        title="Helpdesk Configuration"
        description="Configure helpdesk settings, ticket workflows, and SLA policies."
        actions={
          <DepartmentSelector
            departments={departments}
            selectedDepartment={selectedDepartment}
            onSelect={setSelectedDepartment}
          />
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <Settings className="w-4 h-4 hidden lg:block" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subdepartments" className="gap-2">
            <GitBranch className="w-4 h-4 hidden lg:block" />
            Subdepts
          </TabsTrigger>
          <TabsTrigger value="form-designer" className="gap-2">
            <LayoutGrid className="w-4 h-4 hidden lg:block" />
            Form
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2">
            <Clock className="w-4 h-4 hidden lg:block" />
            SLA
          </TabsTrigger>
          <TabsTrigger value="escalation" className="gap-2">
            <AlertCircle className="w-4 h-4 hidden lg:block" />
            Escalation
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4 hidden lg:block" />
            Email
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="w-4 h-4 hidden lg:block" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="subdepartments">{renderSubdepartments()}</TabsContent>
        <TabsContent value="form-designer">{renderTicketFormDesigner()}</TabsContent>
        <TabsContent value="sla">{renderSLASettings()}</TabsContent>
        <TabsContent value="escalation">{renderEscalationRules()}</TabsContent>
        <TabsContent value="email">{renderEmailSettings()}</TabsContent>
        <TabsContent value="webhooks">{renderWebhooks()}</TabsContent>
      </Tabs>
    </div>
  );
}
