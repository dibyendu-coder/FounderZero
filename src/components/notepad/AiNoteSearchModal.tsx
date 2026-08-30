import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  Tag,
  Folder,
  Loader2,
  Calendar,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { FounderNote, StartupProfile } from '../../types';

interface AiNoteSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: FounderNote[];
  profile: StartupProfile;
  onSelectNote: (noteId: string) => void;
}

export const AiNoteSearchModal: React.FC<AiNoteSearchModalProps> = ({
  isOpen,
  onClose,
  notes,
  profile,
  onSelectNote
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<{
    answer: string;
    matchedNoteIds: string[];
    insights: string[];
    suggestedNextQuestion?: string;
  } | null>(null);

  if (!isOpen) return null;

  const sampleQuestions = [
    'What did I write about my pricing strategy?',
    'Find my notes about customer complaints and churn.',
    'What ideas did I have for onboarding activation?',
    "Show everything I've written about competitors.",
    'What are the riskiest assumptions in my idea notes?'
  ];

  // Direct instant keyword matches
  const qLower = searchQuery.toLowerCase().trim();
  const instantMatches = qLower
    ? notes.filter(n => {
        if (n.isTrash) return false;
        const inTitle = n.title.toLowerCase().includes(qLower);
        const inCollection = n.collection.toLowerCase().includes(qLower);
        const inTags = (n.tags || []).some(t => t.toLowerCase().includes(qLower));
        const inContent = (n.blocks || []).some(b => (b.content || '').toLowerCase().includes(qLower));
        return inTitle || inCollection || inTags || inContent;
      })
    : [];

  const handleAiSearch = async (queryText?: string) => {
    const q = queryText || searchQuery;
    if (!q.trim()) return;

    setIsAiSearching(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/notepad-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          notes: notes.filter(n => !n.isTrash),
          profile
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult({
          answer: data.answer || 'Found relevant context in your notes.',
          matchedNoteIds: data.matchedNoteIds || [],
          insights: data.insights || [],
          suggestedNextQuestion: data.suggestedNextQuestion
        });
      }
    } catch (err) {
      console.error('AI Note search error:', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAiSearch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your notes or search by keyword..."
              autoFocus
              className="w-full text-sm font-medium text-slate-900 bg-transparent border-0 focus:outline-hidden focus:ring-0 placeholder:text-slate-400"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setAiResult(null);
              }}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => handleAiSearch()}
            disabled={!searchQuery.trim() || isAiSearching}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            {isAiSearching ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Ask AI</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* AI Search Result Card */}
          {aiResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                  <Sparkles size={13} />
                </span>
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-blue-900">
                  AI Synthesis & Founder Memory
                </h3>
              </div>

              <p className="text-xs leading-relaxed text-slate-800 font-medium whitespace-pre-line bg-white/80 p-3.5 rounded-xl border border-blue-100">
                {aiResult.answer}
              </p>

              {aiResult.insights && aiResult.insights.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">
                    Key Insights Extracted
                  </div>
                  {aiResult.insights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{ins}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Citations */}
              {aiResult.matchedNoteIds && aiResult.matchedNoteIds.length > 0 && (
                <div className="pt-2 border-t border-blue-200/60">
                  <div className="text-[11px] font-mono font-semibold uppercase text-slate-500 mb-2">
                    Referenced Notes ({aiResult.matchedNoteIds.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.matchedNoteIds.map(id => {
                      const note = notes.find(n => n.id === id);
                      if (!note) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            onSelectNote(id);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-semibold rounded-lg border border-blue-200 transition flex items-center gap-1.5 shadow-2xs group cursor-pointer"
                        >
                          <FileText size={13} className="text-blue-500 group-hover:text-white" />
                          <span className="truncate max-w-[200px]">{note.title}</span>
                          <ArrowRight size={12} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Prompts if no query */}
          {!searchQuery && !aiResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Lightbulb size={14} className="text-amber-500" />
                <span>Example AI Inquiries</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(q);
                      handleAiSearch(q);
                    }}
                    className="p-2.5 text-left text-xs text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition cursor-pointer flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instant Matches Section */}
          {searchQuery && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Direct Keyword Matches ({instantMatches.length})</span>
                {instantMatches.length > 0 && <span>Click to open</span>}
              </div>

              {instantMatches.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  No direct keyword matches found. Try clicking &quot;Ask AI&quot; above to search concepts and semantics.
                </div>
              ) : (
                <div className="space-y-2">
                  {instantMatches.map(note => (
                    <button
                      key={note.id}
                      onClick={() => {
                        onSelectNote(note.id);
                        onClose();
                      }}
                      className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition text-left flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                            {note.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Folder size={11} />
                            {note.collection}
                          </span>
                          {note.tags && note.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag size={11} />
                              {note.tags.slice(0, 2).join(', ')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Your notes remain 100% private to your workspace.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
