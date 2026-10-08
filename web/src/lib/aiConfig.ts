export type ProviderId = "anthropic" | "openai" | "google" | "none";
export type TaskKind = "chat" | "document" | "reasoning";

export const PROVIDERS: {
  id: ProviderId;
  label: string;
  models: Record<TaskKind, string[]>;
}[] = [
  {
    id: "openai",
    label: "OpenAI",
    models: {
      chat: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
      document: ["gpt-4o", "gpt-4.1"],
      reasoning: ["o4-mini", "o3-mini", "gpt-4.1"],
    },
  },
  {
    id: "anthropic",
    label: "Anthropic",
    models: {
      chat: ["claude-3-5-haiku-latest", "claude-sonnet-4-20250514", "claude-3-5-sonnet-latest"],
      document: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-latest"],
      reasoning: ["claude-sonnet-4-20250514", "claude-opus-4-20250514"],
    },
  },
  {
    id: "google",
    label: "Google",
    models: {
      chat: ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"],
      document: ["gemini-2.0-flash", "gemini-2.5-pro"],
      reasoning: ["gemini-2.5-pro", "gemini-2.0-flash"],
    },
  },
];

export type AiSettings = {
  defaultProvider: ProviderId;
  fallbackProvider: ProviderId | "none";
  modelOverrides: Partial<Record<ProviderId, Partial<Record<TaskKind, string>>>>;
  updatedAt?: string;
  updatedBy?: string | null;
  /** optional edge function URL for real LLM calls */
  edgeFunctionUrl?: string | null;
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  defaultProvider: "openai",
  fallbackProvider: "none",
  modelOverrides: {},
  edgeFunctionUrl: null,
};
