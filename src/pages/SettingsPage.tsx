import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  User as UserIcon,
  Building,
  Clock,
  Target,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Mail,
  LogOut,
  Sparkles,
  Key,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Trash2,
  Check
} from 'lucide-react';
import { AppState, StartupProfile, StartupStage, User } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface SettingsPageProps {
  state: AppState;
  currentUser?: User | null;
  onUpdateProfile: (profile: Partial<StartupProfile>) => void;
  onResetDemo: () => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  onUserUpdated?: (user: User) => void;
  navigate?: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  state,
  currentUser,
  onUpdateProfile,
  onResetDemo,
  onLogout,
  onOpenAuth,
  onUserUpdated,
  navigate
}) => {
  const profile: StartupProfile = state?.profile || {
    id: 'default-profile',
    name: 'PulseBoard',
    founderName: 'Alex Rivera',
    founderArchetype: 'Full-Stack Builder',
    description: '',
    category: 'Productivity SaaS',
    targetCustomer: 'Solo Founders',
    problem: 'Early validation & distribution',
    stage: 'Validating',
    teamSize: 1,
    founderSkills: ['Full-Stack', 'UI/UX Design'],
    monthlyBudget: 0,
    availableHoursPerWeek: 20,
    currentUsers: 14,
    monthlyRevenue: 0,
    biggestUncertainty: "Can't get users",
    goal90Days: 'Reach first 100 active users',
    createdAt: new Date().toISOString(),
    founderScore: 84,
    monthlySavings: 18000
  };

  const isDemo = currentUser?.isDemo || state?.user?.isDemo;

  const [name, setName] = useState(profile.name || '');
  const [founderName, setFounderName] = useState(currentUser?.name || profile.founderName || '');
  const [description, setDescription] = useState(profile.description || '');
  const [stage, setStage] = useState<StartupStage>(profile.stage || 'Validating');
  const [budget, setBudget] = useState(profile.monthlyBudget || 0);
  const [hours, setHours] = useState(profile.availableHoursPerWeek || 20);
  const [goal, setGoal] = useState(profile.goal90Days || '');
  const [saved, setSaved] = useState(false);



  // Account & Password States
  const [accountEmail, setAccountEmail] = useState(currentUser?.email || state?.user?.email || '');
  const [accountName, setAccountName] = useState(currentUser?.name || profile.founderName || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      founderName,
      description,
      stage,
      monthlyBudget: budget,
      availableHoursPerWeek: hours,
      goal90Days: goal
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!accountName.trim() || !accountEmail.trim()) {
      setProfileError('Name and Email are required');
      return;
    }

    setProfileSaving(true);
    try {
      const token = localStorage.getItem('founderzero_token');
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify({
          name: accountName.trim(),
          email: accountEmail.trim(),
          startupName: name.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Failed to update account details');
      } else {
        setProfileSuccess(true);
        if (onUserUpdated && data.user) {
          onUserUpdated(data.user);
        }
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      setProfileError('Failed to connect to authentication server');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long');
      return;
    }

    setPwdLoading(true);
    try {
      const token = localStorage.getItem('founderzero_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error || 'Failed to update password');
      } else {
        setPwdSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdSuccess(false), 3000);
      }
    } catch (err) {
      setPwdError('Network error while updating password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-2">
        <SectionBadge label="Account & Startup Configuration" variant="blue" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Settings & Account Calibration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Manage your verified founder identity, authentication credentials, startup parameters, and 90-day targets.
        </p>
      </div>

      {/* Curated Founder Dossier Callout */}
      {navigate && (
        <div className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-blue-950 rounded-2xl p-5 border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Curated Founder Profile & Manifesto</h3>
                <span className="px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                  {profile.founderArchetype || 'Full-Stack Builder'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Showcase your superpowers, operating principles, verified badges, and zero-budget execution track record.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('profile')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <span>Open Founder Dossier</span>
            <Target size={13} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Startup Profile Calibration */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="default" className="p-6 space-y-4 border border-slate-800 bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Building size={18} className="text-blue-400" />
                <span>Startup Profile & Scope</span>
              </h3>
              <Badge variant="blue">{stage} Stage</Badge>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Startup / App Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Founder Display Name</label>
                  <input
                    type="text"
                    value={founderName}
                    onChange={e => setFounderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">One-Line Problem / Pitch</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Real-time diagnostic OS for bootstrapped solo founders"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Startup Stage</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  >
                    <option value="Idea" className="bg-slate-900 text-slate-100">Idea</option>
                    <option value="Validating" className="bg-slate-900 text-slate-100">Validating</option>
                    <option value="Building MVP" className="bg-slate-900 text-slate-100">Building MVP</option>
                    <option value="Launched" className="bg-slate-900 text-slate-100">Launched</option>
                    <option value="First Revenue" className="bg-slate-900 text-slate-100">First Revenue</option>
                    <option value="Growing" className="bg-slate-900 text-slate-100">Growing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Founder Bandwidth (Hours / Week)</label>
                  <input
                    type="number"
                    value={hours}
                    onChange={e => setHours(parseInt(e.target.value) || 10)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">90-Day North Star Objective</label>
                <input
                  type="text"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. Reach ₹50,000 MRR with 50 paying customers"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="submit"
                  variant="gradient"
                  size="md"
                  leftIcon={<Save size={14} />}
                >
                  Save Profile Changes
                </Button>

                {saved && (
                  <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 size={15} /> Saved successfully!
                  </span>
                )}
              </div>
            </form>
          </Card>

          {/* Groq AI Engine Card */}
          <Card variant="default" className="p-6 space-y-4 border border-slate-800 bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Groq LLM Engine (Server-Side)
                  </h3>
                  <p className="text-xs text-slate-400">Powered by llama-3.3-70b-versatile for Founder Copilot & AI features</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50 text-xs font-mono font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Vercel Env Configured
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Founder Copilot and all AI diagnostic tools are powered by Groq LLM API. To configure your API key for deployments (such as Vercel), add your <code className="font-mono bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-purple-300 font-semibold">GROQ_API_KEY</code> environment variable in your Vercel project settings.
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400 font-mono text-[11px]">Console & Key Management:</span>
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 hover:text-purple-300 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>console.groq.com</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </Card>

          {/* Reset Demo Data Box */}
          {isDemo && (
            <Card variant="flat" className="p-6 space-y-3 border border-amber-800/50 bg-amber-950/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Sandbox Demo Mode Active</span>
                </h3>
                <Badge variant="amber">Demo</Badge>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                You are currently running in the demo sandbox. You can reset demo state back to defaults or create a real private workspace.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetDemo}
                  leftIcon={<RotateCcw size={14} />}
                  className="text-amber-300 border-amber-800 hover:bg-amber-900/50"
                >
                  Reset Demo Data
                </Button>
                {onOpenAuth && (
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={onOpenAuth}
                    leftIcon={<ShieldCheck size={14} />}
                  >
                    Switch to Real Account
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right: User Authentication & Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* Account Profile Card */}
          <Card variant="default" className="p-6 space-y-4 border border-slate-800 bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UserIcon size={18} className="text-blue-400" />
                <span>Founder Account Details</span>
              </h3>
              {isDemo ? (
                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50 text-[10px] font-mono font-bold">
                  DEMO
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck size={11} />
                  REAL USER
                </span>
              )}
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Account information updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Founder Full Name</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={e => setAccountEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={profileSaving}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  {profileSaving ? 'Saving...' : 'Update Account'}
                </Button>

                {onLogout && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    leftIcon={<LogOut size={14} className="text-rose-400" />}
                    className="text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Change Password Card */}
          {!isDemo && (
            <Card variant="default" className="p-6 space-y-4 border border-slate-800 bg-slate-900/90">
              <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <Key size={18} className="text-blue-400" />
                <span>Security & Password</span>
              </h3>

              {pwdError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                  <span>{pwdError}</span>
                </div>
              )}

              {pwdSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
                  />
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={pwdLoading}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

