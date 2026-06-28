# Current Architecture

User Browser
↓
Claudable Frontend
↓
API Routes
↓
Claude Agent SDK (query())
↓
Local Claude Runtime

# Target Architecture

User Browser
↓
Claudable Frontend
↓
Session Manager API
↓
Docker Container
↓
Claude Agent SDK (query())
↓
Claude Runtime inside container