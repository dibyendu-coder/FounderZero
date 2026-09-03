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
    <div className="fixed inset-0 z-50 bg-[#000000]/85 backdrop-blur-md flex items-start justify-end p-4 md:p-6">
      <div className="bg-[#000000] w-full max-w-sm rounded-[16px] border border-[#292d30] overflow-hidden flex flex-col max-h-[85vh] mt-12 font-sans shadow-2xl">
        <div className="p-4 bg-[#000000] text-[#ffffff] border-b border-[#292d30] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[6px] border border-[#292d30] text-[#9281f7]">
              <Bell size={15} />
            </div>
            <h3 className="font-medium text-sm">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-commit text-[#a1a4a5] hover:text-[#ffffff] flex items-center gap-1 border border-[#292d30] hover:border-[#ffffff] px-2.5 py-1 rounded-[6px] transition cursor-pointer"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-[6px] text-[#a1a4a5] hover:text-[#ffffff] hover:bg-[#0b0e14] transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-3.5 space-y-2.5 bg-[#000000]">
          {state.notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#a1a4a5] font-commit">
              No recent notifications
            </div>
          ) : (
            state.notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-[12px] border transition-all ${
                  n.read
                    ? 'bg-[#000000] border-[#292d30] text-[#a1a4a5]'
                    : 'bg-[#0b0e14] border-[#292d30] text-[#f0f0f0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-[#ffffff]">{n.title}</span>
                  <span className="text-[10px] font-commit text-[#a1a4a5]">{n.timestamp}</span>
                </div>
                <p className="text-xs text-[#a1a4a5] leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
