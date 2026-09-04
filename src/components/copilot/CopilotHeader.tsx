import React from 'react';
import {
  Sparkles,
  Plus,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { StartupProfile } from '../../types';
import { ClaudeLogo } from '../brainless/claude/claude-header';

interface CopilotHeaderProps {
  profile: StartupProfile;
  title: string;
  mode?: string;
  isStreaming?: boolean;
  onNewChat: () => void;
  onSearchClick?: () => void;
  onNavigate: (route: string) => void;
  leftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  rightContextOpen: boolean;
  onToggleRightContext: () => void;
}

export const CopilotHeader: React.FC<CopilotHeaderProps> = ({
  profile,
  title,
  mode,
  isStreaming,
  onNewChat,
  onNavigate,
  leftSidebarOpen,
  onToggleLeftSidebar,
  rightContextOpen,
  onToggleRightContext
}) => {
  return (
    <header
      id="copilot-header"
      className="h-13 px-4 sm:px-5 bg-[#050506] border-b border-[#3a3a3e] text-[#EDEDEF] flex items-center justify-between shrink-0 select-none font-mono z-20"
    >
      {/* Left: Brand + Toggle + Startup Context Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="toggle-left-sidebar-btn"
          onClick={onToggleLeftSidebar}
          className="p-1.5 rounded hover:bg-white/10 text-[#8A8F98] hover:text-[#EDEDEF] transition cursor-pointer"
          title={leftSidebarOpen ? "Hide chat history" : "Show chat history"}
          aria-label="Toggle chat history"
        >
          {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        <div className="flex items-center gap-2">
          <ClaudeLogo scale={2.5} className="shrink-0" />
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight">
            <span className="text-[#cd694a] font-bold">Claude Code</span>
            <span className="text-[#8A8F98]">/</span>
            <span className="text-[#c0caf5]">Founder Zero</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Startup Context Capsule */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded px-2.5 py-1 text-[#EDEDEF] transition cursor-pointer"
          onClick={() => onNavigate('profile')}
          title="Click to view full Startup Profile & Settings"
        >
          <span className="text-[#8A8F98]">startup:</span>
          <span className="text-[#EDEDEF] font-semibold truncate max-w-[120px] md:max-w-[160px]">{profile?.name || 'PulseBoard'}</span>
          <span className="text-[#8A8F98]">•</span>
          <span className="text-amber-400 font-medium">{profile?.stage || 'MVP'}</span>
          {profile?.biggestUncertainty && (
            <>
              <span className="text-[#8A8F98]">•</span>
              <span className="text-amber-300/90 truncate max-w-[100px] hidden md:inline">
                {profile.biggestUncertainty}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* New Chat Button */}
        <button
          id="header-new-chat-btn"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#cd694a] hover:bg-[#d97556] text-white text-xs font-semibold font-mono transition cursor-pointer"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Right Panel Context Toggle */}
        <button
          id="toggle-right-context-btn"
          onClick={onToggleRightContext}
          className={`p-1.5 rounded transition cursor-pointer ${
            rightContextOpen
              ? 'bg-[#cd694a]/20 text-[#e79475] border border-[#cd694a]/40'
              : 'hover:bg-white/10 text-[#8A8F98] hover:text-[#EDEDEF] border border-transparent'
          }`}
          title={rightContextOpen ? "Hide startup context panel" : "Show startup context panel"}
          aria-label="Toggle startup context panel"
        >
          {rightContextOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>
    </header>
  );
};

