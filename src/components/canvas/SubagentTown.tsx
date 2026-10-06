'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { SubagentEntity, TownBuilding } from '../../types/ipc';
import { Plus, ZoomIn, ZoomOut, RotateCcw, Activity, Shield, Sparkles, Layers } from 'lucide-react';

export const SubagentTown: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    agents,
    buildings,
    selectedAgentId,
    setSelectedAgent,
    spawnAgent,
    updateAgentProgress,
    canvasZoom,
    setCanvasZoom
  } = useJarvisStore();

  const [hoveredAgent, setHoveredAgent] = useState<SubagentEntity | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<TownBuilding | null>(null);
  const [spawnModalOpen, setSpawnModalOpen] = useState(false);
  const [newAgentTask, setNewAgentTask] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<SubagentEntity['role']>('code_builder');

  // Animation frame loop state
  const animationRef = useRef<number | null>(null);
  const pulseRef = useRef<number>(0);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      pulseRef.current += 0.03;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      ctx.fillStyle = '#070b12';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      // Apply zoom & center offset
      ctx.translate(width / 2, height / 2);
      ctx.scale(canvasZoom, canvasZoom);
      ctx.translate(-400, -300); // center around 400, 300 coordinate space

      // 2. Draw Digital Grid & Terrain
      drawGrid(ctx);

      // 3. Draw Pathways / Bus Lines connecting Buildings to Core Matrix
      drawDataHighways(ctx, buildings, pulseRef.current);

      // 4. Draw Town Buildings
      buildings.forEach((bld) => {
        drawBuilding(ctx, bld, pulseRef.current, hoveredBuilding?.id === bld.id);
      });

      // 5. Draw Subagents
      agents.forEach((agent) => {
        // Interpolate movement smoothly
        const dx = agent.targetX - agent.x;
        const dy = agent.targetY - agent.y;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          agent.x += dx * 0.05;
          agent.y += dy * 0.05;
        }

        drawSubagent(
          ctx, 
          agent, 
          pulseRef.current, 
          agent.id === selectedAgentId,
          hoveredAgent?.id === agent.id
        );
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [agents, buildings, selectedAgentId, hoveredAgent, hoveredBuilding, canvasZoom]);

  // Canvas resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse interaction helpers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Invert zoom & translation
    const worldX = (mouseX - canvas.width / 2) / canvasZoom + 400;
    const worldY = (mouseY - canvas.height / 2) / canvasZoom + 300;
    return { x: worldX, y: worldY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // Check agent hit
    const foundAgent = agents.find((ag) => Math.hypot(ag.x - x, ag.y - y) < 28);
    setHoveredAgent(foundAgent || null);

    // Check building hit
    const foundBld = buildings.find(
      (b) => x >= b.x - b.width / 2 && x <= b.x + b.width / 2 && y >= b.y - b.height / 2 && y <= b.y + b.height / 2
    );
    setHoveredBuilding(foundBld || null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const foundAgent = agents.find((ag) => Math.hypot(ag.x - x, ag.y - y) < 28);
    if (foundAgent) {
      setSelectedAgent(foundAgent.id);
    }
  };

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

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[580px] overflow-hidden bg-cyber-950 select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating HUD Controls */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-cyber-900/80 backdrop-blur-md border border-cyan-500/20 px-3 py-1.5 rounded-full shadow-lg text-xs">
        <span className="flex items-center space-x-1.5 text-cyan-400 font-medium">
          <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Subagent Town Engine v2.0</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 font-mono">{agents.length} Autonomous Agents</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 font-mono">100% Sync</span>
      </div>

      {/* Zoom and Reset Controls */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-cyber-900/80 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-xl">
        <button
          onClick={() => setCanvasZoom(canvasZoom + 0.15)}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-cyber-800 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCanvasZoom(canvasZoom - 0.15)}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-cyber-800 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCanvasZoom(1.0)}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-cyber-800 rounded-lg transition"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Spawn Subagent Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => setSpawnModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Spawn Background Subagent</span>
        </button>
      </div>

      {/* Spawn Agent Modal */}
      {spawnModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-cyber-900 border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Spawn Autonomous Subagent</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Agent will manifest on the Canvas, coordinate via pgvector memory, and autonomously build structures reflecting task progress.
            </p>

            <form onSubmit={handleSpawnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Agent Specialty Role</label>
                <select
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value as any)}
                  className="w-full bg-cyber-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="code_builder">Code Builder (Compiler & Scaffold)</option>
                  <option value="triage_sentry">Triage Sentry (Self-healing & Audits)</option>
                  <option value="network_scanner">Network Scanner (Fleet & Ports)</option>
                  <option value="memory_curator">Memory Curator (pgvector Indexer)</option>
                  <option value="mail_dispatcher">Mail Dispatcher (OS Native Sentry)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Specification</label>
                <input
                  type="text"
                  value={newAgentTask}
                  onChange={(e) => setNewAgentTask(e.target.value)}
                  placeholder="e.g. Continuous sentry check across all 13 services"
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
                  className="px-5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-md transition"
                >
                  Manifest in Town
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Canvas Drawing Routines

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#111a2a';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = -200; x <= 1000; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, -200);
    ctx.lineTo(x, 800);
    ctx.stroke();
  }
  for (let y = -200; y <= 800; y += step) {
    ctx.beginPath();
    ctx.moveTo(-200, y);
    ctx.lineTo(1000, y);
    ctx.stroke();
  }
}

function drawDataHighways(ctx: CanvasRenderingContext2D, buildings: TownBuilding[], pulse: number) {
  const core = buildings.find(b => b.category === 'core') || buildings[0];

  buildings.forEach((bld) => {
    if (bld.id === core.id) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(core.x, core.y);
    ctx.lineTo(bld.x, bld.y);
    ctx.stroke();

    // Animated data pulse particle travelling along the highway
    const t = (pulse * 0.4 + (bld.x % 10) * 0.1) % 1;
    const px = core.x + (bld.x - core.x) * t;
    const py = core.y + (bld.y - core.y) * t;

    ctx.fillStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawBuilding(ctx: CanvasRenderingContext2D, bld: TownBuilding, pulse: number, isHovered: boolean) {
  ctx.save();

  const isCore = bld.category === 'core';
  const rx = bld.x - bld.width / 2;
  const ry = bld.y - bld.height / 2;

  // Building Shadow & Ground Glow
  ctx.fillStyle = isCore ? 'rgba(0, 242, 254, 0.08)' : 'rgba(15, 23, 42, 0.8)';
  ctx.shadowColor = isHovered ? '#00f2fe' : isCore ? '#00f2fe' : '#1e293b';
  ctx.shadowBlur = isHovered ? 20 : isCore ? 15 : 6;

  // Building Base
  ctx.fillStyle = '#0d1523';
  ctx.strokeStyle = isHovered ? '#00f2fe' : isCore ? 'rgba(0, 242, 254, 0.7)' : 'rgba(100, 116, 139, 0.4)';
  ctx.lineWidth = isHovered || isCore ? 2 : 1.5;

  roundRect(ctx, rx, ry, bld.width, bld.height, 12);
  ctx.fill();
  ctx.stroke();

  // Procedural Construction Scaffold Height reflecting progress
  const scaffoldHeight = (bld.height * (bld.progress / 100));
  ctx.fillStyle = isCore ? 'rgba(0, 242, 254, 0.12)' : 'rgba(16, 185, 129, 0.1)';
  roundRect(ctx, rx + 4, ry + (bld.height - scaffoldHeight) - 4, bld.width - 8, scaffoldHeight, 8);
  ctx.fill();

  // Building Title & Progress Bar
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 0;
  ctx.fillText(bld.name, bld.x, ry + 22);

  // Status Badge
  ctx.fillStyle = isCore ? '#00f2fe' : '#10b981';
  ctx.font = '10px monospace';
  ctx.fillText(`${bld.progress}% Active`, bld.x, ry + 38);

  // Core Pulse Ring
  if (isCore) {
    const ringRadius = 55 + Math.sin(pulse * 2) * 6;
    ctx.strokeStyle = `rgba(0, 242, 254, ${0.4 - Math.sin(pulse) * 0.2})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bld.x, bld.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSubagent(
  ctx: CanvasRenderingContext2D, 
  agent: SubagentEntity, 
  pulse: number, 
  isSelected: boolean,
  isHovered: boolean
) {
  ctx.save();

  // Agent Aura / Glow
  ctx.shadowColor = agent.color;
  ctx.shadowBlur = isSelected ? 22 : isHovered ? 15 : 8;

  // Agent Core Orb
  ctx.fillStyle = agent.color;
  ctx.beginPath();
  ctx.arc(agent.x, agent.y, 9, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting Electron / Status Particle
  const orbitAngle = pulse * 3 + (agent.x * 0.1);
  const orbitDist = 16;
  const ox = agent.x + Math.cos(orbitAngle) * orbitDist;
  const oy = agent.y + Math.sin(orbitAngle) * orbitDist;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Selection Ring
  if (isSelected) {
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, 22, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Laser Construction Beam if Building/Working
  if (agent.state === 'building' || agent.state === 'working') {
    ctx.strokeStyle = `rgba(0, 242, 254, ${0.5 + Math.sin(pulse * 5) * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(agent.x, agent.y);
    ctx.lineTo(agent.targetX, agent.targetY);
    ctx.stroke();
  }

  // Speech / Task Bubble
  if (isHovered || isSelected) {
    const bubbleText = agent.name;
    const taskSnippet = agent.currentTask.length > 28 ? agent.currentTask.substring(0, 25) + '...' : agent.currentTask;

    ctx.font = 'bold 10px sans-serif';
    const textWidth = Math.max(ctx.measureText(bubbleText).width, ctx.measureText(taskSnippet).width) + 20;

    const bx = agent.x - textWidth / 2;
    const by = agent.y - 48;

    ctx.fillStyle = '#0c121e';
    ctx.strokeStyle = agent.color;
    ctx.lineWidth = 1;
    roundRect(ctx, bx, by, textWidth, 32, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(bubbleText, bx + 10, by + 13);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText(taskSnippet, bx + 10, by + 26);
  }

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
