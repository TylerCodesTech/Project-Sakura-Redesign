import { useState, useEffect } from "react";
import { Building2, Plus, MoreVertical, Users, Loader2, Settings, ArrowRight } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Department } from "@shared/schema";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDepartmentSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SettingsHeader, SettingsCard } from "../components";

interface DepartmentsSettingsProps {
  subsection?: string;
  onNavigateToHelpdesk?: (departmentId: string) => void;
}

export function DepartmentsSettings({ subsection, onNavigateToHelpdesk }: DepartmentsSettingsProps) {
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const deptForm = useForm({
    resolver: zodResolver(insertDepartmentSchema),
    defaultValues: {
      name: "",
      description: "",
      headId: "",
      color: "#3b82f6",
    },
  });

  const createDeptMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/departments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsAddDeptOpen(false);
      setEditingDept(null);
      deptForm.reset();
      toast.success("Department added successfully");
    },
    onError: () => {
      toast.error("Failed to add department");
    },
  });

  const updateDeptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await apiRequest("PATCH", `/api/departments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsAddDeptOpen(false);
      setEditingDept(null);
      deptForm.reset();
      toast.success("Department updated successfully");
    },
    onError: () => {
      toast.error("Failed to update department");
    },
  });

  const deleteDeptMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast.success("Department deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete department");
    },
  });

  useEffect(() => {
    if (editingDept) {
      deptForm.reset({
        name: editingDept.name,
        description: editingDept.description || "",
        headId: editingDept.headId || "",
        color: editingDept.color,
      });
    } else {
      deptForm.reset({
        name: "",
        description: "",
        headId: "",
        color: "#3b82f6",
      });
    }
  }, [editingDept, deptForm]);

  const onDeptSubmit = (data: any) => {
    if (editingDept) {
      updateDeptMutation.mutate({ id: editingDept.id, data });
    } else {
      createDeptMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "departments"}
        title="Departments"
        description="Organize your team and manage department-level settings."
        actions={
          <Dialog open={isAddDeptOpen || !!editingDept} onOpenChange={(open) => {
            if (!open) {
              setIsAddDeptOpen(false);
              setEditingDept(null);
            } else {
              setIsAddDeptOpen(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
                <DialogDescription>
                  {editingDept ? "Update department details." : "Create a new organizational department."}
                </DialogDescription>
              </DialogHeader>
              <Form {...deptForm}>
                <form onSubmit={deptForm.handleSubmit(onDeptSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={deptForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deptForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Core product development team" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deptForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...field} />
                            <Input {...field} placeholder="#3b82f6" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createDeptMutation.isPending || updateDeptMutation.isPending}>
                      {(createDeptMutation.isPending || updateDeptMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingDept ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
          ))
        ) : departments.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium">No departments yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first department to get started.</p>
            </CardContent>
          </Card>
        ) : (
          departments.map((dept: Department) => (
            <Card key={dept.id} className="border-border/40 group relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: dept.color }} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{dept.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{dept.description || "No description"}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingDept(dept)}>
                        Edit Department
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteDeptMutation.mutate(dept.id)}
                      >
                        Delete Department
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">0 members</span>
                  </div>
                  {onNavigateToHelpdesk && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => onNavigateToHelpdesk(dept.id)}
                    >
                      <Settings className="w-3 h-3" />
                      Configure
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
