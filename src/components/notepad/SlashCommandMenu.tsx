import React, { useEffect, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  Quote,
  Code2,
  Table,
  Info,
  Minus,
  Sparkles
} from 'lucide-react';
import { NoteBlockType } from '../../types';

interface SlashCommandItem {
  id: string;
  type: NoteBlockType | 'ai';
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  aiAction?: string;
}

const COMMAND_ITEMS: SlashCommandItem[] = [
  {
    id: 'ai-action',
    type: 'ai',
    title: 'Ask AI Writing Partner',
    description: 'Summarize, extract tasks, find assumptions, or turn into action',
    icon: Sparkles
  },
  {
    id: 'text',
    type: 'paragraph',
    title: 'Text',
    description: 'Plain text paragraph with inline styling',
    icon: Type
  },
  {
    id: 'h1',
    type: 'heading1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1
  },
  {
    id: 'h2',
    type: 'heading2',
    title: 'Heading 2',
    description: 'Medium sub-heading',
    icon: Heading2
  },
  {
    id: 'h3',
    type: 'heading3',
    title: 'Heading 3',
    description: 'Small subsection title',
    icon: Heading3
  },
  {
    id: 'checklist',
    type: 'checklist',
    title: 'Checklist',
    description: 'Interactive founder task with checkbox',
    icon: CheckSquare
  },
  {
    id: 'bullet-list',
    type: 'bulletList',
    title: 'Bullet List',
    description: 'Clean unnumbered bullet points',
    icon: List
  },
  {
    id: 'numbered-list',
    type: 'numberedList',
    title: 'Numbered List',
    description: 'Sequential steps or priorities',
    icon: ListOrdered
  },
  {
    id: 'quote',
    type: 'quote',
    title: 'Quote',
    description: 'Customer quote or key insight callout',
    icon: Quote
  },
  {
    id: 'code',
    type: 'code',
    title: 'Code Block',
    description: 'Code snippet, API payload, or config',
    icon: Code2
  },
  {
    id: 'table',
    type: 'table',
    title: 'Table',
    description: 'Structured comparison or metric grid',
    icon: Table
  },
  {
    id: 'callout',
    type: 'callout',
    title: 'Callout',
    description: 'Highlighted principle or tactical takeaway',
    icon: Info
  },
  {
    id: 'divider',
    type: 'divider',
    title: 'Divider',
    description: 'Visual separation between sections',
    icon: Minus
  }
];

interface SlashCommandMenuProps {
  filterText: string;
  onSelect: (type: NoteBlockType | 'ai', aiAction?: string) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  filterText,
  onSelect,
  onClose,
  position
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const cleanFilter = filterText.replace(/^\//, '').toLowerCase().trim();

  const filteredItems = COMMAND_ITEMS.filter(
    item =>
      item.title.toLowerCase().includes(cleanFilter) ||
      item.description.toLowerCase().includes(cleanFilter) ||
      item.type.toLowerCase().includes(cleanFilter)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          const item = filteredItems[selectedIndex];
          onSelect(item.type, item.aiAction);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredItems.length === 0) {
    return (
      <div
        ref={menuRef}
        className="absolute z-50 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 text-xs text-slate-500 font-medium"
        style={position ? { top: position.top, left: position.left } : undefined}
      >
        No matching block types for &quot;{cleanFilter}&quot;
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-80 max-h-80 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200/90 py-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
        Insert Block or Action
      </div>
      <div className="py-1">
        {filteredItems.map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === selectedIndex;
          const isAi = item.type === 'ai';

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.type, item.aiAction)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                isSelected
                  ? isAi
                    ? 'bg-blue-50/90 text-blue-900'
                    : 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isAi
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : isSelected
                    ? 'bg-white text-slate-800 border-slate-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{item.title}</span>
                  {isAi && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                      AI
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
