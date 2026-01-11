import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  GripVertical,
  Plus,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Database,
  Table,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  ArrowUpDown,
  X,
  Save,
  Play,
  Settings2,
  Columns,
  Rows,
  Group,
} from "lucide-react";

interface ReportField {
  id: string;
  name: string;
  displayName: string;
  dataType: string;
  dataSource: string;
  category: string | null;
  isFilterable: boolean;
  isSortable: boolean;
  isGroupable: boolean;
  aggregations: string | null;
  order: number;
}

interface SelectedField {
  id: string;
  fieldId: string;
  name: string;
  displayName: string;
  dataType: string;
  visible: boolean;
  sortOrder: "asc" | "desc" | null;
  aggregation: string | null;
  width: number | null;
}

interface FilterCondition {
  id: string;
  fieldId: string;
  fieldName: string;
  operator: string;
  value: string;
  logic: "and" | "or";
}

interface GroupByConfig {
  fieldId: string;
  fieldName: string;
}

interface ReportConfig {
  name: string;
  description: string;
  dataSource: string;
  type: string;
  fields: SelectedField[];
  filters: FilterCondition[];
  groupBy: GroupByConfig[];
  visualization: {
    type: "table" | "bar" | "line" | "pie" | "area";
    options: Record<string, any>;
  };
}

const dataSources = [
  { value: "tickets", label: "Tickets", description: "Support ticket data" },
  { value: "users", label: "Users", description: "User account information" },
  { value: "audit_logs", label: "Audit Logs", description: "System activity logs" },
  { value: "sla_states", label: "SLA States", description: "SLA configuration" },
  { value: "sla_policies", label: "SLA Policies", description: "SLA policy definitions" },
  { value: "departments", label: "Departments", description: "Department data" },
  { value: "roles", label: "Roles", description: "Role assignments" },
  { value: "pages", label: "Documentation Pages", description: "Knowledge base pages" },
  { value: "books", label: "Documentation Books", description: "Knowledge base books" },
];

const filterOperators: Record<string, { label: string; applicableTypes: string[] }[]> = {
  text: [
    { label: "equals", applicableTypes: ["text", "string", "varchar"] },
    { label: "contains", applicableTypes: ["text", "string", "varchar"] },
    { label: "starts with", applicableTypes: ["text", "string", "varchar"] },
    { label: "ends with", applicableTypes: ["text", "string", "varchar"] },
    { label: "is empty", applicableTypes: ["text", "string", "varchar"] },
    { label: "is not empty", applicableTypes: ["text", "string", "varchar"] },
  ],
  number: [
    { label: "equals", applicableTypes: ["number", "integer", "decimal"] },
    { label: "greater than", applicableTypes: ["number", "integer", "decimal"] },
    { label: "less than", applicableTypes: ["number", "integer", "decimal"] },
    { label: "between", applicableTypes: ["number", "integer", "decimal"] },
  ],
  date: [
    { label: "on", applicableTypes: ["date", "datetime", "timestamp"] },
    { label: "before", applicableTypes: ["date", "datetime", "timestamp"] },
    { label: "after", applicableTypes: ["date", "datetime", "timestamp"] },
    { label: "between", applicableTypes: ["date", "datetime", "timestamp"] },
    { label: "in the last", applicableTypes: ["date", "datetime", "timestamp"] },
  ],
  boolean: [
    { label: "is true", applicableTypes: ["boolean"] },
    { label: "is false", applicableTypes: ["boolean"] },
  ],
};

const aggregationOptions = [
  { value: "none", label: "No Aggregation" },
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];

const visualizationTypes = [
  { value: "table", label: "Table", icon: Table },
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "pie", label: "Pie Chart", icon: PieChart },
  { value: "area", label: "Area Chart", icon: AreaChart },
];

const defaultFields: Record<string, ReportField[]> = {
  tickets: [
    { id: "t1", name: "id", displayName: "Ticket ID", dataType: "string", dataSource: "tickets", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "t2", name: "title", displayName: "Title", dataType: "string", dataSource: "tickets", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 2 },
    { id: "t3", name: "status", displayName: "Status", dataType: "string", dataSource: "tickets", category: "Basic", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 3 },
    { id: "t4", name: "priority", displayName: "Priority", dataType: "string", dataSource: "tickets", category: "Basic", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 4 },
    { id: "t5", name: "createdAt", displayName: "Created Date", dataType: "datetime", dataSource: "tickets", category: "Dates", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count,min,max", order: 5 },
    { id: "t6", name: "resolvedAt", displayName: "Resolved Date", dataType: "datetime", dataSource: "tickets", category: "Dates", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count,min,max", order: 6 },
    { id: "t7", name: "assigneeId", displayName: "Assignee", dataType: "string", dataSource: "tickets", category: "People", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 7 },
    { id: "t8", name: "departmentId", displayName: "Department", dataType: "string", dataSource: "tickets", category: "Organization", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 8 },
    { id: "t9", name: "responseTime", displayName: "Response Time (hrs)", dataType: "number", dataSource: "tickets", category: "Metrics", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "sum,avg,min,max", order: 9 },
    { id: "t10", name: "resolutionTime", displayName: "Resolution Time (hrs)", dataType: "number", dataSource: "tickets", category: "Metrics", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "sum,avg,min,max", order: 10 },
  ],
  users: [
    { id: "u1", name: "id", displayName: "User ID", dataType: "string", dataSource: "users", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "u2", name: "username", displayName: "Username", dataType: "string", dataSource: "users", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 2 },
    { id: "u3", name: "email", displayName: "Email", dataType: "string", dataSource: "users", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 3 },
    { id: "u4", name: "role", displayName: "Role", dataType: "string", dataSource: "users", category: "Access", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 4 },
    { id: "u5", name: "department", displayName: "Department", dataType: "string", dataSource: "users", category: "Organization", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 5 },
    { id: "u6", name: "createdAt", displayName: "Created Date", dataType: "datetime", dataSource: "users", category: "Dates", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count,min,max", order: 6 },
    { id: "u7", name: "lastLogin", displayName: "Last Login", dataType: "datetime", dataSource: "users", category: "Dates", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "min,max", order: 7 },
    { id: "u8", name: "isActive", displayName: "Active", dataType: "boolean", dataSource: "users", category: "Status", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 8 },
  ],
  audit_logs: [
    { id: "a1", name: "id", displayName: "Log ID", dataType: "string", dataSource: "audit_logs", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "a2", name: "action", displayName: "Action", dataType: "string", dataSource: "audit_logs", category: "Basic", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 2 },
    { id: "a3", name: "actor", displayName: "Actor", dataType: "string", dataSource: "audit_logs", category: "People", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 3 },
    { id: "a4", name: "targetType", displayName: "Target Type", dataType: "string", dataSource: "audit_logs", category: "Basic", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 4 },
    { id: "a5", name: "targetId", displayName: "Target ID", dataType: "string", dataSource: "audit_logs", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 5 },
    { id: "a6", name: "createdAt", displayName: "Timestamp", dataType: "datetime", dataSource: "audit_logs", category: "Dates", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count,min,max", order: 6 },
    { id: "a7", name: "ipAddress", displayName: "IP Address", dataType: "string", dataSource: "audit_logs", category: "Details", isFilterable: true, isSortable: false, isGroupable: true, aggregations: "count", order: 7 },
  ],
  departments: [
    { id: "d1", name: "id", displayName: "Department ID", dataType: "string", dataSource: "departments", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "d2", name: "name", displayName: "Name", dataType: "string", dataSource: "departments", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 2 },
    { id: "d3", name: "headId", displayName: "Department Head", dataType: "string", dataSource: "departments", category: "People", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 3 },
    { id: "d4", name: "memberCount", displayName: "Member Count", dataType: "number", dataSource: "departments", category: "Metrics", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "sum,avg,min,max", order: 4 },
  ],
  roles: [
    { id: "r1", name: "id", displayName: "Role ID", dataType: "string", dataSource: "roles", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "r2", name: "name", displayName: "Name", dataType: "string", dataSource: "roles", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 2 },
    { id: "r3", name: "priority", displayName: "Priority", dataType: "number", dataSource: "roles", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "min,max", order: 3 },
    { id: "r4", name: "userCount", displayName: "User Count", dataType: "number", dataSource: "roles", category: "Metrics", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "sum,avg,min,max", order: 4 },
  ],
  sla_states: [
    { id: "s1", name: "id", displayName: "State ID", dataType: "string", dataSource: "sla_states", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "s2", name: "name", displayName: "State Name", dataType: "string", dataSource: "sla_states", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 2 },
    { id: "s3", name: "color", displayName: "Color", dataType: "string", dataSource: "sla_states", category: "Display", isFilterable: false, isSortable: false, isGroupable: false, aggregations: null, order: 3 },
    { id: "s4", name: "order", displayName: "Order", dataType: "number", dataSource: "sla_states", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 4 },
  ],
  sla_policies: [
    { id: "p1", name: "id", displayName: "Policy ID", dataType: "string", dataSource: "sla_policies", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "p2", name: "name", displayName: "Policy Name", dataType: "string", dataSource: "sla_policies", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 2 },
    { id: "p3", name: "responseTarget", displayName: "Response Target (hrs)", dataType: "number", dataSource: "sla_policies", category: "Targets", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "avg,min,max", order: 3 },
    { id: "p4", name: "resolutionTarget", displayName: "Resolution Target (hrs)", dataType: "number", dataSource: "sla_policies", category: "Targets", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "avg,min,max", order: 4 },
  ],
  pages: [
    { id: "pg1", name: "id", displayName: "Page ID", dataType: "string", dataSource: "pages", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "pg2", name: "title", displayName: "Title", dataType: "string", dataSource: "pages", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 2 },
    { id: "pg3", name: "authorId", displayName: "Author", dataType: "string", dataSource: "pages", category: "People", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 3 },
    { id: "pg4", name: "bookId", displayName: "Book", dataType: "string", dataSource: "pages", category: "Organization", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 4 },
    { id: "pg5", name: "createdAt", displayName: "Created Date", dataType: "datetime", dataSource: "pages", category: "Dates", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count,min,max", order: 5 },
    { id: "pg6", name: "updatedAt", displayName: "Updated Date", dataType: "datetime", dataSource: "pages", category: "Dates", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "min,max", order: 6 },
  ],
  books: [
    { id: "b1", name: "id", displayName: "Book ID", dataType: "string", dataSource: "books", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "count", order: 1 },
    { id: "b2", name: "title", displayName: "Title", dataType: "string", dataSource: "books", category: "Basic", isFilterable: true, isSortable: true, isGroupable: false, aggregations: null, order: 2 },
    { id: "b3", name: "authorId", displayName: "Author", dataType: "string", dataSource: "books", category: "People", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count", order: 3 },
    { id: "b4", name: "pageCount", displayName: "Page Count", dataType: "number", dataSource: "books", category: "Metrics", isFilterable: true, isSortable: true, isGroupable: false, aggregations: "sum,avg,min,max", order: 4 },
    { id: "b5", name: "createdAt", displayName: "Created Date", dataType: "datetime", dataSource: "books", category: "Dates", isFilterable: true, isSortable: true, isGroupable: true, aggregations: "count,min,max", order: 5 },
  ],
};

interface ReportBuilderProps {
  initialConfig?: Partial<ReportConfig>;
  onSave?: (config: ReportConfig) => void;
}

export function ReportBuilder({ initialConfig, onSave }: ReportBuilderProps) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<ReportConfig>({
    name: initialConfig?.name || "New Report",
    description: initialConfig?.description || "",
    dataSource: initialConfig?.dataSource || "tickets",
    type: initialConfig?.type || "custom",
    fields: initialConfig?.fields || [],
    filters: initialConfig?.filters || [],
    groupBy: initialConfig?.groupBy || [],
    visualization: initialConfig?.visualization || { type: "table", options: {} },
  });

  const [activeTab, setActiveTab] = useState("fields");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const availableFields = defaultFields[config.dataSource] || [];

  const fieldsByCategory = availableFields.reduce((acc, field) => {
    const cat = field.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(field);
    return acc;
  }, {} as Record<string, ReportField[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addField = (field: ReportField) => {
    if (config.fields.some(f => f.fieldId === field.id)) {
      toast.info("Field already added");
      return;
    }
    const newField: SelectedField = {
      id: `sf-${Date.now()}`,
      fieldId: field.id,
      name: field.name,
      displayName: field.displayName,
      dataType: field.dataType,
      visible: true,
      sortOrder: null,
      aggregation: null,
      width: null,
    };
    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    toast.success(`Added ${field.displayName}`);
  };

  const removeField = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }));
  };

  const updateField = (fieldId: string, updates: Partial<SelectedField>) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    }));
  };

  const toggleFieldSort = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => {
        if (f.id !== fieldId) return { ...f, sortOrder: null };
        return {
          ...f,
          sortOrder: f.sortOrder === null ? "asc" : f.sortOrder === "asc" ? "desc" : null,
        };
      }),
    }));
  };

  const addFilter = () => {
    const firstField = availableFields[0];
    if (!firstField) return;

    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      fieldId: firstField.id,
      fieldName: firstField.displayName,
      operator: "equals",
      value: "",
      logic: config.filters.length > 0 ? "and" : "and",
    };
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter],
    }));
  };

  const updateFilter = (filterId: string, updates: Partial<FilterCondition>) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map(f =>
        f.id === filterId ? { ...f, ...updates } : f
      ),
    }));
  };

  const removeFilter = (filterId: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId),
    }));
  };

  const addGroupBy = (field: ReportField) => {
    if (config.groupBy.some(g => g.fieldId === field.id)) {
      toast.info("Field already used for grouping");
      return;
    }
    setConfig(prev => ({
      ...prev,
      groupBy: [...prev.groupBy, { fieldId: field.id, fieldName: field.displayName }],
    }));
  };

  const removeGroupBy = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      groupBy: prev.groupBy.filter(g => g.fieldId !== fieldId),
    }));
  };

  const handleReorderFields = (newOrder: SelectedField[]) => {
    setConfig(prev => ({ ...prev, fields: newOrder }));
  };

  const handleSave = () => {
    if (!config.name.trim()) {
      toast.error("Please enter a report name");
      return;
    }
    if (config.fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }
    onSave?.(config);
    toast.success("Report configuration saved");
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-3 space-y-4">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={config.dataSource}
              onValueChange={(value) => {
                setConfig(prev => ({
                  ...prev,
                  dataSource: value,
                  fields: [],
                  filters: [],
                  groupBy: [],
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    <div>
                      <div className="font-medium">{source.label}</div>
                      <div className="text-xs text-muted-foreground">{source.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Columns className="h-4 w-4" />
                Available Fields
              </h4>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {Object.entries(fieldsByCategory).map(([category, fields]) => (
                    <div key={category}>
                      <button
                        className="flex items-center justify-between w-full px-2 py-1.5 text-sm font-medium hover:bg-muted rounded"
                        onClick={() => toggleCategory(category)}
                      >
                        <span>{category}</span>
                        {expandedCategories.includes(category) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedCategories.includes(category) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 space-y-0.5">
                              {fields.map((field) => (
                                <button
                                  key={field.id}
                                  className="flex items-center justify-between w-full px-2 py-1.5 text-sm hover:bg-muted rounded group"
                                  onClick={() => addField(field)}
                                >
                                  <span className="text-muted-foreground">{field.displayName}</span>
                                  <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-9 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Input
                  className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 w-[300px]"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Report Name"
                />
                <Input
                  className="text-sm text-muted-foreground border-none p-0 h-auto focus-visible:ring-0 w-[400px]"
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <Columns className="h-4 w-4" />
              Columns ({config.fields.length})
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters ({config.filters.length})
            </TabsTrigger>
            <TabsTrigger value="grouping" className="flex items-center gap-2">
              <Group className="h-4 w-4" />
              Grouping ({config.groupBy.length})
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visualization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Selected Columns</CardTitle>
                <CardDescription>
                  Drag to reorder. Click column header icons to configure sorting and visibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {config.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Columns className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No columns selected</p>
                    <p className="text-sm">Add fields from the left panel</p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={config.fields}
                    onReorder={handleReorderFields}
                    className="space-y-2"
                  >
                    {config.fields.map((field) => (
                      <Reorder.Item
                        key={field.id}
                        value={field}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium">{field.displayName}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {field.dataType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateField(field.id, { visible: !field.visible })}
                          >
                            {field.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleFieldSort(field.id)}
                          >
                            {field.sortOrder === "asc" ? (
                              <SortAsc className="h-4 w-4 text-primary" />
                            ) : field.sortOrder === "desc" ? (
                              <SortDesc className="h-4 w-4 text-primary" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Select
                            value={field.aggregation || "none"}
                            onValueChange={(value) =>
                              updateField(field.id, { aggregation: value === "none" ? null : value })
                            }
                          >
                            <SelectTrigger className="w-[100px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {aggregationOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeField(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="mt-4">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Filter Conditions</CardTitle>
                  <CardDescription>
                    Add conditions to filter your report data
                  </CardDescription>
                </div>
                <Button size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </CardHeader>
              <CardContent>
                {config.filters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No filters applied</p>
                    <p className="text-sm">Add filters to narrow down your results</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {config.filters.map((filter, index) => (
                      <div key={filter.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        {index > 0 && (
                          <Select
                            value={filter.logic}
                            onValueChange={(value) =>
                              updateFilter(filter.id, { logic: value as "and" | "or" })
                            }
                          >
                            <SelectTrigger className="w-[80px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="and">AND</SelectItem>
                              <SelectItem value="or">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Select
                          value={filter.fieldId}
                          onValueChange={(value) => {
                            const field = availableFields.find(f => f.id === value);
                            if (field) {
                              updateFilter(filter.id, {
                                fieldId: value,
                                fieldName: field.displayName,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.filter(f => f.isFilterable).map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={filter.operator}
                          onValueChange={(value) =>
                            updateFilter(filter.id, { operator: value })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {filterOperators.text.map((op) => (
                              <SelectItem key={op.label} value={op.label}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="flex-1"
                          value={filter.value}
                          onChange={(e) =>
                            updateFilter(filter.id, { value: e.target.value })
                          }
                          placeholder="Value..."
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grouping" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Group By</CardTitle>
                <CardDescription>
                  Select fields to group your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {config.groupBy.map((group) => (
                    <Badge
                      key={group.fieldId}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {group.fieldName}
                      <button
                        onClick={() => removeGroupBy(group.fieldId)}
                        className="ml-1 hover:bg-muted rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {config.groupBy.length === 0 && (
                    <p className="text-sm text-muted-foreground">No grouping applied</p>
                  )}
                </div>
                <Separator className="my-4" />
                <div>
                  <h4 className="text-sm font-medium mb-2">Available for Grouping</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableFields
                      .filter(f => f.isGroupable && !config.groupBy.some(g => g.fieldId === f.id))
                      .map((field) => (
                        <Button
                          key={field.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addGroupBy(field)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {field.displayName}
                        </Button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Visualization Type</CardTitle>
                <CardDescription>
                  Choose how to display your report data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {visualizationTypes.map((viz) => (
                    <button
                      key={viz.value}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        config.visualization.type === viz.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/50"
                      }`}
                      onClick={() =>
                        setConfig(prev => ({
                          ...prev,
                          visualization: { ...prev.visualization, type: viz.value as any },
                        }))
                      }
                    >
                      <viz.icon className={`h-8 w-8 mx-auto mb-2 ${
                        config.visualization.type === viz.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`} />
                      <div className="text-sm font-medium">{viz.label}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
