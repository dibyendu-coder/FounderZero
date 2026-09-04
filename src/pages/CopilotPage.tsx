import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Loader2,
  ShieldAlert,
  Target,
  FlaskConical,
  Compass,
  Users,
  Calendar,
  Activity,
  Layers,
  Bookmark,
  FileText,
  Lightbulb,
  Key
} from 'lucide-react';
import {
  AppState,
  CopilotConversation,
  CopilotMessage,
  CopilotMode,
  CopilotActionProposal,
  CopilotDiffData,
  CopilotPermissionRequestData,
  StartupProfile
} from '../types';
import { CopilotHeader } from '../components/copilot/CopilotHeader';
import { ConversationSidebar } from '../components/copilot/ConversationSidebar';
import { StartupContextPanel } from '../components/copilot/StartupContextPanel';
import { CopilotPromptComposer } from '../components/copilot/CopilotPromptComposer';
import { CopilotMessageItem } from '../components/copilot/CopilotMessageItem';
import { CopilotThinking } from '../components/copilot/CopilotThinking';
import { SLASH_COMMANDS } from '../components/copilot/CopilotSlashMenu';
import { generateSmartCopilotReply } from '../../server/copilotEngine';
import { ClaudeHeader } from '../components/brainless/claude/claude-header';

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
  const [loading, setLoading] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightContextOpen, setRightContextOpen] = useState(true);
  const [activeContexts, setActiveContexts] = useState<string[]>([
    'startup',
    'metrics',
    'feedback',
    'experiments'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    }
  }, [initialPrompt]);

  const activeMessages = (activeConvId && messagesMap[activeConvId]) || [];
  const activeConversation = conversations.find(c => c.id === activeConvId);

  // Toggle Context Capsule
  const handleToggleContext = (id: string) => {
    setActiveContexts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

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

  // Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    onUpdateState(prev => ({
      ...prev,
      copilotConversations: (prev.copilotConversations || []).map(c =>
        c.id === id ? { ...c, title: newTitle.trim() } : c
      )
    }));
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
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

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = localStorage.getItem('founderzero_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': token || 'demo-user-1'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: currentConvId,
          message: textToSend,
          mode: modeToUse,
          activeContexts
        })
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.assistantMessage) {
            const finalAssistantMessage = data.assistantMessage;
            const finalState = data.state;

            onUpdateState(prev => {
              const currentMsgs = prev.copilotMessages?.[currentConvId] || [];
              const hasUser = currentMsgs.some(m => m.id === userMsg.id);
              const baseMsgs = hasUser ? currentMsgs : [...currentMsgs, userMsg];
              const msgs = [...baseMsgs, finalAssistantMessage];
              return {
                ...prev,
                ...(finalState ? finalState : {}),
                copilotMessages: {
                  ...(prev.copilotMessages || {}),
                  ...(finalState?.copilotMessages || {}),
                  [currentConvId]: msgs
                },
                copilotConversations: (finalState?.copilotConversations || prev.copilotConversations || []).map(c =>
                  c.id === currentConvId
                    ? {
                        ...c,
                        lastMessagePreview: finalAssistantMessage.content.slice(0, 100) + '...',
                        messagesCount: msgs.length,
                        updatedAt: new Date().toISOString()
                      }
                    : c
                )
              };
            });
          }
        } else if (res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let assistantMsgId = 'msg-a-' + Date.now();
          let finalAssistantMessage: CopilotMessage | null = null;
          let finalState: any = null;
          let streamedContent = '';

          // Add initial empty assistant message for progressive streaming
          const initialAssistantMsg: CopilotMessage = {
            id: assistantMsgId,
            conversationId: currentConvId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            mode: modeToUse,
            thinkingSteps: [
              { id: 'th-1', label: 'Gemini 2.5 Flash streaming response...', status: 'active' }
            ]
          };

          onUpdateState(prev => {
            const currentMsgs = prev.copilotMessages?.[currentConvId] || [];
            const hasUser = currentMsgs.some(m => m.id === userMsg.id);
            const msgs = hasUser
              ? [...currentMsgs, initialAssistantMsg]
              : [...currentMsgs, userMsg, initialAssistantMsg];
            return {
              ...prev,
              copilotMessages: {
                ...(prev.copilotMessages || {}),
                [currentConvId]: msgs
              }
            };
          });

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split(/\n\n|\r\n\r\n/);
            buffer = chunks.pop() || '';

            for (const chunk of chunks) {
              const lines = chunk.split('\n');
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(trimmed.slice(6));
                    if (data.type === 'chunk') {
                      streamedContent += data.text;
                      onUpdateState(prev => {
                        const currentMsgs = prev.copilotMessages?.[currentConvId] || [];
                        const updated = currentMsgs.map(m => {
                          if (m.id === assistantMsgId) {
                            return { ...m, content: streamedContent };
                          }
                          return m;
                        });
                        return {
                          ...prev,
                          copilotMessages: {
                            ...(prev.copilotMessages || {}),
                            [currentConvId]: updated
                          }
                        };
                      });
                    } else if (data.assistantMessage) {
                      finalAssistantMessage = data.assistantMessage;
                      finalState = data.state;
                    }
                  } catch (e) {
                    // Ignore parse errors on partial frames
                  }
                }
              }
            }
          }

          // Ensure a fallback assistant message if finalAssistantMessage was missing
          if (!finalAssistantMessage) {
            if (streamedContent.trim()) {
              finalAssistantMessage = {
                id: assistantMsgId,
                conversationId: currentConvId,
                role: 'assistant',
                content: streamedContent.trim(),
                timestamp: new Date().toISOString(),
                mode: modeToUse
              };
            } else {
              const smartReply = generateSmartCopilotReply(textToSend, modeToUse, state);
              finalAssistantMessage = {
                id: assistantMsgId,
                conversationId: currentConvId,
                role: 'assistant',
                content: smartReply.content,
                timestamp: new Date().toISOString(),
                mode: modeToUse,
                intent: smartReply.intent,
                retrievedContextSummary: smartReply.retrievedContextSummary,
                sources: smartReply.sources,
                evidenceBreakdown: smartReply.evidenceBreakdown,
                actionProposal: smartReply.actionProposal,
                thinkingSteps: smartReply.thinkingSteps,
                toolCalls: smartReply.toolCalls
              };
            }
          }

          // Apply final fully-populated assistant message with tools, action proposals, etc.
          onUpdateState(prev => {
            const currentMsgs = prev.copilotMessages?.[currentConvId] || [];
            const hasAssistant = currentMsgs.some(m => m.id === assistantMsgId || m.id === finalAssistantMessage!.id);
            const msgs = hasAssistant
              ? currentMsgs.map(m => (m.id === assistantMsgId || m.id === finalAssistantMessage!.id) ? finalAssistantMessage! : m)
              : [...currentMsgs, finalAssistantMessage!];

            return {
              ...prev,
              ...(finalState ? finalState : {}),
              copilotMessages: {
                ...(prev.copilotMessages || {}),
                ...(finalState?.copilotMessages || {}),
                [currentConvId]: msgs
              },
              copilotConversations: (finalState?.copilotConversations || prev.copilotConversations || []).map(c =>
                c.id === currentConvId
                  ? {
                      ...c,
                      lastMessagePreview: finalAssistantMessage!.content.slice(0, 100) + '...',
                      messagesCount: msgs.length,
                      updatedAt: new Date().toISOString()
                    }
                  : c
              )
            };
          });
        }
      } else {
        // Response not OK -> Dynamic Smart Fallback based on user prompt
        const smartReply = generateSmartCopilotReply(textToSend, modeToUse, state);
        const fallbackMsg: CopilotMessage = {
          id: 'msg-a-' + Date.now(),
          conversationId: currentConvId,
          role: 'assistant',
          content: smartReply.content,
          timestamp: new Date().toISOString(),
          mode: modeToUse,
          intent: smartReply.intent,
          retrievedContextSummary: smartReply.retrievedContextSummary,
          sources: smartReply.sources,
          evidenceBreakdown: smartReply.evidenceBreakdown,
          actionProposal: smartReply.actionProposal,
          thinkingSteps: smartReply.thinkingSteps,
          toolCalls: smartReply.toolCalls
        };
        onUpdateState(prev => {
          const currentMsgs = prev.copilotMessages?.[currentConvId] || [];
          return {
            ...prev,
            copilotMessages: {
              ...(prev.copilotMessages || {}),
              [currentConvId]: [...currentMsgs, fallbackMsg]
            }
          };
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to send message to Copilot:', err);
        const smartReply = generateSmartCopilotReply(textToSend, modeToUse, state);
        const fallbackMsg: CopilotMessage = {
          id: 'msg-a-' + Date.now(),
          conversationId: currentConvId,
          role: 'assistant',
          content: smartReply.content,
          timestamp: new Date().toISOString(),
          mode: modeToUse,
          intent: smartReply.intent,
          retrievedContextSummary: smartReply.retrievedContextSummary,
          sources: smartReply.sources,
          evidenceBreakdown: smartReply.evidenceBreakdown,
          actionProposal: smartReply.actionProposal,
          thinkingSteps: smartReply.thinkingSteps,
          toolCalls: smartReply.toolCalls
        };
        onUpdateState(prev => {
          const currentMsgs = prev.copilotMessages?.[currentConvId] || [];
          return {
            ...prev,
            copilotMessages: {
              ...(prev.copilotMessages || {}),
              [currentConvId]: [...currentMsgs, fallbackMsg]
            }
          };
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
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

  // Accept Diff Changes (e.g. updating profile / positioning)
  const handleAcceptDiff = (diff: CopilotDiffData) => {
    onUpdateState(prev => {
      const updatedProfile = { ...(prev.profile || {}) };
      diff.changes.forEach(c => {
        if (c.field in updatedProfile) {
          (updatedProfile as any)[c.field] = c.newValue;
        }
      });
      return {
        ...prev,
        profile: updatedProfile as StartupProfile
      };
    });
  };

  // Allow Permission Request
  const handleAllowPermission = async (permission: CopilotPermissionRequestData) => {
    if (permission.payload) {
      await handleConfirmAction(permission.payload);
    }
  };

  return (
    <div id="founder-copilot-container" className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-[#050506] text-[#EDEDEF] font-sans">
      {/* Claude Code Inspired Top Header */}
      <CopilotHeader
        profile={profile}
        title={activeConversation ? activeConversation.title : 'Founder Copilot'}
        mode={activeMode}
        isStreaming={loading}
        onNewChat={() => handleCreateNewConversation()}
        onNavigate={navigate}
        leftSidebarOpen={leftSidebarOpen}
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        rightContextOpen={rightContextOpen}
        onToggleRightContext={() => setRightContextOpen(!rightContextOpen)}
      />

      {/* Main 3-Pane Body Workspace */}
      <div className="flex-1 flex overflow-hidden bg-[#050506]">
        {/* 1. Left History Sidebar (Collapsible) */}
        {leftSidebarOpen && (
          <aside className="w-72 sm:w-80 h-full shrink-0 border-r border-white/[0.06] z-10 transition-all bg-[#050506]">
            <ConversationSidebar
              conversations={conversations}
              activeConvId={activeConvId}
              onSelectConversation={id => setActiveConvId(id)}
              onCreateNewConversation={handleCreateNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onTogglePin={handleTogglePin}
              onRenameConversation={handleRenameConversation}
            />
          </aside>
        )}

        {/* 2. Center Chat & Console Canvas */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#050506]">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeMessages.length === 0 ? (
              /* Empty State / Welcome Console with ClaudeHeader */
              <div className="max-w-3xl mx-auto space-y-6 py-6 font-mono">
                <ClaudeHeader
                  version="v2.1.206"
                  user={state.user?.name || "Founder"}
                  model="Gemini 2.5 Flash · Founder Copilot"
                  org={profile.name ? `${profile.name}'s Startup` : "Founder Zero Workspace"}
                  cwd="~/startup/workspace"
                  tips={[
                    "Ask Copilot to analyze your metrics, validate ideas, or plan weekly sprints",
                    "Type / to trigger direct founder commands like /analyze or /reality"
                  ]}
                  whatsNew={[
                    "Integrated Claude Code terminal UI interface",
                    "Added slash command shortcuts (/analyze, /reality, /metrics)"
                  ]}
                />

                {/* Quick Slash Commands Grid */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-[#cd694a] uppercase tracking-widest px-1 font-bold">
                    Direct Slash Commands
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SLASH_COMMANDS.slice(0, 6).map(cmd => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          type="button"
                          onClick={() => {
                            setActiveMode(cmd.mode);
                            handleSendMessage(cmd.template, cmd.mode);
                          }}
                          className="p-3 bg-[#08080a] hover:bg-[#121216] rounded border border-[#3a3a3e] hover:border-[#cd694a]/60 text-left transition-all group cursor-pointer flex flex-col justify-between font-mono"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded bg-[#cd694a]/20 text-[#cd694a] group-hover:bg-[#cd694a] group-hover:text-white transition shrink-0">
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-mono text-xs font-bold text-[#EDEDEF] group-hover:text-[#e79475] transition">
                                <span className="text-[#cd694a]">/</span>{cmd.name}
                              </div>
                              <div className="text-[11px] text-[#8A8F98] mt-0.5 leading-snug font-mono">
                                {cmd.description}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end text-[10px] font-mono text-[#cd694a] font-semibold mt-2 pt-1 border-t border-[#3a3a3e] opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Execute Command →</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Active Message Stream */
              <div className="max-w-3xl mx-auto space-y-4">
                {activeMessages.map(msg => (
                  <CopilotMessageItem
                    key={msg.id}
                    message={msg}
                    conversationId={activeConvId}
                    onConfirmAction={handleConfirmAction}
                    onAcceptDiff={handleAcceptDiff}
                    onAllowPermission={handleAllowPermission}
                    onNavigate={navigate}
                  />
                ))}

                {/* Loading / Thinking Step */}
                {loading && (
                  <div className="my-3">
                    <CopilotThinking
                      isThinking={true}
                      activeStepLabel="Querying startup telemetry & synthesizing recommendations..."
                    />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Prompt Composer (claude-prompt) */}
          <div className="p-4 bg-[#050506]/90 backdrop-blur-xl border-t border-white/[0.06] shrink-0">
            <CopilotPromptComposer
              inputText={inputText}
              onInputChange={setInputText}
              onSend={handleSendMessage}
              onStop={handleStopGeneration}
              loading={loading}
              activeMode={activeMode}
              onModeChange={setActiveMode}
              activeContexts={activeContexts}
              onToggleContext={handleToggleContext}
            />
          </div>
        </main>

        {/* 3. Right Startup Context Panel (Collapsible) */}
        {rightContextOpen && (
          <aside className="w-80 xl:w-96 h-full shrink-0 shadow-xs z-10 transition-all hidden lg:block">
            <StartupContextPanel
              state={state}
              onNavigate={navigate}
              onClose={() => setRightContextOpen(false)}
            />
          </aside>
        )}
      </div>
    </div>
  );
};
