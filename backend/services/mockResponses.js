/**
 * Mock response library — used when OpenAI quota is exhausted.
 * Provides realistic GTM responses for demo purposes.
 */

const mockPlannerResponse = (query) => ({
  entity_type: "Company",
  tasks: ["search", "enrich", "analyze", "generate_outreach"],
  strategy: `Identify high-growth companies matching: "${query}". Focus on recent hiring spikes, funding rounds, and tech signals to prioritize ICP-fit prospects.`,
  confidence: 0.87
});

const mockRetrievalFilters = (query) => ({
  keywords: query.toLowerCase().includes('fintech') ? ['fintech', 'saas'] :
            query.toLowerCase().includes('ai') ? ['ai', 'saas'] :
            ['saas', 'ai'],
  industry_focus: query.toLowerCase().includes('fintech') ? 'Fintech' : 'AI SaaS',
  geo_focus: 'USA',
  filters_applied: ['location:USA', 'growth_score:>60', 'industry:SaaS']
});

const mockInsights = {
  "1": {
    derived_insights: ["Scaling sales motion post Series B", "CFO/Finance audience buying center"],
    growth_stage: "Growth",
    pain_points: ["Manual forecasting slowing down closings", "Lack of real-time cash visibility"]
  },
  "2": {
    derived_insights: ["Replacing legacy SIEM tools", "Strong PLG motion with enterprise upsell"],
    growth_stage: "Scale",
    pain_points: ["Alert fatigue from traditional tools", "Compliance reporting overhead"]
  },
  "4": {
    derived_insights: ["Modern data stack early adopter", "Bottom-up data team → top-down C-suite expansion"],
    growth_stage: "Early",
    pain_points: ["Data pipeline complexity", "Cold start on analytics infrastructure"]
  }
};

const mockValidationResponse = () => ({
  is_valid: true,
  relevance_score: 0.91,
  issues: [],
  hallucination_detected: false,
  hallucination_reasons: [],
  assumptions_valid: true,
  recommendation: "Results are well-aligned with query intent.",
  confidence: 0.91
});

const mockStrategyResponse = (company) => ({
  hooks: {
    ceo: `Congrats on the recent funding round — companies scaling like ${company.name} often face [pain_point] right at this stage. Happy to share how 3 similar teams solved it in under 30 days.`,
    vp_sales: `Your team is growing fast — are you still building your outbound motion manually? We help VP Sales at ${company.industry} companies like yours hit quota 40% faster. Worth a 15-min chat?`,
    cto: `Seeing your stack uses ${(company.tech_stack || []).slice(0,2).join(' + ')} — we integrate natively and sit on top. No re-platforming. Happy to send a technical breakdown.`
  },
  sales_book: `${company.name} is at a critical inflection point. With strong growth signals and active hiring, there's clear budget and urgency. Lead with the ROI story — fast time-to-value is key.`,
  messaging_strategy: `Position as the trusted growth accelerator for companies in the ${company.growth_stage || 'Growth'} stage. Lean into pain around scale, efficiency, and competitive urgency.`,
  icp_insights: `${company.name} scores highly on ICP fit due to: growth velocity, active hiring in relevant roles, and recent funding indicating budget availability.`
});

module.exports = {
  mockPlannerResponse,
  mockRetrievalFilters,
  mockInsights,
  mockValidationResponse,
  mockStrategyResponse
};
