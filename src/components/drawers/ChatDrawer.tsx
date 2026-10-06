'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { parseNaturalLanguageCommand } from '../../services/toolSchema';
import { 
  Send, 
  X, 
  Camera, 
  Lock, 
  Play, 
  SkipForward, 
  VolumeX, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Mail, 
  FileCheck,
  Sparkles
} from 'lucide-react';

export const ChatDrawer: React.FC = () => {
  const {
    activeDrawer,
    setActiveDrawer,
    messages,
    addMessage,
    queueToolCall,
    approveToolCall,
    rejectToolCall,
    userPreferences,
    spawnAgent
  } = useJarvisStore();

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (activeDrawer !== 'chat') return null;

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    // 1. Add user message
    addMessage({
      sender: 'user',
      content: textToSend.trim()
    });

    if (!customText) setInput('');
    setIsProcessing(true);

    // 2. Parse tool intent using schema interceptor
    const toolMatch = parseNaturalLanguageCommand(textToSend, userPreferences.notificationEmail);

    setTimeout(async () => {
      setIsProcessing(false);

      if (toolMatch) {
        const toolCallId = `tc-${Date.now()}`;
        const toolCall = {
          id: toolCallId,
          name: toolMatch.toolName,
          params: toolMatch.params,
          requiresConfirmation: toolMatch.requiresConfirmation
        };

        if (toolMatch.toolName === 'take_screenshot_and_mail') {
          // Add Jarvis reply with tool approval card
          queueToolCall(toolCall);
          addMessage({
            sender: 'jarvis',
            content: `I've intercepted your request to capture the workstation screen and email it to **${userPreferences.notificationEmail}**. Please approve this native execution:`,
            toolCall,
            status: 'pending'
          });
        } else if (toolMatch.toolName === 'spawn_subagent_task') {
          const params = toolMatch.params as any;
          const agentId = spawnAgent({
            name: `Agent-${params.role.split('_')[0].toUpperCase()}`,
            role: params.role,
            task: params.taskName,
            buildingCategory: params.buildingTarget
          });
          addMessage({
            sender: 'jarvis',
            content: `Dispatched background subagent **${agentId}** to the Town Canvas for task: "${params.taskName}". You can monitor real-time visual construction on the canvas.`
          });
        } else if (toolMatch.toolName === 'take_screenshot') {
          queueToolCall(toolCall);
          addMessage({
            sender: 'jarvis',
            content: `Capturing desktop display to \`${userPreferences.defaultScreenshotDir}\` via Electron OS Bridge.`,
            toolCall,
            status: 'pending'
          });
          // Auto-execute if non-sensitive
          approveToolCall(toolCallId);
        } else {
          // Direct execution
          queueToolCall(toolCall);
          addMessage({
            sender: 'jarvis',
            content: `Dispatching native action: \`${toolMatch.toolName}\`.`,
            toolCall,
            status: 'pending'
          });
          approveToolCall(toolCallId);
        }
      } else {
        // Standard conversational assistant reply
        addMessage({
          sender: 'jarvis',
          content: `Understood, Mohammed. I am monitoring your workspace. You can ask me to execute native OS tasks (e.g. "take a screenshot and mail it", "lock workstation"), inspect subagents in the Town, or query memory archives.`
        });
      }
    }, 450);
  };

  const handleQuickCommand = (cmd: string) => {
    handleSend(cmd);
  };

  return (
    <aside className="fixed top-14 right-0 bottom-0 w-96 bg-cyber-900/95 backdrop-blur-2xl border-l border-cyber-800 shadow-2xl z-40 flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="h-12 border-b border-cyber-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white tracking-wide">Jarvis Assistant Chat</span>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono">OS Bridge Active</span>
        </div>
        <button
          onClick={() => setActiveDrawer('none')}
          className="p-1 text-slate-400 hover:text-white hover:bg-cyber-800 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-slate-950 font-medium shadow-md shadow-cyan-600/20'
                  : 'bg-cyber-950 text-slate-200 border border-cyber-800 shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Tool Execution Card */}
              {msg.toolCall && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-cyan-400 flex items-center space-x-1">
                      <Terminal className="w-3 h-3" />
                      <span>{msg.toolCall.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {msg.status || 'pending'}
                    </span>
                  </div>

                  {msg.status === 'pending' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => approveToolCall(msg.toolCall!.id)}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 shadow transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve & Execute</span>
                      </button>
                      <button
                        onClick={() => rejectToolCall(msg.toolCall!.id)}
                        className="bg-cyber-800 hover:bg-cyber-700 text-slate-300 py-1.5 px-3 rounded-lg text-xs transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {msg.status === 'completed' && msg.toolResult && (
                    <div className="bg-cyber-900/80 rounded-lg p-2 border border-emerald-500/30 text-[11px] text-emerald-400 mt-2">
                      <div className="flex items-center space-x-1 font-semibold mb-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Native IPC Execution Succeeded</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono">
                        {JSON.stringify(msg.toolResult.data, null, 2)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 pl-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Jarvis is reasoning over native OS bridge...</span>
          </div>
        )}
      </div>

      {/* HANDS: Quick Action Toolbar (From Screenshot 4) */}
      <div className="border-t border-cyber-800 bg-cyber-950/80 p-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-1">
          <span className="font-semibold text-slate-300">HANDS on moh-Vostro-3500</span>
          <span className="text-[10px] text-emerald-400 font-mono">Approval Gate Active</span>
        </div>
        <div className="flex items-center space-x-1 overflow-x-auto pb-1">
          {[
            { label: 'Lock', icon: Lock, cmd: 'lock' },
            { label: 'Screenshot', icon: Camera, cmd: 'take a screenshot' },
            { label: 'Mail Capture', icon: Mail, cmd: 'mail the screenshot you took and mail it to me' },
            { label: 'Play/pause', icon: Play, cmd: 'play/pause' },
            { label: 'Mute', icon: VolumeX, cmd: 'mute' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickCommand(action.cmd)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-cyber-900 hover:bg-cyber-800 text-slate-300 hover:text-cyan-400 border border-slate-800 rounded-lg text-xs whitespace-nowrap transition"
            >
              <action.icon className="w-3 h-3" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-cyber-800 bg-cyber-900 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Jarvis anything or execute native OS command..."
          className="flex-1 bg-cyber-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 rounded-xl transition shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
