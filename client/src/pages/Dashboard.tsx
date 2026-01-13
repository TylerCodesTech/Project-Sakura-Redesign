import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import {
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


import {
  PostCard,
  DepartmentChannels,
  OnlineUsers,
  TrendingTopics,
  UpcomingEvents,
  type Post,
  type DepartmentChannel,
  type OnlineUser,
  type TrendingTopic,
  type UpcomingEvent
} from "@/components/intranet";

// Local interface for department data from API
interface Department {
  id: number | string;
  name: string;
  description?: string | null;
  color?: string;
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


export default function Dashboard() {
  const [activeChannel, setActiveChannel] = useState<string>("all");
  const [feedFilter, setFeedFilter] = useState<"all" | "following" | "department">("all");
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const channels: DepartmentChannel[] = departments.map(dept => ({
    id: dept.id.toString(),
    name: dept.name,
    color: dept.color || '#7c3aed',
    memberCount: 12,
    isFavorite: false,
  }));

  const handleLike = (postId: string) => {
    console.log("Like post:", postId);
    // TODO: Implement like via API
  };

  const handleComment = (postId: string, content: string) => {
    console.log("Comment on post:", postId, content);
    // TODO: Implement comment via API
  };


  return (
    <Layout>
      <div className="space-y-6">

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
              users={mockOnlineUsers}
              onMessageUser={(id) => console.log("Message user:", id)}
            />

            <TrendingTopics
              topics={mockTrendingTopics}
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
