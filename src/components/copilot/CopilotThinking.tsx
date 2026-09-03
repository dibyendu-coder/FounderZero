import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Check, Loader2, Brain, Sparkles } from 'lucide-react';
import { CopilotThinkingStep } from '../../types';

interface CopilotThinkingProps {
  steps?: CopilotThinkingStep[];
  isThinking?: boolean;
  activeStepLabel?: string;
  duration?: string;
}

export const CopilotThinking: React.FC<CopilotThinkingProps> = ({
  steps = [],
  isThinking = false,
  activeStepLabel,
  duration
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If no steps and not thinking, don't render anything
  if (!isThinking && steps.length === 0) {
    return null;
  }

  const allCompleted = !isThinking && steps.length > 0 && steps.every(s => s.status === 'completed');
  const summaryLabel = isThinking
    ? (activeStepLabel || 'Analyzing startup context & signals...')
    : `Thought for ${duration || '0.8s'} • Evaluated ${steps.length || 3} startup signals`;

  return (
    <div
      id="copilot-thinking-card"
      className="my-2 rounded-lg border border-white/10 bg-[#0a0a0c] text-xs font-sans text-[#EDEDEF] overflow-hidden transition-all shadow-md"
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/[0.04] transition cursor-pointer select-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isThinking ? (
            <div className="w-3.5 h-3.5 flex items-center justify-center text-indigo-300">
              <Loader2 size={13} className="animate-spin" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Check size={10} strokeWidth={3} />
            </div>
          )}

          <span className="font-mono font-medium text-[11px] text-[#EDEDEF] truncate">
            {summaryLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#8A8F98]">
          <span className="text-[10px] font-mono text-[#8A8F98]">
            {isExpanded ? 'Hide' : 'Details'}
          </span>
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </div>
      </button>

      {/* Expandable Step List */}
      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1 border-t border-white/[0.06] bg-[#050506] space-y-1.5 font-mono text-[11px] text-[#8A8F98]">
          {steps.length > 0 ? (
            steps.map((step, idx) => (
              <div key={step.id || idx} className="flex items-center gap-2 text-[#8A8F98]">
                {step.status === 'completed' ? (
                  <span className="text-emerald-400 font-bold">✓</span>
                ) : step.status === 'active' ? (
                  <Loader2 size={11} className="animate-spin text-[#5E6AD2]" />
                ) : (
                  <span className="text-[#8A8F98]">○</span>
                )}
                <span className={step.status === 'active' ? 'text-indigo-300 font-semibold' : 'text-[#EDEDEF]'}>
                  {step.label}
                </span>
                {step.duration && (
                  <span className="text-[10px] text-[#8A8F98] ml-auto">{step.duration}</span>
                )}
              </div>
            ))
          ) : (
            <div className="space-y-1.5 text-[#8A8F98]">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-[#EDEDEF]">Retrieved latest startup telemetry & bottleneck status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-[#EDEDEF]">Synthesized customer feedback interview patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-[#EDEDEF]">Formulated evidence-backed next action</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
