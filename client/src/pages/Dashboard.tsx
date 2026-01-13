import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { cn } from "@/lib/utils";
import {
  Clock,
  CloudSun,
  Activity,
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// Import intranet components
import {
  PostComposer,
  PostCard,
  DepartmentChannels,
  OnlineUsers,
  TrendingTopics,
  UpcomingEvents,
  AnnouncementsBanner,
  type Post,
  type DepartmentChannel,
  type OnlineUser,
  type TrendingTopic,
  type UpcomingEvent,
  type Announcement
} from "@/components/intranet";

// Local interface for department data from API
interface Department {
  id: number | string;
  name: string;
  description?: string | null;
  color?: string;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}


// Mock data for demonstration - will be replaced with API calls
const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Sarah Chen",
      department: "Marketing"
    },
    content: "Excited to announce that our Q4 campaign exceeded expectations! 📈 Huge thanks to the entire team for their incredible work. Can't wait to share the full results at Friday's all-hands meeting.",
    visibility: "public",
    hashtags: ["Q4Results", "TeamWin", "Marketing"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likesCount: 24,
    commentsCount: 8,
    sharesCount: 3,
    isLiked: true,
    isPinned: true,
  },
  {
    id: "2",
    author: {
      id: "user2",
      name: "Marcus Johnson",
      department: "Engineering"
    },
    content: "Just pushed the new authentication system to staging! 🚀 If anyone has time to do some exploratory testing before EOD, please reach out. Looking for edge cases we might have missed.",
    visibility: "public",
    hashtags: ["Engineering", "Release", "Testing"],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likesCount: 18,
    commentsCount: 12,
    sharesCount: 1,
    comments: [
      {
        id: "c1",
        author: { id: "user3", name: "Alex Rivera" },
        content: "I'll take a look this afternoon! Any specific areas of concern?",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: "3",
    author: {
      id: "user4",
      name: "Emily Wang",
      department: "HR"
    },
    content: "📢 Reminder: Open enrollment for benefits ends this Friday! If you haven't reviewed your options yet, please visit the HR portal or reach out to our team with any questions.",
    visibility: "public",
    hashtags: ["HR", "Benefits", "Reminder"],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likesCount: 5,
    commentsCount: 2,
    sharesCount: 0,
  },
  {
    id: "4",
    author: {
      id: "user5",
      name: "David Kim",
      department: "Sales"
    },
    content: "Just closed our biggest enterprise deal of the year! 🎉 This has been 6 months in the making and I couldn't have done it without @Lisa Thompson and the solutions engineering team. Drinks are on me!",
    visibility: "public",
    hashtags: ["Sales", "BigWin", "Celebration"],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likesCount: 67,
    commentsCount: 23,
    sharesCount: 8,
  },
];

const mockOnlineUsers: OnlineUser[] = [
  { id: "1", name: "Sarah Chen", department: "Marketing", status: "online" },
  { id: "2", name: "Marcus Johnson", department: "Engineering", status: "online" },
  { id: "3", name: "Emily Wang", department: "HR", status: "away", statusMessage: "In a meeting" },
  { id: "4", name: "David Kim", department: "Sales", status: "busy", statusMessage: "Do not disturb" },
  { id: "5", name: "Alex Rivera", department: "Engineering", status: "online" },
  { id: "6", name: "Lisa Thompson", department: "Solutions", status: "online" },
  { id: "7", name: "James Wilson", department: "Finance", status: "away" },
  { id: "8", name: "Rachel Green", department: "Design", status: "online" },
];

const mockTrendingTopics: TrendingTopic[] = [
  { id: "1", tag: "Q4Results", postCount: 45, trend: "up" },
  { id: "2", tag: "NewProduct", postCount: 32, trend: "up" },
  { id: "3", tag: "TeamBuilding", postCount: 28, trend: "stable" },
  { id: "4", tag: "RemoteWork", postCount: 21, trend: "stable" },
  { id: "5", tag: "Innovation", postCount: 18, trend: "new" },
];

const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: "1",
    title: "All-Hands Meeting",
    type: "meeting",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: "2:00 PM",
    location: "Main Conference Room",
    attendeesCount: 48,
    isAttending: true,
  },
  {
    id: "2",
    title: "Product Launch Party",
    type: "celebration",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: "6:00 PM",
    location: "Rooftop Lounge",
    attendeesCount: 72,
  },
  {
    id: "3",
    title: "Security Training",
    type: "training",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: "10:00 AM",
    location: "Online",
    attendeesCount: 120,
  },
];

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "System Maintenance Scheduled",
    message: "The intranet will be undergoing scheduled maintenance this Saturday from 2 AM to 6 AM EST. Please save your work beforehand.",
    type: "warning",
    link: "/announcements/maintenance",
    createdAt: new Date().toISOString(),
  },
];

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [activeChannel, setActiveChannel] = useState<string>("all");
  const [feedFilter, setFeedFilter] = useState<"all" | "following" | "department">("all");
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Fetch active announcements
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements/active"],
  });

  // Fetch users from signed-in user's department
  const { data: departmentUsers = [] } = useQuery<{id: string; username: string; department: string}[]>({
    queryKey: ["/api/users/department", user?.department],
    enabled: !!user?.department,
  });

  // Fetch trending topics for user's department
  const { data: trendingData = [] } = useQuery<{query: string; count: number}[]>({
    queryKey: ["/api/trending-topics", user?.department],
    queryFn: async () => {
      const res = await fetch(`/api/trending-topics?departmentId=${user?.department || ''}&limit=5`);
      return res.json();
    },
    enabled: !!user,
  });

  // Transform trending data to expected format
  const trendingTopics: TrendingTopic[] = trendingData.map((t, i) => ({
    id: i.toString(),
    tag: t.query,
    postCount: t.count,
    trend: "stable" as const,
  }));

  // Transform department users to online users format
  const onlineUsers: OnlineUser[] = departmentUsers.map((u, i) => ({
    id: u.id,
    name: u.username,
    department: u.department || user?.department || "",
    status: i % 4 === 0 ? "away" : i % 5 === 0 ? "busy" : "online" as const,
  }));

  // Transform departments to channels format
  const channels: DepartmentChannel[] = departments.map(dept => ({
    id: dept.id.toString(),
    name: dept.name,
    color: dept.color || '#7c3aed',
    memberCount: 12, // TODO: get from backend
    isFavorite: false,
  }));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePost = (content: string, visibility: string, departmentId?: string) => {
    console.log("New post:", { content, visibility, departmentId });
    // TODO: Implement post creation via API
  };

  const handleLike = (postId: string) => {
    console.log("Like post:", postId);
    // TODO: Implement like via API
  };

  const handleComment = (postId: string, content: string) => {
    console.log("Comment on post:", postId, content);
    // TODO: Implement comment via API
  };

  const systems = [
    { name: "AI Engine", status: "Operational", color: "bg-emerald-400", latency: "42ms" },
    { name: "Document Store", status: "Operational", color: "bg-emerald-400", latency: "12ms" },
    { name: "Helpdesk API", status: "Degraded", color: "bg-rose-400/30", latency: "850ms" },
    { name: "Auth Service", status: "Operational", color: "bg-emerald-400", latency: "24ms" },
  ];

  const userName = user?.username || "User";
  const companyName = settings.companyName || "Your Company";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-primary tracking-tight">
              {getTimeGreeting()}, {userName}
            </h1>
            <p className="text-muted-foreground text-lg">
              What's happening at {companyName} today
            </p>
          </div>

          {/* Top Right Status Bar */}
          <div className="flex items-center gap-4 p-2 bg-secondary/20 dark:bg-card/40 backdrop-blur-md rounded-[20px] border border-border/50 shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-background dark:bg-card rounded-2xl border border-border/50 shadow-sm">
              <CloudSun className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold">72°F</span>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-background dark:bg-card rounded-2xl border border-border/50 shadow-sm">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold tabular-nums">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors cursor-help group outline-none">
                    <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Nominal</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="w-[320px] p-0 rounded-3xl overflow-hidden border-none shadow-[0_20px_50px_rgba(219,39,119,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]" sideOffset={12} align="end">
                  <div className="bg-primary/40 dark:bg-primary/60 backdrop-blur-md p-4 px-6 border-b border-white/10">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">System Infrastructure</h4>
                  </div>
                  <div className="bg-primary dark:bg-primary/90 p-6 space-y-5">
                    {systems.map((s) => (
                      <div key={s.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]", s.color)} />
                          <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{s.name}</span>
                        </div>
                        <div className="text-[10px] font-black text-white/90 bg-white/20 px-2 py-1 rounded-lg border border-white/10 backdrop-blur-sm min-w-[50px] text-center">
                          {s.latency}
                        </div>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Announcements Banner */}
        {announcements.length > 0 && (
          <AnnouncementsBanner
            announcements={announcements}
            onDismiss={(id) => console.log("Dismissed:", id)}
          />
        )}

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Department Channels */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <DepartmentChannels
              channels={channels}
              activeChannelId={activeChannel}
              onChannelSelect={setActiveChannel}
              onToggleFavorite={(id) => console.log("Toggle favorite:", id)}
            />
          </div>

          {/* Center - Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Post Composer */}
            <PostComposer
              onPost={handlePost}
              departments={channels.map(c => ({
                id: c.id,
                name: c.name,
                color: c.color
              }))}
            />

            {/* Feed Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">Feed</h2>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                  {activeChannel === "all" ? "All" : channels.find(c => c.id === activeChannel)?.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-lg">
                      <Filter className="w-4 h-4" />
                      <span className="text-xs font-medium capitalize">{feedFilter}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 rounded-xl">
                    <DropdownMenuItem
                      className="rounded-lg"
                      onClick={() => setFeedFilter("all")}
                    >
                      All Posts
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg"
                      onClick={() => setFeedFilter("following")}
                    >
                      Following
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg"
                      onClick={() => setFeedFilter("department")}
                    >
                      My Department
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={(id) => console.log("Share:", id)}
                  onBookmark={(id) => console.log("Bookmark:", id)}
                  currentUserId={user?.id?.toString()}
                />
              ))}

              {/* Load More */}
              <div className="flex justify-center py-8">
                <Button variant="outline" className="rounded-full px-6">
                  Load more posts
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Online Users, Trending, Events */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <OnlineUsers
              users={onlineUsers.length > 0 ? onlineUsers : mockOnlineUsers}
              onMessageUser={(id) => console.log("Message user:", id)}
            />

            <TrendingTopics
              topics={trendingTopics.length > 0 ? trendingTopics : mockTrendingTopics}
              onTopicClick={(tag) => console.log("Topic clicked:", tag)}
            />

            <UpcomingEvents
              events={mockUpcomingEvents}
              onEventClick={(id) => console.log("Event clicked:", id)}
              onRSVP={(id) => console.log("RSVP:", id)}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
