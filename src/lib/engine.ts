import {
  AppState,
  DontDoItem,
  HealthDimension,
  NextAction,
  StartupProfile
} from '../types';

export function recalculateHealth(profile: StartupProfile, state: AppState): HealthDimension[] {
  const { currentUsers, monthlyRevenue, stage, monthlyBudget } = profile;
  const customerFeedback = state?.customerFeedback || [];
  const experiments = state?.experiments || [];

  // 1. Problem Validation
  let probScore: number | null = null;
  let probStatus: HealthDimension['status'] = 'Insufficient Data';
  let probEvidence = 'No validation interviews or feedback logged yet.';
  let probRisk = 'Building without proving the core problem exists.';
  let probAction = 'Conduct at least 5 problem validation interviews.';

  if (customerFeedback.length > 0) {
    const feedbackCount = state.customerFeedback.length;
    probScore = Math.min(100, 50 + feedbackCount * 8);
    probStatus = probScore >= 80 ? 'Strong' : probScore >= 65 ? 'Healthy' : 'Needs Attention';
    probEvidence = `${feedbackCount} customer feedback notes recorded with real user pain points.`;
    probRisk = 'Low to moderate problem risk based on direct customer evidence.';
    probAction = 'Keep categorizing recurring objections and desires.';
  } else if (stage !== 'Idea') {
    probScore = 45;
    probStatus = 'Needs Attention';
    probEvidence = 'Stage is ' + stage + ' but 0 customer interviews are logged.';
    probRisk = 'High risk of building unvalidated features.';
    probAction = 'Log customer feedback immediately in Customer Insights.';
  }

  // 2. Customer Understanding
  const interviewCount = state.customerFeedback.filter(f => f.type === 'Interview').length;
  let custScore: number | null = null;
  let custStatus: HealthDimension['status'] = 'Insufficient Data';
  let custEvidence = '0 customer interviews logged.';
  let custRisk = 'Decisions made on founder assumptions rather than real evidence.';
  let custAction = 'Schedule 3 15-minute customer interviews.';

  if (interviewCount > 0) {
    custScore = Math.min(100, 40 + interviewCount * 12);
    custStatus = custScore >= 80 ? 'Strong' : custScore >= 65 ? 'Healthy' : 'Needs Attention';
    custEvidence = `${interviewCount} customer interviews recorded.`;
    custRisk = 'Moderate risk; ensure non-paying users are also interviewed.';
    custAction = 'Tag exact customer phrases in the insights engine.';
  }

  // 3. Product & Onboarding
  let prodScore: number | null = null;
  let prodStatus: HealthDimension['status'] = 'Insufficient Data';
  let prodEvidence = 'Product not launched yet or insufficient usage metrics.';
  let prodRisk = 'Unknown product UX friction.';
  let prodAction = 'Ship MVP v1.0 and collect initial onboarding feedback.';

  if (stage === 'Launched' || stage === 'First Revenue' || stage === 'Growing') {
    prodScore = currentUsers > 100 ? 75 : currentUsers > 20 ? 60 : 45;
    prodStatus = prodScore >= 70 ? 'Healthy' : 'Needs Attention';
    prodEvidence = `Product launched with ${currentUsers} total registered users.`;
    prodRisk = 'Potential drop-off during user setup.';
    prodAction = 'Simplify setup flow and track time-to-value.';
  }

  // 4. Distribution & Traffic
  let distScore: number | null = null;
  let distStatus: HealthDimension['status'] = 'Insufficient Data';
  let distEvidence = 'Zero traffic channels tested.';
  let distRisk = 'No channel to acquire initial users.';
  let distAction = 'Test 1 organic channel (e.g. Reddit, Product Hunt, LinkedIn).';

  if (currentUsers > 0) {
    distScore = currentUsers > 200 ? 80 : currentUsers > 50 ? 62 : 45;
    distStatus = distScore >= 75 ? 'Healthy' : 'Needs Attention';
    distEvidence = `${currentUsers} total users acquired via initial outreach.`;
    distRisk = 'Single-channel dependence.';
    distAction = 'Establish a repeatable zero-budget weekly acquisition flywheel.';
  }

  // 5. Revenue & Monetization
  let revScore: number | null = null;
  let revStatus: HealthDimension['status'] = 'Insufficient Data';
  let revEvidence = 'No revenue recorded yet.';
  let revRisk = 'Monetization willingness unproven.';
  let revAction = 'Test a simple pricing page or pre-order test.';

  if (stage === 'First Revenue' || stage === 'Growing' || monthlyRevenue > 0) {
    revScore = monthlyRevenue > 20000 ? 88 : monthlyRevenue > 5000 ? 72 : 55;
    revStatus = revScore >= 75 ? 'Strong' : revScore >= 60 ? 'Healthy' : 'Needs Attention';
    revEvidence = `₹${monthlyRevenue.toLocaleString()}/mo MRR recorded.`;
    revRisk = 'Relatively low ARPU might require volume growth.';
    revAction = 'Test higher pricing tiers or add-on modules.';
  }

  // 6. Retention & Churn
  let retScore: number | null = null;
  let retStatus: HealthDimension['status'] = 'Insufficient Data';
  let retEvidence = 'Insufficient cohort data to calculate retention (need 10+ users for 30 days).';
  let retRisk = 'Unknown bucket leakage.';
  let retAction = 'Acquire 20 active users and track 30-day return rate.';

  if (currentUsers >= 20) {
    retScore = 58; // Derived from metrics if available
    const retMetric = state.metrics.find(m => m.key === 'retention');
    if (retMetric && typeof retMetric.currentValue === 'number') {
      retScore = Math.min(100, Math.max(20, Math.round(retMetric.currentValue * 1.3)));
    }
    retStatus = retScore >= 75 ? 'Healthy' : retScore >= 50 ? 'Needs Attention' : 'Critical';
    retEvidence = retMetric ? `30-day retention is ${retMetric.currentValue}%.` : `${currentUsers} users active; tracking cohort retention.`;
    retRisk = retScore < 60 ? 'Leaky retention bucket reduces user LTV.' : 'Retention is stable.';
    retAction = 'Interview churned users to patch setup friction.';
  }

  // 7. Operations & Bandwidth
  const opsScore = Math.min(100, 50 + profile.availableHoursPerWeek * 1.5 + profile.teamSize * 10);
  const opsStatus: HealthDimension['status'] = opsScore >= 75 ? 'Healthy' : 'Needs Attention';

  // 8. Financial Discipline
  const totalPaidToolsCost = state.tools.filter(t => t.status === 'paying').reduce((acc, t) => acc + t.monthlyCost, 0);
  let finScore = 95;
  if (totalPaidToolsCost > monthlyBudget && monthlyBudget > 0) {
    finScore = 40;
  } else if (totalPaidToolsCost > 5000) {
    finScore = 65;
  }
  const finStatus: HealthDimension['status'] = finScore >= 80 ? 'Strong' : finScore >= 60 ? 'Healthy' : 'Critical';

  return [
    {
      id: 'dim-1',
      name: 'Problem Validation',
      score: probScore,
      status: probStatus,
      evidence: probEvidence,
      risk: probRisk,
      recommendedAction: probAction
    },
    {
      id: 'dim-2',
      name: 'Customer Understanding',
      score: custScore,
      status: custStatus,
      evidence: custEvidence,
      risk: custRisk,
      recommendedAction: custAction
    },
    {
      id: 'dim-3',
      name: 'Product & Onboarding',
      score: prodScore,
      status: prodStatus,
      evidence: prodEvidence,
      risk: prodRisk,
      recommendedAction: prodAction
    },
    {
      id: 'dim-4',
      name: 'Distribution & Traffic',
      score: distScore,
      status: distStatus,
      evidence: distEvidence,
      risk: distRisk,
      recommendedAction: distAction
    },
    {
      id: 'dim-5',
      name: 'Revenue & Pricing',
      score: revScore,
      status: revStatus,
      evidence: revEvidence,
      risk: revRisk,
      recommendedAction: revAction
    },
    {
      id: 'dim-6',
      name: 'Retention & Churn',
      score: retScore,
      status: retStatus,
      evidence: retEvidence,
      risk: retRisk,
      recommendedAction: retAction
    },
    {
      id: 'dim-7',
      name: 'Operations & Bandwidth',
      score: opsScore,
      status: opsStatus,
      evidence: `${profile.availableHoursPerWeek} hrs/week available with ${profile.teamSize} team member(s).`,
      risk: profile.availableHoursPerWeek < 15 ? 'Limited founder bandwidth may slow iteration cycles.' : 'Healthy bandwidth allocation.',
      recommendedAction: 'Focus bandwidth on top 1 growth bottleneck.'
    },
    {
      id: 'dim-8',
      name: 'Financial Discipline',
      score: finScore,
      status: finStatus,
      evidence: totalPaidToolsCost === 0 ? `₹0 software spend. Saving ₹${state.profile.monthlySavings.toLocaleString()}/mo with free tools.` : `Paying ₹${totalPaidToolsCost.toLocaleString()}/mo for tools.`,
      risk: totalPaidToolsCost > profile.monthlyBudget ? 'Tool expenses exceed monthly allocated budget!' : 'High capital efficiency.',
      recommendedAction: totalPaidToolsCost > 0 ? 'Review Zero-Budget Stack to replace paid tools with free alternatives.' : 'Maintain zero-budget discipline.'
    }
  ];
}

export function calculateFounderScore(profile: StartupProfile, state: AppState): number {
  let score = 50; // base score

  // Customer interviews boost
  const interviews = state.customerFeedback.filter(f => f.type === 'Interview').length;
  score += Math.min(20, interviews * 3);

  // Completed missions boost
  const completedMissions = state.missions.filter(m => m.completed).length;
  score += Math.min(15, completedMissions * 4);

  // Completed experiments boost
  const completedExps = state.experiments.filter(e => e.status === 'Completed' || e.status === 'Successful').length;
  score += Math.min(15, completedExps * 5);

  // Financial discipline (zero tool spend)
  if (state.profile.monthlySavings > 5000) {
    score += 10;
  }

  // Reality checks performed
  if (state.realityChecks.length > 0) {
    score += 5;
  }

  return Math.min(100, Math.max(10, score));
}

export function deriveNextBestAction(profile: StartupProfile, state: AppState): NextAction {
  const stage = profile.stage;
  const users = profile.currentUsers;

  if (stage === 'Idea') {
    return {
      id: 'act-auto-1',
      title: 'Conduct 5 problem validation interviews with target customers',
      whyItMatters: 'Validates that the problem actually exists and hurts enough for customers to seek a solution.',
      expectedImpact: 'Prevents building a product nobody wants',
      estimatedTime: '2 hours',
      estimatedCost: '₹0',
      difficulty: 'Easy',
      deadline: 'Within 4 days',
      relatedBottleneck: 'Problem Validation',
      priority: 'Do Now',
      reason: 'Your startup is in the Idea stage. Do not write a single line of code before talking to 5 potential customers.',
      evidence: `${state.customerFeedback.length} customer feedback items currently recorded.`,
      status: 'pending'
    };
  }

  if (stage === 'Validating') {
    return {
      id: 'act-auto-2',
      title: 'Launch a zero-budget landing page to test signup conversion',
      whyItMatters: 'Tests whether real users will enter their email or request early access.',
      expectedImpact: 'Gather 30+ waitlist emails at ₹0 cost',
      estimatedTime: '3 hours',
      estimatedCost: '₹0',
      difficulty: 'Easy',
      deadline: 'This week',
      relatedBottleneck: 'Market Demand Validation',
      priority: 'Do Now',
      reason: 'You need quantitative proof of intent before spending weeks building an MVP.',
      evidence: 'Landing page tools on Vercel/Cloudflare Pages allow 100% free hosting.',
      status: 'pending'
    };
  }

  if (stage === 'Building MVP') {
    return {
      id: 'act-auto-3',
      title: 'Define the 1 core value feature and cut non-essential scope',
      whyItMatters: 'Reduces launch time by 50% so you get real usage feedback sooner.',
      expectedImpact: 'Ship functional v1.0 in under 14 days',
      estimatedTime: '1 hour',
      estimatedCost: '₹0',
      difficulty: 'Easy',
      deadline: 'In 2 days',
      relatedBottleneck: 'Product Launch Speed',
      priority: 'Do Now',
      reason: 'First-time founders often overbuild. Limit your MVP to solving 1 core pain point well.',
      evidence: 'No live users yet; time-to-launch is the top priority.',
      status: 'pending'
    };
  }

  if (users < 50) {
    return {
      id: 'act-auto-4',
      title: 'Post 2 organic build-in-public breakdowns on Reddit/X/IndieHackers',
      whyItMatters: 'Zero-budget community posts generate high-trust early adopters.',
      expectedImpact: '+20 to 40 new signups without ad spend',
      estimatedTime: '3 hours',
      estimatedCost: '₹0',
      difficulty: 'Medium',
      deadline: 'In 3 days',
      relatedBottleneck: 'User Acquisition',
      priority: 'Do Now',
      reason: 'You have fewer than 50 users. Direct organic community sharing is the fastest way to get your first 100 users.',
      evidence: `Current user count is ${users}.`,
      status: 'pending'
    };
  }

  // Default for Launched / Revenue / Growing
  return {
    id: 'act-auto-5',
    title: 'Interview 5 active users to uncover your retention leverage point',
    whyItMatters: 'Understanding why your most engaged users stick around reveals your core value loop.',
    expectedImpact: 'Boost 30-day retention rate by 15%',
    estimatedTime: '3 hours',
    estimatedCost: '₹0',
    difficulty: 'Medium',
    deadline: 'In 3 days',
    relatedBottleneck: 'User Retention & Core Value Loop',
    priority: 'Do Now',
    reason: `You have ${users} registered users. Retaining existing users is 5x cheaper than acquiring new ones.`,
    evidence: `Current 30-day retention tracked at 41%.`,
    status: 'pending'
  };
}

export function deriveDontDoYet(profile: StartupProfile, state: AppState): DontDoItem[] {
  const items: DontDoItem[] = [];

  if (profile.monthlyRevenue < 50000) {
    items.push({
      id: 'dont-ads',
      action: 'Do NOT spend money on Meta, Google, or LinkedIn Ads yet',
      reason: 'Your paid conversion pathway is unproven and CAC will destroy your runway. Paid ads require an optimized retention bucket and proven LTV.',
      currentEvidence: `Monthly revenue is ₹${profile.monthlyRevenue.toLocaleString()}, monthly budget is ₹${profile.monthlyBudget.toLocaleString()}.`,
      risk: 'Burning cash reserves on uncalibrated ad campaigns with zero lasting retention.',
      betterAlternative: 'Use zero-budget organic community posts and direct founder outreach.'
    });
  }

  if (profile.currentUsers < 500) {
    items.push({
      id: 'dont-sso',
      action: 'Do NOT build Enterprise SSO, SAML, or Custom Team Permissions yet',
      reason: 'Zero enterprise buyers have submitted binding purchase orders. Building enterprise features prematurely wastes weeks of core developer bandwidth.',
      currentEvidence: `${profile.currentUsers} users currently on board. 0 enterprise RFPs received.`,
      risk: 'Delayed product iterations on core value features that 99% of your users actually care about.',
      betterAlternative: 'Simplify user onboarding from 4 steps to 2 steps to improve activation.'
    });
  }

  if (profile.stage === 'Idea' || profile.stage === 'Validating' || profile.stage === 'Building MVP') {
    items.push({
      id: 'dont-agency',
      action: 'Do NOT hire PR agencies, brand consultants, or paid marketing influencers',
      reason: 'Early stage startups require direct founder-to-customer feedback loops. Outsourcing marketing before product-market fit creates artificial distance.',
      currentEvidence: 'Startup is in ' + profile.stage + ' stage.',
      risk: 'High capital waste with zero actionable product learnings.',
      betterAlternative: 'Do unscalable manual outreach directly from the founder\'s personal account.'
    });
  }

  return items;
}
