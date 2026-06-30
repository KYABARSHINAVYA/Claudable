import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { streamManager } from "@/lib/services/stream";
import { createMessage } from "@/lib/services/message";
import { serializeMessage, createRealtimeMessage } from "@/lib/serializers/chat";
import { loadGlobalSettings } from "@/lib/services/settings";
import {
  markUserRequestAsRunning,
  markUserRequestAsCompleted,
  markUserRequestAsFailed,
} from "@/lib/services/user-requests";

interface GeminiFile {
  path: string;
  content: string;
}

interface GeminiPlan {
  summary?: string;
  files?: GeminiFile[];
}

interface GeminiInlineImage {
  path: string;
  mimeType: string;
  data: string;
}

interface GeminiRequestPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

async function getGeminiApiKey(): Promise<string | undefined> {
  try {
    const settings = await loadGlobalSettings();
    const geminiSettings = settings.cli_settings?.gemini;
    if (geminiSettings && typeof geminiSettings === "object") {
      const apiKey = (geminiSettings as Record<string, unknown>).apiKey;
      const googleApiKey = (geminiSettings as Record<string, unknown>).googleApiKey;
      return pickString(apiKey, googleApiKey, process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY);
    }
  } catch (error) {
    console.warn("[GeminiService] Failed to load Gemini settings:", error);
  }

  return pickString(process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY);
}

async function ensureProjectPath(projectPath: string): Promise<string> {
  const absolute = path.isAbsolute(projectPath)
    ? path.resolve(projectPath)
    : path.resolve(process.cwd(), projectPath);
  const allowedBasePath = path.resolve(process.cwd(), process.env.PROJECTS_DIR || "./data/projects");
  const relative = path.relative(allowedBasePath, absolute);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Project path must be within ${allowedBasePath}. Got: ${absolute}`);
  }

  await fs.mkdir(absolute, { recursive: true });
  return absolute;
}

async function listProjectFiles(projectPath: string): Promise<string[]> {
  const results: string[] = [];
  const excluded = new Set(["node_modules", ".next", ".git", "dist", "build"]);

  async function walk(dir: string, prefix = "") {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (excluded.has(entry.name)) continue;
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, relative);
      } else {
        results.push(relative);
      }
      if (results.length >= 80) return;
    }
  }

  await walk(projectPath);
  return results;
}

function extractJson(text: string): GeminiPlan {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return { summary: text.trim(), files: [] };
  }

  try {
    const parsed = JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as GeminiPlan;
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : undefined,
      files: Array.isArray(parsed.files) ? parsed.files : [],
    };
  } catch {
    return { summary: text.trim(), files: [] };
  }
}

function safeFilePath(projectPath: string, filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    throw new Error(`Unsafe file path from Gemini: ${filePath}`);
  }
  const absolute = path.resolve(projectPath, normalized);
  const relative = path.relative(projectPath, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Gemini tried to write outside the project: ${filePath}`);
  }
  return absolute;
}

function inferMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".png":
    default:
      return "image/png";
  }
}

function extractImagePaths(instruction: string): string[] {
  const imagePaths: string[] = [];
  const pattern = /Image #\d+ path:\s*([^\n]+)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(instruction)) !== null) {
    const imagePath = match[1]?.trim();
    if (imagePath) {
      imagePaths.push(imagePath);
    }
  }

  return imagePaths;
}

async function readInlineImages(instruction: string): Promise<GeminiInlineImage[]> {
  const images: GeminiInlineImage[] = [];

  for (const imagePath of extractImagePaths(instruction)) {
    const absolutePath = path.resolve(imagePath);
    try {
      const buffer = await fs.readFile(absolutePath);
      images.push({
        path: absolutePath,
        mimeType: inferMimeType(absolutePath),
        data: buffer.toString("base64"),
      });
    } catch (error) {
      console.warn("[GeminiService] Failed to read uploaded image:", imagePath, error);
    }
  }

  return images;
}

async function callGemini(
  prompt: string,
  model: string,
  apiKey: string,
  images: GeminiInlineImage[] = []
): Promise<string> {
  const parts: GeminiRequestPart[] = [{ text: prompt }];
  for (const image of images) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini request failed with status ${response.status}`);
  }

  return data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("\n") ?? "";
}

async function executeGemini(
  projectId: string,
  projectPath: string,
  instruction: string,
  model = "gemini-1.5-flash",
  requestId?: string
): Promise<void> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key missing. Set GEMINI_API_KEY in .env.local or Global Settings.");
  }

  const absoluteProjectPath = await ensureProjectPath(projectPath);
  const files = await listProjectFiles(absoluteProjectPath);
  const inlineImages = await readInlineImages(instruction);

  const publishStatus = (status: string, message: string) => {
    streamManager.publish(projectId, {
      type: "status",
      data: { status, message, ...(requestId ? { requestId } : {}) },
    });
  };

  try {
    if (requestId) await markUserRequestAsRunning(requestId);
    publishStatus("running", "Gemini is generating project files...");

    const prompt = `
You are a coding agent inside a Next.js project workspace.
Return ONLY valid JSON with this shape:
{
  "summary": "short summary",
  "files": [
    { "path": "relative/file/path.tsx", "content": "complete file content" }
  ]
}

Rules:
- Write complete files, not patches.
- Keep paths relative to the project root.
- Do not include node_modules, .next, dist, build, or .git.
- For new apps, include package.json, README.md, app/page.tsx, app/layout.tsx, app/globals.css, and config files as needed.
- Use Next.js App Router, TypeScript, and Tailwind CSS.

Current project files:
${files.length > 0 ? files.join("\n") : "(empty project)"}

Uploaded images:
${inlineImages.length > 0 ? inlineImages.map((image, index) => `Image ${index + 1}: ${image.path}`).join("\n") : "(none)"}

User request:
${instruction}
`.trim();

    const raw = await callGemini(prompt, model, apiKey, inlineImages);
    console.log("Gemini Raw Response:", raw);
    const plan = extractJson(raw);
    const generatedFiles = (plan.files ?? []).filter(
      (file): file is GeminiFile =>
        typeof file?.path === "string" && typeof file?.content === "string"
    );

    if (generatedFiles.length === 0) {
      throw new Error("Gemini did not return any files to write.");
    }

    for (const file of generatedFiles) {
      const target = safeFilePath(absoluteProjectPath, file.path);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file.content, "utf8");

      const toolMessage = await createMessage({
        projectId,
        role: "tool",
        messageType: "tool_use",
        content: `Created/updated ${file.path}`,
        metadata: { cli_type: "gemini", action: "Created", filePath: file.path },
        cliSource: "gemini",
        requestId,
      });
      streamManager.publish(projectId, {
        type: "message",
        data: serializeMessage(toolMessage, { requestId }),
      });
    }

    const content =
      plan.summary ||
      `Gemini generated ${generatedFiles.length} project file${generatedFiles.length === 1 ? "" : "s"}.`;
    const assistant = await createMessage({
      projectId,
      role: "assistant",
      messageType: "chat",
      content,
      metadata: { cli_type: "gemini", files: generatedFiles.map((file) => file.path) },
      cliSource: "gemini",
      requestId,
    });
    streamManager.publish(projectId, {
      type: "message",
      data: serializeMessage(assistant, { requestId, isFinal: true }),
    });

    publishStatus("completed", "Gemini generation completed");
    if (requestId) await markUserRequestAsCompleted(requestId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini execution failed";
    publishStatus("error", message);
    if (requestId) await markUserRequestAsFailed(requestId, message);
    streamManager.publish(projectId, {
      type: "message",
      data: createRealtimeMessage({
        id: `gemini-error-${requestId ?? randomUUID()}`,
        projectId,
        role: "assistant",
        messageType: "error",
        content: message,
        metadata: { cli_type: "gemini", error: true },
        cliSource: "gemini",
        requestId,
        isFinal: true,
      }),
    });
    throw error;
  }
}

export async function initializeNextJsProject(
  projectId: string,
  projectPath: string,
  initialPrompt: string,
  model = "gemini-1.5-flash",
  requestId?: string
): Promise<void> {
  await executeGemini(projectId, projectPath, initialPrompt, model, requestId);
}

export async function applyChanges(
  projectId: string,
  projectPath: string,
  instruction: string,
  model = "gemini-1.5-flash",
  _sessionId?: string,
  requestId?: string
): Promise<void> {
  await executeGemini(projectId, projectPath, instruction, model, requestId);
}
