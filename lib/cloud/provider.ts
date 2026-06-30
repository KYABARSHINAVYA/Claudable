import { loadGlobalSettings } from "@/lib/services/settings";

export interface CloudProviderConfig {
  provider: string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  env: Record<string, string | undefined>;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

export async function loadClaudeCompatibleProviderConfig(
  model?: string
): Promise<CloudProviderConfig> {
  let settings: Record<string, unknown> = {};

  try {
    const globalSettings = await loadGlobalSettings();
    const claudeSettings = globalSettings.cli_settings?.claude;
    if (claudeSettings && typeof claudeSettings === "object") {
      settings = claudeSettings;
    }
  } catch (error) {
    console.warn("[CloudProvider] Failed to load global Claude provider settings:", error);
  }

  const provider = pickString(
    process.env.GEMINI_AGENT_PROVIDER,
    process.env.GEMINI_PROVIDER,
    process.env.CLAUDE_CODE_PROVIDER,
    settings.provider,
    process.env.ANTHROPIC_PROVIDER,
    "gemini-compatible"
  )!;

  const baseUrl = pickString(
    process.env.GEMINI_AGENT_BASE_URL,
    process.env.GEMINI_CLAUDE_BASE_URL,
    process.env.CLAUDE_CODE_BASE_URL,
    process.env.ANTHROPIC_BASE_URL,
    settings.baseUrl,
    settings.base_url
  );

  const apiKey = pickString(
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GEMINI_AGENT_API_KEY,
    process.env.CLAUDE_CODE_API_KEY,
    process.env.ANTHROPIC_AUTH_TOKEN,
    process.env.ANTHROPIC_API_KEY,
    settings.apiKey,
    settings.api_key
  );

  const configuredModel = pickString(model, settings.model);

  return {
    provider,
    baseUrl,
    apiKey,
    model: configuredModel,
    env: {
      ...process.env,
      ...(apiKey
        ? {
            GEMINI_API_KEY: apiKey,
            GOOGLE_API_KEY: apiKey,
          }
        : {}),
      // The SDK compatibility layer still expects these internal env names.
      // Users configure Gemini-facing variables above; this mapping is adapter glue.
      ...(baseUrl ? { ANTHROPIC_BASE_URL: baseUrl } : {}),
      ...(apiKey
        ? {
            ANTHROPIC_AUTH_TOKEN: apiKey,
            ANTHROPIC_API_KEY: apiKey,
          }
        : {}),
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:
        process.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC ?? "1",
    },
  };
}

export function describeProvider(config: CloudProviderConfig): string {
  const base = config.baseUrl ? ` via ${config.baseUrl}` : "";
  return `${config.provider}${base}`;
}
