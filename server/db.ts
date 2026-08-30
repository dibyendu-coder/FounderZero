import fs from 'fs';
import path from 'path';
import { AppState, StartupProfile, StartupStage, User } from '../src/types';
import { DEMO_APP_STATE } from '../src/lib/seedData';
import { SEED_RESOURCES } from '../src/lib/resourcesData';

// Resolve writable data directory for both local development, container runtime, and serverless environments (e.g. Vercel /tmp)
function resolveDbPath(): { dataDir: string; dbFile: string } {
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.write-test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return { dataDir: localDir, dbFile: path.join(localDir, 'founderzero-db.json') };
  } catch {
    const tmpDir = path.join('/tmp', 'founderzero-data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return { dataDir: tmpDir, dbFile: path.join(tmpDir, 'founderzero-db.json') };
    } catch {
      return { dataDir: '/tmp', dbFile: path.join('/tmp', 'founderzero-db.json') };
    }
  }
}

const { dataDir: DATA_DIR, dbFile: DB_FILE } = resolveDbPath();

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  appStates: Record<string, AppState>; // userId -> AppState
}

// In-memory cache for fast access and fallback in serverless environments
let memoryDbCache: DatabaseSchema | null = null;

function loadDatabase(): DatabaseSchema {
  if (memoryDbCache) {
    return memoryDbCache;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      memoryDbCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading DB file, creating fresh DB:', err);
  }

  // Initial seed schema
  const initialDb: DatabaseSchema = {
    users: [
      {
        id: 'demo-user-1',
        email: 'alex@pulseboard.io',
        name: 'Alex Rivera',
        passwordHash: 'demo123',
        isDemo: true
      }
    ],
    appStates: {
      'demo-user-1': JSON.parse(JSON.stringify(DEMO_APP_STATE))
    }
  };

  memoryDbCache = initialDb;
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  memoryDbCache = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal warning if running in purely ephemeral container/serverless
    console.warn('Notice: Could not persist DB file to disk, using in-memory cache:', err);
  }
}

export function getUserById(userId: string): User | null {
  const db = loadDatabase();
  const u = db.users.find(user => user.id === userId);
  if (!u) return null;
  const userState = db.appStates[u.id];
  const isOnboarded = u.hasCompletedOnboarding ?? (u.isDemo ? true : (userState?.profile?.hasCompletedOnboarding ?? false));
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    startupName: u.startupName,
    avatarUrl: u.avatarUrl,
    role: u.role || 'Founder',
    createdAt: u.createdAt || new Date().toISOString(),
    isDemo: u.isDemo,
    hasCompletedOnboarding: isOnboarded
  };
}

export function setUserOnboardingCompleted(userId: string, isCompleted: boolean = true): boolean {
  const db = loadDatabase();
  const u = db.users.find(user => user.id === userId);
  if (u) {
    u.hasCompletedOnboarding = isCompleted;
    if (db.appStates[userId]?.profile) {
      db.appStates[userId].profile.hasCompletedOnboarding = isCompleted;
      db.appStates[userId].hasCompletedOnboarding = isCompleted;
    }
    saveDatabase(db);
    return true;
  }
  return false;
}

export function findOrCreateFirebaseUser(
  firebaseUid: string,
  email: string,
  name?: string,
  photoURL?: string,
  startupName?: string,
  stage?: StartupStage
): { user: User; state: AppState } {
  const db = loadDatabase();
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = (name || '').trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Founder');

  // Check if user already exists by firebaseUid or email
  let existingUser = db.users.find(u => u.id === firebaseUid || (cleanEmail && u.email.toLowerCase() === cleanEmail));

  if (existingUser) {
    if (photoURL && !existingUser.avatarUrl) {
      existingUser.avatarUrl = photoURL;
    }
    if (existingUser.id !== firebaseUid) {
      // Migrate or map user to firebaseUid
      const oldId = existingUser.id;
      existingUser.id = firebaseUid;
      if (db.appStates[oldId]) {
        db.appStates[firebaseUid] = db.appStates[oldId];
        delete db.appStates[oldId];
      }
    }
    saveDatabase(db);
    const userRes: User = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      startupName: existingUser.startupName,
      avatarUrl: existingUser.avatarUrl,
      role: existingUser.role || 'Founder',
      createdAt: existingUser.createdAt || new Date().toISOString(),
      isDemo: false
    };
    const userState = db.appStates[firebaseUid] || getAppState(firebaseUid);
    return { user: userRes, state: userState };
  }

  // Create new user for this Firebase account
  const id = firebaseUid;
  const cleanStartupName = startupName?.trim() || `${cleanName}'s Startup`;
  const cleanStage = stage || 'Idea';

  const newUser = {
    id,
    email: cleanEmail,
    name: cleanName,
    passwordHash: 'firebase_auth_managed',
    startupName: cleanStartupName,
    avatarUrl: photoURL || undefined,
    role: 'Founder',
    createdAt: new Date().toISOString(),
    isDemo: false
  };
  db.users.push(newUser);

  // Initialize new user state with pristine real profile
  const newProfile: StartupProfile = {
    id: 'startup-' + id,
    name: cleanStartupName,
    description: '',
    category: 'SaaS',
    targetCustomer: '',
    problem: '',
    stage: cleanStage,
    teamSize: 1,
    founderSkills: [],
    monthlyBudget: 0,
    availableHoursPerWeek: 20,
    currentUsers: 0,
    monthlyRevenue: 0,
    biggestUncertainty: "People don't want it",
    goal90Days: cleanStage === 'Idea' ? 'Validate problem with 10 customer interviews' : 'Acquire first 50 active users',
    founderName: cleanName,
    createdAt: new Date().toISOString(),
    founderScore: 40,
    monthlySavings: 0
  };

  const freshState: AppState = {
    user: { id, email: cleanEmail, name: cleanName, isDemo: false },
    profile: newProfile,
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
    activities: [
      {
        id: 'act-1',
        title: 'Firebase Account Created',
        description: `Initialized new workspace for ${cleanName}.`,
        timestamp: 'Just now',
        type: 'stage'
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
    vaultCollections: JSON.parse(JSON.stringify(DEMO_APP_STATE.vaultCollections || [])),
    savedResources: []
  };

  db.appStates[id] = freshState;
  saveDatabase(db);
  return { user: newUser, state: freshState };
}

export function getUserByEmail(email: string): (User & { passwordHash: string }) | null {
  const db = loadDatabase();
  const u = db.users.find(user => user.email.toLowerCase() === email.toLowerCase().trim());
  return u || null;
}

export function createUser(
  email: string,
  name: string,
  passwordHash: string,
  startupName?: string,
  stage?: StartupStage
): User {
  const db = loadDatabase();
  const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const cleanEmail = email.toLowerCase().trim();
  const cleanStartupName = startupName?.trim() || 'My Startup';
  const cleanStage = stage || 'Idea';

  const newUser = {
    id,
    email: cleanEmail,
    name: name.trim(),
    passwordHash,
    startupName: cleanStartupName,
    role: 'Founder',
    createdAt: new Date().toISOString(),
    isDemo: false
  };
  db.users.push(newUser);

  // Initialize new user state with pristine real profile (no mock data)
  const newProfile: StartupProfile = {
    id: 'startup-' + id,
    name: cleanStartupName,
    description: '',
    category: 'SaaS',
    targetCustomer: '',
    problem: '',
    stage: cleanStage,
    teamSize: 1,
    founderSkills: [],
    monthlyBudget: 0,
    availableHoursPerWeek: 20,
    currentUsers: 0,
    monthlyRevenue: 0,
    biggestUncertainty: "People don't want it",
    goal90Days: cleanStage === 'Idea' ? 'Validate problem with 10 customer interviews' : 'Acquire first 50 active users',
    founderName: name.trim(),
    createdAt: new Date().toISOString(),
    founderScore: 40,
    monthlySavings: 0
  };

  const freshState: AppState = {
    user: { id, email, name, isDemo: false },
    profile: newProfile,
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
        name: 'MVP & LAUNCH',
        status: 'upcoming',
        description: 'Ship minimal version.',
        milestones: [
          { id: 'm4', title: 'Deploy MVP v1.0', completed: false, successCriteria: 'Core feature works' }
        ]
      }
    ],
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
    experiments: [],
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
    customerFeedback: [],
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
        id: 'm-users',
        name: 'Total Registered Users',
        key: 'users',
        currentValue: 0,
        unit: 'users',
        trend: 'No data yet',
        explanation: 'Total signups acquired.',
        whyItMatters: 'Top of funnel interest indicator.',
        whatToImprove: 'Launch zero-budget community posts.',
        hasEnoughData: false,
        history: []
      },
      {
        id: 'm-rev',
        name: 'Monthly Recurring Revenue (MRR)',
        key: 'mrr',
        currentValue: 0,
        unit: '₹',
        trend: 'No data yet',
        explanation: 'Predictable monthly revenue.',
        whyItMatters: 'Financial validation.',
        whatToImprove: 'Test pre-orders or paid beta.',
        hasEnoughData: false,
        history: []
      }
    ],
    activities: [
      {
        id: 'act-init',
        title: 'Account Created',
        description: 'Welcome to FounderZero zero-budget OS.',
        timestamp: 'Just now',
        type: 'stage'
      }
    ],
    notifications: [
      {
        id: 'notif-init',
        title: 'Account Ready',
        message: 'Your FounderZero workspace is created. Start your growth plan.',
        timestamp: 'Just now',
        read: false,
        type: 'action'
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
    vaultCollections: JSON.parse(JSON.stringify(DEMO_APP_STATE.vaultCollections || [])),
    savedResources: []
  };

  db.appStates[id] = freshState;
  saveDatabase(db);
  return { id, email, name, isDemo: false };
}

export function getAppState(userId: string): AppState {
  const db = loadDatabase();
  let state = db.appStates[userId];
  if (!state) {
    // Fallback to demo state if user not found
    return JSON.parse(JSON.stringify(DEMO_APP_STATE));
  }
  // Ensure array safety for vault
  if (!state.savedResources) {
    state.savedResources = userId === 'demo-user-1' ? JSON.parse(JSON.stringify(DEMO_APP_STATE.savedResources || [])) : [];
  }
  if (!state.vaultCollections) {
    state.vaultCollections = JSON.parse(JSON.stringify(DEMO_APP_STATE.vaultCollections || []));
  }
  return state;
}

export function saveAppState(userId: string, state: AppState): void {
  const db = loadDatabase();
  db.appStates[userId] = state;
  saveDatabase(db);
}

export function updateUserProfile(userId: string, updates: { name?: string; startupName?: string; email?: string }): User | null {
  const db = loadDatabase();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;

  if (updates.name) user.name = updates.name.trim();
  if (updates.startupName) user.startupName = updates.startupName.trim();
  if (updates.email) user.email = updates.email.toLowerCase().trim();

  // Also sync profile in appState if present
  if (db.appStates[userId] && db.appStates[userId].profile) {
    if (updates.name) db.appStates[userId].profile.founderName = updates.name.trim();
    if (updates.startupName) db.appStates[userId].profile.name = updates.startupName.trim();
  }

  saveDatabase(db);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    startupName: user.startupName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    isDemo: user.isDemo
  };
}

export function updateUserPassword(userId: string, oldPass: string, newPass: string): { success: boolean; error?: string } {
  const db = loadDatabase();
  const user = db.users.find(u => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };
  if (user.passwordHash !== oldPass) {
    return { success: false, error: 'Current password does not match' };
  }
  user.passwordHash = newPass;
  saveDatabase(db);
  return { success: true };
}

export function resetDemoState(): AppState {
  const db = loadDatabase();
  db.appStates['demo-user-1'] = JSON.parse(JSON.stringify(DEMO_APP_STATE));
  saveDatabase(db);
  return db.appStates['demo-user-1'];
}

// --- FOUNDER VAULT OPERATIONS ---

export function getVaultResources(userId: string) {
  const state = getAppState(userId);
  return state.savedResources || [];
}

export function saveVaultResource(
  userId: string,
  resourceData: {
    url: string;
    title: string;
    description?: string;
    resourceType?: any;
    category?: string;
    tags?: string[];
    notes?: string;
    priority?: 'high' | 'medium' | 'low';
    status?: 'unread' | 'reading' | 'completed' | 'archived';
    collections?: string[];
    resourceId?: string;
    faviconUrl?: string;
    source?: string;
    author?: string;
    readingTimeMinutes?: number;
    suggestedStage?: any;
    relevantProblem?: string;
    relevantSkill?: string;
    isOpenSource?: boolean;
    githubRepo?: string;
    reminder?: any;
  }
): { saved: any; isDuplicate: boolean; existingId?: string } {
  const db = loadDatabase();
  const state = getAppState(userId);
  if (!state.savedResources) state.savedResources = [];

  // Duplicate detection by URL (normalized) or resourceId
  const cleanUrl = (resourceData.url || '').trim().replace(/\/+$/, '').toLowerCase();
  const existing = state.savedResources.find(item => {
    const itemCleanUrl = (item.url || '').trim().replace(/\/+$/, '').toLowerCase();
    if (cleanUrl && itemCleanUrl && cleanUrl === itemCleanUrl) return true;
    if (resourceData.resourceId && item.resourceId === resourceData.resourceId) return true;
    return false;
  });

  if (existing) {
    // Return existing resource to prevent duplication and alert caller
    return { saved: existing, isDuplicate: true, existingId: existing.id };
  }

  // Create new saved resource
  const newId = 'sv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const newSaved = {
    id: newId,
    userId,
    startupId: state.profile?.id || 'startup-' + userId,
    resourceId: resourceData.resourceId,
    url: resourceData.url.trim(),
    title: (resourceData.title || 'Untitled Resource').trim(),
    description: (resourceData.description || '').trim(),
    resourceType: resourceData.resourceType || 'website',
    category: resourceData.category || 'Unsorted',
    tags: resourceData.tags || [],
    notes: (resourceData.notes || '').trim(),
    priority: resourceData.priority || 'medium',
    status: resourceData.status || 'unread',
    faviconUrl: resourceData.faviconUrl || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(resourceData.url.replace(/^https?:\/\//i, '').split('/')[0])}&sz=64`,
    source: resourceData.source || resourceData.url.replace(/^https?:\/\//i, '').split('/')[0],
    author: resourceData.author || '',
    collections: resourceData.collections || [],
    readingTimeMinutes: resourceData.readingTimeMinutes || 5,
    suggestedStage: resourceData.suggestedStage,
    relevantProblem: resourceData.relevantProblem,
    relevantSkill: resourceData.relevantSkill,
    isOpenSource: resourceData.isOpenSource || false,
    githubRepo: resourceData.githubRepo,
    reminder: resourceData.reminder,
    isLinkBroken: false,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now
  };

  state.savedResources.unshift(newSaved);
  db.appStates[userId] = state;
  saveDatabase(db);

  return { saved: newSaved, isDuplicate: false };
}

export function updateVaultResource(
  userId: string,
  resourceId: string,
  updates: Record<string, any>
) {
  const db = loadDatabase();
  const state = getAppState(userId);
  if (!state.savedResources) state.savedResources = [];

  const idx = state.savedResources.findIndex(r => r.id === resourceId);
  if (idx === -1) return null;

  state.savedResources[idx] = {
    ...state.savedResources[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  db.appStates[userId] = state;
  saveDatabase(db);
  return state.savedResources[idx];
}

export function deleteVaultResource(userId: string, resourceId: string): boolean {
  const db = loadDatabase();
  const state = getAppState(userId);
  if (!state.savedResources) return false;

  const initialLen = state.savedResources.length;
  state.savedResources = state.savedResources.filter(r => r.id !== resourceId);
  if (state.savedResources.length === initialLen) return false;

  db.appStates[userId] = state;
  saveDatabase(db);
  return true;
}

