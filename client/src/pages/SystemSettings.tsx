import { useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { SettingsSidebar } from "@/features/settings/components";
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
} from "@/features/settings/sections";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemSettings() {
  const [activeSection, setActiveSection] = useState("helpdesk-overview");
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
    
    if (section.startsWith("general") || section === "branding" || section === "notifications") {
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

    if (section === "departments") {
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
      return <ReportsSettings />;
    }

    if (section === "integrations") {
      return <LinksSettings subsection={section} />;
    }

    return <HelpdeskSettings subsection="helpdesk-overview" />;
  };

  const sectionKey = normalizeSection(activeSection);

  return (
    <SettingsProvider>
      <Layout>
        <div className="flex min-h-[calc(100vh-4rem)]">
          <SettingsSidebar
            activeSection={sectionKey}
            onSectionChange={(section) => {
              setActiveSection(normalizeSection(section));
              if (!section.startsWith("helpdesk")) {
                setHelpdeskDepartmentId(undefined);
              }
            }}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-gradient-to-br from-background to-muted/20">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={sectionKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </Layout>
    </SettingsProvider>
  );
}
