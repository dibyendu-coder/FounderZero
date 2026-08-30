import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldAlert, Activity, Send, Target } from 'lucide-react';
import { AppState } from '../types';

interface DashboardCopilotWidgetProps {
  state: AppState;
  onAskCopilot: (prompt: string) => void;
}

export const DashboardCopilotWidget: React.FC<DashboardCopilotWidgetProps> = ({
  state,
  onAskCopilot
}) => {
  const [quickInput, setQuickInput] = useState('');
  const profile = state.profile;
  const bottleneck = profile?.biggestUncertainty || "Can't get users";

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onAskCopilot(quickInput.trim());
    setQuickInput('');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-[#38BDF8] flex items-center justify-center border border-blue-400/30">
              <Sparkles size={15} />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
              Founder Copilot
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300 font-medium">Your Startup Thinking Partner</span>
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-white">
              Need help? Ask FounderZero.
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Based on your telemetry, <strong className="text-blue-300 font-semibold">{bottleneck}</strong> is currently your biggest bottleneck.
            </p>
          </div>

          {/* Quick Trigger Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => onAskCopilot(`Why is "${bottleneck}" my biggest bottleneck right now, and what is the fastest leverage point to fix it?`)}
              className="text-xs bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>Ask why →</span>
            </button>
            <button
              onClick={() => onAskCopilot('What should I focus on today to make progress on my 90-day goal?')}
              className="text-xs bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>“What should I focus on today?”</span>
            </button>
            <button
              onClick={() => onAskCopilot('Review my pricing model and tell me if I am undercharging.')}
              className="text-xs bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer font-medium hidden sm:inline-flex"
            >
              <span>“Review my pricing.”</span>
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="w-full md:w-80">
          <form onSubmit={handleAsk} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                placeholder="Ask anything about your startup..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="submit"
                disabled={!quickInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#0052FF] text-white hover:bg-blue-600 transition disabled:opacity-40 cursor-pointer"
              >
                <Send size={13} />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
              <span>Zero generic platitudes.</span>
              <button
                type="button"
                onClick={() => onAskCopilot('')}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Open Copilot</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
