import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { 
  Ticket,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Monitor,
  Laptop,
  Network,
  Key,
  HelpCircle,
  Settings,
  Mail,
  Building2,
  Sparkles,
} from "lucide-react";
import { type Helpdesk, type Department, type TicketFormCategory, type TicketFormField } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

interface TicketCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Monitor, Laptop, Network, Key, HelpCircle, Settings, Mail, Ticket
};

const WIZARD_STEPS = [
  { id: "helpdesk", label: "Select Team", icon: Building2 },
  { id: "category", label: "Issue Type", icon: HelpCircle },
  { id: "details", label: "Details", icon: Ticket },
];

export function TicketCreationWizard({ open, onOpenChange }: TicketCreationWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedHelpdeskId, setSelectedHelpdeskId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: helpdesks = [] } = useQuery<Helpdesk[]>({
    queryKey: ["/api/helpdesks"],
  });

  const { data: formCategories = [] } = useQuery<TicketFormCategory[]>({
    queryKey: ["/api/helpdesks", selectedHelpdeskId, "form-categories"],
    queryFn: async () => {
      if (!selectedHelpdeskId) return [];
      const res = await fetch(`/api/helpdesks/${selectedHelpdeskId}/form-categories`);
      return res.json();
    },
    enabled: !!selectedHelpdeskId,
  });

  const { data: formFields = [] } = useQuery<TicketFormField[]>({
    queryKey: ["/api/form-categories", selectedCategoryId, "fields"],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const res = await fetch(`/api/form-categories/${selectedCategoryId}/fields`);
      return res.json();
    },
    enabled: !!selectedCategoryId,
  });

  const { data: helpdeskFields = [] } = useQuery<TicketFormField[]>({
    queryKey: ["/api/helpdesks", selectedHelpdeskId, "form-fields"],
    queryFn: async () => {
      if (!selectedHelpdeskId) return [];
      const res = await fetch(`/api/helpdesks/${selectedHelpdeskId}/form-fields`);
      return res.json();
    },
    enabled: !!selectedHelpdeskId && !selectedCategoryId,
  });

  const activeFields = selectedCategoryId ? formFields : helpdeskFields;
  const userVisibleFields = activeFields.filter(f => f.internalOnly !== "true").sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const enabledCategories = formCategories.filter(c => c.enabled !== "false");
  const hasMultipleCategories = enabledCategories.length > 1;
  const hasSingleCategory = enabledCategories.length === 1;

  useEffect(() => {
    if (hasSingleCategory && currentStep === 1) {
      setSelectedCategoryId(enabledCategories[0].id);
      setCurrentStep(2);
    }
  }, [hasSingleCategory, currentStep, enabledCategories]);

  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tickets", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast.success("Ticket created successfully!");
      resetWizard();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create ticket");
    },
  });

  const resetWizard = () => {
    setCurrentStep(0);
    setSelectedHelpdeskId("");
    setSelectedCategoryId("");
    setTicketTitle("");
    setTicketDescription("");
    setTicketPriority("medium");
    setCustomFieldValues({});
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedHelpdeskId) {
      toast.error("Please select a helpdesk");
      return;
    }
    if (currentStep === 1 && hasMultipleCategories && !selectedCategoryId) {
      toast.error("Please select an issue type");
      return;
    }
    if (currentStep < actualSteps.length - 1) {
      if (currentStep === 0 && !hasMultipleCategories) {
        if (hasSingleCategory) {
          setSelectedCategoryId(enabledCategories[0].id);
        }
        setCurrentStep(2);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (currentStep === 2 && !hasMultipleCategories) {
        setCurrentStep(0);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSubmit = () => {
    if (!ticketTitle.trim()) {
      toast.error("Please enter a ticket title");
      return;
    }
    const helpdesk = helpdesks.find(h => h.id === selectedHelpdeskId);
    createTicketMutation.mutate({
      helpdeskId: selectedHelpdeskId,
      title: ticketTitle,
      description: ticketDescription,
      priority: ticketPriority,
      departmentId: helpdesk?.departmentId || "",
      formCategoryId: selectedCategoryId || undefined,
      customFields: customFieldValues,
      ticketType: "request",
      source: "web",
      createdBy: user?.id,
    });
  };

  const actualSteps = hasMultipleCategories 
    ? WIZARD_STEPS 
    : WIZARD_STEPS.filter(s => s.id !== "category");

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {actualSteps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = index === (hasMultipleCategories ? currentStep : (currentStep === 2 ? 1 : currentStep));
        const isCompleted = index < (hasMultipleCategories ? currentStep : (currentStep === 2 ? 1 : currentStep));
        
        return (
          <div key={step.id} className="flex items-center">
            <div 
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                isActive && "bg-primary text-primary-foreground",
                isCompleted && "bg-primary/20 text-primary",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <StepIcon className="w-4 h-4" />
              )}
              <span className="text-xs font-medium hidden sm:inline">{step.label}</span>
            </div>
            {index < actualSteps.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderHelpdeskSelection = () => {
    const enabledHelpdesks = helpdesks.filter(h => h.enabled === "true");
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">Which team can help you?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select the department that best matches your request
          </p>
        </div>
        
        {enabledHelpdesks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No helpdesks available</p>
            <p className="text-xs">Contact your administrator</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {enabledHelpdesks.map((helpdesk) => {
              const dept = departments.find(d => d.id === helpdesk.departmentId);
              const isSelected = selectedHelpdeskId === helpdesk.id;
              
              return (
                <button
                  key={helpdesk.id}
                  onClick={() => setSelectedHelpdeskId(helpdesk.id)}
                  className={cn(
                    "group p-4 rounded-xl border-2 transition-all text-left",
                    isSelected 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                      : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-transform",
                        isSelected && "scale-110"
                      )}
                      style={{ backgroundColor: `${dept?.color || "#3b82f6"}20` }}
                    >
                      <Building2 className="w-5 h-5" style={{ color: dept?.color || "#3b82f6" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{helpdesk.name}</h4>
                      {dept && (
                        <p className="text-xs text-muted-foreground truncate">{dept.name}</p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCategorySelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">What type of issue?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the category that best describes your request
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {enabledCategories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((category) => {
          const IconComponent = CATEGORY_ICONS[category.icon || "HelpCircle"] || HelpCircle;
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={cn(
                "group p-5 rounded-xl border-2 transition-all text-left",
                isSelected 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div 
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center transition-transform",
                    isSelected && "scale-110"
                  )}
                  style={{ backgroundColor: `${category.color || "#3b82f6"}20` }}
                >
                  <IconComponent className="w-7 h-7" style={{ color: category.color || "#3b82f6" }} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{category.name}</h4>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderCustomField = (field: TicketFormField) => {
    const value = customFieldValues[field.id] || "";
    const widthClass = field.width === "half" ? "col-span-3" : field.width === "third" ? "col-span-2" : "col-span-6";
    
    const updateValue = (newValue: any) => {
      setCustomFieldValues(prev => ({ ...prev, [field.id]: newValue }));
    };

    return (
      <div key={field.id} className={widthClass}>
        <div className="space-y-2">
          <Label className="text-sm">
            {field.label}
            {field.required === "true" && <span className="text-destructive ml-1">*</span>}
          </Label>
          
          {field.fieldType === "text" && (
            <Input 
              placeholder={field.placeholder || ""} 
              value={value}
              onChange={(e) => updateValue(e.target.value)}
            />
          )}
          
          {field.fieldType === "textarea" && (
            <Textarea 
              placeholder={field.placeholder || ""} 
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              className="min-h-[80px]"
            />
          )}
          
          {field.fieldType === "number" && (
            <Input 
              type="number"
              placeholder={field.placeholder || ""} 
              value={value}
              onChange={(e) => updateValue(e.target.value)}
            />
          )}
          
          {field.fieldType === "email" && (
            <Input 
              type="email"
              placeholder={field.placeholder || ""} 
              value={value}
              onChange={(e) => updateValue(e.target.value)}
            />
          )}
          
          {field.fieldType === "phone" && (
            <Input 
              type="tel"
              placeholder={field.placeholder || ""} 
              value={value}
              onChange={(e) => updateValue(e.target.value)}
            />
          )}
          
          {field.fieldType === "date" && (
            <Input 
              type="date"
              value={value}
              onChange={(e) => updateValue(e.target.value)}
            />
          )}
          
          {field.fieldType === "select" && (
            <Select value={value} onValueChange={updateValue}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || "").split(",").map((opt) => (
                  <SelectItem key={opt.trim()} value={opt.trim()}>
                    {opt.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {field.fieldType === "checkbox" && (
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={value === true}
                onCheckedChange={(checked) => updateValue(checked)}
              />
              <span className="text-sm text-muted-foreground">{field.placeholder}</span>
            </div>
          )}
          
          {field.helpText && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}
        </div>
      </div>
    );
  };

  const renderDetailsForm = () => {
    const selectedHelpdesk = helpdesks.find(h => h.id === selectedHelpdeskId);
    const selectedCategory = formCategories.find(c => c.id === selectedCategoryId);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          {selectedCategory ? (
            <>
              {(() => {
                const IconComponent = CATEGORY_ICONS[selectedCategory.icon || "HelpCircle"] || HelpCircle;
                return (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${selectedCategory.color || "#3b82f6"}20` }}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: selectedCategory.color || "#3b82f6" }} />
                  </div>
                );
              })()}
              <div>
                <p className="text-sm font-medium">{selectedCategory.name}</p>
                <p className="text-xs text-muted-foreground">{selectedHelpdesk?.name}</p>
              </div>
            </>
          ) : (
            <>
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm font-medium">{selectedHelpdesk?.name}</p>
            </>
          )}
        </div>
        
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Input 
                placeholder="Brief description of your issue"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Provide more details about your request..."
                className="min-h-[100px]"
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={ticketPriority} onValueChange={setTicketPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {userVisibleFields.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Additional Information
                </h4>
                <div className="grid grid-cols-6 gap-4">
                  {userVisibleFields.map(renderCustomField)}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderHelpdeskSelection();
      case 1:
        return hasMultipleCategories ? renderCategorySelection() : renderDetailsForm();
      case 2:
        return renderDetailsForm();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetWizard();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Create New Ticket
          </DialogTitle>
          <DialogDescription>
            Submit a support request to the appropriate team
          </DialogDescription>
        </DialogHeader>
        
        {renderStepIndicator()}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-between pt-4 border-t border-border/50 mt-4">
          <Button 
            variant="outline" 
            onClick={currentStep === 0 ? () => onOpenChange(false) : handleBack}
          >
            {currentStep === 0 ? "Cancel" : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>
          
          {currentStep < 2 && (currentStep !== 1 || hasMultipleCategories) ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={createTicketMutation.isPending}
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
