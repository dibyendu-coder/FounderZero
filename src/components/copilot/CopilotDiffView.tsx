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
      className="my-3 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs text-xs font-sans transition-all"
    >
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-900 text-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare size={14} className="text-blue-400" />
          <span className="font-mono font-bold text-xs">{diff.title || 'Proposed Startup Updates'}</span>
          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
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
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-600">
          {diff.description}
        </div>
      )}

      {/* Diff Blocks */}
      <div className="p-3 space-y-3 font-mono text-xs">
        {diff.changes.map((change, idx) => (
          <div key={idx} className="space-y-1">
            {change.label && (
              <div className="text-[11px] font-sans font-bold text-slate-700">
                {change.label}:
              </div>
            )}
            <div className="rounded-lg border border-slate-200 overflow-hidden text-[11px] leading-relaxed">
              {/* Old Value */}
              <div className="bg-rose-50/70 text-rose-900 px-3 py-1.5 border-b border-rose-100/60 flex items-start gap-2">
                <span className="text-rose-500 font-bold select-none">-</span>
                <div className="line-through opacity-80 whitespace-pre-wrap">{change.oldValue}</div>
              </div>
              {/* New Value */}
              <div className="bg-emerald-50/70 text-emerald-900 px-3 py-1.5 flex items-start gap-2">
                <span className="text-emerald-600 font-bold select-none">+</span>
                <div className="font-semibold whitespace-pre-wrap">{change.newValue}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      {status === 'pending' && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleReject}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Check size={13} />
            <span>Accept & Update</span>
          </button>
        </div>
      )}
    </div>
  );
};
