import { useState, useEffect } from "react";
import { Globe, Plus, Trash2, Settings, Loader2, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { type ExternalLink, type Department } from "@shared/schema";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExternalLinkSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { SettingsHeader } from "../components";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

type ExtendedExternalLink = ExternalLink;

function LinkGridItem({
  link,
  onDelete,
  isDeleting,
  onEdit,
  departments,
}: {
  link: ExtendedExternalLink;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onEdit: (link: ExtendedExternalLink) => void;
  departments: Department[];
}) {
  const department = departments.find(d => d.id === link.departmentId);
  const isCompanyWide = link.isCompanyWide === "true" || !link.departmentId;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <div className={cn(
        "flex flex-col items-center p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all cursor-pointer relative",
        "hover:shadow-md hover:border-primary/30"
      )}>
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(link);
            }}
          >
            <Settings className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(link.id);
            }}
            disabled={isDeleting}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden relative mb-3">
            <img
              src={`/api/proxy-favicon?url=${encodeURIComponent(link.url)}`}
              alt={link.title}
              className="w-full h-full object-cover z-10 relative"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <Globe className="w-6 h-6 absolute inset-0 m-auto z-0" />
          </div>
          <p className="text-sm font-medium text-center truncate w-full">{link.title}</p>
          {link.description && (
            <p className="text-xs text-muted-foreground text-center truncate w-full mt-1">
              {link.description}
            </p>
          )}
        </a>
        
        <div className="mt-2">
          {isCompanyWide ? (
            <Badge variant="outline" className="text-xs gap-1">
              <Building2 className="w-3 h-3" />
              Company
            </Badge>
          ) : department ? (
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ backgroundColor: department.color + "20", color: department.color }}
            >
              {department.name}
            </Badge>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

interface LinksSettingsProps {
  subsection?: string;
}

export function LinksSettings({ subsection }: LinksSettingsProps) {
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ExtendedExternalLink | null>(null);
  const [filterTab, setFilterTab] = useState<string>("all");

  const { data: links = [], isLoading } = useQuery<ExtendedExternalLink[]>({
    queryKey: ["/api/external-links"],
    queryFn: async () => {
      const res = await fetch("/api/external-links");
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

  const form = useForm({
    resolver: zodResolver(insertExternalLinkSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      category: "Resources",
      icon: "globe",
      order: "0",
      departmentId: null as string | null,
      isCompanyWide: "true",
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/external-links", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      setIsAddLinkOpen(false);
      form.reset();
      toast.success("Link created successfully");
    },
    onError: () => {
      toast.error("Failed to create link");
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/external-links/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      setEditingLink(null);
      form.reset();
      toast.success("Link updated successfully");
    },
    onError: () => {
      toast.error("Failed to update link");
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/external-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      toast.success("Link deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete link");
    },
  });

  useEffect(() => {
    if (editingLink) {
      form.reset({
        title: editingLink.title,
        url: editingLink.url,
        description: editingLink.description || "",
        category: editingLink.category,
        icon: editingLink.icon || "globe",
        order: editingLink.order,
        departmentId: editingLink.departmentId || null,
        isCompanyWide: editingLink.isCompanyWide || "true",
      });
    } else {
      form.reset({
        title: "",
        url: "",
        description: "",
        category: "Resources",
        icon: "globe",
        order: "0",
        departmentId: null,
        isCompanyWide: "true",
      });
    }
  }, [editingLink, form]);

  const onSubmit = (data: any) => {
    const submitData = {
      ...data,
      departmentId: data.isCompanyWide === "true" ? null : data.departmentId,
    };
    
    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink.id, data: submitData });
    } else {
      createLinkMutation.mutate(submitData);
    }
  };

  const isCompanyWide = form.watch("isCompanyWide");

  const filteredLinks = links.filter(link => {
    if (filterTab === "all") return true;
    if (filterTab === "company") return link.isCompanyWide === "true" || !link.departmentId;
    return link.departmentId === filterTab;
  });

  const companyWideLinks = links.filter(l => l.isCompanyWide === "true" || !l.departmentId);
  const departmentLinks = links.filter(l => l.isCompanyWide !== "true" && l.departmentId);

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "integrations"}
        title="Custom Links"
        description="Add external resources and tools to the app launcher. Links can be company-wide or department-specific."
        actions={
          <Dialog
            open={isAddLinkOpen || !!editingLink}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddLinkOpen(false);
                setEditingLink(null);
              } else {
                setIsAddLinkOpen(true);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingLink ? "Edit Custom Link" : "Add Custom Link"}
                </DialogTitle>
                <DialogDescription>
                  {editingLink
                    ? "Update your shortcut details."
                    : "Create a new shortcut for your team."}{" "}
                  Favicons are pulled automatically.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 pt-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Google Workspace" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://workspace.google.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Company email and docs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <FormField
                      control={form.control}
                      name="isCompanyWide"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              Company-Wide Link
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Visible to all team members across departments
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === "true"}
                              onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {isCompanyWide !== "true" && (
                      <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Department
                            </FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                            <FormDescription className="text-xs">
                              Only visible to members of this department
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <DialogFooter className="pt-4">
                    <Button
                      type="submit"
                      disabled={
                        createLinkMutation.isPending ||
                        updateLinkMutation.isPending
                      }
                      className="w-full sm:w-auto"
                    >
                      {(createLinkMutation.isPending ||
                        updateLinkMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingLink ? "Save Changes" : "Create Link"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs value={filterTab} onValueChange={setFilterTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="gap-2">
            All Links
            <Badge variant="secondary" className="ml-1">{links.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            Company-Wide
            <Badge variant="secondary" className="ml-1">{companyWideLinks.length}</Badge>
          </TabsTrigger>
          {departments.map(dept => {
            const deptLinks = links.filter(l => l.departmentId === dept.id && l.isCompanyWide !== "true");
            return (
              <TabsTrigger key={dept.id} value={dept.id} className="gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: dept.color }}
                />
                {dept.name}
                <Badge variant="secondary" className="ml-1">{deptLinks.length}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {filterTab === "all" ? "All Custom Links" : 
               filterTab === "company" ? "Company-Wide Links" :
               departments.find(d => d.id === filterTab)?.name + " Links"}
            </CardTitle>
            <CardDescription>
              {filterTab === "all" 
                ? "All custom links visible in the app launcher" 
                : filterTab === "company"
                ? "Links visible to all team members"
                : `Links specific to ${departments.find(d => d.id === filterTab)?.name || "this department"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground">
                  <Globe className="w-8 h-8" />
                </div>
                <p className="text-base font-medium">No links found</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
                  {filterTab === "all" 
                    ? "Add frequently used tools to help your team navigate faster."
                    : filterTab === "company"
                    ? "Add company-wide links that everyone can access."
                    : `Add links specific to ${departments.find(d => d.id === filterTab)?.name || "this department"}.`}
                </p>
                <Button 
                  className="mt-4" 
                  size="sm"
                  onClick={() => setIsAddLinkOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredLinks.map((link) => (
                  <LinkGridItem
                    key={link.id}
                    link={link}
                    onDelete={(id) => deleteLinkMutation.mutate(id)}
                    isDeleting={deleteLinkMutation.isPending}
                    onEdit={(l) => setEditingLink(l)}
                    departments={departments}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
