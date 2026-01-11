import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Check, Loader2, User, Building2, Sparkles, FolderTree } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const SakuraBranch = () => (
  <div className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none z-0 opacity-90">
    <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-sm">
      <defs>
        <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#5d4037', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8d6e63', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path 
        d="M420,-20 C350,50 380,80 300,100 C250,112 200,80 150,120 C120,144 100,180 80,180" 
        stroke="url(#branchGradient)" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M300,100 C280,150 320,180 310,220" 
        stroke="url(#branchGradient)" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M150,120 C140,160 160,190 150,230" 
        stroke="url(#branchGradient)" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round"
      />
      <circle cx="80" cy="180" r="8" fill="#ffb7c5" opacity="0.8" />
      <circle cx="70" cy="175" r="6" fill="#ffcdd2" opacity="0.8" />
      <circle cx="310" cy="220" r="8" fill="#ffb7c5" opacity="0.8" />
      <circle cx="320" cy="210" r="6" fill="#ffcdd2" opacity="0.8" />
      <circle cx="150" cy="230" r="7" fill="#ffb7c5" opacity="0.8" />
    </svg>
  </div>
);

const SakuraPetal = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute pointer-events-none z-0" style={{ ...style }}>
    <svg viewBox="0 0 30 30" className="w-full h-full opacity-90">
      <defs>
        <linearGradient id="petalGradientSetup" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ff9a9e', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#fecfef', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path 
        d="M15,0 C9,0 2,7 2,15 C2,22 9,30 15,30 C21,30 28,22 28,15 C28,7 21,0 15,0 M15,5 C15,5 17,2 15,0 C13,2 15,5 15,5" 
        fill="url(#petalGradientSetup)" 
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))' }}
      />
    </svg>
  </div>
);

const steps = [
  { id: 1, title: "Create Admin", icon: User, description: "Set up your super admin account" },
  { id: 2, title: "Company Info", icon: Building2, description: "Configure your organization" },
  { id: 3, title: "AI Settings", icon: Sparkles, description: "Optional AI configuration" },
  { id: 4, title: "First Department", icon: FolderTree, description: "Create your first team" },
];

const SetupWizard = () => {
  const [petals, setPetals] = useState<{ id: number; style: React.CSSProperties }[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    companyName: "Sakura",
    primaryColor: "#f43f5e",
    embeddingModel: "",
    embeddingApiKey: "",
    departmentName: "",
    departmentDescription: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setLocation] = useLocation();

  const { user, setupStatus, setupMutation, isLoading, isSetupLoading } = useAuth();

  useEffect(() => {
    const createPetal = () => {
      const startX = Math.random() * 60 + 40;
      const scale = Math.random() * 0.5 + 0.5;
      return {
        id: Math.random(),
        style: {
          left: `${startX}%`,
          top: '-20px',
          width: `${20 * scale}px`,
          height: `${20 * scale}px`,
          animationName: 'fall-diagonal, rotate-3d',
          animationDuration: `${Math.random() * 5 + 6}s, ${Math.random() * 4 + 2}s`,
          animationDelay: '0s',
          animationTimingFunction: 'linear, ease-in-out',
        }
      };
    };

    const interval = setInterval(() => {
      setPetals((prev) => {
        const cleaned = prev.slice(-35);
        return [...cleaned, createPetal()];
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && !setupMutation.isPending) {
      setLocation("/");
    }
  }, [user, setupMutation.isPending, setLocation]);

  if (isLoading || isSetupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (setupStatus && !setupStatus.needsSetup && !user) {
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
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-blue-50 flex items-center justify-center relative overflow-hidden font-sans text-slate-800 p-4">
      <SakuraBranch />

      <div className="absolute inset-0 z-0 overflow-hidden">
        {petals.map((petal) => (
          <SakuraPetal key={petal.id} style={petal.style} />
        ))}
      </div>

      <div className="w-full max-w-2xl z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep > step.id
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
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

        <Card className="border border-white/60 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-rose-200">
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
                        className={`bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 ${errors.username ? "border-red-500" : ""}`}
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
                        className={`bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 ${errors.password ? "border-red-500" : ""}`}
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
                        className={`bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 ${errors.confirmPassword ? "border-red-500" : ""}`}
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
                        className={`bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 ${errors.companyName ? "border-red-500" : ""}`}
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
                          placeholder="#f43f5e"
                          className="flex-1 bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
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
                        className="bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400"
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
                        className="bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400"
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
                        className={`bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 ${errors.departmentName ? "border-red-500" : ""}`}
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
                        className="resize-none bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400"
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
                className="gap-2 border-slate-200 hover:bg-white hover:text-rose-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={setupMutation.isPending}
                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md"
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fall-diagonal {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            transform: translate(-30vw, 105vh);
            opacity: 0;
          }
        }

        @keyframes rotate-3d {
          0% { transform: rotate3d(1, 1, 1, 0deg); }
          100% { transform: rotate3d(1, 1, 1, 360deg); }
        }
      ` }} />
    </div>
  );
};

export default SetupWizard;
