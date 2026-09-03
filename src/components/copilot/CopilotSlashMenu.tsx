import React, { useEffect, useRef } from 'react';
import {
  Sparkles,
  BarChart2,
  Users,
  Target,
  FlaskConical,
  CheckSquare,
  ShieldAlert,
  BookOpen,
  FileText,
  Bookmark,
  MapPin,
  Calendar,
  Lightbulb,
  Compass
} from 'lucide-react';
import { CopilotMode } from '../../types';

export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  mode: CopilotMode;
  template: string;
  icon: React.ElementType;
  shortcut?: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'analyze',
    name: 'analyze',
    description: 'Comprehensive analysis of startup metrics & bottleneck',
    mode: 'default',
    template: 'Analyze my startup and tell me what I should focus on next.',
    icon: Sparkles
  },
  {
    id: 'reality',
    name: 'reality',
    description: 'Reality check on spending, pivoting, or growth bet',
    mode: 'reality-check',
    template: 'Reality check: Should I spend ₹50,000 on ads or take this high-risk step?',
    icon: ShieldAlert
  },
  {
    id: 'metrics',
    name: 'metrics',
    description: 'Deep dive into retention, activation, and MRR signals',
    mode: 'default',
    template: 'Analyze our current retention and activation metrics. Where are users dropping off?',
    icon: BarChart2
  },
  {
    id: 'customers',
    name: 'customers',
    description: 'Analyze customer interviews and feedback patterns',
    mode: 'feedback-analysis',
    template: 'Analyze recent customer feedback interviews and extract the top recurring pain points.',
    icon: Users
  },
  {
    id: 'mission',
    name: 'mission',
    description: 'Create a structured 7-day actionable founder mission',
    mode: 'building-help',
    template: 'Help me create a 7-day mission to get my first 10 paying customers.',
    icon: Target
  },
  {
    id: 'experiment',
    name: 'experiment',
    description: 'Design a low-cost growth or product experiment',
    mode: 'experiment-creator',
    template: 'Design an experiment to test if simplifying onboarding improves Day-7 retention.',
    icon: FlaskConical
  },
  {
    id: 'validate',
    name: 'validate',
    description: 'Validate customer problem and willingness to pay',
    mode: 'product-validation',
    template: 'Validate my core product assumption and suggest the cheapest way to test willingness to pay.',
    icon: Compass
  },
  {
    id: 'resources',
    name: 'resources',
    description: 'Find verified zero-cost tools and playbooks for my bottleneck',
    mode: 'resources',
    template: 'Find verified zero-cost tools and playbooks for improving user retention.',
    icon: BookOpen
  },
  {
    id: 'notes',
    name: 'notes',
    description: 'Search founder notes and save strategic synthesis',
    mode: 'default',
    template: 'Search my notes on customer feedback and synthesize a product strategy.',
    icon: FileText
  },
  {
    id: 'vault',
    name: 'vault',
    description: 'Search saved bookmarks in my Founder Vault',
    mode: 'resources',
    template: 'Search my Founder Vault for saved guides on pricing and positioning.',
    icon: Bookmark
  },
  {
    id: 'weekly',
    name: 'weekly',
    description: 'Plan high-leverage weekly founder sprint',
    mode: 'plan-week',
    template: 'Plan my weekly sprint based on my biggest bottleneck and active experiments.',
    icon: Calendar
  },
  {
    id: 'brainstorm',
    name: 'brainstorm',
    description: 'Brainstorm creative solutions with zero fluff',
    mode: 'brainstorm',
    template: 'Brainstorm 5 zero-budget distribution channels for developer tools.',
    icon: Lightbulb
  }
];

interface CopilotSlashMenuProps {
  filterText: string;
  selectedIndex: number;
  onSelectCommand: (command: SlashCommand) => void;
  onClose: () => void;
}

export const CopilotSlashMenu: React.FC<CopilotSlashMenuProps> = ({
  filterText,
  selectedIndex,
  onSelectCommand,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter commands
  const cleanFilter = filterText.startsWith('/') ? filterText.slice(1).toLowerCase() : filterText.toLowerCase();
  const filteredCommands = SLASH_COMMANDS.filter(cmd =>
    cmd.name.toLowerCase().includes(cleanFilter) ||
    cmd.description.toLowerCase().includes(cleanFilter)
  );

  // Auto-scroll selected into view
  useEffect(() => {
    if (menuRef.current) {
      const activeEl = menuRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (filteredCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      id="copilot-slash-menu"
      className="absolute bottom-full left-0 mb-2 w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden z-30 font-sans text-xs animate-in fade-in slide-in-from-bottom-2 duration-150 text-[#EDEDEF]"
    >
      <div className="px-3 py-2 bg-[#050506] border-b border-white/[0.06] flex items-center justify-between text-[#8A8F98] font-mono text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-[#EDEDEF]">
          <span className="text-[#5E6AD2]">/</span>
          <span>Founder Commands</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#8A8F98]">
          <span>↑↓ to navigate</span>
          <span>•</span>
          <span>↵ to select</span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
        {filteredCommands.map((cmd, idx) => {
          const Icon = cmd.icon;
          const isSelected = idx === selectedIndex % filteredCommands.length;
          return (
            <button
              key={cmd.id}
              type="button"
              data-selected={isSelected}
              onClick={() => onSelectCommand(cmd)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#5E6AD2]/20 text-indigo-200 font-semibold border border-[#5E6AD2]/40'
                  : 'hover:bg-white/[0.04] text-[#EDEDEF]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-md ${isSelected ? 'bg-[#5E6AD2] text-white' : 'bg-white/[0.06] text-[#8A8F98]'}`}>
                  <Icon size={13} />
                </div>
                <div className="truncate">
                  <div className="font-mono text-[12px] font-bold">
                    <span className="text-[#5E6AD2]">/</span>{cmd.name}
                  </div>
                  <div className="text-[11px] text-[#8A8F98] truncate font-normal">
                    {cmd.description}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 ml-2">
                {cmd.mode === 'default' ? '' : cmd.mode}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
