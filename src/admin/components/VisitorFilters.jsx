const BROWSER_OPTIONS = ['', 'Chrome', 'Firefox', 'Safari', 'Edge', 'Other', 'unknown']
const DEVICE_OPTIONS = ['', 'desktop', 'mobile', 'tablet', 'unknown']

const VISITOR_TYPE_OPTIONS = [
  { value: '', label: 'All visitors' },
  { value: 'new', label: 'New' },
  { value: 'returning', label: 'Returning' },
]

const SORT_OPTIONS = [
  { value: 'firstSeen', label: 'First Seen' },
  { value: 'sessionCount', label: 'Session Count' },
  { value: 'pageViewCount', label: 'Page View Count' },
  { value: 'eventCount', label: 'Event Count' },
]

function VisitorFilters({ filters, onFiltersChange }) {
  function handleChange(key, value) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="admin-visitor-filters">
      <input
        className="admin-input"
        type="search"
        placeholder="Search by visitor ID, city, country, or browser…"
        value={filters.search}
        onChange={(event) => handleChange('search', event.target.value)}
      />
      <input
        className="admin-input"
        type="text"
        placeholder="Country"
        value={filters.country}
        onChange={(event) => handleChange('country', event.target.value)}
      />
      <input
        className="admin-input"
        type="text"
        placeholder="Region"
        value={filters.region}
        onChange={(event) => handleChange('region', event.target.value)}
      />
      <input
        className="admin-input"
        type="text"
        placeholder="City"
        value={filters.city}
        onChange={(event) => handleChange('city', event.target.value)}
      />
      <select
        className="admin-input"
        value={filters.browser}
        onChange={(event) => handleChange('browser', event.target.value)}
        aria-label="Filter by browser"
      >
        {BROWSER_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option === '' ? 'All browsers' : option}
          </option>
        ))}
      </select>
      <select
        className="admin-input"
        value={filters.device}
        onChange={(event) => handleChange('device', event.target.value)}
        aria-label="Filter by device"
      >
        {DEVICE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option === '' ? 'All devices' : option}
          </option>
        ))}
      </select>
      <select
        className="admin-input"
        value={filters.visitorType}
        onChange={(event) => handleChange('visitorType', event.target.value)}
        aria-label="Filter by visitor type"
      >
        {VISITOR_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="admin-date-field">
        From
        <input
          className="admin-input"
          type="date"
          value={filters.dateFrom}
          onChange={(event) => handleChange('dateFrom', event.target.value)}
        />
      </label>
      <label className="admin-date-field">
        To
        <input
          className="admin-input"
          type="date"
          value={filters.dateTo}
          onChange={(event) => handleChange('dateTo', event.target.value)}
        />
      </label>
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

export default VisitorFilters
