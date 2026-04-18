const OpenAI = require('openai');
const { mockPlannerResponse } = require('../services/mockResponses');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PlannerAgent = async (query, feedback = null) => {
  try {
    let feedbackPrompt = "";
    if (feedback) {
      feedbackPrompt = `
      CRITICAL: The previous plan was INVALID. Please analyze these issues and produce an improved plan:
      Issues: ${JSON.stringify(feedback.issues)}
      Recommendation: ${feedback.recommendation}
      `;
    }

    const prompt = `
      You are a Strategic Planner Agent for a GTM (Go-To-Market) Multi-Agent System.
      Break down this GTM query into structured execution steps.
      ${feedbackPrompt}

      Query: "${query}"

      Output Format (JSON):
      {
        "entity_type": "string (e.g., Company, Prospect, Industry)",
        "tasks": ["search", "enrich", "analyze", "generate_outreach"],
        "strategy": "string describing the approach",
        "confidence": 0.0-1.0
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional GTM strategist." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    // Graceful fallback on quota/API errors
    console.warn('[PlannerAgent] OpenAI unavailable, using mock response:', err.message);
    return mockPlannerResponse(query);
  }
};

module.exports = PlannerAgent;
