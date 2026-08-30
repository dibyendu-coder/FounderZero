import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Plus,
  Search,
  Trash2,
  Edit2,
  Pin,
  Check,
  X,
  Compass,
  FlaskConical,
  Activity,
  DollarSign,
  Users,
  Layers,
  ShieldAlert,
  Target,
  Bookmark,
  BookOpen,
  ArrowRight,
  Database,
  Brain,
  MessageSquare,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Key
} from 'lucide-react';
import {
  AppState,
  CopilotConversation,
  CopilotMessage,
  CopilotMode,
  CopilotActionProposal,
  StartupProfile
} from '../types';
import { SUGGESTED_COPILOT_PROMPTS } from '../lib/copilotData';
import { ActionProposalCard } from '../components/copilot/ActionProposalCard';
import { EvidenceBreakdownAccordion } from '../components/copilot/EvidenceBreakdownAccordion';
import { SourcesBar } from '../components/copilot/SourcesBar';

interface CopilotPageProps {
  state: AppState;
  navigate: (route: string) => void;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  initialConversationId?: string;
  initialPrompt?: string;
}

export const CopilotPage: React.FC<CopilotPageProps> = ({
  state,
  navigate,
  onUpdateState,
  initialConversationId,
  initialPrompt
}) => {
  const conversations = state.copilotConversations || [];
  const messagesMap = state.copilotMessages || {};
  const profile = state.profile || ({} as StartupProfile);

  const [activeConvId, setActiveConvId] = useState<string>(
    initialConversationId || (conversations.length > 0 ? conversations[0].id : '')
  );
  const [activeMode, setActiveMode] = useState<CopilotMode>('default');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editedTitleText, setEditedTitleText] = useState('');
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConvId, messagesMap, loading]);

  // Handle initial prompt prefill
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputText(initialPrompt.trim());
      inputRef.current?.focus();
    }
  }, [initialPrompt]);

  const activeMessages = (activeConvId && messagesMap[activeConvId]) || [];
  const activeConversation = conversations.find(c => c.id === activeConvId);

  // Create a new conversation
  const handleCreateNewConversation = (mode: CopilotMode = 'default', initialTitle?: string) => {
    const newId = 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newConv: CopilotConversation = {
      id: newId,
      userId: state.user?.id || 'demo-user-1',
      startupId: profile.id || 'startup-1',
      title: initialTitle || 'New Discussion',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      lastMessagePreview: '',
      messagesCount: 0,
      mode
    };

    onUpdateState(prev => ({
      ...prev,
      copilotConversations: [newConv, ...(prev.copilotConversations || [])],
      copilotMessages: {
        ...(prev.copilotMessages || {}),
        [newId]: []
      }
    }));

    setActiveConvId(newId);
    setActiveMode(mode);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateState(prev => {
      const filtered = (prev.copilotConversations || []).filter(c => c.id !== id);
      const newMsgs = { ...(prev.copilotMessages || {}) };
      delete newMsgs[id];
      return {
        ...prev,
        copilotConversations: filtered,
        copilotMessages: newMsgs
      };
    });

    if (activeConvId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConvId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  // Toggle Pin
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateState(prev => ({
      ...prev,
      copilotConversations: (prev.copilotConversations || []).map(c =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      )
    }));
  };

  // Save Title Edit
  const handleSaveTitle = (id: string) => {
    if (!editedTitleText.trim()) {
      setEditingTitleId(null);
      return;
    }
    onUpdateState(prev => ({
      ...prev,
      copilotConversations: (prev.copilotConversations || []).map(c =>
        c.id === id ? { ...c, title: editedTitleText.trim() } : c
      )
    }));
    setEditingTitleId(null);
  };

  // Send message
  const handleSendMessage = async (customMessage?: string, customMode?: CopilotMode) => {
    const textToSend = (customMessage || inputText).trim();
    if (!textToSend || loading) return;

    const modeToUse = customMode || activeMode;
    let currentConvId = activeConvId;

    if (!currentConvId || !activeConversation) {
      const newId = 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const title = textToSend.length > 35 ? textToSend.slice(0, 35) + '...' : textToSend;
      const newConv: CopilotConversation = {
        id: newId,
        userId: state.user?.id || 'demo-user-1',
        startupId: profile.id || 'startup-1',
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        lastMessagePreview: textToSend,
        messagesCount: 0,
        mode: modeToUse
      };

      onUpdateState(prev => ({
        ...prev,
        copilotConversations: [newConv, ...(prev.copilotConversations || [])],
        copilotMessages: {
          ...(prev.copilotMessages || {}),
          [newId]: []
        }
      }));

      currentConvId = newId;
      setActiveConvId(newId);
    }

    // Append user message immediately
    const userMsg: CopilotMessage = {
      id: 'msg-u-' + Date.now(),
      conversationId: currentConvId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      mode: modeToUse
    };

    onUpdateState(prev => {
      const currentMsgs = prev.copilotMessages?.[currentConvId] || [];
      return {
        ...prev,
        copilotMessages: {
          ...(prev.copilotMessages || {}),
          [currentConvId]: [...currentMsgs, userMsg]
        }
      };
    });

    setInputText('');
    setLoading(true);

    try {
      const token = localStorage.getItem('founderzero_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': token || 'demo-user-1'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (profile.geminiApiKey) headers['x-gemini-api-key'] = profile.geminiApiKey;

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId: currentConvId,
          message: textToSend,
          mode: modeToUse,
          geminiApiKey: profile.geminiApiKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.assistantMessage) {
          onUpdateState(prev => {
            const currentMsgs = prev.copilotMessages?.[currentConvId] || [];
            // replace or append if not already in state
            const hasUser = currentMsgs.some(m => m.id === userMsg.id);
            const msgs = hasUser ? [...currentMsgs, data.assistantMessage] : [...currentMsgs, userMsg, data.assistantMessage];
            return {
              ...prev,
              ...(data.state ? data.state : {}),
              copilotMessages: {
                ...(prev.copilotMessages || {}),
                ...(data.state?.copilotMessages || {}),
                [currentConvId]: msgs
              },
              copilotConversations: (data.state?.copilotConversations || prev.copilotConversations || []).map(c =>
                c.id === currentConvId ? { ...c, lastMessagePreview: data.assistantMessage.content.slice(0, 100) + '...', messagesCount: msgs.length, updatedAt: new Date().toISOString() } : c
              )
            };
          });
        }
      }
    } catch (err) {
      console.error('Failed to send message to Copilot:', err);
    } finally {
      setLoading(false);
    }
  };

  // Confirm Action Proposal (Save note, create mission, create experiment)
  const handleConfirmAction = async (proposal: CopilotActionProposal): Promise<boolean> => {
    try {
      const res = await fetch('/api/copilot/action/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          actionProposal: proposal
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          onUpdateState(() => data.state);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error confirming Copilot action:', err);
      return false;
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter(c => c.pinned);
  const unpinnedConversations = filteredConversations.filter(c => !c.pinned);

  // Quick Action Buttons definitions
  const quickModes: { id: CopilotMode; label: string; icon: any; color: string }[] = [
    { id: 'reality-check', label: 'Reality Check', icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200' },
    { id: 'brainstorm', label: 'Brainstorm', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { id: 'decision-support', label: 'Decision Support', icon: Layers, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { id: 'building-help', label: 'Building Help', icon: Compass, color: 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300' },
    { id: 'product-validation', label: 'Product Validation', icon: Target, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
    { id: 'feedback-analysis', label: 'Analyze Feedback', icon: Users, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { id: 'plan-week', label: 'Plan My Week', icon: Activity, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200' },
    { id: 'experiment-creator', label: 'Create Experiment', icon: FlaskConical, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100 border-teal-200' },
    { id: 'resources', label: 'Find Resources', icon: Bookmark, color: 'text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-200' }
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-slate-50 font-sans">
      {/* 1. LEFT SIDEBAR: CONVERSATION HISTORY & CONTEXT */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0052FF] to-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Founder Copilot</h2>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Startup Thinking Partner</p>
              </div>
            </div>
            <button
              onClick={() => handleCreateNewConversation()}
              className="p-1.5 rounded-lg bg-blue-50 text-[#0052FF] hover:bg-blue-100 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="New Chat"
            >
              <Plus size={15} />
              <span className="hidden sm:inline text-[11px]">New</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {pinnedConversations.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                <Pin size={10} />
                <span>Pinned</span>
              </div>
              {pinnedConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    activeConvId === conv.id
                      ? 'bg-blue-50/80 text-blue-900 font-semibold border border-blue-200/70 shadow-2xs'
                      : 'hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    {editingTitleId === conv.id ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editedTitleText}
                          onChange={e => setEditedTitleText(e.target.value)}
                          className="w-full bg-white border border-blue-400 rounded px-1.5 py-0.5 text-xs focus:outline-hidden"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveTitle(conv.id);
                            if (e.key === 'Escape') setEditingTitleId(null);
                          }}
                        />
                        <button onClick={() => handleSaveTitle(conv.id)} className="text-emerald-600 p-0.5">
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="truncate text-[12px]">{conv.title}</div>
                        {conv.lastMessagePreview && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                            {conv.lastMessagePreview}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={e => handleTogglePin(conv.id, e)}
                      title="Unpin"
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Pin size={12} className="fill-blue-500 text-blue-500" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setEditingTitleId(conv.id);
                        setEditedTitleText(conv.title);
                      }}
                      title="Rename"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={e => handleDeleteConversation(conv.id, e)}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
              Conversations ({unpinnedConversations.length})
            </div>
            {unpinnedConversations.length === 0 && pinnedConversations.length === 0 ? (
              <div className="text-center py-6 px-3 text-xs text-slate-400">
                No conversations yet. Start a discussion with your thinking partner.
              </div>
            ) : (
              unpinnedConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    activeConvId === conv.id
                      ? 'bg-blue-50/80 text-blue-900 font-semibold border border-blue-200/70 shadow-2xs'
                      : 'hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    {editingTitleId === conv.id ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editedTitleText}
                          onChange={e => setEditedTitleText(e.target.value)}
                          className="w-full bg-white border border-blue-400 rounded px-1.5 py-0.5 text-xs focus:outline-hidden"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveTitle(conv.id);
                            if (e.key === 'Escape') setEditingTitleId(null);
                          }}
                        />
                        <button onClick={() => handleSaveTitle(conv.id)} className="text-emerald-600 p-0.5">
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="truncate text-[12px]">{conv.title}</div>
                        {conv.lastMessagePreview && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                            {conv.lastMessagePreview}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={e => handleTogglePin(conv.id, e)}
                      title="Pin conversation"
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Pin size={12} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setEditingTitleId(conv.id);
                        setEditedTitleText(conv.title);
                      }}
                      title="Rename"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={e => handleDeleteConversation(conv.id, e)}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Startup Context Inspector Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-xs">
          <div
            onClick={() => setContextDrawerOpen(!contextDrawerOpen)}
            className="flex items-center justify-between cursor-pointer text-slate-600 hover:text-slate-900"
          >
            <div className="flex items-center gap-1.5">
              <Database size={13} className="text-blue-600" />
              <span className="font-mono text-[11px] font-bold">Active Startup Context</span>
            </div>
            <ChevronDown size={13} className={`transition-transform ${contextDrawerOpen ? 'rotate-180' : ''}`} />
          </div>

          <div className="mt-2 space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center justify-between">
              <span>Startup:</span>
              <strong className="text-slate-800 font-semibold">{profile.name || 'PulseBoard'} ({profile.stage})</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Bottleneck:</span>
              <span className="text-amber-700 font-medium truncate max-w-[140px]">{profile.biggestUncertainty}</span>
            </div>

            {contextDrawerOpen && (
              <div className="pt-2 mt-2 border-t border-slate-200/60 space-y-1 text-[10px] text-slate-500 font-mono">
                <div>• Metrics in Scope: {state.metrics?.length || 0}</div>
                <div>• Interviews Logged: {state.customerFeedback?.length || 0}</div>
                <div>• Linked Notes: {state.notes?.length || 0}</div>
                <div>• Saved in Vault: {state.savedResources?.length || 0}</div>
                <div className="pt-1 text-blue-600 cursor-pointer hover:underline" onClick={() => navigate('profile')}>
                  View Full Founder Dossier →
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/60">
        {/* Chat Header */}
        <div className="h-14 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
              {activeConversation ? activeConversation.title : 'Founder Copilot'}
            </h3>
            {activeMode !== 'default' && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                {activeMode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {profile.geminiApiKey ? (
              <button
                onClick={() => navigate('profile')}
                title="Powered by your personal Gemini API Key"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold transition cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>BYOK Active (Gemini 3.7 Flash)</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('profile')}
                title="Click to configure your own Gemini API Key in Profile"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-mono font-semibold transition cursor-pointer"
              >
                <Key size={11} className="text-blue-600" />
                <span>Add Gemini Key</span>
              </button>
            )}

            <button
              onClick={() => handleCreateNewConversation()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">New Discussion</span>
            </button>
          </div>
        </div>

        {/* Quick Mode Bar */}
        <div className="px-4 py-2 bg-white border-b border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 mr-1 shrink-0">
            Modes:
          </span>
          {quickModes.map(qm => {
            const Icon = qm.icon;
            const isSelected = activeMode === qm.id;
            return (
              <button
                key={qm.id}
                onClick={() => {
                  setActiveMode(qm.id);
                  if (activeMessages.length === 0) {
                    // prefill or adapt
                  }
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0052FF] text-white border-blue-600 shadow-2xs'
                    : `${qm.color} bg-opacity-70`
                }`}
              >
                <Icon size={12} />
                <span>{qm.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeMessages.length === 0 ? (
            /* WELCOME / EMPTY STATE */
            <div className="max-w-3xl mx-auto space-y-6 py-4">
              {/* Header Title */}
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-[#0052FF] shadow-xs mb-2">
                  <Sparkles size={28} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Founder Copilot
                </h1>
                <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Your startup thinking partner. Ask anything about what you're building with zero fluff.
                </p>
              </div>

              {/* Startup Context Briefing Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    Current Startup Reality
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Stage: {profile.stage}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400">Startup</div>
                    <div className="font-bold text-slate-800 truncate">{profile.name}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400">Monthly Revenue</div>
                    <div className="font-bold text-emerald-700 font-mono">₹{(profile.monthlyRevenue || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400">Current Users</div>
                    <div className="font-bold text-slate-800 font-mono">{profile.currentUsers}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400">Core Bottleneck</div>
                    <div className="font-bold text-amber-700 truncate">{profile.biggestUncertainty}</div>
                  </div>
                </div>
              </div>

              {/* Suggested Prompts Grid */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
                  Suggested Prompts
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUGGESTED_COPILOT_PROMPTS.map((sp, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveMode(sp.mode);
                        handleSendMessage(sp.title, sp.mode);
                      }}
                      className="p-3.5 bg-white hover:bg-blue-50/50 rounded-xl border border-slate-200/80 hover:border-blue-300 text-left transition-all group shadow-2xs cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                          "{sp.title}"
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {sp.subtitle}
                        </div>
                      </div>
                      <div className="flex items-center justify-end text-[10px] text-blue-600 font-medium mt-2 pt-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Ask Copilot →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* CONVERSATION MESSAGES */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* User Bubble */}
                  {msg.role === 'user' ? (
                    <div className="max-w-[85%] bg-[#0F172A] text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs space-y-1">
                      <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      <div className="text-[10px] text-slate-400 font-mono text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ) : (
                    /* Assistant Card */
                    <div className="w-full bg-white rounded-2xl rounded-tl-xs p-5 border border-slate-200/90 shadow-2xs space-y-3">
                      {/* Assistant Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#0052FF] to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                            <Sparkles size={13} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 font-mono">Founder Copilot</span>
                          <span className="text-[10px] font-mono text-slate-400">•</span>
                          <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            Evidence-Driven
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Insufficient Evidence Warning Banner */}
                      {msg.insufficientEvidenceWarning && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-xs text-amber-900">
                          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Insufficient Data Warning</strong>: More real-world signals (customer interviews, analytics data) are required before making high-certainty strategic bets.
                          </div>
                        </div>
                      )}

                      {/* Retrieved Context Indicator */}
                      {msg.retrievedContextSummary && msg.retrievedContextSummary.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <span className="text-slate-400">Context evaluated:</span>
                          {msg.retrievedContextSummary.map((c, i) => (
                            <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                              {c.label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Markdown Content */}
                      <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed text-xs sm:text-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {/* Sources / Citations Bar */}
                      <SourcesBar sources={msg.sources} onNavigate={navigate} />

                      {/* Evidence Breakdown Accordion */}
                      <EvidenceBreakdownAccordion evidence={msg.evidenceBreakdown} />

                      {/* Action Proposal Card */}
                      {msg.actionProposal && (
                        <ActionProposalCard
                          proposal={msg.actionProposal}
                          conversationId={activeConvId}
                          messageId={msg.id}
                          onConfirm={handleConfirmAction}
                          onNavigate={navigate}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span>Reasoning over your metrics & customer signals...</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Querying retention metrics, notes, active experiments & founder constraints.
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 bg-white border-t border-slate-200/80 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            <div className="relative bg-slate-50 border border-slate-200/90 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all p-2 shadow-2xs">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask FounderZero anything about your startup..."
                rows={2}
                className="w-full bg-transparent border-0 resize-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden p-1 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 mt-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>Press <kbd className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold">⌘ + Enter</kbd> to send</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || loading}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0052FF] text-white hover:bg-blue-700 shadow-xs hover:shadow transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        <span>Ask</span>
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
