import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Search, 
  Settings, 
  Users, 
  HelpCircle, 
  Bell,
  CheckCircle2,
  Clock,
  File
} from "lucide-react";

export const currentUser = {
  id: "current-user-id",
  name: "Sarah Chen",
  role: "Product Manager",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
  email: "sarah.chen@sarah.ai"
};

export const tickets = [
  {
    id: "T-1024",
    title: "SSO Login failure for Engineering team",
    status: "Open",
    priority: "High",
    assignee: "Alex K.",
    created: "2 hours ago",
    department: "IT Support"
  },
  {
    id: "T-1023",
    title: "Request for new Figma licenses",
    status: "In Progress",
    priority: "Medium",
    assignee: "Sarah C.",
    created: "4 hours ago",
    department: "Design"
  },
  {
    id: "T-1022",
    title: "Q4 Marketing Budget Approval",
    status: "Pending",
    priority: "Medium",
    assignee: "Finance Team",
    created: "1 day ago",
    department: "Finance"
  },
  {
    id: "T-1021",
    title: "Update employee handbook",
    status: "Resolved",
    priority: "Low",
    assignee: "HR Team",
    created: "2 days ago",
    department: "HR"
  }
];

export const documents = [
  { id: 1, name: "Product Strategy 2026", type: "folder", modified: "2 hours ago", size: "--" },
  { id: 2, name: "Q1 Roadmap.pdf", type: "pdf", modified: "Yesterday", size: "2.4 MB" },
  { id: 3, name: "Employee Onboarding Guide", type: "doc", modified: "3 days ago", size: "1.1 MB" },
  { id: 4, name: "Brand Guidelines_v2", type: "folder", modified: "Last week", size: "--" },
  { id: 5, name: "Technical Architecture", type: "doc", modified: "Last week", size: "850 KB" },
];

export const recentActivity = [
  { id: 1, user: "Alex K.", action: "commented on", target: "T-1024", time: "10 mins ago" },
  { id: 2, user: "System", action: "automatically routed", target: "T-1025 to IT Support", time: "1 hour ago" },
  { id: 3, user: "Sarah C.", action: "uploaded", target: "Q1 Roadmap.pdf", time: "4 hours ago" },
];

export const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: MessageSquare, label: "Helpdesk", href: "/helpdesk" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Users, label: "Team Directory", href: "/team" },
  { icon: Settings, label: "System Settings", href: "/settings" },
];

export const teamMembers = [
  {
    id: "1",
    name: "Li Wei",
    role: "CEO & Founder",
    department: "Executive",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    managerId: null,
    email: "li.wei@sakura.ai"
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "VP of Product",
    department: "Product",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    managerId: "1",
    email: "sarah.chen@sakura.ai"
  },
  {
    id: "3",
    name: "Marcus Thorne",
    role: "CTO",
    department: "Engineering",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    managerId: "1",
    email: "marcus.thorne@sakura.ai"
  },
  {
    id: "4",
    name: "Elena Rodriguez",
    role: "Product Designer",
    department: "Product",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    managerId: "2",
    email: "elena.r@sakura.ai"
  },
  {
    id: "5",
    name: "Alex Kim",
    role: "Senior Frontend Engineer",
    department: "Engineering",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    managerId: "3",
    email: "alex.kim@sakura.ai"
  },
  {
    id: "6",
    name: "Jordan Smith",
    role: "Backend Engineer",
    department: "Engineering",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=150&h=150",
    managerId: "3",
    email: "jordan.s@sakura.ai"
  }
];
