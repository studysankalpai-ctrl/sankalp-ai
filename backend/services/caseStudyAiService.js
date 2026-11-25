/**
 * SANKALP AI - Autonomous Business Case Study Simulation & Strategy War Room Engine
 * 
 * Generates dynamic, high-stakes corporate dilemmas, simulates multi-turn market consequences,
 * and performs in-depth Critical & Logical Thinking diagnostics for MBA & business students.
 */

const { chatCompletion } = require('./groqService');

// High-quality fallback preset dilemmas for instant play without waiting or without API key
const PRESET_CASES = [
  {
    id: 'ev-battery-crisis',
    domain: 'Product Safety & Crisis Management',
    company_name: 'VoltRide Mobility',
    industry: 'Electric Vehicles & Clean Mobility',
    headline: '500 Thermal Runaway Incidents Reported in Maharashtra Region',
    background: 'VoltRide is India\'s fastest-growing EV 2-wheeler startup, with 85,000 scooters on the road. Founded by IIT grads, the company raised ₹150 Cr in Series B last year and is preparing for an IPO in 18 months.',
    crisis_context: 'Over the last 72 hours, 6 scooters caught fire due to thermal runaway in high temperatures. Social media is trending #BoycottVoltRide. The Ministry of Transport has issued a show-cause notice demanding an explanation within 48 hours.',
    financial_vitals: {
      cash: 240000000, // ₹24 Cr
      burn_rate: 35000000, // ₹3.5 Cr/mo
      runway_days: 68,
      market_share: 16, // %
      team_morale: 72, // %
      brand_trust: 85, // %
      risk_level: 'Critical',
    },
    stakeholders: [
      {
        role: 'Chief Financial Officer (Rohan Mehta)',
        stance: 'Financial Survival & Cash Preservation',
        statement: 'A complete recall will cost ₹65 Crore and shut down manufacturing for 6 weeks. We only have ₹24 Cr in liquid cash. If you recall every scooter, VoltRide will go into insolvency before Diwali. We must patch the battery management firmware silently.',
        avatar_color: 'amber',
      },
      {
        role: 'Chief Technology Officer (Dr. Ananya Rao)',
        stance: 'Engineering Ethics & Safety First',
        statement: 'Firmware cannot fix a hardware thermal design flaw. If even one more scooter burns and someone gets injured, our brand is permanently dead and criminal negligence charges will follow. We must announce a voluntary recall of the specific batch immediately.',
        avatar_color: 'rose',
      },
      {
        role: 'Lead Investor (Karan Singhal, Peak Ventures)',
        stance: 'Valuation & IPO Narrative Defense',
        statement: 'The media cycle has a 48-hour attention span. Do not admit liability publicly. Blame third-party charging cables or improper user charging habits, offer free inspections, and keep the assembly line rolling. If our monthly numbers drop by 20%, the IPO is canceled.',
        avatar_color: 'indigo',
      },
    ],
    decision_prompt: 'You are the Chief Executive Officer (CEO) of VoltRide. The national press conference is in 3 hours, and the Ministry deadline is tomorrow morning. What is your strategic battle plan for the next 30 days?',
    quick_options: [
      'Announce immediate voluntary recall of 12,000 suspect batch scooters, pause sales, and conduct live transparent safety demonstrations.',
      'Deploy an emergency over-the-air (OTA) battery safety software limit (capping top speed by 15%), offer free 24-point dealer checkups, and avoid legal recall terminology.',
      'File legal notice against the foreign battery cell supplier for substandard deliveries, while establishing a ₹10 Cr Customer Safety Relief Fund.',
    ],
  },
  {
    id: 'quick-commerce-runway',
    domain: 'Unit Economics & Cash Burn Survival',
    company_name: 'SpeedCart India',
    industry: 'Quick Commerce & Hyperlocal Logistics',
    headline: '45 Days of Runway Left: Investor Demands 50% Store Closures',
    background: 'SpeedCart delivers groceries in 10 minutes across 6 metro cities through 120 dark stores. The company raised ₹200 Cr, but customer acquisition costs (CAC) skyrocketed as giants like Blinkit and Zepto entered their territories with deep discounts.',
    crisis_context: 'Monthly cash burn is ₹6 Crore with only ₹9 Crore cash left in the bank (45 days runway). The lead Series C term sheet was suddenly paused due to global tech slowdown. The existing board demands either immediate positive unit economics or an emergency fire-sale to a competitor.',
    financial_vitals: {
      cash: 90000000, // ₹9 Cr
      burn_rate: 60000000, // ₹6 Cr/mo
      runway_days: 45,
      market_share: 11, // %
      team_morale: 65, // %
      brand_trust: 78, // %
      risk_level: 'High',
    },
    stakeholders: [
      {
        role: 'Chief Operating Officer (Vikram Sethi)',
        stance: 'Scale & Defend Territory',
        statement: 'If we close 50 dark stores, our network density breaks. Delivery times will jump from 10 mins to 35 mins, our loyal subscribers will cancel, and our delivery rider fleet will defect to competitors overnight. We must borrow bridge debt and fight for market share.',
        avatar_color: 'blue',
      },
      {
        role: 'Chief Financial Officer (Sunita Verma)',
        stance: 'Ruthless Cost Slashing',
        statement: 'Vikram is hallucinating. Debt is impossible right now. We must immediately shut down the 60 most unprofitable dark stores, lay off 35% of corporate staff, introduce a mandatory ₹15 handling fee per order, and focus exclusively on high-margin South Mumbai and South Delhi.',
        avatar_color: 'amber',
      },
      {
        role: 'Board Representative (Aman Chopra, Titan Capital)',
        stance: 'Fire-Sale Acquisition Exit',
        statement: 'A leading e-commerce conglomerate is offering ₹120 Cr in all-stock merger to absorb our rider network and tech. The founders get dilution, but nobody goes bankrupt. If you reject this offer and run out of cash in 40 days, the company is liquidated at zero.',
        avatar_color: 'purple',
      },
    ],
    decision_prompt: 'As Co-Founder & CEO of SpeedCart, you have 45 days of cash remaining. What is your turnaround plan to keep the company alive and avoid total equity wipeout?',
    quick_options: [
      'Execute aggressive restructuring: Shut down 50 unprofitable stores, cut burn by 65%, add ₹15 handling fee, and pivot towards high-margin gourmet items.',
      'Reject store closures: Secure emergency venture-debt bridge of ₹15 Cr at 18% interest, double down on top 30 pin-codes with hyper-targeted retention subscriptions.',
      'Accept the acquisition term sheet with the e-commerce conglomerate, negotiate 2-year leadership earn-outs and rider employment protections.',
    ],
  },
  {
    id: 'fmcg-hostile-price-war',
    domain: 'Competitive Strategy & Pricing Defense',
    company_name: 'Prakriti Organic Dairy',
    industry: 'Premium FMCG & Organic Food',
    headline: 'Conglomerate Launches 45% Cheaper Organic Milk Clone in Home State',
    background: 'Prakriti is a beloved regional brand operating in Uttar Pradesh and Delhi NCR, supplying A2 pure organic cow milk and desi ghee to 140,000 households at ₹85/litre with 28% gross margins. 12,000 rural farmers are locked in direct procurement contracts.',
    crisis_context: 'National FMCG conglomerate "MegaFoods" has launched "NaturePure A2 Milk" at ₹48/litre—underpricing Prakriti by 45%. MegaFoods is offering regional retailers 3x dealer margins and flood-marketing television and billboards.',
    financial_vitals: {
      cash: 140000000, // ₹14 Cr
      burn_rate: 12000000, // ₹1.2 Cr/mo
      runway_days: 350,
      market_share: 32, // %
      team_morale: 88, // %
      brand_trust: 94, // %
      risk_level: 'Moderate',
    },
    stakeholders: [
      {
        role: 'VP of Sales & Distribution (Manoj Trivedi)',
        stance: 'Immediate Price Matching',
        statement: 'Retailers are already pushing Prakriti to the bottom shelf. If we do not drop our price to ₹55 immediately and offer matching dealer commissions, 50% of our retail volume will vanish by next month.',
        avatar_color: 'amber',
      },
      {
        role: 'Head of Farmer Procurement (Rajeshwar Singh)',
        stance: 'Protect Farmer Trust & Quality',
        statement: 'Dropping price to ₹55 means cutting milk procurement payout to our 12,000 village farmers by ₹18/litre. They will default on cattle loans, lose trust, and sell their milk to local middlemen. Our entire organic purity integrity will be destroyed.',
        avatar_color: 'emerald',
      },
      {
        role: 'Chief Marketing Officer (Pooja Nair)',
        stance: 'Brand Differentiation & Premium Moat',
        statement: 'MegaFoods is blending reconstituted skimmed milk powder with synthetic A2 labeling. Do not fight them on price—we will lose against their deep pockets. Instead, launch an aggressive purity verification campaign, open-source our lab testing, and launch doorstep D2C farm visits.',
        avatar_color: 'indigo',
      },
    ],
    decision_prompt: 'As the Managing Director of Prakriti, how will you protect your market share, preserve farmer procurement economics, and defeat a well-funded predator?',
    quick_options: [
      'Maintain premium ₹85 price: Launch direct lab purity comparison campaign (#KnowYourMilk) and offer free doorstep test kits to prove the competitor is using diluted powder.',
      'Launch a fighting fighter brand ("Prakriti Daily") at ₹52/litre while keeping the flagship A2 Organic brand at ₹85 to protect margins.',
      'Pivot 100% to direct-to-home subscription app deliveries, bypassing physical retailers and passing ₹8/litre margins directly to consumers.',
    ],
  },
];

function extractCleanJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    // Try regex extraction of JSON block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i) || text.match(/(\{[\s\S]*\})/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

/**
 * 1. Generate Dynamic Case Study Dilemma
 */
async function generateCaseStudy({ domain = 'startup', apiKey, model }) {
  // If no apiKey provided, return one of the rich curated presets instantly!
  if (!apiKey || !apiKey.trim().startsWith('gsk_')) {
    const randomIndex = Math.floor(Math.random() * PRESET_CASES.length);
    return PRESET_CASES[randomIndex];
  }

  const systemPrompt = `You are a Senior Harvard Business School & McKinsey Case Method Professor.
Generate a high-stakes, realistic, and intellectually rigorous business dilemma for an executive MBA / business leader simulation.
The case must test Critical Thinking, Second-Order Thinking, and Resource Trade-offs. There should be NO easy or perfect answers.

You MUST respond strictly with a valid JSON object matching this exact structure:
{
  "id": "slug-name",
  "domain": "Domain Name (e.g. Hostile Takeover / Runway Crisis / Crisis Management)",
  "company_name": "Company Name",
  "industry": "Industry Sector",
  "headline": "Punchy Breaking News Crisis Headline",
  "background": "3-4 sentence background of company traction and size",
  "crisis_context": "The critical dilemma, stakes, and ticking clock",
  "financial_vitals": {
    "cash": 180000000,
    "burn_rate": 25000000,
    "runway_days": 60,
    "market_share": 15,
    "team_morale": 75,
    "brand_trust": 80,
    "risk_level": "Critical"
  },
  "stakeholders": [
    {
      "role": "Chief Financial Officer (Name)",
      "stance": "Stance Name",
      "statement": "Direct, passionate, numbers-driven quote stating their point of view.",
      "avatar_color": "amber"
    },
    {
      "role": "Head of Product / Ops / Quality (Name)",
      "stance": "Stance Name",
      "statement": "Direct quote defending customer trust or execution reality.",
      "avatar_color": "rose"
    },
    {
      "role": "Lead Investor / Board Chair (Name)",
      "stance": "Stance Name",
      "statement": "Direct quote applying high-pressure commercial or survival demands.",
      "avatar_color": "indigo"
    }
  ],
  "decision_prompt": "Specific question asking the student for their 30-day strategic action plan.",
  "quick_options": [
    "Option A description (Bold aggressive route)",
    "Option B description (Defensive cost-cutting route)",
    "Option C description (Diplomatic or hybrid route)"
  ]
}`;

  const userPrompt = `Generate an intense business dilemma for theme: "${domain}". Focus on Indian or global emerging markets (Fintech, Quick-Commerce, EV, HealthTech, D2C, Manufacturing, or Enterprise SaaS). Make financial metrics realistic. Output ONLY raw JSON.`;

  try {
    const aiResp = await chatCompletion({
      apiKey,
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const parsed = extractCleanJson(aiResp.content);
    if (parsed && parsed.company_name && parsed.stakeholders?.length >= 3) {
      return parsed;
    }
    // Fallback to presets if parsing failed
    return PRESET_CASES[0];
  } catch (err) {
    console.warn('[CaseStudy AI] Generation failed, serving curated preset:', err.message);
    const randomIndex = Math.floor(Math.random() * PRESET_CASES.length);
    return PRESET_CASES[randomIndex];
  }
}

/**
 * 2. Simulate Turn & Unintended Consequences ("30 Days Later...")
 */
async function simulateTurn({ scenario, current_vitals, turn_number = 1, student_decision, decision_history = [], apiKey, model }) {
  if (!apiKey || !apiKey.trim().startsWith('gsk_')) {
    // Deterministic simulation fallback
    const cashDelta = turn_number === 1 ? -45000000 : -25000000;
    const shareDelta = student_decision.toLowerCase().includes('cut') || student_decision.toLowerCase().includes('recall') ? -3 : 2;
    const moraleDelta = student_decision.toLowerCase().includes('layoff') || student_decision.toLowerCase().includes('cut') ? -15 : 5;
    const trustDelta = student_decision.toLowerCase().includes('recall') || student_decision.toLowerCase().includes('transparent') ? 12 : -8;

    const updatedCash = Math.max(10000000, (current_vitals?.cash || 100000000) + cashDelta);
    const updatedBurn = Math.max(10000000, (current_vitals?.burn_rate || 20000000) - 5000000);
    const updatedRunway = Math.round(updatedCash / (updatedBurn / 30));

    return {
      time_jump_label: turn_number === 1 ? '30 Days Later — Market Reaction & Second-Order Effects' : '60 Days Later — Final Climax & Resolution',
      news_headline: turn_number === 1 ? `${scenario.company_name} Shares Volatile as Market Reacts to Strategic Shift` : `${scenario.company_name} Enters Critical Final Quarter Facing Competitor Counter-Attack`,
      market_reaction: `Following your decision, the immediate market pressure shifted dramatically. Customers took note of your stance, but competitors responded aggressively by launching targeted counter-marketing. While cash burn moderated slightly, organizational friction created new operational bottlenecks that demand urgent resolution.`,
      unintended_consequence: `Because of your aggressive resource reallocation, your key distribution channel reported delivery delays of 48 hours, causing a cluster of high-value corporate clients to request refunds.`,
      new_vitals: {
        cash: updatedCash,
        burn_rate: updatedBurn,
        runway_days: updatedRunway,
        market_share: Math.max(1, Math.min(100, (current_vitals?.market_share || 15) + shareDelta)),
        team_morale: Math.max(1, Math.min(100, (current_vitals?.team_morale || 70) + moraleDelta)),
        brand_trust: Math.max(1, Math.min(100, (current_vitals?.brand_trust || 75) + trustDelta)),
        risk_level: updatedRunway < 30 ? 'Extreme Danger' : updatedRunway < 60 ? 'High' : 'Moderate',
      },
      deltas: {
        cash_delta: cashDelta,
        market_share_delta: shareDelta,
        morale_delta: moraleDelta,
        trust_delta: trustDelta,
      },
      next_dilemma: turn_number === 1
        ? 'Your initial move stabilized the core bleeding, but now your largest supplier demands cash advance payments before releasing next month\'s inventory. How do you respond?'
        : null,
      is_final: turn_number >= 2,
    };
  }

  const systemPrompt = `You are the Market & Economic Simulator for a high-stakes business war room.
The student (CEO) has made a strategic decision to resolve the company's crisis.
Analyze their decision with realistic corporate economics, game theory, and human psychology.
Calculate the "30 Days Later" consequences:
1. Every decision has an upside AND a harsh unintended side-effect (second-order consequence).
2. Competitors do not sit idle; they counter-attack.
3. Update financial and operational vitals realistically with exact numeric deltas.

Return ONLY a valid JSON object matching this structure:
{
  "time_jump_label": "30 Days Later — Market Impact",
  "news_headline": "Realistic Press / Media Ticker Headline",
  "market_reaction": "2 paragraphs describing customer, competitor, and market reactions in crisp corporate tone.",
  "unintended_consequence": "The specific surprise problem or ripple effect caused by the student's own action.",
  "new_vitals": {
    "cash": 160000000,
    "burn_rate": 20000000,
    "runway_days": 80,
    "market_share": 13,
    "team_morale": 60,
    "brand_trust": 88,
    "risk_level": "Moderate"
  },
  "deltas": {
    "cash_delta": -20000000,
    "market_share_delta": -2,
    "morale_delta": -15,
    "trust_delta": 8
  },
  "next_dilemma": "${turn_number === 1 ? 'Next critical crisis prompt arising from their action...' : null}",
  "is_final": ${turn_number >= 2}
}`;

  const userPrompt = `Company: ${scenario.company_name} (${scenario.industry})
Original Crisis: ${scenario.headline}
Current Vitals: Cash ₹${current_vitals.cash}, Burn ₹${current_vitals.burn_rate}/mo, Runway ${current_vitals.runway_days}d, Share ${current_vitals.market_share}%, Morale ${current_vitals.team_morale}%, Trust ${current_vitals.brand_trust}%
Turn Number: ${turn_number}
Decision History: ${JSON.stringify(decision_history)}

Student CEO's Action:
"${student_decision}"

Simulate realistic 30-day ripple consequences and update vitals. Return ONLY JSON.`;

  try {
    const aiResp = await chatCompletion({
      apiKey,
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 2500,
    });

    const parsed = extractCleanJson(aiResp.content);
    if (parsed && parsed.new_vitals && parsed.market_reaction) {
      return parsed;
    }
    throw new Error('Could not parse simulation JSON');
  } catch (err) {
    console.warn('[CaseStudy AI] Simulation failed, using fallback:', err.message);
    const cashDelta = -25000000;
    return {
      time_jump_label: '30 Days Later — Market Realignment',
      news_headline: `${scenario.company_name} Navigates Tough Transition Amid Competitive Scrutiny`,
      market_reaction: `Your decision has been executed across operations. Customers responded favorably to the decisive leadership, but internal resource friction has surfaced. The financial burn has been adjusted while customer retention remains in balance.`,
      unintended_consequence: `Key supply chain vendors have increased their payment guarantees, placing short-term strain on working capital reserves.`,
      new_vitals: {
        cash: Math.max(10000000, (current_vitals?.cash || 50000000) + cashDelta),
        burn_rate: Math.max(5000000, (current_vitals?.burn_rate || 20000000) - 3000000),
        runway_days: Math.round(((current_vitals?.cash || 50000000) + cashDelta) / (((current_vitals?.burn_rate || 20000000) - 3000000) / 30)),
        market_share: current_vitals?.market_share || 15,
        team_morale: Math.max(20, (current_vitals?.team_morale || 70) - 5),
        brand_trust: Math.min(100, (current_vitals?.brand_trust || 75) + 5),
        risk_level: 'Moderate',
      },
      deltas: {
        cash_delta: cashDelta,
        market_share_delta: 0,
        morale_delta: -5,
        trust_delta: 5,
      },
      next_dilemma: turn_number === 1 ? 'Your actions stabilized operations, but key stakeholders demand an updated 12-month capital roadmap. What is your final strategic directive?' : null,
      is_final: turn_number >= 2,
    };
  }
}

/**
 * 3. Deep Critical Thinking & Cognitive Audit
 */
async function evaluateSimulation({ scenario, decisions, history, final_vitals, apiKey, model }) {
  if (!apiKey || !apiKey.trim().startsWith('gsk_')) {
    const isSuccess = (final_vitals?.cash || 0) > 20000000 && (final_vitals?.brand_trust || 0) > 60;
    return {
      survival_verdict: isSuccess ? 'SURVIVED WITH STRATEGIC MOAT' : 'SURVIVED WITH CRITICAL VULNERABILITIES',
      verdict_badge: isSuccess ? 'SUCCESS' : 'CAUTION',
      executive_summary: `You steered ${scenario.company_name} through an existential crisis with decisive resource trade-offs. While you absorbed short-term operational turbulence, your refusal to take knee-jerk panic moves preserved enterprise equity.`,
      critical_thinking_metrics: {
        second_order_thinking: {
          score: 84,
          grade: 'A',
          analysis: 'You anticipated competitor responses rather than merely treating the immediate symptom.',
        },
        risk_management: {
          score: 79,
          grade: 'B+',
          analysis: 'Balanced cash runway protection against brand reputation without gambling total balance sheet solvency.',
        },
        stakeholder_diplomacy: {
          score: 88,
          grade: 'A',
          analysis: 'Effectively managed conflicting priorities between financial solvency and operational integrity.',
        },
        capital_efficiency: {
          score: 75,
          grade: 'B',
          analysis: 'Burn rate was contained, though working capital reserves experienced temporary shock.',
        },
      },
      biases_detected: [
        {
          bias_name: 'Loss Aversion Check',
          description: 'Demonstrated controlled appetite for short-term pain in exchange for long-term survival.',
        },
        {
          bias_name: 'Status Quo Bias Resistance',
          description: 'Avoided the trap of waiting for complete consensus before executing tactical interventions.',
        },
      ],
      devils_advocate: `What if you had adopted a pure high-margin pivot from Day 1? You would have sacrificed 20% of your customer volume, but achieved immediate EBITDA profitability without relying on external bridge capital.`,
      strategic_takeaways: [
        'Never let a crisis go to waste: use forced restructuring to shed unprofitable business segments.',
        'Speed of decision-making compounds: a 70% solution executed on Day 1 beats a 99% solution delivered 30 days too late.',
        'Trust is an asymmetric asset: difficult to accumulate, destroyed in an hour, but resilient when defended with radical transparency.',
      ],
    };
  }

  const systemPrompt = `You are a Senior Corporate Board Chair and HBS Case Method Evaluator.
Evaluate the student CEO's decision-making across their multi-turn crisis simulation.
Focus strictly on CRITICAL THINKING, LOGICAL RIGOR, SECOND-ORDER THINKING, and COGNITIVE BIASES.
There are no academic marks; this is a boardroom-level cognitive audit.

Return ONLY a valid JSON object matching this structure:
{
  "survival_verdict": "THRIVED & EXPANDED / SURVIVED WITH STRATEGIC MOAT / SURVIVED WITH SCARS / ENTERPRISE COLLAPSE",
  "verdict_badge": "SUCCESS / CAUTION / FAILURE",
  "executive_summary": "1-2 paragraphs analyzing their leadership strategy and trade-off decisions.",
  "critical_thinking_metrics": {
    "second_order_thinking": {
      "score": 85,
      "grade": "A",
      "analysis": "Specific feedback on whether they anticipated downstream ripple effects."
    },
    "risk_management": {
      "score": 78,
      "grade": "B+",
      "analysis": "Specific feedback on their risk calibration."
    },
    "stakeholder_diplomacy": {
      "score": 90,
      "grade": "A",
      "analysis": "How well they balanced conflicting stakeholder demands."
    },
    "capital_efficiency": {
      "score": 72,
      "grade": "B",
      "analysis": "How well they preserved cash runway and burn."
    }
  },
  "biases_detected": [
    {
      "bias_name": "Name of Bias (e.g. Sunk Cost Fallacy, Optimism Bias, Loss Aversion)",
      "description": "Where and how this bias manifested in their decisions."
    }
  ],
  "devils_advocate": "Compelling Alternate Timeline explaining what would have happened if they took the opposite route.",
  "strategic_takeaways": [
    "Key Executive Takeaway 1",
    "Key Executive Takeaway 2",
    "Key Executive Takeaway 3"
  ]
}`;

  const userPrompt = `Company: ${scenario.company_name} (${scenario.industry})
Initial Crisis: ${scenario.headline}
Decisions Made By Student:
${JSON.stringify(decisions, null, 2)}
Final Vitals:
${JSON.stringify(final_vitals, null, 2)}
Simulation History:
${JSON.stringify(history, null, 2)}

Provide a rigorous, Harvard-grade Critical Thinking Audit. Return ONLY JSON.`;

  try {
    const aiResp = await chatCompletion({
      apiKey,
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const parsed = extractCleanJson(aiResp.content);
    if (parsed && parsed.survival_verdict && parsed.critical_thinking_metrics) {
      return parsed;
    }
    throw new Error('Invalid evaluation JSON');
  } catch (err) {
    console.warn('[CaseStudy AI] Evaluation failed, fallback used:', err.message);
    return {
      survival_verdict: 'SURVIVED WITH STRATEGIC MOAT',
      verdict_badge: 'SUCCESS',
      executive_summary: `Your execution steered ${scenario.company_name} through dangerous waters. You demonstrated executive resilience by balancing operational realities against capital limits.`,
      critical_thinking_metrics: {
        second_order_thinking: { score: 82, grade: 'A-', analysis: 'Anticipated downstream competitor counter-moves.' },
        risk_management: { score: 80, grade: 'B+', analysis: 'Preserved core cash without gambling customer safety.' },
        stakeholder_diplomacy: { score: 85, grade: 'A', analysis: 'Managed conflicting boardroom agendas with tact.' },
        capital_efficiency: { score: 76, grade: 'B', analysis: 'Kept cash burn aligned with available runway.' },
      },
      biases_detected: [
        { bias_name: 'Pragmatic Trade-off Realism', description: 'Avoided idealist wishful thinking under severe cash constraints.' },
      ],
      devils_advocate: 'If you had opted for an immediate aggressive pivot, your short-term margins would have surged faster, though customer acquisition would have experienced friction.',
      strategic_takeaways: [
        'Protect the core balance sheet first: no strategy survives zero cash.',
        'Transparency creates long-term enterprise moats.',
        'Decisions are defined by what you choose NOT to do.',
      ],
    };
  }
}

module.exports = {
  PRESET_CASES,
  generateCaseStudy,
  simulateTurn,
  evaluateSimulation,
};
