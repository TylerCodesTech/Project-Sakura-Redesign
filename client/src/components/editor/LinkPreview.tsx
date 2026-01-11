import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { ExternalLink, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LinkPreviewProps {
  editor: Editor;
}

export function LinkPreview({ editor }: LinkPreviewProps) {
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && editor.view.dom.contains(link)) {
      const href = link.getAttribute('href');
      if (href) {
        const rect = link.getBoundingClientRect();
        const editorRect = editor.view.dom.getBoundingClientRect();
        
        setLinkUrl(href);
        setPosition({
          top: rect.bottom - editorRect.top + 8,
          left: rect.left - editorRect.left,
        });
        setIsVisible(true);
      }
    }
  }, [editor]);

  const handleMouseOut = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (target.closest('a') && !relatedTarget?.closest('.link-preview-popup')) {
      setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  }, []);

  useEffect(() => {
    const editorDom = editor.view.dom;
    editorDom.addEventListener('mouseover', handleMouseOver);
    editorDom.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      editorDom.removeEventListener('mouseover', handleMouseOver);
      editorDom.removeEventListener('mouseout', handleMouseOut);
    };
  }, [editor, handleMouseOver, handleMouseOut]);

  const copyLink = () => {
    if (linkUrl) {
      navigator.clipboard.writeText(linkUrl);
    }
  };

  const openLink = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setIsVisible(false);
  };

  if (!isVisible || !linkUrl) return null;

  const isExternal = linkUrl.startsWith('http');
  const displayUrl = linkUrl.length > 40 ? linkUrl.substring(0, 40) + '...' : linkUrl;

  return (
    <div 
      className={cn(
        "link-preview-popup absolute z-50 bg-popover border border-border rounded-xl shadow-lg p-2 animate-in fade-in slide-in-from-bottom-2 duration-150",
        "flex items-center gap-2 min-w-[200px] max-w-[350px]"
      )}
      style={{ top: position.top, left: position.left }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-foreground truncate font-medium">
          {displayUrl}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isExternal && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-lg"
            onClick={openLink}
            title="Open link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 rounded-lg"
          onClick={copyLink}
          title="Copy link"
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
          onClick={removeLink}
          title="Remove link"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
