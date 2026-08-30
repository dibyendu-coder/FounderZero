import {
  CopilotConversation,
  CopilotMessage,
  FounderMemory,
  CopilotMode
} from '../types';

export const SUGGESTED_COPILOT_PROMPTS = [
  {
    title: 'What should I focus on this week?',
    subtitle: 'Prioritize top high-leverage actions based on your bottleneck',
    mode: 'plan-week' as CopilotMode,
    icon: 'Target'
  },
  {
    title: 'Why might users be dropping off?',
    subtitle: 'Analyze retention metrics, customer quotes & onboarding friction',
    mode: 'default' as CopilotMode,
    icon: 'Activity'
  },
  {
    title: 'Help me validate this idea.',
    subtitle: 'Extract assumptions, non-obvious risks & Mom Test questions',
    mode: 'product-validation' as CopilotMode,
    icon: 'Sparkles'
  },
  {
    title: 'Review my pricing.',
    subtitle: 'Evaluate monetization tiers, value metric & willingness to pay',
    mode: 'decision-support' as CopilotMode,
    icon: 'DollarSign'
  },
  {
    title: 'Analyze my customer feedback.',
    subtitle: 'Synthesize recurring pain points, requests & contradictions',
    mode: 'feedback-analysis' as CopilotMode,
    icon: 'Users'
  },
  {
    title: 'Help me plan my MVP.',
    subtitle: 'Define thin vertical slices, technical architecture & ₹0 stack',
    mode: 'building-help' as CopilotMode,
    icon: 'Layers'
  },
  {
    title: 'Challenge my current strategy.',
    subtitle: 'Stress-test assumptions with an uncompromising Reality Check',
    mode: 'reality-check' as CopilotMode,
    icon: 'ShieldAlert'
  },
  {
    title: 'Turn this idea into an experiment.',
    subtitle: 'Structure a falsifiable hypothesis with measurable target metrics',
    mode: 'experiment-creator' as CopilotMode,
    icon: 'FlaskConical'
  }
];

export const INITIAL_FOUNDER_MEMORIES: FounderMemory[] = [
  {
    id: 'mem-1',
    userId: 'demo-user-1',
    startupId: 'startup-demo-user-1',
    category: 'target_icp',
    key: 'Primary ICP',
    value: 'Early-stage indie hackers and solo technical founders running micro-SaaS with <₹50k MRR',
    confidence: 'Proven',
    source: 'Customer Interview #1 (Rahul Sharma)',
    createdAt: '2026-08-27T10:00:00.000Z',
    updatedAt: '2026-08-27T10:00:00.000Z',
    confirmedByFounder: true
  },
  {
    id: 'mem-2',
    userId: 'demo-user-1',
    startupId: 'startup-demo-user-1',
    category: 'constraint',
    key: 'Zero-Burn Rule',
    value: 'Strictly zero paid advertising spend until Day-30 retention crosses 40% organically',
    confidence: 'Proven',
    source: 'Startup Health Reality Check',
    createdAt: '2026-08-25T14:30:00.000Z',
    updatedAt: '2026-08-25T14:30:00.000Z',
    confirmedByFounder: true
  },
  {
    id: 'mem-3',
    userId: 'demo-user-1',
    startupId: 'startup-demo-user-1',
    category: 'business_model',
    key: 'Pricing Floor',
    value: 'No $5/month pricing tiers. Minimum base tier set at ₹799/month ($19/mo) with grandfathered early-adopter pass',
    confidence: 'Proven',
    source: 'Founder Note: SaaS Pricing Architecture',
    createdAt: '2026-08-26T09:15:00.000Z',
    updatedAt: '2026-08-26T09:15:00.000Z',
    confirmedByFounder: true
  }
];

export const INITIAL_COPILOT_CONVERSATIONS: CopilotConversation[] = [
  {
    id: 'conv-retention',
    userId: 'demo-user-1',
    startupId: 'startup-demo-user-1',
    title: 'Diagnosing Day-7 Retention Drop-off',
    createdAt: '2026-08-29T14:30:00.000Z',
    updatedAt: '2026-08-29T15:10:00.000Z',
    pinned: true,
    lastMessagePreview: 'Based on your data: 41% of users return on Day 7. Focus on 1-click Discord digests rather than expanding analytics charts.',
    messagesCount: 4,
    mode: 'default',
    tags: ['Retention', 'Onboarding', 'Customer Feedback']
  },
  {
    id: 'conv-acquisition',
    userId: 'demo-user-1',
    startupId: 'startup-demo-user-1',
    title: 'First 100 Users Acquisition Plan',
    createdAt: '2026-08-28T11:00:00.000Z',
    updatedAt: '2026-08-28T11:45:00.000Z',
    pinned: false,
    lastMessagePreview: 'I have mapped 3 zero-budget distribution loops: Show HN teardown, IndieHackers milestone log, and developer Discord outreach.',
    messagesCount: 2,
    mode: 'brainstorm',
    tags: ['Distribution', 'Zero-Budget', 'Launch']
  },
  {
    id: 'conv-reality-check',
    userId: 'demo-user-1',
    startupId: 'startup-demo-user-1',
    title: 'Reality Check: Paid Meta Ads Test',
    createdAt: '2026-08-27T16:00:00.000Z',
    updatedAt: '2026-08-27T16:30:00.000Z',
    pinned: false,
    lastMessagePreview: 'I would not spend ₹50,000 on ads yet. Why: Your retention is currently 41% and CAC is uncalibrated.',
    messagesCount: 2,
    mode: 'reality-check',
    tags: ['Reality Check', 'Capital Efficiency', 'Ads']
  }
];

export const INITIAL_COPILOT_MESSAGES: Record<string, CopilotMessage[]> = {
  'conv-retention': [
    {
      id: 'msg-ret-1',
      conversationId: 'conv-retention',
      role: 'user',
      content: 'Why might users be dropping off after signing up?',
      timestamp: '2026-08-29T14:30:00.000Z',
      mode: 'default'
    },
    {
      id: 'msg-ret-2',
      conversationId: 'conv-retention',
      role: 'assistant',
      content: `### Evidence Summary

Based on your telemetry and customer interviews, users are dropping off because **the time-to-first-value is currently too long** (estimated at 6+ minutes), and founders forget to check manual web dashboards.

#### Based on your data:
- **Day-7 Retention**: 41% (Threshold for healthy SaaS is 55%+)
- **Activation Drop-off**: 52% of new signups abandon during API key insertion
- **Customer Interviews (4/5)**: Specifically requested daily automated digests into Discord / Telegram instead of having to log into another browser tab.

#### My Recommendation:
Do not build more charts or telemetry settings. Build an automated **1-click Discord / Telegram daily digest webhook** so the value lands directly in the founder's daily workflow.`,
      timestamp: '2026-08-29T14:30:05.000Z',
      mode: 'default',
      intent: 'diagnose_retention_bottleneck',
      retrievedContextSummary: [
        { category: 'metric', label: 'Day-7 Retention (41%)', count: 1 },
        { category: 'feedback', label: '5 Customer Interviews', count: 5 },
        { category: 'note', label: 'Customer Interview Notes: Rahul', count: 1 },
        { category: 'vault', label: 'SaaS Retention & Cohorts Guide', count: 1 }
      ],
      sources: [
        {
          type: 'metric',
          id: 'metric-retention',
          title: 'Day-7 Retention Rate',
          subtitle: 'Telemetry metric',
          value: '41.0%',
          route: 'metrics'
        },
        {
          type: 'feedback',
          id: 'fb-1',
          title: 'Customer Feedback: Rahul Sharma',
          subtitle: 'Wanted automated 1-click Discord summary',
          route: 'customers'
        },
        {
          type: 'note',
          id: 'note-1',
          title: 'Note: Customer Interview #1 – Rahul Sharma',
          subtitle: 'Pain point: Docker crash & overage fees',
          route: 'notepad'
        },
        {
          type: 'vault',
          id: 'vault-1',
          title: 'Saved Vault Resource: The SaaS Retention Playbook',
          subtitle: 'You saved this on Aug 24',
          route: 'vault'
        }
      ],
      evidenceBreakdown: {
        knownData: [
          { label: 'Day-7 Retention', value: '41.0%', sourceId: 'metric-retention' },
          { label: 'Customer Interviews', value: '5 completed (4 requested digests)', sourceId: 'fb-1' },
          { label: 'Monthly Revenue', value: '₹0 MRR', sourceId: 'profile' }
        ],
        founderAssumptions: [
          'Founders want a comprehensive 10-screen visual dashboard with custom filters'
        ],
        inferences: [
          'Push notifications via existing communication channels will double Day-7 return rate'
        ],
        generalKnowledge: [
          'Pushing value to user native workspaces (Slack/Discord) yields 2-3x higher engagement than pull web portals'
        ]
      },
      actionProposal: {
        id: 'prop-exp-1',
        type: 'create_experiment',
        title: 'Launch 1-Click Discord Retention Digest Experiment',
        description: 'Test whether delivering a daily 9 AM Discord digest increases Day-7 user retention from 41% to 55%.',
        status: 'pending',
        experimentData: {
          title: 'Automated Discord Digest Webhook vs Web Login',
          hypothesis: 'If we deliver daily telemetry snapshots directly into user Discord channels, then Day-7 retention will increase from 41% to 55% because users see value without browser friction.',
          problem: 'Users forget to bookmark and log into the standalone web dashboard daily.',
          metric: 'Day-7 Retention Rate',
          currentValue: '41.0%',
          targetValue: '55.0%',
          method: 'Enable opt-in webhook during onboarding for the next 50 signups',
          audience: 'Next 50 new signups',
          duration: '14 days',
          budget: '₹0'
        }
      }
    }
  ],
  'conv-reality-check': [
    {
      id: 'msg-rc-1',
      conversationId: 'conv-reality-check',
      role: 'user',
      content: 'Should I spend ₹50,000 on Meta and Google Ads to get 500 users faster?',
      timestamp: '2026-08-27T16:00:00.000Z',
      mode: 'reality-check'
    },
    {
      id: 'msg-rc-2',
      conversationId: 'conv-reality-check',
      role: 'assistant',
      content: `### Reality Check: REJECT PAID ADS FOR NOW

**I would not spend ₹50,000 on ads yet.**

#### Why:
1. **Retention is uncalibrated (41%)**: Pouring paid traffic into a leaky onboarding funnel burns capital with near-zero long-term LTV.
2. **CAC is unproven**: At an estimated ₹1,200 ad CAC, ₹50,000 yields ~40 signups, costing ₹1,200 per user while your current revenue per user is ₹0.
3. **You have not run a ₹0 organic distribution test first**: Organic channels (Show HN, Reddit build-in-public) yield higher-intent technical users for free.

#### Suggested Next Step:
Run a ₹0 community distribution experiment first. Acquire 50 users organically to calibrate onboarding before spending any advertising budget.`,
      timestamp: '2026-08-27T16:00:04.000Z',
      mode: 'reality-check',
      intent: 'reality_check_ads',
      retrievedContextSummary: [
        { category: 'profile', label: 'Monthly Budget: ₹2,000 / Revenue: ₹0', count: 1 },
        { category: 'health', label: 'Capital Efficiency: High Risk if spending on ads', count: 1 },
        { category: 'metric', label: 'Retention: 41%', count: 1 }
      ],
      sources: [
        {
          type: 'health',
          id: 'health-cap',
          title: 'Startup Health: Capital & Unit Economics',
          subtitle: 'Score: 62/100 • Needs Attention',
          route: 'health'
        },
        {
          type: 'metric',
          id: 'metric-retention',
          title: 'Day-7 Retention: 41%',
          subtitle: 'Below healthy benchmark',
          route: 'metrics'
        }
      ],
      evidenceBreakdown: {
        knownData: [
          { label: 'Current Monthly Revenue', value: '₹0 MRR' },
          { label: 'Monthly Budget', value: '₹2,000 / month' },
          { label: 'Proposed Spend', value: '₹50,000 (25x monthly budget)' }
        ],
        founderAssumptions: [
          'Paid ad traffic will convert at the same rate as organic founder-referred users'
        ],
        inferences: [
          'Ad spend without high Day-30 retention will deplete runway within 1 week'
        ],
        generalKnowledge: [
          'B2B dev tools with high organic word-of-mouth acquire their first 100 users via community launches, not paid Facebook banners'
        ]
      },
      actionProposal: {
        id: 'prop-rc-1',
        type: 'create_mission',
        title: 'Execute ₹0 Community Distribution Sprint',
        description: 'Ship 2 organic build-in-public breakdowns on Reddit (r/SideProject) and Show HN to secure 50 targeted signups at ₹0 CAC.',
        status: 'pending',
        missionData: {
          title: 'Acquire First 50 Organic Users via Community Teardown',
          category: 'Growth',
          objective: 'Validate onboarding conversion and acquire 50 qualified signups with zero ad spend.',
          whyItMatters: 'Establishes baseline organic conversion before risking capital.',
          estimatedTime: '4 hours',
          estimatedCost: '₹0',
          difficulty: 'Medium',
          expectedResult: '50 targeted signups and 10 qualitative feedback comments.',
          steps: [
            { id: 's1', text: 'Draft Show HN title and transparent technical architecture note', completed: false },
            { id: 's2', text: 'Share interactive sandbox demo link requiring zero signup password', completed: false },
            { id: 's3', text: 'Reply to every comment within 5 minutes and capture feature objections', completed: false }
          ]
        }
      }
    }
  ],
  'conv-acquisition': [
    {
      id: 'msg-acq-1',
      conversationId: 'conv-acquisition',
      role: 'user',
      content: 'Give me 10 ways to acquire my first 100 users for PulseBoard.',
      timestamp: '2026-08-28T11:00:00.000Z',
      mode: 'brainstorm'
    },
    {
      id: 'msg-acq-2',
      conversationId: 'conv-acquisition',
      role: 'assistant',
      content: `### 10 Tailored Acquisition Channels for PulseBoard (₹0 Budget)

Given your target ICP (**indie developers & bootstrapped SaaS founders**), technical skills (**React + Node**), and budget (**₹0**), here are 10 concrete, non-generic channels:

1. **Show HN Architecture Breakdown**: Post a detailed breakdown titled: *"Show HN: How I built a zero-bloat retention tracker for ₹0 server cost"*. Developers love technical transparency.
2. **Interactive Live Demo Sandbox**: Remove signup friction on the landing page so visitors test dummy data with 1 click.
3. **Curated Open Source GitHub Repo**: Release a lightweight client SDK repo on GitHub (e.g., \`pulseboard-react\`) and list it in awesome-saas directories.
4. **IndieHackers Milestone Log**: Post your daily learnings and Day-7 retention metrics on IndieHackers.
5. **Direct Founder DM Outreach**: Message 20 founders on X/Twitter who recently launched on ProductHunt and ask: *"How are you tracking day-7 dropoff?"*
6. **Free Micro-Tool: SaaS Retention Calculator**: Launch a 1-page free calculator estimating revenue lost to churn.
7. **Discord & Slack Community Value Posts**: Share teardowns of high-churn SaaS onboarding in communities like MicroConf and Indie Worldwide.
8. **ProductHunt Launch Sprint**: Schedule a Tuesday launch focusing on the pain of bloated $300/mo analytics tools.
9. **Founder-to-Founder Lifetime Discount**: Offer a permanent 40% discount code (\`FOUNDER40\`) to the first 50 users who complete an onboarding call.
10. **Engineering as Marketing**: Write a high-ranking technical guide on *"Why PostgreSQL Window Functions are all you need for Cohort Analytics"*.`,
      timestamp: '2026-08-28T11:00:05.000Z',
      mode: 'brainstorm',
      retrievedContextSummary: [
        { category: 'profile', label: 'PulseBoard (Validating, B2B SaaS)', count: 1 },
        { category: 'note', label: 'Show HN Launch Plan', count: 1 },
        { category: 'vault', label: '14 Saved Developer Tools & Repos', count: 1 }
      ],
      sources: [
        {
          type: 'profile',
          id: 'prof-1',
          title: 'Startup Profile: PulseBoard',
          subtitle: 'Category: Developer Tools • ICP: Indie Founders',
          route: 'profile'
        },
        {
          type: 'note',
          id: 'note-5',
          title: 'Note: Show HN Launch Plan',
          subtitle: 'In Collection: Marketing',
          route: 'notepad'
        }
      ],
      evidenceBreakdown: {
        knownData: [
          { label: 'Target ICP', value: 'Indie developers and micro-SaaS builders' },
          { label: 'Founder Superpowers', value: 'Autonomous AI workflows & rapid MVP shipping' },
          { label: 'Available Budget', value: '₹0 (Zero-burn strategy)' }
        ],
        founderAssumptions: [
          'Indie developers actively seek alternatives to expensive Mixpanel/PostHog plans'
        ],
        inferences: [
          'Transparent open-source style distribution will outperform standard sales pitches by 5x'
        ],
        generalKnowledge: [
          'Technical founders buy from peers who provide engineering insights and free utilities'
        ]
      },
      actionProposal: {
        id: 'prop-acq-note',
        type: 'notepad_draft',
        title: 'Save Acquisition Action Plan to Notepad',
        description: 'Save these 10 prioritized acquisition channels directly into your "Marketing" collection in Founder Notepad.',
        status: 'pending',
        draftNote: {
          title: 'PulseBoard 10-Channel Acquisition Playbook',
          collection: 'Marketing',
          tags: ['Acquisition', 'Growth', 'Launch', 'Zero-Budget'],
          blocks: [
            {
              id: 'b1',
              type: 'callout',
              content: '🎯 **Acquisition Rule**: Execute 2 channels deeply before testing channel #3. Do not spread effort thinly across 10 channels at once.',
              calloutVariant: 'founder'
            },
            {
              id: 'b2',
              type: 'heading2',
              content: 'Top Priority 0-to-1 Distribution Channels'
            },
            {
              id: 'b3',
              type: 'checklist',
              content: 'Channel 1: Show HN technical architecture post with live sandbox demo',
              checked: false
            },
            {
              id: 'b4',
              type: 'checklist',
              content: 'Channel 2: Free SaaS Retention Calculator micro-tool',
              checked: false
            },
            {
              id: 'b5',
              type: 'checklist',
              content: 'Channel 3: 20 Direct founder outreach DMs on X offering FOUNDER40 code',
              checked: false
            }
          ]
        }
      }
    }
  ]
};
