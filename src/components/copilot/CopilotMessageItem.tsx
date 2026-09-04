import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
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
import { ClaudeMessage } from '../brainless/claude/claude-message';

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

  // 1. User Message Layout with ClaudeMessage
  if (message.role === 'user') {
    return (
      <div id={`msg-${message.id}`} className="my-3 font-mono">
        <ClaudeMessage role="user">
          <div className="flex items-baseline justify-between gap-4">
            <span className="break-words font-mono text-[13px]">{message.content}</span>
            {message.mode && message.mode !== 'default' && (
              <span className="uppercase text-[10px] text-[#cd694a] font-bold shrink-0">
                /{message.mode}
              </span>
            )}
          </div>
        </ClaudeMessage>
      </div>
    );
  }

  // 2. System Message Layout
  if (message.role === 'system') {
    return (
      <div id={`msg-${message.id}`} className="flex justify-center my-3 font-mono">
        <div className="bg-white/[0.04] text-[#EDEDEF] rounded px-3 py-1 text-[11px] border border-white/10">
          {message.content}
        </div>
      </div>
    );
  }

  // 3. Assistant / Copilot Response Layout with ClaudeMessage
  return (
    <div id={`msg-${message.id}`} className="my-4 space-y-2 font-mono group text-[#EDEDEF]">
      <ClaudeMessage role="assistant">
        <div className="w-full bg-[#08080a] rounded border border-[#3a3a3e] p-4 sm:p-5 space-y-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#3a3a3e]">
            <div className="flex items-center gap-2">
              <span className="text-[#cd694a] font-bold text-xs">Claude Code</span>
              <span className="text-[10px] text-[#8A8F98]">•</span>
              <span className="text-[10px] text-[#cd694a] bg-[#cd694a]/15 px-2 py-0.5 rounded font-semibold border border-[#cd694a]/30">
                Founder Copilot
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#8A8F98] text-[10px]">
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
            <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 flex items-start gap-2.5 text-xs text-amber-200">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300">Low Data Confidence</strong>: More real-world telemetry (customer interviews, analytics metrics) is recommended before committing significant capital or pivoting.
              </div>
            </div>
          )}

          {/* Retrieved Context Summary */}
          {message.retrievedContextSummary && message.retrievedContextSummary.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#8A8F98] bg-white/[0.03] px-3 py-1.5 rounded border border-white/[0.06]">
              <span className="text-[#8A8F98] font-semibold uppercase tracking-wider">Context in scope:</span>
              {message.retrievedContextSummary.map((c, i) => (
                <span key={i} className="bg-white/[0.06] px-2 py-0.5 rounded border border-white/10 text-[#EDEDEF] font-semibold">
                  {c.label}
                </span>
              ))}
            </div>
          )}

          {/* Rich Markdown Body */}
          <div className="prose prose-invert max-w-none text-[#EDEDEF] leading-relaxed text-xs sm:text-sm font-mono space-y-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Proposed Diff View */}
          {message.diffData && (
            <CopilotDiffView
              diff={message.diffData}
              onAccept={onAcceptDiff || (() => {})}
              onReject={onRejectDiff || (() => {})}
            />
          )}

          {/* Permission Request Card */}
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

          {/* Action Proposal Card */}
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
          <div className="pt-2 border-t border-[#3a3a3e] flex items-center justify-between text-xs text-[#8A8F98]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-white/[0.06] text-[#8A8F98] hover:text-[#EDEDEF] text-[11px] transition cursor-pointer"
                title="Copy message text"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                className={`p-1.5 rounded transition cursor-pointer ${
                  feedback === 'up' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-white/[0.06] text-[#8A8F98] hover:text-[#EDEDEF]'
                }`}
                title="Helpful insight"
              >
                <ThumbsUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                className={`p-1.5 rounded transition cursor-pointer ${
                  feedback === 'down' ? 'bg-rose-500/20 text-rose-300' : 'hover:bg-white/[0.06] text-[#8A8F98] hover:text-[#EDEDEF]'
                }`}
                title="Unhelpful"
              >
                <ThumbsDown size={12} />
              </button>
            </div>
          </div>
        </div>
      </ClaudeMessage>
    </div>
  );
};

