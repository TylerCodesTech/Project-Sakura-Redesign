import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "sonner";

interface CrudMutationOptions {
  queryKey: string | string[];
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for creating a resource with automatic query invalidation
 *
 * @example
 * const createMutation = useCreateMutation<InsertUser>("/api/users", {
 *   queryKey: "/api/users",
 *   successMessage: "User created successfully",
 *   onSuccess: () => dialog.close(),
 * });
 *
 * createMutation.mutate(userData);
 */
export function useCreateMutation<T>(
  endpoint: string,
  options: CrudMutationOptions
) {
  return useMutation({
    mutationFn: (data: T) => apiRequest("POST", endpoint, data),
    onSuccess: () => {
      const queryKeys = Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey];
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      toast.success(options.successMessage || "Created successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || options.errorMessage || "Failed to create");
      options.onError?.(error);
    },
  });
}

/**
 * Hook for updating a resource with automatic query invalidation
 *
 * @example
 * const updateMutation = useUpdateMutation<UpdateUser>(
 *   (id) => `/api/users/${id}`,
 *   {
 *     queryKey: "/api/users",
 *     successMessage: "User updated successfully",
 *     onSuccess: () => dialog.close(),
 *   }
 * );
 *
 * updateMutation.mutate({ id: "123", data: updatedData });
 */
export function useUpdateMutation<T>(
  getEndpoint: (id: string) => string,
  options: CrudMutationOptions
) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: T }) =>
      apiRequest("PATCH", getEndpoint(id), data),
    onSuccess: () => {
      const queryKeys = Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey];
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      toast.success(options.successMessage || "Updated successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || options.errorMessage || "Failed to update");
      options.onError?.(error);
    },
  });
}

/**
 * Hook for deleting a resource with automatic query invalidation
 *
 * @example
 * const deleteMutation = useDeleteMutation(
 *   (id) => `/api/users/${id}`,
 *   {
 *     queryKey: "/api/users",
 *     successMessage: "User deleted successfully",
 *   }
 * );
 *
 * deleteMutation.mutate("user-id-123");
 */
export function useDeleteMutation(
  getEndpoint: (id: string) => string,
  options: CrudMutationOptions
) {
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", getEndpoint(id)),
    onSuccess: () => {
      const queryKeys = Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey];
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      toast.success(options.successMessage || "Deleted successfully");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || options.errorMessage || "Failed to delete");
      options.onError?.(error);
    },
  });
}

/**
 * Hook for generic mutation with automatic query invalidation
 * Use this for custom actions that don't fit create/update/delete patterns
 *
 * @example
 * const assignMutation = useGenericMutation(
 *   (id) => apiRequest("POST", `/api/tickets/${id}/assign`, { userId }),
 *   {
 *     queryKey: ["/api/tickets", "/api/users"],
 *     successMessage: "Ticket assigned successfully",
 *   }
 * );
 */
export function useGenericMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: CrudMutationOptions
) {
  return useMutation({
    mutationFn,
    onSuccess: () => {
      const queryKeys = Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey];
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || options.errorMessage || "Operation failed");
      options.onError?.(error);
    },
  });
}
