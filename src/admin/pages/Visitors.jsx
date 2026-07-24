import { useEffect, useState } from 'react'
import { useAuth } from '../useAuth'
import { getVisitors } from '../services/adminApi'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import VisitorFilters from '../components/VisitorFilters'
import VisitorTable from '../components/VisitorTable'

const DEFAULT_FILTERS = {
  search: '',
  country: '',
  region: '',
  city: '',
  browser: '',
  device: '',
  visitorType: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'firstSeen',
}
const PAGE_SIZE = 25

function Visitors() {
  const { token } = useAuth()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [visitors, setVisitors] = useState([])
  const [pagination, setPagination] = useState(null)
  const [error, setError] = useState('')

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(filters.search), 300)
    return () => clearTimeout(timeout)
  }, [filters.search])

  // A changed filter should always jump back to page 1. Adjusted during
  // render (same technique as Leads.jsx) rather than in an effect, avoiding
  // an extra render pass and an extra network request.
  const filterKey = [
    debouncedSearch,
    filters.country,
    filters.region,
    filters.city,
    filters.browser,
    filters.device,
    filters.visitorType,
    filters.dateFrom,
    filters.dateTo,
    filters.sortBy,
  ].join('|')
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey)
  if (filterKey !== appliedFilterKey) {
    setAppliedFilterKey(filterKey)
    if (page !== 1) setPage(1)
  }

  useEffect(() => {
    let cancelled = false

    getVisitors(token, {
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch,
      country: filters.country,
      region: filters.region,
      city: filters.city,
      browser: filters.browser,
      device: filters.device,
      visitorType: filters.visitorType,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sortBy: filters.sortBy,
    })
      .then((result) => {
        if (cancelled) return
        setVisitors(result.data.visitors)
        setPagination(result.data.pagination)
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load visitors.')
      })

    return () => {
      cancelled = true
    }
  }, [
    token,
    page,
    debouncedSearch,
    filters.country,
    filters.region,
    filters.city,
    filters.browser,
    filters.device,
    filters.visitorType,
    filters.dateFrom,
    filters.dateTo,
    filters.sortBy,
  ])

  return (
    <div className="admin-shell">
      <Header />
      <div className="admin-body">
        <Sidebar />
        <main className="admin-content">
          <h1 className="admin-content-title">Visitors</h1>

          <VisitorFilters filters={filters} onFiltersChange={setFilters} />

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          {!error && <VisitorTable visitors={visitors} loading={pagination === null} />}

          {pagination && pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-button admin-button-ghost"
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                className="admin-button admin-button-ghost"
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Visitors
