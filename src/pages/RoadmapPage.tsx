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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#EDEDEF]">
      {/* Header */}
      <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-2">
        <SectionBadge label="Dynamic Startup Lifecycle Framework" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
          Startup Execution Continuum
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F98] max-w-3xl leading-relaxed font-sans">
          Current Stage: <strong className="text-[#5E6AD2]">{profile.stage}</strong>. Check off key milestones as you gather customer evidence to graduate into subsequent growth phases.
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
                  ? 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-[0_0_16px_rgba(94,106,210,0.4)] font-bold'
                  : isDone
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-medium'
                  : 'bg-white/[0.03] text-[#8A8F98] border-white/[0.06]'
              }`}
            >
              <div className="text-[10px] uppercase font-mono font-bold opacity-75">Stage 0{idx + 1}</div>
              <div className="font-sans font-semibold text-xs mt-1 truncate">{stage.name}</div>
              <div className="text-[9px] uppercase font-mono font-semibold mt-1">
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
              className={`p-6 space-y-4 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${
                stage.status === 'active' ? 'border-[#5E6AD2]/50 shadow-[0_0_24px_rgba(94,106,210,0.15)]' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-[#EDEDEF]">{stage.name}</h3>
                    <Badge
                      variant={stage.status === 'completed' ? 'emerald' : stage.status === 'active' ? 'blue' : 'neutral'}
                      size="sm"
                    >
                      {stage.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#8A8F98] font-sans">{stage.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#EDEDEF]">{percent}% Complete</span>
                    <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-gradient-to-r from-[#5E6AD2] to-indigo-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-2 font-sans">
                {stage.milestones.map(m => (
                  <div
                    key={m.id}
                    onClick={() => onToggleMilestone(stage.id, m.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      m.completed
                        ? 'bg-white/[0.02] border-white/[0.06] text-[#8A8F98]'
                        : 'bg-white/[0.04] border-white/10 hover:border-[#5E6AD2]/50 text-[#EDEDEF] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {m.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-[#8A8F98] hover:text-[#5E6AD2] shrink-0" />
                      )}
                      <div>
                        <div className={`text-xs font-semibold ${m.completed ? 'line-through text-[#8A8F98]' : 'text-[#EDEDEF]'}`}>
                          {m.title}
                        </div>
                        <div className="text-[11px] font-mono text-[#8A8F98] mt-0.5">
                          Criteria: <strong className="text-[#EDEDEF]">{m.successCriteria}</strong>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-[#8A8F98] uppercase">
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
