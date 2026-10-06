/**
 * Comprehensive IPC & System Automation Contracts for Jarvis v2.0 & v2.5D
 */

export type ConnectionState = 'connected' | 'connecting' | 'degraded' | 'disconnected';

export interface SystemMetrics {
  hostname: string;
  os: string;
  uptimeSeconds: number;
  cpuLoadPercentage: number;
  memoryUsedPercentage: number;
  memoryTotalGb: number;
  diskUsedPercentage: number;
  diskTotalGb: number;
  tailscaleIp?: string;
  isAwake: boolean;
  capabilitiesCount: number;
  ollamaOnline?: boolean;
  activeWatcherFilesCount?: number;
}

export interface HeartbeatPayload {
  timestamp: number;
  latencyMs: number;
  transport: 'electron-ipc' | 'websocket' | 'webrtc';
  coreStatus: ConnectionState;
  nodeMetrics: SystemMetrics;
  activeAgentsCount: number;
}

// Tool Call Contract
export interface ToolCall<T = Record<string, unknown>> {
  id: string;
  name: string;
  params: T;
  requiresConfirmation?: boolean;
}

export interface ToolResult<T = unknown> {
  toolCallId: string;
  name: string;
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Screenshot & Mail
export interface ScreenshotParams {
  format?: 'png' | 'jpg';
  targetDirectory?: string;
  filenamePrefix?: string;
  screenIndex?: number;
}

export interface ScreenshotResult {
  filePath: string;
  fileName: string;
  dimensions: { width: number; height: number };
  base64Preview?: string;
  capturedAt: string;
}

export interface SendMailParams {
  to: string;
  subject: string;
  body: string;
  attachments?: string[];
  cc?: string;
}

export interface SendMailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  timestamp: string;
}

export interface ScreenshotAndMailParams {
  to: string;
  subject?: string;
  body?: string;
  screenIndex?: number;
}

// Nut.js Advanced OS Automation Types
export interface LocateWindowParams {
  titleRegex: string;
  bringToFront?: boolean;
}

export interface LocateWindowResult {
  found: boolean;
  title: string;
  region?: { left: number; top: number; width: number; height: number };
}

export interface ReadCrashLogsParams {
  sourcePath?: string;
  processName?: string;
  maxLines?: number;
}

export interface ReadCrashLogsResult {
  lines: string[];
  matchedErrorSignature?: string;
  filePath: string;
}

export interface KeyboardMacroParams {
  sequence: Array<{
    type: 'type' | 'press' | 'release' | 'hotkey' | 'delay';
    text?: string;
    key?: string;
    keys?: string[];
    ms?: number;
  }>;
}

export interface KeyboardMacroResult {
  success: boolean;
  executedStepsCount: number;
}

export interface AutoTriageProcessParams {
  processName: string;
  logPath?: string;
  restartCommand?: string;
}

// Local Ollama & Hybrid AI Router Types
export type ModelTier = 'local-ollama' | 'cloud-claude' | 'cloud-gemini';

export interface HybridPromptRequest {
  prompt: string;
  systemPrompt?: string;
  taskCategory?: 'routine_triage' | 'log_parsing' | 'codebase_rag' | 'complex_reasoning' | 'creative_planning';
  preferLocal?: boolean;
}

export interface HybridInferenceResult {
  response: string;
  modelUsed: string;
  tier: ModelTier;
  durationMs: number;
  tokenCount?: number;
  routedReason: string;
}

// Directory RAG & Chokidar Watcher Types
export interface WatchedDirectoryConfig {
  path: string;
  extensions: string[];
  debounceMs: number;
}

export interface CodebaseEmbeddingRecord {
  id: string;
  filePath: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  updatedAt: string;
}

// Subagent & 3D Town Spatial Types
export type AgentState = 'idle' | 'working' | 'building' | 'error' | 'completed';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface AgentVectorMemory {
  id: string;
  agentId: string;
  taskId: string;
  actionText: string;
  embedding?: number[];
  coordinates: { x: number; y: number };
  coordinates3D?: Vector3D;
  timestamp: string;
  similarity?: number;
}

export interface SubagentEntity {
  id: string;
  name: string;
  role: 'triage_sentry' | 'code_builder' | 'network_scanner' | 'mail_dispatcher' | 'memory_curator';
  state: AgentState;
  currentTask: string;
  progress: number;
  // 2D & 3D coordinates
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  position3D: Vector3D;
  target3D: Vector3D;
  waypoints3D?: Vector3D[];
  color: string;
  targetBuildingId?: string;
  recentMemories: AgentVectorMemory[];
}

export interface TownBuilding {
  id: string;
  name: string;
  category: 'core' | 'workshop' | 'sentry' | 'archive' | 'data_forge' | 'comms';
  x: number;
  y: number;
  position3D: Vector3D;
  width: number;
  height: number;
  depth3D: number;
  progress: number;
  status: 'idle' | 'active' | 'upgrading';
  assignedAgentIds: string[];
}

// Window Bridge Declaration
export interface JarvisBridgeAPI {
  invokeTool: <P = Record<string, unknown>, R = unknown>(toolCall: ToolCall<P>) => Promise<ToolResult<R>>;
  getSystemMetrics: () => Promise<SystemMetrics>;
  sendScreenshotAndMail: (params: ScreenshotAndMailParams) => Promise<ToolResult<{ screenshot: ScreenshotResult; mail: SendMailResult }>>;
  routeInference: (req: HybridPromptRequest) => Promise<HybridInferenceResult>;
  toggleWallpaperMode: (enabled: boolean) => Promise<boolean>;
  toggleCommandPalette: (visible: boolean) => Promise<void>;
  subscribeHeartbeat: (callback: (heartbeat: HeartbeatPayload) => void) => () => void;
  subscribeAgentEvents: (callback: (event: { type: string; agent: Partial<SubagentEntity> }) => void) => () => void;
  subscribeRAGUpdates: (callback: (event: { event: string; path: string }) => void) => () => void;
}

declare global {
  interface Window {
    jarvisAPI?: JarvisBridgeAPI;
  }
}
