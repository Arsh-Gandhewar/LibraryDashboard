export function Card({ children, className = '' }) {
  return (
    <div className={`glass-panel ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'var(--primary-color)' }) {
  return (
    <div className="glass-panel stat-card">
      <div className="flex justify-between items-center">
        <span className="stat-label">{label}</span>
        {Icon && <Icon size={32} color={color} />}
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
