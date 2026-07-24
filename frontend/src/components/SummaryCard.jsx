const SummaryCard = ({ label, amount, icon: Icon, tone, trend }) => {
  return (
    <div className="summary-card">
      <div className="summary-card-top">
        <div className={`summary-icon ${tone}`}>
          <Icon />
        </div>
        {trend != null && (
          <span className={`summary-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <div>
        <div className="summary-label">{label}</div>
        <div className="summary-amount mono">{amount}</div>
      </div>
    </div>
  );
};

export default SummaryCard;
