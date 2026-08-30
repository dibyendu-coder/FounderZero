import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  FlaskConical,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  Target
} from 'lucide-react';
import { Mission, Experiment, StartupProfile, NoteConnection } from '../../types';

interface ConvertActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'mission' | 'experiment';
  noteTitle: string;
  noteContent: string;
  profile: StartupProfile;
  onCreateMission: (mission: Mission) => void;
  onCreateExperiment: (experiment: Experiment) => void;
  onLinkCreatedEntity: (connection: NoteConnection) => void;
}

export const ConvertActionModal: React.FC<ConvertActionModalProps> = ({
  isOpen,
  onClose,
  targetType,
  noteTitle,
  noteContent,
  profile,
  onCreateMission,
  onCreateExperiment,
  onLinkCreatedEntity
}) => {
  const [loading, setLoading] = useState(false);

  // Mission State
  const [missionTitle, setMissionTitle] = useState('');
  const [missionObjective, setMissionObjective] = useState('');
  const [missionCategory, setMissionCategory] = useState('Validation');
  const [missionWhyItMatters, setMissionWhyItMatters] = useState('');
  const [missionTime, setMissionTime] = useState('3 hours');
  const [missionCost, setMissionCost] = useState('₹0');
  const [missionDifficulty, setMissionDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [missionResult, setMissionResult] = useState('');
  const [missionSteps, setMissionSteps] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: 's1', text: 'Synthesize core hypothesis from note', completed: false },
    { id: 's2', text: 'Reach out to 5 target users for qualitative feedback', completed: false },
    { id: 's3', text: 'Log results in FounderZero roadmap', completed: false }
  ]);

  // Experiment State
  const [expTitle, setExpTitle] = useState('');
  const [expHypothesis, setExpHypothesis] = useState('');
  const [expProblem, setExpProblem] = useState('');
  const [expMetric, setExpMetric] = useState('Activation Rate');
  const [expCurrentVal, setExpCurrentVal] = useState('18%');
  const [expTargetVal, setExpTargetVal] = useState('35%');
  const [expDuration, setExpDuration] = useState('7 days');
  const [expBudget, setExpBudget] = useState('₹0');
  const [expMethod, setExpMethod] = useState('');
  const [expAudience, setExpAudience] = useState('Next 50 visitor signups');

  useEffect(() => {
    if (isOpen) {
      loadAiExtraction();
    }
  }, [isOpen, targetType, noteTitle, noteContent]);

  if (!isOpen) return null;

  const loadAiExtraction = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/convert-note-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          noteTitle,
          noteContent,
          profile
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (targetType === 'mission' && data.mission) {
          setMissionTitle(data.mission.title || `Execute: ${noteTitle}`);
          setMissionObjective(data.mission.objective || '');
          setMissionCategory(data.mission.category || 'Validation');
          setMissionWhyItMatters(data.mission.whyItMatters || '');
          setMissionTime(data.mission.estimatedTime || '3 hours');
          setMissionCost(data.mission.estimatedCost || '₹0');
          setMissionDifficulty(data.mission.difficulty || 'Medium');
          setMissionResult(data.mission.expectedResult || '');
          if (data.mission.steps && data.mission.steps.length > 0) {
            setMissionSteps(data.mission.steps);
          }
        } else if (targetType === 'experiment' && data.experiment) {
          setExpTitle(data.experiment.title || `Test: ${noteTitle}`);
          setExpHypothesis(data.experiment.hypothesis || '');
          setExpProblem(data.experiment.problem || '');
          setExpMetric(data.experiment.metric || 'Activation Rate');
          setExpCurrentVal(data.experiment.currentValue || '18%');
          setExpTargetVal(data.experiment.targetValue || '35%');
          setExpDuration(data.experiment.duration || '7 days');
          setExpBudget(data.experiment.budget || '₹0');
          setExpMethod(data.experiment.method || 'A/B cohort trial');
          setExpAudience(data.experiment.audience || 'Sample users');
        }
      }
    } catch (err) {
      console.error('Failed to parse note into action:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMission = () => {
    const newMission: Mission = {
      id: `m-${Date.now()}`,
      title: missionTitle || 'New Mission',
      category: missionCategory,
      objective: missionObjective,
      whyItMatters: missionWhyItMatters,
      estimatedTime: missionTime,
      estimatedCost: missionCost,
      difficulty: missionDifficulty,
      expectedResult: missionResult,
      completed: false,
      steps: missionSteps
    };

    onCreateMission(newMission);
    onLinkCreatedEntity({
      entityType: 'mission',
      entityId: newMission.id,
      entityTitle: newMission.title,
      entitySubtitle: newMission.category
    });
    onClose();
  };

  const handleCreateExperiment = () => {
    const newExperiment: Experiment = {
      id: `exp-${Date.now()}`,
      title: expTitle || 'New Growth Experiment',
      hypothesis: expHypothesis,
      problem: expProblem,
      metric: expMetric,
      currentValue: expCurrentVal,
      targetValue: expTargetVal,
      method: expMethod || '1-week validation test',
      audience: expAudience,
      duration: expDuration,
      budget: expBudget,
      status: 'Planned',
      createdAt: new Date().toISOString()
    };

    onCreateExperiment(newExperiment);
    onLinkCreatedEntity({
      entityType: 'experiment',
      entityId: newExperiment.id,
      entityTitle: newExperiment.title,
      entitySubtitle: `Status: Planned`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              targetType === 'mission'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {targetType === 'mission' ? <Compass size={18} /> : <FlaskConical size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {targetType === 'mission' ? 'Turn Note into Mission' : 'Turn Note into Experiment'}
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                  AI Action
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                Review and confirm structured entity before adding to your workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <p className="text-xs font-medium">Extracting structured parameters from note...</p>
            </div>
          ) : targetType === 'mission' ? (
            /* Mission Form */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-500 mb-1">
                  Mission Title
                </label>
                <input
                  type="text"
                  value={missionTitle}
                  onChange={e => setMissionTitle(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={missionCategory}
                    onChange={e => setMissionCategory(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="Validation">Validation</option>
                    <option value="Growth">Growth</option>
                    <option value="Product">Product</option>
                    <option value="Stack">Stack</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={missionDifficulty}
                    onChange={e => setMissionDifficulty(e.target.value as any)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={missionTime}
                    onChange={e => setMissionTime(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Cost
                  </label>
                  <input
                    type="text"
                    value={missionCost}
                    onChange={e => setMissionCost(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-500 mb-1">
                  Objective & Why It Matters
                </label>
                <textarea
                  rows={2}
                  value={missionObjective}
                  onChange={e => setMissionObjective(e.target.value)}
                  className="w-full text-xs text-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-slate-500">
                    Execution Steps ({missionSteps.length})
                  </label>
                  <button
                    onClick={() =>
                      setMissionSteps([
                        ...missionSteps,
                        { id: `s-${Date.now()}`, text: '', completed: false }
                      ])
                    }
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Step</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {missionSteps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={step.text}
                        onChange={e => {
                          const updated = [...missionSteps];
                          updated[idx].text = e.target.value;
                          setMissionSteps(updated);
                        }}
                        className="flex-1 text-xs text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                      <button
                        onClick={() => setMissionSteps(missionSteps.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Experiment Form */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-500 mb-1">
                  Experiment Title
                </label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={e => setExpTitle(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-500 mb-1">
                  Hypothesis Statement
                </label>
                <textarea
                  rows={2}
                  value={expHypothesis}
                  onChange={e => setExpHypothesis(e.target.value)}
                  placeholder="If we [change], then [outcome] because [reason]..."
                  className="w-full text-xs text-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Primary Metric
                  </label>
                  <input
                    type="text"
                    value={expMetric}
                    onChange={e => setExpMetric(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Baseline
                  </label>
                  <input
                    type="text"
                    value={expCurrentVal}
                    onChange={e => setExpCurrentVal(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Target
                  </label>
                  <input
                    type="text"
                    value={expTargetVal}
                    onChange={e => setExpTargetVal(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={expDuration}
                    onChange={e => setExpDuration(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Estimated Cost
                  </label>
                  <input
                    type="text"
                    value={expBudget}
                    onChange={e => setExpBudget(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={expAudience}
                    onChange={e => setExpAudience(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={targetType === 'mission' ? handleCreateMission : handleCreateExperiment}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check size={14} />
            <span>
              {targetType === 'mission' ? 'Confirm & Create Mission' : 'Confirm & Create Experiment'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
