import React, { useState } from 'react';
import { CheckSquare, ArrowRight, ShieldAlert, PauseCircle, CheckCircle2, Flame, Clock, Sparkles } from 'lucide-react';
import { AppState, NextAction, ActionPriority, ActionStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface ActionsPageProps {
  state: AppState;
  onUpdateActionStatus: (actionId: string, status: ActionStatus) => void;
  onStartMission: (action: NextAction) => void;
}

export const ActionsPage: React.FC<ActionsPageProps> = ({
  state,
  onUpdateActionStatus,
  onStartMission
}) => {
  const [activeTab, setActiveTab] = useState<ActionPriority>('Do Now');

  const filteredActions = state.nextActions.filter(a => a.priority === activeTab);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#EDEDEF]">
      {/* Header */}
      <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-2">
        <SectionBadge label="Prioritized Bottleneck Navigation" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
          Next Actions & Execution Matrix
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F98] max-w-3xl leading-relaxed font-sans">
          Actions are dynamically prioritized by leverage, startup stage, and real customer evidence. Focus on completing your highest-leverage tasks before moving down the priority stack.
        </p>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto">
        {(['Do Now', 'Do Next', 'Later', "Don't Do Yet"] as ActionPriority[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all shrink-0 cursor-pointer border ${
              activeTab === tab
                ? tab === "Don't Do Yet"
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-[0_0_16px_rgba(94,106,210,0.3)]'
                : 'bg-white/[0.03] text-[#8A8F98] border-white/[0.06] hover:bg-white/[0.06] hover:text-[#EDEDEF]'
            }`}
          >
            {tab === "Don't Do Yet" ? `🚫 ${tab}` : tab === 'Do Now' ? `🔥 ${tab}` : tab}
          </button>
        ))}
      </div>

      {/* Action List */}
      <div className="space-y-4">
        {activeTab === "Don't Do Yet" ? (
          <div className="space-y-4">
            {state.dontDoItems.map(item => (
              <Card key={item.id} variant="default" className="border-rose-500/30 bg-rose-500/10 p-6 space-y-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300">
                    <ShieldAlert size={18} />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Premature Scaling Alert
                    </span>
                  </div>
                  <Badge variant="rose" size="sm">
                    Do Not Do
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-[#EDEDEF]">{item.action}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1 font-sans">
                  <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-1">
                    <span className="font-mono font-bold text-rose-400 text-[10px] uppercase tracking-wider block">Reason</span>
                    <p className="text-[#8A8F98] leading-relaxed">{item.reason}</p>
                  </div>
                  <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-1">
                    <span className="font-mono font-bold text-rose-400 text-[10px] uppercase tracking-wider block">Risk</span>
                    <p className="text-[#8A8F98] leading-relaxed">{item.risk}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 space-y-1">
                    <span className="font-mono font-bold text-emerald-400 text-[10px] uppercase tracking-wider block">Better Alternative</span>
                    <p className="text-emerald-200 font-semibold leading-relaxed">{item.betterAlternative}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredActions.length === 0 ? (
          <Card variant="flat" className="p-12 text-center text-[#8A8F98] font-mono text-xs bg-[#0a0a0c] border border-white/10 rounded-2xl">
            No actions currently in {activeTab}. You are all caught up!
          </Card>
        ) : (
          filteredActions.map(action => (
            <Card
              key={action.id}
              variant="default"
              className={`p-6 space-y-4 transition bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${
                action.status === 'completed'
                  ? 'opacity-70'
                  : 'hover:border-[#5E6AD2]/50'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {action.relatedBottleneck}
                    </Badge>
                    <span className="text-xs text-[#8A8F98] font-mono">
                      Target: {action.deadline}
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold ${action.status === 'completed' ? 'line-through text-[#8A8F98]' : 'text-[#EDEDEF]'}`}>
                    {action.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {action.status !== 'completed' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onStartMission(action)}
                      rightIcon={<ArrowRight size={14} />}
                    >
                      Start Mission
                    </Button>
                  )}

                  <Button
                    variant={action.status === 'completed' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateActionStatus(action.id, action.status === 'completed' ? 'pending' : 'completed')}
                    leftIcon={action.status === 'completed' ? <CheckCircle2 size={14} className="text-emerald-400" /> : undefined}
                  >
                    {action.status === 'completed' ? 'Completed' : 'Mark Complete'}
                  </Button>

                  {action.status !== 'completed' && (
                    <button
                      onClick={() => onUpdateActionStatus(action.id, 'snoozed')}
                      className="p-2 rounded-xl text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] border border-white/10 transition cursor-pointer"
                      title="Snooze Action"
                    >
                      <PauseCircle size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Estimated Time</span>
                  <div className="font-semibold text-[#EDEDEF] font-mono">{action.estimatedTime}</div>
                </div>

                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Estimated Cost</span>
                  <div className="font-semibold text-emerald-400 font-mono">{action.estimatedCost}</div>
                </div>

                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Difficulty</span>
                  <div className="font-semibold text-[#EDEDEF]">{action.difficulty}</div>
                </div>

                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Status</span>
                  <div className="font-semibold text-[#EDEDEF] capitalize font-mono">{action.status}</div>
                </div>
              </div>

              <div className="text-xs text-[#8A8F98] space-y-1 pt-1 font-sans">
                <div className="font-semibold text-[#EDEDEF]">Why it matters: <span className="font-normal text-[#8A8F98]">{action.whyItMatters}</span></div>
                <div className="font-semibold text-[#EDEDEF]">Expected impact: <span className="font-normal text-emerald-400">{action.expectedImpact}</span></div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
