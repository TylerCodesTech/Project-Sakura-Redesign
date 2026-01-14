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
  Server,
  Activity,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { SettingsNavItem } from "./types";

export type { SettingsNavItem };

export const settingsNavigation: SettingsNavItem[] = [
  {
    id: "general",
    label: "General",
    icon: Settings2,
    description: "Platform-wide settings and preferences",
    children: [
      { id: "general-company", label: "Company Information", icon: Building2 },
      { id: "general-datetime", label: "Date & Time", icon: Clock },
      { id: "general-defaults", label: "User Defaults", icon: Users },
    ],
  },
  {
    id: "branding",
    label: "Branding",
    icon: Palette,
    description: "Logo, colors, and visual identity",
    children: [
      { id: "branding-logo", label: "Logo & Favicon", icon: Palette },
      { id: "branding-colors", label: "Colors & Themes", icon: Palette },
      { id: "branding-css", label: "Custom CSS", icon: Settings2 },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email and in-app notification settings",
    children: [
      { id: "notifications-email", label: "Email Defaults", icon: Mail },
      { id: "notifications-inapp", label: "In-App Defaults", icon: Bell },
      { id: "notifications-channels", label: "Notification Channels", icon: Share2 },
    ],
  },
  {
    id: "ai",
    label: "AI Configuration",
    icon: Bot,
    description: "Configure AI models and providers",
    children: [
      { id: "ai-embeddings", label: "Embedding Models", icon: Database },
      { id: "ai-chat", label: "Chat Models", icon: Bot },
      { id: "ai-safety", label: "Safety & Compliance", icon: Shield },
    ],
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    description: "Manage users and accounts",
    children: [
      { id: "users-directory", label: "User Directory", icon: Users },
      { id: "users-invitations", label: "Invitations", icon: Mail },
      { id: "users-auth", label: "Authentication", icon: Key },
    ],
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    icon: Shield,
    description: "Define access control and permissions",
    children: [
      { id: "roles-management", label: "System Roles", icon: Shield },
      { id: "roles-permissions", label: "Permission Matrix", icon: UserCog },
      { id: "roles-security", label: "Security Policies", icon: Key },
    ],
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    description: "Organize teams and department settings",
    children: [
      { id: "departments-list", label: "Department List", icon: Building2 },
      { id: "departments-hierarchy", label: "Hierarchy", icon: FolderKanban },
      { id: "departments-settings", label: "Department Settings", icon: Settings2 },
    ],
  },
  {
    id: "helpdesk",
    label: "Helpdesk",
    icon: Ticket,
    description: "Configure helpdesk per department",
    badge: "Pro",
    children: [
      { id: "helpdesk-overview", label: "Overview", icon: FolderKanban },
      { id: "helpdesk-tickets", label: "Ticket Settings", icon: Ticket },
      { id: "helpdesk-sla", label: "SLA Policies", icon: Clock },
      { id: "helpdesk-email", label: "Email Integration", icon: Mail },
      { id: "helpdesk-webhooks", label: "Webhooks", icon: Webhook },
      { id: "helpdesk-escalation", label: "Escalation Rules", icon: AlertTriangle },
    ],
  },
  {
    id: "documentation",
    label: "Documentation",
    icon: FileText,
    description: "Knowledge base settings per department",
    children: [
      { id: "docs-overview", label: "Overview", icon: BookOpen },
      { id: "docs-versioning", label: "Version History", icon: History },
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
      { id: "reports-defaults", label: "Report Defaults", icon: BarChart3 },
      { id: "reports-scheduled", label: "Scheduled Reports", icon: Calendar },
    ],
  },
  {
    id: "integrations",
    label: "Integrations & Links",
    icon: Globe,
    description: "External tools and integrations",
    children: [
      { id: "integrations-links", label: "External Links", icon: Globe },
      { id: "integrations-api", label: "API Settings", icon: Key },
    ],
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: Construction,
    description: "System management and infrastructure",
    children: [
      { id: "maintenance-announcements", label: "Announcements", icon: Megaphone },
      { id: "maintenance-infrastructure", label: "Infrastructure", icon: Server },
      { id: "maintenance-system", label: "System Maintenance", icon: Construction },
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
