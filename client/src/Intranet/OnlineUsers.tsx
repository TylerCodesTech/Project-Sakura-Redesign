import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    MessageCircle,
    Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnlineUser {
    id: string;
    name: string;
    avatar?: string;
    department?: string;
    status: "online" | "away" | "busy" | "offline";
    statusMessage?: string;
}

interface OnlineUsersProps {
    users: OnlineUser[];
    onMessageUser?: (userId: string) => void;
    maxVisible?: number;
}

export function OnlineUsers({ users, onMessageUser, maxVisible = 8 }: OnlineUsersProps) {
    const onlineUsers = users.filter(u => u.status !== "offline");
    const visibleUsers = onlineUsers.slice(0, maxVisible);
    const remainingCount = onlineUsers.length - maxVisible;

    const getStatusColor = (status: OnlineUser["status"]) => {
        switch (status) {
            case "online": return "bg-emerald-500";
            case "away": return "bg-amber-500";
            case "busy": return "bg-rose-500";
            default: return "bg-gray-400";
        }
    };

    return (
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">Online Now</h3>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            {onlineUsers.length}
                        </Badge>
                    </div>
                </div>
            </div>

            <ScrollArea className="h-[280px]">
                <div className="p-3 space-y-1">
                    {visibleUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/40 transition-colors group cursor-pointer"
                        >
                            <div className="relative">
                                <Avatar className="h-9 w-9 border border-border/50">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
                                    getStatusColor(user.status)
                                )} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                {user.statusMessage ? (
                                    <p className="text-[10px] text-muted-foreground truncate">{user.statusMessage}</p>
                                ) : user.department && (
                                    <p className="text-[10px] text-muted-foreground truncate">{user.department}</p>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onMessageUser?.(user.id)}
                            >
                                <MessageCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    {remainingCount > 0 && (
                        <button className="w-full flex items-center justify-center gap-2 p-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                            <div className="flex -space-x-2">
                                {onlineUsers.slice(maxVisible, maxVisible + 3).map((user) => (
                                    <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                                        <AvatarFallback className="text-[8px] bg-secondary">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            +{remainingCount} more online
                        </button>
                    )}
                </div>
            </ScrollArea>

            {/* Status Legend */}
            <div className="p-3 border-t border-border/30 bg-secondary/10">
                <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                        Online
                    </span>
                    <span className="flex items-center gap-1">
                        <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
                        Away
                    </span>
                    <span className="flex items-center gap-1">
                        <Circle className="w-2 h-2 fill-rose-500 text-rose-500" />
                        Busy
                    </span>
                </div>
            </div>
        </div>
    );
}
