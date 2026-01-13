import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Hash,
  Calendar,
  MapPin,
  Users,
  Star,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    department: string;
    avatar?: string;
  };
  content: string;
  visibility: string;
  hashtags?: string[];
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isPinned?: boolean;
  comments?: {
    id: string;
    author: { id: string; name: string; avatar?: string };
    content: string;
    createdAt: string;
  }[];
}

export interface DepartmentChannel {
  id: string;
  name: string;
  color: string;
  memberCount: number;
  isFavorite: boolean;
  icon?: React.ReactNode;
}

export interface OnlineUser {
  id: string;
  name: string;
  department: string;
  status: 'online' | 'away' | 'busy';
  statusMessage?: string;
  avatar?: string;
}

export interface TrendingTopic {
  id: string;
  tag: string;
  postCount: number;
  trend: 'up' | 'down' | 'stable' | 'new';
}

export interface UpcomingEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  isAttending?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  link: string;
  createdAt: string;
}

interface PostComposerProps {
  onPost: (content: string, visibility: string, departmentId?: string) => void;
  departments: { id: string; name: string; color: string }[];
}

export function PostComposer({ onPost, departments }: PostComposerProps) {
  return null;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  currentUserId?: string;
}

export function PostCard({ post, onLike, onComment, onShare, onBookmark, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm font-bold">
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-sm">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false })} ago
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm leading-relaxed">{post.content}</p>
          
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag) => (
                <span key={tag} className="text-primary text-sm font-medium hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.imageUrl && (
            <div className="rounded-xl overflow-hidden mt-3">
              <img 
                src={post.imageUrl} 
                alt="Post attachment" 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLike(post.id)}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              post.isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
            )}
          >
            <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
            <span className="font-medium">{post.likesCount}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">{post.commentsCount}</span>
          </button>
          <button 
            onClick={() => onShare(post.id)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="font-medium">{post.sharesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface DepartmentChannelsProps {
  channels: DepartmentChannel[];
  activeChannelId: string;
  onChannelSelect: (channelId: string) => void;
  onToggleFavorite: (channelId: string) => void;
}

export function DepartmentChannels({ channels, activeChannelId, onChannelSelect, onToggleFavorite }: DepartmentChannelsProps) {
  const getDepartmentIcon = (name: string) => {
    switch(name.toLowerCase()) {
      case 'marketing':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'engineering':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'hr':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return <Hash className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
      <h3 className="text-sm font-bold mb-4">Department Channels</h3>
      <div className="space-y-1">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
              activeChannelId === channel.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              activeChannelId === channel.id ? "bg-primary/20" : "bg-secondary/50"
            )}>
              {getDepartmentIcon(channel.name)}
            </div>
            <span className="flex-1 text-sm font-medium">{channel.name}</span>
            {channel.isFavorite && (
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface OnlineUsersProps {
  users: OnlineUser[];
  onMessageUser: (userId: string) => void;
}

export function OnlineUsers({ users, onMessageUser }: OnlineUsersProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: OnlineUser['status']) => {
    switch(status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      case 'busy': return 'bg-rose-500';
    }
  };

  const onlineCount = users.filter(u => u.status === 'online').length;

  return (
    <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
      <h3 className="text-sm font-bold mb-4">Online Team Members</h3>
      <div className="grid grid-cols-4 gap-2">
        {users.slice(0, 8).map((user) => (
          <button
            key={user.id}
            onClick={() => onMessageUser(user.id)}
            className="relative group"
          >
            <Avatar className="h-10 w-10 border-2 border-border group-hover:border-primary/50 transition-colors">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
              getStatusColor(user.status)
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  onTopicClick: (tag: string) => void;
}

export function TrendingTopics({ topics, onTopicClick }: TrendingTopicsProps) {
  return (
    <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
      <h3 className="text-sm font-bold mb-4">Trending Topics</h3>
      <div className="space-y-2">
        {topics.slice(0, 5).map((topic) => (
          <button
            key={topic.id}
            onClick={() => onTopicClick(topic.tag)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-primary font-medium text-sm">#{topic.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface UpcomingEventsProps {
  events: UpcomingEvent[];
  onEventClick: (eventId: string) => void;
  onRSVP: (eventId: string) => void;
}

export function UpcomingEvents({ events, onEventClick, onRSVP }: UpcomingEventsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getEndDate = (dateStr: string, daysAfter: number = 5) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + daysAfter);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
      <h3 className="text-sm font-bold mb-4">Upcoming Events</h3>
      <div className="space-y-3">
        {events.slice(0, 3).map((event) => (
          <button
            key={event.id}
            onClick={() => onEventClick(event.id)}
            className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-1 h-full min-h-[40px] bg-primary rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(event.date)} - {getEndDate(event.date)}
              </p>
            </div>
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-muted-foreground">
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface AnnouncementsBannerProps {
  announcements: Announcement[];
  onDismiss: (announcementId: string) => void;
}

export function AnnouncementsBanner({ announcements, onDismiss }: AnnouncementsBannerProps) {
  if (announcements.length === 0) return null;
  
  return null;
}
