import { useEffect, useState } from 'react'
import { useAuth } from '../useAuth'
import { getLeads, exportLeadsCsv } from '../services/adminApi'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import LeadFilters from '../components/LeadFilters'
import LeadTable from '../components/LeadTable'

const DEFAULT_FILTERS = { search: '', status: '', sortBy: 'newest' }
const PAGE_SIZE = 25

function Leads() {
  const { token } = useAuth()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [leads, setLeads] = useState([])
  const [pagination, setPagination] = useState(null)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(filters.search), 300)
    return () => clearTimeout(timeout)
  }, [filters.search])

  // A changed filter should always jump back to page 1. Adjusted during
  // render (React's documented pattern for this) rather than in an effect,
  // by comparing against the filter combination applied on the previous
  // render - avoids an extra render pass and an extra network request.
  const filterKey = `${debouncedSearch}|${filters.status}|${filters.sortBy}`
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey)
  if (filterKey !== appliedFilterKey) {
    setAppliedFilterKey(filterKey)
    if (page !== 1) setPage(1)
  }

  useEffect(() => {
    let cancelled = false

    getLeads(token, {
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch,
      status: filters.status,
      sortBy: filters.sortBy,
    })
      .then((result) => {
        if (cancelled) return
        setLeads(result.data.leads)
        setPagination(result.data.pagination)
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load leads.')
      })

    return () => {
      cancelled = true
    }
  }, [token, page, debouncedSearch, filters.status, filters.sortBy])

  async function handleExport() {
    setExporting(true)
    setExportError('')
    try {
      await exportLeadsCsv(token, { search: debouncedSearch, status: filters.status })
    } catch (err) {
      setExportError(err.message || 'Unable to export leads.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="admin-shell">
      <Header />
      <div className="admin-body">
        <Sidebar />
        <main className="admin-content">
          <div className="admin-lead-toolbar">
            <h1 className="admin-content-title">Leads</h1>
            <button className="admin-button admin-button-ghost" type="button" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>

          <LeadFilters filters={filters} onFiltersChange={setFilters} />

          {exportError && (
            <p className="admin-error" role="alert">
              {exportError}
            </p>
          )}

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          {!error && <LeadTable leads={leads} loading={pagination === null} />}

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

export default Leads
