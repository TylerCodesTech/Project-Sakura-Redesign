import { useState } from "react";
import { Shield, Plus, ShieldCheck, Users, Trash2, Edit, Lock, ChevronRight, AlertTriangle, Save, X, History, Key, Eye, EyeOff, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsCard, SettingsRow } from "../components";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Permission {
  key: string;
  category: string;
  description: string;
  scope: 'global' | 'department' | 'both';
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isSystem: boolean;
  priority: number;
  userCount?: number;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

interface RolesSettingsProps {
  subsection?: string;
}

const PERMISSION_CATEGORIES = {
  helpdesk: {
    label: "Helpdesk & Tickets",
    icon: "🎫",
    description: "Manage tickets, SLA policies, and helpdesk configuration"
  },
  documentation: {
    label: "Documentation",
    icon: "📄", 
    description: "Create, edit, and manage knowledge base content"
  },
  users: {
    label: "User Management",
    icon: "👥",
    description: "Manage user accounts, profiles, and authentication"
  },
  settings: {
    label: "System Settings",
    icon: "⚙️",
    description: "Configure platform settings and preferences"
  },
  departments: {
    label: "Departments",
    icon: "🏢",
    description: "Organize and manage departmental structure"
  },
  reports: {
    label: "Reports & Analytics",
    icon: "📊",
    description: "Generate reports and view analytics data"
  },
  ai: {
    label: "AI Configuration",
    icon: "🤖",
    description: "Configure AI models and settings"
  }
};

const SAMPLE_PERMISSIONS: Permission[] = [
  // Helpdesk permissions
  { key: "helpdesk.tickets.view", category: "helpdesk", description: "View tickets", scope: "both" },
  { key: "helpdesk.tickets.create", category: "helpdesk", description: "Create tickets", scope: "both" },
  { key: "helpdesk.tickets.edit", category: "helpdesk", description: "Edit tickets", scope: "both" },
  { key: "helpdesk.tickets.delete", category: "helpdesk", description: "Delete tickets", scope: "both" },
  { key: "helpdesk.tickets.assign", category: "helpdesk", description: "Assign tickets to users", scope: "both" },
  { key: "helpdesk.settings.manage", category: "helpdesk", description: "Manage helpdesk settings", scope: "department" },
  
  // Documentation permissions
  { key: "docs.books.view", category: "documentation", description: "View documentation", scope: "both" },
  { key: "docs.books.create", category: "documentation", description: "Create books", scope: "both" },
  { key: "docs.pages.edit", category: "documentation", description: "Edit pages", scope: "both" },
  { key: "docs.settings.manage", category: "documentation", description: "Manage docs settings", scope: "department" },
  
  // User management permissions
  { key: "users.view", category: "users", description: "View user list", scope: "global" },
  { key: "users.create", category: "users", description: "Create new users", scope: "global" },
  { key: "users.edit", category: "users", description: "Edit user profiles", scope: "global" },
  { key: "users.delete", category: "users", description: "Delete users", scope: "global" },
  { key: "users.roles.assign", category: "users", description: "Assign roles to users", scope: "global" },
  
  // Settings permissions
  { key: "settings.general.manage", category: "settings", description: "Manage general settings", scope: "global" },
  { key: "settings.branding.manage", category: "settings", description: "Manage branding", scope: "global" },
  { key: "settings.security.manage", category: "settings", description: "Manage security settings", scope: "global" },
  
  // Department permissions
  { key: "departments.view", category: "departments", description: "View departments", scope: "global" },
  { key: "departments.create", category: "departments", description: "Create departments", scope: "global" },
  { key: "departments.edit", category: "departments", description: "Edit departments", scope: "global" },
  
  // Reports permissions
  { key: "reports.view", category: "reports", description: "View reports", scope: "both" },
  { key: "reports.create", category: "reports", description: "Create reports", scope: "both" },
  { key: "reports.settings.manage", category: "reports", description: "Manage report settings", scope: "department" },
  
  // AI permissions
  { key: "ai.settings.manage", category: "ai", description: "Manage AI configuration", scope: "global" },
];

export function RolesSettings({ subsection }: RolesSettingsProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    color: "#7c3aed",
    permissions: [] as string[],
  });

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: typeof newRole) => {
      return apiRequest("POST", "/api/roles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setShowCreateRole(false);
      setNewRole({
        name: "",
        description: "",
        color: "#7c3aed",
        permissions: [],
      });
      toast({
        title: "Role created",
        description: "The new role has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setShowDeleteConfirm(false);
      setRoleToDelete(null);
      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  const isSecurityPolicies = subsection === "roles-policies";

  if (isSecurityPolicies) {
    return (
      <div className="space-y-6">
        <SettingsCard
          title="Security Policies"
          description="Configure security policies and access control rules"
          icon={Shield}
          scope="global"
        >
          <div className="space-y-6">
            <SettingsRow 
              label="Default Role for New Users" 
              description="Automatically assign this role to new users"
            >
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select default role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(role => !role.isSystem).map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: role.color }}
                        />
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow 
              label="Require Role for Features" 
              description="Require users to have specific permissions to access features"
            >
              <Switch defaultChecked />
            </SettingsRow>

            <SettingsRow 
              label="Department-based Auto-assignment" 
              description="Automatically assign roles based on user's department"
            >
              <Switch />
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Audit & Compliance"
          description="Security monitoring and compliance settings"
          icon={History}
          scope="global"
        >
          <div className="space-y-4">
            <SettingsRow 
              label="Enable Audit Logging" 
              description="Log all role and permission changes"
            >
              <Switch defaultChecked />
            </SettingsRow>

            <SettingsRow 
              label="Log Retention Period" 
              description="How long to keep audit logs"
            >
              <Select defaultValue="365">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="1095">3 years</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow 
              label="Sensitive Action Alerts" 
              description="Send alerts for critical permission changes"
            >
              <Switch defaultChecked />
            </SettingsRow>

            <SettingsRow 
              label="Failed Login Attempt Threshold" 
              description="Lock accounts after this many failed attempts"
            >
              <Select defaultValue="5">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="0">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow 
              label="Account Lockout Duration" 
              description="How long to lock accounts after failed attempts"
            >
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
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="System Roles"
        description="Manage roles and their permissions to control access throughout your organization"
        icon={Shield}
        scope="global"
        helpText="Roles define what users can do in the system. Assign permissions carefully to maintain security."
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPermissionMatrix(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Permission Matrix
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowCreateRole(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id} className={cn(
                "transition-all duration-200",
                selectedRole?.id === role.id ? "ring-2 ring-primary" : "hover:shadow-md"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: role.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{role.name}</CardTitle>
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              System
                            </Badge>
                          )}
                        </div>
                        {role.description && (
                          <CardDescription className="text-sm mt-1">
                            {role.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {role.userCount || 0} users
                        </div>
                        <div className="text-xs">Priority: {role.priority}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRole(role)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRoleToDelete(role);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {selectedRole?.id === role.id && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium mb-3">Permissions</div>
                      <div className="grid gap-3">
                        {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
                          const categoryPermissions = SAMPLE_PERMISSIONS.filter(p => p.category === key);
                          const rolePermissions = role.permissions || [];
                          const hasPermissions = categoryPermissions.some(p => 
                            rolePermissions.includes(p.key)
                          );
                          
                          return (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{category.icon}</span>
                                <div>
                                  <div className="font-medium text-sm">{category.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {categoryPermissions.length} permissions available
                                  </div>
                                </div>
                              </div>
                              <Badge variant={hasPermissions ? "default" : "secondary"}>
                                {hasPermissions ? "Granted" : "No Access"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Role Templates"
        description="Pre-configured role templates for common use cases"
        icon={Copy}
        scope="global"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Viewer",
              description: "Read-only access to most content",
              permissions: ["View tickets", "View documentation"],
              color: "#64748b"
            },
            {
              name: "Editor", 
              description: "Can create and edit content",
              permissions: ["Create tickets", "Edit documentation"],
              color: "#059669"
            },
            {
              name: "Admin",
              description: "Full administrative access",
              permissions: ["All permissions", "User management"],
              color: "#dc2626"
            }
          ].map((template) => (
            <Card key={template.name} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: template.color }}
                  />
                  <div className="font-medium text-sm">{template.name}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {template.description}
              </div>
              <div className="space-y-1 mb-3">
                {template.permissions.map((permission) => (
                  <div key={permission} className="text-xs text-muted-foreground">
                    • {permission}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Copy className="w-3 h-3 mr-2" />
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      </SettingsCard>

      {/* Create Role Dialog */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions and access levels.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Name *</Label>
                <Input
                  placeholder="e.g., Support Agent"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={newRole.color}
                    onChange={(e) => setNewRole(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Input
                    type="text"
                    value={newRole.color}
                    onChange={(e) => setNewRole(prev => ({ ...prev, color: e.target.value }))}
                    className="font-mono text-sm"
                    placeholder="#7c3aed"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this role can do..."
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
                  const categoryPermissions = SAMPLE_PERMISSIONS.filter(p => p.category === categoryKey);
                  
                  return (
                    <div key={categoryKey} className="space-y-3">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <span>{category.icon}</span>
                        {category.label}
                      </div>
                      <div className="ml-6 space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.key} className="flex items-start gap-2">
                            <Checkbox
                              checked={newRole.permissions.includes(permission.key)}
                              onCheckedChange={(checked) => {
                                setNewRole(prev => ({
                                  ...prev,
                                  permissions: checked
                                    ? [...prev.permissions, permission.key]
                                    : prev.permissions.filter(p => p !== permission.key)
                                }));
                              }}
                              className="mt-0.5"
                            />
                            <div>
                              <div className="text-sm">{permission.description}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {permission.scope}
                                </Badge>
                                {permission.key}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRole(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createRoleMutation.mutate(newRole)}
              disabled={createRoleMutation.isPending || !newRole.name}
            >
              {createRoleMutation.isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Matrix Dialog */}
      <Dialog open={showPermissionMatrix} onOpenChange={setShowPermissionMatrix}>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Permission Matrix</DialogTitle>
            <DialogDescription>
              Overview of all roles and their permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Permission</TableHead>
                    <TableHead className="w-24">Scope</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className="text-center min-w-24">
                        <div className="flex flex-col items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: role.color }}
                          />
                          <span className="text-xs">{role.name}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
                    const categoryPermissions = SAMPLE_PERMISSIONS.filter(p => p.category === categoryKey);
                    
                    return categoryPermissions.map((permission, index) => (
                      <TableRow key={permission.key}>
                        <TableCell>
                          {index === 0 && (
                            <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.label}
                            </div>
                          )}
                          <div className="ml-6">{permission.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {permission.scope}
                          </Badge>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {(role.permissions || []).includes(permission.key) ? (
                              <ShieldCheck className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{roleToDelete?.name}" role? 
              This action cannot be undone and will affect {roleToDelete?.userCount || 0} users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleToDelete && deleteRoleMutation.mutate(roleToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}