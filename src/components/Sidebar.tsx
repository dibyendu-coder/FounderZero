import React from 'react';
import {
  LayoutDashboard,
  Activity,
  CheckSquare,
  Map,
  Compass,
  FlaskConical,
  Layers,
  ShieldAlert,
  Users,
  BarChart3,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  Sparkles,
  BookOpen,
  Bookmark,
  User as UserIcon,
  PenLine,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { AppState, StartupProfile, User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  state?: AppState;
  profile?: StartupProfile;
  currentUser?: User | null;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  onOpenSearch: () => void;
  onResetDemo?: () => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  isDemo?: boolean;
  mobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  state,
  profile: externalProfile,
  currentUser,
  collapsed: externalCollapsed,
  setCollapsed: externalSetCollapsed,
  onOpenSearch,
  onResetDemo,
  onLogout,
  onOpenAuth,
  isDemo,
  mobileMenuOpen,
  onCloseMobileMenu
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const { isDark, toggleTheme } = useTheme();
  const toggleCollapsed = () => {
    if (externalSetCollapsed) {
      externalSetCollapsed(!isCollapsed);
    } else {
      setInternalCollapsed(!isCollapsed);
    }
  };

  const activeProfile = externalProfile || state?.profile || {
    id: 'demo',
    name: 'PulseBoard',
    description: '',
    category: 'SaaS',
    targetCustomer: '',
    problem: '',
    stage: 'Validating' as const,
    teamSize: 1,
    founderSkills: [],
    monthlyBudget: 0,
    availableHoursPerWeek: 20,
    currentUsers: 140,
    monthlyRevenue: 0,
    biggestUncertainty: "Users don't stay" as const,
    goal90Days: 'Reach 500 active users',
    founderName: 'Alex Rivera',
    founderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    createdAt: new Date().toISOString(),
    founderScore: 78,
    monthlySavings: 12400
  };

  const savedCount = state?.savedResources?.length || 0;

  const menuItems = [
    { route: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { route: 'copilot', label: 'Founder Copilot', icon: Sparkles },
    { route: 'notepad', label: 'Notepad', icon: PenLine },
    { route: 'profile', label: 'Founder Profile', icon: UserIcon },
    { route: 'vault', label: 'Founder Vault', icon: Bookmark, badge: savedCount > 0 ? savedCount : undefined },
    { route: 'resources', label: 'Resource Center', icon: BookOpen },
    { route: 'health', label: 'Startup Health', icon: Activity },
    { route: 'actions', label: 'Next Actions', icon: CheckSquare },
    { route: 'roadmap', label: 'Growth Roadmap', icon: Map },
    { route: 'missions', label: 'Founder Missions', icon: Compass },
    { route: 'experiments', label: 'Experiment Lab', icon: FlaskConical },
    { route: 'stack', label: 'Zero-Budget Stack', icon: Layers },
    { route: 'reality-check', label: 'Reality Check', icon: ShieldAlert },
    { route: 'customers', label: 'Customer Insights', icon: Users },
    { route: 'metrics', label: 'Metrics & Unit Econ', icon: BarChart3 },
    { route: 'insights', label: 'Insights Feed', icon: Lightbulb },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#000000] text-[#f0f0f0] z-40 transition-all duration-300 flex flex-col justify-between border-r border-[#292d30] shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#292d30]">
            <div
              onClick={() => {
                navigate('dashboard');
                if (onCloseMobileMenu) onCloseMobileMenu();
              }}
              className="flex items-center gap-3 cursor-pointer group overflow-hidden"
            >
              <div className="w-8 h-8 rounded-[6px] bg-[#000000] border border-[#292d30] flex items-center justify-center text-[#ffffff] font-commit font-bold text-sm shrink-0 group-hover:border-[#ffffff] transition-colors">
                0
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#ffffff] text-base tracking-tight font-sans">
                      FounderZero
                    </span>
                    <span className="px-1.5 py-0.2 rounded-[6px] bg-[#000000] border border-[#292d30] text-[#9281f7] text-[10px] font-commit font-medium">
                      OS
                    </span>
                  </div>
                  <span className="text-[11px] text-[#a1a4a5] font-commit truncate">
                    Zero-Budget System
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-1.5 rounded-[6px] text-[#a1a4a5] hover:text-[#ffffff] hover:bg-[#0b0e14] transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Global Search Button */}
          <div className="p-3">
            <button
              onClick={onOpenSearch}
              className={`w-full py-2 bg-[#000000] hover:bg-[#0b0e14] text-[#a1a4a5] hover:text-[#ffffff] rounded-[6px] border border-[#292d30] hover:border-[#ffffff] flex items-center transition-all text-xs font-commit ${
                isCollapsed ? 'justify-center px-2' : 'px-3 justify-between'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-[#9281f7]" />
                {!isCollapsed && <span>Quick search...</span>}
              </div>
              {!isCollapsed && (
                <kbd className="px-1.5 py-0.5 rounded-[6px] bg-[#000000] text-[#a1a4a5] text-[10px] border border-[#292d30] font-commit">
                  ⌘K
                </kbd>
              )}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="px-2.5 py-1 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => {
                    navigate(item.route);
                    if (onCloseMobileMenu) onCloseMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-[6px] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#000000] border border-[#292d30] text-[#ffffff] font-semibold'
                      : 'text-[#a1a4a5] hover:text-[#ffffff] hover:bg-[#0b0e14]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    size={17}
                    className={`${isActive ? 'text-[#9281f7]' : 'text-[#a1a4a5]'} shrink-0`}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate font-sans">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={`px-1.5 py-0.2 text-[10px] font-medium rounded-[6px] font-commit border ${
                          isActive ? 'bg-[#000000] border-[#9281f7] text-[#9281f7]' : 'bg-[#000000] border-[#292d30] text-[#a1a4a5]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Settings */}
        <div className="p-3 border-t border-[#292d30] bg-[#000000] space-y-2">
          {isDemo && !isCollapsed && (
            <div className="p-2.5 rounded-[6px] bg-[#000000] border border-[#292d30] text-[11px] text-[#ffca16] flex items-center justify-between font-commit">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#ffca16]" />
                <span>DEMO MODE</span>
              </div>
              <button
                onClick={onResetDemo}
                className="p-1 hover:bg-[#0b0e14] rounded text-[#a1a4a5] hover:text-[#ffffff] transition"
                title="Reset Demo Data"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          )}

          <div
            onClick={() => {
              navigate('profile');
              if (onCloseMobileMenu) onCloseMobileMenu();
            }}
            className={`flex items-center gap-3 p-2 rounded-[6px] border border-transparent hover:border-[#292d30] hover:bg-[#0b0e14] cursor-pointer transition group ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Open Founder Profile"
          >
            <div className="w-8 h-8 rounded-[6px] bg-[#000000] border border-[#292d30] text-[#ffffff] font-commit font-semibold text-xs flex items-center justify-center shrink-0 group-hover:border-[#ffffff] transition-colors">
              {(currentUser?.name || activeProfile.founderName || 'F')
                .split(' ')
                .map(p => p[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-[#ffffff] group-hover:text-[#9281f7] transition truncate font-sans">
                  {currentUser?.name || activeProfile.founderName || activeProfile.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]"></span>
                  <span className="text-[10px] text-[#a1a4a5] truncate font-commit">
                    {activeProfile.name || 'Startup'}
                  </span>
                </div>
              </div>
            )}
            {!isCollapsed && (
              <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    navigate('settings');
                    if (onCloseMobileMenu) onCloseMobileMenu();
                  }}
                  className="p-1.5 text-[#a1a4a5] hover:text-[#ffffff] hover:bg-[#0b0e14] rounded-[6px] transition"
                  title="Startup Settings"
                >
                  <Settings size={14} />
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                    }}
                    className="p-1.5 text-[#a1a4a5] hover:text-[#ff9592] hover:bg-[#0b0e14] rounded-[6px] transition"
                    title="Sign Out"
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
