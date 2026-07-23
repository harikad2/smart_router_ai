import { useState, useEffect } from "react";
import "./LandingPage.css";

export default function LandingPage({ onStart }) {
  const [visible, setVisible] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`landing ${visible ? "visible" : ""}`}>
      {/* Animated grid background */}
      <div className="landing-grid" />

      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Scan line effect */}
      <div className="scanline" />

      <div className="landing-content">
        {/* Animated triangle */}
        <div className="triangle-wrap">
          <svg className="tri-svg" viewBox="0 0 120 110" fill="none">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Outer triangle */}
            <polygon
              className="tri-outer"
              points="60,4 116,106 4,106"
              stroke="#00E5FF"
              strokeWidth="1.5"
              fill="none"
              filter="url(#glow)"
            />
            {/* Middle triangle */}
            <polygon
              className="tri-mid"
              points="60,22 98,92 22,92"
              stroke="#00E5FF"
              strokeWidth="1"
              fill="rgba(0,229,255,0.04)"
              filter="url(#glow)"
            />
            {/* Inner triangle */}
            <polygon
              className="tri-inner"
              points="60,40 80,78 40,78"
              stroke="#7C3AED"
              strokeWidth="1"
              fill="rgba(124,58,237,0.08)"
              filter="url(#glow)"
            />
            {/* Center dot */}
            <circle className="tri-dot" cx="60" cy="59" r="3" fill="#00E5FF" filter="url(#glow)" />
          </svg>

          {/* Rotating ring */}
          <div className="tri-ring" />
          <div className="tri-ring tri-ring-2" />
        </div>

        {/* Title */}
        <div className="landing-titles">
          <div className="landing-overline">INTELLIGENT LLM ROUTING SYSTEM</div>
          <h1 className="landing-title">
            <span className="title-smart">Smart</span>
            <span className="title-router">Router</span>
            <span className="title-ai">AI</span>
          </h1>
          <p className="landing-sub">
            Routes prompts to optimal models based on complexity,<br />
            creativity, and reasoning requirements — in real time.
          </p>
        </div>

        {/* CTA button */}
        <button
          className={`start-btn ${buttonHover ? "hover" : ""}`}
          onClick={onStart}
          onMouseEnter={() => setButtonHover(true)}
          onMouseLeave={() => setButtonHover(false)}
        >
          <span className="start-btn-inner">
            <span className="start-icon">⟁</span>
            <span>Initialize System</span>
          </span>
          <div className="btn-glow" />
          <div className="btn-particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="btn-particle" style={{ "--i": i }} />
            ))}
          </div>
        </button>

        {/* Stats row */}
        <div className="landing-stats">
          {[
            { val: "4", label: "Routing Modes" },
            { val: "3", label: "Model Tiers" },
            { val: "<2s", label: "Avg Latency" },
            { val: "↓70%", label: "Cost Savings" },
          ].map((s) => (
            <div key={s.label} className="stat-pill">
              <span className="stat-val">{s.val}</span>
              <span className="stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom watermark */}
      <div className="landing-footer">
        Powered by Groq · Llama3 · FastAPI
      </div>
    </div>
  );
}