const OpenAI = require('openai');
const { mockStrategyResponse } = require('../services/mockResponses');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const StrategyAgent = async (originalQuery, plan, enrichedCompanies) => {
  const results = await Promise.all(
    enrichedCompanies.map(async (company) => {
      let strategy;
      try {
        const prompt = `
          You are a GTM Strategy Agent generating personalized outreach for a B2B SaaS company.

          Target Company: ${company.name}
          Industry: ${company.industry}
          Description: ${company.description}
          Pain Points: ${JSON.stringify(company.pain_points)}
          Buying Signals: ${JSON.stringify(company.buying_signals)}
          ICP Score: ${company.icp_score}/100
          Growth Stage: ${company.growth_stage}

          Original Query Intent: "${originalQuery}"

          Generate personalized outreach in JSON:
          {
            "hooks": {
              "ceo": "personalized 2-sentence outreach for CEO",
              "vp_sales": "personalized 2-sentence outreach for VP Sales",
              "cto": "personalized 2-sentence outreach for CTO"
            },
            "sales_book": "One paragraph sales narrative",
            "messaging_strategy": "Key value proposition and positioning",
            "icp_insights": "Why this company fits ICP"
          }
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an elite B2B sales strategist specializing in outbound GTM for SaaS companies." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        });

        strategy = JSON.parse(response.choices[0].message.content);
      } catch (err) {
        console.warn(`[StrategyAgent] OpenAI unavailable for ${company.name}, using mock response:`, err.message);
        strategy = mockStrategyResponse(company);
      }

      return {
        ...company,
        outreach: strategy
      };
    })
  );

  // Multi-persona targeting: rank results by ICP score
  const ranked = results.sort((a, b) => b.icp_score - a.icp_score);

  return {
    ranked_results: ranked,
    total_companies: ranked.length,
    top_prospect: ranked[0]?.name || null,
    strategy_summary: `Identified ${ranked.length} prospects. Top ICP score: ${ranked[0]?.icp_score || 0}/100.`
  };
};

module.exports = StrategyAgent;
