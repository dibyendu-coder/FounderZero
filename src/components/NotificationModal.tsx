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
    <div className="fixed inset-0 z-50 bg-[#050506]/85 backdrop-blur-xl flex items-start justify-end p-4 md:p-6">
      <div className="bg-[#0a0a0c] w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh] mt-12 font-sans shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
        <div className="p-4 bg-[#0a0a0c] text-[#EDEDEF] border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border border-[#5E6AD2]/30 text-[#5E6AD2] bg-[#5E6AD2]/10">
              <Bell size={15} />
            </div>
            <h3 className="font-semibold text-sm tracking-tight">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-mono text-[#8A8F98] hover:text-[#EDEDEF] flex items-center gap-1 border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-3.5 space-y-2.5 bg-[#0a0a0c]">
          {state.notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A8F98] font-mono">
              No recent notifications
            </div>
          ) : (
            state.notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  n.read
                    ? 'bg-white/[0.02] border-white/[0.05] text-[#8A8F98]'
                    : 'bg-white/[0.05] border-[#5E6AD2]/30 text-[#EDEDEF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-[#EDEDEF]">{n.title}</span>
                  <span className="text-[10px] font-mono text-[#8A8F98]">{n.timestamp}</span>
                </div>
                <p className="text-xs text-[#8A8F98] leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
