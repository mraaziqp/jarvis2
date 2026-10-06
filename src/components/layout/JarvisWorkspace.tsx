'use client';

import React, { useEffect, useState } from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { UnifiedHeader } from './UnifiedHeader';
import { SubagentTown3D } from '../canvas3d/SubagentTown3D';
import { SubagentTown } from '../canvas/SubagentTown';
import { AgentInspectorHUD } from '../hud/AgentInspectorHUD';
import { ChatDrawer } from '../drawers/ChatDrawer';
import { MemoryDrawer } from '../drawers/MemoryDrawer';
import { CapabilitiesDrawer } from '../drawers/CapabilitiesDrawer';
import { SpotlightCommandPalette } from '../overlay/SpotlightCommandPalette';
import { 
  Layers, 
  Activity, 
  Sparkles, 
  Terminal, 
  Box, 
  Laptop, 
  FileText, 
  Table, 
  Calendar, 
  BookOpen, 
  Users, 
  Settings as SettingsIcon, 
  Code2, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu 
} from 'lucide-react';

export const JarvisWorkspace: React.FC = () => {
  const { 
    activeTab, 
    subTab,
    recordHeartbeat, 
    checkHeartbeatLiveness, 
    agents, 
    buildings,
    systemMetrics,
    messages
  } = useJarvisStore();

  const [use3DMode, setUse3DMode] = useState(true);
  const [isPaletteMode, setIsPaletteMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('palette') === 'true') {
        setIsPaletteMode(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.jarvisAPI) {
      const unsubHeartbeat = window.jarvisAPI.subscribeHeartbeat((payload) => {
        recordHeartbeat(payload);
      });
      return () => unsubHeartbeat();
    } else {
      const timer = setInterval(() => {
        checkHeartbeatLiveness();
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [recordHeartbeat, checkHeartbeatLiveness]);

  if (isPaletteMode) {
    return (
      <div className="w-screen h-screen bg-transparent overflow-hidden flex items-center justify-center">
        <SpotlightCommandPalette />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-cyber-950 text-slate-100 font-sans">
      {/* 1. Never-Cutoff Responsive Navigation Header */}
      <UnifiedHeader />

      {/* 2. Main Workspace Dynamic Screen */}
      <main className="flex-1 relative overflow-hidden flex">
        
        {/* TAB: Jarvis Core (Main Canvas & 2.5D Town) */}
        {activeTab === 'canvas' && (
          <div className="w-full h-full relative">
            {use3DMode ? <SubagentTown3D /> : <SubagentTown />}
            <AgentInspectorHUD />

            {/* 3D vs 2D Mode Switcher (Great for laptop battery savings) */}
            <div className="absolute top-4 right-44 z-20">
              <button
                onClick={() => setUse3DMode(!use3DMode)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyber-900/85 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:bg-cyber-800 transition shadow-lg"
              >
                <Box className="w-3.5 h-3.5" />
                <span>{use3DMode ? '2.5D R3F' : '2D Canvas'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: Dashboard (Matches user Screenshot 1 & 3 stats) */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Laptop className="w-5 h-5 text-cyan-400" />
                  <span>Laptop Node Dashboard ({systemMetrics.hostname})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  11th Gen Intel i5-1135G7 · 16 GB RAM · Intel Iris Xe Graphics
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono">
                System Healthy · 20 Capabilities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-cyber-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400">CPU Utilization</span>
                <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">{systemMetrics.cpuLoadPercentage}%</p>
                <span className="text-[10px] text-slate-500 font-mono">4 Cores / 8 Threads</span>
              </div>
              <div className="bg-cyber-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400">RAM (Memory)</span>
                <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{systemMetrics.memoryUsedPercentage}%</p>
                <span className="text-[10px] text-slate-500 font-mono">{(systemMetrics.memoryTotalGb * systemMetrics.memoryUsedPercentage / 100).toFixed(1)} / 16 GB</span>
              </div>
              <div className="bg-cyber-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400">Disk Storage</span>
                <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{systemMetrics.diskUsedPercentage}%</p>
                <span className="text-[10px] text-slate-500 font-mono">512 GB NVMe SSD</span>
              </div>
              <div className="bg-cyber-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400">Local AI Engine</span>
                <p className="text-2xl font-bold text-purple-400 font-mono mt-1">Ollama</p>
                <span className="text-[10px] text-slate-500 font-mono">llama3.2:3b (Laptop Optimized)</span>
              </div>
            </div>

            {/* Microservices Health Matrix */}
            <div className="bg-cyber-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Continuous Sentry Status (13 Monitored Services)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Tailscale Mesh', 'Next.js Dev Server', 'Electron IPC Bridge', 
                  'PostgreSQL pgvector', 'Ollama Local Daemon', 'Chokidar Live RAG', 
                  'Nut.js OS Automation', 'SMTP Mail Sentry', 'Agent Builder Link',
                  'Moswords Sentry', 'Fixflow Monitor', 'EngagementDay Test', 'Memory Curating Loop'
                ].map((srv, idx) => (
                  <div key={idx} className="bg-cyber-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-300">{srv}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: IDE Copilot */}
        {activeTab === 'ide-copilot' && (
          <div className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>IDE Copilot & Live Codebase Context</span>
            </h2>
            <div className="bg-cyber-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Live Directory RAG is monitoring your active files. Any save automatically chunks and updates local pgvector embeddings for instant context.
              </p>
            </div>
          </div>
        )}

        {/* TAB: Document & Productivity modules */}
        {['document', 'spreadsheet', 'planner', 'journal', 'group-chat', 'settings'].includes(activeTab) && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-cyber-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white capitalize">{activeTab.replace('-', ' ')} Workspace</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Connected to Jarvis Core memory and Electron OS Bridge. Ready for unified local documents, calculations, and plans.
            </p>
          </div>
        )}

        {/* Secondary Sub-Tab Views */}
        {activeTab === 'overview' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Workspace Infrastructure Overview</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-cyber-900 border border-cyber-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">2.5D R3F Spatial Canvas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tailored for Intel 11th Gen Core i5 with Intel Iris Xe Graphics, soft PCF shadows, dynamic bloom on task completion, and physical agent pathfinding.
                </p>
              </div>
              <div className="bg-cyber-900 border border-cyber-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Local Ollama Hybrid Router</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autonomous background triage runs locally via Ollama with zero cloud dependence. 3B models optimized for 16GB laptop RAM.
                </p>
              </div>
              <div className="bg-cyber-900 border border-cyber-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">Ghost Mode & Nut.js Automation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Alt+Space summons the frosted-glass Spotlight palette. Nut.js handles native window discovery, crash log reading, and keyboard automation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Drawers */}
        <ChatDrawer />
        <MemoryDrawer />
        <CapabilitiesDrawer />
      </main>
    </div>
  );
};
