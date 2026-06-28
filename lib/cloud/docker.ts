import Dockerode from "dockerode";
import path from "path";

const docker = new Dockerode({
  socketPath: "//./pipe/dockerDesktopLinuxEngine"
});

export async function createContainer(projectId: string) {
  const workspacePath = path.resolve(
    process.cwd(),
    `workspaces/${projectId}`
  );

  const container = await docker.createContainer({
    Image: "node:20",
    name: `claudable-${projectId}-${Date.now()}`,
    Tty: true,
    Cmd: ["tail", "-f", "/dev/null"],

    HostConfig: {
      Binds: [`${workspacePath}:/workspace`]
    }
  });

  await container.start();

  return container.id;
}