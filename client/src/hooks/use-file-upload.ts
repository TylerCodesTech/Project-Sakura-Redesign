import { useState } from "react";
import { toast } from "sonner";

interface UseFileUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

/**
 * Hook for handling file uploads
 * Consolidates duplicate upload logic from GeneralSettings, ProfileSettings, and Header
 *
 * @example
 * const { uploadFile, isUploading } = useFileUpload({
 *   onSuccess: (url) => updateSettings({ logoUrl: url }),
 *   maxSizeMB: 5,
 *   allowedTypes: ["image/png", "image/jpeg"],
 * });
 *
 * const url = await uploadFile(file);
 */
export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const {
    onSuccess,
    onError,
    maxSizeMB = 5,
    allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
  } = options;

  const uploadFile = async (file: File): Promise<string | null> => {
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const error = new Error(`File size must be less than ${maxSizeMB}MB`);
      toast.error(error.message);
      onError?.(error);
      return null;
    }

    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const error = new Error(
        `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
      );
      toast.error(error.message);
      onError?.(error);
      return null;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { url } = await res.json();
      toast.success("File uploaded successfully");
      onSuccess?.(url);
      return url;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to upload file");
      toast.error(err.message);
      onError?.(err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}
