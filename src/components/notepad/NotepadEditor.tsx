import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Link2,
  Bookmark,
  Star,
  Pin,
  Trash2,
  Copy,
  Plus,
  GripVertical,
  Check,
  CheckSquare,
  Square,
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Compass,
  FileText,
  Code2,
  Table as TableIcon,
  Tag,
  Folder,
  Calendar,
  Clock,
  MoreHorizontal,
  ChevronDown,
  ExternalLink,
  Brain,
  FlaskConical,
  X,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
  List,
  ListOrdered
} from 'lucide-react';
import {
  FounderNote,
  NoteBlock,
  NoteBlockType,
  NoteConnection,
  StartupProfile,
  AppState,
  Mission,
  Experiment
} from '../../types';
import { SlashCommandMenu } from './SlashCommandMenu';
import { NoteConnectionsModal } from './NoteConnectionsModal';
import { AiActionModal } from './AiActionModal';
import { ConvertActionModal } from './ConvertActionModal';

interface NotepadEditorProps {
  note: FounderNote;
  onUpdateNote: (updatedNote: FounderNote) => void;
  onBack: () => void;
  onDeleteNote: (noteId: string) => void;
  onDuplicateNote: (note: FounderNote) => void;
  collections: string[];
  state: AppState;
  navigate?: (route: string) => void;
  onCreateMission?: (mission: Mission) => void;
  onCreateExperiment?: (experiment: Experiment) => void;
}

export const NotepadEditor: React.FC<NotepadEditorProps> = ({
  note,
  onUpdateNote,
  onBack,
  onDeleteNote,
  onDuplicateNote,
  collections,
  state,
  navigate,
  onCreateMission,
  onCreateExperiment
}) => {
  // Local state for smooth editing
  const [currentNote, setCurrentNote] = useState<FounderNote>(note);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuBlockIndex, setSlashMenuBlockIndex] = useState<number | null>(null);
  const [slashFilterText, setSlashFilterText] = useState('');
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ top: number; left: number } | undefined>(undefined);

  // Modals
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);
  const [aiActionModalOpen, setAiActionModalOpen] = useState(false);
  const [aiActionType, setAiActionType] = useState('summarize');
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertTargetType, setConvertTargetType] = useState<'mission' | 'experiment'>('mission');
  const [tagInputOpen, setTagInputOpen] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blockInputRefs = useRef<(HTMLTextAreaElement | HTMLInputElement | null)[]>([]);

  // Update when note prop changes
  useEffect(() => {
    setCurrentNote(note);
  }, [note.id]);

  // Debounced auto-save handler (Requirement 4)
  const triggerAutoSave = useCallback(
    (updated: FounderNote) => {
      setSaveStatus('saving');
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        const noteWithTimestamp = {
          ...updated,
          updatedAt: new Date().toISOString(),
          version: (updated.version || 1) + 1
        };
        onUpdateNote(noteWithTimestamp);
        setSaveStatus('saved');
      }, 500);
    },
    [onUpdateNote]
  );

  const handleTitleChange = (newTitle: string) => {
    const updated = { ...currentNote, title: newTitle };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleCollectionChange = (newCollection: string) => {
    const updated = { ...currentNote, collection: newCollection };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (!cleanTag) return;
    if (currentNote.tags && currentNote.tags.includes(cleanTag)) return;
    const updated = {
      ...currentNote,
      tags: [...(currentNote.tags || []), cleanTag]
    };
    setCurrentNote(updated);
    triggerAutoSave(updated);
    setNewTagText('');
    setTagInputOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = {
      ...currentNote,
      tags: (currentNote.tags || []).filter(t => t !== tagToRemove)
    };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleToggleFavorite = () => {
    const updated = { ...currentNote, isFavorite: !currentNote.isFavorite };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleTogglePinned = () => {
    const updated = { ...currentNote, isPinned: !currentNote.isPinned };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleToggleKnowledgeBase = () => {
    const updated = {
      ...currentNote,
      includeInKnowledgeBase: !currentNote.includeInKnowledgeBase
    };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  // Block Manipulation Methods (Requirement 2 & 3)
  const handleUpdateBlockContent = (index: number, newContent: string) => {
    const updatedBlocks = [...currentNote.blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      content: newContent
    };
    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);

    // Check if user typed slash command
    if (newContent.startsWith('/')) {
      setSlashMenuOpen(true);
      setSlashMenuBlockIndex(index);
      setSlashFilterText(newContent);
    } else if (slashMenuOpen && slashMenuBlockIndex === index) {
      setSlashMenuOpen(false);
      setSlashMenuBlockIndex(null);
    }
  };

  const handleToggleChecklist = (index: number) => {
    const updatedBlocks = [...currentNote.blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      checked: !updatedBlocks[index].checked
    };
    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleChangeBlockType = (index: number, newType: NoteBlockType, extraData?: any) => {
    const updatedBlocks = [...currentNote.blocks];
    const currentBlock = updatedBlocks[index];
    
    // Clean slash command prefix if present
    const cleanContent = currentBlock.content.replace(/^\/[a-zA-Z0-9_-]*/, '').trim();

    updatedBlocks[index] = {
      ...currentBlock,
      type: newType,
      content: cleanContent,
      ...(newType === 'table' && !currentBlock.tableData
        ? {
            tableData: {
              headers: ['Item / Milestone', 'Status', 'Owner', 'Outcome'],
              rows: [
                ['Initial prototype validation', 'In Progress', 'Founder', 'Pending user testing'],
                ['Zero-cost telemetry script', 'Complete', 'Founder', 'Running in prod']
              ]
            }
          }
        : {}),
      ...(newType === 'callout' && !currentBlock.calloutVariant
        ? { calloutVariant: 'idea' }
        : {}),
      ...extraData
    };

    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
    setSlashMenuOpen(false);
    setSlashMenuBlockIndex(null);
  };

  const handleInsertBlockAfter = (index: number, type: NoteBlockType = 'paragraph') => {
    const newBlock: NoteBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      content: '',
      ...(type === 'checklist' ? { checked: false } : {})
    };

    const updatedBlocks = [...currentNote.blocks];
    updatedBlocks.splice(index + 1, 0, newBlock);
    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);

    setTimeout(() => {
      const nextRef = blockInputRefs.current[index + 1];
      if (nextRef) {
        nextRef.focus();
      }
    }, 50);
  };

  const handleDeleteBlock = (index: number) => {
    if (currentNote.blocks.length <= 1) {
      // Reset to single empty block instead of empty array
      const resetBlocks: NoteBlock[] = [
        { id: `block-${Date.now()}`, type: 'paragraph', content: '' }
      ];
      const updated = { ...currentNote, blocks: resetBlocks };
      setCurrentNote(updated);
      triggerAutoSave(updated);
      return;
    }

    const updatedBlocks = currentNote.blocks.filter((_, i) => i !== index);
    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);

    setTimeout(() => {
      const targetIndex = Math.max(0, index - 1);
      const prevRef = blockInputRefs.current[targetIndex];
      if (prevRef) {
        prevRef.focus();
      }
    }, 50);
  };

  const handleDuplicateBlock = (index: number) => {
    const targetBlock = currentNote.blocks[index];
    const duplicated: NoteBlock = {
      ...targetBlock,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    const updatedBlocks = [...currentNote.blocks];
    updatedBlocks.splice(index + 1, 0, duplicated);
    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentNote.blocks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedBlocks = [...currentNote.blocks];
    const temp = updatedBlocks[index];
    updatedBlocks[index] = updatedBlocks[targetIndex];
    updatedBlocks[targetIndex] = temp;

    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  // Table specific handlers
  const handleUpdateTableCell = (
    blockIndex: number,
    rowIndex: number,
    colIndex: number,
    val: string
  ) => {
    const updatedBlocks = [...currentNote.blocks];
    const block = updatedBlocks[blockIndex];
    if (!block.tableData) return;

    const newRows = block.tableData.rows.map((row, r) =>
      r === rowIndex ? row.map((cell, c) => (c === colIndex ? val : cell)) : row
    );

    updatedBlocks[blockIndex] = {
      ...block,
      tableData: {
        ...block.tableData,
        rows: newRows
      }
    };

    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleUpdateTableHeader = (blockIndex: number, colIndex: number, val: string) => {
    const updatedBlocks = [...currentNote.blocks];
    const block = updatedBlocks[blockIndex];
    if (!block.tableData) return;

    const newHeaders = block.tableData.headers.map((h, c) => (c === colIndex ? val : h));

    updatedBlocks[blockIndex] = {
      ...block,
      tableData: {
        ...block.tableData,
        headers: newHeaders
      }
    };

    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleAddTableRow = (blockIndex: number) => {
    const updatedBlocks = [...currentNote.blocks];
    const block = updatedBlocks[blockIndex];
    if (!block.tableData) return;

    const emptyRow = new Array(block.tableData.headers.length).fill('');
    updatedBlocks[blockIndex] = {
      ...block,
      tableData: {
        ...block.tableData,
        rows: [...block.tableData.rows, emptyRow]
      }
    };

    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  const handleAddTableColumn = (blockIndex: number) => {
    const updatedBlocks = [...currentNote.blocks];
    const block = updatedBlocks[blockIndex];
    if (!block.tableData) return;

    const newHeaders = [...block.tableData.headers, `Column ${block.tableData.headers.length + 1}`];
    const newRows = block.tableData.rows.map(row => [...row, '']);

    updatedBlocks[blockIndex] = {
      ...block,
      tableData: {
        headers: newHeaders,
        rows: newRows
      }
    };

    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  // AI Block Application
  const handleApplyAiBlocks = (blocks: NoteBlock[], mode: 'replace' | 'append') => {
    let updatedBlocks: NoteBlock[];
    if (mode === 'replace') {
      updatedBlocks = blocks;
    } else {
      updatedBlocks = [...currentNote.blocks, ...blocks];
    }
    const updated = { ...currentNote, blocks: updatedBlocks };
    setCurrentNote(updated);
    triggerAutoSave(updated);
  };

  // Action detection logic (Requirements 10 & 11)
  const fullText = (currentNote.blocks || []).map(b => b.content).join('\n');
  const hasActionableIntent =
    /need to|must|deadline|before Friday|by next week|schedule|interview \d+|launch/i.test(fullText);
  const hasHypothesisIntent =
    /if we|i think|hypothesis|will improve|reduction in|conversion will|increase from/i.test(
      fullText
    );

  // Word count & Reading time calculation
  const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex-1 flex flex-col bg-white min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Editor Header Navigation Bar */}
      <div className="px-4 sm:px-8 py-3 border-b border-slate-100 flex items-center justify-between gap-3 sticky top-0 bg-white/95 backdrop-blur-xs z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Back to notes list"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Collection Selector */}
          <div className="relative flex items-center">
            <select
              value={currentNote.collection}
              onChange={e => handleCollectionChange(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border-0 focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none pr-6 font-mono"
            >
              {collections.map(col => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-500" />
          </div>

          {/* Save Status Indicator (Requirement 4) */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            {saveStatus === 'saving' ? (
              <span className="text-amber-600 font-medium animate-pulse">Saving...</span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Check size={11} className="text-emerald-500" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ask AI Writing Button */}
          <button
            onClick={() => {
              setAiActionType('summarize');
              setAiActionModalOpen(true);
            }}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles size={13} className="text-blue-600" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Workspace Connections Button (Requirement 9) */}
          <button
            onClick={() => setConnectionsModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
              (currentNote.connections || []).length > 0
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
            title="Link note to Missions, Experiments, Metrics, etc."
          >
            <Link2 size={13} />
            <span className="hidden sm:inline">Connect</span>
            {(currentNote.connections || []).length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-bold">
                {currentNote.connections?.length}
              </span>
            )}
          </button>

          {/* Knowledge Base Sync Toggle (Requirement 13) */}
          <button
            onClick={handleToggleKnowledgeBase}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              currentNote.includeInKnowledgeBase
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'text-slate-400 hover:text-slate-600 border-slate-200'
            }`}
            title={
              currentNote.includeInKnowledgeBase
                ? 'Indexed in Founder AI Knowledge Base'
                : 'Excluded from AI Knowledge Base'
            }
          >
            <Brain size={15} />
          </button>

          {/* Favorite & Pin */}
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              currentNote.isFavorite
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'text-slate-400 hover:text-slate-600 border-slate-200'
            }`}
            title={currentNote.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star size={15} className={currentNote.isFavorite ? 'fill-amber-500' : ''} />
          </button>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
            >
              <MoreHorizontal size={15} />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleTogglePinned();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Pin size={13} className={currentNote.isPinned ? 'text-blue-600' : ''} />
                    <span>{currentNote.isPinned ? 'Unpin Note' : 'Pin to Top'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onDuplicateNote(currentNote);
                      setMoreMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>Duplicate Note</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `# ${currentNote.title}\n\n${fullText}`
                      );
                      setMoreMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText size={13} />
                    <span>Copy as Markdown</span>
                  </button>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      onDeleteNote(currentNote.id);
                      setMoreMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Move to Trash</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Intent Banner (Requirements 10 & 11) */}
      {(hasActionableIntent || hasHypothesisIntent) && (
        <div className="px-4 sm:px-8 py-2 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-slate-50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600 shrink-0" />
            <span className="text-xs text-slate-800 font-medium">
              {hasHypothesisIntent
                ? 'Hypothesis detected in this note: Convert into an empirical experiment?'
                : 'Actionable deadline detected: Convert into a Founder Mission?'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasActionableIntent && (
              <button
                onClick={() => {
                  setConvertTargetType('mission');
                  setConvertModalOpen(true);
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              >
                <Compass size={12} />
                <span>Turn into Mission</span>
              </button>
            )}
            {hasHypothesisIntent && (
              <button
                onClick={() => {
                  setConvertTargetType('experiment');
                  setConvertModalOpen(true);
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              >
                <FlaskConical size={12} />
                <span>Turn into Experiment</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Canvas Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-12 md:px-24 py-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={currentNote.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Untitled Founder Note..."
            className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 placeholder:text-slate-300 border-0 focus:outline-hidden focus:ring-0 p-0 leading-tight bg-transparent"
          />
        </div>

        {/* Metadata & Tag Ribbon */}
        <div className="flex flex-wrap items-center gap-3 py-2 border-y border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            <span>Updated {new Date(currentNote.updatedAt).toLocaleDateString()}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Clock size={13} className="text-slate-400" />
            <span>{wordCount} words</span>
            <span>({readingTime} min read)</span>
          </div>

          <span className="text-slate-300">•</span>

          {/* Tags List */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(currentNote.tags || []).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium group"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            ))}

            {tagInputOpen ? (
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newTagText}
                  onChange={e => setNewTagText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddTag(newTagText);
                    if (e.key === 'Escape') setTagInputOpen(false);
                  }}
                  placeholder="tag name..."
                  autoFocus
                  className="w-24 text-[11px] px-1.5 py-0.5 border border-blue-400 rounded bg-white"
                />
                <button
                  onClick={() => handleAddTag(newTagText)}
                  className="text-xs text-blue-600 font-bold px-1"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => setTagInputOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-blue-600 px-1.5 py-0.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition cursor-pointer"
              >
                <Tag size={10} />
                <span>Add tag</span>
              </button>
            )}
          </div>
        </div>

        {/* Connected Entities Chips */}
        {currentNote.connections && currentNote.connections.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-mono font-semibold uppercase text-slate-500 flex items-center gap-1">
              <Link2 size={12} />
              Connected Items:
            </span>
            {currentNote.connections.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  if (navigate) {
                    if (c.entityType === 'mission') navigate('missions');
                    else if (c.entityType === 'experiment') navigate('experiments');
                    else if (c.entityType === 'metric') navigate('metrics');
                    else if (c.entityType === 'customer') navigate('customers');
                    else if (c.entityType === 'resource') navigate('vault');
                    else if (c.entityType === 'goal') navigate('settings');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-700 shadow-2xs transition cursor-pointer group"
              >
                <span className="text-[9px] font-mono uppercase px-1 rounded bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-700">
                  {c.entityType}
                </span>
                <span className="truncate max-w-[160px]">{c.entityTitle}</span>
                <ExternalLink size={10} className="text-slate-400 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        )}

        {/* Document Blocks List */}
        <div className="space-y-3 pb-24 relative">
          {currentNote.blocks.map((block, index) => (
            <div
              key={block.id}
              className="group relative flex items-start gap-2 pl-6 sm:pl-8 -ml-6 sm:-ml-8 transition-colors rounded-lg"
            >
              {/* Block Drag / Action Handle */}
              <div className="absolute left-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white border border-slate-200 rounded-md shadow-2xs px-0.5 py-0.5 z-10">
                <button
                  onClick={() => handleMoveBlock(index, 'up')}
                  disabled={index === 0}
                  className="text-slate-400 hover:text-slate-700 p-0.5 disabled:opacity-30 cursor-pointer"
                  title="Move up"
                >
                  <ChevronDown size={11} className="rotate-180" />
                </button>
                <button
                  onClick={() => handleMoveBlock(index, 'down')}
                  disabled={index === currentNote.blocks.length - 1}
                  className="text-slate-400 hover:text-slate-700 p-0.5 disabled:opacity-30 cursor-pointer"
                  title="Move down"
                >
                  <ChevronDown size={11} />
                </button>
                <button
                  onClick={() => handleDuplicateBlock(index)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Duplicate block"
                >
                  <Copy size={11} />
                </button>
                <button
                  onClick={() => handleDeleteBlock(index)}
                  className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                  title="Delete block"
                >
                  <Trash2 size={11} />
                </button>
              </div>

              {/* Block Content Renderers based on block.type */}
              <div className="flex-1 min-w-0">
                {/* Paragraph */}
                {block.type === 'paragraph' && (
                  <textarea
                    ref={el => {
                      blockInputRefs.current[index] = el;
                    }}
                    rows={Math.max(1, Math.ceil(block.content.length / 75))}
                    value={block.content}
                    onChange={e => handleUpdateBlockContent(index, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleInsertBlockAfter(index, 'paragraph');
                      } else if (e.key === 'Backspace' && !block.content) {
                        e.preventDefault();
                        handleDeleteBlock(index);
                      }
                    }}
                    placeholder="Type '/' for commands or start writing..."
                    className="w-full text-sm text-slate-800 placeholder:text-slate-300 border-0 focus:outline-hidden focus:ring-0 p-0 leading-relaxed bg-transparent resize-none font-normal"
                  />
                )}

                {/* Heading 1 */}
                {block.type === 'heading1' && (
                  <input
                    ref={el => {
                      blockInputRefs.current[index] = el;
                    }}
                    type="text"
                    value={block.content}
                    onChange={e => handleUpdateBlockContent(index, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInsertBlockAfter(index, 'paragraph');
                      } else if (e.key === 'Backspace' && !block.content) {
                        e.preventDefault();
                        handleChangeBlockType(index, 'paragraph');
                      }
                    }}
                    placeholder="Heading 1"
                    className="w-full text-xl font-bold text-slate-900 placeholder:text-slate-300 border-0 focus:outline-hidden focus:ring-0 p-0 leading-tight bg-transparent"
                  />
                )}

                {/* Heading 2 */}
                {block.type === 'heading2' && (
                  <input
                    ref={el => {
                      blockInputRefs.current[index] = el;
                    }}
                    type="text"
                    value={block.content}
                    onChange={e => handleUpdateBlockContent(index, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInsertBlockAfter(index, 'paragraph');
                      } else if (e.key === 'Backspace' && !block.content) {
                        e.preventDefault();
                        handleChangeBlockType(index, 'paragraph');
                      }
                    }}
                    placeholder="Heading 2"
                    className="w-full text-base font-bold text-slate-900 placeholder:text-slate-300 border-0 focus:outline-hidden focus:ring-0 p-0 leading-tight bg-transparent mt-2"
                  />
                )}

                {/* Heading 3 */}
                {block.type === 'heading3' && (
                  <input
                    ref={el => {
                      blockInputRefs.current[index] = el;
                    }}
                    type="text"
                    value={block.content}
                    onChange={e => handleUpdateBlockContent(index, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInsertBlockAfter(index, 'paragraph');
                      } else if (e.key === 'Backspace' && !block.content) {
                        e.preventDefault();
                        handleChangeBlockType(index, 'paragraph');
                      }
                    }}
                    placeholder="Heading 3"
                    className="w-full text-sm font-bold text-slate-800 placeholder:text-slate-300 border-0 focus:outline-hidden focus:ring-0 p-0 leading-tight bg-transparent mt-1"
                  />
                )}

                {/* Checklist Block */}
                {block.type === 'checklist' && (
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => handleToggleChecklist(index)}
                      className="mt-0.5 text-blue-600 hover:text-blue-700 transition cursor-pointer shrink-0"
                    >
                      {block.checked ? (
                        <CheckSquare size={16} className="text-blue-600" />
                      ) : (
                        <Square size={16} className="text-slate-400" />
                      )}
                    </button>
                    <input
                      ref={el => {
                        blockInputRefs.current[index] = el;
                      }}
                      type="text"
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(index, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInsertBlockAfter(index, 'checklist');
                        } else if (e.key === 'Backspace' && !block.content) {
                          e.preventDefault();
                          handleChangeBlockType(index, 'paragraph');
                        }
                      }}
                      placeholder="To-do item..."
                      className={`w-full text-sm border-0 focus:outline-hidden focus:ring-0 p-0 leading-relaxed bg-transparent ${
                        block.checked ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    />
                  </div>
                )}

                {/* Bullet List Block */}
                {block.type === 'bulletList' && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-500 font-bold select-none">•</span>
                    <input
                      ref={el => {
                        blockInputRefs.current[index] = el;
                      }}
                      type="text"
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(index, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInsertBlockAfter(index, 'bulletList');
                        } else if (e.key === 'Backspace' && !block.content) {
                          e.preventDefault();
                          handleChangeBlockType(index, 'paragraph');
                        }
                      }}
                      placeholder="List item..."
                      className="w-full text-sm text-slate-800 placeholder:text-slate-300 border-0 focus:outline-hidden focus:ring-0 p-0 leading-relaxed bg-transparent"
                    />
                  </div>
                )}

                {/* Numbered List Block */}
                {block.type === 'numberedList' && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-400 select-none mt-0.5">
                      1.
                    </span>
                    <input
                      ref={el => {
                        blockInputRefs.current[index] = el;
                      }}
                      type="text"
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(index, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInsertBlockAfter(index, 'numberedList');
                        } else if (e.key === 'Backspace' && !block.content) {
                          e.preventDefault();
                          handleChangeBlockType(index, 'paragraph');
                        }
                      }}
                      placeholder="Sequential step..."
                      className="w-full text-sm text-slate-800 placeholder:text-slate-300 border-0 focus:outline-hidden focus:ring-0 p-0 leading-relaxed bg-transparent"
                    />
                  </div>
                )}

                {/* Quote Block */}
                {block.type === 'quote' && (
                  <div className="border-l-3 border-blue-500 pl-3.5 py-0.5">
                    <textarea
                      ref={el => {
                        blockInputRefs.current[index] = el;
                      }}
                      rows={Math.max(1, Math.ceil(block.content.length / 70))}
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(index, e.target.value)}
                      placeholder="Customer quote or takeaway..."
                      className="w-full text-sm italic text-slate-700 placeholder:text-slate-300 border-0 focus:outline-hidden focus:ring-0 p-0 leading-relaxed bg-transparent resize-none"
                    />
                  </div>
                )}

                {/* Code Block */}
                {block.type === 'code' && (
                  <div className="rounded-xl bg-slate-900 p-3.5 text-slate-100 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                      <span className="uppercase">{block.language || 'typescript'}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(block.content)}
                        className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={11} />
                        <span>Copy</span>
                      </button>
                    </div>
                    <textarea
                      ref={el => {
                        blockInputRefs.current[index] = el;
                      }}
                      rows={Math.max(3, block.content.split('\n').length)}
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(index, e.target.value)}
                      placeholder="// Insert code, payload, or config..."
                      className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 font-mono text-xs border-0 focus:outline-hidden focus:ring-0 p-0 resize-none"
                    />
                  </div>
                )}

                {/* Callout Block */}
                {block.type === 'callout' && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      block.calloutVariant === 'idea'
                        ? 'bg-amber-50/80 border-amber-200/80 text-amber-950'
                        : block.calloutVariant === 'warning'
                        ? 'bg-rose-50/80 border-rose-200/80 text-rose-950'
                        : block.calloutVariant === 'success'
                        ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
                        : block.calloutVariant === 'founder'
                        ? 'bg-indigo-50/80 border-indigo-200/80 text-indigo-950'
                        : 'bg-blue-50/80 border-blue-200/80 text-blue-950'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {block.calloutVariant === 'idea' && <Lightbulb size={16} className="text-amber-600" />}
                      {block.calloutVariant === 'warning' && <AlertTriangle size={16} className="text-rose-600" />}
                      {block.calloutVariant === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
                      {block.calloutVariant === 'founder' && <Compass size={16} className="text-indigo-600" />}
                      {(!block.calloutVariant || block.calloutVariant === 'info') && (
                        <Info size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <textarea
                        ref={el => {
                          blockInputRefs.current[index] = el;
                        }}
                        rows={Math.max(1, Math.ceil(block.content.length / 65))}
                        value={block.content}
                        onChange={e => handleUpdateBlockContent(index, e.target.value)}
                        placeholder="Callout note or key rule..."
                        className="w-full text-xs sm:text-sm font-medium border-0 focus:outline-hidden focus:ring-0 p-0 leading-relaxed bg-transparent resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Table Block */}
                {block.type === 'table' && block.tableData && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs my-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono font-semibold">
                            {block.tableData.headers.map((header, hIdx) => (
                              <th key={hIdx} className="p-2.5 border-r border-slate-200 last:border-r-0">
                                <input
                                  type="text"
                                  value={header}
                                  onChange={e => handleUpdateTableHeader(index, hIdx, e.target.value)}
                                  className="w-full bg-transparent font-bold border-0 focus:outline-hidden p-0 text-slate-800"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {block.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 border-r border-slate-100 last:border-r-0">
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={e =>
                                      handleUpdateTableCell(index, rIdx, cIdx, e.target.value)
                                    }
                                    placeholder="—"
                                    className="w-full bg-transparent border-0 focus:outline-hidden p-0 text-slate-700"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => handleAddTableRow(index)}
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Row</span>
                      </button>
                      <button
                        onClick={() => handleAddTableColumn(index)}
                        className="text-slate-600 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Column</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Divider Block */}
                {block.type === 'divider' && (
                  <div className="py-3 flex items-center">
                    <hr className="w-full border-slate-200" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Append New Block Button */}
          <div className="pt-4 flex items-center gap-2">
            <button
              onClick={() => handleInsertBlockAfter(currentNote.blocks.length - 1, 'paragraph')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-dashed border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Block</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              or type <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">/</code> anywhere to insert
            </span>
          </div>

          {/* Floating Slash Command Menu */}
          {slashMenuOpen && slashMenuBlockIndex !== null && (
            <SlashCommandMenu
              filterText={slashFilterText}
              onSelect={(type, aiAction) => {
                if (type === 'ai') {
                  setAiActionType(aiAction || 'summarize');
                  setAiActionModalOpen(true);
                  setSlashMenuOpen(false);
                } else {
                  handleChangeBlockType(slashMenuBlockIndex, type as NoteBlockType);
                }
              }}
              onClose={() => {
                setSlashMenuOpen(false);
                setSlashMenuBlockIndex(null);
              }}
              position={slashMenuPosition}
            />
          )}
        </div>
      </div>

      {/* Note Connections Modal */}
      <NoteConnectionsModal
        isOpen={connectionsModalOpen}
        onClose={() => setConnectionsModalOpen(false)}
        connections={currentNote.connections || []}
        onUpdateConnections={newConnections => {
          const updated = { ...currentNote, connections: newConnections };
          setCurrentNote(updated);
          triggerAutoSave(updated);
        }}
        state={state}
        noteTitle={currentNote.title}
      />

      {/* AI Writing Action Modal */}
      <AiActionModal
        isOpen={aiActionModalOpen}
        onClose={() => setAiActionModalOpen(false)}
        action={aiActionType}
        noteTitle={currentNote.title}
        noteContent={fullText}
        collection={currentNote.collection}
        profile={state.profile}
        onApplyBlocks={handleApplyAiBlocks}
        onTurnIntoMission={() => {
          setConvertTargetType('mission');
          setConvertModalOpen(true);
        }}
        onTurnIntoExperiment={() => {
          setConvertTargetType('experiment');
          setConvertModalOpen(true);
        }}
      />

      {/* Convert Note to Mission / Experiment Modal */}
      <ConvertActionModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        targetType={convertTargetType}
        noteTitle={currentNote.title}
        noteContent={fullText}
        profile={state.profile}
        onCreateMission={newMission => {
          if (onCreateMission) onCreateMission(newMission);
        }}
        onCreateExperiment={newExperiment => {
          if (onCreateExperiment) onCreateExperiment(newExperiment);
        }}
        onLinkCreatedEntity={connection => {
          const updatedConnections = [...(currentNote.connections || []), connection];
          const updated = { ...currentNote, connections: updatedConnections };
          setCurrentNote(updated);
          triggerAutoSave(updated);
        }}
      />
    </div>
  );
};
