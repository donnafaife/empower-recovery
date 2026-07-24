const STATUS_LABELS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  CONVERTED: 'Converted',
  CLOSED: 'Closed',
}

function StatusBadge({ status }) {
  return <span className={`admin-status-badge admin-status-badge-${status}`}>{STATUS_LABELS[status] ?? status}</span>
}

export default StatusBadge
