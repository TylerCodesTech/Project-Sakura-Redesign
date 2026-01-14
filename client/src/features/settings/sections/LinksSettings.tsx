import { useState } from "react";
import { 
  Link, Plus, Edit, Trash2, ExternalLink, Globe, Users, Eye,
  EyeOff, Settings, Copy, Star, ArrowUpRight, Search, Filter,
  Tag, Bookmark, Share2, QrCode, BarChart3, Clock, AlertCircle,
  Shield, Zap, Building2, BookOpen, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsCard, SettingsRow } from "../components";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type User, type Department } from "@shared/schema";

interface LinksSettingsProps {
  departmentId?: string;
  subsection?: string;
}

interface ExternalLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  visibility: "public" | "internal" | "department" | "private";
  icon?: string;
  color?: string;
  featured: boolean;
  clickCount: number;
  createdBy: User;
  department?: Department;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  lastClicked?: string;
}

interface LinkStats {
  totalLinks: number;
  publicLinks: number;
  totalClicks: number;
  popularLink: string;
}

const LINK_CATEGORIES = [
  { value: "tools", label: "Tools & Apps", icon: Zap, color: "#3b82f6" },
  { value: "documentation", label: "Documentation", icon: BookOpen, color: "#10b981" },
  { value: "support", label: "Support", icon: Headphones, color: "#f59e0b" },
  { value: "company", label: "Company", icon: Building2, color: "#8b5cf6" },
  { value: "resources", label: "Resources", icon: Bookmark, color: "#ef4444" },
  { value: "integrations", label: "Integrations", icon: Link, color: "#06b6d4" },
];

const VISIBILITY_LEVELS = [
  { value: "public", label: "Public", icon: Globe, description: "Visible to everyone" },
  { value: "internal", label: "Internal", icon: Users, description: "Team members only" },
  { value: "department", label: "Department", icon: Building2, description: "Department only" },
  { value: "private", label: "Private", icon: EyeOff, description: "Restricted access" },
];

export function LinksSettings({ departmentId, subsection }: LinksSettingsProps) {
  const { toast } = useToast();
  const [selectedLink, setSelectedLink] = useState<ExternalLink | null>(null);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    category: "tools",
    visibility: "internal" as const,
    icon: "",
    color: "#3b82f6",
    featured: false,
    tags: [] as string[],
    departmentId: departmentId || "",
  });

  const { data: links = [], isLoading } = useQuery<ExternalLink[]>({
    queryKey: ["/api/external-links", departmentId, searchQuery, filterCategory, filterVisibility],
  });

  const { data: stats } = useQuery<LinkStats>({
    queryKey: ["/api/external-links/stats", departmentId],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: typeof newLink) => {
      return apiRequest("POST", "/api/external-links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      setShowCreateLink(false);
      setNewLink({
        title: "",
        url: "",
        description: "",
        category: "tools",
        visibility: "internal",
        icon: "",
        color: "#3b82f6",
        featured: false,
        tags: [],
        departmentId: departmentId || "",
      });
      toast({
        title: "Link created",
        description: "The external link has been created successfully.",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/external-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-links"] });
      setSelectedLink(null);
      toast({
        title: "Link deleted",
        description: "The external link has been deleted successfully.",
      });
    },
  });

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || link.category === filterCategory;
    const matchesVisibility = filterVisibility === "all" || link.visibility === filterVisibility;
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const popularLinks = [...links]
    .filter(link => link.clickCount > 0)
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Links</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLinks}</div>
              <p className="text-xs text-muted-foreground">External resources</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Links</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publicLinks}</div>
              <p className="text-xs text-muted-foreground">Publicly visible</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">{stats.popularLink || "No data"}</div>
              <p className="text-xs text-muted-foreground">Top link</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-6">
          <SettingsCard
            title="External Links"
            description="Manage external resources and quick access links"
            icon={Link}
            scope={departmentId ? "department" : "global"}
            helpText="External links provide quick access to important resources and tools"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button onClick={() => setShowCreateLink(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search links, URLs, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {LINK_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Visibility</SelectItem>
                      {VISIBILITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <level.icon className="w-4 h-4" />
                            {level.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading links...
                    </div>
                  ) : filteredLinks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No external links found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setShowCreateLink(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Link
                      </Button>
                    </div>
                  ) : (
                    filteredLinks.map((link) => {
                      const categoryInfo = LINK_CATEGORIES.find(c => c.value === link.category);
                      const CategoryIcon = categoryInfo?.icon || Link;
                      const VisibilityIcon = VISIBILITY_LEVELS.find(v => v.value === link.visibility)?.icon || Globe;
                      
                      return (
                        <div 
                          key={link.id}
                          className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                            selectedLink?.id === link.id 
                              ? "bg-primary/5 border-primary/30" 
                              : "hover:bg-muted/50 hover:border-border/60"
                          }`}
                          onClick={() => setSelectedLink(link)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: link.color || categoryInfo?.color || "#3b82f6" }}
                                >
                                  {link.icon ? (
                                    <span className="text-white text-sm">{link.icon}</span>
                                  ) : (
                                    <CategoryIcon className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <h3 className="font-semibold truncate">{link.title}</h3>
                                {link.featured && (
                                  <Badge variant="secondary">
                                    <Star className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                <Badge variant="outline" className="shrink-0">
                                  <VisibilityIcon className="w-3 h-3 mr-1" />
                                  {link.visibility}
                                </Badge>
                                {!link.isActive && (
                                  <Badge variant="destructive" className="shrink-0">Disabled</Badge>
                                )}
                              </div>
                              
                              {link.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {link.description}
                                </p>
                              )}

                              <div className="flex items-center gap-1 mb-2">
                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground truncate">{link.url}</span>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />
                                  {link.clickCount} clicks
                                </div>
                                <div className="flex items-center gap-1">
                                  <CategoryIcon className="w-3 h-3" />
                                  {categoryInfo?.label}
                                </div>
                                {link.lastClicked && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(link.lastClicked).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              {link.tags && link.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {link.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      <Tag className="w-2 h-2 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                  {link.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{link.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-3">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={link.createdBy.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {link.createdBy.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  by {link.createdBy.username}
                                </span>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => window.open(link.url, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(link.url)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy URL
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Link
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share Link
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <QrCode className="w-4 h-4 mr-2" />
                                  Generate QR
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => deleteLinkMutation.mutate(link.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Link Details Panel */}
                <div className="space-y-4">
                  {selectedLink ? (
                    <>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: selectedLink.color || "#3b82f6" }}
                          >
                            {selectedLink.icon ? (
                              <span className="text-white text-sm">{selectedLink.icon}</span>
                            ) : (
                              <Link className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{selectedLink.title}</h3>
                            <p className="text-xs text-muted-foreground truncate">{selectedLink.url}</p>
                          </div>
                        </div>
                        
                        {selectedLink.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {selectedLink.description}
                          </p>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Category</span>
                            <Badge variant="outline">
                              {LINK_CATEGORIES.find(c => c.value === selectedLink.category)?.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Visibility</span>
                            <Badge variant="outline">
                              {(() => {
                                const visibilityLevel = VISIBILITY_LEVELS.find(v => v.value === selectedLink.visibility);
                                const VisibilityIcon = visibilityLevel?.icon;
                                return VisibilityIcon ? <VisibilityIcon className="w-3 h-3 mr-1" /> : null;
                              })()}
                              {selectedLink.visibility}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Clicks</span>
                            <span className="font-medium">{selectedLink.clickCount}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={selectedLink.isActive ? "secondary" : "destructive"}>
                              {selectedLink.isActive ? "Active" : "Disabled"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created</span>
                            <span>{new Date(selectedLink.createdAt).toLocaleDateString()}</span>
                          </div>

                          {selectedLink.lastClicked && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Last Clicked</span>
                              <span>{new Date(selectedLink.lastClicked).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(selectedLink.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {selectedLink.tags && selectedLink.tags.length > 0 && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-3">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedLink.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => navigator.clipboard.writeText(selectedLink.url)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy URL
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <QrCode className="w-4 h-4 mr-2" />
                            Generate QR Code
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Link
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground border rounded-lg">
                      <Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Select a link to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SettingsCard>

          {popularLinks.length > 0 && (
            <SettingsCard
              title="Popular Links"
              description="Most clicked external links"
              icon={TrendingUp}
              scope={departmentId ? "department" : "global"}
            >
              <div className="space-y-2">
                {popularLinks.map((link, index) => (
                  <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 text-sm font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: link.color || "#3b82f6" }}
                    >
                      {link.icon ? (
                        <span className="text-white text-xs">{link.icon}</span>
                      ) : (
                        <Link className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{link.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{link.url}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{link.clickCount}</div>
                      <div className="text-xs text-muted-foreground">clicks</div>
                    </div>
                  </div>
                ))}
              </div>
            </SettingsCard>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <SettingsCard
            title="Link Categories"
            description="Organize links into categories for better navigation"
            icon={Tag}
            scope={departmentId ? "department" : "global"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LINK_CATEGORIES.map((category) => {
                const categoryLinks = links.filter(link => link.category === category.value);
                const CategoryIcon = category.icon;
                
                return (
                  <div key={category.value} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        <CategoryIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{category.label}</h4>
                        <p className="text-sm text-muted-foreground">{categoryLinks.length} links</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {categoryLinks.slice(0, 3).map((link) => (
                        <div key={link.id} className="text-sm truncate">
                          {link.title}
                        </div>
                      ))}
                      {categoryLinks.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{categoryLinks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SettingsCard
            title="Link Analytics"
            description="Track usage and performance of external links"
            icon={BarChart3}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Click Tracking" 
                description="Track when users click on external links"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Popular Links Widget" 
                description="Show popular links in dashboard"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Usage Reports" 
                description="Include link analytics in regular reports"
              >
                <Switch />
              </SettingsRow>

              <SettingsRow 
                label="Analytics Retention" 
                description="How long to keep click data"
              >
                <Select defaultValue="365">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <SettingsCard
            title="Link Integrations"
            description="Connect external services and import links"
            icon={Zap}
            scope={departmentId ? "department" : "global"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Browser Bookmarks</h4>
                    <p className="text-sm text-muted-foreground">Import from browser</p>
                  </div>
                  <Switch className="ml-auto" />
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Link className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">URL Shortener</h4>
                    <p className="text-sm text-muted-foreground">Generate short URLs</p>
                  </div>
                  <Switch className="ml-auto" />
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">QR Code Generator</h4>
                    <p className="text-sm text-muted-foreground">Auto-generate QR codes</p>
                  </div>
                  <Switch defaultChecked className="ml-auto" />
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Social Sharing</h4>
                    <p className="text-sm text-muted-foreground">Share links on social platforms</p>
                  </div>
                  <Switch className="ml-auto" />
                </div>
              </div>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsCard
            title="Links System Settings"
            description="Global configuration for external links"
            icon={Settings}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Default Visibility" 
                description="Default visibility level for new links"
              >
                <Select defaultValue="internal">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <level.icon className="w-4 h-4" />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsRow>

              <SettingsRow 
                label="Link Validation" 
                description="Automatically check if external links are accessible"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Security Scanning" 
                description="Scan links for security threats"
              >
                <div className="flex items-center gap-2">
                  <Switch />
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">May slow link creation</span>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Maximum Links per User" 
                description="Limit how many links each user can create"
              >
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="50" className="w-20" />
                  <span className="text-sm text-muted-foreground">links</span>
                </div>
              </SettingsRow>

              <SettingsRow 
                label="Auto-cleanup Inactive Links" 
                description="Remove links that haven't been clicked in a specified period"
              >
                <div className="flex items-center gap-2">
                  <Switch />
                  <Select defaultValue="365">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>
      </Tabs>

      {/* Create Link Dialog */}
      <Dialog open={showCreateLink} onOpenChange={setShowCreateLink}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add External Link</DialogTitle>
            <DialogDescription>
              Add a new external resource or quick access link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link Title *</Label>
              <Input
                placeholder="e.g., Project Management Tool"
                value={newLink.title}
                onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this link..."
                value={newLink.description}
                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newLink.category} 
                  onValueChange={(value) => setNewLink(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINK_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select 
                  value={newLink.visibility} 
                  onValueChange={(value: any) => setNewLink(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <level.icon className="w-4 h-4" />
                          <div>
                            <div>{level.label}</div>
                            <div className="text-xs text-muted-foreground">{level.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (Emoji)</Label>
                <Input
                  placeholder="🔗"
                  value={newLink.icon}
                  onChange={(e) => setNewLink(prev => ({ ...prev, icon: e.target.value }))}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={newLink.color}
                    onChange={(e) => setNewLink(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Input
                    value={newLink.color}
                    onChange={(e) => setNewLink(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Featured Link</Label>
                <p className="text-sm text-muted-foreground">
                  Display prominently in link listings
                </p>
              </div>
              <Switch
                checked={newLink.featured}
                onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, featured: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateLink(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createLinkMutation.mutate(newLink)}
              disabled={createLinkMutation.isPending || !newLink.title || !newLink.url}
            >
              {createLinkMutation.isPending ? "Adding..." : "Add Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}