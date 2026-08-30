import React from 'react';
import { Map, CheckCircle2, Circle, ArrowRight, Flag } from 'lucide-react';
import { AppState } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface RoadmapPageProps {
  state: AppState;
  onToggleMilestone: (stageId: string, milestoneId: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ state, onToggleMilestone }) => {
  const { roadmapStages, profile } = state;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <SectionBadge label="Dynamic Startup Lifecycle Framework" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Startup Execution Continuum
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Current Stage: <strong className="text-[#0052FF]">{profile.stage}</strong>. Check off key milestones as you gather customer evidence to graduate into subsequent growth phases.
        </p>
      </div>

      {/* Stage Flow Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono">
        {roadmapStages.map((stage, idx) => {
          const isActive = stage.status === 'active';
          const isDone = stage.status === 'completed';
          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border text-center transition-all ${
                isActive
                  ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-md shadow-blue-500/20 font-bold'
                  : isDone
                  ? 'bg-slate-100 text-slate-800 border-slate-200'
                  : 'bg-white text-slate-400 border-slate-200/80'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-75">Stage 0{idx + 1}</div>
              <div className="font-sans font-bold text-xs mt-1 truncate">{stage.name}</div>
              <div className="text-[9px] uppercase font-semibold mt-1">
                {isDone ? '✓ Done' : isActive ? '● Active' : 'Upcoming'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Stage Milestones */}
      <div className="space-y-6">
        {roadmapStages.map(stage => {
          const completedCount = stage.milestones.filter(m => m.completed).length;
          const totalCount = stage.milestones.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <Card
              key={stage.id}
              variant="default"
              className={`p-6 space-y-4 ${
                stage.status === 'active' ? 'border-blue-200 shadow-md shadow-blue-500/5' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{stage.name}</h3>
                    <Badge
                      variant={stage.status === 'completed' ? 'emerald' : stage.status === 'active' ? 'blue' : 'neutral'}
                      size="sm"
                    >
                      {stage.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{stage.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700">{percent}% Complete</span>
                    <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-[#0052FF] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-2">
                {stage.milestones.map(m => (
                  <div
                    key={m.id}
                    onClick={() => onToggleMilestone(stage.id, m.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      m.completed
                        ? 'bg-slate-50 border-slate-200/80 text-slate-500'
                        : 'bg-white border-slate-100 hover:border-blue-200 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {m.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-slate-300 hover:text-blue-500 shrink-0" />
                      )}
                      <div>
                        <div className={`text-xs font-semibold ${m.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {m.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Criteria: <strong className="text-slate-600">{m.successCriteria}</strong>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                      {m.completed ? 'Done' : 'Click to toggle'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
