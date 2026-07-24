import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { getVisitorById, getVisitorSessions } from '../services/adminApi'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import SessionTable from '../components/SessionTable'

const SESSIONS_PAGE_SIZE = 25

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

function VisitorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [visitor, setVisitor] = useState(null)
  const [error, setError] = useState('')

  const [sessionsPage, setSessionsPage] = useState(1)
  const [sessions, setSessions] = useState([])
  const [sessionsPagination, setSessionsPagination] = useState(null)
  const [sessionsError, setSessionsError] = useState('')

  useEffect(() => {
    let cancelled = false
    getVisitorById(token, id)
      .then((result) => {
        if (cancelled) return
        setVisitor(result.data.visitor)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load this visitor.')
      })
    return () => {
      cancelled = true
    }
  }, [token, id])

  useEffect(() => {
    let cancelled = false
    getVisitorSessions(token, id, { page: sessionsPage, pageSize: SESSIONS_PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setSessions(result.data.sessions)
        setSessionsPagination(result.data.pagination)
        setSessionsError('')
      })
      .catch((err) => {
        if (!cancelled) setSessionsError(err.message || 'Unable to load sessions.')
      })
    return () => {
      cancelled = true
    }
  }, [token, id, sessionsPage])

  return (
    <div className="admin-shell">
      <Header />
      <div className="admin-body">
        <Sidebar />
        <main className="admin-content">
          <button className="admin-button admin-button-ghost" type="button" onClick={() => navigate('/admin/analytics')}>
            ← Back to Visitors
          </button>

          <h1 className="admin-content-title">Visitor Details</h1>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          {!error && !visitor && <p className="admin-status-message">Loading…</p>}

          {visitor && (
            <>
              <section className="admin-section">
                <h2 className="admin-section-title">Summary</h2>
                <div className="admin-lead-detail-grid">
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">First Visit</span>
                    <span className="admin-lead-field-value">{formatDateTime(visitor.firstVisit)}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Last Visit</span>
                    <span className="admin-lead-field-value">{formatDateTime(visitor.lastVisit)}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Returning Visitor</span>
                    <span className="admin-lead-field-value">{visitor.returningVisitor ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Session Count</span>
                    <span className="admin-lead-field-value">{visitor.sessionCount}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Total Page Views</span>
                    <span className="admin-lead-field-value">{visitor.pageViewCount}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Total Events</span>
                    <span className="admin-lead-field-value">{visitor.eventCount}</span>
                  </div>
                  <div className="admin-lead-field admin-lead-field-full">
                    <span className="admin-lead-field-label">Original Referrer</span>
                    <span className="admin-lead-field-value">{visitor.referrer || 'Direct'}</span>
                  </div>
                </div>
              </section>

              <section className="admin-section">
                <h2 className="admin-section-title">Device Information</h2>
                <div className="admin-lead-detail-grid">
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Browser</span>
                    <span className="admin-lead-field-value">{visitor.device.browser || 'Unknown'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Browser Version</span>
                    <span className="admin-lead-field-value">{visitor.device.browserVersion || 'Unknown'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Operating System</span>
                    <span className="admin-lead-field-value">{visitor.device.os || 'Unknown'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Device Type</span>
                    <span className="admin-lead-field-value">{visitor.device.deviceType || 'Unknown'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Screen Size</span>
                    <span className="admin-lead-field-value">Not collected</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Language</span>
                    <span className="admin-lead-field-value">Not collected</span>
                  </div>
                </div>
              </section>

              <section className="admin-section">
                <h2 className="admin-section-title">Location</h2>
                <div className="admin-lead-detail-grid">
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Country</span>
                    <span className="admin-lead-field-value">{visitor.location.country || 'Unknown'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Region</span>
                    <span className="admin-lead-field-value">{visitor.location.region || 'Unknown'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">City</span>
                    <span className="admin-lead-field-value">{visitor.location.city || 'Unknown'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Timezone</span>
                    <span className="admin-lead-field-value">{visitor.location.timezone || 'Unknown'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Latitude</span>
                    <span className="admin-lead-field-value">{visitor.location.latitude ?? 'Not available'}</span>
                  </div>
                  <div className="admin-lead-field">
                    <span className="admin-lead-field-label">Longitude</span>
                    <span className="admin-lead-field-value">{visitor.location.longitude ?? 'Not available'}</span>
                  </div>
                </div>
              </section>

              <section className="admin-section">
                <h2 className="admin-section-title">Sessions</h2>
                {sessionsError && (
                  <p className="admin-error" role="alert">
                    {sessionsError}
                  </p>
                )}
                {!sessionsError && <SessionTable sessions={sessions} loading={sessionsPagination === null} />}
                {sessionsPagination && sessionsPagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <button
                      className="admin-button admin-button-ghost"
                      type="button"
                      onClick={() => setSessionsPage((current) => current - 1)}
                      disabled={sessionsPage <= 1}
                    >
                      Previous
                    </button>
                    <span>
                      Page {sessionsPagination.page} of {sessionsPagination.totalPages} ({sessionsPagination.total} total)
                    </span>
                    <button
                      className="admin-button admin-button-ghost"
                      type="button"
                      onClick={() => setSessionsPage((current) => current + 1)}
                      disabled={sessionsPage >= sessionsPagination.totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default VisitorDetail
