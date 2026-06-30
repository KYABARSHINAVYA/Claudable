# Cloud-Native Claudable Status

This repository has been adapted toward the internship requirement: run the coding agent from the backend, create isolated project workspaces, stream execution progress to the browser, and support non-Anthropic provider configuration when a paid Claude plan is unavailable.

## Implemented

- Backend chat orchestration in `app/api/chat/[project_id]/act/route.ts`.
- Per-project Docker workspace containers using Dockerode in `lib/cloud/docker.ts`.
- In-memory session tracking in `lib/cloud/sessionManager.ts`.
- Claude Agent SDK integration in `lib/services/cli/claude.ts`.
- Gemini-backed provider configuration in `lib/cloud/provider.ts`.
- GLM/Z.ai agent path in `lib/services/cli/glm.ts`.
- SSE/WebSocket streaming through `lib/services/stream.ts`.
- Project metadata and chat history through Prisma models in `prisma/schema.prisma`.
- Supabase client setup in `lib/supabase/client.ts`.
- Provider settings UI for Gemini agent base URL/API key in Global Settings.

## Provider Setup

The company confirmed that a free provider can be used instead of a paid Claude plan. This implementation now exposes Gemini-facing environment variables and Global Settings fields.

Use a Gemini-backed agent endpoint:

```bash
GEMINI_AGENT_PROVIDER="gemini-compatible"
GEMINI_AGENT_BASE_URL="https://your-gemini-gateway.example.com/anthropic"
GEMINI_API_KEY="your-gemini-api-key"
```

A normal Gemini API key alone is not a drop-in replacement for Claude Code. To preserve the full agentic workflow, use a Gemini-backed compatibility gateway or add a dedicated Gemini CLI agent adapter.

For Z.ai/GLM:

```bash
GLM_ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
ZHIPU_API_KEY="your-glm-key"
```

## Local Verification

```bash
npm install
npm run prisma:generate
npm run type-check
npm run dev
```

Docker Desktop must be running. On first use, the backend pulls `node:20-bookworm` unless a different `CLOUD_WORKSPACE_IMAGE` is configured.

## Assignment Comparison

| Requirement | Current Status |
| --- | --- |
| Cloud/backend agent execution | Implemented via backend route and Claude Agent SDK |
| Isolated containers | Implemented per project with Dockerode |
| No local Claude install for users | Browser users do not install anything; backend owns provider/runtime configuration |
| Agentic workflow | Preserved through the backend agent runtime / GLM runtime |
| Multi-project support | Existing project model plus per-project sessions |
| Supabase auth/metadata | Supabase client exists; Prisma local metadata remains primary in this clone |
| Real-time streaming | Implemented with SSE/WebSocket stream manager |
| Download generated project | Implemented with `GET /api/projects/:project_id/download` |
| Public deployment | Not done in this local clone |
| Demo video | Not done |

## Remaining Before Final Submission

- Deploy frontend/backend publicly.
- Configure production Docker host or container service.
- Confirm Supabase Auth is enabled in the deployed app.
- Add a visible UI button for `GET /api/projects/:project_id/download` if the demo needs one-click download.
- Record the 5-10 minute demo video.
- Rotate any service role keys before publishing the repository.
