import { useEffect, useState } from "react";
import "./Loader.css";

const STEPS = [
  { id: 1, label: "Analyzing prompt",    sub: "Summarizing intent…",         icon: "⟁" },
  { id: 2, label: "Classifying type",    sub: "simple / creative / reasoning / mixed", icon: "◈" },
  { id: 3, label: "Routing to model",    sub: "Selecting optimal LLM tier…",  icon: "⬡" },
  { id: 4, label: "Generating output",   sub: "Calling Groq / Llama3…",       icon: "✦" },
];

export default function Loader() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const intervals = STEPS.map((_, i) =>
      setTimeout(() => setActive(i), i * 1400)
    );
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="loader-wrap">
      {/* Center spinner */}
      <div className="loader-center">
        <div className="loader-rings">
          <div className="lr lr-1" />
          <div className="lr lr-2" />
          <div className="lr lr-3" />
        </div>
        <div className="loader-icon">⟁</div>
      </div>

      <p className="loader-title">Processing Prompt</p>
      <p className="loader-sub">Routing to optimal model…</p>

      {/* Steps */}
      <div className="loader-steps">
        {STEPS.map((step, i) => {
          const isDone = i < active;
          const isActive = i === active;
          return (
            <div
              key={step.id}
              className={`loader-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="ls-icon-wrap">
                <span className="ls-icon">{isDone ? "✓" : step.icon}</span>
                {isActive && <div className="ls-pulse" />}
              </div>
              <div className="ls-body">
                <span className="ls-label">{step.label}</span>
                <span className="ls-sub">{step.sub}</span>
              </div>
              <div className={`ls-status ${isDone ? "done" : isActive ? "active" : ""}`}>
                {isDone ? "done" : isActive ? "running" : "pending"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}