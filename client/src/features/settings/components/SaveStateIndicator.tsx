import { Circle, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type SaveState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface SaveStateIndicatorProps {
  state: SaveState;
  errorMessage?: string;
  className?: string;
  autoHideSaved?: boolean;
  autoHideDelay?: number;
}

export function SaveStateIndicator({
  state,
  errorMessage,
  className,
  autoHideSaved = true,
  autoHideDelay = 2000,
}: SaveStateIndicatorProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (state === 'saved' && autoHideSaved) {
      const timer = setTimeout(() => setVisible(false), autoHideDelay);
      return () => clearTimeout(timer);
    }
    setVisible(true);
  }, [state, autoHideSaved, autoHideDelay]);

  if (state === 'idle') {
    return null;
  }

  if (!visible && state === 'saved') {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      {state === 'unsaved' && (
        <>
          <Circle className="h-3 w-3 fill-orange-500 text-orange-500" />
          <span className="text-orange-700 dark:text-orange-400">Unsaved changes</span>
        </>
      )}

      {state === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
          <span className="text-blue-700 dark:text-blue-400">Saving...</span>
        </>
      )}

      {state === 'saved' && (
        <>
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-400">Saved</span>
        </>
      )}

      {state === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span className="text-red-700 dark:text-red-400">
            {errorMessage || 'Error saving'}
          </span>
        </>
      )}
    </div>
  );
}
