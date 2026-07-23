import { useState } from "react";
import Header from "../components/Header";
import PromptPanel from "../components/PromptPanel";
import OutputPanel from "../components/OutputPanel";
import "./InputPage.css";

const API_URL = "http://localhost:8000";

export default function InputPage() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (text) => {
    const p = text || prompt;
    if (!p.trim()) return;

    setPrompt(p);
    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let detail = data.detail;
        if (Array.isArray(detail)) {
          detail = detail.map((e) => e.msg || JSON.stringify(e)).join("; ");
        }
        throw new Error(detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      const msg =
        err.message === "Failed to fetch"
          ? "Cannot reach the backend. Make sure the server is running on port 8000."
          : err.message;
      setError(msg);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setError("");
  };

  return (
    <div className="input-page">
      {/* Background effects */}
      <div className="page-grid" />
      <div className="page-orb page-orb-1" />
      <div className="page-orb page-orb-2" />

      <Header />

      <main className="page-main">
        <PromptPanel
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          onReset={handleReset}
          status={status}
          error={error}
        />
        <OutputPanel
          status={status}
          result={result}
          onExampleClick={handleSubmit}
        />
      </main>
    </div>
  );
}