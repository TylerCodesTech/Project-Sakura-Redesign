import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrendingTopic {
    id: string;
    tag: string;
    postCount: number;
    trend: "up" | "stable" | "new";
}

interface TrendingTopicsProps {
    topics: TrendingTopic[];
    onTopicClick?: (tag: string) => void;
}

export function TrendingTopics({ topics, onTopicClick }: TrendingTopicsProps) {
    return (
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-500/10 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-rose-500" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Trending Topics</h3>
                </div>
            </div>

            <div className="p-3 space-y-1">
                {topics.slice(0, 5).map((topic, index) => (
                    <button
                        key={topic.id}
                        onClick={() => onTopicClick?.(topic.tag)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 transition-colors group text-left"
                    >
                        <span className="text-xs font-bold text-muted-foreground w-4">
                            {index + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                    {topic.tag}
                                </span>
                                {topic.trend === "new" && (
                                    <Badge variant="secondary" className="h-4 px-1 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                        NEW
                                    </Badge>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {topic.postCount} posts
                            </p>
                        </div>

                        {topic.trend === "up" && (
                            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
