import { useState } from "react";
import { Users, Search, UserPlus, Mail, MoreVertical, Eye, EyeOff, Loader2, Key, UserCircle, Pencil, Download, Upload, Filter, Shield, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SettingsCard, SettingsRow } from "../components";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type User, type Role, type Department } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UsersSettingsProps {
  subsection?: string;
}

export function UsersSettings({ subsection }: UsersSettingsProps) {
  const { toast } = useToast();
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    department: "",
    sendInvite: true,
  });

  const [invitation, setInvitation] = useState({
    email: "",
    role: "",
    department: "",
    message: "",
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      return apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowCreateUser(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "",
        department: "",
        sendInvite: true,
      });
      toast({
        title: "User created",
        description: "The new user has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (data: typeof invitation) => {
      return apiRequest("POST", "/api/users/invite", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/invitations"] });
      setShowInviteUser(false);
      setInvitation({
        email: "",
        role: "",
        department: "",
        message: "",
      });
      toast({
        title: "Invitation sent",
        description: "The invitation has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.department?.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.status === "active") ||
                         (statusFilter === "inactive" && user.status !== "active");
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesRole && matchesDepartment;
  });

  const isInvitesView = subsection === "users-invites";

  if (isInvitesView) {
    return (
      <div className="space-y-6">
        <SettingsCard
          title="Invitation Management"
          description="Send invitations to new users and manage pending invites"
          icon={Mail}
          scope="global"
          actions={
            <Button onClick={() => setShowInviteUser(true)} size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          }
        >
          <div className="space-y-4">
            <SettingsRow 
              label="Email Template" 
              description="Customize the invitation email template"
            >
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Template
              </Button>
            </SettingsRow>

            <SettingsRow 
              label="Invitation Expiry" 
              description="How long invitations remain valid"
            >
              <Select defaultValue="7">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow 
              label="Auto-assign Role" 
              description="Default role for invited users"
            >
              <Select defaultValue="">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow 
              label="Require Email Verification" 
              description="Users must verify their email before activation"
            >
              <Switch defaultChecked />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="User Directory"
        description="Manage users and their access to your organization"
        icon={Users}
        scope="global"
        helpText="Control user accounts, roles, and department assignments"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowBulkImport(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowCreateUser(true)}>
                  <UserCircle className="w-4 h-4 mr-2" />
                  Create User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowInviteUser(true)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Assign Role
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Move Department
                </Button>
                <Button variant="destructive" size="sm">
                  Suspend
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length}
                      onCheckedChange={(checked) => {
                        setSelectedUsers(checked ? filteredUsers.map(u => u.id) : []);
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            setSelectedUsers(prev => 
                              checked 
                                ? [...prev, user.id]
                                : prev.filter(id => id !== user.id)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {roles.find(r => r.id === user.role)?.name || 'No Role'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {departments.find(d => d.id === user.department)?.name || 'No Department'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className={user.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {user.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="User Profile Fields"
        description="Define custom fields for user profiles"
        icon={UserCircle}
        scope="global"
      >
        <div className="space-y-4">
          <SettingsRow 
            label="Required Fields" 
            description="Fields that must be completed during user creation"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked disabled />
                <span className="text-sm">Username</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked disabled />
                <span className="text-sm">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked />
                <span className="text-sm">Full Name</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox />
                <span className="text-sm">Phone Number</span>
              </div>
            </div>
          </SettingsRow>

          <SettingsRow 
            label="Profile Visibility" 
            description="Control what information is visible to other users"
          >
            <Select defaultValue="internal">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public (All)</SelectItem>
                <SelectItem value="internal">Internal Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
        </div>
      </SettingsCard>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input
                placeholder="johndoe"
                value={newUser.username}
                onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="john@company.com"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  value={newUser.department} 
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, department: value }))}
                >
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-invite"
                checked={newUser.sendInvite}
                onCheckedChange={(checked) => 
                  setNewUser(prev => ({ ...prev, sendInvite: checked as boolean }))
                }
              />
              <Label htmlFor="send-invite" className="text-sm">
                Send welcome email
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUser(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createUserMutation.mutate(newUser)}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInviteUser} onOpenChange={setShowInviteUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invitation</DialogTitle>
            <DialogDescription>
              Invite someone to join your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="user@company.com"
                value={invitation.email}
                onChange={(e) => setInvitation(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={invitation.role} 
                  onValueChange={(value) => setInvitation(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  value={invitation.department} 
                  onValueChange={(value) => setInvitation(prev => ({ ...prev, department: value }))}
                >
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
            <div className="space-y-2">
              <Label>Personal Message (Optional)</Label>
              <Input
                placeholder="Welcome to our team!"
                value={invitation.message}
                onChange={(e) => setInvitation(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteUser(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => inviteUserMutation.mutate(invitation)}
              disabled={inviteUserMutation.isPending}
            >
              {inviteUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}