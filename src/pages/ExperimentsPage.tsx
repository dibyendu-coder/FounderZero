import React, { useState } from 'react';
import { FlaskConical, Plus, Sparkles, X, CheckCircle2, Clock, DollarSign, Target } from 'lucide-react';
import { AppState, Experiment, ExperimentStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface ExperimentsPageProps {
  state: AppState;
  onCreateExperiment: (exp: Partial<Experiment>) => void;
  onUpdateExperimentStatus: (expId: string, status: ExperimentStatus, learnings?: string) => void;
}

export const ExperimentsPage: React.FC<ExperimentsPageProps> = ({
  state,
  onCreateExperiment,
  onUpdateExperimentStatus
}) => {
  const { experiments } = state;

  const [modalOpen, setModalOpen] = useState(false);
  const [completeModalExp, setCompleteModalExp] = useState<Experiment | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [metric, setMetric] = useState('New Signups');
  const [currentValue, setCurrentValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [method, setMethod] = useState('');
  const [duration, setDuration] = useState('7 Days');
  const [budget, setBudget] = useState('₹0');

  // Completion Form states
  const [outcome, setOutcome] = useState('');
  const [learnings, setLearnings] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !hypothesis) return;
    onCreateExperiment({
      title,
      hypothesis,
      problem: 'Growth bottleneck test',
      metric,
      currentValue: currentValue || '0',
      targetValue: targetValue || '10',
      method: method || 'Organic community outreach',
      audience: 'Target Customer Community',
      duration,
      budget,
      status: 'Running',
      createdAt: new Date().toISOString().split('T')[0]
    });
    setModalOpen(false);
    setTitle('');
    setHypothesis('');
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalExp) return;
    onUpdateExperimentStatus(completeModalExp.id, 'Completed', learnings);
    setCompleteModalExp(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <SectionBadge label="Hypothesis-Driven Growth Engine" variant="blue" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Experiment Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Test growth hypotheses with zero or low budget. In FounderZero, every finished experiment yields a validated insight regardless of outcome.
          </p>
        </div>

        <Button
          variant="gradient"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={() => setModalOpen(true)}
          className="shrink-0"
        >
          New Experiment
        </Button>
      </div>

      {/* Experiment Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Design Growth Experiment</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experiment Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Reddit Problem Teardown Post"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hypothesis *</label>
                <textarea
                  required
                  rows={2}
                  value={hypothesis}
                  onChange={e => setHypothesis(e.target.value)}
                  placeholder="If we [action], then [metric] will increase because..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Metric</label>
                  <input
                    type="text"
                    value={metric}
                    onChange={e => setMetric(e.target.value)}
                    placeholder="New Signups"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Budget</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="₹0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Value</label>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={e => setCurrentValue(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Value</label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Execution Method</label>
                <input
                  type="text"
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  placeholder="e.g. Organic teardown thread with direct beta invite"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Launch Experiment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completeModalExp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Capture Experiment Learnings</h3>
              <button
                onClick={() => setCompleteModalExp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">What Actually Happened? *</label>
                <textarea
                  required
                  rows={2}
                  value={outcome}
                  onChange={e => setOutcome(e.target.value)}
                  placeholder="Outcome details and numeric results..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Insight Captured *</label>
                <textarea
                  required
                  rows={2}
                  value={learnings}
                  onChange={e => setLearnings(e.target.value)}
                  placeholder="What does this teach us about user behavior or channel effectiveness?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCompleteModalExp(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save Insight & Complete
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experiment List */}
      <div className="space-y-4">
        {experiments.length === 0 ? (
          <Card variant="flat" className="p-12 text-center text-slate-400 font-mono text-xs">
            You haven't launched a growth experiment yet. Click 'New Experiment' to test your highest-uncertainty assumption.
          </Card>
        ) : (
          experiments.map(exp => {
            const isDone = exp.status === 'Completed' || exp.status === 'Successful';
            return (
              <Card
                key={exp.id}
                variant="default"
                className={`p-6 space-y-4 transition ${
                  isDone ? 'bg-slate-50/70 border-slate-200' : 'hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={isDone ? 'emerald' : 'blue'} size="sm">
                        {exp.status}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        Budget: {exp.budget} • Duration: {exp.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
                  </div>

                  {!isDone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCompleteModalExp(exp)}
                    >
                      Log Result
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-mono font-bold text-blue-600 uppercase text-[10px] block">Hypothesis</span>
                    <p className="text-slate-700 leading-relaxed font-normal">{exp.hypothesis}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-mono font-bold text-slate-500 uppercase text-[10px] block">Method</span>
                    <p className="text-slate-700 leading-relaxed font-normal">{exp.method}</p>
                  </div>
                </div>

                {isDone && (
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-700 uppercase text-[10px]">
                      <Sparkles size={13} />
                      <span>Captured Learning</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">{exp.learnings || exp.resultOutcome}</p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
