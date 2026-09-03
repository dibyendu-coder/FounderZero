import React from 'react';
import { Compass, CheckCircle2, Circle, Award, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { AppState } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface MissionsPageProps {
  state: AppState;
  onToggleMissionStep: (missionId: string, stepId: string) => void;
  onCompleteMission: (missionId: string) => void;
}

export const MissionsPage: React.FC<MissionsPageProps> = ({
  state,
  onToggleMissionStep,
  onCompleteMission
}) => {
  const { missions } = state;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#EDEDEF]">
      {/* Header */}
      <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-2">
        <SectionBadge label="Zero-Budget Playbooks & Playbooks" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
          Founder Growth Missions
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F98] max-w-3xl leading-relaxed font-sans">
          Step-by-step actionable missions engineered for zero-budget execution. Completing missions recalculates your Founder Score and advances your health metrics.
        </p>
      </div>

      {/* Missions Grid */}
      <div className="space-y-6">
        {missions.map(mission => {
          const completedSteps = mission.steps.filter(s => s.completed).length;
          const totalSteps = mission.steps.length;
          const isFullyDone = mission.completed || (totalSteps > 0 && completedSteps === totalSteps);

          return (
            <Card
              key={mission.id}
              variant="default"
              className={`p-6 space-y-4 transition bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${
                isFullyDone ? 'opacity-75' : 'hover:border-[#5E6AD2]/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {mission.category}
                    </Badge>
                    <span className="text-xs text-[#8A8F98] font-mono">
                      Difficulty: {mission.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#EDEDEF]">
                    {mission.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-[#8A8F98] hidden sm:flex items-center gap-3">
                    <span>⏱ {mission.estimatedTime}</span>
                    <span>💰 {mission.estimatedCost}</span>
                  </div>

                  {isFullyDone ? (
                    <Badge variant="emerald" size="md">
                      <Award size={13} className="mr-1 inline text-emerald-400" /> Mission Accomplished
                    </Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onCompleteMission(mission.id)}
                    >
                      Complete All
                    </Button>
                  )}
                </div>
              </div>

              {/* Mission Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06] space-y-1">
                  <span className="font-mono font-bold text-[#5E6AD2] uppercase text-[10px] block">Objective</span>
                  <p className="text-[#EDEDEF] leading-relaxed font-normal">{mission.objective}</p>
                </div>

                <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06] space-y-1">
                  <span className="font-mono font-bold text-emerald-400 uppercase text-[10px] block">Expected Result</span>
                  <p className="text-[#EDEDEF] leading-relaxed font-normal">{mission.expectedResult}</p>
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-2 pt-1 font-sans">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8A8F98] pb-1">
                  <span>EXECUTION STEPS</span>
                  <span>{completedSteps} / {totalSteps} Completed</span>
                </div>

                <div className="space-y-1.5">
                  {mission.steps.map(step => (
                    <div
                      key={step.id}
                      onClick={() => onToggleMissionStep(mission.id, step.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        step.completed
                          ? 'bg-white/[0.02] border-white/[0.06] text-[#8A8F98]'
                          : 'bg-white/[0.04] border-white/10 hover:border-[#5E6AD2]/50 text-[#EDEDEF] shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {step.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Circle size={16} className="text-[#8A8F98] hover:text-[#5E6AD2] shrink-0" />
                        )}
                        <span className={`text-xs ${step.completed ? 'line-through text-[#8A8F98]' : 'text-[#EDEDEF]'}`}>
                          {step.text}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8A8F98]">
                        {step.completed ? 'Done' : 'Click to toggle'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
