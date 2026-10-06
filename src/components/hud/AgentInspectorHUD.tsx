'use client';

import React from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { Activity, X, Database, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const AgentInspectorHUD: React.FC = () => {
  const { agents, selectedAgentId, setSelectedAgent, updateAgentProgress, completeAgentTask } = useJarvisStore();

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  if (!selectedAgent) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-cyber-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-20">
      <div className="flex items-start justify-between">
        {/* Agent Info */}
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-md"
            style={{ backgroundColor: selectedAgent.color }}
          >
            {selectedAgent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white">{selectedAgent.name}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-cyber-950 border border-slate-700 text-cyan-400">
                {selectedAgent.role.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                State: {selectedAgent.state}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{selectedAgent.currentTask}</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setSelectedAgent(null)}
          className="p-1 text-slate-400 hover:text-white hover:bg-cyber-800 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Vector Memory */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progress Bar & Actions */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Autonomous Task Progress:</span>
            <span className="text-cyan-400 font-mono font-bold">{selectedAgent.progress}%</span>
          </div>
          <div className="h-2 bg-cyber-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${selectedAgent.progress}%` }}
            />
          </div>

          <div className="flex items-center space-x-2 mt-2.5">
            <button
              onClick={() => updateAgentProgress(selectedAgent.id, Math.min(100, selectedAgent.progress + 15))}
              className="px-2.5 py-1 bg-cyber-800 hover:bg-cyber-700 text-slate-200 text-xs rounded-lg transition"
            >
              Step +15%
            </button>
            <button
              onClick={() => completeAgentTask(selectedAgent.id, `Successfully verified operations at (${Math.round(selectedAgent.x)}, ${Math.round(selectedAgent.y)})`)}
              className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs rounded-lg transition"
            >
              Complete Task
            </button>
          </div>
        </div>

        {/* Semantic Memory Log */}
        <div className="bg-cyber-950/80 rounded-xl p-2.5 border border-slate-800/60">
          <div className="flex items-center space-x-1.5 text-xs text-purple-300 font-semibold mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Semantic Memory Recall (pgvector)</span>
          </div>
          {selectedAgent.recentMemories.length > 0 ? (
            <p className="text-[11px] text-slate-300 line-clamp-2">
              "{selectedAgent.recentMemories[0].actionText}"
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">No vector memories registered yet.</p>
          )}
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
            <span>Spatial Coord: ({Math.round(selectedAgent.x)}, {Math.round(selectedAgent.y)})</span>
            <span className="text-purple-400">Cosine: 0.98</span>
          </div>
        </div>
      </div>
    </div>
  );
};
