import { 
  X, 
  MoreHorizontal, 
  FileText, 
  BookOpen, 
  Folder, 
  ExternalLink, 
  Share2, 
  Star,
  User,
  Calendar,
  Eye,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import type { Book, Page } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";

type SidebarItem = {
  id: string;
  title: string;
  itemType: 'book' | 'page' | 'folder';
  description?: string | null;
  content?: string;
  status?: string;
  authorId?: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
};

interface DetailsSidebarProps {
  item: SidebarItem | null;
  onClose: () => void;
  isOpen: boolean;
}

export function DetailsSidebar({ item, onClose, isOpen }: DetailsSidebarProps) {
  if (!item) return null;

  const isBook = item.itemType === 'book';
  const isFolder = item.itemType === 'folder';
  const Icon = isBook ? BookOpen : isFolder ? Folder : FileText;
  const colorClass = isBook ? 'text-emerald-500 bg-emerald-500/10' : 
                     isFolder ? 'text-blue-500 bg-blue-500/10' : 
                     'text-indigo-500 bg-indigo-500/10';
  
  const typeLabel = isBook ? 'WikiBook' : isFolder ? 'Folder' : 'Document';
  const href = isBook ? `/documents/book/${item.id}` : 
               isFolder ? '#' : `/documents/edit/${item.id}`;

  const updatedAt = item.updatedAt ? new Date(item.updatedAt) : new Date();
  const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();
  const status = 'status' in item ? item.status : undefined;
  const description = 'description' in item ? item.description : undefined;

  const contentSize = !isFolder && 'content' in item && item.content 
    ? `${Math.round(new Blob([item.content]).size / 1024)}KB` 
    : '0KB';

  const activities = [
    {
      action: 'You viewed this file',
      time: 'Just now',
      color: 'bg-pink-400'
    },
    {
      action: 'Current User modified',
      time: format(updatedAt, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
      color: 'bg-pink-400'
    }
  ];

  return (
    <div 
      className={cn(
        "fixed right-0 top-0 h-full w-[340px] bg-background/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50 transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold tracking-tight">Details</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
              colorClass
            )}>
              <Icon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {typeLabel} • {contentSize}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {!isFolder && (
              <Link href={href} className="flex-1">
                <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </Link>
            )}
            <Button variant="outline" className="rounded-xl border-border/50 font-bold gap-2 px-4">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl border-border/50 shrink-0">
              <Star className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    Owner
                  </div>
                  <p className="text-sm font-medium">Current User</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Modified
                  </div>
                  <p className="text-sm font-medium">{format(updatedAt, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'')}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Activity
              </h4>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className={cn("w-2 h-2 rounded-full", activity.color)} />
                      {index < activities.length - 1 && (
                        <div className="w-px h-full bg-border/50 absolute top-3" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {status && (
              <>
                <Separator className="bg-border/50" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Status
                  </h4>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-bold",
                      status === 'published' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      status === 'draft' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                      status === 'in_review' && "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
              </>
            )}

            {description && (
              <>
                <Separator className="bg-border/50" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
