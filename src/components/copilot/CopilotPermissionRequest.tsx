import React, { useState } from 'react';
import { CopilotPermissionRequestData } from '../../types';
import { ClaudePermission } from '../brainless/claude/claude-permission';

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

  const options = [
    "Yes, authorize database write operation",
    "Yes, and auto-authorize similar actions this session",
    "No, cancel operation and ask Copilot to modify proposal",
  ];

  const handleChoose = (idx: number) => {
    if (idx === 0 || idx === 1) {
      setStatus('allowed');
      onAllow({ ...permission, status: 'allowed' });
    } else {
      setStatus('denied');
      onDeny({ ...permission, status: 'denied' });
    }
  };

  return (
    <div className="my-3">
      <ClaudePermission
        title={permission.title || "Authorization Request"}
        command={`${permission.actionType} -> ${permission.impactDescription || 'Modify startup state'}`}
        question="Do you want to proceed with this database action?"
        options={status === 'pending' ? options : [status === 'allowed' ? "Authorized ✓" : "Denied ✕"]}
        defaultSelected={0}
        onChoose={handleChoose}
      />
    </div>
  );
};

