import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { getSessionById } from '../services/adminApi'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ActivityTable from '../components/ActivityTable'
import LocationBadge from '../components/LocationBadge'
import DeviceBadge from '../components/DeviceBadge'

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
}

// Locally defined rather than shared with Dashboard.jsx's similarly-named
// configs - the field shapes differ (this endpoint returns `timestamp` plus
// `secondsSincePreviousPage`/`duration`, not `createdAt`) and duplicating two
// small arrays is simpler than touching an already-committed Phase 2 file.
const PAGE_VIEW_COLUMNS = [
  { key: 'page', label: 'Path' },
  { key: 'timestamp', label: 'Timestamp', render: (row) => formatDateTime(row.timestamp) },
  {
    key: 'secondsSincePreviousPage',
    label: 'Time Since Previous',
    render: (row) => (row.secondsSincePreviousPage === null ? '—' : formatDuration(row.secondsSincePreviousPage)),
  },
]

const EVENT_COLUMNS = [
  { key: 'eventName', label: 'Event' },
  { key: 'timestamp', label: 'Timestamp', render: (row) => formatDateTime(row.timestamp) },
  { key: 'metadata', label: 'Metadata', render: (row) => (row.metadata ? JSON.stringify(row.metadata) : '—') },
]

function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getSessionById(token, id)
      .then((result) => {
        if (cancelled) return
        setData(result.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load this session.')
      })
    return () => {
      cancelled = true
    }
  }, [token, id])

  return (
    <div className="admin-shell">
      <Header />
      <div className="admin-body">
        <Sidebar />
        <main className="admin-content">
          <button className="admin-button admin-button-ghost" type="button" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <h1 className="admin-content-title">Session Details</h1>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          {!error && !data && <p className="admin-status-message">Loading…</p>}

          {data && (
            <>
              <section className="admin-section">
                <h2 className="admin-section-title">Session Info</h2>
                <div className="admin-lead-detail-grid">
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Start Time</span>
                    <span className="admin-lead-field-value">{formatDateTime(data.session.startTime)}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">End Time</span>
                    <span className="admin-lead-field-value">
                      {data.session.endTime ? formatDateTime(data.session.endTime) : 'Ongoing'}
                    </span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Duration</span>
                    <span className="admin-lead-field-value">{formatDuration(data.session.durationSeconds)}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Referrer</span>
                    <span className="admin-lead-field-value">{data.session.referrer || 'Direct'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Visitor</span>
                    <span className="admin-lead-field-value">
                      <DeviceBadge browser={data.session.visitor.browser} device={data.session.visitor.device} />
                    </span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Location</span>
                    <span className="admin-lead-field-value">
                      <LocationBadge
                        city={data.session.visitor.city}
                        region={data.session.visitor.region}
                        country={data.session.visitor.country}
                      />
                    </span>
                  </div>
                </div>
              </section>

              <section className="admin-section">
                <h2 className="admin-section-title">Page Views</h2>
                <ActivityTable
                  title="Page Views"
                  columns={PAGE_VIEW_COLUMNS}
                  rows={data.pageViews}
                  emptyMessage="No page views recorded for this session."
                />
                {data.pageViewsTruncated && (
                  <p className="admin-status-message">
                    Showing the most recent {data.pageViews.length} of {data.session.pageViewCount} page views.
                  </p>
                )}
              </section>

              <section className="admin-section">
                <h2 className="admin-section-title">Events</h2>
                <ActivityTable
                  title="Events"
                  columns={EVENT_COLUMNS}
                  rows={data.events}
                  emptyMessage="No events recorded for this session."
                />
                {data.eventsTruncated && (
                  <p className="admin-status-message">
                    Showing the most recent {data.events.length} of {data.session.eventCount} events.
                  </p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default SessionDetail
