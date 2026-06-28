export class SessionManager {
  async createSession(projectId: string) {
    console.log(`Creating session for ${projectId}`);
  }

  async endSession(projectId: string) {
    console.log(`Ending session for ${projectId}`);
  }
}