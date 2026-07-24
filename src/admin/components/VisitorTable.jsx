import { Link } from 'react-router-dom'
import DeviceBadge from './DeviceBadge'
import LocationBadge from './LocationBadge'

function formatDate(value) {
  return new Date(value).toLocaleDateString()
}

function shortId(id) {
  return `${id.slice(0, 8)}…`
}

function VisitorTable({ visitors, loading }) {
  if (loading) {
    return <p className="admin-status-message">Loading…</p>
  }

  if (visitors.length === 0) {
    return <p className="admin-table-empty">No visitors match the current filters.</p>
  }

  return (
    <div className="admin-table-scroll">
      <table className="admin-table admin-visitor-table">
        <thead>
          <tr>
            <th>Visitor</th>
            <th>First Visit</th>
            <th>Last Visit</th>
            <th>Sessions</th>
            <th>Page Views</th>
            <th>Events</th>
            <th>Location</th>
            <th>Device</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor) => (
            <tr key={visitor.id}>
              <td>
                <Link className="admin-lead-link" to={`/admin/analytics/visitors/${visitor.id}`}>
                  {shortId(visitor.id)}
                </Link>
              </td>
              <td>{formatDate(visitor.firstVisit)}</td>
              <td>{visitor.lastVisit ? formatDate(visitor.lastVisit) : '—'}</td>
              <td>{visitor.sessionCount}</td>
              <td>{visitor.pageViewCount}</td>
              <td>{visitor.eventCount}</td>
              <td>
                <LocationBadge city={visitor.city} region={visitor.region} country={visitor.country} />
              </td>
              <td>
                <DeviceBadge browser={visitor.browser} device={visitor.device} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VisitorTable
