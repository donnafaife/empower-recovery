// Client-side aggregation over a real, already-fetched page of rows. Used
// where the backend has no dedicated GROUP BY endpoint (e.g. devices/
// browsers/countries breakdowns) but the raw field IS present on rows we
// already have from a real endpoint - this is honest aggregation of real
// data, not fabricated data, and is always labeled with its sample size in
// the UI so it's clear it reflects "the most recent N visitors," not the
// full dataset.
export function countBy<T>(rows: T[], key: (row: T) => string | null | undefined, topN = 6) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = key(row) || 'Unknown'
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, topN)
  const rest = sorted.slice(topN).reduce((sum, [, count]) => sum + count, 0)
  if (rest > 0) top.push(['Other', rest])

  return top.map(([name, value]) => ({ name, value }))
}

export const CHART_COLORS = ['#0b6b63', '#b87333', '#2b5a86', '#d99150', '#8a97a3', '#556170']
