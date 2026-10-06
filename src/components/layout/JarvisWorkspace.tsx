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
import { Layers, Activity, Sparkles, Terminal, Box } from 'lucide-react';

export const JarvisWorkspace: React.FC = () => {
  const { 
    activeTab, 
    recordHeartbeat, 
    checkHeartbeatLiveness, 
    agents, 
    buildings 
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

  // Listen to native Electron IPC events if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.jarvisAPI) {
      const unsubHeartbeat = window.jarvisAPI.subscribeHeartbeat((payload) => {
        recordHeartbeat(payload);
      });

      return () => {
        unsubHeartbeat();
      };
    } else {
      const timer = setInterval(() => {
        checkHeartbeatLiveness();
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [recordHeartbeat, checkHeartbeatLiveness]);

  // If running in Ghost Palette standalone window
  if (isPaletteMode) {
    return (
      <div className="w-screen h-screen bg-transparent overflow-hidden flex items-center justify-center">
        <SpotlightCommandPalette />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-cyber-950 text-slate-100 font-sans">
      {/* 1. Unified Navigation & State Header */}
      <UnifiedHeader />

      {/* 2. Main Workspace Body */}
      <main className="flex-1 relative overflow-hidden flex">
        {activeTab === 'canvas' && (
          <div className="w-full h-full relative">
            {/* 2.5D R3F WebGL or 2D HTML5 Canvas */}
            {use3DMode ? <SubagentTown3D /> : <SubagentTown />}

            <AgentInspectorHUD />

            {/* Dimensional Mode Switcher (2.5D R3F vs 2D) */}
            <div className="absolute top-4 right-44 z-20">
              <button
                onClick={() => setUse3DMode(!use3DMode)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyber-900/85 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:bg-cyber-800 transition shadow-lg"
              >
                <Box className="w-3.5 h-3.5" />
                <span>{use3DMode ? '2.5D R3F (Active)' : '2D Canvas'}</span>
              </button>
            </div>
          </div>
        )}

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
                  WebGL 3D NavMesh optimized for RTX 3060 Ti, featuring soft shadow mapping, dynamic bloom on task completion, and physical agent pathfinding.
                </p>
              </div>
              <div className="bg-cyber-900 border border-cyber-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-purple-400 mb-2">Local Ollama Hybrid Router</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autonomous background triage runs locally via Ollama with zero cloud dependence. Heavier models (Claude, Gemini Pro) reserved for complex planning.
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

        {activeTab === 'ecosystem' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Town Campus Zones & Microservices</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buildings.map((bld) => (
                <div key={bld.id} className="bg-cyber-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{bld.name}</h4>
                    <span className="text-[11px] text-cyan-400 font-mono">Category: {bld.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 font-mono font-bold">{bld.progress}% Built</span>
                    <p className="text-[10px] text-slate-500 font-mono">Status: {bld.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Active Subagent Fleet ({agents.length})</span>
            </h2>
            <div className="space-y-3">
              {agents.map((ag) => (
                <div key={ag.id} className="bg-cyber-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: ag.color }} />
                    <div>
                      <h4 className="text-sm font-bold text-white">{ag.name}</h4>
                      <p className="text-xs text-slate-400">{ag.currentTask}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-cyan-400">{ag.progress}% Progress</span>
                    <p className="text-[11px] text-slate-500 font-mono capitalize">State: {ag.state}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-purple-400" />
              <span>Tailscale Mesh & Hardware Nodes</span>
            </h2>
            <div className="bg-cyber-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">moh-Vostro-3500 (Primary Master)</h3>
                  <p className="text-xs text-slate-400">Tailscale IP: 100.102.44.82 · moh-vostro-3500.tailb5a66a.ts.net</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono">
                  Reporting Online
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center">
                <div className="bg-cyber-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500">GPU Acceleration</span>
                  <p className="text-sm font-bold text-emerald-400">NVIDIA RTX 3060 Ti</p>
                </div>
                <div className="bg-cyber-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500">Memory Utilization</span>
                  <p className="text-sm font-bold text-amber-400">72% of 32 GB</p>
                </div>
                <div className="bg-cyber-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500">Local AI Engine</span>
                  <p className="text-sm font-bold text-cyan-400">Ollama (127.0.0.1:11434)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Retractable Glassmorphic Drawers */}
        <ChatDrawer />
        <MemoryDrawer />
        <CapabilitiesDrawer />
      </main>
    </div>
  );
};
