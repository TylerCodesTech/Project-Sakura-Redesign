import { useState } from "react";
import { 
  BarChart3, Plus, Edit, Trash2, Download, Share2, Calendar, 
  Clock, TrendingUp, Users, FileText, Filter, Play, Pause,
  Mail, Bell, Eye, EyeOff, Settings, Copy, RefreshCw,
  Database, PieChart, LineChart, Activity, Target, AlertCircle
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsCard, SettingsRow } from "../components";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type User, type Department } from "@shared/schema";

interface ReportsSettingsProps {
  departmentId?: string;
  subsection?: string;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: "dashboard" | "scheduled" | "custom";
  category: string;
  visibility: "public" | "department" | "private";
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    time: string;
    recipients: string[];
  };
  createdBy: User;
  lastRun?: string;
  nextRun?: string;
  isActive: boolean;
  chartType: "bar" | "line" | "pie" | "table";
  dataSource: string;
}

interface ReportStats {
  totalReports: number;
  scheduledReports: number;
  recentRuns: number;
  averageRunTime: number;
}

const REPORT_TYPES = [
  { value: "dashboard", label: "Dashboard", icon: Activity, description: "Real-time metrics display" },
  { value: "scheduled", label: "Scheduled", icon: Calendar, description: "Automated recurring reports" },
  { value: "custom", label: "Custom", icon: Settings, description: "User-defined reports" },
];

const CHART_TYPES = [
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "pie", label: "Pie Chart", icon: PieChart },
  { value: "table", label: "Data Table", icon: FileText },
];

const DATA_SOURCES = [
  { value: "tickets", label: "Helpdesk Tickets", description: "Support ticket metrics" },
  { value: "users", label: "User Activity", description: "User engagement data" },
  { value: "documentation", label: "Documentation", description: "Content usage metrics" },
  { value: "system", label: "System Performance", description: "Infrastructure metrics" },
  { value: "custom", label: "Custom Query", description: "Custom database queries" },
];

export function ReportsSettings({ departmentId, subsection }: ReportsSettingsProps) {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const [newReport, setNewReport] = useState({
    name: "",
    description: "",
    type: "dashboard" as const,
    category: "operations",
    visibility: "department" as const,
    chartType: "bar" as const,
    dataSource: "tickets",
    autoRefresh: true,
    refreshInterval: 15,
  });

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports", departmentId, filterType, filterCategory],
  });

  const { data: stats } = useQuery<ReportStats>({
    queryKey: ["/api/reports/stats", departmentId],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: typeof newReport) => {
      return apiRequest("POST", "/api/reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setShowCreateReport(false);
      setNewReport({
        name: "",
        description: "",
        type: "dashboard",
        category: "operations",
        visibility: "department",
        chartType: "bar",
        dataSource: "tickets",
        autoRefresh: true,
        refreshInterval: 15,
      });
      toast({
        title: "Report created",
        description: "The new report has been created successfully.",
      });
    },
  });

  const runReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      return apiRequest("POST", `/api/reports/${reportId}/run`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report executed",
        description: "The report has been run successfully.",
      });
    },
  });

  const filteredReports = reports.filter(report => {
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesCategory = filterCategory === "all" || report.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const reportCategories = [...new Set(reports.map(r => r.category))];

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">All reports</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledReports}</div>
              <p className="text-xs text-muted-foreground">Auto-generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Runs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentRuns}</div>
              <p className="text-xs text-muted-foreground">Last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Runtime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRunTime}s</div>
              <p className="text-xs text-muted-foreground">Generation time</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <SettingsCard
            title="Report Management"
            description="Create, manage, and organize your business reports"
            icon={BarChart3}
            scope={departmentId ? "department" : "global"}
            helpText="Reports help analyze performance, track KPIs, and make data-driven decisions"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
                <Button onClick={() => setShowCreateReport(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {REPORT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {reportCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading reports...
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No reports found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setShowCreateReport(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Report
                      </Button>
                    </div>
                  ) : (
                    filteredReports.map((report) => {
                      const ReportTypeIcon = REPORT_TYPES.find(t => t.value === report.type)?.icon || BarChart3;
                      const ChartIcon = CHART_TYPES.find(c => c.value === report.chartType)?.icon || BarChart3;
                      
                      return (
                        <div 
                          key={report.id}
                          className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                            selectedReport?.id === report.id 
                              ? "bg-primary/5 border-primary/30" 
                              : "hover:bg-muted/50 hover:border-border/60"
                          }`}
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <ReportTypeIcon className="w-4 h-4 text-muted-foreground" />
                                <h3 className="font-semibold truncate">{report.name}</h3>
                                <Badge variant="outline">
                                  <ChartIcon className="w-3 h-3 mr-1" />
                                  {report.chartType}
                                </Badge>
                                {!report.isActive && (
                                  <Badge variant="secondary">Paused</Badge>
                                )}
                                {report.schedule && (
                                  <Badge variant="outline">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {report.schedule.frequency}
                                  </Badge>
                                )}
                              </div>
                              
                              {report.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {report.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Database className="w-3 h-3" />
                                  {DATA_SOURCES.find(ds => ds.value === report.dataSource)?.label}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {report.visibility}
                                </div>
                                {report.lastRun && (
                                  <div className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    {new Date(report.lastRun).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={report.createdBy.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {report.createdBy.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  by {report.createdBy.username}
                                </span>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => runReportMutation.mutate(report.id)}>
                                  <Play className="w-4 h-4 mr-2" />
                                  Run Now
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Report
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Report
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  {report.isActive ? (
                                    <>
                                      <Pause className="w-4 h-4 mr-2" />
                                      Pause
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      Resume
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Report Details Panel */}
                <div className="space-y-4">
                  {selectedReport ? (
                    <>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          {(() => {
                            const reportType = REPORT_TYPES.find(t => t.value === selectedReport.type);
                            const ReportIcon = reportType?.icon;
                            return ReportIcon ? <ReportIcon className="w-4 h-4" /> : null;
                          })()}
                          <h3 className="font-semibold">{selectedReport.name}</h3>
                        </div>
                        
                        {selectedReport.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {selectedReport.description}
                          </p>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="outline">
                              {REPORT_TYPES.find(t => t.value === selectedReport.type)?.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Chart Type</span>
                            <Badge variant="outline">
                              {(() => {
                                const chartType = CHART_TYPES.find(c => c.value === selectedReport.chartType);
                                const ChartIcon = chartType?.icon;
                                return ChartIcon ? <ChartIcon className="w-3 h-3 mr-1" /> : null;
                              })()}
                              {CHART_TYPES.find(c => c.value === selectedReport.chartType)?.label}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Data Source</span>
                            <span className="font-medium">
                              {DATA_SOURCES.find(ds => ds.value === selectedReport.dataSource)?.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Visibility</span>
                            <Badge variant="secondary">{selectedReport.visibility}</Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={selectedReport.isActive ? "secondary" : "outline"}>
                              {selectedReport.isActive ? "Active" : "Paused"}
                            </Badge>
                          </div>

                          {selectedReport.lastRun && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Last Run</span>
                              <span>{new Date(selectedReport.lastRun).toLocaleString()}</span>
                            </div>
                          )}

                          {selectedReport.schedule && (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Schedule</span>
                                <span className="font-medium">{selectedReport.schedule.frequency}</span>
                              </div>
                              {selectedReport.nextRun && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Next Run</span>
                                  <span>{new Date(selectedReport.nextRun).toLocaleString()}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => runReportMutation.mutate(selectedReport.id)}>
                            <Play className="w-4 h-4 mr-2" />
                            Run Now
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>

                      {selectedReport.schedule && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-3">Schedule Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Frequency</span>
                              <span className="font-medium">{selectedReport.schedule.frequency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Time</span>
                              <span className="font-medium">{selectedReport.schedule.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Recipients</span>
                              <span className="font-medium">{selectedReport.schedule.recipients.length}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground border rounded-lg">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Select a report to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          <SettingsCard
            title="Dashboard Configuration"
            description="Configure real-time dashboards and KPI displays"
            icon={Activity}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Auto-refresh Interval" 
                description="How often dashboards refresh their data"
              >
                <div className="flex items-center gap-2">
                  <Select defaultValue="15">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Real-time Updates" 
                description="Enable live data streaming for supported widgets"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Performance Mode" 
                description="Optimize dashboard loading for better performance"
              >
                <Switch />
              </SettingsRow>

              <SettingsRow 
                label="Export Dashboards" 
                description="Allow users to export dashboard data"
              >
                <Switch defaultChecked />
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <SettingsCard
            title="Scheduled Reports"
            description="Configure automatic report generation and delivery"
            icon={Calendar}
            scope={departmentId ? "department" : "global"}
            actions={
              <Button size="sm" onClick={() => setShowScheduleDialog(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
            }
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Email Delivery" 
                description="Send scheduled reports via email"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Maximum Recipients" 
                description="Maximum number of email recipients per report"
              >
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="50" className="w-20" />
                  <span className="text-sm text-muted-foreground">recipients</span>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Report Retention" 
                description="How long to keep generated report files"
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
                label="Failure Notifications" 
                description="Notify administrators when scheduled reports fail"
              >
                <Switch defaultChecked />
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="data-sources" className="space-y-6">
          <SettingsCard
            title="Data Source Configuration"
            description="Configure available data sources for reports"
            icon={Database}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              {DATA_SOURCES.map((source) => (
                <SettingsRow 
                  key={source.value}
                  label={source.label}
                  description={source.description}
                >
                  <Switch defaultChecked={source.value !== "custom"} />
                </SettingsRow>
              ))}

              <div className="pt-4 border-t">
                <SettingsRow 
                  label="Custom Query Timeout" 
                  description="Maximum execution time for custom database queries"
                >
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="30" className="w-20" />
                    <span className="text-sm text-muted-foreground">seconds</span>
                  </div>
                </SettingsRow>

                <SettingsRow 
                  label="Query Result Limit" 
                  description="Maximum number of rows returned by queries"
                >
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="10000" className="w-24" />
                    <span className="text-sm text-muted-foreground">rows</span>
                  </div>
                </SettingsRow>
              </div>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsCard
            title="Report System Settings"
            description="Global configuration for the reporting system"
            icon={Settings}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Report Generation Limit" 
                description="Maximum number of reports that can run simultaneously"
              >
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="5" className="w-20" />
                  <span className="text-sm text-muted-foreground">concurrent reports</span>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Cache Duration" 
                description="How long to cache report results"
              >
                <Select defaultValue="15">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsRow 
                label="Anonymous Usage" 
                description="Allow viewing reports without authentication (public reports only)"
              >
                <Switch />
              </SettingsRow>

              <SettingsRow 
                label="Export Formats" 
                description="Available export formats for reports"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Excel (XLSX)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">CSV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">JSON</span>
                  </div>
                </div>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <Dialog open={showCreateReport} onOpenChange={setShowCreateReport}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Create a custom report to analyze your business data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Name *</Label>
              <Input
                placeholder="e.g., Monthly Support Metrics"
                value={newReport.name}
                onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this report..."
                value={newReport.description}
                onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select 
                  value={newReport.type} 
                  onValueChange={(value: any) => setNewReport(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chart Type</Label>
                <Select 
                  value={newReport.chartType} 
                  onValueChange={(value: any) => setNewReport(prev => ({ ...prev, chartType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_TYPES.map((chart) => (
                      <SelectItem key={chart.value} value={chart.value}>
                        <div className="flex items-center gap-2">
                          <chart.icon className="w-4 h-4" />
                          {chart.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Select 
                  value={newReport.dataSource} 
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, dataSource: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        <div>
                          <div>{source.label}</div>
                          <div className="text-xs text-muted-foreground">{source.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select 
                  value={newReport.visibility} 
                  onValueChange={(value: any) => setNewReport(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newReport.type === "dashboard" && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-refresh</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically update data every {newReport.refreshInterval} minutes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newReport.autoRefresh}
                    onCheckedChange={(checked) => setNewReport(prev => ({ ...prev, autoRefresh: checked }))}
                  />
                  {newReport.autoRefresh && (
                    <Select 
                      value={newReport.refreshInterval.toString()} 
                      onValueChange={(value) => setNewReport(prev => ({ ...prev, refreshInterval: parseInt(value) }))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5m</SelectItem>
                        <SelectItem value="15">15m</SelectItem>
                        <SelectItem value="30">30m</SelectItem>
                        <SelectItem value="60">1h</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateReport(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createReportMutation.mutate(newReport)}
              disabled={createReportMutation.isPending || !newReport.name}
            >
              {createReportMutation.isPending ? "Creating..." : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}