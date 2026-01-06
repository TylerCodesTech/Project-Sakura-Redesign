import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft,
  Save,
  Layout as LayoutIcon,
  Code2,
  Sparkles,
  Type,
  Image as ImageIcon,
  Plus,
  MoreVertical,
  ChevronDown,
  Wand2,
  Undo2,
  Redo2,
  Terminal,
  Columns
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useParams } from "wouter";

export default function DocEditor() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("wysiwyg");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
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
            <div className="flex items-center bg-secondary/30 p-1 rounded-xl border border-border/50 mr-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Undo2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Redo2 className="w-4 h-4" /></Button>
            </div>
            
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

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Main Editor Surface */}
          <div className="flex-1 flex flex-col min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-secondary/30 p-1 rounded-xl h-10">
                  <TabsTrigger value="wysiwyg" className="rounded-lg gap-2 font-bold text-xs px-4">
                    <LayoutIcon className="w-3.5 h-3.5" />
                    Visual Editor
                  </TabsTrigger>
                  <TabsTrigger value="markdown" className="rounded-lg gap-2 font-bold text-xs px-4">
                    <Code2 className="w-3.5 h-3.5" />
                    Markdown / MDX
                  </TabsTrigger>
                </TabsList>
                
                {activeTab === 'wysiwyg' && (
                  <div className="flex items-center gap-1">
                    {[Type, ImageIcon, Columns, Plus].map((Icon, i) => (
                      <Button key={i} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                        <Icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 overflow-hidden backdrop-blur-sm relative">
                <TabsContent value="wysiwyg" className="h-full m-0 p-0">
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
                            <h4 className="font-bold mb-1">Add Component</h4>
                            <p className="text-xs text-muted-foreground">Insert a chart, table, or interactive widget.</p>
                          </div>
                          <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 border-dashed group cursor-pointer hover:bg-primary/10 transition-all flex flex-col items-center justify-center text-center">
                            <Sparkles className="w-6 h-6 text-primary mb-2" />
                            <p className="text-sm font-bold text-primary">Generate with AI</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="markdown" className="h-full m-0 p-0 flex">
                  <div className="w-1/2 border-r border-border/50 p-6 font-mono text-sm leading-relaxed overflow-auto scrollbar-hide">
                    <div className="text-primary/60 mb-4">---<br/>title: Q4 Revenue Projection<br/>status: Draft<br/>---</div>
                    <div className="text-foreground">
                      <span className="text-primary font-bold"># Q4 Revenue Projection</span><br/><br/>
                      This document outlines our projected financial performance...<br/><br/>
                      <span className="text-emerald-500 font-bold">{"<Callout variant=\"info\">"}</span><br/>
                      &nbsp;&nbsp;Ensure all data points are verified by the finance team.<br/>
                      <span className="text-emerald-500 font-bold">{"</Callout>"}</span><br/><br/>
                      <span className="text-indigo-500 font-bold">{"```typescript"}</span><br/>
                      &nbsp;&nbsp;const projection = calculateRevenue(q4_data);<br/>
                      <span className="text-indigo-500 font-bold">{"```"}</span>
                    </div>
                  </div>
                  <div className="w-1/2 p-12 overflow-auto bg-secondary/5">
                    <Badge variant="outline" className="mb-4 text-[10px] uppercase font-black tracking-widest border-border/50 text-muted-foreground">Preview</Badge>
                    <div className="prose prose-sakura max-w-none">
                      <h1 className="text-3xl font-black mb-6">Q4 Revenue Projection</h1>
                      <p className="text-muted-foreground mb-8">This document outlines our projected financial performance...</p>
                      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-8 flex gap-3">
                        <Terminal className="w-5 h-5 text-blue-500 mt-1" />
                        <p className="text-sm text-blue-700/80 font-medium">Ensure all data points are verified by the finance team.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
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
                          <span className="text-[11px] font-bold">Generate Executive Summary</span>
                          <span className="text-[10px] text-muted-foreground font-medium">Based on the current data</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary transition-all group">
                        <Plus className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold">Add Revenue Table</span>
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
              
              <Card className="p-4 border border-border/50 bg-indigo-500/5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Semantic Engine Active</span>
                </div>
                <p className="text-[10px] text-indigo-700/60 font-medium leading-relaxed">
                  I've indexed this document and related Q3 reports to provide contextual suggestions.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
