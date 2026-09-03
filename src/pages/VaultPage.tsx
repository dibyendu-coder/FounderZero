import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Plus,
  Search,
  Sparkles,
  Filter,
  FolderHeart,
  Folder,
  Layers,
  FileText,
  Mail,
  BookOpen,
  Video,
  Code2,
  Terminal,
  Clock,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Edit3,
  Bell,
  AlertTriangle,
  FolderPlus,
  ArrowUpDown,
  Tag,
  Share2,
  RefreshCw,
  Globe,
  Loader2,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  Check,
  X
} from 'lucide-react';
import {
  AppState,
  ReadLaterStatus,
  StartupStage,
  UserSavedResource,
  VaultCollection,
  VaultPriority,
  VaultResourceType
} from '../types';
import { SaveResourceModal } from '../components/SaveResourceModal';

interface VaultPageProps {
  state?: AppState;
  onSaveResource: (resource: Partial<UserSavedResource>) => Promise<{ isDuplicate?: boolean; existingId?: string; saved?: UserSavedResource }>;
  onUpdateResource: (resourceId: string, updates: Partial<UserSavedResource>) => Promise<void>;
  onDeleteResource: (resourceId: string) => Promise<void>;
  onCreateCollection: (name: string, description?: string, icon?: string, color?: string) => Promise<void>;
  onDeleteCollection: (collectionId: string) => Promise<void>;
  onNavigateToSection?: (section: string) => void;
}

export const VaultPage: React.FC<VaultPageProps> = ({
  state,
  onSaveResource,
  onUpdateResource,
  onDeleteResource,
  onCreateCollection,
  onDeleteCollection,
  onNavigateToSection
}) => {
  // Tabs: 'all' | 'read-later' | 'collections' | 'unsorted' | 'insights'
  const [activeTab, setActiveTab] = useState<'all' | 'read-later' | 'collections' | 'unsorted' | 'insights'>('all');
  
  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchInsight, setAiSearchInsight] = useState<string | null>(null);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'readingTime'>('newest');

  // Quick save top bar
  const [quickUrl, setQuickUrl] = useState('');
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  // Modals & Editors
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<UserSavedResource | null>(null);
  const [quickNoteResourceId, setQuickNoteResourceId] = useState<string | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');

  // Collections state
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#0052FF');

  // Batch AI Organize state
  const [isOrganizingAi, setIsOrganizingAi] = useState(false);
  const [organizeMessage, setOrganizeMessage] = useState<string | null>(null);

  const savedResources = state?.savedResources || [];
  const collections = state?.vaultCollections || [];

  // Quick URL save action
  const handleQuickUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;

    setIsQuickSaving(true);
    try {
      // First extract metadata
      const res = await fetch('/api/vault/extract-url-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: quickUrl.trim() })
      });
      const data = await res.json();
      const ext = data.extracted || {};

      await onSaveResource({
        url: quickUrl.trim(),
        title: ext.title || quickUrl.trim(),
        description: ext.description || '',
        resourceType: ext.resourceType || 'website',
        category: ext.category || 'Unsorted',
        tags: ext.tags || [],
        readingTimeMinutes: ext.readingTimeMinutes || 5,
        isOpenSource: ext.isOpenSource || false,
        githubRepo: ext.githubRepo,
        collections: ext.resourceType === 'article' || ext.resourceType === 'newsletter' ? ['Read Later'] : []
      });

      setQuickUrl('');
    } catch (err) {
      console.error('Quick save failed:', err);
    } finally {
      setIsQuickSaving(false);
    }
  };

  // Natural Language AI Search
  const handleNaturalSearch = async () => {
    if (!searchQuery.trim()) {
      setAiMatchedIds(null);
      setAiSearchInsight(null);
      return;
    }

    setAiSearchLoading(true);
    try {
      const res = await fetch('/api/vault/natural-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      });
      const data = await res.json();
      if (data.success) {
        const matched = data.matchedResources || [];
        setAiMatchedIds(matched.map((m: any) => m.id));
        setAiSearchInsight(data.insight || `Found ${matched.length} resources in your Vault.`);
      }
    } catch (e) {
      console.error('AI search failed:', e);
    } finally {
      setAiSearchLoading(false);
    }
  };

  // Batch organize with AI
  const handleBatchOrganize = async () => {
    setIsOrganizingAi(true);
    setOrganizeMessage(null);
    try {
      const res = await fetch('/api/vault/batch-organize', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setOrganizeMessage(data.message || `Organized ${data.organizedCount} items.`);
        setTimeout(() => setOrganizeMessage(null), 4000);
      }
    } catch (e) {
      console.error('Batch organize failed:', e);
    } finally {
      setIsOrganizingAi(false);
    }
  };

  // Handle Save Note
  const handleSaveQuickNote = async (resourceId: string) => {
    await onUpdateResource(resourceId, { notes: quickNoteText.trim() });
    setQuickNoteResourceId(null);
    setQuickNoteText('');
  };

  // Filtered and Sorted Resources
  const filteredResources = useMemo(() => {
    let list = [...savedResources];

    // AI matched filter if active
    if (isAiSearch && aiMatchedIds !== null) {
      list = list.filter(r => aiMatchedIds.includes(r.id));
    } else if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q)) ||
          r.url.toLowerCase().includes(q) ||
          (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
          (r.collections && r.collections.some(c => c.toLowerCase().includes(q)))
      );
    }

    // Tab-specific filters
    if (activeTab === 'read-later') {
      list = list.filter(r => r.collections?.includes('Read Later') || r.resourceType === 'article' || r.resourceType === 'newsletter');
    } else if (activeTab === 'unsorted') {
      list = list.filter(r => r.category === 'Unsorted' || !r.category || (r.collections && r.collections.length === 0));
    }

    // Dropdown filters
    if (selectedType !== 'all') {
      list = list.filter(r => r.resourceType === selectedType);
    }
    if (selectedCategory !== 'all') {
      list = list.filter(r => r.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedCollection !== 'all') {
      list = list.filter(r => r.collections?.includes(selectedCollection));
    }
    if (selectedPriority !== 'all') {
      list = list.filter(r => r.priority === selectedPriority);
    }
    if (selectedStatus !== 'all') {
      list = list.filter(r => r.status === selectedStatus);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 2) - (pMap[a.priority] || 2);
      }
      if (sortBy === 'readingTime') {
        return (a.readingTimeMinutes || 5) - (b.readingTimeMinutes || 5);
      }
      return 0;
    });

    return list;
  }, [
    savedResources,
    searchQuery,
    isAiSearch,
    aiMatchedIds,
    activeTab,
    selectedType,
    selectedCategory,
    selectedCollection,
    selectedPriority,
    selectedStatus,
    sortBy
  ]);

  // Breakdown statistics
  const stats = useMemo(() => {
    return {
      total: savedResources.length,
      tools: savedResources.filter(r => ['tool', 'coding_agent', 'ide'].includes(r.resourceType)).length,
      articles: savedResources.filter(r => r.resourceType === 'article').length,
      newsletters: savedResources.filter(r => r.resourceType === 'newsletter').length,
      repos: savedResources.filter(r => r.resourceType === 'repository' || r.isOpenSource).length,
      courses: savedResources.filter(r => r.resourceType === 'course').length,
      unread: savedResources.filter(r => r.status === 'unread').length,
      completed: savedResources.filter(r => r.status === 'completed').length,
      unsorted: savedResources.filter(r => r.category === 'Unsorted' || !r.category || (r.collections && r.collections.length === 0)).length
    };
  }, [savedResources]);

  const getResourceTypeIcon = (type: VaultResourceType) => {
    switch (type) {
      case 'tool':
        return <Layers size={14} className="text-blue-500" />;
      case 'coding_agent':
        return <Terminal size={14} className="text-purple-500" />;
      case 'ide':
        return <Code2 size={14} className="text-indigo-500" />;
      case 'article':
        return <FileText size={14} className="text-emerald-500" />;
      case 'newsletter':
        return <Mail size={14} className="text-amber-500" />;
      case 'course':
        return <BookOpen size={14} className="text-cyan-500" />;
      case 'repository':
        return <Terminal size={14} className="text-slate-700" />;
      case 'video':
        return <Video size={14} className="text-rose-500" />;
      default:
        return <Globe size={14} className="text-slate-500" />;
    }
  };

  const getPriorityBadge = (priority: VaultPriority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">🔥 High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">Someday</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-[#EDEDEF] font-sans">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#5E6AD2]/20 text-indigo-300 flex items-center justify-center font-bold">
              <Bookmark size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
                Founder Vault
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5E6AD2]/20 text-indigo-300 font-mono font-semibold border border-[#5E6AD2]/30">
                  {stats.total} Saved
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8F98]">
                Your private knowledge and resource library. <span className="text-[#EDEDEF] font-medium italic">"I found it. Save it now. Find it when I need it."</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {stats.unsorted > 0 && (
            <button
              onClick={handleBatchOrganize}
              disabled={isOrganizingAi}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#EDEDEF] text-xs font-semibold flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
              title="Auto-organize unsorted resources into categories and collections"
            >
              {isOrganizingAi ? (
                <>
                  <Loader2 size={14} className="animate-spin text-[#5E6AD2]" />
                  <span>Organizing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-[#5E6AD2]" />
                  <span>AI Organize ({stats.unsorted})</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              setEditingResource(null);
              setIsSaveModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_16px_rgba(94,106,210,0.3)] transition cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Save Resource</span>
          </button>
        </div>
      </div>

      {organizeMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{organizeMessage}</span>
        </div>
      )}

      {/* Quick URL Import Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Sparkles size={15} className="text-blue-400 shrink-0" />
            <span>Quick URL Save:</span>
          </div>
          <form onSubmit={handleQuickUrlSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={quickUrl}
              onChange={e => setQuickUrl(e.target.value)}
              placeholder="Paste any URL (GitHub repo, tool, article, newsletter, docs)..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="submit"
              disabled={isQuickSaving || !quickUrl.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              {isQuickSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus size={13} />
                  <span>Save</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Metric Counters & Filter Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('all');
          }}
          className={`p-3 rounded-xl border text-left transition ${
            activeTab === 'all' && selectedType === 'all'
              ? 'bg-blue-50/80 border-blue-300 text-blue-900'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">All Items</span>
          <span className="text-base font-bold">{stats.total}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('tool');
          }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedType === 'tool'
              ? 'bg-blue-50/80 border-blue-300 text-blue-900'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">Tools & Agents</span>
          <span className="text-base font-bold">{stats.tools}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('read-later');
            setSelectedType('all');
          }}
          className={`p-3 rounded-xl border text-left transition ${
            activeTab === 'read-later'
              ? 'bg-amber-50/80 border-amber-300 text-amber-900'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">Read Later</span>
          <span className="text-base font-bold text-amber-600">{stats.unread} unread</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('article');
          }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedType === 'article'
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">Articles</span>
          <span className="text-base font-bold">{stats.articles}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('newsletter');
          }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedType === 'newsletter'
              ? 'bg-purple-50/80 border-purple-300 text-purple-900'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">Newsletters</span>
          <span className="text-base font-bold">{stats.newsletters}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('repository');
          }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedType === 'repository'
              ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">GitHub Repos</span>
          <span className="text-base font-bold">{stats.repos}</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`p-3 rounded-xl border text-left transition ${
            activeTab === 'collections'
              ? 'bg-blue-50/80 border-blue-300 text-blue-900'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">Collections</span>
          <span className="text-base font-bold text-blue-600">{collections.length} Folders</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedType('all');
            }}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            All Saved ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('read-later')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'read-later'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Read Later Queue</span>
            {stats.unread > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                {stats.unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'collections'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Collections & Folders ({collections.length})
          </button>
          <button
            onClick={() => setActiveTab('unsorted')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'unsorted'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Unsorted Inbox</span>
            {stats.unsorted > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold font-mono">
                {stats.unsorted}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'insights'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BrainCircuit size={13} className="text-purple-600" />
            <span>Vault Intelligence</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls (for all, read-later, unsorted) */}
      {activeTab !== 'collections' && activeTab !== 'insights' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && isAiSearch) {
                    handleNaturalSearch();
                  }
                }}
                placeholder={
                  isAiSearch
                    ? "Ask in natural language: e.g., 'What did I save about getting my first customers?'..."
                    : "Search title, notes, tags, URL, collections..."
                }
                className="w-full pl-9 pr-24 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              {isAiSearch && (
                <button
                  type="button"
                  onClick={handleNaturalSearch}
                  disabled={aiSearchLoading || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1"
                >
                  {aiSearchLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  <span>Ask AI</span>
                </button>
              )}
            </div>

            {/* AI Search Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsAiSearch(!isAiSearch);
                setAiMatchedIds(null);
                setAiSearchInsight(null);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
                isAiSearch
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={13} className={isAiSearch ? 'text-purple-600' : 'text-slate-400'} />
              <span>Natural Search</span>
            </button>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
                <option value="readingTime">Read Time</option>
              </select>
            </div>
          </div>

          {/* AI Search Insight Banner */}
          {aiSearchInsight && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5 text-xs text-purple-950 animate-in fade-in">
              <Sparkles size={16} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{aiSearchInsight}</p>
                <button
                  onClick={() => {
                    setAiMatchedIds(null);
                    setAiSearchInsight(null);
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-purple-700 underline mt-1"
                >
                  Clear AI filter
                </button>
              </div>
            </div>
          )}

          {/* Secondary Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium"
            >
              <option value="all">All Types</option>
              <option value="tool">Tools</option>
              <option value="coding_agent">Coding Agents</option>
              <option value="ide">IDEs</option>
              <option value="article">Articles</option>
              <option value="newsletter">Newsletters</option>
              <option value="repository">GitHub Repos</option>
              <option value="course">Courses</option>
              <option value="video">Videos</option>
            </select>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Development">Development</option>
              <option value="Growth">Growth</option>
              <option value="Product">Product</option>
              <option value="AI Tools">AI Tools</option>
              <option value="Design">Design</option>
              <option value="Fundraising">Fundraising</option>
              <option value="Operations">Operations</option>
            </select>

            <select
              value={selectedCollection}
              onChange={e => setSelectedCollection(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium"
            >
              <option value="all">All Collections</option>
              {collections.map(c => (
                <option key={c.id || c.name} value={c.name}>
                  📁 {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔥 High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium"
            >
              <option value="all">All Reading Statuses</option>
              <option value="unread">Unread</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {(selectedType !== 'all' || selectedCategory !== 'all' || selectedCollection !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setSelectedCollection('all');
                  setSelectedPriority('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                  setAiMatchedIds(null);
                  setAiSearchInsight(null);
                }}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* COLLECTIONS VIEW */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Collections & Folders</h3>
              <p className="text-xs text-slate-500">Group your saved tools and research into custom focus folders.</p>
            </div>
            <button
              onClick={() => setShowCreateCollectionModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FolderPlus size={14} />
              <span>New Collection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {collections.map(col => {
              const count = savedResources.filter(r => r.collections?.includes(col.name)).length;
              return (
                <div
                  key={col.id || col.name}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: col.color || '#0052FF' }}
                      >
                        <FolderHeart size={20} />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{col.name}</h4>
                      {col.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{col.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCollection(col.name);
                        setActiveTab('all');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>View Items</span>
                      <ExternalLink size={12} />
                    </button>

                    <button
                      onClick={() => onDeleteCollection(col.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete collection"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INTELLIGENCE & INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit size={18} className="text-purple-600" />
                Founder Vault Intelligence Graph
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                How your saved knowledge connects to your active startup bottlenecks, missions, and experiments.
              </p>
            </div>

            {/* Bottleneck Connection */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white font-mono">
                  Active Bottleneck
                </span>
                <span className="text-xs font-bold text-blue-950">
                  {state.profile?.biggestUncertainty || "Customer Acquisition"}
                </span>
              </div>
              <p className="text-xs text-blue-900">
                FounderZero analyzes your saved resources to surface tools and guides specifically targeting this challenge.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {savedResources.slice(0, 3).map(r => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-1 hover:border-blue-400 transition"
                  >
                    <span>{r.title}</span>
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>

            {/* Reading Queue Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Unread Knowledge</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.unread}</span>
                <p className="text-[11px] text-slate-500 mt-1">Articles and guides queued in your Read Later list.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Open Source & Tools</span>
                <span className="text-2xl font-bold text-blue-600 mt-1 block">{stats.tools + stats.repos}</span>
                <p className="text-[11px] text-slate-500 mt-1">Free open-source repositories & zero-cost developer tools.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Completed / Implemented</span>
                <span className="text-2xl font-bold text-emerald-600 mt-1 block">{stats.completed}</span>
                <p className="text-[11px] text-slate-500 mt-1">Resources read, tested, or deployed into your startup.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN RESOURCE CARDS LIST */}
      {(activeTab === 'all' || activeTab === 'read-later' || activeTab === 'unsorted') && (
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Bookmark size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">No resources found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `No saved resources match "${searchQuery}". Try a different search term.`
                  : "You haven't saved any resources in this view yet. Click '+ Save Resource' above to add articles, repos, coding agents, and tools."}
              </p>
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <Plus size={14} />
                <span>+ Save Your First Resource</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map(resource => {
                const isQuickNoteOpen = quickNoteResourceId === resource.id;

                return (
                  <div
                    key={resource.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3 group"
                  >
                    {/* Card Top */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="p-1 rounded-md bg-slate-100">
                            {getResourceTypeIcon(resource.resourceType)}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                            {resource.resourceType.replace('_', ' ')}
                          </span>
                          {resource.isOpenSource && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                              Open Source
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {getPriorityBadge(resource.priority)}
                          <button
                            onClick={() => {
                              setEditingResource(resource);
                              setIsSaveModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 transition"
                            title="Edit Resource"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteResource(resource.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Resource"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Source */}
                      <div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5 leading-snug"
                        >
                          <span className="line-clamp-2">{resource.title}</span>
                          <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-blue-600" />
                        </a>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                          {resource.source || resource.url.replace(/^https?:\/\//i, '').split('/')[0]}
                        </p>
                      </div>

                      {/* Description */}
                      {resource.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {resource.description}
                        </p>
                      )}

                      {/* Personal Founder Notes */}
                      {resource.notes ? (
                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 font-sans">
                          <span className="font-bold text-[10px] uppercase text-amber-700 font-mono block">Founder Note:</span>
                          <p className="mt-0.5 line-clamp-3 italic">{resource.notes}</p>
                        </div>
                      ) : null}

                      {/* Collections & Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {resource.collections?.map(col => (
                          <span
                            key={col}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100 flex items-center gap-1"
                          >
                            <Folder size={10} />
                            <span>{col}</span>
                          </span>
                        ))}
                        {resource.tags?.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Note Editor Dropdown */}
                    {isQuickNoteOpen && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <textarea
                          value={quickNoteText}
                          onChange={e => setQuickNoteText(e.target.value)}
                          placeholder="Add private note (e.g. why you saved it, how to test it)..."
                          rows={2}
                          className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setQuickNoteResourceId(null)}
                            className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveQuickNote(resource.id)}
                            className="px-2.5 py-1 rounded bg-blue-600 text-white text-[11px] font-bold"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {/* Reading Status Selector */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={async () => {
                            const nextStatus: ReadLaterStatus =
                              resource.status === 'unread'
                                ? 'reading'
                                : resource.status === 'reading'
                                ? 'completed'
                                : 'unread';
                            await onUpdateResource(resource.id, { status: nextStatus });
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                            resource.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : resource.status === 'reading'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Click to cycle status: Unread → Reading → Completed"
                        >
                          {resource.status === 'completed' ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>Completed</span>
                            </>
                          ) : resource.status === 'reading' ? (
                            <>
                              <Clock size={12} />
                              <span>Reading</span>
                            </>
                          ) : (
                            <>
                              <BookOpen size={12} />
                              <span>Unread</span>
                            </>
                          )}
                        </button>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {resource.readingTimeMinutes || 5}m read
                        </span>
                      </div>

                      {/* Quick Add Note Button */}
                      {!isQuickNoteOpen && (
                        <button
                          onClick={() => {
                            setQuickNoteResourceId(resource.id);
                            setQuickNoteText(resource.notes || '');
                          }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-blue-600"
                        >
                          {resource.notes ? 'Edit Note' : '+ Note'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Save / Edit Resource Modal */}
      <SaveResourceModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setEditingResource(null);
        }}
        state={state}
        initialResource={editingResource || undefined}
        onSaveResource={async payload => {
          if (editingResource) {
            await onUpdateResource(editingResource.id, payload);
            return { saved: { ...editingResource, ...payload } as UserSavedResource };
          } else {
            return await onSaveResource(payload);
          }
        }}
      />

      {/* Create Collection Modal */}
      {showCreateCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">New Collection / Folder</h3>
              <button onClick={() => setShowCreateCollectionModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collection Name</label>
                <input
                  type="text"
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  placeholder="e.g. Zero-Budget SEO, Pricing Experiments"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newColDesc}
                  onChange={e => setNewColDesc(e.target.value)}
                  placeholder="Brief context for what lives in this folder"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Folder Color</label>
                <div className="flex gap-2">
                  {['#0052FF', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#64748B'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        newColColor === color ? 'border-slate-900 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateCollectionModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newColName.trim()) return;
                  await onCreateCollection(newColName.trim(), newColDesc.trim(), 'FolderHeart', newColColor);
                  setNewColName('');
                  setNewColDesc('');
                  setShowCreateCollectionModal(false);
                }}
                disabled={!newColName.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
