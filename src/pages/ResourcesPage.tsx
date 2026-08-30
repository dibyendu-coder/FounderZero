import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  Code2,
  FileText,
  Mail,
  BookOpen,
  Layers,
  Scale,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  EyeOff,
  Plus,
  Compass,
  ArrowRight,
  TrendingUp,
  Check,
  Copy,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  BookMarked,
  Award,
  Cpu,
  RefreshCw,
  FolderGit2,
  Users2
} from 'lucide-react';
import {
  AppState,
  CodingAgentDetails,
  IDEDetails,
  IntentSearchResult,
  NewsletterDetails,
  RecommendedResourceItem,
  Resource,
  ResourceCategory,
  ResourcePricingType,
  ResourceStatus,
  ResourceType,
  StartupProfile,
  UserResourceInteraction,
  WeeklyFounderBrief
} from '../types';
import {
  calculateFounderLevel,
  calculateLearningProfile,
  calculateResourceRecommendations,
  generateWeeklyBrief,
  identifyCurrentBottleneck,
  searchResourceByIntent
} from '../lib/resourceEngine';

interface ResourcesPageProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onNavigate: (route: string) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  state,
  onUpdateState,
  onNavigate
}) => {
  const profile = state.profile;
  const resources = state.resources || [];
  const interactions = state.resourceInteractions || [];

  // Active view tabs
  const [activeTab, setActiveTab] = useState<
    'for_you' | 'build' | 'learn' | 'read' | 'discover' | 'my_learning' | 'compare' | 'verification'
  >('for_you');

  // Subcategory filters
  const [buildSubcategory, setBuildSubcategory] = useState<string>('all');
  const [learnSubcategory, setLearnSubcategory] = useState<string>('all');
  const [readSubcategory, setReadSubcategory] = useState<string>('all');
  const [discoverSubcategory, setDiscoverSubcategory] = useState<string>('all');

  // General search and filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openSourceOnly, setOpenSourceOnly] = useState<boolean>(false);
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [technicalLevelFilter, setTechnicalLevelFilter] = useState<string>('all');

  // Modals & Drawers
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showWeeklyBriefModal, setShowWeeklyBriefModal] = useState<boolean>(false);
  const [showIntentModal, setShowIntentModal] = useState<boolean>(false);
  const [intentInput, setIntentInput] = useState<string>('');
  const [intentResult, setIntentResult] = useState<IntentSearchResult | null>(null);
  const [isIntentSearching, setIsIntentSearching] = useState<boolean>(false);

  // Comparison State (Array of selected resource IDs)
  const [compareIds, setCompareIds] = useState<string[]>([
    'res-opencode',
    'res-cline',
    'res-aider'
  ]);

  // Suggest Resource Form Modal
  const [showAddResourceModal, setShowAddResourceModal] = useState<boolean>(false);
  const [newResourceForm, setNewResourceForm] = useState<Partial<Resource>>({
    title: '',
    description: '',
    url: '',
    category: 'BUILD',
    subcategory: 'AI Coding Agents',
    resourceType: 'coding_agent',
    pricingType: 'open_source',
    isOpenSource: true,
    isFree: true,
    hasFreeTier: true,
    freeTierDescription: '100% Free Open Source',
    difficulty: 'Intermediate',
    technicalLevel: 'Technical',
    startupStages: ['Idea', 'Validating', 'Building MVP', 'Launched'],
    founderGoals: ['Faster development'],
    useCases: ['Autonomous development'],
    skillsRequired: ['Git'],
    timeToLearn: '15 mins',
    recommendedFor: 'Solo founders',
    tags: ['Coding Agent', 'Open Source'],
    qualityScore: 90,
    qualityExplanation: 'Verified open source tool',
    source: 'Community Submission'
  });

  // Calculate Intelligence Computations
  const founderLevel = useMemo(() => calculateFounderLevel(profile, state), [profile, state]);
  const bottleneck = useMemo(() => identifyCurrentBottleneck(profile, state), [profile, state]);
  const recommendations = useMemo(
    () => calculateResourceRecommendations(profile, state, resources),
    [profile, state, resources]
  );
  const weeklyBrief = useMemo(
    () => generateWeeklyBrief(profile, state, resources),
    [profile, state, resources]
  );
  const learningProfile = useMemo(
    () => calculateLearningProfile(interactions, resources),
    [interactions, resources]
  );

  // Set of interaction IDs
  const savedSet = useMemo(
    () => new Set(interactions.filter(i => i.interactionType === 'saved').map(i => i.resourceId)),
    [interactions]
  );
  const completedSet = useMemo(
    () => new Set(interactions.filter(i => i.interactionType === 'completed').map(i => i.resourceId)),
    [interactions]
  );
  const triedSet = useMemo(
    () => new Set(interactions.filter(i => i.interactionType === 'tried').map(i => i.resourceId)),
    [interactions]
  );

  // Interaction handlers
  const handleToggleSave = (resourceId: string) => {
    let updatedInteractions = [...interactions];
    const existingIdx = updatedInteractions.findIndex(
      i => i.resourceId === resourceId && i.interactionType === 'saved'
    );
    let updatedSaved = [...(state.savedResources || [])];
    const targetResource = resources.find(r => r.id === resourceId);

    if (existingIdx >= 0) {
      updatedInteractions.splice(existingIdx, 1);
      if (targetResource) {
        updatedSaved = updatedSaved.filter(s => s.url !== targetResource.url && s.id !== `vault-${resourceId}`);
      }
    } else {
      updatedInteractions.push({
        id: 'int-' + Date.now(),
        userId: state.user?.id || 'demo-user-1',
        startupId: profile.id,
        resourceId,
        interactionType: 'saved',
        createdAt: new Date().toISOString()
      });

      if (targetResource) {
        const alreadyInVault = updatedSaved.some(s => s.url === targetResource.url);
        if (!alreadyInVault) {
          updatedSaved.unshift({
            id: `vault-${resourceId}`,
            userId: state.user?.id || 'demo-user-1',
            startupId: profile.id,
            url: targetResource.url,
            title: targetResource.title,
            description: targetResource.description,
            resourceType: (targetResource.resourceType as any) || 'website',
            category: targetResource.category === 'BUILD' ? 'Coding Agent' : targetResource.category === 'READ' ? 'Article' : targetResource.category === 'LEARN' ? 'Course' : 'Tool',
            tags: targetResource.tags || [],
            notes: targetResource.qualityExplanation || 'Saved from Resource Center',
            priority: 'medium',
            status: 'unread',
            collections: [],
            readingTimeMinutes: targetResource.articleDetails?.readingTimeMinutes || 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    const updatedProfile = calculateLearningProfile(updatedInteractions, resources);
    onUpdateState({
      ...state,
      resourceInteractions: updatedInteractions,
      learningProfile: updatedProfile,
      savedResources: updatedSaved
    });
  };

  const handleMarkInteraction = (
    resourceId: string,
    type: 'completed' | 'tried' | 'useful' | 'not_useful' | 'hidden'
  ) => {
    let updatedInteractions = [...interactions];
    const existingIdx = updatedInteractions.findIndex(
      i => i.resourceId === resourceId && i.interactionType === type
    );
    if (existingIdx >= 0) {
      updatedInteractions.splice(existingIdx, 1);
    } else {
      updatedInteractions.push({
        id: 'int-' + Date.now(),
        userId: state.user?.id || 'demo-user-1',
        startupId: profile.id,
        resourceId,
        interactionType: type,
        createdAt: new Date().toISOString()
      });
    }

    const updatedProfile = calculateLearningProfile(updatedInteractions, resources);
    onUpdateState({
      ...state,
      resourceInteractions: updatedInteractions,
      learningProfile: updatedProfile
    });
  };

  const handleVerifyResource = (resourceId: string) => {
    const updatedResources = resources.map(r => {
      if (r.id === resourceId) {
        return {
          ...r,
          lastVerifiedAt: new Date().toISOString().substring(0, 7),
          status: 'active' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    onUpdateState({
      ...state,
      resources: updatedResources
    });
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceForm.title || !newResourceForm.url) return;

    const newRes: Resource = {
      id: 'res-custom-' + Date.now(),
      title: newResourceForm.title || 'Untitled Resource',
      description: newResourceForm.description || '',
      url: newResourceForm.url || '',
      resourceType: newResourceForm.resourceType || 'tool',
      category: newResourceForm.category || 'BUILD',
      subcategory: newResourceForm.subcategory || 'Tools',
      pricingType: newResourceForm.pricingType || 'free',
      isOpenSource: !!newResourceForm.isOpenSource,
      isFree: !!newResourceForm.isFree,
      hasFreeTier: !!newResourceForm.hasFreeTier,
      freeTierDescription: newResourceForm.freeTierDescription || 'Free tier available',
      difficulty: newResourceForm.difficulty || 'Beginner',
      technicalLevel: newResourceForm.technicalLevel || 'Semi-Technical',
      startupStages: newResourceForm.startupStages || ['Idea', 'Validating', 'Building MVP'],
      founderGoals: newResourceForm.founderGoals || ['Fast growth'],
      useCases: newResourceForm.useCases || ['Startup growth'],
      skillsRequired: newResourceForm.skillsRequired || ['General'],
      timeToLearn: newResourceForm.timeToLearn || '10 mins',
      recommendedFor: newResourceForm.recommendedFor || 'Solo founders',
      tags: typeof newResourceForm.tags === 'string' ? (newResourceForm.tags as string).split(',').map((t: string) => t.trim()) : newResourceForm.tags || ['Tool'],
      qualityScore: Number(newResourceForm.qualityScore) || 88,
      qualityExplanation: newResourceForm.qualityExplanation || 'Verified community submission',
      lastVerifiedAt: new Date().toISOString().substring(0, 7),
      source: 'Founder Submission',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdateState({
      ...state,
      resources: [newRes, ...resources]
    });
    setShowAddResourceModal(false);
  };

  const handleExecuteIntentSearch = (queryText: string) => {
    if (!queryText.trim()) return;
    setIsIntentSearching(true);
    setTimeout(() => {
      const result = searchResourceByIntent(queryText, profile, resources);
      setIntentResult(result);
      setIsIntentSearching(false);
    }, 200);
  };

  // Filtered resources for regular views
  const filteredResources = useMemo(() => {
    let list = [...resources];

    // Exclude hidden
    const hiddenSet = new Set(
      interactions.filter(i => i.interactionType === 'hidden').map(i => i.resourceId)
    );
    list = list.filter(r => !hiddenSet.has(r.id));

    // Category filter
    if (activeTab === 'build') {
      list = list.filter(r => r.category === 'BUILD');
      if (buildSubcategory !== 'all') {
        list = list.filter(r => r.subcategory.toLowerCase().includes(buildSubcategory.toLowerCase()));
      }
    } else if (activeTab === 'learn') {
      list = list.filter(r => r.category === 'LEARN');
      if (learnSubcategory !== 'all') {
        list = list.filter(r => r.subcategory.toLowerCase().includes(learnSubcategory.toLowerCase()));
      }
    } else if (activeTab === 'read') {
      list = list.filter(r => r.category === 'READ');
      if (readSubcategory !== 'all') {
        list = list.filter(r => r.subcategory.toLowerCase().includes(readSubcategory.toLowerCase()));
      }
    } else if (activeTab === 'discover') {
      list = list.filter(r => r.category === 'DISCOVER');
      if (discoverSubcategory !== 'all') {
        list = list.filter(r => r.subcategory.toLowerCase().includes(discoverSubcategory.toLowerCase()));
      }
    } else if (activeTab === 'my_learning') {
      const savedOrCompleted = new Set([
        ...interactions.filter(i => i.interactionType === 'saved' || i.interactionType === 'completed' || i.interactionType === 'tried').map(i => i.resourceId)
      ]);
      list = list.filter(r => savedOrCompleted.has(r.id));
    }

    // Toggle filters
    if (openSourceOnly) {
      list = list.filter(r => r.isOpenSource);
    }
    if (freeOnly) {
      list = list.filter(r => r.isFree || r.pricingType === 'free' || r.pricingType === 'open_source');
    }
    if (technicalLevelFilter !== 'all') {
      list = list.filter(r => r.technicalLevel.toLowerCase() === technicalLevelFilter.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q)) ||
          r.subcategory.toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    resources,
    activeTab,
    buildSubcategory,
    learnSubcategory,
    readSubcategory,
    discoverSubcategory,
    openSourceOnly,
    freeOnly,
    technicalLevelFilter,
    searchQuery,
    interactions
  ]);

  const renderResourceCard = (res: Resource, whyReason?: string) => {
    const isSaved = savedSet.has(res.id);
    const isCompleted = completedSet.has(res.id);
    const isTried = triedSet.has(res.id);

    return (
      <div
        key={res.id}
        className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm relative"
      >
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/70 text-slate-300 text-[11px] font-mono font-medium truncate uppercase">
                {res.subcategory}
              </span>
              {res.isOpenSource ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono font-semibold flex items-center gap-1">
                  <Check size={11} /> Open Source
                </span>
              ) : res.isFree ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-[10px] font-mono font-semibold">
                  100% Free
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[10px] font-mono font-medium">
                  Free Tier
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSave(res.id);
                }}
                className={`p-1.5 rounded-lg border transition ${
                  isSaved
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save to my learning'}
              >
                <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => setSelectedResource(res)}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Deep dive & quality breakdown"
              >
                <HelpCircle size={14} />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3
              onClick={() => setSelectedResource(res)}
              className="text-base font-semibold text-white group-hover:text-blue-300 transition cursor-pointer flex items-center justify-between"
            >
              <span>{res.title}</span>
              <span className="text-xs text-slate-400 font-mono font-normal">
                {res.qualityScore}/100
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
              {res.description}
            </p>
          </div>

          {/* Specialized Detail Chips */}
          {res.codingAgentDetails && (
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>Local Models (Ollama):</span>
                <span className={res.codingAgentDetails.localModelSupport ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {res.codingAgentDetails.localModelSupport ? 'Yes (Privacy-First)' : 'API-Only'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Envs:</span>
                <span className="text-slate-300 truncate max-w-[180px]">
                  {res.codingAgentDetails.supportedEnvironments.join(', ')}
                </span>
              </div>
            </div>
          )}

          {res.ideDetails && (
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>FLOSS Open Source:</span>
                <span className="text-emerald-400 font-semibold">
                  {res.ideDetails.isOpenSource ? 'Yes (Zero Telemetry)' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Platforms:</span>
                <span className="text-slate-300 truncate max-w-[180px]">
                  {res.ideDetails.platform.join(', ')}
                </span>
              </div>
            </div>
          )}

          {res.articleDetails && (
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-blue-400" />
                {res.articleDetails.readingTimeMinutes} min read
              </span>
              <span>•</span>
              <span className="text-slate-300 truncate">
                By {res.articleDetails.authorOrSource}
              </span>
            </div>
          )}

          {res.newsletterDetails && (
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-amber-400" />
                {res.newsletterDetails.newsletterFrequency}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">No Paywall</span>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {res.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 text-[10px] font-mono"
              >
                #{tag}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 text-[10px] font-mono">
              {res.difficulty}
            </span>
          </div>

          {/* "Why You're Seeing This" explanation */}
          {whyReason && (
            <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-200/90 leading-relaxed flex items-start gap-2">
              <Sparkles size={13} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-blue-300 font-mono">WHY: </span>
                {whyReason}
              </div>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span className="text-emerald-400 font-semibold">
              {res.freeTierDescription ? res.freeTierDescription.substring(0, 24) + '...' : '₹0 Free'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedResource(res)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Details
            </button>
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleMarkInteraction(res.id, 'tried')}
              className="px-3 py-1.5 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
            >
              <span>Visit</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* 1. FOUNDER CONTEXT BAR & HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md relative overflow-hidden space-y-5">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold tracking-tight">
                Level {founderLevel.levelNumber}: {founderLevel.title}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-semibold">
                ₹0 Zero-Budget Stack
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
              Founder Resource Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Continuous intelligence answering:{' '}
              <span className="text-blue-300 font-medium">
                “What free and open-source resources can solve my bottleneck right now?”
              </span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('vault')}
              className="px-4 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Bookmark size={15} className="text-blue-400" />
              <span>Founder Vault ({state.savedResources?.length || 0})</span>
            </button>

            <button
              onClick={() => setShowIntentModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition"
            >
              <Sparkles size={15} />
              <span>"I Need To..." Solver</span>
            </button>

            <button
              onClick={() => setShowWeeklyBriefModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Mail size={15} className="text-amber-400" />
              <span>Weekly Brief</span>
            </button>

            <button
              onClick={() => setShowAddResourceModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Suggest a new tool or article"
            >
              <Plus size={15} />
              <span>Suggest</span>
            </button>
          </div>
        </div>

        {/* Bottleneck Callout Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start md:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 md:mt-0">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-slate-400 font-mono text-[11px]">
                PRIMARY BOTTLENECK DETECTED ({profile.stage} Stage):
              </div>
              <div className="text-sm font-semibold text-white">{bottleneck.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs hidden sm:inline">{bottleneck.reason}</span>
            <button
              onClick={() => setActiveTab('for_you')}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-semibold text-xs transition shrink-0"
            >
              View Solutions
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'for_you', label: '⚡ For You', desc: 'Personalized' },
            { id: 'build', label: '🛠️ BUILD', desc: 'Agents & Tools' },
            { id: 'learn', label: '📚 LEARN', desc: 'Guides & Playbooks' },
            { id: 'read', label: '📰 READ', desc: 'Free Newsletters' },
            { id: 'discover', label: '🌐 DISCOVER', desc: 'Boilerplates & Packs' },
            { id: 'my_learning', label: '📊 My Learning', desc: `Saved (${interactions.length})` },
            { id: 'compare', label: '⚖️ Compare', desc: 'Side-by-side' },
            { id: 'verification', label: '🩺 Verification', desc: 'Quality Hub' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coding agents, IDEs, frameworks, playbooks..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setOpenSourceOnly(!openSourceOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition ${
              openSourceOnly
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {openSourceOnly ? '✓ Open Source Only' : 'Open Source Only'}
          </button>

          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition ${
              freeOnly
                ? 'bg-blue-950/80 border-blue-700 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {freeOnly ? '✓ 100% Free' : '100% Free'}
          </button>

          <select
            value={technicalLevelFilter}
            onChange={(e) => setTechnicalLevelFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-hidden font-mono"
          >
            <option value="all">All Tech Levels</option>
            <option value="non-technical">Non-Technical</option>
            <option value="semi-technical">Semi-Technical</option>
            <option value="technical">Technical</option>
            <option value="advanced dev">Advanced Dev</option>
          </select>
        </div>
      </div>

      {/* 4. MAIN CONTENT TABS */}

      {/* TAB 1: FOR YOU (INTELLIGENCE FEED) */}
      {activeTab === 'for_you' && (
        <div className="space-y-8">
          {/* Section 1: Bottleneck Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400" />
                  <span>Because of your bottleneck: {bottleneck.name}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-leverage resources matched to your immediate hurdle.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((item) => renderResourceCard(item.resource, item.whyRecommended))}
            </div>
          </div>

          {/* Section 2: Coding Agents & IDEs Spotlight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal size={16} className="text-purple-400" />
                  <span>Verified Coding Agents & Open Source IDEs</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomous agents and telemetry-free editors that run locally with ₹0 licensing cost.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('compare')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                Compare side-by-side <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources
                .filter(r => r.resourceType === 'coding_agent' || r.resourceType === 'ide')
                .slice(0, 3)
                .map(r => renderResourceCard(r))}
            </div>
          </div>

          {/* Section 3: Essential Founder Articles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-400" />
                  <span>Foundational Startup Playbooks & Case Studies</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ungated frameworks on customer discovery, manual recruitment, and retention loops.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources
                .filter(r => r.category === 'LEARN')
                .slice(0, 3)
                .map(r => renderResourceCard(r))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUILD */}
      {activeTab === 'build' && (
        <div className="space-y-5">
          {/* Subcategory Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Build Tools' },
              { id: 'coding agent', label: '🤖 AI Coding Agents' },
              { id: 'ide', label: '💻 Free & Open IDEs' },
              { id: 'database', label: '🗄️ Databases & Backend' },
              { id: 'hosting', label: '🚀 Hosting & Edge' },
              { id: 'ui/ux', label: '🎨 UI & Design Systems' },
              { id: 'analytics', label: '📊 Analytics & Replays' }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setBuildSubcategory(sub.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  buildSubcategory === sub.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Coding Agent Comparison Matrix Toggle */}
          {(buildSubcategory === 'all' || buildSubcategory.includes('coding agent')) && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    Open Source & Free Coding Agent Matrix
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Last verified: Aug 2026
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                      <th className="pb-2.5">Agent</th>
                      <th className="pb-2.5">Environments</th>
                      <th className="pb-2.5">Local Ollama</th>
                      <th className="pb-2.5">License</th>
                      <th className="pb-2.5">Setup</th>
                      <th className="pb-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {resources
                      .filter(r => r.codingAgentDetails)
                      .map(r => (
                        <tr key={r.id} className="hover:bg-slate-950/40 transition">
                          <td className="py-3 pr-2">
                            <span className="font-semibold text-white">{r.title}</span>
                          </td>
                          <td className="py-3 pr-2 text-slate-300">
                            {r.codingAgentDetails?.supportedEnvironments.join(', ')}
                          </td>
                          <td className="py-3 pr-2">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-semibold">
                              Yes
                            </span>
                          </td>
                          <td className="py-3 pr-2 text-slate-300">
                            {r.codingAgentDetails?.license}
                          </td>
                          <td className="py-3 pr-2 text-slate-300">
                            {r.codingAgentDetails?.setupDifficulty}
                          </td>
                          <td className="py-3 text-right">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] inline-flex items-center gap-1"
                            >
                              Docs <ExternalLink size={10} />
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredResources.map(r => renderResourceCard(r))}
          </div>
        </div>
      )}

      {/* TAB 3: LEARN */}
      {activeTab === 'learn' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Playbooks' },
              { id: 'discovery', label: '🎯 Customer Discovery & Validation' },
              { id: 'product', label: '📦 MVP & Product Strategy' },
              { id: 'growth', label: '🚀 Growth & First 1,000 Users' },
              { id: 'pricing', label: '💰 SaaS Pricing Tactics' },
              { id: 'retention', label: '🔄 Retention Loops & Cohorts' }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setLearnSubcategory(sub.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  learnSubcategory === sub.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredResources.map(r => renderResourceCard(r))}
          </div>
        </div>
      )}

      {/* TAB 4: READ */}
      {activeTab === 'read' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  High-Signal Free Founder Newsletters
                </h3>
                <p className="text-xs text-slate-400">
                  Curated daily & weekly briefings with zero paywalls.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredResources.map(r => renderResourceCard(r))}
          </div>
        </div>
      )}

      {/* TAB 5: DISCOVER */}
      {activeTab === 'discover' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredResources.map(r => renderResourceCard(r))}
          </div>
        </div>
      )}

      {/* TAB 6: MY LEARNING & SAVED */}
      {activeTab === 'my_learning' && (
        <div className="space-y-6">
          {/* Skill Mastery Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Founder 5-Pillar Skill Mastery</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {learningProfile.completedCount} items completed
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Technical & Architecture', val: learningProfile.skillMastery.technical, color: 'bg-blue-500' },
                  { label: 'Product & Customer Discovery', val: learningProfile.skillMastery.product, color: 'bg-indigo-500' },
                  { label: 'Marketing & Zero-Budget Distribution', val: learningProfile.skillMastery.marketing, color: 'bg-emerald-500' },
                  { label: 'Sales & Pricing Strategy', val: learningProfile.skillMastery.sales, color: 'bg-amber-500' },
                  { label: 'Operations & Retention Cohorts', val: learningProfile.skillMastery.operations, color: 'bg-purple-500' }
                ].map((skill, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{skill.label}</span>
                      <span className="text-slate-400 font-semibold">{skill.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${skill.color} rounded-full transition-all duration-500`}
                        style={{ width: `${skill.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps & Recommendations */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle size={16} />
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wide">
                    Identified Growth Gaps
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {learningProfile.gapsIdentified.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 font-mono">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setActiveTab('for_you')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Recommended Resources
              </button>
            </div>
          </div>

          {/* Saved & Completed Items List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bookmark size={15} className="text-blue-400" />
              <span>Saved & Explored Resources ({filteredResources.length})</span>
            </h3>

            {filteredResources.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <Bookmark size={24} className="text-slate-500 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">No saved resources yet</div>
                <p className="text-xs text-slate-500">
                  Click the bookmark icon on any tool, article, or agent to track it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredResources.map(r => renderResourceCard(r))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: COMPARISON MATRIX */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale size={16} className="text-blue-400" />
                  <span>Side-by-Side Tool & Agent Comparison</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compare pricing models, licenses, environments, and founder suitability.
                </p>
              </div>

              {/* Quick Select Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCompareIds(['res-opencode', 'res-cline', 'res-aider'])}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  AI Coding Agents
                </button>
                <button
                  onClick={() => setCompareIds(['res-vscodium', 'res-zed', 'res-neovim'])}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Open Source IDEs
                </button>
                <button
                  onClick={() => setCompareIds(['res-supabase', 'res-cloudflare-pages', 'res-posthog'])}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Cloud Infra Stack
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-3 text-slate-400 font-mono w-40">Attribute</th>
                    {compareIds.map(id => {
                      const r = resources.find(res => res.id === id);
                      if (!r) return null;
                      return (
                        <th key={id} className="p-3 text-white font-bold min-w-[200px]">
                          <div className="flex items-center justify-between">
                            <span>{r.title}</span>
                            <span className="text-[11px] font-mono text-slate-400 font-normal">
                              {r.qualityScore}/100
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 text-slate-400 font-semibold">Pricing Model</td>
                    {compareIds.map(id => {
                      const r = resources.find(res => res.id === id);
                      if (!r) return null;
                      return (
                        <td key={id} className="p-3 text-emerald-400 font-semibold">
                          {r.isOpenSource ? 'Open Source (₹0)' : r.isFree ? '100% Free' : r.freeTierDescription}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-semibold">Open Source / License</td>
                    {compareIds.map(id => {
                      const r = resources.find(res => res.id === id);
                      if (!r) return null;
                      return (
                        <td key={id} className="p-3 text-slate-300">
                          {r.isOpenSource ? `Yes (${r.license || 'MIT'})` : 'Proprietary / Free Cloud'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-semibold">Technical Level</td>
                    {compareIds.map(id => {
                      const r = resources.find(res => res.id === id);
                      if (!r) return null;
                      return <td key={id} className="p-3 text-slate-300">{r.technicalLevel}</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-semibold">Setup / Learning Time</td>
                    {compareIds.map(id => {
                      const r = resources.find(res => res.id === id);
                      if (!r) return null;
                      return <td key={id} className="p-3 text-slate-300">{r.timeToLearn}</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-semibold">Best Suited For</td>
                    {compareIds.map(id => {
                      const r = resources.find(res => res.id === id);
                      if (!r) return null;
                      return <td key={id} className="p-3 text-slate-300 font-sans">{r.recommendedFor}</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-semibold">Link</td>
                    {compareIds.map(id => {
                      const r = resources.find(res => res.id === id);
                      if (!r) return null;
                      return (
                        <td key={id} className="p-3">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded bg-[#0052FF] text-white font-sans text-xs inline-flex items-center gap-1"
                          >
                            Visit <ExternalLink size={10} />
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: VERIFICATION CENTER */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  FounderZero Quality & Freshness Verification Protocol
                </h3>
                <p className="text-xs text-slate-400">
                  Every resource is scored on 9 dimensions and verified monthly. Never get tricked by fake "free" tiers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-bold text-white">1. True Free Verification</div>
                <p className="text-slate-400 text-[11px] mt-1">
                  We explicitly distinguish 100% Free, Open Source, and Limited Free Tiers.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-bold text-white">2. Monthly Freshness Check</div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Automated and founder-reported checks keep outdated or dead links flagged.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-bold text-white">3. Zero Sponsored Clutter</div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Rankings are determined strictly by founder utility, never paid sponsorships.
                </p>
              </div>
            </div>
          </div>

          {/* Catalog Verification List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Catalog Audit Status</h4>
              <span className="text-xs text-slate-400 font-mono">
                {resources.length} active resources
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                  <tr>
                    <th className="p-3.5">Resource</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Quality Score</th>
                    <th className="p-3.5">Last Verified</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {resources.map(r => (
                    <tr key={r.id} className="hover:bg-slate-950/40">
                      <td className="p-3.5 font-semibold text-white">{r.title}</td>
                      <td className="p-3.5 text-slate-300">{r.category}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold">
                          {r.qualityScore}/100
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{r.lastVerifiedAt}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[11px]">
                          ✓ Verified Active
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleVerifyResource(r.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition"
                        >
                          Re-Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS & DRAWERS */}
      {/* ========================================================================= */}

      {/* A. RESOURCE DEEP DIVE MODAL */}
      {selectedResource && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedResource(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-mono font-bold uppercase">
                    {selectedResource.category} • {selectedResource.subcategory}
                  </span>
                  {selectedResource.isOpenSource && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-xs font-mono font-semibold">
                      Open Source
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedResource.title}</h2>
              </div>

              <button
                onClick={() => setSelectedResource(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedResource.description}
            </p>

            {/* Pricing Transparency Callout */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-bold">PRICING CLARITY:</span>
                <span className="text-emerald-400 font-semibold">
                  {selectedResource.isOpenSource ? '100% Free & Open Source' : selectedResource.pricingType}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {selectedResource.freeTierDescription}
              </p>
            </div>

            {/* Quality Score Breakdown */}
            {selectedResource.qualityBreakdown && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 font-bold">QUALITY AUDIT SCORE:</span>
                  <span className="text-blue-400 font-bold">{selectedResource.qualityScore} / 100</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                  <div className="p-2 bg-slate-950 rounded-lg">
                    Relevance: {selectedResource.qualityBreakdown.relevance}/10
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg">
                    Doc Quality: {selectedResource.qualityBreakdown.docQuality}/10
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg">
                    Accessibility: {selectedResource.qualityBreakdown.freeAccessibility}/10
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic pt-1">
                  "{selectedResource.qualityExplanation}"
                </p>
              </div>
            )}

            {/* Founder Suitability Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Technical Level:</span>
                <div className="font-semibold text-white mt-0.5">{selectedResource.technicalLevel}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Time to Learn:</span>
                <div className="font-semibold text-white mt-0.5">{selectedResource.timeToLearn}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSave(selectedResource.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    savedSet.has(selectedResource.id)
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Bookmark size={14} />
                  <span>{savedSet.has(selectedResource.id) ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => handleMarkInteraction(selectedResource.id, 'completed')}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    completedSet.has(selectedResource.id)
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>{completedSet.has(selectedResource.id) ? 'Completed' : 'Mark Done'}</span>
                </button>
              </div>

              <a
                href={selectedResource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleMarkInteraction(selectedResource.id, 'tried')}
                className="px-5 py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition"
              >
                <span>Launch & Visit Resource</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* B. WEEKLY FOUNDER BRIEF MODAL */}
      {showWeeklyBriefModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowWeeklyBriefModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Weekly Founder Brief</h2>
                  <p className="text-xs text-slate-400 font-mono">{weeklyBrief.weekDate}</p>
                </div>
              </div>

              <button
                onClick={() => setShowWeeklyBriefModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Brief Sections */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">
                  1. Top Bottleneck This Week
                </span>
                <div className="font-semibold text-white text-sm">
                  {weeklyBrief.biggestBottleneck}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  2. One Thing to Learn
                </span>
                <div className="font-semibold text-white">
                  {weeklyBrief.oneThingToLearn.title}
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {weeklyBrief.oneThingToLearn.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                  3. One Tool to Try (Zero-Cost)
                </span>
                <div className="font-semibold text-white">
                  {weeklyBrief.oneToolToTry.title} —{' '}
                  <span className="text-emerald-400 font-mono">{weeklyBrief.oneToolToTry.pricing}</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  {weeklyBrief.oneToolToTry.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  4. One 48-Hour Experiment
                </span>
                <div className="font-semibold text-white">
                  {weeklyBrief.oneExperimentToRun.title}
                </div>
                <p className="text-slate-300 text-[11px]">
                  Hypothesis: {weeklyBrief.oneExperimentToRun.hypothesis}
                </p>
                <div className="text-emerald-400 font-mono text-[10px]">
                  Cost: {weeklyBrief.oneExperimentToRun.cost}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase">
                  5. What to AVOID This Week
                </span>
                <div className="font-semibold text-red-200">
                  {weeklyBrief.oneThingToAvoid.warning}
                </div>
                <p className="text-red-300/80 text-[11px]">
                  {weeklyBrief.oneThingToAvoid.reason}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWeeklyBriefModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0052FF] text-white text-xs font-semibold shadow-md shadow-blue-500/20"
            >
              Acknowledge & Get to Work
            </button>
          </div>
        </div>
      )}

      {/* C. "I NEED TO..." NATURAL LANGUAGE SOLVER MODAL */}
      {showIntentModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowIntentModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-mono font-bold uppercase">Natural Language Intent Solver</span>
                </div>
                <h2 className="text-lg font-bold text-white">What problem are you trying to solve?</h2>
              </div>

              <button
                onClick={() => setShowIntentModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Input form */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={intentInput}
                  onChange={(e) => setIntentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteIntentSearch(intentInput)}
                  placeholder="e.g. Host a landing page for free with custom domain, or coding agent with local models..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => handleExecuteIntentSearch(intentInput)}
                  className="px-4 py-2.5 rounded-xl bg-[#0052FF] text-white text-xs font-semibold shadow-md transition"
                >
                  Solve
                </button>
              </div>

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Deploy landing page with free SSL',
                  'AI coding agent without paying $20/mo',
                  'Free open source IDE without telemetry',
                  'Validate customer pain before coding',
                  'SaaS pricing strategy for bootstrappers'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIntentInput(prompt);
                      handleExecuteIntentSearch(prompt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Output result */}
            {intentResult && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200">
                  <span className="font-bold text-blue-300 font-mono">INTENT MATCH: </span>
                  {intentResult.comparisonNotes}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Recommended Best Option
                    </span>
                    <div className="font-bold text-white text-sm">
                      {intentResult.recommendedOption.title}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {intentResult.recommendedOption.description}
                    </p>
                    <a
                      href={intentResult.recommendedOption.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 font-semibold inline-flex items-center gap-1 mt-1 hover:underline"
                    >
                      Open Resource <ExternalLink size={11} />
                    </a>
                  </div>

                  {intentResult.openSourceOption && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                        100% Open Source Choice
                      </span>
                      <div className="font-bold text-white text-sm">
                        {intentResult.openSourceOption.title}
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {intentResult.openSourceOption.description}
                      </p>
                      <a
                        href={intentResult.openSourceOption.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 font-semibold inline-flex items-center gap-1 mt-1 hover:underline"
                      >
                        Open Repo <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* D. SUGGEST / ADD RESOURCE MODAL */}
      {showAddResourceModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddResourceModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Suggest or Add a Free / OSS Resource</h3>
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Resource Title</label>
                <input
                  type="text"
                  required
                  value={newResourceForm.title || ''}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, title: e.target.value })}
                  placeholder="e.g. Cursor Alternative, Playbook, Newsletter"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">URL</label>
                <input
                  type="url"
                  required
                  value={newResourceForm.url || ''}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={newResourceForm.category}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, category: e.target.value as ResourceCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="BUILD">BUILD (Tools & Agents)</option>
                    <option value="LEARN">LEARN (Playbooks & Articles)</option>
                    <option value="READ">READ (Newsletters)</option>
                    <option value="DISCOVER">DISCOVER (Boilerplates & Packs)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Pricing Type</label>
                  <select
                    value={newResourceForm.pricingType}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, pricingType: e.target.value as ResourcePricingType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="open_source">Open Source</option>
                    <option value="free">100% Free</option>
                    <option value="free_tier">Generous Free Tier</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newResourceForm.description || ''}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, description: e.target.value })}
                  placeholder="What does it do and why is it useful for a bootstrapped founder?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Free Tier / OSS Description</label>
                <input
                  type="text"
                  value={newResourceForm.freeTierDescription || ''}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, freeTierDescription: e.target.value })}
                  placeholder="e.g. 100% Free Apache 2.0 / 50k MAU free"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0052FF] text-white font-semibold shadow-md"
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
