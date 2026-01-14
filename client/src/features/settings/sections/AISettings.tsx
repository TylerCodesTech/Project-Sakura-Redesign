import { useState, useEffect } from "react";
import { Bot, Database, Loader2, RefreshCw, AlertCircle, Server, Cpu, Brain, Settings2, Activity, Play, Trash2, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsCard, SettingsRow } from "../components";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AISettingsProps {
  subsection?: string;
}

const EMBEDDING_PROVIDERS = [
  { value: "openai", label: "OpenAI", requiresApiKey: true },
  { value: "ollama", label: "Ollama (Self-hosted)", requiresApiKey: false },
  { value: "google", label: "Google AI", requiresApiKey: true },
];

const EMBEDDING_MODELS: Record<string, { value: string; label: string; dimensions: number }[]> = {
  openai: [
    { value: "text-embedding-3-small", label: "text-embedding-3-small", dimensions: 1536 },
    { value: "text-embedding-3-large", label: "text-embedding-3-large", dimensions: 3072 },
    { value: "text-embedding-ada-002", label: "text-embedding-ada-002", dimensions: 1536 },
  ],
  ollama: [
    { value: "nomic-embed-text", label: "nomic-embed-text", dimensions: 768 },
    { value: "mxbai-embed-large", label: "mxbai-embed-large", dimensions: 1024 },
    { value: "all-minilm", label: "all-minilm", dimensions: 384 },
  ],
  google: [
    { value: "text-embedding-004", label: "text-embedding-004", dimensions: 768 },
    { value: "embedding-001", label: "embedding-001", dimensions: 768 },
  ],
};

const CHAT_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "ollama", label: "Ollama (Self-hosted)" },
  { value: "google", label: "Google AI" },
];

const CHAT_MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  ollama: [
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "llama3.1:70b", label: "Llama 3.1 70B" },
    { value: "mistral", label: "Mistral" },
    { value: "mixtral", label: "Mixtral" },
    { value: "phi3", label: "Phi-3" },
  ],
  google: [
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  ],
};

interface QueueStatus {
  queueLength: number;
  processing: boolean;
}

interface IndexingStats {
  pages: { total: number; indexed: number; pending: number };
  tickets: { total: number; indexed: number; pending: number };
  totalIndexed: number;
  totalPending: number;
}

export function AISettings({ subsection }: AISettingsProps) {
  const { settings, updateSettings, isLoading } = useSystemSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [indexingStats, setIndexingStats] = useState<IndexingStats | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    fetchQueueStatus();
    fetchIndexingStats();

    // Poll queue status every 5 seconds
    const interval = setInterval(() => {
      fetchQueueStatus();
      fetchIndexingStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchQueueStatus = async () => {
    try {
      setIsLoadingQueue(true);
      const response = await fetch("/api/embeddings/queue-status");
      if (response.ok) {
        const data = await response.json();
        setQueueStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch queue status:", error);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const fetchIndexingStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch("/api/ai/indexing-stats");
      if (response.ok) {
        const data = await response.json();
        setIndexingStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch indexing stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleReindexPages = async () => {
    setIsReindexing(true);
    try {
      const response = await fetch("/api/embeddings/reindex-pages", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Pages reindexing started",
          description: `Processing ${data.processed} pages. Check queue status for progress.`,
        });
        fetchQueueStatus();
        fetchIndexingStats();
      } else {
        throw new Error("Failed to start reindexing");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start reindexing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReindexing(false);
    }
  };

  const handleReindexTickets = async () => {
    setIsReindexing(true);
    try {
      const response = await fetch("/api/embeddings/reindex-tickets", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Tickets reindexing started",
          description: `Processing ${data.processed} tickets. Check queue status for progress.`,
        });
        fetchQueueStatus();
        fetchIndexingStats();
      } else {
        throw new Error("Failed to start reindexing");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start reindexing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReindexing(false);
    }
  };

  const handleClearQueue = async () => {
    try {
      const response = await fetch("/api/embeddings/queue-clear", {
        method: "POST",
      });
      if (response.ok) {
        toast({
          title: "Queue cleared",
          description: "Embedding queue has been cleared successfully.",
        });
        fetchQueueStatus();
      } else {
        throw new Error("Failed to clear queue");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear queue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast({
        title: "AI Settings saved",
        description: "Your AI configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save AI settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocal = (key: keyof typeof localSettings, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
  
  const selectedEmbeddingProvider = localSettings.aiEmbeddingProvider || "openai";
  const selectedChatProvider = localSettings.aiChatProvider || "openai";
  const temperature = parseFloat(localSettings.aiChatTemperature || "0.7");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle subsections
  if (subsection === "ai-embeddings") {
    return (
      <div className="space-y-6">
        <SettingsCard
          title="Embedding Models"
          description="Configure text embedding models for document vectorization and search"
          icon={Database}
          scope="global"
          helpText="Embedding models convert text into vectors for semantic search and RAG functionality"
        >
          <div className="space-y-6">
            <SettingsRow
              label="Provider"
              description="Choose your embedding model provider"
            >
              <Select
                value={selectedEmbeddingProvider}
                onValueChange={(value) => updateLocal("aiEmbeddingProvider", value)}
              >
                <SelectTrigger className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMBEDDING_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                      {provider.requiresApiKey && (
                        <span className="text-xs text-muted-foreground ml-2">(API Key Required)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow
              label="Model"
              description="Select the embedding model to use"
            >
              <Select
                value={localSettings.aiEmbeddingModel || "text-embedding-3-small"}
                onValueChange={(value) => {
                  updateLocal("aiEmbeddingModel", value);
                  const model = EMBEDDING_MODELS[selectedEmbeddingProvider]?.find(m => m.value === value);
                  if (model) {
                    updateLocal("aiEmbeddingDimensions", model.dimensions.toString());
                  }
                }}
              >
                <SelectTrigger className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMBEDDING_MODELS[selectedEmbeddingProvider]?.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                      <span className="text-xs text-muted-foreground ml-2">({model.dimensions}d)</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow
              label="Dimensions"
              description="Vector dimensions (automatically set based on model)"
            >
              <Input
                value={localSettings.aiEmbeddingDimensions || "1536"}
                onChange={(e) => updateLocal("aiEmbeddingDimensions", e.target.value)}
                placeholder="1536"
                className="max-w-24"
                disabled
              />
            </SettingsRow>

            {selectedEmbeddingProvider === "ollama" && (
              <SettingsRow
                label="Ollama Base URL"
                description="URL to your self-hosted Ollama instance"
              >
                <Input
                  value={localSettings.aiOllamaBaseUrl || "http://localhost:11434"}
                  onChange={(e) => updateLocal("aiOllamaBaseUrl", e.target.value)}
                  placeholder="http://localhost:11434"
                  className="max-w-sm"
                />
              </SettingsRow>
            )}

            <div className="pt-2 border-t">
              <SettingsRow
                label="Auto-vectorization"
                description="Automatically convert documents to vectors when uploaded"
              >
                <Switch
                  checked={localSettings.aiAutoVectorization === "true"}
                  onCheckedChange={(checked) =>
                    updateLocal("aiAutoVectorization", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow
                label="Enable RAG"
                description="Enable Retrieval-Augmented Generation for AI responses"
              >
                <Switch
                  checked={localSettings.aiEnableRag === "true"}
                  onCheckedChange={(checked) =>
                    updateLocal("aiEnableRag", checked.toString())
                  }
                />
              </SettingsRow>

              <SettingsRow
                label="Chunk Size"
                description="Text chunk size for document splitting (tokens)"
              >
                <Input
                  type="number"
                  value={localSettings.aiChunkSize || "1000"}
                  onChange={(e) => updateLocal("aiChunkSize", e.target.value)}
                  placeholder="1000"
                  className="max-w-24"
                  min="100"
                  max="8000"
                />
              </SettingsRow>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Embedding Queue & Status"
          description="Monitor and manage background embedding generation"
          icon={Activity}
          scope="global"
          helpText="Embeddings are automatically generated in the background when pages or tickets are created/updated"
        >
          <div className="space-y-6">
            {/* Queue Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Queue Status</h4>
                  {queueStatus?.processing && (
                    <Badge variant="default" className="gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing
                    </Badge>
                  )}
                  {!queueStatus?.processing && queueStatus?.queueLength === 0 && (
                    <Badge variant="secondary">Idle</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {queueStatus?.queueLength || 0} items in queue
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchQueueStatus}
                  disabled={isLoadingQueue}
                >
                  {isLoadingQueue ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearQueue}
                  disabled={!queueStatus?.queueLength}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Queue
                </Button>
              </div>
            </div>

            {/* Indexing Statistics */}
            {indexingStats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Indexing Statistics</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchIndexingStats}
                    disabled={isLoadingStats}
                  >
                    {isLoadingStats ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      Pages
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-mono">{indexingStats.pages.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Indexed:</span>
                        <span className="font-mono text-green-600">{indexingStats.pages.indexed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-mono text-orange-600">{indexingStats.pages.pending}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              indexingStats.pages.total > 0
                                ? (indexingStats.pages.indexed / indexingStats.pages.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Bot className="w-4 h-4" />
                      Tickets
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-mono">{indexingStats.tickets.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Indexed:</span>
                        <span className="font-mono text-green-600">{indexingStats.tickets.indexed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-mono text-orange-600">{indexingStats.tickets.pending}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              indexingStats.tickets.total > 0
                                ? (indexingStats.tickets.indexed / indexingStats.tickets.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">Total Indexed: </span>
                    <span className="font-mono">{indexingStats.totalIndexed}</span>
                    <span className="text-muted-foreground mx-2">|</span>
                    <span className="font-medium">Total Pending: </span>
                    <span className="font-mono">{indexingStats.totalPending}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reindex Controls */}
            <div className="pt-4 border-t space-y-4">
              <div>
                <h4 className="font-medium mb-2">Reindex Content</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Regenerate embeddings for all content. Use this after changing embedding providers or models.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReindexPages}
                  disabled={isReindexing}
                >
                  {isReindexing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Reindex All Pages
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReindexTickets}
                  disabled={isReindexing}
                >
                  {isReindexing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Bot className="w-4 h-4 mr-2" />
                  )}
                  Reindex All Tickets
                </Button>
              </div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Semantic Search & RAG"
          description="Advanced AI-powered search and retrieval"
          icon={Search}
          scope="global"
          helpText="RAG (Retrieval Augmented Generation) uses your documentation to provide contextual AI responses"
        >
          <div className="space-y-4">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">New Features Available:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Semantic Search:</strong> Natural language search across all documentation</li>
                    <li><strong>RAG Responses:</strong> AI ticket responses using relevant documentation as context</li>
                    <li><strong>Auto-Embedding:</strong> Automatic background embedding generation for all content</li>
                    <li><strong>Related Documents:</strong> Find documentation related to tickets automatically</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <SettingsRow
              label="Semantic Search Threshold"
              description="Minimum similarity score for search results (0.0-1.0)"
            >
              <Input
                type="number"
                value={localSettings.aiSemanticSearchThreshold || "0.3"}
                onChange={(e) => updateLocal("aiSemanticSearchThreshold", e.target.value)}
                placeholder="0.3"
                className="max-w-24"
                min="0"
                max="1"
                step="0.05"
              />
            </SettingsRow>

            <SettingsRow
              label="RAG Context Documents"
              description="Number of documents to use as context for RAG responses"
            >
              <Input
                type="number"
                value={localSettings.aiRagContextDocs || "5"}
                onChange={(e) => updateLocal("aiRagContextDocs", e.target.value)}
                placeholder="5"
                className="max-w-24"
                min="1"
                max="20"
              />
            </SettingsRow>

            <SettingsRow
              label="RAG Similarity Threshold"
              description="Minimum similarity for documents to be used in RAG context"
            >
              <Input
                type="number"
                value={localSettings.aiRagSimilarityThreshold || "0.25"}
                onChange={(e) => updateLocal("aiRagSimilarityThreshold", e.target.value)}
                placeholder="0.25"
                className="max-w-24"
                min="0"
                max="1"
                step="0.05"
              />
            </SettingsRow>
          </div>
        </SettingsCard>

        {hasChanges && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}

        {selectedEmbeddingProvider === "ollama" && (
          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              Make sure your Ollama instance is running and accessible at the configured URL.
              You can test the connection by visiting the health endpoint.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (subsection === "ai-chat") {
    return (
      <div className="space-y-6">
        <SettingsCard
          title="Chat Models"
          description="Configure AI chat models for conversational features"
          icon={Bot}
          scope="global"
          helpText="Chat models power AI assistants, chatbots, and automated responses"
        >
          <div className="space-y-6">
            <SettingsRow
              label="Provider"
              description="Choose your chat model provider"
            >
              <Select
                value={selectedChatProvider}
                onValueChange={(value) => updateLocal("aiChatProvider", value)}
              >
                <SelectTrigger className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAT_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow
              label="Model"
              description="Select the chat model to use"
            >
              <Select
                value={localSettings.aiChatModel || "gpt-4o"}
                onValueChange={(value) => updateLocal("aiChatModel", value)}
              >
                <SelectTrigger className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAT_MODELS[selectedChatProvider]?.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>

            <SettingsRow
              label="Temperature"
              description="Controls randomness in AI responses (0.0 = deterministic, 2.0 = very creative)"
            >
              <div className="flex items-center gap-4 max-w-sm">
                <Slider
                  value={[temperature]}
                  onValueChange={([value]) => updateLocal("aiChatTemperature", value.toString())}
                  min={0}
                  max={2}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12 text-center">{temperature}</span>
              </div>
            </SettingsRow>

            <SettingsRow
              label="Max Tokens"
              description="Maximum tokens per response"
            >
              <Input
                type="number"
                value={localSettings.aiChatMaxTokens || "2000"}
                onChange={(e) => updateLocal("aiChatMaxTokens", e.target.value)}
                placeholder="2000"
                className="max-w-24"
                min="100"
                max="8000"
              />
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="AI Assistant Features"
          description="Control where AI assistance is available"
          icon={Brain}
          scope="global"
        >
          <div className="space-y-4">
            <SettingsRow
              label="Document Editor AI"
              description="Enable AI assistance in the document editor"
            >
              <Switch
                checked={localSettings.aiAssistantDocEditorEnabled === "true"}
                onCheckedChange={(checked) =>
                  updateLocal("aiAssistantDocEditorEnabled", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow
              label="Ticket Response AI"
              description="Enable AI-suggested responses for tickets"
            >
              <Switch
                checked={localSettings.aiAssistantTicketResponseEnabled === "true"}
                onCheckedChange={(checked) =>
                  updateLocal("aiAssistantTicketResponseEnabled", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow
              label="AI Chatbot"
              description="Enable the AI chatbot for users"
            >
              <Switch
                checked={localSettings.aiAssistantChatbotEnabled === "true"}
                onCheckedChange={(checked) =>
                  updateLocal("aiAssistantChatbotEnabled", checked.toString())
                }
              />
            </SettingsRow>
          </div>
        </SettingsCard>

        {hasChanges && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (subsection === "ai-safety") {
    return (
      <div className="space-y-6">
        <SettingsCard
          title="AI Safety & Compliance"
          description="Content filtering and safety measures"
          icon={AlertCircle}
          scope="global"
        >
          <div className="space-y-4">
            <SettingsRow
              label="Content Safety Filters"
              description="Enable content filtering for AI responses"
            >
              <Switch
                checked={localSettings.aiContentSafetyEnabled === "true"}
                onCheckedChange={(checked) =>
                  updateLocal("aiContentSafetyEnabled", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow
              label="PII Detection"
              description="Detect and redact personally identifiable information"
            >
              <Switch
                checked={localSettings.aiPiiDetectionEnabled === "true"}
                onCheckedChange={(checked) =>
                  updateLocal("aiPiiDetectionEnabled", checked.toString())
                }
              />
            </SettingsRow>

            <SettingsRow
              label="Audit Logging"
              description="Log all AI interactions for compliance"
            >
              <Switch
                checked={localSettings.aiAuditLoggingEnabled === "true"}
                onCheckedChange={(checked) =>
                  updateLocal("aiAuditLoggingEnabled", checked.toString())
                }
              />
            </SettingsRow>
          </div>
        </SettingsCard>

        {hasChanges && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default view when clicking on "AI Configuration" parent (shows overview)
  return (
    <div className="space-y-6">
      <SettingsCard
        title="AI Configuration Overview"
        description="Configure AI models, providers, and features"
        icon={Bot}
        scope="global"
      >
        <div className="space-y-4">
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Select a category from the sidebar to configure:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Embedding Models:</strong> Configure text embedding for semantic search and RAG</li>
                <li><strong>Chat Models:</strong> Set up AI chat and response generation</li>
                <li><strong>Safety & Compliance:</strong> Manage content filtering and audit logging</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </SettingsCard>
    </div>
  );
}
