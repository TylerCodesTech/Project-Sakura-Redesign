import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

/**
 * Reusable loading spinner component
 * Replaces 62 duplicate loading UI patterns across the codebase
 *
 * @example
 * if (isLoading) return <LoadingSpinner />;
 *
 * @example
 * <LoadingSpinner className="py-24" size={12} />
 */
export function LoadingSpinner({ className = "", size = 8 }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Loader2 className={`w-${size} h-${size} animate-spin text-primary`} />
    </div>
  );
}

/**
 * Hook for conditional loading state rendering
 * Returns null or the LoadingSpinner component
 *
 * @example
 * const LoadingComponent = useLoadingState(isLoading);
 * if (LoadingComponent) return LoadingComponent;
 */
export function useLoadingState(isLoading: boolean) {
  return isLoading ? <LoadingSpinner /> : null;
}
