import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Users, 
  Shield, 
  Building2, 
  Clock, 
  FileText, 
  Settings2,
  Database,
  Cpu,
  Key,
  Plus,
  MessageSquare,
  Search,
  MoreVertical,
  Filter,
  UserPlus,
  Lock,
  Mail,
  UserCog,
  Eye,
  EyeOff,
  Send,
  HelpCircle,
  Save,
  Check,
  ChevronRight,
  ShieldCheck,
  Globe,
  Settings as SettingsIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Mock users for the management view
const mockUsers = [
  { id: 1, name: "Sarah Chen", email: "sarah.c@sakura.ai", role: "Administrator", dept: "Product", status: "Active" },
  { id: 2, name: "Alex Kumar", email: "alex.k@sakura.ai", role: "Support Agent", dept: "IT Support", status: "Active" },
  { id: 3, name: "James Wilson", email: "j.wilson@sakura.ai", role: "Support Agent", dept: "Customer Success", status: "Away" },
  { id: 4, name: "Elena Rodriguez", email: "elena.r@sakura.ai", role: "Viewer", dept: "Marketing", status: "Inactive" },
];

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

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("ai");
  const [userSearch, setUserSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [roleCreatorTab, setRoleCreatorTab] = useState("system");

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Manage your helpdesk, documentation, and platform-wide configurations.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger value="ai" className="rounded-lg py-2 px-4 gap-2">
              <Bot className="w-4 h-4" /> AI Configuration
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg py-2 px-4 gap-2">
              <Users className="w-4 h-4" /> User Directory
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-lg py-2 px-4 gap-2">
              <Shield className="w-4 h-4" /> Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="org" className="rounded-lg py-2 px-4 gap-2">
              <Building2 className="w-4 h-4" /> Departments
            </TabsTrigger>
            <TabsTrigger value="helpdesk" className="rounded-lg py-2 px-4 gap-2">
              <Clock className="w-4 h-4" /> Helpdesk & SLA
            </TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-lg py-2 px-4 gap-2">
              <FileText className="w-4 h-4" /> Ticket Pages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/40 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    <CardTitle>Embedding Models</CardTitle>
                  </div>
                  <CardDescription>Configure models used for document vectorization and search.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select defaultValue="openai">
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="ollama">Ollama (Local)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Embedding Model</Label>
                    <Input placeholder="text-embedding-3-small" defaultValue="text-embedding-3-small" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Auto-Vectorization</Label>
                      <p className="text-xs text-muted-foreground">Automatically re-index documents on update.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <CardTitle>Chat Models</CardTitle>
                  </div>
                  <CardDescription>Configure models used for helpdesk AI assistant and summarization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Chat Model</Label>
                    <Input placeholder="gpt-4o" defaultValue="gpt-4o" />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input type="number" step="0.1" min="0" max="1" defaultValue="0.7" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Knowledge Base RAG</Label>
                      <p className="text-xs text-muted-foreground">Use documentation for AI context.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>Manage and monitor all users in your organization.</CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users..." 
                      className="pl-9 h-9 bg-secondary/20 border-transparent focus-visible:bg-background"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  
                  <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2 h-9">
                        <UserPlus className="w-4 h-4" /> Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-display font-bold">Create New User</DialogTitle>
                        <DialogDescription>
                          Add a new member to your workspace. They'll receive an email to sign in.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" placeholder="Jane" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" placeholder="Doe" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Work Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="email" type="email" placeholder="jane.doe@sakura.ai" className="pl-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Temporary Password</Label>
                          <div className="relative">
                            <Input 
                              id="password" 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••"
                              defaultValue="Sakura2026!"
                            />
                            <button 
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-md"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">User will be required to change this upon first login.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="role">System Role</Label>
                            <Select defaultValue="viewer">
                              <SelectTrigger id="role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrator</SelectItem>
                                <SelectItem value="agent">Support Agent</SelectItem>
                                <SelectItem value="contributor">Contributor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dept">Department</Label>
                            <Select defaultValue="general">
                              <SelectTrigger id="dept">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="product">Product Engineering</SelectItem>
                                <SelectItem value="cs">Customer Success</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="hr">Human Resources</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm">Send Welcome Email</Label>
                              <p className="text-xs text-muted-foreground">Email includes temporary password and login link.</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsCreateUserModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsCreateUserModalOpen(false)} className="gap-2">
                          <Send className="w-4 h-4" /> Create & Send Invite
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {mockUsers.filter(u => 
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                    u.email.toLowerCase().includes(userSearch.toLowerCase())
                  ).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 hover:bg-secondary/10 transition-colors group">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="hidden md:flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{user.role}</Badge>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{user.dept}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'Active' ? 'bg-emerald-500' : 
                            user.status === 'Away' ? 'bg-amber-500' : 'bg-slate-300'
                          }`} />
                          <span className="text-xs font-medium w-16">{user.status}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-secondary/10 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Showing 4 of 284 users</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 border-border/40 shadow-sm h-fit">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>System Roles</CardTitle>
                    <CardDescription>Hierarchy and defaults.</CardDescription>
                  </div>
                  <Dialog open={isCreateRoleModalOpen} onOpenChange={setIsCreateRoleModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[900px] h-[85vh] p-0 flex flex-col rounded-2xl overflow-hidden">
                      <DialogHeader className="p-6 pb-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <DialogTitle className="text-2xl font-display font-bold">Role Builder</DialogTitle>
                            <DialogDescription>
                              Design complex permission sets with categorized controls.
                            </DialogDescription>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button variant="outline" onClick={() => setIsCreateRoleModalOpen(false)}>Cancel</Button>
                             <Button onClick={() => setIsCreateRoleModalOpen(false)} className="gap-2">
                               <Save className="w-4 h-4" /> Save Role
                             </Button>
                          </div>
                        </div>
                      </DialogHeader>

                      <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-64 border-r bg-muted/20 p-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="roleName" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Basic Info</Label>
                            <Input id="roleName" placeholder="Role Name" className="bg-background" />
                            <Input id="roleDesc" placeholder="Description" className="bg-background text-xs" />
                          </div>
                          <Separator />
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2">Categories</Label>
                            {permissionCategories.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => setRoleCreatorTab(cat.id)}
                                className={cn(
                                  "w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-all group",
                                  roleCreatorTab === cat.id 
                                    ? "bg-primary text-primary-foreground shadow-md" 
                                    : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <cat.icon className="w-4 h-4" />
                                  <span>{cat.label}</span>
                                </div>
                                <ChevronRight className={cn("w-3 h-3 transition-transform", roleCreatorTab === cat.id ? "rotate-90" : "group-hover:translate-x-0.5")} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <ScrollArea className="flex-1 p-6">
                            {permissionCategories.map((cat) => (
                              <div key={cat.id} className={cn("space-y-6", roleCreatorTab !== cat.id && "hidden")}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                      <cat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold">{cat.label}</h3>
                                      <p className="text-xs text-muted-foreground">Manage access levels for this category.</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg">
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider">Select All</Button>
                                    <div className="w-px h-3 bg-border mx-1" />
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider text-destructive hover:text-destructive">Clear All</Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 pt-2">
                                  {cat.permissions.map((perm) => (
                                    <div 
                                      key={perm.id} 
                                      className="flex items-start justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all group relative overflow-hidden"
                                    >
                                      <div className="space-y-1 pr-12">
                                        <div className="flex items-center gap-2">
                                          <Label className="text-sm font-bold cursor-pointer" htmlFor={perm.id}>{perm.label}</Label>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                                              </TooltipTrigger>
                                              <TooltipContent className="max-w-[250px] p-3 rounded-xl shadow-xl">
                                                <div className="space-y-1.5">
                                                  <p className="font-bold text-xs">{perm.label}</p>
                                                  <p className="text-[11px] leading-relaxed">{perm.desc}</p>
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{perm.desc}</p>
                                      </div>
                                      <div className="flex items-center h-full pt-1">
                                        <Switch id={perm.id} className="data-[state=checked]:bg-primary" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                          <div className="p-4 bg-muted/10 border-t flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Enterprise Security Standards Applied</span>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {['Administrator', 'Support Agent', 'Contributor', 'Viewer'].map((role) => (
                      <button 
                        key={role} 
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/20 transition-colors focus:bg-primary/5 focus:outline-none group"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{role}</span>
                        </div>
                        <Lock className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-border/40 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Role Permissions: Support Agent</CardTitle>
                    <CardDescription>Configure granular access for this specific role.</CardDescription>
                  </div>
                  <Button size="sm">Save Changes</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-6 space-y-8">
                      {permissionCategories.map((cat) => (
                        <div key={cat.id} className="space-y-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <cat.icon className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">{cat.label}</h3>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {cat.permissions.map((perm) => (
                              <div key={perm.id} className="flex items-start justify-between p-4 rounded-xl bg-secondary/10 border border-border group hover:border-primary/20 transition-all">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-sm font-semibold">{perm.label}</Label>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs">{perm.desc}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{perm.desc}</p>
                                </div>
                                <Switch defaultChecked={cat.id === 'helpdesk' && (perm.id.includes('view') || perm.id.includes('edit'))} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="org" className="space-y-6">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>Structure your organization into departments.</CardDescription>
                </div>
                <Button className="gap-2" variant="outline">
                  <Plus className="w-4 h-4" /> Add Department
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Product Engineering', 'Customer Success', 'Marketing', 'Human Resources'].map((dept) => (
                    <div key={dept} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/10 group">
                      <span className="font-medium">{dept}</span>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">Manage</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="helpdesk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle>SLA Policies</CardTitle>
                  <CardDescription>Define response and resolution targets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-secondary/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Urgent Priority</span>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Response: 1h | Resolution: 4h</p>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Add SLA Tier
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                  <CardDescription>When is your helpdesk active?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Support Schedule</Label>
                    <Select defaultValue="24-7">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24-7">24/7 Support</SelectItem>
                        <SelectItem value="weekday">Mon-Fri (9-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">EST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle>Custom Ticket Pages</CardTitle>
                <CardDescription>Configure specialized intake forms for different ticket types.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-center hover:bg-secondary/10 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Create New Form</h4>
                        <p className="text-xs text-muted-foreground">Build a custom intake experience.</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-secondary/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold">IT Support Form</h4>
                          <p className="text-xs text-muted-foreground text-emerald-600 font-medium">Active</p>
                        </div>
                        <Badge variant="outline">Default</Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="secondary" className="flex-1">Edit Designer</Button>
                        <Button size="sm" variant="ghost">Preview</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
