import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  User,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Department, type User as UserType, type Helpdesk, type DepartmentHierarchy, type TicketFormCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RoutingSuggestion {
  departmentId: string | null;
  subDepartmentId: string | null;
  assigneeId: string | null;
  confidence: number;
  reason: string;
  relatedTickets?: Array<{ id: string; title: string; similarity: number }>;
  relatedDocs?: Array<{ id: string; title: string; similarity: number }>;
}

interface QuickTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (ticketId: string) => void;
}

export function QuickTicketModal({ open, onOpenChange, onSuccess }: QuickTicketModalProps) {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedSubDepartmentId, setSelectedSubDepartmentId] = useState<string | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [selectedFormCategoryId, setSelectedFormCategoryId] = useState<string | null>(null);
  const [routingSuggestion, setRoutingSuggestion] = useState<RoutingSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDebounce, setAnalysisDebounce] = useState<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: helpdesks = [] } = useQuery<Helpdesk[]>({
    queryKey: ["/api/helpdesks"],
  });

  const { data: hierarchy = [] } = useQuery<DepartmentHierarchy[]>({
    queryKey: ["/api/department-hierarchy"],
  });

  const selectedHelpdesk = helpdesks.find(h => h.departmentId === selectedDepartmentId);

  const { data: formCategories = [] } = useQuery<TicketFormCategory[]>({
    queryKey: ["/api/helpdesks", selectedHelpdesk?.id, "form-categories"],
    queryFn: async () => {
      if (!selectedHelpdesk?.id) return [];
      const res = await fetch(`/api/helpdesks/${selectedHelpdesk.id}/form-categories`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedHelpdesk?.id,
  });

  const getRootDepartments = () => {
    const childIds = new Set(hierarchy.map(h => h.childDepartmentId));
    return departments.filter(d => !childIds.has(d.id));
  };

  const getSubDepartments = (parentId: string) => {
    const childIds = hierarchy
      .filter(h => h.parentDepartmentId === parentId)
      .map(h => h.childDepartmentId);
    return departments.filter(d => childIds.includes(d.id));
  };

  const getDepartmentUsers = (deptId: string | null) => {
    if (!deptId) return [];
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return [];
    return users.filter(u => u.department === dept.name);
  };

  const analyzeWithAI = async (text: string) => {
    if (text.length < 10) {
      setRoutingSuggestion(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });
      
      if (response.ok) {
        const suggestion = await response.json();
        setRoutingSuggestion(suggestion);
        
        if (suggestion.departmentId && !selectedDepartmentId) {
          setSelectedDepartmentId(suggestion.departmentId);
        }
        if (suggestion.subDepartmentId && !selectedSubDepartmentId) {
          setSelectedSubDepartmentId(suggestion.subDepartmentId);
        }
        if (suggestion.assigneeId && !selectedAssigneeId) {
          setSelectedAssigneeId(suggestion.assigneeId);
        }
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (analysisDebounce) {
      clearTimeout(analysisDebounce);
    }

    if (description.length >= 10) {
      const timeout = setTimeout(() => {
        analyzeWithAI(description);
      }, 500);
      setAnalysisDebounce(timeout);
    }

    return () => {
      if (analysisDebounce) {
        clearTimeout(analysisDebounce);
      }
    };
  }, [description]);

  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/tickets", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Ticket created",
        description: `Your ticket has been submitted and routed.`,
      });
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep(1);
    setDescription("");
    setTitle("");
    setPriority("medium");
    setSelectedDepartmentId(null);
    setSelectedSubDepartmentId(null);
    setSelectedAssigneeId(null);
    setSelectedFormCategoryId(null);
    setRoutingSuggestion(null);
  };

  const handleNext = () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe your issue before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      const words = description.trim().split(" ").slice(0, 8);
      setTitle(words.join(" ") + (description.trim().split(" ").length > 8 ? "..." : ""));
    }
    
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedDepartmentId) {
      toast({
        title: "Department required",
        description: "Please select a department for your ticket.",
        variant: "destructive",
      });
      return;
    }

    const helpdesk = helpdesks.find(h => h.departmentId === (selectedSubDepartmentId || selectedDepartmentId));
    
    createTicketMutation.mutate({
      title: title.trim() || description.slice(0, 100),
      description,
      priority,
      helpdeskId: helpdesk?.id || helpdesks[0]?.id,
      departmentId: selectedDepartmentId,
      subDepartmentId: selectedSubDepartmentId,
      assignedTo: selectedAssigneeId,
      formCategoryId: selectedFormCategoryId,
      aiRoutingConfidence: routingSuggestion?.confidence?.toString(),
      aiSuggestedAssignee: routingSuggestion?.assigneeId,
    });
  };

  const getDepartmentName = (id: string | null) => 
    departments.find(d => d.id === id)?.name || "Unknown";

  const getUserName = (id: string | null) => 
    users.find(u => u.id === id)?.username || "Unknown";

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-500/10";
    if (confidence >= 0.5) return "text-yellow-600 bg-yellow-500/10";
    return "text-red-600 bg-red-500/10";
  };

  const rootDepartments = getRootDepartments();
  const subDepartments = selectedDepartmentId ? getSubDepartments(selectedDepartmentId) : [];
  const availableAssignees = getDepartmentUsers(selectedSubDepartmentId || selectedDepartmentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {step === 1 ? "Describe Your Issue" : "Confirm & Submit"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-6">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
            step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            1
          </div>
          <div className={cn(
            "h-1 flex-1 rounded",
            step >= 2 ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
            step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            2
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">What do you need help with?</Label>
              <Textarea
                id="description"
                placeholder="Describe your issue in detail. Our AI will analyze your request and suggest the best team to help you..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px] resize-none"
              />
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI is analyzing your request...
                </div>
              )}
            </div>

            {routingSuggestion && !isAnalyzing && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Routing Suggestion
                  </span>
                  <Badge className={cn("text-xs", getConfidenceColor(routingSuggestion.confidence))}>
                    {Math.round(routingSuggestion.confidence * 100)}% confident
                  </Badge>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-sm">
                  {routingSuggestion.departmentId && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {getDepartmentName(routingSuggestion.departmentId)}
                    </Badge>
                  )}
                  {routingSuggestion.subDepartmentId && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {getDepartmentName(routingSuggestion.subDepartmentId)}
                      </Badge>
                    </>
                  )}
                  {routingSuggestion.assigneeId && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getUserName(routingSuggestion.assigneeId)}
                      </Badge>
                    </>
                  )}
                </div>

                {routingSuggestion.reason && (
                  <p className="text-xs text-muted-foreground">{routingSuggestion.reason}</p>
                )}

                {routingSuggestion.relatedDocs && routingSuggestion.relatedDocs.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Related Knowledge Base Articles
                    </p>
                    <div className="space-y-1">
                      {routingSuggestion.relatedDocs.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                          • {doc.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!description.trim()}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={selectedDepartmentId || ""}
                    onValueChange={(value) => {
                      setSelectedDepartmentId(value);
                      setSelectedSubDepartmentId(null);
                      setSelectedAssigneeId(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {rootDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sub-Department</Label>
                  <Select
                    value={selectedSubDepartmentId || ""}
                    onValueChange={(value) => {
                      setSelectedSubDepartmentId(value);
                      setSelectedAssigneeId(null);
                    }}
                    disabled={!selectedDepartmentId || subDepartments.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={subDepartments.length === 0 ? "No sub-departments" : "Select sub-department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assignee (Optional)</Label>
                  <Select
                    value={selectedAssigneeId || ""}
                    onValueChange={setSelectedAssigneeId}
                    disabled={availableAssignees.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={availableAssignees.length === 0 ? "No users available" : "Auto-assign"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Auto-assign</SelectItem>
                      {availableAssignees.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.displayName || user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
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
              </div>

              {formCategories.length > 1 && (
                <div className="space-y-2">
                  <Label>Issue Category</Label>
                  <Select
                    value={selectedFormCategoryId || ""}
                    onValueChange={setSelectedFormCategoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {formCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{description}</p>
              </div>
            </div>

            {routingSuggestion && selectedAssigneeId !== routingSuggestion.assigneeId && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">
                  You've overridden the AI-suggested routing
                </span>
              </div>
            )}

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedDepartmentId || createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Ticket
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
