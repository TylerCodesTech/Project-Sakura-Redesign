import { useState } from "react";
import { Building2, Plus, Edit, Trash2, Users, Settings, ChevronDown, ChevronRight, MoreVertical, Palette, Crown, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Tree,
  TreeItem,
} from "@/components/ui/tree";
import { SettingsCard, SettingsRow } from "../components";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Department, type User } from "@shared/schema";

interface DepartmentsSettingsProps {
  subsection?: string;
  onNavigateToHelpdesk?: (departmentId: string) => void;
}

interface DepartmentWithUsers extends Department {
  userCount: number;
  manager?: User;
  members?: User[];
  children?: DepartmentWithUsers[];
}

const DEPARTMENT_COLORS = [
  "#7c3aed", "#dc2626", "#059669", "#d97706", "#0284c7", 
  "#7c2d12", "#be123c", "#a21caf", "#4338ca", "#0f766e"
];

export function DepartmentsSettings({ subsection, onNavigateToHelpdesk }: DepartmentsSettingsProps) {
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentWithUsers | null>(null);
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [showEditDept, setShowEditDept] = useState(false);
  const [showDeleteDept, setShowDeleteDept] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<DepartmentWithUsers | null>(null);
  
  const [newDept, setNewDept] = useState({
    name: "",
    description: "",
    color: DEPARTMENT_COLORS[0],
    parentId: null as string | null,
    managerId: null as string | null,
  });

  const { data: departments = [], isLoading } = useQuery<DepartmentWithUsers[]>({
    queryKey: ["/api/departments"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createDeptMutation = useMutation({
    mutationFn: async (data: typeof newDept) => {
      return apiRequest("POST", "/api/departments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setShowCreateDept(false);
      setNewDept({
        name: "",
        description: "",
        color: DEPARTMENT_COLORS[0],
        parentId: null,
        managerId: null,
      });
      toast({
        title: "Department created",
        description: "The new department has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create department",
        variant: "destructive",
      });
    },
  });

  const deleteDeptMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setShowDeleteDept(false);
      setDeptToDelete(null);
      setSelectedDepartment(null);
      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete department",
        variant: "destructive",
      });
    },
  });

  const buildDepartmentTree = (departments: DepartmentWithUsers[], parentId: string | null = null): DepartmentWithUsers[] => {
    return departments
      .filter(dept => dept.parentId === parentId)
      .map(dept => ({
        ...dept,
        children: buildDepartmentTree(departments, dept.id)
      }));
  };

  const departmentTree = buildDepartmentTree(departments);

  const DepartmentTreeItem = ({ department, level = 0 }: { department: DepartmentWithUsers; level?: number }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = department.children && department.children.length > 0;

    return (
      <div className="space-y-2">
        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
            selectedDepartment?.id === department.id 
              ? "bg-primary/5 border-primary/30" 
              : "hover:bg-muted/50 hover:border-border/60",
            "cursor-pointer"
          )}
          style={{ marginLeft: level * 20 }}
          onClick={() => setSelectedDepartment(department)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: department.color }}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{department.name}</span>
              {department.manager && (
                <Badge variant="outline" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Manager
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {department.userCount || 0} members
              </div>
              {department.description && (
                <span className="truncate">{department.description}</span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDept(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Department
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateToHelpdesk?.(department.id)}>
                <Settings className="w-4 h-4 mr-2" />
                Helpdesk Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  setDeptToDelete(department);
                  setShowDeleteDept(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Department
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {department.children?.map((child) => (
              <DepartmentTreeItem 
                key={child.id} 
                department={child} 
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Department Management"
        description="Organize your teams and manage departmental structure"
        icon={Building2}
        scope="global"
        helpText="Departments help organize users and configure settings at the team level"
        actions={
          <Button onClick={() => setShowCreateDept(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Department
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Tree */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading departments...
              </div>
            ) : departmentTree.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No departments created yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setShowCreateDept(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Department
                </Button>
              </div>
            ) : (
              departmentTree.map((dept) => (
                <DepartmentTreeItem key={dept.id} department={dept} />
              ))
            )}
          </div>

          {/* Department Details */}
          <div className="space-y-4">
            {selectedDepartment ? (
              <>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-6 h-6 rounded-full shadow-sm"
                      style={{ backgroundColor: selectedDepartment.color }}
                    />
                    <h3 className="font-semibold">{selectedDepartment.name}</h3>
                  </div>
                  
                  {selectedDepartment.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedDepartment.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium">{selectedDepartment.userCount || 0}</span>
                    </div>
                    
                    {selectedDepartment.manager && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Manager</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={selectedDepartment.manager.avatar} />
                            <AvatarFallback className="text-xs">
                              {selectedDepartment.manager.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{selectedDepartment.manager.username}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(selectedDepartment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setShowEditDept(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onNavigateToHelpdesk?.(selectedDepartment.id)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>

                {selectedDepartment.members && selectedDepartment.members.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Team Members</h4>
                    <div className="space-y-2">
                      {selectedDepartment.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 text-sm">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.username}</span>
                          {member.id === selectedDepartment.manager?.id && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              <Crown className="w-3 h-3 mr-1" />
                              Manager
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground border rounded-lg">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select a department to view details</p>
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Department Hierarchy"
        description="Configure how departments are organized and inherit settings"
        icon={Building2}
        scope="global"
      >
        <div className="space-y-4">
          <SettingsRow 
            label="Hierarchy Types" 
            description="How child departments relate to parent departments"
          >
            <Select defaultValue="subdivision">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subdivision">Subdivision</SelectItem>
                <SelectItem value="satellite">Satellite Office</SelectItem>
                <SelectItem value="branch">Branch</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>

          <SettingsRow 
            label="Inherit Parent Settings" 
            description="Child departments inherit configuration from parent"
          >
            <Switch defaultChecked />
          </SettingsRow>

          <SettingsRow 
            label="Cross-Department Permissions" 
            description="Allow users to access resources from other departments"
          >
            <Switch />
          </SettingsRow>
        </div>
      </SettingsCard>

      {/* Create Department Dialog */}
      <Dialog open={showCreateDept} onOpenChange={setShowCreateDept}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
            <DialogDescription>
              Add a new department to organize your teams.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input
                placeholder="e.g., Customer Support"
                value={newDept.name}
                onChange={(e) => setNewDept(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this department..."
                value={newDept.description}
                onChange={(e) => setNewDept(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={newDept.color}
                    onChange={(e) => setNewDept(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Select 
                    value={newDept.color} 
                    onValueChange={(value) => setNewDept(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parent Department</Label>
                <Select 
                  value={newDept.parentId || ""} 
                  onValueChange={(value) => setNewDept(prev => ({ ...prev, parentId: value || null }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (top-level)</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                          {dept.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Department Manager</Label>
              <Select 
                value={newDept.managerId || ""} 
                onValueChange={(value) => setNewDept(prev => ({ ...prev, managerId: value || null }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No manager</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.username}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDept(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createDeptMutation.mutate(newDept)}
              disabled={createDeptMutation.isPending || !newDept.name}
            >
              {createDeptMutation.isPending ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDept} onOpenChange={setShowDeleteDept}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deptToDelete?.name}"? 
              This will affect {deptToDelete?.userCount || 0} users and cannot be undone.
              {deptToDelete?.children && deptToDelete.children.length > 0 && (
                <> This department has {deptToDelete.children.length} child departments that will also be affected.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deptToDelete && deleteDeptMutation.mutate(deptToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Department
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}