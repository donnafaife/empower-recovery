export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return '—'
  const diffMs = Date.now() - new Date(value).getTime()
  const diffSeconds = Math.round(diffMs / 1000)

  if (diffSeconds < 60) return 'just now'
  const diffMinutes = Math.round(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(value)
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '—'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export function formatLocation(city?: string | null, region?: string | null, country?: string | null): string {
  return [city, region, country].filter(Boolean).join(', ') || '—'
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat().format(value)
}

export interface Delta {
  value: string
  positive: boolean
}

// "vs prior period" comparison shown on Insights KPI cards - a flat 0%
// when there's no prior-period data to compare against (not a real change).
export function computeDelta(current: number, previous: number): Delta {
  if (!previous) return { value: '0%', positive: true }
  const pct = ((current - previous) / previous) * 100
  return { value: `${Math.abs(pct).toFixed(1)}%`, positive: pct >= 0 }
}

// The public site is a single page with anchor-linked sections rather than
// separate URLs, so raw tracked paths like "/" or "/#services" aren't
// self-explanatory to a non-technical reader - map them to plain labels.
const PAGE_LABELS: Record<string, string> = {
  '/': 'Homepage',
  '/#about': 'About',
  '/#services': 'Services',
  '/#team': 'Team',
  '/#booking': 'Booking',
}

export function labelForPage(page: string): string {
  return PAGE_LABELS[page] ?? page
}

export function initialsFrom(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
