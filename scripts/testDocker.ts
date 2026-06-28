import { createContainer } from "../lib/cloud/docker";
import { sessionManager } from "../lib/cloud/sessionManager";

async function test() {
  const c1 = await createContainer("project-1");
  const c2 = await createContainer("project-2");

  sessionManager.createSession("project-1", c1);
  sessionManager.createSession("project-2", c2);

  console.log(sessionManager.listSessions());
}

test();