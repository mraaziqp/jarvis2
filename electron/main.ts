import { app, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron';
import * as path from 'path';
import { ScreenshotService } from './services/screenshotService';
import { MailService } from './services/mailService';
import { CommandRunnerService } from './services/commandRunner';
import { SystemMetricsService } from './services/systemMetricsService';
import { LocalAiHybridRouter } from './services/localAiRouter';
import { LiveDirectoryRAGWatcher } from './services/directoryWatcher';
import { NutAutomationService } from './services/nutAutomation';
import { 
  ToolCall, 
  ToolResult, 
  HeartbeatPayload, 
  ScreenshotAndMailParams, 
  HybridPromptRequest 
} from '../src/types/ipc';

let mainWindow: BrowserWindow | null = null;
let paletteWindow: BrowserWindow | null = null;
let wallpaperWindow: BrowserWindow | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

// Core native services
const screenshotService = new ScreenshotService();
const mailService = new MailService();
const commandRunner = new CommandRunnerService();
const metricsService = new SystemMetricsService();
const localAiRouter = new LocalAiHybridRouter();
const ragWatcher = new LiveDirectoryRAGWatcher(localAiRouter);
const nutAutomation = new NutAutomationService();

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1520,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    title: 'Jarvis · Unified Native Workspace & 2.5D Town',
    backgroundColor: '#070b12',
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const isDev = process.env.NODE_ENV !== 'production';
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (heartbeatInterval) clearInterval(heartbeatInterval);
  });

  // Start RAG file watcher over current working directory and src
  ragWatcher.startWatching([process.cwd(), path.join(process.cwd(), 'src')]);
  ragWatcher.setUpdateCallback((evt) => {
    mainWindow?.webContents.send('jarvis:rag:update', evt);
  });

  startHeartbeatLoop();
}

/**
 * Ghost Mode: Command Palette Window (Raycast / Spotlight style overlay)
 */
function createPaletteWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  paletteWindow = new BrowserWindow({
    width: 720,
    height: 480,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    x: Math.round((width - 720) / 2),
    y: 180,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const isDev = process.env.NODE_ENV !== 'production';
  paletteWindow.loadURL(isDev ? 'http://localhost:3000?palette=true' : `file://${path.join(__dirname, '../out/index.html?palette=true')}`);

  paletteWindow.on('blur', () => {
    paletteWindow?.hide();
  });
}

/**
 * Ghost Mode: Desktop Wallpaper Window (Pinned 2.5D Subagent Town beneath windows)
 */
function toggleWallpaperWindow(enable: boolean): boolean {
  if (!enable) {
    if (wallpaperWindow) {
      wallpaperWindow.close();
      wallpaperWindow = null;
    }
    return false;
  }

  if (wallpaperWindow) return true;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  wallpaperWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    type: 'desktop', // pinned to desktop layer
    frame: false,
    transparent: true,
    hasShadow: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Enable click-through so user works seamlessly over it
  wallpaperWindow.setIgnoreMouseEvents(true, { forward: true });

  const isDev = process.env.NODE_ENV !== 'production';
  wallpaperWindow.loadURL(isDev ? 'http://localhost:3000?wallpaper=true' : `file://${path.join(__dirname, '../out/index.html?wallpaper=true')}`);

  return true;
}

function startHeartbeatLoop() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  heartbeatInterval = setInterval(async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    try {
      const metrics = metricsService.getMetrics();
      const isOllamaUp = localAiRouter.getOllamaStatus();
      metrics.ollamaOnline = isOllamaUp;
      metrics.activeWatcherFilesCount = ragWatcher.totalIndexedFiles;

      const heartbeat: HeartbeatPayload = {
        timestamp: Date.now(),
        latencyMs: Math.floor(Math.random() * 6) + 4, // 4-10ms IPC
        transport: 'electron-ipc',
        coreStatus: 'connected',
        nodeMetrics: metrics,
        activeAgentsCount: 3
      };

      mainWindow.webContents.send('jarvis:heartbeat', heartbeat);
    } catch (err) {
      console.error('Error generating heartbeat:', err);
    }
  }, 2500);
}

// Global Hotkeys Setup
function registerGlobalHotkeys() {
  // Alt + Space opens Spotlight Command Palette over any OS app
  const registered = globalShortcut.register('Alt+Space', () => {
    if (!paletteWindow) createPaletteWindow();
    if (paletteWindow?.isVisible()) {
      paletteWindow.hide();
    } else {
      paletteWindow?.show();
      paletteWindow?.focus();
    }
  });

  if (registered) {
    console.log('[Ghost Mode] Global shortcut "Alt+Space" registered for frosted-glass command palette.');
  }
}

// IPC Handlers
ipcMain.handle('jarvis:system:metrics', async () => {
  return metricsService.getMetrics();
});

ipcMain.handle('jarvis:ai:hybrid-route', async (_event, req: HybridPromptRequest) => {
  return localAiRouter.routePrompt(req);
});

ipcMain.handle('jarvis:ghost:toggle-wallpaper', async (_event, enabled: boolean) => {
  return toggleWallpaperWindow(enabled);
});

ipcMain.handle('jarvis:ghost:toggle-palette', async (_event, visible: boolean) => {
  if (!paletteWindow) createPaletteWindow();
  if (visible) paletteWindow?.show();
  else paletteWindow?.hide();
});

ipcMain.handle('jarvis:composite:screenshot-and-mail', async (_event, params: ScreenshotAndMailParams) => {
  try {
    const screenshot = await screenshotService.captureScreen({
      screenIndex: params.screenIndex || 0,
      filenamePrefix: 'jarvis-audit'
    });

    const mail = await mailService.sendMail({
      to: params.to,
      subject: params.subject || `Jarvis Desktop Capture - ${new Date().toLocaleTimeString()}`,
      body: params.body || `Attached is the desktop screenshot captured directly via the native OS Bridge at ${screenshot.filePath}.`,
      attachments: [screenshot.filePath]
    });

    return {
      toolCallId: `call-${Date.now()}`,
      name: 'take_screenshot_and_mail',
      success: true,
      data: { screenshot, mail },
      timestamp: Date.now()
    };
  } catch (err: any) {
    return {
      toolCallId: `call-${Date.now()}`,
      name: 'take_screenshot_and_mail',
      success: false,
      error: err.message,
      timestamp: Date.now()
    };
  }
});

// Structured Tool Call Handler (including Nut.js OS Automation)
ipcMain.handle('jarvis:tool:invoke', async (_event, toolCall: ToolCall<any>) => {
  const { name, params, id } = toolCall;

  try {
    switch (name) {
      case 'take_screenshot': {
        const screenshot = await screenshotService.captureScreen(params);
        return { toolCallId: id, name, success: true, data: screenshot, timestamp: Date.now() };
      }
      case 'send_mail': {
        const mailResult = await mailService.sendMail(params);
        return { toolCallId: id, name, success: true, data: mailResult, timestamp: Date.now() };
      }
      case 'execute_command': {
        const cmdResult = await commandRunner.executeShell(params);
        return { toolCallId: id, name, success: cmdResult.exitCode === 0, data: cmdResult, timestamp: Date.now() };
      }

      // Nut.js Native Automation Tools
      case 'locate_window': {
        const win = await nutAutomation.locateWindow(params);
        return { toolCallId: id, name, success: win.found, data: win, timestamp: Date.now() };
      }
      case 'read_crash_logs': {
        const logs = await nutAutomation.readCrashLogs(params);
        return { toolCallId: id, name, success: true, data: logs, timestamp: Date.now() };
      }
      case 'execute_keyboard_macro': {
        const res = await nutAutomation.executeKeyboardMacro(params);
        return { toolCallId: id, name, success: res.success, data: res, timestamp: Date.now() };
      }
      case 'auto_triage_process': {
        const triage = await nutAutomation.autoTriageProcess(params);
        return { toolCallId: id, name, success: true, data: triage, timestamp: Date.now() };
      }

      default:
        throw new Error(`Unrecognized tool: ${name}`);
    }
  } catch (error: any) {
    return { toolCallId: id, name, success: false, error: error.message, timestamp: Date.now() };
  }
});

app.whenReady().then(() => {
  createMainWindow();
  createPaletteWindow();
  registerGlobalHotkeys();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  ragWatcher.stop();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
