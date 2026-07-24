const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'CLOSED', label: 'Closed' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'updated', label: 'Recently Updated' },
]

function LeadFilters({ filters, onFiltersChange }) {
  function handleChange(key, value) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="admin-lead-filters">
      <input
        className="admin-input"
        type="search"
        placeholder="Search by name or email…"
        value={filters.search}
        onChange={(event) => handleChange('search', event.target.value)}
      />
      <select
        className="admin-input"
        value={filters.status}
        onChange={(event) => handleChange('status', event.target.value)}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        className="admin-input"
        value={filters.sortBy}
        onChange={(event) => handleChange('sortBy', event.target.value)}
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LeadFilters
