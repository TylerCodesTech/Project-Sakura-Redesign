import { useState, useEffect } from "react";
import {
  FileText,
  UserCog,
  BookOpen,
  Eye,
  Lock,
  Loader2,
  Search,
  History,
  Archive,
  Clock,
  Edit3,
  Save,
  AlertCircle,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Department, type SystemSettings } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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

const mockAccessRoles = [
  { id: "admin", name: "Administrator", access: "full" },
  { id: "agent", name: "Support Agent", access: "edit" },
  { id: "viewer", name: "Viewer", access: "read" },
];

export function DocumentationSettings({ subsection }: DocumentationSettingsProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: systemSettings } = useQuery<SystemSettings>({
    queryKey: ["/api/system-settings"],
  });

  const [versionSettings, setVersionSettings] = useState({
    versionHistoryEnabled: true,
    versionRetentionPolicy: "limit_by_count",
    versionRetentionCount: "50",
    versionRetentionDays: "365",
    autoArchiveEnabled: true,
    autoArchiveAfterDays: "180",
    showLegacyVersionsInSearch: true,
  });

  useEffect(() => {
    if (systemSettings) {
      setVersionSettings({
        versionHistoryEnabled: systemSettings.versionHistoryEnabled === "true",
        versionRetentionPolicy: systemSettings.versionRetentionPolicy || "limit_by_count",
        versionRetentionCount: systemSettings.versionRetentionCount || "50",
        versionRetentionDays: systemSettings.versionRetentionDays || "365",
        autoArchiveEnabled: systemSettings.autoArchiveEnabled === "true",
        autoArchiveAfterDays: systemSettings.autoArchiveAfterDays || "180",
        showLegacyVersionsInSearch: systemSettings.showLegacyVersionsInSearch === "true",
      });
    }
  }, [systemSettings]);

  useEffect(() => {
    if (departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0]);
    }
  }, [departments, selectedDepartment]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SystemSettings>) => {
      await apiRequest("PATCH", "/api/system-settings", updates);
    },
    onSuccess: () => {
      toast({ title: "Settings saved", description: "Your changes have been saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings. Please try again.", variant: "destructive" });
    }
  });

  const handleSaveVersionSettings = () => {
    updateSettingsMutation.mutate({
      versionHistoryEnabled: versionSettings.versionHistoryEnabled ? "true" : "false",
      versionRetentionPolicy: versionSettings.versionRetentionPolicy,
      versionRetentionCount: versionSettings.versionRetentionCount,
      versionRetentionDays: versionSettings.versionRetentionDays,
      autoArchiveEnabled: versionSettings.autoArchiveEnabled ? "true" : "false",
      autoArchiveAfterDays: versionSettings.autoArchiveAfterDays,
      showLegacyVersionsInSearch: versionSettings.showLegacyVersionsInSearch ? "true" : "false",
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Total pages & books</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Saved document versions</p>
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

  const renderVersionHistory = () => (
    <div className="space-y-6">
      <SettingsCard
        title="Version History"
        description="Configure how document versions are tracked and retained."
        icon={History}
        actions={
          <Button 
            size="sm" 
            className="gap-2"
            onClick={handleSaveVersionSettings}
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        }
      >
        <div className="space-y-6">
          <SettingsRow 
            label="Enable Version History" 
            description="Track changes to documents and allow reverting to previous versions."
          >
            <Switch 
              checked={versionSettings.versionHistoryEnabled}
              onCheckedChange={(checked) => setVersionSettings(prev => ({ ...prev, versionHistoryEnabled: checked }))}
            />
          </SettingsRow>
          
          <Separator />
          
          <div className={cn(!versionSettings.versionHistoryEnabled && "opacity-50 pointer-events-none")}>
            <SettingsRow 
              label="Auto-Save Versions" 
              description="Automatically create versions when documents are edited. Versions are created after 30 seconds of inactivity."
              vertical
            >
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  Auto-save: 2s delay
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <History className="w-3 h-3" />
                  Version: 30s delay
                </Badge>
              </div>
            </SettingsRow>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Retention Policy"
        description="Control how long versions are kept before archiving or deletion."
        icon={Archive}
      >
        <div className={cn("space-y-6", !versionSettings.versionHistoryEnabled && "opacity-50 pointer-events-none")}>
          <SettingsRow label="Retention Policy" description="Choose how versions are managed over time." vertical>
            <Select 
              value={versionSettings.versionRetentionPolicy}
              onValueChange={(value) => setVersionSettings(prev => ({ ...prev, versionRetentionPolicy: value }))}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex flex-col">
                    <span>Keep All Versions</span>
                    <span className="text-xs text-muted-foreground">Never automatically remove versions</span>
                  </div>
                </SelectItem>
                <SelectItem value="limit_by_count">
                  <div className="flex flex-col">
                    <span>Limit by Count</span>
                    <span className="text-xs text-muted-foreground">Keep only the most recent N versions</span>
                  </div>
                </SelectItem>
                <SelectItem value="limit_by_time">
                  <div className="flex flex-col">
                    <span>Limit by Age</span>
                    <span className="text-xs text-muted-foreground">Remove versions older than N days</span>
                  </div>
                </SelectItem>
                <SelectItem value="auto_archive">
                  <div className="flex flex-col">
                    <span>Auto-Archive</span>
                    <span className="text-xs text-muted-foreground">Archive old versions instead of deleting</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>

          {versionSettings.versionRetentionPolicy === "limit_by_count" && (
            <>
              <Separator />
              <SettingsRow label="Maximum Versions" description="Number of versions to keep per document." vertical>
                <div className="flex items-center gap-3 mt-2">
                  <Input 
                    type="number" 
                    className="w-24"
                    value={versionSettings.versionRetentionCount}
                    onChange={(e) => setVersionSettings(prev => ({ ...prev, versionRetentionCount: e.target.value }))}
                    min={1}
                    max={1000}
                  />
                  <span className="text-sm text-muted-foreground">versions per document</span>
                </div>
              </SettingsRow>
            </>
          )}

          {versionSettings.versionRetentionPolicy === "limit_by_time" && (
            <>
              <Separator />
              <SettingsRow label="Maximum Age" description="Delete versions older than this many days." vertical>
                <div className="flex items-center gap-3 mt-2">
                  <Input 
                    type="number" 
                    className="w-24"
                    value={versionSettings.versionRetentionDays}
                    onChange={(e) => setVersionSettings(prev => ({ ...prev, versionRetentionDays: e.target.value }))}
                    min={1}
                    max={3650}
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </SettingsRow>
            </>
          )}

          {versionSettings.versionRetentionPolicy === "auto_archive" && (
            <>
              <Separator />
              <SettingsRow label="Auto-Archive After" description="Archive versions older than this many days." vertical>
                <div className="flex items-center gap-3 mt-2">
                  <Input 
                    type="number" 
                    className="w-24"
                    value={versionSettings.autoArchiveAfterDays}
                    onChange={(e) => setVersionSettings(prev => ({ ...prev, autoArchiveAfterDays: e.target.value }))}
                    min={1}
                    max={3650}
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </SettingsRow>
            </>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Search & Display"
        description="Configure how versions appear in search results."
        icon={Search}
      >
        <div className={cn("space-y-4", !versionSettings.versionHistoryEnabled && "opacity-50 pointer-events-none")}>
          <SettingsRow 
            label="Show Legacy Versions in Search" 
            description="Include older document versions in global search results with visual indicators."
          >
            <Switch 
              checked={versionSettings.showLegacyVersionsInSearch}
              onCheckedChange={(checked) => setVersionSettings(prev => ({ ...prev, showLegacyVersionsInSearch: checked }))}
            />
          </SettingsRow>
          <Separator />
          <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
            <p className="text-sm font-medium mb-2">Version Indicators in Search</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                [Legacy Version – v2.3]
              </Badge>
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/5">
                [Archived]
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Last Updated: 01/10/2026
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These badges help users identify version status in search results.
            </p>
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
          {subsection === "docs-versions" && renderVersionHistory()}
          {subsection === "docs-access" && renderAccessControl()}
          {!subsection && (
            <>
              {renderVersionHistory()}
              {renderAccessControl()}
            </>
          )}
        </>
      )}
    </div>
  );
}
