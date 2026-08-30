import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ExternalLink,
  Bookmark,
  X,
  ArrowRight,
  Clock,
  CheckCircle2,
  FolderHeart,
  ChevronRight
} from 'lucide-react';
import { AppState, UserSavedResource } from '../types';

interface SurfacedItem {
  resource: UserSavedResource;
  reason: string;
  triggerType: 'bottleneck' | 'mission' | 'experiment';
  savedDaysAgo: number;
  triggerContext: string;
}

interface VaultSurfacingBannerProps {
  state?: AppState;
  onNavigateToVault?: () => void;
  onOpenResource?: (resource: UserSavedResource) => void;
  onNavigateToSection?: (section: string) => void;
}

export const VaultSurfacingBanner: React.FC<VaultSurfacingBannerProps> = ({
  state,
  onNavigateToVault,
  onOpenResource
}) => {
  const [surfacedItems, setSurfacedItems] = useState<SurfacedItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSurfaced();
  }, [state?.profile?.biggestUncertainty, state?.savedResources?.length]);

  const fetchSurfaced = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vault/surface-contextual');
      const data = await res.json();
      if (data.success && data.surfaced) {
        setSurfacedItems(data.surfaced);
      }
    } catch (e) {
      console.error('Failed to fetch surfaced vault items:', e);
    } finally {
      setLoading(false);
    }
  };

  const visibleItems = surfacedItems.filter(
    item => !dismissedIds.includes(item.resource.id)
  );

  if (visibleItems.length === 0) return null;

  const current = visibleItems[0];
  const resource = current.resource;

  const handleDismiss = () => {
    setDismissedIds(prev => [...prev, resource.id]);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 text-white p-4 sm:p-5 border border-blue-500/30 shadow-lg mb-6 animate-in fade-in slide-in-from-top-3 duration-200">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={18} className="animate-pulse text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                From Your Founder Vault
              </span>
              <span className="text-xs text-blue-200/80 font-mono">
                Saved {current.savedDaysAgo} {current.savedDaysAgo === 1 ? 'day' : 'days'} ago
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-1.5">
              {resource.title}
              {resource.isOpenSource && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                  Open Source
                </span>
              )}
            </h4>
            <p className="text-xs text-blue-100/90 mt-0.5 max-w-2xl leading-relaxed">
              💡 {current.reason}
            </p>
            {resource.notes && (
              <p className="text-[11px] text-blue-200/70 italic mt-1 bg-black/20 px-2 py-1 rounded-md border border-white/5 inline-block">
                Your note: "{resource.notes}"
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (onOpenResource) onOpenResource(resource);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <span>Open Resource</span>
            <ExternalLink size={13} />
          </a>

          {onNavigateToVault && (
            <button
              onClick={onNavigateToVault}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition"
            >
              <span>View in Vault</span>
              <ChevronRight size={14} />
            </button>
          )}

          <button
            onClick={handleDismiss}
            title="Dismiss for now"
            className="p-1.5 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
