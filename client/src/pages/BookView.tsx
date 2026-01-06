import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Layout as LayoutIcon,
  MessageSquare,
  Search as SearchIcon,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  Terminal,
  Code2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useParams } from "wouter";

const navigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", slug: "intro" },
      { title: "Quickstart", slug: "quickstart" },
      { title: "Core Concepts", slug: "concepts" },
    ]
  },
  {
    title: "Product Guide",
    items: [
      { title: "Dashboard Overview", slug: "dashboard" },
      { title: "Team Collaboration", slug: "teams" },
      { title: "Security & Permissions", slug: "security" },
    ]
  },
  {
    title: "Advanced Features",
    items: [
      { title: "AI Integrations", slug: "ai" },
      { title: "Custom Workflows", slug: "workflows" },
      { title: "API Usage", slug: "api" },
    ]
  }
];

export default function BookView() {
  const { id } = useParams();
  const [activeSlug, setActiveSlug] = useState("quickstart");

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Book Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <Link href="/documents">
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Product Handbook</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/20 text-emerald-600 bg-emerald-500/5 uppercase font-black">Book</Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">• v2.4.0</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-border/50 gap-2 font-bold">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2">
              <Sparkles className="w-4 h-4" />
              Ask AI
            </Button>
          </div>
        </div>

        <div className="flex gap-12 h-full overflow-hidden">
          {/* Mintlify-style Sidebar */}
          <div className="w-64 shrink-0 flex flex-col gap-8">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search handbook..." 
                className="h-10 pl-9 bg-secondary/20 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
              />
            </div>

            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-8 pb-12">
                {navigation.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-3">{group.title}</h4>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <button
                          key={item.slug}
                          onClick={() => setActiveSlug(item.slug)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all group",
                            activeSlug === item.slug 
                              ? "bg-primary/10 text-primary shadow-sm" 
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                          )}
                        >
                          {item.title}
                          {activeSlug === item.slug && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(219,39,119,0.5)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Mintlify-style Content Area */}
          <div className="flex-1 flex gap-12 h-full overflow-hidden">
            <ScrollArea className="flex-1 h-full">
              <div className="max-w-3xl pb-24">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight">
                      Getting Started <ChevronRight className="w-4 h-4" />
                    </div>
                    <h2 className="text-4xl font-display font-black tracking-tight text-foreground capitalize">
                      {activeSlug.replace('-', ' ')} Guide
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Learn how to set up your workspace and start collaborating with your team in minutes. This guide covers the essentials of Sakura Corp's document management system.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-12">
                    <Card className="border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer rounded-2xl p-6 group">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold mb-1">Quickstart</h4>
                      <p className="text-xs text-muted-foreground">Deploy your first project site in minutes with our step-by-step guide.</p>
                    </Card>
                    <Card className="border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer rounded-2xl p-6 group">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold mb-1">Web Editor</h4>
                      <p className="text-xs text-muted-foreground">Preview and develop your documentation locally with the Mintlify CLI.</p>
                    </Card>
                  </div>

                  <div className="prose prose-sakura max-w-none mt-12 text-foreground/80 leading-loose">
                    <h3 className="text-2xl font-bold mb-4 text-foreground">Setting Up Your Workspace</h3>
                    <p className="mb-6">
                      Before diving into the advanced features, it's important to understand the structure of your organizational workspace. Documents are categorized into folders, single files, and wiki-books like the one you're reading now.
                    </p>
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl mb-8 flex gap-4">
                      <Sparkles className="w-6 h-6 text-primary shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-bold text-primary mb-1">AI Assistant Pro-Tip</p>
                        <p className="text-sm text-primary/80">You can use the "Ask AI" button in the header to search across all your books using natural language. No more scrolling through hundreds of pages.</p>
                      </div>
                    </div>
                    <p>
                      Structured content allows for deep nesting and semantic search, making it the perfect choice for technical documentation, company handbooks, and standard operating procedures.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Right Sidebar - "On this page" */}
            <div className="w-48 shrink-0 hidden xl:block">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">On this page</h4>
                <div className="space-y-3 border-l border-border/50">
                  {["Introduction", "Workspace Setup", "User Permissions", "Version Control", "Next Steps"].map((section, i) => (
                    <button 
                      key={section} 
                      className={cn(
                        "block w-full text-left text-xs font-bold transition-all pl-4 relative",
                        i === 0 ? "text-primary border-l-2 border-primary -ml-[1.5px]" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
