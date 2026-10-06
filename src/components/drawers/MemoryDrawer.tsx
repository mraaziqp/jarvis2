'use client';

import React, { useState } from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { vectorMemoryService } from '../../services/vectorMemory';
import { Brain, X, Plus, Search, Tag, Database, Sparkles, Check } from 'lucide-react';

export const MemoryDrawer: React.FC = () => {
  const { activeDrawer, setActiveDrawer, userPreferences } = useJarvisStore();
  const [newFact, setNewFact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [memoryFacts, setMemoryFacts] = useState<string[]>([
    'prefers bullet points',
    'Wants to mail screenshot from ~/Pictures/Jarvis/',
    'Deployment steps should be a numbered list.',
    'Prefers direct answers with no preamble.',
    'Jarvis must prioritize autonomous operation and monitor all 13 services continuous sentry.'
  ]);

  if (activeDrawer !== 'memory') return null;

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;

    const fact = newFact.trim();
    setMemoryFacts([fact, ...memoryFacts]);

    // Store in pgvector memory service
    await vectorMemoryService.storeAgentMemory({
      agentId: 'user-core',
      taskId: 'user-preference',
      actionText: fact,
      coordinates: { x: 400, y: 300 }
    });

    setNewFact('');
  };

  return (
    <aside className="fixed top-14 right-0 bottom-0 w-96 bg-cyber-900/95 backdrop-blur-2xl border-l border-cyber-800 shadow-2xl z-40 flex flex-col transition-all duration-300">
      <div className="h-12 border-b border-cyber-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white tracking-wide">pgvector Memory Vault</span>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-mono">384-dim</span>
        </div>
        <button
          onClick={() => setActiveDrawer('none')}
          className="p-1 text-slate-400 hover:text-white hover:bg-cyber-800 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Memory Stats Banner */}
        <div className="bg-gradient-to-br from-purple-900/30 to-cyber-950 border border-purple-500/20 rounded-xl p-3">
          <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semantic Persona Profile</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Jarvis retains verified facts and behavioral preferences. Subagents query this semantic index before formulating tool plans or generating responses.
          </p>
        </div>

        {/* Add Fact Form */}
        <form onSubmit={handleAddFact} className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-300">Add Learned Fact / Instruction</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              placeholder="e.g. Always generate TypeScript with strict types"
              className="flex-1 bg-cyber-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Index</span>
            </button>
          </div>
        </form>

        {/* Facts List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Active Memory Index ({memoryFacts.length})</span>
            <span className="text-[10px] text-purple-400 font-mono">IVFFLAT Vector Index</span>
          </div>

          <div className="space-y-2">
            {memoryFacts.map((fact, idx) => (
              <div
                key={idx}
                className="bg-cyber-950 border border-slate-800/80 rounded-xl p-2.5 flex items-start justify-between group hover:border-purple-500/40 transition"
              >
                <div className="flex items-start space-x-2 flex-1">
                  <Tag className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-200">{fact}</p>
                </div>
                <span className="text-[9px] bg-purple-500/10 text-purple-400 font-mono px-1.5 py-0.5 rounded ml-2">
                  Cosine: 0.94
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
