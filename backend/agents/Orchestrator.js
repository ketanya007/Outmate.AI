const PlannerAgent = require('./PlannerAgent');
const RetrievalAgent = require('./RetrievalAgent');
const EnrichmentAgent = require('./EnrichmentAgent');
const ValidationAgent = require('./ValidationAgent');
const StrategyAgent = require('./StrategyAgent');
const MemoryService = require('../services/CloudMemoryService');

const MAX_RETRIES = 3;

/**
 * Core Orchestrator — implements the Iterative Execution Loop:
 * Planner → Retrieval → Enrichment → Critic → (re-plan if invalid) → Strategy
 *
 * @param {string} query - The original user query
 * @param {function} emit - SSE emit function to stream real-time updates
 */
const Orchestrator = async (query, emit) => {
  const reasoningTrace = [];
  let attempt = 0;
  let lastValidation = null;
  let finalOutput = null;

  const log = (agent, status, detail, extra = {}) => {
    const entry = { agent, status, detail, timestamp: new Date().toISOString(), ...extra };
    reasoningTrace.push(entry);
    emit({ event: 'agent_update', data: entry });
    console.log(`[${agent}] ${status}: ${detail}`);
  };

  emit({ event: 'start', data: { query, message: 'Orchestration started' } });

  // ─── Step 0: Memory Check ────────────────────────────────────────────────
  try {
    const cachedResult = await MemoryService.get(query);
    if (cachedResult) {
      log('CloudMemoryService', 'success', 'Found valid result in cloud cache. Reusing...');
      emit({ event: 'agent_update', data: { agent: 'CloudMemoryService', status: 'success', detail: 'Retrieved result from cloud memory.' } });
      emit({ event: 'complete', data: cachedResult });
      return cachedResult;
    }
  } catch (err) {
    console.warn('[Orchestrator] Memory check failed:', err.message);
  }

  while (attempt < MAX_RETRIES) {
    attempt++;
    log('Orchestrator', 'running', `Attempt ${attempt}/${MAX_RETRIES}`);

    try {
      // ─── Step 1: Planner ─────────────────────────────────────────────────────
      log('PlannerAgent', 'running', attempt > 1 ? 'Re-planning based on feedback...' : 'Decomposing query into execution plan...');
      const plan = await PlannerAgent(query, lastValidation);
      log('PlannerAgent', 'success', 'Plan created', { output: plan });

      // ─── Step 2: Retrieval ────────────────────────────────────────────────────
      log('RetrievalAgent', 'running', 'Querying data sources with extracted filters...');
      const retrievalResult = await RetrievalAgent(plan, query);

      if (retrievalResult.over_constrained) {
        log('RetrievalAgent', 'warning', 'Over-constrained filters — no results found. Triggering re-plan...');
        if (attempt >= MAX_RETRIES) break;
        continue; // retry with a new plan
      }
      log('RetrievalAgent', 'success', `Retrieved ${retrievalResult.companies.length} companies`, { output: retrievalResult.filters });

      // ─── Step 3: Enrichment ───────────────────────────────────────────────────
      log('EnrichmentAgent', 'running', 'Enriching companies with signals, ICP scores, and insights...');
      const enrichedCompanies = await EnrichmentAgent(retrievalResult);
      log('EnrichmentAgent', 'success', `Enriched ${enrichedCompanies.length} companies`, {
        output: { icp_scores: enrichedCompanies.map(c => ({ name: c.name, icp_score: c.icp_score })) }
      });

      // ─── Step 4: Validation / Critic ──────────────────────────────────────────
      log('ValidationAgent', 'running', 'Validating relevance, assumptions, and hallucinations...');
      const validation = await ValidationAgent(query, plan, enrichedCompanies);
      lastValidation = validation;
      log('ValidationAgent', validation.is_valid ? 'success' : 'failed',
        validation.is_valid
          ? `Valid. Relevance: ${(validation.relevance_score * 100).toFixed(0)}%`
          : `INVALID: ${validation.issues.join(', ')}`,
        { output: validation }
      );

      if (!validation.is_valid) {
        log('Orchestrator', 'retrying', `Critic rejected output. Reason: ${validation.recommendation}. Retrying...`);
        if (attempt >= MAX_RETRIES) {
          log('Orchestrator', 'failed', 'Max retries reached without valid output.');
          break;
        }
        continue;
      }

      // ─── Step 5: Strategy ─────────────────────────────────────────────────────
      log('StrategyAgent', 'running', 'Generating personalized outreach and GTM strategy...');
      const strategyResult = await StrategyAgent(query, plan, enrichedCompanies);
      log('StrategyAgent', 'success', `Strategy generated for ${strategyResult.total_companies} companies. Top prospect: ${strategyResult.top_prospect}`);

      // ─── Final Output ─────────────────────────────────────────────────────────
      finalOutput = {
        plan,
        results: strategyResult.ranked_results,
        signals: enrichedCompanies.flatMap(c => c.buying_signals),
        gtm_strategy: {
          strategy_summary: strategyResult.strategy_summary,
          top_prospect: strategyResult.top_prospect,
          angles: strategyResult.ranked_results.map(c => ({
            company: c.name,
            icp_score: c.icp_score,
            hooks: c.outreach?.hooks
          }))
        },
        confidence: validation.confidence,
        reasoning_trace: reasoningTrace
      };

      emit({ event: 'complete', data: finalOutput });
      log('Orchestrator', 'success', 'Pipeline complete.');

      // Save to Memory
      await MemoryService.save(query, finalOutput);
      
      return finalOutput;

    } catch (err) {
      log('Orchestrator', 'error', `Unexpected error on attempt ${attempt}: ${err.message}`);
      if (attempt >= MAX_RETRIES) {
        emit({ event: 'error', data: { message: err.message } });
        throw err;
      }
    }
  }

  // Exhausted retries
  const fallback = { error: 'Max retries reached', last_validation: lastValidation, reasoning_trace: reasoningTrace };
  emit({ event: 'error', data: fallback });
  return fallback;
};

module.exports = Orchestrator;
