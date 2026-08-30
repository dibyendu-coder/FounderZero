import { AppState, StartupProfile, StartupStage, User } from '../types';
import { SEED_RESOURCES } from './resourcesData';
import { INITIAL_COPILOT_CONVERSATIONS, INITIAL_COPILOT_MESSAGES, INITIAL_FOUNDER_MEMORIES } from './copilotData';
import { INITIAL_FOUNDER_NOTES, DEFAULT_NOTEPAD_COLLECTIONS } from './notepadData';

export function createFreshAppState(
  userId: string,
  userEmail: string,
  userName: string,
  startupName?: string,
  stage: StartupStage = 'Idea',
  avatarUrl?: string
): { user: User; state: AppState } {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const cleanNameDesc = (userName || '').trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Founder');
  const cleanStartupName = startupName?.trim() || `${cleanNameDesc}'s Startup`;

  const user: User = {
    id: userId,
    email: cleanEmail,
    name: cleanNameDesc,
    startupName: cleanStartupName,
    avatarUrl,
    role: 'Founder',
    createdAt: new Date().toISOString(),
    isDemo: false,
    hasCompletedOnboarding: false
  };

  const profile: StartupProfile = {
    id: 'startup-' + userId,
    name: cleanStartupName,
    description: '',
    category: 'SaaS',
    targetCustomer: '',
    problem: '',
    stage,
    teamSize: 1,
    founderSkills: [],
    monthlyBudget: 0,
    availableHoursPerWeek: 20,
    currentUsers: 0,
    monthlyRevenue: 0,
    biggestUncertainty: "People don't want it",
    goal90Days: stage === 'Idea' ? 'Validate problem with 10 customer interviews' : 'Acquire first 50 active users',
    founderName: cleanNameDesc,
    createdAt: new Date().toISOString(),
    founderScore: 40,
    monthlySavings: 0,
    hasCompletedOnboarding: false
  };

  const state: AppState = {
    user,
    profile,
    nextActions: [
      {
        id: 'act-init-1',
        title: 'Conduct 5 customer problem validation interviews',
        whyItMatters: 'Validates that your target customer actually feels the pain point.',
        expectedImpact: 'Prevents building a product nobody wants.',
        estimatedTime: '2 hours',
        estimatedCost: '₹0',
        difficulty: 'Easy',
        deadline: 'Within 5 days',
        relatedBottleneck: 'Problem Validation',
        priority: 'Do Now',
        reason: 'Zero validation notes recorded. Start by interviewing potential users.',
        evidence: '0 feedback notes saved.',
        status: 'pending'
      }
    ],
    dontDoItems: [
      {
        id: 'dont-init-1',
        action: 'Do NOT write code or hire developers yet',
        reason: 'Writing code before speaking with 5 potential customers risks building unvalidated features.',
        currentEvidence: '0 customer interviews logged.',
        risk: 'Wasted weeks of development time.',
        betterAlternative: 'Talk to 5 target users first.'
      }
    ],
    healthDimensions: [
      {
        id: 'dim-1',
        name: 'Problem Validation',
        score: null,
        status: 'Insufficient Data',
        evidence: 'No interviews logged yet.',
        risk: 'Building without validation.',
        recommendedAction: 'Log 5 customer interviews.'
      },
      {
        id: 'dim-2',
        name: 'Customer Understanding',
        score: null,
        status: 'Insufficient Data',
        evidence: '0 interview notes.',
        risk: 'Assumptions unverified.',
        recommendedAction: 'Record customer pain points.'
      },
      {
        id: 'dim-3',
        name: 'Product & Onboarding',
        score: null,
        status: 'Insufficient Data',
        evidence: 'MVP not launched.',
        risk: 'Unlaunched product.',
        recommendedAction: 'Focus on problem validation first.'
      },
      {
        id: 'dim-4',
        name: 'Distribution & Traffic',
        score: null,
        status: 'Insufficient Data',
        evidence: '0 active users.',
        risk: 'No acquisition channel.',
        recommendedAction: 'Identify target community hubs.'
      },
      {
        id: 'dim-5',
        name: 'Revenue & Pricing',
        score: null,
        status: 'Insufficient Data',
        evidence: '0 revenue.',
        risk: 'Unproven monetization.',
        recommendedAction: 'Test pricing willingness during interviews.'
      },
      {
        id: 'dim-6',
        name: 'Retention & Churn',
        score: null,
        status: 'Insufficient Data',
        evidence: '0 users.',
        risk: 'No retention cohort.',
        recommendedAction: 'Acquire first 10 beta users.'
      },
      {
        id: 'dim-7',
        name: 'Operations & Bandwidth',
        score: 70,
        status: 'Healthy',
        evidence: '20 hrs/week available.',
        risk: 'Solo founder bandwidth constraints.',
        recommendedAction: 'Focus on top 1 bottleneck.'
      },
      {
        id: 'dim-8',
        name: 'Financial Discipline',
        score: 100,
        status: 'Strong',
        evidence: '₹0 spent on software.',
        risk: 'None.',
        recommendedAction: 'Use zero-budget tools.'
      }
    ],
    roadmapStages: [
      {
        id: 'stg-1',
        name: 'IDEA & PROBLEM',
        status: 'active',
        description: 'Define ICP and complete 10 problem interviews.',
        milestones: [
          { id: 'm1', title: 'Define Target Customer Persona', completed: false, successCriteria: 'Documented ICP' },
          { id: 'm2', title: '10 Customer Problem Interviews', completed: false, successCriteria: '10 recorded summaries' }
        ]
      },
      {
        id: 'stg-2',
        name: 'VALIDATION',
        status: 'upcoming',
        description: 'Test willingness to pay.',
        milestones: [
          { id: 'm3', title: 'Zero-cost landing page', completed: false, successCriteria: '30+ waitlist emails' }
        ]
      },
      {
        id: 'stg-3',
        name: 'MVP & BUILD',
        status: 'upcoming',
        description: 'Build core feature only with free tools.',
        milestones: [
          { id: 'm4', title: 'Ship core prototype', completed: false, successCriteria: 'Working functional MVP' }
        ]
      },
      {
        id: 'stg-4',
        name: 'ALPHA LAUNCH',
        status: 'upcoming',
        description: 'Onboard 10 test users manually.',
        milestones: [
          { id: 'm5', title: 'First 10 active test users', completed: false, successCriteria: '10 weekly active users' }
        ]
      },
      {
        id: 'stg-5',
        name: 'MONETIZATION',
        status: 'upcoming',
        description: 'Collect first ₹1.',
        milestones: [
          { id: 'm6', title: 'First paying customer', completed: false, successCriteria: 'Payment confirmed' }
        ]
      },
      {
        id: 'stg-6',
        name: 'REPEATABLE GROWTH',
        status: 'upcoming',
        description: 'Establish 1 profitable distribution engine.',
        milestones: [
          { id: 'm7', title: 'Profitable organic growth loop', completed: false, successCriteria: '>20% MoM growth' }
        ]
      }
    ],
    customerFeedback: [],
    experiments: [],
    missions: [
      {
        id: 'mis-1',
        title: 'Validate Your Problem',
        category: 'Customer Validation',
        objective: 'Confirm problem intensity with 5 potential customers.',
        whyItMatters: 'Saves months of building wrong features.',
        estimatedTime: '2 hours',
        estimatedCost: '₹0',
        difficulty: 'Easy',
        expectedResult: 'Clear list of top 3 recurring customer pain points.',
        completed: false,
        steps: [
          { id: 's1', text: 'Identify 10 potential customers on LinkedIn/Twitter/Reddit', completed: false },
          { id: 's2', text: 'Send non-sales invitation for 15-min chat', completed: false },
          { id: 's3', text: 'Ask "How do you currently handle [Problem]?"', completed: false },
          { id: 's4', text: 'Log notes into Customer Insights workspace', completed: false }
        ]
      }
    ],
    tools: [
      {
        id: 'tool-1',
        category: 'Landing Page & Hosting',
        freeOption: 'Vercel / Cloudflare Pages / Framer Free',
        whatItSolves: 'Free global web app & landing page hosting with custom domain SSL.',
        freeLimitations: '100GB bandwidth / mo.',
        whenToUpgrade: 'When scaling team operations.',
        monthlyCost: 1600,
        monthlySaving: 1600,
        status: 'free'
      },
      {
        id: 'tool-2',
        category: 'Database & Backend',
        freeOption: 'Supabase Free / Firebase Free / SQLite File',
        whatItSolves: 'Free managed database, authentication, and API backend.',
        freeLimitations: '500MB database storage / 50k monthly active users.',
        whenToUpgrade: 'When database exceeds 500MB.',
        monthlyCost: 2100,
        monthlySaving: 2100,
        status: 'free'
      }
    ],
    realityChecks: [],
    insights: [
      {
        id: 'ins-init',
        title: 'Welcome to FounderZero',
        description: 'Your growth operating system is initialized. Complete your onboarding or start your first problem validation mission.',
        type: 'milestone',
        date: new Date().toLocaleDateString()
      }
    ],
    metrics: [
      {
        id: 'm-1',
        name: 'Monthly Revenue',
        key: 'revenue',
        currentValue: 0,
        unit: '₹',
        trend: 'flat',
        explanation: 'Total monthly revenue earned from paying customers.',
        whyItMatters: 'Revenue proves value and gives sustainability.',
        whatToImprove: 'Focus on problem interviews and pre-orders.',
        hasEnoughData: false,
        history: [{ date: 'Today', value: 0 }]
      },
      {
        id: 'm-2',
        name: 'Active Users',
        key: 'active_users',
        currentValue: 0,
        unit: 'users',
        trend: 'flat',
        explanation: 'Number of people actively using the product weekly.',
        whyItMatters: 'Early active usage signals true customer interest.',
        whatToImprove: 'Conduct customer discovery interviews.',
        hasEnoughData: false,
        history: [{ date: 'Today', value: 0 }]
      },
      {
        id: 'm-3',
        name: 'Customer Interviews Logged',
        key: 'interviews',
        currentValue: 0,
        unit: 'interviews',
        trend: 'flat',
        explanation: 'Deep structured discovery conversations with target customers.',
        whyItMatters: '10 interviews reduce startup failure risk by 80%.',
        whatToImprove: 'Reach out to 15 target users on LinkedIn or forums.',
        hasEnoughData: false,
        history: [{ date: 'Today', value: 0 }]
      },
      {
        id: 'm-4',
        name: 'Monthly Software Spend',
        key: 'software_spend',
        currentValue: 0,
        unit: '₹',
        trend: 'down',
        explanation: 'Total monthly cash spent on SaaS subscriptions.',
        whyItMatters: 'Keeping burn near ₹0 gives you indefinite survival time.',
        whatToImprove: 'Maintain zero-budget discipline using free tiers.',
        hasEnoughData: true,
        history: [{ date: 'Today', value: 0 }]
      }
    ],
    activities: [
      {
        id: 'act-1',
        title: 'Firebase Account Created',
        description: `Initialized new workspace for ${cleanNameDesc}.`,
        timestamp: 'Just now',
        type: 'stage'
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        title: 'Welcome to FounderZero (Firebase Secured)',
        message: 'Your personal workspace is live and synchronized with Firebase Authentication.',
        timestamp: 'Just now',
        read: false,
        type: 'insight'
      }
    ],
    resources: JSON.parse(JSON.stringify(SEED_RESOURCES)),
    resourceInteractions: [],
    learningProfile: {
      completedCount: 0,
      articlesRead: 0,
      toolsTried: 0,
      coursesCompleted: 0,
      skillsLearned: [],
      topicsExplored: [],
      skillMastery: {
        technical: 20,
        product: 20,
        marketing: 20,
        sales: 15,
        operations: 20
      },
      gapsIdentified: [
        'User interview validation & Mom Test questioning',
        'Open-source developer workflow & agent tooling'
      ]
    },
    savedResources: [],
    vaultCollections: [],
    notes: INITIAL_FOUNDER_NOTES,
    noteCollections: DEFAULT_NOTEPAD_COLLECTIONS,
    copilotConversations: INITIAL_COPILOT_CONVERSATIONS,
    copilotMessages: INITIAL_COPILOT_MESSAGES,
    founderMemories: INITIAL_FOUNDER_MEMORIES,
    hasCompletedOnboarding: false
  };

  return { user, state };
}

export async function syncUserWithBackend(
  firebaseUid: string,
  userEmail: string,
  userName: string,
  photoURL?: string,
  targetStartupName?: string,
  targetStage: StartupStage = 'Idea'
): Promise<{ user: User; token: string; state: AppState }> {
  // Try backend sync first
  try {
    const res = await fetch('/api/auth/firebase-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid,
        email: userEmail,
        name: userName,
        photoURL,
        startupName: targetStartupName,
        stage: targetStage
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user && data.state) {
        localStorage.setItem('founderzero_token', data.token || firebaseUid);
        return {
          user: data.user,
          token: data.token || firebaseUid,
          state: data.state
        };
      }
    }
  } catch (err) {
    console.warn('Backend sync unreachable, using client workspace:', err);
  }

  // Resilient fallback: Check if state was already saved locally for this user
  const localSaved = localStorage.getItem(`founderzero_state_${firebaseUid}`);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed && parsed.user && parsed.profile) {
        localStorage.setItem('founderzero_token', firebaseUid);
        return {
          user: parsed.user,
          token: firebaseUid,
          state: parsed
        };
      }
    } catch {
      // Continue to fresh state creation
    }
  }

  // Create fresh state
  const { user, state } = createFreshAppState(
    firebaseUid,
    userEmail,
    userName,
    targetStartupName,
    targetStage,
    photoURL
  );

  localStorage.setItem('founderzero_token', firebaseUid);
  localStorage.setItem(`founderzero_state_${firebaseUid}`, JSON.stringify(state));

  return {
    user,
    token: firebaseUid,
    state
  };
}
