import React from 'react';
import { Activity, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { AppState } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface HealthPageProps {
  state: AppState;
  navigate: (route: string) => void;
}

export const HealthPage: React.FC<HealthPageProps> = ({ state, navigate }) => {
  const { healthDimensions } = state;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <SectionBadge label="8-Dimension Startup Diagnostic Audit" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Startup Health Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          FounderZero scores your startup strictly based on actual logged evidence, users, and financial discipline. Areas with missing data are marked as insufficient data rather than inflated with arbitrary numbers.
        </p>
      </div>

      {/* Grid of 8 Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {healthDimensions.map((dim) => {
          return (
            <Card
              key={dim.id}
              variant="default"
              className="p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-base text-slate-900">{dim.name}</h3>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-extrabold font-mono text-slate-900">
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

                <div className="space-y-2.5 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-mono font-bold text-slate-400 uppercase text-[10px] block">
                      Quantitative Evidence
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">{dim.evidence}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-mono font-bold text-rose-500 uppercase text-[10px] block">
                      Risk Factor
                    </span>
                    <p className="text-slate-600 leading-relaxed">{dim.risk}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-800 font-medium pr-2 leading-relaxed">
                  <strong className="text-blue-600">Prescription:</strong> {dim.recommendedAction}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('actions')}
                  rightIcon={<ArrowRight size={13} />}
                  className="shrink-0"
                >
                  Take Action
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
