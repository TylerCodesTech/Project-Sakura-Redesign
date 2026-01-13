import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    Hash,
    Search,
    Plus,
    ChevronDown,
    ChevronRight,
    Star,
    Bell,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface DepartmentChannel {
    id: string;
    name: string;
    color?: string;
    memberCount?: number;
    unreadCount?: number;
    isFavorite?: boolean;
    isActive?: boolean;
}

interface DepartmentChannelsProps {
    channels: DepartmentChannel[];
    activeChannelId?: string;
    onChannelSelect?: (channelId: string) => void;
    onToggleFavorite?: (channelId: string) => void;
}

export function DepartmentChannels({
    channels,
    activeChannelId,
    onChannelSelect,
    onToggleFavorite
}: DepartmentChannelsProps) {
    const [search, setSearch] = useState("");
    const [isAllOpen, setIsAllOpen] = useState(true);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);

    const favoriteChannels = channels.filter(c => c.isFavorite);
    const allChannels = channels.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/30">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">Channels</h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Find channels..."
                        className="h-8 pl-8 text-xs rounded-lg bg-secondary/30 border-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-2">
                    {/* Favorites Section */}
                    {favoriteChannels.length > 0 && (
                        <Collapsible open={isFavoritesOpen} onOpenChange={setIsFavoritesOpen}>
                            <CollapsibleTrigger className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full">
                                {isFavoritesOpen ? (
                                    <ChevronDown className="w-3 h-3" />
                                ) : (
                                    <ChevronRight className="w-3 h-3" />
                                )}
                                <Star className="w-3 h-3" />
                                Favorites
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-0.5 mt-1">
                                {favoriteChannels.map((channel) => (
                                    <ChannelItem
                                        key={channel.id}
                                        channel={channel}
                                        isActive={activeChannelId === channel.id}
                                        onSelect={() => onChannelSelect?.(channel.id)}
                                        onToggleFavorite={() => onToggleFavorite?.(channel.id)}
                                    />
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    )}

                    {/* All Channels Section */}
                    <Collapsible open={isAllOpen} onOpenChange={setIsAllOpen}>
                        <CollapsibleTrigger className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full">
                            {isAllOpen ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : (
                                <ChevronRight className="w-3 h-3" />
                            )}
                            All Departments
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-0.5 mt-1">
                            {allChannels.map((channel) => (
                                <ChannelItem
                                    key={channel.id}
                                    channel={channel}
                                    isActive={activeChannelId === channel.id}
                                    onSelect={() => onChannelSelect?.(channel.id)}
                                    onToggleFavorite={() => onToggleFavorite?.(channel.id)}
                                />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Company-wide Channel */}
                    <div className="pt-2 border-t border-border/30 mt-2">
                        <ChannelItem
                            channel={{
                                id: "all",
                                name: "All Company",
                                color: "#db2777",
                                memberCount: channels.reduce((acc, c) => acc + (c.memberCount || 0), 0),
                            }}
                            isActive={activeChannelId === "all" || !activeChannelId}
                            onSelect={() => onChannelSelect?.("all")}
                            isCompanyWide
                        />
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

interface ChannelItemProps {
    channel: DepartmentChannel;
    isActive?: boolean;
    isCompanyWide?: boolean;
    onSelect?: () => void;
    onToggleFavorite?: () => void;
}

function ChannelItem({ channel, isActive, isCompanyWide, onSelect, onToggleFavorite }: ChannelItemProps) {
    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm transition-all group",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
        >
            <div
                className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    isCompanyWide && "w-6 h-6 rounded-lg flex items-center justify-center"
                )}
                style={{ backgroundColor: channel.color || '#7c3aed' }}
            >
                {isCompanyWide && <Users className="w-3.5 h-3.5 text-white" />}
            </div>

            <span className={cn(
                "flex-1 text-left truncate font-medium",
                isActive && "font-bold"
            )}>
                {isCompanyWide ? channel.name : `# ${channel.name.toLowerCase().replace(/\s+/g, '-')}`}
            </span>

            <div className="flex items-center gap-1">
                {channel.unreadCount && channel.unreadCount > 0 && (
                    <Badge
                        variant="default"
                        className="h-5 min-w-5 px-1.5 text-[10px] font-bold"
                    >
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                    </Badge>
                )}

                {!isCompanyWide && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite?.();
                        }}
                    >
                        <Star className={cn(
                            "w-3 h-3",
                            channel.isFavorite && "fill-amber-400 text-amber-400"
                        )} />
                    </Button>
                )}
            </div>
        </button>
    );
}
