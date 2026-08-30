import { FounderNote, NoteTemplate } from '../types';

export const DEFAULT_NOTEPAD_COLLECTIONS: string[] = [
  'Ideas',
  'Product',
  'Customers',
  'Research',
  'Marketing',
  'Growth',
  'Experiments',
  'Meetings',
  'Strategy',
  'Technical',
  'Fundraising',
  'Personal'
];

export const NOTEPAD_TEMPLATES: NoteTemplate[] = [
  {
    id: 'startup-idea',
    name: 'Startup Idea',
    category: 'Ideation',
    description: 'Structure problem clarity, ICP, why now, assumptions, and initial risks.',
    icon: 'Lightbulb',
    defaultTitle: 'New Venture: [Idea Name]',
    defaultCollection: 'Ideas',
    defaultTags: ['Ideation', 'Validation', 'Why Now'],
    blocks: [
      {
        type: 'callout',
        content: '💡 **Zero-Budget Principle**: Do not build software until at least 3 people confirm the problem costs them real time or money.',
        calloutVariant: 'idea'
      },
      { type: 'heading2', content: '1. Problem Statement' },
      { type: 'paragraph', content: 'What specific, painful bottleneck are people experiencing right now? Why is the current workaround inadequate?' },
      { type: 'heading2', content: '2. Target Customer (ICP)' },
      { type: 'paragraph', content: 'Who feels this problem most intensely? (e.g. Solo SaaS founders with 1-5 products, bootstrapping on zero budget).' },
      { type: 'heading2', content: '3. Proposed Solution' },
      { type: 'paragraph', content: 'What is the minimal viable solution that eliminates 80% of the pain with 20% of the effort?' },
      { type: 'heading2', content: '4. Why Now?' },
      { type: 'paragraph', content: 'What technological shift, economic condition, or behavioral change makes this feasible and urgent today?' },
      { type: 'heading2', content: '5. Direct Competitors & Existing Alternatives' },
      {
        type: 'table',
        content: '',
        tableData: {
          headers: ['Competitor / Workaround', 'Pricing', 'Key Weakness / Gap', 'Our 10x Wedge'],
          rows: [
            ['Manual Spreadsheets / Notion', 'Free', 'No automated telemetry or real-time triggers', 'One-click automated tracking'],
            ['Heavy Enterprise SaaS', '₹15,000+/mo', 'Over-engineered, steep learning curve', '10-minute setup, 100% free tier']
          ]
        }
      },
      { type: 'heading2', content: '6. Riskiest Assumptions to Test' },
      { type: 'checklist', content: 'Assumption 1: Target customers are actively searching for a lighter alternative', checked: false },
      { type: 'checklist', content: 'Assumption 2: Users will install our lightweight snippet within 10 minutes', checked: false },
      { type: 'checklist', content: 'Assumption 3: Retention is driven by weekly summary digest emails', checked: false },
      { type: 'heading2', content: '7. Open Questions' },
      { type: 'bulletList', content: 'What is the fastest non-code way to validate customer demand this week?' },
      { type: 'bulletList', content: 'What is the primary organic acquisition loop for this category?' }
    ]
  },
  {
    id: 'customer-interview',
    name: 'Customer Interview',
    category: 'Validation',
    description: 'Mom Test-compliant customer discovery template focused on past behaviors.',
    icon: 'Users',
    defaultTitle: 'Customer Interview: [Customer Name / Role]',
    defaultCollection: 'Customers',
    defaultTags: ['Mom Test', 'Interviews', 'Discovery'],
    blocks: [
      {
        type: 'callout',
        content: '🎙️ **Mom Test Rule**: Ask about their actual past behavior, never their opinions or promises about the future.',
        calloutVariant: 'founder'
      },
      { type: 'heading2', content: 'Interview Metadata' },
      { type: 'paragraph', content: '**Customer Name / Handle**: Rahul Sharma (@rahul_builds)\n**Role / Company**: Solo Founder at DevDash\n**Date & Duration**: 2026-08-28 (25 mins)\n**Customer Archetype**: Bootstrapped Indie Hacker' },
      { type: 'heading2', content: '1. The Core Problem & Context' },
      { type: 'paragraph', content: 'How do you currently track your active user retention and cohort drop-offs?' },
      { type: 'heading2', content: '2. Current Workaround & Tools' },
      { type: 'paragraph', content: 'What tools are you using right now to solve this? How much time or money does it cost you?' },
      { type: 'heading2', content: '3. Specific Pain Points' },
      { type: 'bulletList', content: 'Mixpanel free tier ran out of MTUs quickly and pricing jumped to $200/mo.' },
      { type: 'bulletList', content: 'PostHog self-host setup took 4 hours and broke during database migration.' },
      { type: 'heading2', content: '4. Verbatim Customer Quotes' },
      { type: 'quote', content: '"I just want a single page dashboard that tells me which cohort is churning without having to write SQL queries every Sunday morning."' },
      { type: 'heading2', content: '5. Key Insights & Surprises' },
      { type: 'paragraph', content: 'Rahul does not care about complex funnels; he exclusively wants 14-day return rates sent to his Telegram or Discord bot.' },
      { type: 'heading2', content: '6. Follow-up Actions' },
      { type: 'checklist', content: 'Send Rahul early access build with Discord webhook alert trigger', checked: false },
      { type: 'checklist', content: 'Turn webhook notification into an experiment hypothesis', checked: true }
    ]
  },
  {
    id: 'product-idea',
    name: 'Product Idea',
    category: 'Product',
    description: 'Define lean feature spec, user stories, success metrics, and failure modes.',
    icon: 'Layers',
    defaultTitle: 'Feature Spec: [Feature Name]',
    defaultCollection: 'Product',
    defaultTags: ['Feature Spec', 'MVP', 'UX'],
    blocks: [
      {
        type: 'callout',
        content: '⚡ **Product Craft**: Ship thin vertical slices. A single working endpoint + UI beats 5 half-finished tabs.',
        calloutVariant: 'info'
      },
      { type: 'heading2', content: '1. Problem & User Need' },
      { type: 'paragraph', content: 'Users are dropping off during day-3 because they forget to review their initial baseline retention scorecard.' },
      { type: 'heading2', content: '2. Proposed Solution' },
      { type: 'paragraph', content: 'Automated 1-click weekly email digest with 3 core retention numbers and a single priority action recommendation.' },
      { type: 'heading2', content: '3. User Story & Flow' },
      { type: 'paragraph', content: '**As a** solo SaaS builder,\n**I want to** receive an automated Monday morning health audit in my inbox,\n**So that** I know exactly which feature bottleneck to fix without opening 5 dashboards.' },
      { type: 'heading2', content: '4. Success Metric (Objective)' },
      { type: 'checklist', content: 'Email open rate > 55% within 48 hours of dispatch', checked: false },
      { type: 'checklist', content: 'Click-through rate to dashboard > 28%', checked: false },
      { type: 'heading2', content: '5. Technical Architecture & Zero-Cost Stack' },
      { type: 'code', content: '// Scheduled cron edge function using free Resend tier\nexport async function sendWeeklyDigest(founderId: string) {\n  const metrics = await getFounderWeeklyMetrics(founderId);\n  await resend.emails.send({\n    from: "digest@pulseboard.dev",\n    to: metrics.founderEmail,\n    subject: `Weekly Pulse: ${metrics.retentionPct}% 30-day retention`,\n    html: renderEmailTemplate(metrics)\n  });\n}', language: 'typescript' },
      { type: 'heading2', content: '6. Key Risks & Edge Cases' },
      { type: 'bulletList', content: 'Spam folder delivery if domain DKIM/SPF is not warmed up.' },
      { type: 'bulletList', content: 'Empty digest state if user logged zero events this week.' }
    ]
  },
  {
    id: 'experiment',
    name: 'Experiment',
    category: 'Growth',
    description: 'Scientific growth experiment documentation with baseline, hypothesis, and learnings.',
    icon: 'Flame',
    defaultTitle: 'Experiment: [Hypothesis Title]',
    defaultCollection: 'Experiments',
    defaultTags: ['Experiment', 'Growth', 'Conversion'],
    blocks: [
      {
        type: 'callout',
        content: '🧪 **Scientific Rigor**: A failed experiment with deep learning is 10x more valuable than a vanity win.',
        calloutVariant: 'warning'
      },
      { type: 'heading2', content: '1. Hypothesis' },
      { type: 'paragraph', content: 'If we reduce the onboarding setup from 5 configuration screens to a 1-click demo seed, then visitor-to-activated-user conversion will increase from 18% to 35%.' },
      { type: 'heading2', content: '2. Metrics & Guardrails' },
      {
        type: 'table',
        content: '',
        tableData: {
          headers: ['Metric', 'Baseline', 'Target', 'Result'],
          rows: [
            ['Onboarding Completion Rate', '18.2%', '35.0%', '41.4% (Win)'],
            ['Time to First Value', '12 mins', '< 2 mins', '1.4 mins'],
            ['Day-7 Return Rate (Guardrail)', '24%', '> 30%', '33%']
          ]
        }
      },
      { type: 'heading2', content: '3. Execution Details' },
      { type: 'paragraph', content: '**Sample Audience**: Next 100 new visitor signups\n**Duration**: 7 calendar days\n**Estimated Cost**: ₹0 (custom client-side state preview)\n**Status**: Completed' },
      { type: 'heading2', content: '4. Learnings & Qualitative Notes' },
      { type: 'quote', content: '"Users who explored sample data before connecting their live database had a 2.3x higher conversion to our paid tier."' },
      { type: 'heading2', content: '5. Next Immediate Step' },
      { type: 'checklist', content: 'Make the interactive demo state the default landing experience for all traffic', checked: true }
    ]
  },
  {
    id: 'competitor-research',
    name: 'Competitor Research',
    category: 'Strategy',
    description: 'Analyze competitors, pricing tiers, strengths, weaknesses, and asymmetric advantages.',
    icon: 'Compass',
    defaultTitle: 'Competitor Intel: [Competitor Name]',
    defaultCollection: 'Research',
    defaultTags: ['Competitor Intel', 'Pricing', 'Moat'],
    blocks: [
      { type: 'heading2', content: '1. Competitor Overview' },
      { type: 'paragraph', content: '**Company**: MetricFly SaaS\n**Founding / Stage**: Series A ($4M raised)\n**Target Customer**: Mid-market marketing agencies (20-100 employees)\n**Core Value Prop**: Multi-channel attribution modeling and automated client reporting.' },
      { type: 'heading2', content: '2. Pricing Structure & Tiers' },
      { type: 'bulletList', content: 'Starter: $99/mo (up to 5,000 monthly events)' },
      { type: 'bulletList', content: 'Pro: $299/mo (up to 50,000 monthly events)' },
      { type: 'bulletList', content: 'Enterprise: $899/mo (custom SLAs and SSO)' },
      { type: 'heading2', content: '3. Key Strengths & What They Do Well' },
      { type: 'bulletList', content: 'Polished white-label PDF client report exports.' },
      { type: 'bulletList', content: 'Strong HubSpot and Salesforce native CRM integrations.' },
      { type: 'heading2', content: '4. Critical Weaknesses & Customer Complaints' },
      { type: 'bulletList', content: 'Pricing is punitive for early-stage bootstrapped builders.' },
      { type: 'bulletList', content: 'Dashboard loads in >4.5 seconds with heavy Webpack bundles.' },
      { type: 'bulletList', content: 'Customer support takes 48+ hours for basic bug tickets.' },
      { type: 'heading2', content: '5. Our Asymmetric Wedge / Differentiation' },
      {
        type: 'callout',
        content: '🎯 **Our Advantage**: We are 100% focused on the solo builder who needs sub-second load times, instant local previews, and ₹0 tier that never expires.',
        calloutVariant: 'success'
      }
    ]
  },
  {
    id: 'weekly-founder-review',
    name: 'Weekly Founder Review',
    category: 'Strategy',
    description: 'Weekly reflection on wins, bottlenecks, metrics, customer conversations, and priorities.',
    icon: 'Calendar',
    defaultTitle: 'Weekly Review: Week of [Date]',
    defaultCollection: 'Strategy',
    defaultTags: ['Weekly Review', 'Cadence', 'Metrics'],
    blocks: [
      {
        type: 'callout',
        content: '🧭 **Focus Anchor**: Review what did NOT work just as rigorously as what did. Eliminate vanity work.',
        calloutVariant: 'founder'
      },
      { type: 'heading2', content: '1. High-Impact Wins This Week' },
      { type: 'bulletList', content: 'Shipped zero-budget OpenCode terminal workflow integration.' },
      { type: 'bulletList', content: 'Conducted 3 customer discovery interviews with solo developers.' },
      { type: 'bulletList', content: 'Reached ₹8,400 monthly recurring revenue from 4 early annual subscribers.' },
      { type: 'heading2', content: '2. Major Bottlenecks & Problems' },
      { type: 'paragraph', content: 'Signups from Twitter/X threads are dropping off when asked for email verification before exploring the product.' },
      { type: 'heading2', content: '3. Core North Star Metrics' },
      {
        type: 'table',
        content: '',
        tableData: {
          headers: ['Metric', 'Last Week', 'This Week', 'Trend'],
          rows: [
            ['Active Users', '108', '127', '+17.5%'],
            ['Monthly Burn', '₹1,850', '₹1,920', 'Flat / Safe'],
            ['Monthly Revenue', '₹6,200', '₹8,400', '+35.4%'],
            ['Health Audit Score', '74/100', '78/100', '+4 pts']
          ]
        }
      },
      { type: 'heading2', content: '4. Key Customer Insights & Quotes' },
      { type: 'quote', content: '"If you let me test the playground without creating an account first, I would have shared it with my entire co-working space immediately."' },
      { type: 'heading2', content: '5. Non-Negotiable Priorities for Next Week' },
      { type: 'checklist', content: 'Enable zero-signup interactive sandbox preview on landing page', checked: false },
      { type: 'checklist', content: 'Publish technical teardown article on Hacker News / Substack', checked: false },
      { type: 'checklist', content: 'Interview 2 churned test accounts to understand drop-off reasons', checked: false }
    ]
  }
];

export const INITIAL_FOUNDER_NOTES: FounderNote[] = [
  {
    id: 'note-1',
    title: 'Customer Discovery: Rahul on Analytics Bottlenecks',
    collection: 'Customers',
    tags: ['Customer Discovery', 'Mom Test', 'Interviews', 'Rahul'],
    isFavorite: true,
    isPinned: true,
    includeInKnowledgeBase: true,
    createdAt: '2026-08-27T10:15:00.000Z',
    updatedAt: '2026-08-28T14:30:00.000Z',
    lastViewedAt: '2026-08-29T18:00:00.000Z',
    connections: [
      {
        entityType: 'mission',
        entityId: 'm-1',
        entityTitle: 'Conduct 5 Problem Interviews',
        entitySubtitle: 'Customer Validation Mission'
      },
      {
        entityType: 'experiment',
        entityId: 'exp-1',
        entityTitle: 'Interactive Demo Sandbox Onboarding',
        entitySubtitle: 'Growth Experiment'
      },
      {
        entityType: 'resource',
        entityId: 'res-mom-test',
        entityTitle: 'The Mom Test Framework Guide',
        entitySubtitle: 'Founder Vault Resource'
      }
    ],
    blocks: [
      {
        id: 'n1-b1',
        type: 'callout',
        content: '🎙️ **Interview Summary**: Rahul validated our assumption that indie hackers find traditional analytics setups painful and expensive. He wants a 1-click Discord digest.',
        calloutVariant: 'idea'
      },
      { id: 'n1-b2', type: 'heading2', content: 'Interview Details' },
      { id: 'n1-b3', type: 'paragraph', content: '**Interviewee**: Rahul Sharma (Founder @ DevDash)\n**Date**: August 27, 2026\n**Duration**: 28 minutes\n**Problem Intensity**: 9/10 (High urgency)' },
      { id: 'n1-b4', type: 'heading2', content: 'Key Pain Points Uncovered' },
      { id: 'n1-b5', type: 'bulletList', content: 'Set up PostHog self-hosted instance on Hetzner, but Docker containers crashed twice and ate 6 hours of debug time.' },
      { id: 'n1-b6', type: 'bulletList', content: 'Mixpanel charged him surprise overage fees after a Hacker News frontpage spike.' },
      { id: 'n1-b7', type: 'bulletList', content: 'He only cares about 2 numbers: "How many people returned on Day 7?" and "Which feature generated the first payment?"' },
      { id: 'n1-b8', type: 'heading2', content: 'Verbatim Quote' },
      { id: 'n1-b9', type: 'quote', content: '"I don\'t need 40 graphs. Give me 3 numbers on my phone at 9 AM every Monday and tell me which feature is bleeding users."' },
      { id: 'n1-b10', type: 'heading2', content: 'Next Immediate Actions' },
      { id: 'n1-b11', type: 'checklist', content: 'Prototype automated Telegram / Discord digest webhook', checked: true },
      { id: 'n1-b12', type: 'checklist', content: 'Interview 10 potential customers before Friday with zero pitch bias', checked: false }
    ]
  },
  {
    id: 'note-2',
    title: 'Pricing Strategy: ₹0 to ₹1 Lakh MRR Roadmap',
    collection: 'Strategy',
    tags: ['Pricing', 'Monetization', 'Unit Economics', 'Bootstrapping'],
    isFavorite: true,
    isPinned: false,
    includeInKnowledgeBase: true,
    createdAt: '2026-08-25T11:00:00.000Z',
    updatedAt: '2026-08-27T16:20:00.000Z',
    lastViewedAt: '2026-08-28T09:15:00.000Z',
    connections: [
      {
        entityType: 'metric',
        entityId: 'm-revenue',
        entityTitle: 'Monthly Recurring Revenue',
        entitySubtitle: 'Current: ₹8,400/mo'
      },
      {
        entityType: 'goal',
        entityId: 'goal-90',
        entityTitle: 'Reach ₹25,000 MRR & 300 active users',
        entitySubtitle: '90-Day North Star Target'
      }
    ],
    blocks: [
      {
        id: 'n2-b1',
        type: 'callout',
        content: '💰 **Pricing Rule**: Never price at $5/month. Low prices attract support-heavy customers while generating insufficient revenue to fund operations.',
        calloutVariant: 'founder'
      },
      { id: 'n2-b2', type: 'heading2', content: 'Tier Structure for Bootstrapped SaaS' },
      {
        id: 'n2-b3',
        type: 'table',
        content: '',
        tableData: {
          headers: ['Plan', 'Price (INR)', 'Limits', 'Target ICP'],
          rows: [
            ['Solo Free Tier', '₹0 / forever', '1,000 monthly active users, 1 project', 'Early builders & hobbyists'],
            ['Indie Pro', '₹999 / month', '25,000 monthly active users, AI telemetry', 'Solo full-time SaaS founders'],
            ['Growth Team', '₹2,999 / month', '100,000 users, team seats, Discord bot', 'Fast-growing micro-startups']
          ]
        }
      },
      { id: 'n2-b4', type: 'heading2', content: 'Grandfathering Strategy for Alpha Users' },
      { id: 'n2-b5', type: 'paragraph', content: 'The first 50 users who give qualitative feedback will receive a permanent 40% lifetime discount code (`FOUNDER40`). This creates goodwill and incentivizes rigorous user feedback loops.' },
      { id: 'n2-b6', type: 'heading2', content: 'Paywall Triggers' },
      { id: 'n2-b7', type: 'bulletList', content: 'Trigger 1: Generating custom automated cohort retention summaries.' },
      { id: 'n2-b8', type: 'bulletList', content: 'Trigger 2: Connecting more than 2 production domains or mobile apps.' }
    ]
  },
  {
    id: 'note-3',
    title: 'Experiment Hypothesis: 1-Click Onboarding Sandbox',
    collection: 'Experiments',
    tags: ['Experiment', 'Onboarding', 'Activation', 'Hypothesis'],
    isFavorite: false,
    isPinned: false,
    includeInKnowledgeBase: true,
    createdAt: '2026-08-24T14:00:00.000Z',
    updatedAt: '2026-08-26T18:45:00.000Z',
    connections: [
      {
        entityType: 'experiment',
        entityId: 'exp-onboarding',
        entityTitle: 'Interactive Demo Sandbox Onboarding',
        entitySubtitle: 'Status: Running'
      }
    ],
    blocks: [
      { id: 'n3-b1', type: 'heading2', content: 'Hypothesis Statement' },
      { id: 'n3-b2', type: 'paragraph', content: 'I think reducing onboarding from 5 steps to 3 will improve visitor activation from 18% to 35% within the first session.' },
      { id: 'n3-b3', type: 'heading2', content: 'Key Assumptions' },
      { id: 'n3-b4', type: 'bulletList', content: 'Visitors want to see real charts with sample numbers before investing time inserting our tracking script.' },
      { id: 'n3-b5', type: 'bulletList', content: 'Mandatory password creation creates friction that causes 45% drop-off on screen 2.' },
      { id: 'n3-b6', type: 'heading2', content: 'Test Implementation' },
      { id: 'n3-b7', type: 'code', content: '// Immediate demo state toggle\nconst [isSandboxMode, setIsSandboxMode] = useState(true);\n\nexport function OnboardingHero() {\n  return (\n    <div className="sandbox-banner">\n      <p>Exploring live simulated SaaS data. Click "Connect Live App" when ready.</p>\n    </div>\n  );\n}', language: 'typescript' }
    ]
  },
  {
    id: 'note-4',
    title: 'Zero-Budget Tech Stack & Architecture Notes',
    collection: 'Technical',
    tags: ['Architecture', 'Zero-Burn', 'Supabase', 'Tailwind', 'AI Agents'],
    isFavorite: false,
    isPinned: false,
    includeInKnowledgeBase: true,
    createdAt: '2026-08-22T09:00:00.000Z',
    updatedAt: '2026-08-25T11:30:00.000Z',
    connections: [
      {
        entityType: 'startup',
        entityId: 'pulseboard-demo',
        entityTitle: 'PulseBoard Architecture',
        entitySubtitle: 'Zero-Burn Production Stack'
      }
    ],
    blocks: [
      {
        id: 'n4-b1',
        type: 'callout',
        content: '⚡ **Zero-Burn Architecture**: Free tiers only. No AWS RDS, no paid Redis, no expensive monthly SaaS.',
        calloutVariant: 'success'
      },
      { id: 'n4-b2', type: 'heading2', content: 'Core Infrastructure Breakdown' },
      { id: 'n4-b3', type: 'bulletList', content: '**Frontend & Edge**: React 18 + Vite deployed on Cloud Run / Vercel Free.' },
      { id: 'n4-b4', type: 'bulletList', content: '**Database**: Supabase / Firestore with Row-Level Security.' },
      { id: 'n4-b5', type: 'bulletList', content: '**Autonomous Coding**: OpenCode terminal agent & Cline with Claude 3.5 Sonnet / Gemini Flash.' },
      { id: 'n4-b6', type: 'bulletList', content: '**Telemetry & Analytics**: PostHog Free Tier (up to 1M events/month).' }
    ]
  },
  {
    id: 'note-5',
    title: 'Hacker News Launch Playbook & Organic Loops',
    collection: 'Marketing',
    tags: ['Show HN', 'Distribution', 'Organic Growth', 'Launch'],
    isFavorite: true,
    isPinned: false,
    includeInKnowledgeBase: true,
    createdAt: '2026-08-20T16:00:00.000Z',
    updatedAt: '2026-08-23T12:00:00.000Z',
    blocks: [
      { id: 'n5-b1', type: 'heading2', content: 'Show HN Title Ideas' },
      { id: 'n5-b2', type: 'bulletList', content: 'Show HN: PulseBoard – Lightweight SaaS retention tracking with zero bloat and ₹0 burn' },
      { id: 'n5-b3', type: 'bulletList', content: 'Show HN: I got tired of heavy analytics setups, so I built a 1-file telemetry dashboard' },
      { id: 'n5-b4', type: 'heading2', content: 'Core Rules for HN Success' },
      { id: 'n5-b5', type: 'paragraph', content: '1. No marketing fluff or corporate jargon.\n2. Include a direct live demo link that requires zero login.\n3. Reply to every comment within 5 minutes with technical honesty.' }
    ]
  }
];
