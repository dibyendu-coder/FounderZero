import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, Quote, Target } from 'lucide-react';
import { AppState } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface InsightsPageProps {
  state: AppState;
  navigate: (route: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ state, navigate }) => {
  const { nextActions, realityChecks, customerFeedback, profile } = state;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <SectionBadge label="Continuous Qualitative & Quantitative Synthesis" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Central Intelligence Feed
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Aggregated strategic insights combining direct customer interviews, decision reality checks, bottleneck analysis, and zero-budget growth prescriptions.
        </p>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {/* Next Action Insight */}
        {nextActions[0] && (
          <div className="bg-[#0F172A] text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <Badge variant="blue" size="sm">
                Top Priority Prescription
              </Badge>
              <span className="text-xs font-mono text-slate-400">Target: {nextActions[0].deadline}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{nextActions[0].title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{nextActions[0].whyItMatters}</p>
            <div className="pt-2">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => navigate('actions')}
                rightIcon={<ArrowRight size={14} />}
              >
                View Action Plan
              </Button>
            </div>
          </div>
        )}

        {/* Reality Check Insight */}
        {realityChecks[0] && (
          <Card variant="default" className="p-6 border-rose-200/80 bg-rose-50/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert size={16} />
                <span className="font-mono text-xs font-bold uppercase">Reality Check Counterargument</span>
              </div>
              <Badge variant="rose" size="sm">
                {realityChecks[0].recommendedDecision}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900">"{realityChecks[0].decisionClaim}"</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{realityChecks[0].counterargument}</p>
          </Card>
        )}

        {/* Customer Voice Insight */}
        {customerFeedback[0] && (
          <Card variant="default" className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#0052FF]">
              <Quote size={16} />
              <span className="font-mono text-xs font-bold uppercase">Voice of the Customer</span>
            </div>
            <p className="text-xs text-slate-800 italic leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              "{customerFeedback[0].content}"
            </p>
            <div className="text-xs font-semibold text-slate-600">
              — {customerFeedback[0].customerName} ({customerFeedback[0].type}) • Focus: {customerFeedback[0].keyPainPoint}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
