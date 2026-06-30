import Dockerode from "dockerode";
import path from "path";

const docker =
  process.platform === "win32"
    ? new Dockerode({ socketPath: "//./pipe/dockerDesktopLinuxEngine" })
    : new Dockerode();

export interface WorkspaceContainer {
  id: string;
  name: string;
  workspacePath: string;
}

function safeContainerName(projectId: string): string {
  return `claudable-${projectId.replace(/[^a-zA-Z0-9_.-]/g, "-")}`;
}

async function ensureImage(image: string): Promise<void> {
  try {
    await docker.getImage(image).inspect();
    return;
  } catch {
    // Pull below.
  }

  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (pullError: Error | null, stream: NodeJS.ReadableStream) => {
      if (pullError) {
        reject(pullError);
        return;
      }

      docker.modem.followProgress(
        stream,
        (progressError: Error | null) => {
          if (progressError) {
            reject(progressError);
          } else {
            resolve();
          }
        }
      );
    });
  });
}

export async function createContainer(projectId: string, workspacePath?: string): Promise<string> {
  const resolvedWorkspacePath = path.resolve(
    workspacePath ?? path.join(process.cwd(), "workspaces", projectId)
  );

  const name = `${safeContainerName(projectId)}-${Date.now()}`;
  const image = process.env.CLOUD_WORKSPACE_IMAGE || "node:20-bookworm";

  await ensureImage(image);

  const container = await docker.createContainer({
    Image: image,
    name,
    Tty: true,
    WorkingDir: "/workspace",
    Cmd: ["sleep", "infinity"],

    HostConfig: {
      Binds: [`${resolvedWorkspacePath}:/workspace`],
      AutoRemove: false,
    },
    Labels: {
      "com.claudable.projectId": projectId,
      "com.claudable.role": "workspace",
    },
  });

  await container.start();

  return container.id;
}

export async function getOrCreateContainer(
  projectId: string,
  workspacePath?: string
): Promise<WorkspaceContainer> {
  const resolvedWorkspacePath = path.resolve(
    workspacePath ?? path.join(process.cwd(), "workspaces", projectId)
  );
  const expectedPrefix = safeContainerName(projectId);

  const containers = await docker.listContainers({
    all: true,
    filters: {
      label: [`com.claudable.projectId=${projectId}`, "com.claudable.role=workspace"],
    },
  });

  const existing = containers.find((container) =>
    container.Names.some((name) => name.replace(/^\//, "").startsWith(expectedPrefix))
  );

  if (existing) {
    const container = docker.getContainer(existing.Id);
    if (existing.State !== "running") {
      await container.start();
    }
    return {
      id: existing.Id,
      name: existing.Names[0]?.replace(/^\//, "") ?? expectedPrefix,
      workspacePath: resolvedWorkspacePath,
    };
  }

  const id = await createContainer(projectId, resolvedWorkspacePath);
  return {
    id,
    name: expectedPrefix,
    workspacePath: resolvedWorkspacePath,
  };
}

export async function stopContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  try {
    await container.stop();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("304") && !message.toLowerCase().includes("not modified")) {
      throw error;
    }
  }
}
