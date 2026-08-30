export type StartupStage =
  | 'Idea'
  | 'Validating'
  | 'Building MVP'
  | 'Launched'
  | 'First Revenue'
  | 'Growing';

export type UncertaintyOption =
  | "People don't want it"
  | "Can't get users"
  | "Can't monetize"
  | "Users don't stay"
  | "Don't know what to build"
  | "Don't know how to market"
  | "Too many competitors"
  | "Something else";

export interface FounderBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'execution' | 'growth' | 'zero-budget' | 'validation';
  earnedDate?: string;
}

export interface FounderSkillRating {
  skill: string;
  level: 'Novice' | 'Competent' | 'Proficient' | 'Expert';
  category: 'Engineering' | 'Product & Design' | 'Growth & Distribution' | 'Operations & Strategy';
  percentage: number;
}

export interface StartupProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  targetCustomer: string;
  problem: string;
  stage: StartupStage;
  teamSize: number;
  founderSkills: string[];
  techStack?: string[];
  monetizationModel?: string;
  monthlyBudget: number; // In ₹
  availableHoursPerWeek: number;
  currentUsers: number;
  monthlyRevenue: number; // In ₹
  biggestUncertainty: UncertaintyOption;
  goal90Days: string;
  founderName: string;
  founderAvatar?: string;
  createdAt: string;
  founderScore: number;
  monthlySavings: number;
  hasCompletedOnboarding?: boolean;
  
  // Curated Founder Profile Attributes
  founderTitle?: string;
  founderBio?: string;
  founderArchetype?: string;
  location?: string;
  timezone?: string;
  workingStyle?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
    productHunt?: string;
    substack?: string;
  };
  superpowers?: string[];
  operatingPrinciples?: string[];
  skillRatings?: FounderSkillRating[];
  badges?: FounderBadge[];
  
  // Custom Founder Gemini API Key Configuration
  geminiApiKey?: string;
}

export type ActionPriority = 'Do Now' | 'Do Next' | 'Later' | "Don't Do Yet";
export type ActionStatus = 'pending' | 'started' | 'completed' | 'skipped' | 'snoozed';

export interface NextAction {
  id: string;
  title: string;
  whyItMatters: string;
  expectedImpact: string;
  estimatedTime: string;
  estimatedCost: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  deadline: string;
  relatedBottleneck: string;
  priority: ActionPriority;
  reason: string;
  evidence: string;
  status: ActionStatus;
}

export interface DontDoItem {
  id: string;
  action: string;
  reason: string;
  currentEvidence: string;
  risk: string;
  betterAlternative: string;
}

export type HealthStatus = 'Strong' | 'Healthy' | 'Needs Attention' | 'Critical' | 'Insufficient Data';

export interface HealthDimension {
  id: string;
  name: string;
  score: number | null; // null if Insufficient Data
  status: HealthStatus;
  evidence: string;
  risk: string;
  recommendedAction: string;
}

export interface RoadmapStage {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'upcoming';
  description: string;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    successCriteria: string;
  }[];
}

export interface MissionStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  category: string;
  objective: string;
  whyItMatters: string;
  estimatedTime: string;
  estimatedCost: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedResult: string;
  completed: boolean;
  steps: MissionStep[];
}

export type ExperimentStatus =
  | 'Planned'
  | 'Running'
  | 'Completed'
  | 'Successful'
  | 'Failed'
  | 'Inconclusive';

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  problem: string;
  metric: string;
  currentValue: string;
  targetValue: string;
  method: string;
  audience: string;
  duration: string;
  budget: string;
  status: ExperimentStatus;
  resultOutcome?: string;
  learnings?: string;
  nextSteps?: string;
  createdAt: string;
}

export interface ToolRecommendation {
  id: string;
  category: string;
  freeOption: string;
  whatItSolves: string;
  freeLimitations: string;
  whenToUpgrade: string;
  monthlyCost: number; // Cost of paid equivalent
  monthlySaving: number;
  status: 'paying' | 'replaced' | 'free' | 'not_needed';
}

export interface RealityCheck {
  id: string;
  decisionClaim: string;
  actualEvidence: string;
  missingEvidence: string;
  counterargument: string;
  risk: string;
  betterAlternative: string;
  recommendedDecision: string;
  confidence: 'High' | 'Medium' | 'Low';
  evidenceStrength: 'Weak' | 'Moderate' | 'Strong';
  estimatedCost: string;
  potentialDownside: string;
  createdAt: string;
}

export interface CustomerFeedback {
  id: string;
  customerName: string;
  type: 'Interview' | 'Survey' | 'Review' | 'Support' | 'Feedback';
  content: string;
  tags: string[];
  keyPainPoint: string;
  objection?: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'bottleneck' | 'milestone' | 'customer' | 'financial' | 'experiment';
  date: string;
}

export interface MetricItem {
  id: string;
  name: string;
  key: string;
  currentValue: string | number;
  unit: string;
  trend: string;
  explanation: string;
  whyItMatters: string;
  whatToImprove: string;
  hasEnoughData: boolean;
  history: { date: string; value: number }[];
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'mission' | 'experiment' | 'reality_check' | 'customer' | 'metric' | 'stage' | 'tool';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'action' | 'insight' | 'mission' | 'health';
}

export interface User {
  id: string;
  email: string;
  name: string;
  startupName?: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
  isDemo?: boolean;
  hasCompletedOnboarding?: boolean;
}

// --- RESOURCE INTELLIGENCE SYSTEM TYPES ---

export type ResourceType =
  | 'tool'
  | 'coding_agent'
  | 'ide'
  | 'article'
  | 'newsletter'
  | 'course'
  | 'documentation'
  | 'repository'
  | 'template'
  | 'community'
  | 'dataset'
  | 'program'
  | 'hackathon';

export type ResourcePricingType =
  | 'free'
  | 'open_source'
  | 'free_tier'
  | 'freemium'
  | 'paid'
  | 'unknown';

export type ResourceCategory = 'BUILD' | 'LEARN' | 'READ' | 'DISCOVER';

export type ResourceDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type TechnicalLevel = 'Non-Technical' | 'Semi-Technical' | 'Technical' | 'Advanced Dev';

export type ResourceStatus = 'active' | 'needs_verification' | 'archived';

export type FounderLevel = 'Explorer' | 'Builder' | 'Launcher' | 'Operator' | 'Scaler';

export interface QualityBreakdown {
  relevance: number; // 0-10
  freeAccessibility: number; // 0-10
  openSource: number; // 0-10
  docQuality: number; // 0-10
  founderUsefulness: number; // 0-10
  maintenance: number; // 0-10
  community: number; // 0-10
  recency: number; // 0-10
  practicalValue: number; // 0-10
}

export interface CodingAgentDetails {
  supportedEnvironments: string[]; // e.g. ["VS Code", "Cursor", "Terminal", "JetBrains", "Web"]
  localModelSupport: boolean; // Ollama, LM Studio, vLLM
  modelFlexibility: string; // e.g. "Any OpenAI-compatible API, Anthropic, Gemini, Local"
  repositoryUrl?: string;
  documentationUrl?: string;
  setupDifficulty: 'Easy' | 'Medium' | 'Complex';
  license: string; // e.g. "Apache 2.0", "MIT", "GPLv3"
}

export interface IDEDetails {
  platform: string[]; // e.g. ["Mac", "Windows", "Linux", "Web"]
  languageSupport: string[];
  extensions: string;
  aiSupport: string;
  offlineSupport: boolean;
  isOpenSource: boolean;
  bestUseCase: string;
}

export interface NewsletterDetails {
  newsletterFrequency: 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  subscriptionUrl: string;
  isFree: boolean;
  topics: string[];
  audienceLevel: 'All Founders' | 'Technical Founders' | 'Growth & Product' | 'Early Stage';
}

export interface ArticleDetails {
  readingTimeMinutes: number;
  problemSolved: string;
  authorOrSource: string;
  isPaywalled: boolean;
  publicationDate?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  resourceType: ResourceType;
  category: ResourceCategory;
  subcategory: string;
  pricingType: ResourcePricingType;
  isOpenSource: boolean;
  isFree: boolean;
  hasFreeTier: boolean;
  freeTierDescription: string;
  license?: string;
  platform?: string[];
  difficulty: ResourceDifficulty;
  technicalLevel: TechnicalLevel;
  startupStages: StartupStage[];
  founderGoals: string[];
  useCases: string[];
  skillsRequired: string[];
  timeToLearn: string;
  recommendedFor: string;
  tags: string[];
  qualityScore: number; // 0-100
  qualityBreakdown?: QualityBreakdown;
  qualityExplanation: string;
  lastVerifiedAt: string; // ISO or YYYY-MM
  source: string;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
  codingAgentDetails?: CodingAgentDetails;
  ideDetails?: IDEDetails;
  newsletterDetails?: NewsletterDetails;
  articleDetails?: ArticleDetails;
  isFeatured?: boolean;
}

export type ResourceInteractionType =
  | 'saved'
  | 'completed'
  | 'useful'
  | 'not_useful'
  | 'hidden'
  | 'clicked'
  | 'tried';

export interface UserResourceInteraction {
  id: string;
  userId: string;
  startupId: string;
  resourceId: string;
  interactionType: ResourceInteractionType;
  createdAt: string;
  notes?: string;
}

export interface SkillMastery {
  technical: number; // 0-100
  product: number; // 0-100
  marketing: number; // 0-100
  sales: number; // 0-100
  operations: number; // 0-100
}

export interface FounderLearningProfile {
  completedCount: number;
  articlesRead: number;
  toolsTried: number;
  coursesCompleted: number;
  skillsLearned: string[];
  topicsExplored: string[];
  skillMastery: SkillMastery;
  gapsIdentified: string[];
}

export interface RecommendedResourceItem {
  resource: Resource;
  recommendationScore: number;
  whyRecommended: string;
  matchingBottleneck?: string;
  matchingStage?: string;
  matchingGoal?: string;
}

export interface IntentSearchResult {
  query: string;
  detectedIntent: string;
  recommendedOption: Resource;
  freeOption: Resource;
  openSourceOption?: Resource;
  beginnerOption?: Resource;
  allMatches: Resource[];
  comparisonNotes: string;
}

export interface WeeklyFounderBrief {
  weekDate: string;
  founderLevel: {
    levelNumber: number;
    title: FounderLevel;
    description: string;
  };
  biggestBottleneck: string;
  oneThingToLearn: {
    title: string;
    description: string;
    resource?: Resource;
  };
  oneToolToTry: {
    title: string;
    pricing: string;
    description: string;
    resource?: Resource;
  };
  oneArticleToRead: {
    title: string;
    readTime: string;
    description: string;
    resource?: Resource;
  };
  oneExperimentToRun: {
    title: string;
    hypothesis: string;
    cost: string;
  };
  oneThingToAvoid: {
    warning: string;
    reason: string;
  };
}

// --- FOUNDER VAULT TYPES ---

export type VaultResourceType =
  | 'tool'
  | 'coding_agent'
  | 'ide'
  | 'article'
  | 'newsletter'
  | 'course'
  | 'repository'
  | 'template'
  | 'website'
  | 'documentation'
  | 'video'
  | 'community'
  | 'other';

export type ReadLaterStatus = 'unread' | 'reading' | 'completed' | 'archived';
export type VaultPriority = 'high' | 'medium' | 'low';

export interface VaultReminder {
  id: string;
  dueDate: string; // ISO date string
  label: 'Tomorrow' | 'This week' | 'Next week' | 'Custom';
  note?: string;
  triggered: boolean;
}

export interface UserSavedResource {
  id: string;
  userId: string;
  startupId: string;
  resourceId?: string; // Links to FounderZero curated Resource if exists
  url: string;
  title: string;
  description: string;
  resourceType: VaultResourceType;
  category: string;
  tags: string[];
  notes: string;
  priority: VaultPriority;
  status: ReadLaterStatus;
  faviconUrl?: string;
  source?: string;
  author?: string;
  collections: string[]; // collection names or IDs e.g. ['MVP Tools', 'Read Later']
  readingTimeMinutes?: number;
  suggestedStage?: StartupStage;
  relevantProblem?: string; // e.g. 'Retention', 'Customer Acquisition', 'MVP Build', 'Pricing'
  relevantSkill?: string;
  isOpenSource?: boolean;
  githubRepo?: string;
  reminder?: VaultReminder;
  isLinkBroken?: boolean;
  lastCheckedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  dismissedFromSurfacing?: boolean;
}

export interface VaultCollection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface VaultSurfacedSuggestion {
  resource: UserSavedResource;
  reason: string;
  triggerType: 'bottleneck' | 'mission' | 'experiment' | 'time';
  savedDaysAgo: number;
  triggerContext: string;
}

// --- FOUNDER NOTEPAD TYPES ---

export type NoteBlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'numberedList'
  | 'checklist'
  | 'quote'
  | 'code'
  | 'table'
  | 'callout'
  | 'divider';

export interface NoteTableData {
  headers: string[];
  rows: string[][];
}

export interface NoteBlock {
  id: string;
  type: NoteBlockType;
  content: string;
  checked?: boolean; // For checklist
  language?: string; // For code blocks
  calloutVariant?: 'info' | 'idea' | 'warning' | 'success' | 'founder';
  calloutIcon?: string;
  tableData?: NoteTableData;
}

export interface NoteConnection {
  entityType: 'mission' | 'experiment' | 'metric' | 'customer' | 'resource' | 'goal' | 'startup';
  entityId: string;
  entityTitle: string;
  entitySubtitle?: string;
}

export interface FounderNote {
  id: string;
  title: string;
  blocks: NoteBlock[];
  collection: string; // 'Ideas' | 'Product' | 'Customers' | 'Research' | 'Marketing' | 'Growth' | 'Experiments' | 'Meetings' | 'Strategy' | 'Technical' | 'Fundraising' | 'Personal' | custom
  tags: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  isTrash?: boolean;
  includeInKnowledgeBase?: boolean;
  connections?: NoteConnection[];
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
  version?: number;
}

export interface NoteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  defaultTitle: string;
  defaultCollection: string;
  defaultTags: string[];
  blocks: Omit<NoteBlock, 'id'>[];
}

// --- FOUNDER COPILOT TYPES ---

export type CopilotMode =
  | 'default'
  | 'reality-check'
  | 'brainstorm'
  | 'decision-support'
  | 'building-help'
  | 'product-validation'
  | 'feedback-analysis'
  | 'plan-week'
  | 'mission-creator'
  | 'experiment-creator'
  | 'resources';

export type CopilotSourceType =
  | 'health'
  | 'metric'
  | 'feedback'
  | 'experiment'
  | 'mission'
  | 'note'
  | 'vault'
  | 'resource'
  | 'profile'
  | 'reality_check'
  | 'action'
  | 'memory';

export interface CopilotSourceReference {
  type: CopilotSourceType;
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  route?: string;
}

export interface EvidenceBreakdown {
  knownData?: { label: string; value: string; sourceId?: string }[];
  founderAssumptions?: string[];
  inferences?: string[];
  generalKnowledge?: string[];
}

export interface CopilotDecisionOption {
  name: string;
  impact: 'High' | 'Medium' | 'Low' | 'Unknown';
  effort: 'High' | 'Medium' | 'Low';
  evidence: string;
}

export interface CopilotFeedbackInsight {
  problem: string;
  count: string;
  percentage?: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface CopilotActionProposal {
  id: string;
  type:
    | 'notepad_draft'
    | 'create_mission'
    | 'create_experiment'
    | 'save_resource'
    | 'update_startup_profile'
    | 'reality_check'
    | 'decision_matrix'
    | 'product_validation'
    | 'feedback_analysis';
  title: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  draftNote?: {
    title: string;
    collection: string;
    tags: string[];
    content?: string;
    blocks: NoteBlock[];
  };
  missionData?: {
    title: string;
    category: string;
    objective: string;
    whyItMatters: string;
    estimatedTime: string;
    estimatedCost: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    expectedResult: string;
    steps: { id: string; text: string; completed: boolean }[];
  };
  experimentData?: {
    title: string;
    hypothesis: string;
    problem: string;
    metric: string;
    currentValue: string;
    targetValue: string;
    method: string;
    audience: string;
    duration: string;
    budget: string;
  };
  savedResourceData?: {
    id?: string;
    title: string;
    url: string;
    category: string;
    resourceType: VaultResourceType;
    notes: string;
    collections?: string[];
  };
  profileUpdateData?: Partial<StartupProfile>;
  decisionData?: {
    optionA: CopilotDecisionOption;
    optionB: CopilotDecisionOption;
    recommendation: string;
    reason: string;
  };
  productValidationData?: {
    whatWeKnow: string[];
    whatWeDontKnow: string[];
    biggestAssumption: string;
    cheapestValidationExperiment: string;
    recommendation: string;
  };
  feedbackAnalysisData?: {
    topRecurringProblems: CopilotFeedbackInsight[];
    commonRequests: string[];
    positiveSignals: string[];
    recurringContradictions?: string[];
    recommendedAction: string;
  };
}

export interface CopilotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: CopilotMode;
  intent?: string;
  insufficientEvidenceWarning?: boolean;
  retrievedContextSummary?: { category: string; label: string; count: number }[];
  sources?: CopilotSourceReference[];
  evidenceBreakdown?: EvidenceBreakdown;
  actionProposal?: CopilotActionProposal;
}

export interface CopilotConversation {
  id: string;
  userId: string;
  startupId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  lastMessagePreview?: string;
  messagesCount?: number;
  mode?: CopilotMode;
  tags?: string[];
}

export interface FounderMemory {
  id: string;
  userId: string;
  startupId: string;
  category:
    | 'decision'
    | 'customer_fact'
    | 'target_icp'
    | 'business_model'
    | 'technical_choice'
    | 'experiment_learning'
    | 'constraint';
  key: string;
  value: string;
  confidence: 'Proven' | 'Hypothesis' | 'Founder Assumption';
  source: string;
  createdAt: string;
  updatedAt: string;
  confirmedByFounder: boolean;
}

export interface AppState {
  user: User | null;
  profile: StartupProfile;
  nextActions: NextAction[];
  dontDoItems: DontDoItem[];
  healthDimensions: HealthDimension[];
  roadmapStages: RoadmapStage[];
  missions: Mission[];
  experiments: Experiment[];
  tools: ToolRecommendation[];
  realityChecks: RealityCheck[];
  customerFeedback: CustomerFeedback[];
  insights: Insight[];
  metrics: MetricItem[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  resources: Resource[];
  resourceInteractions: UserResourceInteraction[];
  learningProfile: FounderLearningProfile;
  savedResources?: UserSavedResource[];
  vaultCollections?: VaultCollection[];
  notes?: FounderNote[];
  noteCollections?: string[];
  copilotConversations?: CopilotConversation[];
  copilotMessages?: Record<string, CopilotMessage[]>;
  founderMemories?: FounderMemory[];
  hasCompletedOnboarding?: boolean;
}



