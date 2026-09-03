import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Plus,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Tag,
  Folder,
  FolderPlus,
  Clock,
  CheckCircle2,
  Trash2,
  Edit3,
  Terminal,
  FileText,
  Code2,
  Layers,
  Mail,
  BookOpen,
  Video,
  Globe,
  Bell,
  ArrowUpDown,
  FolderHeart,
  Loader2,
  BrainCircuit
} from 'lucide-react';
import {
  AppState,
  ReadLaterStatus,
  UserSavedResource,
  VaultCollection,
  VaultPriority,
  VaultResourceType
} from '../types';
import { SaveResourceModal } from '../components/SaveResourceModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface VaultPageProps {
  state: AppState;
  onSaveResource: (resource: Partial<UserSavedResource>) => Promise<{ isDuplicate?: boolean; existingId?: string; saved?: UserSavedResource }>;
  onUpdateResource: (resourceId: string, updates: Partial<UserSavedResource>) => Promise<void>;
  onDeleteResource: (resourceId: string) => Promise<void>;
  onCreateCollection: (name: string, description?: string, icon?: string, color?: string) => Promise<void>;
  onDeleteCollection: (collectionId: string) => Promise<void>;
  onQuickImportUrl?: (url: string) => Promise<void>;
  onNavigateToSection?: (section: string) => void;
}

export const VaultPage: React.FC<VaultPageProps> = ({
  state,
  onSaveResource,
  onUpdateResource,
  onDeleteResource,
  onCreateCollection,
  onDeleteCollection,
  onQuickImportUrl
}) => {
  const savedResources = state.savedResources || [];
  const collections = state.vaultCollections || [];

  // Active view filters
  const [activeTab, setActiveTab] = useState<'all' | 'read-later' | 'collections' | 'unsorted' | 'insights'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'readingTime'>('newest');

  // AI Natural Search & Quick Save states
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [aiSearchInsight, setAiSearchInsight] = useState<string | null>(null);

  const [quickUrl, setQuickUrl] = useState('');
  const [quickImportLoading, setQuickImportLoading] = useState(false);
  const [quickImportMsg, setQuickImportMsg] = useState<string | null>(null);

  // Modals
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<UserSavedResource | null>(null);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);

  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#5E6AD2');

  const [quickNoteResourceId, setQuickNoteResourceId] = useState<string | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');

  // Quick URL Import Handler
  const handleQuickImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim() || quickImportLoading) return;
    setQuickImportLoading(true);
    setQuickImportMsg(null);
    try {
      await onQuickImportUrl(quickUrl.trim());
      setQuickImportMsg('✓ Resource imported & auto-tagged into Vault!');
      setQuickUrl('');
      setTimeout(() => setQuickImportMsg(null), 4000);
    } catch (err) {
      console.error('Quick import failed:', err);
      setQuickImportMsg('Failed to extract URL metadata. Try opening full save modal.');
    } finally {
      setQuickImportLoading(false);
    }
  };

  // AI Natural Language Search Handler
  const handleNaturalSearch = async () => {
    if (!searchQuery.trim() || aiSearchLoading) return;
    setAiSearchLoading(true);
    try {
      const res = await fetch('/api/vault/natural-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          resources: savedResources
        })
      });
      const data = await res.json();
      if (data.success && data.matchedIds) {
        setAiMatchedIds(data.matchedIds);
        setAiSearchInsight(data.insight || `Surfaced ${data.matchedIds.length} relevant items.`);
      }
    } catch (err) {
      console.error('Natural search error:', err);
    } finally {
      setAiSearchLoading(false);
    }
  };

  // Handle Quick Note Saving
  const handleSaveQuickNote = async (resourceId: string) => {
    await onUpdateResource(resourceId, { notes: quickNoteText.trim() });
    setQuickNoteResourceId(null);
  };

  // Filtered & Sorted Resources List Calculation
  const filteredResources = useMemo(() => {
    return savedResources.filter(r => {
      // 1. Natural Language AI Filter match
      if (aiMatchedIds !== null && !aiMatchedIds.includes(r.id)) {
        return false;
      }

      // 2. Tab Filter
      if (activeTab === 'read-later' && r.status === 'completed') return false;
      if (activeTab === 'unsorted' && (r.collections?.length || 0) > 0) return false;

      // 3. Type Filter
      if (selectedType !== 'all' && r.resourceType !== selectedType) return false;

      // 4. Category Filter
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;

      // 5. Collection Filter
      if (selectedCollection !== 'all' && !r.collections?.includes(selectedCollection)) return false;

      // 6. Priority Filter
      if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false;

      // 7. Status Filter
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

      // 8. Keyword Search Filter (if AI search is off)
      if (searchQuery.trim() && aiMatchedIds === null) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (r.title || '').toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchNotes = (r.notes || '').toLowerCase().includes(q);
        const matchUrl = (r.url || '').toLowerCase().includes(q);
        const matchTags = (r.tags || []).some(t => t.toLowerCase().includes(q));
        const matchCol = (r.collections || []).some(c => c.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchNotes && !matchUrl && !matchTags && !matchCol) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'readingTime') return (a.readingTimeMinutes || 5) - (b.readingTimeMinutes || 5);
      if (sortBy === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
      }
      return 0;
    });
  }, [savedResources, activeTab, selectedType, selectedCategory, selectedCollection, selectedPriority, selectedStatus, searchQuery, sortBy, aiMatchedIds]);

  // Statistics Breakdown
  const stats = useMemo(() => {
    const total = savedResources.length;
    const unread = savedResources.filter(r => r.status === 'unread' || r.status === 'reading').length;
    const tools = savedResources.filter(r => r.resourceType === 'tool' || r.resourceType === 'coding_agent' || r.resourceType === 'ide').length;
    const articles = savedResources.filter(r => r.resourceType === 'article' || r.resourceType === 'course').length;
    const newsletters = savedResources.filter(r => r.resourceType === 'newsletter').length;
    const repos = savedResources.filter(r => r.resourceType === 'repository' || r.isOpenSource).length;
    const unsorted = savedResources.filter(r => (!r.collections || r.collections.length === 0)).length;
    return { total, unread, tools, articles, newsletters, repos, unsorted };
  }, [savedResources]);

  const getResourceTypeIcon = (type: VaultResourceType) => {
    switch (type) {
      case 'tool': return <Layers size={14} className="text-[#5E6AD2]" />;
      case 'coding_agent': return <Terminal size={14} className="text-emerald-400" />;
      case 'ide': return <Code2 size={14} className="text-blue-400" />;
      case 'article': return <FileText size={14} className="text-amber-400" />;
      case 'newsletter': return <Mail size={14} className="text-purple-400" />;
      case 'course': return <BookOpen size={14} className="text-teal-400" />;
      case 'repository': return <Terminal size={14} className="text-slate-300" />;
      case 'video': return <Video size={14} className="text-rose-400" />;
      default: return <Globe size={14} className="text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority: VaultPriority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">🔥 High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#5E6AD2]/20 text-indigo-300 border border-[#5E6AD2]/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] text-[#8A8F98] border border-white/10">Someday</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#EDEDEF]">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#5E6AD2]/20 text-indigo-300 flex items-center justify-center font-bold">
              <Bookmark size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
                <span>Founder Memory Vault</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5E6AD2]/20 text-indigo-300 font-mono font-semibold border border-[#5E6AD2]/30">
                  {stats.total} Saved Items
                </span>
              </h1>
              <p className="text-xs text-[#8A8F98]">
                Save developer tools, coding agents, articles, and research. FounderZero surfaces your saved knowledge right when relevant bottlenecks arise.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={async () => {
              // AI Organize action trigger
              setIsSaveModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#EDEDEF] text-xs font-semibold flex items-center gap-1.5 transition border border-white/10 cursor-pointer font-sans"
          >
            <Sparkles size={14} className="text-[#5E6AD2]" />
            <span>AI Organize Vault</span>
          </button>

          <button
            onClick={() => {
              setEditingResource(null);
              setIsSaveModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_16px_rgba(94,106,210,0.3)] transition cursor-pointer font-sans"
          >
            <Plus size={16} />
            <span>Save Resource</span>
          </button>
        </div>
      </div>

      {/* Quick Import Message */}
      {quickImportMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-300 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{quickImportMsg}</span>
        </div>
      )}

      {/* Quick 1-Click URL Save Bar */}
      <div className="bg-[#0a0a0c] text-[#EDEDEF] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg font-sans">
        <form onSubmit={handleQuickImport} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-[#5E6AD2] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Quick 1-Click Vault Import</span>
            </label>
            <span className="text-[11px] font-mono text-[#8A8F98]">Paste any URL (Tool, Article, GitHub Repo)</span>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              required
              value={quickUrl}
              onChange={e => setQuickUrl(e.target.value)}
              placeholder="Paste URL (e.g. https://github.com/... or https://..."
              className="flex-1 px-3.5 py-2 text-xs bg-white/[0.04] border border-white/10 rounded-xl text-[#EDEDEF] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#5E6AD2] font-mono"
            />
            <button
              type="submit"
              disabled={quickImportLoading || !quickUrl.trim()}
              className="px-4 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              {quickImportLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              <span>Import to Vault</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Category Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-sans">
        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('all');
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'all' && selectedType === 'all'
              ? 'bg-[#5E6AD2]/20 border-[#5E6AD2]/50 text-indigo-300'
              : 'bg-[#0a0a0c] border-white/10 text-[#EDEDEF] hover:bg-white/[0.04]'
          }`}
        >
          <span className="text-[11px] text-[#8A8F98] font-medium block">All Items</span>
          <span className="text-base font-semibold">{stats.total}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('tool');
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedType === 'tool'
              ? 'bg-[#5E6AD2]/20 border-[#5E6AD2]/50 text-indigo-300'
              : 'bg-[#0a0a0c] border-white/10 text-[#EDEDEF] hover:bg-white/[0.04]'
          }`}
        >
          <span className="text-[11px] text-[#8A8F98] font-medium block">Tools & Agents</span>
          <span className="text-base font-semibold">{stats.tools}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('read-later');
            setSelectedType('all');
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'read-later'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-[#0a0a0c] border-white/10 text-[#EDEDEF] hover:bg-white/[0.04]'
          }`}
        >
          <span className="text-[11px] text-[#8A8F98] font-medium block">Read Later</span>
          <span className="text-base font-semibold text-amber-400">{stats.unread} unread</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('article');
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedType === 'article'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-[#0a0a0c] border-white/10 text-[#EDEDEF] hover:bg-white/[0.04]'
          }`}
        >
          <span className="text-[11px] text-[#8A8F98] font-medium block">Articles</span>
          <span className="text-base font-semibold">{stats.articles}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('newsletter');
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedType === 'newsletter'
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
              : 'bg-[#0a0a0c] border-white/10 text-[#EDEDEF] hover:bg-white/[0.04]'
          }`}
        >
          <span className="text-[11px] text-[#8A8F98] font-medium block">Newsletters</span>
          <span className="text-base font-semibold">{stats.newsletters}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedType('repository');
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedType === 'repository'
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              : 'bg-[#0a0a0c] border-white/10 text-[#EDEDEF] hover:bg-white/[0.04]'
          }`}
        >
          <span className="text-[11px] text-[#8A8F98] font-medium block">GitHub Repos</span>
          <span className="text-base font-semibold">{stats.repos}</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'collections'
              ? 'bg-[#5E6AD2]/20 border-[#5E6AD2]/50 text-indigo-300'
              : 'bg-[#0a0a0c] border-white/10 text-[#EDEDEF] hover:bg-white/[0.04]'
          }`}
        >
          <span className="text-[11px] text-[#8A8F98] font-medium block">Collections</span>
          <span className="text-base font-semibold text-[#5E6AD2]">{collections.length} Folders</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-white/[0.06] gap-4 flex-wrap pb-1 font-sans">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedType('all');
            }}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'all'
                ? 'border-[#5E6AD2] text-[#EDEDEF]'
                : 'border-transparent text-[#8A8F98] hover:text-[#EDEDEF]'
            }`}
          >
            All Saved ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('read-later')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'read-later'
                ? 'border-[#5E6AD2] text-[#EDEDEF]'
                : 'border-transparent text-[#8A8F98] hover:text-[#EDEDEF]'
            }`}
          >
            <span>Read Later Queue</span>
            {stats.unread > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-semibold border border-amber-500/30">
                {stats.unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'collections'
                ? 'border-[#5E6AD2] text-[#EDEDEF]'
                : 'border-transparent text-[#8A8F98] hover:text-[#EDEDEF]'
            }`}
          >
            Collections & Folders ({collections.length})
          </button>
          <button
            onClick={() => setActiveTab('unsorted')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'unsorted'
                ? 'border-[#5E6AD2] text-[#EDEDEF]'
                : 'border-transparent text-[#8A8F98] hover:text-[#EDEDEF]'
            }`}
          >
            <span>Unsorted Inbox</span>
            {stats.unsorted > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-semibold border border-rose-500/30">
                {stats.unsorted}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'insights'
                ? 'border-[#5E6AD2] text-[#EDEDEF]'
                : 'border-transparent text-[#8A8F98] hover:text-[#EDEDEF]'
            }`}
          >
            <BrainCircuit size={13} className="text-purple-400" />
            <span>Vault Intelligence</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      {activeTab !== 'collections' && activeTab !== 'insights' && (
        <div className="bg-[#0a0a0c] rounded-2xl p-4 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-3 font-sans">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8F98]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (aiMatchedIds) {
                    setAiMatchedIds(null);
                    setAiSearchInsight(null);
                  }
                }}
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
                className="w-full pl-9 pr-24 py-2 text-xs bg-white/[0.04] border border-white/10 rounded-xl text-[#EDEDEF] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#5E6AD2]"
              />
              {isAiSearch && (
                <button
                  type="button"
                  onClick={handleNaturalSearch}
                  disabled={aiSearchLoading || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
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
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 cursor-pointer ${
                isAiSearch
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/[0.04] border-white/10 text-[#EDEDEF] hover:bg-white/[0.08]'
              }`}
            >
              <Sparkles size={13} className={isAiSearch ? 'text-purple-300' : 'text-[#8A8F98]'} />
              <span>Natural Search</span>
            </button>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-[#8A8F98]" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-2 text-xs bg-[#0a0a0c] border border-white/10 rounded-xl focus:outline-none focus:border-[#5E6AD2] text-[#EDEDEF] font-medium"
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
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-start gap-2.5 text-xs text-purple-200 animate-in fade-in font-sans">
              <Sparkles size={16} className="text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{aiSearchInsight}</p>
                <button
                  onClick={() => {
                    setAiMatchedIds(null);
                    setAiSearchInsight(null);
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-purple-400 underline mt-1"
                >
                  Clear AI filter
                </button>
              </div>
            </div>
          )}

          {/* Secondary Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs font-sans">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-[#EDEDEF] text-xs font-medium"
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
              className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-[#EDEDEF] text-xs font-medium"
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
              className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-[#EDEDEF] text-xs font-medium"
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
              className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-[#EDEDEF] text-xs font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔥 High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-[#EDEDEF] text-xs font-medium"
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
                className="px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* COLLECTIONS VIEW */}
      {activeTab === 'collections' && (
        <div className="space-y-6 font-sans">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#EDEDEF]">Collections & Folders</h3>
              <p className="text-xs text-[#8A8F98]">Group your saved tools and research into custom focus folders.</p>
            </div>
            <button
              onClick={() => setShowCreateCollectionModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
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
                  className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:border-[#5E6AD2]/50 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: col.color || '#5E6AD2' }}
                      >
                        <FolderHeart size={20} />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-[#EDEDEF]">
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#EDEDEF]">{col.name}</h4>
                      {col.description && (
                        <p className="text-xs text-[#8A8F98] mt-0.5 line-clamp-2">{col.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCollection(col.name);
                        setActiveTab('all');
                      }}
                      className="text-xs font-semibold text-[#5E6AD2] hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Items</span>
                      <ExternalLink size={12} />
                    </button>

                    <button
                      onClick={() => onDeleteCollection(col.id)}
                      className="p-1 text-[#8A8F98] hover:text-rose-400 transition cursor-pointer"
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
        <div className="space-y-6 font-sans">
          <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-6">
            <div>
              <h3 className="text-base font-semibold text-[#EDEDEF] flex items-center gap-2">
                <BrainCircuit size={18} className="text-purple-400" />
                Founder Vault Intelligence Graph
              </h3>
              <p className="text-xs text-[#8A8F98] mt-0.5">
                How your saved knowledge connects to your active startup bottlenecks, missions, and experiments.
              </p>
            </div>

            {/* Bottleneck Connection */}
            <div className="p-4 rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 space-y-2 font-sans">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#5E6AD2] text-white font-mono">
                  Active Bottleneck
                </span>
                <span className="text-xs font-semibold text-[#EDEDEF]">
                  {state.profile?.biggestUncertainty || "Customer Acquisition"}
                </span>
              </div>
              <p className="text-xs text-[#EDEDEF]">
                FounderZero analyzes your saved resources to surface tools and guides specifically targeting this challenge.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {savedResources.slice(0, 3).map(r => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-indigo-300 text-xs font-semibold flex items-center gap-1 hover:border-[#5E6AD2] transition"
                  >
                    <span>{r.title}</span>
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>

            {/* Reading Queue Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xs text-[#8A8F98] font-medium block">Unread Knowledge</span>
                <span className="text-2xl font-bold text-[#EDEDEF] mt-1 block">{stats.unread}</span>
                <p className="text-[11px] text-[#8A8F98] mt-1">Articles and guides queued in your Read Later list.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xs text-[#8A8F98] font-medium block">Curated Stack Tools</span>
                <span className="text-2xl font-bold text-[#EDEDEF] mt-1 block">{stats.tools}</span>
                <p className="text-[11px] text-[#8A8F98] mt-1">SaaS and AI coding tools saved for evaluation.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xs text-[#8A8F98] font-medium block">GitHub Repos</span>
                <span className="text-2xl font-bold text-[#EDEDEF] mt-1 block">{stats.repos}</span>
                <p className="text-[11px] text-[#8A8F98] mt-1">Open-source repositories saved for tech stack building.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN RESOURCE CARDS LIST */}
      {(activeTab === 'all' || activeTab === 'read-later' || activeTab === 'unsorted') && (
        <div className="space-y-4 font-sans">
          {filteredResources.length === 0 ? (
            <div className="text-center py-16 bg-[#0a0a0c] rounded-2xl border border-white/10 p-8 space-y-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-2xl bg-[#5E6AD2]/20 text-[#5E6AD2] flex items-center justify-center mx-auto">
                <Bookmark size={24} />
              </div>
              <h3 className="text-base font-semibold text-[#EDEDEF]">No resources found</h3>
              <p className="text-xs text-[#8A8F98] max-w-md mx-auto">
                {searchQuery
                  ? `No saved resources match "${searchQuery}". Try a different search term.`
                  : "You haven't saved any resources in this view yet. Click '+ Save Resource' above to add articles, repos, coding agents, and tools."}
              </p>
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
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
                    className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:border-[#5E6AD2]/50 transition flex flex-col justify-between space-y-3 group"
                  >
                    {/* Card Top */}
                    <div className="space-y-2 font-sans">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="p-1 rounded-md bg-white/[0.06]">
                            {getResourceTypeIcon(resource.resourceType)}
                          </span>
                          <span className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider font-mono">
                            {resource.resourceType.replace('_', ' ')}
                          </span>
                          {resource.isOpenSource && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
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
                            className="p-1 text-[#8A8F98] hover:text-indigo-300 transition cursor-pointer"
                            title="Edit Resource"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteResource(resource.id)}
                            className="p-1 text-[#8A8F98] hover:text-rose-400 transition cursor-pointer"
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
                          className="text-sm font-semibold text-[#EDEDEF] group-hover:text-indigo-300 transition flex items-center gap-1.5 leading-snug"
                        >
                          <span className="line-clamp-2">{resource.title}</span>
                          <ExternalLink size={12} className="shrink-0 text-[#8A8F98] group-hover:text-indigo-300" />
                        </a>
                        <p className="text-[11px] text-[#8A8F98] font-mono mt-0.5 truncate">
                          {resource.source || resource.url.replace(/^https?:\/\//i, '').split('/')[0]}
                        </p>
                      </div>

                      {/* Description */}
                      {resource.description && (
                        <p className="text-xs text-[#8A8F98] line-clamp-2 leading-relaxed font-sans">
                          {resource.description}
                        </p>
                      )}

                      {/* Personal Founder Notes */}
                      {resource.notes ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-sans">
                          <span className="font-bold text-[10px] uppercase text-amber-400 font-mono block">Founder Note:</span>
                          <p className="mt-0.5 line-clamp-3 italic">{resource.notes}</p>
                        </div>
                      ) : null}

                      {/* Collections & Tags */}
                      <div className="flex flex-wrap gap-1 pt-1 font-sans">
                        {resource.collections?.map(col => (
                          <span
                            key={col}
                            className="px-2 py-0.5 rounded-md bg-[#5E6AD2]/20 text-indigo-300 text-[10px] font-semibold border border-[#5E6AD2]/30 flex items-center gap-1"
                          >
                            <Folder size={10} />
                            <span>{col}</span>
                          </span>
                        ))}
                        {resource.tags?.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[#8A8F98] text-[10px] font-medium font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Note Editor Dropdown */}
                    {isQuickNoteOpen && (
                      <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl space-y-2 font-sans">
                        <textarea
                          value={quickNoteText}
                          onChange={e => setQuickNoteText(e.target.value)}
                          placeholder="Add private note (e.g. why you saved it, how to test it)..."
                          rows={2}
                          className="w-full p-2 text-xs bg-[#0a0a0c] border border-white/10 text-[#EDEDEF] rounded-lg focus:outline-none focus:border-[#5E6AD2]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setQuickNoteResourceId(null)}
                            className="px-2 py-1 text-[11px] text-[#8A8F98] hover:text-[#EDEDEF]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveQuickNote(resource.id)}
                            className="px-2.5 py-1 rounded bg-[#5E6AD2] text-white text-[11px] font-semibold"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-sans">
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
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                            resource.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : resource.status === 'reading'
                              ? 'bg-[#5E6AD2]/20 text-indigo-300 border border-[#5E6AD2]/30'
                              : 'bg-white/[0.06] text-[#8A8F98] hover:bg-white/[0.10]'
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

                        <span className="text-[11px] text-[#8A8F98] font-mono">
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
                          className="text-[11px] font-semibold text-[#8A8F98] hover:text-[#5E6AD2] cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050506]/85 backdrop-blur-xl">
          <div className="bg-[#0a0a0c] text-[#EDEDEF] rounded-2xl w-full max-w-md border border-white/10 p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] animate-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#EDEDEF]">New Collection / Folder</h3>
              <button onClick={() => setShowCreateCollectionModal(false)} className="text-[#8A8F98] hover:text-[#EDEDEF]">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-xs font-medium text-[#EDEDEF] mb-1">Collection Name</label>
                <input
                  type="text"
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  placeholder="e.g. Zero-Budget SEO, Pricing Experiments"
                  className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl focus:border-[#5E6AD2] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDEF] mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newColDesc}
                  onChange={e => setNewColDesc(e.target.value)}
                  placeholder="Brief context for what lives in this folder"
                  className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl focus:border-[#5E6AD2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDEF] mb-1">Folder Color</label>
                <div className="flex gap-2">
                  {['#5E6AD2', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#64748B'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        newColColor === color ? 'border-white scale-110' : 'border-transparent'
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
                className="px-3.5 py-1.5 text-xs text-[#8A8F98] hover:bg-white/[0.06] rounded-lg"
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
                className="px-4 py-1.5 bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold rounded-lg transition"
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
