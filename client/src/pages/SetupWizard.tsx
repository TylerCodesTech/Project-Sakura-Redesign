import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Check, Loader2, User, Building2, Sparkles, FolderTree } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Create Admin", icon: User, description: "Set up your super admin account" },
  { id: 2, title: "Company Info", icon: Building2, description: "Configure your organization" },
  { id: 3, title: "AI Settings", icon: Sparkles, description: "Optional AI configuration" },
  { id: 4, title: "First Department", icon: FolderTree, description: "Create your first team" },
];

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    companyName: "Sakura",
    primaryColor: "#7c3aed",
    embeddingModel: "",
    embeddingApiKey: "",
    departmentName: "",
    departmentDescription: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user, setupStatus, setupMutation } = useAuth();

  if (user) {
    return <Redirect to="/" />;
  }

  if (setupStatus && !setupStatus.needsSetup) {
    return <Redirect to="/login" />;
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (currentStep === 2) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = "Company name is required";
      }
    }

    if (currentStep === 4) {
      if (!formData.departmentName.trim()) {
        newErrors.departmentName = "Department name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setupMutation.mutate({
      user: {
        username: formData.username,
        password: formData.password,
      },
      company: {
        name: formData.companyName,
        primaryColor: formData.primaryColor,
      },
      department: {
        name: formData.departmentName,
        description: formData.departmentDescription,
      },
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 via-slate-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep > step.id
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                      ? "bg-violet-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 ${
                      currentStep > step.id ? "bg-green-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Card className="border border-white/60 shadow-2xl bg-white/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-violet-200">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-7 h-7 text-white" })}
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-800">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-slate-500">
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => updateField("username", e.target.value)}
                        placeholder="Enter admin username"
                        className={errors.username ? "border-red-500" : ""}
                      />
                      {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="Create a strong password"
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        placeholder="Confirm your password"
                        className={errors.confirmPassword ? "border-red-500" : ""}
                      />
                      {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => updateField("companyName", e.target.value)}
                        placeholder="Your company name"
                        className={errors.companyName ? "border-red-500" : ""}
                      />
                      {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="primaryColor" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Brand Color
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          type="color"
                          id="primaryColor"
                          value={formData.primaryColor}
                          onChange={(e) => updateField("primaryColor", e.target.value)}
                          className="w-14 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => updateField("primaryColor", e.target.value)}
                          placeholder="#7c3aed"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                      This step is optional. You can configure AI settings later in the system settings.
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="embeddingModel" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Embedding Model (Optional)
                      </Label>
                      <Input
                        id="embeddingModel"
                        value={formData.embeddingModel}
                        onChange={(e) => updateField("embeddingModel", e.target.value)}
                        placeholder="e.g., text-embedding-3-small"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="embeddingApiKey" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        API Key (Optional)
                      </Label>
                      <Input
                        id="embeddingApiKey"
                        type="password"
                        value={formData.embeddingApiKey}
                        onChange={(e) => updateField("embeddingApiKey", e.target.value)}
                        placeholder="Enter your API key"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="departmentName" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Department Name
                      </Label>
                      <Input
                        id="departmentName"
                        value={formData.departmentName}
                        onChange={(e) => updateField("departmentName", e.target.value)}
                        placeholder="e.g., IT Support, Customer Service"
                        className={errors.departmentName ? "border-red-500" : ""}
                      />
                      {errors.departmentName && <p className="text-xs text-red-500">{errors.departmentName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="departmentDescription" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="departmentDescription"
                        value={formData.departmentDescription}
                        onChange={(e) => updateField("departmentDescription", e.target.value)}
                        placeholder="Brief description of this department"
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={setupMutation.isPending}
                className="gap-2 bg-violet-600 hover:bg-violet-700"
              >
                {setupMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentStep === 4 ? (
                  <>
                    Complete Setup
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  );
};

export default SetupWizard;
