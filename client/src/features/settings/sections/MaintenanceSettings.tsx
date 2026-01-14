import { useState } from "react";
import { 
  Settings, AlertTriangle, Clock, Shield, Database, Server, 
  Activity, RefreshCw, Download, Upload, Archive, Trash2,
  Bell, Mail, Users, Calendar, Play, Pause, CheckCircle,
  XCircle, Info, Zap, HardDrive, Cpu, MemoryStick, Gauge,
  Terminal, FileText, History, Wrench, Power, AlertCircle
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsCard, SettingsRow } from "../components";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type User } from "@shared/schema";

interface MaintenanceSettingsProps {
  departmentId?: string;
  subsection?: string;
}

interface SystemStatus {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  lastRestart: string;
  version: string;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  type: "backup" | "cleanup" | "update" | "security" | "optimization";
  status: "scheduled" | "running" | "completed" | "failed";
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  duration?: number;
  createdBy: User;
}

interface BackupInfo {
  id: string;
  type: "full" | "incremental" | "database";
  size: number;
  created: string;
  status: "completed" | "in-progress" | "failed";
  location: string;
}

const MAINTENANCE_TYPES = [
  { value: "backup", label: "Backup", icon: Archive, color: "#10b981" },
  { value: "cleanup", label: "Cleanup", icon: Trash2, color: "#f59e0b" },
  { value: "update", label: "Updates", icon: RefreshCw, color: "#3b82f6" },
  { value: "security", label: "Security", icon: Shield, color: "#ef4444" },
  { value: "optimization", label: "Optimization", icon: Zap, color: "#8b5cf6" },
];

export function MaintenanceSettings({ departmentId, subsection }: MaintenanceSettingsProps) {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMaintenanceMode, setShowMaintenanceMode] = useState(false);
  const [showSystemRestart, setShowSystemRestart] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    type: "backup" as const,
    schedule: "daily",
    scheduleTime: "02:00",
    enabled: true,
  });

  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: maintenanceTasks = [], isLoading } = useQuery<MaintenanceTask[]>({
    queryKey: ["/api/maintenance/tasks"],
  });

  const { data: backups = [] } = useQuery<BackupInfo[]>({
    queryKey: ["/api/maintenance/backups"],
  });

  const { data: logs = [] } = useQuery<any[]>({
    queryKey: ["/api/maintenance/logs"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof newTask) => {
      return apiRequest("POST", "/api/maintenance/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/tasks"] });
      setShowCreateTask(false);
      setNewTask({
        name: "",
        description: "",
        type: "backup",
        schedule: "daily",
        scheduleTime: "02:00",
        enabled: true,
      });
      toast({
        title: "Task created",
        description: "The maintenance task has been created successfully.",
      });
    },
  });

  const runTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("POST", `/api/maintenance/tasks/${taskId}/run`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/tasks"] });
      toast({
        title: "Task started",
        description: "The maintenance task has been started.",
      });
    },
  });

  const maintenanceModeMutation = useMutation({
    mutationFn: async (enabled: boolean, message?: string) => {
      return apiRequest("POST", "/api/system/maintenance-mode", { enabled, message });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/status"] });
      setShowMaintenanceMode(false);
      toast({
        title: data.enabled ? "Maintenance mode enabled" : "Maintenance mode disabled",
        description: data.enabled 
          ? "The system is now in maintenance mode." 
          : "The system is back online.",
      });
    },
  });

  const restartSystemMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/system/restart");
    },
    onSuccess: () => {
      setShowSystemRestart(false);
      toast({
        title: "System restart initiated",
        description: "The system will restart in a few moments.",
      });
    },
  });

  const getStatusColor = (status: SystemStatus["status"]) => {
    switch (status) {
      case "healthy": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: SystemStatus["status"]) => {
    switch (status) {
      case "healthy": return CheckCircle;
      case "warning": return AlertTriangle;
      case "critical": return XCircle;
      default: return Info;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* System Status Cards */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {(() => {
                const StatusIcon = getStatusIcon(systemStatus.status);
                return <StatusIcon className={`h-4 w-4 ${getStatusColor(systemStatus.status)}`} />;
              })()}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(systemStatus.status)}`}>
                {systemStatus.status.charAt(0).toUpperCase() + systemStatus.status.slice(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {formatUptime(systemStatus.uptime)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus.cpuUsage}%</div>
              <Progress value={systemStatus.cpuUsage} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus.memoryUsage}%</div>
              <Progress value={systemStatus.memoryUsage} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus.diskUsage}%</div>
              <Progress value={systemStatus.diskUsage} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <SettingsCard
            title="Maintenance Tasks"
            description="Automated maintenance and system optimization tasks"
            icon={Settings}
            scope="global"
            helpText="Regular maintenance tasks help keep your system running smoothly"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run All
                </Button>
                <Button onClick={() => setShowCreateTask(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading tasks...
                  </div>
                ) : maintenanceTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No maintenance tasks configured</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowCreateTask(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Task
                    </Button>
                  </div>
                ) : (
                  maintenanceTasks.map((task) => {
                    const taskType = MAINTENANCE_TYPES.find(t => t.value === task.type);
                    const TaskIcon = taskType?.icon || Settings;
                    
                    return (
                      <div 
                        key={task.id}
                        className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                          selectedTask?.id === task.id 
                            ? "bg-primary/5 border-primary/30" 
                            : "hover:bg-muted/50 hover:border-border/60"
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div 
                                className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: taskType?.color || "#6b7280" }}
                              >
                                <TaskIcon className="w-3 h-3 text-white" />
                              </div>
                              <h3 className="font-semibold truncate">{task.name}</h3>
                              <Badge variant={task.status === "completed" ? "secondary" : 
                                            task.status === "running" ? "default" :
                                            task.status === "failed" ? "destructive" : "outline"}>
                                {task.status === "running" && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                                {task.status}
                              </Badge>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {task.schedule}
                              </div>
                              {task.lastRun && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(task.lastRun).toLocaleDateString()}
                                </div>
                              )}
                              {task.duration && (
                                <div className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  {Math.round(task.duration / 60)}m
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={task.createdBy.avatar} />
                                <AvatarFallback className="text-xs">
                                  {task.createdBy.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                by {task.createdBy.username}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-1 ml-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                runTaskMutation.mutate(task.id);
                              }}
                              disabled={task.status === "running"}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Task Details Panel */}
              <div className="space-y-4">
                {selectedTask ? (
                  <>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        {(() => {
                          const taskType = MAINTENANCE_TYPES.find(t => t.value === selectedTask.type);
                          const TaskIcon = taskType?.icon || Settings;
                          return (
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: taskType?.color || "#6b7280" }}
                            >
                              <TaskIcon className="w-4 h-4 text-white" />
                            </div>
                          );
                        })()}
                        <div>
                          <h3 className="font-semibold">{selectedTask.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {MAINTENANCE_TYPES.find(t => t.value === selectedTask.type)?.label}
                          </p>
                        </div>
                      </div>
                      
                      {selectedTask.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedTask.description}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={selectedTask.status === "completed" ? "secondary" : 
                                        selectedTask.status === "running" ? "default" :
                                        selectedTask.status === "failed" ? "destructive" : "outline"}>
                            {selectedTask.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Schedule</span>
                          <span className="font-medium">{selectedTask.schedule}</span>
                        </div>

                        {selectedTask.lastRun && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Run</span>
                            <span>{new Date(selectedTask.lastRun).toLocaleString()}</span>
                          </div>
                        )}

                        {selectedTask.nextRun && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Next Run</span>
                            <span>{new Date(selectedTask.nextRun).toLocaleString()}</span>
                          </div>
                        )}

                        {selectedTask.duration && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Duration</span>
                            <span>{Math.round(selectedTask.duration / 60)} minutes</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => runTaskMutation.mutate(selectedTask.id)}
                          disabled={selectedTask.status === "running"}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Run Now
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-muted-foreground border rounded-lg">
                    <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select a task to view details</p>
                  </div>
                )}
              </div>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <SettingsCard
            title="System Backups"
            description="Manage system backups and data recovery"
            icon={Archive}
            scope="global"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm">
                  <Archive className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Automatic Backups" 
                description="Automatically create system backups"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Backup Retention" 
                description="How long to keep backup files"
              >
                <Select defaultValue="30">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsRow 
                label="Include File Uploads" 
                description="Include user uploaded files in backups"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Backup Compression" 
                description="Compress backups to save storage space"
              >
                <Switch defaultChecked />
              </SettingsRow>
            </div>

            {backups.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Recent Backups</h4>
                <div className="space-y-2">
                  {backups.slice(0, 5).map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Archive className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{backup.type} backup</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(backup.created).toLocaleString()} • {(backup.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={backup.status === "completed" ? "secondary" : 
                                      backup.status === "in-progress" ? "default" : "destructive"}>
                          {backup.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SettingsCard>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SettingsCard
            title="System Management"
            description="Critical system operations and maintenance mode"
            icon={Server}
            scope="global"
            helpText="Use these tools carefully as they can affect system availability"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Maintenance Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enable maintenance mode to prevent user access during updates
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowMaintenanceMode(true)}
                      className="w-full"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Maintenance Mode
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Power className="w-4 h-4 text-red-600" />
                      System Restart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Restart the system to apply updates or fix issues
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSystemRestart(true)}
                      className="w-full border-red-200 text-red-600 hover:bg-red-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart System
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <SettingsRow 
                label="System Updates" 
                description="Automatically install security updates"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Health Check Interval" 
                description="How often to check system health"
              >
                <Select defaultValue="30">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsRow 
                label="Error Reporting" 
                description="Send anonymous error reports to improve the system"
              >
                <Switch />
              </SettingsRow>

              {systemStatus && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3">Current Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Version:</span>
                      <span className="ml-2 font-medium">{systemStatus.version}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Restart:</span>
                      <span className="ml-2 font-medium">
                        {new Date(systemStatus.lastRestart).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active Connections:</span>
                      <span className="ml-2 font-medium">{systemStatus.activeConnections}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="ml-2 font-medium">{formatUptime(systemStatus.uptime)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <SettingsCard
            title="System Monitoring"
            description="Configure monitoring and alerting for system health"
            icon={Activity}
            scope="global"
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Performance Monitoring" 
                description="Track CPU, memory, and disk usage"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Alert Thresholds" 
                description="CPU usage threshold for alerts"
              >
                <div className="flex items-center gap-2">
                  <Slider defaultValue={[80]} max={100} step={5} className="w-32" />
                  <span className="text-sm text-muted-foreground">80%</span>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Email Alerts" 
                description="Send email notifications for critical issues"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Alert Recipients" 
                description="Email addresses to receive system alerts"
              >
                <Input placeholder="admin@company.com" className="w-64" />
              </SettingsRow>

              <SettingsRow 
                label="Metrics Retention" 
                description="How long to keep monitoring data"
              >
                <Select defaultValue="30">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <SettingsCard
            title="System Logs"
            description="View and manage system activity logs"
            icon={FileText}
            scope="global"
            actions={
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            }
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Log Level" 
                description="Minimum level of events to log"
              >
                <Select defaultValue="info">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsRow 
                label="Log Rotation" 
                description="Automatically rotate log files to manage disk space"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Select defaultValue="100">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 MB</SelectItem>
                      <SelectItem value="100">100 MB</SelectItem>
                      <SelectItem value="500">500 MB</SelectItem>
                      <SelectItem value="1000">1 GB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Log Retention" 
                description="How long to keep log files"
              >
                <Select defaultValue="30">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              {logs.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Log Entries</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {logs.slice(0, 10).map((log, index) => (
                      <div key={index} className="text-sm font-mono bg-muted/50 p-2 rounded">
                        <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          log.level === "error" ? "bg-red-100 text-red-700" :
                          log.level === "warn" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsCard
            title="Maintenance Settings"
            description="Configure maintenance and system optimization"
            icon={Wrench}
            scope="global"
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Maintenance Window" 
                description="Preferred time for scheduled maintenance"
              >
                <div className="flex items-center gap-2">
                  <Input type="time" defaultValue="02:00" className="w-32" />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input type="time" defaultValue="04:00" className="w-32" />
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Database Optimization" 
                description="Automatically optimize database performance"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Cleanup Old Files" 
                description="Remove temporary and unused files"
              >
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Notification Preferences" 
                description="How to notify administrators about maintenance"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Email notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">In-app notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">SMS alerts</span>
                  </div>
                </div>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Maintenance Task</DialogTitle>
            <DialogDescription>
              Schedule a new automated maintenance task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Name *</Label>
              <Input
                placeholder="e.g., Database Cleanup"
                value={newTask.name}
                onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this task..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select 
                  value={newTask.type} 
                  onValueChange={(value: any) => setNewTask(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_TYPES.map((type) => (
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
                <Label>Schedule</Label>
                <Select 
                  value={newTask.schedule} 
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, schedule: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule Time</Label>
              <Input
                type="time"
                value={newTask.scheduleTime}
                onChange={(e) => setNewTask(prev => ({ ...prev, scheduleTime: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Task</Label>
                <p className="text-sm text-muted-foreground">
                  Start running this task according to schedule
                </p>
              </div>
              <Switch
                checked={newTask.enabled}
                onCheckedChange={(checked) => setNewTask(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createTaskMutation.mutate(newTask)}
              disabled={createTaskMutation.isPending || !newTask.name}
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Mode Dialog */}
      <Dialog open={showMaintenanceMode} onOpenChange={setShowMaintenanceMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maintenance Mode</DialogTitle>
            <DialogDescription>
              Enable maintenance mode to prevent user access during system updates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Maintenance Message</Label>
              <Textarea
                placeholder="The system is temporarily unavailable for maintenance. Please check back in a few minutes."
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Warning</span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">
                Enabling maintenance mode will prevent all users from accessing the system.
                Only administrators will be able to access the system.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaintenanceMode(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => maintenanceModeMutation.mutate(true, maintenanceMessage)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Enable Maintenance Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Restart Confirmation */}
      <AlertDialog open={showSystemRestart} onOpenChange={setShowSystemRestart}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Restart System
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restart the system? This will temporarily interrupt service 
              for all users. The system should come back online within a few minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restartSystemMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              Restart System
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}