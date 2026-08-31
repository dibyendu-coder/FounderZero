import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Copy,
  Check,
  Bookmark,
  FileText,
  Target,
  FlaskConical,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  CopilotMessage,
  CopilotActionProposal,
  CopilotDiffData,
  CopilotPermissionRequestData
} from '../../types';
import { CopilotThinking } from './CopilotThinking';
import { CopilotToolCall } from './CopilotToolCall';
import { CopilotTodoList } from './CopilotTodoList';
import { CopilotDiffView } from './CopilotDiffView';
import { CopilotPermissionRequest } from './CopilotPermissionRequest';
import { ActionProposalCard } from './ActionProposalCard';
import { EvidenceBreakdownAccordion } from './EvidenceBreakdownAccordion';
import { SourcesBar } from './SourcesBar';

interface CopilotMessageItemProps {
  message: CopilotMessage;
  conversationId: string;
  onConfirmAction: (proposal: CopilotActionProposal) => Promise<boolean>;
  onAcceptDiff?: (diff: CopilotDiffData) => void;
  onRejectDiff?: (diff: CopilotDiffData) => void;
  onAllowPermission?: (permission: CopilotPermissionRequestData) => void;
  onDenyPermission?: (permission: CopilotPermissionRequestData) => void;
  onNavigate: (route: string) => void;
}

export const CopilotMessageItem: React.FC<CopilotMessageItemProps> = ({
  message,
  conversationId,
  onConfirmAction,
  onAcceptDiff,
  onRejectDiff,
  onAllowPermission,
  onDenyPermission,
  onNavigate
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. User Message Layout
  if (message.role === 'user') {
    return (
      <div id={`msg-${message.id}`} className="flex justify-end my-4 group">
        <div className="max-w-[85%] sm:max-w-[75%] bg-slate-900 text-slate-100 rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs space-y-1">
          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {message.content}
          </div>
          <div className="flex items-center justify-end gap-2 pt-0.5 text-[10px] text-slate-400 font-mono">
            {message.mode && message.mode !== 'default' && (
              <span className="uppercase tracking-wider text-blue-400 font-semibold">
                /{message.mode}
              </span>
            )}
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. System Message Layout
  if (message.role === 'system') {
    return (
      <div id={`msg-${message.id}`} className="flex justify-center my-3">
        <div className="bg-slate-100 text-slate-600 rounded-full px-3.5 py-1 text-[11px] font-mono border border-slate-200">
          {message.content}
        </div>
      </div>
    );
  }

  // 3. Assistant / Copilot Response Layout
  return (
    <div id={`msg-${message.id}`} className="my-5 space-y-3 font-sans group">
      {/* Assistant Card Container */}
      <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
              <Sparkles size={13} />
            </div>
            <span className="text-xs font-bold text-slate-900 font-mono">Founder Copilot</span>
            <span className="text-[10px] font-mono text-slate-400">•</span>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-100">
              Evidence-First
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Thinking State */}
        {message.thinkingSteps && message.thinkingSteps.length > 0 && (
          <CopilotThinking steps={message.thinkingSteps} />
        )}

        {/* Tool Calls Execution Feed */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1">
            {message.toolCalls.map(tool => (
              <CopilotToolCall key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Todo List / Execution Milestones */}
        {message.todoList && message.todoList.length > 0 && (
          <CopilotTodoList items={message.todoList} />
        )}

        {/* Insufficient Evidence Warning Banner */}
        {message.insufficientEvidenceWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Low Data Confidence</strong>: More real-world telemetry (customer interviews, analytics metrics) is recommended before committing significant capital or pivoting.
            </div>
          </div>
        )}

        {/* Retrieved Context Summary */}
        {message.retrievedContextSummary && message.retrievedContextSummary.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Context in scope:</span>
            {message.retrievedContextSummary.map((c, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                {c.label}
              </span>
            ))}
          </div>
        )}

        {/* Rich Markdown Body */}
        <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed text-xs sm:text-sm font-sans space-y-2">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Proposed Diff View (if AI proposed startup profile changes) */}
        {message.diffData && (
          <CopilotDiffView
            diff={message.diffData}
            onAccept={onAcceptDiff || (() => {})}
            onReject={onRejectDiff || (() => {})}
          />
        )}

        {/* Permission Request Card (if database mutation requires authorization) */}
        {message.permissionRequest && (
          <CopilotPermissionRequest
            permission={message.permissionRequest}
            onAllow={onAllowPermission || (() => {})}
            onDeny={onDenyPermission || (() => {})}
          />
        )}

        {/* Sources / Citations Bar */}
        {message.sources && message.sources.length > 0 && (
          <SourcesBar sources={message.sources} onNavigate={onNavigate} />
        )}

        {/* Evidence Breakdown Accordion */}
        {message.evidenceBreakdown && (
          <EvidenceBreakdownAccordion evidence={message.evidenceBreakdown} />
        )}

        {/* Action Proposal Card (Mission / Experiment / Notepad) */}
        {message.actionProposal && (
          <ActionProposalCard
            proposal={message.actionProposal}
            conversationId={conversationId}
            messageId={message.id}
            onConfirm={onConfirmAction}
            onNavigate={onNavigate}
          />
        )}

        {/* Interactive Message Actions Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-[11px] font-mono transition cursor-pointer"
              title="Copy message text"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                feedback === 'up' ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
              title="Helpful insight"
            >
              <ThumbsUp size={12} />
            </button>
            <button
              type="button"
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                feedback === 'down' ? 'bg-rose-50 text-rose-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
              title="Unhelpful"
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
