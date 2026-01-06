import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft,
  Save,
  Sparkles,
  Undo2,
  Redo2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Wand2,
  Heading1,
  Heading2,
  Type
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
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useParams } from "wouter";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Placeholder from '@tiptap/extension-placeholder';

export default function DocEditor() {
  const { id } = useParams();
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
    ],
    content: `
      <h1>Q4 Revenue Projection</h1>
      <p>This document outlines our projected financial performance for the final quarter of the year, incorporating seasonal trends and new product launches.</p>
      <h2>Executive Summary</h2>
      <p>Our initial findings suggest a 15% increase in year-over-year growth, driven primarily by the new Sakura AI subscription tier.</p>
      <ul>
        <li>Subscription revenue: +18%</li>
        <li>Enterprise licensing: +12%</li>
        <li>Professional services: +5%</li>
      </ul>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sakura max-w-none focus:outline-none min-h-[500px]',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Editor Header */}
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

        {/* Real-time Tiptap Toolbar */}
        <div className="flex items-center gap-1 bg-secondary/20 p-1.5 rounded-2xl border border-border/40 mb-6 backdrop-blur-sm overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 px-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />
          
          <Select onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}>
            <SelectTrigger className="w-[130px] h-8 rounded-lg border-transparent bg-transparent hover:bg-secondary/40 transition-all font-bold text-xs">
              <SelectValue placeholder="Font Family" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="serif">Merriweather</SelectItem>
              <SelectItem value="monospace">JetBrains Mono</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

          <div className="flex items-center gap-0.5">
            <Button 
              variant={editor.isActive('bold') ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <BoldIcon className="w-4 h-4" />
            </Button>
            <Button 
              variant={editor.isActive('italic') ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <ItalicIcon className="w-4 h-4" />
            </Button>
            <Button 
              variant={editor.isActive('underline') ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

          <div className="flex items-center gap-0.5">
            <Button 
              variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button 
              variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

          <div className="flex items-center gap-0.5">
            <Button 
              variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button 
              variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

          <div className="flex items-center gap-0.5">
            <Button 
              variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button 
              variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Main Editor Surface */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 overflow-hidden backdrop-blur-sm relative">
              <ScrollArea className="h-full">
                <div className="max-w-3xl mx-auto py-16 px-8">
                  <EditorContent editor={editor} />
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
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 justify-start text-left rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary transition-all group"
                        onClick={() => {
                          editor.chain().focus().insertContent('<p><em>AI Generated Executive Summary:</em> Q4 looks promising with a steady 15% growth trajectory...</p>').run();
                        }}
                      >
                        <Wand2 className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold">Quick Summary</span>
                          <span className="text-[10px] text-muted-foreground font-medium">Add to document</span>
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
