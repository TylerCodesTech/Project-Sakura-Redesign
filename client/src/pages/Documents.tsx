import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { documents } from "@/lib/mockData";
import { File, Folder, MoreVertical, Search, Upload } from "lucide-react";

export default function Documents() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Documents</h1>
            <p className="text-muted-foreground mt-1">Unified document management and version control.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline">New Folder</Button>
             <Button className="shadow-lg hover:shadow-xl transition-all">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="col-span-1 md:col-span-3">
              <div className="bg-card rounded-xl border border-border shadow-sm min-h-[500px]">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="hover:text-foreground cursor-pointer">All Files</span>
                    <span>/</span>
                    <span className="font-medium text-foreground">Marketing</span>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search current folder..." className="pl-9 h-9" />
                  </div>
                </div>
                
                <div className="p-2">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-6">Name</div>
                    <div className="col-span-3">Modified</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-1"></div>
                  </div>
                  <div className="space-y-1">
                    {documents.map((doc) => (
                      <div key={doc.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-secondary/30 rounded-lg cursor-pointer transition-colors group">
                        <div className="col-span-6 flex items-center gap-3">
                          {doc.type === 'folder' ? (
                            <Folder className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                          ) : (
                            <File className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{doc.name}</span>
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground">{doc.modified}</div>
                        <div className="col-span-2 text-sm text-muted-foreground font-mono">{doc.size}</div>
                        <div className="col-span-1 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
           </div>
           
           <div className="hidden md:block col-span-1 space-y-6">
              <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                <h3 className="font-medium mb-3">Quick Access</h3>
                <div className="space-y-2">
                  {['Recent Files', 'Shared with me', 'Starred', 'Trash'].map(item => (
                    <div key={item} className="text-sm text-muted-foreground hover:text-foreground hover:bg-background px-3 py-2 rounded-md cursor-pointer transition-colors">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <h3 className="font-medium text-primary mb-2">Storage Usage</h3>
                <div className="h-2 w-full bg-background rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary w-[75%] rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground">75GB of 100GB used</p>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
