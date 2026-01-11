import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { 
  Type, 
  AlignLeft, 
  Hash, 
  Mail, 
  Phone, 
  Link, 
  List, 
  ListChecks, 
  CheckSquare, 
  Calendar, 
  Upload,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const FIELD_TYPES = [
  { value: "text", label: "Text", icon: Type, description: "Single line text input" },
  { value: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line text area" },
  { value: "number", label: "Number", icon: Hash, description: "Numeric input" },
  { value: "email", label: "Email", icon: Mail, description: "Email address" },
  { value: "phone", label: "Phone", icon: Phone, description: "Phone number" },
  { value: "url", label: "URL", icon: Link, description: "Website link" },
  { value: "select", label: "Dropdown", icon: List, description: "Single selection" },
  { value: "multiselect", label: "Multi-Select", icon: ListChecks, description: "Multiple selections" },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Yes/No toggle" },
  { value: "date", label: "Date", icon: Calendar, description: "Date picker" },
  { value: "file", label: "File Upload", icon: Upload, description: "File attachment" },
];

interface DraggableFieldTypeProps {
  fieldType: typeof FIELD_TYPES[0];
  onAdd: (type: string) => void;
}

function DraggableFieldType({ fieldType, onAdd }: DraggableFieldTypeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${fieldType.value}`,
    data: {
      type: "palette-field",
      fieldType: fieldType.value,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  const Icon = fieldType.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onAdd(fieldType.value)}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 hover:bg-primary/5",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{fieldType.label}</p>
        <p className="text-xs text-muted-foreground truncate">{fieldType.description}</p>
      </div>
      <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
    </div>
  );
}

interface FormBuilderPaletteProps {
  onAddField: (type: string) => void;
}

export function FormBuilderPalette({ onAddField }: FormBuilderPaletteProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Field Types</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Drag fields to the form or click to add
      </p>
      <div className="space-y-2">
        {FIELD_TYPES.map((fieldType) => (
          <DraggableFieldType 
            key={fieldType.value} 
            fieldType={fieldType} 
            onAdd={onAddField}
          />
        ))}
      </div>
    </div>
  );
}
