import React from 'react';
import { X, Bell, CheckCheck } from 'lucide-react';
import { AppState } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onMarkAllRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  state,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-end p-4 md:p-6">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[85vh] mt-12 font-sans animate-in slide-in-from-right-4 duration-150">
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Bell size={15} />
            </div>
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-3.5 space-y-2.5">
          {state.notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              No recent notifications
            </div>
          ) : (
            state.notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  n.read
                    ? 'bg-white border-slate-100 text-slate-500'
                    : 'bg-blue-50/50 border-blue-200/80 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
