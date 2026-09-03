import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  ShieldAlert,
  Code2,
  DollarSign,
  Layers,
  Cpu,
  Target,
  Compass,
  Check,
  Loader2
} from 'lucide-react';
import { StartupProfile, StartupStage, UncertaintyOption } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface OnboardingPageProps {
  onComplete: (profile: Partial<StartupProfile>) => Promise<void> | void;
  initialProfile?: Partial<StartupProfile>;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onComplete,
  initialProfile
}) => {
  const [step, setStep] = useState(1);
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepIndex, setGenerationStepIndex] = useState(0);

  const [formData, setFormData] = useState({
    name: initialProfile?.name || '',
    description: initialProfile?.description || '',
    category: initialProfile?.category || 'SaaS',
    targetCustomer: initialProfile?.targetCustomer || '',
    problem: initialProfile?.problem || '',
    stage: (initialProfile?.stage || 'Idea') as StartupStage,
    teamSize: initialProfile?.teamSize || 1,
    founderSkills: initialProfile?.founderSkills?.length ? initialProfile.founderSkills : ['Fullstack Dev', 'Product & Strategy'],
    techStack: initialProfile?.techStack?.length ? initialProfile.techStack : ['React / Next.js', 'Supabase / Firebase', 'Tailwind CSS'],
    monetizationModel: initialProfile?.monetizationModel || 'Subscription (B2B SaaS)',
    monthlyBudget: initialProfile?.monthlyBudget ?? 0,
    availableHoursPerWeek: initialProfile?.availableHoursPerWeek ?? 25,
    currentUsers: initialProfile?.currentUsers ?? 0,
    monthlyRevenue: initialProfile?.monthlyRevenue ?? 0,
    biggestUncertainty: (initialProfile?.biggestUncertainty || "People don't want it") as UncertaintyOption,
    goal90Days: initialProfile?.goal90Days || 'Conduct 10 problem validation interviews & ship lean MVP'
  });

  const categories = [
    'SaaS',
    'AI / ML Application',
    'Developer Tools',
    'B2B Workflow',
    'Mobile App',
    'E-commerce / D2C',
    'Marketplace / Platform',
    'Fintech / Open Finance',
    'Edtech / Creator Tools'
  ];

  const monetizationModels = [
    'Subscription (B2B SaaS with Free Starter)',
    'Usage-Based / Token API',
    'Freemium with Pro Tier',
    'One-Time Lifetime License',
    'Marketplace Commission / Take Rate',
    'Pre-orders / Consulting Hybrid'
  ];

  const stages: { stage: StartupStage; title: string; desc: string; criteria: string }[] = [
    {
      stage: 'Idea',
      title: 'Idea Stage',
      desc: 'Raw concept or thesis.',
      criteria: '0 lines of code • 0 active users • Focus: Customer interviews'
    },
    {
      stage: 'Validating',
      title: 'Validation Stage',
      desc: 'Testing problem severity and waitlists.',
      criteria: 'Talking to prospective customers • Testing offer resonance'
    },
    {
      stage: 'Building MVP',
      title: 'Building MVP',
      desc: 'Coding the core single-feature prototype.',
      criteria: 'In active development • Targeting first 5 alpha testers'
    },
    {
      stage: 'Launched',
      title: 'Launched (Alpha/Beta)',
      desc: 'Live in production with early users.',
      criteria: 'Deployed online • Active weekly feedback loops'
    },
    {
      stage: 'First Revenue',
      title: 'First Revenue',
      desc: 'Acquired first paying customers.',
      criteria: 'Real transactions recorded • Validating pricing & willingness to pay'
    },
    {
      stage: 'Growing',
      title: 'Repeatable Growth',
      desc: 'Focusing on retention and organic flywheels.',
      criteria: 'Established core customer base • Optimizing funnel & CAC'
    }
  ];

  const availableSkills = [
    'Fullstack Dev',
    'AI / ML Engineer',
    'Frontend / React',
    'Backend / Cloud',
    'No-Code / Low-Code',
    'UI / UX Design',
    'Growth / Marketing',
    'B2B Direct Sales',
    'Product & Strategy'
  ];

  const availableTechStacks = [
    'React / Next.js',
    'Supabase / Firebase',
    'Python / FastAPI',
    'Node.js / Express',
    'Tailwind CSS',
    'OpenCode / Cline (AI Agents)',
    'Vercel / Cloudflare Pages',
    'PostHog / Telemetry Free',
    'Local LLMs (Ollama)'
  ];

  const uncertainties: { value: UncertaintyOption; desc: string }[] = [
    { value: "People don't want it", desc: 'Core problem might not hurt enough for users to switch or pay.' },
    { value: "Can't get users", desc: 'Lack of repeatable, zero-budget distribution and traffic channels.' },
    { value: "Can't monetize", desc: 'Users like the free product but refuse to pull out credit cards.' },
    { value: "Users don't stay", desc: 'High drop-off after signup; onboarding friction or leaky bucket.' },
    { value: "Don't know what to build", desc: 'Paralyzed by feature scope; unsure of minimal MVP boundary.' },
    { value: "Don't know how to market", desc: 'Technical founder with zero organic marketing or copywriting playbook.' },
    { value: "Too many competitors", desc: 'Crowded category; need extreme wedge or vertical specialization.' },
    { value: "Something else", desc: 'Bandwidth constraints, technical feasibility, or partner alignment.' }
  ];

  const goalPresets = [
    'Conduct 10 structured problem validation interviews using The Mom Test',
    'Ship lean v1.0 MVP and onboard first 25 active alpha testers',
    'Achieve ₹10,000/mo in verifiable recurring software revenue',
    'Reach 50%+ 30-day user cohort retention on core workflow',
    'Establish 1 repeatable organic distribution loop generating 50+ signups/mo'
  ];

  const updateField = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      const skills = prev.founderSkills || [];
      return {
        ...prev,
        founderSkills: skills.includes(skill)
          ? skills.filter(s => s !== skill)
          : [...skills, skill]
      };
    });
  };

  const toggleTech = (tech: string) => {
    setFormData(prev => {
      const current = prev.techStack || [];
      return {
        ...prev,
        techStack: current.includes(tech)
          ? current.filter(t => t !== tech)
          : [...current, tech]
      };
    });
  };

  // AI Suggestion Handler
  const handleAiSuggestPitch = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a Startup Name first.');
      return;
    }
    setIsAiRefining(true);
    setAiMessage(null);
    try {
      const res = await fetch('/api/ai/suggest-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          concept: formData.description || formData.problem
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestions) {
          const s = data.suggestions;
          setFormData(prev => ({
            ...prev,
            description: s.oneLinePitch || prev.description,
            targetCustomer: s.targetCustomer || prev.targetCustomer,
            problem: s.coreProblem || prev.problem,
            monetizationModel: s.monetizationModel || prev.monetizationModel,
            goal90Days: s.suggested90DayGoal || prev.goal90Days
          }));
          setAiMessage('✨ Pitch & ICP refined with AI positioning guidelines!');
        }
      }
    } catch (e) {
      console.warn('AI pitch refine fallback');
    } finally {
      setIsAiRefining(false);
    }
  };

  // Calculated dynamic projections for sidebar
  const calculatedSavings = formData.category.toLowerCase().includes('ai') ? 38000 : 26500;
  let dynamicScore = 50;
  if (formData.stage === 'Validating') dynamicScore += 6;
  if (formData.stage === 'Building MVP') dynamicScore += 12;
  if (formData.stage === 'Launched') dynamicScore += 18;
  if (formData.stage === 'First Revenue') dynamicScore += 26;
  if (formData.stage === 'Growing') dynamicScore += 32;
  if (formData.currentUsers > 0) dynamicScore += 5;
  if (formData.monthlyRevenue > 0) dynamicScore += 8;
  if (formData.availableHoursPerWeek >= 25) dynamicScore += 4;
  dynamicScore = Math.min(92, Math.max(48, dynamicScore));

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      triggerGeneration();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const generationSteps = [
    'Analyzing startup stage, target ICP, and market category...',
    'Calibrating zero-budget developer stack (Saving ~₹' + calculatedSavings.toLocaleString() + '/mo)...',
    'Formulating bespoke Do-Now action & anti-slop safeguards...',
    'Generating 6-stage roadmap milestones and step-by-step missions...',
    'Pre-populating Founder Vault with curated bookmarks & tools...',
    'Booting your customized FounderZero Operating System...'
  ];

  const triggerGeneration = async () => {
    setIsGenerating(true);
    setGenerationStepIndex(0);

    // Progress through animation steps
    const interval = setInterval(() => {
      setGenerationStepIndex(prev => {
        if (prev < generationSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    // Call onComplete after brief animation
    setTimeout(async () => {
      try {
        await onComplete(formData);
      } catch (err) {
        console.error('Error completing onboarding:', err);
      }
    }, 2400);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#050506] bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)] text-[#EDEDEF] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#5E6AD2]/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="max-w-md w-full text-center space-y-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#5E6AD2] text-white font-mono font-bold flex items-center justify-center text-xl mx-auto shadow-[0_0_24px_rgba(94,106,210,0.4)]">
            0
          </div>
          <div>
            <h2 className="text-2xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent font-sans tracking-tight">
              Calibrating Your Growth OS
            </h2>
            <p className="text-xs text-[#8A8F98] font-mono mt-1">
              Building customized zero-budget execution plan for <span className="text-[#5E6AD2] font-semibold">{formData.name || 'your startup'}</span>
            </p>
          </div>

          <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-5 text-left space-y-3 font-mono shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
            {generationSteps.map((stepText, idx) => {
              const isDone = idx < generationStepIndex;
              const isCurrent = idx === generationStepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                    isDone
                      ? 'text-emerald-400 font-medium'
                      : isCurrent
                      ? 'text-indigo-300 font-medium'
                      : 'text-[#8A8F98] opacity-40'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="text-[#5E6AD2] animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                  )}
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#8A8F98] font-mono">
            Zero-Budget Operating System • Initializing workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506] bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)] text-[#EDEDEF] flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Ambient Lighting Blob */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#5E6AD2]/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-3 border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5E6AD2] text-white font-mono font-bold flex items-center justify-center text-sm shadow-[0_0_16px_rgba(94,106,210,0.4)]">
            0
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-[#EDEDEF]">FounderZero</span>
            <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#5E6AD2]/20 text-indigo-300 font-medium border border-[#5E6AD2]/30">
              OS Diagnostic
            </span>
          </div>
        </div>
        <div className="text-xs font-mono font-medium text-[#8A8F98] flex items-center gap-2">
          <span>Step 0{step} of 06</span>
          <span className="text-[#8A8F98]">•</span>
          <span className="text-[#5E6AD2] font-semibold">{Math.round((step / 6) * 100)}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-5xl mx-auto w-full my-3 bg-white/[0.06] h-1.5 rounded-full overflow-hidden relative z-10">
        <div
          className="bg-gradient-to-r from-[#5E6AD2] to-indigo-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(94,106,210,0.5)]"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      {/* Main Body */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-auto py-2 relative z-10">
        {/* Step Forms */}
        <div className="md:col-span-2 p-6 md:p-8 space-y-6 border border-white/10 bg-[#0a0a0c] text-[#EDEDEF] rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Step 1: Startup Concept & Value Proposition */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionBadge label="Step 1 of 6 — Startup Concept & Value Proposition" variant="blue" />
                <button
                  type="button"
                  onClick={handleAiSuggestPitch}
                  disabled={isAiRefining}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-[#5E6AD2]/15 hover:bg-[#5E6AD2]/25 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-[#5E6AD2]/40"
                >
                  {isAiRefining ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Refining...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>AI Auto-Refine Pitch</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
                  What are you building?
                </h2>
                <p className="text-xs sm:text-sm text-[#8A8F98] mt-1 font-sans">
                  FounderZero will calibrate your initial next action, anti-slop safeguards, and zero-cost stack.
                </p>
              </div>

              {aiMessage && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-sans">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>{aiMessage}</span>
                </div>
              )}

              <div className="space-y-4 pt-1 text-xs font-sans">
                <div>
                  <label className="block font-medium text-[#EDEDEF] mb-1">
                    Startup Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="e.g. DocuAgent, DevPulse, MarketLens"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm outline-none text-[#EDEDEF] placeholder:text-[#8A8F98] focus:border-[#5E6AD2] transition-all"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#EDEDEF] mb-1">
                    One-Line Pitch / Core Promise *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="e.g. Autonomous document workflows for lean legal teams with ₹0 server cost"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm outline-none text-[#EDEDEF] placeholder:text-[#8A8F98] focus:border-[#5E6AD2] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#EDEDEF] mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => updateField('category', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm outline-none text-[#EDEDEF] focus:border-[#5E6AD2]"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#EDEDEF] mb-1">
                      Monetization Model
                    </label>
                    <select
                      value={formData.monetizationModel}
                      onChange={e => updateField('monetizationModel', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm outline-none text-[#EDEDEF] focus:border-[#5E6AD2]"
                    >
                      {monetizationModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-[#EDEDEF] mb-1">
                      Target Customer ICP *
                    </label>
                    <input
                      type="text"
                      value={formData.targetCustomer}
                      onChange={e => updateField('targetCustomer', e.target.value)}
                      placeholder="e.g. Solo SaaS founders, early B2B engineering leads"
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm outline-none text-[#EDEDEF] placeholder:text-[#8A8F98] focus:border-[#5E6AD2]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#EDEDEF] mb-1">
                      Acute Customer Pain Point *
                    </label>
                    <input
                      type="text"
                      value={formData.problem}
                      onChange={e => updateField('problem', e.target.value)}
                      placeholder="e.g. Wasting 15 hours/week on manual contract parsing"
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm outline-none text-[#EDEDEF] placeholder:text-[#8A8F98] focus:border-[#5E6AD2]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Maturity Stage */}
          {step === 2 && (
            <div className="space-y-4">
              <SectionBadge label="Step 2 of 6 — Maturity Stage Calibration" variant="blue" />
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
                  Where is your startup right now?
                </h2>
                <p className="text-xs sm:text-sm text-[#8A8F98] mt-1 font-sans">
                  Be authentic. FounderZero uses your stage to safeguard against premature scaling and unnecessary costs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {stages.map(s => {
                  const isSelected = formData.stage === s.stage;
                  return (
                    <div
                      key={s.stage}
                      onClick={() => updateField('stage', s.stage)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#5E6AD2] bg-[#5E6AD2]/15 shadow-[0_0_16px_rgba(94,106,210,0.2)]'
                          : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm text-[#EDEDEF] font-sans">{s.title}</div>
                          {isSelected && <CheckCircle2 size={16} className="text-[#5E6AD2]" />}
                        </div>
                        <div className="text-xs text-[#8A8F98] mt-1 leading-relaxed font-sans">
                          {s.desc}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/[0.06] text-[11px] font-mono text-[#8A8F98]">
                        {s.criteria}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Tech Stack & Founder Skills */}
          {step === 3 && (
            <div className="space-y-4">
              <SectionBadge label="Step 3 of 6 — Tech Stack & Founder Skills" variant="emerald" />
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
                  What is your skillset & tech stack?
                </h2>
                <p className="text-xs sm:text-sm text-[#8A8F98] mt-1 font-sans">
                  We customize coding agent recommendations (OpenCode, Cline) and starter templates to your stack.
                </p>
              </div>

              <div className="space-y-4 pt-1 font-sans">
                <div>
                  <label className="block text-xs font-medium text-[#EDEDEF] mb-2">
                    Founder Core Skillsets (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map(skill => {
                      const isSelected = formData.founderSkills?.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-[0_0_12px_rgba(94,106,210,0.3)]'
                              : 'bg-white/[0.03] text-[#EDEDEF] border-white/[0.08] hover:bg-white/[0.06]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EDEDEF] mb-2">
                    Preferred Zero-Budget Tech Stack
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTechStacks.map(tech => {
                      const isSelected = formData.techStack?.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-[0_0_12px_rgba(94,106,210,0.3)]'
                              : 'bg-white/[0.03] text-[#EDEDEF] border-white/[0.08] hover:bg-white/[0.06]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{tech}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Runway, Budget & Bandwidth */}
          {step === 4 && (
            <div className="space-y-4">
              <SectionBadge label="Step 4 of 6 — Runway, Budget & Bandwidth" variant="amber" />
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
                  What resources do you have?
                </h2>
                <p className="text-xs sm:text-sm text-[#8A8F98] mt-1 font-sans">
                  Be honest about your actual hours and cash. FounderZero is specifically optimized for ₹0 spend.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs font-sans">
                <div>
                  <label className="block font-medium text-[#EDEDEF] mb-1">
                    Team Size (Founders + Core)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.teamSize}
                    onChange={e => updateField('teamSize', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-mono outline-none text-[#EDEDEF] focus:border-[#5E6AD2]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#EDEDEF] mb-1">
                    Monthly Software Budget (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.monthlyBudget}
                    onChange={e => updateField('monthlyBudget', Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-mono outline-none text-[#EDEDEF] focus:border-[#5E6AD2]"
                  />
                  <div className="flex gap-2 mt-1.5">
                    {[0, 2000, 5000].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => updateField('monthlyBudget', b)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.10] text-[#EDEDEF] border border-white/10"
                      >
                        ₹{b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#EDEDEF] mb-1">
                    Available Founder Hours / Week
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={formData.availableHoursPerWeek}
                    onChange={e => updateField('availableHoursPerWeek', Math.max(5, parseInt(e.target.value) || 10))}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-mono outline-none text-[#EDEDEF] focus:border-[#5E6AD2]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#EDEDEF] mb-1">
                    Current Registered Users / Waitlist
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.currentUsers}
                    onChange={e => updateField('currentUsers', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-mono outline-none text-[#EDEDEF] focus:border-[#5E6AD2]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#EDEDEF] mb-1">
                    Current Monthly Revenue (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.monthlyRevenue}
                    onChange={e => updateField('monthlyRevenue', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-mono outline-none text-[#EDEDEF] focus:border-[#5E6AD2]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Primary Uncertainty & Bottleneck */}
          {step === 5 && (
            <div className="space-y-4">
              <SectionBadge label="Step 5 of 6 — Acute Bottleneck & Core Risk" variant="amber" />
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
                  What is your biggest uncertainty?
                </h2>
                <p className="text-xs sm:text-sm text-[#8A8F98] mt-1 font-sans">
                  We will prioritize your #1 Next Best Action directly at mitigating this risk.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {uncertainties.map(u => {
                  const isSelected = formData.biggestUncertainty === u.value;
                  return (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => updateField('biggestUncertainty', u.value)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#5E6AD2] bg-[#5E6AD2] text-white shadow-[0_0_16px_rgba(94,106,210,0.3)]'
                          : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-[#EDEDEF]'
                      }`}
                    >
                      <div className="font-semibold text-xs font-sans">{u.value}</div>
                      <div className={`text-[11px] mt-1 leading-snug font-sans ${isSelected ? 'text-indigo-100' : 'text-[#8A8F98]'}`}>
                        {u.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 6: 90-Day Primary Goal */}
          {step === 6 && (
            <div className="space-y-4">
              <SectionBadge label="Step 6 of 6 — 90-Day North Star Objective" variant="dark" />
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
                  What is your core 90-day goal?
                </h2>
                <p className="text-xs sm:text-sm text-[#8A8F98] mt-1 font-sans">
                  Select a single high-leverage objective. Everything else becomes "Don't Do Yet".
                </p>
              </div>

              <div className="space-y-2 pt-1 font-sans">
                {[
                  'Conduct 10 problem validation interviews & ship lean MVP',
                  'Acquire 100 active waitlist users via cold outreach & community',
                  'Sign first 3 paying customers ($50+ MRR)',
                  'Ship core product overhaul & reduce 7-day churn below 15%'
                ].map(g => {
                  const isSelected = formData.goal90Days === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateField('goal90Days', g)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#5E6AD2] bg-[#5E6AD2] text-white shadow-[0_0_16px_rgba(94,106,210,0.3)]'
                          : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-[#EDEDEF]'
                      }`}
                    >
                      <span>{g}</span>
                      {isSelected && <Check size={16} className="text-white shrink-0" />}
                    </button>
                  );
                })}

                <div className="pt-2">
                  <label className="block text-xs font-medium text-[#EDEDEF] mb-1">
                    Or custom 90-day objective:
                  </label>
                  <input
                    type="text"
                    value={formData.goal90Days}
                    onChange={e => updateField('goal90Days', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm outline-none text-[#EDEDEF] focus:border-[#5E6AD2]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                leftIcon={<ArrowLeft size={14} />}
              >
                Back
              </Button>
            ) : <div />}

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={step === 1 && (!formData.name.trim() || !formData.targetCustomer.trim() || !formData.problem.trim())}
              rightIcon={<ArrowRight size={14} />}
            >
              {step === 6 ? 'Generate My Growth Dashboard' : 'Continue'}
            </Button>
          </div>
        </div>

        {/* Live Calibration Radar Preview Pane */}
        <div className="bg-[#0a0a0c] text-[#EDEDEF] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold text-xs uppercase tracking-wider">
                <Sparkles size={14} className="text-[#5E6AD2]" />
                <span>Live OS Calibration</span>
              </div>
              <Badge variant="blue">
                {formData.stage}
              </Badge>
            </div>

            <div className="mt-4 space-y-4 text-xs font-sans">
              {/* Projected Founder Score */}
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8A8F98] uppercase font-mono block">Projected Founder Score</span>
                  <span className="text-xl font-extrabold text-[#EDEDEF] font-mono">{dynamicScore}/100</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#5E6AD2]/20 text-indigo-300 flex items-center justify-center font-bold">
                  <TrendingUp size={18} />
                </div>
              </div>

              {/* Monthly Savings */}
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-mono block">Zero-Budget Savings</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ~₹{calculatedSavings.toLocaleString()}/mo
                  </span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign size={18} />
                </div>
              </div>

              {/* Startup details */}
              <div className="space-y-2 pt-1 border-t border-white/[0.06] text-[11px]">
                <div>
                  <span className="text-[10px] text-[#8A8F98] uppercase font-mono block">Startup</span>
                  <p className="font-bold text-[#EDEDEF] truncate">{formData.name || 'Untitled Venture'}</p>
                </div>

                <div>
                  <span className="text-[10px] text-[#8A8F98] uppercase font-mono block">Target ICP</span>
                  <p className="text-[#8A8F98] truncate">{formData.targetCustomer || 'Defining ICP...'}</p>
                </div>

                <div>
                  <span className="text-[10px] text-[#8A8F98] uppercase font-mono block">Acute Uncertainty</span>
                  <p className="text-amber-400 font-medium">{formData.biggestUncertainty}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#5E6AD2]/10 rounded-xl border border-[#5E6AD2]/30 text-[11px] text-indigo-300 leading-relaxed font-sans">
            ⚡ FounderZero automatically synchronizes with your Firebase workspace and generates your 6-stage roadmap.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-xs text-[#8A8F98] pt-3 border-t border-white/[0.06] relative z-10">
        FounderZero • Zero-Budget Startup Growth Operating System
      </div>
    </div>
  );
};
