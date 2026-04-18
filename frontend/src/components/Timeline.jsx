import { motion, AnimatePresence } from 'framer-motion';

const agentMeta = {
  PlannerAgent:    { icon: '🧠', label: 'Planner Agent' },
  RetrievalAgent:  { icon: '🔍', label: 'Retrieval Agent' },
  EnrichmentAgent: { icon: '⚡', label: 'Enrichment Agent' },
  ValidationAgent: { icon: '🛡️', label: 'Validation Agent' },
  StrategyAgent:   { icon: '🎯', label: 'Strategy Agent' },
  Orchestrator:    { icon: '🔄', label: 'Orchestrator' },
};

const statusIcon = { running: '⟳', success: '✓', failed: '✕', retrying: '↺', warning: '⚠', error: '✕' };
const statusClass = { running: 'running', success: 'success', failed: 'failed', retrying: 'retrying', warning: 'warning', error: 'error' };

const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function Timeline({ events, confidence }) {
  return (
    <div>
      <div className="timeline">
        <AnimatePresence initial={false}>
          {events.map((ev, i) => {
            const meta = agentMeta[ev.agent] || { icon: '⚙️', label: ev.agent };
            const sc = statusClass[ev.status] || 'running';
            return (
              <motion.div
                key={i}
                className={`timeline-item ${sc}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className={`timeline-icon ${sc}`}>
                  {statusIcon[ev.status] || '…'}
                </div>
                <div className="timeline-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div className="timeline-agent">{meta.icon} {meta.label}</div>
                    <span className={`timeline-badge badge-${sc}`}>{ev.status}</span>
                  </div>
                  <div className="timeline-detail">{ev.detail}</div>
                  <div className="timeline-time">{formatTime(ev.timestamp)}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {events.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0', textAlign: 'center' }}>
            Awaiting query execution...
          </div>
        )}
      </div>

      {confidence != null && (
        <div className="confidence-meter" style={{ marginTop: 20 }}>
          <div className="confidence-label">
            <span>Confidence Score</span>
            <span className="confidence-value">{(confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="confidence-bar">
            <motion.div
              className="confidence-fill"
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
