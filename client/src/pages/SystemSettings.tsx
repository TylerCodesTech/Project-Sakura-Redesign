import { useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { SettingsSidebar } from "@/features/settings/components";
import {
  AISettings,
  UsersSettings,
  RolesSettings,
  DepartmentsSettings,
  HelpdeskSettings,
  DocumentationSettings,
  LinksSettings,
  GeneralSettings,
} from "@/features/settings/sections";

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

    if (section === "integrations") {
      return <LinksSettings subsection={section} />;
    }

    return <HelpdeskSettings subsection="helpdesk-overview" />;
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <SettingsSidebar
          activeSection={normalizeSection(activeSection)}
          onSectionChange={(section) => {
            setActiveSection(normalizeSection(section));
            if (!section.startsWith("helpdesk")) {
              setHelpdeskDepartmentId(undefined);
            }
          }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </Layout>
  );
}
