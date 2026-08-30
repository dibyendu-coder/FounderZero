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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <SectionBadge label="Zero-Budget Playbooks & Playbooks" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Founder Growth Missions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
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
              className={`p-6 space-y-4 transition ${
                isFullyDone ? 'bg-slate-50 border-slate-200 opacity-85' : 'hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {mission.category}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      Difficulty: {mission.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {mission.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400 hidden sm:flex items-center gap-3">
                    <span>⏱ {mission.estimatedTime}</span>
                    <span>💰 {mission.estimatedCost}</span>
                  </div>

                  {isFullyDone ? (
                    <Badge variant="emerald" size="md">
                      <Award size={13} className="mr-1 inline" /> Mission Accomplished
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-mono font-bold text-blue-600 uppercase text-[10px] block">Objective</span>
                  <p className="text-slate-700 leading-relaxed font-normal">{mission.objective}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-mono font-bold text-emerald-600 uppercase text-[10px] block">Expected Result</span>
                  <p className="text-slate-700 leading-relaxed font-normal">{mission.expectedResult}</p>
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 pb-1">
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
                          ? 'bg-slate-100 border-slate-200 text-slate-500'
                          : 'bg-white border-slate-100 hover:border-blue-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {step.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Circle size={16} className="text-slate-300 hover:text-blue-500 shrink-0" />
                        )}
                        <span className={`text-xs ${step.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {step.text}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
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
