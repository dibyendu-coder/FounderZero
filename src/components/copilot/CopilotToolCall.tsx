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
    if (name.includes('metric')) return <BarChart2 size={12} className="text-blue-500" />;
    if (name.includes('feedback') || name.includes('customer')) return <Users size={12} className="text-purple-500" />;
    if (name.includes('experiment')) return <FlaskConical size={12} className="text-teal-500" />;
    if (name.includes('mission') || name.includes('target')) return <Target size={12} className="text-rose-500" />;
    if (name.includes('note')) return <FileText size={12} className="text-amber-500" />;
    if (name.includes('vault') || name.includes('resource')) return <BookOpen size={12} className="text-indigo-500" />;
    return <Database size={12} className="text-slate-500" />;
  };

  const isRunning = tool.status === 'running';
  const isFailed = tool.status === 'failed';
  const isCompleted = tool.status === 'completed';

  return (
    <div
      id={`tool-call-${tool.id}`}
      className="my-1.5 rounded-lg border border-slate-200/90 bg-slate-50/90 text-xs font-mono overflow-hidden shadow-2xs transition-all"
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-100/70 transition cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-slate-400">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>

          <div className="flex items-center gap-1.5">
            {getToolIcon(tool.name)}
            <span className="font-bold text-slate-800 text-[11px]">{tool.name}</span>
          </div>

          <span className="text-slate-400 hidden sm:inline">•</span>

          <span className="text-slate-500 text-[11px] truncate max-w-[200px] md:max-w-md font-sans">
            {tool.description}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
              <Loader2 size={10} className="animate-spin" />
              <span>executing</span>
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              <Check size={10} strokeWidth={3} />
              <span>Complete</span>
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              <AlertCircle size={10} />
              <span>Failed</span>
            </span>
          )}
          {tool.duration && (
            <span className="text-[10px] text-slate-400 hidden md:inline">
              {tool.duration}
            </span>
          )}
        </div>
      </button>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-3 border-t border-slate-200/80 bg-slate-900 text-slate-200 space-y-2 text-[11px] font-mono leading-relaxed overflow-x-auto">
          {tool.input && (
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                Input Parameters:
              </div>
              <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-blue-300 text-[10px] overflow-x-auto">
                {typeof tool.input === 'string' ? tool.input : JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
          )}

          {tool.output && (
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                Result:
              </div>
              <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-emerald-300 text-[10px] overflow-x-auto">
                {typeof tool.output === 'string' ? tool.output : JSON.stringify(tool.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
