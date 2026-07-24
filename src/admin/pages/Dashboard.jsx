import { useEffect, useState } from 'react'
import { useAuth } from '../useAuth'
import { getDashboardStats, getDashboardHealth, getDashboardRecentActivity } from '../services/adminApi'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import HealthCard from '../components/HealthCard'
import ActivityTable from '../components/ActivityTable'

const STATS_CONFIG = [
  { key: 'visitorsToday', label: 'Visitors Today' },
  { key: 'visitorsThisWeek', label: 'Visitors This Week' },
  { key: 'returningVisitors', label: 'Returning Visitors' },
  { key: 'activeSessions', label: 'Active Sessions' },
  { key: 'totalPageViews', label: 'Total Page Views' },
  { key: 'totalEvents', label: 'Total Events' },
  { key: 'totalLeads', label: 'Total Leads' },
  { key: 'newLeads', label: 'New Leads' },
]

const HEALTH_CONFIG = [
  { key: 'backendApi', label: 'Backend API' },
  { key: 'database', label: 'Database (Supabase)' },
  { key: 'telemetry', label: 'Telemetry Service' },
  { key: 'geoDatabase', label: 'GeoLite Database' },
]

function formatDateTime(value) {
  return new Date(value).toLocaleString()
}

function shortId(id) {
  return id ? `${id.slice(0, 8)}…` : '—'
}

const VISITOR_COLUMNS = [
  { key: 'browser', label: 'Browser' },
  { key: 'device', label: 'Device' },
  {
    key: 'location',
    label: 'Location',
    render: (row) => [row.city, row.country].filter(Boolean).join(', ') || 'Unknown',
  },
  { key: 'referrer', label: 'Referrer', render: (row) => row.referrer || '—' },
  { key: 'createdAt', label: 'First Seen', render: (row) => formatDateTime(row.createdAt) },
]

const PAGE_VIEW_COLUMNS = [
  { key: 'page', label: 'Page' },
  { key: 'visitorId', label: 'Visitor', render: (row) => shortId(row.visitorId) },
  { key: 'createdAt', label: 'Viewed At', render: (row) => formatDateTime(row.createdAt) },
]

const EVENT_COLUMNS = [
  { key: 'eventName', label: 'Event' },
  { key: 'metadata', label: 'Details', render: (row) => (row.metadata ? JSON.stringify(row.metadata) : '—') },
  { key: 'visitorId', label: 'Visitor', render: (row) => shortId(row.visitorId) },
  { key: 'createdAt', label: 'Recorded At', render: (row) => formatDateTime(row.createdAt) },
]

const LEAD_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Submitted At', render: (row) => formatDateTime(row.createdAt) },
]

function Dashboard() {
  const { token } = useAuth()

  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState('')

  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState('')

  const [recentActivity, setRecentActivity] = useState(null)
  const [recentActivityError, setRecentActivityError] = useState('')

  useEffect(() => {
    let cancelled = false
    getDashboardStats(token)
      .then((result) => {
        if (!cancelled) setStats(result.data)
      })
      .catch((err) => {
        if (!cancelled) setStatsError(err.message || 'Unable to load stats.')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    let cancelled = false
    getDashboardHealth(token)
      .then((result) => {
        if (!cancelled) setHealth(result.data)
      })
      .catch((err) => {
        if (!cancelled) setHealthError(err.message || 'Unable to load system health.')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    let cancelled = false
    getDashboardRecentActivity(token)
      .then((result) => {
        if (!cancelled) setRecentActivity(result.data)
      })
      .catch((err) => {
        if (!cancelled) setRecentActivityError(err.message || 'Unable to load recent activity.')
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

          <section className="admin-section">
            <h2 className="admin-section-title">Overview</h2>
            {statsError && (
              <p className="admin-error" role="alert">
                {statsError}
              </p>
            )}
            {!statsError && !stats && <p className="admin-status-message">Loading…</p>}
            {stats && (
              <div className="admin-stat-grid">
                {STATS_CONFIG.map((item) => (
                  <StatCard key={item.key} label={item.label} value={stats[item.key]} />
                ))}
              </div>
            )}
          </section>

          <section className="admin-section">
            <h2 className="admin-section-title">System Health</h2>
            {healthError && (
              <p className="admin-error" role="alert">
                {healthError}
              </p>
            )}
            {!healthError && !health && <p className="admin-status-message">Loading…</p>}
            {health && (
              <div className="admin-health-grid">
                {HEALTH_CONFIG.map((item) => (
                  <HealthCard
                    key={item.key}
                    label={item.label}
                    status={health[item.key]?.status}
                    message={health[item.key]?.message}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="admin-section">
            <h2 className="admin-section-title">Recent Activity</h2>
            {recentActivityError && (
              <p className="admin-error" role="alert">
                {recentActivityError}
              </p>
            )}
            {!recentActivityError && !recentActivity && <p className="admin-status-message">Loading…</p>}
            {recentActivity && (
              <>
                <ActivityTable
                  title="Visitors"
                  columns={VISITOR_COLUMNS}
                  rows={recentActivity.visitors}
                  emptyMessage="No visitors recorded yet."
                />
                <ActivityTable
                  title="Page Views"
                  columns={PAGE_VIEW_COLUMNS}
                  rows={recentActivity.pageViews}
                  emptyMessage="No page views recorded yet."
                />
                <ActivityTable
                  title="Events"
                  columns={EVENT_COLUMNS}
                  rows={recentActivity.events}
                  emptyMessage="No events recorded yet."
                />
                <ActivityTable
                  title="Leads"
                  columns={LEAD_COLUMNS}
                  rows={recentActivity.leads}
                  emptyMessage="No leads submitted yet."
                />
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
