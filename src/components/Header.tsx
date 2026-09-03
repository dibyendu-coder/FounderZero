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
    <header className="sticky top-0 z-20 bg-[#050506]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight leading-none flex items-center gap-2">
            <span className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent font-sans">{currentInfo.title}</span>
            {isDemo && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                SANDBOX DEMO
              </span>
            )}
          </h1>
          <p className="text-xs text-[#8A8F98] font-sans hidden sm:block mt-1">
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#5E6AD2]/50 text-[#EDEDEF] text-xs font-mono transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
            <span>{profile.stage}</span>
            <ChevronDown size={13} className="text-[#8A8F98]" />
          </button>

          {stageMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0c] rounded-xl border border-white/10 py-2 z-40 text-xs font-mono shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
              <div className="px-3.5 py-1.5 font-bold text-[#8A8F98] text-[10px] uppercase font-mono tracking-wider border-b border-white/[0.06] mb-1">
                CHANGE STARTUP STAGE
              </div>
              {stages.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onUpdateStage(s);
                    setStageMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-white/[0.06] transition-colors font-medium cursor-pointer ${
                    profile.stage === s ? 'text-[#5E6AD2] bg-white/[0.04]' : 'text-[#EDEDEF]'
                  }`}
                >
                  <span>{s}</span>
                  {profile.stage === s && <CheckCircle2 size={14} className="text-[#5E6AD2]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Savings Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <DollarSign size={13} className="text-emerald-400" />
          <span>₹{profile.monthlySavings.toLocaleString()}/mo saved</span>
        </div>

        {/* Founder Score Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/30 text-indigo-300 text-xs font-mono">
          <TrendingUp size={13} className="text-[#5E6AD2]" />
          <span>Score: {profile.founderScore}/100</span>
        </div>

        {/* Quick Save Resource Button */}
        {onOpenSaveResource && (
          <button
            onClick={onOpenSaveResource}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6872D9] text-[#EDEDEF] text-xs font-semibold transition shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3)] cursor-pointer"
            title="Save any URL to Founder Vault"
          >
            <Bookmark size={13} className="text-[#EDEDEF]" />
            <span>+ Save Resource</span>
          </button>
        )}

        {/* Notifications Drawer Toggle */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] bg-white/[0.04] border border-white/10 hover:border-white/20 transition cursor-pointer"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#5E6AD2] text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/20 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#5E6AD2]/20 border border-[#5E6AD2]/40 text-[#EDEDEF] font-mono font-bold text-xs flex items-center justify-center">
              {userInitials || 'F'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-[#EDEDEF] leading-tight truncate max-w-[100px] font-sans">
                {userDisplayName}
              </span>
              <span className="text-[10px] text-[#8A8F98] font-mono leading-none">
                {isDemo ? 'Demo Mode' : 'Verified'}
              </span>
            </div>
            <ChevronDown size={13} className="text-[#8A8F98] hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-[#0a0a0c] rounded-xl border border-white/10 py-2 z-50 text-xs font-sans shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              {/* Account Info Header */}
              <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[#EDEDEF] text-sm truncate">{userDisplayName}</span>
                  {isDemo ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      SANDBOX
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                      <ShieldCheck size={10} />
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="text-[#8A8F98] text-[11px] truncate font-mono">{userEmail}</div>
                <div className="text-[#8A8F98] text-[10px] mt-1 flex items-center gap-1 font-mono">
                  <Building2 size={11} className="text-[#8A8F98]" />
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
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#EDEDEF] font-medium hover:bg-white/[0.06] transition cursor-pointer"
                    >
                      <UserIcon size={14} className="text-[#5E6AD2]" />
                      <span>Curated Founder Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#EDEDEF] hover:bg-white/[0.06] transition cursor-pointer"
                    >
                      <Settings size={14} className="text-[#8A8F98]" />
                      <span>Startup Settings & Calibration</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('onboarding');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-indigo-300 font-medium hover:bg-white/[0.06] transition cursor-pointer font-mono text-xs"
                    >
                      <Sparkles size={14} className="text-[#5E6AD2]" />
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
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#5E6AD2] font-medium hover:bg-white/[0.06] transition cursor-pointer font-mono text-xs"
                  >
                    <Sparkles size={14} className="text-[#5E6AD2]" />
                    <span>Create Real Account</span>
                  </button>
                )}
              </div>

              {/* Sign Out / Exit */}
              <div className="pt-1 border-t border-white/[0.06]">
                {onLogout && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-rose-400 hover:bg-rose-500/10 transition font-medium cursor-pointer"
                  >
                    <LogOut size={14} className="text-rose-400" />
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


