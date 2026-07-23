import { useState } from "react";
import Loader from "./Loader";
import RoutingInfo from "./RoutingInfo";
import MixedDiagram from "./MixedDiagram";
import SegmentExecution from "./SegmentExecution";
import CreditsRewards from "./CreditsRewards";
import "./OutputPanel.css";

const EXAMPLES = [
  { text: "What is the capital of France?",                                    color: "#00E5FF" },
  { text: "Write a haunting poem about forgotten stars",                       color: "#F472B6" },
  { text: "Analyze the time complexity of quicksort step by step",             color: "#A78BFA" },
  { text: "Write a sci-fi story about AI consciousness and explain the ethics",color: "#FB923C" },
];

export default function OutputPanel({ status, result, onExampleClick }) {
  return (
    <section className="output-panel">
      {status === "idle"    && <IdleState onExampleClick={onExampleClick} />}
      {status === "loading" && <Loader />}
      {status === "error"   && <ErrorState />}
      {status === "success" && result && <SuccessState result={result} />}
    </section>
  );
}

function IdleState({ onExampleClick }) {
  return (
    <div className="op-idle">
      <div className="idle-top">
        <div className="idle-icon-wrap">
          <svg className="idle-tri" viewBox="0 0 80 72" fill="none">
            <defs>
              <filter id="idleGlow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <polygon className="idle-tri-anim" points="40,3 77,69 3,69" stroke="#00E5FF" strokeWidth="1.5" fill="rgba(0,229,255,0.04)" filter="url(#idleGlow)" />
            <polygon points="40,18 62,59 18,59" stroke="#7C3AED" strokeWidth="1" fill="rgba(124,58,237,0.04)" />
            <circle className="idle-dot-anim" cx="40" cy="39" r="3" fill="#00E5FF" filter="url(#idleGlow)" />
          </svg>
          <div className="idle-ring" />
        </div>
        <h2 className="idle-title">Smart Routing in Action</h2>
        <ul className="idle-steps">
          {[
            { icon: "01", text: "Enter a prompt on the left panel" },
            { icon: "02", text: "System analyzes and classifies intent" },
            { icon: "03", text: "Routes to the optimal LLM model" },
            { icon: "04", text: "Generates intelligent output" },
          ].map((s) => (
            <li key={s.icon} className="idle-step">
              <span className="idle-step-num">{s.icon}</span>
              <span>{s.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="idle-examples">
        <div className="ex-label">TRY AN EXAMPLE</div>
        <div className="ex-grid">
          {EXAMPLES.map((ex) => (
            <button key={ex.text} className="ex-card" style={{ "--ec": ex.color }} onClick={() => onExampleClick(ex.text)}>
              <span className="ex-text">{ex.text}</span>
              <span className="ex-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="op-error">
      <div className="err-icon">⚠</div>
      <h3>Routing Failed</h3>
      <p>Check the error details on the left and verify the backend is running on port 8000.</p>
    </div>
  );
}

function SuccessState({ result }) {
  const isMixed = result.type === "mixed";
  const story = typeof result.response === "string" ? result.response : "";
  return (
    <div className="op-success">
      <RoutingInfo result={result} />
      {isMixed && result.tasks?.length > 0 && <MixedDiagram tasks={result.tasks} />}
      <div className="op-response-wrap op-combined">
        <div className="op-response-header">
          <span className="op-response-label">Combined output</span>
          <CopyBtn text={story} />
        </div>
        <div className="op-response-box">
          {story.trim() ? (
            <pre className="op-response-text">{story}</pre>
          ) : (
            <p className="op-response-empty">
              No combined text was returned. Try running the route again or check the backend logs.
            </p>
          )}
        </div>
      </div>
      <SegmentExecution segments={result.segment_executions} />
      <CreditsRewards data={result.credits_rewards} />
      <div className="op-summary">
        <span className="op-summary-label">Summary</span>
        <span className="op-summary-text">{result.summary}</span>
      </div>
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}
