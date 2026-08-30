import React, { useState, useEffect } from 'react';
import { Search, X, Compass, FlaskConical, Users, CheckSquare, ArrowRight, Sparkles, BookOpen, PenLine } from 'lucide-react';
import { AppState } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  navigate: (route: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  state,
  navigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedResources = q
    ? (state.resources || []).filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q)) ||
          r.subcategory.toLowerCase().includes(q)
      ).slice(0, 3)
    : (state.resources || []).slice(0, 2);

  const matchedNotes = q
    ? (state.notes || [])
        .filter(
          n =>
            !n.isTrash &&
            (n.title.toLowerCase().includes(q) ||
              n.collection.toLowerCase().includes(q) ||
              (n.tags || []).some(t => t.toLowerCase().includes(q)) ||
              (n.blocks || []).some(b => (b.content || '').toLowerCase().includes(q)))
        )
        .slice(0, 3)
    : (state.notes || []).filter(n => !n.isTrash).slice(0, 2);

  const matchedCopilot = q
    ? (state.copilotConversations || []).filter(
        c => (c.title || '').toLowerCase().includes(q) || (c.lastMessagePreview || '').toLowerCase().includes(q)
      ).slice(0, 2)
    : [];

  const matchedMissions = q ? state.missions.filter(m => m.title.toLowerCase().includes(q) || m.objective.toLowerCase().includes(q)) : state.missions.slice(0, 2);
  const matchedExperiments = q ? state.experiments.filter(e => e.title.toLowerCase().includes(q) || e.hypothesis.toLowerCase().includes(q)) : state.experiments.slice(0, 2);
  const matchedFeedback = q ? state.customerFeedback.filter(f => f.content.toLowerCase().includes(q) || f.customerName.toLowerCase().includes(q) || f.tags.some(t => t.toLowerCase().includes(q))) : state.customerFeedback.slice(0, 2);
  const matchedActions = q ? state.nextActions.filter(a => a.title.toLowerCase().includes(q) || a.relatedBottleneck.toLowerCase().includes(q)) : state.nextActions.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <Search size={18} className="text-[#0052FF]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search missions, experiments, feedback, actions..."
            className="w-full text-sm font-medium outline-hidden bg-transparent text-slate-900 placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-5 text-xs">
          {/* Ask Copilot Quick Option */}
          {q && (
            <div
              onClick={() => {
                navigate('copilot');
                onClose();
              }}
              className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 flex items-center justify-between cursor-pointer group transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0052FF] text-white flex items-center justify-center shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                    <span>Ask Founder Copilot:</span>
                    <span className="text-blue-700 italic">"{query}"</span>
                  </div>
                  <div className="text-blue-600/80 text-[11px] mt-0.5">
                    Query startup telemetry, customer feedback, notes & playbooks
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-[#0052FF] group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          {/* Copilot Conversations */}
          {matchedCopilot.length > 0 && (
            <div>
              <div className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-600" />
                <span>Founder Copilot Conversations</span>
              </div>
              <div className="space-y-1.5">
                {matchedCopilot.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { navigate('copilot'); onClose(); }}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {c.title}
                      </div>
                      {c.lastMessagePreview && (
                        <div className="text-slate-500 text-xs truncate max-w-md mt-0.5">
                          {c.lastMessagePreview}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Founder Notes */}
          {matchedNotes.length > 0 && (
            <div>
              <div className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <PenLine size={13} className="text-blue-600" />
                <span>Founder Notepad</span>
              </div>
              <div className="space-y-1.5">
                {matchedNotes.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { navigate('notepad'); onClose(); }}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>{n.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-700">
                          {n.collection}
                        </span>
                      </div>
                      <div className="text-slate-500 text-xs truncate max-w-md mt-0.5">
                        {(n.blocks || []).map(b => b.content).filter(Boolean).join(' ').slice(0, 100) || 'Empty note'}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {matchedResources.length > 0 && (
            <div>
              <div className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={13} className="text-purple-600" />
                <span>Zero-Budget Resources & Agents</span>
              </div>
              <div className="space-y-1.5">
                {matchedResources.map(r => (
                  <div
                    key={r.id}
                    onClick={() => { navigate('resources'); onClose(); }}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-purple-600 transition-colors flex items-center gap-2">
                        <span>{r.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-700">
                          {r.subcategory}
                        </span>
                      </div>
                      <div className="text-slate-500 text-xs truncate max-w-md mt-0.5">{r.description}</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {matchedActions.length > 0 && (
            <div>
              <div className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare size={13} className="text-[#0052FF]" />
                <span>Next Actions</span>
              </div>
              <div className="space-y-1.5">
                {matchedActions.map(a => (
                  <div
                    key={a.id}
                    onClick={() => { navigate('actions'); onClose(); }}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-[#0052FF] transition-colors">{a.title}</div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">{a.relatedBottleneck} • <span className="font-semibold text-blue-600">{a.priority}</span></div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-[#0052FF] group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missions */}
          {matchedMissions.length > 0 && (
            <div>
              <div className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass size={13} className="text-[#0052FF]" />
                <span>Missions</span>
              </div>
              <div className="space-y-1.5">
                {matchedMissions.map(m => (
                  <div
                    key={m.id}
                    onClick={() => { navigate('missions'); onClose(); }}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-[#0052FF] transition-colors">{m.title}</div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">{m.category} • {m.estimatedTime}</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-[#0052FF] group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experiments */}
          {matchedExperiments.length > 0 && (
            <div>
              <div className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FlaskConical size={13} className="text-[#0052FF]" />
                <span>Experiments</span>
              </div>
              <div className="space-y-1.5">
                {matchedExperiments.map(e => (
                  <div
                    key={e.id}
                    onClick={() => { navigate('experiments'); onClose(); }}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-[#0052FF] transition-colors">{e.title}</div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">{e.status} • Metric: {e.metric}</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-[#0052FF] group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Feedback */}
          {matchedFeedback.length > 0 && (
            <div>
              <div className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users size={13} className="text-[#0052FF]" />
                <span>Customer Feedback</span>
              </div>
              <div className="space-y-1.5">
                {matchedFeedback.map(f => (
                  <div
                    key={f.id}
                    onClick={() => { navigate('customers'); onClose(); }}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-[#0052FF] transition-colors">{f.customerName} ({f.type})</div>
                      <div className="text-slate-500 text-xs truncate max-w-md mt-0.5">"{f.content}"</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-[#0052FF] group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center font-mono text-[11px] text-slate-500 flex items-center justify-between px-4">
          <span>Navigate using search or shortcuts</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-700">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
