# Composable UI

React frontend for interacting with the [composable-agents](https://github.com/soludev/bricks/composable-agents) API. Provides a chat interface for AI agents with real-time streaming, human-in-the-loop (HITL) tool validation, and full agent management.

## Features

- **Agent management** -- Create, view, configure, and delete agents via YAML file upload
- **Real-time chat** -- Stream AI responses via SSE (Server-Sent Events)
- **Human-in-the-loop** -- Review and approve/reject tool calls before execution
- **Thread history** -- Conversation threads grouped by agent in a sidebar
- **Material Design 3** -- Inspired design system with shadcn/ui components

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19 + TypeScript
- **Build**: Vite 8
- **Styling**: Tailwind CSS 4 + shadcn/ui + Framer Motion
- **State**: Zustand (local) + TanStack React Query (server)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [composable-agents](https://github.com/soludev/bricks/composable-agents) API running on port 8010

## Installation

```bash
bun install
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8010` | composable-agents API URL |
| `VITE_WS_BASE_URL` | `ws://localhost:8010` | WebSocket URL for streaming |

The Vite dev server proxies `/api` requests to the API automatically (see `vite.config.ts`).

## Running

```bash
# Development (port 8030)
bun run dev

# Production build
bun run build

# Preview production build
bun run preview
```

## Testing

```bash
bun run test            # Run all tests
bun run test:watch      # Watch mode
bun run test:ui         # Vitest UI
bun run test:coverage   # With coverage report
```

## Linting and Formatting

```bash
bun run lint            # Run ESLint
bun run lint:fix        # Auto-fix lint issues
bun run format          # Format with Prettier
bun run format:check    # Check formatting
```

## Docker

Multi-stage build: `bun` (install + build) then `nginx:alpine` (serve).

```bash
# Build image
docker build -t kaiohz/pickpro:composable-ui-latest .

# Run container (port 8030 -> nginx on 80)
docker run -p 8030:80 kaiohz/pickpro:composable-ui-latest
```

For the full stack, use the Docker Compose setup in `soludev-compose-apps/bricks`.

## Security Scans

```bash
make trivy-fs              # Trivy filesystem scan (CRITICAL/HIGH/MEDIUM)
make trivy-fs-critical     # Trivy filesystem scan (CRITICAL only, exit code 1)
make trivy-image           # Trivy image scan
make trivy-image-critical  # Trivy image scan (CRITICAL only, exit code 1)
```

## Project Structure

```
src/
  domain/                  # Business entities and port interfaces
    entities/
      agent/               # AgentConfig, AgentConfigMetadata, McpServerConfig
      chat/                # Message, Thread, ChatRequest
    ports/
      agent/agentPort.ts   # Agent repository interface
      chat/chatPort.ts     # Chat repository interface
  infrastructure/          # External adapters (API clients, config)
    api/
      agent/agentApi.ts    # Agent API adapter (axios)
      chat/chatApi.ts      # Chat API adapter (axios + SSE)
      axiosInstance.ts     # Shared axios instance
    config/envConfig.ts    # Environment variables
  application/             # React UI layer
    components/
      agent/               # AgentCard, AgentGrid, CreateAgentDialog, AgentConfigViewer
      chat/                # ChatInput, ChatMessage, HITLReviewPanel, MessageList
      layout/              # MainLayout, ThreadSidebar, TopNav
      shared/              # StatusBadge, ToolTag
      ui/                  # shadcn/ui primitives
    hooks/
      agent/               # useAgents, useCreateAgent, useDeleteAgent, useUpdateAgent, useAgentConfig
      chat/                # useThreads, useCreateThread, useDeleteThread, useMessages, useSendMessage, useStreamChat
    pages/
      AgentsPage.tsx       # /agents route
      ChatPage.tsx         # /chat/:threadId? route
    stores/
      useChatStore.ts      # Zustand store for chat state
tests/
  unit/                    # Mirrors src/ structure
  fixtures/                # Test data
  utils/                   # Test helpers (custom render)
```

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | -- | Redirects to `/chat` |
| `/agents` | AgentsPage | List, create, view, and delete agents |
| `/chat/:threadId?` | ChatPage | Chat with agents, streaming responses, HITL validation |

## CI/CD

- **CI** (on PR): Build + tests + Trivy FS scan + SonarQube analysis
- **CD** (on merge to main): Docker build + push to DockerHub (`kaiohz/pickpro:composable-ui-*`) + Flux image update

## License

Private -- internal use only.
