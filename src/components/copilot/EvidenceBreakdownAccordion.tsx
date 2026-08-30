import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Database, Brain, Sparkles, BookOpen } from 'lucide-react';
import { EvidenceBreakdown } from '../../types';

interface EvidenceBreakdownAccordionProps {
  evidence?: EvidenceBreakdown;
}

export const EvidenceBreakdownAccordion: React.FC<EvidenceBreakdownAccordionProps> = ({ evidence }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!evidence) return null;

  const hasData =
    (evidence.knownData && evidence.knownData.length > 0) ||
    (evidence.founderAssumptions && evidence.founderAssumptions.length > 0) ||
    (evidence.inferences && evidence.inferences.length > 0) ||
    (evidence.generalKnowledge && evidence.generalKnowledge.length > 0);

  if (!hasData) return null;

  return (
    <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/70 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-slate-700 hover:bg-slate-100/80 transition cursor-pointer font-medium"
      >
        <div className="flex items-center gap-2">
          <Database size={13} className="text-blue-600" />
          <span className="font-mono text-[11px] font-semibold text-slate-800">
            Evidence & Reasoning Breakdown
          </span>
          <span className="text-[10px] text-slate-500">
            ({(evidence.knownData?.length || 0) + (evidence.founderAssumptions?.length || 0)} signals)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
          <span>{isOpen ? 'Hide' : 'Inspect'}</span>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 pt-1 border-t border-slate-200/60 space-y-3 bg-white">
          {/* Known Data */}
          {evidence.knownData && evidence.knownData.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Known Data (from Telemetry & Interviews)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3.5">
                {evidence.knownData.map((item, idx) => (
                  <div key={idx} className="bg-emerald-50/60 rounded px-2 py-1 border border-emerald-100 text-[11px]">
                    <span className="text-slate-600">{item.label}: </span>
                    <strong className="text-emerald-900 font-mono font-semibold">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Founder Assumptions */}
          {evidence.founderAssumptions && evidence.founderAssumptions.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Founder Assumptions (Unverified Beliefs)</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-3.5 text-[11px] text-amber-900">
                {evidence.founderAssumptions.map((assump, idx) => (
                  <li key={idx} className="leading-snug">{assump}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Inferences */}
          {evidence.inferences && evidence.inferences.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
                <Brain size={12} className="text-blue-500" />
                <span>AI Inferences (Pattern Deductions)</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-3.5 text-[11px] text-blue-900">
                {evidence.inferences.map((inf, idx) => (
                  <li key={idx} className="leading-snug">{inf}</li>
                ))}
              </ul>
            </div>
          )}

          {/* General Knowledge */}
          {evidence.generalKnowledge && evidence.generalKnowledge.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <BookOpen size={12} className="text-slate-400" />
                <span>General Knowledge (Startup Base Rates)</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-3.5 text-[11px] text-slate-600">
                {evidence.generalKnowledge.map((gk, idx) => (
                  <li key={idx} className="leading-snug">{gk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
