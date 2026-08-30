import React, { useState } from 'react';
import { Layers, ArrowRight, ShieldCheck, Sparkles, DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';
import { AppState, ToolRecommendation } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface StackPageProps {
  state: AppState;
  onUpdateToolStatus: (toolId: string, status: ToolRecommendation['status']) => void;
  onReplaceToolCalculator: (paidToolName: string, estimatedCost: number) => void;
}

export const StackPage: React.FC<StackPageProps> = ({
  state,
  onUpdateToolStatus,
  onReplaceToolCalculator
}) => {
  const { tools, profile } = state;

  const [calcInput, setCalcInput] = useState('');
  const [calcCost, setCalcCost] = useState(3000);
  const [calcResult, setCalcResult] = useState<{ replacement: string; saving: number } | null>(null);

  const handleCalculatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcInput.trim()) return;

    const inputLower = calcInput.toLowerCase();
    let replacement = 'Vercel + PostHog Free + Supabase + Resend Free';
    let saving = calcCost;

    if (inputLower.includes('hubspot') || inputLower.includes('crm') || inputLower.includes('salesforce')) {
      replacement = 'Notion CRM template + Google Sheets / Airtable Free Tier';
    } else if (inputLower.includes('mailchimp') || inputLower.includes('email') || inputLower.includes('klaviyo')) {
      replacement = 'Resend Free Tier (3,000 emails/mo) + Brevo Free';
    } else if (inputLower.includes('mixpanel') || inputLower.includes('amplitude')) {
      replacement = 'PostHog Open Source / Cloud Free Tier (1M events/mo)';
    } else if (inputLower.includes('intercom') || inputLower.includes('zendesk')) {
      replacement = 'Crisp Free / Tawk.to Free Live Chat';
    } else if (inputLower.includes('zapier')) {
      replacement = 'Make.com Free / n8n Self-Hosted / Webhooks';
    }

    setCalcResult({ replacement, saving });
    onReplaceToolCalculator(calcInput, saving);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <SectionBadge label="Zero-Budget Infrastructure & Capital Efficiency" variant="emerald" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Zero-Budget Tool Stack ("Do It For ₹0")
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Never pay for expensive SaaS software before reaching ₹50,000 MRR. FounderZero maps enterprise-grade free alternatives that preserve your runway for validation.
        </p>
      </div>

      {/* Monthly Software Savings Card */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Total Monthly Software Capital Preserved
          </span>
          <div className="text-3xl md:text-4xl font-extrabold text-white font-mono">
            ₹{profile.monthlySavings.toLocaleString()} <span className="text-sm font-normal text-slate-400 font-sans">/ month</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Annual projected savings: <strong className="text-emerald-400 font-semibold">₹{(profile.monthlySavings * 12).toLocaleString()} / year</strong>
          </p>
        </div>

        <div className="px-5 py-4 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Extended Runway</div>
            <div className="text-[11px] text-slate-400">Survival time for Product-Market Fit</div>
          </div>
        </div>
      </div>

      {/* Replace an Expensive Tool Calculator */}
      <Card variant="default" className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles size={16} className="text-[#0052FF]" />
          <h3 className="font-bold text-slate-900 text-sm">Replace an Expensive Tool Calculator</h3>
        </div>

        <form onSubmit={handleCalculatorSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Paid Software
            </label>
            <input
              type="text"
              required
              value={calcInput}
              onChange={e => setCalcInput(e.target.value)}
              placeholder="e.g. Mailchimp, HubSpot, Mixpanel"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Monthly Cost (₹)
            </label>
            <input
              type="number"
              min={100}
              value={calcCost}
              onChange={e => setCalcCost(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="gradient"
              size="md"
              fullWidth
              rightIcon={<ArrowRight size={14} />}
            >
              Calculate Free Replacement
            </Button>
          </div>
        </form>

        {calcResult && (
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs space-y-1.5 animate-in fade-in duration-200">
            <div className="font-mono font-bold text-emerald-800 uppercase text-[10px]">
              Recommended Free Alternative for {calcInput}:
            </div>
            <p className="text-slate-900 font-semibold text-sm">{calcResult.replacement}</p>
            <div className="font-mono text-emerald-700 font-bold text-xs pt-0.5">
              +₹{calcResult.saving.toLocaleString()}/month added to your startup savings tracker!
            </div>
          </div>
        )}
      </Card>

      {/* Free Tool Recommendations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#0052FF]" />
            <h3 className="font-bold text-slate-900 text-base">Curated Zero-Budget Matrix</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{tools.length} Curated Tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map(tool => (
            <Card
              key={tool.id}
              variant="default"
              className="p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="blue" size="sm">
                    {tool.category}
                  </Badge>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                    100% Free Tier
                  </span>
                </div>

                <h4 className="font-bold text-lg text-slate-900">
                  {tool.freeOption}
                </h4>

                <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                  <span className="font-mono font-bold text-slate-400 uppercase text-[10px] block">
                    What It Solves
                  </span>
                  <p>{tool.whatItSolves}</p>
                </div>

                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">
                      Free Tier Limits
                    </span>
                    <span className="text-slate-700">{tool.freeLimitations}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">
                      When To Upgrade
                    </span>
                    <span className="text-slate-700">{tool.whenToUpgrade}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Paid Equivalent</span>
                  <div className="font-semibold text-slate-800 line-through">₹{tool.monthlyCost.toLocaleString()}/mo</div>
                </div>

                <Badge variant="emerald" size="md">
                  Saves ₹{tool.monthlySaving.toLocaleString()}/mo
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
