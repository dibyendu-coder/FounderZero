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
    <header className="sticky top-0 z-20 bg-[#000000]/90 backdrop-blur-md border-b border-[#292d30] px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-[6px] text-[#a1a4a5] hover:text-[#ffffff] hover:bg-[#0b0e14] transition"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-medium text-[#ffffff] font-sans tracking-tight leading-none flex items-center gap-2">
            <span>{currentInfo.title}</span>
            {isDemo && (
              <span className="px-2 py-0.5 rounded-[6px] bg-[#000000] text-[#ffca16] text-[10px] font-commit border border-[#292d30]">
                SANDBOX DEMO
              </span>
            )}
          </h1>
          <p className="text-xs text-[#a1a4a5] font-sans hidden sm:block mt-1">
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#000000] border border-[#292d30] hover:border-[#ffffff] text-[#f0f0f0] text-xs font-commit transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#9281f7]" />
            <span>{profile.stage}</span>
            <ChevronDown size={13} className="text-[#a1a4a5]" />
          </button>

          {stageMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#000000] rounded-[16px] border border-[#292d30] py-2 z-40 text-xs font-commit shadow-2xl">
              <div className="px-3.5 py-1.5 font-medium text-[#a1a4a5] text-[10px] uppercase font-commit tracking-wider border-b border-[#292d30] mb-1">
                CHANGE STARTUP STAGE
              </div>
              {stages.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onUpdateStage(s);
                    setStageMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#0b0e14] transition-colors font-medium cursor-pointer ${
                    profile.stage === s ? 'text-[#9281f7] bg-[#0b0e14]' : 'text-[#f0f0f0]'
                  }`}
                >
                  <span>{s}</span>
                  {profile.stage === s && <CheckCircle2 size={14} className="text-[#9281f7]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Savings Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#000000] border border-[#292d30] text-[#3ad389] text-xs font-commit">
          <DollarSign size={13} className="text-[#3ad389]" />
          <span>₹{profile.monthlySavings.toLocaleString()}/mo saved</span>
        </div>

        {/* Founder Score Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#000000] border border-[#292d30] text-[#70b8ff] text-xs font-commit">
          <TrendingUp size={13} className="text-[#70b8ff]" />
          <span>Score: {profile.founderScore}/100</span>
        </div>

        {/* Quick Save Resource Button */}
        {onOpenSaveResource && (
          <button
            onClick={onOpenSaveResource}
            className="btn-resend-ghost hidden sm:flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Save any URL to Founder Vault"
          >
            <Bookmark size={13} className="text-[#9281f7]" />
            <span>+ Save Resource</span>
          </button>
        )}

        {/* Notifications Drawer Toggle */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-[6px] text-[#a1a4a5] hover:text-[#ffffff] bg-[#000000] border border-[#292d30] hover:border-[#ffffff] transition cursor-pointer"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#9281f7] text-[#000000] text-[10px] font-commit font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-[6px] bg-[#000000] border border-[#292d30] hover:border-[#ffffff] transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-[6px] bg-[#000000] border border-[#292d30] text-[#ffffff] font-commit font-semibold text-xs flex items-center justify-center">
              {userInitials || 'F'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-[#ffffff] leading-tight truncate max-w-[100px] font-sans">
                {userDisplayName}
              </span>
              <span className="text-[10px] text-[#a1a4a5] font-commit leading-none">
                {isDemo ? 'Demo Mode' : 'Verified'}
              </span>
            </div>
            <ChevronDown size={13} className="text-[#a1a4a5] hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-[#000000] rounded-[16px] border border-[#292d30] py-2 z-50 text-xs font-sans shadow-2xl"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              {/* Account Info Header */}
              <div className="px-4 py-3 border-b border-[#292d30] bg-[#0b0e14]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[#ffffff] text-sm truncate">{userDisplayName}</span>
                  {isDemo ? (
                    <span className="px-1.5 py-0.5 rounded-[6px] text-[9px] font-commit bg-[#000000] text-[#ffca16] border border-[#292d30]">
                      SANDBOX
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-[6px] text-[9px] font-commit bg-[#000000] text-[#3ad389] border border-[#292d30] flex items-center gap-0.5">
                      <ShieldCheck size={10} />
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="text-[#a1a4a5] text-[11px] truncate font-commit">{userEmail}</div>
                <div className="text-[#a1a4a5] text-[10px] mt-1 flex items-center gap-1 font-commit">
                  <Building2 size={11} className="text-[#a1a4a5]" />
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
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#ffffff] font-medium hover:bg-[#0b0e14] transition cursor-pointer"
                    >
                      <UserIcon size={14} className="text-[#9281f7]" />
                      <span>Curated Founder Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#f0f0f0] hover:bg-[#0b0e14] transition cursor-pointer"
                    >
                      <Settings size={14} className="text-[#a1a4a5]" />
                      <span>Startup Settings & Calibration</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('onboarding');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#70b8ff] font-medium hover:bg-[#0b0e14] transition cursor-pointer font-commit text-xs"
                    >
                      <Sparkles size={14} className="text-[#70b8ff]" />
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
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#9281f7] font-medium hover:bg-[#0b0e14] transition cursor-pointer font-commit text-xs"
                  >
                    <Sparkles size={14} className="text-[#9281f7]" />
                    <span>Create Real Account</span>
                  </button>
                )}
              </div>

              {/* Sign Out / Exit */}
              <div className="pt-1 border-t border-[#292d30]">
                {onLogout && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-[#ff9592] hover:bg-[#0b0e14] transition font-medium cursor-pointer"
                  >
                    <LogOut size={14} className="text-[#ff9592]" />
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


