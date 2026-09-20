function StatCard({ title, value, type = "balance", icon = "📊", subtext }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className={`stat-value ${type === "income" ? "positive" : type === "expense" ? "negative" : ""}`}>
        {value}
      </div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
}

export default StatCard;
