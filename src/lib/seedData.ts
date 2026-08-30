import { AppState, StartupProfile } from '../types';
import { SEED_RESOURCES } from './resourcesData';
import { INITIAL_FOUNDER_NOTES, DEFAULT_NOTEPAD_COLLECTIONS } from './notepadData';
import {
  INITIAL_COPILOT_CONVERSATIONS,
  INITIAL_COPILOT_MESSAGES,
  INITIAL_FOUNDER_MEMORIES
} from './copilotData';

export const DEMO_PROFILE: StartupProfile = {
  id: 'pulseboard-demo',
  name: 'PulseBoard',
  description: 'Real-time performance metrics and retention tracking for indie SaaS products.',
  category: 'Developer Tools & Analytics',
  targetCustomer: 'Solo SaaS Founders & Bootstrappers',
  problem: 'Founders waste hours configuring complex analytics tools like Amplitude when they only need 3 core retention metrics.',
  stage: 'Launched',
  teamSize: 1,
  founderSkills: ['Product Design', 'TypeScript', 'Content Marketing', 'Fullstack React', 'Autonomous AI Workflows'],
  techStack: ['React / Next.js', 'Supabase', 'Tailwind CSS', 'OpenCode / Cline', 'PostHog Free'],
  monetizationModel: 'Subscription (B2B SaaS with Free Starter)',
  monthlyBudget: 2000,
  availableHoursPerWeek: 25,
  currentUsers: 127,
  monthlyRevenue: 8400,
  biggestUncertainty: "Can't get users",
  goal90Days: 'Reach 300 active users and ₹25,000 MRR without paid ad spend',
  founderName: 'Alex Rivera',
  founderTitle: 'Solo Technical Founder & Product Architect',
  founderBio: 'Building zero-budget developer tools with high product craft. Obsessed with fast feedback loops, Mom Test validation, and autonomous AI-assisted shipping.',
  founderArchetype: 'Full-Stack Builder & Lean Operator',
  location: 'Bengaluru, India / Remote',
  timezone: 'UTC+05:30 (IST)',
  workingStyle: 'Deep Work Sprints • Async-First • Rapid Prototyping',
  founderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  socialLinks: {
    twitter: 'https://twitter.com/alexrivera_dev',
    github: 'https://github.com/alexrivera-builds',
    linkedin: 'https://linkedin.com/in/alexrivera-founder',
    website: 'https://pulseboard.dev',
    productHunt: 'https://producthunt.com/@alexrivera'
  },
  superpowers: [
    'Autonomous AI Agent Coding',
    'High-Velocity MVP Prototyping',
    'Customer Discovery & Mom Test',
    'Zero-Budget Infrastructure',
    'Organic Content Distribution'
  ],
  operatingPrinciples: [
    'Talk to 3 active users before writing a single complex backend module',
    'Zero paid ad spend until reaching 40%+ 30-day cohort retention',
    'Never deploy bloated infrastructure when a free tier or static edge function suffices',
    'Ship thin, complete end-to-end vertical slices over wide unfinished surface areas'
  ],
  skillRatings: [
    { skill: 'Full-Stack TypeScript / React', level: 'Expert', category: 'Engineering', percentage: 92 },
    { skill: 'Autonomous Coding Agents (OpenCode/Cline)', level: 'Expert', category: 'Engineering', percentage: 90 },
    { skill: 'Product Design & UX Craft', level: 'Proficient', category: 'Product & Design', percentage: 84 },
    { skill: 'Customer Discovery (The Mom Test)', level: 'Proficient', category: 'Growth & Distribution', percentage: 80 },
    { skill: 'Zero-Budget Infrastructure Ops', level: 'Expert', category: 'Operations & Strategy', percentage: 95 },
    { skill: 'Copywriting & Developer Marketing', level: 'Competent', category: 'Growth & Distribution', percentage: 72 }
  ],
  badges: [
    {
      id: 'zero-burn',
      title: 'Zero-Burn Master',
      description: 'Sustained <₹2,000 monthly software overhead while deploying full-stack SaaS.',
      icon: 'Zap',
      category: 'zero-budget',
      earnedDate: 'Aug 2026'
    },
    {
      id: 'mom-test-certified',
      title: 'Mom Test Practitioner',
      description: 'Conducted 10+ objective problem validation interviews with zero leading questions.',
      icon: 'Users',
      category: 'validation',
      earnedDate: 'Aug 2026'
    },
    {
      id: 'agentic-builder',
      title: 'Autonomous Agent Operator',
      description: 'Accelerated MVP delivery 3x using integrated OpenCode/Cline coding workflows.',
      icon: 'Cpu',
      category: 'execution',
      earnedDate: 'Aug 2026'
    },
    {
      id: 'first-revenue',
      title: 'Monetization Unlocked',
      description: 'Secured first recurring paying customers at ₹8,400+ MRR.',
      icon: 'TrendingUp',
      category: 'growth',
      earnedDate: 'Aug 2026'
    }
  ],
  createdAt: new Date().toISOString(),
  founderScore: 78,
  monthlySavings: 7800
};

export const DEMO_APP_STATE: AppState = {
  user: {
    id: 'demo-user-1',
    email: 'alex@pulseboard.io',
    name: 'Alex Rivera',
    isDemo: true
  },
  profile: DEMO_PROFILE,
  nextActions: [
    {
      id: 'action-1',
      title: 'Interview 5 active users who logged in 3+ times this week',
      whyItMatters: 'Identifies the specific feature driving activation so you can double down on your core loop.',
      expectedImpact: 'Increases 30-day user retention from 41% to ~55%',
      estimatedTime: '3 hours',
      estimatedCost: '₹0',
      difficulty: 'Medium',
      deadline: 'In 3 days',
      relatedBottleneck: 'User Retention & Core Value Loop',
      priority: 'Do Now',
      reason: 'You have 127 registered users, but only 41% stick around past week 2. You need qualitative clarity on who finds high value.',
      evidence: '127 total signups, 41% 30-day retention, 8 customer interview notes recorded.',
      status: 'pending'
    },
    {
      id: 'action-2',
      title: 'Publish a teardown blog post on Product Hunt / Reddit r/SaaS',
      whyItMatters: 'Zero-cost organic acquisition leverage targeting high-intent solo founders.',
      expectedImpact: '+35 to 60 targeted signup leads without spending budget',
      estimatedTime: '4 hours',
      estimatedCost: '₹0',
      difficulty: 'Medium',
      deadline: 'This week',
      relatedBottleneck: 'Organic Distribution',
      priority: 'Do Next',
      reason: 'Your monthly ad budget is ₹2,000. Organic community teardowns generate 10x higher trust for dev tools.',
      evidence: 'Previous Reddit post yielded 18 signups at ₹0 CAC.',
      status: 'pending'
    },
    {
      id: 'action-3',
      title: 'Set up an automated offboarding survey for churned users',
      whyItMatters: 'Captures direct objections before users completely disappear.',
      expectedImpact: 'Pinpoints primary churn cause (Price vs Feature missing vs Onboarding confusion)',
      estimatedTime: '1 hour',
      estimatedCost: '₹0',
      difficulty: 'Easy',
      deadline: 'Next week',
      relatedBottleneck: 'Monetization & Churn Leakage',
      priority: 'Later',
      reason: '3 users cancelled subscriptions last month without leaving written feedback.',
      evidence: '3 churn events recorded in 30 days.',
      status: 'pending'
    }
  ],
  dontDoItems: [
    {
      id: 'dont-1',
      action: 'Do NOT spend money on Meta or Google Ads yet',
      reason: 'Your paid conversion pathway is unproven and 30-day retention is 41%. Ads will burn your ₹2,000 monthly budget within 48 hours without producing lasting ROI.',
      currentEvidence: 'CAC on paid channels estimated at ₹1,200/user, while MRR per user is ₹66. You would lose money on every signup.',
      risk: 'Draining startup runway on empty clicks before fixing onboarding churn.',
      betterAlternative: 'Run 2 zero-budget community distribution experiments on Twitter/X and Indie Hackers.'
    },
    {
      id: 'dont-2',
      action: 'Do NOT build Enterprise SSO or Custom Roles yet',
      reason: 'Zero enterprise prospects have requested SSO. 100% of your current 127 users are solo founders and micro-teams.',
      currentEvidence: 'Customer feedback logs show 14 feature requests, 0 for SSO or multi-org permissions.',
      risk: 'Wasting 3 weeks of solo developer bandwidth on complex security infrastructure nobody uses.',
      betterAlternative: 'Simplify dashboard onboarding setup from 4 steps to 2 steps.'
    }
  ],
  healthDimensions: [
    {
      id: 'dim-1',
      name: 'Problem Validation',
      score: 88,
      status: 'Strong',
      evidence: '18 founder interviews completed; 83% confirmed existing analytics tools are overly complex.',
      risk: 'Low. Problem is real and well-understood.',
      recommendedAction: 'Keep interview notes updated as new user segments join.'
    },
    {
      id: 'dim-2',
      name: 'Customer Understanding',
      score: 82,
      status: 'Healthy',
      evidence: '8 detailed interview records saved with tagged pain points and exact customer vocabulary.',
      risk: 'Minor gap in understanding why non-technical founders churn.',
      recommendedAction: 'Interview 2 non-technical users next week.'
    },
    {
      id: 'dim-3',
      name: 'Product & Onboarding',
      score: 65,
      status: 'Needs Attention',
      evidence: 'Activation rate is 58%. 42% drop off before sending their first event payload.',
      risk: 'High dropoff during SDK setup.',
      recommendedAction: 'Build a 1-click test event button in onboarding.'
    },
    {
      id: 'dim-4',
      name: 'Distribution & Traffic',
      score: 52,
      status: 'Needs Attention',
      evidence: '127 users acquired primarily from 1 viral Reddit thread. Lacking repeatable channels.',
      risk: 'Traffic stalls when founder stops manual posting.',
      recommendedAction: 'Test a weekly automated build-in-public newsletter.'
    },
    {
      id: 'dim-5',
      name: 'Revenue & Pricing',
      score: 70,
      status: 'Healthy',
      evidence: '₹8,400 MRR from 12 paying users at ₹700/mo.',
      risk: 'Low pricing might limit ARPU growth.',
      recommendedAction: 'Test a ₹1,200 Pro tier with priority retention alerts.'
    },
    {
      id: 'dim-6',
      name: 'Retention & Churn',
      score: 58,
      status: 'Needs Attention',
      evidence: '30-day retention is 41%. Target for SaaS analytics is 60%+.',
      risk: 'Leaky bucket reduces lifetime value (LTV).',
      recommendedAction: 'Run retention sprint with targeted email re-engagement.'
    },
    {
      id: 'dim-7',
      name: 'Operations & Bandwidth',
      score: 75,
      status: 'Healthy',
      evidence: '25 hours/week invested by solo founder with clear task allocation.',
      risk: 'Single founder vulnerability.',
      recommendedAction: 'Automate repetitive customer support responses with FAQ.'
    },
    {
      id: 'dim-8',
      name: 'Financial Discipline',
      score: 95,
      status: 'Strong',
      evidence: 'Monthly software expenses: ₹0 (all free-tier tools). Saving ₹7,800/month.',
      risk: 'None. Exceptional capital efficiency.',
      recommendedAction: 'Maintain zero-budget tool stack until ₹50,000 MRR.'
    }
  ],
  roadmapStages: [
    {
      id: 'stage-1',
      name: 'IDEA & PROBLEM',
      status: 'completed',
      description: 'Define problem, target customer persona, and conduct 10 validation interviews.',
      milestones: [
        { id: 'm1', title: 'Define ICP and Problem Statement', completed: true, successCriteria: 'Documented ICP & core pain point' },
        { id: 'm2', title: '10 Customer Problem Interviews', completed: true, successCriteria: 'Recorded 10 interview summaries' }
      ]
    },
    {
      id: 'stage-2',
      name: 'VALIDATION',
      status: 'completed',
      description: 'Test willingness to use and pay via landing page & manual concierge test.',
      milestones: [
        { id: 'm3', title: 'Zero-cost landing page launch', completed: true, successCriteria: '50+ waitlist signups' },
        { id: 'm4', title: 'Validate pricing willingness', completed: true, successCriteria: '5 pre-orders or verbal commitments' }
      ]
    },
    {
      id: 'stage-3',
      name: 'MVP & LAUNCH',
      status: 'completed',
      description: 'Ship minimal usable version to early adopters and fix high-friction bugs.',
      milestones: [
        { id: 'm5', title: 'Deploy functional MVP v1.0', completed: true, successCriteria: 'Core value delivered in under 5 mins' },
        { id: 'm6', title: 'Public launch on Show HN & Reddit', completed: true, successCriteria: '100+ registered users' }
      ]
    },
    {
      id: 'stage-4',
      name: 'FIRST REVENUE',
      status: 'active',
      description: 'Convert free users into paying customers and reach initial MRR goal.',
      milestones: [
        { id: 'm7', title: 'Reach 10 paying customers', completed: true, successCriteria: '₹7,000+ MRR' },
        { id: 'm8', title: 'Optimize activation to 60%', completed: false, successCriteria: '60% signups complete setup' }
      ]
    },
    {
      id: 'stage-5',
      name: 'PRODUCT-MARKET FIT',
      status: 'upcoming',
      description: 'Achieve 60%+ 30-day retention and sustainable organic referral loops.',
      milestones: [
        { id: 'm9', title: 'Achieve 60% 30-day retention', completed: false, successCriteria: 'Cohorts stabilize past 30 days' },
        { id: 'm10', title: 'Reach ₹25,000 MRR', completed: false, successCriteria: 'Predictable monthly revenue' }
      ]
    },
    {
      id: 'stage-6',
      name: 'GROWTH & SCALE',
      status: 'upcoming',
      description: 'Scale acquisition channels with repeatable flywheel.',
      milestones: [
        { id: 'm11', title: 'Establish 2 repeatable growth channels', completed: false, successCriteria: 'Consistent weekly lead flow' }
      ]
    }
  ],
  missions: [
    {
      id: 'mission-1',
      title: 'Interview 5 Active Users',
      category: 'Customer Validation',
      objective: 'Discover what specific value features keep users coming back.',
      whyItMatters: 'Retaining existing users is 5x cheaper than acquiring new ones.',
      estimatedTime: '3 hours',
      estimatedCost: '₹0',
      difficulty: 'Medium',
      expectedResult: 'Identify the top 2 features driving 80% of retention.',
      completed: false,
      steps: [
        { id: 's1', text: 'Filter users with 3+ logins in the last 7 days', completed: true },
        { id: 's2', text: 'Send 10 personalized, non-sales email invites for a 15-min chat', completed: true },
        { id: 's3', text: 'Conduct interviews asking "What would you do if PulseBoard disappeared tomorrow?"', completed: false },
        { id: 's4', text: 'Log key quotes and pain points into Customer Insights', completed: false }
      ]
    },
    {
      id: 'mission-2',
      title: 'Optimize Onboarding Activation',
      category: 'Product Experience',
      objective: 'Increase user activation rate from 58% to 70%.',
      whyItMatters: '42% of users quit before seeing value. Fixing activation instantly boosts signups value.',
      estimatedTime: '2 hours',
      estimatedCost: '₹0',
      difficulty: 'Easy',
      expectedResult: 'Fewer setup dropoffs and faster time-to-first-metric.',
      completed: false,
      steps: [
        { id: 's1', text: 'Add sample demo data button on first setup screen', completed: true },
        { id: 's2', text: 'Create 1-click copy script snippet', completed: true },
        { id: 's3', text: 'Send automated welcome tip email 2 hours after signup', completed: false }
      ]
    },
    {
      id: 'mission-3',
      title: 'Run First Zero-Budget Pricing Experiment',
      category: 'Monetization',
      objective: 'Test whether users will upgrade to a Pro tier at ₹1,200/mo.',
      whyItMatters: 'Increasing ARPU accelerates MRR growth without needing 10x traffic.',
      estimatedTime: '2.5 hours',
      estimatedCost: '₹0',
      difficulty: 'Medium',
      expectedResult: 'Clear demand signal for advanced alerts tier.',
      completed: true,
      steps: [
        { id: 's1', text: 'Define Pro features: Instant Telegram alerts + weekly summary PDF', completed: true },
        { id: 's2', text: 'Add Pro Plan callout in dashboard setting with waitlist modal', completed: true },
        { id: 's3', text: 'Track modal clicks over 14 days', completed: true },
        { id: 's4', text: 'Analyze conversion intent', completed: true }
      ]
    }
  ],
  experiments: [
    {
      id: 'exp-1',
      title: 'Reddit r/SaaS Teardown Growth Post',
      hypothesis: 'Posting a detailed, authentic teardown of SaaS retention metrics on r/SaaS will drive 40+ signups.',
      problem: 'Organic distribution is currently stagnant between launches.',
      metric: 'New User Signups',
      currentValue: '127',
      targetValue: '167',
      method: 'Write a zero-fluff 800-word post with real anonymized retention charts and a free tool link.',
      audience: 'Indie Hackers & Reddit SaaS Community',
      duration: '7 Days',
      budget: '₹0',
      status: 'Running',
      createdAt: '2026-08-01'
    },
    {
      id: 'exp-2',
      title: 'Pro Plan Pricing Upgrade Waitlist Test',
      hypothesis: 'At least 15% of active users will click "Upgrade to Pro (₹1,200/mo)" when offered instant Telegram churn alerts.',
      problem: 'Low ARPU limiting revenue scaling.',
      metric: 'Upgrade Modal Click-Through Rate',
      currentValue: '0%',
      targetValue: '15%',
      method: 'In-app banner highlighting Telegram alerts with a "Request Early Access" button.',
      audience: '127 Active Free Users',
      duration: '14 Days',
      budget: '₹0',
      status: 'Completed',
      resultOutcome: '22 out of 127 users (17.3%) clicked the Pro Upgrade button.',
      learnings: 'High demand exists for instant alerts. Telegram bot integration is high value.',
      nextSteps: 'Build simple Telegram bot integration for Pro tier.',
      createdAt: '2026-07-15'
    }
  ],
  tools: [
    {
      id: 'tool-1',
      category: 'Analytics & Tracking',
      freeOption: 'PostHog Open Source / Vercel Analytics Free',
      whatItSolves: 'User event tracking, funnel analysis, and web analytics.',
      freeLimitations: 'Up to 1,000,000 events/mo free.',
      whenToUpgrade: 'When exceeding 1M events or needing custom enterprise SLAs.',
      monthlyCost: 4500, // Amplitude / Mixpanel equivalent cost
      monthlySaving: 4500,
      status: 'free'
    },
    {
      id: 'tool-2',
      category: 'Email Marketing & Newsletters',
      freeOption: 'Resend Free Tier + Brevo',
      whatItSolves: 'Transactional onboarding emails and product update broadcasts.',
      freeLimitations: '3,000 transactional emails/month free.',
      whenToUpgrade: 'When subscriber list exceeds 2,500 contacts.',
      monthlyCost: 2000, // Mailchimp paid equivalent
      monthlySaving: 2000,
      status: 'free'
    },
    {
      id: 'tool-3',
      category: 'Landing Page & Hosting',
      freeOption: 'Vercel / Cloudflare Pages Free Tier',
      whatItSolves: 'Instant SSL, edge hosting, and global CDN for web apps.',
      freeLimitations: '100GB bandwidth / 100k executions daily.',
      whenToUpgrade: 'When scaling to multi-region team deployments.',
      monthlyCost: 1300,
      monthlySaving: 1300,
      status: 'free'
    }
  ],
  realityChecks: [
    {
      id: 'rc-1',
      decisionClaim: 'I want to spend ₹50,000 on Facebook and Google Ads to acquire new users.',
      actualEvidence: 'Current 30-day retention is 41%, and onboard activation is 58%. Organic CAC is ₹0 via Reddit.',
      missingEvidence: 'No evidence that paid traffic converts to long-term paying customers; unproven ad copy.',
      counterargument: 'Sending paid traffic into a 42% onboarding drop-off bucket will burn money without yielding sticky revenue.',
      risk: 'Loss of ₹50,000 (25 months of current operating budget) with minimal retention.',
      betterAlternative: 'Run 3 free community distribution sprints on Indie Hackers & LinkedIn before touching paid ads.',
      recommendedDecision: 'REJECT paid ads for now. Focus 100% on fixing activation to 65% first.',
      confidence: 'High',
      evidenceStrength: 'Strong',
      estimatedCost: '₹50,000 potential risk',
      potentialDownside: 'Complete depletion of cash reserves.',
      createdAt: '2026-08-05'
    }
  ],
  customerFeedback: [
    {
      id: 'fb-1',
      customerName: 'Rahul M. (SaaS Founder)',
      type: 'Interview',
      content: 'I love how clean the dashboard is. Other analytics tools give me 50 charts I don\'t understand. I just wanted to know if users came back this week.',
      tags: ['Simplicity', 'Core Value', 'Retention'],
      keyPainPoint: 'Competitor complexity & chart clutter',
      createdAt: '2026-08-04'
    },
    {
      id: 'fb-2',
      customerName: 'Sarah K. (Indie Hacker)',
      type: 'Support',
      content: 'I got stuck trying to find where to put the tracking script in my Next.js app directory. A code example for App Router would be great.',
      tags: ['Onboarding', 'Developer Experience', 'Next.js'],
      keyPainPoint: 'Onboarding documentation gap for Next.js App Router',
      objection: 'Unclear setup instructions',
      createdAt: '2026-08-06'
    }
  ],
  insights: [
    {
      id: 'ins-1',
      title: 'Bottleneck Shifted: Distribution is Now #1 Priority',
      description: 'Your problem validation and revenue models are verified. Acquisition flow is currently resting on a single channel.',
      type: 'bottleneck',
      date: '2026-08-08'
    },
    {
      id: 'ins-2',
      title: 'Pro Tier Pricing Experiment Succeeded',
      description: '17.3% of active users requested Pro Telegram alerts, confirming strong willingness to pay ₹1,200/mo.',
      type: 'experiment',
      date: '2026-08-02'
    },
    {
      id: 'ins-3',
      title: 'Zero Software Spend Maintained',
      description: 'Saved ₹7,800 this month using high-grade free tier tools (PostHog, Resend, Vercel).',
      type: 'financial',
      date: '2026-08-01'
    }
  ],
  metrics: [
    {
      id: 'm-users',
      name: 'Total Registered Users',
      key: 'users',
      currentValue: 127,
      unit: 'users',
      trend: '+18% this month',
      explanation: 'Total number of founder accounts created in PulseBoard.',
      whyItMatters: 'Top of funnel milestone showing product curiosity.',
      whatToImprove: 'Increase community post cadence to sustain user growth.',
      hasEnoughData: true,
      history: [
        { date: 'May', value: 24 },
        { date: 'Jun', value: 58 },
        { date: 'Jul', value: 104 },
        { date: 'Aug', value: 127 }
      ]
    },
    {
      id: 'm-activation',
      name: 'Activation Rate',
      key: 'activation',
      currentValue: 58,
      unit: '%',
      trend: '+4% vs last month',
      explanation: 'Percentage of signups who send at least 1 analytics event within 24 hours.',
      whyItMatters: 'Critical indicator of onboarding friction and immediate value perception.',
      whatToImprove: 'Add interactive setup checklist and demo data toggle.',
      hasEnoughData: true,
      history: [
        { date: 'May', value: 45 },
        { date: 'Jun', value: 50 },
        { date: 'Jul', value: 54 },
        { date: 'Aug', value: 58 }
      ]
    },
    {
      id: 'm-retention',
      name: '30-Day Retention',
      key: 'retention',
      currentValue: 41,
      unit: '%',
      trend: 'Flat',
      explanation: 'Percentage of users returning to view metrics 30 days after signup.',
      whyItMatters: 'The ultimate indicator of Product-Market Fit.',
      whatToImprove: 'Build automated weekly email digest showing founder growth stats.',
      hasEnoughData: true,
      history: [
        { date: 'May', value: 38 },
        { date: 'Jun', value: 40 },
        { date: 'Jul', value: 41 },
        { date: 'Aug', value: 41 }
      ]
    },
    {
      id: 'm-mrr',
      name: 'Monthly Recurring Revenue (MRR)',
      key: 'mrr',
      currentValue: 8400,
      unit: '₹',
      trend: '+₹2,100 this month',
      explanation: 'Predictable monthly revenue from paid subscribers.',
      whyItMatters: 'Validates financial sustainability and founder independence.',
      whatToImprove: 'Launch the Pro Tier (₹1,200/mo) with Telegram alerts.',
      hasEnoughData: true,
      history: [
        { date: 'May', value: 2100 },
        { date: 'Jun', value: 4200 },
        { date: 'Jul', value: 6300 },
        { date: 'Aug', value: 8400 }
      ]
    },
    {
      id: 'm-churn',
      name: 'Monthly Revenue Churn',
      key: 'churn',
      currentValue: 2.8,
      unit: '%',
      trend: '-0.5% vs last month',
      explanation: 'Percentage of MRR lost due to cancellations.',
      whyItMatters: 'Low churn preserves recurring revenue compounding.',
      whatToImprove: 'Implement exit surveys to capture cancellation reasons.',
      hasEnoughData: true,
      history: [
        { date: 'May', value: 4.5 },
        { date: 'Jun', value: 3.8 },
        { date: 'Jul', value: 3.3 },
        { date: 'Aug', value: 2.8 }
      ]
    }
  ],
  activities: [
    {
      id: 'act-1',
      title: 'Experiment Completed: Pro Tier Waitlist',
      description: '17.3% of active users clicked Pro upgrade button.',
      timestamp: '2 days ago',
      type: 'experiment'
    },
    {
      id: 'act-2',
      title: 'Customer Feedback Recorded',
      description: 'Sarah K. noted onboarding script difficulty with Next.js.',
      timestamp: '3 days ago',
      type: 'customer'
    },
    {
      id: 'act-3',
      title: 'Reality Check Analyzed',
      description: 'Evaluated ₹50,000 ad spend decision — Recommended organic focus.',
      timestamp: '4 days ago',
      type: 'reality_check'
    },
    {
      id: 'act-4',
      title: 'MRR Milestone Achieved',
      description: 'Crossed ₹8,400 monthly recurring revenue from 12 supporters.',
      timestamp: '6 days ago',
      type: 'metric'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      title: 'New Recommendation Generated',
      message: 'Focus on interviewing 5 active users to uncover your retention leverage.',
      timestamp: '1 hour ago',
      read: false,
      type: 'action'
    },
    {
      id: 'notif-2',
      title: 'Milestone Progress',
      message: 'You have completed 3 of 4 First Revenue milestones!',
      timestamp: 'Yesterday',
      read: true,
      type: 'mission'
    }
  ],
  resources: SEED_RESOURCES,
  resourceInteractions: [
    {
      id: 'int-1',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      resourceId: 'res-cline',
      interactionType: 'tried',
      createdAt: '2026-08-20T10:00:00Z',
      notes: 'Built the first version of the analytics dashboard with Cline and Sonnet 3.5'
    },
    {
      id: 'int-2',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      resourceId: 'res-art-mom-test',
      interactionType: 'completed',
      createdAt: '2026-08-22T14:30:00Z',
      notes: 'Reviewed question bank before interviewing 8 founders.'
    },
    {
      id: 'int-3',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      resourceId: 'res-posthog',
      interactionType: 'saved',
      createdAt: '2026-08-24T09:15:00Z'
    },
    {
      id: 'int-4',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      resourceId: 'res-supabase',
      interactionType: 'completed',
      createdAt: '2026-08-25T11:00:00Z'
    }
  ],
  learningProfile: {
    completedCount: 2,
    articlesRead: 1,
    toolsTried: 1,
    coursesCompleted: 0,
    skillsLearned: ['The Mom Test', 'Postgres SQL', 'Cline CLI', 'Customer Discovery'],
    topicsExplored: ['Customer Interviews', 'Validation', 'Autonomous Agents', 'Databases'],
    skillMastery: {
      technical: 65,
      product: 70,
      marketing: 45,
      sales: 35,
      operations: 50
    },
    gapsIdentified: [
      'Zero-budget community distribution channels',
      'Direct founder sales outreach & pricing strategy'
    ]
  },
  vaultCollections: [
    {
      id: 'col-mvp',
      name: 'MVP Tools',
      description: 'Core free-tier stack for building fast without recurring bills',
      icon: 'Layers',
      color: '#0052FF',
      createdAt: '2026-08-15T08:00:00Z'
    },
    {
      id: 'col-marketing',
      name: 'Marketing Ideas',
      description: 'Zero-cost distribution tactics and community acquisition channels',
      icon: 'TrendingUp',
      color: '#10B981',
      createdAt: '2026-08-15T08:00:00Z'
    },
    {
      id: 'col-ai',
      name: 'AI Tools',
      description: 'Open-source coding agents and local model setups',
      icon: 'Sparkles',
      color: '#8B5CF6',
      createdAt: '2026-08-16T09:00:00Z'
    },
    {
      id: 'col-read-later',
      name: 'Read Later',
      description: 'Tactical founder essays, pricing playbooks, and case studies',
      icon: 'BookOpen',
      color: '#F59E0B',
      createdAt: '2026-08-16T09:00:00Z'
    },
    {
      id: 'col-fundraising',
      name: 'Fundraising',
      description: 'Angel deck templates, SAFE note guides, and pitch notes',
      icon: 'DollarSign',
      color: '#EC4899',
      createdAt: '2026-08-17T10:00:00Z'
    },
    {
      id: 'col-things-to-try',
      name: 'Things To Try',
      description: 'New workflows and experiments to benchmark in the next sprint',
      icon: 'FlaskConical',
      color: '#06B6D4',
      createdAt: '2026-08-18T11:00:00Z'
    },
    {
      id: 'col-product-inspo',
      name: 'Product Inspiration',
      description: 'Great onboarding flows, micro-interactions, and landing pages',
      icon: 'Lightbulb',
      color: '#3B82F6',
      createdAt: '2026-08-19T12:00:00Z'
    },
    {
      id: 'col-github',
      name: 'Useful GitHub Repos',
      description: 'Open-source boilerplate, agent runtimes, and starter templates',
      icon: 'FolderGit2',
      color: '#64748B',
      createdAt: '2026-08-20T14:00:00Z'
    },
    {
      id: 'col-future',
      name: 'Future Ideas',
      description: 'Long-term features and platform pivot hypotheses',
      icon: 'Target',
      color: '#A855F7',
      createdAt: '2026-08-21T15:00:00Z'
    }
  ],
  savedResources: [
    {
      id: 'sv-1',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      resourceId: 'res-opencode',
      url: 'https://github.com/opencode-ai/opencode',
      title: 'OpenCode — Open-Source Autonomous Coding Agent',
      description: 'Open-source coding agent for terminal and editor environments with Ollama local model support and zero vendor lock-in.',
      resourceType: 'coding_agent',
      category: 'Development',
      tags: ['AI', 'Coding Agent', 'Open Source', 'Developer Tools', 'CLI'],
      notes: 'Try this when current coding workflow becomes too slow or token costs spike.',
      priority: 'high',
      status: 'completed',
      faviconUrl: 'https://github.githubassets.com/favicons/favicon.png',
      source: 'GitHub',
      author: 'OpenCode Team',
      collections: ['AI Tools', 'MVP Tools', 'Useful GitHub Repos'],
      readingTimeMinutes: 5,
      suggestedStage: 'Building MVP',
      relevantProblem: 'Building Without Coding Team',
      relevantSkill: 'Autonomous Coding',
      isOpenSource: true,
      githubRepo: 'opencode-ai/opencode',
      createdAt: '2026-08-10T10:00:00Z',
      updatedAt: '2026-08-20T11:00:00Z',
      lastOpenedAt: '2026-08-25T14:00:00Z'
    },
    {
      id: 'sv-2',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      resourceId: 'res-art-mom-test',
      url: 'https://www.momtestbook.com',
      title: 'The Mom Test: How to Talk to Customers When Everyone is Lying to You',
      description: 'The definitive handbook for conducting customer validation interviews without asking leading questions.',
      resourceType: 'article',
      category: 'Product',
      tags: ['Customer Interviews', 'Validation', 'User Research', 'Discovery'],
      notes: 'Use these specific rule-of-thumb questions during next week customer interview calls.',
      priority: 'high',
      status: 'completed',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=momtestbook.com&sz=64',
      source: 'Rob Fitzpatrick',
      author: 'Rob Fitzpatrick',
      collections: ['Read Later', 'Marketing Ideas'],
      readingTimeMinutes: 12,
      suggestedStage: 'Validating',
      relevantProblem: 'Customer Acquisition',
      relevantSkill: 'Customer Interviews',
      createdAt: '2026-08-11T12:30:00Z',
      updatedAt: '2026-08-22T09:15:00Z',
      lastOpenedAt: '2026-08-22T14:30:00Z'
    },
    {
      id: 'sv-3',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      url: 'https://lennyrachitsky.substack.com/p/how-to-increase-retention',
      title: 'How to Improve SaaS Retention & Reduce Churn: A Comprehensive Framework',
      description: 'Tactical breakdown of cohort retention curves, activation milestones, and fixing onboarding churn for B2B & micro-SaaS.',
      resourceType: 'newsletter',
      category: 'Growth',
      tags: ['Retention', 'Churn', 'Onboarding', 'Cohort Analysis', 'SaaS'],
      notes: 'Crucial reading for our 41% 30-day retention bottleneck. Focus on the activation milestone chapter.',
      priority: 'high',
      status: 'reading',
      faviconUrl: 'https://substackcdn.com/image/fetch/w_64,h_64,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F982e5ee6-d18e-4a62-8703-a1789c67fc7e_256x256.png',
      source: "Lenny's Newsletter",
      author: 'Lenny Rachitsky',
      collections: ['Read Later', 'Marketing Ideas'],
      readingTimeMinutes: 15,
      suggestedStage: 'Launched',
      relevantProblem: 'Retention',
      relevantSkill: 'Cohort Retention Analysis',
      reminder: {
        id: 'rem-1',
        dueDate: '2026-08-30T09:00:00Z',
        label: 'Tomorrow',
        note: 'Review cohort milestone tactics before deploying sprint 4',
        triggered: false
      },
      createdAt: '2026-08-11T14:00:00Z',
      updatedAt: '2026-08-28T16:20:00Z',
      lastOpenedAt: '2026-08-28T16:00:00Z'
    },
    {
      id: 'sv-4',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      resourceId: 'res-posthog',
      url: 'https://posthog.com',
      title: 'PostHog — Open-Source Product Analytics & Session Replay',
      description: 'Generous free tier: 1M events/month, 5,000 session recordings, feature flags, and survey widgets with zero cost.',
      resourceType: 'tool',
      category: 'Development',
      tags: ['Analytics', 'Free Tier', 'Session Replay', 'Feature Flags'],
      notes: 'Use session replays to see where users drop off during step 2 of setup.',
      priority: 'medium',
      status: 'completed',
      faviconUrl: 'https://posthog.com/favicon.ico',
      source: 'PostHog',
      collections: ['MVP Tools', 'Things To Try'],
      readingTimeMinutes: 8,
      suggestedStage: 'Launched',
      relevantProblem: 'Retention',
      relevantSkill: 'Product Analytics',
      isOpenSource: true,
      createdAt: '2026-08-14T09:00:00Z',
      updatedAt: '2026-08-24T09:15:00Z',
      lastOpenedAt: '2026-08-24T09:15:00Z'
    },
    {
      id: 'sv-5',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      url: 'https://www.julian.com/guide/growth/acquisition-channels',
      title: 'The Definitive Guide to Organic Customer Acquisition for Solo Builders',
      description: 'Step-by-step tactics to get your first 100 paying customers through Reddit, indie directories, and high-value teardowns.',
      resourceType: 'article',
      category: 'Growth',
      tags: ['Distribution', 'First 100 Customers', 'Organic Marketing', 'Growth'],
      notes: 'Plan our next 2 community launches using the template in section 3.',
      priority: 'high',
      status: 'unread',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=julian.com&sz=64',
      source: 'Julian Shapiro',
      author: 'Julian Shapiro',
      collections: ['Read Later', 'Marketing Ideas'],
      readingTimeMinutes: 18,
      suggestedStage: 'Launched',
      relevantProblem: 'Customer Acquisition',
      relevantSkill: 'Organic Distribution',
      createdAt: '2026-08-18T15:00:00Z',
      updatedAt: '2026-08-18T15:00:00Z'
    },
    {
      id: 'sv-6',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      resourceId: 'res-supabase',
      url: 'https://supabase.com',
      title: 'Supabase — The Open Source Firebase Alternative',
      description: 'Generous free tier: Postgres database, Auth, 50,000 MAUs, and real-time subscriptions.',
      resourceType: 'tool',
      category: 'Development',
      tags: ['Database', 'Postgres', 'Backend', 'Auth', 'Free Tier'],
      notes: 'Our core database backend. Migration from SQLite was smooth.',
      priority: 'high',
      status: 'completed',
      faviconUrl: 'https://supabase.com/favicon/favicon-32x32.png',
      source: 'Supabase',
      collections: ['MVP Tools'],
      readingTimeMinutes: 10,
      suggestedStage: 'Building MVP',
      relevantProblem: 'Zero Budget Tech Stack',
      relevantSkill: 'Postgres SQL',
      isOpenSource: true,
      createdAt: '2026-08-19T11:00:00Z',
      updatedAt: '2026-08-25T11:00:00Z',
      lastOpenedAt: '2026-08-25T11:00:00Z'
    },
    {
      id: 'sv-7',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      url: 'https://github.com/shadcn-ui/ui',
      title: 'shadcn/ui — Beautifully Designed React & Tailwind Components',
      description: 'Accessible and customizable components that you can copy and paste into your apps. Free and open-source.',
      resourceType: 'repository',
      category: 'Design',
      tags: ['UI Components', 'React', 'Tailwind CSS', 'Open Source'],
      notes: 'Use this for all clean modal and dropdown design patterns.',
      priority: 'medium',
      status: 'completed',
      faviconUrl: 'https://ui.shadcn.com/favicon.ico',
      source: 'GitHub',
      author: 'shadcn',
      collections: ['Useful GitHub Repos', 'Product Inspiration'],
      readingTimeMinutes: 6,
      suggestedStage: 'Building MVP',
      relevantProblem: 'Design Velocity',
      relevantSkill: 'Tailwind CSS',
      isOpenSource: true,
      githubRepo: 'shadcn-ui/ui',
      createdAt: '2026-08-21T16:00:00Z',
      updatedAt: '2026-08-21T16:00:00Z'
    },
    {
      id: 'sv-8',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      url: 'https://news.ycombinator.com/item?id=38421811',
      title: 'Show HN: How Dropbox Used Referral Loops to Grow from 100k to 4M Users',
      description: 'In-depth analysis of incentive design, viral coefficient math, and low-friction 2-sided sharing loops.',
      resourceType: 'article',
      category: 'Growth',
      tags: ['Viral Growth', 'Referrals', 'Experimentation', 'Growth Loops'],
      notes: 'Useful blueprint when designing referral experiment #3 next month.',
      priority: 'medium',
      status: 'unread',
      faviconUrl: 'https://news.ycombinator.com/favicon.ico',
      source: 'Hacker News',
      collections: ['Read Later', 'Marketing Ideas', 'Things To Try'],
      readingTimeMinutes: 10,
      suggestedStage: 'Growing',
      relevantProblem: 'Customer Acquisition',
      relevantSkill: 'Growth Loops',
      createdAt: '2026-08-23T10:00:00Z',
      updatedAt: '2026-08-23T10:00:00Z'
    },
    {
      id: 'sv-9',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      url: 'https://docs.cursor.com',
      title: 'Cursor IDE Documentation & Prompt Engineering Rules',
      description: 'Guide on .cursorrules and multi-file codebase indexing for AI-assisted software engineering.',
      resourceType: 'documentation',
      category: 'Development',
      tags: ['IDE', 'AI Coding', 'Productivity', 'Documentation'],
      notes: 'Adopted the custom .cursorrules file into our git root.',
      priority: 'low',
      status: 'completed',
      faviconUrl: 'https://cursor.com/favicon.ico',
      source: 'Cursor',
      collections: ['AI Tools', 'MVP Tools'],
      readingTimeMinutes: 15,
      suggestedStage: 'Building MVP',
      relevantProblem: 'Solo Developer Speed',
      relevantSkill: 'AI Prompting',
      createdAt: '2026-08-24T18:00:00Z',
      updatedAt: '2026-08-24T18:00:00Z'
    },
    {
      id: 'sv-10',
      userId: 'demo-user-1',
      startupId: 'pulseboard-demo',
      url: 'https://saasmetrics.co/pricing-models-for-bootstrappers',
      title: 'Pricing Strategy for Bootstrapped Micro-SaaS: From ₹0 to ₹1 Lakh MRR',
      description: 'Why you should never price at $5/month, value metrics selection, and how to grandfather early test users.',
      resourceType: 'article',
      category: 'Operations',
      tags: ['Pricing', 'Monetization', 'Unit Economics', 'Bootstrapping'],
      notes: 'Review before transitioning from free beta to our first paid ₹499/mo tier.',
      priority: 'high',
      status: 'reading',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=saasmetrics.co&sz=64',
      source: 'SaaS Metrics',
      author: 'Patrick Campbell',
      collections: ['Read Later', 'Fundraising'],
      readingTimeMinutes: 14,
      suggestedStage: 'First Revenue',
      relevantProblem: 'Pricing',
      relevantSkill: 'SaaS Pricing Strategy',
      createdAt: '2026-08-26T09:30:00Z',
      updatedAt: '2026-08-27T11:00:00Z',
      lastOpenedAt: '2026-08-27T11:00:00Z'
    }
  ],
  notes: INITIAL_FOUNDER_NOTES,
  noteCollections: DEFAULT_NOTEPAD_COLLECTIONS,
  copilotConversations: INITIAL_COPILOT_CONVERSATIONS,
  copilotMessages: INITIAL_COPILOT_MESSAGES,
  founderMemories: INITIAL_FOUNDER_MEMORIES
};


