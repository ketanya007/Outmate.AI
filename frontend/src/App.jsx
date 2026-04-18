import { useState, useRef, useCallback } from 'react';
import './index.css';
import Timeline from './components/Timeline';
import ResultsView from './components/ResultsView';

const EXAMPLE_QUERIES = [
  "Find high-growth AI SaaS companies in the US for VP Sales outreach",
  "Identify fintech startups hiring aggressively and suggest outreach strategies",
  "Give me companies likely to churn competitors and how to target them",
];

const BACKEND_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:5000';

export default function App() {
  const [query, setQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);
  const [strategySummary, setStrategySummary] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | running | complete | error
  const [errorMsg, setErrorMsg] = useState('');
  const sseRef = useRef(null);
  const sessionIdRef = useRef(null);

  const resetState = () => {
    setEvents([]);
    setResults([]);
    setStrategySummary('');
    setConfidence(null);
    setErrorMsg('');
    setPhase('idle');
  };

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || isRunning) return;

    resetState();
    setIsRunning(true);
    setPhase('running');

    // Generate a session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionIdRef.current = sessionId;

    // Step 1: Open SSE connection FIRST
    const sse = new EventSource(`${BACKEND_URL}/api/stream/${sessionId}`);
    sseRef.current = sse;

    sse.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        const { event, data } = parsed;

        if (event === 'connected') {
          // SSE is ready — now fire the query
          fetch(`${BACKEND_URL}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, sessionId }),
          }).catch(err => {
            setErrorMsg(`Failed to reach backend: ${err.message}`);
            setPhase('error');
            setIsRunning(false);
          });
        }

        if (event === 'agent_update') {
          setEvents(prev => [...prev, data]);
          if (data.confidence) setConfidence(data.confidence);
        }

        if (event === 'start') {
          setEvents(prev => [...prev, {
            agent: 'Orchestrator', status: 'running',
            detail: data.message, timestamp: new Date().toISOString()
          }]);
        }

        if (event === 'complete') {
          setConfidence(data.confidence || null);
          setResults(data.results || []);
          setStrategySummary(data.gtm_strategy?.strategy_summary || '');
          setPhase('complete');
          setIsRunning(false);
          sse.close();
        }

        if (event === 'error') {
          setErrorMsg(data.message || 'Unknown error occurred');
          setPhase('error');
          setIsRunning(false);
          sse.close();
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    sse.onerror = () => {
      setErrorMsg('Lost connection to the backend server. Make sure it is running on port 5000.');
      setPhase('error');
      setIsRunning(false);
      sse.close();
    };
  }, [query, isRunning]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStop = () => {
    if (sseRef.current) sseRef.current.close();
    setIsRunning(false);
    setPhase('idle');
  };

  return (
    <div className="app">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-badge">
          <span className="dot" />
          Multi-Agent GTM Intelligence Engine
        </div>
        <h1>Outbound at Intelligence Scale</h1>
        <p>
          A 5-agent AI system that plans, retrieves, enriches, validates, and generates
          personalized GTM strategies — with iterative self-correction.
        </p>

        {/* Search Box */}
        <div className="search-container">
          <div className="search-box">
            <span style={{ fontSize: 18 }}>🔍</span>
            <input
              type="text"
              placeholder="e.g. Find high-growth AI SaaS companies in the US..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
            />
            {isRunning ? (
              <button className="search-btn" onClick={handleStop}>
                <span>⏹</span> Stop
              </button>
            ) : (
              <button className="search-btn" onClick={handleSubmit} disabled={!query.trim()}>
                <span>▶</span> Run Agents
              </button>
            )}
          </div>

          <div className="example-queries">
            {EXAMPLE_QUERIES.map((q, i) => (
              <span key={i} className="example-chip" onClick={() => !isRunning && setQuery(q)}>
                {q.length > 55 ? q.slice(0, 52) + '...' : q}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {phase === 'error' && errorMsg && (
        <div style={{
          maxWidth: 1400, margin: '0 auto 16px', padding: '0 24px',
        }}>
          <div style={{
            padding: '14px 18px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12,
            color: '#fca5a5',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content (visible only after query) */}
      {(phase !== 'idle' || events.length > 0) && (
        <div className="main-content">
          {/* Left: Timeline */}
          <div>
            <div className="glass-card" style={{ position: 'sticky', top: 24 }}>
              <div className="card-header">
                <div className="icon" style={{ background: 'rgba(99,102,241,0.15)' }}>⚙️</div>
                <h2>Execution Timeline</h2>
                {isRunning && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)' }}>
                    <span style={{ animation: 'pulse 1s infinite' }}>●</span> Live
                  </div>
                )}
              </div>
              <Timeline events={events} confidence={confidence} />
            </div>
          </div>

          {/* Right: Results */}
          <div>
            <div className="card-header" style={{ marginBottom: 16 }}>
              <div className="icon" style={{ background: 'rgba(16,185,129,0.15)' }}>🎯</div>
              <h2>
                {phase === 'complete' ? `${results.length} Companies Found` :
                 phase === 'running' ? 'Processing...' : 'Results'}
              </h2>
            </div>

            {phase === 'running' && results.length === 0 && (
              <div className="empty-state">
                <div className="icon" style={{ animation: 'pulse 1.5s infinite' }}>🤖</div>
                <h3>Agents working...</h3>
                <p>Watch the execution timeline on the left</p>
              </div>
            )}

            <ResultsView results={results} strategySummary={strategySummary} />
          </div>
        </div>
      )}

      {/* Idle state hint */}
      {phase === 'idle' && (
        <div className="empty-state" style={{ paddingTop: 20 }}>
          <div className="icon">🚀</div>
          <h3>Ready to launch</h3>
          <p>Type a GTM query above or click an example to begin</p>
        </div>
      )}
    </div>
  );
}
