import "./Header.css";

export default function Header() {
  return (
    <header className="hdr">
      <div className="hdr-left">
        <div className="hdr-logo">
          <svg className="hdr-tri" viewBox="0 0 40 36" fill="none">
            <defs>
              <filter id="hdrGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <polygon points="20,2 38,34 2,34" stroke="#00E5FF" strokeWidth="1.5" fill="rgba(0,229,255,0.08)" filter="url(#hdrGlow)" />
            <polygon points="20,10 30,28 10,28" stroke="#7C3AED" strokeWidth="1" fill="rgba(124,58,237,0.06)" />
            <circle cx="20" cy="20" r="2.5" fill="#00E5FF" filter="url(#hdrGlow)" />
          </svg>
          <div className="hdr-brand">
            <span className="hdr-name">SmartRouter<span className="hdr-ai">AI</span></span>
            <span className="hdr-tag">v1.0 · Groq + Llama3</span>
          </div>
        </div>
      </div>

      <div className="hdr-center">
        <div className="hdr-status">
          <span className="status-dot" />
          <span>System Online</span>
        </div>
      </div>

    </header>
  );
}