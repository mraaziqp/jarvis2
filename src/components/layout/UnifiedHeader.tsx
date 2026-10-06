'use client';

import React, { useState } from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { 
  Bot, 
  Wifi, 
  WifiOff, 
  MessageSquare, 
  Brain, 
  Sliders, 
  Terminal, 
  LogOut, 
  RefreshCw,
  X,
  Server,
  Laptop
} from 'lucide-react';

export const UnifiedHeader: React.FC = () => {
  const {
    coreStatus,
    transportType,
    heartbeatLatencyMs,
    systemMetrics,
    activeTab,
    setActiveTab,
    activeDrawer,
    setActiveDrawer,
    userPreferences,
    setConnectionStatus
  } = useJarvisStore();

  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);

  // Status mapping
  const statusConfig = {
    connected: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      label: 'JARVIS ACTIVE',
      sub: `${heartbeatLatencyMs}ms · ${transportType}`
    },
    connecting: {
      color: 'bg-amber-500 animate-pulse',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      label: 'CONNECTING...',
      sub: 'Negotiating tunnel'
    },
    degraded: {
      color: 'bg-amber-600',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-600/40',
      label: 'DEGRADED',
      sub: 'Retrying heartbeat'
    },
    disconnected: {
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      label: 'CORE UNREACHABLE',
      sub: 'Connection lost'
    }
  }[coreStatus];

  return (
    <>
      <header className="h-14 bg-cyber-900/90 backdrop-blur-xl border-b border-cyber-800 px-4 flex items-center justify-between select-none z-30 relative">
        {/* Left: Branding & Core Mode */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-cyber-900 ${statusConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-wide text-white">Jarvis</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-cyber-800 text-cyan-400 rounded-md font-mono border border-cyan-500/20">v2.0 Native</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono -mt-0.5">UNIFIED NATIVE WORKSPACE</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-cyber-950/60 p-1 rounded-xl border border-white/5">
            {[
              { id: 'canvas', label: 'Town Canvas' },
              { id: 'overview', label: 'Overview' },
              { id: 'ecosystem', label: 'Ecosystem' },
              { id: 'agents', label: 'Agents' },
              { id: 'fleet', label: 'Fleet' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-cyber-800 text-cyan-300 shadow-sm border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Unified Status Pill & Quick Controls */}
        <div className="flex items-center space-x-3">
          {/* Synchronized Core Status Pill */}
          <button
            onClick={() => setDiagnosticsModalOpen(true)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${statusConfig.borderColor} bg-cyber-950/70 hover:bg-cyber-950 transition cursor-pointer`}
            title="Click for Connection Diagnostics"
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
            <span className={`text-xs font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({statusConfig.sub})</span>
          </button>

          {/* Action Drawer Toggles */}
          <div className="flex items-center space-x-1 border-l border-cyber-800 pl-3">
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'chat' ? 'none' : 'chat')}
              className={`p-2 rounded-xl transition ${
                activeDrawer === 'chat' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-cyber-800'
              }`}
              title="Toggle Assistant Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveDrawer(activeDrawer === 'memory' ? 'none' : 'memory')}
              className={`p-2 rounded-xl transition ${
                activeDrawer === 'memory' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-cyber-800'
              }`}
              title="Toggle Memory Vault"
            >
              <Brain className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveDrawer(activeDrawer === 'capabilities' ? 'none' : 'capabilities')}
              className={`p-2 rounded-xl transition ${
                activeDrawer === 'capabilities' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-cyber-800'
              }`}
              title="Toggle Host Capabilities & Hands"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-2 pl-2">
            <div className="w-7 h-7 rounded-lg bg-cyber-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              {userPreferences.username[0]}
            </div>
            <span className="text-xs text-slate-300 font-medium hidden lg:inline">{userPreferences.username}</span>
          </div>
        </div>
      </header>

      {/* Synchronized Connection Diagnostics Modal */}
      {diagnosticsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-cyber-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setDiagnosticsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-cyber-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-xl ${coreStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {coreStatus === 'connected' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Core Status:</span>
                  <span className={statusConfig.textColor}>{statusConfig.label}</span>
                </h3>
                <p className="text-xs text-slate-400">Synchronized Zustand Heartbeat Monitor</p>
              </div>
            </div>

            <div className="bg-cyber-950 rounded-xl p-4 border border-slate-800 space-y-3 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Local Host Node:</span>
                </span>
                <span className="text-slate-200 font-mono">{systemMetrics.hostname}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  <span>IPC Transport:</span>
                </span>
                <span className="text-cyan-400 font-mono font-medium">{transportType} ({heartbeatLatencyMs}ms)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Tailscale Mesh:</span>
                <span className="text-emerald-400 font-mono">{systemMetrics.tailscaleIp || 'Active (ts.net)'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Reported Capabilities:</span>
                <span className="text-slate-200 font-mono">{systemMetrics.capabilitiesCount} Active</span>
              </div>
            </div>

            {/* Simulated Toggle to test status synchronicity */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">Simulate Connection State:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setConnectionStatus('connected')}
                  className="px-2.5 py-1 text-[11px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition"
                >
                  Online
                </button>
                <button
                  onClick={() => setConnectionStatus('degraded')}
                  className="px-2.5 py-1 text-[11px] bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition"
                >
                  Degraded
                </button>
                <button
                  onClick={() => setConnectionStatus('disconnected')}
                  className="px-2.5 py-1 text-[11px] bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg transition"
                >
                  Offline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
