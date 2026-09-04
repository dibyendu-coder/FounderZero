import React, { useState } from 'react';
import {
  Database,
  BarChart2,
  Users,
  FlaskConical,
  FileText,
  Bookmark
} from 'lucide-react';
import { SLASH_COMMANDS } from './CopilotSlashMenu';
import { CopilotMode } from '../../types';
import { ClaudeSlashMenu } from '../brainless/claude/claude-slash-menu';

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
  const [effort, setEffort] = useState<'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'ultracode'>('xhigh');

  const availableContexts: ContextCapsule[] = [
    { id: 'startup', label: 'Startup Profile', icon: Database, active: activeContexts.includes('startup') },
    { id: 'metrics', label: 'Metrics & Retention', icon: BarChart2, active: activeContexts.includes('metrics') },
    { id: 'feedback', label: 'Customer Feedback', icon: Users, active: activeContexts.includes('feedback') },
    { id: 'experiments', label: 'Active Experiments', icon: FlaskConical, active: activeContexts.includes('experiments') },
    { id: 'notes', label: 'Founder Notes', icon: FileText, active: activeContexts.includes('notes') },
    { id: 'resources', label: 'Saved Vault', icon: Bookmark, active: activeContexts.includes('resources') }
  ];

  const handleSelectSlashCommand = (cmd: { name: string; description: string }) => {
    const cleanName = cmd.name.startsWith('/') ? cmd.name.slice(1) : cmd.name;
    const found = SLASH_COMMANDS.find(c => c.name === cleanName);
    if (found) {
      onInputChange(found.template);
      if (onModeChange) onModeChange(found.mode);
    } else {
      onInputChange(`${cmd.name} `);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full font-mono">
      {/* Context Pills Bar */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar py-0.5 text-[11px] font-mono select-none">
        <span className="text-[#8A8F98] font-semibold uppercase tracking-wider text-[10px] mr-1 shrink-0">
          Context:
        </span>
        {availableContexts.map(c => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggleContext(c.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer shrink-0 border ${
                c.active
                  ? 'bg-[#cd694a]/20 text-[#e79475] border-[#cd694a]/40 font-semibold'
                  : 'bg-white/[0.03] text-[#8A8F98] border-white/[0.06] hover:text-[#EDEDEF] hover:bg-white/[0.06]'
              }`}
            >
              <Icon size={11} className={c.active ? 'text-[#cd694a]' : 'text-[#8A8F98]'} />
              <span>{c.label}</span>
              {c.active ? (
                <span className="text-[#cd694a] hover:text-[#e79475] ml-1">✕</span>
              ) : (
                <span className="text-[#8A8F98] ml-1">+</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Claude Code Prompt Box */}
      <div className="bg-[#08080a] border border-[#3a3a3e] rounded p-3 shadow-2xl">
        <ClaudeSlashMenu
          value={inputText}
          onChange={onInputChange}
          onSelectCommand={handleSelectSlashCommand}
          onSubmit={(val) => {
            if (val.trim() && !loading) {
              onSend(val);
            }
          }}
          mode={activeMode === 'default' ? 'auto' : activeMode === 'plan-week' ? 'plan' : 'auto'}
          effort={effort}
        />
      </div>
    </div>
  );
};
