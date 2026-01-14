import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SettingsSidebar, SettingsHeader, DepartmentSelector } from "@/features/settings/components";
import { SettingsProvider } from "@/features/settings/context";
import {
  AISettings,
  UsersSettings,
  RolesSettings,
  DepartmentsSettings,
  HelpdeskSettings,
  DocumentationSettings,
  ReportsSettings,
  LinksSettings,
  GeneralSettings,
  MaintenanceSettings,
  InfrastructureSettings,
  ProfileSettings,
} from "@/features/settings/sections";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SystemSettings() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("general");
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [helpdeskDepartmentId, setHelpdeskDepartmentId] = useState<string | undefined>();

  const handleNavigateToHelpdesk = useCallback((departmentId: string) => {
    setHelpdeskDepartmentId(departmentId);
    setActiveSection("helpdesk-overview");
  }, []);

  const normalizeSection = (section: string): string => {
    if (section === "helpdesk") return "helpdesk-overview";
    if (section === "documentation") return "docs-overview";
    return section;
  };

  const renderSection = () => {
    const section = normalizeSection(activeSection);
    
    if (section === "profile") {
      return <ProfileSettings />;
    }

    if (section.startsWith("general")) {
      return <GeneralSettings subsection={section} />;
    }

    if (section.startsWith("branding")) {
      return <GeneralSettings subsection={section} />;
    }

    if (section.startsWith("notifications")) {
      return <GeneralSettings subsection={section} />;
    }

    if (section.startsWith("ai")) {
      return <AISettings subsection={section} />;
    }

    if (section.startsWith("users")) {
      return <UsersSettings subsection={section} />;
    }

    if (section.startsWith("roles")) {
      return <RolesSettings subsection={section} />;
    }

    if (section.startsWith("departments")) {
      return (
        <DepartmentsSettings
          subsection={section}
          onNavigateToHelpdesk={handleNavigateToHelpdesk}
        />
      );
    }

    if (section.startsWith("helpdesk")) {
      return (
        <HelpdeskSettings
          subsection={section}
          initialDepartmentId={helpdeskDepartmentId}
        />
      );
    }

    if (section.startsWith("docs")) {
      return <DocumentationSettings subsection={section} />;
    }

    if (section.startsWith("reports")) {
      return <ReportsSettings subsection={section} />;
    }

    if (section.startsWith("integrations")) {
      return <LinksSettings subsection={section} />;
    }

    if (section === "maintenance-infrastructure" || section === "maintenance-services" || section === "maintenance-alerts") {
      return <InfrastructureSettings subsection={section} />;
    }

    if (section.startsWith("maintenance")) {
      return <MaintenanceSettings subsection={section} />;
    }

    return <GeneralSettings subsection="general" />;
  };

  const sectionKey = normalizeSection(activeSection);

  return (
    <SettingsProvider>
      <Layout>
        <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden">
          {/* Modern top header bar */}
          <div className="shrink-0 border-b border-border/20 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4 relative">
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 opacity-0"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <div className="flex items-center gap-4 relative z-10">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate("/")}
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </motion.div>
                <div className="h-6 w-px bg-gradient-to-b from-transparent via-border/60 to-transparent" />
                <motion.h1 
                  className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  System Settings
                </motion.h1>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DepartmentSelector
                  departments={[]} // TODO: Connect to departments data
                  selectedDepartment={selectedDepartment}
                  onSelect={setSelectedDepartment}
                  showGlobalOption={true}
                />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden bg-gradient-to-br from-muted/5 via-background to-muted/10 relative">
            {/* Subtle animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, transparent 50%, rgba(var(--primary), 0.03) 100%)",
                  "radial-gradient(circle at 100% 100%, transparent 50%, rgba(var(--primary), 0.03) 100%)",
                  "radial-gradient(circle at 0% 100%, transparent 50%, rgba(var(--primary), 0.03) 100%)",
                  "radial-gradient(circle at 100% 0%, transparent 50%, rgba(var(--primary), 0.03) 100%)",
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <SettingsSidebar
              activeSection={sectionKey}
              onSectionChange={(section) => {
                setActiveSection(normalizeSection(section));
                if (!section.startsWith("helpdesk")) {
                  setHelpdeskDepartmentId(undefined);
                }
              }}
            />
            
            <main className="flex-1 overflow-auto relative">
              {/* Premium grid background */}
              <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute inset-0 bg-grid-slate-500/[0.06] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background pointer-events-none" />
              </div>
              
              <div className="max-w-7xl mx-auto p-8 lg:p-12 relative z-10 pb-24">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <SettingsHeader
                    sectionId={sectionKey}
                    showBreadcrumbs={true}
                    showSearch={true}
                    onSearchClick={() => {
                      // TODO: Implement settings search
                      console.log('Search clicked');
                    }}
                  />
                </motion.div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sectionKey}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.1
                    }}
                    className="mt-8"
                  >
                    {renderSection()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.div
                className="fixed bottom-8 right-8 z-50"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  animate={{ 
                    boxShadow: [
                      "0 4px 20px rgba(var(--primary), 0.1)",
                      "0 8px 30px rgba(var(--primary), 0.2)",
                      "0 4px 20px rgba(var(--primary), 0.1)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/20"
                >
                  <Settings className="w-6 h-6 text-primary-foreground" />
                </motion.div>
              </motion.div>
            </main>
          </div>
        </div>
      </Layout>
    </SettingsProvider>
  );
}
