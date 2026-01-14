import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnsavedChangesPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave?: () => void | Promise<void>;
  title?: string;
  description?: string;
  showSaveButton?: boolean;
}

export function UnsavedChangesPrompt({
  open,
  onOpenChange,
  onDiscard,
  onSave,
  title = "Unsaved Changes",
  description = "You have unsaved changes. Are you sure you want to leave? Your changes will be lost.",
  showSaveButton = true,
}: UnsavedChangesPromptProps) {
  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
    onOpenChange(false);
  };

  const handleDiscard = () => {
    onDiscard();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {showSaveButton && onSave && (
            <AlertDialogAction onClick={handleSave}>
              Save Changes
            </AlertDialogAction>
          )}
          <AlertDialogAction
            onClick={handleDiscard}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
