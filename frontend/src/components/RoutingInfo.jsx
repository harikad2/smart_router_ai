import "./RoutingInfo.css";

const TYPE_CONFIG = {
  simple: { color: "#00E5FF", label: "General", icon: "◈" },
  creative: { color: "#F472B6", label: "Creative", icon: "✦" },
  math: { color: "#38bdf8", label: "Math", icon: "∑" },
  coding: { color: "#22d3ee", label: "Coding", icon: "</>" },
  mixed: { color: "#FB923C", label: "Mixed", icon: "⊕" },
};

const COMPLEXITY_CONFIG = {
  low: { color: "#4ade80", bar: 28 },
  medium: { color: "#FACC15", bar: 62 },
  high: { color: "#F87171", bar: 96 },
};

export default function RoutingInfo({ result }) {
  const type = TYPE_CONFIG[result.type] || TYPE_CONFIG.simple;
  const comp = COMPLEXITY_CONFIG[result.complexity] || COMPLEXITY_CONFIG.low;
  const latencyColor =
    result.latency_ms < 2000 ? "#4ade80" : result.latency_ms < 5000 ? "#FACC15" : "#F87171";

  const modelLine = result.models_summary || result.model_label || result.model_used || "—";

  return (
    <div className="ri-wrap">
      <div className="ri-header">
        <span className="ri-title">ROUTING DECISION</span>
        <span className="ri-latency" style={{ color: latencyColor }}>
          ⚡ {result.latency_ms}ms
        </span>
      </div>

      <div className="ri-grid">
        <div className="ri-cell ri-cell-type">
          <span className="ri-cell-label">Type</span>
          <div className="ri-badge" style={{ "--bc": type.color }}>
            <span className="ri-badge-icon">{type.icon}</span>
            <span>{type.label}</span>
          </div>
          {result.type === "mixed" && result.type_summary && (
            <span className="ri-type-summary">{result.type_summary}</span>
          )}
        </div>

        <div className="ri-cell">
          <span className="ri-cell-label">Complexity</span>
          <div className="ri-badge" style={{ "--bc": comp.color }}>
            <span>{result.complexity}</span>
          </div>
          <div className="ri-bar-bg">
            <div
              className="ri-bar-fill"
              style={{ width: `${comp.bar}%`, background: comp.color }}
            />
          </div>
        </div>

        <div className="ri-cell">
          <span className="ri-cell-label">Model</span>
          <div className="ri-model-badge ri-model-long">
            <span className="ri-model-dot" style={{ background: "#22d3ee" }} />
            <span className="ri-model-text">{modelLine}</span>
          </div>
        </div>

        <div className="ri-cell">
          <span className="ri-cell-label">Temperature</span>
          <div className="ri-temp">
            <span
              className="ri-temp-val"
              style={{ color: result.temperature >= 0.7 ? "#F472B6" : "#A78BFA" }}
            >
              {result.temperature}
            </span>
            <span className="ri-temp-lbl">{result.temperature >= 0.7 ? "creative" : "precise"}</span>
          </div>
        </div>

        <div className="ri-cell">
          <span className="ri-cell-label">Est. Cost</span>
          <div className="ri-temp">
            <span className="ri-temp-val" style={{ color: "#00E5FF" }}>
              ${result.cost_estimate?.toFixed(5)}
            </span>
          </div>
        </div>

        <div className="ri-cell">
          <span className="ri-cell-label">Credits</span>
          <div className="ri-temp">
            <span className="ri-temp-val" style={{ color: "#FB923C" }}>
              +{result.credits_earned}
            </span>
            <span className="ri-temp-lbl">earned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
