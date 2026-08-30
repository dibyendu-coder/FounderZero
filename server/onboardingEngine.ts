import {
  AppState,
  DontDoItem,
  Experiment,
  HealthDimension,
  MetricItem,
  Mission,
  NextAction,
  RoadmapStage,
  StartupProfile,
  StartupStage,
  ToolRecommendation,
  UncertaintyOption,
  User,
  UserSavedResource
} from '../src/types';
import { SEED_RESOURCES } from '../src/lib/resourcesData';
import { DEMO_APP_STATE } from '../src/lib/seedData';

export interface OnboardingInput {
  name: string;
  description: string;
  category: string;
  targetCustomer: string;
  problem: string;
  stage: StartupStage;
  teamSize: number;
  founderSkills?: string[];
  techStack?: string[];
  monetizationModel?: string;
  monthlyBudget: number;
  availableHoursPerWeek: number;
  currentUsers: number;
  monthlyRevenue: number;
  biggestUncertainty: UncertaintyOption;
  goal90Days: string;
  founderName?: string;
}

export function generateTailoredDashboardState(
  input: OnboardingInput,
  user: User
): AppState {
  const cleanName = input.name?.trim() || 'My Startup';
  const cleanDesc = input.description?.trim() || 'Software solution built for modern founders.';
  const cleanCategory = input.category || 'SaaS';
  const cleanICP = input.targetCustomer?.trim() || 'Early-stage founders and operators';
  const cleanProblem = input.problem?.trim() || 'Manual workflows and unvalidated customer churn';
  const stage = input.stage || 'Idea';
  const teamSize = Math.max(1, Number(input.teamSize) || 1);
  const founderSkills = input.founderSkills && input.founderSkills.length > 0
    ? input.founderSkills
    : ['Fullstack Dev', 'Product & Strategy'];
  const techStack = input.techStack && input.techStack.length > 0
    ? input.techStack
    : ['React / Next.js', 'Supabase / Firebase', 'Tailwind CSS'];
  const monetizationModel = input.monetizationModel || 'Subscription (B2B SaaS)';
  const monthlyBudget = Math.max(0, Number(input.monthlyBudget) || 0);
  const availableHours = Math.max(5, Number(input.availableHoursPerWeek) || 20);
  const currentUsers = Math.max(0, Number(input.currentUsers) || 0);
  const monthlyRevenue = Math.max(0, Number(input.monthlyRevenue) || 0);
  const uncertainty = input.biggestUncertainty || "People don't want it";
  const goal90Days = input.goal90Days?.trim() || 'Complete 10 customer validation interviews and ship lean MVP';
  const founderName = input.founderName?.trim() || user.name || 'Founder';

  // 1. Calculate Estimated Monthly Savings in ₹ vs Commercial Cloud Tools
  let estimatedSavings = 22500;
  if (cleanCategory.toLowerCase().includes('ai')) {
    estimatedSavings = 38000;
  } else if (cleanCategory.toLowerCase().includes('developer') || cleanCategory.toLowerCase().includes('saas')) {
    estimatedSavings = 28500;
  }

  // 2. Calculate Initial Founder Calibration Score (0-100)
  let founderScore = 52;
  if (stage === 'Validating') founderScore += 6;
  if (stage === 'Building MVP') founderScore += 12;
  if (stage === 'Launched') founderScore += 18;
  if (stage === 'First Revenue') founderScore += 26;
  if (stage === 'Growing') founderScore += 32;

  if (currentUsers > 50) founderScore += 6;
  if (monthlyRevenue > 0) founderScore += 8;
  if (availableHours >= 25) founderScore += 4;
  if (monthlyBudget <= 5000) founderScore += 5; // Reward zero-budget discipline

  founderScore = Math.min(94, Math.max(45, founderScore));

  // Determine archetype based on skills and stage
  const isDev = founderSkills.some(s => s.toLowerCase().includes('technical') || s.toLowerCase().includes('fullstack') || s.toLowerCase().includes('typescript') || s.toLowerCase().includes('coding'));
  const isMarketing = founderSkills.some(s => s.toLowerCase().includes('growth') || s.toLowerCase().includes('marketing') || s.toLowerCase().includes('sales'));
  const isDesign = founderSkills.some(s => s.toLowerCase().includes('design') || s.toLowerCase().includes('ui'));
  
  let founderArchetype = 'Solo 0-to-1 Builder';
  if (isDev && isMarketing) founderArchetype = 'Full-Stack Hacker & Growth Operator';
  else if (isDev) founderArchetype = 'Technical Product Architect';
  else if (isMarketing) founderArchetype = 'Distribution & Growth Specialist';
  else if (isDesign) founderArchetype = 'Product Design & UX Craftsman';

  const founderBio = `Building ${cleanName} for ${cleanICP} to solve "${cleanProblem}". Committed to zero-budget execution, rapid shipping, and evidence-based validation.`;
  const founderTitle = teamSize === 1 ? 'Solo Founder & Builder' : 'Co-Founder & Product Lead';

  // 3. Create Profile
  const profile: StartupProfile = {
    id: 'startup-' + user.id,
    name: cleanName,
    description: cleanDesc,
    category: cleanCategory,
    targetCustomer: cleanICP,
    problem: cleanProblem,
    stage,
    teamSize,
    founderSkills,
    techStack,
    monetizationModel,
    monthlyBudget,
    availableHoursPerWeek: availableHours,
    currentUsers,
    monthlyRevenue,
    biggestUncertainty: uncertainty,
    goal90Days,
    founderName,
    founderAvatar: user.avatarUrl,
    founderTitle,
    founderBio,
    founderArchetype,
    location: 'Remote / Global',
    timezone: 'UTC+05:30 (IST)',
    workingStyle: 'Deep Work Sprints • Zero-Budget Discipline',
    socialLinks: {
      twitter: '',
      github: '',
      linkedin: '',
      website: ''
    },
    superpowers: [
      'Rapid MVP Prototyping',
      'The Mom Test Customer Discovery',
      'Autonomous AI Agent Workflows',
      'Zero-Budget Stack Optimization'
    ],
    operatingPrinciples: [
      'Validate problem intensity before building complex custom backends',
      'Maintain zero unnecessary recurring SaaS overhead',
      'Talk directly to customers weekly and measure cohort retention',
      'Ship thin end-to-end features rather than wide unvalidated roadmaps'
    ],
    skillRatings: founderSkills.map((s, idx) => ({
      skill: s,
      level: idx === 0 ? 'Expert' : idx === 1 ? 'Proficient' : 'Competent',
      category: s.toLowerCase().includes('tech') || s.toLowerCase().includes('code') ? 'Engineering' : s.toLowerCase().includes('design') ? 'Product & Design' : 'Growth & Distribution',
      percentage: idx === 0 ? 92 : idx === 1 ? 84 : 76
    })),
    badges: [
      {
        id: 'zero-burn-initiate',
        title: 'Zero-Burn Initiate',
        description: 'Calibrated a full-stack architecture running under ₹5,000 monthly burn.',
        icon: 'Zap',
        category: 'zero-budget',
        earnedDate: 'Just now'
      },
      {
        id: 'calibrated-founder',
        title: 'Calibrated Operator',
        description: 'Completed 6-step FounderZero diagnostic and established 90-day North Star.',
        icon: 'ShieldCheck',
        category: 'execution',
        earnedDate: 'Just now'
      }
    ],
    createdAt: new Date().toISOString(),
    founderScore,
    monthlySavings: estimatedSavings,
    hasCompletedOnboarding: true
  };

  // 4. Generate Stage & Uncertainty-Specific Next Actions
  const nextActions = generateCustomActions(profile);

  // 5. Generate Tailored Anti-Slop / Don't Do Items
  const dontDoItems = generateCustomDontDoItems(profile);

  // 6. Calibrate Health Dimensions
  const healthDimensions = generateCustomHealthDimensions(profile);

  // 7. Generate 6-Stage Roadmap with current stage activated
  const roadmapStages = generateCustomRoadmap(profile);

  // 8. Generate Bespoke Step-by-Step Missions
  const missions = generateCustomMissions(profile);

  // 9. Generate Tailored Zero-Budget Stack
  const tools = generateCustomToolRecommendations(profile);

  // 10. Generate Starter Experiment
  const experiments: Experiment[] = [
    {
      id: 'exp-1',
      title: stage === 'Idea' || stage === 'Validating'
        ? `Problem Validation Sprint with ${cleanICP}`
        : `Zero-Budget Organic Distribution Test for ${cleanName}`,
      hypothesis: stage === 'Idea' || stage === 'Validating'
        ? `If we conduct 8 structured interviews asking how ${cleanICP} solve '${cleanProblem}', at least 5 will express urgency and ask to be notified when live.`
        : `If we post 2 detailed problem breakdowns in relevant niche communities, we will acquire 25+ high-intent signups at ₹0 CAC.`,
      problem: cleanProblem,
      metric: stage === 'Idea' || stage === 'Validating' ? 'Interviews with high pain intensity' : 'Target signups',
      targetValue: stage === 'Idea' || stage === 'Validating' ? '5 of 8' : '25 signups',
      currentValue: '0',
      method: stage === 'Idea' || stage === 'Validating' ? 'The Mom Test Customer Interviews' : 'Value-first community breakdown',
      audience: cleanICP,
      duration: '10 days',
      budget: '₹0',
      status: 'Running',
      createdAt: new Date().toISOString()
    }
  ];

  // 11. Generate Baseline Metrics
  const metrics: MetricItem[] = [
    {
      id: 'm-1',
      name: 'Monthly Revenue',
      key: 'revenue',
      currentValue: monthlyRevenue,
      unit: '₹',
      trend: 'flat',
      explanation: 'Total monthly cash generated from paying customers.',
      whyItMatters: 'Cashflow from real customers is the definitive proof of Product-Market Fit.',
      whatToImprove: 'Focus on high-pain problem validation and initial pre-orders.',
      hasEnoughData: monthlyRevenue > 0,
      history: [{ date: 'Today', value: monthlyRevenue }]
    },
    {
      id: 'm-2',
      name: 'Active Users',
      key: 'active_users',
      currentValue: currentUsers,
      unit: 'users',
      trend: currentUsers > 0 ? 'up' : 'flat',
      explanation: `People actively using ${cleanName} on a weekly basis.`,
      whyItMatters: 'Frequent active usage indicates true customer problem alignment.',
      whatToImprove: 'Direct founder outreach and manual user onboarding.',
      hasEnoughData: currentUsers > 0,
      history: [{ date: 'Today', value: currentUsers }]
    },
    {
      id: 'm-3',
      name: 'Customer Interviews Logged',
      key: 'interviews',
      currentValue: 0,
      unit: 'interviews',
      trend: 'flat',
      explanation: 'Structured problem and workflow conversations with target customers.',
      whyItMatters: 'Talking to 10 customers eliminates 80% of blind assumptions.',
      whatToImprove: 'Reach out to 15 target users on LinkedIn or Reddit this week.',
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
      explanation: 'Total monthly cash spent on developer tools, servers, and SaaS.',
      whyItMatters: 'Keeping burn near ₹0 gives you infinite survival runway.',
      whatToImprove: `Continue using verified ₹0 alternatives (saving ~₹${estimatedSavings.toLocaleString()}/mo).`,
      hasEnoughData: true,
      history: [{ date: 'Today', value: 0 }]
    }
  ];

  // 12. Pre-seed Vault Bookmarks tailored to tech stack and category
  const savedResources: UserSavedResource[] = selectInitialVaultResources(profile, user);

  // 13. Notifications & Activity Logs
  const notifications = [
    {
      id: 'notif-welcome',
      title: `Workspace Calibrated for ${cleanName}`,
      message: `Your custom zero-budget roadmap and Do-Now action plan are generated for stage: ${stage}.`,
      timestamp: 'Just now',
      read: false,
      type: 'action' as const
    }
  ];

  const activities = [
    {
      id: 'act-onboarding-complete',
      title: 'Onboarding Diagnostic Complete',
      description: `Generated custom plan for ${cleanName} (${cleanCategory}) targeting ${cleanICP}.`,
      timestamp: 'Just now',
      type: 'stage' as const
    }
  ];

  const insights = [
    {
      id: 'ins-onboarding',
      title: `Execution Plan for ${cleanName}`,
      description: `Calibrated with ₹0 stack, targeting 90-day North Star: "${goal90Days}". Immediate priority: ${nextActions[0]?.title || 'Customer Validation'}.`,
      type: 'milestone' as const,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  ];

  return {
    user: {
      ...user,
      hasCompletedOnboarding: true,
      startupName: cleanName
    },
    profile,
    nextActions,
    dontDoItems,
    healthDimensions,
    roadmapStages,
    missions,
    experiments,
    tools,
    realityChecks: [],
    customerFeedback: [],
    insights,
    metrics,
    activities,
    notifications,
    resources: JSON.parse(JSON.stringify(SEED_RESOURCES)),
    resourceInteractions: [],
    learningProfile: {
      completedCount: 0,
      articlesRead: 0,
      toolsTried: 0,
      coursesCompleted: 0,
      skillsLearned: founderSkills,
      topicsExplored: [cleanCategory, 'Customer Discovery', 'Zero-Budget Tech Stack'],
      skillMastery: {
        technical: founderSkills.includes('Fullstack Dev') || founderSkills.includes('AI Engineer') ? 60 : 30,
        product: 45,
        marketing: founderSkills.includes('Growth / Marketing') ? 55 : 25,
        sales: 20,
        operations: 35
      },
      gapsIdentified: [
        'Structured customer discovery questioning (Mom Test framework)',
        'Zero-CAC distribution flywheels and community seeding'
      ]
    },
    vaultCollections: JSON.parse(JSON.stringify(DEMO_APP_STATE.vaultCollections || [])),
    savedResources,
    hasCompletedOnboarding: true
  };
}

function generateCustomActions(profile: StartupProfile): NextAction[] {
  const { stage, targetCustomer, problem, name, biggestUncertainty } = profile;
  const cleanICP = targetCustomer?.trim() || 'target customers';

  if (stage === 'Idea' || stage === 'Validating') {
    return [
      {
        id: 'act-1',
        title: `Conduct 5 problem validation interviews with ${targetCustomer}`,
        whyItMatters: `Confirms that '${problem}' is an acute, recurring pain that users actively seek to solve.`,
        expectedImpact: 'Prevents weeks of wasted engineering by testing core problem intensity before coding.',
        estimatedTime: '2.5 hours',
        estimatedCost: '₹0',
        difficulty: 'Easy',
        deadline: 'In 3 days',
        relatedBottleneck: 'Problem Validation',
        priority: 'Do Now',
        reason: `Your startup is at ${stage} stage with uncertainty '${biggestUncertainty}'. Direct customer discovery uncovers the exact feature to build first.`,
        evidence: '0 structured interview notes recorded so far.',
        status: 'pending'
      },
      {
        id: 'act-2',
        title: 'Draft a 1-page Problem & Offer Memo using the Mom Test principles',
        whyItMatters: 'Forces extreme clarity on the specific customer workflow you are replacing without bias.',
        expectedImpact: 'Sharpened value proposition that boosts interview conversion rates.',
        estimatedTime: '1 hour',
        estimatedCost: '₹0',
        difficulty: 'Easy',
        deadline: 'In 5 days',
        relatedBottleneck: 'Value Proposition',
        priority: 'Do Next',
        reason: 'A concise memo prevents scope creep and keeps your early MVP tightly focused.',
        evidence: 'Initial onboarding profile defined.',
        status: 'pending'
      },
      {
        id: 'act-3',
        title: 'Identify 20 high-density community hubs where your ICP hangs out',
        whyItMatters: 'Having direct access to your target audience is essential for fast iteration.',
        expectedImpact: 'List of 20 prospective interview leads at ₹0 acquisition cost.',
        estimatedTime: '1.5 hours',
        estimatedCost: '₹0',
        difficulty: 'Easy',
        deadline: 'In 7 days',
        relatedBottleneck: 'Distribution Channel',
        priority: 'Later',
        reason: 'Zero-budget founders win by living where their prospective customers already congregate.',
        evidence: 'Target persona identified.',
        status: 'pending'
      }
    ];
  }

  if (stage === 'Building MVP') {
    return [
      {
        id: 'act-1',
        title: `Build and ship the single core "Aha! Moment" feature for ${name}`,
        whyItMatters: 'An MVP needs to deliver 1 sharp solution exceptionally well rather than 10 mediocre features.',
        expectedImpact: 'Enables real customer testing within 7-10 days instead of months.',
        estimatedTime: '12 hours',
        estimatedCost: '₹0',
        difficulty: 'Medium',
        deadline: 'In 7 days',
        relatedBottleneck: 'MVP Velocity',
        priority: 'Do Now',
        reason: `Avoid feature bloat. Build the minimal workflow that solves '${problem}' using free stack tools.`,
        evidence: 'Stage is Building MVP with solo/small team bandwidth.',
        status: 'pending'
      },
      {
        id: 'act-2',
        title: `Recruit 5 pre-launch alpha testers from your target ${targetCustomer}`,
        whyItMatters: 'Having committed testers waiting ensures your MVP gets immediate real-world usage on day 1.',
        expectedImpact: 'Immediate user feedback loops ready upon deployment.',
        estimatedTime: '2 hours',
        estimatedCost: '₹0',
        difficulty: 'Easy',
        deadline: 'In 5 days',
        relatedBottleneck: 'Early Adopter Pipeline',
        priority: 'Do Next',
        reason: 'Testing with 5 real users is 10x more valuable than polishing code in isolation.',
        evidence: '0 alpha users locked in.',
        status: 'pending'
      },
      {
        id: 'act-3',
        title: 'Setup automated ₹0 error tracking and user telemetry via PostHog / Sentry free tiers',
        whyItMatters: 'Catches silent onboarding errors before users churn without telling you.',
        expectedImpact: 'Prevents silent user drop-offs during initial alpha testing.',
        estimatedTime: '1 hour',
        estimatedCost: '₹0',
        difficulty: 'Easy',
        deadline: 'In 8 days',
        relatedBottleneck: 'Product Observability',
        priority: 'Later',
        reason: 'Zero-cost observability gives you full clarity on where users get stuck.',
        evidence: 'Free telemetry tools available in Stack.',
        status: 'pending'
      }
    ];
  }

  // Launched / First Revenue / Growing
  return [
    {
      id: 'act-1',
      title: `Interview 5 active users of ${name} to uncover your retention leverage point`,
      whyItMatters: 'Retaining early users is 5x cheaper than acquiring new ones and is the foundation of PMF.',
      expectedImpact: 'Increases weekly user activation and retention by 20-30%.',
      estimatedTime: '3 hours',
      estimatedCost: '₹0',
      difficulty: 'Medium',
      deadline: 'In 3 days',
      relatedBottleneck: 'User Retention & Value Loop',
      priority: 'Do Now',
      reason: `You have ${profile.currentUsers} users. Direct customer feedback pinpoints the exact triggers that keep users coming back.`,
      evidence: `${profile.currentUsers} registered users recorded.`,
      status: 'pending'
    },
    {
      id: 'act-2',
      title: `Launch 2 zero-budget organic distribution experiments for ${cleanICP}`,
      whyItMatters: 'Establishes an organic customer acquisition channel that does not rely on ad spend.',
      expectedImpact: '+30-50 targeted signups at ₹0 CAC.',
      estimatedTime: '2.5 hours',
      estimatedCost: '₹0',
      difficulty: 'Medium',
      deadline: 'In 6 days',
      relatedBottleneck: 'Distribution Flywheel',
      priority: 'Do Next',
      reason: 'Community-led breakdowns and open build updates attract high-intent early adopters.',
      evidence: 'Zero ad spend strategy.',
      status: 'pending'
    },
    {
      id: 'act-3',
      title: 'Optimize user onboarding funnel to achieve first value in under 2 minutes',
      whyItMatters: 'Every extra step in onboarding loses 20-30% of potential sticky users.',
      expectedImpact: 'Boosts activation rate from setup to active usage.',
      estimatedTime: '3 hours',
      estimatedCost: '₹0',
      difficulty: 'Medium',
      deadline: 'In 9 days',
      relatedBottleneck: 'Onboarding Activation',
      priority: 'Later',
      reason: 'Removing setup friction directly compounds all future traffic.',
      evidence: 'Monitored activation funnel.',
      status: 'pending'
    }
  ];
}

function generateCustomDontDoItems(profile: StartupProfile): DontDoItem[] {
  const { stage, monthlyRevenue, monthlyBudget, name } = profile;

  return [
    {
      id: 'dont-1',
      action: 'Do NOT spend money on Meta, Google, or Twitter Ads yet',
      reason: `Your startup has ₹${monthlyRevenue.toLocaleString()} MRR and stage is ${stage}. Paid ads will burn your ₹${monthlyBudget.toLocaleString()} budget within days without producing sticky retention.`,
      currentEvidence: `Stage is ${stage} with ₹0 ad CAC strategy required.`,
      risk: 'Draining startup runway on empty clicks before product retention is locked.',
      betterAlternative: 'Focus on 1:1 founder outreach, niche community posts, and direct customer interviews.'
    },
    {
      id: 'dont-2',
      action: 'Do NOT build complex enterprise multi-tenancy, custom permissions, or billing suites yet',
      reason: `Building secondary settings or multi-role architecture before 20 active customers is classic premature engineering.`,
      currentEvidence: 'Solo/lean team bandwidth must be 100% focused on core value.',
      risk: 'Weeks of developer time spent on features that 0 current users need.',
      betterAlternative: 'Hardcode or manually manage enterprise requests until recurring demand warrants automation.'
    },
    {
      id: 'dont-3',
      action: 'Do NOT pay for expensive $100+/mo SaaS analytics or CRM platforms',
      reason: `Free-tier tools like PostHog (1M events/mo free), Supabase, and Airtable/Tally cover 100% of early needs at ₹0.`,
      currentEvidence: `Zero-budget stack provides equivalent power with ₹${profile.monthlySavings.toLocaleString()}/mo savings.`,
      risk: 'Accumulating $300-$500/mo in recurring overhead before achieving product revenue.',
      betterAlternative: 'Use FounderZero curated zero-cost stack tools.'
    }
  ];
}

function generateCustomHealthDimensions(profile: StartupProfile): HealthDimension[] {
  const { stage, currentUsers, monthlyRevenue, availableHoursPerWeek, teamSize, monthlyBudget, monthlySavings } = profile;

  // 1. Problem Validation
  const probScore = stage === 'Idea' ? null : stage === 'Validating' ? 55 : 70;
  const probStatus: HealthDimension['status'] = stage === 'Idea' ? 'Insufficient Data' : 'Needs Attention';

  // 2. Customer Understanding
  const custScore = stage === 'Idea' ? null : 48;
  const custStatus: HealthDimension['status'] = stage === 'Idea' ? 'Insufficient Data' : 'Needs Attention';

  // 3. Product & Onboarding
  let prodScore: number | null = null;
  let prodStatus: HealthDimension['status'] = 'Insufficient Data';
  if (stage === 'Building MVP') {
    prodScore = 50;
    prodStatus = 'Needs Attention';
  } else if (stage === 'Launched' || stage === 'First Revenue' || stage === 'Growing') {
    prodScore = currentUsers > 50 ? 72 : 58;
    prodStatus = prodScore >= 70 ? 'Healthy' : 'Needs Attention';
  }

  // 4. Distribution & Traffic
  const distScore = currentUsers > 50 ? 68 : currentUsers > 10 ? 52 : null;
  const distStatus: HealthDimension['status'] = currentUsers > 50 ? 'Healthy' : currentUsers > 0 ? 'Needs Attention' : 'Insufficient Data';

  // 5. Revenue & Monetization
  const revScore = monthlyRevenue > 10000 ? 78 : monthlyRevenue > 0 ? 60 : null;
  const revStatus: HealthDimension['status'] = monthlyRevenue > 10000 ? 'Strong' : monthlyRevenue > 0 ? 'Healthy' : 'Insufficient Data';

  // 6. Retention & Churn
  const retScore = currentUsers >= 20 ? 58 : null;
  const retStatus: HealthDimension['status'] = currentUsers >= 20 ? 'Needs Attention' : 'Insufficient Data';

  // 7. Operations & Bandwidth
  const opsScore = Math.min(100, 50 + availableHoursPerWeek * 1.5 + teamSize * 10);
  const opsStatus: HealthDimension['status'] = opsScore >= 75 ? 'Healthy' : 'Needs Attention';

  // 8. Financial Discipline
  const finScore = 95;
  const finStatus: HealthDimension['status'] = 'Strong';

  return [
    {
      id: 'dim-1',
      name: 'Problem Validation',
      score: probScore,
      status: probStatus,
      evidence: stage === 'Idea' ? 'No customer validation interviews logged yet.' : 'Customer discovery in progress.',
      risk: stage === 'Idea' ? 'Building without proving problem severity.' : 'Moderate assumption risk.',
      recommendedAction: 'Log 5 customer interviews in Customer Insights.'
    },
    {
      id: 'dim-2',
      name: 'Customer Understanding',
      score: custScore,
      status: custStatus,
      evidence: 'Baseline profile initialized.',
      risk: 'Unverified customer workflow assumptions.',
      recommendedAction: 'Tag exact customer problem phrases during discovery.'
    },
    {
      id: 'dim-3',
      name: 'Product & Onboarding',
      score: prodScore,
      status: prodStatus,
      evidence: stage === 'Building MVP' ? 'Core MVP in active build.' : stage === 'Idea' ? 'MVP not started.' : `${currentUsers} registered users.`,
      risk: 'Setup friction before users experience the core value loop.',
      recommendedAction: 'Focus on 1 single core feature and under-2-minute onboarding.'
    },
    {
      id: 'dim-4',
      name: 'Distribution & Traffic',
      score: distScore,
      status: distStatus,
      evidence: `${currentUsers} total users recorded.`,
      risk: currentUsers < 10 ? 'No active acquisition channel.' : 'Reliance on manual founder outreach.',
      recommendedAction: 'Test 2 organic community channels with valuable breakdowns.'
    },
    {
      id: 'dim-5',
      name: 'Revenue & Pricing',
      score: revScore,
      status: revStatus,
      evidence: `₹${monthlyRevenue.toLocaleString()}/mo MRR recorded.`,
      risk: monthlyRevenue === 0 ? 'Monetization willingness unproven.' : 'Low revenue base.',
      recommendedAction: 'Test willingness to pay during customer interviews.'
    },
    {
      id: 'dim-6',
      name: 'Retention & Churn',
      score: retScore,
      status: retStatus,
      evidence: currentUsers >= 20 ? 'Tracking initial cohort retention.' : 'Insufficient cohort volume (need 20+ users).',
      risk: 'Leaky bucket risk if users drop off after day 1.',
      recommendedAction: 'Interview active and churned users to understand why they stay or leave.'
    },
    {
      id: 'dim-7',
      name: 'Operations & Bandwidth',
      score: opsScore,
      status: opsStatus,
      evidence: `${availableHoursPerWeek} hrs/week available with ${teamSize} team member(s).`,
      risk: availableHoursPerWeek < 15 ? 'Limited founder bandwidth.' : 'Healthy bandwidth capacity.',
      recommendedAction: 'Focus all hours on the #1 Next Best Action.'
    },
    {
      id: 'dim-8',
      name: 'Financial Discipline',
      score: finScore,
      status: finStatus,
      evidence: `₹0 software spend. Saving ~₹${monthlySavings.toLocaleString()}/mo with curated zero-cost stack.`,
      risk: 'None.',
      recommendedAction: 'Maintain zero-budget discipline using free tiers.'
    }
  ];
}

function generateCustomRoadmap(profile: StartupProfile): RoadmapStage[] {
  const { stage, name, targetCustomer, problem } = profile;

  const stageOrder: StartupStage[] = [
    'Idea',
    'Validating',
    'Building MVP',
    'Launched',
    'First Revenue',
    'Growing'
  ];

  const currentIdx = stageOrder.indexOf(stage);

  return [
    {
      id: 'stg-1',
      name: 'IDEA & PROBLEM',
      status: currentIdx > 0 ? 'completed' : currentIdx === 0 ? 'active' : 'upcoming',
      description: `Define target persona (${targetCustomer}) and complete 10 problem interviews.`,
      milestones: [
        { id: 'm1', title: 'Define Target Customer ICP', completed: currentIdx > 0, successCriteria: 'Documented ICP pain profile' },
        { id: 'm2', title: '10 Customer Problem Interviews', completed: currentIdx > 0, successCriteria: '10 recorded summaries' }
      ]
    },
    {
      id: 'stg-2',
      name: 'VALIDATION & OFFER',
      status: currentIdx > 1 ? 'completed' : currentIdx === 1 ? 'active' : 'upcoming',
      description: 'Test willingness to pay and secure 20+ pre-launch waitlist commitments.',
      milestones: [
        { id: 'm3', title: 'Zero-cost landing page & waitlist', completed: currentIdx > 1, successCriteria: '20+ waitlist emails' },
        { id: 'm4', title: '3 Willingness-to-pay confirmations', completed: currentIdx > 1, successCriteria: '3 signed LOIs or pre-orders' }
      ]
    },
    {
      id: 'stg-3',
      name: 'LEAN MVP & BUILD',
      status: currentIdx > 2 ? 'completed' : currentIdx === 2 ? 'active' : 'upcoming',
      description: `Ship single core feature solving '${problem}' using ₹0 developer stack.`,
      milestones: [
        { id: 'm5', title: 'Ship functional core prototype', completed: currentIdx > 2, successCriteria: 'Working MVP deployed on Vercel/Cloudflare' },
        { id: 'm6', title: 'Onboard 5 alpha testers', completed: currentIdx > 2, successCriteria: '5 active testing sessions' }
      ]
    },
    {
      id: 'stg-4',
      name: 'ALPHA LAUNCH & TRACTION',
      status: currentIdx > 3 ? 'completed' : currentIdx === 3 ? 'active' : 'upcoming',
      description: 'Onboard first 25-50 users manually and achieve initial retention.',
      milestones: [
        { id: 'm7', title: 'First 25 active users onboarded', completed: currentIdx > 3, successCriteria: '25 weekly active users' },
        { id: 'm8', title: '40%+ 30-day cohort retention', completed: currentIdx > 3, successCriteria: 'Users returning weekly' }
      ]
    },
    {
      id: 'stg-5',
      name: 'FIRST MONETIZATION',
      status: currentIdx > 4 ? 'completed' : currentIdx === 4 ? 'active' : 'upcoming',
      description: 'Convert initial users to paying customers and validate pricing tier.',
      milestones: [
        { id: 'm9', title: 'First paying customer payment', completed: currentIdx > 4, successCriteria: 'Real payment recorded' },
        { id: 'm10', title: 'Reach ₹10,000 MRR', completed: currentIdx > 4, successCriteria: 'Recurring subscriptions live' }
      ]
    },
    {
      id: 'stg-6',
      name: 'REPEATABLE DISTRIBUTION',
      status: currentIdx === 5 ? 'active' : 'upcoming',
      description: 'Establish 1 profitable organic acquisition flywheel (content, community, or viral loop).',
      milestones: [
        { id: 'm11', title: 'Repeatable organic growth channel', completed: false, successCriteria: '>20% MoM user growth' },
        { id: 'm12', title: 'Product-Market Fit benchmark reached', completed: false, successCriteria: '40%+ "Very Disappointed" PMF survey score' }
      ]
    }
  ];
}

function generateCustomMissions(profile: StartupProfile): Mission[] {
  const { stage, targetCustomer, problem, name } = profile;

  return [
    {
      id: 'mis-1',
      title: stage === 'Idea' || stage === 'Validating'
        ? `Validate '${problem}' with 5 Target Customers`
        : `Run 5 User Retention Interviews for ${name}`,
      category: 'Customer Discovery',
      objective: 'Gather unvarnished feedback on the exact workflow and pain intensity.',
      whyItMatters: 'Direct feedback eliminates blind engineering assumptions and guarantees market demand.',
      estimatedTime: '2 hours',
      estimatedCost: '₹0',
      difficulty: 'Easy',
      expectedResult: '5 documented interview notes with recurring quotes and pain points.',
      completed: false,
      steps: [
        { id: 's1', text: `Find 10 ${targetCustomer} profiles on LinkedIn, X, or Reddit`, completed: false },
        { id: 's2', text: 'Send personalized non-sales message asking for 15-min workflow advice', completed: false },
        { id: 's3', text: 'Ask "What is the hardest part about handling this problem today?"', completed: false },
        { id: 's4', text: 'Ask "What tools or workarounds have you tried in the past?"', completed: false },
        { id: 's5', text: 'Log quotes and pain severity into Customer Insights', completed: false }
      ]
    },
    {
      id: 'mis-2',
      title: 'Deploy Zero-Cost Landing Page & Telemetry',
      category: 'Technical MVP',
      objective: `Set up a clean, high-converting landing page with ₹0 hosting and event tracking.`,
      whyItMatters: 'Validates real click-through interest and collects early adopter leads without server bills.',
      estimatedTime: '1.5 hours',
      estimatedCost: '₹0',
      difficulty: 'Easy',
      expectedResult: 'Live URL with custom domain SSL and waitlist form.',
      completed: false,
      steps: [
        { id: 's2-1', text: 'Create free repository on GitHub and deploy to Vercel / Cloudflare Pages', completed: false },
        { id: 's2-2', text: 'Write clear hero heading with your one-line value proposition', completed: false },
        { id: 's2-3', text: 'Embed free Tally.so / Formspree waitlist form', completed: false },
        { id: 's2-4', text: 'Add PostHog free snippet (1M events free) to measure visitor conversions', completed: false }
      ]
    }
  ];
}

function generateCustomToolRecommendations(profile: StartupProfile): ToolRecommendation[] {
  const isAI = profile.category.toLowerCase().includes('ai');
  const isDev = profile.category.toLowerCase().includes('dev');

  return [
    {
      id: 'tool-hosting',
      category: 'Hosting & Deployment',
      freeOption: 'Vercel / Cloudflare Pages / Railway Starter',
      whatItSolves: 'Global edge hosting, automatic CI/CD deployments, and custom domain SSL.',
      freeLimitations: '100GB bandwidth / mo (plenty for first 5,000 users).',
      whenToUpgrade: 'When scaling team seat permissions.',
      monthlyCost: 1600,
      monthlySaving: 1600,
      status: 'free'
    },
    {
      id: 'tool-db',
      category: 'Database & Auth Backend',
      freeOption: 'Supabase Free / Firebase Firestore Free',
      whatItSolves: 'PostgreSQL database, user authentication, storage buckets, and instant REST/GraphQL APIs.',
      freeLimitations: '500MB database, 50k MAUs on Supabase.',
      whenToUpgrade: 'When database exceeds 500MB.',
      monthlyCost: 2100,
      monthlySaving: 2100,
      status: 'free'
    },
    {
      id: 'tool-ai-agent',
      category: 'AI Coding & Builder Agent',
      freeOption: 'OpenCode (Open Source) / Cline / Cursor Free',
      whatItSolves: 'Autonomous codebase generation, terminal commands, and bug fixes without expensive subscriptions.',
      freeLimitations: 'Bring your own API key or run free local Ollama models.',
      whenToUpgrade: 'Never required (100% open source).',
      monthlyCost: 2000,
      monthlySaving: 2000,
      status: 'free'
    },
    {
      id: 'tool-email',
      category: 'Transactional Email & Newsletters',
      freeOption: 'Resend (3,000 emails/mo) / Loops.so Free',
      whatItSolves: 'Modern React email templates, password resets, onboarding welcome emails, and updates.',
      freeLimitations: '3,000 emails/mo free.',
      whenToUpgrade: 'When sending >100 emails/day.',
      monthlyCost: 1500,
      monthlySaving: 1500,
      status: 'free'
    },
    {
      id: 'tool-analytics',
      category: 'Product Telemetry & Session Replay',
      freeOption: 'PostHog (1,000,000 events/mo free) / Plausible Community',
      whatItSolves: 'Session recordings, user funnels, feature flags, and retention cohort analytics.',
      freeLimitations: '1M events/mo + 5,000 session replays/mo free.',
      whenToUpgrade: 'When exceeding 1M events.',
      monthlyCost: 3500,
      monthlySaving: 3500,
      status: 'free'
    },
    {
      id: 'tool-forms',
      category: 'Customer Feedback & Intake Forms',
      freeOption: 'Tally.so (100% free unlimited forms)',
      whatItSolves: 'Gorgeous Notion-style customer survey forms, bug reporting, and onboarding questionnaires.',
      freeLimitations: 'Unlimited forms & submissions free.',
      whenToUpgrade: 'When custom domain CNAME is needed.',
      monthlyCost: 2400,
      monthlySaving: 2400,
      status: 'free'
    }
  ];
}

function selectInitialVaultResources(profile: StartupProfile, user: User): UserSavedResource[] {
  const isAI = profile.category.toLowerCase().includes('ai');
  const stage = profile.stage;

  const results: UserSavedResource[] = [
    {
      id: 'vault-init-1',
      userId: user.id,
      startupId: 'startup-' + user.id,
      resourceId: 'res-opencode',
      url: 'https://github.com/opencode-ai/opencode',
      title: 'OpenCode — Open Source Autonomous Coding Agent',
      description: 'Run autonomous multi-file coding agents in terminal with free local Ollama models or Gemini API.',
      resourceType: 'coding_agent',
      category: 'BUILD',
      tags: ['Open Source', 'Coding Agent', 'Zero Budget', 'CLI'],
      notes: 'Calibrated for your tech stack during onboarding. Save hours of manual boilerplate coding.',
      priority: 'high',
      status: 'unread',
      collections: ['MVP Dev Stack', 'Coding Agents'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'vault-init-2',
      userId: user.id,
      startupId: 'startup-' + user.id,
      resourceId: 'res-cline',
      url: 'https://github.com/cline/cline',
      title: 'Cline — Autonomous VS Code Agent Extension',
      description: 'Open-source autonomous coding assistant inside VS Code that reads files, writes code, and runs commands.',
      resourceType: 'coding_agent',
      category: 'BUILD',
      tags: ['VS Code', 'Autonomous', 'Open Source', 'MVP'],
      notes: 'Recommended for rapid MVP feature development with step-by-step confirmation.',
      priority: 'high',
      status: 'unread',
      collections: ['MVP Dev Stack', 'Coding Agents'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  if (stage === 'Idea' || stage === 'Validating') {
    results.push({
      id: 'vault-init-3',
      userId: user.id,
      startupId: 'startup-' + user.id,
      url: 'https://www.momtestbook.com',
      title: 'The Mom Test Framework (Summary & Cheat Sheet)',
      description: 'How to talk to customers & learn if your business is a good idea when everyone is lying to you.',
      resourceType: 'article',
      category: 'LEARN',
      tags: ['Mom Test', 'Interviews', 'Validation', 'ICP'],
      notes: 'Essential reading before your first 5 customer problem validation interviews.',
      priority: 'high',
      status: 'unread',
      collections: ['Customer Discovery'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else {
    results.push({
      id: 'vault-init-3',
      userId: user.id,
      startupId: 'startup-' + user.id,
      url: 'https://posthog.com/docs',
      title: 'PostHog Product Analytics & Funnels (1M Events Free)',
      description: 'Free session replay, funnel tracking, and retention curves for early-stage software founders.',
      resourceType: 'tool',
      category: 'BUILD',
      tags: ['Analytics', 'Session Replay', 'Retention', 'Free Tier'],
      notes: 'Track onboarding drop-offs and user activation at ₹0 monthly cost.',
      priority: 'medium',
      status: 'unread',
      collections: ['Analytics & Growth'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return results;
}
