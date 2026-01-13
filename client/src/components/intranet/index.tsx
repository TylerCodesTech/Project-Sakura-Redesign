import React from 'react';

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    department: string;
  };
  content: string;
  visibility: string;
  hashtags?: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isPinned?: boolean;
  comments?: any[];
}

export interface DepartmentChannel {
  id: string;
  name: string;
  color: string;
  memberCount: number;
  isFavorite: boolean;
}

export interface OnlineUser {
  id: string;
  name: string;
  department: string;
  status: 'online' | 'away' | 'busy';
  statusMessage?: string;
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

export const PostComposer = (props: any) => <div className="p-4 bg-card rounded-xl border border-border">Post Composer Placeholder</div>;
export const PostCard = (props: any) => <div className="p-4 bg-card rounded-xl border border-border">Post Card Placeholder</div>;
export const DepartmentChannels = (props: any) => <div className="p-4 bg-card rounded-xl border border-border">Department Channels Placeholder</div>;
export const OnlineUsers = (props: any) => <div className="p-4 bg-card rounded-xl border border-border">Online Users Placeholder</div>;
export const TrendingTopics = (props: any) => <div className="p-4 bg-card rounded-xl border border-border">Trending Topics Placeholder</div>;
export const UpcomingEvents = (props: any) => <div className="p-4 bg-card rounded-xl border border-border">Upcoming Events Placeholder</div>;
export const AnnouncementsBanner = (props: any) => <div className="p-4 bg-card rounded-xl border border-border">Announcements Banner Placeholder</div>;
