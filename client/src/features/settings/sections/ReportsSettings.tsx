import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ReportBuilder } from "@/features/reports/ReportBuilder";
import { 
  BarChart3, 
  FileText, 
  Calendar, 
  Share2, 
  Plus, 
  Settings, 
  Clock, 
  Download, 
  Trash2, 
  Edit2, 
  Play,
  Eye,
  Lock,
  Users,
  Building2,
  Filter,
  SlidersHorizontal,
  History,
  ArrowRight
} from "lucide-react";

interface ReportBuilderEmbedProps {
  departmentId?: string;
  onSave: (config: any) => void;
}

function ReportBuilderEmbed({ departmentId, onSave }: ReportBuilderEmbedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Report Builder
        </CardTitle>
        <CardDescription>
          Create custom reports with drag-and-drop field selection, filtering, and visualization options
          {departmentId && " for this department"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="min-h-[600px]">
          <ReportBuilder onSave={onSave} />
        </div>
      </CardContent>
    </Card>
  );
}

interface ReportDefinition {
  id: string;
  name: string;
  description: string | null;
  type: string;
  dataSource: string;
  departmentId: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  config?: string | null;
}

interface DepartmentReportSettings {
  id?: string;
  departmentId: string;
  enabled: string;
  allowCustomReports: string;
  allowScheduledReports: string;
  allowExport: string;
  defaultExportFormat: string;
  retentionDays: number;
  maxScheduledReports: number;
}

interface ReportSchedule {
  id: string;
  definitionId: string;
  frequency: string;
  nextRun: string | null;
  lastRun: string | null;
  isActive: boolean;
  recipients: string | null;
}

interface ReportAuditLog {
  id: string;
  userId: string;
  userName: string | null;
  actionType: string;
  targetType: string;
  targetId: string;
  targetName: string | null;
  departmentId: string | null;
  details: string | null;
  createdAt: string;
}

const reportTypes = [
  { value: "audit", label: "Audit Report", icon: History, description: "Track user actions and system changes" },
  { value: "user_access", label: "User Access Report", icon: Users, description: "View user permissions and role assignments" },
  { value: "ticket_sla", label: "Ticket SLA Report", icon: Clock, description: "Monitor SLA compliance and response times" },
  { value: "monthly_closures", label: "Monthly Closures", icon: Calendar, description: "Review ticket resolution metrics by month" },
  { value: "custom", label: "Custom Report", icon: SlidersHorizontal, description: "Build a custom report from scratch" },
];

const dataSources = [
  { value: "tickets", label: "Tickets" },
  { value: "users", label: "Users" },
  { value: "audit_logs", label: "Audit Logs" },
  { value: "sla_states", label: "SLA States" },
  { value: "sla_policies", label: "SLA Policies" },
  { value: "departments", label: "Departments" },
  { value: "roles", label: "Roles" },
  { value: "pages", label: "Documentation Pages" },
  { value: "books", label: "Documentation Books" },
];

export function ReportsSettings() {
  const { selectedDepartment } = useSettings();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const [newReportType, setNewReportType] = useState("custom");
  const [newReportDataSource, setNewReportDataSource] = useState("tickets");

  const { data: reportDefinitions = [] } = useQuery<ReportDefinition[]>({
    queryKey: ["/api/reports/definitions", selectedDepartment?.id],
    queryFn: async () => {
      const url = selectedDepartment?.id 
        ? `/api/reports/definitions?departmentId=${selectedDepartment.id}`
        : "/api/reports/definitions";
      const res = await fetch(url);
      return res.json();
    },
  });

  const { data: schedules = [] } = useQuery<ReportSchedule[]>({
    queryKey: ["/api/reports/schedules"],
  });

  const { data: auditLogs = [] } = useQuery<ReportAuditLog[]>({
    queryKey: ["/api/reports/audit-logs", selectedDepartment?.id],
    queryFn: async () => {
      const url = selectedDepartment?.id 
        ? `/api/reports/audit-logs?departmentId=${selectedDepartment.id}`
        : "/api/reports/audit-logs";
      const res = await fetch(url);
      return res.json();
    },
  });

  const { data: settings } = useQuery<DepartmentReportSettings>({
    queryKey: ["/api/departments", selectedDepartment?.id, "report-settings"],
    queryFn: async () => {
      if (!selectedDepartment?.id) {
        return {
          departmentId: "",
          enabled: "true",
          allowCustomReports: "true",
          allowScheduledReports: "true",
          allowExport: "true",
          defaultExportFormat: "pdf",
          retentionDays: 90,
          maxScheduledReports: 10,
        };
      }
      const res = await fetch(`/api/departments/${selectedDepartment.id}/report-settings`);
      return res.json();
    },
    enabled: true,
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: Partial<ReportDefinition>) => {
      const res = await fetch("/api/reports/definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create report");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports/definitions"] });
      toast.success("Report created successfully");
      setShowNewReportDialog(false);
      setNewReportName("");
    },
    onError: () => {
      toast.error("Failed to create report");
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reports/definitions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete report");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports/definitions"] });
      toast.success("Report deleted");
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<DepartmentReportSettings>) => {
      if (!selectedDepartment?.id) return;
      const res = await fetch(`/api/departments/${selectedDepartment.id}/report-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments", selectedDepartment?.id, "report-settings"] });
      toast.success("Settings saved");
    },
  });

  const handleCreateReport = () => {
    if (!newReportName.trim()) {
      toast.error("Please enter a report name");
      return;
    }
    createReportMutation.mutate({
      name: newReportName,
      type: newReportType,
      dataSource: newReportDataSource,
      departmentId: selectedDepartment?.id || null,
      isSystem: false,
      isActive: true,
      createdBy: "current-user-id",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Create, schedule, and share reports for your organization
            {selectedDepartment && ` - ${selectedDepartment.name}`}
          </p>
        </div>
        <Button onClick={() => setShowNewReportDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Sharing & Access
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportDefinitions.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {reportDefinitions.filter(r => r.isActive).length} active
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{schedules.filter(s => s.isActive).length}</div>
                    <p className="text-xs text-muted-foreground">Running automatically</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    <History className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{auditLogs.length}</div>
                    <p className="text-xs text-muted-foreground">Actions logged</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>
                    Quick-start with pre-built report templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reportTypes.slice(0, -1).map((type) => (
                      <motion.div
                        key={type.value}
                        whileHover={{ scale: 1.02 }}
                        className="relative group cursor-pointer"
                      >
                        <Card className="h-full transition-colors hover:bg-muted/50">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <type.icon className="h-5 w-5 text-primary" />
                              </div>
                              <CardTitle className="text-base">{type.label}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setNewReportType(type.value);
                                setShowNewReportDialog(true);
                              }}
                            >
                              Create Report <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Reports</CardTitle>
                  <CardDescription>
                    Manage your saved report definitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportDefinitions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reports created yet</p>
                      <p className="text-sm">Create your first report to get started</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {reportDefinitions.map((report) => (
                          <div
                            key={report.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{report.name}</h4>
                                  {report.isSystem && (
                                    <Badge variant="secondary" className="text-xs">System</Badge>
                                  )}
                                  {!report.isActive && (
                                    <Badge variant="outline" className="text-xs">Inactive</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {report.type} • {report.dataSource} • Updated {formatDate(report.updatedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              {!report.isSystem && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => deleteReportMutation.mutate(report.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="builder" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <ReportBuilderEmbed
                departmentId={selectedDepartment?.id}
                onSave={(config) => {
                  createReportMutation.mutate({
                    name: config.name,
                    description: config.description,
                    type: config.type,
                    dataSource: config.dataSource,
                    departmentId: selectedDepartment?.id || null,
                    isSystem: false,
                    isActive: true,
                    createdBy: "current-user-id",
                    config: JSON.stringify({
                      fields: config.fields,
                      filters: config.filters,
                      groupBy: config.groupBy,
                      visualization: config.visualization,
                    }),
                  });
                }}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Scheduled Reports
                  </CardTitle>
                  <CardDescription>
                    Automate report generation and delivery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {schedules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No scheduled reports</p>
                      <p className="text-sm">Schedule a report to run automatically</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Report Schedule</h4>
                              <Badge variant={schedule.isActive ? "default" : "secondary"}>
                                {schedule.isActive ? "Active" : "Paused"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Runs {schedule.frequency}
                              {schedule.nextRun && ` • Next run: ${formatDate(schedule.nextRun)}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={schedule.isActive} />
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedDepartment && settings && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Schedule Settings
                    </CardTitle>
                    <CardDescription>
                      Configure scheduling options for {selectedDepartment.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Scheduled Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable users to schedule automated reports
                        </p>
                      </div>
                      <Switch
                        checked={settings.allowScheduledReports === "true"}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ allowScheduledReports: checked ? "true" : "false" })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Maximum Scheduled Reports Per User</Label>
                      <Input
                        type="number"
                        value={settings.maxScheduledReports}
                        onChange={(e) =>
                          updateSettingsMutation.mutate({ maxScheduledReports: parseInt(e.target.value) || 10 })
                        }
                        className="w-32"
                      />
                      <p className="text-sm text-muted-foreground">
                        Limit the number of active schedules per user
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="sharing" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Access Control
                  </CardTitle>
                  <CardDescription>
                    Configure who can view, create, and share reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Reports Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow report creation and viewing in this department
                      </p>
                    </div>
                    <Switch
                      checked={settings?.enabled === "true"}
                      onCheckedChange={(checked) =>
                        updateSettingsMutation.mutate({ enabled: checked ? "true" : "false" })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Custom Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Users can create custom report definitions
                      </p>
                    </div>
                    <Switch
                      checked={settings?.allowCustomReports === "true"}
                      onCheckedChange={(checked) =>
                        updateSettingsMutation.mutate({ allowCustomReports: checked ? "true" : "false" })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Export</Label>
                      <p className="text-sm text-muted-foreground">
                        Users can export reports to PDF, CSV, or Excel
                      </p>
                    </div>
                    <Switch
                      checked={settings?.allowExport === "true"}
                      onCheckedChange={(checked) =>
                        updateSettingsMutation.mutate({ allowExport: checked ? "true" : "false" })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Default Export Format</Label>
                    <Select
                      value={settings?.defaultExportFormat || "pdf"}
                      onValueChange={(value) =>
                        updateSettingsMutation.mutate({ defaultExportFormat: value })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Report Retention (Days)</Label>
                    <Input
                      type="number"
                      value={settings?.retentionDays || 90}
                      onChange={(e) =>
                        updateSettingsMutation.mutate({ retentionDays: parseInt(e.target.value) || 90 })
                      }
                      className="w-32"
                    />
                    <p className="text-sm text-muted-foreground">
                      Saved reports older than this will be automatically deleted
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Report Activity
                  </CardTitle>
                  <CardDescription>
                    Audit log of report-related actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {auditLogs.slice(0, 20).map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="p-1.5 rounded bg-primary/10">
                              <History className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-medium">{log.userName || "Unknown"}</span>{" "}
                                {log.actionType} {log.targetType}{" "}
                                <span className="font-medium">{log.targetName || log.targetId}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(log.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <Dialog open={showNewReportDialog} onOpenChange={setShowNewReportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Configure your report definition. You can customize the fields and filters later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Report Name</Label>
              <Input
                id="name"
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
                placeholder="Monthly SLA Summary"
              />
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={newReportType} onValueChange={setNewReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Source</Label>
              <Select value={newReportDataSource} onValueChange={setNewReportDataSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReport} disabled={createReportMutation.isPending}>
              {createReportMutation.isPending ? "Creating..." : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
