import { useState } from "react";
import { 
  BookOpen, Plus, Edit, Trash2, Search, Eye, EyeOff, Lock, 
  Users, Settings, Star, Clock, Tag, Filter, MoreVertical,
  FileText, Folder, Archive, Download, Upload, Link,
  Globe, Shield, Zap, History, GitBranch, MessageCircle, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsCard, SettingsRow } from "../components";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Book, type User, type Department } from "@shared/schema";

interface DocumentationSettingsProps {
  departmentId?: string;
  subsection?: string;
}

interface BookWithStats extends Book {
  pageCount: number;
  viewCount: number;
  lastUpdated: string;
  contributors: User[];
  department?: Department;
}

interface DocStats {
  totalBooks: number;
  totalPages: number;
  totalViews: number;
  avgRating: number;
  activeContributors: number;
}

const VISIBILITY_LEVELS = [
  { value: "public", label: "Public", icon: Globe, description: "Visible to everyone" },
  { value: "internal", label: "Internal", icon: Users, description: "Visible to team members" },
  { value: "department", label: "Department", icon: Building2, description: "Visible to department only" },
  { value: "private", label: "Private", icon: Lock, description: "Restricted access" },
];

export function DocumentationSettings({ departmentId, subsection }: DocumentationSettingsProps) {
  const { toast } = useToast();
  const [selectedBook, setSelectedBook] = useState<BookWithStats | null>(null);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("all");
  
  const [newBook, setNewBook] = useState({
    title: "",
    description: "",
    visibility: "internal" as const,
    departmentId: departmentId || "",
    allowComments: true,
    allowRatings: true,
    autoPublish: false,
  });

  const { data: books = [], isLoading } = useQuery<BookWithStats[]>({
    queryKey: ["/api/books", departmentId, searchQuery, filterVisibility],
  });

  const { data: stats } = useQuery<DocStats>({
    queryKey: ["/api/documentation/stats", departmentId],
  });

  const { data: contributors = [] } = useQuery<User[]>({
    queryKey: ["/api/documentation/contributors", departmentId],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const createBookMutation = useMutation({
    mutationFn: async (data: typeof newBook) => {
      return apiRequest("POST", "/api/books", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setShowCreateBook(false);
      setNewBook({
        title: "",
        description: "",
        visibility: "internal",
        departmentId: departmentId || "",
        allowComments: true,
        allowRatings: true,
        autoPublish: false,
      });
      toast({
        title: "Documentation created",
        description: "The new documentation book has been created successfully.",
      });
    },
  });

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterVisibility === "all" || book.visibility === filterVisibility;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">Documentation books</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPages}</div>
              <p className="text-xs text-muted-foreground">Content pages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Page views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Out of 5 stars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contributors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContributors}</div>
              <p className="text-xs text-muted-foreground">Active writers</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-6">
          <SettingsCard
            title="Documentation Books"
            description="Manage your organization's knowledge base and documentation"
            icon={BookOpen}
            scope={departmentId ? "department" : "global"}
            helpText="Books organize related content and can be configured with different visibility levels"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Templates
                </Button>
                <Button onClick={() => setShowCreateBook(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Book
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
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Visibility</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading documentation...
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No documentation books found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setShowCreateBook(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Book
                      </Button>
                    </div>
                  ) : (
                    filteredBooks.map((book) => {
                      const VisibilityIcon = VISIBILITY_LEVELS.find(v => v.value === book.visibility)?.icon || Globe;
                      return (
                        <div 
                          key={book.id}
                          className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                            selectedBook?.id === book.id 
                              ? "bg-primary/5 border-primary/30" 
                              : "hover:bg-muted/50 hover:border-border/60"
                          }`}
                          onClick={() => setSelectedBook(book)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold truncate">{book.title}</h3>
                                <Badge variant="outline" className="shrink-0">
                                  <VisibilityIcon className="w-3 h-3 mr-1" />
                                  {book.visibility}
                                </Badge>
                                {book.featured && (
                                  <Badge variant="secondary" className="shrink-0">
                                    <Star className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              
                              {book.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {book.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {book.pageCount} pages
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {book.viewCount} views
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(book.lastUpdated).toLocaleDateString()}
                                </div>
                              </div>

                              {book.contributors && book.contributors.length > 0 && (
                                <div className="flex items-center gap-2 mt-3">
                                  <div className="flex -space-x-2">
                                    {book.contributors.slice(0, 3).map((contributor) => (
                                      <Avatar key={contributor.id} className="w-6 h-6 border-2 border-background">
                                        <AvatarImage src={contributor.avatar} />
                                        <AvatarFallback className="text-xs">
                                          {contributor.username.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {book.contributors.length > 3 && (
                                      <div className="w-6 h-6 bg-muted border-2 border-background rounded-full flex items-center justify-center text-xs text-muted-foreground">
                                        +{book.contributors.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {book.contributors.length} contributor{book.contributors.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Book
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Book Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
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

                {/* Book Details Panel */}
                <div className="space-y-4">
                  {selectedBook ? (
                    <>
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">{selectedBook.title}</h3>
                        
                        {selectedBook.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {selectedBook.description}
                          </p>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Visibility</span>
                            <Badge variant="outline">
                              {(() => {
                                const visibilityLevel = VISIBILITY_LEVELS.find(v => v.value === selectedBook.visibility);
                                const VisibilityIcon = visibilityLevel?.icon;
                                return VisibilityIcon ? <VisibilityIcon className="w-3 h-3 mr-1" /> : null;
                              })()}
                              {selectedBook.visibility}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Pages</span>
                            <span className="font-medium">{selectedBook.pageCount}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Views</span>
                            <span className="font-medium">{selectedBook.viewCount}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Updated</span>
                            <span>{new Date(selectedBook.lastUpdated).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Contributors</span>
                            <span className="font-medium">{selectedBook.contributors?.length || 0}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">Recent Activity</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Page "Getting Started" updated</span>
                            <span className="text-muted-foreground ml-auto">2h ago</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>New contributor added</span>
                            <span className="text-muted-foreground ml-auto">1d ago</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>Comment on "FAQ"</span>
                            <span className="text-muted-foreground ml-auto">3d ago</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground border rounded-lg">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Select a book to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <SettingsCard
            title="Documentation Templates"
            description="Pre-built templates for common documentation types"
            icon={FileText}
            scope={departmentId ? "department" : "global"}
            actions={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">User Guide</h4>
                    <p className="text-sm text-muted-foreground">Step-by-step user manual</p>
                  </div>
                </div>
                <Badge variant="secondary" className="mb-2">Active</Badge>
                <p className="text-xs text-muted-foreground">Used 12 times</p>
              </div>

              <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">API Documentation</h4>
                    <p className="text-sm text-muted-foreground">Technical API reference</p>
                  </div>
                </div>
                <Badge variant="secondary" className="mb-2">Active</Badge>
                <p className="text-xs text-muted-foreground">Used 8 times</p>
              </div>

              <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Team Handbook</h4>
                    <p className="text-sm text-muted-foreground">Internal team processes</p>
                  </div>
                </div>
                <Badge variant="outline" className="mb-2">Draft</Badge>
                <p className="text-xs text-muted-foreground">Used 3 times</p>
              </div>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <SettingsCard
            title="Documentation Permissions"
            description="Control who can view, edit, and manage documentation"
            icon={Shield}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Default Visibility" 
                description="Default visibility level for new documentation"
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
                label="Guest Access" 
                description="Allow non-authenticated users to view public documentation"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Contributor Approvals" 
                description="Require approval for new contributors"
              >
                <Switch />
              </SettingsRow>

              <SettingsRow 
                label="Version Control" 
                description="Track changes and allow reverting to previous versions"
              >
                <Switch defaultChecked />
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <SettingsCard
            title="Collaboration Features"
            description="Configure how teams work together on documentation"
            icon={Users}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Comments & Feedback" 
                description="Allow readers to leave comments on pages"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Real-time Editing" 
                description="Enable collaborative real-time editing"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Suggestion Mode" 
                description="Contributors can suggest edits without direct editing"
              >
                <Switch />
              </SettingsRow>

              <SettingsRow 
                label="Review Workflow" 
                description="Require reviews before publishing changes"
              >
                <div className="flex items-center gap-2">
                  <Switch />
                  <Select defaultValue="1">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 reviewer</SelectItem>
                      <SelectItem value="2">2 reviewers</SelectItem>
                      <SelectItem value="3">3 reviewers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-6">
          <SettingsCard
            title="Publishing Settings"
            description="Configure how documentation is published and distributed"
            icon={Globe}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Auto-publish" 
                description="Automatically publish approved changes"
              >
                <Switch />
              </SettingsRow>

              <SettingsRow 
                label="SEO Optimization" 
                description="Generate meta tags and optimize for search engines"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Export Formats" 
                description="Available export formats for documentation"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">HTML</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">Markdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">DOCX</span>
                  </div>
                </div>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SettingsCard
            title="Documentation Analytics"
            description="Track usage and performance metrics"
            icon={BarChart3}
            scope={departmentId ? "department" : "global"}
          >
            <div className="space-y-4">
              <SettingsRow 
                label="Page Views Tracking" 
                description="Track individual page view statistics"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Search Analytics" 
                description="Track internal search queries and results"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="User Engagement" 
                description="Track time spent reading and engagement metrics"
              >
                <Switch />
              </SettingsRow>

              <SettingsRow 
                label="Feedback Collection" 
                description="Collect ratings and feedback on documentation quality"
              >
                <Switch defaultChecked />
              </SettingsRow>

              <SettingsRow 
                label="Analytics Retention" 
                description="How long to keep analytics data"
              >
                <Select defaultValue="365">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="730">2 years</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
            </div>
          </SettingsCard>
        </TabsContent>
      </Tabs>

      {/* Create Book Dialog */}
      <Dialog open={showCreateBook} onOpenChange={setShowCreateBook}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Documentation Book</DialogTitle>
            <DialogDescription>
              Create a new book to organize related documentation pages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Book Title *</Label>
              <Input
                placeholder="e.g., User Guide"
                value={newBook.title}
                onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this documentation book..."
                value={newBook.description}
                onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select 
                  value={newBook.visibility} 
                  onValueChange={(value: any) => setNewBook(prev => ({ ...prev, visibility: value }))}
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

              {!departmentId && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select 
                    value={newBook.departmentId} 
                    onValueChange={(value) => setNewBook(prev => ({ ...prev, departmentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Readers can leave comments and feedback
                  </p>
                </div>
                <Switch
                  checked={newBook.allowComments}
                  onCheckedChange={(checked) => setNewBook(prev => ({ ...prev, allowComments: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Ratings</Label>
                  <p className="text-sm text-muted-foreground">
                    Readers can rate the documentation quality
                  </p>
                </div>
                <Switch
                  checked={newBook.allowRatings}
                  onCheckedChange={(checked) => setNewBook(prev => ({ ...prev, allowRatings: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-publish Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically publish approved edits
                  </p>
                </div>
                <Switch
                  checked={newBook.autoPublish}
                  onCheckedChange={(checked) => setNewBook(prev => ({ ...prev, autoPublish: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBook(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createBookMutation.mutate(newBook)}
              disabled={createBookMutation.isPending || !newBook.title}
            >
              {createBookMutation.isPending ? "Creating..." : "Create Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}