import React, { useState } from 'react';
import { GitCompare, Check, X, Edit3, ArrowRight, CheckCheck } from 'lucide-react';
import { CopilotDiffData } from '../../types';

interface CopilotDiffViewProps {
  diff: CopilotDiffData;
  onAccept: (diff: CopilotDiffData) => void;
  onReject: (diff: CopilotDiffData) => void;
}

export const CopilotDiffView: React.FC<CopilotDiffViewProps> = ({
  diff,
  onAccept,
  onReject
}) => {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>(diff.status || 'pending');

  const handleAccept = () => {
    setStatus('accepted');
    onAccept({ ...diff, status: 'accepted' });
  };

  const handleReject = () => {
    setStatus('rejected');
    onReject({ ...diff, status: 'rejected' });
  };

  return (
    <div
      id={`diff-view-${diff.id}`}
      className="my-3 rounded-xl border border-white/10 bg-[#0a0a0c] overflow-hidden shadow-md text-xs font-sans transition-all text-[#EDEDEF]"
    >
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#050506] text-[#EDEDEF] flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <GitCompare size={14} className="text-[#5E6AD2]" />
          <span className="font-mono font-bold text-xs">{diff.title || 'Proposed Startup Updates'}</span>
          <span className="text-[10px] font-mono uppercase bg-white/[0.06] text-indigo-300 px-1.5 py-0.5 rounded border border-white/10">
            {diff.target || 'Profile'}
          </span>
        </div>

        <div>
          {status === 'accepted' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
              <CheckCheck size={13} />
              <span>Applied</span>
            </span>
          )}
          {status === 'rejected' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 font-semibold">
              <X size={13} />
              <span>Dismissed</span>
            </span>
          )}
        </div>
      </div>

      {diff.description && (
        <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] text-[11px] text-[#8A8F98]">
          {diff.description}
        </div>
      )}

      {/* Diff Blocks */}
      <div className="p-3 space-y-3 font-mono text-xs">
        {diff.changes.map((change, idx) => (
          <div key={idx} className="space-y-1">
            {change.label && (
              <div className="text-[11px] font-sans font-semibold text-[#EDEDEF]">
                {change.label}:
              </div>
            )}
            <div className="rounded-lg border border-white/10 overflow-hidden text-[11px] leading-relaxed">
              {/* Old Value */}
              <div className="bg-rose-500/10 text-rose-200 px-3 py-1.5 border-b border-rose-500/20 flex items-start gap-2">
                <span className="text-rose-400 font-bold select-none">-</span>
                <div className="line-through opacity-80 whitespace-pre-wrap">{change.oldValue}</div>
              </div>
              {/* New Value */}
              <div className="bg-emerald-500/10 text-emerald-200 px-3 py-1.5 flex items-start gap-2">
                <span className="text-emerald-400 font-bold select-none">+</span>
                <div className="font-semibold whitespace-pre-wrap">{change.newValue}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      {status === 'pending' && (
        <div className="px-4 py-2.5 bg-[#050506] border-t border-white/[0.06] flex items-center justify-end gap-2 font-sans">
          <button
            type="button"
            onClick={handleReject}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] font-semibold text-xs transition cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-3 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6872D9] text-white font-semibold text-xs shadow-[0_0_12px_rgba(94,106,210,0.3)] transition cursor-pointer"
          >
            Accept Updates
          </button>
        </div>
      )}
    </div>
  );
};
