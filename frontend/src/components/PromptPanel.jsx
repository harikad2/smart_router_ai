import "./PromptPanel.css";

export default function PromptPanel({
  prompt, setPrompt, onSubmit, onReset, status, error
}) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <aside className="prompt-panel">
      <div className="pp-header">
        <div className="pp-title-row">
          <span className="pp-icon">⟁</span>
          <h2 className="pp-title">Prompt Input</h2>
        </div>
        <span className="pp-hint">⌘↵ submit</span>
      </div>

      {/* Textarea */}
      <div className="pp-textarea-wrap">
        <textarea
          className="pp-textarea"
          rows={9}
          placeholder="Describe what you need — a question, a creative task, a complex analysis, or anything in between…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit();
          }}
          disabled={isLoading}
        />
        <div className="pp-textarea-glow" />
      </div>

      {/* Footer */}
      <div className="pp-footer">
        <span className="pp-char">{prompt.length} chars · ~{Math.ceil(prompt.split(/\s+/).filter(Boolean).length / 1)} words</span>

        <div className="pp-actions">
          {(isSuccess || error) && (
            <button className="pp-reset-btn" onClick={onReset}>
              ↺ Reset
            </button>
          )}
          <button
            className={`pp-submit-btn ${isLoading ? "loading" : ""}`}
            onClick={() => onSubmit()}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <span className="pp-spinner-wrap">
                <span className="pp-spinner" />
                <span>Routing…</span>
              </span>
            ) : (
              <>⟁ Route Prompt</>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="pp-error">
          <div className="pp-error-header">
            <span className="pp-error-icon">⚠</span>
            <strong>Connection Error</strong>
          </div>
          <p>{error}</p>
          <div className="pp-error-hint">
            <span className="hint-mono">Check:</span>
            <span>Backend running on port 8000?</span>
            <span>GROQ_API_KEY set in .env?</span>
          </div>
        </div>
      )}

      {/* Bottom info strip */}
      <div className="pp-strip">
        <div className="strip-item">
          <span className="strip-dot" style={{ background: "#00E5FF" }} />
          <span>simple → 8B model</span>
        </div>
        <div className="strip-item">
          <span className="strip-dot" style={{ background: "#F472B6" }} />
          <span>creative → 70B · temp 0.9</span>
        </div>
        <div className="strip-item">
          <span className="strip-dot" style={{ background: "#A78BFA" }} />
          <span>reasoning → 70B · temp 0.2</span>
        </div>
        <div className="strip-item">
          <span className="strip-dot" style={{ background: "#FB923C" }} />
          <span>mixed → multi-model</span>
        </div>
      </div>
    </aside>
  );
}