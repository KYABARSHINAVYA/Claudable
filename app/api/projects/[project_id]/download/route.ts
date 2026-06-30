import { NextRequest, NextResponse } from "next/server";
import { Readable, PassThrough } from "stream";
import path from "path";
import fs from "fs/promises";
import { getProjectById } from "@/lib/services/project";

const archiver = require("archiver");

interface RouteContext {
  params: Promise<{ project_id: string }>;
}

const EXCLUDED_NAMES = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  ".turbo",
]);

async function assertProjectDirectory(projectId: string): Promise<{ name: string; repoPath: string }> {
  const project = await getProjectById(projectId);
  if (!project?.repoPath) {
    throw new Error("Project not found");
  }

  const repoPath = path.resolve(project.repoPath);
  const projectsDir = path.resolve(process.cwd(), process.env.PROJECTS_DIR || "./data/projects");
  const relative = path.relative(projectsDir, repoPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Project path is outside the allowed projects directory");
  }

  const stat = await fs.stat(repoPath);
  if (!stat.isDirectory()) {
    throw new Error("Project workspace is not a directory");
  }

  return {
    name: project.name || projectId,
    repoPath,
  };
}

function safeArchiveName(name: string): string {
  return `${name.replace(/[^a-zA-Z0-9_.-]/g, "-") || "project"}.zip`;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { project_id } = await params;
    const project = await assertProjectDirectory(project_id);

    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = new PassThrough();

    archive.on("error", (error: Error) => {
      output.destroy(error);
    });

    archive.pipe(output);
    archive.glob("**/*", {
      cwd: project.repoPath,
      dot: true,
      ignore: Array.from(EXCLUDED_NAMES).flatMap((name) => [name, `${name}/**`]),
    });
    archive.finalize();

    return new Response(Readable.toWeb(output) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeArchiveName(project.name)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to download project";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
