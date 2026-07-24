import { Link } from 'react-router-dom'

function formatDateTime(value) {
  return new Date(value).toLocaleString()
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
}

function SessionTable({ sessions, loading }) {
  if (loading) {
    return <p className="admin-status-message">Loading…</p>
  }

  if (sessions.length === 0) {
    return <p className="admin-table-empty">No sessions found.</p>
  }

  return (
    <div className="admin-table-scroll">
      <table className="admin-table admin-session-table">
        <thead>
          <tr>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
            <th>Landing Page</th>
            <th>Exit Page</th>
            <th>Page Views</th>
            <th>Events</th>
            <th>Referrer</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>
                <Link className="admin-lead-link" to={`/admin/analytics/sessions/${session.id}`}>
                  {formatDateTime(session.startTime)}
                </Link>
              </td>
              <td>{session.endTime ? formatDateTime(session.endTime) : 'Ongoing'}</td>
              <td>{formatDuration(session.durationSeconds)}</td>
              <td>{session.landingPage || '—'}</td>
              <td>{session.exitPage || '—'}</td>
              <td>{session.pageViewCount}</td>
              <td>{session.eventCount}</td>
              <td>{session.referrer || 'Direct'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SessionTable
