import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  FileText,
  Mail,
  BookOpen,
  Code2,
  Lock,
  Layers
} from 'lucide-react';
import { AppState, RecommendedResourceItem, Resource } from '../types';
import {
  calculateFounderLevel,
  calculateResourceRecommendations,
  identifyCurrentBottleneck
} from '../lib/resourceEngine';

interface ResourcesForYouWidgetProps {
  state: AppState;
  onNavigate: (route: string) => void;
  onSelectResource?: (resource: Resource) => void;
  onToggleSave?: (resourceId: string) => void;
}

export const ResourcesForYouWidget: React.FC<ResourcesForYouWidgetProps> = ({
  state,
  onNavigate,
  onSelectResource,
  onToggleSave
}) => {
  const profile = state.profile;
  const resources = state.resources || [];
  const interactions = state.resourceInteractions || [];

  const bottleneck = identifyCurrentBottleneck(profile, state);
  const founderLevel = calculateFounderLevel(profile, state);
  const recommendations = calculateResourceRecommendations(profile, state, resources).slice(0, 3);

  const savedIds = new Set(
    interactions.filter(i => i.interactionType === 'saved').map(i => i.resourceId)
  );

  const getTypeIcon = (type: Resource['resourceType']) => {
    switch (type) {
      case 'coding_agent':
        return <Terminal size={14} className="text-purple-400" />;
      case 'ide':
        return <Code2 size={14} className="text-sky-400" />;
      case 'article':
        return <FileText size={14} className="text-emerald-400" />;
      case 'newsletter':
        return <Mail size={14} className="text-amber-400" />;
      case 'tool':
        return <Zap size={14} className="text-blue-400" />;
      default:
        return <BookOpen size={14} className="text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight font-sans">
                Resource Intelligence Feed
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-medium">
                Level {founderLevel.levelNumber} {founderLevel.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized for your bottleneck:{' '}
              <span className="text-slate-200 font-medium font-mono">{bottleneck.name}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('resources')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors self-start sm:self-auto group"
        >
          <span>Open Resource Center</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {recommendations.map((item) => {
          const res = item.resource;
          const isSaved = savedIds.has(res.id);

          return (
            <div
              key={res.id}
              className="bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/80 hover:border-slate-700/90 rounded-xl p-3.5 transition-all flex flex-col justify-between group cursor-pointer relative"
              onClick={() => {
                if (onSelectResource) {
                  onSelectResource(res);
                } else {
                  onNavigate('resources');
                }
              }}
            >
              <div className="space-y-2">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="p-1 rounded bg-slate-800/80 border border-slate-700/60 shrink-0">
                      {getTypeIcon(res.resourceType)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 truncate uppercase">
                      {res.subcategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {res.isOpenSource && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                        Open Source
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSave) onToggleSave(res.id);
                      }}
                      className={`p-1 rounded hover:bg-slate-800 transition ${
                        isSaved ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save resource'}
                    >
                      <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition line-clamp-1">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>
              </div>

              {/* Bottom "Why You're Seeing This" & Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-2">
                <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
                  <span className="text-blue-400 font-mono font-bold shrink-0">WHY:</span>
                  <span className="line-clamp-2 text-slate-300">{item.whyRecommended}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                  <span className="text-emerald-400 font-semibold truncate">
                    {res.isOpenSource ? '₹0 Forever' : res.isFree ? '100% Free' : 'Free Tier Available'}
                  </span>
                  <span className="text-blue-400 flex items-center gap-1 group-hover:underline">
                    View <ExternalLink size={10} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
