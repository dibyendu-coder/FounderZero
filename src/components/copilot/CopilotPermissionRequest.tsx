import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Target,
  FlaskConical,
  FileText,
  UserCheck,
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { CopilotPermissionRequestData } from '../../types';

interface CopilotPermissionRequestProps {
  permission: CopilotPermissionRequestData;
  onAllow: (permission: CopilotPermissionRequestData) => void;
  onDeny: (permission: CopilotPermissionRequestData) => void;
}

export const CopilotPermissionRequest: React.FC<CopilotPermissionRequestProps> = ({
  permission,
  onAllow,
  onDeny
}) => {
  const [status, setStatus] = useState<'pending' | 'allowed' | 'denied'>(permission.status || 'pending');

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('mission')) return <Target size={15} className="text-rose-400" />;
    if (actionType.includes('experiment')) return <FlaskConical size={15} className="text-teal-400" />;
    if (actionType.includes('note')) return <FileText size={15} className="text-amber-400" />;
    if (actionType.includes('profile')) return <UserCheck size={15} className="text-indigo-300" />;
    if (actionType.includes('delete')) return <Trash2 size={15} className="text-rose-400" />;
    return <ShieldAlert size={15} className="text-[#5E6AD2]" />;
  };

  const handleAllow = () => {
    setStatus('allowed');
    onAllow({ ...permission, status: 'allowed' });
  };

  const handleDeny = () => {
    setStatus('denied');
    onDeny({ ...permission, status: 'denied' });
  };

  return (
    <div
      id={`permission-req-${permission.id}`}
      className="my-3 rounded-xl border border-white/10 bg-[#0a0a0c] overflow-hidden shadow-md text-xs font-sans text-[#EDEDEF]"
    >
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#050506] text-[#EDEDEF] flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#5E6AD2]/20 text-indigo-300">
            <Lock size={12} />
          </div>
          <span className="font-mono text-xs font-bold">Permission Request</span>
          <span className="text-[10px] font-mono text-[#8A8F98]">Founder Authorization</span>
        </div>

        <div>
          {status === 'allowed' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
              <ShieldCheck size={13} />
              <span>Authorized</span>
            </span>
          )}
          {status === 'denied' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8A8F98] font-bold">
              <X size={13} />
              <span>Denied</span>
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 font-sans">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 p-1.5 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
            {getActionIcon(permission.actionType)}
          </div>
          <div className="space-y-0.5 font-sans">
            <h4 className="text-xs font-semibold text-[#EDEDEF]">
              {permission.title}
            </h4>
            <p className="text-[11px] text-[#8A8F98]">
              Founder Copilot wants permission to perform this database write operation.
            </p>
          </div>
        </div>

        {/* Details Table */}
        {permission.details && permission.details.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-1.5 font-mono text-[11px]">
            {permission.details.map((d, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <span className="text-[#8A8F98] shrink-0">{d.label}:</span>
                <span className="text-[#EDEDEF] font-semibold text-right truncate max-w-[280px]">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {permission.impactDescription && (
          <div className="text-[11px] text-indigo-200 bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 rounded-lg p-2.5 font-sans">
            <strong>Impact</strong>: {permission.impactDescription}
          </div>
        )}
      </div>

      {/* Actions */}
      {status === 'pending' && (
        <div className="px-4 py-2.5 bg-[#050506] border-t border-white/[0.06] flex items-center justify-end gap-2 font-sans">
          <button
            type="button"
            onClick={handleDeny}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.06] text-[#8A8F98] hover:text-[#EDEDEF] font-semibold text-xs transition cursor-pointer"
          >
            Deny
          </button>
          <button
            type="button"
            onClick={handleAllow}
            className="px-4 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6872D9] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(94,106,210,0.3)]"
          >
            <Check size={13} strokeWidth={3} />
            <span>Allow & Create</span>
          </button>
        </div>
      )}
    </div>
  );
};
