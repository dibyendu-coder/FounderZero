import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Send,
  Activity,
  TrendingUp,
  Flame,
  CheckSquare,
  DollarSign,
  HelpCircle,
  X,
  Target,
  Compass,
  Layers,
  FlaskConical,
  Bookmark
} from 'lucide-react';
import { AppState, NextAction, DontDoItem } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';
import { ResourcesForYouWidget } from '../components/ResourcesForYouWidget';
import { VaultSurfacingBanner } from '../components/VaultSurfacingBanner';
import { DashboardCopilotWidget } from '../components/DashboardCopilotWidget';

interface DashboardPageProps {
  state: AppState;
  navigate: (route: string) => void;
  onStartMission: (action: NextAction) => void;
  onAskQuery: (query: string) => Promise<string>;
  onAskCopilot?: (prompt: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  state,
  navigate,
  onStartMission,
  onAskQuery,
  onAskCopilot
}) => {
  const { profile, nextActions, dontDoItems, healthDimensions, activities } = state;

  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [queryAnswer, setQueryAnswer] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Top Next Best Action
  const nextBestAction = nextActions[0] || {
    id: 'act-default',
    title: 'Interview 5 active users to uncover your retention leverage point',
    whyItMatters: 'Retaining existing users is 5x cheaper than acquiring new ones.',
    expectedImpact: 'Increases 30-day user retention from 41% to 55%',
    estimatedTime: '3 hours',
    estimatedCost: '₹0',
    difficulty: 'Medium',
    deadline: 'In 3 days',
    relatedBottleneck: 'User Retention & Value Loop',
    priority: 'Do Now',
    reason: '127 signups recorded with 41% retention. Direct customer feedback pinpoints why users return.',
    evidence: '127 total signups, 41% retention.',
    status: 'pending'
  };

  // Top Don't Do Item
  const dontDo = dontDoItems[0] || {
    id: 'dont-default',
    action: 'Do NOT spend money on Meta or Google Ads yet',
    reason: 'Your retention bucket is uncalibrated (41%). Ads will burn your ₹2,000 monthly budget within 48 hours without producing lasting ROI.',
    currentEvidence: 'CAC estimated at ₹1,200/user while MRR per user is ₹66.',
    risk: 'Draining startup runway on empty clicks before fixing onboarding churn.',
    betterAlternative: 'Run 2 zero-budget community distribution experiments on Twitter/X and Reddit.'
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || queryLoading) return;
    setQueryLoading(true);
    try {
      const answer = await onAskQuery(queryInput);
      setQueryAnswer(answer);
    } catch (err) {
      setQueryAnswer('Unable to generate response right now. Please try again.');
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Welcome Card */}
      <div className="bg-[#000000] rounded-[16px] p-6 border border-[#292d30] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge label={`Stage: ${profile.stage}`} variant="blue" />
            <span className="text-xs font-commit text-[#6e727a]">•</span>
            <span className="text-xs font-commit text-[#ffffff]">{profile.name}</span>
            {profile.founderArchetype && (
              <span className="text-[10px] font-commit px-2 py-0.5 rounded-[6px] bg-[#000000] text-[#9281f7] border border-[#292d30]">
                {profile.founderArchetype}
              </span>
            )}
            {profile.category && (
              <span className="text-[10px] font-commit px-2 py-0.5 rounded-[6px] bg-[#000000] text-[#a1a4a5] border border-[#292d30]">
                {profile.category}
              </span>
            )}
            <button
              onClick={() => navigate('profile')}
              className="text-[11px] font-commit text-[#9281f7] hover:text-[#ffffff] bg-[#000000] hover:bg-[#0b0e14] px-2.5 py-0.5 rounded-[6px] border border-[#292d30] transition inline-flex items-center gap-1 cursor-pointer"
              title="View your Curated Founder Profile"
            >
              <Target size={11} />
              <span>Founder Dossier</span>
            </button>
            <button
              onClick={() => navigate('onboarding')}
              className="text-[11px] font-commit text-[#70b8ff] hover:text-[#ffffff] bg-[#000000] hover:bg-[#0b0e14] px-2.5 py-0.5 rounded-[6px] border border-[#292d30] transition inline-flex items-center gap-1 cursor-pointer"
              title="Re-calibrate onboarding and generate new growth recommendations"
            >
              <Sparkles size={11} />
              <span>Re-calibrate OS</span>
            </button>
          </div>
          <h1 className="text-2xl md:text-4xl font-favorit text-[#ffffff] font-normal tracking-[-2.8px]">
            Good morning, {(profile?.founderName || 'Founder').split(' ')[0]}.
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a4a5] max-w-2xl font-sans">
            90-Day Target: <strong className="text-[#f0f0f0] font-normal">{profile.goal90Days}</strong>
          </p>
        </div>

        {/* Quick Top Stats */}
        <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-[#292d30] pt-4 md:pt-0 md:pl-6 font-commit">
          <div className="text-center sm:text-left">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-normal text-[#ffffff] font-commit">{profile.founderScore}</span>
              <span className="text-xs text-[#a1a4a5] font-commit">/100</span>
            </div>
            <div className="text-[11px] font-commit text-[#9281f7] uppercase tracking-wider">
              Founder Score
            </div>
          </div>

          <div className="h-9 w-px bg-[#292d30]" />

          <div className="text-center sm:text-left">
            <div className="text-3xl font-normal text-[#3ad389] font-commit">
              ₹{profile.monthlySavings.toLocaleString()}
            </div>
            <div className="text-[11px] font-commit text-[#a1a4a5] uppercase tracking-wider">
              Saved / Month
            </div>
          </div>
        </div>
      </div>

      {/* Founder Vault Intelligent Contextual Surfacing Banner */}
      <VaultSurfacingBanner
        state={state}
        onNavigateToVault={() => navigate('vault')}
        onNavigateToSection={navigate}
      />

      {/* Founder Copilot Dashboard Widget */}
      <DashboardCopilotWidget
        state={state}
        onAskCopilot={(prompt) => {
          if (onAskCopilot) {
            onAskCopilot(prompt);
          } else {
            navigate('copilot');
          }
        }}
      />

      {/* 1. PRIMARY NEXT BEST ACTION HERO CARD */}
      <div className="bg-[#000000] text-[#f0f0f0] rounded-[16px] p-6 md:p-8 border border-[#292d30] relative overflow-hidden space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#292d30] pb-4 relative z-10 font-commit">
          <div className="flex items-center gap-2.5">
            <Badge variant="blue" size="md">
              PRIMARY ACTION
            </Badge>
            <span className="text-xs text-[#a1a4a5]">
              Bottleneck: <strong className="text-[#ffffff] font-normal">{nextBestAction.relatedBottleneck}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">
              Target: {nextBestAction.deadline}
            </Badge>
            <Badge variant="emerald" size="sm">
              Cost: {nextBestAction.estimatedCost}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h2 className="text-2xl md:text-3xl font-favorit text-[#ffffff] tracking-[-2.8px] leading-snug">
            {nextBestAction.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 font-sans">
            <div className="p-4 rounded-[6px] bg-[#0b0e14] border border-[#292d30] space-y-1">
              <span className="font-commit text-[#70b8ff] uppercase text-[10px] tracking-wider block">
                Why this matters right now
              </span>
              <p className="text-[#a1a4a5] leading-relaxed">
                {nextBestAction.whyItMatters}
              </p>
            </div>

            <div className="p-4 rounded-[6px] bg-[#0b0e14] border border-[#292d30] space-y-1">
              <span className="font-commit text-[#3ad389] uppercase text-[10px] tracking-wider block">
                Expected outcome & impact
              </span>
              <p className="text-[#f0f0f0] leading-relaxed">
                {nextBestAction.expectedImpact}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#292d30] relative z-10">
          <div className="flex items-center gap-4 text-xs font-commit text-[#a1a4a5]">
            <span>Est. Time: <strong className="text-[#ffffff] font-normal">{nextBestAction.estimatedTime}</strong></span>
            <span>•</span>
            <span>Difficulty: <strong className="text-[#ffffff] font-normal">{nextBestAction.difficulty}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setWhyModalOpen(true)}
            >
              Why this action?
            </Button>
            <Button
              variant="gradient"
              size="md"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => onStartMission(nextBestAction)}
            >
              Execute Mission
            </Button>
          </div>
        </div>
      </div>

      {/* Why Recommendation Modal */}
      {whyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-[#0052FF]" />
                <h3 className="font-bold text-slate-900 text-sm">Algorithmic Diagnosis Logic</h3>
              </div>
              <button
                onClick={() => setWhyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                  Current Startup Stage
                </span>
                <p className="text-slate-800 font-medium">
                  {profile.name} is in {profile.stage} stage with {profile.currentUsers} users and ₹{profile.monthlyRevenue} MRR.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                  Identified Bottleneck
                </span>
                <p className="text-slate-800 font-medium">{nextBestAction.relatedBottleneck}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                  Quantitative Evidence
                </span>
                <p className="text-slate-800 font-medium">{nextBestAction.evidence}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                  Why other actions were de-prioritized
                </span>
                <p className="text-slate-800 font-medium">{nextBestAction.reason}</p>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => setWhyModalOpen(false)}
            >
              Acknowledge & Close
            </Button>
          </div>
        </div>
      )}

      {/* 2. RESOURCE INTELLIGENCE FEED */}
      <ResourcesForYouWidget
        state={state}
        onNavigate={navigate}
      />

      {/* 3. DO NOT DO THIS YET (WARNING CARD) */}
      <Card variant="default" className="border-rose-200/80 bg-rose-50/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert size={18} />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Premature Scaling Warning — Do NOT Do This Yet
            </span>
          </div>
          <Badge variant="rose" size="sm">
            High Risk
          </Badge>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-slate-900">
          {dontDo.action}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="bg-white p-4 rounded-xl border border-rose-100 space-y-1 shadow-2xs">
            <span className="font-mono font-bold text-rose-600 text-[10px] uppercase tracking-wider block">
              Reasoning
            </span>
            <p className="text-slate-600 leading-relaxed">{dontDo.reason}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-100 space-y-1 shadow-2xs">
            <span className="font-mono font-bold text-rose-600 text-[10px] uppercase tracking-wider block">
              Risk Profile
            </span>
            <p className="text-slate-600 leading-relaxed">{dontDo.risk}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-1 shadow-2xs">
            <span className="font-mono font-bold text-emerald-700 text-[10px] uppercase tracking-wider block">
              Recommended ₹0 Alternative
            </span>
            <p className="text-slate-800 font-semibold leading-relaxed">{dontDo.betterAlternative}</p>
          </div>
        </div>
      </Card>

      {/* 3. AI QUERY COPILOT BAR */}
      <Card variant="default" className="p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#0052FF]" />
            <h3 className="font-bold text-slate-900 text-sm">Ask FounderZero Copilot</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Context: {profile.stage} • {profile.currentUsers} Users</span>
        </div>

        <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            placeholder="e.g. 'Why is my retention low?' or 'How should I price my beta tier?'"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={queryLoading}
            rightIcon={<Send size={14} />}
            className="w-full sm:w-auto shrink-0"
          >
            Ask AI
          </Button>
        </form>

        {queryAnswer && (
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-800 space-y-2 leading-relaxed animate-in fade-in duration-200">
            <div className="font-mono font-bold text-[#0052FF] uppercase text-[10px] flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Copilot Recommendation</span>
            </div>
            <p>{queryAnswer}</p>
          </div>
        )}
      </Card>

      {/* 4. HEALTH DIMENSIONS OVERVIEW GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#0052FF]" />
            <h3 className="font-bold text-slate-900 text-base">Startup Health Matrix</h3>
          </div>
          <button
            onClick={() => navigate('health')}
            className="text-xs font-semibold text-[#0052FF] hover:underline flex items-center gap-1"
          >
            <span>Full 8-Dimension Audit</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {healthDimensions.slice(0, 8).map(dim => (
            <div
              key={dim.id}
              onClick={() => navigate('health')}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
            >
              <div className="text-xs font-semibold text-slate-600 truncate group-hover:text-blue-600 transition-colors">
                {dim.name}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {dim.score !== null ? `${dim.score}%` : 'N/A'}
                </span>
                <Badge
                  variant={
                    dim.status === 'Strong'
                      ? 'emerald'
                      : dim.status === 'Healthy'
                      ? 'blue'
                      : dim.status === 'Needs Attention'
                      ? 'amber'
                      : dim.status === 'Critical'
                      ? 'rose'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {dim.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. RECENT ACTIVITY & QUICK LAUNCHPAD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" className="md:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#0052FF]" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Execution Timeline</h3>
            </div>
            <button
              onClick={() => navigate('actions')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View Actions →
            </button>
          </div>

          <div className="space-y-2.5">
            {activities.slice(0, 4).map(act => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-[#0052FF] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{act.title}</div>
                  <div className="text-slate-500 mt-0.5">{act.description}</div>
                </div>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Tools Launchpad */}
        <Card variant="default" className="p-6 space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Quick Launchpad</h3>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate('vault')}
              className="w-full p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 text-left text-xs font-bold text-[#0052FF] flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark size={15} className="text-[#0052FF]" />
                <span>Founder Vault ({state.savedResources?.length || 0})</span>
              </div>
              <ArrowRight size={14} className="text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('reality-check')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 text-left text-xs font-semibold text-slate-800 hover:text-blue-700 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={15} className="text-rose-500" />
                <span>Decision Reality Check</span>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition" />
            </button>

            <button
              onClick={() => navigate('stack')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 text-left text-xs font-semibold text-slate-800 hover:text-emerald-700 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <Layers size={15} className="text-emerald-600" />
                <span>Zero-Budget Tool Stack</span>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition" />
            </button>

            <button
              onClick={() => navigate('experiments')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 text-left text-xs font-semibold text-slate-800 hover:text-blue-700 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <FlaskConical size={15} className="text-blue-600" />
                <span>Growth Experiments</span>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition" />
            </button>

            <button
              onClick={() => navigate('customers')}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 text-left text-xs font-semibold text-slate-800 hover:text-blue-700 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <Compass size={15} className="text-indigo-600" />
                <span>Customer Feedback</span>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
