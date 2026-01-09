import { Cpu, Key, Database, Bot } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsHeader, SettingsCard, SettingsSection, SettingsRow } from "../components";

interface AISettingsProps {
  subsection?: string;
}

export function AISettings({ subsection }: AISettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsHeader
        sectionId={subsection || "ai"}
        title="AI Configuration"
        description="Configure AI models and providers for your organization."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingsCard
          title="Embedding Models"
          description="Configure models used for document vectorization and search."
          icon={Cpu}
        >
          <div className="space-y-4">
            <SettingsRow label="Provider" vertical>
              <Select defaultValue="openai">
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="cohere">Cohere</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="Model" vertical>
              <Select defaultValue="ada-002">
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ada-002">text-embedding-ada-002</SelectItem>
                  <SelectItem value="3-small">text-embedding-3-small</SelectItem>
                  <SelectItem value="3-large">text-embedding-3-large</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="API Key" vertical>
              <Input type="password" placeholder="sk-..." className="font-mono" />
            </SettingsRow>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Chat Models"
          description="Configure the LLM for conversational AI features."
          icon={Bot}
        >
          <div className="space-y-4">
            <SettingsRow label="Provider" vertical>
              <Select defaultValue="openai">
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google AI</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="Model" vertical>
              <Select defaultValue="gpt-4">
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </SettingsRow>
            <SettingsRow label="Temperature" vertical>
              <Input type="number" defaultValue="0.7" step="0.1" min="0" max="2" />
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
              <SettingsRow label="Provider" vertical>
                <Select defaultValue="pinecone">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pinecone">Pinecone</SelectItem>
                    <SelectItem value="weaviate">Weaviate</SelectItem>
                    <SelectItem value="pgvector">PGVector</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsRow>
              <SettingsRow label="Index Name" vertical>
                <Input placeholder="sakura-docs" />
              </SettingsRow>
            </div>
          </SettingsSection>
          <SettingsSection title="Processing">
            <div className="space-y-3">
              <SettingsRow label="Auto-vectorization" description="Automatically index new documents.">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="Enable RAG" description="Use retrieval-augmented generation for AI responses.">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="Chunk Size" vertical>
                <Input type="number" defaultValue="1000" />
              </SettingsRow>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>
    </div>
  );
}
