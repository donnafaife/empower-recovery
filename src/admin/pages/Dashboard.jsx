import { useEffect, useState } from 'react'
import { useAuth } from '../useAuth'
import { getAnalyticsSummary } from '../services/adminApi'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

function Dashboard() {
  const { token } = useAuth()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    getAnalyticsSummary(token)
      .then((result) => {
        if (!cancelled) setSummary(result.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load dashboard data.')
      })

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="admin-shell">
      <Header />
      <div className="admin-body">
        <Sidebar />
        <main className="admin-content">
          <h1 className="admin-content-title">Dashboard</h1>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          {!error && !summary && <p className="admin-status-message">Loading…</p>}

          {summary && (
            <div className="admin-stat-grid">
              <div className="admin-stat-card">
                <span className="admin-stat-value">{summary.users}</span>
                <span className="admin-stat-label">Total Users</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-value">{summary.leads}</span>
                <span className="admin-stat-label">Total Leads</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
