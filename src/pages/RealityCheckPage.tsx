import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Lightbulb, History } from 'lucide-react';
import { AppState, RealityCheck } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface RealityCheckPageProps {
  state: AppState;
  onAnalyzeDecision: (decisionClaim: string) => Promise<RealityCheck>;
}

export const RealityCheckPage: React.FC<RealityCheckPageProps> = ({
  state,
  onAnalyzeDecision
}) => {
  const { realityChecks, profile } = state;

  const [inputClaim, setInputClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<RealityCheck | null>(
    realityChecks[0] || null
  );

  const presets = [
    'I want to spend ₹50,000 on Meta and Google Ads to acquire users.',
    'I think I need to add 15 more features before launching.',
    'I want to hire a full-time frontend developer.',
    'I think my customers will pay ₹1,500/month for my tool.',
    'I want to completely pivot my product direction.'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClaim.trim() || loading) return;
    setLoading(true);
    try {
      const res = await onAnalyzeDecision(inputClaim);
      setCurrentAnalysis(res);
      setInputClaim('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#EDEDEF]">
      {/* Header Banner */}
      <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-2">
        <SectionBadge label="Decision Rigor & Counterargument Engine" variant="rose" />
        <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
          Founder Decision Reality Check
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F98] max-w-3xl leading-relaxed font-sans">
          Before burning cash, time, or developer bandwidth on major moves, stress-test your claim against evidence. FounderZero delivers direct counterarguments to prevent premature scaling and capital drain.
        </p>
      </div>

      {/* Decision Input Section */}
      <Card variant="default" className="p-6 space-y-4 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#5E6AD2]" />
            <h3 className="font-semibold text-[#EDEDEF] text-sm">Test a Decision or Expense</h3>
          </div>
          <span className="text-[11px] font-mono text-[#8A8F98]">Context: {profile.stage} • ₹{profile.monthlyRevenue} MRR</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-sans">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={inputClaim}
              onChange={e => setInputClaim(e.target.value)}
              placeholder="e.g. 'I want to spend ₹50,000 on Facebook ads' or 'I want to hire a growth marketer'"
              className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-[#EDEDEF] placeholder:text-[#8A8F98] outline-none focus:border-[#5E6AD2] transition"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              rightIcon={<Sparkles size={15} />}
              className="w-full sm:w-auto shrink-0"
            >
              Run Reality Check
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-mono text-[11px] font-semibold text-[#8A8F98] uppercase">Presets:</span>
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setInputClaim(p)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#EDEDEF] text-xs font-medium transition cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* Active Analysis View */}
      {currentAnalysis && (
        <div className="bg-[#0a0a0c] text-[#EDEDEF] rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_0_24px_rgba(94,106,210,0.2)] space-y-6 animate-in fade-in duration-200 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
                Claim Under Analysis
              </span>
              <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent mt-1">
                "{currentAnalysis.decisionClaim}"
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase text-[#8A8F98] block">Verdict</span>
              <Badge variant="rose" size="md" className="mt-1 font-bold">
                {currentAnalysis.recommendedDecision}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] space-y-1">
              <span className="font-mono font-bold text-[#5E6AD2] uppercase text-[10px] tracking-wider block">
                What Is Known (Real Evidence)
              </span>
              <p className="text-[#EDEDEF] leading-relaxed font-normal">{currentAnalysis.actualEvidence}</p>
            </div>

            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] space-y-1">
              <span className="font-mono font-bold text-amber-400 uppercase text-[10px] tracking-wider block">
                What Is Missing (Unproven Assumptions)
              </span>
              <p className="text-[#EDEDEF] leading-relaxed font-normal">{currentAnalysis.missingEvidence}</p>
            </div>
          </div>

          <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/30 space-y-1.5 text-xs text-rose-200">
            <div className="font-mono font-bold text-rose-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} />
              <span>Strongest Counterargument</span>
            </div>
            <p className="leading-relaxed text-sm text-[#EDEDEF]">{currentAnalysis.counterargument}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] space-y-1">
              <span className="font-mono font-bold text-rose-400 uppercase text-[10px] tracking-wider block">
                Risk Profile & Downside
              </span>
              <p className="text-[#EDEDEF] leading-relaxed">{currentAnalysis.risk}</p>
            </div>

            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 space-y-1">
              <span className="font-mono font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">
                Better Zero-Budget Alternative
              </span>
              <p className="text-emerald-200 leading-relaxed font-semibold">{currentAnalysis.betterAlternative}</p>
            </div>
          </div>
        </div>
      )}

      {/* Past Reality Checks Log */}
      <Card variant="default" className="p-6 space-y-4 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <History size={16} className="text-[#5E6AD2]" />
          <h3 className="font-semibold text-[#EDEDEF] text-sm">Previous Reality Checks</h3>
        </div>

        <div className="space-y-3 font-sans">
          {realityChecks.map(rc => (
            <div
              key={rc.id}
              onClick={() => setCurrentAnalysis(rc)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                currentAnalysis?.id === rc.id
                  ? 'border-[#5E6AD2] bg-[#5E6AD2]/15 shadow-xs'
                  : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'
              }`}
            >
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[#EDEDEF]">"{rc.decisionClaim}"</div>
                <div className="text-xs text-[#8A8F98]">Alternative: {rc.betterAlternative}</div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Badge variant="rose" size="sm">
                  {rc.recommendedDecision}
                </Badge>
                <span className="text-[10px] font-mono text-[#8A8F98]">{rc.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
