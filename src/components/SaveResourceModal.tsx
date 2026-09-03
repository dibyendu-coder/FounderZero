import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Bookmark,
  ExternalLink,
  Sparkles,
  Loader2,
  FolderPlus,
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Code2,
  Terminal,
  Layers,
  Mail,
  BookOpen,
  Video,
  Users2,
  Globe,
  Tag
} from 'lucide-react';
import {
  AppState,
  ReadLaterStatus,
  StartupStage,
  UserSavedResource,
  VaultCollection,
  VaultPriority,
  VaultReminder,
  VaultResourceType
} from '../types';

interface SaveResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  state?: AppState;
  onSaveResource?: (resource: Partial<UserSavedResource>) => Promise<{ isDuplicate?: boolean; existingId?: string; saved?: UserSavedResource }>;
  onSave?: (resource: Partial<UserSavedResource>) => Promise<{ isDuplicate?: boolean; existingId?: string; saved?: UserSavedResource }>;
  collections?: VaultCollection[];
  onCreateCollection?: (name: string, description?: string, icon?: string, color?: string) => Promise<void>;
  initialUrl?: string;
  initialResource?: Partial<UserSavedResource>;
  initialData?: Partial<UserSavedResource>;
}

export const SaveResourceModal: React.FC<SaveResourceModalProps> = ({
  isOpen,
  onClose,
  state,
  onSaveResource,
  onSave,
  collections: propCollections,
  onCreateCollection,
  initialUrl = '',
  initialResource,
  initialData
}) => {
  const activeInitial = initialResource || initialData;
  const [url, setUrl] = useState(initialUrl || activeInitial?.url || '');
  const [title, setTitle] = useState(activeInitial?.title || '');
  const [description, setDescription] = useState(activeInitial?.description || '');
  const [resourceType, setResourceType] = useState<VaultResourceType>(activeInitial?.resourceType || 'website');
  const [category, setCategory] = useState(activeInitial?.category || 'Development');
  const [tagsInput, setTagsInput] = useState((activeInitial?.tags || []).join(', '));
  const [notes, setNotes] = useState(activeInitial?.notes || '');
  const [priority, setPriority] = useState<VaultPriority>(activeInitial?.priority || 'medium');
  const [status, setStatus] = useState<ReadLaterStatus>(activeInitial?.status || 'unread');
  const [selectedCollections, setSelectedCollections] = useState<string[]>(activeInitial?.collections || []);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [suggestedStage, setSuggestedStage] = useState<StartupStage | ''>(activeInitial?.suggestedStage || '');
  const [relevantProblem, setRelevantProblem] = useState(activeInitial?.relevantProblem || '');
  const [readingTime, setReadingTime] = useState<number>(activeInitial?.readingTimeMinutes || 5);
  const [isOpenSource, setIsOpenSource] = useState(activeInitial?.isOpenSource || false);
  const [githubRepo, setGithubRepo] = useState(activeInitial?.githubRepo || '');
  
  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(!!activeInitial?.reminder);
  const [reminderPeriod, setReminderPeriod] = useState<'Tomorrow' | 'This week' | 'Next week' | 'Custom'>(
    activeInitial?.reminder?.label || 'Tomorrow'
  );
  const [reminderCustomDate, setReminderCustomDate] = useState(
    activeInitial?.reminder?.dueDate ? activeInitial.reminder.dueDate.substring(0, 10) : ''
  );
  const [reminderNote, setReminderNote] = useState(activeInitial?.reminder?.note || '');

  // UI status
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiOrganizeSuggested, setAiOrganizeSuggested] = useState(false);

  const fallbackCollections: VaultCollection[] = [
    { id: 'c1', name: 'MVP Tools', color: '#0052FF', createdAt: '' },
    { id: 'c2', name: 'Marketing Ideas', color: '#10B981', createdAt: '' },
    { id: 'c3', name: 'AI Tools', color: '#8B5CF6', createdAt: '' },
    { id: 'c4', name: 'Read Later', color: '#F59E0B', createdAt: '' },
    { id: 'c5', name: 'Useful GitHub Repos', color: '#64748B', createdAt: '' }
  ];

  const collections = propCollections || state?.vaultCollections || fallbackCollections;

  useEffect(() => {
    if (isOpen) {
      const active = initialResource || initialData;
      const targetUrl = initialUrl || active?.url || '';
      setUrl(targetUrl);
      setTitle(active?.title || '');
      setDescription(active?.description || '');
      setResourceType(active?.resourceType || 'website');
      setCategory(active?.category || 'Development');
      setTagsInput((active?.tags || []).join(', '));
      setNotes(active?.notes || '');
      setPriority(active?.priority || 'medium');
      setStatus(active?.status || 'unread');
      setSelectedCollections(active?.collections || []);
      setSuggestedStage(active?.suggestedStage || '');
      setRelevantProblem(active?.relevantProblem || '');
      setReadingTime(active?.readingTimeMinutes || 5);
      setIsOpenSource(active?.isOpenSource || false);
      setGithubRepo(active?.githubRepo || '');
      setReminderEnabled(!!active?.reminder);

      if (targetUrl && !active?.title) {
        handleExtract(targetUrl);
      }
      setDuplicateWarning(null);
      setSaveSuccess(false);
    }
  }, [isOpen, initialUrl, initialResource, initialData]);

  if (!isOpen) return null;

  const handleExtract = async (targetUrl?: string) => {
    const urlToUse = (targetUrl || url).trim();
    if (!urlToUse) return;

    setIsExtracting(true);
    setDuplicateWarning(null);

    // Check duplicate in client state first
    const existing = (state?.savedResources || []).find(r => {
      const u1 = (r.url || '').toLowerCase().replace(/\/+$/, '');
      const u2 = urlToUse.toLowerCase().replace(/\/+$/, '');
      return u1 === u2;
    });

    if (existing) {
      setDuplicateWarning(`You already have this resource saved as "${existing.title}".`);
      setTitle(existing.title);
      setDescription(existing.description);
      setResourceType(existing.resourceType);
      setCategory(existing.category);
      setTagsInput((existing.tags || []).join(', '));
      setNotes(existing.notes || '');
      setSelectedCollections(existing.collections || []);
      setStatus(existing.status);
      setPriority(existing.priority);
      setIsExtracting(false);
      return;
    }

    try {
      const res = await fetch('/api/vault/extract-url-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToUse })
      });
      const data = await res.json();
      if (data.success && data.extracted) {
        const ext = data.extracted;
        setTitle(ext.title || title);
        setDescription(ext.description || description);
        setResourceType(ext.resourceType || resourceType);
        setCategory(ext.category || category);
        if (ext.tags && Array.isArray(ext.tags)) {
          setTagsInput(ext.tags.join(', '));
        }
        if (ext.suggestedStage) setSuggestedStage(ext.suggestedStage);
        if (ext.relevantProblem) setRelevantProblem(ext.relevantProblem);
        if (ext.readingTimeMinutes) setReadingTime(ext.readingTimeMinutes);
        if (ext.isOpenSource !== undefined) setIsOpenSource(ext.isOpenSource);
        if (ext.githubRepo) setGithubRepo(ext.githubRepo);
        
        // Auto select read later if article/newsletter
        if (ext.resourceType === 'article' || ext.resourceType === 'newsletter') {
          if (!selectedCollections.includes('Read Later')) {
            setSelectedCollections(prev => [...prev, 'Read Later']);
          }
        }
        if (ext.resourceType === 'coding_agent' || ext.category === 'AI Tools') {
          if (!selectedCollections.includes('AI Tools')) {
            setSelectedCollections(prev => [...prev, 'AI Tools']);
          }
        }
        if (ext.isOpenSource || ext.resourceType === 'repository') {
          if (!selectedCollections.includes('Useful GitHub Repos')) {
            setSelectedCollections(prev => [...prev, 'Useful GitHub Repos']);
          }
        }
        setAiOrganizeSuggested(true);
      }
    } catch (err) {
      console.error('URL extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleToggleCollection = (name: string) => {
    setSelectedCollections(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    const name = newCollectionName.trim();
    if (!selectedCollections.includes(name)) {
      setSelectedCollections(prev => [...prev, name]);
    }
    if (onCreateCollection) {
      try {
        await onCreateCollection(name);
      } catch (err) {
        console.error('Failed to create collection:', err);
      }
    }
    setNewCollectionName('');
    setShowAddCollection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !title.trim()) return;

    setIsSaving(true);
    setDuplicateWarning(null);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    let reminder: VaultReminder | undefined = undefined;
    if (reminderEnabled) {
      const now = new Date();
      let due = new Date();
      if (reminderPeriod === 'Tomorrow') {
        due.setDate(now.getDate() + 1);
      } else if (reminderPeriod === 'This week') {
        due.setDate(now.getDate() + 3);
      } else if (reminderPeriod === 'Next week') {
        due.setDate(now.getDate() + 7);
      } else if (reminderCustomDate) {
        due = new Date(reminderCustomDate);
      }

      reminder = {
        id: 'rem-' + Date.now(),
        dueDate: due.toISOString(),
        label: reminderPeriod,
        note: reminderNote || `Review ${title}`,
        triggered: false
      };
    }

    const payload: Partial<UserSavedResource> = {
      url: url.trim(),
      title: title.trim() || url.trim(),
      description: description.trim(),
      resourceType,
      category: category || 'Unsorted',
      tags,
      notes: notes.trim(),
      priority,
      status,
      collections: selectedCollections,
      suggestedStage: (suggestedStage as StartupStage) || undefined,
      relevantProblem: relevantProblem.trim() || undefined,
      readingTimeMinutes: readingTime || 5,
      isOpenSource,
      githubRepo: githubRepo.trim() || undefined,
      reminder
    };

    try {
      const saveFn = onSaveResource || onSave;
      if (saveFn) {
        const result = await saveFn(payload);
        if (result?.isDuplicate) {
          setDuplicateWarning(`Already saved in your Founder Vault! We updated your notes and collection assignments.`);
        }
      }
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const resourceTypes: { id: VaultResourceType; label: string; icon: any }[] = [
    { id: 'tool', label: 'Tool', icon: Layers },
    { id: 'coding_agent', label: 'Coding Agent', icon: Terminal },
    { id: 'ide', label: 'IDE / Editor', icon: Code2 },
    { id: 'article', label: 'Article / Essay', icon: FileText },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'course', label: 'Course / Guide', icon: BookOpen },
    { id: 'repository', label: 'GitHub Repo', icon: Terminal },
    { id: 'template', label: 'Template', icon: Layers },
    { id: 'documentation', label: 'Docs / API', icon: FileText },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'community', label: 'Community', icon: Users2 },
    { id: 'website', label: 'Website', icon: Globe }
  ];

  const categories = [
    'Development',
    'Growth',
    'Product',
    'AI Tools',
    'Design',
    'Fundraising',
    'Operations',
    'Legal',
    'Unsorted'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050506]/85 backdrop-blur-xl overflow-y-auto font-sans text-[#EDEDEF]">
      <div className="bg-[#0a0a0c] text-[#EDEDEF] rounded-2xl w-full max-w-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#050506]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/20 text-indigo-300 flex items-center justify-center font-bold">
              <Bookmark size={17} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#EDEDEF]">Save to Founder Vault</h2>
              <p className="text-xs text-[#8A8F98] font-mono">Found it? Save it now, find it when you need it.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-sans">
          {saveSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>✓ Saved to Founder Vault! Your library has been synchronized.</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-amber-200 text-xs">
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold">{duplicateWarning}</p>
                <p className="text-[11px] text-amber-300/80 mt-0.5">You can update notes, priority, or assign it to additional collections below.</p>
              </div>
            </div>
          )}

          {/* URL Input with Smart Auto-Extract */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#8A8F98] uppercase tracking-wider font-mono">
              Resource URL <span className="text-[#5E6AD2]">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onBlur={() => {
                    if (url.trim() && !title) {
                      handleExtract();
                    }
                  }}
                  placeholder="https://github.com/... or https://..."
                  className="w-full pl-3 pr-3 py-2 text-xs font-mono bg-white/[0.04] border border-white/10 text-[#EDEDEF] placeholder:text-[#8A8F98] rounded-xl focus:outline-none focus:border-[#5E6AD2] transition"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => handleExtract()}
                disabled={isExtracting || !url.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-white" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-white" />
                    <span>Auto-Detect</span>
                  </>
                )}
              </button>
            </div>
            {aiOrganizeSuggested && (
              <p className="text-[11px] text-[#5E6AD2] flex items-center gap-1">
                <Sparkles size={12} /> Auto-detected title, tags, and suggested collections based on URL.
              </p>
            )}
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#EDEDEF]">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. OpenCode — Autonomous Coding Agent"
                className="w-full px-3 py-2 text-xs text-[#EDEDEF] bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-[#5E6AD2] font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#EDEDEF]">Description / Summary</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="What does this resource do for your startup?"
                className="w-full px-3 py-2 text-xs text-[#EDEDEF] bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-[#5E6AD2] resize-none"
              />
            </div>
          </div>

          {/* Resource Type & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#EDEDEF]">Resource Type</label>
              <select
                value={resourceType}
                onChange={e => setResourceType(e.target.value as VaultResourceType)}
                className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 rounded-xl focus:outline-none focus:border-[#5E6AD2] text-[#EDEDEF] font-medium"
              >
                {resourceTypes.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#EDEDEF]">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 rounded-xl focus:outline-none focus:border-[#5E6AD2] text-[#EDEDEF] font-medium"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Folders & Collections */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[#EDEDEF]">Assign to Collections / Folders</label>
              <button
                type="button"
                onClick={() => setShowAddCollection(!showAddCollection)}
                className="text-[11px] font-semibold text-[#5E6AD2] hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> New Folder
              </button>
            </div>

            {showAddCollection && (
              <div className="flex gap-2 p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  placeholder="e.g. AI Tools, Read Later, MVP Tools"
                  className="flex-1 px-3 py-1.5 text-xs bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-lg focus:outline-none focus:border-[#5E6AD2]"
                />
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  className="px-3 py-1.5 bg-[#5E6AD2] hover:bg-[#6872D9] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {collections.map(col => {
                const isSelected = selectedCollections.includes(col.name);
                return (
                  <button
                    key={col.id || col.name}
                    type="button"
                    onClick={() => handleToggleCollection(col.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#5E6AD2]/20 border-[#5E6AD2]/50 text-indigo-300 font-semibold'
                        : 'bg-white/[0.03] border-white/10 text-[#8A8F98] hover:border-white/20'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: col.color || '#5E6AD2' }}
                    />
                    <span>{col.name}</span>
                    {isSelected && <span className="text-[#5E6AD2] text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags & Reading / Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-medium text-[#EDEDEF]">Reading Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ReadLaterStatus)}
                className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 text-[#EDEDEF] rounded-xl focus:outline-none focus:border-[#5E6AD2]"
              >
                <option value="unread">Unread</option>
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-medium text-[#EDEDEF]">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as VaultPriority)}
                className="w-full px-3 py-2 text-xs bg-[#0a0a0c] border border-white/10 text-[#EDEDEF] rounded-xl focus:outline-none focus:border-[#5E6AD2]"
              >
                <option value="high">🔥 High Priority</option>
                <option value="medium">⚡ Medium Priority</option>
                <option value="low">☕ Low / Someday</option>
              </select>
            </div>

            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-medium text-[#EDEDEF]">Read Time (mins)</label>
              <input
                type="number"
                min="1"
                max="180"
                value={readingTime}
                onChange={e => setReadingTime(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl focus:outline-none focus:border-[#5E6AD2]"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#EDEDEF]">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. AI, Open Source, Retention, Customer Discovery"
              className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl focus:outline-none focus:border-[#5E6AD2] font-mono"
            />
          </div>

          {/* Personal Founder Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#EDEDEF]">
              Personal Founder Notes <span className="text-[#8A8F98] font-normal">(Private to you)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. 'Try this when current coding workflow becomes too slow' or 'Use questions during next week interviews'"
              className="w-full px-3 py-2 text-xs text-[#EDEDEF] bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-[#5E6AD2] resize-none font-sans"
            />
          </div>

          {/* Remind Me Later Option */}
          <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#EDEDEF]">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={e => setReminderEnabled(e.target.checked)}
                  className="rounded text-[#5E6AD2] focus:ring-[#5E6AD2]"
                />
                <Bell size={14} className="text-amber-400" />
                <span>Set a Reminder for this Resource</span>
              </label>
              {reminderEnabled && (
                <span className="text-[11px] font-mono text-[#8A8F98] font-medium">Optional</span>
              )}
            </div>

            {reminderEnabled && (
              <div className="space-y-2 pt-1 font-sans">
                <div className="flex flex-wrap gap-2">
                  {(['Tomorrow', 'This week', 'Next week', 'Custom'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setReminderPeriod(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        reminderPeriod === p
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-white/[0.04] border-white/10 text-[#8A8F98] hover:bg-white/[0.08]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {reminderPeriod === 'Custom' && (
                  <input
                    type="date"
                    value={reminderCustomDate}
                    onChange={e => setReminderCustomDate(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/10 rounded-lg text-[#EDEDEF]"
                  />
                )}

                <input
                  type="text"
                  value={reminderNote}
                  onChange={e => setReminderNote(e.target.value)}
                  placeholder="Reminder note (e.g. 'Test this tool when building sprint 3 MVP')"
                  className="w-full px-3 py-1.5 text-xs bg-white/[0.04] border border-white/10 rounded-lg text-[#EDEDEF]"
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8A8F98] hover:bg-white/[0.06] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (!url.trim() && !title.trim())}
              className="px-5 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] disabled:opacity-50 text-white text-xs font-semibold shadow-[0_0_16px_rgba(94,106,210,0.3)] flex items-center gap-1.5 transition cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  <span>Saving to Vault...</span>
                </>
              ) : (
                <>
                  <Bookmark size={14} />
                  <span>Save to Founder Vault</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
