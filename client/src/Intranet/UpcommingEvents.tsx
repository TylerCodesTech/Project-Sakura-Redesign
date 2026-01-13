import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    ChevronRight,
    PartyPopper,
    Video,
    Briefcase,
    GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";

export interface UpcomingEvent {
    id: string;
    title: string;
    type: "meeting" | "celebration" | "training" | "deadline" | "other";
    date: string;
    time?: string;
    location?: string;
    attendeesCount?: number;
    isAttending?: boolean;
}

interface UpcomingEventsProps {
    events: UpcomingEvent[];
    onEventClick?: (eventId: string) => void;
    onRSVP?: (eventId: string) => void;
}

export function UpcomingEvents({ events, onEventClick, onRSVP }: UpcomingEventsProps) {
    const getEventIcon = (type: UpcomingEvent["type"]) => {
        switch (type) {
            case "meeting": return Video;
            case "celebration": return PartyPopper;
            case "training": return GraduationCap;
            case "deadline": return Briefcase;
            default: return Calendar;
        }
    };

    const getEventColor = (type: UpcomingEvent["type"]) => {
        switch (type) {
            case "meeting": return "bg-blue-500/10 text-blue-500";
            case "celebration": return "bg-amber-500/10 text-amber-500";
            case "training": return "bg-violet-500/10 text-violet-500";
            case "deadline": return "bg-rose-500/10 text-rose-500";
            default: return "bg-primary/10 text-primary";
        }
    };

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return "Today";
        if (isTomorrow(date)) return "Tomorrow";
        const daysUntil = differenceInDays(date, new Date());
        if (daysUntil <= 7) return `In ${daysUntil} days`;
        return format(date, "MMM d");
    };

    return (
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-violet-500/10 rounded-lg">
                            <Calendar className="w-4 h-4 text-violet-500" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Upcoming Events</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-medium text-primary hover:bg-primary/5">
                        View All
                        <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                </div>
            </div>

            <div className="p-3 space-y-2">
                {events.slice(0, 4).map((event) => {
                    const Icon = getEventIcon(event.type);
                    return (
                        <button
                            key={event.id}
                            onClick={() => onEventClick?.(event.id)}
                            className="w-full p-3 rounded-xl hover:bg-secondary/40 transition-colors group text-left"
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl shrink-0",
                                    getEventColor(event.type)
                                )}>
                                    <Icon className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                        {event.title}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {getDateLabel(event.date)}
                                            {event.time && ` · ${event.time}`}
                                        </span>

                                        {event.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {event.location}
                                            </span>
                                        )}

                                        {event.attendeesCount && (
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {event.attendeesCount} attending
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!event.isAttending && onRSVP && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs font-medium shrink-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRSVP(event.id);
                                        }}
                                    >
                                        RSVP
                                    </Button>
                                )}

                                {event.isAttending && (
                                    <Badge variant="secondary" className="h-5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30 shrink-0">
                                        Going
                                    </Badge>
                                )}
                            </div>
                        </button>
                    );
                })}

                {events.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No upcoming events
                    </div>
                )}
            </div>
        </div>
    );
}
