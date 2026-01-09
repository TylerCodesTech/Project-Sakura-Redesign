import { useState, useEffect } from "react";
import { Globe, Plus, GripVertical, Trash2, Settings, Eye, Loader2 } from "lucide-react";
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
import { type ExternalLink } from "@shared/schema";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExternalLinkSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SettingsHeader, SettingsCard } from "../components";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableLinkItem({
  link,
  onDelete,
  isDeleting,
  onEdit,
}: {
  link: ExternalLink;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onEdit: (link: ExternalLink) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-border/50 group",
        isDragging && "opacity-50 border-primary/50 shadow-md bg-background"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground p-1 rounded hover:bg-secondary/80"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary overflow-hidden relative">
          <img
            src={`/api/proxy-favicon?url=${encodeURIComponent(link.url)}`}
            alt={link.title}
            className="w-full h-full object-cover z-10 relative"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <Globe className="w-5 h-5 absolute inset-0 m-auto z-0" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{link.title}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-md">
            {link.url}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => onEdit(link)}
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(link.id)}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface LinksSettingsProps {
  subsection?: string;
}

export function LinksSettings({ subsection }: LinksSettingsProps) {
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ExternalLink | null>(null);

  const { data: links = [], isLoading } = useQuery<ExternalLink[]>({
    queryKey: ["/api/external-links"],
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
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createLinkMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/external-links", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      setIsAddLinkOpen(false);
      setEditingLink(null);
      form.reset();
      toast.success("Link added successfully");
    },
    onError: () => {
      toast.error("Failed to add link");
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

  const reorderMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiRequest("PATCH", "/api/external-links/reorder", { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
    },
    onError: () => {
      toast.error("Failed to update link order");
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
      });
    } else {
      form.reset({
        title: "",
        url: "",
        description: "",
        category: "Resources",
        icon: "globe",
        order: "0",
      });
    }
  }, [editingLink, form]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      reorderMutation.mutate(newLinks.map((l) => l.id));
    }
  };

  const onSubmit = (data: any) => {
    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink.id, data });
    } else {
      createLinkMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "integrations"}
        title="Custom Links"
        description="Add external resources and tools to the app launcher."
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
            <DialogContent className="sm:max-w-[425px]">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SettingsCard
            title="All Links"
            description="Drag to reorder. Links appear in the app launcher."
            icon={Globe}
          >
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              </div>
            ) : links.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground">
                  <Globe className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">No custom links yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Add frequently used tools to help your team navigate faster.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={links.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {links.map((link) => (
                      <SortableLinkItem
                        key={link.id}
                        link={link}
                        onDelete={(id) => deleteLinkMutation.mutate(id)}
                        isDeleting={deleteLinkMutation.isPending}
                        onEdit={(l) => setEditingLink(l)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </SettingsCard>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-border/40 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Launcher Preview
              </CardTitle>
              <CardDescription>
                How your custom links appear to team members.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-muted/30 p-6 rounded-b-xl border-t">
                <div className="bg-background rounded-2xl shadow-xl border p-4 scale-90 origin-top">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    Resources
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {links.slice(0, 6).map((link) => (
                      <div
                        key={link.id}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden relative shadow-sm">
                          <img
                            src={`/api/proxy-favicon?url=${encodeURIComponent(link.url)}`}
                            alt={link.title}
                            className="w-full h-full object-cover z-10"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <Globe className="w-6 h-6 absolute inset-0 m-auto z-0 text-muted-foreground/30" />
                        </div>
                        <span className="text-[10px] font-medium text-center line-clamp-1 w-full">
                          {link.title}
                        </span>
                      </div>
                    ))}
                    {links.length === 0 && (
                      <div className="col-span-3 py-6 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Globe className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-[10px]">No links added</p>
                      </div>
                    )}
                    {links.length > 6 && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium text-center">
                          +{links.length - 6} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
