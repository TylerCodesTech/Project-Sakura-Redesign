import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft,
  Save,
  Sparkles,
  Type,
  Image as ImageIcon,
  Plus,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Wand2,
  Table as TableIcon,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useParams } from "wouter";

export default function DocEditor() {
  const { id } = useParams();
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <Link href="/documents">
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">Q4 Revenue Projection.pdf</h1>
              <Badge variant="outline" className="text-[10px] py-0 border-indigo-500/20 text-indigo-600 bg-indigo-500/5 uppercase font-black tracking-widest">Draft</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className={cn(
                "rounded-xl border-border/50 gap-2 font-bold transition-all",
                isAiPanelOpen ? "bg-primary/10 border-primary/20 text-primary" : ""
              )}
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20">
              <Save className="w-4 h-4" />
              Publish
            </Button>
          </div>
        </div>

        {/* 2025 Rich Formatting Toolbar */}
        <div className="flex items-center gap-1 bg-secondary/20 p-1.5 rounded-2xl border border-border/40 mb-6 backdrop-blur-sm overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 px-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Undo2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Redo2 className="w-4 h-4" /></Button>
          </div>
          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
          
          <Select defaultValue="inter">
            <SelectTrigger className="w-[130px] h-8 rounded-lg border-transparent bg-transparent hover:bg-secondary/40 transition-all font-bold text-xs">
              <SelectValue placeholder="Font Family" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value="inter" className="font-sans">Inter</SelectItem>
              <SelectItem value="jakarta" className="font-display">Plus Jakarta</SelectItem>
              <SelectItem value="serif" className="font-serif">Merriweather</SelectItem>
              <SelectItem value="mono" className="font-mono">JetBrains Mono</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="16">
            <SelectTrigger className="w-[70px] h-8 rounded-lg border-transparent bg-transparent hover:bg-secondary/40 transition-all font-bold text-xs">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {[12, 14, 16, 18, 20, 24, 32, 48].map(size => (
                <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><Bold className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><Italic className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all underline"><Underline className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><Palette className="w-4 h-4" /></Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><AlignLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><AlignCenter className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><AlignRight className="w-4 h-4" /></Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><ListIcon className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><ListOrdered className="w-4 h-4" /></Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><Heading1 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><Heading2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><LinkIcon className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><ImageIcon className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/40 transition-all"><TableIcon className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Main Editor Surface */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 overflow-hidden backdrop-blur-sm relative">
              <ScrollArea className="h-full">
                <div className="max-w-3xl mx-auto py-16 px-8 space-y-12">
                  <div className="group relative">
                    <h1 className="text-5xl font-display font-black tracking-tight outline-none" contentEditable suppressContentEditableWarning>
                      Q4 Revenue Projection
                    </h1>
                    <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary bg-primary/5">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-xl text-muted-foreground leading-relaxed outline-none" contentEditable suppressContentEditableWarning>
                      This document outlines our projected financial performance for the final quarter of the year, incorporating seasonal trends and new product launches.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-8 rounded-3xl bg-secondary/20 border border-border/50 group cursor-pointer hover:border-primary/20 transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4">
                          <Plus className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold mb-1 text-sm">Add Component</h4>
                        <p className="text-[10px] text-muted-foreground">Insert a chart, table, or interactive widget.</p>
                      </div>
                      <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 border-dashed group cursor-pointer hover:bg-primary/10 transition-all flex flex-col items-center justify-center text-center">
                        <Sparkles className="w-6 h-6 text-primary mb-2" />
                        <p className="text-sm font-bold text-primary">Generate with AI</p>
                      </div>
                    </div>

                    <div className="prose prose-sakura max-w-none mt-8 outline-none" contentEditable suppressContentEditableWarning>
                      <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
                      <p className="mb-4">Our initial findings suggest a 15% increase in year-over-year growth, driven primarily by the new Sakura AI subscription tier.</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Subscription revenue: +18%</li>
                        <li>Enterprise licensing: +12%</li>
                        <li>Professional services: +5%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          {isAiPanelOpen && (
            <div className="w-80 shrink-0 flex flex-col gap-4 animate-in slide-in-from-right duration-300">
              <Card className="flex-1 flex flex-col border border-border/50 shadow-2xl rounded-3xl overflow-hidden bg-background/50 backdrop-blur-xl">
                <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">AI Writing Agent</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => setIsAiPanelOpen(false)}>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="bg-secondary/30 p-3 rounded-2xl text-xs leading-relaxed border border-border/50">
                      Hello! I can help you generate content, fix grammar, or even build entire sections based on your data. What should we do next?
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary transition-all group">
                        <Wand2 className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold">Refine Tone</span>
                          <span className="text-[10px] text-muted-foreground font-medium">Make it more professional</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary transition-all group">
                        <Plus className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold">Insert Table</span>
                          <span className="text-[10px] text-muted-foreground font-medium">Using Q3 benchmarks</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border/50 bg-secondary/10">
                  <div className="relative group">
                    <textarea 
                      placeholder="Ask the agent to write..." 
                      className="w-full bg-background border-border/50 rounded-2xl p-3 pt-4 text-xs min-h-[100px] focus:ring-1 focus:ring-primary/20 outline-none resize-none transition-all shadow-sm"
                    />
                    <Button size="icon" className="absolute right-2 bottom-2 rounded-xl h-8 w-8 bg-primary shadow-lg shadow-primary/20">
                      <Sparkles className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
