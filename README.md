# Outmate.AI | Multi-Agent GTM Intelligence Engine

Outmate.AI is a sophisticated multi-agent AI system designed to simulate a real-world Go-To-Market (GTM) intelligence and outbound engine. It transforms raw natural language queries into deep, enriched prospect lists with personalized outreach strategies.

## 🚀 Architecture Overview
The system follows a modular, distributed agent architecture managed by a central **Orchestrator**. It implements a strict **Iterative Execution Loop** with self-correction logic.

### 🤖 The Agents
1.  **Planner Agent**: Decomposes high-level queries into structured execution plans.
2.  **Retrieval Agent**: Extracts precise search parameters and queries diverse data sources (simulated Explorium/Mock APIs).
3.  **Enrichment Agent**: Enhances profiles with real-world signals (hiring trends, funding rounds, tech stack) and computes a custom **ICP Fit Score**.
4.  **Validation (Critic) Agent**: Strict QA layer that checks for hallucinations, data validity, and query relevance. Triggers re-plans if quality is insufficient.
5.  **GTM Strategy Agent**: Generates highly personalized outreach hooks for multiple personas (CEO, VP Sales, CTO) and ranks prospects by priority.

## ⚙️ Core Systems
- **Execution Loop**: Planner → Retrieval → Enrichment → Critic → (Self-Correction if needed) → Strategy.
- **Memory System**: Short-term session memory via a detailed **Reasoning Trace** that tracks agent decision cycles.
- **Failure Handling**: Built-in retry mechanisms and a robust fallback layer that allows the system to remain functional even during API quota limits.
- **ICP Scoring Engine**: A multi-factor algorithm weighing firmographics, growth velocity, and intent signals.

## 🎨 Premium User Experience
- **Execution Timeline**: Real-time visualization of agent activity via Server-Sent Events (SSE).
- **Confidence Meter**: Visual indicator of the Critic agent's assessment.
- **Streaming Updates**: Instant UI feedback as agents complete tasks.
- **Glassmorphism UI**: A state-of-the-art dark theme designed for modern enterprise dashboards.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, OpenAI GPT-4o, NeDB (for session storage).

## 📁 Project Structure
- `/backend`: Agentic core, orchestrator, and server logic.
- `/frontend`: Dashboard UI and real-time streaming components.

---

## 🚀 Getting Started

### 1. Local Development

**Prerequisites:**
- Node.js (v18+)
- OpenAI API Key

**Backend Setup:**
1. Navigate to `backend/`.
2. Create a `.env` file and add: `OPENAI_API_KEY=your_key_here`.
3. Run:
   ```bash
   npm install
   npm start
   ```

**Frontend Setup:**
1. Navigate to `frontend/`.
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

### 2. Vercel Deployment

This project is optimized for a one-click deployment on **Vercel**.

1. **Connect Repo**: Import this repository into Vercel.
2. **Environment Variables**: Add `OPENAI_API_KEY` to the Vercel project settings.
3. **Memory System (Optional)**: For cloud-persistent memory, add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
4. **Deploy**: Vercel will auto-detect the configuration and launch the app.

---
*Built for the GTM Intelligence Challenge.*
