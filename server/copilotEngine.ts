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
