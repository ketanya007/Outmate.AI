const OpenAI = require('openai');
const { searchCompanies } = require('../services/mockData');
const { mockRetrievalFilters } = require('../services/mockResponses');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RetrievalAgent = async (plan, originalQuery) => {
  let filters;
  try {
    const prompt = `
      You are a Retrieval Agent. Given this GTM execution plan and original query, extract search keywords 
      to find relevant companies.

      Original Query: "${originalQuery}"
      Plan: ${JSON.stringify(plan)}

      Output Format (JSON):
      {
        "keywords": ["keyword1", "keyword2"],
        "industry_focus": "string",
        "geo_focus": "string",
        "filters_applied": ["filter1", "filter2"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a data retrieval specialist." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    filters = JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.warn('[RetrievalAgent] OpenAI unavailable, using mock response:', err.message);
    filters = mockRetrievalFilters(originalQuery);
  }

  // Query mock data with extracted keywords
  let results = [];
  for (const keyword of filters.keywords) {
    const found = searchCompanies(keyword);
    results = [...results, ...found];
  }

  // Deduplicate by id
  const unique = results.filter((c, idx, arr) => arr.findIndex(x => x.id === c.id) === idx);

  // If no results, we still return the structure to let the orchestrator handle it
  return {
    filters,
    companies: unique,
    missing_fields: unique.length === 0 ? ["No companies matched the query keywords"] : [],
    over_constrained: unique.length === 0 && filters.keywords.length > 2
  };
};

module.exports = RetrievalAgent;
