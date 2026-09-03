import React from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Sidebar,
  SlidersHorizontal,
  Key,
  Database,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { StartupProfile } from '../../types';

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
      className="h-13 px-4 sm:px-5 bg-[#050506] border-b border-white/[0.06] text-[#EDEDEF] flex items-center justify-between shrink-0 select-none shadow-md z-20 font-sans"
    >
      {/* Left: Brand + Toggle + Startup Context Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="toggle-left-sidebar-btn"
          onClick={onToggleLeftSidebar}
          className="p-1.5 rounded-md hover:bg-white/[0.06] text-[#8A8F98] hover:text-[#EDEDEF] transition cursor-pointer"
          title={leftSidebarOpen ? "Hide chat history" : "Show chat history"}
          aria-label="Toggle chat history"
        >
          {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#5E6AD2] text-white flex items-center justify-center font-mono font-bold text-xs shadow-[0_0_12px_rgba(94,106,210,0.4)]">
            <Sparkles size={13} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight">
            <span className="text-[#EDEDEF] font-mono font-bold">FounderZero</span>
            <span className="text-[#8A8F98] font-mono">/</span>
            <span className="text-indigo-300 font-mono">copilot</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />

        {/* Startup Context Capsule */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-md px-2.5 py-1 text-[#EDEDEF] transition cursor-pointer"
          onClick={() => onNavigate('profile')}
          title="Click to view full Startup Profile & Settings"
        >
          <span className="text-[#8A8F98]">startup:</span>
          <span className="text-[#EDEDEF] font-semibold truncate max-w-[120px] md:max-w-[160px]">{profile?.name || 'PulseBoard'}</span>
          <span className="text-[#8A8F98]">•</span>
          <span className="text-indigo-300 font-medium">{profile?.stage || 'MVP'}</span>
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
        {/* Model Indicator Pill */}
        <button
          onClick={() => onNavigate('profile')}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-mono hover:bg-purple-500/30 transition cursor-pointer"
          title="Powered by Groq LLM API"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>groq/llama-3.3-70b</span>
        </button>

        {/* New Chat Button */}
        <button
          id="header-new-chat-btn"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold transition cursor-pointer shadow-[0_0_12px_rgba(94,106,210,0.3)]"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Right Panel Context Toggle */}
        <button
          id="toggle-right-context-btn"
          onClick={onToggleRightContext}
          className={`p-1.5 rounded-md transition cursor-pointer ${
            rightContextOpen
              ? 'bg-[#5E6AD2]/20 text-indigo-300 border border-[#5E6AD2]/40'
              : 'hover:bg-white/[0.06] text-[#8A8F98] hover:text-[#EDEDEF] border border-transparent'
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
