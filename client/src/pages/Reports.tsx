import { Layout } from "@/components/layout/Layout";
import { ReportBuilder } from "@/features/reports/ReportBuilder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Reports() {
  const queryClient = useQueryClient();

  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/reports/definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create report");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports/definitions"] });
      toast.success("Report saved successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = (config: any) => {
    createReportMutation.mutate({
      name: config.name,
      description: config.description || "",
      type: config.type || "custom",
      departmentId: null,
      createdBy: "current-user-id",
      isTemplate: "false",
      isPublic: "false",
      configuration: JSON.stringify({
        dataSource: config.dataSource,
        fields: config.fields,
        filters: config.filters,
        groupBy: config.groupBy,
        visualization: config.visualization,
      }),
    });
  };

  return (
    <Layout>
      <div className="p-6 max-w-[1600px] mx-auto">
        <ReportBuilder onSave={handleSave} />
      </div>
    </Layout>
  );
}
