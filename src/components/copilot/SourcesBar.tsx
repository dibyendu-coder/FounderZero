import React from 'react';
import {
  Activity,
  BarChart3,
  Users,
  FlaskConical,
  Compass,
  PenLine,
  Bookmark,
  BookOpen,
  User,
  ShieldAlert,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { CopilotSourceReference, CopilotSourceType } from '../../types';

interface SourcesBarProps {
  sources?: CopilotSourceReference[];
  onNavigate?: (route: string) => void;
}

export const SourcesBar: React.FC<SourcesBarProps> = ({ sources, onNavigate }) => {
  if (!sources || sources.length === 0) return null;

  const getSourceIcon = (type: CopilotSourceType) => {
    switch (type) {
      case 'metric':
        return BarChart3;
      case 'feedback':
        return Users;
      case 'note':
        return PenLine;
      case 'vault':
        return Bookmark;
      case 'resource':
        return BookOpen;
      case 'experiment':
        return FlaskConical;
      case 'mission':
        return Compass;
      case 'health':
        return Activity;
      case 'profile':
        return User;
      case 'reality_check':
        return ShieldAlert;
      case 'action':
        return CheckSquare;
      default:
        return Sparkles;
    }
  };

  const handleClick = (src: CopilotSourceReference) => {
    if (onNavigate && src.route) {
      onNavigate(src.route);
    }
  };

  return (
    <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-1.5 text-xs font-sans text-[#EDEDEF]">
      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8A8F98] mr-1">
        Sources:
      </span>
      {sources.map((src, idx) => {
        const Icon = getSourceIcon(src.type);
        return (
          <button
            key={idx}
            onClick={() => handleClick(src)}
            title={src.subtitle || src.title}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[#EDEDEF] hover:text-indigo-300 border border-white/10 hover:border-[#5E6AD2]/50 transition text-[11px] font-medium cursor-pointer group"
          >
            <Icon size={11} className="text-[#8A8F98] group-hover:text-indigo-300 shrink-0" />
            <span className="truncate max-w-[170px]">{src.title}</span>
            {src.value && (
              <span className="font-mono text-[10px] font-bold text-[#EDEDEF] group-hover:text-indigo-200 ml-0.5">
                ({src.value})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
