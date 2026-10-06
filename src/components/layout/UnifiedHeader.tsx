'use client';

import React, { useState, useRef } from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { 
  Bot, 
  Wifi, 
  WifiOff, 
  MessageSquare, 
  Brain, 
  Sliders, 
  Terminal, 
  X, 
  Server, 
  Laptop, 
  Cpu, 
  BatteryCharging, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  LayoutDashboard, 
  FileText, 
  Table, 
  Calendar, 
  BookOpen, 
  Users, 
  Settings, 
  Code2, 
  Maximize2, 
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

interface NavModule {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isCore?: boolean;
}

const PRIMARY_MODULES: NavModule[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'canvas', label: 'Jarvis Core', icon: Bot, isCore: true, badge: 'Online' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assistant', label: 'Assistant', icon: Sparkles },
  { id: 'ide-copilot', label: 'IDE Copilot', icon: Code2 },
  { id: 'document', label: 'Document', icon: FileText },
  { id: 'spreadsheet', label: 'Spreadsheet', icon: Table },
  { id: 'planner', label: 'Planner', icon: Calendar },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'group-chat', label: 'Group Chat', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SUB_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'overview', label: 'Overview' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'agents', label: 'Agents' },
  { id: 'projects', label: 'Projects' },
  { id: 'fleet', label: 'Fleet' },
] as const;

export const UnifiedHeader: React.FC = () => {
  const {
    coreStatus,
    transportType,
    heartbeatLatencyMs,
    systemMetrics,
    activeTab,
    setActiveTab,
    subTab,
    setSubTab,
    activeDrawer,
    setActiveDrawer,
    userPreferences,
    setConnectionStatus,
    powerMode,
    setPowerMode
  } = useJarvisStore();

  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Status mapping
  const statusConfig = {
    connected: {
      color: 'bg-emerald-400',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgGlow: 'bg-emerald-950/40',
      label: 'JARVIS ACTIVE',
      sub: `${heartbeatLatencyMs}ms · IPC`
    },
    connecting: {
      color: 'bg-amber-400 animate-pulse',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgGlow: 'bg-amber-950/40',
      label: 'CONNECTING...',
      sub: 'Negotiating tunnel'
    },
    degraded: {
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-600/40',
      bgGlow: 'bg-amber-950/40',
      label: 'DEGRADED',
      sub: 'Retrying heartbeat'
    },
    disconnected: {
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgGlow: 'bg-rose-950/40',
      label: 'CORE UNREACHABLE',
      sub: 'Connection lost'
    }
  }[coreStatus];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col border-b border-cyber-800/90 bg-cyber-900/95 backdrop-blur-xl select-none z-30">
      {/* 1. TOP PRIMARY NAVIGATION BAR */}
      <header className="h-14 px-3 sm:px-4 flex items-center justify-between relative overflow-hidden">
        
        {/* Left: Branding & Current Context (flex-shrink-0 to never get crushed) */}
        <div className="flex-shrink-0 flex items-center space-x-3 mr-2 sm:mr-4">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-cyber-900 ${statusConfig.color}`} />
          </div>
          <div>
            <div className="text-[10px] text-cyan-400/90 font-mono tracking-wider font-semibold uppercase leading-none">
              UNIFIED NATIVE WORKSPACE
            </div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5 mt-0.5">
              <span>Main Canvas</span>
              <span className="text-[9px] bg-cyber-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700/60 font-mono hidden md:inline">
                i5 · 16GB
              </span>
            </div>
          </div>
        </div>

        {/* Center: Scrollable Tabs Container with Chevrons & Overflow Protection */}
        <div className="flex-1 min-w-0 relative flex items-center justify-center mx-1 sm:mx-2">
          {/* Left Scroll Chevron Button */}
          <button
            onClick={() => handleScroll('left')}
            className="flex-shrink-0 p-1 text-slate-400 hover:text-cyan-300 hover:bg-cyber-800/80 rounded-lg transition mr-1 z-10"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Pills Track (Overflow-x-auto, no-scrollbar, never cut off) */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-1 py-1 px-1 bg-cyber-950/70 rounded-xl border border-white/5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PRIMARY_MODULES.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeTab === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                    isActive
                      ? mod.isCore
                        ? 'bg-gradient-to-r from-cyan-950 to-cyan-900/80 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                        : 'bg-cyber-800 text-white border border-slate-700/80 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (mod.isCore ? 'text-cyan-400' : 'text-slate-200') : 'text-slate-500'}`} />
                  <span>{mod.label}</span>
                  {mod.isCore && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Scroll Chevron Button */}
          <button
            onClick={() => handleScroll('right')}
            className="flex-shrink-0 p-1 text-slate-400 hover:text-cyan-300 hover:bg-cyber-800/80 rounded-lg transition ml-1 z-10"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Quick "More Apps" Dropdown Toggle */}
          <div className="relative flex-shrink-0 ml-1">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-2 py-1.5 text-xs text-slate-400 hover:text-white bg-cyber-950/80 hover:bg-cyber-800 border border-white/5 rounded-lg flex items-center space-x-1 transition"
              title="All Modules Dropdown"
            >
              <span className="hidden lg:inline text-[11px]">All Apps</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-10 right-0 w-48 bg-cyber-900 border border-cyan-500/30 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-mono text-cyan-400 uppercase border-b border-cyber-800 font-bold">
                  All Workspace Modules
                </div>
                {PRIMARY_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveTab(mod.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-cyber-800 transition ${
                      activeTab === mod.id ? 'text-cyan-300 font-semibold bg-cyan-950/40' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <mod.icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mod.label}</span>
                    </div>
                    {activeTab === mod.id && <span className="text-[10px] text-cyan-400 font-mono">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status Pill & Profile Controls (flex-shrink-0: Guaranteed never to overlap or be cut off) */}
        <div className="flex-shrink-0 flex items-center space-x-2 ml-2 sm:ml-4 z-10">
          
          {/* Synchronized Status Pill */}
          <button
            onClick={() => setDiagnosticsModalOpen(true)}
            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border ${statusConfig.borderColor} ${statusConfig.bgGlow} transition cursor-pointer hover:brightness-110`}
            title="Click for Laptop Diagnostics & Connection State"
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
            <span className={`text-xs font-semibold ${statusConfig.textColor} tracking-wide`}>
              {statusConfig.label}
            </span>
          </button>

          {/* User Sign-In Profile Badge */}
          <div className="flex items-center space-x-1.5 pl-1 border-l border-cyber-800">
            <div className="w-7 h-7 rounded-lg bg-cyber-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              {userPreferences.username[0]}
            </div>
            <span className="text-xs text-slate-300 font-medium hidden xl:inline">
              {userPreferences.username}
            </span>
          </div>

          {/* Action Drawer Triggers */}
          <div className="flex items-center space-x-1 pl-1">
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'chat' ? 'none' : 'chat')}
              className={`p-1.5 rounded-lg transition ${
                activeDrawer === 'chat' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-cyber-800'
              }`}
              title="Toggle Assistant Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveDrawer(activeDrawer === 'capabilities' ? 'none' : 'capabilities')}
              className={`p-1.5 rounded-lg transition ${
                activeDrawer === 'capabilities' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-cyber-800'
              }`}
              title="Toggle Laptop Capabilities & Battery"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

      </header>

      {/* 2. SECONDARY SUB-NAVIGATION ROW (Matches Image 1: [Home], [Overview], [Ecosystem]...) */}
      <div className="h-10 px-4 bg-cyber-950/90 border-t border-cyber-800/60 flex items-center justify-between text-xs">
        {/* Sub-tabs List */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {SUB_TABS.map((tab) => {
            const isSubActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  isSubActive
                    ? 'bg-cyber-800/90 text-cyan-300 border border-cyan-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Info: Live Status & Hardware Monitor */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-400 flex-shrink-0">
          <div className="flex items-center space-x-1.5 bg-cyber-900 px-2 py-0.5 rounded-md border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono">11th Gen i5 · 16GB RAM</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400 hidden sm:flex">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-emerald-400">88%</span>
          </div>

          <button
            onClick={() => setActiveTab('canvas')}
            className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Full view</span>
          </button>
        </div>
      </div>

      {/* Diagnostics Modal */}
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
                <p className="text-xs text-slate-400">11th Gen i5 Laptop Unified Telemetry</p>
              </div>
            </div>

            <div className="bg-cyber-950 rounded-xl p-4 border border-slate-800 space-y-2.5 mb-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hardware Node:</span>
                </span>
                <span className="text-slate-200 font-mono">moh-Vostro-3500 (local laptop)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>CPU & RAM:</span>
                </span>
                <span className="text-amber-400 font-mono">11th Gen i5-1135G7 · 16 GB RAM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Graphics (GPU):</span>
                </span>
                <span className="text-cyan-400 font-mono">Intel Iris Xe (Laptop Optimized)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  <span>IPC Transport:</span>
                </span>
                <span className="text-slate-200 font-mono">{transportType} ({heartbeatLatencyMs}ms)</span>
              </div>
            </div>

            {/* Power Mode Optimizer Toggle */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Laptop Thermal Profile:</span>
              <div className="flex space-x-1">
                {(['eco', 'balanced', 'performance'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPowerMode(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition text-[11px] ${
                      powerMode === mode
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-cyber-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
