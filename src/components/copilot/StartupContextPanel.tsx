import React from 'react';
import {
  Database,
  BarChart2,
  Users,
  Target,
  FlaskConical,
  FileText,
  Bookmark,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  Sliders,
  DollarSign,
  Activity
} from 'lucide-react';
import { AppState, StartupProfile } from '../../types';

interface StartupContextPanelProps {
  state: AppState;
  onNavigate: (route: string) => void;
  onClose?: () => void;
}

export const StartupContextPanel: React.FC<StartupContextPanelProps> = ({
  state,
  onNavigate,
  onClose
}) => {
  const profile = state.profile || ({} as StartupProfile);
  const metrics = state.metrics || [];
  const feedback = state.customerFeedback || [];
  const missions = state.missions || [];
  const experiments = state.experiments || [];
  const notes = state.notes || [];
  const savedResources = state.savedResources || [];

  // Active mission and experiment
  const activeMission = missions.find(m => !m.completed) || missions[0];
  const activeExperiment = experiments.find(e => e.status === 'Running') || experiments[0];

  // Specific key metrics
  const retMetric = metrics.find(m => m.name.toLowerCase().includes('retention'))?.currentValue || '24%';
  const actMetric = metrics.find(m => m.name.toLowerCase().includes('activation'))?.currentValue || '61%';

  return (
    <div
      id="startup-context-panel"
      className="w-full h-full bg-[#050506] border-l border-white/[0.06] flex flex-col justify-between overflow-y-auto text-xs font-sans select-none text-[#EDEDEF]"
    >
      <div className="p-4 space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 font-mono font-bold text-[#EDEDEF] text-xs">
            <Database size={14} className="text-[#5E6AD2]" />
            <span>Startup Context</span>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="text-[11px] font-mono text-[#5E6AD2] hover:text-indigo-300 font-semibold cursor-pointer"
          >
            Edit Profile →
          </button>
        </div>

        {/* 1. Startup Identity Card */}
        <div className="bg-[#0a0a0c] rounded-xl p-3 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8A8F98] font-bold">Startup</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#5E6AD2]/20 text-indigo-300 font-bold uppercase border border-[#5E6AD2]/30">
              {profile.stage || 'MVP'}
            </span>
          </div>
          <div className="font-semibold text-[#EDEDEF] text-sm">{profile.name || 'PulseBoard'}</div>
          <div className="text-[11px] text-[#8A8F98] line-clamp-2 leading-snug font-sans">
            {profile.description || profile.problem || 'Zero-budget startup growth operating system for founders.'}
          </div>
          <div className="pt-1 text-[11px] text-[#8A8F98] font-mono flex items-center gap-2">
            <span>ICP:</span>
            <span className="text-[#EDEDEF] font-semibold truncate">{profile.targetCustomer || 'College Students'}</span>
          </div>
        </div>

        {/* 2. Core Telemetry Grid */}
        <div className="space-y-1.5 font-sans">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-[#8A8F98] px-0.5">
            <span>Real-time Metrics</span>
            <button
              onClick={() => onNavigate('metrics')}
              className="text-[#5E6AD2] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => onNavigate('metrics')}
              className="p-2.5 bg-[#0a0a0c] hover:bg-white/[0.04] rounded-lg border border-white/10 transition cursor-pointer"
            >
              <div className="text-[10px] font-mono text-[#8A8F98]">Monthly Revenue</div>
              <div className="text-sm font-extrabold text-emerald-400 font-mono">
                ₹{(profile.monthlyRevenue || 4500).toLocaleString()}
              </div>
            </div>

            <div
              onClick={() => onNavigate('metrics')}
              className="p-2.5 bg-[#0a0a0c] hover:bg-white/[0.04] rounded-lg border border-white/10 transition cursor-pointer"
            >
              <div className="text-[10px] font-mono text-[#8A8F98]">Active Users</div>
              <div className="text-sm font-extrabold text-[#EDEDEF] font-mono">
                {profile.currentUsers || 127}
              </div>
            </div>

            <div
              onClick={() => onNavigate('metrics')}
              className="p-2.5 bg-[#0a0a0c] hover:bg-white/[0.04] rounded-lg border border-white/10 transition cursor-pointer"
            >
              <div className="text-[10px] font-mono text-[#8A8F98]">Day-7 Retention</div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">
                {retMetric}
              </div>
            </div>

            <div
              onClick={() => onNavigate('metrics')}
              className="p-2.5 bg-[#0a0a0c] hover:bg-white/[0.04] rounded-lg border border-white/10 transition cursor-pointer"
            >
              <div className="text-[10px] font-mono text-[#8A8F98]">Activation Rate</div>
              <div className="text-sm font-extrabold text-indigo-300 font-mono">
                {actMetric}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Current Bottleneck Box */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 font-sans">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-amber-400">
            <AlertOctagon size={12} className="text-amber-400" />
            <span>Current Bottleneck</span>
          </div>
          <div className="text-xs font-semibold text-amber-200">
            {profile.biggestUncertainty || 'Day-7 User Retention Drop-off'}
          </div>
          <div className="text-[11px] text-amber-300/80 leading-snug">
            Signal: 76% of users drop off before returning on Day 7. Prioritize retention over acquisition.
          </div>
        </div>

        {/* 4. Active Mission */}
        {activeMission && (
          <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/10 space-y-2 font-sans">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-[#8A8F98]">
              <div className="flex items-center gap-1 text-rose-400">
                <Target size={12} />
                <span>Active Mission</span>
              </div>
              <button
                onClick={() => onNavigate('missions')}
                className="text-[#5E6AD2] hover:underline cursor-pointer"
              >
                Missions
              </button>
            </div>
            <div className="text-xs font-semibold text-[#EDEDEF] leading-snug">
              {activeMission.title}
            </div>
            <div className="text-[11px] text-[#8A8F98] font-mono">
              {activeMission.steps?.filter(s => s.completed).length || 0}/
              {activeMission.steps?.length || 3} tasks completed
            </div>
          </div>
        )}

        {/* 5. Active Experiment */}
        {activeExperiment && (
          <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/10 space-y-1.5 font-sans">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-[#8A8F98]">
              <div className="flex items-center gap-1 text-teal-400">
                <FlaskConical size={12} />
                <span>Active Experiment</span>
              </div>
              <button
                onClick={() => onNavigate('experiments')}
                className="text-[#5E6AD2] hover:underline cursor-pointer"
              >
                Experiments
              </button>
            </div>
            <div className="text-xs font-semibold text-[#EDEDEF] leading-snug">
              {activeExperiment.title}
            </div>
            <div className="text-[11px] text-[#8A8F98] font-mono">
              Target: {activeExperiment.targetValue || '55%'}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Jump List */}
      <div className="p-3 bg-[#050506] border-t border-white/[0.06] space-y-1 text-[11px] font-mono text-[#8A8F98]">
        <div className="text-[10px] uppercase font-mono font-bold text-[#8A8F98] mb-1">Founder Memory Vault</div>
        <div className="flex items-center justify-between hover:text-indigo-300 cursor-pointer py-0.5" onClick={() => onNavigate('feedback')}>
          <span>• Customer Feedback ({feedback.length})</span>
          <ArrowRight size={11} />
        </div>
        <div className="flex items-center justify-between hover:text-indigo-300 cursor-pointer py-0.5" onClick={() => onNavigate('notepad')}>
          <span>• Founder Notepad ({notes.length})</span>
          <ArrowRight size={11} />
        </div>
        <div className="flex items-center justify-between hover:text-indigo-300 cursor-pointer py-0.5" onClick={() => onNavigate('vault')}>
          <span>• Saved Vault ({savedResources.length})</span>
          <ArrowRight size={11} />
        </div>
      </div>
    </div>
  );
};
