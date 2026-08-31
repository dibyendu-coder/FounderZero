import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Sparkles,
  Command,
  Plus,
  X,
  Database,
  BarChart2,
  Users,
  FlaskConical,
  FileText,
  Bookmark,
  Layers,
  ChevronDown
} from 'lucide-react';
import { CopilotSlashMenu, SLASH_COMMANDS, SlashCommand } from './CopilotSlashMenu';
import { CopilotMode } from '../../types';

export interface ContextCapsule {
  id: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}

interface CopilotPromptComposerProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: (customText?: string, mode?: CopilotMode) => void;
  onStop?: () => void;
  loading?: boolean;
  activeMode?: CopilotMode;
  onModeChange?: (mode: CopilotMode) => void;
  activeContexts: string[];
  onToggleContext: (contextId: string) => void;
}

export const CopilotPromptComposer: React.FC<CopilotPromptComposerProps> = ({
  inputText,
  onInputChange,
  onSend,
  onStop,
  loading = false,
  activeMode = 'default',
  onModeChange,
  activeContexts = ['startup', 'metrics', 'feedback'],
  onToggleContext
}) => {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Available context modules that can be included in reasoning
  const availableContexts: ContextCapsule[] = [
    { id: 'startup', label: 'Startup Profile', icon: Database, active: activeContexts.includes('startup') },
    { id: 'metrics', label: 'Metrics & Retention', icon: BarChart2, active: activeContexts.includes('metrics') },
    { id: 'feedback', label: 'Customer Feedback', icon: Users, active: activeContexts.includes('feedback') },
    { id: 'experiments', label: 'Active Experiments', icon: FlaskConical, active: activeContexts.includes('experiments') },
    { id: 'notes', label: 'Founder Notes', icon: FileText, active: activeContexts.includes('notes') },
    { id: 'resources', label: 'Saved Vault', icon: Bookmark, active: activeContexts.includes('resources') }
  ];

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  // Handle slash trigger detection
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onInputChange(val);

    if (val.startsWith('/')) {
      setSlashMenuOpen(true);
      setSlashFilter(val);
      setSelectedSlashIndex(0);
    } else {
      setSlashMenuOpen(false);
    }
  };

  const handleSelectSlashCommand = (cmd: SlashCommand) => {
    setSlashMenuOpen(false);
    onInputChange(cmd.template);
    if (onModeChange) onModeChange(cmd.mode);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMenuOpen) {
      const cleanFilter = slashFilter.startsWith('/') ? slashFilter.slice(1).toLowerCase() : slashFilter.toLowerCase();
      const filtered = SLASH_COMMANDS.filter(cmd =>
        cmd.name.toLowerCase().includes(cleanFilter) ||
        cmd.description.toLowerCase().includes(cleanFilter)
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex(prev => (prev + 1) % filtered.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filtered[selectedSlashIndex]) {
          handleSelectSlashCommand(filtered[selectedSlashIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuOpen(false);
        return;
      }
    }

    // Submit on ⌘+Enter or Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !loading) {
        onSend();
      }
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full font-sans">
      {/* Floating Slash Menu */}
      {slashMenuOpen && (
        <CopilotSlashMenu
          filterText={slashFilter}
          selectedIndex={selectedSlashIndex}
          onSelectCommand={handleSelectSlashCommand}
          onClose={() => setSlashMenuOpen(false)}
        />
      )}

      {/* Context Pills Bar */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar py-0.5 text-[11px] font-mono select-none">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 shrink-0">
          Context:
        </span>
        {availableContexts.map(c => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggleContext(c.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer shrink-0 border ${
                c.active
                  ? 'bg-blue-50 text-blue-900 border-blue-200 font-semibold shadow-2xs'
                  : 'bg-white text-slate-400 border-slate-200/80 hover:text-slate-600 hover:border-slate-300'
              }`}
              title={c.active ? `Click to exclude ${c.label} from AI context` : `Click to include ${c.label} in AI context`}
            >
              <Icon size={11} className={c.active ? 'text-blue-600' : 'text-slate-400'} />
              <span>{c.label}</span>
              {c.active ? (
                <span className="text-blue-500 hover:text-blue-700 ml-0.5">✕</span>
              ) : (
                <span className="text-slate-300 ml-0.5">+</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Primary Composer Box */}
      <div className="relative bg-white border border-slate-300/90 rounded-2xl p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all">
        <textarea
          ref={textareaRef}
          id="copilot-prompt-textarea"
          value={inputText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your startup... (Type / for commands)"
          rows={1}
          className="w-full bg-transparent border-0 resize-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden leading-relaxed max-h-48 min-h-[44px]"
        />

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSlashMenuOpen(true);
                setSlashFilter('/');
                if (textareaRef.current) textareaRef.current.focus();
              }}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-mono font-semibold transition cursor-pointer flex items-center gap-1"
              title="Browse slash commands"
            >
              <span className="text-blue-600 font-bold">/</span>
              <span>Commands</span>
            </button>

            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              <kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-500 font-semibold text-[10px]">Enter</kbd> to send
            </span>
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                title="Stop generation"
              >
                <Square size={11} className="fill-white" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                id="copilot-send-btn"
                onClick={() => onSend()}
                disabled={!inputText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:cursor-not-allowed"
                title="Send message"
              >
                <span>Ask</span>
                <Send size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
