import React, { useState } from 'react';
import {
  CheckCircle2,
  PenLine,
  Compass,
  FlaskConical,
  Bookmark,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldAlert,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { CopilotActionProposal } from '../../types';

interface ActionProposalCardProps {
  proposal: CopilotActionProposal;
  conversationId: string;
  messageId: string;
  onConfirm: (proposal: CopilotActionProposal) => Promise<boolean>;
  onNavigate?: (route: string) => void;
}

export const ActionProposalCard: React.FC<ActionProposalCardProps> = ({
  proposal,
  conversationId,
  messageId,
  onConfirm,
  onNavigate
}) => {
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(proposal.status === 'confirmed');

  const handleConfirm = async () => {
    if (loading || isConfirmed) return;
    setLoading(true);
    try {
      const ok = await onConfirm(proposal);
      if (ok) {
        setIsConfirmed(true);
      }
    } catch (err) {
      console.error('Failed to confirm action:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (proposal.type) {
      case 'notepad_draft':
        return PenLine;
      case 'create_mission':
        return Compass;
      case 'create_experiment':
        return FlaskConical;
      case 'save_resource':
        return Bookmark;
      case 'reality_check':
        return ShieldAlert;
      case 'decision_matrix':
        return Layers;
      default:
        return Sparkles;
    }
  };

  const Icon = getIcon();

  const getActionLabel = () => {
    switch (proposal.type) {
      case 'notepad_draft':
        return 'Save to Notepad';
      case 'create_mission':
        return 'Create Mission';
      case 'create_experiment':
        return 'Launch Experiment';
      case 'save_resource':
        return 'Save to Vault';
      case 'update_startup_profile':
        return 'Update Startup Profile';
      default:
        return 'Confirm Action';
    }
  };

  const getTargetRoute = () => {
    switch (proposal.type) {
      case 'notepad_draft':
        return 'notepad';
      case 'create_mission':
        return 'missions';
      case 'create_experiment':
        return 'experiments';
      case 'save_resource':
        return 'vault';
      case 'update_startup_profile':
        return 'profile';
      default:
        return 'dashboard';
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100/80">
            <Icon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/50">
                Action Proposal
              </span>
              {isConfirmed && (
                <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  Confirmed & Applied
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{proposal.title}</h4>
          </div>
        </div>
      </div>

      {/* Description */}
      {proposal.description && (
        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{proposal.description}</p>
      )}

      {/* Structured Details Preview */}
      {proposal.type === 'notepad_draft' && proposal.draftNote && (
        <div className="mt-3 bg-white rounded-lg p-3 border border-slate-200/70 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Collection: <strong className="text-slate-800 font-semibold">{proposal.draftNote.collection}</strong>
            </span>
            <div className="flex gap-1">
              {(proposal.draftNote.tags || []).slice(0, 3).map(tag => (
                <span key={tag} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-slate-700 font-medium border-l-2 border-blue-500 pl-2">
            "{proposal.draftNote.title}"
          </div>
          <div className="text-[11px] text-slate-500">
            Includes {proposal.draftNote.blocks?.length || 0} formatted blocks (checklists, callouts, objectives).
          </div>
        </div>
      )}

      {proposal.type === 'create_mission' && proposal.missionData && (
        <div className="mt-3 bg-white rounded-lg p-3 border border-slate-200/70 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-800">{proposal.missionData.title}</span>
            <span className="font-mono text-slate-500">Est. Time: {proposal.missionData.estimatedTime}</span>
          </div>
          <p className="text-slate-600 text-[11px]">{proposal.missionData.objective}</p>
          <div className="space-y-1 pt-1 border-t border-slate-100">
            {(proposal.missionData.steps || []).slice(0, 3).map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-mono">
                  {idx + 1}
                </span>
                <span>{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {proposal.type === 'create_experiment' && proposal.experimentData && (
        <div className="mt-3 bg-white rounded-lg p-3 border border-slate-200/70 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-800">{proposal.experimentData.title}</span>
            <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Target: {proposal.experimentData.targetValue}
            </span>
          </div>
          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
            <strong>Hypothesis</strong>: {proposal.experimentData.hypothesis}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Metric: {proposal.experimentData.metric}</span>
            <span>Duration: {proposal.experimentData.duration} • Budget: {proposal.experimentData.budget}</span>
          </div>
        </div>
      )}

      {proposal.type === 'decision_matrix' && proposal.decisionData && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 text-[11px]">{proposal.decisionData.optionA.name}</div>
            <div className="text-[10px] text-slate-500">Impact: {proposal.decisionData.optionA.impact} • Effort: {proposal.decisionData.optionA.effort}</div>
            <p className="text-[10px] text-slate-600 leading-snug">{proposal.decisionData.optionA.evidence}</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 text-[11px]">{proposal.decisionData.optionB.name}</div>
            <div className="text-[10px] text-slate-500">Impact: {proposal.decisionData.optionB.impact} • Effort: {proposal.decisionData.optionB.effort}</div>
            <p className="text-[10px] text-slate-600 leading-snug">{proposal.decisionData.optionB.evidence}</p>
          </div>
        </div>
      )}

      {/* Action Trigger Buttons */}
      <div className="mt-3.5 flex items-center justify-between gap-3 pt-2">
        <div className="text-[11px] text-slate-500">
          {isConfirmed ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} />
              Saved to your startup workspace
            </span>
          ) : (
            <span>Explicit founder confirmation required</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConfirmed ? (
            <button
              onClick={() => onNavigate && onNavigate(getTargetRoute())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-[#0052FF] hover:bg-blue-100 transition cursor-pointer"
            >
              <span>View in {getTargetRoute()}</span>
              <ArrowRight size={12} />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0052FF] text-white hover:bg-blue-700 shadow-xs hover:shadow transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <Icon size={12} />
                  <span>{getActionLabel()}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
