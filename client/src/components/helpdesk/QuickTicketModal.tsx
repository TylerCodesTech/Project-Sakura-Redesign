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
  MessageSquare,
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            {step === 1 ? "Create New Ticket" : "Review & Submit"}
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            {step === 1 
              ? "Tell us about your issue and let our AI help route it to the right team" 
              : "Review the details and submit your ticket"
            }
          </p>
        </DialogHeader>

        {/* Enhanced Progress Indicator */}
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-2xl font-semibold transition-all duration-300",
            step >= 1 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "bg-secondary/40 text-muted-foreground"
          )}>
            1
          </div>
          <div className={cn(
            "h-2 flex-1 rounded-full transition-all duration-500",
            step >= 2 ? "bg-primary shadow-sm" : "bg-secondary/40"
          )} />
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-2xl font-semibold transition-all duration-300",
            step >= 2 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "bg-secondary/40 text-muted-foreground"
          )}>
            2
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] px-1">
          {step === 1 ? (
            <div className="space-y-8">
              {/* Description Section */}
              <div className="space-y-4">
                <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Describe your issue
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your issue in detail. Our AI will analyze your request and suggest the best team to help you..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[180px] resize-none rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm focus:bg-background"
                />

                {isAnalyzing && (
                  <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-medium text-primary">AI is analyzing your request...</span>
                  </div>
                )}
              </div>

              {/* Enhanced AI Suggestions */}
              {routingSuggestion && !isAnalyzing && (
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">AI Routing Suggestion</span>
                        <p className="text-xs text-muted-foreground">Smart routing based on your description</p>
                      </div>
                    </div>
                    <Badge className={cn("text-sm px-3 py-1 rounded-xl font-medium", getConfidenceColor(routingSuggestion.confidence))}>
                      {Math.round(routingSuggestion.confidence * 100)}% confident
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {routingSuggestion.departmentId && (
                      <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{getDepartmentName(routingSuggestion.departmentId)}</span>
                      </Badge>
                    )}
                    {routingSuggestion.subDepartmentId && (
                      <>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60">
                          <Layers className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">{getDepartmentName(routingSuggestion.subDepartmentId)}</span>
                        </Badge>
                      </>
                    )}
                    {routingSuggestion.assigneeId && (
                      <>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{getUserName(routingSuggestion.assigneeId)}</span>
                        </Badge>
                      </>
                    )}
                  </div>

                  {routingSuggestion.reason && (
                    <div className="bg-background/40 rounded-xl p-3">
                      <p className="text-sm text-muted-foreground italic">"{routingSuggestion.reason}"</p>
                    </div>
                  )}

                  {routingSuggestion.relatedDocs && routingSuggestion.relatedDocs.length > 0 && (
                    <div className="pt-4 border-t border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Related Knowledge Base</span>
                      </div>
                      <div className="space-y-2">
                        {routingSuggestion.relatedDocs.slice(0, 3).map((doc) => (
                          <div 
                            key={doc.id} 
                            className="flex items-center gap-3 p-3 rounded-xl bg-background/40 hover:bg-background/60 cursor-pointer transition-all group"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                {doc.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(doc.similarity * 100)}% relevance
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="px-8 rounded-xl">
                  Cancel
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!description.trim()}
                  className="px-8 rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Title Section */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Ticket Summary
                </Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm focus:bg-background h-12"
                />
              </div>

              {/* Department Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Department
                  </Label>
                  <Select
                    value={selectedDepartmentId || ""}
                    onValueChange={(value) => {
                      setSelectedDepartmentId(value);
                      setSelectedSubDepartmentId(null);
                      setSelectedAssigneeId(null);
                    }}
                  >
                    <SelectTrigger className="rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm h-12">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                      {rootDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="rounded-xl">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: dept.color }}
                            />
                            {dept.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Sub-Department
                  </Label>
                  <Select
                    value={selectedSubDepartmentId || ""}
                    onValueChange={(value) => {
                      setSelectedSubDepartmentId(value);
                      setSelectedAssigneeId(null);
                    }}
                    disabled={!selectedDepartmentId || subDepartments.length === 0}
                  >
                    <SelectTrigger className="rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm h-12">
                      <SelectValue placeholder={subDepartments.length === 0 ? "No sub-departments" : "Select sub-department"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                      {subDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="rounded-xl">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: dept.color }}
                            />
                            {dept.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority and Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                      <SelectItem value="low" className="rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span>Low Priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium" className="rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span>Medium Priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high" className="rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <span>High Priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent" className="rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span>Urgent Priority</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    Assignee (Optional)
                  </Label>
                  <Select
                    value={selectedAssigneeId || "__auto__"}
                    onValueChange={(value) => setSelectedAssigneeId(value === "__auto__" ? null : value)}
                    disabled={availableAssignees.length === 0}
                  >
                    <SelectTrigger className="rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm h-12">
                      <SelectValue placeholder={availableAssignees.length === 0 ? "No users available" : "Auto-assign"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__auto__">Auto-assign</SelectItem>
                      {availableAssignees.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.displayName || user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Form Category if available */}
              {formCategories.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Category (Optional)
                  </Label>
                  <Select value={selectedFormCategoryId || ""} onValueChange={setSelectedFormCategoryId}>
                    <SelectTrigger className="rounded-2xl border-border/40 bg-background/60 backdrop-blur-sm h-12">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl">
                      {formCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="rounded-xl">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Summary Section */}
              <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-2xl p-6 border border-border/40">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Ticket Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Description: </span>
                      <span className="text-foreground">{description.substring(0, 100)}{description.length > 100 ? "..." : ""}</span>
                    </div>
                  </div>
                  {selectedDepartmentId && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-foreground">Department: {getDepartmentName(selectedDepartmentId)}</span>
                    </div>
                  )}
                  {selectedSubDepartmentId && (
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span className="text-foreground">Sub-Department: {getDepartmentName(selectedSubDepartmentId)}</span>
                    </div>
                  )}
                  {selectedAssigneeId && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-foreground">Assignee: {getUserName(selectedAssigneeId)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-foreground capitalize">Priority: {priority}</span>
                  </div>
                </div>
              </div>

              {routingSuggestion && selectedAssigneeId !== routingSuggestion.assigneeId && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-600">AI Routing Override</p>
                    <p className="text-xs text-yellow-600/80">You've overridden the AI-suggested routing</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="px-8 rounded-xl gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createTicketMutation.isPending || !selectedDepartmentId}
                  className="px-8 rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl"
                >
                  {createTicketMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Ticket
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
