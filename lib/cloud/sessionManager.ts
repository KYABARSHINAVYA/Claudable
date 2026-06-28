interface Session {
  projectId: string;
  containerId: string;
  createdAt: Date;
}

class SessionManager {
  private sessions = new Map<string, Session>();

  createSession(projectId: string, containerId: string) {
    this.sessions.set(projectId, {
      projectId,
      containerId,
      createdAt: new Date(),
    });
  }

  getSession(projectId: string) {
    return this.sessions.get(projectId);
  }

  removeSession(projectId: string) {
    this.sessions.delete(projectId);
  }

  listSessions() {
    return Array.from(this.sessions.values());
  }
}

export const sessionManager = new SessionManager();