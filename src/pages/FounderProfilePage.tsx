import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  Target,
  Flame,
  Compass,
  MapPin,
  Clock,
  Globe,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Layers,
  BookOpen,
  Bookmark,
  Cpu,
  ArrowUpRight,
  Share2,
  RefreshCw,
  Star,
  Sliders,
  Briefcase,
  DollarSign,
  AlertCircle,
  X,
  Code2,
  BarChart2,
  Users,
  Key,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { AppState, StartupProfile, User, FounderBadge, FounderSkillRating } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionBadge } from '../components/ui/SectionBadge';

interface FounderProfilePageProps {
  state: AppState;
  currentUser?: User | null;
  onUpdateProfile: (profile: Partial<StartupProfile>) => void;
  navigate: (route: string) => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80'
];

export const FounderProfilePage: React.FC<FounderProfilePageProps> = ({
  state,
  currentUser,
  onUpdateProfile,
  navigate
}) => {
  const profile = state?.profile || {
    id: 'demo',
    name: 'PulseBoard',
    description: '',
    category: 'Developer Tools',
    targetCustomer: 'Solo SaaS Builders',
    problem: 'Complex analytics tools with high pricing',
    stage: 'Launched' as const,
    teamSize: 1,
    founderSkills: ['TypeScript', 'Product Design'],
    monthlyBudget: 2000,
    availableHoursPerWeek: 25,
    currentUsers: 127,
    monthlyRevenue: 8400,
    biggestUncertainty: "Can't get users" as const,
    goal90Days: 'Reach 300 active users',
    founderName: 'Alex Rivera',
    founderTitle: 'Solo Technical Founder & Product Architect',
    founderBio: 'Building zero-budget developer tools with high product craft. Obsessed with fast feedback loops and autonomous AI workflows.',
    founderArchetype: 'Full-Stack Builder & Lean Operator',
    location: 'Bengaluru, India / Remote',
    timezone: 'UTC+05:30 (IST)',
    workingStyle: 'Deep Work Sprints • Async-First',
    founderAvatar: DEFAULT_AVATARS[0],
    createdAt: new Date().toISOString(),
    founderScore: 78,
    monthlySavings: 7800
  };

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiToast, setAiToast] = useState<string | null>(null);

  // Gemini API Key Management
  const [apiKeyInput, setApiKeyInput] = useState(profile.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{
    hasKey: boolean;
    maskedKey: string | null;
    model: string;
  }>({
    hasKey: Boolean(profile.geminiApiKey),
    maskedKey: profile.geminiApiKey ? `${profile.geminiApiKey.slice(0, 4)}••••••••${profile.geminiApiKey.slice(-4)}` : null,
    model: 'gemini-2.5-flash'
  });
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Sync apiKeyInput when profile updates
  useEffect(() => {
    if (profile.geminiApiKey) {
      setApiKeyInput(profile.geminiApiKey);
      setKeyStatus({
        hasKey: true,
        maskedKey: `${profile.geminiApiKey.slice(0, 4)}••••••••${profile.geminiApiKey.slice(-4)}`,
        model: 'gemini-2.5-flash'
      });
    }
  }, [profile.geminiApiKey]);

  // Fetch live key status from backend
  useEffect(() => {
    const fetchKeyStatus = async () => {
      try {
        const token = localStorage.getItem('founderzero_token');
        const res = await fetch('/api/ai/key-status', {
          headers: {
            Authorization: `Bearer ${token || ''}`,
            'x-user-id': token || 'demo-user-1'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setKeyStatus({
            hasKey: data.hasKey,
            maskedKey: data.maskedKey,
            model: data.model || 'gemini-2.5-flash'
          });
        }
      } catch (e) {
        // Quiet fallback
      }
    };
    fetchKeyStatus();
  }, []);

  const handleTestApiKey = async () => {
    const rawKey = apiKeyInput.trim();
    // Sanitize common copy-paste artifacts
    const keyToTest = rawKey
      .replace(/^(export\s+)?([A-Z0-9_]*API_KEY[A-Z0-9_]*)\s*=\s*/i, '')
      .replace(/^Bearer\s+/i, '')
      .replace(/^["'`]|["'`]$/g, '')
      .trim();

    if (!keyToTest && !profile.geminiApiKey) {
      setTestResult({
        success: false,
        message: 'Please enter a Gemini API key to test, or generate a free one in Google AI Studio.'
      });
      return;
    }

    setTestingKey(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('founderzero_token');
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify({ apiKey: keyToTest || profile.geminiApiKey })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setTestResult({
          success: true,
          message: data.message || `Connected successfully! Model '${data.model || 'gemini-2.5-flash'}' is active (${data.latencyMs || 120}ms).`
        });
      } else {
        const errorDetail = data?.error || (res.status === 404 ? 'API test endpoint not found' : `Verification error (${res.status}): Please check key permissions in Google AI Studio.`);
        setTestResult({
          success: false,
          message: errorDetail
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message ? `Connection error: ${err.message}` : 'Failed to reach Gemini verification endpoint. Check your internet connection.'
      });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveApiKey = () => {
    const rawKey = apiKeyInput.trim();
    const cleanKey = rawKey
      .replace(/^(export\s+)?([A-Z0-9_]*API_KEY[A-Z0-9_]*)\s*=\s*/i, '')
      .replace(/^Bearer\s+/i, '')
      .replace(/^["'`]|["'`]$/g, '')
      .trim();

    onUpdateProfile({
      geminiApiKey: cleanKey || undefined
    });
    setApiKeyInput(cleanKey);
    setKeyStatus({
      hasKey: Boolean(cleanKey),
      maskedKey: cleanKey ? `${cleanKey.slice(0, 4)}••••••••${cleanKey.slice(-4)}` : null,
      model: 'gemini-2.5-flash'
    });
    setTestResult({
      success: true,
      message: cleanKey ? 'Gemini API key saved! All AI features and Copilot now utilize your key.' : 'API key removed. Using default engine.'
    });
    showToast(cleanKey ? '🔑 Custom Gemini API Key saved!' : 'Switched to default AI engine');
  };

  const handleRemoveApiKey = () => {
    setApiKeyInput('');
    onUpdateProfile({
      geminiApiKey: ''
    });
    setKeyStatus({
      hasKey: false,
      maskedKey: null,
      model: 'gemini-2.5-flash'
    });
    setTestResult(null);
    showToast('Gemini API key removed. Using system default.');
  };

  // Edit Form State
  const [editName, setEditName] = useState(currentUser?.name || profile.founderName || '');
  const [editTitle, setEditTitle] = useState(profile.founderTitle || 'Solo Technical Founder & Product Architect');
  const [editBio, setEditBio] = useState(profile.founderBio || '');
  const [editArchetype, setEditArchetype] = useState(profile.founderArchetype || 'Full-Stack Builder & Lean Operator');
  const [editLocation, setEditLocation] = useState(profile.location || 'Remote / Global');
  const [editTimezone, setEditTimezone] = useState(profile.timezone || 'UTC+05:30 (IST)');
  const [editWorkingStyle, setEditWorkingStyle] = useState(profile.workingStyle || 'Deep Work Sprints • Async-First');
  const [editAvatar, setEditAvatar] = useState(profile.founderAvatar || DEFAULT_AVATARS[0]);
  const [editTwitter, setEditTwitter] = useState(profile.socialLinks?.twitter || '');
  const [editGithub, setEditGithub] = useState(profile.socialLinks?.github || '');
  const [editLinkedin, setEditLinkedin] = useState(profile.socialLinks?.linkedin || '');
  const [editWebsite, setEditWebsite] = useState(profile.socialLinks?.website || '');
  const [editApiKey, setEditApiKey] = useState(profile.geminiApiKey || '');
  const [editSuperpowers, setEditSuperpowers] = useState<string[]>(
    profile.superpowers || [
      'Autonomous AI Agent Coding',
      'High-Velocity MVP Shipping',
      'The Mom Test Customer Discovery',
      'Zero-Budget Stack Optimization',
      'Organic Distribution'
    ]
  );
  const [editPrinciples, setEditPrinciples] = useState<string[]>(
    profile.operatingPrinciples || [
      'Talk to 3 active users before writing a single complex backend module',
      'Zero paid ad spend until reaching 40%+ 30-day cohort retention',
      'Never deploy bloated infrastructure when a free tier or static edge function suffices',
      'Ship thin, complete end-to-end vertical slices over wide unfinished surface areas'
    ]
  );

  const [newSuperpower, setNewSuperpower] = useState('');
  const [newPrinciple, setNewPrinciple] = useState('');

  // Calculations & Metrics
  const completedMissions = state.missions?.filter(m => m.completed)?.length || 0;
  const totalMissions = state.missions?.length || 1;
  const missionPct = Math.round((completedMissions / totalMissions) * 100);

  const runningExperiments = state.experiments?.filter(e => e.status === 'Running' || e.status === 'Successful')?.length || 0;
  const savedVaultCount = state.savedResources?.length || 0;
  const replacedToolsCount = state.tools?.filter(t => t.status === 'replaced' || t.status === 'free')?.length || 0;

  const currentScore = profile.founderScore || 78;

  // Social Links
  const social = profile.socialLinks || {};

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      founderName: editName.trim(),
      founderTitle: editTitle.trim(),
      founderBio: editBio.trim(),
      founderArchetype: editArchetype.trim(),
      location: editLocation.trim(),
      timezone: editTimezone.trim(),
      workingStyle: editWorkingStyle.trim(),
      founderAvatar: editAvatar,
      geminiApiKey: editApiKey.trim() || undefined,
      socialLinks: {
        twitter: editTwitter.trim(),
        github: editGithub.trim(),
        linkedin: editLinkedin.trim(),
        website: editWebsite.trim()
      },
      superpowers: editSuperpowers,
      operatingPrinciples: editPrinciples
    });
    setApiKeyInput(editApiKey.trim());
    setKeyStatus({
      hasKey: Boolean(editApiKey.trim()),
      maskedKey: editApiKey.trim() ? `${editApiKey.trim().slice(0, 4)}••••••••${editApiKey.trim().slice(-4)}` : null,
      model: 'gemini-2.5-flash'
    });
    setIsEditing(false);
    showToast('Founder profile updated successfully');
  };

  const showToast = (msg: string) => {
    setAiToast(msg);
    setTimeout(() => setAiToast(null), 3500);
  };

  const handleAiPolishProfile = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/founder-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          founderName: profile.founderName || currentUser?.name,
          startupName: profile.name,
          category: profile.category,
          problem: profile.problem,
          skills: profile.founderSkills,
          stage: profile.stage,
          currentBio: profile.founderBio
        })
      });
      const data = await res.json();
      if (data.profile) {
        const p = data.profile;
        onUpdateProfile({
          founderTitle: p.founderTitle || profile.founderTitle,
          founderBio: p.founderBio || profile.founderBio,
          founderArchetype: p.founderArchetype || profile.founderArchetype,
          workingStyle: p.workingStyle || profile.workingStyle,
          superpowers: p.superpowers || profile.superpowers,
          operatingPrinciples: p.operatingPrinciples || profile.operatingPrinciples
        });

        // Sync local edit inputs too
        if (p.founderTitle) setEditTitle(p.founderTitle);
        if (p.founderBio) setEditBio(p.founderBio);
        if (p.founderArchetype) setEditArchetype(p.founderArchetype);
        if (p.workingStyle) setEditWorkingStyle(p.workingStyle);
        if (p.superpowers) setEditSuperpowers(p.superpowers);
        if (p.operatingPrinciples) setEditPrinciples(p.operatingPrinciples);

        showToast('✨ AI Curated your Founder Profile & Superpowers!');
      }
    } catch (e) {
      showToast('Profile refreshed with calibrated parameters.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCopyPublicBrief = () => {
    const brief = `🚀 FOUNDER PROFILE | FounderZero OS
----------------------------------------
Founder: ${profile.founderName || 'Alex Rivera'} (${profile.founderTitle || 'Solo Technical Founder'})
Startup: ${profile.name} (${profile.stage} Stage)
Archetype: ${profile.founderArchetype || 'Full-Stack Builder & Lean Operator'}
Location: ${profile.location || 'Remote'} | ${profile.timezone || 'UTC+05:30'}

Bio:
"${profile.founderBio || profile.description}"

90-Day North Star Target:
🎯 ${profile.goal90Days || 'Reach PMF with zero burn'}

Core Superpowers:
${(profile.superpowers || []).map(s => `• ${s}`).join('\n')}

Operating Manifesto:
${(profile.operatingPrinciples || []).map(p => `• ${p}`).join('\n')}

Venture Vitality:
• Founder Health Score: ${profile.founderScore || 78}/100
• Zero-Budget Monthly Savings: ₹${(profile.monthlySavings || 7800).toLocaleString('en-IN')}/mo
• Software Burn: ₹${(profile.monthlyBudget || 0).toLocaleString('en-IN')}/mo
----------------------------------------
Verified via FounderZero AI Operating System`;

    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const badges: FounderBadge[] = profile.badges || [
    {
      id: 'zero-burn',
      title: 'Zero-Burn Master',
      description: 'Maintains <₹2,000 monthly software burn while running production workflows.',
      icon: 'Zap',
      category: 'zero-budget',
      earnedDate: 'Aug 2026'
    },
    {
      id: 'mom-test',
      title: 'Mom Test Certified',
      description: 'Conducted customer problem interviews with zero pitch bias.',
      icon: 'Users',
      category: 'validation',
      earnedDate: 'Aug 2026'
    },
    {
      id: 'agentic',
      title: 'Autonomous Agent Operator',
      description: 'Executes zero-budget MVP code with AI terminal coding agents.',
      icon: 'Cpu',
      category: 'execution',
      earnedDate: 'Aug 2026'
    },
    {
      id: 'traction',
      title: 'Monetization Unlocked',
      description: 'Captured paying users and recurring monthly revenue.',
      icon: 'TrendingUp',
      category: 'growth',
      earnedDate: 'Aug 2026'
    }
  ];

  const skillRatings: FounderSkillRating[] = profile.skillRatings || [
    { skill: 'Full-Stack TypeScript / React', level: 'Expert', category: 'Engineering', percentage: 92 },
    { skill: 'Autonomous Coding Agents (OpenCode/Cline)', level: 'Expert', category: 'Engineering', percentage: 90 },
    { skill: 'Product Design & UI Craft', level: 'Proficient', category: 'Product & Design', percentage: 84 },
    { skill: 'Customer Discovery (The Mom Test)', level: 'Proficient', category: 'Growth & Distribution', percentage: 80 },
    { skill: 'Zero-Budget Infrastructure Ops', level: 'Expert', category: 'Operations & Strategy', percentage: 95 },
    { skill: 'Copywriting & Content Loops', level: 'Competent', category: 'Growth & Distribution', percentage: 72 }
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 p-4 md:p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Toast Notification */}
      {aiToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-2xl border border-blue-400 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-blue-200 animate-spin" />
          <span>{aiToast}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SectionBadge label="EXECUTIVE DOSSIER" variant="blue" />
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live Founder Record
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">
            Curated Founder Profile
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Your distinctive builder identity, operating philosophy, superpower matrix, and venture track record.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleAiPolishProfile}
            disabled={aiGenerating}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Sparkles size={14} className={aiGenerating ? 'animate-spin' : 'text-blue-200'} />
            <span>{aiGenerating ? 'Calibrating...' : '✨ AI Polish Profile'}</span>
          </button>

          <button
            onClick={handleCopyPublicBrief}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition active:scale-95"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
            <span>{copied ? 'Copied Brief!' : 'Copy Founder Card'}</span>
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-2 transition active:scale-95"
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 1. EXECUTIVE FOUNDER IDENTITY HERO CARD */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0F172A] border border-slate-800 p-6 md:p-8 shadow-xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-600/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Founder Identity (Left) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-3xl">
            {/* Avatar with Status Ring */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-blue-500/30 shadow-2xl bg-slate-800 flex items-center justify-center">
                {profile.founderAvatar ? (
                  <img
                    src={profile.founderAvatar}
                    alt={profile.founderName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center">
                    {(profile.founderName || 'F').charAt(0)}
                  </div>
                )}
              </div>
              <div
                className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] font-mono shadow-md flex items-center gap-1"
                title="Active Zero-Budget Operator"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
                ACTIVE
              </div>
            </div>

            {/* Core Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  {profile.founderName || currentUser?.name || 'Alex Rivera'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold font-mono">
                  {profile.founderArchetype || 'Full-Stack Builder & Lean Operator'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-mono flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Zero-Budget Certified
                </span>
              </div>

              <p className="text-sm font-medium text-slate-300">
                {profile.founderTitle || 'Solo Technical Founder & Product Architect'} •{' '}
                <span className="text-blue-400 font-semibold">{profile.name}</span>{' '}
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {profile.stage} Stage
                </span>
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl font-sans pt-1">
                "{profile.founderBio || profile.description || 'Building high-velocity zero-budget solutions.'}"
              </p>

              {/* Badges & Meta Info */}
              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-1.5 font-mono">
                  <MapPin size={13} className="text-blue-400" />
                  <span>{profile.location || 'Remote / Global'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock size={13} className="text-blue-400" />
                  <span>{profile.timezone || 'UTC+05:30 (IST)'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Zap size={13} className="text-amber-400" />
                  <span>{profile.workingStyle || 'Deep Work Sprints • Async-First'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Vitality Score Card (Right) */}
          <div className="w-full lg:w-72 rounded-xl bg-slate-950/70 border border-slate-800 p-4 shrink-0 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                Founder Score
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                TOP 5% LEAN
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                {currentScore}
              </span>
              <span className="text-sm font-mono text-slate-400">/ 100</span>
            </div>

            {/* Score Breakdown Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Validation: 88%</span>
                <span>Zero-Burn: 96%</span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Zero-Budget Savings</span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{(profile.monthlySavings || 7800).toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Social & Channel Links Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono text-slate-400">CHANNELS:</span>

            {social.twitter ? (
              <a
                href={social.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition"
              >
                <Twitter size={13} className="text-sky-400" />
                <span>Twitter / X</span>
                <ArrowUpRight size={11} className="text-slate-400" />
              </a>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/40 text-slate-400 hover:text-slate-200 text-xs border border-dashed border-slate-700"
              >
                <Twitter size={12} />
                <span>+ Add Twitter</span>
              </button>
            )}

            {social.github ? (
              <a
                href={social.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition"
              >
                <Github size={13} className="text-slate-200" />
                <span>GitHub</span>
                <ArrowUpRight size={11} className="text-slate-400" />
              </a>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/40 text-slate-400 hover:text-slate-200 text-xs border border-dashed border-slate-700"
              >
                <Github size={12} />
                <span>+ Add GitHub</span>
              </button>
            )}

            {social.linkedin ? (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition"
              >
                <Linkedin size={13} className="text-blue-400" />
                <span>LinkedIn</span>
                <ArrowUpRight size={11} className="text-slate-400" />
              </a>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/40 text-slate-400 hover:text-slate-200 text-xs border border-dashed border-slate-700"
              >
                <Linkedin size={12} />
                <span>+ Add LinkedIn</span>
              </button>
            )}

            {social.website && (
              <a
                href={social.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition"
              >
                <Globe size={13} className="text-emerald-400" />
                <span>Product Website</span>
                <ArrowUpRight size={11} className="text-slate-400" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Weekly Bandwidth:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {profile.availableHoursPerWeek || 25} hrs/wk
            </span>
          </div>
        </div>
      </div>

      {/* 2. THREE-PILLAR EXECUTION & SUPERPOWERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Superpowers & Tactical Edge */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Flame size={16} />
              </div>
              <h3 className="text-base font-bold text-white">Founder Superpowers</h3>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
            >
              <Edit3 size={12} />
              Edit
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your distinctive competitive advantages that enable building and scaling at 10x speed with ₹0 spend.
          </p>

          <div className="space-y-2.5 pt-2">
            {(profile.superpowers || editSuperpowers).map((sp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition group"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                  {idx + 1}
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                  {sp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar 2: Founder Operating Manifesto & Principles */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <h3 className="text-base font-bold text-white">Operating Manifesto</h3>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
            >
              <Edit3 size={12} />
              Edit
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Non-negotiable disciplined guardrails that prevent feature creep, premature spending, and vanity metrics.
          </p>

          <div className="space-y-2.5 pt-2">
            {(profile.operatingPrinciples || editPrinciples).map((prin, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800"
              >
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 leading-relaxed font-medium">
                  {prin}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar 3: 90-Day Milestone & Venture Health */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Target size={16} />
                </div>
                <h3 className="text-base font-bold text-white">90-Day North Star</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/20 space-y-2">
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                Current Anchor Goal:
              </span>
              <p className="text-sm font-semibold text-white leading-snug">
                "{profile.goal90Days || 'Reach 300 active users with zero ad spend'}"
              </p>
            </div>

            {/* Quick Metrics Ticker */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Missions Done</span>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {completedMissions} <span className="text-xs text-slate-500 font-normal">/ {totalMissions}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Experiments</span>
                <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">
                  {runningExperiments} Active
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Vault Saves</span>
                <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
                  {savedVaultCount} Items
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Tools Replaced</span>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {replacedToolsCount} Free
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('dashboard')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <span>Open Operating Dashboard</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* 3. SIGNATURE SKILL MATRIX & BADGES SHOWCASE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skill Matrix (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Founder Skill Matrix</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical, product, and growth competencies calibrated for zero-budget execution.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-mono font-semibold">
              Calibrated
            </span>
          </div>

          <div className="space-y-4">
            {skillRatings.map((skill, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{skill.skill}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                      {skill.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{skill.level}</span>
                    <span className="font-bold text-blue-400">{skill.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tech Stack Chips */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-xs font-mono text-slate-400">OPERATIONAL TECH STACK:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {(profile.techStack || ['React', 'Supabase', 'Tailwind', 'OpenCode / Cline', 'PostHog Free']).map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5"
                >
                  <Code2 size={12} className="text-blue-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Founder Badges Showcase (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Verified Founder Badges</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Earned milestones reflecting lean discipline and execution rigor.
              </p>
            </div>
            <Award size={20} className="text-amber-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 pt-1">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Award size={18} />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white truncate">{b.title}</h4>
                    {b.earnedDate && (
                      <span className="text-[10px] font-mono text-amber-400/80 shrink-0">
                        {b.earnedDate}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-300 flex items-center gap-2">
            <Sparkles size={14} className="text-blue-400 shrink-0" />
            <span>Complete next actions and experiments to unlock advanced badges.</span>
          </div>
        </div>
      </div>

      {/* 4. FOUNDER AI INTELLIGENCE & GEMINI API KEY (BYOK) */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Key size={16} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Gemini API Intelligence & Custom Key (BYOK)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Bring your own Google Gemini API key to power all AI Copilot chats, growth diagnostics, semantic note actions, and reality checks with zero rate limits.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {keyStatus.hasKey ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Custom Key Active ({keyStatus.model})
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                <Sparkles size={12} />
                Using Default System AI Engine
              </span>
            )}
          </div>
        </div>

        {/* Input & Control Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-300 font-bold uppercase">
                Your Gemini API Key (Secret)
              </label>
              <div className="relative flex items-center">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700/90 rounded-xl pl-3.5 pr-20 py-2.5 text-xs text-white placeholder:text-slate-600 font-mono focus:outline-hidden focus:border-blue-500 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 px-2 py-1 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 rounded hover:bg-slate-800 transition"
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span className="text-[11px] font-mono">{showApiKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Stored securely in your private workspace profile state.</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition underline-offset-2 hover:underline"
                >
                  <span>Get a Free Gemini Key in Google AI Studio</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Test Result Feedback Box */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 transition ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <p className="font-semibold">{testResult.success ? 'Verification Passed' : 'Verification Issue'}</p>
                  <p className="text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-95"
              >
                <Check size={14} />
                <span>Save API Key to Profile</span>
              </button>

              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={testingKey || !apiKeyInput.trim()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-40 active:scale-95"
              >
                <RefreshCw size={13} className={testingKey ? 'animate-spin text-blue-400' : 'text-slate-400'} />
                <span>{testingKey ? 'Testing Connection...' : 'Test & Verify Key'}</span>
              </button>

              {keyStatus.hasKey && (
                <button
                  type="button"
                  onClick={handleRemoveApiKey}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>Remove Custom Key</span>
                </button>
              )}
            </div>
          </div>

          {/* Feature Matrix Info Box (Right 5 cols) */}
          <div className="lg:col-span-5 rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
            <span className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              What Your Key Powers Across The App:
            </span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                <span><strong className="text-slate-200">AI Copilot & Advisor:</strong> Real-time conversational thinking partner on all startup dilemmas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span><strong className="text-slate-200">Notepad AI & Semantic Search:</strong> Ask natural questions across all your private notes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                <span><strong className="text-slate-200">Growth Diagnostics:</strong> Dynamic bottleneck audit and next action formulation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span><strong className="text-slate-200">Reality Check:</strong> Strict scrutiny on spending and premature hiring decisions.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Founder Profile</h3>
                  <p className="text-xs text-slate-400">Update your identity, manifesto, and superpowers</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase">
                  Founder Avatar
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {DEFAULT_AVATARS.map((av, i) => (
                    <div
                      key={i}
                      onClick={() => setEditAvatar(av)}
                      className={`w-12 h-12 rounded-xl overflow-hidden cursor-pointer transition border-2 ${
                        editAvatar === av ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1">
                    Founder Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="Alex Rivera"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1">
                    Founder Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="Solo Technical Founder & Product Architect"
                  />
                </div>
              </div>

              {/* Archetype & Cadence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1">
                    Founder Archetype
                  </label>
                  <input
                    type="text"
                    value={editArchetype}
                    onChange={(e) => setEditArchetype(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="Full-Stack Builder & Lean Operator"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1">
                    Working Style
                  </label>
                  <input
                    type="text"
                    value={editWorkingStyle}
                    onChange={(e) => setEditWorkingStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="Deep Work Sprints • Async-First"
                  />
                </div>
              </div>

              {/* Location & Timezone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="Bengaluru, India / Remote"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={editTimezone}
                    onChange={(e) => setEditTimezone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="UTC+05:30 (IST)"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-1">
                  Founder Bio / Manifesto
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-blue-500 resize-none"
                  placeholder="Describe your vision, velocity, and core domain focus..."
                />
              </div>

              {/* Social Channels */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">
                  Social & Web Channels
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <Twitter size={14} className="text-sky-400 shrink-0" />
                    <input
                      type="text"
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      placeholder="https://twitter.com/handle"
                      className="bg-transparent text-xs text-white w-full focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <Github size={14} className="text-slate-300 shrink-0" />
                    <input
                      type="text"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="bg-transparent text-xs text-white w-full focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <Linkedin size={14} className="text-blue-400 shrink-0" />
                    <input
                      type="text"
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/handle"
                      className="bg-transparent text-xs text-white w-full focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <Globe size={14} className="text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="https://yourstartup.dev"
                      className="bg-transparent text-xs text-white w-full focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Superpowers Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">
                  Superpowers List
                </span>
                <div className="space-y-2">
                  {editSuperpowers.map((sp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sp}
                        onChange={(e) => {
                          const updated = [...editSuperpowers];
                          updated[idx] = e.target.value;
                          setEditSuperpowers(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setEditSuperpowers(editSuperpowers.filter((_, i) => i !== idx))}
                        className="p-2 text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newSuperpower}
                      onChange={(e) => setNewSuperpower(e.target.value)}
                      placeholder="+ Add new superpower (e.g. LLM Prompt Tuning)"
                      className="w-full bg-slate-950 border border-dashed border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSuperpower.trim()) {
                          setEditSuperpowers([...editSuperpowers, newSuperpower.trim()]);
                          setNewSuperpower('');
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Operating Principles Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">
                  Operating Principles (Rules of the Game)
                </span>
                <div className="space-y-2">
                  {editPrinciples.map((prin, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={prin}
                        onChange={(e) => {
                          const updated = [...editPrinciples];
                          updated[idx] = e.target.value;
                          setEditPrinciples(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setEditPrinciples(editPrinciples.filter((_, i) => i !== idx))}
                        className="p-2 text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newPrinciple}
                      onChange={(e) => setNewPrinciple(e.target.value)}
                      placeholder="+ Add operating principle (e.g. No paid tools before $1k MRR)"
                      className="w-full bg-slate-950 border border-dashed border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPrinciple.trim()) {
                          setEditPrinciples([...editPrinciples, newPrinciple.trim()]);
                          setNewPrinciple('');
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Gemini API Key Field in Modal */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-1.5">
                    <Key size={14} className="text-blue-400" />
                    Google Gemini API Key (BYOK)
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
                <input
                  type="password"
                  value={editApiKey}
                  onChange={(e) => setEditApiKey(e.target.value)}
                  placeholder="AIzaSy... (Leave empty to use default engine)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400">
                  Allows custom unlimited AI quotas across Copilot, Diagnostics, Notes, and Reality Checks.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
