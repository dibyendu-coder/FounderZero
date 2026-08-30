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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <SectionBadge label="Core Growth & Unit Economics Calibration" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Metrics & Financial Discipline
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Update your active traction metrics. FounderZero continuously re-calibrates your Next Best Action and Premature Scaling safeguards as your figures change.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Active Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {profile.currentUsers.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 font-mono">Target: 200 Users for Stage Graduation</p>
        </Card>

        <Card variant="default" className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Monthly Revenue (MRR)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            ₹{profile.monthlyRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 font-mono">Target: ₹10,000 MRR Initial Benchmark</p>
        </Card>

        <Card variant="default" className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Monthly Operational Spend</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            ₹{profile.monthlyBudget.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 font-mono">Capital Efficiency: High (₹0 Stack)</p>
        </Card>
      </div>

      {/* Update Form */}
      <Card variant="default" className="p-6 space-y-4 max-w-xl">
        <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Update Current Traction Metrics
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Active Registered Users</label>
            <input
              type="number"
              min={0}
              value={users}
              onChange={e => setUsers(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-[#0052FF] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Monthly Recurring Revenue (₹)</label>
            <input
              type="number"
              min={0}
              value={mrr}
              onChange={e => setMrr(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-[#0052FF] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Monthly Operational Spend (₹)</label>
            <input
              type="number"
              min={0}
              value={budget}
              onChange={e => setBudget(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-[#0052FF] focus:bg-white"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="submit"
              variant="gradient"
              size="md"
              leftIcon={<RefreshCw size={14} />}
              className="w-full sm:w-auto"
            >
              Update Metrics & Recalculate Plan
            </Button>

            {updatedMsg && (
              <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                <CheckCircle2 size={15} /> Metrics updated & roadmap recalculated!
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
