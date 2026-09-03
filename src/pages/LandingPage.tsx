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
  Code2,
  Cpu,
  Lock,
  ExternalLink
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
  // Interactive Decision Reality Check preview on Landing Page
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

  // Interactive Tool Savings Calculator on Landing Page
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0f0] font-sans selection:bg-[#9281f7] selection:text-[#000000]">
      {/* Resend Top Bar — Pure Void Black with Hairline Border */}
      <div className="bg-[#000000] text-[#a1a4a5] py-2.5 px-4 text-[12px] font-commit border-graphite-b">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ad389] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3ad389]"></span>
            </span>
            <span className="font-medium text-[#ffffff]">FounderZero OS</span>
            <span className="text-[#464a4d]">•</span>
            <span className="text-[#a1a4a5] hidden sm:inline">Zero-Budget Startup Execution Framework</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#9281f7] hidden md:inline">sys_status: operational</span>
            <button
              onClick={onEnterDemo}
              className="text-[#ffffff] hover:text-[#baa7ff] flex items-center gap-1 transition-colors font-commit cursor-pointer"
            >
              <span>Explore Live Demo</span>
              <ChevronRight size={13} className="text-[#9281f7]" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-md border-graphite-b px-4 md:px-8 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={onEnterDemo}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-[6px] bg-[#000000] border-graphite flex items-center justify-center text-[#ffffff] font-commit font-bold text-sm group-hover:border-[#ffffff] transition-colors">
              0
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#ffffff] text-base tracking-tight font-sans">
                FounderZero
              </span>
              <span className="px-2 py-0.5 rounded-[6px] bg-[#000000] border-graphite text-[#9281f7] text-[11px] font-commit font-medium">
                v2.4
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#f0f0f0]">
            <button onClick={() => scrollToSection('features')} className="hover:text-[#ffffff] transition-colors cursor-pointer">
              Methodology
            </button>
            <button onClick={() => scrollToSection('calculator')} className="hover:text-[#ffffff] transition-colors cursor-pointer">
              ₹0 Stack Calculator
            </button>
            <button onClick={() => scrollToSection('reality-check')} className="hover:text-[#ffffff] transition-colors cursor-pointer">
              Reality Check
            </button>
            <button onClick={() => scrollToSection('stages')} className="hover:text-[#ffffff] transition-colors cursor-pointer">
              Stage Engine
            </button>
          </nav>

          {/* Action CTAs — Ghost Buttons strictly on Resend reference */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="text-[#f0f0f0] hover:text-[#ffffff] text-[14px] font-medium px-3 py-1.5 transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onStartOnboarding}
              className="btn-resend-ghost text-[14px] font-medium cursor-pointer"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section — Resend Style: 96px Domaine Serif Headline + 3D Geometric Cube Anchor */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 bg-[#000000]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Statement */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Hero Announcement Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-graphite bg-[#000000] text-[14px] text-[#f0f0f0] font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9281f7]" />
                <span>Announcing FounderZero OS v2.4</span>
                <ChevronRight size={14} className="text-[#9281f7]" />
              </div>

              {/* 96px Domaine Editorial Display Headline */}
              <h1 className="font-domaine text-4xl sm:text-6xl lg:text-[84px] xl:text-[96px] text-[#ffffff] font-normal tracking-[-0.01em] leading-[1.0] max-w-2xl">
                Build smarter. Spend <span className="text-[#9281f7] font-commit italic">₹0</span>. Validate with evidence.
              </h1>

              {/* Body Description */}
              <p className="text-[16px] md:text-[18px] text-[#a1a4a5] leading-[1.6] max-w-xl font-sans">
                Most early startups die by spending cash on paid ads, complex tools, and unvalidated features. FounderZero prescribes your single <strong className="text-[#f0f0f0]">Next Best Action</strong>, blocks premature spending, and powers execution on generous free SaaS tiers.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={onStartOnboarding}
                  className="btn-resend-ghost px-6 py-3.5 text-[15px] flex items-center justify-center gap-2 cursor-pointer font-medium"
                >
                  <span>Create Startup Profile</span>
                  <ArrowRight size={16} className="text-[#ffffff]" />
                </button>

                <button
                  onClick={onEnterDemo}
                  className="px-6 py-3.5 text-[15px] text-[#abafb4] hover:text-[#ffffff] flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans"
                >
                  <span>Explore Live PulseBoard Demo</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Developer Signal Metadata Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-[12px] font-commit text-[#a1a4a5]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3ad389]" />
                  100% Free Core Engine
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#70b8ff]" />
                  Zero Credit Card Required
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#baa7ff]" />
                  Evidence-Based Decision Rules
                </span>
              </div>
            </div>

            {/* Right Visual: 3D Geometric Rotating Cube Anchor */}
            <div className="lg:col-span-5">
              <HeroCube />
            </div>

          </div>
        </div>
      </section>

      {/* Customer Trust / Logo Wall Grid — Pure Black Canvas with Native Logos */}
      <section className="py-12 bg-[#000000] border-graphite-t border-graphite-b">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 space-y-6">
          <p className="text-[12px] font-commit text-[#a1a4a5] uppercase tracking-wider text-center">
            Engineered for lean founders, indie hackers, and zero-budget builders
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
            {['BOOTSTRAP_CO', 'INDIE_LABS', 'ZERO_STACK', 'LEAN_FOUNDRY'].map((brand) => (
              <div
                key={brand}
                className="text-[13px] font-commit font-semibold text-[#a1a4a5] tracking-widest px-4 py-2 border-graphite rounded-[6px] hover:text-[#ffffff] hover:border-[#ffffff] transition-colors cursor-default"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tool #1: Decision Reality Check Code Terminal */}
      <section id="reality-check" className="py-24 bg-[#000000]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <div className="inline-block px-2.5 py-1 rounded-[6px] border-graphite text-[12px] font-commit text-[#9281f7]">
              dev_sandbox // reality_check_engine
            </div>
            <h2 className="text-3xl sm:text-5xl font-favorit text-[#ffffff] font-normal tracking-[-2.8px] leading-[1.2]">
              Founder Decision Reality Check
            </h2>
            <p className="text-[16px] text-[#a1a4a5]">
              Test any decision claim or planned expense against evidence rules before burning runway.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Input Side */}
            <div className="lg:col-span-5 space-y-6">
              <form onSubmit={handleTestRealityCheck} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-commit text-[#a1a4a5] uppercase tracking-wider mb-2">
                    // Enter planned startup expenditure or decision:
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={realityInput}
                      onChange={(e) => setRealityInput(e.target.value)}
                      placeholder="e.g. 'Spend ₹50,000 on Google Ads' or 'Hire a marketing agency'"
                      className="w-full px-4 py-3 bg-[#000000] border-graphite rounded-[6px] text-[14px] font-commit text-[#ffffff] outline-none focus:border-[#ffffff] transition-colors"
                    />
                    <button
                      type="submit"
                      className="btn-resend-ghost w-full flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Terminal size={15} className="text-[#9281f7]" />
                      <span>Execute Risk Audit</span>
                    </button>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-commit text-[#6e727a] uppercase">Quick Sandbox Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Spend ₹25,000 on Facebook Ads',
                      'Hire a full-time designer',
                      'Build 10 more features before launch',
                      'Charge ₹2,000/month for beta'
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRealityInput(preset)}
                        className="px-2.5 py-1 rounded-[6px] border-graphite bg-[#000000] text-[#a1a4a5] hover:text-[#ffffff] hover:border-[#ffffff] text-[12px] font-commit transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Terminal Window Output (Resend Code Snippet Spec) */}
            <div className="lg:col-span-7">
              <div className="rounded-[16px] border-graphite bg-[#000000] overflow-hidden font-commit">
                {/* Terminal Header Bar */}
                <div className="px-4 py-3 border-graphite-b bg-[#000000] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff9592]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffca16]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3ad389]" />
                    <span className="text-[12px] text-[#3b9eff] ml-2 font-commit">reality-check.ts</span>
                  </div>
                  <div className="text-[11px] text-[#6e727a]">
                    founderzero_audit_v2.4
                  </div>
                </div>

                {/* Terminal Content */}
                {realityResult && (
                  <div className="p-6 space-y-6 text-[13px] leading-relaxed">
                    
                    {/* Status Dot Row */}
                    <div className="flex items-center justify-between border-graphite-b pb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ff9592] animate-ping" />
                        <span className="text-[#ffffff] font-semibold">{realityResult.verdict}</span>
                      </div>
                      <span className="text-[#9281f7] text-[12px]">{realityResult.statusCode}</span>
                    </div>

                    {/* Code Syntax Highlighted Snippet */}
                    <div className="p-4 rounded-[6px] bg-[#0b0e14] border-graphite space-y-1 font-commit text-[12px]">
                      <div className="text-[#6e727a]">// Algorithmic execution response</div>
                      <div className="text-[#9281f7]">
                        from: <span className="text-[#9281f7]">"audit_engine@founderzero.os"</span>
                      </div>
                      <div className="text-[#3ad389]">
                        status: <span className="text-[#3ad389]">"VERIFIED_EVIDENCE_RULES"</span>
                      </div>
                      <div className="text-[#f0f0f0] pt-2 whitespace-pre-wrap">
                        {realityResult.codeSnippet}
                      </div>
                    </div>

                    {/* Reasoning & Alternative Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1 p-3 rounded-[6px] border-graphite bg-[#000000]">
                        <span className="text-[11px] text-[#ff9592] uppercase font-semibold block">Risk Analysis:</span>
                        <p className="text-[#a1a4a5] text-[12px]">
                          {realityResult.reasoning}
                        </p>
                      </div>

                      <div className="space-y-1 p-3 rounded-[6px] border-graphite bg-[#000000]">
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
      <section id="calculator" className="py-24 bg-[#000000] border-graphite-t">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <div className="inline-block px-2.5 py-1 rounded-[6px] border-graphite text-[12px] font-commit text-[#3ad389]">
              capital_efficiency // tool_stack_calculator
            </div>
            <h2 className="text-3xl sm:text-5xl font-favorit text-[#ffffff] font-normal tracking-[-2.8px] leading-[1.2]">
              Zero-Budget Tool Stack ("Do It For ₹0")
            </h2>
            <p className="text-[16px] text-[#a1a4a5]">
              Select expensive SaaS tools you thought were required. Calculate how much runway you save with generous enterprise free tiers.
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
                    className={`p-5 rounded-[16px] border-graphite bg-[#000000] transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected ? 'border-[#ffffff]' : 'hover:border-[#6e727a]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-[6px] border-graphite flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#ffffff] text-[#000000]' : 'bg-[#000000]'
                        }`}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-[15px] font-medium text-[#ffffff] font-sans flex items-center gap-2">
                          <span>{tool.name}</span>
                          <span className="text-[12px] font-commit text-[#9281f7]">
                            {tool.codeKey}
                          </span>
                        </div>
                        <div className="text-[13px] text-[#a1a4a5] mt-0.5">
                          Enterprise Free Alt: <span className="text-[#3ad389] font-commit">{tool.freeAlt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-commit">
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

            {/* Savings Terminal Summary Card */}
            <div className="lg:col-span-5 rounded-[16px] border-graphite bg-[#000000] p-8 space-y-8 font-commit">
              <div>
                <span className="text-[12px] text-[#70b8ff] uppercase font-semibold block">
                  // Monthly Capital Preserved
                </span>
                <div className="text-5xl font-normal text-[#ffffff] mt-2 font-commit">
                  ₹{totalMonthlyCost.toLocaleString()}
                </div>
                <div className="text-[13px] text-[#a1a4a5] mt-2">
                  Annual runway extended: <strong className="text-[#3ad389] font-normal">₹{(totalMonthlyCost * 12).toLocaleString()}/yr</strong>
                </div>
              </div>

              <div className="p-4 rounded-[6px] border-graphite bg-[#0b0e14] space-y-2 text-[13px]">
                <div className="text-[#ffffff] flex items-center gap-2 font-medium">
                  <ShieldCheck size={16} className="text-[#3ad389]" />
                  <span>Runway Preservation Principle</span>
                </div>
                <p className="text-[#a1a4a5] leading-relaxed">
                  Saving ₹{totalMonthlyCost.toLocaleString()}/mo gives early founders an extra 6 to 12 months of survival time to hit product-market fit.
                </p>
              </div>

              <button
                onClick={onStartOnboarding}
                className="btn-resend-ghost w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply ₹0 Stack to My Startup</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* The 3 Core Pillars Section — Resend Section Cards with 1px Hairline Borders */}
      <section id="features" className="py-24 bg-[#000000] border-graphite-t">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-3">
            <div className="inline-block px-2.5 py-1 rounded-[6px] border-graphite text-[12px] font-commit text-[#9281f7]">
              architecture // core_pillars
            </div>
            <h2 className="text-3xl sm:text-5xl font-favorit text-[#ffffff] font-normal tracking-[-2.8px] leading-[1.2]">
              Three Pillars of Lean Execution
            </h2>
            <p className="text-[16px] text-[#a1a4a5]">
              Built specifically for bootstrappers, indie hackers, and zero-budget early-stage creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="rounded-[16px] border-graphite bg-[#000000] p-8 space-y-4 hover:border-[#ffffff] transition-colors">
              <div className="w-10 h-10 rounded-[6px] border-graphite bg-[#000000] flex items-center justify-center text-[#3b9eff]">
                <Zap size={20} />
              </div>
              <h3 className="text-[20px] font-medium text-[#ffffff] font-sans">
                Single Next Best Action
              </h3>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                Never wonder what to do next. FounderZero scans your current users, stage, and qualitative feedback to prescribe your single highest-leverage task.
              </p>
              <div className="pt-2 text-[12px] font-commit text-[#9281f7]">
                // action_engine.prescribe()
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-[16px] border-graphite bg-[#000000] p-8 space-y-4 hover:border-[#ffffff] transition-colors">
              <div className="w-10 h-10 rounded-[6px] border-graphite bg-[#000000] flex items-center justify-center text-[#ff9592]">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-[20px] font-medium text-[#ffffff] font-sans">
                Do NOT Do This Yet
              </h3>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                Premature scaling kills startups. We actively warn you against building unnecessary features, spending on ads, or incorporating too early.
              </p>
              <div className="pt-2 text-[12px] font-commit text-[#ff9592]">
                // risk_filter.block_spend()
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-[16px] border-graphite bg-[#000000] p-8 space-y-4 hover:border-[#ffffff] transition-colors">
              <div className="w-10 h-10 rounded-[6px] border-graphite bg-[#000000] flex items-center justify-center text-[#3ad389]">
                <Layers size={20} />
              </div>
              <h3 className="text-[20px] font-medium text-[#ffffff] font-sans">
                Do It For ₹0 Stack
              </h3>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                Run analytics, transactional email, CRM pipelines, and user feedback entirely on world-class generous free tiers until revenue flows.
              </p>
              <div className="pt-2 text-[12px] font-commit text-[#3ad389]">
                // stack.deploy_free_tier()
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6 Stages Progression Engine */}
      <section id="stages" className="py-24 bg-[#000000] border-graphite-t">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-3">
            <div className="inline-block px-2.5 py-1 rounded-[6px] border-graphite text-[12px] font-commit text-[#ffca16]">
              framework // 6_stages_progression
            </div>
            <h2 className="text-3xl sm:text-5xl font-favorit text-[#ffffff] font-normal tracking-[-2.8px] leading-[1.2]">
              Calibrated For Every Startup Stage
            </h2>
            <p className="text-[16px] text-[#a1a4a5]">
              Recommendations adapt dynamically as your startup matures from an idea to first revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { stage: 'Idea', code: 'Stage 01', focus: 'Customer Problem Validation', budget: '₹0 Budget', statusColor: '#9281f7' },
              { stage: 'Validating', code: 'Stage 02', focus: '10 Problem Interviews', budget: '₹0 Budget', statusColor: '#70b8ff' },
              { stage: 'Building MVP', code: 'Stage 03', focus: 'Single Core Feature', budget: '₹0 Budget', statusColor: '#3ad389' },
              { stage: 'Launched', code: 'Stage 04', focus: 'First 50 Beta Users', budget: 'Organic Only', statusColor: '#ffca16' },
              { stage: 'First Revenue', code: 'Stage 05', focus: 'Conversion & Retention', budget: 'Reinvest Revenue', statusColor: '#3b9eff' },
              { stage: 'Growing', code: 'Stage 06', focus: 'Unit Economics & Scale', budget: 'Positive Cashflow', statusColor: '#baa7ff' }
            ].map((s) => (
              <div
                key={s.code}
                className="rounded-[16px] border-graphite bg-[#000000] p-6 space-y-3 hover:border-[#ffffff] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-commit text-[#a1a4a5]">
                    {s.code}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.statusColor }} />
                </div>
                <div className="text-[20px] font-medium text-[#ffffff] font-sans">{s.stage}</div>
                <div className="text-[14px] text-[#a1a4a5]">{s.focus}</div>
                <div className="pt-2 text-[12px] font-commit text-[#3ad389] border-graphite-t">
                  {s.budget}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials Grid — Resend Style Quote Cards */}
      <section className="py-24 bg-[#000000] border-graphite-t">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-3">
            <div className="inline-block px-2.5 py-1 rounded-[6px] border-graphite text-[12px] font-commit text-[#9281f7]">
              testimonials // founder_proof
            </div>
            <h2 className="text-3xl sm:text-5xl font-favorit text-[#ffffff] font-normal tracking-[-2.8px] leading-[1.2]">
              Beyond expectations
            </h2>
            <p className="text-[16px] text-[#a1a4a5]">
              Hear from founders executing zero-budget growth plans with FounderZero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Testimonial Card 1 */}
            <div className="rounded-[16px] border-graphite bg-[#000000] p-8 space-y-6">
              <p className="text-[16px] text-[#f0f0f0] leading-relaxed font-sans">
                "FounderZero prevented us from spending ₹60,000 on Facebook ads before we even had retention. We ran 5 organic experiments on Reddit and hit our first 100 users for $0."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full border-graphite bg-[#0b0e14] flex items-center justify-center font-commit text-[#ffffff] text-[13px]">
                  AR
                </div>
                <div>
                  <div className="text-[14px] font-medium text-[#f0f0f0]">Aarav Sharma</div>
                  <div className="text-[12px] text-[#a1a4a5] font-commit">Founder, CodePulse</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="rounded-[16px] border-graphite bg-[#000000] p-8 space-y-6">
              <p className="text-[16px] text-[#f0f0f0] leading-relaxed font-sans">
                "The 'Do NOT Do This Yet' warnings saved our startup. Having an engine tell us exactly what NOT to build kept our focus 100% on the primary bottleneck."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full border-graphite bg-[#0b0e14] flex items-center justify-center font-commit text-[#ffffff] text-[13px]">
                  PV
                </div>
                <div>
                  <div className="text-[14px] font-medium text-[#f0f0f0]">Priya Verma</div>
                  <div className="text-[12px] text-[#a1a4a5] font-commit">Co-Founder, SyncFlow</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-24 bg-[#000000] border-graphite-t">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center space-y-8">
          <h2 className="text-4xl sm:text-6xl font-favorit text-[#ffffff] font-normal tracking-[-2.8px] leading-[1.1] max-w-3xl mx-auto">
            Stop guessing. Start building with evidence today.
          </h2>
          <p className="text-[16px] text-[#a1a4a5] max-w-xl mx-auto leading-relaxed">
            Join thousands of smart founders executing zero-budget growth plans with FounderZero.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onStartOnboarding}
              className="btn-resend-ghost px-8 py-4 text-[15px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free Now</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onEnterDemo}
              className="px-8 py-4 text-[15px] text-[#abafb4] hover:text-[#ffffff] transition-colors cursor-pointer font-sans"
            >
              Open PulseBoard Demo →
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer — Resend Style: Two text links at 14px Inter in #a1a4a5, pure minimalist */}
      <footer className="bg-[#000000] border-graphite-t py-12 px-4 md:px-8 text-[14px] text-[#a1a4a5] font-sans">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#ffffff]">FounderZero OS</span>
            <span>•</span>
            <span className="text-[#a1a4a5]">Zero-Budget Startup Execution Framework</span>
          </div>
          <div className="flex items-center gap-6 text-[14px]">
            <a href="#terms" className="hover:text-[#ffffff] transition-colors">Privacy</a>
            <a href="#privacy" className="hover:text-[#ffffff] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
