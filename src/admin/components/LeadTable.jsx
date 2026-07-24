import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

function formatDate(value) {
  return new Date(value).toLocaleDateString()
}

function LeadTable({ leads, loading }) {
  if (loading) {
    return <p className="admin-status-message">Loading…</p>
  }

  if (leads.length === 0) {
    return <p className="admin-table-empty">No leads match the current filters.</p>
  }

  return (
    <div className="admin-table-scroll">
      <table className="admin-table admin-lead-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Date Received</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <Link className="admin-lead-link" to={`/admin/leads/${lead.id}`}>
                  {lead.name}
                </Link>
              </td>
              <td>{lead.email}</td>
              <td>{lead.phone || '—'}</td>
              <td>{formatDate(lead.createdAt)}</td>
              <td>
                <StatusBadge status={lead.status} />
              </td>
              <td>{formatDate(lead.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LeadTable
