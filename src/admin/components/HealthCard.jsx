const STATUS_LABELS = {
  healthy: 'Healthy',
  warning: 'Warning',
  error: 'Error',
}

function HealthCard({ label, status, message }) {
  return (
    <div className="admin-health-card">
      <div className="admin-health-heading">
        <span className={`admin-health-dot admin-health-dot-${status}`} aria-hidden="true" />
        <span className="admin-health-label">{label}</span>
        <span className={`admin-health-badge admin-health-badge-${status}`}>{STATUS_LABELS[status] ?? status}</span>
      </div>
      {message && <p className="admin-health-message">{message}</p>}
    </div>
  )
}

export default HealthCard
