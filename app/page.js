'use client'
import { useState } from "react";
import styles from "./page.module.css";

export default function PaperLens() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function analyze() {
    if (!text.trim()) return alert('Paste some text first');
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const scoreColor = result ? (result.overall_score >= 8 ? '#1a472a' : result.overall_score >= 6 ? '#b8860b' : '#b71c1c') : '#1a472a';

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📄</div>
          <span className={styles.logoText}>Paper<em>Lens</em> AI</span>
        </div>
        <span className={styles.badge}>llama-3.3-70b · GroqCloud</span>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Analyze any research paper<br/><em>in seconds</em></h1>
          <p>Paste an abstract or full text and get structured AI insights instantly.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.label}>Paper Abstract or Full Text</div>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your research paper abstract here..."
          />
          <div className={styles.cardFooter}>
            <span className={styles.charCount}>{text.length} characters</span>
            <button className={styles.btnAnalyze} onClick={analyze} disabled={loading}>
              {loading ? 'Analyzing...' : '🔍 Analyze Paper'}
            </button>
          </div>
        </div>

        <div className={styles.examples}>
          <span className={styles.exLabel}>Try an example →</span>
          {[
            ['🤖 Transformer', 'We introduce the Attention Is All You Need architecture, a novel transformer model relying entirely on attention mechanisms, dispensing with recurrence and convolutions entirely. Our model achieves 28.4 BLEU on WMT 2014 English-to-German and 41.8 on English-to-French translation tasks.'],
            ['🌍 Climate', 'This study presents a meta-analysis of 847 climate models spanning 1990–2023, revealing 94% underestimated Arctic ice loss by 23–41%. We introduce a corrected radiative forcing parameterization reducing projection error by 67%.'],
            ['💊 Drug Discovery', 'We report compound ML-2847, a selective PI3Kδ inhibitor with IC50 = 0.3 nM. Using AI-guided molecular docking across 12 million compounds, murine models show 78% tumor regression at 10 mg/kg with oral bioavailability of 82%.'],
          ].map(([label, ex]) => (
            <button key={label} className={styles.chip} onClick={() => setText(ex)}>{label}</button>
          ))}
        </div>

        {error && <div className={styles.errorBox}>❌ {error}</div>}

        {loading && (
          <div className={styles.loadingBox}>
            <div className={styles.spinner}></div>
            <p>Reading between the lines...</p>
          </div>
        )}

        {result && (
          <div className={styles.results}>
            <div className={styles.scoreHeader}>
              <div className={styles.scoreRing} style={{borderColor: scoreColor}}>
                <span className={styles.scoreNum} style={{color: scoreColor}}>{result.overall_score}</span>
                <small>/10</small>
              </div>
              <div className={styles.scoreInfo}>
                <h2 className={styles.paperTitle}>{result.title}</h2>
                <p className={styles.verdict}>{result.verdict}</p>
                <div className={styles.tags}>
                  {(result.tags||[]).map((t,i) => <span key={i} className={styles.tag}>{t}</span>)}
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.sectionCard}>
                <h3>📝 Summary</h3>
                <p>{result.summary}</p>
              </div>
              <div className={styles.sectionCard}>
                <h3>📊 Metrics</h3>
                <div className={styles.metrics}>
                  {Object.entries(result.metrics||{}).map(([k,v]) => (
                    <div key={k} className={styles.metric}>
                      <span className={styles.metricVal}>{v}</span>
                      <span className={styles.metricLabel}>{k}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.sectionCard}>
                <h3>✅ Strengths</h3>
                <ul>{(result.strengths||[]).map((s,i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className={styles.sectionCard}>
                <h3>⚠️ Weaknesses</h3>
                <ul>{(result.weaknesses||[]).map((s,i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className={styles.sectionCard}>
                <h3>🔬 Methodology</h3>
                <p>{result.methodology}</p>
              </div>
              <div className={styles.sectionCard}>
                <h3>💡 Future Work</h3>
                <ul>{(result.future_work||[]).map((s,i) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className={`${styles.sectionCard} ${styles.fullWidth}`}>
                <h3>📈 Dimension Scores</h3>
                {Object.entries(result.dimensions||{}).map(([k,v]) => (
                  <div key={k} className={styles.barRow}>
                    <span className={styles.barLabel}>{k}</span>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{width: v*10+'%'}}></div></div>
                    <span className={styles.barVal}>{v}/10</span>
                  </div>
                ))}
              </div>
              <div className={`${styles.sectionCard} ${styles.fullWidth}`}>
                <h3>🎯 Impact</h3>
                <p>{result.impact}</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className={styles.footer}>PaperLens AI · GroqCloud · llama-3.3-70b-versatile</footer>
    </div>
  );
}