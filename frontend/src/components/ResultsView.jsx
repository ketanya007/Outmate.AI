import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const icpColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
};

function CompanyCard({ company, index }) {
  const [expanded, setExpanded] = useState(false);
  const hooks = company.outreach?.hooks;

  return (
    <motion.div
      className={`company-card ${expanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div className="cc-top">
        <div className="cc-avatar">{company.name[0]}</div>
        <div className="cc-info">
          <div className="cc-name">{company.name}</div>
          <div className="cc-domain">🌐 {company.domain}</div>
        </div>
        <div className="icp-badge">
          <div className="icp-score" style={{ color: icpColor(company.icp_score) }}>{company.icp_score}</div>
          <div className="icp-label">ICP Score</div>
        </div>
      </div>

      <div className="cc-desc">{company.description}</div>

      {/* Buying Signals */}
      {company.buying_signals?.length > 0 && (
        <div className="cc-signals">
          {company.buying_signals.map((s, i) => (
            <span key={i} className="signal-tag">
              {s.type === 'recent_funding' ? '💰' : s.type === 'hiring_sales' ? '📈' : '🚀'}
              {s.detail}
            </span>
          ))}
        </div>
      )}

      {/* Tech Stack */}
      {company.tech_stack?.length > 0 && (
        <div className="tech-tags">
          {company.tech_stack.map((t, i) => (
            <span key={i} className="tech-tag">{t}</span>
          ))}
        </div>
      )}

      {/* Derived Insights */}
      {company.derived_insights?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {company.derived_insights.map((insight, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <span style={{ color: 'var(--accent)', fontSize: 12, marginTop: 1 }}>▸</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expand Button */}
      {hooks && (
        <button className="cc-expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Hide Outreach Hooks' : '▼ View Personalized Outreach Hooks'}
        </button>
      )}

      {/* Outreach Hooks */}
      <AnimatePresence>
        {expanded && hooks && (
          <motion.div
            className="outreach-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="outreach-title">✉️ Personalized Outreach Hooks</div>
            <div className="hook-cards">
              {hooks.ceo && (
                <div className="hook-card ceo">
                  <div className="hook-persona">👑 CEO</div>
                  <div className="hook-text">{hooks.ceo}</div>
                </div>
              )}
              {hooks.vp_sales && (
                <div className="hook-card vp_sales">
                  <div className="hook-persona">📊 VP Sales</div>
                  <div className="hook-text">{hooks.vp_sales}</div>
                </div>
              )}
              {hooks.cto && (
                <div className="hook-card cto">
                  <div className="hook-persona">⚙️ CTO</div>
                  <div className="hook-text">{hooks.cto}</div>
                </div>
              )}
            </div>

            {company.outreach?.messaging_strategy && (
              <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  💡 Messaging Strategy
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {company.outreach.messaging_strategy}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ResultsView({ results, strategySummary }) {
  if (!results || results.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">🎯</div>
        <h3>No results yet</h3>
        <p>Submit a query to start the GTM agent pipeline</p>
      </div>
    );
  }

  return (
    <div>
      {strategySummary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '14px 18px',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 14,
            marginBottom: 20,
            fontSize: 14,
            color: '#a5b4fc',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <span>✅</span>
          <span>{strategySummary}</span>
        </motion.div>
      )}

      <div className="results-grid">
        {results.map((company, i) => (
          <CompanyCard key={company.id || company.name} company={company} index={i} />
        ))}
      </div>
    </div>
  );
}
