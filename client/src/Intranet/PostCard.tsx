import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Bookmark,
    Flag,
    Pin,
    Trash2,
    Edit,
    Globe,
    Building2,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Post {
    id: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        department?: string;
    };
    content: string;
    mediaUrls?: string[];
    visibility: "public" | "department";
    departmentName?: string;
    hashtags?: string[];
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    isPinned?: boolean;
    comments?: Comment[];
}

interface Comment {
    id: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    content: string;
    createdAt: string;
}

interface PostCardProps {
    post: Post;
    onLike?: (postId: string) => void;
    onComment?: (postId: string, content: string) => void;
    onShare?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    onDelete?: (postId: string) => void;
    currentUserId?: string;
}

export function PostCard({
    post,
    onLike,
    onComment,
    onShare,
    onBookmark,
    onDelete,
    currentUserId
}: PostCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likesCount, setLikesCount] = useState(post.likesCount);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        onLike?.(post.id);
    };

    const handleComment = () => {
        if (!newComment.trim()) return;
        onComment?.(post.id, newComment);
        setNewComment("");
    };

    const isAuthor = currentUserId === post.author.id;

    return (
        <div className="bg-white/80 dark:bg-card/80 backdrop-blur-md rounded-3xl border border-border/50 overflow-hidden hover:border-primary/20 transition-all duration-300 group">
            {/* Post Header */}
            <div className="p-4 pb-0">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {post.author.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-sm hover:text-primary cursor-pointer transition-colors">
                                    {post.author.name}
                                </p>
                                {post.isPinned && (
                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                                        <Pin className="w-3 h-3 mr-1" />
                                        Pinned
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {post.author.department && (
                                    <>
                                        <span className="font-medium">{post.author.department}</span>
                                        <span>·</span>
                                    </>
                                )}
                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    {post.visibility === "public" ? (
                                        <Globe className="w-3 h-3" />
                                    ) : (
                                        <Building2 className="w-3 h-3" />
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={() => onBookmark?.(post.id)}>
                                <Bookmark className="w-4 h-4" />
                                {post.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                            </DropdownMenuItem>
                            {isAuthor && (
                                <>
                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                        <Edit className="w-4 h-4" />
                                        Edit Post
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                        <Pin className="w-4 h-4" />
                                        {post.isPinned ? "Unpin" : "Pin to Profile"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive"
                                        onClick={() => onDelete?.(post.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                            {!isAuthor && (
                                <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-amber-600">
                                    <Flag className="w-4 h-4" />
                                    Report
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Post Content */}
            <div className="p-4 pt-3">
                <div className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.content}</div>

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {post.hashtags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs font-medium text-primary hover:underline cursor-pointer"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Media */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className={cn(
                        "mt-3 rounded-2xl overflow-hidden",
                        post.mediaUrls.length === 1 && "grid grid-cols-1",
                        post.mediaUrls.length === 2 && "grid grid-cols-2 gap-1",
                        post.mediaUrls.length >= 3 && "grid grid-cols-2 gap-1"
                    )}>
                        {post.mediaUrls.slice(0, 4).map((url, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "relative bg-secondary/30",
                                    post.mediaUrls!.length === 1 && "aspect-video",
                                    post.mediaUrls!.length >= 2 && "aspect-square",
                                    post.mediaUrls!.length === 3 && i === 0 && "row-span-2 aspect-auto"
                                )}
                            >
                                <img
                                    src={url}
                                    alt={`Post media ${i + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {i === 3 && post.mediaUrls!.length > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-bold text-2xl">
                                            +{post.mediaUrls!.length - 4}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Engagement Stats */}
            {(likesCount > 0 || post.commentsCount > 0 || post.sharesCount > 0) && (
                <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30">
                    <div className="flex items-center gap-4">
                        {likesCount > 0 && (
                            <span className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                                    <Heart className="w-2.5 h-2.5 text-white fill-white" />
                                </div>
                                {likesCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {post.commentsCount > 0 && (
                            <button
                                className="hover:underline"
                                onClick={() => setShowComments(!showComments)}
                            >
                                {post.commentsCount} comments
                            </button>
                        )}
                        {post.sharesCount > 0 && (
                            <span>{post.sharesCount} shares</span>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="px-4 py-2 flex items-center gap-1 border-t border-border/30">
                <Button
                    variant="ghost"
                    className={cn(
                        "flex-1 h-10 rounded-xl gap-2 font-medium",
                        isLiked && "text-rose-500 hover:text-rose-600"
                    )}
                    onClick={handleLike}
                >
                    <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                    Like
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 h-10 rounded-xl gap-2 font-medium"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle className="w-5 h-5" />
                    Comment
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 h-10 rounded-xl gap-2 font-medium"
                    onClick={() => onShare?.(post.id)}
                >
                    <Share2 className="w-5 h-5" />
                    Share
                </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 pb-4 border-t border-border/30">
                    {/* Existing Comments */}
                    {post.comments && post.comments.length > 0 && (
                        <ScrollArea className="max-h-[200px] mt-3">
                            <div className="space-y-3">
                                {post.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-2">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarImage src={comment.author.avatar} />
                                            <AvatarFallback className="text-xs bg-secondary">
                                                {comment.author.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-secondary/40 rounded-2xl px-3 py-2">
                                            <p className="text-xs font-bold">{comment.author.name}</p>
                                            <p className="text-sm">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    {/* New Comment Input */}
                    <div className="flex gap-2 mt-3">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                U
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Write a comment..."
                                className="h-9 rounded-full pr-10 bg-secondary/30 border-0"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                                onClick={handleComment}
                                disabled={!newComment.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
