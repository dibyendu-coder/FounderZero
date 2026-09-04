import React from 'react';
import {
  Sparkles,
  BarChart2,
  Users,
  Target,
  FlaskConical,
  ShieldAlert,
  BookOpen,
  FileText,
  Bookmark,
  Calendar,
  Lightbulb,
  Compass
} from 'lucide-react';
import { CopilotMode } from '../../types';
import { ClaudeSlashMenu, SlashCommand as ClaudeCommand } from '../brainless/claude/claude-slash-menu';

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
  onSelectCommand
}) => {
  const commandsList = SLASH_COMMANDS.map(c => ({
    name: `/${c.name}`,
    description: c.description
  }));

  const handleSelect = (cmd: ClaudeCommand) => {
    const matched = SLASH_COMMANDS.find(c => `/${c.name}` === cmd.name);
    if (matched) {
      onSelectCommand(matched);
    }
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 w-full max-w-md z-30 font-mono">
      <ClaudeSlashMenu
        commands={commandsList}
        value={filterText}
        onSelectCommand={handleSelect}
      />
    </div>
  );
};

