import "./CreditsRewards.css";

export default function CreditsRewards({ data }) {
  if (!data) return null;

  const { credits_this_run, lifetime_credits, total_runs, badges } = data;

  return (
    <div className="cr-wrap">
      <h3 className="cr-title">Credits &amp; rewards</h3>
      <div className="cr-cards">
        <div className="cr-card">
          <div className="cr-card-h">This run</div>
          <div className="cr-card-val cr-val-green">+{credits_this_run}</div>
          <div className="cr-card-sub">credits earned</div>
        </div>
        <div className="cr-card">
          <div className="cr-card-h">Lifetime</div>
          <div className="cr-card-val">{lifetime_credits}</div>
          <div className="cr-card-sub">total credits · {total_runs} runs</div>
        </div>
      </div>
      {badges?.length > 0 && (
        <div className="cr-badges">
          {badges.map((b, i) => (
            <span key={i} className="cr-badge">
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
