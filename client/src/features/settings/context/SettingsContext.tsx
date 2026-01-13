import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface Department {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

interface SettingsContextValue {
  activeSection: string;
  setActiveSection: (section: string) => void;
  selectedDepartmentId: string | undefined;
  setSelectedDepartmentId: (id: string | undefined) => void;
  departments: Department[];
  selectedDepartment: Department | undefined;
  isLoading: boolean;
  breadcrumbs: { id: string; label: string }[];
  navigateTo: (section: string, departmentId?: string) => void;
  pendingChanges: boolean;
  setPendingChanges: (pending: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState("helpdesk-overview");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  const [pendingChanges, setPendingChanges] = useState(false);

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
      return res.json();
    },
  });

  useEffect(() => {
    if (departments.length > 0 && !selectedDepartmentId) {
      setSelectedDepartmentId(departments[0].id);
    }
  }, [departments, selectedDepartmentId]);

  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  const normalizeSection = useCallback((section: string): string => {
    if (section === "helpdesk") return "helpdesk-overview";
    if (section === "documentation") return "docs-overview";
    return section;
  }, []);

  const getBreadcrumbs = useCallback((section: string): { id: string; label: string }[] => {
    const normalized = normalizeSection(section);
    const crumbs: { id: string; label: string }[] = [{ id: "settings", label: "Settings" }];

    const sectionMap: Record<string, { parent?: string; label: string }> = {
      "general": { label: "General" },
      "branding": { parent: "general", label: "Branding" },
      "notifications": { parent: "general", label: "Notifications" },
      "ai": { label: "AI Configuration" },
      "ai-models": { parent: "ai", label: "Models" },
      "ai-providers": { parent: "ai", label: "Providers" },
      "users": { label: "User Directory" },
      "users-list": { parent: "users", label: "All Users" },
      "users-invites": { parent: "users", label: "Invitations" },
      "roles": { label: "Roles & Permissions" },
      "roles-list": { parent: "roles", label: "System Roles" },
      "roles-policies": { parent: "roles", label: "Security Policies" },
      "departments": { label: "Departments" },
      "helpdesk": { label: "Helpdesk" },
      "helpdesk-overview": { parent: "helpdesk", label: "Overview" },
      "helpdesk-tickets": { parent: "helpdesk", label: "Ticket Settings" },
      "helpdesk-sla": { parent: "helpdesk", label: "SLA Policies" },
      "helpdesk-emails": { parent: "helpdesk", label: "Email Templates" },
      "helpdesk-webhooks": { parent: "helpdesk", label: "Webhooks" },
      "helpdesk-rules": { parent: "helpdesk", label: "Interaction Rules" },
      "documentation": { label: "Documentation" },
      "docs-overview": { parent: "documentation", label: "Overview" },
      "docs-versions": { parent: "documentation", label: "Version History" },
      "docs-access": { parent: "documentation", label: "Access Control" },
      "integrations": { label: "Custom Links" },
      "maintenance": { label: "Maintenance" },
      "maintenance-announcements": { parent: "maintenance", label: "Announcements" },
    };

    const sectionInfo = sectionMap[normalized];
    if (sectionInfo) {
      if (sectionInfo.parent) {
        const parentInfo = sectionMap[sectionInfo.parent];
        if (parentInfo) {
          crumbs.push({ id: sectionInfo.parent, label: parentInfo.label });
        }
      }
      crumbs.push({ id: normalized, label: sectionInfo.label });
    }

    return crumbs;
  }, [normalizeSection]);

  const navigateTo = useCallback((section: string, departmentId?: string) => {
    const normalized = normalizeSection(section);
    setActiveSection(normalized);
    if (departmentId !== undefined) {
      setSelectedDepartmentId(departmentId);
    }
  }, [normalizeSection]);

  const value: SettingsContextValue = {
    activeSection: normalizeSection(activeSection),
    setActiveSection: (section) => setActiveSection(normalizeSection(section)),
    selectedDepartmentId,
    setSelectedDepartmentId,
    departments,
    selectedDepartment,
    isLoading,
    breadcrumbs: getBreadcrumbs(activeSection),
    navigateTo,
    pendingChanges,
    setPendingChanges,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
