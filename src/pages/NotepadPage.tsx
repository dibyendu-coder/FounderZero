import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Star,
  Clock,
  Trash2,
  Folder,
  Tag,
  Grid,
  List as ListIcon,
  BookOpen,
  Pin,
  FileText,
  Brain,
  Link2,
  ChevronRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  Compass,
  FlaskConical,
  MoreVertical,
  Edit3,
  RotateCcw
} from 'lucide-react';
import {
  FounderNote,
  NoteTemplate,
  AppState,
  StartupProfile,
  Mission,
  Experiment,
  NoteBlock
} from '../types';
import { NotepadEditor } from '../components/notepad/NotepadEditor';
import { TemplatesModal } from '../components/notepad/TemplatesModal';
import { AiNoteSearchModal } from '../components/notepad/AiNoteSearchModal';

interface NotepadPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  navigate?: (route: string) => void;
}

export const NotepadPage: React.FC<NotepadPageProps> = ({
  state,
  updateState,
  navigate
}) => {
  const notes: FounderNote[] = state.notes || [];
  const collections: string[] = state.noteCollections || [
    'Ideas',
    'Product',
    'Customers',
    'Research',
    'Marketing',
    'Growth',
    'Experiments',
    'Meetings',
    'Strategy',
    'Technical',
    'Fundraising',
    'Personal'
  ];

  // Active view states
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [sidebarFilter, setSidebarFilter] = useState<
    'all' | 'favorites' | 'recent' | 'trash' | string
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [aiSearchModalOpen, setAiSearchModalOpen] = useState(false);
  const [newCollectionInputOpen, setNewCollectionInputOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Cross-tab real-time sync via BroadcastChannel (Requirement 6)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('founderzero_notepad_sync');
      channel.onmessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SYNC_NOTES' && Array.isArray(event.data.notes)) {
          updateState(prev => ({
            ...prev,
            notes: event.data.notes
          }));
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment');
    }

    return () => {
      if (channel) channel.close();
    };
  }, [updateState]);

  // Broadcast helper
  const broadcastNotesUpdate = (newNotes: FounderNote[]) => {
    try {
      const channel = new BroadcastChannel('founderzero_notepad_sync');
      channel.postMessage({ type: 'SYNC_NOTES', notes: newNotes });
      channel.close();
    } catch (e) {
      // broadcast fallback
    }
  };

  // State update handlers
  const handleUpdateNote = (updatedNote: FounderNote) => {
    updateState(prev => {
      const currentNotes = prev.notes || [];
      const updatedNotes = currentNotes.map(n =>
        n.id === updatedNote.id ? updatedNote : n
      );
      broadcastNotesUpdate(updatedNotes);
      return { ...prev, notes: updatedNotes };
    });
  };

  const handleCreateNote = (template?: NoteTemplate) => {
    const newNoteId = `note-${Date.now()}`;
    const defaultCollection = template ? template.defaultCollection : 'Ideas';
    const defaultTags = template ? template.defaultTags : [];

    let initialBlocks: NoteBlock[] = [
      { id: `block-${Date.now()}-1`, type: 'paragraph', content: '' }
    ];

    if (template && template.blocks.length > 0) {
      initialBlocks = template.blocks.map((b, i) => ({
        ...b,
        id: `block-${Date.now()}-${i}`
      }));
    }

    const newNote: FounderNote = {
      id: newNoteId,
      title: template ? `${template.name}` : 'Untitled Note',
      collection: defaultCollection,
      tags: defaultTags,
      blocks: initialBlocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isFavorite: false,
      isTrash: false,
      includeInKnowledgeBase: true,
      connections: [],
      version: 1
    };

    updateState(prev => {
      const nextNotes = [newNote, ...(prev.notes || [])];
      broadcastNotesUpdate(nextNotes);
      return { ...prev, notes: nextNotes };
    });

    setActiveNoteId(newNoteId);
  };

  const handleDeleteNote = (noteId: string) => {
    updateState(prev => {
      const updated = (prev.notes || []).map(n =>
        n.id === noteId ? { ...n, isTrash: true, updatedAt: new Date().toISOString() } : n
      );
      broadcastNotesUpdate(updated);
      return { ...prev, notes: updated };
    });
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
    }
  };

  const handleRestoreNote = (noteId: string) => {
    updateState(prev => {
      const updated = (prev.notes || []).map(n =>
        n.id === noteId ? { ...n, isTrash: false, updatedAt: new Date().toISOString() } : n
      );
      broadcastNotesUpdate(updated);
      return { ...prev, notes: updated };
    });
  };

  const handlePermanentDelete = (noteId: string) => {
    updateState(prev => {
      const updated = (prev.notes || []).filter(n => n.id !== noteId);
      broadcastNotesUpdate(updated);
      return { ...prev, notes: updated };
    });
  };

  const handleEmptyTrash = () => {
    updateState(prev => {
      const updated = (prev.notes || []).filter(n => !n.isTrash);
      broadcastNotesUpdate(updated);
      return { ...prev, notes: updated };
    });
  };

  const handleDuplicateNote = (note: FounderNote) => {
    const duplicated: FounderNote = {
      ...note,
      id: `note-${Date.now()}`,
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isTrash: false,
      version: 1
    };

    updateState(prev => {
      const updated = [duplicated, ...(prev.notes || [])];
      broadcastNotesUpdate(updated);
      return { ...prev, notes: updated };
    });
  };

  const handleAddCollection = () => {
    const trimmed = newCollectionName.trim();
    if (!trimmed) return;
    if (collections.includes(trimmed)) return;

    const nextCollections = [...collections, trimmed];
    updateState(prev => ({
      ...prev,
      noteCollections: nextCollections
    }));
    setNewCollectionName('');
    setNewCollectionInputOpen(false);
    setSidebarFilter(trimmed);
  };

  // Convert handlers to save into AppState (Requirements 10 & 11)
  const handleCreateMission = (mission: Mission) => {
    updateState(prev => ({
      ...prev,
      missions: [mission, ...(prev.missions || [])],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Mission Created from Note',
          message: `"${mission.title}" was added to your Founder Missions.`,
          timestamp: 'Just now',
          read: false,
          type: 'mission'
        },
        ...(prev.notifications || [])
      ]
    }));
  };

  const handleCreateExperiment = (experiment: Experiment) => {
    updateState(prev => ({
      ...prev,
      experiments: [experiment, ...(prev.experiments || [])],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Experiment Created from Note',
          message: `"${experiment.title}" is now active in your Experiment Lab.`,
          timestamp: 'Just now',
          read: false,
          type: 'insight'
        },
        ...(prev.notifications || [])
      ]
    }));
  };

  // Filter notes based on active sidebar filter & search & tags
  const activeNote = notes.find(n => n.id === activeNoteId);

  const nonTrashNotes = notes.filter(n => !n.isTrash);
  const trashNotes = notes.filter(n => n.isTrash);
  const favoriteNotes = nonTrashNotes.filter(n => n.isFavorite);

  // Compute all unique tags for filter pills
  const allTags = Array.from(
    new Set(nonTrashNotes.flatMap(n => n.tags || []))
  ).filter(Boolean);

  let filteredNotes = notes.filter(n => {
    if (sidebarFilter === 'trash') {
      return n.isTrash;
    }
    if (n.isTrash) return false;

    if (sidebarFilter === 'favorites') {
      return n.isFavorite;
    }
    if (sidebarFilter === 'recent') {
      return true; // will sort by updated
    }
    if (sidebarFilter !== 'all') {
      return n.collection === sidebarFilter;
    }
    return true;
  });

  // Apply search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredNotes = filteredNotes.filter(n => {
      const inTitle = n.title.toLowerCase().includes(q);
      const inCollection = n.collection.toLowerCase().includes(q);
      const inTags = (n.tags || []).some(t => t.toLowerCase().includes(q));
      const inContent = (n.blocks || []).some(b => (b.content || '').toLowerCase().includes(q));
      return inTitle || inCollection || inTags || inContent;
    });
  }

  // Apply tag filter
  if (selectedTag) {
    filteredNotes = filteredNotes.filter(n => (n.tags || []).includes(selectedTag));
  }

  // Sort notes (pinned always on top unless in trash)
  filteredNotes.sort((a, b) => {
    if (sidebarFilter !== 'trash') {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }

    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // default updated
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // If a note is being edited, show the full distraction-free editor
  if (activeNoteId && activeNote) {
    return (
      <NotepadEditor
        note={activeNote}
        onUpdateNote={handleUpdateNote}
        onBack={() => setActiveNoteId(null)}
        onDeleteNote={handleDeleteNote}
        onDuplicateNote={handleDuplicateNote}
        collections={collections}
        state={state}
        navigate={navigate}
        onCreateMission={handleCreateMission}
        onCreateExperiment={handleCreateExperiment}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      {/* Top Banner Navigation Bar (Requirement 1: Notepad Home) */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                My Notepad
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
                {nonTrashNotes.length} notes
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Your startup&apos;s thinking space. Structured ideation, customer notes, and strategic roadmapping.
            </p>
          </div>

          {/* Top Navigation Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AI Search / Query Shortcut */}
            <button
              onClick={() => setAiSearchModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-blue-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs group"
            >
              <Sparkles size={14} className="text-blue-600 group-hover:scale-110 transition" />
              <span>Search Notes</span>
            </button>

            {/* Templates Library */}
            <button
              onClick={() => setTemplatesModalOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <BookOpen size={14} className="text-slate-500" />
              <span>Templates</span>
            </button>

            {/* Favorites Shortcut */}
            <button
              onClick={() => setSidebarFilter(sidebarFilter === 'favorites' ? 'all' : 'favorites')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                sidebarFilter === 'favorites'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Star size={14} className={sidebarFilter === 'favorites' ? 'fill-amber-500 text-amber-500' : 'text-slate-400'} />
              <span className="hidden sm:inline">Favorites</span>
              <span className="text-[10px] font-mono font-bold">({favoriteNotes.length})</span>
            </button>

            {/* Recently Edited Shortcut */}
            <button
              onClick={() => {
                setSidebarFilter('recent');
                setSortBy('updated');
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                sidebarFilter === 'recent'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Clock size={14} className={sidebarFilter === 'recent' ? 'text-blue-600' : 'text-slate-400'} />
              <span className="hidden sm:inline">Recently Edited</span>
            </button>

            {/* New Note Main CTA */}
            <button
              onClick={() => handleCreateNote()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>New Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Sidebar + Note Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6">
        {/* Left Filter & Collections Sidebar (Requirement 1: Sidebar Navigation) */}
        <div className="md:col-span-3 space-y-5">
          {/* Main Navigation Views */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 px-3 py-1.5">
              Views
            </div>

            <button
              onClick={() => {
                setSidebarFilter('all');
                setSelectedTag(null);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                sidebarFilter === 'all' && !selectedTag
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={14} />
                <span>All Notes</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-bold">
                {nonTrashNotes.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSidebarFilter('favorites');
                setSelectedTag(null);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                sidebarFilter === 'favorites'
                  ? 'bg-amber-50 text-amber-800'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-500" />
                <span>Favorites</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-bold">
                {favoriteNotes.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSidebarFilter('recent');
                setSelectedTag(null);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                sidebarFilter === 'recent'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Recent</span>
              </div>
            </button>

            <button
              onClick={() => {
                setSidebarFilter('trash');
                setSelectedTag(null);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                sidebarFilter === 'trash'
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 size={14} />
                <span>Trash</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-bold">
                {trashNotes.length}
              </span>
            </button>
          </div>

          {/* Collections Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                Collections
              </span>
              <button
                onClick={() => setNewCollectionInputOpen(true)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                title="Add custom collection"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            </div>

            {newCollectionInputOpen && (
              <div className="px-2 py-1.5 bg-slate-50 rounded-xl mb-1 flex items-center gap-1">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddCollection();
                    if (e.key === 'Escape') setNewCollectionInputOpen(false);
                  }}
                  placeholder="Collection name..."
                  autoFocus
                  className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
                <button
                  onClick={handleAddCollection}
                  className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  +
                </button>
              </div>
            )}

            <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
              {collections.map(col => {
                const count = nonTrashNotes.filter(n => n.collection === col).length;
                const isSelected = sidebarFilter === col;
                return (
                  <button
                    key={col}
                    onClick={() => {
                      setSidebarFilter(col);
                      setSelectedTag(null);
                    }}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder size={13} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="truncate">{col}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-bold">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Cloud Filter */}
          {allTags.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                  Filter by Tag
                </span>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Note Grid / List Container */}
        <div className="md:col-span-9 space-y-4">
          {/* Search, Filter & Layout Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Quick Search */}
            <div className="relative w-full sm:w-80">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter current notes..."
                className="w-full text-xs font-medium pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Sorting & Layout Toggles */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ArrowUpDown size={13} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="created">Date Created</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>

              {/* Grid / List Switch */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded-md transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Grid view"
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded-md transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="List view"
                >
                  <ListIcon size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Trash Empty Banner if on Trash view */}
          {sidebarFilter === 'trash' && trashNotes.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                <Trash2 size={16} />
                <span>Notes in trash will remain until cleared permanently.</span>
              </div>
              <button
                onClick={handleEmptyTrash}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-2xs"
              >
                Empty Trash Permanently
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                <FileText size={24} />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-slate-900">
                  {sidebarFilter === 'trash'
                    ? 'Trash is empty'
                    : sidebarFilter === 'favorites'
                    ? 'No favorite notes yet'
                    : searchQuery
                    ? 'No notes match your filter'
                    : 'No notes in this collection'}
                </h3>
                <p className="text-xs text-slate-500">
                  {sidebarFilter === 'trash'
                    ? 'Deleted notes will appear here.'
                    : 'Create a new note or choose from one of the startup frameworks to begin.'}
                </p>
              </div>
              {sidebarFilter !== 'trash' && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleCreateNote()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Create Note</span>
                  </button>
                  <button
                    onClick={() => setTemplatesModalOpen(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Use Template
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map(note => {
                const excerpt = (note.blocks || [])
                  .map(b => b.content)
                  .filter(Boolean)
                  .join(' ')
                  .slice(0, 140);

                const hasConnections = (note.connections || []).length > 0;

                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      if (!note.isTrash) setActiveNoteId(note.id);
                    }}
                    className={`bg-white rounded-2xl border transition p-4 flex flex-col justify-between group shadow-2xs hover:shadow-md ${
                      note.isTrash
                        ? 'border-slate-200 opacity-80'
                        : 'border-slate-200/90 hover:border-blue-400 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                            {note.collection}
                          </span>
                          {note.isPinned && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold flex items-center gap-1">
                              <Pin size={10} />
                              Pinned
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {note.includeInKnowledgeBase && (
                            <span title="Indexed in AI Knowledge Base">
                              <Brain size={13} className="text-indigo-600" />
                            </span>
                          )}
                          {note.isFavorite && (
                            <Star size={13} className="fill-amber-500 text-amber-500" />
                          )}
                        </div>
                      </div>

                      {/* Title & Excerpt */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                          {note.title || 'Untitled Note'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed font-normal">
                          {excerpt || <span className="italic text-slate-400">Empty note...</span>}
                        </p>
                      </div>

                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {note.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 border border-slate-100"
                            >
                              #{tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-[10px] text-slate-400">
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Connected Badges */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        {hasConnections && (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Link2 size={11} />
                            {note.connections?.length} linked
                          </span>
                        )}
                      </div>

                      {note.isTrash ? (
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleRestoreNote(note.id)}
                            className="p-1 text-slate-600 hover:text-blue-600 transition"
                            title="Restore note"
                          >
                            <RotateCcw size={13} />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(note.id)}
                            className="p-1 text-rose-600 hover:text-rose-700 transition"
                            title="Delete permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <ChevronRight
                          size={14}
                          className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {filteredNotes.map(note => {
                const excerpt = (note.blocks || [])
                  .map(b => b.content)
                  .filter(Boolean)
                  .join(' ')
                  .slice(0, 80);

                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      if (!note.isTrash) setActiveNoteId(note.id);
                    }}
                    className={`p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition group ${
                      note.isTrash ? 'opacity-70' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0">
                        {note.isFavorite ? (
                          <Star size={15} className="fill-amber-500 text-amber-500" />
                        ) : (
                          <FileText size={15} className="text-slate-400 group-hover:text-blue-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                            {note.title || 'Untitled Note'}
                          </span>
                          {note.isPinned && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-50 text-blue-700 font-bold">
                              PIN
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {note.collection}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{excerpt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                      {note.connections && note.connections.length > 0 && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium text-[11px]">
                          <Link2 size={11} />
                          {note.connections.length}
                        </span>
                      )}
                      <span className="text-[11px] font-mono">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      {note.isTrash ? (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleRestoreNote(note.id)}
                            className="p-1 hover:text-blue-600"
                            title="Restore"
                          >
                            <RotateCcw size={13} />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(note.id)}
                            className="p-1 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Templates Library Modal */}
      <TemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onUseTemplate={tpl => handleCreateNote(tpl)}
        onCreateBlank={() => handleCreateNote()}
      />

      {/* AI Natural Language Note Search Modal */}
      <AiNoteSearchModal
        isOpen={aiSearchModalOpen}
        onClose={() => setAiSearchModalOpen(false)}
        notes={notes}
        profile={state.profile}
        onSelectNote={id => setActiveNoteId(id)}
      />
    </div>
  );
};
