import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  Clock,
  ChevronDown
} from 'lucide-react';
import { CopilotConversation, CopilotMode } from '../../types';

interface ConversationSidebarProps {
  conversations: CopilotConversation[];
  activeConvId: string;
  onSelectConversation: (id: string) => void;
  onCreateNewConversation: (mode?: CopilotMode, initialTitle?: string) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onCloseMobile?: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations = [],
  activeConvId,
  onSelectConversation,
  onCreateNewConversation,
  onDeleteConversation,
  onTogglePin,
  onRenameConversation,
  onCloseMobile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Filter conversations
  const filtered = conversations.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.lastMessagePreview || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date and pin
  const pinned = filtered.filter(c => c.pinned);
  const unpinned = filtered.filter(c => !c.pinned);

  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  const todayList = unpinned.filter(c => {
    const d = new Date(c.updatedAt || c.createdAt).getTime();
    return now - d < oneDay;
  });

  const yesterdayList = unpinned.filter(c => {
    const d = new Date(c.updatedAt || c.createdAt).getTime();
    return now - d >= oneDay && now - d < 2 * oneDay;
  });

  const last7DaysList = unpinned.filter(c => {
    const d = new Date(c.updatedAt || c.createdAt).getTime();
    return now - d >= 2 * oneDay && now - d < 7 * oneDay;
  });

  const olderList = unpinned.filter(c => {
    const d = new Date(c.updatedAt || c.createdAt).getTime();
    return now - d >= 7 * oneDay;
  });

  const handleStartRename = (c: CopilotConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditText(c.title);
  };

  const handleSaveRename = (id: string) => {
    if (editText.trim()) {
      onRenameConversation(id, editText.trim());
    }
    setEditingId(null);
  };

  const renderConversationItem = (c: CopilotConversation) => {
    const isActive = activeConvId === c.id;
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        onClick={() => {
          onSelectConversation(c.id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
          isActive
            ? 'bg-[#5E6AD2]/20 text-indigo-200 font-semibold border border-[#5E6AD2]/40 shadow-xs'
            : 'hover:bg-white/[0.04] text-[#EDEDEF]'
        }`}
      >
        <div className="truncate flex-1 pr-2">
          {isEditing ? (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-[#5E6AD2] rounded px-1.5 py-0.5 text-xs text-[#EDEDEF] focus:outline-none font-sans"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveRename(c.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
              <button onClick={() => handleSaveRename(c.id)} className="text-emerald-400 p-0.5 cursor-pointer">
                <Check size={12} />
              </button>
            </div>
          ) : (
            <>
              <div className="truncate text-[12px] font-medium leading-tight text-[#EDEDEF]">
                {c.title}
              </div>
              {c.lastMessagePreview && (
                <div className="text-[10px] text-[#8A8F98] truncate mt-0.5 font-normal">
                  {c.lastMessagePreview}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
          <button
            onClick={e => onTogglePin(c.id, e)}
            title={c.pinned ? "Unpin conversation" : "Pin conversation"}
            className="p-1 text-[#8A8F98] hover:text-[#5E6AD2] rounded"
          >
            <Pin size={12} className={c.pinned ? "fill-[#5E6AD2] text-[#5E6AD2]" : ""} />
          </button>
          <button
            onClick={e => handleStartRename(c, e)}
            title="Rename discussion"
            className="p-1 text-[#8A8F98] hover:text-[#EDEDEF] rounded"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={e => onDeleteConversation(c.id, e)}
            title="Delete conversation"
            className="p-1 text-[#8A8F98] hover:text-rose-400 rounded"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      id="conversation-sidebar"
      className="w-full h-full bg-[#050506] border-r border-white/[0.06] flex flex-col justify-between overflow-hidden text-xs font-sans select-none text-[#EDEDEF]"
    >
      {/* Top Search & Actions */}
      <div className="p-3.5 border-b border-white/[0.06] space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono font-bold text-[#EDEDEF] text-xs">
            <MessageSquare size={13} className="text-[#5E6AD2]" />
            <span>Discussions</span>
          </div>

          <button
            onClick={() => onCreateNewConversation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5E6AD2]/20 text-indigo-300 hover:bg-[#5E6AD2]/30 border border-[#5E6AD2]/30 text-xs font-semibold transition cursor-pointer font-sans"
            title="New Chat"
          >
            <Plus size={13} />
            <span>New</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8F98]" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] rounded-lg text-xs focus:outline-none focus:border-[#5E6AD2] transition font-sans"
          />
        </div>
      </div>

      {/* Conversation List Groups */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 font-sans">
        {/* Pinned */}
        {pinned.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8A8F98] flex items-center gap-1">
              <Pin size={10} className="fill-[#8A8F98]" />
              <span>Pinned</span>
            </div>
            {pinned.map(renderConversationItem)}
          </div>
        )}

        {/* Today */}
        {todayList.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8A8F98]">
              Today
            </div>
            {todayList.map(renderConversationItem)}
          </div>
        )}

        {/* Yesterday */}
        {yesterdayList.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8A8F98]">
              Yesterday
            </div>
            {yesterdayList.map(renderConversationItem)}
          </div>
        )}

        {/* Previous 7 Days */}
        {last7DaysList.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8A8F98]">
              Previous 7 Days
            </div>
            {last7DaysList.map(renderConversationItem)}
          </div>
        )}

        {/* Older */}
        {olderList.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8A8F98]">
              Older
            </div>
            {olderList.map(renderConversationItem)}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-8 px-4 text-[#8A8F98] text-xs font-mono">
            {searchQuery ? 'No matching conversations' : 'No discussions yet. Ask Founder Copilot anything to begin.'}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#050506] border-t border-white/[0.06] text-[10px] font-mono text-[#8A8F98] flex items-center justify-between">
        <span>{conversations.length} Discussions saved</span>
        <span className="text-[#5E6AD2]">Encrypted / RLS</span>
      </div>
    </div>
  );
};
