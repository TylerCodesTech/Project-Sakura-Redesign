import { useState } from "react";
import { Shield, Plus, ShieldCheck, Key, Clock, FileText, Bot, Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SettingsHeader, SettingsCard, SettingsSection, SettingsRow } from "../components";
import { cn } from "@/lib/utils";

const permissionCategories = [
  {
    id: "system",
    label: "System & Platform",
    icon: SettingsIcon,
    permissions: [
      { id: "sys-admin", label: "Global Administrator", desc: "Full access to all system settings and configurations." },
      { id: "sys-settings", label: "Manage Settings", desc: "Allows modification of platform-wide system settings." },
      { id: "sys-users", label: "Manage Users", desc: "Allows creating, editing, and deleting user accounts." },
      { id: "sys-roles", label: "Manage Roles", desc: "Allows creating and modifying system and custom roles." },
    ]
  },
  {
    id: "helpdesk",
    label: "Helpdesk & Tickets",
    icon: Clock,
    permissions: [
      { id: "tk-view", label: "View Tickets", desc: "Allows viewing helpdesk tickets and their history." },
      { id: "tk-create", label: "Create Tickets", desc: "Allows manual creation of support tickets." },
      { id: "tk-edit", label: "Edit Tickets", desc: "Allows updating ticket status, priority, and assignees." },
      { id: "tk-resolve", label: "Resolve Tickets", desc: "Allows marking tickets as resolved or closed." },
      { id: "tk-delete", label: "Delete Tickets", desc: "Permanently remove tickets from the system." },
      { id: "tk-sla", label: "Manage SLA", desc: "Allows modification of SLA policies and business hours." },
    ]
  },
  {
    id: "docs",
    label: "Documentation",
    icon: FileText,
    permissions: [
      { id: "doc-read", label: "View Documentation", desc: "Allows reading all published internal documents." },
      { id: "doc-create", label: "Create Pages", desc: "Allows creating new documentation pages." },
      { id: "doc-edit", label: "Edit Content", desc: "Allows editing existing document pages." },
      { id: "doc-pub", label: "Publish Content", desc: "Allows moving content from draft to live status." },
      { id: "doc-del", label: "Delete Content", desc: "Remove pages or document collections." },
    ]
  },
  {
    id: "ai",
    label: "AI & Data",
    icon: Bot,
    permissions: [
      { id: "ai-config", label: "Configure AI", desc: "Allows modification of AI models and providers." },
      { id: "ai-usage", label: "View Analytics", desc: "Allows access to AI usage and cost analytics." },
      { id: "ai-rag", label: "Manage Vector DB", desc: "Allows manual re-indexing of knowledge base data." },
    ]
  }
];

const defaultRoles = [
  { id: "admin", name: "Administrator", desc: "Full system access", users: 2, isSystem: true },
  { id: "agent", name: "Support Agent", desc: "Ticket and docs access", users: 8, isSystem: true },
  { id: "viewer", name: "Viewer", desc: "Read-only access", users: 15, isSystem: true },
];

interface RolesSettingsProps {
  subsection?: string;
}

export function RolesSettings({ subsection }: RolesSettingsProps) {
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [roleCreatorTab, setRoleCreatorTab] = useState("system");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "roles"}
        title="Roles & Permissions"
        description="Define access control and manage security policies."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SettingsCard
          title="System Roles"
          description="Hierarchy and defaults."
          icon={Shield}
          className="lg:col-span-1"
          actions={
            <Dialog open={isCreateRoleModalOpen} onOpenChange={setIsCreateRoleModalOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] h-[85vh] p-0 flex flex-col rounded-2xl overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                  <DialogTitle>Role Builder</DialogTitle>
                  <DialogDescription>
                    Create a custom role with granular permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-56 border-r bg-muted/20 p-3 space-y-1">
                    <p className="text-xs font-bold text-muted-foreground px-3 py-2 uppercase tracking-wider">Categories</p>
                    {permissionCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setRoleCreatorTab(cat.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
                            roleCreatorTab === cat.id
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-2 mb-6">
                      <Label>Role Name</Label>
                      <Input placeholder="e.g., Senior Editor" />
                    </div>
                    <Separator className="mb-6" />
                    {permissionCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className={cn(roleCreatorTab !== cat.id && "hidden")}
                      >
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                          {cat.label} Permissions
                        </h3>
                        <div className="space-y-3">
                          {cat.permissions.map((perm) => (
                            <div key={perm.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-secondary/20">
                              <div className="space-y-0.5">
                                <Label className="font-medium">{perm.label}</Label>
                                <p className="text-xs text-muted-foreground">{perm.desc}</p>
                              </div>
                              <Switch />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsCreateRoleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Create Role</Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        >
          <div className="space-y-2">
            {defaultRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors",
                  selectedRole === role.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-secondary/20 hover:bg-secondary/40"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{role.name}</span>
                    {role.isSystem && (
                      <Badge variant="outline" className="text-[10px]">System</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{role.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs">{role.users}</Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Security Policies"
          description="Configure platform-wide security and access controls."
          icon={ShieldCheck}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingsSection title="Authentication">
              <div className="space-y-3">
                <SettingsRow label="Two-Factor Auth" description="Force 2FA for all users.">
                  <Switch />
                </SettingsRow>
                <SettingsRow label="SAML/SSO" description="Enable enterprise sign-on.">
                  <Switch defaultChecked />
                </SettingsRow>
              </div>
            </SettingsSection>
            <SettingsSection title="Password Policy">
              <div className="space-y-4">
                <SettingsRow label="Password Rotation" vertical>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Every 30 days</SelectItem>
                      <SelectItem value="90">Every 90 days</SelectItem>
                      <SelectItem value="never">Never expire</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>
              </div>
            </SettingsSection>
          </div>
          <Separator className="my-6" />
          <SettingsSection title="IP Allowlist">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="0.0.0.0/0" className="bg-secondary/20" />
                <Button variant="outline">Add IP</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5 py-1 pr-1 pl-2">
                  192.168.1.1
                  <button className="hover:text-destructive rounded p-0.5">
                    <Plus className="w-3 h-3 rotate-45" />
                  </button>
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1 pr-1 pl-2">
                  10.0.0.1
                  <button className="hover:text-destructive rounded p-0.5">
                    <Plus className="w-3 h-3 rotate-45" />
                  </button>
                </Badge>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
}
