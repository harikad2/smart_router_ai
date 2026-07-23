import "./MixedDiagram.css";

const BRANCHES = [
  {
    key: "creative",
    filter: (t) => t.part?.includes("creative"),
    title: "Creative",
    sub: "70B · temp 0.9",
    nodeClass: "mxd-creative",
    lineClass: "branch-creative",
    pillClass: "creative",
    icon: "✦",
  },
  {
    key: "reasoning",
    filter: (t) => t.part?.includes("reasoning"),
    title: "Math / logic",
    sub: "OSS / 70B · temp 0.2",
    nodeClass: "mxd-reasoning",
    lineClass: "branch-reasoning",
    pillClass: "reasoning",
    icon: "⬡",
  },
  {
    key: "coding",
    filter: (t) => t.part?.includes("coding"),
    title: "Coding",
    sub: "Qwen 32B · tuned",
    nodeClass: "mxd-coding",
    lineClass: "branch-coding",
    pillClass: "coding",
    icon: "</>",
  },
];

export default function MixedDiagram({ tasks }) {
  const active = BRANCHES.map((b) => ({
    ...b,
    items: tasks.filter(b.filter),
  })).filter((b) => b.items.length > 0);

  if (active.length === 0) return null;

  const cols = active.length;

  return (
    <div className="mxd-wrap">
      <div className="mxd-header">
        <span className="mxd-label">MULTI-MODEL ROUTING</span>
        <span className="mxd-badge">Mixed pipeline</span>
      </div>

      <div className="mxd-flow">
        <div className="mxd-node mxd-prompt">
          <span className="mxd-node-icon">⟁</span>
          <div>
            <div className="mxd-node-title">Prompt</div>
            <div className="mxd-node-sub">Decomposed</div>
          </div>
        </div>

        <div className="mxd-arrow-down">↓</div>

        <div
          className="mxd-branches"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {active.map((b) => (
            <div key={b.key} className="mxd-branch">
              <div className={`mxd-branch-line ${b.lineClass}`} />
              <div className={`mxd-node ${b.nodeClass}`}>
                <span>{b.icon}</span>
                <div>
                  <div className="mxd-node-title">{b.title}</div>
                  <div className="mxd-node-sub">{b.sub}</div>
                </div>
              </div>
              {b.items.map((t) => (
                <div key={t.task_id} className={`mxd-task-pill ${b.pillClass}`}>
                  {t.task_id}: {t.description?.slice(0, 28) || t.subtask?.slice(0, 28)}…
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mxd-arrow-down">↓</div>

        <div className="mxd-node mxd-fusion">
          <span>⊕</span>
          <div>
            <div className="mxd-node-title">Fusion engine</div>
            <div className="mxd-node-sub">temp 0.4 · merged</div>
          </div>
          <span className="mxd-merged-tag">✓ Outputs merged successfully</span>
        </div>
      </div>
    </div>
  );
}
