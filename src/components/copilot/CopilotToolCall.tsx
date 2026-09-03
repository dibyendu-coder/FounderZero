import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Terminal,
  Check,
  Loader2,
  AlertCircle,
  Database,
  BarChart2,
  Users,
  Search,
  BookOpen,
  FlaskConical,
  Target,
  FileText
} from 'lucide-react';
import { CopilotToolExecution } from '../../types';

interface CopilotToolCallProps {
  tool: CopilotToolExecution;
}

export const CopilotToolCall: React.FC<CopilotToolCallProps> = ({ tool }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Pick an icon based on tool name
  const getToolIcon = (name: string) => {
    if (name.includes('metric')) return <BarChart2 size={12} className="text-[#5E6AD2]" />;
    if (name.includes('feedback') || name.includes('customer')) return <Users size={12} className="text-purple-400" />;
    if (name.includes('experiment')) return <FlaskConical size={12} className="text-teal-400" />;
    if (name.includes('mission') || name.includes('target')) return <Target size={12} className="text-rose-400" />;
    if (name.includes('note')) return <FileText size={12} className="text-amber-400" />;
    if (name.includes('vault') || name.includes('resource')) return <BookOpen size={12} className="text-indigo-300" />;
    return <Database size={12} className="text-[#8A8F98]" />;
  };

  const isRunning = tool.status === 'running';
  const isFailed = tool.status === 'failed';
  const isCompleted = tool.status === 'completed';

  return (
    <div
      id={`tool-call-${tool.id}`}
      className="my-1.5 rounded-lg border border-white/10 bg-[#0a0a0c] text-xs font-mono overflow-hidden shadow-sm transition-all text-[#EDEDEF]"
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-white/[0.04] transition cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#8A8F98]">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>

          <div className="flex items-center gap-1.5">
            {getToolIcon(tool.name)}
            <span className="font-bold text-[#EDEDEF] text-[11px]">{tool.name}</span>
          </div>

          <span className="text-[#8A8F98] hidden sm:inline">•</span>

          <span className="text-[#8A8F98] text-[11px] truncate max-w-[200px] md:max-w-md font-sans">
            {tool.description}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-300 font-semibold bg-[#5E6AD2]/20 px-1.5 py-0.5 rounded border border-[#5E6AD2]/30">
              <Loader2 size={10} className="animate-spin" />
              <span>executing</span>
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
              <Check size={10} strokeWidth={3} />
              <span>Complete</span>
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1 text-[10px] text-rose-300 font-semibold bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
              <AlertCircle size={10} />
              <span>Failed</span>
            </span>
          )}
          {tool.duration && (
            <span className="text-[10px] text-[#8A8F98] hidden md:inline">
              {tool.duration}
            </span>
          )}
        </div>
      </button>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-3 border-t border-white/[0.06] bg-[#050506] text-[#EDEDEF] space-y-2 text-[11px] font-mono leading-relaxed overflow-x-auto">
          {tool.input && (
            <div>
              <div className="text-[10px] text-[#8A8F98] uppercase tracking-wider mb-1 font-semibold">
                Input Parameters:
              </div>
              <pre className="bg-[#0a0a0c] p-2 rounded border border-white/10 text-indigo-300 text-[10px] overflow-x-auto">
                {typeof tool.input === 'string' ? tool.input : JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
          )}

          {tool.output && (
            <div>
              <div className="text-[10px] text-[#8A8F98] uppercase tracking-wider mb-1 font-semibold">
                Result:
              </div>
              <pre className="bg-[#0a0a0c] p-2 rounded border border-white/10 text-emerald-300 text-[10px] overflow-x-auto">
                {typeof tool.output === 'string' ? tool.output : JSON.stringify(tool.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
