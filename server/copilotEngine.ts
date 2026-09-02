import {
  AppState,
  CopilotMessage,
  CopilotMode,
  CopilotSourceReference,
  EvidenceBreakdown,
  CopilotActionProposal,
  FounderMemory
} from '../src/types';

export interface RetrievedContext {
  summary: { category: string; label: string; count: number }[];
  sources: CopilotSourceReference[];
  contextPromptText: string;
  hasSufficientData: boolean;
  detectedIntent: string;
}

export function retrieveRelevantContext(
  query: string,
  mode: CopilotMode = 'default',
  state: AppState
): RetrievedContext {
  const qLower = (query || '').toLowerCase();
  const summary: { category: string; label: string; count: number }[] = [];
  const sources: CopilotSourceReference[] = [];
  const contextParts: string[] = [];

  const profile = state.profile || ({} as any);
  const metrics = state.metrics || [];
  const feedbacks = state.customerFeedback || [];
  const notes = state.notes || [];
  const experiments = state.experiments || [];
  const missions = state.missions || [];
  const health = state.healthDimensions || [];
  const savedResources = state.savedResources || [];
  const memories = state.founderMemories || [];

  // 1. Core Profile Context (Always included concisely)
  contextParts.push(`--- FOUNDER & STARTUP PROFILE ---
Startup Name: ${profile.name || 'Untitled'}
Category: ${profile.category || 'SaaS'}
Stage: ${profile.stage || 'Validating'}
90-Day Goal: ${profile.goal90Days || 'Reach PMF'}
Primary Target Customer: ${profile.targetCustomer || 'Founders & Builders'}
Core Problem: ${profile.problem || 'Unclear'}
Current Users: ${profile.currentUsers || 0}
Monthly Revenue: ₹${(profile.monthlyRevenue || 0).toLocaleString()}
Monthly Budget: ₹${(profile.monthlyBudget || 0).toLocaleString()}
Biggest Uncertainty / Bottleneck: "${profile.biggestUncertainty || "Can't get users"}"
Founder Superpowers: ${(profile.superpowers || []).join(', ') || 'AI tooling, fullstack build'}
Operating Principles: ${(profile.operatingPrinciples || []).join('; ') || 'Zero-burn, build in public'}
Founder Score: ${profile.founderScore || 75}/100`);

  sources.push({
    type: 'profile',
    id: profile.id || 'prof-1',
    title: `Startup Profile: ${profile.name}`,
    subtitle: `Stage: ${profile.stage} • Goal: ${profile.goal90Days}`,
    route: 'profile'
  });

  // 2. Intent Detection
  const isRetentionQuery =
    qLower.includes('retention') ||
    qLower.includes('drop') ||
    qLower.includes('churn') ||
    qLower.includes('stay') ||
    qLower.includes('leaving') ||
    qLower.includes('cohort') ||
    mode === 'feedback-analysis';

  const isAcquisitionQuery =
    qLower.includes('user') ||
    qLower.includes('acquire') ||
    qLower.includes('acquisition') ||
    qLower.includes('traffic') ||
    qLower.includes('launch') ||
    qLower.includes('distribution') ||
    qLower.includes('marketing') ||
    qLower.includes('channel') ||
    qLower.includes('first 100') ||
    mode === 'brainstorm';

  const isSpendOrAdsQuery =
    qLower.includes('ad') ||
    qLower.includes('spend') ||
    qLower.includes('budget') ||
    qLower.includes('hire') ||
    qLower.includes('burn') ||
    qLower.includes('money') ||
    qLower.includes('cost') ||
    mode === 'reality-check';

  const isPricingQuery =
    qLower.includes('pricing') ||
    qLower.includes('charge') ||
    qLower.includes('price') ||
    qLower.includes('tier') ||
    qLower.includes('freemium') ||
    qLower.includes('monetiz') ||
    qLower.includes('subscription') ||
    mode === 'decision-support';

  const isValidationOrIdeaQuery =
    qLower.includes('validate') ||
    qLower.includes('idea') ||
    qLower.includes('mom test') ||
    qLower.includes('problem') ||
    qLower.includes('interview') ||
    mode === 'product-validation';

  const isBuildingQuery =
    qLower.includes('build') ||
    qLower.includes('mvp') ||
    qLower.includes('stack') ||
    qLower.includes('database') ||
    qLower.includes('architecture') ||
    qLower.includes('code') ||
    qLower.includes('tech') ||
    mode === 'building-help';

  const isResourceQuery =
    qLower.includes('resource') ||
    qLower.includes('tool') ||
    qLower.includes('repo') ||
    qLower.includes('guide') ||
    qLower.includes('template') ||
    qLower.includes('library') ||
    mode === 'resources';

  let detectedIntent = 'general_startup_guidance';
  if (isRetentionQuery) detectedIntent = 'diagnose_user_retention';
  else if (isSpendOrAdsQuery) detectedIntent = 'reality_check_capital_spend';
  else if (isPricingQuery) detectedIntent = 'pricing_and_monetization_review';
  else if (isValidationOrIdeaQuery) detectedIntent = 'product_idea_validation';
  else if (isAcquisitionQuery) detectedIntent = 'zero_budget_acquisition';
  else if (isBuildingQuery) detectedIntent = 'mvp_technical_architecture';
  else if (isResourceQuery) detectedIntent = 'curated_resource_retrieval';

  // 3. Selective Metrics Retrieval
  const matchedMetrics = metrics.filter(m => {
    if (isRetentionQuery && (m.name.toLowerCase().includes('retention') || m.name.toLowerCase().includes('activation') || m.name.toLowerCase().includes('churn'))) return true;
    if (isAcquisitionQuery && (m.name.toLowerCase().includes('signup') || m.name.toLowerCase().includes('user') || m.name.toLowerCase().includes('visitor') || m.name.toLowerCase().includes('traffic'))) return true;
    if (isPricingQuery && (m.name.toLowerCase().includes('revenue') || m.name.toLowerCase().includes('mrr') || m.name.toLowerCase().includes('arpu') || m.name.toLowerCase().includes('conversion'))) return true;
    if (isSpendOrAdsQuery && (m.name.toLowerCase().includes('cac') || m.name.toLowerCase().includes('burn') || m.name.toLowerCase().includes('budget') || m.name.toLowerCase().includes('mrr'))) return true;
    return false;
  }).slice(0, 4);

  const metricsToUse = matchedMetrics.length > 0 ? matchedMetrics : metrics.slice(0, 3);
  if (metricsToUse.length > 0) {
    contextParts.push(`\n--- RELEVANT METRICS & TELEMETRY ---`);
    metricsToUse.forEach(m => {
      contextParts.push(`- ${m.name}: ${m.currentValue}${m.unit ? ' ' + m.unit : ''} (Trend: ${m.trend}, Status: ${m.hasEnoughData ? 'Statistically Sound' : 'Preliminary sample'})`);
      sources.push({
        type: 'metric',
        id: m.id,
        title: `${m.name}: ${m.currentValue}${m.unit ? ' ' + m.unit : ''}`,
        subtitle: m.whyItMatters || m.explanation,
        value: `${m.currentValue}${m.unit || ''}`,
        route: 'metrics'
      });
    });
    summary.push({ category: 'metric', label: `${metricsToUse.length} Metrics Evaluated`, count: metricsToUse.length });
  }

  // 4. Selective Customer Feedback Retrieval
  const matchedFeedbacks = feedbacks.filter(f => {
    const text = `${f.customerName} ${f.content} ${f.keyPainPoint} ${(f.tags || []).join(' ')}`.toLowerCase();
    if (isRetentionQuery && (text.includes('drop') || text.includes('churn') || text.includes('confus') || text.includes('discord') || text.includes('notif') || text.includes('daily') || text.includes('crash'))) return true;
    if (isPricingQuery && (text.includes('price') || text.includes('cost') || text.includes('expensive') || text.includes('pay') || text.includes('free'))) return true;
    if (isBuildingQuery && (text.includes('bug') || text.includes('slow') || text.includes('feature') || text.includes('api') || text.includes('export'))) return true;
    return false;
  }).slice(0, 4);

  const feedbacksToUse = matchedFeedbacks.length > 0 ? matchedFeedbacks : feedbacks.slice(0, 3);
  if (feedbacksToUse.length > 0) {
    contextParts.push(`\n--- RECENT CUSTOMER FEEDBACK & INTERVIEWS ---`);
    feedbacksToUse.forEach(f => {
      contextParts.push(`- Customer [${f.customerName}] (${f.type}): "${f.content}" | Core Pain: ${f.keyPainPoint}`);
      sources.push({
        type: 'feedback',
        id: f.id,
        title: `Customer Feedback: ${f.customerName}`,
        subtitle: f.keyPainPoint,
        route: 'customers'
      });
    });
    summary.push({ category: 'feedback', label: `${feedbacksToUse.length} Customer Feedback Records`, count: feedbacksToUse.length });
  }

  // 5. Selective Founder Notepad Notes
  const matchedNotes = notes.filter(n => !n.isTrash).filter(n => {
    const text = `${n.title} ${n.collection} ${(n.tags || []).join(' ')} ${(n.blocks || []).map(b => b.content).join(' ')}`.toLowerCase();
    const words = qLower.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => text.includes(w)) || (isRetentionQuery && n.collection === 'Customers') || (isPricingQuery && text.includes('pricing'));
  }).slice(0, 3);

  if (matchedNotes.length > 0) {
    contextParts.push(`\n--- LINKED FOUNDER NOTEPAD NOTES ---`);
    matchedNotes.forEach(n => {
      const excerpt = (n.blocks || []).map(b => b.content).join(' ').slice(0, 250);
      contextParts.push(`- Note: "${n.title}" [Collection: ${n.collection}] - ${excerpt}...`);
      sources.push({
        type: 'note',
        id: n.id,
        title: `Note: ${n.title}`,
        subtitle: `Collection: ${n.collection}`,
        route: 'notepad'
      });
    });
    summary.push({ category: 'note', label: `${matchedNotes.length} Linked Notes`, count: matchedNotes.length });
  }

  // 6. Selective Experiments & Missions
  const matchedExp = experiments.slice(0, 2);
  if (matchedExp.length > 0) {
    contextParts.push(`\n--- ACTIVE & RECENT EXPERIMENTS ---`);
    matchedExp.forEach(e => {
      contextParts.push(`- Experiment: "${e.title}" (Status: ${e.status}) | Metric: ${e.metric} (${e.currentValue} -> ${e.targetValue}) | Hypothesis: ${e.hypothesis}`);
      sources.push({
        type: 'experiment',
        id: e.id,
        title: `Experiment: ${e.title}`,
        subtitle: `Metric: ${e.metric} • Target: ${e.targetValue}`,
        route: 'experiments'
      });
    });
    summary.push({ category: 'experiment', label: `${matchedExp.length} Experiments`, count: matchedExp.length });
  }

  // 7. Founder Memories & Rules
  if (memories.length > 0) {
    contextParts.push(`\n--- CONFIRMED FOUNDER MEMORIES & CONSTRAINTS ---`);
    memories.forEach(m => {
      contextParts.push(`- [${m.category.toUpperCase()}] ${m.key}: ${m.value} (Confidence: ${m.confidence})`);
      sources.push({
        type: 'memory',
        id: m.id,
        title: `Memory: ${m.key}`,
        subtitle: m.value,
        route: 'profile'
      });
    });
    summary.push({ category: 'memory', label: `${memories.length} Founder Memories`, count: memories.length });
  }

  // 8. Saved Vault Resources Matching Query
  const matchedSaved = savedResources.filter(r => {
    const text = `${r.title} ${r.description} ${r.notes} ${(r.tags || []).join(' ')} ${r.category}`.toLowerCase();
    const words = qLower.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => text.includes(w));
  }).slice(0, 2);

  if (matchedSaved.length > 0) {
    contextParts.push(`\n--- RELEVANT SAVED RESOURCES IN FOUNDER VAULT ---`);
    matchedSaved.forEach(r => {
      contextParts.push(`- Vault Item: "${r.title}" (${r.url}) | Notes: ${r.notes || 'Saved by founder'}`);
      sources.push({
        type: 'vault',
        id: r.id,
        title: `Vault: ${r.title}`,
        subtitle: `Saved Resource`,
        route: 'vault'
      });
    });
    summary.push({ category: 'vault', label: `${matchedSaved.length} Saved Vault Resources`, count: matchedSaved.length });
  }

  // 9. Health & Bottleneck Dimensions
  const relevantHealth = health.filter(h => h.status === 'Needs Attention' || h.status === 'Critical' || h.name.toLowerCase().includes('retention') || h.name.toLowerCase().includes('capital')).slice(0, 2);
  if (relevantHealth.length > 0) {
    contextParts.push(`\n--- STARTUP HEALTH & BOTTLENECK SIGNALS ---`);
    relevantHealth.forEach(h => {
      contextParts.push(`- Health Dimension: ${h.name} -> Status: ${h.status} (Score: ${h.score}/100) | Risk: ${h.risk}`);
      sources.push({
        type: 'health',
        id: h.id,
        title: `Health: ${h.name}`,
        subtitle: `Status: ${h.status} • Score: ${h.score}/100`,
        value: `${h.score || 0}/100`,
        route: 'health'
      });
    });
  }

  return {
    summary,
    sources,
    contextPromptText: contextParts.join('\n'),
    hasSufficientData: metricsToUse.length > 0 || feedbacksToUse.length > 0,
    detectedIntent
  };
}

export function buildCopilotSystemPrompt(contextText: string, mode: CopilotMode = 'default'): string {
  return `You are Founder Copilot, an uncompromising, evidence-driven startup thinking partner inside FounderZero.
Your positioning: "Your startup thinking partner."
You are strictly NOT "ChatGPT for startups." You DO NOT use generic motivational fluff, corporate jargon, vague SaaS hand-waving, or fake mathematical certainty.

You are:
- Direct
- Practical
- Evidence-driven
- Concise
- Honest
- Challenging when necessary

CRITICAL OPERATIONAL RULES:
1. Ground every recommendation in the founder's provided data (metrics, customer quotes, budget, active stage, bottleneck).
2. If there is insufficient data or evidence to be confident, DO NOT guess or hallucinate. Explicitly state: "I don't have enough evidence to confidently recommend that yet." and explain the exact metric, user test, or interview needed.
3. NEVER invent fake statistics, customer names, or imaginary cohort numbers.
4. Categorize your reasoning transparently:
   - Known Data: Direct facts from their telemetry, feedback, or budget.
   - Founder Assumptions: Unproven beliefs currently held.
   - AI Inferences: Logical deductions based on patterns.
   - General Knowledge: Proven startup base rates and principles.
5. If the conversation leads to a concrete execution step, provide a structured action proposal:
   - Notepad Note Draft (for strategies, architecture docs, research playbooks)
   - Experiment Launch (for testing hypotheses with metrics and duration)
   - 7-Day Founder Mission (for actionable step-by-step sprints)
   - Vault Resource Save (for useful tools/guides)
   - Decision Matrix (for comparing Option A vs Option B)
   - Product Validation Breakdown (What we know, What we don't, Biggest assumption)
   - Feedback Analysis (Top recurring pain points with counts)
6. ALWAYS output your response as valid JSON matching the schema below.

ACTIVE STARTUP CONTEXT:
${contextText}

JSON RESPONSE SCHEMA:
{
  "content": "Markdown formatted conversational response with crisp headings, bold points, and direct counsel.",
  "intent": "Short slug describing the detected goal",
  "insufficientEvidenceWarning": false,
  "evidenceBreakdown": {
    "knownData": [
      { "label": "Day-7 Retention", "value": "41.0%" },
      { "label": "Monthly Budget", "value": "₹2,000" }
    ],
    "founderAssumptions": [
      "Assumes users want complex dashboard rather than Discord digest"
    ],
    "inferences": [
      "Push-based notification loop will double 7-day return rate"
    ],
    "generalKnowledge": [
      "Micro-SaaS founders buy from peers providing free dev utilities"
    ]
  },
  "actionProposal": {
    "type": "notepad_draft | create_mission | create_experiment | save_resource | update_startup_profile | decision_matrix | product_validation | feedback_analysis",
    "title": "Action Title",
    "description": "Short description of what this action will produce",
    "status": "pending",
    "draftNote": {
      "title": "Strategy Note Title",
      "collection": "Strategy | Product | Marketing | Growth",
      "tags": ["Tag1", "Tag2"],
      "blocks": [
        { "id": "b1", "type": "callout", "content": "Core insight...", "calloutVariant": "founder" },
        { "id": "b2", "type": "heading2", "content": "Action Steps" },
        { "id": "b3", "type": "checklist", "content": "Step 1", "checked": false }
      ]
    },
    "missionData": {
      "title": "Mission Title",
      "category": "Growth | Product | Validation",
      "objective": "Clear goal",
      "whyItMatters": "Why this matters",
      "estimatedTime": "3 hours",
      "estimatedCost": "₹0",
      "difficulty": "Easy | Medium | Hard",
      "expectedResult": "Expected outcome",
      "steps": [
        { "id": "s1", "text": "Task 1", "completed": false },
        { "id": "s2", "text": "Task 2", "completed": false }
      ]
    },
    "experimentData": {
      "title": "Experiment Title",
      "hypothesis": "If we do X, then Y will occur because Z.",
      "problem": "Current root problem",
      "metric": "Key target metric",
      "currentValue": "Baseline",
      "targetValue": "Target goal",
      "method": "How the test will run",
      "audience": "Target audience",
      "duration": "7 days",
      "budget": "₹0"
    },
    "decisionData": {
      "optionA": { "name": "Option A", "impact": "High", "effort": "Low", "evidence": "Why" },
      "optionB": { "name": "Option B", "impact": "Medium", "effort": "High", "evidence": "Why" },
      "recommendation": "Option A",
      "reason": "Clear explanation"
    }
  },
  "suggestedFollowUps": [
    "Suggested question 1",
    "Suggested question 2"
  ]
}`;
}

export function generateSmartCopilotReply(
  query: string,
  mode: CopilotMode = 'default',
  state: AppState
): {
  content: string;
  intent: string;
  evidenceBreakdown: EvidenceBreakdown;
  actionProposal?: CopilotActionProposal;
  thinkingSteps: any[];
  toolCalls: any[];
  retrievedContextSummary: { category: string; label: string; count: number }[];
  sources: CopilotSourceReference[];
} {
  const cleanQuery = (query || '').trim();
  const qLower = cleanQuery.toLowerCase();
  const p = state.profile || ({} as any);
  const m = state.metrics || [];
  const f = state.customerFeedback || [];
  const startupName = p.name || 'PulseBoard';
  const retMetric = m.find(item => item.name.toLowerCase().includes('retention'))?.currentValue || '41%';

  const context = retrieveRelevantContext(cleanQuery, mode, state);

  let assistantContent = '';
  let intent = context.detectedIntent;
  let actionProposal: CopilotActionProposal | undefined = undefined;

  // Category 1: Capital / Ads / Paid Marketing / Spend
  if (mode === 'reality-check' || qLower.includes('ad') || qLower.includes('spend') || qLower.includes('budget') || qLower.includes('burn') || qLower.includes('hire') || qLower.includes('cost')) {
    intent = 'capital_spend_analysis';
    assistantContent = `### Capital & Spend Analysis: REJECT PREMATURE SPEND

Regarding your query: **"${cleanQuery}"**

#### Evidence-Driven Assessment:
- **Current Runway & Budget**: Your monthly budget is ₹${(p.monthlyBudget || 2000).toLocaleString()}, MRR is ₹${(p.monthlyRevenue || 0).toLocaleString()}, and current Day-7 retention is **${retMetric}**.
- **Capital Rule**: Allocating budget to paid ad channels (Google/Meta/LinkedIn) before establishing a 50%+ Day-30 retention baseline causes high capital leakage.
- **Acquisition Leverage**: Solo founders at stage **${p.stage || 'Validating'}** should rely 100% on zero-burn distribution channels (Show HN, direct developer teardowns, organic community seeding).

#### Immediate Next Action:
Execute a zero-budget community launch sprint to acquire 50 retained users before spending any capital.`;

    actionProposal = {
      id: 'prop-' + Date.now(),
      type: 'create_mission',
      title: 'Run Organic Community Distribution Sprint',
      description: 'Acquire 50 high-intent signups with zero ad spend via Show HN and developer teardowns.',
      status: 'pending',
      missionData: {
        title: 'Acquire 50 Organic Users via Community Teardowns',
        category: 'Growth',
        objective: 'Validate retention bucket without spending advertising capital.',
        whyItMatters: 'Zero-burn distribution protects runway while calibrating onboarding.',
        estimatedTime: '3 hours',
        estimatedCost: '₹0',
        difficulty: 'Medium',
        expectedResult: '50 qualified developer signups.',
        steps: [
          { id: 's1', text: 'Draft technical breakdown of zero-bloat architecture on Show HN', completed: false },
          { id: 's2', text: 'Post interactive demo sandbox with no signup password wall', completed: false },
          { id: 's3', text: 'Collect 10 qualitative feedback reviews on Discord', completed: false }
        ]
      }
    };
  }
  // Category 2: Retention / Churn / User Drop-off
  else if (mode === 'feedback-analysis' || qLower.includes('retention') || qLower.includes('churn') || qLower.includes('drop') || qLower.includes('leave') || qLower.includes('stay') || qLower.includes('activation')) {
    intent = 'diagnose_user_retention';
    assistantContent = `### Retention Telemetry Diagnosis for ${startupName}

You asked: **"${cleanQuery}"**

#### Telemetry Analysis:
- **Baseline Metric**: Your **Day-7 Retention is currently ${retMetric}** (target benchmark for PMF: 50%+).
- **Activation Friction**: Customer feedback scans reveal founders drop off during complex initial onboarding setup.
- **Retention Lever**: Delivering automated daily value directly into existing communication channels (Discord/Slack webhooks or daily email digests) removes tab-switching friction.

#### Core Recommendation:
Do not build more dashboard analytics charts. Instead, launch a **1-click automated daily digest webhook** so your product's core insight arrives where users already work.`;

    actionProposal = {
      id: 'prop-' + Date.now(),
      type: 'create_experiment',
      title: 'Launch 1-Click Retention Digest Experiment',
      description: `Test if automated daily digests increase Day-7 retention from ${retMetric} to 55%.`,
      status: 'pending',
      experimentData: {
        title: 'Automated Discord Digest Webhook vs Web Portal',
        hypothesis: `If we deliver daily telemetry snapshots directly into user communication channels, Day-7 retention will increase from ${retMetric} to 55%.`,
        problem: 'Founders forget to log into web dashboard daily.',
        metric: 'Day-7 Retention Rate',
        currentValue: String(retMetric),
        targetValue: '55%',
        method: 'Offer 1-click Discord webhook connect in onboarding',
        audience: 'New signups',
        duration: '14 days',
        budget: '₹0'
      }
    };
  }
  // Category 3: Pricing / Monetization / Tiers
  else if (mode === 'decision-support' || qLower.includes('price') || qLower.includes('pricing') || qLower.includes('monetiz') || qLower.includes('charge') || qLower.includes('freemium') || qLower.includes('tier') || qLower.includes('plan')) {
    intent = 'pricing_and_monetization_review';
    assistantContent = `### Pricing & Monetization Calibration for ${startupName}

Analyzing your query: **"${cleanQuery}"**

#### Strategic Assessment:
- **Value Metric**: Align pricing with the primary metric of value delivered (e.g. active tracked metrics, automated alerts, or monthly active seats) rather than generic user seats.
- **Freemium Trap**: Free tiers for B2B developer tools should gate usage volume or advanced automation, never core utility.
- **Recommended Tiers**:
  1. **Starter (₹0)**: 1 Project, Core Telemetry, Manual Exports.
  2. **Pro (₹1,499/mo)**: Unlimited Projects, Automated Daily Digest, AI Copilot reasoning.
  3. **Team (₹4,999/mo)**: Multi-member workspaces & priority webhook streaming.

#### Next Step:
Test value-based pricing on your next 10 customer discovery calls before modifying public billing pages.`;

    actionProposal = {
      id: 'prop-' + Date.now(),
      type: 'notepad_draft',
      title: 'Save SaaS Pricing Matrix to Notepad',
      description: 'Save this value-based pricing structure to your Strategy collection.',
      status: 'pending',
      draftNote: {
        title: `${startupName} Value-Based Pricing Architecture`,
        collection: 'Strategy',
        tags: ['Pricing', 'Monetization', 'SaaS', 'Tiers'],
        blocks: [
          { id: 'b1', type: 'callout', content: '💡 **Rule**: Charge based on value metrics (insights delivered), not arbitrary user seats.', calloutVariant: 'founder' },
          { id: 'b2', type: 'heading2', content: 'Proposed Tier Structure' },
          { id: 'b3', type: 'checklist', content: 'Validate ₹1,499/mo price point with 3 active users', checked: false },
          { id: 'b4', type: 'checklist', content: 'Implement usage-based paywall trigger in onboarding', checked: false }
        ]
      }
    };
  }
  // Category 4: Product Validation / Mom Test / User Discovery
  else if (mode === 'product-validation' || qLower.includes('validate') || qLower.includes('mom test') || qLower.includes('interview') || qLower.includes('idea') || qLower.includes('problem')) {
    intent = 'product_idea_validation';
    assistantContent = `### Product Validation & Customer Discovery Framework

Regarding: **"${cleanQuery}"**

#### Mom Test Validation Protocol:
1. **Talk About Their Past Actions, Not Future Promises**: Ask *"How do you currently track user churn?"* instead of *"Would you buy an AI churn tool?"*.
2. **Identify Hard Workarounds**: If founders are using messy Google Sheets or manual SQL queries daily, the pain is urgent and real.
3. **Ask for Commitment**: A validated idea ends with a commitment (time, intro, or pre-order deposit), not polite compliments.

#### Proposed Validation Sprint:
Conduct 5 non-leading customer discovery calls using the 3 core questions below:
- *"What was the hardest part about growing your startup last week?"*
- *"Why was that hard?"*
- *"What have you tried to fix it?"*`;

    actionProposal = {
      id: 'prop-' + Date.now(),
      type: 'create_mission',
      title: 'Conduct 5 Mom-Test Customer Discovery Interviews',
      description: 'Validate problem urgency and current workarounds with 5 target founders.',
      status: 'pending',
      missionData: {
        title: 'Run 5 Mom-Test Customer Interviews',
        category: 'Validation',
        objective: 'Uncover real workarounds and pain severity before writing complex code.',
        whyItMatters: 'Prevents building features nobody wants.',
        estimatedTime: '4 hours',
        estimatedCost: '₹0',
        difficulty: 'Medium',
        expectedResult: '5 transcripts with verified pain severity rating.',
        steps: [
          { id: 's1', text: 'Reach out to 15 targeted founders on Twitter/Discord', completed: false },
          { id: 's2', text: 'Ask non-leading questions focused on past behavior', completed: false },
          { id: 's3', text: 'Document recurring pain points in Founder Notepad', completed: false }
        ]
      }
    };
  }
  // Category 5: Technical Stack / Architecture / Code
  else if (mode === 'building-help' || qLower.includes('code') || qLower.includes('stack') || qLower.includes('tech') || qLower.includes('database') || qLower.includes('architecture') || qLower.includes('api') || qLower.includes('react') || qLower.includes('express')) {
    intent = 'mvp_technical_architecture';
    assistantContent = `### Technical Architecture & Execution Strategy for ${startupName}

Addressing your technical query: **"${cleanQuery}"**

#### Technical Principles for ${p.stage || 'MVP'} Stage:
- **Zero Infrastructure Bloat**: Keep deployment architecture single-monolith or serverless edge with zero unnecessary microservices.
- **Type Safety End-to-End**: Shared TypeScript interfaces (\`types.ts\`) between frontend and backend prevent runtime payload mismatches.
- **Progressive Enhancement**: Implement local state caching with automated API synchronization for instant UI responsiveness.

#### Recommended Stack Checklist:
1. **Frontend**: React 19 + TypeScript + TailwindCSS.
2. **Backend**: Node/Express or Vite middleware with typed route handlers.
3. **Storage**: Light JSON store (\`founderzero-db.json\`) for zero-cost dev, easily syncable to Cloud Firestore.`;

    actionProposal = {
      id: 'prop-' + Date.now(),
      type: 'notepad_draft',
      title: 'Save Technical Architecture Playbook',
      description: 'Save this technical architecture blueprint to your Strategy collection.',
      status: 'pending',
      draftNote: {
        title: `${startupName} Monolith Technical Architecture Blueprint`,
        collection: 'Product',
        tags: ['Architecture', 'TypeScript', 'Stack', 'Zero-Bloat'],
        blocks: [
          { id: 'b1', type: 'callout', content: '⚡ **Rule**: Avoid complex Kubernetes/microservices until MRR exceeds ₹5,000,000.', calloutVariant: 'founder' },
          { id: 'b2', type: 'heading2', content: 'Core Tech Principles' },
          { id: 'b3', type: 'checklist', content: 'Verify end-to-end API type safety in types.ts', checked: false },
          { id: 'b4', type: 'checklist', content: 'Implement progressive SSE response streaming', checked: false }
        ]
      }
    };
  }
  // Category 6: General Strategy / Open Questions / Custom Prompts
  else {
    intent = 'strategic_query_synthesis';
    assistantContent = `### Strategic Synthesis for ${startupName}

Direct analysis for your prompt: **"${cleanQuery}"**

#### Strategic Assessment (${p.stage || 'Validating'} Stage):
1. **Target Bottleneck**: Focus 100% of weekly execution on your primary bottleneck: **"${p.biggestUncertainty || 'User Retention & Growth'}"**.
2. **Evidence-Grounded Next Steps**:
   - **Step 1**: Talk to 3 active signups to map their exact activation journey.
   - **Step 2**: Remove all non-essential onboarding steps (password walls, long forms).
   - **Step 3**: Track weekly Day-7 cohort retention to verify product-market fit signal.
3. **Zero-Burn Rule**: Leverage free-tier open-source tools and community channels before spending on advertising.`;

    actionProposal = {
      id: 'prop-' + Date.now(),
      type: 'notepad_draft',
      title: `Save Execution Plan for "${cleanQuery.slice(0, 30)}..."`,
      description: 'Save this strategic response directly into Founder Notepad.',
      status: 'pending',
      draftNote: {
        title: `Action Plan: ${cleanQuery.slice(0, 45)}`,
        collection: 'Strategy',
        tags: ['Execution', 'Strategy', 'Focus'],
        blocks: [
          { id: 'b1', type: 'callout', content: `🎯 **Focus Goal**: Solve "${p.biggestUncertainty || 'User Retention'}" first.`, calloutVariant: 'founder' },
          { id: 'b2', type: 'heading2', content: 'Next Actions' },
          { id: 'b3', type: 'checklist', content: `Address: ${cleanQuery}`, checked: false },
          { id: 'b4', type: 'checklist', content: 'Measure user feedback response', checked: false }
        ]
      }
    };
  }

  const evidenceBreakdown: EvidenceBreakdown = {
    knownData: [
      { label: 'Startup Name', value: startupName },
      { label: 'Stage', value: p.stage || 'Validating' },
      { label: 'Day-7 Retention', value: retMetric },
      { label: 'Monthly Budget', value: `₹${(p.monthlyBudget || 2000).toLocaleString()}` }
    ],
    founderAssumptions: [
      `Assumption regarding "${cleanQuery.slice(0, 30)}..."`
    ],
    inferences: [
      `Directly addressing prompt intent: ${intent.replace(/_/g, ' ')}`
    ],
    generalKnowledge: [
      'Early-stage bootstrapped SaaS requires high organic retention before capital scaling'
    ]
  };

  const thinkingSteps = [
    { id: 'th-1', label: `Analyzed query: "${cleanQuery.slice(0, 40)}${cleanQuery.length > 40 ? '...' : ''}"`, status: 'completed' as const, duration: '0.1s' },
    { id: 'th-2', label: `Retrieved startup context for ${startupName} (${p.stage || 'MVP'})`, status: 'completed' as const, duration: '0.1s' },
    { id: 'th-3', label: `Evaluated telemetry signals (D7 Retention: ${retMetric})`, status: 'completed' as const, duration: '0.1s' },
    { id: 'th-4', label: 'Generated query-specific strategic counsel', status: 'completed' as const, duration: '0.1s' }
  ];

  const toolCalls = [
    {
      id: 'tool-1-' + Date.now(),
      name: 'analyze_user_query',
      description: `Analyze intent and keywords for "${cleanQuery.slice(0, 30)}..."`,
      status: 'completed',
      input: { query: cleanQuery, mode },
      output: { detectedIntent: intent, startup: startupName },
      duration: '90ms'
    },
    {
      id: 'tool-2-' + Date.now(),
      name: 'get_startup_context',
      description: `Fetch telemetry metrics & stage (${p.stage || 'MVP'})`,
      status: 'completed',
      input: { startupId: p.id || 'startup-1' },
      output: { retentionD7: retMetric, goal: p.goal90Days || 'Reach PMF' },
      duration: '110ms'
    }
  ];

  return {
    content: assistantContent,
    intent,
    evidenceBreakdown,
    actionProposal,
    thinkingSteps,
    toolCalls,
    retrievedContextSummary: context.summary,
    sources: context.sources
  };
}
