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
    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 mr-1">
        Sources:
      </span>
      {sources.map((src, idx) => {
        const Icon = getSourceIcon(src.type);
        return (
          <button
            key={idx}
            onClick={() => handleClick(src)}
            title={src.subtitle || src.title}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 transition text-[11px] font-medium cursor-pointer group"
          >
            <Icon size={11} className="text-slate-500 group-hover:text-blue-600 shrink-0" />
            <span className="truncate max-w-[170px]">{src.title}</span>
            {src.value && (
              <span className="font-mono text-[10px] font-bold text-slate-900 group-hover:text-blue-800 ml-0.5">
                ({src.value})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
