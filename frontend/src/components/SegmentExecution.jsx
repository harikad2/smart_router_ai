import "./SegmentExecution.css";

const CX_CLASS = {
  simple: "seg-cx-simple",
  medium: "seg-cx-medium",
  complex: "seg-cx-complex",
};

export default function SegmentExecution({ segments }) {
  if (!segments?.length) return null;

  return (
    <div className="seg-ex-wrap">
      <h3 className="seg-ex-title">Segment execution</h3>
      <ul className="seg-ex-list">
        {segments.map((s, i) => (
          <li key={i} className="seg-card">
            <div className="seg-card-head">
              <span className="seg-card-title">{s.title}</span>
              <div className="seg-card-tags">
                <span className="seg-tag-outline">{s.segment_type}</span>
                <span className={`seg-tag-fill ${CX_CLASS[s.complexity] || "seg-cx-simple"}`}>
                  {s.complexity}
                </span>
              </div>
            </div>
            <p className="seg-model-line">{s.model_line}</p>
            <div className="seg-metrics">
              <div className="seg-metric">
                <span className="seg-metric-lbl">Latency</span>
                <span className="seg-metric-val seg-latency">{Math.round(s.latency_ms)}ms</span>
              </div>
              <div className="seg-metric">
                <span className="seg-metric-lbl">Cost</span>
                <span className="seg-metric-val seg-cost">${s.cost_usd.toFixed(6)}</span>
              </div>
              <div className="seg-metric">
                <span className="seg-metric-lbl">Quality</span>
                <span className="seg-metric-val seg-quality">{s.quality_score.toFixed(1)}/10</span>
              </div>
            </div>
            <div className="seg-bar-track">
              <div
                className="seg-bar-fill"
                style={{ width: `${Math.min(100, s.quality_bar_pct)}%` }}
              />
            </div>
            <p className="seg-footer">
              {s.difficulty_label && (
                <>
                  <span>difficulty {s.difficulty_label}</span>
                  <span className="seg-footer-dot">·</span>
                </>
              )}
              {s.footer_flags && (
                <>
                  <span>{s.footer_flags}</span>
                  <span className="seg-footer-dot">·</span>
                </>
              )}
              <span>{s.footer_detail}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
