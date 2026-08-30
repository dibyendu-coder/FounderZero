import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Copy,
  PlusCircle,
  RefreshCw,
  Loader2,
  FileCheck,
  ListCheck,
  AlertTriangle,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NoteBlock, StartupProfile } from '../../types';

interface AiActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  noteTitle: string;
  noteContent: string;
  selectedText?: string;
  collection: string;
  profile: StartupProfile;
  onApplyBlocks: (blocks: NoteBlock[], mode: 'replace' | 'append') => void;
  onTurnIntoMission?: () => void;
  onTurnIntoExperiment?: () => void;
}

export const AiActionModal: React.FC<AiActionModalProps> = ({
  isOpen,
  onClose,
  action,
  noteTitle,
  noteContent,
  selectedText,
  collection,
  profile,
  onApplyBlocks,
  onTurnIntoMission,
  onTurnIntoExperiment
}) => {
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState(action);
  const [resultData, setResultData] = useState<{
    summary?: string;
    resultText: string;
    suggestedBlocks: Omit<NoteBlock, 'id'>[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentAction(action);
      runAiAction(action);
    } else {
      setResultData(null);
    }
  }, [isOpen, action]);

  if (!isOpen) return null;

  const runAiAction = async (act: string) => {
    if (act === 'turn_into_mission') {
      if (onTurnIntoMission) {
        onClose();
        onTurnIntoMission();
        return;
      }
    }
    if (act === 'turn_into_experiment') {
      if (onTurnIntoExperiment) {
        onClose();
        onTurnIntoExperiment();
        return;
      }
    }

    setLoading(true);
    setCurrentAction(act);

    try {
      const res = await fetch('/api/ai/note-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: act,
          noteTitle,
          noteContent,
          selectedText,
          collection,
          profile
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResultData({
          summary: data.summary,
          resultText: data.resultText || '',
          suggestedBlocks: data.suggestedBlocks || []
        });
      }
    } catch (err) {
      console.error('AI Note Action error:', err);
    } finally {
      setLoading(false);
    }
  };

  const actionOptions = [
    { id: 'summarize', label: 'Summarize', icon: FileCheck },
    { id: 'rewrite', label: 'Rewrite & Polish', icon: Sparkles },
    { id: 'expand', label: 'Expand & Deepen', icon: Layers },
    { id: 'extract_tasks', label: 'Extract Tasks', icon: ListCheck },
    { id: 'extract_insights', label: 'Extract Insights', icon: Sparkles },
    { id: 'find_assumptions', label: 'Find Assumptions', icon: AlertTriangle },
    { id: 'generate_questions', label: 'Generate Questions', icon: HelpCircle },
    { id: 'identify_risks', label: 'Identify Risks', icon: AlertTriangle },
    { id: 'create_action_plan', label: 'Create Action Plan', icon: ListCheck }
  ];

  const handleApply = (mode: 'replace' | 'append') => {
    if (!resultData) return;
    const blocksWithIds: NoteBlock[] = (resultData.suggestedBlocks || []).map((b, i) => ({
      ...b,
      id: `ai-block-${Date.now()}-${i}`
    }));

    if (blocksWithIds.length === 0 && resultData.resultText) {
      blocksWithIds.push({
        id: `ai-block-${Date.now()}`,
        type: 'paragraph',
        content: resultData.resultText
      });
    }

    onApplyBlocks(blocksWithIds, mode);
    onClose();
  };

  const handleCopy = () => {
    if (!resultData) return;
    navigator.clipboard.writeText(resultData.resultText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Ask AI Writing Partner</h2>
              <p className="text-xs text-slate-500 truncate max-w-md">
                Refining &quot;{noteTitle || 'Note'}&quot;
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

        {/* Quick Action Selector Pills */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto">
          {actionOptions.map(opt => {
            const Icon = opt.icon;
            const isSelected = currentAction === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => runAiAction(opt.id)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={12} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <p className="text-xs font-medium">FounderZero AI is analyzing your startup notes...</p>
            </div>
          ) : resultData ? (
            <div className="space-y-4">
              {resultData.summary && (
                <div className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60 inline-block">
                  {resultData.summary}
                </div>
              )}

              {/* Block Preview */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-2">
                  Generated Output Preview
                </div>
                {resultData.suggestedBlocks && resultData.suggestedBlocks.length > 0 ? (
                  resultData.suggestedBlocks.map((block, idx) => (
                    <div key={idx} className="text-xs text-slate-800">
                      {block.type === 'heading2' && (
                        <h4 className="font-bold text-sm text-slate-900 mt-2">{block.content}</h4>
                      )}
                      {block.type === 'paragraph' && (
                        <p className="text-slate-700 leading-relaxed">{block.content}</p>
                      )}
                      {block.type === 'checklist' && (
                        <div className="flex items-center gap-2 text-slate-800">
                          <input type="checkbox" checked={block.checked} readOnly className="rounded text-blue-600" />
                          <span>{block.content}</span>
                        </div>
                      )}
                      {block.type === 'bulletList' && (
                        <div className="flex items-start gap-2 text-slate-700">
                          <span className="text-blue-500">•</span>
                          <span>{block.content}</span>
                        </div>
                      )}
                      {block.type === 'callout' && (
                        <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
                          {block.content}
                        </div>
                      )}
                      {block.type === 'quote' && (
                        <blockquote className="border-l-2 border-blue-500 pl-3 italic text-slate-600">
                          {block.content}
                        </blockquote>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {resultData.resultText}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select an AI action above to begin.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!resultData || loading}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => runAiAction(currentAction)}
              disabled={loading}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApply('append')}
              disabled={!resultData || loading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle size={13} />
              <span>Append to Note</span>
            </button>
            <button
              onClick={() => handleApply('replace')}
              disabled={!resultData || loading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Check size={13} />
              <span>Replace Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
