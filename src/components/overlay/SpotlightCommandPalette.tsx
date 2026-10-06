'use client';

import React, { useState, useEffect } from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { 
  Search, 
  Terminal, 
  Camera, 
  Lock, 
  Mail, 
  Sparkles, 
  Activity, 
  X,
  Flame,
  ArrowRight
} from 'lucide-react';

export const SpotlightCommandPalette: React.FC = () => {
  const [query, setQuery] = useState('');
  const { addMessage, queueToolCall, approveToolCall, spawnAgent } = useJarvisStore();

  const handleAction = async (action: string) => {
    if (action === 'screenshot_mail') {
      const tc = {
        id: `tc-${Date.now()}`,
        name: 'take_screenshot_and_mail',
        params: { to: 'mraaziqp@gmail.com' }
      };
      queueToolCall(tc);
      addMessage({
        sender: 'jarvis',
        content: 'Executing native screenshot and mail dispatch via Spotlight hotkey trigger.',
        toolCall: tc,
        status: 'pending'
      });
      await approveToolCall(tc.id);
    } else if (action === 'lock') {
      const tc = { id: `tc-${Date.now()}`, name: 'execute_command', params: { command: 'lock' } };
      queueToolCall(tc);
      await approveToolCall(tc.id);
    } else if (action === 'triage') {
      spawnAgent({
        name: `Sentinel-Spotlight`,
        role: 'triage_sentry',
        task: 'Autonomous self-healing scan over 13 microservices',
        buildingCategory: 'sentry'
      });
    }

    if (typeof window !== 'undefined' && window.jarvisAPI) {
      window.jarvisAPI.toggleCommandPalette(false);
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col justify-center items-center bg-transparent select-none">
      <div className="w-full max-w-2xl bg-cyber-900/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Header */}
        <div className="p-3.5 border-b border-cyber-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or ask Jarvis anything... (Alt + Space)"
            className="flex-1 bg-transparent border-none text-white text-sm placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 bg-cyber-950 text-slate-400 border border-slate-800 rounded text-[10px] font-mono">
            ESC
          </kbd>
        </div>

        {/* Quick Action Verbs */}
        <div className="p-3 space-y-1 max-h-72 overflow-y-auto">
          <button
            onClick={() => handleAction('screenshot_mail')}
            className="w-full text-left p-2.5 rounded-xl hover:bg-cyber-800/80 flex items-center justify-between group transition"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300">
                  Take Desktop Screenshot & Mail
                </h4>
                <p className="text-[10px] text-slate-400">
                  Natively captures screen via IPC and pipes to SMTP sentry
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
          </button>

          <button
            onClick={() => handleAction('triage')}
            className="w-full text-left p-2.5 rounded-xl hover:bg-cyber-800/80 flex items-center justify-between group transition"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300">
                  Spawn Triage Subagent on 3D NavMesh
                </h4>
                <p className="text-[10px] text-slate-400">
                  Triggers self-healing audit loop on local Ollama engine
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
          </button>

          <button
            onClick={() => handleAction('lock')}
            className="w-full text-left p-2.5 rounded-xl hover:bg-cyber-800/80 flex items-center justify-between group transition"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-purple-300">
                  Lock Local Workstation
                </h4>
                <p className="text-[10px] text-slate-400">
                  Dispatches native Windows User32 LockWorkStation
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-cyber-800 bg-cyber-950/70 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>Jarvis Spotlight Engine v2.5</span>
          <span>Global Shortcut: Alt+Space</span>
        </div>
      </div>
    </div>
  );
};
