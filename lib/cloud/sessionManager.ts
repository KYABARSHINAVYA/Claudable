interface Session {
  projectId: string;
  containerId: string;
  workspacePath?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

class SessionManager {
  private sessions = new Map<string, Session>();

  createSession(projectId: string, containerId: string, workspacePath?: string) {
    const now = new Date();
    const session = {
      projectId,
      containerId,
      workspacePath,
      createdAt: now,
      lastActiveAt: now,
    };
    this.sessions.set(projectId, session);
    return session;
  }

  getSession(projectId: string) {
    const session = this.sessions.get(projectId);
    if (session) {
      session.lastActiveAt = new Date();
    }
    return session;
  }

  removeSession(projectId: string) {
    this.sessions.delete(projectId);
  }

  listSessions() {
    return Array.from(this.sessions.values());
  }
}

export const sessionManager = new SessionManager();
