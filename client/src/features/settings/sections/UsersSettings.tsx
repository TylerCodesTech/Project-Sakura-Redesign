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

const mockUsers = [
  { id: 1, name: "Sarah Chen", email: "sarah.c@sakura.ai", role: "Administrator", dept: "Product", status: "Active" },
  { id: 2, name: "Alex Kumar", email: "alex.k@sakura.ai", role: "Support Agent", dept: "IT Support", status: "Active" },
  { id: 3, name: "James Wilson", email: "j.wilson@sakura.ai", role: "Support Agent", dept: "Customer Success", status: "Away" },
  { id: 4, name: "Elena Rodriguez", email: "elena.r@sakura.ai", role: "Viewer", dept: "Marketing", status: "Inactive" },
];

interface UsersSettingsProps {
  subsection?: string;
}

export function UsersSettings({ subsection }: UsersSettingsProps) {
  const [userSearch, setUserSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
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
                  <Label>Full Name</Label>
                  <Input placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="jane@company.com" />
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
                  <Select defaultValue="product">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-secondary/10 border border-transparent hover:border-border/50 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/api/placeholder/40/40`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{user.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        user.status === "Active" && "border-green-500/50 text-green-600",
                        user.status === "Away" && "border-yellow-500/50 text-yellow-600",
                        user.status === "Inactive" && "border-muted-foreground/50 text-muted-foreground"
                      )}
                    >
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium">{user.role}</p>
                  <p className="text-[10px] text-muted-foreground">{user.dept}</p>
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
          ))}
          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No users found matching "{userSearch}"
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
