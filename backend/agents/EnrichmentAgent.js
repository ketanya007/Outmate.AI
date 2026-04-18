const OpenAI = require('openai');
const { getCompanySignals } = require('../services/mockData');
const { mockInsights } = require('../services/mockResponses');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ICP Scoring Engine (Mandatory Advanced Feature)
const computeICPScore = (company, signals) => {
  let score = 0;
  // Growth score (0-40 pts)
  score += Math.round((company.growth_score / 100) * 40);
  // Hiring signals (0-25 pts)
  if (signals.hiring && signals.hiring.length > 0) {
    score += Math.min(signals.hiring.length * 10, 25);
  }
  // Funding recency (0-20 pts)
  if (signals.funding) {
    const fundingAge = (Date.now() - new Date(signals.funding.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (fundingAge < 3) score += 20;
    else if (fundingAge < 6) score += 14;
    else score += 8;
  }
  // Tech stack fit (0-15 pts)
  const modernStack = ['AWS', 'Kubernetes', 'React', 'Snowflake', 'dbt', 'Go', 'Python'];
  const stackMatches = company.tech_stack.filter(t => modernStack.includes(t)).length;
  score += Math.min(stackMatches * 5, 15);

  return Math.min(score, 100);
};

// Buying Signal Detection (Mandatory Advanced Feature)
const detectBuyingSignals = (signals, company) => {
  const detected = [];
  if (signals.hiring && signals.hiring.some(h => h.type === 'Sales')) {
    detected.push({ type: 'hiring_sales', detail: 'Actively hiring sales roles — expansion signal' });
  }
  if (signals.funding) {
    detected.push({ type: 'recent_funding', detail: `${signals.funding.stage} (${signals.funding.amount}) — budget available` });
  }
  if (company.growth_score > 80) {
    detected.push({ type: 'high_growth', detail: `Growth score ${company.growth_score}/100 — in scaling phase` });
  }
  return detected;
};

const EnrichmentAgent = async (retrievalResult) => {
  const enrichedCompanies = await Promise.all(
    retrievalResult.companies.map(async (company) => {
      // Get signals from mock DB
      const signals = getCompanySignals(company.id);
      const icpScore = computeICPScore(company, signals);
      const buyingSignals = detectBuyingSignals(signals, company);

      let aiInsights;

      try {
        const prompt = `
          Company: ${company.name}
          Description: ${company.description}
          Industry: ${company.industry}
          Tech Stack: ${company.tech_stack.join(', ')}
          Hiring Signals: ${JSON.stringify(signals.hiring)}
          Funding: ${JSON.stringify(signals.funding)}

          Provide derived insights in JSON format:
          {
            "derived_insights": ["insight1", "insight2"],
            "growth_stage": "string (Seed/Early/Growth/Scale)",
            "pain_points": ["pain1", "pain2"]
          }
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: "You are a B2B growth analyst." }, { role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });

        aiInsights = JSON.parse(response.choices[0].message.content);
      } catch (err) {
        console.warn(`[EnrichmentAgent] OpenAI unavailable for ${company.name}, using mock response:`, err.message);
        aiInsights = mockInsights[company.id] || {
          derived_insights: ["Early indicator of high growth"],
          growth_stage: "Unknown",
          pain_points: ["Operational scale bottlenecks"]
        };
      }

      return {
        ...company,
        enriched: true,
        icp_score: icpScore,
        buying_signals: buyingSignals,
        hiring_signals: signals.hiring,
        funding: signals.funding || null,
        ...aiInsights
      };
    })
  );

  return enrichedCompanies;
};

module.exports = EnrichmentAgent;
