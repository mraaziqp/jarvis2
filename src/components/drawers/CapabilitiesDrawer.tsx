'use client';

import React from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { Sliders, X, Cpu, HardDrive, Laptop, ShieldCheck, Mail, Terminal, Lock } from 'lucide-react';

export const CapabilitiesDrawer: React.FC = () => {
  const { activeDrawer, setActiveDrawer, systemMetrics, allowedCommands } = useJarvisStore();

  if (activeDrawer !== 'capabilities') return null;

  return (
    <aside className="fixed top-14 right-0 bottom-0 w-96 bg-cyber-900/95 backdrop-blur-2xl border-l border-cyber-800 shadow-2xl z-40 flex flex-col transition-all duration-300">
      <div className="h-12 border-b border-cyber-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white tracking-wide">Host Capabilities & Nodes</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">20 Active</span>
        </div>
        <button
          onClick={() => setActiveDrawer('none')}
          className="p-1 text-slate-400 hover:text-white hover:bg-cyber-800 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Node Status Card */}
        <div className="bg-cyber-950 border border-slate-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>{systemMetrics.hostname}</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              AWAKE · LOCAL
            </span>
          </div>

          {/* Metric Meters */}
          <div className="space-y-2 pt-1">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>CPU Load:</span>
                <span className="text-cyan-400 font-mono">{systemMetrics.cpuLoadPercentage}%</span>
              </div>
              <div className="h-1.5 bg-cyber-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${systemMetrics.cpuLoadPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Memory (RAM):</span>
                <span className="text-amber-400 font-mono">{systemMetrics.memoryUsedPercentage}% ({systemMetrics.memoryTotalGb} GB)</span>
              </div>
              <div className="h-1.5 bg-cyber-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${systemMetrics.memoryUsedPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>System Disk:</span>
                <span className="text-emerald-400 font-mono">{systemMetrics.diskUsedPercentage}% ({systemMetrics.diskTotalGb} GB)</span>
              </div>
              <div className="h-1.5 bg-cyber-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${systemMetrics.diskUsedPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enabled Subsystems & Sentry Capabilities */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-300">Subsystem Integrations</span>
          
          <div className="space-y-1.5">
            <div className="bg-cyber-950 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-medium text-white">Electron IPC Bridge</h4>
                  <p className="text-[10px] text-slate-400">ContextIsolation with preloaded handlers</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Active</span>
            </div>

            <div className="bg-cyber-950 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-medium text-white">Mail Sentry Pipeline</h4>
                  <p className="text-[10px] text-slate-400">Local SMTP / Nodemailer transport</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
            </div>

            <div className="bg-cyber-950 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <div>
                  <h4 className="text-xs font-medium text-white">Allowed Command Policy</h4>
                  <p className="text-[10px] text-slate-400">{allowedCommands.length} whitelisted system verbs</p>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">Strict</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
