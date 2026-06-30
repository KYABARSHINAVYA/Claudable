import fs from "fs/promises";
import path from "path";

export async function createWorkspace(projectId: string) {
  const workspacePath = path.join(
    process.cwd(),
    "workspaces",
    projectId
  );

  await fs.mkdir(workspacePath, { recursive: true });

  console.log(`Workspace created: ${workspacePath}`);

  return workspacePath;
}

export async function writeFileToWorkspace(
  projectId: string,
  filePath: string,
  content: string
) {
  const fullPath = path.join(
    process.cwd(),
    "workspaces",
    projectId,
    filePath
  );

  const dir = path.dirname(fullPath);

  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(fullPath, content, "utf8");

  console.log(`Created file: ${fullPath}`);
}