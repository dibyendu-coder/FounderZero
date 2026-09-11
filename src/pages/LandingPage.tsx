import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldAlert,
  Zap,
  Layers,
  Check,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Play,
  TrendingUp,
  CreditCard,
  Building2,
  DollarSign,
  Search,
  Lock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { HeroCube } from '../components/HeroCube';

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
  // Hero Chart State
  const [chartPeriod, setChartPeriod] = useState<'30D' | '90D' | '1Y'>('30D');
  const [emailInput, setEmailInput] = useState<string>('');

  // Decision Reality Check state
  const [realityInput, setRealityInput] = useState<string>('Should I spend ₹25,000 on Meta ads for user acquisition?');
  const [realityResult, setRealityResult] = useState<{
    verdict: string;
    statusCode: string;
    reasoning: string;
    alternative: string;
    codeSnippet: string;
  } | null>({
    verdict: 'PAUSE SPEND (RISK: HIGH)',
    statusCode: '402_PREMATURE_SCALING',
    reasoning: 'At early stage with unvalidated 30-day retention, paid acquisition burns runway without compounding value.',
    alternative: 'Run 3 zero-budget community experiments on Reddit & Twitter first to benchmark organic baseline.',
    codeSnippet: 'const decision = await founderZero.verifyExpenditure({ amount: 25000, channel: "meta_ads" });\n// Status: 402 Premature Scaling — Retention benchmark < 40%'
  });

  // Interactive Tool Stack Calculator state
  const [selectedTools, setSelectedTools] = useState<string[]>(['intercom', 'mixpanel']);

  const toolPrices: Record<string, { name: string; cost: number; freeAlt: string; codeKey: string }> = {
    intercom: { name: 'Intercom / Live Chat', cost: 6000, freeAlt: 'Crisp Free Tier / Crisp Community', codeKey: 'chat_engine' },
    mixpanel: { name: 'Mixpanel Analytics', cost: 8000, freeAlt: 'PostHog Free Tier (1M events/mo)', codeKey: 'analytics_sdk' },
    mailchimp: { name: 'Mailchimp Email', cost: 4500, freeAlt: 'Brevo / Resend Free Tier', codeKey: 'email_dispatch' },
    hubspot: { name: 'HubSpot CRM', cost: 12000, freeAlt: 'Notion CRM + Airtable Free Pipeline', codeKey: 'crm_pipeline' }
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
        verdict: 'PAUSE SPEND — HIGH RISK',
        statusCode: '402_PREMATURE_SCALING',
        reasoning: 'Paid channels require proven unit economics and 40%+ retention. Spending money before validation creates leaky bucket growth.',
        alternative: 'Conduct 5 direct customer interviews to pinpoint the exact value proposition before spending ad budget.',
        codeSnippet: 'const audit = await founderZero.auditBudget("paid_ads");\n// Warning: 0% organic baseline detected. Paid acquisition locked.'
      });
    } else if (lower.includes('hire') || lower.includes('agency') || lower.includes('developer')) {
      setRealityResult({
        verdict: 'PREMATURE DELEGATION',
        statusCode: '403_FOUNDER_BOTTLENECK',
        reasoning: 'Founders must execute core sales and support manually to build deep customer empathy before delegating to hires.',
        alternative: 'Use zero-code templates and AI tools to handle volume until revenue exceeds ₹100,000/mo.',
        codeSnippet: 'const delegation = await founderZero.evaluateRole("agency_hire");\n// Recommendation: Execute manually in Stage 01.'
      });
    } else {
      setRealityResult({
        verdict: 'EVIDENCE REQUIRED',
        statusCode: '401_UNVALIDATED_HYPOTHESIS',
        reasoning: 'Ensure this decision addresses your #1 current bottleneck rather than secondary optimizations.',
        alternative: 'Log this item in FounderZero Reality Check Engine for formal risk scoring.',
        codeSnippet: 'const check = await founderZero.verifyEvidence("decision_draft");\n// Action: Prescribe single Next Best Action first.'
      });
    }
  };

  const handleHeroEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartOnboarding();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-[#e2e3e9] font-inter selection:bg-[#cc9166] selection:text-[#08080a]">
      {/* Top Banner — Hairline divider, quiet dark mode anchor */}
      <div className="bg-[#08080a] text-[#9194a1] py-2.5 px-4 text-[13px] border-b border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc9166]" />
            <span className="text-[#ffffff] font-medium">Slash Editorial Edition</span>
            <span className="text-[#2e3038]">•</span>
            <span className="text-[#9194a1] hidden sm:inline">FounderZero OS — Zero-Budget Operating System</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#cc9166] text-xs font-mono hidden md:inline">sys_status: operational</span>
            <button
              onClick={onEnterDemo}
              className="text-[#ffffff] hover:text-[#cc9166] flex items-center gap-1 transition-colors cursor-pointer text-[13px]"
            >
              <span>Explore PulseBoard Demo</span>
              <ChevronRight size={13} className="text-[#cc9166]" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#08080a]/90 backdrop-blur-md border-b border-[#1c1d22] px-4 md:px-8 py-4">
        <div className="max-w-[1216px] mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={onEnterDemo}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-[9999px] bg-[#040406] border border-[#2e3038] flex items-center justify-center text-[#ffffff] font-ivy-presto font-medium text-base group-hover:border-[#cc9166] transition-colors">
              /
            </div>
            <div className="flex items-center gap-2">
              <span className="font-ivy-presto font-normal text-[#ffffff] text-xl tracking-[0.01em]">
                FounderZero
              </span>
              <span className="px-2 py-0.5 rounded-[9999px] border border-[#2e3038] text-[#cc9166] text-[11px] font-mono">
                v2.4
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] text-[#9194a1]">
            <button onClick={() => scrollToSection('features')} className="hover:text-[#ffffff] transition-colors cursor-pointer flex items-center gap-1">
              <span>Methodology</span>
            </button>
            <button onClick={() => scrollToSection('calculator')} className="hover:text-[#ffffff] transition-colors cursor-pointer flex items-center gap-1">
              <span>₹0 Stack</span>
            </button>
            <button onClick={() => scrollToSection('reality-check')} className="hover:text-[#ffffff] transition-colors cursor-pointer flex items-center gap-1">
              <span>Reality Check</span>
            </button>
            <button onClick={() => scrollToSection('stages')} className="hover:text-[#ffffff] transition-colors cursor-pointer flex items-center gap-1">
              <span>Stage Engine</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="btn-slash-ghost"
            >
              Sign in
            </button>
            <button
              onClick={onStartOnboarding}
              className="btn-slash-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section — Continuous #08080a Canvas with Ivy Presto Display Headline & Joined Input/Pill Button */}
      <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 bg-[#08080a]">
        <div className="max-w-[1216px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Category Eyebrow in Copper */}
              <div className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#cc9166]" />
                <span>Zero-Budget Operating System</span>
              </div>

              {/* 88px Ivy Presto Headline */}
              <h1 className="font-ivy-presto text-5xl sm:text-7xl lg:text-[76px] xl:text-[84px] text-[#ffffff] font-normal leading-[1.0] tracking-[0.01em]">
                Build smarter. Spend <span className="text-[#cc9166] italic">₹0</span>. Validate with evidence.
              </h1>

              {/* Body Copy in 18px Inter */}
              <p className="text-[18px] text-[#9194a1] leading-[1.4] max-w-xl">
                Most early startups die by spending cash on paid ads, complex tools, and unvalidated features. FounderZero prescribes your single <strong className="text-[#ffffff] font-medium">Next Best Action</strong>, blocks premature spending, and powers execution on generous free SaaS tiers.
              </p>

              {/* Combined Email Capture Input + Primary Action CTA */}
              <form onSubmit={handleHeroEmailSubmit} className="pt-2 max-w-md">
                <div className="relative flex items-center bg-transparent rounded-full border border-[#ffffff] p-1.5">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your work email..."
                    className="w-full bg-transparent text-[#ffffff] placeholder-[#777a88] px-5 py-2.5 text-[14px] outline-none rounded-full"
                  />
                  <button
                    type="submit"
                    className="btn-slash-primary shrink-0 flex items-center gap-2 text-[14px] cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-6 mt-4 text-[13px] text-[#777a88]">
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className="text-[#cc9166]" />
                    <span>Free Forever Core</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className="text-[#cc9166]" />
                    <span>No Credit Card</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className="text-[#cc9166]" />
                    <span>Evidence-Based</span>
                  </span>
                </div>
              </form>

            </div>

            {/* Right Visual: Hero Chart Card & Transaction Panel */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Hero Chart Card */}
              <div className="rounded-[10px] bg-[#040406] p-6 border border-[#1c1d22] space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[13px] text-[#9194a1]">Preserved Capital & Runway</span>
                    <div className="text-3xl font-ivy-presto text-[#ffffff] mt-1">₹1,85,000</div>
                  </div>
                  {/* Period Filter Pill */}
                  <div className="flex items-center gap-1 p-1 bg-[#121317] rounded-full border border-[#1c1d22]">
                    {(['30D', '90D', '1Y'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={`px-2.5 py-1 text-[11px] rounded-full transition-colors cursor-pointer ${
                          chartPeriod === p ? 'bg-[#ffffff] text-[#000000] font-medium' : 'text-[#9194a1] hover:text-[#ffffff]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Golden Gradient Chart Line */}
                <div className="h-[140px] w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 140" fill="none">
                    <defs>
                      <linearGradient id="slashGildedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(174, 147, 87)" />
                        <stop offset="40%" stopColor="rgb(255, 240, 204)" />
                        <stop offset="70%" stopColor="rgb(174, 147, 87)" />
                        <stop offset="100%" stopColor="rgba(189, 157, 79, 0.2)" />
                      </linearGradient>
                      <linearGradient id="slashAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(174, 147, 87, 0.15)" />
                        <stop offset="100%" stopColor="rgba(174, 147, 87, 0.0)" />
                      </linearGradient>
                    </defs>

                    {/* Background Grid Lines */}
                    <line x1="0" y1="30" x2="400" y2="30" stroke="#1c1d22" strokeDasharray="3 3" />
                    <line x1="0" y1="70" x2="400" y2="70" stroke="#1c1d22" strokeDasharray="3 3" />
                    <line x1="0" y1="110" x2="400" y2="110" stroke="#1c1d22" strokeDasharray="3 3" />

                    {/* Filled Area */}
                    <path
                      d="M 0 120 Q 80 100, 140 60 T 260 40 T 400 10 L 400 140 L 0 140 Z"
                      fill="url(#slashAreaFill)"
                    />

                    {/* Gilded Stroke Chart Line */}
                    <path
                      d="M 0 120 Q 80 100, 140 60 T 260 40 T 400 10"
                      stroke="url(#slashGildedGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Pulse Node */}
                    <circle cx="260" cy="40" r="4" fill="#fff5dc" />
                    <circle cx="260" cy="40" r="8" fill="none" stroke="#cc9166" strokeWidth="1.5" className="animate-ping" />
                  </svg>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1c1d22] text-[13px]">
                  <span className="text-[#9194a1]">Preservation Status:</span>
                  <span className="text-[#3ad389] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                    <span>+₹45,000 this month</span>
                  </span>
                </div>
              </div>

              {/* Transaction List Card — Dense Data Display */}
              <div className="rounded-[10px] bg-[#040406] p-4 border border-[#1c1d22] space-y-2">
                <div className="text-[12px] font-semibold text-[#cc9166] uppercase tracking-[0.02em] px-2">
                  Zero-Budget Stack Replaced
                </div>

                {[
                  { merchant: 'Crisp Live Chat', category: 'Support', amount: '₹0 (was ₹6,000)', iconColor: '#3b82f6', code: 'CRISP' },
                  { merchant: 'PostHog Analytics', category: 'Product', amount: '₹0 (was ₹8,000)', iconColor: '#ef4444', code: 'POSTHOG' },
                  { merchant: 'Resend Dispatch', category: 'Email', amount: '₹0 (was ₹4,500)', iconColor: '#a855f7', code: 'RESEND' }
                ].map(row => (
                  <div key={row.merchant} className="flex items-center justify-between p-2 rounded-[6px] hover:bg-[#121317] transition-colors border-b border-[#1c1d22] last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-[#2e3038] flex items-center justify-center text-[10px] font-mono text-[#ffffff]" style={{ borderColor: row.iconColor }}>
                        {row.code.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-[#e2e3e9]">{row.merchant}</div>
                        <div className="text-[11px] text-[#777a88]">{row.category}</div>
                      </div>
                    </div>
                    <div className="text-[13px] font-mono text-[#3ad389] font-medium">{row.amount}</div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Stat Callouts — Single Column Centered Layout with 160px Section Breathing Room */}
      <section className="py-24 bg-[#08080a] border-t border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto px-4 text-center space-y-16">
          <div className="text-[13px] font-semibold text-[#cc9166] uppercase tracking-[0.02em]">
            // Financial Discipline Proof Points
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            
            <div className="space-y-2">
              <div className="text-5xl lg:text-6xl font-ivy-presto text-[#ffffff]">₹0</div>
              <div className="text-[14px] text-[#9194a1]">Ad Spend required before retention validation</div>
            </div>

            <div className="space-y-2">
              <div className="text-5xl lg:text-6xl font-ivy-presto text-[#ffffff]">10,000+</div>
              <div className="text-[14px] text-[#9194a1]">Early founder decisions audited for risk</div>
            </div>

            <div className="space-y-2">
              <div className="text-5xl lg:text-6xl font-ivy-presto text-[#ffffff]">12 Months</div>
              <div className="text-[14px] text-[#9194a1]">Average runway extension achieved</div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Tool #1: Decision Reality Check Code Terminal */}
      <section id="reality-check" className="py-24 bg-[#08080a] border-t border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto px-4 md:px-8 space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-[13px] font-semibold text-[#cc9166] uppercase tracking-[-0.02em]">
              Category Eyebrow — Audit Engine
            </div>
            <h2 className="text-4xl sm:text-5xl font-ivy-presto text-[#ffffff] font-normal leading-[1.1]">
              Founder Decision Reality Check
            </h2>
            <p className="text-[16px] text-[#9194a1]">
              Test any decision claim or planned expense against evidence rules before burning precious runway.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Form */}
            <div className="lg:col-span-5 space-y-6">
              <form onSubmit={handleTestRealityCheck} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-mono text-[#9194a1] uppercase tracking-wider mb-2">
                    Enter planned expenditure or decision claim:
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={realityInput}
                      onChange={(e) => setRealityInput(e.target.value)}
                      placeholder="e.g. 'Spend ₹50,000 on Google Ads' or 'Hire a marketing agency'"
                      className="w-full px-4 py-3 bg-[#040406] border border-[#2e3038] rounded-[10px] text-[14px] text-[#ffffff] outline-none focus:border-[#ffffff] transition-colors"
                    />
                    <button
                      type="submit"
                      className="btn-slash-ghost w-full flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Terminal size={15} className="text-[#cc9166]" />
                      <span>Audit Decision Risk</span>
                    </button>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono text-[#777a88] uppercase">Sandbox Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Spend ₹25,000 on Meta Ads',
                      'Hire a full-time designer',
                      'Build 10 features before launch',
                      'Charge ₹2,000/month for beta'
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRealityInput(preset)}
                        className="btn-slash-pill-tag text-[12px] cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Terminal Card Display */}
            <div className="lg:col-span-7">
              <div className="rounded-[10px] border border-[#1c1d22] bg-[#040406] overflow-hidden font-mono">
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#1c1d22] bg-[#121317] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    <span className="text-[12px] text-[#9194a1] ml-2">reality-check-audit.ts</span>
                  </div>
                  <div className="text-[11px] text-[#777a88]">
                    founderzero_kernel_v2.4
                  </div>
                </div>

                {/* Body */}
                {realityResult && (
                  <div className="p-6 space-y-6 text-[13px] leading-relaxed">
                    <div className="flex items-center justify-between border-b border-[#1c1d22] pb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                        <span className="text-[#ffffff] font-semibold">{realityResult.verdict}</span>
                      </div>
                      <span className="text-[#cc9166] text-[12px]">{realityResult.statusCode}</span>
                    </div>

                    <div className="p-4 rounded-[6px] bg-[#08080a] border border-[#1c1d22] space-y-1 text-[12px]">
                      <div className="text-[#777a88]">// Code Execution Log</div>
                      <div className="text-[#cc9166]">
                        from: <span className="text-[#ffffff]">"reality_engine@founderzero.os"</span>
                      </div>
                      <div className="text-[#e2e3e9] pt-1 whitespace-pre-wrap">
                        {realityResult.codeSnippet}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-[6px] border border-[#1c1d22] bg-[#121317] space-y-1">
                        <span className="text-[11px] text-[#ef4444] uppercase font-semibold block">Risk Analysis:</span>
                        <p className="text-[#9194a1] text-[12px]">
                          {realityResult.reasoning}
                        </p>
                      </div>

                      <div className="p-3 rounded-[6px] border border-[#1c1d22] bg-[#121317] space-y-1">
                        <span className="text-[11px] text-[#3ad389] uppercase font-semibold block">₹0 Alternative:</span>
                        <p className="text-[#ffffff] text-[12px]">
                          {realityResult.alternative}
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Tool #2: Zero-Budget Tool Stack Calculator */}
      <section id="calculator" className="py-24 bg-[#08080a] border-t border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto px-4 md:px-8 space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-[13px] font-semibold text-[#cc9166] uppercase tracking-[-0.02em]">
              Category Eyebrow — Capital Efficiency
            </div>
            <h2 className="text-4xl sm:text-5xl font-ivy-presto text-[#ffffff] font-normal leading-[1.1]">
              Zero-Budget Tool Stack ("Do It For ₹0")
            </h2>
            <p className="text-[16px] text-[#9194a1]">
              Select expensive SaaS tools you thought were mandatory. Calculate runway preserved with generous enterprise free tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Tool Selection Grid */}
            <div className="lg:col-span-7 space-y-3">
              {Object.entries(toolPrices).map(([id, tool]) => {
                const isSelected = selectedTools.includes(id);
                return (
                  <div
                    key={id}
                    onClick={() => toggleTool(id)}
                    className={`p-5 rounded-[10px] bg-[#040406] border transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected ? 'border-[#ffffff]' : 'border-[#1c1d22] hover:border-[#2e3038]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-full border border-[#777a88] flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]' : 'bg-transparent'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-[15px] font-medium text-[#ffffff] flex items-center gap-2">
                          <span>{tool.name}</span>
                          <span className="text-[11px] font-mono text-[#cc9166]">
                            {tool.codeKey}
                          </span>
                        </div>
                        <div className="text-[13px] text-[#9194a1] mt-0.5">
                          Enterprise Free Tier: <span className="text-[#3ad389] font-mono">{tool.freeAlt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[15px] font-semibold text-[#ffffff]">
                        ₹{tool.cost.toLocaleString()}/mo
                      </div>
                      <div className="text-[11px] text-[#3ad389]">
                        Replaced for ₹0
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Savings Summary Panel */}
            <div className="lg:col-span-5 rounded-[10px] bg-[#040406] border border-[#1c1d22] p-8 space-y-8">
              <div>
                <span className="text-[13px] text-[#cc9166] uppercase font-semibold block">
                  Monthly Capital Preserved
                </span>
                <div className="text-5xl font-ivy-presto text-[#ffffff] mt-2">
                  ₹{totalMonthlyCost.toLocaleString()}
                </div>
                <div className="text-[14px] text-[#9194a1] mt-2">
                  Annual runway extended: <strong className="text-[#ffffff] font-medium">₹{(totalMonthlyCost * 12).toLocaleString()}/yr</strong>
                </div>
              </div>

              <div className="p-4 rounded-[6px] border border-[#1c1d22] bg-[#121317] space-y-2 text-[13px]">
                <div className="text-[#ffffff] flex items-center gap-2 font-medium">
                  <ShieldCheck size={16} className="text-[#cc9166]" />
                  <span>Runway Preservation Principle</span>
                </div>
                <p className="text-[#9194a1] leading-relaxed">
                  Saving ₹{totalMonthlyCost.toLocaleString()}/mo gives early founders an extra 6 to 12 months of survival time to achieve product-market fit.
                </p>
              </div>

              <button
                onClick={onStartOnboarding}
                className="btn-slash-primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply ₹0 Stack to My Startup</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Three Pillars of Lean Execution — 3 Column Card Grid */}
      <section id="features" className="py-24 bg-[#08080a] border-t border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto px-4 md:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-[13px] font-semibold text-[#cc9166] uppercase tracking-[-0.02em]">
              Category Eyebrow — Architecture
            </div>
            <h2 className="text-4xl sm:text-5xl font-ivy-presto text-[#ffffff] font-normal leading-[1.1]">
              Three Pillars of Lean Execution
            </h2>
            <p className="text-[16px] text-[#9194a1]">
              Built specifically for bootstrappers, indie hackers, and zero-budget early-stage creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="rounded-[10px] bg-[#040406] border border-[#1c1d22] p-8 space-y-4 hover:border-[#777a88] transition-colors">
              <div className="w-10 h-10 rounded-full border border-[#2e3038] flex items-center justify-center text-[#ffffff]">
                <Zap size={20} className="text-[#cc9166]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#ffffff]">
                Single Next Best Action
              </h3>
              <p className="text-[16px] text-[#9194a1] leading-relaxed">
                Never wonder what to do next. FounderZero scans your current users, stage, and qualitative feedback to prescribe your single highest-leverage task.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-[10px] bg-[#040406] border border-[#1c1d22] p-8 space-y-4 hover:border-[#777a88] transition-colors">
              <div className="w-10 h-10 rounded-full border border-[#2e3038] flex items-center justify-center text-[#ffffff]">
                <ShieldAlert size={20} className="text-[#cc9166]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#ffffff]">
                Do NOT Do This Yet
              </h3>
              <p className="text-[16px] text-[#9194a1] leading-relaxed">
                Premature scaling kills startups. We actively warn you against building unnecessary features, spending on ads, or incorporating too early.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-[10px] bg-[#040406] border border-[#1c1d22] p-8 space-y-4 hover:border-[#777a88] transition-colors">
              <div className="w-10 h-10 rounded-full border border-[#2e3038] flex items-center justify-center text-[#ffffff]">
                <Layers size={20} className="text-[#cc9166]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#ffffff]">
                Do It For ₹0 Stack
              </h3>
              <p className="text-[16px] text-[#9194a1] leading-relaxed">
                Run analytics, transactional email, CRM pipelines, and user feedback entirely on world-class generous free tiers until revenue flows.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6 Stages Progression Engine */}
      <section id="stages" className="py-24 bg-[#08080a] border-t border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto px-4 md:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-[13px] font-semibold text-[#cc9166] uppercase tracking-[-0.02em]">
              Category Eyebrow — Stage Progression
            </div>
            <h2 className="text-4xl sm:text-5xl font-ivy-presto text-[#ffffff] font-normal leading-[1.1]">
              Calibrated For Every Startup Stage
            </h2>
            <p className="text-[16px] text-[#9194a1]">
              Recommendations adapt dynamically as your startup matures from an idea to recurring revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { stage: 'Idea', code: 'Stage 01', focus: 'Customer Problem Validation', budget: '₹0 Budget' },
              { stage: 'Validating', code: 'Stage 02', focus: '10 Problem Interviews', budget: '₹0 Budget' },
              { stage: 'Building MVP', code: 'Stage 03', focus: 'Single Core Feature', budget: '₹0 Budget' },
              { stage: 'Launched', code: 'Stage 04', focus: 'First 50 Beta Users', budget: 'Organic Only' },
              { stage: 'First Revenue', code: 'Stage 05', focus: 'Conversion & Retention', budget: 'Reinvest Revenue' },
              { stage: 'Growing', code: 'Stage 06', focus: 'Unit Economics & Scale', budget: 'Positive Cashflow' }
            ].map((s) => (
              <div
                key={s.code}
                className="rounded-[10px] bg-[#040406] border border-[#1c1d22] p-6 space-y-3 hover:border-[#ffffff] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-mono text-[#9194a1]">
                    {s.code}
                  </span>
                  {/* Desaturated sage status indicator badge */}
                  <span className="px-2 py-0.5 rounded-full border border-[#2e3038] text-[11px] text-[#3ad389] bg-transparent">
                    Active
                  </span>
                </div>
                <div className="text-[20px] font-medium text-[#ffffff]">{s.stage}</div>
                <div className="text-[14px] text-[#9194a1]">{s.focus}</div>
                <div className="pt-2 text-[12px] font-mono text-[#cc9166] border-t border-[#1c1d22]">
                  {s.budget}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonial Video/Photo Card Grid */}
      <section className="py-24 bg-[#08080a] border-t border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto px-4 md:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-[13px] font-semibold text-[#cc9166] uppercase tracking-[-0.02em]">
              Category Eyebrow — Founder Stories
            </div>
            <h2 className="text-4xl sm:text-5xl font-ivy-presto text-[#ffffff] font-normal leading-[1.1]">
              Social Proof & Real Execution
            </h2>
            <p className="text-[16px] text-[#9194a1]">
              Hear from bootstrapped founders using FounderZero to preserve capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Testimonial Video Card 1 */}
            <div className="relative rounded-[10px] overflow-hidden aspect-[4/3] bg-[#040406] border border-[#1c1d22] group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                alt="Aarav Sharma"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent p-6 flex flex-col justify-end">
                <div className="space-y-2">
                  <p className="text-[16px] text-[#ffffff] font-medium leading-snug">
                    "FounderZero stopped us from spending ₹60,000 on Facebook ads before we had retention. We hit 100 users organically for $0."
                  </p>
                  <div>
                    <div className="text-[16px] font-medium text-[#ffffff]">Aarav Sharma</div>
                    <div className="text-[14px] text-[#acafb9]">Founder & CEO, CodePulse</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Video Card 2 */}
            <div className="relative rounded-[10px] overflow-hidden aspect-[4/3] bg-[#040406] border border-[#1c1d22] group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                alt="Priya Verma"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent p-6 flex flex-col justify-end">
                <div className="space-y-2">
                  <p className="text-[16px] text-[#ffffff] font-medium leading-snug">
                    "The 'Do NOT Do This Yet' warnings saved our startup. Having an engine tell us exactly what NOT to build kept us focused."
                  </p>
                  <div>
                    <div className="text-[16px] font-medium text-[#ffffff]">Priya Verma</div>
                    <div className="text-[14px] text-[#acafb9]">Co-Founder, SyncFlow</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Editorial Blog / Insights Card Grid */}
      <section className="py-24 bg-[#08080a] border-t border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto px-4 md:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-[13px] font-semibold text-[#cc9166] uppercase tracking-[-0.02em]">
              Category Eyebrow — Founder Insights
            </div>
            <h2 className="text-4xl sm:text-5xl font-ivy-presto text-[#ffffff] font-normal leading-[1.1]">
              Frameworks & Articles
            </h2>
            <p className="text-[16px] text-[#9194a1]">
              Deep dives on zero-budget marketing, problem validation, and cash preservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                category: 'LEAN METHODOLOGY',
                date: 'Sep 10, 2026',
                title: 'How to Get Your First 50 Users Without Spending a Single Rupee',
                readTime: '6 min read',
                img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'
              },
              {
                category: 'RUNWAY PRESERVATION',
                date: 'Aug 28, 2026',
                title: 'The ₹0 Stack: Enterprise SaaS Free Tiers Every Bootstrapper Must Use',
                readTime: '8 min read',
                img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'
              },
              {
                category: 'EVIDENCE AUDIT',
                date: 'Aug 14, 2026',
                title: 'Why 402 Premature Scaling Kills 90% of Early Stage Startups',
                readTime: '5 min read',
                img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80'
              }
            ].map(post => (
              <div key={post.title} className="group cursor-pointer space-y-4">
                <div className="rounded-[10px] overflow-hidden aspect-[16/10] bg-[#040406] border border-[#1c1d22]">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#cc9166] font-semibold">{post.category}</span>
                  <span className="text-[#464853]">•</span>
                  <span className="text-[#9194a1]">{post.date}</span>
                </div>
                <h3 className="text-[20px] font-medium text-[#ffffff] group-hover:text-[#cc9166] transition-colors leading-snug">
                  {post.title}
                </h3>
                <div className="text-[13px] text-[#acafb9]">
                  {post.readTime}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-32 bg-[#08080a] border-t border-[#1c1d22]">
        <div className="max-w-[1216px] mx-auto px-4 md:px-8 text-center space-y-8">
          <div className="text-[13px] font-semibold text-[#cc9166] uppercase tracking-[-0.02em]">
            Start Executing Now
          </div>
          <h2 className="text-5xl sm:text-7xl font-ivy-presto text-[#ffffff] font-normal leading-[1.0] max-w-3xl mx-auto">
            Stop guessing. Start building with evidence today.
          </h2>
          <p className="text-[18px] text-[#9194a1] max-w-xl mx-auto leading-relaxed">
            Join thousands of smart founders executing zero-budget growth plans with FounderZero.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartOnboarding}
              className="btn-slash-primary px-8 py-4 text-[15px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={onEnterDemo}
              className="btn-slash-ghost px-8 py-4 text-[15px] cursor-pointer"
            >
              Explore Demo
            </button>
          </div>
        </div>
      </section>

      {/* 5-Column Link Grid Footer — Continuous #08080a Canvas */}
      <footer className="bg-[#08080a] border-t border-[#1c1d22] py-16 px-4 md:px-8 text-[14px] text-[#9194a1]">
        <div className="max-w-[1216px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#040406] border border-[#2e3038] flex items-center justify-center text-[#ffffff] font-ivy-presto text-xs">
                /
              </div>
              <span className="font-ivy-presto text-lg text-[#ffffff]">FounderZero</span>
            </div>
            <p className="text-[13px] text-[#777a88] max-w-sm">
              The zero-budget operating system for lean founders, indie hackers, and bootstrapped builders.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-[#ffffff] uppercase tracking-wider">Product</div>
            <ul className="space-y-2 text-[13px]">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-[#ffffff] transition-colors">Methodology</button></li>
              <li><button onClick={() => scrollToSection('calculator')} className="hover:text-[#ffffff] transition-colors">₹0 Tool Stack</button></li>
              <li><button onClick={() => scrollToSection('reality-check')} className="hover:text-[#ffffff] transition-colors">Reality Check</button></li>
              <li><button onClick={onEnterDemo} className="hover:text-[#ffffff] transition-colors">PulseBoard</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-[#ffffff] uppercase tracking-wider">Framework</div>
            <ul className="space-y-2 text-[13px]">
              <li><a href="#stages" className="hover:text-[#ffffff] transition-colors">Stage 01: Idea</a></li>
              <li><a href="#stages" className="hover:text-[#ffffff] transition-colors">Stage 02: Validating</a></li>
              <li><a href="#stages" className="hover:text-[#ffffff] transition-colors">Stage 03: Building</a></li>
              <li><a href="#stages" className="hover:text-[#ffffff] transition-colors">Stage 04: Launched</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-[#ffffff] uppercase tracking-wider">Legal</div>
            <ul className="space-y-2 text-[13px]">
              <li><a href="#privacy" className="hover:text-[#ffffff] transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-[#ffffff] transition-colors">Terms of Service</a></li>
              <li><a href="#security" className="hover:text-[#ffffff] transition-colors">Security Audit</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-[1216px] mx-auto pt-8 border-t border-[#1c1d22] flex flex-col sm:flex-row items-center justify-between text-[13px] text-[#777a88] gap-4">
          <div>© 2026 FounderZero Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span>Midnight Vault Edition</span>
            <span>•</span>
            <span className="text-[#cc9166]">Slash Theme</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
