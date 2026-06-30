import { CLAUDE_DEFAULT_MODEL, CLAUDE_MODEL_DEFINITIONS, getClaudeModelDisplayName, normalizeClaudeModelId } from './claudeModels';
import { CODEX_DEFAULT_MODEL, CODEX_MODEL_DEFINITIONS, getCodexModelDisplayName, normalizeCodexModelId } from './codexModels';
import { CURSOR_DEFAULT_MODEL, CURSOR_MODEL_DEFINITIONS, getCursorModelDisplayName, normalizeCursorModelId } from './cursorModels';
import { QWEN_DEFAULT_MODEL, QWEN_MODEL_DEFINITIONS, getQwenModelDisplayName, normalizeQwenModelId } from './qwenModels';
import { GLM_DEFAULT_MODEL, GLM_MODEL_DEFINITIONS, getGLMModelDisplayName, normalizeGLMModelId } from './glmModels';
import type { CLAUDE_MODEL_DEFINITIONS as _Guard } from './claudeModels'; // Ensure module side effects preserved

type CLIKey = 'claude' | 'codex' | 'cursor' | 'gemini' | 'qwen' | 'glm';

type ModelDefinition = {
  id: string;
  name: string;
  description?: string;
  supportsImages?: boolean;
};

export const GEMINI_DEFAULT_MODEL = 'gemini-1.5-flash';

export const GEMINI_MODEL_DEFINITIONS: ModelDefinition[] = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', supportsImages: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', supportsImages: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', supportsImages: true },
];

const GEMINI_MODEL_ALIASES: Record<string, string> = {
  gemini: GEMINI_DEFAULT_MODEL,
  'gemini-flash': GEMINI_DEFAULT_MODEL,
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-15-flash': 'gemini-1.5-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-15-pro': 'gemini-1.5-pro',
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-20-flash': 'gemini-2.0-flash',
};

function normalizeGeminiModelId(model?: string | null): string {
  if (!model) {
    return GEMINI_DEFAULT_MODEL;
  }
  const normalized = model.trim().toLowerCase();
  return GEMINI_MODEL_ALIASES[normalized] ?? GEMINI_DEFAULT_MODEL;
}

function getGeminiModelDisplayName(modelId?: string | null): string {
  const normalized = normalizeGeminiModelId(modelId);
  return GEMINI_MODEL_DEFINITIONS.find(model => model.id === normalized)?.name ?? normalized;
}

const DEFAULT_MODELS: Record<CLIKey, string> = {
  claude: CLAUDE_DEFAULT_MODEL,
  codex: CODEX_DEFAULT_MODEL,
  cursor: CURSOR_DEFAULT_MODEL,
  gemini: GEMINI_DEFAULT_MODEL,
  qwen: QWEN_DEFAULT_MODEL,
  glm: GLM_DEFAULT_MODEL,
};

const MODEL_DEFINITIONS: Record<CLIKey, ModelDefinition[]> = {
  claude: CLAUDE_MODEL_DEFINITIONS,
  codex: CODEX_MODEL_DEFINITIONS,
  cursor: CURSOR_MODEL_DEFINITIONS,
  gemini: GEMINI_MODEL_DEFINITIONS,
  qwen: QWEN_MODEL_DEFINITIONS,
  glm: GLM_MODEL_DEFINITIONS,
};

export function getDefaultModelForCli(cli: string | null | undefined): string {
  if (!cli) {
    return CLAUDE_DEFAULT_MODEL;
  }
  const normalized = cli.toLowerCase() as CLIKey;
  return DEFAULT_MODELS[normalized] ?? CLAUDE_DEFAULT_MODEL;
}

export function normalizeModelId(cli: string | null | undefined, model?: string | null): string {
  if (!cli) {
    return normalizeClaudeModelId(model);
  }
  switch (cli.toLowerCase()) {
    case 'codex':
      return normalizeCodexModelId(model);
    case 'cursor':
      return normalizeCursorModelId(model);
    case 'gemini':
      return normalizeGeminiModelId(model);
    case 'qwen':
      return normalizeQwenModelId(model);
    case 'glm':
      return normalizeGLMModelId(model);
    case 'claude':
    default:
      return normalizeClaudeModelId(model);
  }
}

export function getModelDisplayName(cli: string | null | undefined, modelId?: string | null): string {
  if (!cli) {
    return getClaudeModelDisplayName(normalizeClaudeModelId(modelId));
  }

  switch (cli.toLowerCase()) {
    case 'codex':
      return getCodexModelDisplayName(modelId);
    case 'cursor':
      return getCursorModelDisplayName(modelId);
    case 'gemini':
      return getGeminiModelDisplayName(modelId);
    case 'qwen':
      return getQwenModelDisplayName(modelId);
    case 'glm':
      return getGLMModelDisplayName(modelId);
    case 'claude':
    default:
      return getClaudeModelDisplayName(normalizeClaudeModelId(modelId));
  }
}

export function getModelDefinitionsForCli(cli: string | null | undefined): ModelDefinition[] {
  if (!cli) {
    return MODEL_DEFINITIONS.claude;
  }
  const normalized = cli.toLowerCase() as CLIKey;
  return MODEL_DEFINITIONS[normalized] ?? MODEL_DEFINITIONS.claude;
}
