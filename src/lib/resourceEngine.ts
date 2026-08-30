import {
  AppState,
  FounderLearningProfile,
  FounderLevel,
  IntentSearchResult,
  RecommendedResourceItem,
  Resource,
  StartupProfile,
  UserResourceInteraction,
  WeeklyFounderBrief
} from '../types';

/**
 * 1. Calculate Founder Level based on stage, user traction, and revenue
 */
export function calculateFounderLevel(
  profile: StartupProfile,
  state?: Partial<AppState>
): {
  levelNumber: number;
  title: FounderLevel;
  description: string;
  nextMilestone: string;
} {
  const { stage, currentUsers = 0, monthlyRevenue = 0 } = profile;
  const feedbackCount = state?.customerFeedback?.length || 0;

  if (stage === 'Idea' || (currentUsers === 0 && feedbackCount < 5)) {
    return {
      levelNumber: 1,
      title: 'Explorer',
      description: 'Focused on problem discovery, customer interviews, and validating genuine pain points before building.',
      nextMilestone: 'Complete 5 problem validation interviews and document target ICP.'
    };
  }

  if (stage === 'Validating' || stage === 'Building MVP' || (currentUsers < 10 && monthlyRevenue === 0)) {
    return {
      levelNumber: 2,
      title: 'Builder',
      description: 'Developing a zero-budget MVP, setting up open-source tooling, and testing basic landing page interest.',
      nextMilestone: 'Ship MVP v1.0 and acquire first 10 beta testers.'
    };
  }

  if (stage === 'Launched' && currentUsers < 250 && monthlyRevenue < 15000) {
    return {
      levelNumber: 3,
      title: 'Launcher',
      description: 'Acquiring the first 100-200 active users, monitoring user session drop-offs, and optimizing onboarding activation.',
      nextMilestone: 'Achieve >50% week-2 user retention and acquire first paying customers.'
    };
  }

  if (stage === 'First Revenue' || (monthlyRevenue > 0 && monthlyRevenue < 50000)) {
    return {
      levelNumber: 4,
      title: 'Operator',
      description: 'Building repeatable zero-budget acquisition channels, testing pricing elasticity, and stabilizing cohort retention.',
      nextMilestone: 'Establish a predictable weekly acquisition loop and reach ₹50,000 MRR.'
    };
  }

  return {
    levelNumber: 5,
    title: 'Scaler',
    description: 'Scaling organic flywheel distribution, streamlining operations, and optimizing team and architectural leverage.',
    nextMilestone: 'Scale MRR past ₹1,00,000 with sustainable unit economics.'
  };
}

/**
 * 2. Identify Primary Current Bottleneck
 */
export function identifyCurrentBottleneck(
  profile: StartupProfile,
  state?: Partial<AppState>
): {
  key: string;
  name: string;
  reason: string;
  urgentAction: string;
} {
  const { stage, currentUsers = 0, monthlyRevenue = 0, biggestUncertainty } = profile;
  const feedbackCount = state?.customerFeedback?.length || 0;

  if (stage === 'Idea' || feedbackCount < 3) {
    return {
      key: 'problem_validation',
      name: 'Problem Validation & Customer Discovery',
      reason: 'Zero or low recorded customer interview notes. High risk of building features nobody wants.',
      urgentAction: 'Talk to 5 target users using The Mom Test framework.'
    };
  }

  if (stage === 'Building MVP') {
    return {
      key: 'mvp_speed',
      name: 'MVP Scope & Build Velocity',
      reason: 'Product in development. Need to ship core value loop without overengineering.',
      urgentAction: 'Use open-source coding agents and boilerplates to ship within 7 days.'
    };
  }

  if (stage === 'Launched' && currentUsers < 50) {
    return {
      key: 'distribution',
      name: 'Initial User Distribution & Reach',
      reason: `Launched with ${currentUsers} users. Top-of-funnel reach needs manual founder-led recruitment.`,
      urgentAction: 'Execute 2 zero-budget community teardowns on Reddit / Indie Hackers.'
    };
  }

  if (stage === 'Launched' || stage === 'First Revenue') {
    if (biggestUncertainty && biggestUncertainty.toLowerCase().includes('retention')) {
      return {
        key: 'retention',
        name: 'User Retention & Onboarding Activation',
        reason: 'Users drop off after signing up. Onboarding friction or missing core value moment.',
        urgentAction: 'Watch 5 PostHog session replays and interview 3 active users.'
      };
    }

    if (monthlyRevenue === 0 && currentUsers > 50) {
      return {
        key: 'monetization',
        name: 'Monetization & Willingness to Pay',
        reason: `${currentUsers} users registered, but ₹0 revenue. Willingness to pay has not been tested.`,
        urgentAction: 'Test a simple paid tier or lifetime deal to validate pricing.'
      };
    }

    return {
      key: 'retention_and_growth',
      name: 'Retention Loops & Organic Acquisition',
      reason: 'Balancing repeatable acquisition while keeping current user cohorts active.',
      urgentAction: 'Track week-over-week retention cohorts and establish a weekly content loop.'
    };
  }

  return {
    key: 'scale_efficiency',
    name: 'Operational & Marketing Efficiency',
    reason: 'Scaling demands repeatable systems and automated toolchains.',
    urgentAction: 'Optimize conversion funnels and reduce manual founder overhead.'
  };
}

/**
 * 3. Personalized Recommendation Engine
 */
export function calculateResourceRecommendations(
  profile: StartupProfile,
  state: AppState,
  resources: Resource[]
): RecommendedResourceItem[] {
  const founderLevel = calculateFounderLevel(profile, state);
  const bottleneck = identifyCurrentBottleneck(profile, state);
  const userInteractions = state.resourceInteractions || [];

  const hiddenIds = new Set(
    userInteractions.filter(i => i.interactionType === 'hidden' || i.interactionType === 'not_useful').map(i => i.resourceId)
  );

  const completedIds = new Set(
    userInteractions.filter(i => i.interactionType === 'completed').map(i => i.resourceId)
  );

  const scoredItems: RecommendedResourceItem[] = [];

  for (const resource of resources) {
    if (hiddenIds.has(resource.id) || resource.status === 'archived') {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];

    // Stage alignment (0-25)
    if (resource.startupStages.includes(profile.stage)) {
      score += 25;
    } else {
      score += 8;
    }

    // Bottleneck relevance (0-30)
    const tagsLower = resource.tags.map(t => t.toLowerCase());
    const useCasesLower = resource.useCases.map(u => u.toLowerCase());
    const titleLower = resource.title.toLowerCase();
    const descLower = resource.description.toLowerCase();

    let matchedBottleneck: string | undefined;

    if (bottleneck.key === 'problem_validation') {
      if (
        tagsLower.includes('validation') ||
        tagsLower.includes('customer interviews') ||
        tagsLower.includes('the mom test') ||
        descLower.includes('interview') ||
        titleLower.includes('mom test')
      ) {
        score += 30;
        matchedBottleneck = bottleneck.name;
        reasons.push(`Directly solves your #1 bottleneck: ${bottleneck.name}`);
      }
    } else if (bottleneck.key === 'mvp_speed') {
      if (
        resource.category === 'BUILD' ||
        resource.subcategory.includes('Coding Agent') ||
        resource.subcategory.includes('Databases') ||
        tagsLower.includes('boilerplate')
      ) {
        score += 30;
        matchedBottleneck = bottleneck.name;
        reasons.push(`Helps you build your MVP with ₹0 software cost`);
      }
    } else if (bottleneck.key === 'distribution') {
      if (
        tagsLower.includes('distribution') ||
        tagsLower.includes('first 1000 users') ||
        tagsLower.includes('zero budget growth') ||
        descLower.includes('acquisition')
      ) {
        score += 30;
        matchedBottleneck = bottleneck.name;
        reasons.push(`Provides proven playbooks to acquire initial users with ₹0 ad spend`);
      }
    } else if (bottleneck.key.includes('retention')) {
      if (
        tagsLower.includes('retention') ||
        tagsLower.includes('analytics') ||
        tagsLower.includes('session replays') ||
        titleLower.includes('posthog') ||
        titleLower.includes('retention')
      ) {
        score += 30;
        matchedBottleneck = bottleneck.name;
        reasons.push(`Addresses your current retention uncertainty with tactical diagnostics`);
      }
    } else if (bottleneck.key === 'monetization') {
      if (tagsLower.includes('pricing') || descLower.includes('pricing') || tagsLower.includes('monetization')) {
        score += 30;
        matchedBottleneck = bottleneck.name;
        reasons.push(`Guidance on pricing and monetizing without losing early users`);
      }
    }

    // Budget & Open Source preference (0-20)
    if (resource.isOpenSource) {
      score += 12;
    }
    if (resource.isFree || resource.pricingType === 'free') {
      score += 8;
    } else if (resource.hasFreeTier) {
      score += 5;
    }

    // Quality Score component (0-20)
    score += Math.round((resource.qualityScore / 100) * 20);

    // Active Mission alignment boost
    const activeMission = state.missions?.find(m => !m.completed);
    if (activeMission) {
      const missionText = (activeMission.title + ' ' + activeMission.objective).toLowerCase();
      if (
        tagsLower.some(t => missionText.includes(t)) ||
        resource.useCases.some(u => missionText.includes(u.toLowerCase()))
      ) {
        score += 15;
        reasons.push(`Connected to your active mission: "${activeMission.title}"`);
      }
    }

    // Completed penalty (don't hide, but push lower)
    if (completedIds.has(resource.id)) {
      score -= 20;
    }

    // Synthesize human-readable explanation
    let whyRecommended = reasons.join(' • ');
    if (!whyRecommended) {
      if (resource.category === 'READ') {
        whyRecommended = `High-signal reading for Level ${founderLevel.levelNumber} (${founderLevel.title}) founders to stay sharp on tech and growth.`;
      } else if (resource.category === 'BUILD') {
        whyRecommended = `Verified free/open-source builder tool compatible with your '${profile.stage}' stage and ₹${profile.monthlyBudget} budget.`;
      } else {
        whyRecommended = `Recommended to build foundational knowledge for your 90-day goal: "${profile.goal90Days}".`;
      }
    }

    scoredItems.push({
      resource,
      recommendationScore: Math.max(10, Math.min(100, score)),
      whyRecommended,
      matchingBottleneck: matchedBottleneck || bottleneck.name,
      matchingStage: profile.stage,
      matchingGoal: profile.goal90Days
    });
  }

  // Sort descending by recommendationScore
  return scoredItems.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

/**
 * 4. Natural Language "I Need To..." Intent Search Engine
 */
export function searchResourceByIntent(
  rawQuery: string,
  profile: StartupProfile,
  resources: Resource[]
): IntentSearchResult {
  const query = rawQuery.trim().toLowerCase();

  // Pattern matching categories
  let detectedIntent = 'General Founder Discovery';
  let categoryFilter: Resource['category'] | null = null;
  let targetKeywords: string[] = [];

  if (query.includes('agent') || query.includes('ai code') || query.includes('write code') || query.includes('copilot') || query.includes('autonomous')) {
    detectedIntent = 'AI & Open Source Coding Agents';
    targetKeywords = ['coding agent', 'cline', 'opencode', 'aider', 'openhands', 'continue', 'autonomous', 'terminal'];
  } else if (query.includes('ide') || query.includes('editor') || query.includes('vscode') || query.includes('zed') || query.includes('neovim')) {
    detectedIntent = 'Free & Open Source IDEs / Code Editors';
    targetKeywords = ['ide', 'vscodium', 'zed', 'neovim', 'editor', 'floss'];
  } else if (query.includes('database') || query.includes('backend') || query.includes('postgres') || query.includes('auth') || query.includes('login')) {
    detectedIntent = 'Zero-Cost Databases & Backend Infra';
    targetKeywords = ['database', 'supabase', 'postgres', 'backend', 'authentication'];
  } else if (query.includes('landing') || query.includes('host') || query.includes('deploy') || query.includes('website') || query.includes('domain')) {
    detectedIntent = 'Free Hosting & Landing Page Deployment';
    targetKeywords = ['hosting', 'cloudflare', 'pages', 'deployment', 'landing page'];
  } else if (query.includes('interview') || query.includes('talk to customer') || query.includes('validate') || query.includes('mom test') || query.includes('idea')) {
    detectedIntent = 'Customer Discovery & Problem Validation';
    targetKeywords = ['customer interviews', 'validation', 'the mom test', 'problem discovery'];
  } else if (query.includes('user') || query.includes('traffic') || query.includes('distribution') || query.includes('first 100') || query.includes('first 1000') || query.includes('marketing') || query.includes('growth')) {
    detectedIntent = 'Zero-Budget User Acquisition & Distribution';
    targetKeywords = ['distribution', 'first 1000 users', 'paul graham', 'do things that dont scale', 'zero budget growth'];
  } else if (query.includes('retention') || query.includes('churn') || query.includes('analytics') || query.includes('replay') || query.includes('drop off')) {
    detectedIntent = 'Product Analytics & Retention Diagnostics';
    targetKeywords = ['retention', 'posthog', 'analytics', 'session replays', 'cohorts'];
  } else if (query.includes('price') || query.includes('pricing') || query.includes('charge') || query.includes('monetiz')) {
    detectedIntent = 'SaaS Pricing & Monetization Strategy';
    targetKeywords = ['pricing', 'monetization', 'saas pricing', 'rob walling'];
  } else if (query.includes('newsletter') || query.includes('read') || query.includes('news') || query.includes('stay updated')) {
    detectedIntent = 'Free Founder Newsletters & Daily Digests';
    categoryFilter = 'READ';
    targetKeywords = ['newsletter', 'tldr', 'product hunt', 'y combinator', 'first round'];
  } else if (query.includes('ui') || query.includes('design') || query.includes('figma') || query.includes('component') || query.includes('mockup')) {
    detectedIntent = 'UI/UX Design & Component Systems';
    targetKeywords = ['design', 'shadcn', 'penpot', 'ui components', 'tailwind'];
  } else {
    detectedIntent = `Matching resources for "${rawQuery}"`;
    targetKeywords = query.split(' ').filter(w => w.length > 2);
  }

  // Rank matches
  const matchesWithScores = resources.map(resource => {
    let matchScore = 0;
    const resText = (
      resource.title + ' ' +
      resource.description + ' ' +
      resource.subcategory + ' ' +
      resource.tags.join(' ') + ' ' +
      resource.useCases.join(' ') + ' ' +
      (resource.qualityExplanation || '')
    ).toLowerCase();

    // Query exact terms
    if (resText.includes(query)) {
      matchScore += 40;
    }

    // Target keywords
    for (const kw of targetKeywords) {
      if (resText.includes(kw.toLowerCase())) {
        matchScore += 20;
      }
    }

    // Category match
    if (categoryFilter && resource.category === categoryFilter) {
      matchScore += 25;
    }

    // Quality bonus
    matchScore += resource.qualityScore / 5;

    return { resource, matchScore };
  });

  const filtered = matchesWithScores
    .filter(m => m.matchScore > 15)
    .sort((a, b) => b.matchScore - a.matchScore)
    .map(m => m.resource);

  const fallbackAll = filtered.length > 0 ? filtered : resources.slice(0, 5);

  const recommendedOption = fallbackAll[0] || resources[0];
  const freeOption = fallbackAll.find(r => r.isFree || r.pricingType === 'free' || r.pricingType === 'open_source') || recommendedOption;
  const openSourceOption = fallbackAll.find(r => r.isOpenSource) || undefined;
  const beginnerOption = fallbackAll.find(r => r.difficulty === 'Beginner') || undefined;

  let comparisonNotes = `For ${detectedIntent.toLowerCase()}, `;
  if (openSourceOption && openSourceOption.id !== recommendedOption.id) {
    comparisonNotes += `${recommendedOption.title} is our top recommendation for maximum leverage, while ${openSourceOption.title} is the purest open-source self-hostable choice.`;
  } else {
    comparisonNotes += `${recommendedOption.title} gives you the fastest path to execution with zero software bills.`;
  }

  return {
    query: rawQuery,
    detectedIntent,
    recommendedOption,
    freeOption,
    openSourceOption,
    beginnerOption,
    allMatches: fallbackAll,
    comparisonNotes
  };
}

/**
 * 5. Weekly Founder Brief Generator
 */
export function generateWeeklyBrief(
  profile: StartupProfile,
  state: AppState,
  resources: Resource[]
): WeeklyFounderBrief {
  const founderLevel = calculateFounderLevel(profile, state);
  const bottleneck = identifyCurrentBottleneck(profile, state);
  const recs = calculateResourceRecommendations(profile, state, resources);

  const learnResource = recs.find(r => r.resource.category === 'LEARN')?.resource;
  const buildResource = recs.find(r => r.resource.category === 'BUILD')?.resource;
  const readResource = recs.find(r => r.resource.category === 'READ')?.resource;

  // Derive experiment based on bottleneck
  let expTitle = 'Conduct 5 Customer Problem Interviews';
  let expHypothesis = 'Talking to 5 target users will reveal at least 2 recurring pain points worth paying for.';
  let expCost = '₹0 (1.5 hours of founder time)';

  if (profile.stage === 'Building MVP') {
    expTitle = 'Set up a 1-page waiting list with a value proposition header';
    expHypothesis = 'A focused landing page will convert at least 15% of indie community visitors to email signups.';
    expCost = '₹0 (Cloudflare Pages + Google Forms)';
  } else if (profile.stage === 'Launched' || profile.currentUsers > 50) {
    expTitle = 'Run a zero-budget teardown post on Reddit r/SaaS & Indie Hackers';
    expHypothesis = 'Sharing real metrics and lessons will drive 25+ high-intent qualified signups without ads.';
    expCost = '₹0 (2 hours of writing)';
  }

  // Derive avoid warning
  let warnText = 'Do NOT spend money on Meta or Google Ads yet';
  let warnReason = `Your stage is '${profile.stage}' with ${profile.currentUsers} users. Paying for ad clicks before validating retention burns runway with zero lasting ROI.`;

  if (profile.monthlyBudget === 0) {
    warnText = 'Do NOT sign up for paid SaaS subscriptions before needing team seats';
    warnReason = 'Every tool you need to reach ₹50,000 MRR has a verified open-source or free tier equivalent.';
  }

  const now = new Date();
  const weekString = `Week of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return {
    weekDate: weekString,
    founderLevel,
    biggestBottleneck: bottleneck.name,
    oneThingToLearn: {
      title: learnResource ? learnResource.title : 'Customer Discovery with The Mom Test',
      description: learnResource
        ? learnResource.description
        : 'Learn how to formulate questions that extract real past behavior instead of polite hypothetical validation.',
      resource: learnResource
    },
    oneToolToTry: {
      title: buildResource ? buildResource.title : 'Cline or OpenCode',
      pricing: buildResource ? (buildResource.isOpenSource ? '100% Free Open Source' : buildResource.freeTierDescription) : 'Free Tier',
      description: buildResource
        ? buildResource.description
        : 'Autonomous coding agent extension that connects to local or free models with zero markup.',
      resource: buildResource
    },
    oneArticleToRead: {
      title: readResource ? readResource.title : 'Paul Graham: Do Things That Don’t Scale',
      readTime: readResource?.articleDetails ? `${readResource.articleDetails.readingTimeMinutes} min read` : '10 min read',
      description: readResource ? readResource.description : 'Why founder-led manual outreach beats waiting for passive viral growth in the early days.',
      resource: readResource
    },
    oneExperimentToRun: {
      title: expTitle,
      hypothesis: expHypothesis,
      cost: expCost
    },
    oneThingToAvoid: {
      warning: warnText,
      reason: warnReason
    }
  };
}

/**
 * 6. Calculate Founder Learning & Mastery Profile
 */
export function calculateLearningProfile(
  interactions: UserResourceInteraction[],
  resources: Resource[]
): FounderLearningProfile {
  const resourceMap = new Map(resources.map(r => [r.id, r]));

  const completed = interactions.filter(i => i.interactionType === 'completed');
  const tried = interactions.filter(i => i.interactionType === 'tried');
  const saved = interactions.filter(i => i.interactionType === 'saved');

  const completedCount = completed.length;
  const toolsTried = tried.length;

  let articlesRead = 0;
  let coursesCompleted = 0;
  const skillsLearned = new Set<string>();
  const topicsExplored = new Set<string>();

  // Skill mastery counters
  let techScore = 20;
  let prodScore = 20;
  let mktScore = 20;
  let salesScore = 15;
  let opsScore = 20;

  for (const item of completed) {
    const res = resourceMap.get(item.resourceId);
    if (!res) continue;

    if (res.resourceType === 'article' || res.resourceType === 'newsletter') {
      articlesRead++;
    } else if (res.resourceType === 'course' || res.resourceType === 'program') {
      coursesCompleted++;
    }

    res.tags.forEach(t => topicsExplored.add(t));
    res.skillsRequired.forEach(s => skillsLearned.add(s));

    if (res.category === 'BUILD') {
      techScore += 12;
    } else if (res.category === 'LEARN') {
      prodScore += 10;
      mktScore += 8;
      salesScore += 8;
    } else if (res.category === 'READ') {
      mktScore += 6;
      opsScore += 6;
    } else if (res.category === 'DISCOVER') {
      opsScore += 8;
      techScore += 6;
    }
  }

  for (const item of tried) {
    const res = resourceMap.get(item.resourceId);
    if (!res) continue;
    if (res.category === 'BUILD') techScore += 8;
    res.skillsRequired.forEach(s => skillsLearned.add(s));
  }

  // Calculate gaps
  const gaps: string[] = [];
  if (techScore < 40) gaps.push('Open-source developer workflow & agent tooling');
  if (prodScore < 40) gaps.push('User interview validation & Mom Test questioning');
  if (mktScore < 40) gaps.push('Zero-budget community distribution channels');
  if (salesScore < 30) gaps.push('Direct founder sales outreach & pricing strategy');
  if (opsScore < 35) gaps.push('Cohort retention metrics & funnel diagnostics');

  return {
    completedCount,
    articlesRead,
    toolsTried,
    coursesCompleted,
    skillsLearned: Array.from(skillsLearned),
    topicsExplored: Array.from(topicsExplored),
    skillMastery: {
      technical: Math.min(100, techScore),
      product: Math.min(100, prodScore),
      marketing: Math.min(100, mktScore),
      sales: Math.min(100, salesScore),
      operations: Math.min(100, opsScore)
    },
    gapsIdentified: gaps.length > 0 ? gaps : ['Keep exploring high-leverage growth playbooks']
  };
}
