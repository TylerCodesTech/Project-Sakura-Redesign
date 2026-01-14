import { useState, useEffect } from "react";
import { Cpu, Bot, Database, Loader2, RefreshCw, AlertCircle, Server } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsHeader, SettingsCard, SettingsSection, SettingsRow } from "../components";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    { value: "snowflake-arctic-embed", label: "snowflake-arctic-embed", dimensions: 1024 },
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
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  ollama: [
    { value: "llama3", label: "Llama 3" },
    { value: "llama3:70b", label: "Llama 3 70B" },
    { value: "mistral", label: "Mistral" },
    { value: "mixtral", label: "Mixtral" },
    { value: "codellama", label: "Code Llama" },
    { value: "phi3", label: "Phi-3" },
  ],
  google: [
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-3-pro-preview", label: "Gemini 3 Pro (Preview)" },
    { value: "gemini-3-flash-preview", label: "Gemini 3 Flash (Preview)" },
  ],
};

export function AISettings({ subsection }: AISettingsProps) {
  const { settings, updateSetting, isLoading } = useSystemSettings();
  const queryClient = useQueryClient();
  
  const [embeddingProvider, setEmbeddingProvider] = useState(settings.aiEmbeddingProvider || "openai");
  const [embeddingModel, setEmbeddingModel] = useState(settings.aiEmbeddingModel || "text-embedding-3-small");
  const [ollamaUrl, setOllamaUrl] = useState(settings.aiOllamaBaseUrl || "http://localhost:11434");
  const [autoVectorization, setAutoVectorization] = useState(settings.aiAutoVectorization === "true");
  const [enableRag, setEnableRag] = useState(settings.aiEnableRag === "true");
  const [chunkSize, setChunkSize] = useState(settings.aiChunkSize || "1000");
  
  const [chatProvider, setChatProvider] = useState(settings.aiChatProvider || "openai");
  const [chatModel, setChatModel] = useState(settings.aiChatModel || "gpt-4");
  const [temperature, setTemperature] = useState(settings.aiChatTemperature || "0.7");

  useEffect(() => {
    setEmbeddingProvider(settings.aiEmbeddingProvider || "openai");
    setEmbeddingModel(settings.aiEmbeddingModel || "text-embedding-3-small");
    setOllamaUrl(settings.aiOllamaBaseUrl || "http://localhost:11434");
    setAutoVectorization(settings.aiAutoVectorization === "true");
    setEnableRag(settings.aiEnableRag === "true");
    setChunkSize(settings.aiChunkSize || "1000");
    setChatProvider(settings.aiChatProvider || "openai");
    setChatModel(settings.aiChatModel || "gpt-4");
    setTemperature(settings.aiChatTemperature || "0.7");
  }, [settings]);

  const handleEmbeddingProviderChange = (value: string) => {
    setEmbeddingProvider(value);
    const models = EMBEDDING_MODELS[value];
    if (models && models.length > 0) {
      setEmbeddingModel(models[0].value);
    }
    updateSetting("aiEmbeddingProvider", value);
    if (models && models.length > 0) {
      updateSetting("aiEmbeddingModel", models[0].value);
      updateSetting("aiEmbeddingDimensions", models[0].dimensions.toString());
    }
  };

  const handleEmbeddingModelChange = (value: string) => {
    setEmbeddingModel(value);
    const model = EMBEDDING_MODELS[embeddingProvider]?.find(m => m.value === value);
    updateSetting("aiEmbeddingModel", value);
    if (model) {
      updateSetting("aiEmbeddingDimensions", model.dimensions.toString());
    }
  };

  const handleChatProviderChange = (value: string) => {
    setChatProvider(value);
    const models = CHAT_MODELS[value];
    if (models && models.length > 0) {
      setChatModel(models[0].value);
    }
    updateSetting("aiChatProvider", value);
    if (models && models.length > 0) {
      updateSetting("aiChatModel", models[0].value);
    }
  };

  const reindexPagesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/embeddings/reindex-pages");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Reindexed ${data.processed} pages${data.errors > 0 ? ` (${data.errors} errors)` : ""}`);
    },
    onError: (error: Error) => {
      toast.error(`Reindex failed: ${error.message}`);
    },
  });

  const reindexTicketsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/embeddings/reindex-tickets");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Reindexed ${data.processed} tickets${data.errors > 0 ? ` (${data.errors} errors)` : ""}`);
    },
    onError: (error: Error) => {
      toast.error(`Reindex failed: ${error.message}`);
    },
  });

  const showOllamaConfig = embeddingProvider === "ollama" || chatProvider === "ollama";
  const currentEmbeddingProvider = EMBEDDING_PROVIDERS.find(p => p.value === embeddingProvider);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "ai"}
        title="AI Configuration"
        description="Configure AI models and providers for your organization."
      />

      {showOllamaConfig && (
        <SettingsCard
          title="Ollama Configuration"
          description="Configure connection to your self-hosted Ollama instance."
          icon={Server}
        >
          <div className="space-y-4">
            <SettingsRow label="Ollama Base URL" description="The URL where your Ollama instance is running." vertical>
              <Input 
                value={ollamaUrl} 
                onChange={(e) => {
                  setOllamaUrl(e.target.value);
                  updateSetting("aiOllamaBaseUrl", e.target.value);
                }}
                placeholder="http://localhost:11434" 
                className="font-mono" 
              />
            </SettingsRow>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure Ollama is running and accessible from this server. You can download embedding models with <code className="bg-muted px-1 rounded">ollama pull nomic-embed-text</code>
              </AlertDescription>
            </Alert>
          </div>
        </SettingsCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingsCard
          title="Embedding Models"
          description="Configure models used for document vectorization and search."
          icon={Cpu}
        >
          <div className="space-y-4">
            <SettingsRow label="Provider" vertical>
              <Select value={embeddingProvider} onValueChange={handleEmbeddingProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {EMBEDDING_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="Model" vertical>
              <Select value={embeddingModel} onValueChange={handleEmbeddingModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {(EMBEDDING_MODELS[embeddingProvider] || []).map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label} ({model.dimensions}d)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>
            {currentEmbeddingProvider?.requiresApiKey && (
              <SettingsRow label="API Key Status" vertical>
                <div className="text-sm text-muted-foreground">
                  API keys are managed through environment variables. 
                  {embeddingProvider === "openai" && " Set OPENAI_API_KEY in Secrets."}
                  {embeddingProvider === "google" && " Set GOOGLE_API_KEY in Secrets."}
                </div>
              </SettingsRow>
            )}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Chat Models"
          description="Configure the LLM for conversational AI features."
          icon={Bot}
        >
          <div className="space-y-4">
            <SettingsRow label="Provider" vertical>
              <Select value={chatProvider} onValueChange={handleChatProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
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
            <SettingsRow label="Model" vertical>
              <Select 
                value={chatModel} 
                onValueChange={(value) => {
                  setChatModel(value);
                  updateSetting("aiChatModel", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {(CHAT_MODELS[chatProvider] || []).map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="Temperature" vertical>
              <Input 
                type="number" 
                value={temperature} 
                onChange={(e) => {
                  setTemperature(e.target.value);
                  updateSetting("aiChatTemperature", e.target.value);
                }}
                step="0.1" 
                min="0" 
                max="2" 
              />
            </SettingsRow>
          </div>
        </SettingsCard>
      </div>

      <SettingsCard
        title="Knowledge Base"
        description="Configure how documents are processed and indexed."
        icon={Database}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsSection title="Vector Database">
            <div className="space-y-4">
              <SettingsRow label="Storage" vertical>
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                  Using PostgreSQL with pgvector extension for vector storage.
                </div>
              </SettingsRow>
              <div className="pt-2 space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => reindexPagesMutation.mutate()}
                  disabled={reindexPagesMutation.isPending}
                >
                  {reindexPagesMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Reindex All Pages
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => reindexTicketsMutation.mutate()}
                  disabled={reindexTicketsMutation.isPending}
                >
                  {reindexTicketsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Reindex All Tickets
                </Button>
              </div>
            </div>
          </SettingsSection>
          <SettingsSection title="Processing">
            <div className="space-y-3">
              <SettingsRow label="Auto-vectorization" description="Automatically index new documents.">
                <Switch 
                  checked={autoVectorization} 
                  onCheckedChange={(checked) => {
                    setAutoVectorization(checked);
                    updateSetting("aiAutoVectorization", checked ? "true" : "false");
                  }}
                />
              </SettingsRow>
              <SettingsRow label="Enable RAG" description="Use retrieval-augmented generation for AI responses.">
                <Switch 
                  checked={enableRag} 
                  onCheckedChange={(checked) => {
                    setEnableRag(checked);
                    updateSetting("aiEnableRag", checked ? "true" : "false");
                  }}
                />
              </SettingsRow>
              <SettingsRow label="Chunk Size" vertical>
                <Input 
                  type="number" 
                  value={chunkSize}
                  onChange={(e) => {
                    setChunkSize(e.target.value);
                    updateSetting("aiChunkSize", e.target.value);
                  }}
                />
              </SettingsRow>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>
    </div>
  );
}
