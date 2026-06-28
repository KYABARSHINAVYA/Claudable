import { createContainer } from "../lib/cloud/docker";

async function main() {
  const containerId = await createContainer("workspace-test");

  console.log("Container ID:", containerId);
}

main();