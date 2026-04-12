# Composable UI

React frontend for interacting with the [composable-agents](https://github.com/soludev/bricks/composable-agents) API. Provides a chat interface for AI agents with real-time streaming, human-in-the-loop (HITL) tool validation, and full agent management.

## Features

- **Agent management** -- Create, view, configure, and delete agents via YAML file upload
- **Real-time chat** -- Stream AI responses via SSE (Server-Sent Events)
- **Human-in-the-loop** -- Review and approve/reject tool calls before execution
- **Thread history** -- Conversation threads grouped by agent in a sidebar
- **RAG file browser** -- Browse MinIO folders and files with breadcrumb navigation and file metadata display
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
- [mcp-raganything](https://github.com/soludev/bricks/mcp-raganything) API running on port 8020

## Installation

```bash
bun install
```

## Configuration

Configuration is loaded at runtime from `public/config.json`. Copy the example file to get started:

```bash
cp public/config.example.json public/config.json
```

**`public/config.json`** - Application configuration:

| Field | Type | Description |
|---|---|---|
| `apiBaseUrl` | `string` | composable-agents API URL (e.g., `http://localhost:8010`) |
| `ragApiBaseUrl` | `string` (optional) | RAG API URL for MinIO file browsing (e.g., `http://localhost:8020`). Defaults to `apiBaseUrl` if not set. |
| `wsBaseUrl` | `string` | WebSocket URL for streaming (e.g., `ws://localhost:8010`) |

The config is validated with Zod on startup. Invalid configuration will show an error toast.

**Note:** `config.json` is gitignored. Use `config.example.json` as a template.

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
      config/              # AppConfig (Zod-validated)
      rag/                 # FileEntry, FolderEntry
    ports/
      agent/agentPort.ts   # Agent repository interface
      chat/chatPort.ts     # Chat repository interface
      config/configRepository.ts  # Config repository interface
      rag/ragFilePort.ts   # RAG file port interface
  infrastructure/          # External adapters (API clients, config)
    api/
      agent/agentApi.ts    # Agent API adapter (axios)
      chat/chatApi.ts      # Chat API adapter (axios + SSE)
      rag/ragApi.ts        # RAG API adapter (axios)
      axiosInstance.ts     # Shared axios instance
      ragAxiosInstance.ts  # Separate axios client for RAG API
    config/
      configRepositoryInstance.ts  # Singleton config repository
      fileConfigRepository.ts       # File-based config implementation
  application/             # React UI layer
    components/
      agent/               # AgentCard, AgentGrid, CreateAgentDialog, AgentConfigViewer
      chat/                # ChatInput, ChatMessage, HITLReviewPanel, MessageList
      layout/              # MainLayout, ThreadSidebar, TopNav
      rag/                 # BreadcrumbBar, FileList, FileRow, FolderRow
      shared/              # StatusBadge, ToolTag
      ui/                  # shadcn/ui primitives
    hooks/
      agent/               # useAgents, useCreateAgent, useDeleteAgent, useUpdateAgent, useAgentConfig
      chat/                # useThreads, useCreateThread, useDeleteThread, useMessages, useSendMessage, useStreamChat
      config/               # useConfig
      rag/                 # useFolders, useFiles
    pages/
      AgentsPage.tsx       # /agents route
      ChatPage.tsx         # /chat/:threadId? route
      RagPage.tsx          # /rag route
    stores/
      useChatStore.ts      # Zustand store for chat state
public/
  config.example.json      # Example config (committed)
  config.json              # Runtime config (gitignored)
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
| `/rag` | RagPage | Browse MinIO folders and files with breadcrumb navigation |

## CI/CD

- **CI** (on PR): Build + tests + Trivy FS scan + SonarQube analysis
- **CD** (on merge to main): Docker build + push to DockerHub (`kaiohz/pickpro:composable-ui-*`) + Flux image update

## License

Private -- internal use only.
