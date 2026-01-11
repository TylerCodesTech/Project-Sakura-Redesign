import { useState } from "react";
import { Users, Search, UserPlus, Mail, MoreVertical, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "@/components/ui/dropdown-menu";
import { SettingsHeader, SettingsCard } from "../components";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";

interface UsersSettingsProps {
  subsection?: string;
}

export function UsersSettings({ subsection }: UsersSettingsProps) {
  const [userSearch, setUserSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "users"}
        title="User Directory"
        description="Manage and monitor all users in your organization."
        actions={
          <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Invite a new team member to your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input placeholder="jdoe" />
                </div>
                <div className="space-y-2">
                  <Label>Temporary Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="Min 8 characters" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select defaultValue="agent">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="agent">Support Agent</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select defaultValue="general">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="it">IT Support</SelectItem>
                      <SelectItem value="cs">Customer Success</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateUserModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="gap-2">
                  <Mail className="w-4 h-4" /> Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <SettingsCard
        title="All Users"
        description="View and manage user accounts."
        icon={Users}
        actions={
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9 h-9 bg-secondary/20 border-transparent focus-visible:bg-background"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
        }
      >
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {userSearch ? `No users found matching "${userSearch}"` : "No users in the system yet."}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-secondary/10 border border-transparent hover:border-border/50 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{user.username}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-green-500/50 text-green-600"
                      >
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.department || "General"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-medium">Team Member</p>
                    <p className="text-[10px] text-muted-foreground">{user.department || "General"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
