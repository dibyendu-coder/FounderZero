import React, { useState } from 'react';
import { BarChart3, RefreshCw, Users, DollarSign, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';
import { AppState } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface MetricsPageProps {
  state: AppState;
  onUpdateMetrics: (metrics: {
    currentUsers: number;
    monthlyRevenue: number;
    monthlyBudget: number;
  }) => void;
}

export const MetricsPage: React.FC<MetricsPageProps> = ({ state, onUpdateMetrics }) => {
  const { profile } = state;

  const [users, setUsers] = useState(profile.currentUsers);
  const [mrr, setMrr] = useState(profile.monthlyRevenue);
  const [budget, setBudget] = useState(profile.monthlyBudget);
  const [updatedMsg, setUpdatedMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMetrics({
      currentUsers: users,
      monthlyRevenue: mrr,
      monthlyBudget: budget
    });
    setUpdatedMsg(true);
    setTimeout(() => setUpdatedMsg(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#EDEDEF]">
      {/* Header */}
      <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-2">
        <SectionBadge label="Core Growth & Unit Economics Calibration" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
          Metrics & Financial Discipline
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F98] max-w-3xl leading-relaxed font-sans">
          Update your active traction metrics. FounderZero continuously re-calibrates your Next Best Action and Premature Scaling safeguards as your figures change.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="p-6 space-y-2 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#8A8F98] uppercase">Active Users</span>
            <div className="w-8 h-8 rounded-lg bg-[#5E6AD2]/20 text-indigo-300 flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#EDEDEF] font-mono">
            {profile.currentUsers.toLocaleString()}
          </div>
          <p className="text-xs text-[#8A8F98] font-mono">Target: 200 Users for Stage Graduation</p>
        </Card>

        <Card variant="default" className="p-6 space-y-2 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#8A8F98] uppercase">Monthly Revenue (MRR)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ₹{profile.monthlyRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-[#8A8F98] font-mono">Target: ₹10,000 MRR Initial Benchmark</p>
        </Card>

        <Card variant="default" className="p-6 space-y-2 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#8A8F98] uppercase">Monthly Operational Spend</span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] text-[#EDEDEF] flex items-center justify-center font-bold">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#EDEDEF] font-mono">
            ₹{profile.monthlyBudget.toLocaleString()}
          </div>
          <p className="text-xs text-[#8A8F98] font-mono">Capital Efficiency: High (₹0 Stack)</p>
        </Card>
      </div>

      {/* Update Form */}
      <Card variant="default" className="p-6 space-y-4 max-w-xl bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <h3 className="font-semibold text-base text-[#EDEDEF] border-b border-white/[0.06] pb-3">
          Update Current Traction Metrics
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-medium text-[#EDEDEF] mb-1">Active Registered Users</label>
            <input
              type="number"
              min={0}
              value={users}
              onChange={e => setUsers(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl text-sm font-mono outline-none focus:border-[#5E6AD2]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#EDEDEF] mb-1">Monthly Recurring Revenue (₹)</label>
            <input
              type="number"
              min={0}
              value={mrr}
              onChange={e => setMrr(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl text-sm font-mono outline-none focus:border-[#5E6AD2]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#EDEDEF] mb-1">Monthly Operational Spend (₹)</label>
            <input
              type="number"
              min={0}
              value={budget}
              onChange={e => setBudget(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl text-sm font-mono outline-none focus:border-[#5E6AD2]"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<RefreshCw size={14} />}
              className="w-full sm:w-auto"
            >
              Update Metrics & Recalculate Plan
            </Button>

            {updatedMsg && (
              <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1 font-mono">
                <CheckCircle2 size={15} /> Metrics updated & roadmap recalculated!
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
