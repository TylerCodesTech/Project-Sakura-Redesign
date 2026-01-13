import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Ticket, 
  Clock, 
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { type Ticket as TicketType, type Department, type User as UserType } from "@shared/schema";

interface TicketSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTicket: (ticketId: string) => void;
}

export function TicketSearchCommand({ open, onOpenChange, onSelectTicket }: TicketSearchCommandProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<TicketType[]>([]);

  const { data: tickets = [] } = useQuery<TicketType[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const getDepartment = (id: string | null) => departments.find(d => d.id === id);
  const getUser = (id: string | null | undefined) => users.find(u => u.id === id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-600";
      case "high": return "bg-orange-500/10 text-orange-600";
      case "medium": return "bg-yellow-500/10 text-yellow-600";
      case "low": return "bg-green-500/10 text-green-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const performSemanticSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSemanticResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/ai/search-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const results = await response.json();
        setSemanticResults(results);
      }
    } catch (error) {
      console.error("Semantic search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 3) {
        performSemanticSearch(query);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, performSemanticSearch]);

  const basicFilteredTickets = tickets.filter(ticket => {
    if (!query) return true;
    const searchLower = query.toLowerCase();
    return (
      ticket.title.toLowerCase().includes(searchLower) ||
      ticket.description?.toLowerCase().includes(searchLower) ||
      getDepartment(ticket.departmentId)?.name.toLowerCase().includes(searchLower) ||
      getUser(ticket.assignedTo)?.username.toLowerCase().includes(searchLower)
    );
  }).slice(0, 10);

  const displayedTickets = semanticResults.length > 0 ? semanticResults : basicFilteredTickets;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search tickets... (e.g., 'my printer issue from last week')" 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isSearching ? (
          <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching with AI...
          </div>
        ) : (
          <>
            <CommandEmpty>No tickets found.</CommandEmpty>
            
            {semanticResults.length > 0 && (
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI-powered results
              </div>
            )}

            <CommandGroup heading={semanticResults.length > 0 ? "" : "Recent Tickets"}>
              {displayedTickets.map((ticket) => (
                <CommandItem
                  key={ticket.id}
                  value={ticket.id}
                  onSelect={() => {
                    onSelectTicket(ticket.id);
                    onOpenChange(false);
                    setQuery("");
                  }}
                  className="flex items-start gap-3 py-3"
                >
                  <Ticket className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{ticket.title}</span>
                      <Badge className={cn("text-xs capitalize flex-shrink-0", getPriorityColor(ticket.priority))}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getDepartment(ticket.departmentId)?.name || "No department"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="border-t p-2 text-xs text-muted-foreground text-center">
        Press <kbd className="bg-muted px-1 py-0.5 rounded">⌘K</kbd> to toggle search
      </div>
    </CommandDialog>
  );
}
