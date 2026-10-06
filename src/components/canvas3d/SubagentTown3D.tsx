'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useJarvisStore } from '../../store/useJarvisStore';
import { SubagentEntity } from '../../types/ipc';
import { 
  Sparkles, 
  Layers, 
  Plus, 
  Monitor, 
  Compass, 
  Activity, 
  Flame, 
  Cpu 
} from 'lucide-react';

// Dynamic import with SSR disabled for WebGL Canvas
const TownScene = dynamic(() => import('./TownScene').then((mod) => mod.TownScene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-cyber-950 text-cyan-400">
      <Cpu className="w-8 h-8 animate-spin mb-2" />
      <span className="text-xs font-mono">Initializing 2.5D WebGL Spatial Town (RTX 3060 Ti)...</span>
    </div>
  ),
});

export const SubagentTown3D: React.FC = () => {
  const { agents, spawnAgent, systemMetrics } = useJarvisStore();
  const [spawnModalOpen, setSpawnModalOpen] = useState(false);
  const [newAgentTask, setNewAgentTask] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<SubagentEntity['role']>('code_builder');
  const [wallpaperActive, setWallpaperActive] = useState(false);

  const handleSpawnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentTask.trim()) return;

    spawnAgent({
      name: `Agent-${newAgentRole.split('_')[0].toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      role: newAgentRole,
      task: newAgentTask.trim(),
      buildingCategory: newAgentRole === 'triage_sentry' ? 'sentry' : newAgentRole === 'code_builder' ? 'workshop' : 'data_forge'
    });

    setNewAgentTask('');
    setSpawnModalOpen(false);
  };

  const handleToggleWallpaper = async () => {
    if (typeof window !== 'undefined' && window.jarvisAPI) {
      const newState = !wallpaperActive;
      const success = await window.jarvisAPI.toggleWallpaperMode(newState);
      setWallpaperActive(success);
    } else {
      setWallpaperActive(!wallpaperActive);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-cyber-950 select-none">
      {/* 3D WebGL Canvas Scene */}
      <TownScene />

      {/* Top Floating HUD: Hardware & Scene Status */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-cyber-900/85 backdrop-blur-md border border-cyan-500/20 px-3.5 py-1.5 rounded-full shadow-xl text-xs">
        <span className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>2.5D R3F Spatial Canvas</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 font-mono">{agents.length} Agents Navigating NavMesh</span>
        <span className="text-slate-600">|</span>
        <span className="text-amber-400 font-mono flex items-center space-x-1">
          <Flame className="w-3 h-3" />
          <span>RTX 3060 Ti Bloom Active</span>
        </span>
      </div>

      {/* Ghost Mode: Wallpaper Pinning & Quick Tools */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button
          onClick={handleToggleWallpaper}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition backdrop-blur-md ${
            wallpaperActive
              ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20'
              : 'bg-cyber-900/80 text-slate-300 border-slate-700/60 hover:border-cyan-500/40'
          }`}
          title="Pin 3D Subagent Town directly underneath desktop windows as transparent wallpaper"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{wallpaperActive ? 'Wallpaper Mode: Pinned' : 'Ghost Wallpaper'}</span>
        </button>
      </div>

      {/* Bottom Spawn Subagent Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => setSpawnModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Spawn 3D Task Subagent</span>
        </button>
      </div>

      {/* Spawn Modal */}
      {spawnModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-cyber-900 border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Spawn 3D Subagent on NavMesh</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Agent will enter the 3D grid, pathfind to its assigned building, and visually construct scaffolding while executing background tasks.
            </p>

            <form onSubmit={handleSpawnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Agent Specialty</label>
                <select
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value as any)}
                  className="w-full bg-cyber-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="code_builder">Code Builder (Compiler & 3D Scaffolds)</option>
                  <option value="triage_sentry">Triage Sentry (Self-healing & Health)</option>
                  <option value="network_scanner">Network Scanner (Fleet Ports)</option>
                  <option value="memory_curator">Memory Curator (pgvector Indexer)</option>
                  <option value="mail_dispatcher">Mail Dispatcher (OS Native Sentry)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Specification</label>
                <input
                  type="text"
                  value={newAgentTask}
                  onChange={(e) => setNewAgentTask(e.target.value)}
                  placeholder="e.g. Parse application crash logs and auto-triage"
                  className="w-full bg-cyber-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSpawnModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-md transition"
                >
                  Manifest in 3D Town
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
