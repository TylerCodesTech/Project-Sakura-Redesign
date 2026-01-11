import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeftRight, 
  X,
  FileText,
  Image as ImageIcon,
  Play,
  Plus,
  Minus,
  Equal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CompareResult {
  version1: {
    id: string;
    versionNumber: number;
    title: string;
    content?: string;
    description?: string;
    status?: string;
    createdAt: string;
  };
  version2: {
    id: string;
    versionNumber: number;
    title: string;
    content?: string;
    description?: string;
    status?: string;
    createdAt: string;
  };
  comparison: {
    titleChanged: boolean;
    contentChanged: boolean;
    statusChanged: boolean;
  };
}

interface VersionCompareProps {
  documentId: string;
  documentType: "page" | "book";
  version1: number;
  version2: number;
  isOpen: boolean;
  onClose: () => void;
}

function extractTextFromHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function extractImagesFromHTML(html: string): string[] {
  const div = document.createElement('div');
  div.innerHTML = html;
  const images = div.querySelectorAll('img');
  return Array.from(images).map(img => img.src);
}

function extractMediaFromHTML(html: string): { type: string; src: string }[] {
  const div = document.createElement('div');
  div.innerHTML = html;
  const media: { type: string; src: string }[] = [];
  
  div.querySelectorAll('video, audio, iframe').forEach(el => {
    const src = el.getAttribute('src') || el.querySelector('source')?.getAttribute('src');
    if (src) {
      media.push({ type: el.tagName.toLowerCase(), src });
    }
  });
  
  return media;
}

function computeDiff(text1: string, text2: string): { type: 'added' | 'removed' | 'unchanged'; text: string }[] {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  const result: { type: 'added' | 'removed' | 'unchanged'; text: string }[] = [];
  
  let i = 0, j = 0;
  while (i < words1.length || j < words2.length) {
    if (i >= words1.length) {
      result.push({ type: 'added', text: words2[j] });
      j++;
    } else if (j >= words2.length) {
      result.push({ type: 'removed', text: words1[i] });
      i++;
    } else if (words1[i] === words2[j]) {
      result.push({ type: 'unchanged', text: words1[i] });
      i++;
      j++;
    } else {
      let found = false;
      for (let k = j + 1; k < Math.min(j + 5, words2.length); k++) {
        if (words1[i] === words2[k]) {
          for (let l = j; l < k; l++) {
            result.push({ type: 'added', text: words2[l] });
          }
          j = k;
          found = true;
          break;
        }
      }
      if (!found) {
        result.push({ type: 'removed', text: words1[i] });
        i++;
      }
    }
  }
  
  return result;
}

export function VersionCompare({ 
  documentId, 
  documentType, 
  version1, 
  version2, 
  isOpen, 
  onClose 
}: VersionCompareProps) {
  const compareQuery = useQuery<CompareResult>({
    queryKey: [`/api/${documentType}s/${documentId}/compare/${version1}/${version2}`],
    enabled: isOpen && !!documentId && version1 > 0 && version2 > 0,
  });

  if (!isOpen) return null;

  const data = compareQuery.data;
  
  const text1 = data?.version1?.content ? extractTextFromHTML(data.version1.content) : '';
  const text2 = data?.version2?.content ? extractTextFromHTML(data.version2.content) : '';
  const images1 = data?.version1?.content ? extractImagesFromHTML(data.version1.content) : [];
  const images2 = data?.version2?.content ? extractImagesFromHTML(data.version2.content) : [];
  const media1 = data?.version1?.content ? extractMediaFromHTML(data.version1.content) : [];
  const media2 = data?.version2?.content ? extractMediaFromHTML(data.version2.content) : [];
  
  const textDiff = text1 && text2 ? computeDiff(text1, text2) : [];
  const addedCount = textDiff.filter(d => d.type === 'added').length;
  const removedCount = textDiff.filter(d => d.type === 'removed').length;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-background rounded-2xl border shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Compare Versions</h2>
              <p className="text-xs text-muted-foreground">
                Viewing differences between v{version1} and v{version2}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {textDiff.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-emerald-600">
                  <Plus className="w-4 h-4" />
                  {addedCount} added
                </span>
                <span className="flex items-center gap-1 text-rose-600">
                  <Minus className="w-4 h-4" />
                  {removedCount} removed
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-lg gap-2">
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
        </div>

        {compareQuery.isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Could not load version comparison</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col border-r">
              <div className="p-4 bg-muted/30 border-b">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">v{data.version1.versionNumber}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(data.version1.createdAt), 'PPp')}
                  </span>
                </div>
                <h3 className="text-sm font-medium mt-2">{data.version1.title}</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {data.version1.content ? (
                    <div dangerouslySetInnerHTML={{ __html: data.version1.content }} />
                  ) : data.version1.description ? (
                    <p>{data.version1.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No content</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="p-4 bg-muted/30 border-b">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">v{data.version2.versionNumber}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(data.version2.createdAt), 'PPp')}
                  </span>
                </div>
                <h3 className="text-sm font-medium mt-2">{data.version2.title}</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {data.version2.content ? (
                    <div dangerouslySetInnerHTML={{ __html: data.version2.content }} />
                  ) : data.version2.description ? (
                    <p>{data.version2.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No content</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {data && (
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center gap-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Changes Summary
              </h4>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Title:</span>
                  {data.comparison.titleChanged ? (
                    <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600">
                      Changed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
                      <Equal className="w-3 h-3 mr-1" />
                      Same
                    </Badge>
                  )}
                </div>
                
                <Separator orientation="vertical" className="h-4" />
                
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Content:</span>
                  {data.comparison.contentChanged ? (
                    <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600">
                      Changed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
                      <Equal className="w-3 h-3 mr-1" />
                      Same
                    </Badge>
                  )}
                </div>
                
                {data.comparison.statusChanged !== undefined && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Status:</span>
                      {data.comparison.statusChanged ? (
                        <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600">
                          Changed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
                          <Equal className="w-3 h-3 mr-1" />
                          Same
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {(images1.length > 0 || images2.length > 0) && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Images:</span>
                    <Badge variant="outline">
                      v{version1}: {images1.length}
                    </Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline">
                      v{version2}: {images2.length}
                    </Badge>
                  </div>
                </>
              )}
              
              {(media1.length > 0 || media2.length > 0) && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Media:</span>
                    <Badge variant="outline">
                      v{version1}: {media1.length}
                    </Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline">
                      v{version2}: {media2.length}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
