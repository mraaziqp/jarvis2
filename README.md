# Jarvis v2.5: Unified Native Spatial Workspace & 2.5D Subagent Town

> **AI Assistant & Autonomous Orchestrator** for Mohammed (`moh-Vostro-3500`)
> Powered by **Electron, Next.js, React Three Fiber, TypeScript, Tailwind CSS, Local Ollama, and pgvector**.

---

## Architecture Overview

1. **2.5D React Three Fiber (WebGL) Spatial Workspace**
   - High-performance isometric town canvas tailored for NVIDIA RTX 3060 Ti & 32GB RAM.
   - Hardware-accelerated soft shadow maps (`shadow-mapSize={[2048, 2048]}`) and dynamic bloom post-processing on task completion.
   - Physical agent pathfinding across a 3D NavMesh in the `useFrame` render loop, with procedural holographic scaffolding that scales vertically as workloads build.

2. **Local AI Engine & Live Directory RAG**
   - Hybrid routing system in Electron connecting to a local Ollama instance (`127.0.0.1:11434`) for continuous, zero-latency background triage, log parsing, and self-healing.
   - Heavier cloud models (Claude 3.5 Sonnet, Gemini Pro) reserved for complex reasoning and planning.
   - Filesystem watcher (`chokidar`) in Electron monitors active development directories. On save, files are automatically chunked, embedded, and indexed into local PostgreSQL `pgvector`.

3. **Ghost Mode & Global Omnipresence**
   - Headless frosted-glass Command Palette (Raycast/Spotlight style) summoned via global shortcut `Alt + Space` over any active operating system application.
   - Desktop Wallpaper Pinning (`type: 'desktop'`, `transparent: true`, `ignoreMouseEvents: true`) pins the living 3D Subagent Town directly underneath desktop windows.

4. **Advanced OS Automation (`@nut-tree/nut-js`)**
   - Native window locator by title regex and foreground focus.
   - Crash log reader across project traces and system temp directories.
   - Automated keyboard macros and self-healing restart loops.

5. **Zero-Desync Atomic State Core**
   - Centralized Zustand state store (`useJarvisStore`) synchronizing WebRTC/WebSocket/IPC heartbeats across navbar, modals, cards, and canvas simultaneously.

---

## Project Structure

```text
second-brain/
├── electron/
│   ├── main.ts                     # Main process: Window management, Ghost mode, Hotkeys
│   ├── preload.ts                  # Secure context isolation bridge (`window.jarvisAPI`)
│   └── services/
│       ├── localAiRouter.ts        # Ollama local/cloud hybrid AI router
│       ├── directoryWatcher.ts     # Chokidar live directory watcher & pgvector RAG
│       ├── nutAutomation.ts        # Nut.js native window & keyboard automation
│       ├── screenshotService.ts    # Native desktop capture engine
│       ├── mailService.ts          # SMTP / Nodemailer email pipeline
│       ├── commandRunner.ts        # Whitelisted system command execution
│       └── systemMetricsService.ts # CPU / RAM / Disk telemetry collector
├── src/
│   ├── app/
│   │   ├── globals.css             # Tailwind cyber aesthetic tokens
│   │   ├── layout.tsx              # Root HTML wrapper
│   │   └── page.tsx                # Entrypoint rendering JarvisWorkspace
│   ├── components/
│   │   ├── canvas3d/
│   │   │   ├── SubagentTown3D.tsx  # 2.5D Canvas wrapper & HUD controls
│   │   │   ├── TownScene.tsx       # Three.js scene, camera & Bloom effects
│   │   │   ├── NavMeshGrid.tsx     # 3D walkable ground grid & data highways
│   │   │   ├── BuildingMesh.tsx    # 3D buildings with rising scaffolds
│   │   │   └── SubagentMesh.tsx    # 3D agent avatars with useFrame pathfinding
│   │   ├── canvas/
│   │   │   └── SubagentTown.tsx    # 2D Canvas fallback engine
│   │   ├── drawers/
│   │   │   ├── ChatDrawer.tsx      # Slide-out chat with tool confirmation cards
│   │   │   ├── MemoryDrawer.tsx    # Slide-out pgvector memory facts manager
│   │   │   └── CapabilitiesDrawer.tsx # Slide-out node telemetry & HANDS status
│   │   ├── hud/
│   │   │   └── AgentInspectorHUD.tsx # Real-time agent inspector HUD
│   │   ├── overlay/
│   │   │   └── SpotlightCommandPalette.tsx # Alt+Space frosted-glass palette
│   │   └── layout/
│   │       ├── UnifiedHeader.tsx   # Synchronized status navbar
│   │       └── JarvisWorkspace.tsx # Master layout orchestrator
│   ├── services/
│   │   ├── toolSchema.ts           # Tool schemas & natural language intent parser
│   │   └── vectorMemory.ts         # pgvector client with in-memory fallback
│   ├── store/
│   │   └── useJarvisStore.ts       # Central atomic Zustand store
│   └── types/
│       └── ipc.ts                  # Shared TypeScript interfaces & IPC contracts
├── .env.example                    # Environment configuration template
├── package.json                    # Dependencies & build scripts
├── tailwind.config.js              # Theme colors & cyber design tokens
├── tsconfig.json                   # Next.js TypeScript config
└── tsconfig.electron.json          # Electron TypeScript config
```

---

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start Next.js and Electron concurrently
npm run dev
```
