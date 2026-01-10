import { useState } from "react";
import { Shield, Plus, ShieldCheck, Users, Trash2, Edit, Lock, ChevronRight, AlertTriangle, Save, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { SettingsHeader, SettingsCard, SettingsSection } from "../components";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Permission {
  key: string;
  category: string;
  description: string;
}

interface PermissionCatalog {
  permissions: Permission[];
  categories: string[];
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isSystem: string;
  priority: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RoleWithPermissions extends Role {
  permissions: { id: string; roleId: string; permission: string }[];
}

interface AuditLog {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actionType: string;
  targetType: string;
  targetId: string | null;
  targetName: string | null;
  description: string;
  metadata: string | null;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  helpdesk: "Helpdesk & Tickets",
  documentation: "Documentation",
  users: "User Management",
  settings: "Settings",
  departments: "Departments",
  reports: "Reports & Analytics",
};

const categoryIcons: Record<string, string> = {
  helpdesk: "🎫",
  documentation: "📄",
  users: "👥",
  settings: "⚙️",
  departments: "🏢",
  reports: "📊",
};

interface RolesSettingsProps {
  subsection?: string;
}

export function RolesSettings({ subsection }: RolesSettingsProps) {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("helpdesk");
  
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("#6366f1");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    },
  });

  const { data: permissionCatalog } = useQuery<PermissionCatalog>({
    queryKey: ["/api/permissions"],
    queryFn: async () => {
      const res = await fetch("/api/permissions");
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json();
    },
  });

  const { data: auditData } = useQuery<{ logs: AuditLog[]; total: number }>({
    queryKey: ["/api/audit-logs", 10, 0],
    queryFn: async () => {
      const res = await fetch("/api/audit-logs?limit=10&offset=0");
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; color: string; permissions: string[] }) => {
      const roleRes = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, description: data.description, color: data.color }),
      });
      if (!roleRes.ok) throw new Error("Failed to create role");
      const role = await roleRes.json();
      
      if (data.permissions.length > 0) {
        const permRes = await fetch(`/api/roles/${role.id}/permissions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: data.permissions }),
        });
        if (!permRes.ok) throw new Error("Failed to set permissions");
      }
      
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
      setIsCreateModalOpen(false);
      resetForm();
      toast.success("Role created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string; color: string; permissions: string[] }) => {
      const roleRes = await fetch(`/api/roles/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, description: data.description, color: data.color }),
      });
      if (!roleRes.ok) {
        const err = await roleRes.json();
        throw new Error(err.error || "Failed to update role");
      }
      
      const permRes = await fetch(`/api/roles/${data.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: data.permissions }),
      });
      if (!permRes.ok) throw new Error("Failed to update permissions");
      
      return roleRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
      setIsEditModalOpen(false);
      setSelectedRole(null);
      resetForm();
      toast.success("Role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete role");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
      setDeleteRoleId(null);
      toast.success("Role deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setNewRoleColor("#6366f1");
    setSelectedPermissions(new Set());
    setActiveCategory("helpdesk");
  };

  const openEditModal = async (role: Role) => {
    setSelectedRole(role);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description || "");
    setNewRoleColor(role.color);
    
    try {
      const res = await fetch(`/api/roles/${role.id}`);
      if (res.ok) {
        const roleWithPerms: RoleWithPermissions = await res.json();
        setSelectedPermissions(new Set(roleWithPerms.permissions.map(p => p.permission)));
      }
    } catch (e) {
      console.error("Failed to fetch role permissions", e);
    }
    
    setIsEditModalOpen(true);
  };

  const togglePermission = (permKey: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permKey)) {
      newSet.delete(permKey);
    } else {
      newSet.add(permKey);
    }
    setSelectedPermissions(newSet);
  };

  const selectAllInCategory = (category: string) => {
    if (!permissionCatalog) return;
    const categoryPerms = permissionCatalog.permissions.filter(p => p.category === category);
    const newSet = new Set(selectedPermissions);
    categoryPerms.forEach(p => newSet.add(p.key));
    setSelectedPermissions(newSet);
  };

  const deselectAllInCategory = (category: string) => {
    if (!permissionCatalog) return;
    const categoryPerms = permissionCatalog.permissions.filter(p => p.category === category);
    const newSet = new Set(selectedPermissions);
    categoryPerms.forEach(p => newSet.delete(p.key));
    setSelectedPermissions(newSet);
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    createRoleMutation.mutate({
      name: newRoleName,
      description: newRoleDescription,
      color: newRoleColor,
      permissions: Array.from(selectedPermissions),
    });
  };

  const handleUpdateRole = () => {
    if (!selectedRole || !newRoleName.trim()) return;
    updateRoleMutation.mutate({
      id: selectedRole.id,
      name: newRoleName,
      description: newRoleDescription,
      color: newRoleColor,
      permissions: Array.from(selectedPermissions),
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getActionBadgeColor = (actionType: string) => {
    if (actionType.includes("created")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (actionType.includes("updated")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (actionType.includes("deleted")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const RoleBuilderContent = ({ isEditing = false }: { isEditing?: boolean }) => {
    const isSystemRole = isEditing && selectedRole?.isSystem === "true";
    const categories = permissionCatalog?.categories || [];
    const permissions = permissionCatalog?.permissions || [];
    const currentCategoryPerms = permissions.filter(p => p.category === activeCategory);
    const allSelected = currentCategoryPerms.every(p => selectedPermissions.has(p.key));

    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input 
                value={newRoleName} 
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g., Senior Editor"
                disabled={isSystemRole}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  value={newRoleColor} 
                  onChange={(e) => setNewRoleColor(e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                  disabled={isSystemRole}
                />
                <Input 
                  value={newRoleColor} 
                  onChange={(e) => setNewRoleColor(e.target.value)}
                  className="flex-1"
                  disabled={isSystemRole}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              placeholder="Describe what this role is for..."
              rows={2}
              disabled={isSystemRole}
            />
          </div>
          {isEditing && selectedRole && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{selectedRole.userCount}</strong> user{selectedRole.userCount !== 1 ? "s" : ""} will be affected by changes to this role
              </span>
            </div>
          )}
          {isSystemRole && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <Lock className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                This is a system role and cannot be modified.
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 border-r bg-muted/20 p-3 space-y-1">
            <p className="text-xs font-bold text-muted-foreground px-3 py-2 uppercase tracking-wider">Permission Categories</p>
            {categories.map((cat) => {
              const catPerms = permissions.filter(p => p.category === cat);
              const selectedCount = catPerms.filter(p => selectedPermissions.has(p.key)).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{categoryIcons[cat] || "📋"}</span>
                    <span>{categoryLabels[cat] || cat}</span>
                  </span>
                  {selectedCount > 0 && (
                    <Badge variant={activeCategory === cat ? "secondary" : "outline"} className="text-xs">
                      {selectedCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {categoryLabels[activeCategory] || activeCategory}
                </h3>
                {!isSystemRole && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => allSelected ? deselectAllInCategory(activeCategory) : selectAllInCategory(activeCategory)}
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {currentCategoryPerms.map((perm) => (
                  <div 
                    key={perm.key} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      selectedPermissions.has(perm.key) 
                        ? "bg-primary/5 border-primary/30" 
                        : "bg-card hover:bg-secondary/20"
                    )}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label className="font-medium cursor-pointer" onClick={() => !isSystemRole && togglePermission(perm.key)}>
                        {perm.description}
                      </Label>
                      <p className="text-xs text-muted-foreground font-mono">{perm.key}</p>
                    </div>
                    <Switch 
                      checked={selectedPermissions.has(perm.key)}
                      onCheckedChange={() => togglePermission(perm.key)}
                      disabled={isSystemRole}
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "roles"}
        title="Roles & Permissions"
        description="Define access control and manage security policies."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SettingsCard
          title="Roles"
          description="Manage user roles and permissions."
          icon={Shield}
          className="lg:col-span-1"
          actions={
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" /> New Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] h-[85vh] p-0 flex flex-col rounded-2xl overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Create a custom role with granular permissions.
                  </DialogDescription>
                </DialogHeader>
                <RoleBuilderContent />
                <DialogFooter className="p-4 border-t">
                  <Button variant="ghost" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
                    {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        >
          {rolesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading roles...</div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    "border-transparent bg-secondary/20 hover:bg-secondary/40"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="font-medium text-sm truncate">{role.name}</span>
                      {role.isSystem === "true" && (
                        <Badge variant="outline" className="text-[10px] shrink-0">System</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate pl-5">
                      {role.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {role.userCount}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => openEditModal(role)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    {role.isSystem !== "true" && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteRoleId(role.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No roles found. Create your first role.
                </div>
              )}
            </div>
          )}
        </SettingsCard>

        <SettingsCard
          title="Recent Activity"
          description="Audit log of role and permission changes."
          icon={History}
          className="lg:col-span-2"
        >
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {auditData?.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-xs", getActionBadgeColor(log.actionType))}>
                        {log.actionType.replace(".", " ").replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{log.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {log.actorName || "System"}
                    </p>
                  </div>
                </div>
              ))}
              {(!auditData?.logs || auditData.logs.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No audit logs yet. Changes to roles and permissions will appear here.
                </div>
              )}
            </div>
          </ScrollArea>
        </SettingsCard>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) { setSelectedRole(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[900px] h-[85vh] p-0 flex flex-col rounded-2xl overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Modify role settings and permissions.
            </DialogDescription>
          </DialogHeader>
          <RoleBuilderContent isEditing />
          <DialogFooter className="p-4 border-t">
            <Button variant="ghost" onClick={() => { setIsEditModalOpen(false); setSelectedRole(null); resetForm(); }}>
              Cancel
            </Button>
            {selectedRole?.isSystem !== "true" && (
              <Button onClick={handleUpdateRole} disabled={updateRoleMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateRoleMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRoleId} onOpenChange={(open) => !open && setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
              {deleteRoleId && roles.find(r => r.id === deleteRoleId)?.userCount ? (
                <span className="block mt-2 font-medium text-destructive">
                  Warning: {roles.find(r => r.id === deleteRoleId)?.userCount} user(s) are assigned to this role and will lose these permissions.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoleId && deleteRoleMutation.mutate(deleteRoleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
