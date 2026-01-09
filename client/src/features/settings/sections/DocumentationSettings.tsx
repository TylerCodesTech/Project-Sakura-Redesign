import { useState, useEffect } from "react";
import {
  FileText,
  FolderKanban,
  UserCog,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  GripVertical,
  Eye,
  Lock,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { type Department } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  SettingsHeader,
  SettingsCard,
  SettingsSection,
  SettingsRow,
  DepartmentSelector,
} from "../components";

interface DocumentationSettingsProps {
  subsection?: string;
}

const mockCategories = [
  { id: "1", name: "Getting Started", icon: "book", pages: 12, order: 1 },
  { id: "2", name: "User Guides", icon: "users", pages: 24, order: 2 },
  { id: "3", name: "API Reference", icon: "code", pages: 45, order: 3 },
  { id: "4", name: "Troubleshooting", icon: "wrench", pages: 18, order: 4 },
];

const mockAccessRoles = [
  { id: "admin", name: "Administrator", access: "full" },
  { id: "agent", name: "Support Agent", access: "edit" },
  { id: "viewer", name: "Viewer", access: "read" },
];

export function DocumentationSettings({ subsection }: DocumentationSettingsProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  useEffect(() => {
    if (departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0]);
    }
  }, [departments, selectedDepartment]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockCategories.length}</p>
            <p className="text-xs text-muted-foreground">Documentation categories</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Total Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockCategories.reduce((acc, c) => acc + c.pages, 0)}</p>
            <p className="text-xs text-muted-foreground">Published documents</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCog className="w-4 h-4 text-primary" />
              Access Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockAccessRoles.length}</p>
            <p className="text-xs text-muted-foreground">Roles with access</p>
          </CardContent>
        </Card>
      </div>

      <SettingsCard
        title="Quick Settings"
        description="Common documentation configurations."
        icon={BookOpen}
      >
        <div className="space-y-4">
          <SettingsRow label="Enable Documentation" description="Allow access to knowledge base for this department.">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Public Access" description="Allow non-authenticated users to view documents.">
            <Switch />
          </SettingsRow>
          <Separator />
          <SettingsRow label="Search Indexing" description="Include in global search results.">
            <Switch defaultChecked />
          </SettingsRow>
          <Separator />
          <SettingsRow label="AI Suggestions" description="Show AI-powered article recommendations.">
            <Switch defaultChecked />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Document Categories"
        description="Organize documentation into categories. Drag to reorder."
        icon={FolderKanban}
        actions={
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>
                  Create a new documentation category.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input placeholder="e.g., Release Notes" />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select defaultValue="book">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="folder">Folder</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="wrench">Wrench</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Parent Category (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="None (top-level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (top-level)</SelectItem>
                      {mockCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                  Cancel
                </Button>
                <Button>Create Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-3">
          {mockCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10 group"
            >
              <div className="flex items-center gap-4">
                <button className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground p-1 rounded hover:bg-secondary/80">
                  <GripVertical className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-sm">{category.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {category.pages} pages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Category Settings"
        description="Default behavior for documentation categories."
        icon={BookOpen}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SettingsRow label="Show Empty Categories" description="Display categories with no pages.">
              <Switch />
            </SettingsRow>
            <SettingsRow label="Show Page Count" description="Display number of pages in each category.">
              <Switch defaultChecked />
            </SettingsRow>
          </div>
          <div className="space-y-4">
            <SettingsRow label="Default Sort" vertical>
              <Select defaultValue="order">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Custom Order</SelectItem>
                  <SelectItem value="alpha">Alphabetical</SelectItem>
                  <SelectItem value="date">Last Updated</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const renderAccessControl = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Role Access"
        description="Configure which roles can access documentation for this department."
        icon={UserCog}
      >
        <div className="space-y-3">
          {mockAccessRoles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  role.access === "full" ? "bg-green-500/10 text-green-600" :
                  role.access === "edit" ? "bg-blue-500/10 text-blue-600" :
                  "bg-muted text-muted-foreground"
                )}>
                  {role.access === "full" ? <Lock className="w-5 h-5" /> :
                   role.access === "edit" ? <Edit3 className="w-5 h-5" /> :
                   <Eye className="w-5 h-5" />}
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-sm">{role.name}</span>
                  <p className="text-xs text-muted-foreground capitalize">
                    {role.access === "full" ? "Full Access" :
                     role.access === "edit" ? "Can Edit" :
                     "Read Only"}
                  </p>
                </div>
              </div>
              <Select defaultValue={role.access}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Access</SelectItem>
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="full">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </SettingsCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsCard
          title="Visibility"
          description="Control document visibility settings."
          icon={Eye}
        >
          <div className="space-y-4">
            <SettingsRow label="Public by Default" description="New pages are publicly visible.">
              <Switch />
            </SettingsRow>
            <SettingsRow label="Show Author" description="Display page author information.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="Show Last Updated" description="Display modification timestamp.">
              <Switch defaultChecked />
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Search & Discovery"
          description="Control how documents are found."
          icon={Search}
        >
          <div className="space-y-4">
            <SettingsRow label="Include in Search" description="Documents appear in global search.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="AI Indexing" description="Include in AI knowledge base.">
              <Switch defaultChecked />
            </SettingsRow>
            <SettingsRow label="Related Pages" description="Show related document suggestions.">
              <Switch defaultChecked />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "documentation"}
        title="Documentation Settings"
        description="Configure knowledge base settings per department."
        actions={
          <DepartmentSelector
            departments={departments}
            selectedDepartment={selectedDepartment}
            onSelect={setSelectedDepartment}
            loading={isLoadingDepts}
          />
        }
      />

      {!selectedDepartment && !isLoadingDepts ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium">Select a department</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a department to configure its documentation settings.
            </p>
          </CardContent>
        </Card>
      ) : isLoadingDepts ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <>
          {(!subsection || subsection === "docs-overview") && renderOverview()}
          {subsection === "docs-categories" && renderCategories()}
          {subsection === "docs-access" && renderAccessControl()}
          {!subsection && (
            <>
              {renderCategories()}
              {renderAccessControl()}
            </>
          )}
        </>
      )}
    </div>
  );
}
