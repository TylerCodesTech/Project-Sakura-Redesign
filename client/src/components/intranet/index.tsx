import React, { useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
  Sparkles,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ExternalLink,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  AtSign,
  Send,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";

interface Comment {
  id: string;
  author: { id: string; name: string; department?: string };
  content: string;
  createdAt: string;
}

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
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string | null;
  createdAt: string;
}

interface PostComposerProps {
  onPost: (content: string, visibility: string, departmentId?: string) => void;
  departments: { id: string; name: string; color: string }[];
}

export function PostComposer({ onPost }: PostComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: "What's happening at your department?",
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[60px] text-sm',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const result = e.target?.result as string;
                  if (result && editor) {
                    editor.chain().focus().setImage({ src: result }).run();
                  }
                };
                reader.readAsDataURL(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onFocus: () => setIsExpanded(true),
  });

  const handleSubmit = () => {
    if (!editor) return;
    const html = editor.getHTML();
    if (html === '<p></p>' || !html.trim()) return;
    onPost(html, 'public');
    editor.commands.clearContent();
    setIsExpanded(false);
  };

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children,
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-lg transition-colors",
        isActive 
          ? "bg-primary/20 text-primary" 
          : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm font-bold">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <EditorContent 
              editor={editor} 
              className="w-full [&_.ProseMirror]:min-h-[60px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
            />
          </div>
        </div>

        {isExpanded && editor && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 flex-wrap">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
              >
                <UnderlineIcon className="w-4 h-4" />
              </ToolbarButton>
              
              <div className="w-px h-5 bg-border/50 mx-1" />
              
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              
              <div className="w-px h-5 bg-border/50 mx-1" />
              
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
              
              <div className="w-px h-5 bg-border/50 mx-1" />
              
              <ToolbarButton
                onClick={addLink}
                isActive={editor.isActive('link')}
                title="Add Link"
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={addImage}
                title="Add Image"
              >
                <ImageIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const mention = window.prompt('Enter @mention:');
                  if (mention) {
                    editor.chain().focus().insertContent(`@${mention} `).run();
                  }
                }}
                title="Mention Someone"
              >
                <AtSign className="w-4 h-4" />
              </ToolbarButton>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Tip: Paste images directly, use #hashtags
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    editor.commands.clearContent();
                  }}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!editor || editor.isEmpty}
                  size="sm"
                  className="h-8 px-4 text-xs bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: showComments,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/posts/${post.id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewComment("");
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
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
          <div 
            className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_img]:rounded-xl [&_img]:max-w-full [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
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
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              showComments ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <MessageCircle className={cn("w-4 h-4", showComments && "fill-current")} />
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

      {showComments && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs font-bold">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 h-9 text-sm rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
                className="h-9 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {isLoadingComments ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-border/50 shrink-0">
                    <AvatarFallback className="bg-secondary text-xs font-bold">
                      {getInitials(comment.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-secondary/50 rounded-xl px-3 py-2">
                      <p className="text-sm font-semibold">{comment.author.name}</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DepartmentChannelsProps {
  channels: DepartmentChannel[];
  activeChannelId: string;
  onChannelSelect: (channelId: string) => void;
  onToggleFavorite: (channelId: string) => void;
  companyName?: string;
  userDepartment?: string;
}

export function DepartmentChannels({ channels, activeChannelId, onChannelSelect, onToggleFavorite, companyName = "Company", userDepartment }: DepartmentChannelsProps) {
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

  const userDeptChannel = channels.find(c => c.name === userDepartment);
  const otherChannels = channels.filter(c => c.name !== userDepartment);

  return (
    <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
      <h3 className="text-sm font-bold mb-4">Channels</h3>
      <div className="space-y-1">
        <button
          onClick={() => onChannelSelect("company")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
            activeChannelId === "company"
              ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-primary border border-primary/20"
              : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            activeChannelId === "company" 
              ? "bg-gradient-to-br from-pink-500 to-rose-500" 
              : "bg-gradient-to-br from-pink-500/50 to-rose-500/50"
          )}>
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold block">{companyName}</span>
            <span className="text-[10px] text-muted-foreground">Company-wide</span>
          </div>
        </button>

        {userDeptChannel && (
          <>
            <div className="h-px bg-border/50 my-2" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1">Your Department</p>
            <button
              onClick={() => onChannelSelect(userDeptChannel.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
                activeChannelId === userDeptChannel.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                activeChannelId === userDeptChannel.id ? "bg-primary/20" : "bg-secondary/50"
              )}>
                {getDepartmentIcon(userDeptChannel.name)}
              </div>
              <span className="flex-1 text-sm font-medium">{userDeptChannel.name}</span>
              {userDeptChannel.isFavorite && (
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              )}
            </button>
          </>
        )}

        {otherChannels.length > 0 && (
          <>
            <div className="h-px bg-border/50 my-2" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1">Other Departments</p>
            {otherChannels.map((channel) => (
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
          </>
        )}
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
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Trending in Your Department
      </h3>
      {topics.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No trending searches yet. Start searching to see what's popular!
        </p>
      ) : (
        <div className="space-y-2">
          {topics.slice(0, 5).map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicClick(topic.tag)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
            >
              <span className="text-primary font-medium text-sm">#{topic.tag}</span>
              <span className="text-xs text-muted-foreground">{topic.postCount} searches</span>
            </button>
          ))}
        </div>
      )}
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

  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          text: 'text-amber-800 dark:text-amber-200'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-500/10',
          border: 'border-red-200 dark:border-red-500/30',
          icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
          text: 'text-red-800 dark:text-red-200'
        };
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-500/10',
          border: 'border-emerald-200 dark:border-emerald-500/30',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          text: 'text-emerald-800 dark:text-emerald-200'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-500/10',
          border: 'border-blue-200 dark:border-blue-500/30',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          text: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  return (
    <div className="space-y-2">
      {announcements.map((announcement) => {
        const styles = getTypeStyles(announcement.type);
        return (
          <div
            key={announcement.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border",
              styles.bg,
              styles.border
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-semibold text-sm", styles.text)}>
                {announcement.title}
              </p>
              <p className={cn("text-sm mt-0.5 opacity-90", styles.text)}>
                {announcement.message}
              </p>
              {announcement.link && (
                <a
                  href={announcement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1 text-xs mt-2 font-medium hover:underline",
                    styles.text
                  )}
                >
                  Learn more <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <button
              onClick={() => onDismiss(announcement.id)}
              className={cn(
                "flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
                styles.text
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
