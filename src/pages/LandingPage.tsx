import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Zap,
  DollarSign,
  Sparkles,
  Layers,
  Activity,
  Compass,
  Check,
  Building2,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onEnterDemo: () => void;
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onEnterDemo,
  onLoginClick
}) => {
  // Interactive Reality Check preview on Landing Page
  const [realityInput, setRealityInput] = useState<string>('Should I spend ₹25,000 on Meta ads for user acquisition?');
  const [realityResult, setRealityResult] = useState<{
    verdict: string;
    reasoning: string;
    alternative: string;
  } | null>({
    verdict: 'Snooze Capital Spend',
    reasoning: 'At early stage with unvalidated 30-day retention, paid acquisition burns runway without compounding value.',
    alternative: 'Run 3 zero-budget community experiments on Reddit & Twitter first to benchmark organic baseline.'
  });

  // Interactive Tool Savings Calculator on Landing Page
  const [selectedTools, setSelectedTools] = useState<string[]>(['intercom', 'mixpanel']);
  
  const toolPrices: Record<string, { name: string; cost: number; freeAlt: string }> = {
    intercom: { name: 'Intercom / Live Chat', cost: 6000, freeAlt: 'Crisp Free Tier / Crisp Community' },
    mixpanel: { name: 'Mixpanel Analytics', cost: 8000, freeAlt: 'PostHog Free Tier (1M events/mo)' },
    mailchimp: { name: 'Mailchimp Email', cost: 4500, freeAlt: 'Brevo / Resend Free Tier' },
    hubspot: { name: 'HubSpot CRM', cost: 12000, freeAlt: 'Notion CRM + Airtable Free Pipeline' }
  };

  const toggleTool = (id: string) => {
    if (selectedTools.includes(id)) {
      setSelectedTools(selectedTools.filter(t => t !== id));
    } else {
      setSelectedTools([...selectedTools, id]);
    }
  };

  const totalMonthlyCost = selectedTools.reduce((acc, id) => acc + (toolPrices[id]?.cost || 0), 0);

  const handleTestRealityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!realityInput.trim()) return;

    const lower = realityInput.toLowerCase();
    if (lower.includes('ad') || lower.includes('marketing') || lower.includes('meta') || lower.includes('google')) {
      setRealityResult({
        verdict: 'Pause Spend — High Risk',
        reasoning: 'Paid channels require proven unit economics and 40%+ retention. Spending money before validation creates leaky bucket growth.',
        alternative: 'Conduct 5 direct customer interviews to pinpoint the exact value proposition before spending ad budget.'
      });
    } else if (lower.includes('hire') || lower.includes('agency') || lower.includes('developer')) {
      setRealityResult({
        verdict: 'Premature Scaling',
        reasoning: 'Founders must execute core sales and support manually to build deep customer empathy before delegating to hires.',
        alternative: 'Use zero-code templates and AI tools to handle volume until revenue exceeds ₹100,000/mo.'
      });
    } else {
      setRealityResult({
        verdict: 'Verify Evidence First',
        reasoning: 'Ensure this decision addresses your #1 current bottleneck rather than secondary optimizations.',
        alternative: 'Log this item in FounderZero Reality Check Engine for formal risk scoring.'
      });
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Notification Bar */}
      <div className="bg-[#0F172A] text-slate-300 py-2 px-4 text-xs font-mono border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0052FF]"></span>
            </span>
            <span className="font-semibold text-white">FounderZero OS</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Zero-Budget Startup Execution Framework</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-400 font-semibold font-mono">100% FREE & OPEN</span>
            <button
              onClick={onEnterDemo}
              className="text-blue-400 hover:text-blue-300 underline font-semibold transition"
            >
              Try Live Demo →
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={onEnterDemo}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0052FF] to-[#38BDF8] flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              0
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                FounderZero
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-[#0052FF] text-[10px] font-mono font-bold border border-blue-200/80">
                v2.4
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-[#0052FF] transition">
              Methodology
            </button>
            <button onClick={() => scrollToSection('calculator')} className="hover:text-[#0052FF] transition">
              ₹0 Stack Calculator
            </button>
            <button onClick={() => scrollToSection('reality-check')} className="hover:text-[#0052FF] transition">
              Reality Check
            </button>
            <button onClick={() => scrollToSection('stages')} className="hover:text-[#0052FF] transition">
              Stage Engine
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onLoginClick}>
              Log In
            </Button>
            <Button variant="gradient" size="sm" rightIcon={<ArrowRight size={14} />} onClick={onStartOnboarding}>
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-dot-pattern">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <SectionBadge label="Zero-Budget Startup Operating System" variant="blue" />

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Build smarter. Spend <span className="text-[#0052FF]">₹0</span>. Validate with evidence.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Most early startups die by spending money on ads, tools, and features before finding product-market fit. FounderZero prescribes your single <strong>Next Best Action</strong>, warns against premature spending, and powers your growth with free tools.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Button
                variant="gradient"
                size="lg"
                rightIcon={<ArrowRight size={16} />}
                onClick={onStartOnboarding}
                className="w-full sm:w-auto"
              >
                Create Your Startup Profile
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onEnterDemo}
                className="w-full sm:w-auto"
              >
                Explore Live Demo (PulseBoard)
              </Button>
            </div>

            {/* Feature Checklist */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                Evidence-based recommendations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                Curated ₹0 SaaS stack
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tool #1: Decision Reality Check Sandbox */}
      <section id="reality-check" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <SectionBadge label="Interactive Simulation" variant="rose" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Founder Decision Reality Check
            </h2>
            <p className="text-sm text-slate-500">
              Test any decision claim against real evidence before spending cash, time, or developer bandwidth.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card variant="default" className="shadow-lg border-slate-200">
              <form onSubmit={handleTestRealityCheck} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 font-mono uppercase tracking-wider mb-2">
                    Enter a major startup decision or planned expenditure:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={realityInput}
                      onChange={(e) => setRealityInput(e.target.value)}
                      placeholder="e.g. 'I want to spend ₹50,000 on Google Ads' or 'Hire a marketing agency'"
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0052FF] focus:bg-white transition"
                    />
                    <Button type="submit" variant="primary" size="md">
                      Analyze Risk
                    </Button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Try:</span>
                  {[
                    'Spend ₹25,000 on Facebook Ads',
                    'Hire a full-time designer',
                    'Build 10 more features before launch',
                    'Charge ₹2,000/month for beta'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setRealityInput(preset);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Result Card */}
                {realityResult && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-900 text-white space-y-3.5 border border-slate-800 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-rose-400" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                          Algorithmic Verdict
                        </span>
                      </div>
                      <Badge variant="rose" size="md">
                        {realityResult.verdict}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-rose-400 uppercase font-bold tracking-wider">
                          Why this is risky:
                        </span>
                        <p className="text-slate-300 leading-relaxed font-normal">
                          {realityResult.reasoning}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                          Cheaper & Safer Alternative:
                        </span>
                        <p className="text-slate-200 leading-relaxed font-semibold">
                          {realityResult.alternative}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Tool #2: Zero-Budget Tool Stack Calculator */}
      <section id="calculator" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <SectionBadge label="Capital Efficiency" variant="emerald" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Zero-Budget Tool Stack ("Do It For ₹0")
            </h2>
            <p className="text-sm text-slate-500">
              Select the expensive tools you thought you needed. See how much you save with enterprise-grade free alternatives.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Tool Selection List */}
            <div className="md:col-span-2 space-y-3">
              {Object.entries(toolPrices).map(([id, tool]) => {
                const isSelected = selectedTools.includes(id);
                return (
                  <div
                    key={id}
                    onClick={() => toggleTool(id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white border-blue-300 shadow-md shadow-blue-500/5'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#0052FF] border-[#0052FF] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{tool.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Free alternative: <strong className="text-emerald-700">{tool.freeAlt}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-slate-900">
                        ₹{tool.cost.toLocaleString()}/mo
                      </div>
                      <div className="text-[11px] font-mono text-emerald-600 font-semibold">
                        Replaced for ₹0
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Savings Total Card */}
            <div className="bg-[#0F172A] text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
              <div>
                <span className="text-[11px] font-mono text-blue-400 uppercase font-bold tracking-wider">
                  Monthly Capital Preserved
                </span>
                <div className="text-4xl font-extrabold text-white mt-1 font-mono">
                  ₹{totalMonthlyCost.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Annual runway saved: <strong className="text-emerald-400 font-bold">₹{(totalMonthlyCost * 12).toLocaleString()}/yr</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1 leading-relaxed">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Preserve Runway
                </div>
                <p>
                  Saving ₹{totalMonthlyCost.toLocaleString()}/mo equals an extra 6 to 12 months of survival time to find product-market fit.
                </p>
              </div>

              <Button
                variant="gradient"
                fullWidth
                size="md"
                onClick={onStartOnboarding}
              >
                Use ₹0 Stack in My Startup
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Pillars Section */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <SectionBadge label="Core Architecture" variant="blue" />
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Three Pillars of Lean Execution
            </h2>
            <p className="text-sm text-slate-500">
              Built specifically for bootstrappers, indie hackers, and zero-budget early-stage creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="interactive" className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052FF] flex items-center justify-center font-bold">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Single Next Best Action</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Never wonder what to do next. FounderZero scans your current users, stage, and qualitative data to identify your single highest-leverage task.
              </p>
            </Card>

            <Card variant="interactive" className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Do NOT Do This Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Premature scaling kills startups. We actively warn you against building unnecessary features, spending on ads, or incorporating too early.
              </p>
            </Card>

            <Card variant="interactive" className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Do It For ₹0 Stack</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Run analytics, transactional email, CRM pipelines, and user feedback entirely on world-class generous free tiers until revenue begins flowing.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 6 Stages Progression Framework */}
      <section id="stages" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <SectionBadge label="Dynamic Calibration" variant="amber" />
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Calibrated For Every Startup Stage
            </h2>
            <p className="text-sm text-slate-500">
              Recommendations adapt dynamically as your startup matures from an idea to first revenue.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { stage: 'Idea', focus: 'Customer Problem Validation', budget: '₹0 Budget' },
              { stage: 'Validating', focus: '10 Problem Interviews', budget: '₹0 Budget' },
              { stage: 'Building MVP', focus: 'Single Core Feature', budget: '₹0 Budget' },
              { stage: 'Launched', focus: 'First 50 Beta Users', budget: 'Organic Only' },
              { stage: 'First Revenue', focus: 'Conversion & Retention', budget: 'Reinvest Revenue' },
              { stage: 'Growing', focus: 'Unit Economics & Scale', budget: 'Positive Cashflow' }
            ].map((s, i) => (
              <div
                key={s.stage}
                className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2 shadow-2xs"
              >
                <div className="text-[10px] font-mono font-bold text-[#0052FF] uppercase">
                  Stage 0{i + 1}
                </div>
                <div className="text-sm font-bold text-slate-900">{s.stage}</div>
                <div className="text-xs text-slate-500">{s.focus}</div>
                <div className="pt-1 text-[11px] font-mono font-semibold text-emerald-700">
                  {s.budget}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-20 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern-dark opacity-30" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop guessing. Start building with evidence today.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join thousands of smart founders executing zero-budget growth plans with FounderZero.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="gradient"
              size="lg"
              rightIcon={<ArrowRight size={16} />}
              onClick={onStartOnboarding}
              className="w-full sm:w-auto"
            >
              Get Started Free Now
            </Button>
            <Button
              variant="dark"
              size="lg"
              onClick={onEnterDemo}
              className="w-full sm:w-auto border border-slate-700 hover:border-slate-600"
            >
              Open PulseBoard Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 md:px-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 font-sans">FounderZero OS</span>
            <span>•</span>
            <span>Zero-Budget Operating System</span>
          </div>
          <div>
            Built with clarity, structure, and evidence for startup founders.
          </div>
        </div>
      </footer>
    </div>
  );
};
