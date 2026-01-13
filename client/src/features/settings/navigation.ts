import {
  Bot,
  Users,
  Shield,
  Building2,
  Clock,
  Ticket,
  Globe,
  FileText,
  Mail,
  Webhook,
  Settings2,
  Palette,
  Bell,
  Database,
  Key,
  UserCog,
  FolderKanban,
  MessagesSquare,
  BookOpen,
  History,
  BarChart3,
  FileBarChart,
  Calendar,
  Share2,
  Construction,
  Megaphone,
  User,
  Server,
  Activity,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { SettingsNavItem } from "./types";

export type { SettingsNavItem };

export const settingsNavigation: SettingsNavItem[] = [
  {
    id: "profile",
    label: "My Profile",
    icon: User,
    description: "Manage your personal information",
  },
  {
    id: "general",
    label: "General",
    icon: Settings2,
    description: "Platform-wide settings and preferences",
    children: [
      { id: "branding", label: "Branding", icon: Palette },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    id: "ai",
    label: "AI Configuration",
    icon: Bot,
    description: "Configure AI models and providers",
  },
  {
    id: "users",
    label: "User Directory",
    icon: Users,
    description: "Manage users and accounts",
    children: [
      { id: "users-list", label: "All Users", icon: Users },
      { id: "users-invites", label: "Invitations", icon: Mail },
    ],
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    icon: Shield,
    description: "Define access control and permissions",
    children: [
      { id: "roles-list", label: "System Roles", icon: Shield },
      { id: "roles-policies", label: "Security Policies", icon: Key },
    ],
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    description: "Organize teams and department settings",
  },
  {
    id: "helpdesk",
    label: "Helpdesk",
    icon: Clock,
    description: "Configure helpdesk per department",
    badge: "Pro",
    children: [
      { id: "helpdesk-overview", label: "Overview", icon: FolderKanban },
      { id: "helpdesk-tickets", label: "Ticket Settings", icon: Ticket },
      { id: "helpdesk-sla", label: "SLA Policies", icon: Clock },
      { id: "helpdesk-emails", label: "Email Templates", icon: Mail },
      { id: "helpdesk-webhooks", label: "Webhooks", icon: Webhook },
      { id: "helpdesk-rules", label: "Interaction Rules", icon: MessagesSquare },
    ],
  },
  {
    id: "documentation",
    label: "Documentation",
    icon: FileText,
    description: "Knowledge base settings per department",
    children: [
      { id: "docs-overview", label: "Overview", icon: BookOpen },
      { id: "docs-versions", label: "Version History", icon: History },
      { id: "docs-access", label: "Access Control", icon: UserCog },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    description: "Configure reports per department",
    badge: "Pro",
    children: [
      { id: "reports-overview", label: "Overview", icon: FileBarChart },
      { id: "reports-builder", label: "Report Builder", icon: BarChart3 },
      { id: "reports-scheduled", label: "Scheduled Reports", icon: Calendar },
      { id: "reports-sharing", label: "Sharing & Access", icon: Share2 },
    ],
  },
  {
    id: "integrations",
    label: "Custom Links",
    icon: Globe,
    description: "External tools and integrations",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: Construction,
    description: "System announcements and maintenance notices",
    children: [
      { id: "maintenance-announcements", label: "Announcements", icon: Megaphone },
      { id: "maintenance-infrastructure", label: "Infrastructure", icon: Server },
      { id: "maintenance-services", label: "Monitored Services", icon: Activity },
      { id: "maintenance-alerts", label: "Service Alerts", icon: AlertTriangle },
    ],
  },
];

export function findNavItem(id: string, items: SettingsNavItem[] = settingsNavigation): SettingsNavItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findNavItem(id, item.children);
      if (found) return found;
    }
  }
  return undefined;
}

export function findParentNavItem(childId: string, items: SettingsNavItem[] = settingsNavigation): SettingsNavItem | undefined {
  for (const item of items) {
    if (item.children?.some(c => c.id === childId)) return item;
    if (item.children) {
      const found = findParentNavItem(childId, item.children);
      if (found) return found;
    }
  }
  return undefined;
}
