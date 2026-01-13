import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    X,
    AlertTriangle,
    Info,
    Megaphone,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "urgent";
    link?: string;
    createdAt: string;
    expiresAt?: string;
}

interface AnnouncementsBannerProps {
    announcements: Announcement[];
    onDismiss?: (id: string) => void;
    onLearnMore?: (announcement: Announcement) => void;
}

export function AnnouncementsBanner({ announcements, onDismiss, onLearnMore }: AnnouncementsBannerProps) {
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    const visibleAnnouncements = announcements.filter(a => !dismissedIds.has(a.id));

    if (visibleAnnouncements.length === 0) return null;

    // Show the most important one (urgent first, then warning, then info)
    const sortedAnnouncements = [...visibleAnnouncements].sort((a, b) => {
        const priority = { urgent: 0, warning: 1, info: 2 };
        return priority[a.type] - priority[b.type];
    });

    const currentAnnouncement = sortedAnnouncements[0];

    const handleDismiss = (id: string) => {
        setDismissedIds(prev => new Set(Array.from(prev).concat(id)));
        onDismiss?.(id);
    };

    const getAnnouncementStyles = (type: Announcement["type"]) => {
        switch (type) {
            case "urgent":
                return {
                    container: "bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30",
                    icon: "bg-rose-500/20 text-rose-500",
                    IconComponent: AlertTriangle,
                };
            case "warning":
                return {
                    container: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30",
                    icon: "bg-amber-500/20 text-amber-500",
                    IconComponent: AlertTriangle,
                };
            default:
                return {
                    container: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30",
                    icon: "bg-primary/20 text-primary",
                    IconComponent: Megaphone,
                };
        }
    };

    const styles = getAnnouncementStyles(currentAnnouncement.type);
    const Icon = styles.IconComponent;

    return (
        <div className={cn(
            "rounded-2xl border p-4 backdrop-blur-md transition-all duration-300",
            styles.container
        )}>
            <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-xl shrink-0", styles.icon)}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold">{currentAnnouncement.title}</h4>
                        {currentAnnouncement.type === "urgent" && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 animate-pulse">
                                Urgent
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{currentAnnouncement.message}</p>

                    {currentAnnouncement.link && (
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2 text-xs font-bold"
                            onClick={() => onLearnMore?.(currentAnnouncement)}
                        >
                            Learn more
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {visibleAnnouncements.length > 1 && (
                        <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                            +{visibleAnnouncements.length - 1} more
                        </span>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg shrink-0"
                        onClick={() => handleDismiss(currentAnnouncement.id)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
