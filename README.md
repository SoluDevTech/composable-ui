# Composable UI

React frontend for interacting with the [composable-agents](https://github.com/soludev/bricks/composable-agents) API. Provides a chat interface for AI agents with real-time streaming, human-in-the-loop (HITL) tool validation, and full agent management.

## Features

- **Agent management** — Create, view, configure, and delete agents via YAML file upload
- **Real-time chat with trace timeline** — Stream AI responses via SSE as `TraceEvent`s and render a per-turn timeline (thinking, content, tool calls, subagent panels)
- **Human-in-the-loop** — Review and approve/reject tool calls before execution
- **Thread history** -- Conversation threads grouped by agent in a sidebar
- **RAG file browser** -- Browse MinIO folders and files with breadcrumb navigation and file metadata display. Create new folders (`CreateFolderDialog` triggered by the "New folder" button in the RAG browse tab) and delete files or folders via a trash-icon row action confirmed through a `ConfirmDeleteDialog`. Folder deletion is recursive and targets the MinIO prefix; file deletion targets a single object. Both calls hit the `POST /api/v1/files/folders` and `DELETE /api/v1/files` / `DELETE /api/v1/files/folders` endpoints exposed by `mcp-raganything`. Multi-file upload with drag-and-drop and folder upload support (see [File upload](#file-upload)).
- **Tetris design system** -- Dark arcade visual language aligned with the Open Design `composable` maquette: magenta accent, Press Start 2P applied to all text (display, body, labels, buttons, nav, chat), block shadows, and `steps(2, end)` easing. Light theme toggle available from the Settings page.
- **Settings** -- A dedicated `/settings` page (4 cards: Theme, Chat, LLM Provider, Reset) backed by a persisted Zustand store and aligned to the Open Design maquette via `data-od-id` QA attributes.

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19 + TypeScript
- **Build**: Vite 8
- **Styling**: Tailwind CSS 4 + shadcn/ui + Framer Motion + lucide-react icons
- **State**: Zustand (local) + TanStack React Query (server)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier

## Design System

The UI implements the **Tetris** design system derived from the [Open Design](https://opencode.ai) `composable` project maquette. Source-of-truth artifacts live under the Open Design project (`DESIGN.md`, `composable-tokens.css`, `app.html`, `styles.css`).

### Visual language

- **Theme**: Dark arcade (default) with a light alternative. Toggle from the Settings page (`/settings` > Theme card). The active toggle persists to `localStorage["composable-ui-settings"]`; the legacy `composable-ui-theme` key is still written by `useThemeStore` for anti-FOUC during boot but is no longer driven by the UI.
- **Colors**: near-black ink background (`#050816`), ink-blue surfaces (`#10162a`), one electric-magenta accent (`#ff00ff`), terminal-style semantic colors (`--success` green, `--warn` yellow, `--danger` red). Light theme uses the same token names with accessible light values.
- **Typography**: `Press Start 2P` is now applied to all text — display, body, labels, buttons, nav, and chat — bringing the UI to full parity with the Open Design maquette. Mono uppercase with `0.1em` tracking for badges/tags.
- **Shape**: sharp corners (`0px` radius) everywhere; icon buttons are now `rounded-none` (previously `rounded-full`) to match the maquette. The only round elements are the Switch toggle and the sidebar avatar (`--radius-pill`).
- **Elevation**: hard block shadows (`4px 4px 0` black for buttons, `0 18px 0` for raised panels) — never soft diffuse shadows. Primary buttons collapse their shadow on `:active` via `translate(4px, 4px)`.
- **Motion**: `steps(2, end)` easing for an arcade hard-cut feel. Durations `80ms` (fast) / `140ms` (base). All animations disabled under `prefers-reduced-motion: reduce`.
- **Icons**: [lucide-react](https://lucide.dev) throughout (tree-shakeable, consistent with shadcn/ui).

### Token layer

CSS custom properties live in `src/application/index.css` under `:root` (light) and `:root.dark` (dark, default). Tailwind v4 `@theme` maps them to utilities (`bg-bg`, `bg-surface`, `text-fg`, `border-border`, `bg-accent`, `font-display`, `shadow-raised`, `ease-standard`, `animate-*`, etc.). Custom utilities: `.block-shadow`, `.block-shadow-raised`, `.focus-ring`, `.cursor-blink`, `.scan-effect`, `.spin`, `.view-enter`.

### Layout

The app shell faithfully reproduces the maquette: a 220px left `Sidebar` (brand, nav, footer) + `MainHeader` (sticky, mobile menu button + route-derived title only — the header right side is now empty) + a scrollable `main` content area. The sidebar exposes a `System` section with a `Settings` nav link (`data-od-id="nav-settings"`). On mobile (`<768px`) the sidebar becomes off-canvas with a backdrop. The chat view adds a 260px `ThreadSidebar` inside a `chat-layout` grid (hidden below `lg:1024px`).

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

| Field           | Type                | Description                                                                                               |
| --------------- | ------------------- | --------------------------------------------------------------------------------------------------------- |
| `apiBaseUrl`    | `string`            | composable-agents API URL (e.g., `http://localhost:8010`)                                                 |
| `ragApiBaseUrl` | `string` (optional) | RAG API URL for MinIO file browsing (e.g., `http://localhost:8020`). Defaults to `apiBaseUrl` if not set. |
| `wsBaseUrl`     | `string`            | WebSocket URL for streaming (e.g., `ws://localhost:8010`)                                                 |

The config is validated with Zod on startup. Invalid configuration will show an error toast.

**Note:** `config.json` is gitignored. Use `config.example.json` as a template.

## Settings

The `/settings` page groups user preferences into four cards, all wired to the persisted `useSettingsStore` (Zustand, `localStorage["composable-ui-settings"]`). The page and its controls carry `data-od-id` attributes for QA parity with the Open Design `composable` maquette.

- **Theme** -- Accent color picker (hex input that live-updates the `--accent` CSS variable), surface shade select, and the dark/light mode switch (the toggle previously in the header now lives here).
- **Chat** -- Message font size (range slider, 10-18px) and message font family (`Press Start 2P` / Monospace / Mono / Georgia).
- **LLM Provider** -- Provider select (`anthropic` / `openai` / `google` / `mistral` / `local` / `ollama`) and an API key field (password type, stored in `localStorage` only — never sent to the backend).
- **Reset** -- "Reset to Defaults" button that restores all settings to their initial values.

The theme toggle is now owned by `useSettingsStore`; the legacy `useThemeStore` (`composable-ui-theme` key) is still present for boot-time anti-FOUC but is no longer driven by the UI and is slated for removal in a future refactor.

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
      chat/                # Message, Thread, ChatRequest, TraceEvent (6 types: human_message, ai_message, thinking, content, tool_call, tool_result), ThreadHistory
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
      chat/chatApi.ts      # Chat API adapter (axios + SSE, emits TraceEvent)
      rag/ragApi.ts        # RAG API adapter (axios)
      axiosInstance.ts     # Shared axios instance
      ragAxiosInstance.ts  # Separate axios client for RAG API
    config/
      configRepositoryInstance.ts  # Singleton config repository
      fileConfigRepository.ts       # File-based config implementation
  application/             # React UI layer
    components/
      agent/               # AgentCard, AgentGrid, CreateAgentDialog, AgentConfigViewer
      chat/                # ChatInput, ChatMessage, MessageList, HITLReviewPanel, ThinkingBlock, ToolCallBadge, ToolResultBlock, SubagentPanel
      layout/              # AppShell, Sidebar (System section + Settings nav), MainHeader (mobile menu + title only), ThreadSidebar
      rag/                 # BreadcrumbBar, FileList, FileRow, FolderRow, CreateFolderDialog, ConfirmDeleteDialog, FileContentPanel, IndexActionMenu, QueryPanel, QueryResults, QueryOptions, RagTabBar, UploadButton, WorkspaceSelector
      settings/            # SettingsPage cards (Theme, Chat, LLMProvider, Reset)
      shared/              # SegmentedToggle, StatusBadge, ToolTag
      ui/                  # shadcn/ui primitives (Tetris-themed)
    hooks/
      agent/               # useAgents, useCreateAgent, useDeleteAgent, useUpdateAgent, useAgentConfig
      chat/                # useThreads, useCreateThread, useDeleteThread, useThreadHistory, useSendMessage, useStreamChat
      config/               # useConfig
      rag/                 # useFolders, useFiles, useReadFile, useUploadFile, useCreateFolder, useDeleteFile, useDeleteFolder, useClassicalIndexFile, useClassicalIndexFolder, useClassicalQuery
    pages/
      AgentsPage.tsx       # /agents route
      ChatPage.tsx         # /chat/:threadId? route
      RagPage.tsx          # /rag route
      SettingsPage.tsx     # /settings route (Theme, Chat, LLM Provider, Reset cards)
    stores/
      useChatStore.ts      # Zustand store for chat state
      useSettingsStore.ts  # Zustand store for Settings page (theme, accent, chat, LLM, persisted to "composable-ui-settings")
      useThemeStore.ts     # Legacy Zustand store for theme (dark/light) + persistence (still used for boot-time anti-FOUC)
      useSidebarStore.ts   # Zustand store for mobile sidebar open/close
public/
  config.example.json      # Example config (committed)
  config.json              # Runtime config (gitignored)
tests/
  unit/                    # Mirrors src/ structure
  fixtures/                # Test data
  utils/                   # Test helpers (custom render)
```

## Routes

| Path               | Page         | Description                                                                    |
| ------------------ | ------------ | ------------------------------------------------------------------------------ |
| `/`                | --           | Redirects to `/chat`                                                           |
| `/agents`          | AgentsPage   | List, create, view, and delete agents                                          |
| `/chat/:threadId?` | ChatPage     | Chat with agents, streaming responses, HITL validation                         |
| `/rag`             | RagPage      | Browse MinIO folders and files with breadcrumb navigation                      |
| `/settings`        | SettingsPage | Theme, chat, LLM provider, and reset preferences (persisted to `localStorage`) |

## RAG File Browser

The `/rag` page provides a MinIO-backed file browser with three tabs: Browse, Query, and Classical. The browse tab uses breadcrumb navigation driven by `useFolders` and `useFiles`, and supports the following file/folder management actions alongside read and upload:

- **Create folder** -- The "New folder" button opens a `CreateFolderDialog` that collects a folder name, then calls `useCreateFolder` which posts `POST /api/v1/files/folders` to `mcp-raganything`. The folder is created as a 0-byte trailing-slash object.
- **Delete file** -- Each `FileRow` exposes a trash-icon action that opens a `ConfirmDeleteDialog`. On confirm, `useDeleteFile` calls `DELETE /api/v1/files?object_name=...&working_dir=...` with the currently selected `working_dir` from the `WorkspaceSelector`, and invalidates the file list query. Both MinIO object and pgvector vectors are deleted (MinIO first, then pgvector).
- **Delete folder** -- Each `FolderRow` exposes a trash-icon action that opens a `ConfirmDeleteDialog` warning that the deletion is recursive. On confirm, `useDeleteFolder` calls `DELETE /api/v1/files/folders?prefix=...` and invalidates both the folder and file queries. The `prefix` is used as the `working_dir` for pgvector cleanup — no separate `working_dir` parameter is sent. Both MinIO objects and pgvector vectors are deleted (MinIO first, then pgvector).

The selected file's content is rendered by `FileContentPanel` via `useReadFile` (`POST /api/v1/files/read`).

### File upload

The `UploadButton` and surrounding browse section now support multi-file upload with drag-and-drop:

- **Multi-file selection** -- The `UploadButton` input has `multiple` enabled, so the native file picker lets users select several files at once. All selected files are queued for upload to the current `working_dir`.
- **Drag-and-drop** -- The entire browse section (file list area) is a drop zone. Users can drag files from their file explorer directly onto the list area instead of using the Upload button.
- **Folder upload via drag-and-drop** -- Users can drag a whole folder from their file explorer onto the browse section. The folder structure is preserved in MinIO via `webkitRelativePath` (each file's relative path within the dropped folder is used as its object key), so nested sub-foldolders are recreated under the current `working_dir`.
- **Concurrency** -- Uploads are limited to **3 simultaneous requests** to avoid overloading the backend. Files are dequeued from the pending queue as slots free up.
- **Partial failure handling** -- If some files upload successfully and others fail, a toast reports the split: "X uploaded, Y failed". Individual per-file errors are logged to the console.
- **Accepted extensions** -- The accepted file extensions list is aligned with the backend allow-list: `.pdf`, `.doc`, `.docx`, `.txt`, `.md`, `.csv`, `.xlsx`, `.xls`, `.ppt`, `.pptx`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.bmp`, `.rtf`, `.odt`, `.ods`.

### Indexing without a working_dir (Bug 1)

Attempting to index a file or folder from the `IndexActionMenu` when no `working_dir` is selected in the `WorkspaceSelector` previously triggered an empty error or a silent failure. The action now short-circuits and surfaces a toast: "Set a working_dir in the workspace selector first". No request is sent to the backend.

### FileContentPanel null-safety (Bug 2)

`FileContentPanel` previously crashed when the `POST /files/read` response returned `metadata: null` or `tables: null`, or when the `content` field was returned as an array of page strings (Kreuzberg multi-page output). The component now:

- Treats `metadata` and `tables` as optional, rendering an empty state instead of throwing.
- Renders `content` as a pages array when the API returns `string[]` (concatenated with a blank line), and as a plain string otherwise.
- Renders each entry in `tables` as a markdown string when it is a `string`, or via the existing `{ markdown }` shape when it is an object.

## Trace Event Model

The chat now consumes `TraceEvent`s from the backend (replacing the old `StreamEvent`). Each event has one of 6 types: `human_message`, `ai_message`, `thinking`, `content`, `tool_call`, `tool_result`. The `source` field distinguishes the parent agent (`null`) from a named sub-agent.

### Streaming components

- **`MessageList`** — uses `useThreadHistory` to fetch `GET /threads/{id}/history` and renders a timeline per turn. During streaming, the in-progress turn is rendered as a `StreamingTurn` block with sub-agent events grouped by `source`.
- **`ChatMessage`** — accepts an `events` prop to render the intermediate timeline (thinking, tool calls, tool results) beneath the AI message.
- **`ThinkingBlock`** — accepts a `source` prop and displays "Thinking — {source}" when the event comes from a sub-agent.
- **`ToolCallBadge`** — collapsable badge for a `tool_call` event, color-coded by `source`.
- **`ToolResultBlock`** — collapsable terminal-style block for a `tool_result` event.
- **`SubagentPanel`** — dedicated panel for a sub-agent (header, thinking, tool calls, content), grouped by `source`.

### Store

`useChatStore` now manages a `StreamingTurn` object instead of two simple strings:

- `events` — accumulated `TraceEvent`s for the current turn.
- `parentContent` / `parentThinking` — aggregated text for the parent agent.
- `subagents` — map of sub-agent name -> `{ content, thinking, toolCalls, toolResults }`.

### Structured response during streaming

When an agent is configured with a `response_format`, the backend attaches the structured payload to the `AI_MESSAGE` event's `content` (as a JSON-serialized `Message`), not to `metadata`. The frontend extracts it via the `getStructuredResponseFromAIEvent(ev)` helper in `traceEvent.ts`, which returns a `StructuredResponseResult` discriminated union:

| Variant     | Condition                                                | Rendered as                                                          |
| ----------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| `valid`     | `AI_MESSAGE.content` parses and contains a structured response | `<StructuredResponseCard>` (JSON display)                      |
| `malformed` | `AI_MESSAGE.content` is not valid JSON                   | Inline error block: "Malformed JSON: \<error\>"                     |
| `missing`   | No structured response in the parsed `Message`          | "No structured response" placeholder — **only** if the agent has a `response_format` configured (via the `agentHasResponseFormat` prop on `StructuredResponseLive`); otherwise nothing is rendered |

The `StructuredResponseLive` component consumes this result and renders the appropriate case during streaming. The `agentHasResponseFormat` boolean is passed in from the agent configuration so the `missing` placeholder is suppressed for agents that never declare a `response_format`.

## Breaking Changes

- **`StreamEvent` removed** — replaced by `TraceEvent` (6 types). SSE parsing in `chatApi.ts` updated accordingly.
- **`useMessages` hook removed** — replaced by `useThreadHistory` (fetches `GET /threads/{id}/history`).
- **`useChatStore` refactored** — now exposes a `StreamingTurn` instead of separate `content` / `thinking` strings.

## CI/CD

- **CI** (on PR): Build + tests + Trivy FS scan + SonarQube analysis
- **CD** (on merge to main): Docker build + push to DockerHub (`kaiohz/pickpro:composable-ui-*`) + Flux image update

## License

Private -- internal use only.
