const OpenAI = require('openai');
const { mockValidationResponse } = require('../services/mockResponses');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ValidationAgent = async (originalQuery, plan, enrichedCompanies) => {
  try {
    const prompt = `
      You are a Validation/Critic Agent for a GTM Intelligence System. Your job is to:
      1. Check if results are relevant to the original query
      2. Detect hallucinated or fabricated data assumptions
      3. Check if filters were over-constrained or invalid

      Original Query: "${originalQuery}"
      Plan: ${JSON.stringify(plan)}
      Results (sample of 2): ${JSON.stringify(enrichedCompanies.slice(0, 2), null, 2)}

      Output Format (JSON):
      {
        "is_valid": true/false,
        "relevance_score": 0.0-1.0,
        "issues": ["issue1", "issue2"],
        "hallucination_detected": true/false,
        "hallucination_reasons": ["reason1"],
        "assumptions_valid": true/false,
        "recommendation": "string — what should be re-tried if invalid",
        "confidence": 0.0-1.0
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a strict quality assurance agent for B2B GTM systems. Be critical and flag any potential hallucinations or misalignments." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.warn('[ValidationAgent] OpenAI unavailable, using mock response:', err.message);
    return mockValidationResponse();
  }
};

module.exports = ValidationAgent;
