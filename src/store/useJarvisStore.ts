import { create } from 'zustand';
import { 
  ConnectionState, 
  SystemMetrics, 
  HeartbeatPayload, 
  SubagentEntity, 
  TownBuilding, 
  ToolCall, 
  ToolResult,
  AgentVectorMemory 
} from '../types/ipc';

interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: string;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
  status?: 'pending' | 'executing' | 'approved' | 'rejected' | 'completed' | 'error';
}

interface JarvisState {
  // 1. Unified Connection & Heartbeat State (Zero Desync)
  coreStatus: ConnectionState;
  lastHeartbeatTime: number;
  heartbeatLatencyMs: number;
  transportType: 'electron-ipc' | 'websocket' | 'webrtc' | 'offline';
  systemMetrics: SystemMetrics;
  powerMode: 'balanced' | 'eco' | 'performance';

  // 2. Spatial Layout & Comprehensive Navigation
  activeTab: string; // e.g. 'canvas', 'chat', 'dashboard', 'assistant', 'ide-copilot', 'document', 'spreadsheet', etc.
  subTab: 'home' | 'overview' | 'ecosystem' | 'agents' | 'projects' | 'fleet';
  activeDrawer: 'none' | 'chat' | 'memory' | 'capabilities' | 'alerts' | 'agent-detail';
  selectedAgentId: string | null;
  canvasZoom: number;

  // 3. Subagent Town Living Ecosystem
  agents: SubagentEntity[];
  buildings: TownBuilding[];

  // 4. Chat & Tool Execution
  messages: ChatMessage[];
  pendingToolCalls: ToolCall[];
  allowedCommands: string[];

  // 5. User Profile & Preferences
  userPreferences: {
    username: string;
    prefersBulletPoints: boolean;
    numberedDeploymentSteps: boolean;
    directAnswersNoPreamble: boolean;
    defaultScreenshotDir: string;
    notificationEmail: string;
  };

  // Actions
  setConnectionStatus: (status: ConnectionState, transport?: 'electron-ipc' | 'websocket' | 'webrtc') => void;
  recordHeartbeat: (heartbeat: HeartbeatPayload) => void;
  checkHeartbeatLiveness: () => void;
  setActiveDrawer: (drawer: JarvisState['activeDrawer']) => void;
  setActiveTab: (tab: string) => void;
  setSubTab: (subTab: JarvisState['subTab']) => void;
  setPowerMode: (mode: JarvisState['powerMode']) => void;
  setSelectedAgent: (agentId: string | null) => void;
  setCanvasZoom: (zoom: number) => void;

  // Subagent Actions
  spawnAgent: (params: { name: string; role: SubagentEntity['role']; task: string; buildingCategory?: TownBuilding['category'] }) => string;
  updateAgentProgress: (agentId: string, progress: number, state?: SubagentEntity['state']) => void;
  completeAgentTask: (agentId: string, summary: string) => void;
  attachAgentMemory: (agentId: string, memory: AgentVectorMemory) => void;

  // Chat & Execution Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  queueToolCall: (toolCall: ToolCall) => void;
  approveToolCall: (toolCallId: string) => Promise<ToolResult | null>;
  rejectToolCall: (toolCallId: string) => void;
  updateToolResult: (toolCallId: string, result: ToolResult) => void;
}

const INITIAL_BUILDINGS: TownBuilding[] = [
  { id: 'bld-core', name: 'Jarvis Core Matrix', category: 'core', x: 400, y: 300, position3D: { x: 0, y: 0, z: 0 }, width: 140, height: 110, depth3D: 3.2, progress: 100, status: 'active', assignedAgentIds: [] },
  { id: 'bld-forge', name: 'Data Forge & Pipelines', category: 'data_forge', x: 180, y: 160, position3D: { x: -8.8, y: 0, z: -5.6 }, width: 120, height: 90, depth3D: 2.8, progress: 95, status: 'active', assignedAgentIds: [] },
  { id: 'bld-workshop', name: 'Code & Build Workshop', category: 'workshop', x: 640, y: 170, position3D: { x: 9.6, y: 0, z: -5.2 }, width: 125, height: 95, depth3D: 3.0, progress: 85, status: 'idle', assignedAgentIds: [] },
  { id: 'bld-sentry', name: 'Triage Sentry Outpost', category: 'sentry', x: 220, y: 440, position3D: { x: -7.2, y: 0, z: 5.6 }, width: 110, height: 85, depth3D: 2.6, progress: 100, status: 'active', assignedAgentIds: [] },
  { id: 'bld-archive', name: 'pgvector Memory Vault', category: 'archive', x: 600, y: 430, position3D: { x: 8.0, y: 0, z: 5.2 }, width: 130, height: 100, depth3D: 3.1, progress: 100, status: 'active', assignedAgentIds: [] },
];

const INITIAL_AGENTS: SubagentEntity[] = [
  {
    id: 'agent-sentinel-1',
    name: 'Sentinel-Prime',
    role: 'triage_sentry',
    state: 'working',
    currentTask: 'Scanning network ports and service health check (13 endpoints)',
    progress: 74,
    x: 230,
    y: 430,
    targetX: 230,
    targetY: 430,
    position3D: { x: -6.8, y: 0.8, z: 5.2 },
    target3D: { x: -6.8, y: 0.8, z: 5.2 },
    color: '#10b981',
    targetBuildingId: 'bld-sentry',
    recentMemories: [
      { id: 'mem-1', agentId: 'agent-sentinel-1', taskId: 'port-scan', actionText: 'Port 3000 verified healthy. Tailscale tunnel stable.', coordinates: { x: 230, y: 430 }, timestamp: 'Just now' }
    ]
  },
  {
    id: 'agent-forge-2',
    name: 'Architect-Dex',
    role: 'code_builder',
    state: 'building',
    currentTask: 'Synthesizing Electron IPC bridges and tool schemas',
    progress: 88,
    x: 630,
    y: 190,
    targetX: 630,
    targetY: 190,
    position3D: { x: 9.2, y: 0.8, z: -4.4 },
    target3D: { x: 9.2, y: 0.8, z: -4.4 },
    color: '#00f2fe',
    targetBuildingId: 'bld-workshop',
    recentMemories: [
      { id: 'mem-2', agentId: 'agent-forge-2', taskId: 'ipc-bridge', actionText: 'Preload context bridge initialized with strict isolation.', coordinates: { x: 630, y: 190 }, timestamp: '2m ago' }
    ]
  },
  {
    id: 'agent-memory-3',
    name: 'Mnemosyne-V',
    role: 'memory_curator',
    state: 'idle',
    currentTask: 'Standing by for semantic vector indexing',
    progress: 100,
    x: 590,
    y: 420,
    targetX: 590,
    targetY: 420,
    position3D: { x: 7.6, y: 0.8, z: 4.8 },
    target3D: { x: 7.6, y: 0.8, z: 4.8 },
    color: '#8b5cf6',
    targetBuildingId: 'bld-archive',
    recentMemories: [
      { id: 'mem-3', agentId: 'agent-memory-3', taskId: 'vector-sync', actionText: '25 personal memories and preference vectors indexed.', coordinates: { x: 590, y: 420 }, timestamp: '5m ago' }
    ]
  }
];

export const useJarvisStore = create<JarvisState>((set, get) => ({
  // Single Source of Truth for Status
  coreStatus: 'connected',
  lastHeartbeatTime: Date.now(),
  heartbeatLatencyMs: 12,
  transportType: typeof window !== 'undefined' && window.jarvisAPI ? 'electron-ipc' : 'websocket',
  
  // Hardware Profile: 11th Gen Intel i5 Laptop with 16GB RAM & Intel Iris Xe
  systemMetrics: {
    hostname: 'moh-Vostro-3500 (local)',
    os: 'Windows 11 Pro 64-bit',
    cpuModel: '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz',
    gpuModel: 'Intel(R) Iris(R) Xe Graphics',
    uptimeSeconds: 84920,
    cpuLoadPercentage: 18,
    memoryUsedPercentage: 68,
    memoryTotalGb: 16,
    diskUsedPercentage: 72,
    diskTotalGb: 512,
    tailscaleIp: '100.102.44.82',
    isAwake: true,
    capabilitiesCount: 20,
    ollamaOnline: true,
    batteryStatus: {
      isCharging: true,
      percentage: 88
    }
  },
  powerMode: 'balanced',

  activeTab: 'canvas', // Default to Jarvis Core Canvas
  subTab: 'home',
  activeDrawer: 'none',
  selectedAgentId: 'agent-sentinel-1',
  canvasZoom: 1.0,

  agents: INITIAL_AGENTS,
  buildings: INITIAL_BUILDINGS,

  messages: [
    {
      id: 'msg-init-1',
      sender: 'jarvis',
      content: 'Welcome back, Mohammed. Jarvis Core v2.5 is online on your 11th Gen i5 laptop (16GB RAM). Responsive top bar and 2.5D spatial workspace calibrated.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  pendingToolCalls: [],
  allowedCommands: ['lock', 'screenshot', 'play/pause', 'next', 'mute', 'dir', 'git status'],

  userPreferences: {
    username: 'Mohammed',
    prefersBulletPoints: true,
    numberedDeploymentSteps: true,
    directAnswersNoPreamble: true,
    defaultScreenshotDir: 'C:/Users/G997629/Pictures/Jarvis',
    notificationEmail: 'mraaziqp@gmail.com'
  },

  setConnectionStatus: (status, transport) => {
    set((state) => ({
      coreStatus: status,
      transportType: transport || state.transportType,
      lastHeartbeatTime: Date.now()
    }));
  },

  recordHeartbeat: (heartbeat) => {
    set((state) => ({
      coreStatus: heartbeat.coreStatus,
      lastHeartbeatTime: Date.now(),
      heartbeatLatencyMs: heartbeat.latencyMs,
      transportType: heartbeat.transport,
      systemMetrics: {
        ...state.systemMetrics,
        ...heartbeat.nodeMetrics,
        isAwake: true
      }
    }));
  },

  checkHeartbeatLiveness: () => {
    const { lastHeartbeatTime, coreStatus } = get();
    const elapsed = Date.now() - lastHeartbeatTime;

    if (elapsed > 8000 && coreStatus !== 'disconnected') {
      set({ coreStatus: 'disconnected' });
    } else if (elapsed > 3500 && coreStatus === 'connected') {
      set({ coreStatus: 'degraded' });
    }
  },

  setActiveDrawer: (drawer) => set({ activeDrawer: drawer }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSubTab: (subTab) => set({ subTab: subTab }),
  setPowerMode: (mode) => set({ powerMode: mode }),
  setSelectedAgent: (agentId) => set({ selectedAgentId: agentId }),
  setCanvasZoom: (zoom) => set({ canvasZoom: Math.max(0.6, Math.min(1.8, zoom)) }),

  spawnAgent: ({ name, role, task, buildingCategory }) => {
    const id = `agent-${Date.now()}`;
    const buildings = get().buildings;
    const targetBuilding = buildings.find(b => b.category === (buildingCategory || 'workshop')) || buildings[0];

    const colors: Record<SubagentEntity['role'], string> = {
      triage_sentry: '#10b981',
      code_builder: '#00f2fe',
      network_scanner: '#f59e0b',
      mail_dispatcher: '#ec4899',
      memory_curator: '#8b5cf6'
    };

    const newAgent: SubagentEntity = {
      id,
      name,
      role,
      state: 'working',
      currentTask: task,
      progress: 5,
      x: 400 + (Math.random() * 40 - 20),
      y: 300 + (Math.random() * 40 - 20),
      targetX: targetBuilding.x + (Math.random() * 40 - 20),
      targetY: targetBuilding.y + (Math.random() * 40 - 20),
      position3D: { x: (Math.random() * 2 - 1), y: 0.8, z: (Math.random() * 2 - 1) },
      target3D: { x: targetBuilding.position3D.x + (Math.random() * 1.5 - 0.75), y: 0.8, z: targetBuilding.position3D.z + (Math.random() * 1.5 - 0.75) },
      color: colors[role] || '#00f2fe',
      targetBuildingId: targetBuilding.id,
      recentMemories: [
        {
          id: `mem-${Date.now()}`,
          agentId: id,
          taskId: task,
          actionText: `Agent dispatched to execute: ${task}`,
          coordinates: { x: targetBuilding.x, y: targetBuilding.y },
          timestamp: 'Just now'
        }
      ]
    };

    set((state) => ({
      agents: [...state.agents, newAgent],
      selectedAgentId: id
    }));

    return id;
  },

  updateAgentProgress: (agentId, progress, state) => {
    set((s) => ({
      agents: s.agents.map((ag) => {
        if (ag.id !== agentId) return ag;
        return {
          ...ag,
          progress,
          state: state || (progress >= 100 ? 'completed' : ag.state)
        };
      })
    }));
  },

  completeAgentTask: (agentId, summary) => {
    set((s) => ({
      agents: s.agents.map((ag) => {
        if (ag.id !== agentId) return ag;
        return {
          ...ag,
          state: 'completed',
          progress: 100,
          currentTask: `Finished: ${summary}`,
          recentMemories: [
            {
              id: `mem-${Date.now()}`,
              agentId,
              taskId: 'completion',
              actionText: summary,
              coordinates: { x: ag.x, y: ag.y },
              timestamp: 'Just now'
            },
            ...ag.recentMemories
          ]
        };
      })
    }));
  },

  attachAgentMemory: (agentId, memory) => {
    set((s) => ({
      agents: s.agents.map((ag) => {
        if (ag.id !== agentId) return ag;
        return {
          ...ag,
          recentMemories: [memory, ...ag.recentMemories.slice(0, 8)]
        };
      })
    }));
  },

  addMessage: (msg) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullMsg: ChatMessage = {
      ...msg,
      id,
      timestamp
    };

    set((state) => ({
      messages: [...state.messages, fullMsg]
    }));

    return id;
  },

  queueToolCall: (toolCall) => {
    set((state) => ({
      pendingToolCalls: [...state.pendingToolCalls, toolCall]
    }));
  },

  approveToolCall: async (toolCallId) => {
    const tool = get().pendingToolCalls.find(t => t.id === toolCallId);
    if (!tool) return null;

    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.filter(t => t.id !== toolCallId),
      messages: state.messages.map(m => m.toolCall?.id === toolCallId ? { ...m, status: 'executing' } : m)
    }));

    let result: ToolResult;
    if (typeof window !== 'undefined' && window.jarvisAPI) {
      result = await window.jarvisAPI.invokeTool(tool);
    } else {
      await new Promise(r => setTimeout(r, 600));
      result = {
        toolCallId: tool.id,
        name: tool.name,
        success: true,
        data: { message: `Simulated local execution of ${tool.name} on Intel i5 laptop.` },
        timestamp: Date.now()
      };
    }

    get().updateToolResult(toolCallId, result);
    return result;
  },

  rejectToolCall: (toolCallId) => {
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.filter(t => t.id !== toolCallId),
      messages: state.messages.map(m => m.toolCall?.id === toolCallId ? { ...m, status: 'rejected' } : m)
    }));
  },

  updateToolResult: (toolCallId, result) => {
    set((state) => ({
      messages: state.messages.map(m => {
        if (m.toolCall?.id === toolCallId) {
          return {
            ...m,
            toolResult: result,
            status: result.success ? 'completed' : 'error'
          };
        }
        return m;
      })
    }));
  }
}));
