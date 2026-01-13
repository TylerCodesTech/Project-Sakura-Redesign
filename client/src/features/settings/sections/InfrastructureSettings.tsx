import { useState, useEffect } from "react";
import { Server, Plus, Trash2, Pencil, Loader2, AlertCircle, Activity, History, Bell, CheckCircle2, XCircle, Clock, Wifi, WifiOff, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { SettingsHeader } from "../components";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

interface MonitoredService {
  id: string;
  name: string;
  description: string | null;
  endpoint: string;
  serviceType: string;
  checkInterval: number;
  latencyThreshold: number;
  enabled: string;
  expectedStatusCode: number;
  timeout: number;
  alertOnDown: string;
  alertOnLatency: string;
  lastCheckedAt: string | null;
  lastStatus: string;
  lastLatency: number | null;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

interface ServiceStatusHistory {
  id: string;
  serviceId: string;
  status: string;
  latency: number | null;
  statusCode: number | null;
  errorMessage: string | null;
  checkedAt: string;
}

interface ServiceAlert {
  id: string;
  serviceId: string;
  alertType: string;
  severity: string;
  message: string;
  acknowledged: string;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  endpoint: string;
  serviceType: string;
  checkInterval: number;
  latencyThreshold: number;
  enabled: string;
  expectedStatusCode: number;
  timeout: number;
  alertOnDown: string;
  alertOnLatency: string;
}

const SERVICE_TYPES = [
  { value: "api", label: "API Endpoint", icon: Activity },
  { value: "website", label: "Website", icon: Server },
  { value: "database", label: "Database", icon: Server },
];

const STATUS_CONFIG = {
  up: { label: "Up", color: "bg-green-500", icon: CheckCircle2, textColor: "text-green-500" },
  down: { label: "Down", color: "bg-red-500", icon: XCircle, textColor: "text-red-500" },
  unknown: { label: "Unknown", color: "bg-gray-500", icon: HelpCircle, textColor: "text-gray-500" },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.unknown;
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
  isDeleting,
}: {
  service: MonitoredService;
  onEdit: (service: MonitoredService) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const statusConfig = getStatusConfig(service.lastStatus);
  const StatusIcon = statusConfig.icon;
  const isEnabled = service.enabled === "true";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className={cn("relative transition-all hover:shadow-md", !isEnabled && "opacity-60")}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("w-3 h-3 rounded-full", statusConfig.color)} />
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{service.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {SERVICE_TYPES.find(t => t.value === service.serviceType)?.label || service.serviceType}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(service)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(service.id)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{service.endpoint}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <StatusIcon className={cn("w-3 h-3", statusConfig.textColor)} />
              <span>{statusConfig.label}</span>
            </div>
            {service.lastLatency !== null && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{service.lastLatency}ms</span>
              </div>
            )}
            {service.lastCheckedAt && (
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(service.lastCheckedAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ServiceAlertCard({
  alert,
  services,
  onAcknowledge,
  isAcknowledging,
}: {
  alert: ServiceAlert;
  services: MonitoredService[];
  onAcknowledge: (id: string) => void;
  isAcknowledging: boolean;
}) {
  const service = services.find(s => s.id === alert.serviceId);
  const isAcknowledged = alert.acknowledged === "true";
  const severityColors = {
    critical: "text-red-500 bg-red-500/10",
    warning: "text-yellow-500 bg-yellow-500/10",
    info: "text-blue-500 bg-blue-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className={cn("relative transition-all", isAcknowledged && "opacity-60")}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("p-2 rounded-lg shrink-0", severityColors[alert.severity as keyof typeof severityColors] || severityColors.info)}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{alert.alertType}</CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant={isAcknowledged ? "secondary" : "destructive"} className="text-xs">
                    {isAcknowledged ? "Acknowledged" : "Active"}
                  </Badge>
                  {service && (
                    <Badge variant="outline" className="text-xs">
                      {service.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!isAcknowledged && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(alert.id)}
                disabled={isAcknowledging}
              >
                {isAcknowledging ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acknowledge"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{alert.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatusHistoryItem({ history, services }: { history: ServiceStatusHistory; services: MonitoredService[] }) {
  const service = services.find(s => s.id === history.serviceId);
  const statusConfig = getStatusConfig(history.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg">
      <div className={cn("w-2 h-2 rounded-full", statusConfig.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{service?.name || "Unknown Service"}</span>
          <Badge variant="outline" className="text-xs">
            <StatusIcon className={cn("w-3 h-3 mr-1", statusConfig.textColor)} />
            {statusConfig.label}
          </Badge>
        </div>
        {history.errorMessage && (
          <p className="text-xs text-destructive mt-1">{history.errorMessage}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        {history.latency !== null && (
          <span className="text-sm text-muted-foreground">{history.latency}ms</span>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(history.checkedAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

interface InfrastructureSettingsProps {
  subsection?: string;
}

export function InfrastructureSettings({ subsection }: InfrastructureSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<MonitoredService | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("services");
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    endpoint: "",
    serviceType: "api",
    checkInterval: 60,
    latencyThreshold: 1000,
    enabled: "true",
    expectedStatusCode: 200,
    timeout: 30000,
    alertOnDown: "true",
    alertOnLatency: "true",
  });

  useEffect(() => {
    if (subsection === "maintenance-services") setActiveTab("services");
    else if (subsection === "maintenance-alerts") setActiveTab("alerts");
    else if (subsection === "maintenance-infrastructure") setActiveTab("services");
  }, [subsection]);

  const { data: services = [], isLoading: isLoadingServices } = useQuery<MonitoredService[]>({
    queryKey: ["/api/monitored-services"],
    queryFn: async () => {
      const res = await fetch("/api/monitored-services");
      return res.json();
    },
  });

  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery<ServiceAlert[]>({
    queryKey: ["/api/service-alerts"],
    queryFn: async () => {
      const res = await fetch("/api/service-alerts");
      return res.json();
    },
  });

  const { data: statusHistory = [], isLoading: isLoadingHistory } = useQuery<ServiceStatusHistory[]>({
    queryKey: ["/api/service-status-history", selectedServiceId],
    queryFn: async () => {
      if (!selectedServiceId) return [];
      const res = await fetch(`/api/service-status-history/${selectedServiceId}`);
      return res.json();
    },
    enabled: !!selectedServiceId,
  });

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        description: editingService.description || "",
        endpoint: editingService.endpoint,
        serviceType: editingService.serviceType,
        checkInterval: editingService.checkInterval,
        latencyThreshold: editingService.latencyThreshold,
        enabled: editingService.enabled,
        expectedStatusCode: editingService.expectedStatusCode,
        timeout: editingService.timeout,
        alertOnDown: editingService.alertOnDown,
        alertOnLatency: editingService.alertOnLatency,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        endpoint: "",
        serviceType: "api",
        checkInterval: 60,
        latencyThreshold: 1000,
        enabled: "true",
        expectedStatusCode: 200,
        timeout: 30000,
        alertOnDown: "true",
        alertOnLatency: "true",
      });
    }
  }, [editingService]);

  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const res = await apiRequest("POST", "/api/monitored-services", {
        ...data,
        description: data.description || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitored-services"] });
      setIsDialogOpen(false);
      toast.success("Service created successfully");
    },
    onError: () => {
      toast.error("Failed to create service");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceFormData> }) => {
      const res = await apiRequest("PATCH", `/api/monitored-services/${id}`, {
        ...data,
        description: data.description || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitored-services"] });
      setIsDialogOpen(false);
      setEditingService(null);
      toast.success("Service updated successfully");
    },
    onError: () => {
      toast.error("Failed to update service");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/monitored-services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitored-services"] });
      toast.success("Service deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete service");
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/service-alerts/${id}/acknowledge`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-alerts"] });
      toast.success("Alert acknowledged");
    },
    onError: () => {
      toast.error("Failed to acknowledge alert");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenDialog = (service?: MonitoredService) => {
    if (service) {
      setEditingService(service);
    } else {
      setEditingService(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const upServices = services.filter(s => s.lastStatus === "up");
  const downServices = services.filter(s => s.lastStatus === "down");
  const unknownServices = services.filter(s => s.lastStatus === "unknown");
  const activeAlerts = alerts.filter(a => a.acknowledged !== "true");

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "maintenance-infrastructure"}
        title="Infrastructure Monitoring"
        description="Monitor your services, APIs, and databases. Get alerted when something goes wrong."
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" /> Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Edit Service" : "Add Monitored Service"}
                </DialogTitle>
                <DialogDescription>
                  {editingService
                    ? "Update the service monitoring configuration."
                    : "Add a new service to monitor its health and availability."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Production API"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Main production API server"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    type="url"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder="https://api.example.com/health"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
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
                    <Label htmlFor="expectedStatusCode">Expected Status Code</Label>
                    <Input
                      id="expectedStatusCode"
                      type="number"
                      value={formData.expectedStatusCode}
                      onChange={(e) => setFormData({ ...formData, expectedStatusCode: parseInt(e.target.value) })}
                      min={100}
                      max={599}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInterval">Check Interval (seconds)</Label>
                    <Input
                      id="checkInterval"
                      type="number"
                      value={formData.checkInterval}
                      onChange={(e) => setFormData({ ...formData, checkInterval: parseInt(e.target.value) })}
                      min={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={formData.timeout}
                      onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                      min={1000}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latencyThreshold">Latency Threshold (ms)</Label>
                  <Input
                    id="latencyThreshold"
                    type="number"
                    value={formData.latencyThreshold}
                    onChange={(e) => setFormData({ ...formData, latencyThreshold: parseInt(e.target.value) })}
                    min={100}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Enabled</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable monitoring for this service
                      </p>
                    </div>
                    <Switch
                      checked={formData.enabled === "true"}
                      onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked ? "true" : "false" })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Alert on Down</Label>
                      <p className="text-xs text-muted-foreground">
                        Send alert when service is unreachable
                      </p>
                    </div>
                    <Switch
                      checked={formData.alertOnDown === "true"}
                      onCheckedChange={(checked) => setFormData({ ...formData, alertOnDown: checked ? "true" : "false" })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Alert on High Latency</Label>
                      <p className="text-xs text-muted-foreground">
                        Send alert when latency exceeds threshold
                      </p>
                    </div>
                    <Switch
                      checked={formData.alertOnLatency === "true"}
                      onCheckedChange={(checked) => setFormData({ ...formData, alertOnLatency: checked ? "true" : "false" })}
                    />
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingService ? "Save Changes" : "Add Service"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upServices.length}</p>
                <p className="text-xs text-muted-foreground">Services Up</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{downServices.length}</p>
                <p className="text-xs text-muted-foreground">Services Down</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-500/10 text-gray-500">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unknownServices.length}</p>
                <p className="text-xs text-muted-foreground">Unknown</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services" className="gap-2">
            <Server className="w-4 h-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="w-4 h-4" />
            Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6">
          {isLoadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            </div>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground">
                    <Server className="w-8 h-8" />
                  </div>
                  <p className="text-base font-medium">No services monitored yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
                    Add services to monitor their health, latency, and availability.
                  </p>
                  <Button className="mt-4" size="sm" onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={handleOpenDialog}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          {isLoadingAlerts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground">
                    <Bell className="w-8 h-8" />
                  </div>
                  <p className="text-base font-medium">No alerts</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
                    Service alerts will appear here when something goes wrong.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {alerts.map((alert) => (
                <ServiceAlertCard
                  key={alert.id}
                  alert={alert}
                  services={services}
                  onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
                  isAcknowledging={acknowledgeMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Select Service:</Label>
              <Select
                value={selectedServiceId || ""}
                onValueChange={(value) => setSelectedServiceId(value || null)}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedServiceId ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground">
                      <History className="w-8 h-8" />
                    </div>
                    <p className="text-base font-medium">Select a service</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
                      Choose a service above to view its status history.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : isLoadingHistory ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              </div>
            ) : statusHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground">
                      <History className="w-8 h-8" />
                    </div>
                    <p className="text-base font-medium">No history yet</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
                      Status history for this service will appear here after monitoring starts.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {statusHistory.map((history) => (
                  <StatusHistoryItem key={history.id} history={history} services={services} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
