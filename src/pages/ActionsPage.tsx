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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <SectionBadge label="Prioritized Bottleneck Navigation" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Next Actions & Execution Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Actions are dynamically prioritized by leverage, startup stage, and real customer evidence. Focus on completing your highest-leverage tasks before moving down the priority stack.
        </p>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {(['Do Now', 'Do Next', 'Later', "Don't Do Yet"] as ActionPriority[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all shrink-0 cursor-pointer ${
              activeTab === tab
                ? tab === "Don't Do Yet"
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                  : 'bg-[#0052FF] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-transparent'
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
              <Card key={item.id} variant="default" className="border-rose-200 bg-rose-50/20 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-700">
                    <ShieldAlert size={18} />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Premature Scaling Alert
                    </span>
                  </div>
                  <Badge variant="rose" size="sm">
                    Do Not Do
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{item.action}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-white p-4 rounded-xl border border-rose-100 space-y-1">
                    <span className="font-mono font-bold text-rose-600 text-[10px] uppercase tracking-wider block">Reason</span>
                    <p className="text-slate-600 leading-relaxed">{item.reason}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-rose-100 space-y-1">
                    <span className="font-mono font-bold text-rose-600 text-[10px] uppercase tracking-wider block">Risk</span>
                    <p className="text-slate-600 leading-relaxed">{item.risk}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-1">
                    <span className="font-mono font-bold text-emerald-700 text-[10px] uppercase tracking-wider block">Better Alternative</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">{item.betterAlternative}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredActions.length === 0 ? (
          <Card variant="flat" className="p-12 text-center text-slate-400 font-mono text-xs">
            No actions currently in {activeTab}. You are all caught up!
          </Card>
        ) : (
          filteredActions.map(action => (
            <Card
              key={action.id}
              variant="default"
              className={`p-6 space-y-4 transition ${
                action.status === 'completed'
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {action.relatedBottleneck}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      Target: {action.deadline}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold ${action.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {action.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {action.status !== 'completed' && (
                    <Button
                      variant="gradient"
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
                    leftIcon={action.status === 'completed' ? <CheckCircle2 size={14} className="text-emerald-600" /> : undefined}
                  >
                    {action.status === 'completed' ? 'Completed' : 'Mark Complete'}
                  </Button>

                  {action.status !== 'completed' && (
                    <button
                      onClick={() => onUpdateActionStatus(action.id, 'snoozed')}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
                      title="Snooze Action"
                    >
                      <PauseCircle size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Estimated Time</span>
                  <div className="font-semibold text-slate-800">{action.estimatedTime}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Estimated Cost</span>
                  <div className="font-semibold text-emerald-700">{action.estimatedCost}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Difficulty</span>
                  <div className="font-semibold text-slate-800">{action.difficulty}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Status</span>
                  <div className="font-semibold text-slate-800 capitalize">{action.status}</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1">
                <div className="font-semibold text-slate-800">Why it matters: <span className="font-normal text-slate-600">{action.whyItMatters}</span></div>
                <div className="font-semibold text-slate-800">Expected impact: <span className="font-normal text-emerald-700">{action.expectedImpact}</span></div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
