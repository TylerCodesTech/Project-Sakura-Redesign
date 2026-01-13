import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, Pencil, Loader2, AlertCircle, Building2, Info, AlertTriangle, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Department } from "@shared/schema";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { SettingsHeader } from "../components";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isActive: boolean;
  departmentId: string | null;
  startDate: string | null;
  endDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementFormData {
  title: string;
  message: string;
  type: string;
  link: string;
  departmentId: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const ANNOUNCEMENT_TYPES = [
  { value: "info", label: "Info", icon: Info, color: "text-blue-500 bg-blue-500/10" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "text-yellow-500 bg-yellow-500/10" },
  { value: "success", label: "Success", icon: CheckCircle, color: "text-green-500 bg-green-500/10" },
  { value: "error", label: "Error", icon: XCircle, color: "text-red-500 bg-red-500/10" },
];

function getTypeConfig(type: string) {
  return ANNOUNCEMENT_TYPES.find(t => t.value === type) || ANNOUNCEMENT_TYPES[0];
}

function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
  isDeleting,
  departments,
}: {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  departments: Department[];
}) {
  const typeConfig = getTypeConfig(announcement.type);
  const TypeIcon = typeConfig.icon;
  const department = departments.find(d => d.id === announcement.departmentId);
  const isCompanyWide = !announcement.departmentId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className={cn("relative transition-all hover:shadow-md", !announcement.isActive && "opacity-60")}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("p-2 rounded-lg shrink-0", typeConfig.color)}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{announcement.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant={announcement.isActive ? "default" : "secondary"} className="text-xs">
                    {announcement.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {isCompanyWide ? (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Building2 className="w-3 h-3" />
                      Company-Wide
                    </Badge>
                  ) : department && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: department.color + "20", color: department.color }}
                    >
                      {department.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(announcement)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(announcement.id)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
          {(announcement.startDate || announcement.endDate) && (
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {announcement.startDate && <span>From {new Date(announcement.startDate).toLocaleDateString()}</span>}
              {announcement.startDate && announcement.endDate && <span>–</span>}
              {announcement.endDate && <span>Until {new Date(announcement.endDate).toLocaleDateString()}</span>}
            </div>
          )}
          {announcement.link && (
            <a
              href={announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              View Link →
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MaintenanceSettingsProps {
  subsection?: string;
}

export function MaintenanceSettings({ subsection }: MaintenanceSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    message: "",
    type: "info",
    link: "",
    departmentId: null,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    queryFn: async () => {
      const res = await fetch("/api/announcements");
      return res.json();
    },
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments");
      return res.json();
    },
  });

  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title,
        message: editingAnnouncement.message,
        type: editingAnnouncement.type,
        link: editingAnnouncement.link || "",
        departmentId: editingAnnouncement.departmentId,
        startDate: editingAnnouncement.startDate || "",
        endDate: editingAnnouncement.endDate || "",
        isActive: editingAnnouncement.isActive,
      });
    } else {
      setFormData({
        title: "",
        message: "",
        type: "info",
        link: "",
        departmentId: null,
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  }, [editingAnnouncement]);

  const createMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      const res = await apiRequest("POST", "/api/announcements", {
        ...data,
        link: data.link || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        createdBy: "current-user",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setIsDialogOpen(false);
      toast.success("Announcement created successfully");
    },
    onError: () => {
      toast.error("Failed to create announcement");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AnnouncementFormData> }) => {
      const res = await apiRequest("PATCH", `/api/announcements/${id}`, {
        ...data,
        link: data.link || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setIsDialogOpen(false);
      setEditingAnnouncement(null);
      toast.success("Announcement updated successfully");
    },
    onError: () => {
      toast.error("Failed to update announcement");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast.success("Announcement deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete announcement");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
    } else {
      setEditingAnnouncement(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const activeAnnouncements = announcements.filter(a => a.isActive);
  const inactiveAnnouncements = announcements.filter(a => !a.isActive);

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "maintenance-announcements"}
        title="Announcements"
        description="Create and manage system-wide announcements and maintenance notices for your organization."
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" /> New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
                </DialogTitle>
                <DialogDescription>
                  {editingAnnouncement
                    ? "Update the announcement details below."
                    : "Create a new announcement to notify your team."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Scheduled maintenance notice"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="We will be performing scheduled maintenance..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ANNOUNCEMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department (Optional)</Label>
                    <Select
                      value={formData.departmentId || "company-wide"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, departmentId: value === "company-wide" ? null : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company-wide">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Company-Wide
                          </div>
                        </SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: dept.color }}
                              />
                              {dept.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link (Optional)</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://status.example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Show this announcement to users
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingAnnouncement ? "Save Changes" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground">
                <Megaphone className="w-8 h-8" />
              </div>
              <p className="text-base font-medium">No announcements yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
                Create announcements to notify your team about important updates, maintenance, or events.
              </p>
              <Button className="mt-4" size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Active Announcements ({activeAnnouncements.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {activeAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onEdit={handleOpenDialog}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    isDeleting={deleteMutation.isPending}
                    departments={departments}
                  />
                ))}
              </div>
            </div>
          )}

          {inactiveAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Inactive Announcements ({inactiveAnnouncements.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {inactiveAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onEdit={handleOpenDialog}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    isDeleting={deleteMutation.isPending}
                    departments={departments}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
