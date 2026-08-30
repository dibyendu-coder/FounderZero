import React, { useState } from 'react';
import {
  X,
  Link2,
  Compass,
  FlaskConical,
  BarChart3,
  Users,
  Bookmark,
  Target,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { AppState, NoteConnection } from '../../types';

interface NoteConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: NoteConnection[];
  onUpdateConnections: (connections: NoteConnection[]) => void;
  state: AppState;
  noteTitle: string;
}

export const NoteConnectionsModal: React.FC<NoteConnectionsModalProps> = ({
  isOpen,
  onClose,
  connections,
  onUpdateConnections,
  state,
  noteTitle
}) => {
  const [activeTab, setActiveTab] = useState<'mission' | 'experiment' | 'metric' | 'customer' | 'resource' | 'goal'>('mission');

  if (!isOpen) return null;

  const handleAdd = (connection: NoteConnection) => {
    const exists = connections.some(
      c => c.entityType === connection.entityType && c.entityId === connection.entityId
    );
    if (!exists) {
      onUpdateConnections([...connections, connection]);
    }
  };

  const handleRemove = (entityType: string, entityId: string) => {
    onUpdateConnections(
      connections.filter(c => !(c.entityType === entityType && c.entityId === entityId))
    );
  };

  const isConnected = (type: string, id: string) => {
    return connections.some(c => c.entityType === type && c.entityId === id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Link2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Connect Note to Workspace</h2>
              <p className="text-xs text-slate-500 truncate max-w-md">
                Linking &quot;{noteTitle || 'Untitled Note'}&quot; across FounderZero
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Connections Summary */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500 mb-2">
            Active Connections ({connections.length})
          </div>
          {connections.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No workspace entities linked yet. Select items below to link.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {connections.map((c, idx) => (
                <span
                  key={`${c.entityType}-${c.entityId}-${idx}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                >
                  <span className="text-[10px] font-mono uppercase px-1 rounded bg-slate-100 text-slate-500 font-bold">
                    {c.entityType}
                  </span>
                  <span className="truncate max-w-[180px]">{c.entityTitle}</span>
                  <button
                    onClick={() => handleRemove(c.entityType, c.entityId)}
                    className="text-slate-400 hover:text-rose-500 transition ml-0.5 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-1 bg-white pt-2 overflow-x-auto">
          {[
            { id: 'mission', label: 'Missions', icon: Compass, count: state.missions?.length || 0 },
            { id: 'experiment', label: 'Experiments', icon: FlaskConical, count: state.experiments?.length || 0 },
            { id: 'metric', label: 'Metrics', icon: BarChart3, count: state.metrics?.length || 0 },
            { id: 'customer', label: 'Feedback', icon: Users, count: state.customerFeedback?.length || 0 },
            { id: 'resource', label: 'Vault', icon: Bookmark, count: state.savedResources?.length || 0 },
            { id: 'goal', label: 'North Star Goal', icon: Target, count: 1 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1">
          {activeTab === 'mission' && (
            <div className="space-y-2">
              {(state.missions || []).map(m => {
                const connected = isConnected('mission', m.id);
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{m.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {m.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.objective}</p>
                    </div>
                    {connected ? (
                      <button
                        onClick={() => handleRemove('mission', m.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Linked</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleAdd({
                            entityType: 'mission',
                            entityId: m.id,
                            entityTitle: m.title,
                            entitySubtitle: m.category
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Link</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'experiment' && (
            <div className="space-y-2">
              {(state.experiments || []).map(exp => {
                const connected = isConnected('experiment', exp.id);
                return (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{exp.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">
                          {exp.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{exp.hypothesis}</p>
                    </div>
                    {connected ? (
                      <button
                        onClick={() => handleRemove('experiment', exp.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Linked</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleAdd({
                            entityType: 'experiment',
                            entityId: exp.id,
                            entityTitle: exp.title,
                            entitySubtitle: `Status: ${exp.status}`
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Link</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'metric' && (
            <div className="space-y-2">
              {(state.metrics || []).map(met => {
                const connected = isConnected('metric', met.id);
                return (
                  <div
                    key={met.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{met.name}</span>
                        <span className="text-xs font-mono font-bold text-blue-600">
                          {met.currentValue} {met.unit}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{met.whyItMatters}</p>
                    </div>
                    {connected ? (
                      <button
                        onClick={() => handleRemove('metric', met.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Linked</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleAdd({
                            entityType: 'metric',
                            entityId: met.id,
                            entityTitle: met.name,
                            entitySubtitle: `${met.currentValue} ${met.unit}`
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Link</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'customer' && (
            <div className="space-y-2">
              {(state.customerFeedback || []).map(f => {
                const connected = isConnected('customer', f.id);
                return (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{f.customerName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                          {f.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{f.content}</p>
                    </div>
                    {connected ? (
                      <button
                        onClick={() => handleRemove('customer', f.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Linked</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleAdd({
                            entityType: 'customer',
                            entityId: f.id,
                            entityTitle: `Feedback: ${f.customerName}`,
                            entitySubtitle: f.keyPainPoint || f.type
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Link</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'resource' && (
            <div className="space-y-2">
              {(state.savedResources || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic p-4 text-center">No saved vault resources yet.</p>
              ) : (
                (state.savedResources || []).map(r => {
                  const connected = isConnected('resource', r.id);
                  return (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 flex items-center justify-between gap-3 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{r.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {r.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>
                      </div>
                      {connected ? (
                        <button
                          onClick={() => handleRemove('resource', r.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Check size={13} />
                          <span>Linked</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleAdd({
                              entityType: 'resource',
                              entityId: r.id,
                              entityTitle: r.title,
                              entitySubtitle: r.source || r.category
                            })
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Link</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'goal' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">90-Day North Star Target</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium bg-white p-3 rounded-lg border border-slate-200">
                  {state.profile?.goal90Days || 'Reach ₹25,000 MRR & 300 active users'}
                </p>
              </div>
              <div className="flex justify-end">
                {isConnected('goal', 'north-star') ? (
                  <button
                    onClick={() => handleRemove('goal', 'north-star')}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Linked to North Star Goal</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleAdd({
                        entityType: 'goal',
                        entityId: 'north-star',
                        entityTitle: state.profile?.goal90Days || '90-Day Goal',
                        entitySubtitle: 'North Star Objective'
                      })
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Link to North Star</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Connected notes automatically sync with AI knowledge context.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
