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
      className="h-13 px-4 sm:px-5 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between shrink-0 select-none shadow-xs z-20"
    >
      {/* Left: Brand + Toggle + Startup Context Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="toggle-left-sidebar-btn"
          onClick={onToggleLeftSidebar}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title={leftSidebarOpen ? "Hide chat history" : "Show chat history"}
          aria-label="Toggle chat history"
        >
          {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600/90 text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
            <Sparkles size={13} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight">
            <span className="text-white font-mono font-bold">FounderZero</span>
            <span className="text-slate-500 font-mono">/</span>
            <span className="text-blue-400 font-mono">copilot</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Startup Context Capsule */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md px-2.5 py-1 text-slate-300 transition cursor-pointer"
          onClick={() => onNavigate('profile')}
          title="Click to view full Startup Profile & Settings"
        >
          <span className="text-slate-400">startup:</span>
          <span className="text-slate-100 font-semibold truncate max-w-[120px] md:max-w-[160px]">{profile?.name || 'PulseBoard'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-blue-300 font-medium">{profile?.stage || 'MVP'}</span>
          {profile?.biggestUncertainty && (
            <>
              <span className="text-slate-500">•</span>
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
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[11px] font-mono hover:bg-purple-900/40 transition cursor-pointer"
          title="Powered by Groq LLM API"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>groq/llama-3.3-70b</span>
        </button>

        {/* New Chat Button */}
        <button
          id="header-new-chat-btn"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
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
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
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
