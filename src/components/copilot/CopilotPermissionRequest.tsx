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
    if (actionType.includes('mission')) return <Target size={15} className="text-rose-600" />;
    if (actionType.includes('experiment')) return <FlaskConical size={15} className="text-teal-600" />;
    if (actionType.includes('note')) return <FileText size={15} className="text-amber-600" />;
    if (actionType.includes('profile')) return <UserCheck size={15} className="text-blue-600" />;
    if (actionType.includes('delete')) return <Trash2 size={15} className="text-rose-600" />;
    return <ShieldAlert size={15} className="text-blue-600" />;
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
      className="my-3 rounded-xl border border-slate-300/80 bg-white overflow-hidden shadow-xs text-xs font-sans"
    >
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-blue-400">
            <Lock size={12} />
          </div>
          <span className="font-mono text-xs font-bold">Permission Request</span>
          <span className="text-[10px] font-mono text-slate-400">Founder Authorization</span>
        </div>

        <div>
          {status === 'allowed' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
              <ShieldCheck size={13} />
              <span>Authorized</span>
            </span>
          )}
          {status === 'denied' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 font-bold">
              <X size={13} />
              <span>Denied</span>
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
            {getActionIcon(permission.actionType)}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">
              {permission.title}
            </h4>
            <p className="text-[11px] text-slate-500">
              Founder Copilot wants permission to perform this database write operation.
            </p>
          </div>
        </div>

        {/* Details Table */}
        {permission.details && permission.details.length > 0 && (
          <div className="rounded-lg border border-slate-200/90 bg-slate-50/70 p-3 space-y-1.5 font-mono text-[11px]">
            {permission.details.map((d, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0">{d.label}:</span>
                <span className="text-slate-900 font-semibold text-right truncate max-w-[280px]">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {permission.impactDescription && (
          <div className="text-[11px] text-slate-600 bg-blue-50/60 border border-blue-100 rounded-lg p-2.5">
            <strong>Impact</strong>: {permission.impactDescription}
          </div>
        )}
      </div>

      {/* Actions */}
      {status === 'pending' && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleDeny}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Deny
          </button>
          <button
            type="button"
            onClick={handleAllow}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Check size={13} strokeWidth={3} />
            <span>Allow & Create</span>
          </button>
        </div>
      )}
    </div>
  );
};
