import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Folder, 
  Book, 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface DocItem {
  id: string;
  type: 'file' | 'folder' | 'book';
  name: string;
  updatedAt: string;
  owner: string;
  size?: string;
  pages?: number;
}

const mockDocs: DocItem[] = [
  { id: '1', type: 'folder', name: 'Engineering', updatedAt: '2 hours ago', owner: 'Tyler S.' },
  { id: '2', type: 'book', name: 'Product Handbook', updatedAt: '5 hours ago', owner: 'Sarah M.', pages: 24 },
  { id: '3', type: 'file', name: 'Q4 Revenue Projection.pdf', updatedAt: 'Yesterday', owner: 'Mike R.', size: '2.4 MB' },
  { id: '4', type: 'folder', name: 'Marketing Assets', updatedAt: '3 days ago', owner: 'Alex J.' },
  { id: '5', type: 'book', name: 'API Reference', updatedAt: '1 week ago', owner: 'Engineering Team', pages: 156 },
  { id: '6', type: 'file', name: 'Brand Guidelines.docx', updatedAt: '2 weeks ago', owner: 'Design Team', size: '15.2 MB' },
];

export default function Documents() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Documents</h1>
            <p className="text-muted-foreground text-lg">Manage files, folders, and structured books.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary/30 p-1 rounded-xl border border-border/50">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-lg", view === 'grid' && "bg-background shadow-sm")}
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-lg", view === 'list' && "bg-background shadow-sm")}
                onClick={() => setView('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search across documents and content..." 
              className="pl-12 h-12 bg-white/50 dark:bg-card/40 border-border/50 rounded-2xl focus-visible:ring-primary/20 transition-all"
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-border/50 bg-white/50 dark:bg-card/40 font-bold gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Document Grid/List */}
        <div className={cn(
          "grid gap-6",
          view === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {mockDocs.map((item) => (
            <DocCard key={item.id} item={item} view={view} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

function DocCard({ item, view }: { item: DocItem, view: 'grid' | 'list' }) {
  const Icon = item.type === 'folder' ? Folder : item.type === 'book' ? Book : FileText;
  const colorClass = item.type === 'folder' ? 'text-blue-500 bg-blue-500/10' : 
                     item.type === 'book' ? 'text-emerald-500 bg-emerald-500/10' : 
                     'text-indigo-500 bg-indigo-500/10';

  if (view === 'list') {
    return (
      <Card className="group border border-border/50 hover:border-primary/30 transition-all bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex items-center gap-6">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.updatedAt}</span>
              <span>•</span>
              <span>{item.owner}</span>
              {item.pages && (<span>• {item.pages} pages</span>)}
              {item.size && (<span>• {item.size}</span>)}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-xl">
              <DropdownMenuItem className="rounded-lg">Open</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg text-primary font-medium">Edit</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">Share</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg text-rose-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", colorClass)}>
            <Icon className="w-7 h-7" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-xl">
              <DropdownMenuItem className="rounded-lg">Open</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">Move</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg text-rose-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{item.name}</h3>
          <p className="text-xs text-muted-foreground font-medium">Modified {item.updatedAt} by {item.owner}</p>
        </div>

        <div className="mt-8 pt-4 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.type === 'book' && (
              <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-bold text-[10px] uppercase tracking-wider">
                Wiki Book
              </Badge>
            )}
            {item.type === 'folder' && (
              <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 font-bold text-[10px] uppercase tracking-wider">
                Directory
              </Badge>
            )}
            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
              {item.size || (item.pages ? `${item.pages} Pages` : 'Folder')}
            </span>
          </div>
          {item.type === 'book' ? (
            <Link href={`/documents/book/${item.id}`}>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-primary font-bold hover:bg-primary/10">
                Read
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-muted-foreground hover:text-foreground">
              View
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
