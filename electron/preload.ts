import { contextBridge, ipcRenderer } from 'electron';
import { 
  ToolCall, 
  ToolResult, 
  SystemMetrics, 
  HeartbeatPayload, 
  ScreenshotAndMailParams, 
  ScreenshotResult, 
  SendMailResult,
  HybridPromptRequest,
  HybridInferenceResult,
  JarvisBridgeAPI 
} from '../src/types/ipc';

const jarvisAPI: JarvisBridgeAPI = {
  invokeTool: <P = Record<string, unknown>, R = unknown>(toolCall: ToolCall<P>): Promise<ToolResult<R>> => {
    return ipcRenderer.invoke('jarvis:tool:invoke', toolCall);
  },

  getSystemMetrics: (): Promise<SystemMetrics> => {
    return ipcRenderer.invoke('jarvis:system:metrics');
  },

  sendScreenshotAndMail: (params: ScreenshotAndMailParams): Promise<ToolResult<{ screenshot: ScreenshotResult; mail: SendMailResult }>> => {
    return ipcRenderer.invoke('jarvis:composite:screenshot-and-mail', params);
  },

  routeInference: (req: HybridPromptRequest): Promise<HybridInferenceResult> => {
    return ipcRenderer.invoke('jarvis:ai:hybrid-route', req);
  },

  toggleWallpaperMode: (enabled: boolean): Promise<boolean> => {
    return ipcRenderer.invoke('jarvis:ghost:toggle-wallpaper', enabled);
  },

  toggleCommandPalette: (visible: boolean): Promise<void> => {
    return ipcRenderer.invoke('jarvis:ghost:toggle-palette', visible);
  },

  subscribeHeartbeat: (callback: (heartbeat: HeartbeatPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: HeartbeatPayload) => {
      callback(payload);
    };
    ipcRenderer.on('jarvis:heartbeat', handler);
    return () => {
      ipcRenderer.removeListener('jarvis:heartbeat', handler);
    };
  },

  subscribeAgentEvents: (callback: (event: { type: string; agent: any }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, eventData: any) => {
      callback(eventData);
    };
    ipcRenderer.on('jarvis:agent:event', handler);
    return () => {
      ipcRenderer.removeListener('jarvis:agent:event', handler);
    };
  },

  subscribeRAGUpdates: (callback: (event: { event: string; path: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, eventData: any) => {
      callback(eventData);
    };
    ipcRenderer.on('jarvis:rag:update', handler);
    return () => {
      ipcRenderer.removeListener('jarvis:rag:update', handler);
    };
  }
};

contextBridge.exposeInMainWorld('jarvisAPI', jarvisAPI);
