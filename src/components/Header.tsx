import React, { useState } from 'react';
import {
  Bell,
  Menu,
  ChevronDown,
  CheckCircle2,
  DollarSign,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  LogOut,
  Settings,
  ShieldCheck,
  Building2,
  ExternalLink,
  Bookmark,
  Plus,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { AppState, StartupStage, User } from '../types';
import { Badge } from './ui/Badge';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentRoute: string;
  state: AppState;
  currentUser?: User | null;
  onOpenMobileMenu: () => void;
  onOpenNotifications: () => void;
  onUpdateStage: (stage: StartupStage) => void;
  onResetDemo: () => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  onNavigate?: (route: string) => void;
  onOpenSaveResource?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  state,
  currentUser,
  onOpenMobileMenu,
  onOpenNotifications,
  onUpdateStage,
  onResetDemo,
  onLogout,
  onOpenAuth,
  onNavigate,
  onOpenSaveResource
}) => {
  const [stageMenuOpen, setStageMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const unreadCount = state?.notifications ? state.notifications.filter(n => !n.read).length : 0;

  const profile = state?.profile || {
    name: 'PulseBoard',
    founderName: 'Alex Rivera',
    stage: 'Validating' as const,
    monthlySavings: 12400,
    founderScore: 78
  };

  const isDemo = currentUser?.isDemo || state?.user?.isDemo;

  const routeTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Overview', subtitle: 'Real-time diagnostic health & next best action' },
    copilot: { title: 'Founder Copilot', subtitle: "Your startup thinking partner. Ask anything about what you're building." },
    notepad: { title: 'Notepad', subtitle: "Your startup's thinking space." },
    profile: { title: 'Founder Profile', subtitle: 'Curated builder identity, superpower matrix, and execution manifesto' },
    vault: { title: 'Founder Vault', subtitle: 'Personal knowledge & resource library — save now, find when you need it' },
    resources: { title: 'Zero-Budget Resource & Agent Intelligence', subtitle: 'Curated open-source coding agents, IDEs, and playbooks' },
    health: { title: 'Startup Health Audit', subtitle: '8-dimension objective scoring based on real customer data' },
    actions: { title: 'Action Center', subtitle: 'Prioritized high-leverage moves to break current bottlenecks' },
    roadmap: { title: 'Execution Roadmap', subtitle: 'Dynamic milestone tracking mapped to your startup stage' },
    missions: { title: 'Growth Missions', subtitle: 'Step-by-step practical playbooks for zero-budget execution' },
    experiments: { title: 'Experiment Lab', subtitle: 'Hypothesis testing engine to validate assumptions fast' },
    stack: { title: 'Zero-Budget Tool Stack', subtitle: 'High-quality free alternatives to expensive SaaS products' },
    'reality-check': { title: 'Decision Reality Check', subtitle: 'Counterargument engine to prevent costly founder mistakes' },
    customers: { title: 'Customer Feedback', subtitle: 'Qualitative notes, customer quotes, and pain points' },
    metrics: { title: 'Metrics & Unit Economics', subtitle: 'Active users, monthly revenue, and capital runway' },
    insights: { title: 'Intelligence Feed', subtitle: 'Central synthesis of feedback, decisions, and recommendations' },
    settings: { title: 'Settings & Goals', subtitle: 'Configure startup profile, stage, and 90-day targets' }
  };

  const currentInfo = routeTitles[currentRoute] || { title: 'Dashboard', subtitle: 'Startup control center' };

  const stages: StartupStage[] = [
    'Idea',
    'Validating',
    'Building MVP',
    'Launched',
    'First Revenue',
    'Growing'
  ];

  const userDisplayName = currentUser?.name || state?.user?.name || profile.founderName || 'Founder';
  const userEmail = currentUser?.email || state?.user?.email || 'founder@workspace.io';
  const userInitials = userDisplayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-2">
            <span>{currentInfo.title}</span>
            {isDemo && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold border border-amber-200 dark:border-amber-800">
                SANDBOX DEMO
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-1">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions, Stage Selector, Metrics, Notifications, Theme, User Account */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Stage Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setStageMenuOpen(!stageMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold font-mono transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#0052FF]" />
            <span>{profile.stage}</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {stageMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-2 z-40 text-xs">
              <div className="px-3.5 py-1.5 font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase font-mono tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                CHANGE STARTUP STAGE
              </div>
              {stages.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onUpdateStage(s);
                    setStageMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium ${
                    profile.stage === s ? 'text-[#0052FF] dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{s}</span>
                  {profile.stage === s && <CheckCircle2 size={14} className="text-[#0052FF] dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Savings Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold font-mono">
          <DollarSign size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>₹{profile.monthlySavings.toLocaleString()}/mo saved</span>
        </div>

        {/* Founder Score Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold font-mono">
          <TrendingUp size={13} className="text-[#0052FF] dark:text-blue-400" />
          <span>Score: {profile.founderScore}/100</span>
        </div>

        {/* Quick Save Resource Button */}
        {onOpenSaveResource && (
          <button
            onClick={onOpenSaveResource}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
            title="Save any URL to Founder Vault"
          >
            <Bookmark size={13} className="text-blue-400 dark:text-blue-600" />
            <span>+ Save Resource</span>
          </button>
        )}

        {/* Dark / Light Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Drawer Toggle */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0052FF] text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0052FF] to-[#38BDF8] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {userInitials || 'F'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[100px]">
                {userDisplayName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none">
                {isDemo ? 'Demo Mode' : 'Verified'}
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 py-2 z-50 text-xs animate-in zoom-in-95 duration-150"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              {/* Account Info Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{userDisplayName}</span>
                  {isDemo ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                      SANDBOX
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
                      <ShieldCheck size={10} />
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate font-mono">{userEmail}</div>
                <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-1 flex items-center gap-1 font-mono">
                  <Building2 size={11} className="text-slate-400" />
                  <span>{profile.name} • {profile.stage}</span>
                </div>
              </div>



              {/* Menu Links */}
              <div className="py-1">
                {onNavigate && (
                  <>
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <UserIcon size={14} className="text-[#0052FF]" />
                      <span>Curated Founder Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Settings size={14} className="text-slate-400" />
                      <span>Startup Settings & Calibration</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('onboarding');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    >
                      <Sparkles size={14} className="text-blue-500" />
                      <span>Re-calibrate Onboarding OS</span>
                    </button>
                  </>
                )}

                {isDemo && onOpenAuth && (
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#0052FF] dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                  >
                    <Sparkles size={14} className="text-[#0052FF]" />
                    <span>Create Real Account</span>
                  </button>
                )}
              </div>

              {/* Sign Out / Exit */}
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                {onLogout && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-medium"
                  >
                    <LogOut size={14} className="text-rose-500" />
                    <span>Sign Out of Session</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


